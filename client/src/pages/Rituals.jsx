import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { DAYS, todayKey } from '../utils.js'
import CheckCircle from '../components/CheckCircle.jsx'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function Rituals() {
  const { state, dispatch } = useApp()
  const { toast, showToast } = useToast()

  const today = new Date()
  const todayDay = DAYS[today.getDay()]
  const todayStr = todayKey()

  const [selectedDay, setSelectedDay] = useState(todayDay)
  const [editMode, setEditMode] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')

  const items = state.routines[selectedDay] || []
  const isToday = selectedDay === todayDay

  const isComplete = (id) => !!state.routineCompletions[`${id}_${todayStr}`]

  const handleToggle = (id) => {
    if (!isToday) return
    dispatch({ type: 'TOGGLE_ROUTINE_COMPLETION', itemId: id, date: todayStr })
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    dispatch({
      type: 'ADD_ROUTINE_ITEM',
      day: selectedDay,
      item: { id: genId(), title: newTitle.trim(), time: newTime.trim(), order: items.length }
    })
    setNewTitle('')
    setNewTime('')
    setShowAdd(false)
    showToast('Ritual added')
  }

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_ROUTINE_ITEM', day: selectedDay, itemId: id })
    showToast('Ritual removed')
  }

  return (
    <div className="page-content">
      <Toast message={toast} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Rituals</h1>
        <button
          onClick={() => setEditMode(v => !v)}
          style={{ background: 'none', border: 'none', color: editMode ? 'var(--accent-amethyst)' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
        >
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Day pills */}
      <div className="day-pills">
        {DAYS.map(d => (
          <button
            key={d}
            className={`day-pill ${selectedDay === d ? 'active' : ''}`}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Ritual items */}
      {items.length === 0 ? (
        <div className="card" style={{ color: 'var(--text-ghost)', fontSize: 13 }}>
          No rituals for {selectedDay}. Tap + to add one.
        </div>
      ) : (
        items.map(item => {
          const done = isToday && isComplete(item.id)
          return (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isToday && !editMode && (
                <CheckCircle checked={done} onToggle={() => handleToggle(item.id)} />
              )}
              {editMode && (
                <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-ghost)' }}>
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                  {item.title}
                </div>
                {item.time && (
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.time}
                  </div>
                )}
              </div>
              {editMode && (
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: 4 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              )}
            </div>
          )
        })
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <input
            type="text"
            placeholder="Ritual name"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            style={{ marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Time (optional, e.g. 7:00 AM)"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{ flex: 1, background: 'var(--accent-amethyst)', color: 'var(--bg)', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Add Ritual
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTitle(''); setNewTime('') }}
              style={{ padding: '10px 16px', background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--bg)' }} strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
