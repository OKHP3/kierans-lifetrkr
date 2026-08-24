import { useState, useCallback } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES } from '../constants'

export function useGoogleAuth() {
  // State exists only to trigger re-renders after connect/disconnect.
  // The actual validity check reads live from sessionStorage every render
  // so all hook instances (GoogleConnectButton, TokenExpiryBanner, etc.)
  // see the same truth without a shared context.
  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick(n => n + 1), [])

  function readSession(key: string): string | null {
    try { return sessionStorage.getItem(key) } catch { return null }
  }
  function clearSession() {
    try {
      sessionStorage.removeItem('gal_token')
      sessionStorage.removeItem('gal_expiry')
    } catch { /* unavailable session storage */ }
  }

  const storedToken = readSession('gal_token')
  const storedExpiry = Number(readSession('gal_expiry')) || 0
  const isConnected = Boolean(storedToken) && Date.now() < storedExpiry
  const minutesUntilExpiry = storedExpiry
    ? Math.max(0, Math.floor((storedExpiry - Date.now()) / 60000))
    : null

  const isTokenValid = useCallback(() => {
    const t = readSession('gal_token')
    const e = Number(readSession('gal_expiry')) || 0
    return Boolean(t) && Date.now() < e
  }, [])

  const requestToken = useCallback((silent = false): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        prompt: silent ? 'none' : '',
        callback: (response) => {
          if (response.error) {
            reject(response.error)
            return
          }
          const expiry = Date.now() + (response.expires_in * 1000)
           try {
             sessionStorage.setItem('gal_token', response.access_token)
             sessionStorage.setItem('gal_expiry', String(expiry))
           } catch {
             reject(new Error('Session storage unavailable'))
             return
           }
          rerender()
          resolve(response.access_token)
        },
      })
      client.requestAccessToken()
    })
  }, [rerender])

  const getToken = useCallback(async (): Promise<string> => {
    if (isTokenValid()) return readSession('gal_token')!
    return requestToken(true).catch(() => requestToken(false))
  }, [isTokenValid, requestToken])

  const disconnect = useCallback(() => {
    const token = readSession('gal_token')
    if (token) {
      window.google?.accounts?.oauth2?.revoke(token, () => {})
    }
    clearSession()
    rerender()
  }, [rerender])

  return {
    isConnected,
    accessToken: storedToken,
    minutesUntilExpiry,
    connect: () => requestToken(false),
    getToken,
    disconnect,
  }
}
