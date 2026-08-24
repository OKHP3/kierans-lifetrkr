import { useState, useMemo } from 'react'
import { useApp, genId } from '../context/AppContext'
import { getTodayISO } from '../lib/date'
import type { TaskPriority } from '../types'

type SortKey = 'Priority' | 'Date Added' | 'Title'
const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, normal: 1, low: 2 }
const PRIORITY_COLORS: Record<TaskPriority, string> = { high: '#e07070', normal: 'var(--text-ghost)', low: 'var(--text-ghost)' }

export default function Someday() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('Priority')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const today = getTodayISO(state.settings.timezone)

  const backlogTasks = useMemo(() => {
    let tasks = state.tasks.filter(t => t.status === 'backlog')
    if (search.trim()) {
      const q = search.toLowerCase()
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q))
    }
    tasks = [...tasks].sort((a, b) => {
      if (sort === 'Priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sort === 'Title') return a.title.localeCompare(b.title)
      return b.createdAt.localeCompare(a.createdAt)
    })
    return tasks
  }, [state.tasks, search, sort])

  function addTask() {
    if (!newTitle.trim()) return
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: genId(),
        title: newTitle.trim(),
        notes: newNotes.trim() || undefined,
        status: 'backlog',
        priority: newPriority,
        createdAt: today,
        source: 'manual',
      },
    })
    setNewTitle('')
    setNewNotes('')
    setNewPriority('normal')
    setShowAdd(false)
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">Someday</h1>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-ghost)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          className="input-field"
          aria-label="Search someday tasks"
          style={{ paddingLeft: 34 }}
          placeholder="Search someday…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Sort pills + count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['Priority', 'Date Added', 'Title'] as SortKey[]).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{ padding: '4px 10px', borderRadius: 20, border: sort === s ? 'none' : '0.5px solid var(--border)', background: sort === s ? 'var(--surface-raised)' : 'transparent', color: sort === s ? 'var(--accent-amethyst)' : 'var(--text-ghost)', fontSize: 11, cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{backlogTasks.length} tasks</span>
      </div>

      {backlogTasks.length === 0 && !showAdd && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: '0 0 12px' }}>
            {search ? 'No results.' : 'Nothing queued for someday.'}
          </p>
          {!search && <button className="btn-primary" onClick={() => setShowAdd(true)}>Add to someday</button>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {backlogTasks.map(task => (
          <div key={task.id} className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: 'var(--text-ghost)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>○</span>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{task.title}</span>
                  {task.priority !== 'normal' && (
                    <span style={{ fontSize: 10, color: PRIORITY_COLORS[task.priority], border: `0.5px solid ${PRIORITY_COLORS[task.priority]}`, borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>{task.priority}</span>
                  )}
                </div>
                {task.notes && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '4px 0 0' }}>{task.notes}</p>}
              </div>
            </div>
            {expandedId === task.id && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingLeft: 24 }}>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { dispatch({ type: 'SET_TASK_STATUS', payload: { taskId: task.id, status: 'today' } }); setExpandedId(null) }}>→ Send to Today</button>
                <button className="btn-ghost" style={{ fontSize: 12, color: '#e07070' }} onClick={() => { dispatch({ type: 'DELETE_TASK', payload: task.id }); setExpandedId(null) }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Google Tasks — undated or future-due */}
      {state.isGoogleConnected && state.settings.showGoogleTasks && (
        <div style={{ marginTop: 20 }}>
          <p className="section-label">FROM GOOGLE TASKS</p>
          <div className="card">
            {state.googleTasks.filter(t => (!t.due || t.due > today) && t.status === 'needsAction').length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>No future Google Tasks.</p>
            ) : (
              state.googleTasks
                .filter(t => (!t.due || t.due > today) && t.status === 'needsAction')
                .map(gt => (
                  <div key={gt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '0.5px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-ghost)', fontSize: 14 }}>○</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{gt.title}</span>
                    {gt.due && (
                      <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{gt.due}</span>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => dispatch({
                        type: 'ADD_TASK',
                        payload: { id: genId(), title: gt.title, notes: gt.notes || undefined, status: 'backlog', priority: 'normal', createdAt: today, source: 'manual', googleTaskId: gt.id },
                      })}
                    >
                      + Add to Someday
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginTop: 12 }}>
          <input className="input-field" aria-label="Someday task title" placeholder="What's worth doing someday?" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} autoFocus />
          <input className="input-field" aria-label="Someday task notes" style={{ marginTop: 8 }} placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {(['high', 'normal', 'low'] as TaskPriority[]).map(p => (
              <button key={p} onClick={() => setNewPriority(p)} style={{ flex: 1, padding: '4px 0', borderRadius: 8, border: newPriority === p ? 'none' : '0.5px solid var(--border)', background: newPriority === p ? 'var(--surface-raised)' : 'transparent', color: newPriority === p ? 'var(--text-primary)' : 'var(--text-ghost)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addTask}>Add to Someday</button>
            <button className="btn-ghost" onClick={() => { setShowAdd(false); setNewTitle('') }}>Cancel</button>
          </div>
        </div>
      )}

      {!showAdd && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  )
}
