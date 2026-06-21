import React, { useState } from 'react'
import { useApp, todayKey } from '../context/AppContext.jsx'
import CheckCircle from '../components/CheckCircle.jsx'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

const COLORS = ['#C4A0E8', '#4ECFA0', '#E8B86D', '#D4756B', '#9B8AB0', '#4A9EE8']

function getStreak(habitId, completions) {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = `${habitId}_${d.toISOString().split('T')[0]}`
    if (completions[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      d.setDate(d.getDate() - 1)
      const yday = `${habitId}_${d.toISOString().split('T')[0]}`
      if (!completions[yday]) break
    } else {
      break
    }
  }
  return streak
}

function getLast7(habitId, completions) {
  const days = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(d)
    dt.setDate(d.getDate() - i)
    const key = `${habitId}_${dt.toISOString().split('T')[0]}`
    days.push({
      label: ['S','M','T','W','T','F','S'][dt.getDay()],
      isToday: i === 0,
      done: !!completions[key]
    })
  }
  return days
}

export default function Habits() {
  const { state, dispatch } = useApp()
  const { toast, showToast } = useToast()

  const todayStr = todayKey()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const isToday = (id) => !!state.habitCompletions[`${id}_${todayStr}`]

  const handleAdd = () => {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_HABIT',
      habit: { id: genId(), name: newName.trim(), description: newDesc.trim(), color: newColor, active: true }
    })
    setNewName('')
    setNewDesc('')
    setNewColor(COLORS[0])
    setShowAdd(false)
    showToast('Habit added')
  }

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_HABIT', habitId: id })
    showToast('Habit removed')
  }

  return (
    <div className="page-content">
      <Toast message={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Habits</h1>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
          {state.habits.filter(h => isToday(h.id)).length}/{state.habits.length} today
        </span>
      </div>

      {state.habits.length === 0 && !showAdd ? (
        <div className="card" style={{ color: 'var(--text-ghost)', fontSize: 13 }}>
          No habits yet. Tap + to add your first one.
        </div>
      ) : (
        state.habits.map(habit => {
          const done = isToday(habit.id)
          const streak = getStreak(habit.id, state.habitCompletions)
          const last7 = getLast7(habit.id, state.habitCompletions)

          return (
            <div key={habit.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <CheckCircle checked={done} onToggle={() => dispatch({ type: 'TOGGLE_HABIT_COMPLETION', habitId: habit.id, date: todayStr })} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {habit.name}
                  </div>
                  {habit.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{habit.description}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={streak >= 30 ? 'var(--accent-gold)' : 'var(--accent-amethyst)'} strokeWidth="1.8">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span className="streak-count" style={{ color: streak >= 30 ? 'var(--accent-gold)' : 'var(--accent-amethyst)' }}>{streak}</span>
                </div>
                <button
                  onClick={() => handleRemove(habit.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', padding: 2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* 7-day grid */}
              <div className="habit-grid">
                {last7.map((d, i) => (
                  <div
                    key={i}
                    className={`habit-dot ${d.isToday && d.done ? 'today-done' : d.done ? 'completed' : ''}`}
                    title={d.label}
                  >
                    {d.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <input
            type="text"
            placeholder="Habit name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            style={{ marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Color</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{ flex: 1, background: 'var(--accent-amethyst)', color: 'var(--bg)', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Add Habit
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); setNewDesc('') }}
              style={{ padding: '10px 16px', background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowAdd(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--bg)' }} strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
