import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import { OracleCard } from '../components/OracleCard'
import { useOracle } from '../hooks/useOracle'
import { getMoonPhase, getAstroSeason, getMercuryStatus, shouldShowMercuryBanner } from '../lib/celestial'
import { getTodayISO, getDayOfWeek, getGreeting, getSeasonalBadge, getDailyQuote, formatEventTime, formatEventDate } from '../lib/date'

// Easter egg — fixed content per PRD
const EASTER_CONTENT = {
  title:  'Ralph · Vyrle · Jamie · Kieran',
  footer: 'Built on Father\'s Day, Summer Solstice 2026 ✦ The fourth hill.',
}

export default function Home() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [easterCount, setEasterCount] = useState(0)
  const [showEaster, setShowEaster] = useState(false)
  const { oracle, isLoadingOracle, regenerate } = useOracle()

  const today = getTodayISO(state.settings.timezone)
  const dayOfWeek = getDayOfWeek(state.settings.timezone)
  const greeting = getGreeting()
  const seasonalBadge = getSeasonalBadge()
  const dailyQuote = getDailyQuote()

  // Celestial data (computed once per render — cheap math)
  const moon    = getMoonPhase()
  const season  = getAstroSeason()
  const mercury = getMercuryStatus()

  const displayName = state.settings.displayName || state.profile?.name

  const template = state.routineTemplates.find(t => t.dayOfWeek === dayOfWeek)
  const completion = state.routineCompletions.find(
    c => c.routineTemplateId === template?.id && c.date === today
  )
  const isItemDone = (id: string) => completion?.completedItemIds.includes(id) ?? false

  const todayTasks = state.tasks.filter(t => t.status === 'today')
  const activeHabits = state.habits.filter(h => h.active)
  const habitsDoneToday = activeHabits.filter(h =>
    state.habitCompletions.some(c => c.habitId === h.id && c.date === today)
  ).length

  const upcomingEvents = state.calendarEvents
    .filter(e => e.start.slice(0, 10) >= today)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3)

  function handleStarTap() {
    const next = easterCount + 1
    setEasterCount(next)
    if (next >= 3) { setShowEaster(true); setEasterCount(0) }
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>{greeting}</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300, color: 'var(--text-primary)', margin: '2px 0', lineHeight: 1.1 }}>
            {displayName ? (
              <>{displayName} <button aria-label="Open LifeTrkr origin story" onClick={handleStarTap} style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 20, padding: 0, verticalAlign: 'middle' }}>✦</button></>
            ) : (
              <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', color: 'var(--text-ghost)', cursor: 'pointer', padding: 0 }}>
                Set your name →
              </button>
            )}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {seasonalBadge && (
            <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: 'var(--accent-amethyst)', border: '0.5px solid var(--accent-amethyst)', borderRadius: 20, padding: '2px 10px', letterSpacing: '0.06em' }}>
              {seasonalBadge}
            </span>
          )}
        </div>
      </div>

      {/* Celestial Row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, marginBottom: 2, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid var(--border-subtle)' }}>
          {moon.emoji} <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{moon.name}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid var(--border-subtle)' }}>
          {season.emoji} <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{season.sign}</span>
        </span>
        {shouldShowMercuryBanner(state.settings.showMercuryBanner, mercury) && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#f4a261', background: 'rgba(244,162,97,0.12)', borderRadius: 20, padding: '4px 10px', border: '0.5px solid rgba(244,162,97,0.35)' }}>
            ☿ <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>Rx until {mercury.endDate}</span>
          </span>
        )}
      </div>

      {/* Today's Rituals */}
      <section style={{ marginTop: 20 }}>
        <p className="section-label">TODAY'S RITUALS</p>
        <div className="card">
          {(!template || template.items.length === 0) ? (
            <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0, padding: '4px 0' }}>
              No rituals for {dayOfWeek}. <button onClick={() => navigate('/rituals')} style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 13, padding: 0 }}>Add some →</button>
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {template.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle done={isItemDone(item.id)} onToggle={() => dispatch({ type: 'TOGGLE_ROUTINE_ITEM', payload: { templateId: template.id, itemId: item.id, date: today } })} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, color: isItemDone(item.id) ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: isItemDone(item.id) ? 'line-through' : 'none' }}>{item.title}</span>
                    {item.time && <span style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 8, fontFamily: 'Space Mono, monospace' }}>{item.time}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section style={{ marginTop: 20 }}>
        <p className="section-label">UPCOMING</p>
        <div className="card">
          {upcomingEvents.length === 0 ? (
            !state.isGoogleConnected ? (
              <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>✦ Connect Google to see your calendar →</p>
              </button>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>No upcoming events.</p>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.map(event => (
                <div key={event.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, borderRadius: 2, background: 'var(--accent-amethyst)', alignSelf: 'stretch', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{event.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '2px 0 0', fontFamily: 'Space Mono, monospace' }}>
                      {formatEventDate(event.start, event.allDay)} {!event.allDay && formatEventTime(event.start, false)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* More section */}
       <button className="more-toggle" aria-expanded={moreExpanded} aria-controls="home-more-content" onClick={() => setMoreExpanded(e => !e)}>
        <span>∿ {moreExpanded ? 'less' : 'more'} ∿</span>
      </button>

      {moreExpanded && (
         <div id="home-more-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {/* Oracle */}
          {state.settings.oracleEnabled && (
            <section>
              <p className="section-label">ORACLE</p>
              <OracleCard reading={oracle} loading={isLoadingOracle} onRegenerate={regenerate} />
            </section>
          )}

          {/* Habits */}
          {activeHabits.length > 0 && (
            <section>
              <p className="section-label">HABITS TODAY</p>
              <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeHabits.map(h => {
                    const done = state.habitCompletions.some(c => c.habitId === h.id && c.date === today)
                    return (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircle done={done} onToggle={() => dispatch({ type: 'TOGGLE_HABIT', payload: { habitId: h.id, date: today } })} />
                        <span style={{ fontSize: 14, color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>{h.name}</span>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '12px 0 0', fontFamily: 'Space Mono, monospace' }}>
                  {habitsDoneToday} of {activeHabits.length} today
                </p>
              </div>
            </section>
          )}

          {/* Tasks */}
          {todayTasks.length > 0 && (
            <section>
              <p className="section-label">TODAY'S TASKS</p>
              <div className="card">
                {todayTasks.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '0.5px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-ghost)', fontSize: 12 }}>○</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.title}</span>
                  </div>
                ))}
                {todayTasks.length > 5 && (
                  <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '8px 0 0' }}>+{todayTasks.length - 5} more</p>
                )}
              </div>
            </section>
          )}

          {/* Daily Quote */}
          <section>
            <div className="card" style={{ borderLeft: '2px solid var(--accent-amethyst)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>"{dailyQuote}"</p>
            </div>
          </section>
        </div>
      )}

      {/* Easter egg modal — fixed content per PRD */}
      {showEaster && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowEaster(false)}>
          <div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="origin-story-title" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>✦</p>
               <p id="origin-story-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
                {EASTER_CONTENT.title}
              </p>
              <p style={{ fontSize: 11, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em', margin: '4px 0 0' }}>
                {EASTER_CONTENT.footer}
              </p>
              <button className="btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={() => setShowEaster(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
