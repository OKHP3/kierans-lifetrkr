interface Props {
  done: boolean
  onToggle: () => void
  size?: number
  ariaLabel?: string
}

export default function CheckCircle({ done, onToggle, size = 22, ariaLabel }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`check-circle${done ? ' done' : ''}`}
      style={{ width: size, height: size, minWidth: size }}
      aria-label={ariaLabel ?? (done ? 'Mark incomplete' : 'Mark complete')}
      aria-pressed={done}
    >
      {done && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </button>
  )
}
