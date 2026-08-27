import { useApp } from '../context/AppContext'

export default function StorageWarning() {
  const { storageWarning, retryStorage } = useApp()

  if (!storageWarning) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 201,
        background: 'var(--surface-raised)',
        borderBottom: '2px solid #e07070',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ flex: '1 1 260px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Local storage is unavailable. Your latest changes are only in memory and may be lost if you reload. Allow browser storage or free space, then retry.
      </span>
      <button
        className="btn-ghost"
        onClick={retryStorage}
        style={{ fontSize: 12, color: 'var(--accent-amethyst)', padding: '4px 0' }}
      >
        Try saving again
      </button>
    </div>
  )
}