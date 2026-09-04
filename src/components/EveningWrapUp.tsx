import { useEffect, useRef } from 'react'
import type { EveningWrapUpCategory, EveningWrapUpSummary } from '../lib/eveningWrapUp'
import { formatDateLabel } from '../lib/date'

type Props = {
  summary: EveningWrapUpSummary
  onClose: () => void
}

function CategoryRow({
  label,
  category,
}: {
  label: string
  category: EveningWrapUpCategory
}) {
  return (
    <section aria-labelledby={`${label.toLowerCase()}-review-label`}>
      <div className="evening-wrap-up-category-heading">
        <h3 id={`${label.toLowerCase()}-review-label`}>{label}</h3>
        <span>{category.completed}/{category.total}</span>
      </div>
      {category.open.length > 0 ? (
        <ul className="evening-wrap-up-open-list">
          {category.open.map(entry => (
            <li key={entry.id}>
              <span>{entry.title}</span>
              {entry.detail && <small>{entry.detail}</small>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="evening-wrap-up-clear">All accounted for.</p>
      )}
    </section>
  )
}

export default function EveningWrapUp({ summary, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )).filter(element => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [onClose])

  const isEmpty = summary.totalTracked === 0
  const headline = isEmpty
    ? 'Nothing logged yet.'
    : `${summary.totalCompleted} of ${summary.totalTracked} accounted for.`

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="modal-sheet evening-wrap-up-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evening-wrap-up-title"
        aria-describedby="evening-wrap-up-description"
        onClick={event => event.stopPropagation()}
      >
        <div className="modal-handle" aria-hidden="true" />
        <div className="evening-wrap-up-header">
          <div>
            <p className="section-label" style={{ marginTop: 0 }}>EVENING WRAP-UP</p>
            <h2 id="evening-wrap-up-title">Set today down gently.</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="evening-wrap-up-close"
            aria-label="Close evening wrap-up"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p id="evening-wrap-up-description" className="evening-wrap-up-date">
          {formatDateLabel(summary.date)}
        </p>
        <div className="evening-wrap-up-score" aria-live="polite">
          <strong>{headline}</strong>
          <span>{isEmpty ? 'There is no review to do. Tomorrow starts clean.' : 'A read-only snapshot of what today held.'}</span>
        </div>
        {!isEmpty && (
          <div className="evening-wrap-up-categories">
            <CategoryRow label="Rituals" category={summary.rituals} />
            <CategoryRow label="Habits" category={summary.habits} />
            <CategoryRow label="Tasks" category={summary.tasks} />
          </div>
        )}
        <button className="btn-primary evening-wrap-up-done" onClick={onClose}>
          Close review
        </button>
      </div>
    </div>
  )
}