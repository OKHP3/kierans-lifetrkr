import type { GoogleProfile } from '../types'

const APP_PREFIX = 'lifetrkr'

function getUserId(): string {
  const raw = localStorage.getItem(`${APP_PREFIX}:profile`)
  if (!raw) return 'guest'
  try {
    const profile: GoogleProfile = JSON.parse(raw)
    return profile.sub || 'guest'
  } catch {
    return 'guest'
  }
}

function key(entity: string): string {
  return `${APP_PREFIX}:${getUserId()}:${entity}`
}

export const storage = {
  get<T>(entity: string): T | null {
    const raw = localStorage.getItem(key(entity))
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  set<T>(entity: string, value: T): void {
    localStorage.setItem(key(entity), JSON.stringify(value))
  },
  remove(entity: string): void {
    localStorage.removeItem(key(entity))
  },
  clear(): void {
    const uid = getUserId()
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${APP_PREFIX}:${uid}:`))
      .forEach(k => localStorage.removeItem(k))
  },
  getProfile(): GoogleProfile | null {
    const raw = localStorage.getItem(`${APP_PREFIX}:profile`)
    if (!raw) return null
    try { return JSON.parse(raw) as GoogleProfile } catch { return null }
  },
  setProfile(profile: GoogleProfile): void {
    localStorage.setItem(`${APP_PREFIX}:profile`, JSON.stringify(profile))
  },
  clearProfile(): void {
    localStorage.removeItem(`${APP_PREFIX}:profile`)
  },
}
