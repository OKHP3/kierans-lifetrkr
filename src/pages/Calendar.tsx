import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, genId } from '../context/AppContext'
import {
  addCalendarDays,
  formatDateLabel,
  formatEventTime,
  getCalendarDate,
  getCalendarDateParts,
  getDayOfWeekForDate,
  getDaysInMonth,
  getTodayISO,
  recurrenceOccursOnDate,
} from '../lib/date'
import { getMoonPhaseEmoji, getDailyCard, getDailyWisdom, getCosmicEventsForDateRange } from '../lib/cosmic'
import { getMercuryStatus, shouldShowMercuryBanner } from '../lib/celestial'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { fetchCalendarEvents } from '../lib/googleCalendar'
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

// ─── Recurrence Expansion ────────────────────────────────────────────────────

function eventOccursOnDate(event: CalendarEvent, ds: string, timezone: string): boolean {
  const startDate = getCalendarDate(event.start, timezone)
  if (!event.recurrence || event.recurrence.frequency === 'none') return startDate === ds
  return recurrenceOccursOnDate(
    event.recurrence ? { ...event.recurrence, startDate } : undefined,
    ds,
  )

}

// ─── Recurrence Label ─────────────────────────────────────────────────────────

function formatRecurrenceLabel(rec: RecurrenceRule | undefined): string {
  if (!rec || rec.frequency === 'none') return ''
  const n = rec.interval
  if (rec.frequency === 'daily')
    return n === 1 ? 'Daily' : `Every ${n} days`
  if (rec.frequency === 'weekly') {
    const base = n === 1 ? 'Weekly' : `Every ${n} weeks`
    return rec.daysOfWeek?.length
      ? `${base} · ${rec.daysOfWeek.map(d => DOW_SHORT[d] ?? d).join(', ')}`
      : base
  }
  if (rec.frequency === 'monthly') return n === 1 ? 'Monthly' : `Every ${n} months`
  if (rec.frequency === 'yearly') return n === 1 ? 'Yearly' : `Every ${n} years`
  return 'Custom'
}

// ─── Date-range helpers ───────────────────────────────────────────────────────

function getWeekRange(today: string): { start: string; end: string } {
  const dayNumber = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .indexOf(getDayOfWeekForDate(today))
  const start = addCalendarDays(today, -((dayNumber + 6) % 7))
  return { start, end: addCalendarDays(start, 6) }
}

function dateInRange(dateStr: string, range: 'all' | 'today' | 'this-week' | 'upcoming' | 'past', today: string): boolean {
  if (range === 'all') return true
  if (range === 'today') return dateStr === today
  if (range === 'upcoming') return dateStr >= today
  if (range === 'past') return dateStr < today
  if (range === 'this-week') {
    const { start, end } = getWeekRange(today)
    return dateStr >= start && dateStr <= end
  }
  return true
}

// ─── Form type ────────────────────────────────────────────────────────────────

type EventForm = {
  title: string; allDay: boolean; time: string; endTime: string
  location: string; desc: string; categoryId?: string; tags: string[]
  recurrence: RecurrenceRule; showDetails: boolean; showRecurrence: boolean
}

