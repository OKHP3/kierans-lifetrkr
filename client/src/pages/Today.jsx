import React, { useState } from 'react'
import { useApp, todayKey } from '../context/AppContext.jsx'
import CheckCircle from '../components/CheckCircle.jsx'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

const PRIORITIES = ['High', 'Normal', 'Low']

function PriorityBadge({ priority }) {
  if (!priority || priority === 'Normal') return null
  return (
    <span className={priority === 'High' ? 'priority-high' : 'priority-low'}>
      {priority}
    </span>
  )
}

export default function Today() {
  const { state, dispatch } = useApp()
  const { toast, showToast } = useToast()

  const todayStr = todayKey()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('Normal')
  const [newNotes, setNewNotes] = useState('')

  const todayTasks = state.tasks.filter(t => t.status === 'Today' || t.status === 'Done')
  const active = todayTasks.filter(t => t.status === 'Today').sort((a, b) => {
    const pOrder = { High: 0, Normal: 1, Low: 2 }
    return (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1)
  })
  const done = todayTasks.filter(t => t.status === 'Done' && t.completedDate === todayStr)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    dispatch({
      type: 'ADD_TASK',
      task: {
        id: genId(),
        title: newTitle.trim(),
        notes: newNotes.trim(),
        priority: newPriority,
        status: 'Today',
        dueDate: todayStr,
        source: 'Manual',
        createdDate: todayStr,
      }
    })
    setNewTitle('')
    setNewNotes('')
    setNewPriority('Normal')
    setShowAdd(false)
    showToast('Task added')
  }

  const handleToggle = (id) => dispatch({ type: 'TOGGLE_TASK', taskId: id })
  const handleDemote = (id) => { dispatch({ type: 'DEMOTE_TASK', taskId: id }); showToast('Moved to Archive') }
  const handleDelete = (id) => { dispatch({ type: 'DELETE_TASK', taskId: id }); showToast('Task deleted') }

  return (
    <div className="page-content">
      <Toast message={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Today</h1>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
          {done.length}/{active.length + done.length} done
        </span>
      </div>

      {active.length === 0 && !showAdd && (
        <div className="card" style={{ color: 'var(--text-ghost)', fontSize: 13 }}>
          Nothing on your list. Tap + to add a task or promote one from Archive.
        </div>
      )}

      {active.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => handleToggle(task.id)}
          onDemote={() => handleDemote(task.id)}
          onDelete={() => handleDelete(task.id)}
        />
      ))}

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            style={{ marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {PRIORITIES.map(p => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: newPriority === p ? '1px solid var(--accent-amethyst)' : '1px solid var(--border)',
                  background: newPriority === p ? 'var(--surface-raised)' : 'transparent',
                  color: newPriority === p ? 'var(--accent-amethyst)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{ flex: 1, background: 'var(--accent-amethyst)', color: 'var(--bg)', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Add Task
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTitle(''); setNewNotes('') }}
              style={{ padding: '10px 16px', background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Done section */}
      {done.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: 24 }}>Done Today</div>
          {done.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
              <CheckCircle checked={true} onToggle={() => handleToggle(task.id)} />
              <span className="done-text" style={{ flex: 1, fontSize: 13 }}>{task.title}</span>
            </div>
          ))}
        </>
      )}

      <button className="fab" onClick={() => setShowAdd(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--bg)' }} strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

function TaskItem({ task, onToggle, onDemote, onDelete }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <CheckCircle checked={task.status === 'Done'} onToggle={onToggle} />
        <div style={{ flex: 1 }} onClick={() => setShowActions(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: task.status === 'Done' ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.notes && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.notes}</div>
          )}
        </div>
        <button
          onClick={() => setShowActions(v => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', padding: 2 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border-subtle)' }}>
          <button
            onClick={() => { onDemote(); setShowActions(false) }}
            style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface-raised)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
          >
            → Archive
          </button>
          <button
            onClick={() => { onDelete(); setShowActions(false) }}
            style={{ flex: 1, fontSize: 11, color: 'var(--accent-rose)', background: 'var(--accent-rose-subtle)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
