import React, { useState } from 'react'
import { useApp, todayKey, DAYS } from '../context/AppContext.jsx'
import CheckCircle from '../components/CheckCircle.jsx'

const quotes = [
  "She is a free spirit who soars through all barriers.",
  "The moon is always whole.",
  "Go where the energy is kind.",
  "Trust the timing of your life.",
  "Magic is believing in yourself.",
  "She is clothed in strength and dignity.",
  "You are allowed to be both a masterpiece and a work in progress.",
  "In the middle of difficulty lies opportunity.",
  "Do small things with great love.",
  "The quieter you become, the more you can hear.",
  "She decided to free herself, dance into the wind.",
  "Bloom where you are planted.",
]

const seasonalDates = {
  '03-20': 'Spring Equinox',
  '06-21': 'Summer Solstice',
  '09-22': 'Autumn Equinox',
  '12-21': 'Winter Solstice',
  '10-31': 'Samhain',
  '02-02': 'Imbolc',
  '05-01': 'Beltane',
  '08-01': 'Lughnasadh',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'GOOD MORNING'
  if (h < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

function getSeasonalBadge() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return seasonalDates[`${mm}-${dd}`] || null
}

function getDailyQuote() {
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return quotes[doy % quotes.length]
}

export default function Home({ onTabChange }) {
  const { state, dispatch } = useApp()
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [easterCount, setEasterCount] = useState(0)
  const [showEaster, setShowEaster] = useState(false)

  const today = new Date()
  const todayStr = todayKey()
  const dayName = DAYS[today.getDay()]
  const todayRoutine = state.routines[dayName] || []

  const greeting = getGreeting()
  const seasonal = getSeasonalBadge()
  const quote = getDailyQuote()

  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleStarTap = () => {
    const next = easterCount + 1
    setEasterCount(next)
    if (next >= 3) {
      setShowEaster(true)
      setEasterCount(0)
    }
  }

  const isRoutineDone = (id) => !!state.routineCompletions[`${id}_${todayStr}`]
  const toggleRoutine = (id) => dispatch({ type: 'TOGGLE_ROUTINE_COMPLETION', itemId: id, date: todayStr })

  const isHabitDone = (id) => !!state.habitCompletions[`${id}_${todayStr}`]
  const todayTasks = state.tasks.filter(t => t.status === 'Today')
  const doneCount = state.habits.filter(h => isHabitDone(h.id)).length
  const routineDoneCount = todayRoutine.filter(r => isRoutineDone(r.id)).length
  const routinePct = todayRoutine.length > 0
    ? Math.round((routineDoneCount / todayRoutine.length) * 100)
    : 0

  return (
    <div className="page-content">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#7B6A8C', letterSpacing: '0.12em', fontWeight: 400, marginBottom: 4 }}>
          {greeting}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 300, color: '#EAE0F8' }}>
            Kieran
          </span>
          <button
            onClick={handleStarTap}
            style={{ background: 'none', border: 'none', color: '#C4A0E8', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}
          >
            ✦
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#7B6A8C', marginBottom: seasonal ? 6 : 0 }}>
          {dateLabel}
        </div>
        {seasonal && (
          <span className="seasonal-badge">{seasonal}</span>
        )}
      </div>

      {/* Today's Rituals */}
      <div className="section-header">Today's Rituals</div>
      {todayRoutine.length === 0 ? (
        <div className="card" style={{ color: '#4A3560', fontSize: 13 }}>
          No rituals set for {dayName}. Add some in the Rituals tab.
        </div>
      ) : (
        <div className="card">
          {todayRoutine.map(item => {
            const done = isRoutineDone(item.id)
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: '0.5px solid #251B30' }}>
                <CheckCircle checked={done} onToggle={() => toggleRoutine(item.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: done ? '#4A3560' : '#EAE0F8', textDecoration: done ? 'line-through' : 'none' }}>
                    {item.title}
                  </div>
                  {item.time && (
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#7B6A8C', marginTop: 2 }}>
                      {item.time}
                    </div>
                  )}
                </div>
              </div>
            )
          }).reduce((acc, el, i, arr) => {
            // remove border from last item
            if (i === arr.length - 1) {
              return [...acc, React.cloneElement(el, {
                style: { display: 'flex', alignItems: 'center', gap: 10 }
              })]
            }
            return [...acc, el]
          }, [])}
        </div>
      )}

      {/* Upcoming Calendar (placeholder when no API) */}
      <div className="section-header">Upcoming</div>
      <div className="card" style={{ color: '#7B6A8C', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A3560' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span style={{ fontSize: 12 }}>Connect Google Calendar in the Calendar tab to see your events here.</span>
        </div>
      </div>

      {/* More section */}
      <div className="more-divider" onClick={() => setMoreExpanded(v => !v)}>
        ∿&nbsp;&nbsp;more&nbsp;&nbsp;∿
      </div>

      {moreExpanded && (
        <>
          {/* Habits summary */}
          <div className="section-header">Habits Today</div>
          {state.habits.length === 0 ? (
            <div className="card" style={{ color: '#4A3560', fontSize: 13 }}>No habits yet. Add some in the Habits tab.</div>
          ) : (
            <div className="card">
              {state.habits.map(h => {
                const done = isHabitDone(h.id)
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircle checked={done} onToggle={() => dispatch({ type: 'TOGGLE_HABIT_COMPLETION', habitId: h.id, date: todayStr })} />
                    <span style={{ fontSize: 13, color: done ? '#4A3560' : '#EAE0F8', textDecoration: done ? 'line-through' : 'none' }}>{h.name}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Today's tasks summary */}
          <div className="section-header">Today's Tasks</div>
          {todayTasks.length === 0 ? (
            <div className="card" style={{ color: '#4A3560', fontSize: 13 }}>No tasks for today.</div>
          ) : (
            <div className="card">
              {todayTasks.slice(0, 5).map(t => (
                <div key={t.id} style={{ fontSize: 13, color: t.status === 'Done' ? '#4A3560' : '#EAE0F8', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.priority === 'High' ? '#D4756B' : '#3A2A4A', flexShrink: 0 }} />
                  {t.title}
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          <div className="section-header">Progress</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#9B8AB0' }}>Rituals</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#C4A0E8' }}>{routineDoneCount}/{todayRoutine.length} · {routinePct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#9B8AB0' }}>Habits</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#C4A0E8' }}>{doneCount}/{state.habits.length}</span>
            </div>
          </div>

          {/* Quote */}
          <div className="card" style={{ marginTop: 4, borderColor: '#251B30' }}>
            <div style={{ fontSize: 13, color: '#9B8AB0', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{quote}"
            </div>
          </div>
        </>
      )}

      {/* Easter egg modal */}
      {showEaster && (
        <div className="modal-overlay" onClick={() => setShowEaster(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, color: '#EAE0F8', marginBottom: 8 }}>
                Kieran's LifeTrkr · v3.0
              </div>
              <div style={{ fontSize: 13, color: '#9B8AB0', marginBottom: 16 }}>
                The fourth generation.
              </div>
              <div style={{ fontSize: 13, color: '#7B6A8C', letterSpacing: '0.08em', marginBottom: 20 }}>
                Ralph · Virgil · Jamie · Kieran
              </div>
              <div style={{ color: '#C4A0E8', fontSize: 18 }}>Built with ✦</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
