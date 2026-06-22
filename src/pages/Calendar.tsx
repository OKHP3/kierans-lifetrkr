import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, genId } from '../context/AppContext'
import { getTodayISO, formatEventTime } from '../lib/date'
import { getMoonPhaseEmoji, getDailyCard, getDailyWisdom, getCosmicEventsForDateRange } from '../lib/cosmic'
import FilterBar from '../components/FilterBar'
import CategoryPicker from '../components/CategoryPicker'
import TagInput from '../components/TagInput'
import DescriptionField from '../components/DescriptionField'
import RecurrenceEditor from '../components/RecurrenceEditor'
import { makeDefaultRecurrence, DEFAULT_CATEGORIES } from '../constants'
import type { CalendarEvent, RecurrenceRule } from '../types'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['S','M','T','W','T','F','S']
const DOW_SHORT: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

function formatRecurrenceLabel(rec: RecurrenceRule | undefined): string {
  if (!rec || rec.frequency === 'none') return ''
  const n = rec.interval
  if (rec.frequency === 'daily')
    return n === 1 ? 'Daily' : `Every ${n} days`
  if (rec.frequency === 'weekly') {
    const base = n === 1 ? 'Weekly' : `Every ${n} weeks`
    if (rec.daysOfWeek && rec.daysOfWeek.length > 0)
      return `${base} · ${rec.daysOfWeek.map(d => DOW_SHORT[d] ?? d).join(', ')}`
    return base
  }
  if (rec.frequency === 'monthly')
    return n === 1 ? 'Monthly' : `Every ${n} months`
  if (rec.frequency === 'yearly')
    return n === 1 ? 'Yearly' : `Every ${n} years`
  return 'Custom'
}

type EventForm = {
  title: string
  allDay: boolean
  time: string
  endTime: string
  location: string
  desc: string
  categoryId?: string
  tags: string[]
  recurrence: RecurrenceRule
  showDetails: boolean
  showRecurrence: boolean
}

function freshForm(): EventForm {
  return {
    title: '', allDay: false, time: '', endTime: '', location: '',
    desc: '', categoryId: undefined, tags: [],
    recurrence: { ...makeDefaultRecurrence(), frequency: 'none' },
    showDetails: false, showRecurrence: false,
  }
}

