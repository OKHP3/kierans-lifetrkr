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
import type { Habit, RecurrenceRule } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const result: { label: string; done: boolean }[] = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const tmp = new Date(d)
    tmp.setDate(d.getDate() - i)
    const dateStr = tmp.toISOString().split('T')[0]
    result.push({
      label: tmp.toLocaleDateString('en-US', { weekday: 'narrow' }),
      done: completions.some(c => c.habitId === habitId && c.date === dateStr),
    })
  }
  return result
}

type SortKey = 'name' | 'progress' | 'next-due' | 'category'

const DOW_NUM: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
}

function computeNextDue(habit: Habit, completions: { habitId: string; date: string }[]): string {
  const rec = habit.recurrence
  if (!rec || rec.frequency === 'none') return '9999-12-31'

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const todayStr = todayDate.toISOString().split('T')[0]

  const habDates = completions
    .filter(c => c.habitId === habit.id)
    .map(c => c.date)
    .sort()
  const lastDone = habDates.length > 0 ? habDates[habDates.length - 1] : null

  // Helper: advance a Date by the interval and return its ISO date string
  function advance(base: Date): string {
    const d = new Date(base)
    const n = rec.interval || 1
    if (rec.frequency === 'daily') d.setDate(d.getDate() + n)
    else if (rec.frequency === 'weekly') d.setDate(d.getDate() + 7 * n)
    else if (rec.frequency === 'monthly') d.setMonth(d.getMonth() + n)
    else if (rec.frequency === 'yearly') d.setFullYear(d.getFullYear() + n)
    return d.toISOString().split('T')[0]
  }

  // If done today, next due is one interval from today
  if (lastDone === todayStr) return advance(todayDate)

  // For weekly with specific days of week, find the next scheduled day
  if (rec.frequency === 'weekly' && rec.daysOfWeek && rec.daysOfWeek.length > 0) {
    const scheduled = new Set(rec.daysOfWeek.map(d => DOW_NUM[d] ?? -1))
    for (let i = 0; i <= 7; i++) {
      const check = new Date(todayDate)
      check.setDate(todayDate.getDate() + i)
      if (scheduled.has(check.getDay())) return check.toISOString().split('T')[0]
    }
  }

  // Compute next due from last completion (or start date / createdAt)
  const baseStr = lastDone ?? rec.startDate ?? habit.createdAt ?? todayStr
  const base = new Date(baseStr)
  base.setHours(0, 0, 0, 0)

  let next = new Date(base)
  // Advance until we get a date >= today
  let guard = 0
  while (next < todayDate && guard < 1000) {
    next = new Date(next)
    const nStr = advance(next)
    next = new Date(nStr)
    guard++
  }

  const nextStr = next.toISOString().split('T')[0]
  return nextStr < todayStr ? todayStr : nextStr
}

type HabitForm = {
  name: string
  desc: string
  categoryId?: string
  tags: string[]
  recurrence: RecurrenceRule
  showDetails: boolean
  showRecurrence: boolean
}

function freshForm(): HabitForm {
  return {
    name: '', desc: '', categoryId: undefined, tags: [],
    recurrence: { ...makeDefaultRecurrence(), frequency: 'daily' },
    showDetails: false, showRecurrence: false,
  }
}

