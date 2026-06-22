import { useState } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import FilterBar from '../components/FilterBar'
import CategoryPicker from '../components/CategoryPicker'
import TagInput from '../components/TagInput'
import DescriptionField from '../components/DescriptionField'
import RecurrenceEditor from '../components/RecurrenceEditor'
import { getTodayISO } from '../lib/date'
import { DEFAULT_CATEGORIES, makeDefaultRecurrence } from '../constants'
import type { RecurrenceRule } from '../types'

function getStreak(habitId: string, completions: { habitId: string; date: string }[]): number {
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

function makeNewRecurrence(): RecurrenceRule {
  return { ...makeDefaultRecurrence(), frequency: 'daily' }
}

export default function Habits() {
  const { state, dispatch } = useApp()
  const today = getTodayISO()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategoryId, setNewCategoryId] = useState<string | undefined>()
  const [newTags, setNewTags] = useState<string[]>([])
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceRule>(makeNewRecurrence())
  const [showDetails, setShowDetails] = useState(false)
  const [showRecurrence, setShowRecurrence] = useState(false)

  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'category'>('name')

  const activeHabits = state.habits.filter(h => h.active)
  const doneToday = activeHabits.filter(h =>
    state.habitCompletions.some(c => c.habitId === h.id && c.date === today)
  ).length

  const usedCategoryIds = [...new Set(activeHabits.filter(h => h.categoryId).map(h => h.categoryId!))]
  const allHabitTags = [...new Set(state.habits.flatMap(h => h.tags ?? []))]

  const filterChips = [
    { label: 'All', value: 'all', active: activeFilter === 'all' },
    { label: 'Done today', value: 'done', active: activeFilter === 'done' },
    { label: 'Not done', value: 'not-done', active: activeFilter === 'not-done' },
    ...usedCategoryIds.map(id => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === id)
      return { label: `${cat?.emoji ?? ''} ${cat?.label ?? id}`, value: id, active: activeFilter === id }
    }),
  ]

  let visibleHabits = [...activeHabits]
  if (activeFilter === 'done') {
    visibleHabits = visibleHabits.filter(h => state.habitCompletions.some(c => c.habitId === h.id && c.date === today))
  } else if (activeFilter === 'not-done') {
    visibleHabits = visibleHabits.filter(h => !state.habitCompletions.some(c => c.habitId === h.id && c.date === today))
  } else if (activeFilter !== 'all') {
    visibleHabits = visibleHabits.filter(h => h.categoryId === activeFilter)
  }

  if (sortBy === 'name') {
    visibleHabits = visibleHabits.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'streak') {
    visibleHabits = visibleHabits.sort((a, b) => getStreak(b.id, state.habitCompletions) - getStreak(a.id, state.habitCompletions))
  } else if (sortBy === 'category') {
    visibleHabits = visibleHabits.sort((a, b) => (a.categoryId ?? 'zzz').localeCompare(b.categoryId ?? 'zzz'))
  }

  function resetForm() {
    setNewName('')
    setNewDesc('')
    setNewCategoryId(undefined)
    setNewTags([])
    setNewRecurrence(makeNewRecurrence())
    setShowDetails(false)
    setShowRecurrence(false)
  }

  function addHabit() {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: genId(),
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        categoryId: newCategoryId,
        tags: newTags,
        recurrence: newRecurrence,
        active: true,
        createdAt: today,
        updatedAt: today,
      },
    })
    resetForm()
    setShowAdd(false)
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 className="page-title">Habits</h1>
        <span style={{ fontSize: 12, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>
          {doneToday}/{activeHabits.length} today
        </span>
      </div>

      <FilterBar chips={filterChips} onChange={(val) => setActiveFilter(val)} className="mb-3" />

      {/* Sort row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>Sort:</span>
        {(['name', 'streak', 'category'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 12,
              background: sortBy === s ? 'var(--surface-raised)' : 'transparent',
              border: `0.5px solid ${sortBy === s ? 'var(--accent-amethyst)' : 'var(--border)'}`,
              color: sortBy === s ? 'var(--accent-amethyst)' : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'Space Mono, monospace',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {activeHabits.length === 0 && !showAdd && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: '0 0 12px' }}>No habits yet.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add your first habit</button>
        </div>
      )}

      {/* Habits list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleHabits.map(habit => {
          const done = state.habitCompletions.some(c => c.habitId === habit.id && c.date === today)
          const streak = getStreak(habit.id, state.habitCompletions)
          const last7 = getLast7(habit.id, state.habitCompletions)
          const cat = habit.categoryId ? DEFAULT_CATEGORIES.find(c => c.id === habit.categoryId) : undefined
          const dotColor = habit.colorTag ?? 'var(--accent-amethyst)'
          return (
            <div key={habit.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckCircle
                  done={done}
                  onToggle={() => dispatch({ type: 'TOGGLE_HABIT', payload: { habitId: habit.id, date: today } })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                      {cat && <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.emoji}</span>}
                      <span style={{ fontSize: 15, color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {habit.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {streak > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MoonIcon /> {streak}
                        </span>
                      )}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_HABIT', payload: habit.id })}
                        style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }}
                      >×</button>
                    </div>
                  </div>

                  {habit.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{habit.description}</p>
                  )}

                  {(habit.tags ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                      {(habit.tags ?? []).map(tag => (
                        <span key={tag} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 12, background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    {last7.map((day, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: day.done ? dotColor : 'var(--surface-raised)',
                          border: day.done ? 'none' : '0.5px solid var(--border)',
                        }} />
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
          <input
            className="input-field"
            placeholder="Habit name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !showDetails && !showRecurrence && addHabit()}
            autoFocus
          />

          <div style={{ marginTop: 8 }}>
            <DescriptionField value={newDesc} onChange={setNewDesc} rows={2} />
          </div>

          {/* Category & tags section */}
          <button
            type="button"
            onClick={() => setShowDetails(d => !d)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 10 }}>{showDetails ? '▾' : '▸'}</span> Category &amp; tags
          </button>

          {showDetails && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Category</p>
              <CategoryPicker categoryId={newCategoryId} onChange={setNewCategoryId} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '14px 0 6px' }}>Tags</p>
              <TagInput tags={newTags} onChange={setNewTags} suggestions={allHabitTags} />
            </div>
          )}

          {/* Recurrence section */}
          <button
            type="button"
            onClick={() => setShowRecurrence(r => !r)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 10 }}>{showRecurrence ? '▾' : '▸'}</span> Recurrence
            {!showRecurrence && newRecurrence.frequency !== 'none' && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>({newRecurrence.frequency})</span>
            )}
          </button>

          {showRecurrence && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
              <RecurrenceEditor value={newRecurrence} onChange={setNewRecurrence} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addHabit}>Add habit</button>
            <button className="btn-ghost" onClick={() => { setShowAdd(false); resetForm() }}>Cancel</button>
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
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
