import { useState } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import { getTodayISO, getDayOfWeek } from '../lib/date'
import { DAYS_OF_WEEK, DAYS_SHORT } from '../constants'
import type { DayOfWeek } from '../types'

export default function Rituals() {
  const { state, dispatch } = useApp()
  const todayFull = getDayOfWeek()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayFull)
  const [editMode, setEditMode] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')

  const today = getTodayISO()
  const isToday = selectedDay === todayFull

  const template = state.routineTemplates.find(t => t.dayOfWeek === selectedDay)
  const completion = state.routineCompletions.find(
    c => c.routineTemplateId === template?.id && c.date === today
  )
  const isItemDone = (id: string) => completion?.completedItemIds.includes(id) ?? false

  function addItem() {
    if (!newTitle.trim() || !template) return
    dispatch({
      type: 'ADD_ROUTINE_ITEM',
      payload: {
        templateId: template.id,
        item: { id: genId(), title: newTitle.trim(), time: newTime.trim() || undefined, sortOrder: template.items.length },
      },
    })
    setNewTitle('')
    setNewTime('')
    setShowAdd(false)
  }

  function removeItem(itemId: string) {
    if (!template) return
    dispatch({ type: 'REMOVE_ROUTINE_ITEM', payload: { templateId: template.id, itemId } })
  }

  function toggleItem(itemId: string) {
    if (!template || !isToday) return
    dispatch({ type: 'TOGGLE_ROUTINE_ITEM', payload: { templateId: template.id, itemId, date: today } })
  }

  const doneCount = template ? template.items.filter(i => isItemDone(i.id)).length : 0

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title">Rituals</h1>
        <button className="btn-ghost" onClick={() => { setEditMode(e => !e); setShowAdd(false) }}>
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
        {(DAYS_OF_WEEK as readonly string[]).map((day, i) => {
          const dayFull = day as DayOfWeek
          const isSelected = selectedDay === dayFull
          const isCurrentDay = dayFull === todayFull
          return (
            <button
              key={day}
              onClick={() => { setSelectedDay(dayFull); setEditMode(false); setShowAdd(false) }}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 20,
                border: isSelected ? 'none' : '0.5px solid var(--border)',
                background: isSelected ? 'var(--accent-amethyst)' : 'transparent',
                color: isSelected ? 'var(--bg)' : isCurrentDay ? 'var(--accent-amethyst)' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: isSelected ? 500 : 400,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {DAYS_SHORT[i]}
            </button>
          )
        })}
      </div>

      {/* Progress */}
      {template && template.items.length > 0 && isToday && (
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
          {doneCount}/{template.items.length} complete
        </p>
      )}

      {/* Items */}
      <div className="card">
        {!template || template.items.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0, padding: '4px 0' }}>
            No rituals for {selectedDay}. {!editMode && <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 13, padding: 0 }}>Add some →</button>}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {template.items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editMode ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-ghost)" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{item.title}</span>
                    {item.time && <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>{item.time}</span>}
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
                  </>
                ) : (
                  <>
                    <CheckCircle done={isItemDone(item.id)} onToggle={() => toggleItem(item.id)} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: isItemDone(item.id) ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: isItemDone(item.id) ? 'line-through' : 'none' }}>{item.title}</span>
                      {item.time && <span style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 8, fontFamily: 'Space Mono, monospace' }}>{item.time}</span>}
                    </div>
                    {!isToday && <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontStyle: 'italic' }}>template</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {editMode && showAdd && (
        <div className="card" style={{ marginTop: 12 }}>
          <input className="input-field" placeholder="Ritual name" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} autoFocus />
          <input className="input-field" style={{ marginTop: 8 }} placeholder="Time (optional, e.g. 7:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addItem}>Add</button>
            <button className="btn-ghost" onClick={() => { setShowAdd(false); setNewTitle(''); setNewTime('') }}>Cancel</button>
          </div>
        </div>
      )}

      {/* FAB */}
      {editMode && !showAdd && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  )
}
