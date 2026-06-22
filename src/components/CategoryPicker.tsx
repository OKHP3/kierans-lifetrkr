import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '../constants'
import type { CategoryRealm } from '../types'

interface Props {
  categoryId: string | undefined
  onChange: (categoryId: string | undefined) => void
}

const REALM_ORDER: CategoryRealm[] = ['health', 'body', 'mind', 'home', 'school', 'social', 'creative', 'magic', 'calendar', 'other']

const REALM_LABELS: Record<CategoryRealm, string> = {
  health:   'Health',
  body:     'Body',
  mind:     'Mind',
  home:     'Home',
  school:   'School',
  social:   'Social',
  creative: 'Creative',
  magic:    'Magic',
  calendar: 'Calendar',
  other:    'Other',
}

export default function CategoryPicker({ categoryId, onChange }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? DEFAULT_CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.realm.toLowerCase().includes(search.toLowerCase())
      )
    : DEFAULT_CATEGORIES

  const byRealm = REALM_ORDER.reduce<Partial<Record<CategoryRealm, typeof DEFAULT_CATEGORIES>>>(
    (acc, realm) => {
      const cats = filtered.filter(c => c.realm === realm)
      if (cats.length) acc[realm] = cats
      return acc
    },
    {}
  )

  function toggle(id: string) {
    onChange(categoryId === id ? undefined : id)
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search categories…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-accentAmethyst transition-colors"
      />

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {(Object.entries(byRealm) as [CategoryRealm, typeof DEFAULT_CATEGORIES][]).map(([realm, cats]) => (
          <div key={realm}>
            <p className="text-xs font-mono text-textMuted uppercase tracking-wider mb-1.5">
              {REALM_LABELS[realm]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(cat => {
                const active = categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className={
                      `flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ` +
                      (active
                        ? 'bg-accentAmethyst text-bg font-semibold'
                        : 'bg-surfaceRaised text-textSecondary hover:bg-border hover:text-textPrimary')
                    }
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-textMuted text-center py-4">No categories match "{search}"</p>
        )}
      </div>
    </div>
  )
}
