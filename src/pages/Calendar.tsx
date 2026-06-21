import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, genId } from '../context/AppContext'
import { getTodayISO, formatEventTime } from '../lib/date'
import type { CalendarEvent } from '../types'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['S','M','T','W','T','F','S']

export default function Calendar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [newAllDay, setNewAllDay] = useState(false)
  const [newLocation, setNewLocation] = useState('')

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

  function eventsForDay(day: number): CalendarEvent[] {
    const ds = dateStr(day)
    return state.calendarEvents.filter(e => e.start.startsWith(ds))
  }

  // Manual calendar events (stored separately — for now stored as CalendarEvent in state)
  const manualEvents = state.calendarEvents.filter(e => e.source === 'manual')
  const googleEvents = state.calendarEvents.filter(e => e.source === 'google')

  function selectedDateEvents(): CalendarEvent[] {
    if (!selectedDay) return []
    const ds = dateStr(selectedDay)
    return state.calendarEvents.filter(e => e.start.startsWith(ds))
  }

  function addManualEvent() {
    if (!newTitle.trim() || !selectedDay) return
    const ds = dateStr(selectedDay)
    const startStr = newAllDay ? ds : `${ds}T${newTime || '00:00'}:00`
    const endStr = newAllDay ? undefined : newEndTime ? `${ds}T${newEndTime}:00` : undefined

    dispatch({
      type: 'SET_CALENDAR_EVENTS',
      payload: [
        ...state.calendarEvents,
        {
          id: genId(),
          title: newTitle.trim(),
          start: startStr,
          end: endStr,
          allDay: newAllDay,
          location: newLocation.trim() || null,
          description: null,
          colorId: null,
          source: 'manual' as const,
        },
      ],
    })
    setNewTitle('')
    setNewTime('')
    setNewEndTime('')
    setNewLocation('')
    setNewAllDay(false)
    setShowAdd(false)
  }

  function deleteManualEvent(id: string) {
    dispatch({
      type: 'SET_CALENDAR_EVENTS',
      payload: state.calendarEvents.filter(e => e.id !== id),
    })
  }

  const selectedEvents = selectedDateEvents()

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title">Calendar</h1>
        {!state.isGoogleConnected && (
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/settings')}>
            Connect Google →
          </button>
        )}
        {state.isGoogleConnected && (
          <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>
            {googleEvents.length} events
          </span>
        )}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 0) { setMonth(11); setYear(y => y - 1) }
          else setMonth(m => m - 1)
          setSelectedDay(null)
        }}>‹</button>
        <span style={{ fontSize: 18, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => {
          if (month === 11) { setMonth(0); setYear(y => y + 1) }
          else setMonth(m => m + 1)
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
            const isCurrentDay = ds === today
            const hasEvents = state.calendarEvents.some(e => e.start.startsWith(ds))
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isSelected ? 'var(--accent-amethyst)' : isCurrentDay ? 'var(--surface-raised)' : 'transparent',
                  color: isSelected ? 'var(--bg)' : isCurrentDay ? 'var(--accent-amethyst)' : 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: isCurrentDay ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {day}
                {hasEvents && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--accent-amethyst)', position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div style={{ marginTop: 16 }}>
          <p className="section-label">
            {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {!state.isGoogleConnected && selectedEvents.filter(e => e.source === 'google').length === 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>
                Connect Google in Settings to see your calendar events.
              </p>
            </div>
          )}

          {selectedEvents.length === 0 ? (
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>No events.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map(event => (
                <div key={event.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 3, borderRadius: 2, background: event.source === 'google' ? '#4285F4' : 'var(--accent-amethyst)', alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{event.title}</p>
                      {event.source === 'google' && (
                        <span style={{ fontSize: 9, color: '#4285F4', border: '0.5px solid #4285F4', borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontFamily: 'Space Mono, monospace' }}>G</span>
                      )}
                      {event.source === 'manual' && (
                        <button onClick={() => deleteManualEvent(event.id)} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
                      )}
                    </div>
                    {!event.allDay && (
                      <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0', fontFamily: 'Space Mono, monospace' }}>
                        {formatEventTime(event.start, false)}{event.end ? ` – ${formatEventTime(event.end, false)}` : ''}
                      </p>
                    )}
                    {event.allDay && <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0' }}>All day</p>}
                    {event.location && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>📍 {event.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add event form */}
          {showAdd ? (
            <div className="card" style={{ marginTop: 12 }}>
              <input className="input-field" placeholder="Event title" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <input type="checkbox" id="allday" checked={newAllDay} onChange={e => setNewAllDay(e.target.checked)} />
                <label htmlFor="allday" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>All day</label>
              </div>
              {!newAllDay && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="input-field" style={{ flex: 1 }} placeholder="Start (e.g. 14:00)" value={newTime} onChange={e => setNewTime(e.target.value)} />
                  <input className="input-field" style={{ flex: 1 }} placeholder="End (optional)" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                </div>
              )}
              <input className="input-field" style={{ marginTop: 8 }} placeholder="Location (optional)" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addManualEvent}>Add</button>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={() => setShowAdd(true)}>+ Add event</button>
          )}
        </div>
      )}
    </div>
  )
}
