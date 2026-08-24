interface FilterChip {
  label: string
  value: string
  active: boolean
}

interface Props {
  chips: FilterChip[]
  onChange: (value: string, active: boolean) => void
  className?: string
}

export default function FilterBar({ chips, onChange, className = '' }: Props) {
  if (chips.length === 0) return null

  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 no-scrollbar ${className}`} role="group" aria-label="Filters">
      {chips.map(chip => (
        <button
          key={chip.value}
          type="button"
          onClick={() => onChange(chip.value, !chip.active)}
          aria-pressed={chip.active}
          className={
            `flex-shrink-0 px-3 py-1 rounded-full text-xs font-mono transition-colors whitespace-nowrap ` +
            (chip.active
              ? 'bg-accentAmethyst text-bg font-semibold'
              : 'bg-surfaceRaised text-textSecondary border border-border hover:border-accentAmethyst hover:text-textPrimary')
          }
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
