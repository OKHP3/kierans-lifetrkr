interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function DescriptionField({
  value,
  onChange,
  placeholder = 'Add a description… (optional)',
  rows = 3,
}: Props) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={
        'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-textPrimary ' +
        'placeholder-textMuted focus:outline-none focus:border-accentAmethyst transition-colors resize-none'
      }
    />
  )
}
