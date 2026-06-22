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

  /**
   * Read an array of records and automatically fill any missing keys using
   * the provided defaults. Safe for legacy localStorage data that predates
   * new optional fields (recurrence, tags, description, etc.).
   */
  getList<T extends object>(entity: string, defaults: T): T[] {
    const raw = localStorage.getItem(key(entity))
    if (!raw) return []
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return (parsed as Partial<T>[]).map(record => ({ ...defaults, ...record }) as T)
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