function freshForm(today: string): EventForm {
  return {
    title: '', allDay: false, time: '', endTime: '', location: '',
    desc: '', categoryId: undefined, tags: [],
    recurrence: { ...makeDefaultRecurrence(today), frequency: 'none' },
    showDetails: false, showRecurrence: false,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Calendar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const today = getTodayISO(state.settings.timezone)
  const todayParts = getCalendarDateParts(today)
  const [year, setYear] = useState(todayParts.year)
  const [month, setMonth] = useState(todayParts.month - 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(todayParts.day)
  const [form, setForm] = useState<EventForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [cardExpanded, setCardExpanded] = useState(false)
  useEffect(() => {
    setYear(todayParts.year)
    setMonth(todayParts.month - 1)
    setSelectedDay(todayParts.day)
  }, [state.settings.timezone])

  // Filter state
  const [sourceFilter, setSourceFilter] = useState('all')
  const [recurringFilter, setRecurringFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'this-week' | 'upcoming' | 'past'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [showCosmic, setShowCosmic] = useState(true)

  const mercury = useMemo(() => getMercuryStatus(new Date(), state.settings.timezone), [today, state.settings.timezone])
  const daysInMonth = getDaysInMonth(year, month + 1)
  const firstDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .indexOf(getDayOfWeekForDate(`${year}-${String(month + 1).padStart(2, '0')}-01`))
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
    const map: Record<string, typeof cosmicMonthEvents> = {}
    for (const ev of cosmicMonthEvents) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [cosmicMonthEvents])
  const moonByDate = useMemo(() => {
    const result: Record<string, string> = {}
    for (let day = 1; day <= daysInMonth; day += 1) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      result[ds] = getMoonPhaseEmoji(ds)
    }
    return result
  }, [daysInMonth, month, year])

  // Derived filter options from stored user events
  const userEvents = state.calendarEvents.filter(e => e.source === 'manual')
  const usedCategoryIds = [...new Set(userEvents.filter(e => e.categoryId).map(e => e.categoryId!))]
  const allEventTags = [...new Set(userEvents.flatMap(e => e.tags ?? []))]
  const googleEventsCount = state.settings.showGoogleCalendar
    ? state.calendarEvents.filter(e => e.source === 'google').length
    : 0
  const { isConnected, getToken } = useGoogleAuth()
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const handleSync = useCallback(async () => {
    if (!isConnected || !state.settings.showGoogleCalendar || syncing) return
    setSyncing(true)
    setSyncError(null)
    try {
      const token = await getToken()
      const events = await fetchCalendarEvents(token, state.settings.calendarDaysAhead ?? 14, state.settings.timezone)
      dispatch({ type: 'SET_CALENDAR_EVENTS', payload: events })
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date().toISOString() })
    } catch {
      setSyncError('Sync failed — tap to retry')
    } finally {
      setSyncing(false)
    }
  }, [isConnected, syncing, getToken, state.settings.calendarDaysAhead, state.settings.showGoogleCalendar, state.settings.timezone, dispatch])

  // Auto-sync when Google connects
  const prevConnected = useRef(false)
  useEffect(() => {
    if (isConnected && !prevConnected.current) {
      handleSync()
    }
    prevConnected.current = isConnected
  }, [isConnected, handleSync])

  // ─── Filter predicate ────────────────────────────────────────────────────────
  function passesFilters(event: CalendarEvent, dayDateStr: string): boolean {
    if (sourceFilter === 'user' && event.source !== 'manual') return false
    if (sourceFilter === 'google' && event.source !== 'google') return false
    if (sourceFilter === 'mock' && event.source !== 'mock') return false
    if (sourceFilter === 'cosmic' && event.source !== 'cosmic') return false
    if (!dateInRange(dayDateStr, dateRangeFilter, today)) return false
    if (categoryFilter && event.categoryId !== categoryFilter) return false
    if (tagFilter && !(event.tags ?? []).includes(tagFilter)) return false
    if (recurringFilter === 'recurring') {
      if (!event.recurrence || event.recurrence.frequency === 'none') return false
    }
    if (recurringFilter === 'one-time') {
      if (event.recurrence && event.recurrence.frequency !== 'none') return false
    }
    return true
  }

  // Birthday events — derived from settings, generated for this year + next year
  const birthdayEvents = useMemo((): CalendarEvent[] => {
    const { birthMonth, birthDay, displayName } = state.settings
    if (!birthMonth || !birthDay) return []
    const name = displayName.trim()
    const title = `🎂 ${name ? `${name}'s Birthday` : 'Birthday'}`
    const thisYear = getCalendarDateParts(today).year
    return [thisYear, thisYear + 1].map(y => {
      const ds = `${y}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
      return {
        id: `birthday-${y}`,
        title,
        start: ds,
        allDay: true,
        location: null,
        description: null,
        colorId: null,
        source: 'birthday' as const,
      }
    })
  }, [state.settings.birthMonth, state.settings.birthDay, state.settings.displayName])

  // Events for a day (with recurrence expansion + cosmic + birthday + sort)
  function getEventsForDay(day: number): CalendarEvent[] {
    const ds = dateStr(day)

    // Stored events that occur on this day (handles recurrence)
    const stored = state.calendarEvents
      .filter(e => e.source !== 'google' || state.settings.showGoogleCalendar)
      .filter(e => eventOccursOnDate(e, ds, state.settings.timezone))

    // Cosmic events (notable moon phases) for this day
    const cosmicEvs: CalendarEvent[] = showCosmic
      ? (cosmicByDate[ds] ?? []).map(ce => ({
          id: ce.id, title: ce.title, start: ds, allDay: true,
          location: null, description: ce.description ?? null, colorId: null,
          source: 'cosmic' as const, tags: [], emoji: ce.emoji,
        } as CalendarEvent & { emoji?: string }))
      : []

    // Birthday event for this day (if one exists)
    const bdayEvs = birthdayEvents.filter(e => e.start === ds)

    // Sort key: occurrence date + original time component (all-day sorts before timed events)
    function sortKey(e: CalendarEvent): string {
      if (e.allDay) return ds + 'T00:00:00'
      const timePart = e.start.includes('T') ? e.start.substring(10) : 'T00:00:00'
      return ds + timePart
    }
    return [...bdayEvs, ...stored, ...cosmicEvs]
      .filter(e => passesFilters(e, ds))
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  }

  // For grid dot: any stored event (incl. recurrence) or birthday occurs on this day
  function hasDayEvents(day: number): boolean {
    const ds = dateStr(day)
    return (
      state.calendarEvents.some(e =>
        e.source !== 'cosmic' &&
        (e.source !== 'google' || state.settings.showGoogleCalendar) &&
        eventOccursOnDate(e, ds, state.settings.timezone)
      ) ||
      birthdayEvents.some(e => e.start === ds)
    )
  }

  function patchForm(patch: Partial<EventForm>) {
    setForm(f => f ? { ...f, ...patch } : null)
  }

  function openEdit(event: CalendarEvent) {
    const timeFromISO = (iso: string) => iso.includes('T') ? iso.substring(11, 16) : ''
    setEditingId(event.id)
    setForm({
      title: event.title,
      allDay: event.allDay,
      time: event.allDay ? '' : timeFromISO(event.start),
      endTime: event.end ? timeFromISO(event.end) : '',
      location: event.location ?? '',
      desc: event.description ?? '',
      categoryId: event.categoryId,
      tags: event.tags ?? [],
      recurrence: event.recurrence ?? { ...makeDefaultRecurrence(today), frequency: 'none' },
      showDetails: !!(event.description || event.categoryId || (event.tags ?? []).length > 0),
      showRecurrence: !!(event.recurrence && event.recurrence.frequency !== 'none'),
    })
  }

  async function saveEvent() {
    if (!form || !form.title.trim() || !selectedDay) return
    const ds = dateStr(selectedDay)
    const start = form.allDay ? ds : `${ds}T${form.time || '00:00'}:00`
    const end = form.allDay ? undefined : form.endTime ? `${ds}T${form.endTime}:00` : undefined

    if (editingId) {
      // Update existing event
      const existing = state.calendarEvents.find(e => e.id === editingId)
      if (!existing) { setForm(null); setEditingId(null); return }
      const updated: CalendarEvent = {
        ...existing,
        title: form.title.trim(), start, end,
        allDay: form.allDay, location: form.location.trim() || null,
        description: form.desc.trim() || null,
        categoryId: form.categoryId, tags: form.tags,
        recurrence: form.recurrence.frequency !== 'none' ? form.recurrence : undefined,
        updatedAt: today,
      }
      dispatch({ type: 'UPDATE_CALENDAR_EVENT', payload: updated })
      setForm(null)
      setEditingId(null)
      return
    }

    const localId = genId()
    const newEvent: CalendarEvent = {
      id: localId, title: form.title.trim(), start, end,
      allDay: form.allDay, location: form.location.trim() || null,
      description: form.desc.trim() || null, colorId: null,
      source: 'manual' as const, categoryId: form.categoryId,
      tags: form.tags,
      recurrence: form.recurrence.frequency !== 'none' ? form.recurrence : undefined,
      createdAt: today, updatedAt: today,
    }
    dispatch({ type: 'ADD_CALENDAR_EVENT', payload: newEvent })
    setForm(null)
  }

  async function deleteEvent(id: string) {
    dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: id })
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []
  const selectedDateStr = selectedDay ? dateStr(selectedDay) : null
  const dailyCard = selectedDateStr ? getDailyCard(selectedDateStr) : null
  const dailyWisdom = selectedDateStr ? getDailyWisdom(selectedDateStr) : null

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h1 className="page-title">Calendar</h1>
      </div>

      {shouldShowMercuryBanner(state.settings.showMercuryBanner, mercury) && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: '8px 10px',
            borderRadius: 10,
            color: '#f4a261',
            background: 'rgba(244,162,97,0.12)',
            border: '0.5px solid rgba(244,162,97,0.35)',
            fontSize: 12,
          }}
        >
          ☿ Mercury retrograde until {mercury.endDate}
        </div>
      )}

      {/* Source filter */}
      <FilterBar
        chips={[
          { label: 'All', value: 'all', active: sourceFilter === 'all' },
          { label: 'My events', value: 'user', active: sourceFilter === 'user' },
          { label: 'Google', value: 'google', active: sourceFilter === 'google' },
          { label: 'Mock', value: 'mock', active: sourceFilter === 'mock' },
          { label: 'Cosmic', value: 'cosmic', active: sourceFilter === 'cosmic' },
        ]}
        onChange={(val) => setSourceFilter(val)}
        className="mb-2"
      />

      {/* Category filter (conditional) */}
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

      {/* Tag filter (conditional) */}
      {allEventTags.length > 0 && (
        <FilterBar
          chips={allEventTags.map(tag => ({ label: tag, value: tag, active: tagFilter === tag }))}
          onChange={(val, wantsActive) => setTagFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Date-range filter */}
      <FilterBar
        chips={[
          { label: 'All time', value: 'all', active: dateRangeFilter === 'all' },
          { label: 'Today', value: 'today', active: dateRangeFilter === 'today' },
          { label: 'This week', value: 'this-week', active: dateRangeFilter === 'this-week' },
          { label: 'Upcoming', value: 'upcoming', active: dateRangeFilter === 'upcoming' },
          { label: 'Past', value: 'past', active: dateRangeFilter === 'past' },
        ]}
        onChange={(val) => setDateRangeFilter(val as typeof dateRangeFilter)}
        className="mb-2"
      />

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
         <button className="btn-ghost" aria-label="Previous month" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
          setSelectedDay(1)
        }}>‹</button>
        <span style={{ fontSize: 18, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {MONTH_NAMES[month]} {year}
        </span>
         <button className="btn-ghost" aria-label="Next month" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
          setSelectedDay(1)
        }}>›</button>
      </div>

      {/* Grid header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="card" style={{ padding: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ minHeight: 58 }} />
            const ds = dateStr(day)
            const isSelected = selectedDay === day
            const isCurrent = ds === today
            const moonEm = moonByDate[ds]
            const hasNotable = !!cosmicByDate[ds]?.length

            // Build event pills for this day
            const dayEvents: Array<{ id: string; label: string; emoji: string; color: string; bg: string }> = []
            if (birthdayEvents.some(e => e.start === ds)) {
              dayEvents.push({ id: 'bday', label: 'Birthday', emoji: '🎂', color: '#e8a0c4', bg: 'rgba(232,160,196,0.18)' })
            }
            const storedDay = state.calendarEvents
              .filter(e => e.source !== 'google' || state.settings.showGoogleCalendar)
              .filter(e => eventOccursOnDate(e, ds, state.settings.timezone))
            for (const e of storedDay) {
              const cat = e.categoryId ? DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) : undefined
              const emoji = cat?.emoji ?? (e.source === 'google' ? 'G' : '')
              const color = e.source === 'google' ? '#4285F4' : 'var(--accent-amethyst)'
              const bg = e.source === 'google' ? 'rgba(66,133,244,0.12)' : 'rgba(196,160,232,0.14)'
              dayEvents.push({ id: e.id, label: e.title, emoji, color, bg })
            }
            const visiblePills = dayEvents.slice(0, 2)
            const overflow = dayEvents.length - 2

            return (
              <button
                key={i}
                type="button"
                aria-label={`${MONTH_NAMES[month]} ${day}${isCurrent ? ', today' : ''}${isSelected ? ', selected' : ''}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                style={{
                  minHeight: 58, borderRadius: 6, border: isSelected ? '1.5px solid var(--accent-amethyst)' : '1px solid transparent',
                  cursor: 'pointer', position: 'relative',
                  background: isSelected ? 'rgba(196,160,232,0.12)' : isCurrent ? 'var(--surface-raised)' : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                  padding: '3px 3px 3px', gap: 1, textAlign: 'left', overflow: 'hidden',
                }}
              >
                {/* Top row: moon left, day number right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                  <span style={{ fontSize: 8, lineHeight: 1, opacity: hasNotable ? 0.9 : 0.25 }}>{moonEm}</span>
                  <span style={{
                    fontSize: 11, fontWeight: isCurrent ? 700 : 400, lineHeight: 1,
                    color: isSelected ? 'var(--accent-amethyst)' : isCurrent ? 'var(--accent-amethyst)' : 'var(--text-primary)',
                  }}>{day}</span>
                </div>
                {/* Event pills */}
                {visiblePills.map(pill => (
                  <div key={pill.id} style={{
                    fontSize: 8, lineHeight: 1.3, padding: '1px 3px', borderRadius: 3,
                    background: pill.bg, color: pill.color,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 2,
                  }}>
                    <span style={{ flexShrink: 0, fontSize: 8 }}>{pill.emoji}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pill.label.slice(0, 8)}{pill.label.length > 8 ? '…' : ''}
                    </span>
                  </div>
                ))}
                {overflow > 0 && (
                  <div style={{ fontSize: 7, color: 'var(--text-ghost)', paddingLeft: 3 }}>+{overflow} more</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Google sync status bar */}
      {state.isGoogleConnected && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '6px 2px' }}>
          <span style={{ fontSize: 11, color: syncError ? '#e07070' : 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em' }}>
            {syncError
              ? syncError
              : syncing
              ? '↻ syncing…'
              : googleEventsCount > 0
              ? `${googleEventsCount} Google event${googleEventsCount !== 1 ? 's' : ''} synced`
              : 'no Google events yet'}
          </span>
          <button
            onClick={handleSync}
            disabled={syncing || !isConnected}
            style={{
              fontSize: 11,
              fontFamily: 'Space Mono, monospace',
              color: syncing ? 'var(--text-ghost)' : 'var(--accent-amethyst)',
              background: 'none',
              border: 'none',
              cursor: syncing ? 'default' : 'pointer',
              padding: '2px 0',
              letterSpacing: '0.04em',
            }}
          >
            {syncing ? '…' : '↻ refresh'}
          </button>
        </div>
      )}

      {/* Selected day detail */}
      {selectedDay && selectedDateStr && (
        <div style={{ marginTop: 16 }}>
          <p className="section-label">
            {formatDateLabel(selectedDateStr)}
          </p>

          {/* Cosmic section */}
          {showCosmic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {dailyCard && (() => {
                const isToday = selectedDateStr === today
                const richCard = isToday ? state.oracle?.tarotCard : null
                return (
                  <div
                    onClick={() => setCardExpanded(x => !x)}
                    style={{
                      padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(196,160,232,0.07)', border: '0.5px solid rgba(196,160,232,0.2)',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🃏</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: 'var(--text-ghost)', margin: '0 0 2px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.05em' }}>TODAY'S CARD</p>
                        <p style={{ fontSize: 15, color: 'var(--accent-amethyst)', margin: 0, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{dailyCard.title}</p>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-ghost)', flexShrink: 0 }}>{cardExpanded ? '▾' : '▸'}</span>
                    </div>

                    {/* Expanded detail */}
                    {cardExpanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(196,160,232,0.2)' }}>
                        {richCard ? (
                          <>
                            {(richCard.type || richCard.suit) && (
                              <p style={{ fontSize: 10, color: 'var(--text-ghost)', margin: '0 0 8px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {richCard.type}{richCard.suit ? ` · ${richCard.suit}` : ''}
                              </p>
                            )}
                            {richCard.desc && (
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.55 }}>{richCard.desc}</p>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ padding: '7px 10px', borderRadius: 7, background: 'rgba(196,160,232,0.08)' }}>
                                <p style={{ fontSize: 9, color: 'var(--accent-amethyst)', margin: '0 0 3px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>UPRIGHT</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{richCard.meaning_up}</p>
                              </div>
                              <div style={{ padding: '7px 10px', borderRadius: 7, background: 'rgba(196,160,232,0.05)' }}>
                                <p style={{ fontSize: 9, color: 'var(--text-ghost)', margin: '0 0 3px', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>REVERSED</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{richCard.meaning_rev}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: 0, fontStyle: 'italic' }}>
                            Full card details are available for today's reading. Select today to see the full meaning.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
              {dailyWisdom && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(196,160,232,0.05)', border: '0.5px solid rgba(196,160,232,0.15)' }}>
                  <span style={{ fontSize: 14, flexShrink: 0, color: 'var(--accent-amethyst)' }}>✦</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{dailyWisdom.title}</p>
                </div>
              )}
            </div>
          )}

          {/* Event list (filtered + sorted ascending) */}
          {selectedEvents.length === 0 ? (
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>
                {dateRangeFilter !== 'all' && !dateInRange(selectedDateStr, dateRangeFilter, today)
                  ? `No events in this time range.`
                  : 'No events.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map(event => {
                const isCosmic = event.source === 'cosmic'
                const isGoogle = event.source === 'google'
                const isManual = event.source === 'manual'
                const isBirthday = event.source === 'birthday'
                const cat = event.categoryId ? DEFAULT_CATEGORIES.find(c => c.id === event.categoryId) : undefined
                const recLabel = formatRecurrenceLabel(event.recurrence)
                const eventTags = event.tags ?? []
                const barColor = isBirthday ? '#e8a0c4' : isCosmic ? 'var(--accent-amethyst)' : isGoogle ? '#4285F4' : 'var(--accent-amethyst)'

                return (
                  <div
                    key={`${event.id}-${selectedDateStr}`}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: isBirthday ? 'rgba(232,160,196,0.06)' : isCosmic ? 'rgba(196,160,232,0.06)' : undefined,
                    }}
                  >
                    <div style={{ width: 3, borderRadius: 2, background: barColor, alignSelf: 'stretch', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          {cat && <span style={{ fontSize: 15, flexShrink: 0 }}>{cat.emoji}</span>}
                          {isCosmic && !cat && (event as any).emoji && (
                            <span style={{ fontSize: 15, flexShrink: 0 }}>{(event as any).emoji}</span>
                          )}
                          <p style={{
                            fontSize: 14, margin: 0,
                            color: isBirthday ? '#e8a0c4' : isCosmic ? 'var(--accent-amethyst)' : 'var(--text-primary)',
                            fontStyle: isCosmic ? 'italic' : 'normal',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {event.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {isGoogle && <span style={{ fontSize: 9, color: '#4285F4', border: '0.5px solid #4285F4', borderRadius: 4, padding: '1px 5px', fontFamily: 'Space Mono, monospace' }}>G</span>}
                          {isCosmic && <span style={{ fontSize: 10, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace' }}>✦</span>}
                          {isBirthday && <span style={{ fontSize: 9, color: '#e8a0c4', border: '0.5px solid #e8a0c4', borderRadius: 4, padding: '1px 5px', fontFamily: 'Space Mono, monospace' }}>bday</span>}
                          {isManual && (
                            <button
                              onClick={e => { e.stopPropagation(); openEdit(event) }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1 }}
                              title="Edit event"
                            >✎</button>
                          )}
                          {isManual && <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>}
                        </div>
                      </div>

                      {event.description && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0', lineHeight: 1.4 }}>{event.description}</p>}
                      {!event.allDay && (
                        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0', fontFamily: 'Space Mono, monospace' }}>
                          {formatEventTime(event.start, false, state.settings.timezone)}{event.end ? ` – ${formatEventTime(event.end, false, state.settings.timezone)}` : ''}
                        </p>
                      )}
                      {event.allDay && !isCosmic && !isBirthday && <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0' }}>All day</p>}
                      {event.location && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>📍 {event.location}</p>}
                      {recLabel && <p style={{ fontSize: 11, color: 'var(--accent-amethyst)', margin: '3px 0 0', fontFamily: 'Space Mono, monospace' }}>↻ {recLabel}</p>}
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
              <input className="input-field" aria-label="Event title" placeholder="Event title" value={form.title} onChange={e => patchForm({ title: e.target.value })} autoFocus />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <input type="checkbox" id="allday" checked={form.allDay} onChange={e => patchForm({ allDay: e.target.checked })} />
                <label htmlFor="allday" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>All day</label>
              </div>
              {!form.allDay && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="input-field" aria-label="Event start time" style={{ flex: 1 }} placeholder="Start (14:00)" value={form.time} onChange={e => patchForm({ time: e.target.value })} />
                  <input className="input-field" aria-label="Event end time" style={{ flex: 1 }} placeholder="End (optional)" value={form.endTime} onChange={e => patchForm({ endTime: e.target.value })} />
                </div>
              )}
              <input className="input-field" aria-label="Event location" style={{ marginTop: 8 }} placeholder="Location (optional)" value={form.location} onChange={e => patchForm({ location: e.target.value })} />

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
                <button className="btn-primary" style={{ flex: 1 }} onClick={saveEvent}>{editingId ? 'Update event' : 'Add event'}</button>
                <button className="btn-ghost" onClick={() => { setForm(null); setEditingId(null) }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={() => setForm(freshForm(today))}>
              + Add event
            </button>
          )}
        </div>
      )}
    </div>
  )
}