function habitToForm(h: Habit): HabitForm {
  return {
    name: h.name,
    desc: h.description ?? '',
    categoryId: h.categoryId,
    tags: h.tags ?? [],
    recurrence: h.recurrence ?? { ...makeDefaultRecurrence(), frequency: 'daily' },
    showDetails: !!(h.categoryId || (h.tags ?? []).length > 0 || h.description),
    showRecurrence: !!h.recurrence && h.recurrence.frequency !== 'none',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Habits() {
  const { state, dispatch } = useApp()
  const today = getTodayISO()

  // Add / edit forms
  const [addForm, setAddForm] = useState<HabitForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<HabitForm | null>(null)

  // Filter & sort state
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [freqFilter, setFreqFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('name')

  const activeHabits = state.habits.filter(h => h.active)
  const doneToday = activeHabits.filter(h =>
    state.habitCompletions.some(c => c.habitId === h.id && c.date === today)
  ).length

  // Derive filter options from active habits
  const usedCategoryIds = [...new Set(activeHabits.filter(h => h.categoryId).map(h => h.categoryId!))]
  const allTags = [...new Set(activeHabits.flatMap(h => h.tags ?? []))]
  const allHabitTags = [...new Set(state.habits.flatMap(h => h.tags ?? []))]
  const usedFreqs = [...new Set(
    activeHabits.filter(h => h.recurrence && h.recurrence.frequency !== 'none').map(h => h.recurrence!.frequency)
  )]

  // Apply filters
  let visibleHabits = [...activeHabits]
  if (statusFilter === 'done')
    visibleHabits = visibleHabits.filter(h => state.habitCompletions.some(c => c.habitId === h.id && c.date === today))
  if (statusFilter === 'not-done')
    visibleHabits = visibleHabits.filter(h => !state.habitCompletions.some(c => c.habitId === h.id && c.date === today))
  if (categoryFilter)
    visibleHabits = visibleHabits.filter(h => h.categoryId === categoryFilter)
  if (tagFilter)
    visibleHabits = visibleHabits.filter(h => (h.tags ?? []).includes(tagFilter!))
  if (freqFilter)
    visibleHabits = visibleHabits.filter(h => h.recurrence?.frequency === freqFilter)

  // Apply sort
  if (sortBy === 'name')
    visibleHabits = [...visibleHabits].sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy === 'progress')
    visibleHabits = [...visibleHabits].sort((a, b) => getStreak(b.id, state.habitCompletions) - getStreak(a.id, state.habitCompletions))
  else if (sortBy === 'next-due')
    visibleHabits = [...visibleHabits].sort((a, b) => {
      const da = computeNextDue(a, state.habitCompletions)
      const db = computeNextDue(b, state.habitCompletions)
      return da !== db ? da.localeCompare(db) : a.name.localeCompare(b.name)
    })
  else if (sortBy === 'category')
    visibleHabits = [...visibleHabits].sort((a, b) => (a.categoryId ?? 'zzz').localeCompare(b.categoryId ?? 'zzz'))

  // Form helpers
  function patchAdd(patch: Partial<HabitForm>) { setAddForm(f => f ? { ...f, ...patch } : null) }
  function saveAdd() {
    if (!addForm || !addForm.name.trim()) return
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: genId(), name: addForm.name.trim(),
        description: addForm.desc.trim() || undefined,
        categoryId: addForm.categoryId, tags: addForm.tags,
        recurrence: addForm.recurrence,
        active: true, createdAt: today, updatedAt: today,
      },
    })
    setAddForm(null)
  }

  function startEdit(habit: Habit) { setEditingId(habit.id); setEditForm(habitToForm(habit)) }
  function cancelEdit() { setEditingId(null); setEditForm(null) }
  function patchEdit(patch: Partial<HabitForm>) { setEditForm(f => f ? { ...f, ...patch } : null) }
  function saveEdit(habit: Habit) {
    if (!editForm) return
    dispatch({
      type: 'UPDATE_HABIT',
      payload: {
        ...habit,
        name: editForm.name.trim() || habit.name,
        description: editForm.desc.trim() || undefined,
        categoryId: editForm.categoryId, tags: editForm.tags,
        recurrence: editForm.recurrence, updatedAt: today,
      },
    })
    cancelEdit()
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 6 }}>
        <h1 className="page-title">Habits</h1>
      </div>

      {/* Status filter */}
      <FilterBar
        chips={[
          { label: 'All', value: 'all', active: statusFilter === 'all' },
          { label: 'Done today', value: 'done', active: statusFilter === 'done' },
          { label: 'Not done', value: 'not-done', active: statusFilter === 'not-done' },
        ]}
        onChange={(val) => setStatusFilter(val)}
        className="mb-2"
      />

      {/* Category filter */}
      {usedCategoryIds.length > 0 && (
        <FilterBar
          chips={usedCategoryIds.map(id => {
            const cat = DEFAULT_CATEGORIES.find(c => c.id === id)
            return { label: `${cat?.emoji ?? ''} ${cat?.label ?? id}`, value: id, active: categoryFilter === id }
          })}
          onChange={(val, wantsActive) => setCategoryFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Tag filter */}
      {allTags.length > 0 && (
        <FilterBar
          chips={allTags.map(tag => ({ label: tag, value: tag, active: tagFilter === tag }))}
          onChange={(val, wantsActive) => setTagFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Frequency filter */}
      {usedFreqs.length > 0 && (
        <FilterBar
          chips={usedFreqs.map(f => ({ label: f, value: f, active: freqFilter === f }))}
          onChange={(val, wantsActive) => setFreqFilter(wantsActive ? val : null)}
          className="mb-2"
        />
      )}

      {/* Sort + progress counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <FilterBar
          chips={[
            { label: 'name', value: 'name', active: sortBy === 'name' },
            { label: 'progress', value: 'progress', active: sortBy === 'progress' },
            { label: 'next due', value: 'next-due', active: sortBy === 'next-due' },
            { label: 'category', value: 'category', active: sortBy === 'category' },
          ]}
          onChange={(val) => setSortBy(val as SortKey)}
        />
        <span style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0, marginLeft: 8 }}>
          {doneToday}/{activeHabits.length} today
        </span>
      </div>

      {/* Empty state */}
      {activeHabits.length === 0 && !addForm && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: '0 0 12px' }}>No habits yet.</p>
          <button className="btn-primary" onClick={() => setAddForm(freshForm())}>Add your first habit</button>
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
          const isEditing = editingId === habit.id

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
                      <span style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: done ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                        {habit.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {streak > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--accent-amethyst)', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MoonIcon /> {streak}
                        </span>
                      )}
                      <button onClick={() => isEditing ? cancelEdit() : startEdit(habit)} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 11, padding: '1px 4px' }}>
                        {isEditing ? 'cancel' : 'edit'}
                      </button>
                      <button onClick={() => dispatch({ type: 'REMOVE_HABIT', payload: habit.id })} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }}>×</button>
                    </div>
                  </div>

                  {!isEditing && habit.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{habit.description}</p>
                  )}
                  {!isEditing && (habit.tags ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                      {(habit.tags ?? []).map(tag => (
                        <span key={tag} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 12, background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      {last7.map((day, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: day.done ? dotColor : 'var(--surface-raised)', border: day.done ? 'none' : '0.5px solid var(--border)' }} />
                          <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{day.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Inline edit form */}
              {isEditing && editForm && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--border)' }}>
                  <input className="input-field" value={editForm.name} onChange={e => patchEdit({ name: e.target.value })} placeholder="Habit name" />
                  <div style={{ marginTop: 8 }}>
                    <DescriptionField value={editForm.desc} onChange={desc => patchEdit({ desc })} rows={2} />
                  </div>
                  <button
                    type="button"
                    onClick={() => patchEdit({ showDetails: !editForm.showDetails })}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span style={{ fontSize: 10 }}>{editForm.showDetails ? '▾' : '▸'}</span> Category &amp; tags
                  </button>
                  {editForm.showDetails && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Category</p>
                      <CategoryPicker categoryId={editForm.categoryId} onChange={categoryId => patchEdit({ categoryId })} />
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '14px 0 6px' }}>Tags</p>
                      <TagInput tags={editForm.tags} onChange={tags => patchEdit({ tags })} suggestions={allHabitTags} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => patchEdit({ showRecurrence: !editForm.showRecurrence })}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span style={{ fontSize: 10 }}>{editForm.showRecurrence ? '▾' : '▸'}</span> Recurrence
                    {!editForm.showRecurrence && editForm.recurrence.frequency !== 'none' && (
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>({editForm.recurrence.frequency})</span>
                    )}
                  </button>
                  {editForm.showRecurrence && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                      <RecurrenceEditor value={editForm.recurrence} onChange={recurrence => patchEdit({ recurrence })} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => saveEdit(habit)}>Save</button>
                    <button className="btn-ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {addForm && (
        <div className="card" style={{ marginTop: 12 }}>
          <input
            className="input-field"
            placeholder="Habit name"
            value={addForm.name}
            onChange={e => patchAdd({ name: e.target.value })}
            autoFocus
          />
          <div style={{ marginTop: 8 }}>
            <DescriptionField value={addForm.desc} onChange={desc => patchAdd({ desc })} rows={2} />
          </div>
          <button
            type="button"
            onClick={() => patchAdd({ showDetails: !addForm.showDetails })}
            style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 10 }}>{addForm.showDetails ? '▾' : '▸'}</span> Category &amp; tags
          </button>
          {addForm.showDetails && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Category</p>
              <CategoryPicker categoryId={addForm.categoryId} onChange={categoryId => patchAdd({ categoryId })} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '14px 0 6px' }}>Tags</p>
              <TagInput tags={addForm.tags} onChange={tags => patchAdd({ tags })} suggestions={allHabitTags} />
            </div>
          )}
          <button
            type="button"
            onClick={() => patchAdd({ showRecurrence: !addForm.showRecurrence })}
            style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 10 }}>{addForm.showRecurrence ? '▾' : '▸'}</span> Recurrence
            {!addForm.showRecurrence && addForm.recurrence.frequency !== 'none' && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>({addForm.recurrence.frequency})</span>
            )}
          </button>
          {addForm.showRecurrence && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
              <RecurrenceEditor value={addForm.recurrence} onChange={recurrence => patchAdd({ recurrence })} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={saveAdd}>Add habit</button>
            <button className="btn-ghost" onClick={() => setAddForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {!addForm && activeHabits.length > 0 && (
        <button className="fab" onClick={() => setAddForm(freshForm())}>+</button>
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
