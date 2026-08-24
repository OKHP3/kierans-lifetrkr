import { useState } from 'react'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useApp } from '../context/AppContext'

export default function TokenExpiryBanner() {
  const { isConnected, minutesUntilExpiry, getToken } = useGoogleAuth()
  const { state } = useApp()
  const [dismissed, setDismissed] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  if (!state.isGoogleConnected) return null
  if (isConnected) return null
  if (dismissed) return null

  async function handleReconnect() {
    setReconnecting(true)
    try { await getToken() } catch {}
    setReconnecting(false)
  }

  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--surface-raised)', borderBottom: '0.5px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        ↻ Google sync paused
      </span>
      <button onClick={handleReconnect} disabled={reconnecting} style={{ fontSize: 12, color: 'var(--accent-amethyst)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>
        {reconnecting ? 'Reconnecting…' : 'Tap to reconnect'}
      </button>
      <button aria-label="Dismiss Google sync notice" onClick={() => setDismissed(true)} style={{ fontSize: 14, color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>×</button>
    </div>
  )
}
