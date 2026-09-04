import { useState, useEffect } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import FilterBar from '../components/FilterBar'
import CategoryPicker from '../components/CategoryPicker'
import TagInput from '../components/TagInput'
import DescriptionField from '../components/DescriptionField'
import RecurrenceEditor from '../components/RecurrenceEditor'
import { getTodayISO, getDayOfWeek, routineItemOccursOnDate } from '../lib/date'
import { DAYS_OF_WEEK, DAYS_SHORT, DEFAULT_CATEGORIES, makeDefaultRecurrence } from '../constants'
import type { RoutineDayOfWeek, RecurrenceRule, RoutineItem } from '../types'

const DAY_NUM: Record<RoutineDayOfWeek, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
}

type SortKey = 'default' | 'title' | 'next-occ' | 'category'

export default function Rituals() {
  const { state, dispatch } = useApp()
  const todayFull = getDayOfWeek(state.settings.timezone)
  const today = getTodayISO(state.settings.timezone)
  const [selectedDay, setSelectedDay] = useState<RoutineDayOfWeek>(todayFull)
  const [editMode, setEditMode] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newOptional, setNewOptional] = useState(false)
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceRule | undefined>()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Filter & sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [freqFilter, setFreqFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('default')

  // Metadata editor state — initialized fresh each time Details opens
  const [showMeta, setShowMeta] = useState(false)
  const [metaDesc, setMetaDesc] = useState('')
  const [metaCategoryId, setMetaCategoryId] = useState<string | undefined>()
  const [metaTags, setMetaTags] = useState<string[]>([])
  const [metaRecurrence, setMetaRecurrence] = useState<RecurrenceRule>(makeDefaultRecurrence(today))

  const isToday = selectedDay === todayFull
  const template = state.routineTemplates.find(t => t.dayOfWeek === selectedDay)
  const completion = state.routineCompletions.find(
    c => c.routineTemplateId === template?.id && c.date === today
  )
  const dueItems = template
    ? template.items.filter(item => routineItemOccursOnDate(template, item, today))
    : []
  const visibleItems = editMode || !isToday ? (template?.items ?? []) : dueItems
  const isItemDone = (id: string) => completion?.completedItemIds.includes(id) ?? false
  const doneCount = dueItems.filter(i => isItemDone(i.id)).length
  const templateCategory = template?.categoryId
    ? DEFAULT_CATEGORIES.find(c => c.id === template.categoryId)
    : undefined

  // Close the panel (not re-init) when day changes — user must re-open to see the new day's data
  useEffect(() => { setShowMeta(false) }, [selectedDay])
  useEffect(() => { setSelectedDay(todayFull) }, [state.settings.timezone, todayFull])

  // Initialize form from current template data when the panel opens
  function openMeta() {
    if (!template) return
    setMetaDesc(template.description ?? '')
    setMetaCategoryId(template.categoryId)
    setMetaTags(template.tags ?? [])
    setMetaRecurrence(template.recurrence ?? makeDefaultRecurrence(today))
    setShowMeta(true)
  }

  // Derive unique filter options
  const usedCategoryIds = [...new Set(state.routineTemplates.filter(t => t.categoryId).map(t => t.categoryId!))]
  const allTemplateTags = [...new Set(state.routineTemplates.flatMap(t => t.tags ?? []))]
  const usedFreqs = [...new Set(
    state.routineTemplates
      .filter(t => t.recurrence && t.recurrence.frequency !== 'none')
      .map(t => t.recurrence!.frequency)
  )]

  // Build sorted + filtered day list
  let filteredDays = ([...DAYS_OF_WEEK] as RoutineDayOfWeek[]).filter(day => {
    const t = state.routineTemplates.find(t2 => t2.dayOfWeek === day)
    if (statusFilter === 'active' && (t?.items?.length ?? 0) === 0) return false
    if (statusFilter === 'inactive' && (t?.items?.length ?? 0) > 0) return false
    if (categoryFilter && t?.categoryId !== categoryFilter) return false
    if (tagFilter && !(t?.tags ?? []).includes(tagFilter)) return false
    if (freqFilter && t?.recurrence?.frequency !== freqFilter) return false
    return true
  })

  const todayNum = DAY_NUM[todayFull]
  if (sortBy === 'title') {
    filteredDays = [...filteredDays].sort((a, b) => a.localeCompare(b))
  } else if (sortBy === 'next-occ') {
    filteredDays = [...filteredDays].sort((a, b) => {
      return ((DAY_NUM[a] - todayNum + 7) % 7) - ((DAY_NUM[b] - todayNum + 7) % 7)
    })
  } else if (sortBy === 'category') {
    filteredDays = [...filteredDays].sort((a, b) => {
      const ta = state.routineTemplates.find(t => t.dayOfWeek === a)
      const tb = state.routineTemplates.find(t => t.dayOfWeek === b)
      return (ta?.categoryId ?? 'zzz').localeCompare(tb?.categoryId ?? 'zzz')
    })
  }

  function saveMeta() {
    if (!template) return
    dispatch({
      type: 'UPDATE_ROUTINE_TEMPLATE',
      payload: {
        id: template.id,
        description: metaDesc.trim() || undefined,
        categoryId: metaCategoryId,
        tags: metaTags,
        recurrence: metaRecurrence,
      },
    })
    setShowMeta(false)
  }

  function addItem() {
    if (!newTitle.trim() || !template) return
    dispatch({
      type: 'ADD_ROUTINE_ITEM',
      payload: {
        templateId: template.id,
        item: {
          id: genId(),
          title: newTitle.trim(),
          time: newTime.trim() || undefined,
          description: newDescription.trim() || undefined,
          optional: newOptional || undefined,
          recurrence: newRecurrence,
          sortOrder: template.items.length,
        },
      },
    })
    setNewTitle('')
    setNewTime('')
    setNewDescription('')
    setNewOptional(false)
    setNewRecurrence(undefined)
    setShowAdd(false)
  }

  function removeItem(itemId: string) {
    if (!template) return
    dispatch({ type: 'REMOVE_ROUTINE_ITEM', payload: { templateId: template.id, itemId } })
    if (editingItemId === itemId) setEditingItemId(null)
  }

  function updateItem(item: RoutineItem, patch: Partial<RoutineItem>) {
    if (!template) return
    dispatch({ type: 'UPDATE_ROUTINE_ITEM', payload: { templateId: template.id, item: { ...item, ...patch } } })
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    if (!template) return
    const index = template.items.findIndex(item => item.id === itemId)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= template.items.length) return
    const items = [...template.items]
    ;[items[index], items[targetIndex]] = [items[targetIndex], items[index]]
    dispatch({
      type: 'REORDER_ROUTINE',
      payload: {
        templateId: template.id,
        items: items.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })),
      },
    })
  }

  function toggleItem(itemId: string) {
    const item = template?.items.find(candidate => candidate.id === itemId)
    if (!template || !isToday || !item || !routineItemOccursOnDate(template, item, today)) return
    dispatch({ type: 'TOGGLE_ROUTINE_ITEM', payload: { templateId: template.id, itemId, date: today } })
  }

  function resetNewItemForm() {
    setShowAdd(false)
    setNewTitle('')
    setNewTime('')
    setNewDescription('')
    setNewOptional(false)
    setNewRecurrence(undefined)
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title">Rituals</h1>
      </div>

      {/* Status filter */}
      <FilterBar
        chips={[
          { label: 'All', value: 'all', active: statusFilter === 'all' },
          { label: 'Active', value: 'active', active: statusFilter === 'active' },
          { label: 'Empty', value: 'inactive', active: statusFilter === 'inactive' },
        ]}
        onChange={(val) => setStatusFilter(val as typeof statusFilter)}
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
      {allTemplateTags.length > 0 && (
        <FilterBar
          chips={allTemplateTags.map(tag => ({ label: tag, value: tag, active: tagFilter === tag }))}
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

      {/* Sort */}
      <FilterBar
        chips={[
          { label: 'day ↕', value: 'default', active: sortBy === 'default' },
          { label: 'name', value: 'title', active: sortBy === 'title' },
          { label: 'next', value: 'next-occ', active: sortBy === 'next-occ' },
          { label: 'category', value: 'category', active: sortBy === 'category' },
        ]}
        onChange={(val) => setSortBy(val as SortKey)}
        className="mb-4"
      />

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {filteredDays.map(day => {
          const idx = (DAYS_OF_WEEK as readonly string[]).indexOf(day)
          const isSelected = selectedDay === day
          const isCurrentDay = day === todayFull
          const t = state.routineTemplates.find(t2 => t2.dayOfWeek === day)
          const emoji = t?.categoryId ? (DEFAULT_CATEGORIES.find(c => c.id === t.categoryId)?.emoji ?? '') : ''
          return (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setEditMode(false); setShowAdd(false); setEditingItemId(null) }}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 20,
                border: isSelected ? 'none' : '0.5px solid var(--border)',
                background: isSelected ? 'var(--accent-amethyst)' : 'transparent',
                color: isSelected ? 'var(--bg)' : isCurrentDay ? 'var(--accent-amethyst)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: isSelected ? 500 : 400, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              {emoji && <span style={{ fontSize: 10 }}>{emoji}</span>}
              {DAYS_SHORT[idx]}
            </button>
          )
        })}
      </div>

      {/* Template metadata bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
        {templateCategory && <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1 }}>{templateCategory.emoji}</span>}
        <div style={{ flex: 1 }}>
          {template?.description && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{template.description}</p>
          )}
          {(template?.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {(template?.tags ?? []).map(tag => (
                <span key={tag} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 12, background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            className="btn-ghost"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => { setEditMode(e => !e); setShowAdd(false); setShowMeta(false) }}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => showMeta ? setShowMeta(false) : openMeta()}
          >
            {showMeta ? 'Close' : 'Details'}
          </button>
        </div>
      </div>

      {/* Metadata edit panel */}
      {showMeta && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', margin: '0 0 12px' }}>
            {selectedDay} ritual details
          </p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Description</p>
            <DescriptionField value={metaDesc} onChange={setMetaDesc} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Category</p>
            <CategoryPicker categoryId={metaCategoryId} onChange={setMetaCategoryId} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Tags</p>
            <TagInput tags={metaTags} onChange={setMetaTags} suggestions={allTemplateTags} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Recurrence</p>
            <RecurrenceEditor value={metaRecurrence} onChange={setMetaRecurrence} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={saveMeta}>Save details</button>
        </div>
      )}

      {/* Progress */}
      {dueItems.length > 0 && isToday && (
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
          {doneCount}/{dueItems.length} complete
        </p>
      )}

      {/* Items */}
      <div className="card">
        {!template || template.items.length === 0 || (!editMode && isToday && visibleItems.length === 0) ? (
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0, padding: '4px 0' }}>
            {template && template.items.length > 0 && isToday
              ? 'No ritual items are scheduled today.'
              : `No rituals for ${selectedDay}.`}{' '}
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Add some →
              </button>
            )}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleItems.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editMode ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-ghost)" strokeWidth="1.5">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    <button className="btn-ghost" aria-label={`${editingItemId === item.id ? 'Close' : 'Edit'} ${item.title}`} style={{ fontSize: 11, padding: '3px 6px' }} onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}>
                      {editingItemId === item.id ? 'done' : 'edit'}
                    </button>
                    <button className="btn-ghost" aria-label={`Move ${item.title} up`} disabled={index === 0} style={{ fontSize: 14, padding: '3px 6px' }} onClick={() => moveItem(item.id, -1)}>↑</button>
                    <button className="btn-ghost" aria-label={`Move ${item.title} down`} disabled={index === template.items.length - 1} style={{ fontSize: 14, padding: '3px 6px' }} onClick={() => moveItem(item.id, 1)}>↓</button>
                    <button onClick={() => removeItem(item.id)} aria-label={`Delete ${item.title}`} style={{ background: 'none', border: 'none', color: 'var(--text-ghost)', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
                  </>
                ) : (
                  <>
                    <CheckCircle done={isItemDone(item.id)} onToggle={() => toggleItem(item.id)} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: isItemDone(item.id) ? 'var(--text-ghost)' : 'var(--text-primary)', textDecoration: isItemDone(item.id) ? 'line-through' : 'none' }}>
                        {item.title} {item.optional && <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontStyle: 'italic' }}>(optional)</span>}
                      </span>
                      {item.time && <span style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 8, fontFamily: 'Space Mono, monospace' }}>{item.time}</span>}
                      {item.description && <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '3px 0 0' }}>{item.description}</p>}
                    </div>
                    {!isToday && <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontStyle: 'italic' }}>template</span>}
                  </>
                )}
                {editMode && editingItemId === item.id && (
                  <div style={{ margin: '8px 0 0 26px', display: 'grid', gap: 8 }}>
                    <input className="input-field" aria-label={`${item.title} name`} value={item.title} onChange={event => updateItem(item, { title: event.target.value })} />
                    <input className="input-field" aria-label={`${item.title} time`} placeholder="Time (optional, e.g. 7:00 AM)" value={item.time ?? ''} onChange={event => updateItem(item, { time: event.target.value.trim() || undefined })} />
                    <textarea className="input-field" aria-label={`${item.title} description`} rows={2} placeholder="Description (optional)" value={item.description ?? ''} onChange={event => updateItem(item, { description: event.target.value || undefined })} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <input type="checkbox" aria-label={`Mark ${item.title} as optional`} checked={item.optional ?? false} onChange={event => updateItem(item, { optional: event.target.checked || undefined })} />
                      Optional ritual item
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        aria-label={`Use a different schedule for ${item.title}`}
                        checked={item.recurrence !== undefined}
                        onChange={event => updateItem(item, {
                          recurrence: event.target.checked
                            ? { ...makeDefaultRecurrence(today), frequency: 'daily' }
                            : undefined,
                        })}
                      />
                      Override parent schedule
                    </label>
                    {item.recurrence && (
                      <div style={{ padding: '8px 10px', borderLeft: '2px solid var(--accent-amethyst)', background: 'var(--surface-raised)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '0 0 8px', lineHeight: 1.4 }}>
                          This item is due only when both the parent ritual and this schedule occur.
                        </p>
                        <RecurrenceEditor
                          value={item.recurrence}
                          onChange={recurrence => updateItem(item, { recurrence })}
                          idPrefix={`item-${item.id}-recurrence`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add item form */}
      {editMode && showAdd && (
        <div className="card" style={{ marginTop: 12 }}>
          <input className="input-field" aria-label="Ritual name" placeholder="Ritual name" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} autoFocus />
          <input className="input-field" aria-label="Ritual time" style={{ marginTop: 8 }} placeholder="Time (optional, e.g. 7:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
          <textarea className="input-field" aria-label="Ritual description" style={{ marginTop: 8 }} placeholder="Description (optional)" rows={2} value={newDescription} onChange={e => setNewDescription(e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
            <input type="checkbox" aria-label="Mark ritual item as optional" checked={newOptional} onChange={e => setNewOptional(e.target.checked)} />
            Optional ritual item
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              aria-label="Use a different schedule for new ritual item"
              checked={newRecurrence !== undefined}
              onChange={e => setNewRecurrence(e.target.checked
                ? { ...makeDefaultRecurrence(today), frequency: 'daily' }
                : undefined)}
            />
            Override parent schedule
          </label>
          {newRecurrence && (
            <div style={{ marginTop: 10, padding: '8px 10px', borderLeft: '2px solid var(--accent-amethyst)', background: 'var(--surface-raised)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '0 0 8px', lineHeight: 1.4 }}>
                This item is due only when both the parent ritual and this schedule occur.
              </p>
              <RecurrenceEditor
                value={newRecurrence}
                onChange={setNewRecurrence}
                idPrefix="new-item-recurrence"
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={addItem}>Add</button>
            <button className="btn-ghost" onClick={resetNewItemForm}>Cancel</button>
          </div>
        </div>
      )}

      {editMode && !showAdd && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  )
}
