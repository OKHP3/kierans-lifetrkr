import { useState } from 'react'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useApp } from '../context/AppContext'
import { fetchGoogleProfile } from '../lib/googleCalendar'
import { storage } from '../lib/storage'
import { GOOGLE_CLIENT_ID } from '../constants'

interface Props {
  onConnected?: () => void
}

export default function GoogleConnectButton({ onConnected }: Props) {
  const { isConnected, connect, disconnect } = useGoogleAuth()
  const { state, dispatch } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasClientId = Boolean(GOOGLE_CLIENT_ID)

  async function handleConnect() {
    if (!hasClientId) {
      setError('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your environment.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = await connect()
      const profile = await fetchGoogleProfile(token)
      storage.setProfile(profile)
      dispatch({ type: 'SET_PROFILE', payload: profile })
      dispatch({ type: 'SET_GOOGLE_CONNECTED', payload: true })
      onConnected?.()
    } catch (e) {
      setError('Could not connect to Google. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleDisconnect() {
    disconnect()
    storage.clearProfile()
    dispatch({ type: 'CLEAR_PROFILE' })
  }

  if (isConnected || state.isGoogleConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--accent-sage, #7ec8a0)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>● CONNECTED</span>
          {state.profile?.email && (
            <span style={{ fontSize: 12, color: 'var(--text-ghost)' }}>{state.profile.email}</span>
          )}
        </div>
        <button className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--text-ghost)', padding: '4px 0' }} onClick={handleDisconnect}>
          Disconnect Google account
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        className="btn-primary"
        onClick={handleConnect}
        disabled={loading || !hasClientId}
        style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
      >
        <GoogleIcon />
        {loading ? 'Connecting…' : 'Connect Google Account'}
      </button>
      {!hasClientId && (
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: 0 }}>
          VITE_GOOGLE_CLIENT_ID not set in environment.
        </p>
      )}
      {error && <p style={{ fontSize: 12, color: '#e07070', margin: 0 }}>{error}</p>}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
