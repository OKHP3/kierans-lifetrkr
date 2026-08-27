import type { GoogleProfile } from '../types'

const APP_PREFIX = 'lifetrkr'

function getUserId(): string {
  let raw: string | null = null
  try { raw = localStorage.getItem(`${APP_PREFIX}:profile`) } catch { return 'guest' }
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
  hasSavedData(): boolean {
    try {
      return Object.keys(localStorage).some(storedKey =>
        storedKey === `${APP_PREFIX}:profile` ||
        (storedKey.startsWith(`${APP_PREFIX}:`) &&
          !storedKey.startsWith(`${APP_PREFIX}:public:`)),
      )
    } catch {
      return false
    }
  },
  get<T>(entity: string): T | null {
    let raw: string | null
    try { raw = localStorage.getItem(key(entity)) } catch { return null }
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  set<T>(entity: string, value: T): void {
    try { localStorage.setItem(key(entity), JSON.stringify(value)) } catch { /* disabled or full storage is non-fatal */ }
  },
  remove(entity: string): void {
    try { localStorage.removeItem(key(entity)) } catch { /* unavailable storage */ }
  },
  clear(): void {
    try {
      const uid = getUserId()
      Object.keys(localStorage)
        .filter(k => k.startsWith(`${APP_PREFIX}:${uid}:`))
        .forEach(k => localStorage.removeItem(k))
    } catch { /* unavailable storage */ }
  },
  getProfile(): GoogleProfile | null {
    let raw: string | null
    try { raw = localStorage.getItem(`${APP_PREFIX}:profile`) } catch { return null }
    if (!raw) return null
    try {
      const profile = JSON.parse(raw) as Partial<GoogleProfile>
      return typeof profile.sub === 'string' && typeof profile.email === 'string' ? profile as GoogleProfile : null
    } catch { return null }
  },
  setProfile(profile: GoogleProfile): void {
    try { localStorage.setItem(`${APP_PREFIX}:profile`, JSON.stringify(profile)) } catch { /* unavailable storage */ }
  },
  clearProfile(): void {
    try { localStorage.removeItem(`${APP_PREFIX}:profile`) } catch { /* unavailable storage */ }
  },
  /**
   * Read an array of records and automatically fill any missing keys using
   * the provided defaults. Safe for legacy localStorage data that predates
   * new optional fields (recurrence, tags, description, etc.).
   */
  getList<T extends object>(entity: string, defaults: T): T[] {
    let raw: string | null
    try { raw = localStorage.getItem(key(entity)) } catch { return [] }
    if (!raw) return []
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return (parsed as unknown[])
        .filter((record): record is Record<string, unknown> => record !== null && typeof record === 'object' && !Array.isArray(record))
        .map(record => ({ ...defaults, ...record } as T))
    } catch {
      return []
    }
  },
}

/**
 * Fill any missing keys on a single stored record so old localStorage data
 * is not broken by new required fields. Shallow merge: defaults win only
 * for keys absent in `record`.
 */
export function migrateRecord<T extends object>(
  record: Partial<T>,
  defaults: T,
): T {
  return { ...defaults, ...record } as T
}

/**
 * Apply migrateRecord to every item in an array of stored records.
 */
export function migrateArray<T extends object>(
  records: Partial<T>[],
  defaults: T,
): T[] {
  return records.map(r => migrateRecord(r, defaults))
}