export default function Calendar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [form, setForm] = useState<EventForm | null>(null)

  // Filter state
  const [sourceFilter, setSourceFilter] = useState('all')
  const [recurringFilter, setRecurringFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [showCosmic, setShowCosmic] = useState(true)

  const today = getTodayISO()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Cosmic events for the visible month
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
  const cosmicMonthEvents = useMemo(
    () => getCosmicEventsForDateRange(monthStart, monthEnd),
    [monthStart, monthEnd]
  )
  const cosmicByDate = useMemo(() => {
    const m: Record<string, typeof cosmicMonthEvents> = {}
    for (const ev of cosmicMonthEvents) {
      if (!m[ev.date]) m[ev.date] = []
      m[ev.date].push(ev)
    }
    return m
  }, [cosmicMonthEvents])

  // Derive filter options from stored user events
  const userEvents = state.calendarEvents.filter(e => e.source === 'manual')
  const usedCategoryIds = [...new Set(userEvents.filter(e => e.categoryId).map(e => e.categoryId!))]
  const allEventTags = [...new Set(userEvents.flatMap(e => e.tags ?? []))]
  const googleEvents = state.calendarEvents.filter(e => e.source === 'google')

  // Build event list for selected day (with filters applied)
  function getEventsForDay(day: number): (CalendarEvent & { _cosmic?: boolean })[] {
    const ds = dateStr(day)
    const stored = state.calendarEvents.filter(e => e.start.startsWith(ds))
    const cosmic = showCosmic
      ? (cosmicByDate[ds] ?? []).map(ce => ({
          id: ce.id, title: ce.title, start: ds, allDay: true,
          location: null, description: ce.description ?? null, colorId: null,
          source: 'cosmic' as const, emoji: ce.emoji, _cosmic: true,
        }))
      : []
    const all = [...stored, ...cosmic]
    return all.filter(e => {
      if (sourceFilter === 'user' && e.source !== 'manual') return false
      if (sourceFilter === 'google' && e.source !== 'google') return false
      if (sourceFilter === 'cosmic' && e.source !== 'cosmic') return false
      if (categoryFilter && (e as CalendarEvent).categoryId !== categoryFilter) return false
      if (tagFilter && !((e as CalendarEvent).tags ?? []).includes(tagFilter)) return false
      if (recurringFilter === 'recurring' && !(e as CalendarEvent).recurrence?.frequency || (e as CalendarEvent).recurrence?.frequency === 'none') {
        if (!(e as CalendarEvent).recurrence || (e as CalendarEvent).recurrence?.frequency === 'none') return false
      }
      if (recurringFilter === 'one-time') {
        const rec = (e as CalendarEvent).recurrence
        if (rec && rec.frequency !== 'none') return false
      }
      return true
    })
  }

  function hasDayEvents(day: number): boolean {
    const ds = dateStr(day)
    return state.calendarEvents.some(e => e.start.startsWith(ds))
  }

  function patchForm(patch: Partial<EventForm>) {
    setForm(f => f ? { ...f, ...patch } : null)
  }

  function saveEvent() {
    if (!form || !form.title.trim() || !selectedDay) return
    const ds = dateStr(selectedDay)
    const start = form.allDay ? ds : `${ds}T${form.time || '00:00'}:00`
    const end = form.allDay ? undefined : form.endTime ? `${ds}T${form.endTime}:00` : undefined
    dispatch({
      type: 'ADD_CALENDAR_EVENT',
      payload: {
        id: genId(),
        title: form.title.trim(),
        start,
        end,
        allDay: form.allDay,
        location: form.location.trim() || null,
        description: form.desc.trim() || null,
        colorId: null,
        source: 'manual' as const,
        categoryId: form.categoryId,
        tags: form.tags,
        recurrence: form.recurrence.frequency !== 'none' ? form.recurrence : undefined,
        createdAt: today,
        updatedAt: today,
      },
    })
    setForm(null)
  }

  function deleteEvent(id: string) {
    dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: id })
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []
  const selectedDateStr = selectedDay ? dateStr(selectedDay) : null
  const dailyCard = selectedDateStr ? getDailyCard(selectedDateStr) : null
  const dailyWisdom = selectedDateStr ? getDailyWisdom(selectedDateStr) : null

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 className="page-title">Calendar</h1>
        {!state.isGoogleConnected ? (
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/settings')}>
            Connect Google →
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>
            {googleEvents.length} synced
          </span>
        )}
      </div>

      {/* Source filter */}
      <FilterBar
        chips={[
          { label: 'All', value: 'all', active: sourceFilter === 'all' },
          { label: 'My events', value: 'user', active: sourceFilter === 'user' },
          { label: 'Google', value: 'google', active: sourceFilter === 'google' },
          { label: 'Cosmic', value: 'cosmic', active: sourceFilter === 'cosmic' },
        ]}
        onChange={(val) => setSourceFilter(val)}
        className="mb-2"
      />

      {/* Category filter */}
      {usedCategoryIds.length > 0 && (
        <FilterBar
          chips={usedCategoryIds.map(id => {
            const cat = DEFAULT_CATEGORIES.find(c => c.id === id)
            return { label: `${cat?.emoji ?? ''} ${cat?.label ?? id}`, value: id, active: categoryFilter === id }
          })}
          onChange={(val, wantsActive) => setCategoryFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Tag filter */}
      {allEventTags.length > 0 && (
        <FilterBar
          chips={allEventTags.map(tag => ({ label: tag, value: tag, active: tagFilter === tag }))}
          onChange={(val, wantsActive) => setTagFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Recurring + cosmic toggles */}
      <FilterBar
        chips={[
          { label: 'All', value: 'all', active: recurringFilter === 'all' },
          { label: 'Recurring', value: 'recurring', active: recurringFilter === 'recurring' },
          { label: 'One-time', value: 'one-time', active: recurringFilter === 'one-time' },
          { label: showCosmic ? 'Cosmic ✦' : 'Cosmic', value: 'cosmic-toggle', active: showCosmic },
        ]}
        onChange={(val, wantsActive) => {
          if (val === 'cosmic-toggle') { setShowCosmic(wantsActive); return }
          setRecurringFilter(val)
        }}
        className="mb-4"
      />

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
          setSelectedDay(null)
        }}>‹</button>
        <span style={{ fontSize: 18, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
          setSelectedDay(null)
        }}>›</button>
      </div>

      {/* Grid header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="card" style={{ padding: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const ds = dateStr(day)
            const isSelected = selectedDay === day
            const isCurrent = ds === today
            const hasUserEvents = hasDayEvents(day)
            const moonEmoji = getMoonPhaseEmoji(ds)
            const hasNotable = !!cosmicByDate[ds]?.length
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                style={{
                  aspectRatio: '1', borderRadius: 8, border: 'none', cursor: 'pointer',
                  position: 'relative',
                  background: isSelected ? 'var(--accent-amethyst)' : isCurrent ? 'var(--surface-raised)' : 'transparent',
                  color: isSelected ? 'var(--bg)' : isCurrent ? 'var(--accent-amethyst)' : 'var(--text-primary)',
                  fontSize: 12, fontWeight: isCurrent ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 1, paddingBottom: 2,
                }}
              >
                <span>{day}</span>
                <span style={{ fontSize: 8, lineHeight: 1, opacity: hasNotable ? 1 : 0.35 }}>{moonEmoji}</span>
                {hasUserEvents && (
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--accent-amethyst)', position: 'absolute', bottom: 2, right: 4 }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && selectedDateStr && (
        <div style={{ marginTop: 16 }}>
          <p className="section-label">
            {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Cosmic section */}
          {showCosmic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {dailyCard && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(196,160,232,0.07)', border: '0.5px solid rgba(196,160,232,0.2)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>🃏</span>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-ghost)', margin: '0 0 2px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.05em' }}>TODAY'S CARD</p>
                    <p style={{ fontSize: 15, color: 'var(--accent-amethyst)', margin: 0, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{dailyCard.title}</p>
                  </div>
                </div>
              )}
              {dailyWisdom && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(196,160,232,0.05)', border: '0.5px solid rgba(196,160,232,0.15)' }}>
                  <span style={{ fontSize: 14, flexShrink: 0, color: 'var(--accent-amethyst)' }}>✦</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{dailyWisdom.title}</p>
                </div>
              )}
            </div>
          )}

          {/* Events list */}
          {selectedEvents.length === 0 ? (
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>No events.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map(event => {
                const isCosmic = event.source === 'cosmic'
                const isGoogle = event.source === 'google'
                const isManual = event.source === 'manual'
                const cat = (event as CalendarEvent).categoryId
                  ? DEFAULT_CATEGORIES.find(c => c.id === (event as CalendarEvent).categoryId)
                  : undefined
                const recLabel = formatRecurrenceLabel((event as CalendarEvent).recurrence)
                const eventTags = (event as CalendarEvent).tags ?? []
                const barColor = isCosmic ? 'var(--accent-amethyst)' : isGoogle ? '#4285F4' : 'var(--accent-amethyst)'

                return (
                  <div
                    key={event.id}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      opacity: isCosmic ? 0.9 : 1,
                      background: isCosmic ? 'rgba(196,160,232,0.06)' : undefined,
                    }}
                  >
                    <div style={{ width: 3, borderRadius: 2, background: barColor, alignSelf: 'stretch', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          {cat && <span style={{ fontSize: 15, flexShrink: 0 }}>{cat.emoji}</span>}
                          {isCosmic && (event as any).emoji && !cat && (
                            <span style={{ fontSize: 15, flexShrink: 0 }}>{(event as any).emoji}</span>
                          )}
                          <p style={{
                            fontSize: 14, margin: 0,
                            color: isCosmic ? 'var(--accent-amethyst)' : 'var(--text-primary)',
                            fontStyle: isCosmic ? 'italic' : 'normal',
                          }}>
                            {event.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {isGoogle && (
                            <span style={{ fontSize: 9, color: '#4285F4', border: '0.5px solid #4285F4', borderRadius: 4, padding: '1px 5px', fontFamily: 'Space Mono, monospace' }}>G</span>
                          )}
                          {isCosmic && (
                            <span style={{ fontSize: 10, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace' }}>✦</span>
                          )}
                          {isManual && (
                            <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                          )}
                        </div>
                      </div>

                      {event.description && (
                        <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0', lineHeight: 1.4 }}>{event.description}</p>
                      )}
                      {!event.allDay && (
                        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0', fontFamily: 'Space Mono, monospace' }}>
                          {formatEventTime(event.start, false)}{event.end ? ` – ${formatEventTime(event.end, false)}` : ''}
                        </p>
                      )}
                      {event.allDay && !isCosmic && <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0' }}>All day</p>}
                      {event.location && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>📍 {event.location}</p>}
                      {recLabel && (
                        <p style={{ fontSize: 11, color: 'var(--accent-amethyst)', margin: '3px 0 0', fontFamily: 'Space Mono, monospace' }}>↻ {recLabel}</p>
                      )}
                      {eventTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                          {eventTags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 12, background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add event form */}
          {form ? (
            <div className="card" style={{ marginTop: 12 }}>
              <input
                className="input-field"
                placeholder="Event title"
                value={form.title}
                onChange={e => patchForm({ title: e.target.value })}
                autoFocus
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <input type="checkbox" id="allday" checked={form.allDay} onChange={e => patchForm({ allDay: e.target.checked })} />
                <label htmlFor="allday" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>All day</label>
              </div>
              {!form.allDay && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="input-field" style={{ flex: 1 }} placeholder="Start (14:00)" value={form.time} onChange={e => patchForm({ time: e.target.value })} />
                  <input className="input-field" style={{ flex: 1 }} placeholder="End (optional)" value={form.endTime} onChange={e => patchForm({ endTime: e.target.value })} />
                </div>
              )}
              <input className="input-field" style={{ marginTop: 8 }} placeholder="Location (optional)" value={form.location} onChange={e => patchForm({ location: e.target.value })} />

              {/* Details expander */}
              <button
                type="button"
                onClick={() => patchForm({ showDetails: !form.showDetails })}
                style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: 10 }}>{form.showDetails ? '▾' : '▸'}</span> Description, category &amp; tags
              </button>
              {form.showDetails && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                  <DescriptionField value={form.desc} onChange={desc => patchForm({ desc })} rows={2} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '12px 0 6px' }}>Category</p>
                  <CategoryPicker categoryId={form.categoryId} onChange={categoryId => patchForm({ categoryId })} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '14px 0 6px' }}>Tags</p>
                  <TagInput tags={form.tags} onChange={tags => patchForm({ tags })} suggestions={allEventTags} />
                </div>
              )}

              {/* Recurrence expander */}
              <button
                type="button"
                onClick={() => patchForm({ showRecurrence: !form.showRecurrence })}
                style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: 10 }}>{form.showRecurrence ? '▾' : '▸'}</span> Recurrence
                {!form.showRecurrence && form.recurrence.frequency !== 'none' && (
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>({formatRecurrenceLabel(form.recurrence)})</span>
                )}
              </button>
              {form.showRecurrence && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                  <RecurrenceEditor value={form.recurrence} onChange={recurrence => patchForm({ recurrence })} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={saveEvent}>Add event</button>
                <button className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={() => setForm(freshForm())}>
              + Add event
            </button>
          )}
        </div>
      )}
    </div>
  )
}
