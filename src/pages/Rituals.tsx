import { useState, useEffect } from 'react'
import { useApp, genId } from '../context/AppContext'
import CheckCircle from '../components/CheckCircle'
import CategoryPicker from '../components/CategoryPicker'
import TagInput from '../components/TagInput'
import DescriptionField from '../components/DescriptionField'
import RecurrenceEditor from '../components/RecurrenceEditor'
import { getTodayISO, getDayOfWeek } from '../lib/date'
import { DAYS_OF_WEEK, DAYS_SHORT, DEFAULT_CATEGORIES, makeDefaultRecurrence } from '../constants'
import type { RoutineDayOfWeek, RecurrenceRule } from '../types'

const DAY_NUM: Record<RoutineDayOfWeek, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
}

function chipSt(active: boolean): React.CSSProperties {
  return {
    fontSize: 11, padding: '2px 8px', borderRadius: 12, cursor: 'pointer',
    background: active ? 'var(--surface-raised)' : 'transparent',
    border: `0.5px solid ${active ? 'var(--accent-amethyst)' : 'var(--border)'}`,
    color: active ? 'var(--accent-amethyst)' : 'var(--text-muted)',
    fontFamily: 'Space Mono, monospace', flexShrink: 0,
  }
}

export default function Rituals() {
  const { state, dispatch } = useApp()
  const todayFull = getDayOfWeek()
  const [selectedDay, setSelectedDay] = useState<RoutineDayOfWeek>(todayFull)
  const [editMode, setEditMode] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [freqFilter, setFreqFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'next-occ' | 'category'>('default')

  // Metadata edit state
  const [showMeta, setShowMeta] = useState(false)
  const [metaDesc, setMetaDesc] = useState('')
  const [metaCategoryId, setMetaCategoryId] = useState<string | undefined>()
  const [metaTags, setMetaTags] = useState<string[]>([])
  const [metaRecurrence, setMetaRecurrence] = useState<RecurrenceRule>(makeDefaultRecurrence())

  const today = getTodayISO()
  const isToday = selectedDay === todayFull
  const template = state.routineTemplates.find(t => t.dayOfWeek === selectedDay)
  const completion = state.routineCompletions.find(
    c => c.routineTemplateId === template?.id && c.date === today
  )
  const isItemDone = (id: string) => completion?.completedItemIds.includes(id) ?? false
  const doneCount = template ? template.items.filter(i => isItemDone(i.id)).length : 0
  const templateCategory = template?.categoryId
    ? DEFAULT_CATEGORIES.find(c => c.id === template.categoryId)
    : undefined

  useEffect(() => {
    if (!template) return
    setMetaDesc(template.description ?? '')
    setMetaCategoryId(template.categoryId)
    setMetaTags(template.tags ?? [])
    setMetaRecurrence(template.recurrence ?? makeDefaultRecurrence())
    setShowMeta(false)
  }, [selectedDay]) // eslint-disable-line react-hooks/exhaustive-deps

  // Derive unique filter options from all templates
  const usedCategoryIds = [...new Set(state.routineTemplates.filter(t => t.categoryId).map(t => t.categoryId!))]
  const allTemplateTags = [...new Set(state.routineTemplates.flatMap(t => t.tags ?? []))]
  const usedFreqs = [...new Set(
    state.routineTemplates
      .filter(t => t.recurrence && t.recurrence.frequency !== 'none')
      .map(t => t.recurrence!.frequency)
  )]

  // Build the sorted + filtered day list
  let filteredDays = ([...DAYS_OF_WEEK] as RoutineDayOfWeek[]).filter(day => {
    const t = state.routineTemplates.find(t2 => t2.dayOfWeek === day)
    if (statusFilter === 'active' && (t?.items?.length ?? 0) === 0) return false
    if (statusFilter === 'inactive' && (t?.items?.length ?? 0) > 0) return false
    if (categoryFilter && t?.categoryId !== categoryFilter) return false
    if (tagFilter && !(t?.tags ?? []).includes(tagFilter)) return false
    if (freqFilter && t?.recurrence?.frequency !== freqFilter) return false
    return true
  })

  const todayNum = new Date().getDay()
  if (sortBy === 'title') {
    filteredDays = [...filteredDays].sort((a, b) => a.localeCompare(b))
  } else if (sortBy === 'next-occ') {
    filteredDays = [...filteredDays].sort((a, b) => {
      const da = (DAY_NUM[a] - todayNum + 7) % 7
      const db = (DAY_NUM[b] - todayNum + 7) % 7
      return da - db
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

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 className="page-title">Rituals</h1>
        <button className="btn-ghost" onClick={() => { setEditMode(e => !e); setShowAdd(false); setShowMeta(false) }}>
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 8, scrollbarWidth: 'none' }}>
        {([['all', 'All'], ['active', 'Has items'], ['inactive', 'Empty']] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setStatusFilter(v)} style={chipSt(statusFilter === v)}>{label}</button>
        ))}
      </div>

      {/* Category chips */}
      {usedCategoryIds.length > 0 && (
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 8, scrollbarWidth: 'none', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>cat:</span>
          {usedCategoryIds.map(id => {
            const cat = DEFAULT_CATEGORIES.find(c => c.id === id)
            return (
              <button key={id} type="button" onClick={() => setCategoryFilter(c => c === id ? null : id)} style={chipSt(categoryFilter === id)}>
                {cat?.emoji} {cat?.label ?? id}
              </button>
            )
          })}
        </div>
      )}

      {/* Tag chips */}
      {allTemplateTags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 8, scrollbarWidth: 'none', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>tag:</span>
          {allTemplateTags.map(tag => (
            <button key={tag} type="button" onClick={() => setTagFilter(t => t === tag ? null : tag)} style={chipSt(tagFilter === tag)}>{tag}</button>
          ))}
        </div>
      )}

      {/* Frequency chips */}
      {usedFreqs.length > 0 && (
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 8, scrollbarWidth: 'none', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>freq:</span>
          {usedFreqs.map(f => (
            <button key={f} type="button" onClick={() => setFreqFilter(ff => ff === f ? null : f)} style={chipSt(freqFilter === f)}>{f}</button>
          ))}
        </div>
      )}

      {/* Sort row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace' }}>sort:</span>
        {([['default', 'day'], ['title', 'title'], ['next-occ', 'next'], ['category', 'category']] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setSortBy(v)} style={chipSt(sortBy === v)}>{label}</button>
        ))}
      </div>

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
              onClick={() => { setSelectedDay(day); setEditMode(false); setShowAdd(false) }}
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
        <button
          className="btn-ghost"
          style={{ fontSize: 11, padding: '3px 10px', flexShrink: 0 }}
          onClick={() => setShowMeta(m => !m)}
        >
          {showMeta ? 'Close' : 'Details'}
        </button>
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
      {template && template.items.length > 0 && isToday && (
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
          {doneCount}/{template.items.length} complete
        </p>
      )}

      {/* Items */}
      <div className="card">
        {!template || template.items.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0, padding: '4px 0' }}>
            No rituals for {selectedDay}.{' '}
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-amethyst)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Add some →
              </button>
            )}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {template.items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editMode ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-ghost)" strokeWidth="1.5">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
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

      {/* Add item form */}
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

      {editMode && !showAdd && (
        <button className="fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  )
}
