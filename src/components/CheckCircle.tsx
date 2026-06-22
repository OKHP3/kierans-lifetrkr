interface Props {
  done: boolean
  onToggle: () => void
  size?: number
}

export default function CheckCircle({ done, onToggle, size = 22 }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`check-circle${done ? ' done' : ''}`}
      style={{ width: size, height: size, minWidth: size }}
      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
    >
      {done && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </button>
  )
}
