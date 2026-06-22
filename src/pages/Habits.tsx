import { useState } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import { getTodayISO } from '../lib/date'

const COLOR_OPTIONS = ['#C4A0E8', '#7EC8A0', '#E8A0B4', '#A0C4E8', '#E8D4A0', '#C4C4C4']

function getStreak(habitId: string, completions: { habitId: string; date: string }[]): number {
  const today = getTodayISO()
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0]
    if (i === 0 && !completions.some(c => c.habitId === habitId && c.date === dateStr)) {
      d.setDate(d.getDate() - 1)
      continue
    }
    if (completions.some(c => c.habitId === habitId && c.date === dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function getLast7(habitId: string, completions: { habitId: string; date: string }[]): { label: string; done: boolean }[] {
  const days: { label: string; done: boolean }[] = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const tmp = new Date(d)
    tmp.setDate(d.getDate() - i)
    const dateStr = tmp.toISOString().split('T')[0]
    days.push({
      label: tmp.toLocaleDateString('en-US', { weekday: 'narrow' }),
      done: completions.some(c => c.habitId === habitId && c.date === dateStr),
    })
  }
  return days
}

export default function Habits() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])

  const today = getTodayISO()
  const activeHabits = state.habits.filter(h => h.active)
  const doneToday = activeHabits.filter(h =>
    state.habitCompletions.some(c => c.habitId === h.id && c.date === today)
  ).length

  function addHabit() {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: genId(),
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        colorTag: newColor,
        active: true,
        createdAt: today,
      },
    })
    setNewName('')
    setNewDesc('')
    setNewColor(COLOR_OPTIONS[0])
    setShowAdd(false)
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 className="page-title">Habits</h1>
        <span style={{ fontSize: 12, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>{doneToday}/{activeHabits.length} today</span>
      </div>

      {activeHabits.length === 0 && !showAdd && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: '0 0 12px' }}>No habits yet.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add your first habit</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeHabits.map(habit => {
          const done = state.habitCompletions.some(c => c.habitId === habit.id && c.date === today)
          const streak = getStreak(habit.id, state.habitCompletions)
          const last7 = getLast7(habit.id, state.habitCompletions)
          return (
            <div key={habit.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckCircle
                  done={done}
                  onToggle={() => dispatch({ type: 'TOGGLE_HABIT', payload: { habitId: habit.id, date: today } })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', fontWeight: 500 }}>{habit.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {streak > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MoonIcon /> {streak}
                        </span>
                      )}
                      <button onClick={() => dispatch({ type: 'REMOVE_HABIT', payload: habit.id })} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                  {habit.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{habit.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    {last7.map((day, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: day.done ? (habit.colorTag || 'var(--accent-amethyst)') : 'var(--surface-raised)', border: day.done ? 'none' : '0.5px solid var(--border)' }} />
                        <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginTop: 12 }}>
          <input className="input-field" placeholder="Habit name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} autoFocus />
          <input className="input-field" style={{ marginTop: 8 }} placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-ghost)' }}>Color:</span>
            {COLOR_OPTIONS.map(c => (
              <button key={c} onClick={() => setNewColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addHabit}>Add</button>
            <button className="btn-ghost" onClick={() => { setShowAdd(false); setNewName(''); setNewDesc('') }}>Cancel</button>
          </div>
        </div>
      )}

      {!showAdd && activeHabits.length > 0 && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  )
}

function MoonIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}
