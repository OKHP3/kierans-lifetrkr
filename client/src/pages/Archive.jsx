import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey } from '../utils.js'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

const PRIORITIES = ['High', 'Normal', 'Low']
const SORTS = ['Priority', 'Date Added', 'Title']

function PriorityBadge({ priority }) {
  if (!priority || priority === 'Normal') return null
  return (
    <span className={priority === 'High' ? 'priority-high' : 'priority-low'} style={{ marginLeft: 6 }}>
      {priority}
    </span>
  )
}

export default function Archive() {
  const { state, dispatch } = useApp()
  const { toast, showToast } = useToast()

  const todayStr = todayKey()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Priority')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newPriority, setNewPriority] = useState('Normal')

  const backlog = useMemo(() => {
    let items = state.tasks.filter(t => t.status === 'Backlog')
    if (search) items = items.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'Priority') {
      const pOrder = { High: 0, Normal: 1, Low: 2 }
      items = [...items].sort((a, b) => (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1))
    } else if (sort === 'Title') {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      items = [...items].sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''))
    }
    return items
  }, [state.tasks, search, sort])

  const handleAdd = () => {
    if (!newTitle.trim()) return
    dispatch({
      type: 'ADD_TASK',
      task: {
        id: genId(),
        title: newTitle.trim(),
        notes: newNotes.trim(),
        priority: newPriority,
        status: 'Backlog',
        dueDate: null,
        source: 'Manual',
        createdDate: todayStr,
      }
    })
    setNewTitle('')
    setNewNotes('')
    setNewPriority('Normal')
    setShowAdd(false)
    showToast('Added to Archive')
  }

  const handlePromote = (id) => { dispatch({ type: 'PROMOTE_TASK', taskId: id }); showToast('Moved to Today') }
  const handleDelete = (id) => { dispatch({ type: 'DELETE_TASK', taskId: id }); showToast('Deleted') }

  return (
    <div className="page-content">
      <Toast message={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Archive</h1>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{backlog.length} items</span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {SORTS.map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 8,
              border: sort === s ? '1px solid var(--accent-amethyst)' : '1px solid var(--border)',
              background: sort === s ? 'var(--surface-raised)' : 'transparent',
              color: sort === s ? 'var(--accent-amethyst)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {backlog.length === 0 && !showAdd && (
        <div className="card" style={{ color: 'var(--text-ghost)', fontSize: 13 }}>
          {search ? 'No items match your search.' : 'Your archive is empty. Add items you want to do someday.'}
        </div>
      )}

      {backlog.map(task => (
        <ArchiveItem
          key={task.id}
          task={task}
          onPromote={() => handlePromote(task.id)}
          onDelete={() => handleDelete(task.id)}
        />
      ))}

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <input
            type="text"
            placeholder="What do you want to do someday?"
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
              Add to Archive
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

      <button className="fab" onClick={() => setShowAdd(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--bg)' }} strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

function ArchiveItem({ task, onPromote, onDelete }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="card">
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
        onClick={() => setShowActions(v => !v)}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--border)', marginTop: 4, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {task.title}
            <PriorityBadge priority={task.priority} />
            {task.source === 'Promoted' && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '1px 6px', borderRadius: 8 }}>promoted</span>
            )}
          </div>
          {task.notes && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.notes}</div>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-ghost)', flexShrink: 0 }}>
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border-subtle)' }}>
          <button
            onClick={() => { onPromote(); setShowActions(false) }}
            style={{ flex: 1, fontSize: 11, color: 'var(--accent-sage)', background: 'var(--accent-sage-subtle)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
          >
            → Send to Today
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
