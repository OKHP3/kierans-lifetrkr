import { useState, KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export default function TagInput({ tags, onChange, suggestions = [], placeholder = 'Add a tag…' }: Props) {
  const [input, setInput] = useState('')

  const normalise = (t: string) => t.trim().toLowerCase().replace(/\s+/g, '-')

  function add(raw: string) {
    const tag = normalise(raw)
    if (!tag || tags.includes(tag)) { setInput(''); return }
    onChange([...tags, tag])
    setInput('')
  }

  function remove(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      add(input)
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      remove(tags[tags.length - 1])
    }
  }

  const filteredSuggestions = suggestions
    .filter(s => !tags.includes(normalise(s)) && s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 6)

  return (
    <div className="space-y-2">
      {/* Existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 bg-surfaceRaised border border-border rounded-full text-xs text-textSecondary"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => remove(tag)}
                className="text-textMuted hover:text-accentRose transition-colors ml-0.5 leading-none"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        id="tag-input"
        type="text"
        aria-label="Add a tag"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-accentAmethyst transition-colors"
      />

      {/* Suggestions */}
      {filteredSuggestions.length > 0 && input && (
        <div className="flex flex-wrap gap-1.5">
          {filteredSuggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              aria-label={`Add suggested tag ${s}`}
              className="px-2 py-0.5 bg-bg border border-border rounded-full text-xs text-textMuted hover:border-accentAmethyst hover:text-accentAmethyst transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-textGhost">Press Enter or comma to add a tag</p>
    </div>
  )
}
