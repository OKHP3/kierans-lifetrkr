import { useState, useMemo, useEffect } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import { getTodayISO } from '../lib/date'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { fetchTaskLists, fetchTasks } from '../lib/googleTasks'
import type { TaskPriority } from '../types'

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, normal: 1, low: 2 }
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#e07070',
  normal: 'var(--text-ghost)',
  low: 'var(--text-ghost)',
}

export default function Today() {
  const { state, dispatch } = useApp()
  const { isConnected, getToken } = useGoogleAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)

  const today = getTodayISO(state.settings.timezone)
  const [googleError, setGoogleError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !state.settings.showGoogleTasks) return
    let cancelled = false
    async function loadGoogleTasks() {
      try {
        setGoogleError(null)
        const token = await getToken()
        const lists = await fetchTaskLists(token)
        if (cancelled) return
        dispatch({ type: 'SET_TASK_LISTS', payload: lists })
        const selected = state.settings.selectedTaskLists.length > 0
          ? state.settings.selectedTaskLists
          : lists.map(list => list.id)
        const taskGroups = await Promise.all(selected.map(listId => fetchTasks(token, listId)))
        if (!cancelled) dispatch({ type: 'SET_GOOGLE_TASKS', payload: taskGroups.flat() })
      } catch {
        if (!cancelled) setGoogleError('Google Tasks could not be loaded — tap to retry.')
      }
    }
    loadGoogleTasks()
    return () => { cancelled = true }
  }, [isConnected, state.settings.showGoogleTasks, state.settings.selectedTaskLists.join(','), getToken, dispatch])

  const activeTasks = useMemo(() =>
    state.tasks
      .filter(t => t.status === 'today')
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [state.tasks]
  )

  const doneTasks = useMemo(() =>
    state.tasks.filter(t => t.status === 'done' && t.completedAt === today),
    [state.tasks, today]
  )

  function addTask() {
    if (!newTitle.trim()) return
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: genId(),
        title: newTitle.trim(),
        notes: newNotes.trim() || undefined,
        status: 'today',
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
      <div style={{ marginBottom: 6 }}>
        <h1 className="page-title">Today</h1>
      </div>

      {/* My Tasks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p className="section-label" style={{ margin: 0 }}>MY TASKS</p>
        <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>
          {doneTasks.length}/{activeTasks.length + doneTasks.length} done
        </span>
      </div>
      {activeTasks.length === 0 && !showAdd ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: '0 0 12px' }}>Nothing on the list. Add something.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add task</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeTasks.map(task => (
            <div key={task.id} className="card" style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle
                  done={false}
                  onToggle={() => dispatch({ type: 'SET_TASK_STATUS', payload: { taskId: task.id, status: 'done' } })}
                />
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{task.title}</span>
                    {task.priority !== 'normal' && (
                      <span style={{ fontSize: 10, color: PRIORITY_COLORS[task.priority], border: `0.5px solid ${PRIORITY_COLORS[task.priority]}`, borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  {task.notes && <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '4px 0 0' }}>{task.notes}</p>}
                </div>
              </div>
              {expandedId === task.id && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingLeft: 34 }}>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { dispatch({ type: 'SET_TASK_STATUS', payload: { taskId: task.id, status: 'backlog' } }); setExpandedId(null) }}>→ Someday</button>
                  <button className="btn-ghost" style={{ fontSize: 12, color: '#e07070' }} onClick={() => { dispatch({ type: 'DELETE_TASK', payload: task.id }); setExpandedId(null) }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Google Tasks placeholder */}
      {state.isGoogleConnected && state.settings.showGoogleTasks && (
        <div style={{ marginTop: 20 }}>
          <p className="section-label">FROM GOOGLE TASKS</p>
          <div className="card">
            {googleError && <p style={{ fontSize: 12, color: '#e07070', margin: '0 0 8px' }}>{googleError}</p>}
            {state.googleTasks.filter(t => t.due?.startsWith(today) && t.status === 'needsAction').length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>No Google Tasks due today.</p>
            ) : (
              state.googleTasks
                .filter(t => t.due?.startsWith(today) && t.status === 'needsAction')
                .map(gt => (
                  <div key={gt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '0.5px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-ghost)', fontSize: 14 }}>○</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{gt.title}</span>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => dispatch({
                        type: 'ADD_TASK',
                          payload: { id: genId(), title: gt.title, notes: gt.notes || undefined, status: 'today', priority: 'normal', createdAt: getTodayISO(state.settings.timezone), source: 'manual', googleTaskId: gt.id },
                      })}
                    >
                      + Add to My List
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Done section */}
      {doneTasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setShowDone(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-ghost)', fontSize: 12, padding: '0 0 8px', fontFamily: 'Space Mono, monospace' }}
          >
            Done ({doneTasks.length}) {showDone ? '▴' : '▾'}
          </button>
          {showDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {doneTasks.map(task => (
                <div key={task.id} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle done={true} onToggle={() => dispatch({ type: 'SET_TASK_STATUS', payload: { taskId: task.id, status: 'today' } })} />
                  <span style={{ fontSize: 13, color: 'var(--text-ghost)', textDecoration: 'line-through' }}>{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginTop: 12 }}>
          <input className="input-field" aria-label="Task title" placeholder="What needs doing?" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} autoFocus />
          <input className="input-field" aria-label="Task notes" style={{ marginTop: 8 }} placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {(['high', 'normal', 'low'] as TaskPriority[]).map(p => (
              <button key={p} onClick={() => setNewPriority(p)} style={{ flex: 1, padding: '4px 0', borderRadius: 8, border: newPriority === p ? 'none' : '0.5px solid var(--border)', background: newPriority === p ? 'var(--surface-raised)' : 'transparent', color: newPriority === p ? 'var(--text-primary)' : 'var(--text-ghost)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addTask}>Add</button>
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
