import type { LifeTrkrCategory, RecurrenceRule } from './types'
import packageMetadata from '../package.json'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid',
  'profile',
  'email',
] as const

export const SCOPES = GOOGLE_OAUTH_SCOPES.join(' ')

export const PUBLIC_APP_ORIGIN = 'https://okhp3.github.io'
export const PUBLIC_APP_URL = `${PUBLIC_APP_ORIGIN}/kierans-lifetrkr/`
export const PRIVACY_URL = `${PUBLIC_APP_URL}#/privacy`
export const SUPPORT_EMAIL = 'contact@overkillhill.com'
export const GOOGLE_OAUTH_ORIGINS = [
  PUBLIC_APP_ORIGIN,
  'http://localhost:5000',
] as const

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// package.json is the authoritative release version. Keep the display label
// derived from it so UI and release metadata cannot drift independently.
export const APP_VERSION = `v${packageMetadata.version}`

export const DAILY_QUOTES = [
  'Every day is a new ritual. Begin again.',
  'Your habits are your future, practicing.',
  'Small things done consistently create remarkable results.',
  'Rest is not idleness. It is the soil of effort.',
  'You are not behind. You are exactly where you need to be.',
  'Structure is the container that holds freedom.',
  'Begin with what matters most. The rest will follow.',
  'Progress over perfection, always.',
  'The ordinary moment, made intentional, becomes sacred.',
  "You don't need more time. You need better rituals.",
  'Be gentle with yourself. This is a long journey.',
  'Presence is the practice. Begin again, now.',
]

export const SEASONAL_DATES: Record<string, string> = {
  '01-01': "New Year's Day ✦",
  '02-02': 'Imbolc ✦',
  '02-14': "Valentine's Day ♥",
  '03-17': "St. Patrick's Day ☘",
  '03-20': 'Spring Equinox ✦',
  '04-22': 'Earth Day 🌱',
  '05-01': 'Beltane ✦',
  '06-21': 'Summer Solstice ✦',
  '07-04': 'Independence Day ✦',
  '08-01': 'Lammas ✦',
  '09-22': 'Autumn Equinox ✦',
  '10-31': 'Samhain ✦',
  '11-01': 'Día de los Muertos ✦',
  '12-21': 'Winter Solstice ✦',
  '12-25': 'Yule ✦',
  '12-31': "New Year's Eve ✦",
}

// ─── Categories (PRD v3.0 — 29 canonical categories) ───────────────────────

export type Category = { emoji: string; label: string; group: 'Spiritual' | 'Daily' }

export const CATEGORIES: Category[] = [
  // ── Spiritual Practice ──────────────────────────
  { emoji: '🌙', label: 'Moon ritual',    group: 'Spiritual' },
  { emoji: '🔮', label: 'Divination',     group: 'Spiritual' },
  { emoji: '🃏', label: 'Card reading',   group: 'Spiritual' },
  { emoji: '✨', label: 'Spellwork',      group: 'Spiritual' },
  { emoji: '🕯️', label: 'Candle work',  group: 'Spiritual' },
  { emoji: '🧿', label: 'Protection',     group: 'Spiritual' },
  { emoji: '🌿', label: 'Herbalism',      group: 'Spiritual' },
  { emoji: '🌸', label: 'Altar work',     group: 'Spiritual' },
  { emoji: '🌟', label: 'Manifestation',  group: 'Spiritual' },
  { emoji: '💎', label: 'Crystals',       group: 'Spiritual' },
  { emoji: '📿', label: 'Ritual',         group: 'Spiritual' },
  { emoji: '🌀', label: 'Energy work',    group: 'Spiritual' },
  // ── Daily Life ──────────────────────────────────
  { emoji: '💊', label: 'Medication',     group: 'Daily' },
  { emoji: '🧘', label: 'Meditation',     group: 'Daily' },
  { emoji: '😴', label: 'Sleep / Rest',   group: 'Daily' },
  { emoji: '🏃', label: 'Movement',       group: 'Daily' },
  { emoji: '💪', label: 'Exercise',       group: 'Daily' },
  { emoji: '🍎', label: 'Nutrition',      group: 'Daily' },
  { emoji: '💧', label: 'Hydration',      group: 'Daily' },
  { emoji: '🫁', label: 'Breathwork',     group: 'Daily' },
  { emoji: '🧠', label: 'Mental health',  group: 'Daily' },
  { emoji: '📖', label: 'Journaling',     group: 'Daily' },
  { emoji: '📚', label: 'Study',          group: 'Daily' },
  { emoji: '💼', label: 'Work',           group: 'Daily' },
  { emoji: '🧹', label: 'Cleaning',       group: 'Daily' },
  { emoji: '🌱', label: 'Self-care',      group: 'Daily' },
  { emoji: '💰', label: 'Finance',        group: 'Daily' },
  { emoji: '🤝', label: 'Connection',     group: 'Daily' },
  { emoji: '🎵', label: 'Creative',       group: 'Daily' },
  { emoji: '☕', label: 'Morning ritual', group: 'Daily' },
  { emoji: '🙏', label: 'Gratitude',      group: 'Daily' },
]

// Legacy category list — kept for backward compat with existing stored data
export const DEFAULT_CATEGORIES: LifeTrkrCategory[] = [
  { id: 'medication',  label: 'Medication',   emoji: '💊',  realm: 'health'    },
  { id: 'sleep',       label: 'Sleep',         emoji: '😴',  realm: 'body'      },
  { id: 'meditation',  label: 'Meditation',    emoji: '🧘',  realm: 'mind'      },
  { id: 'hydration',   label: 'Hydration',     emoji: '💧',  realm: 'body'      },
  { id: 'movement',    label: 'Movement',      emoji: '🏃',  realm: 'body'      },
  { id: 'study',       label: 'Study',         emoji: '📚',  realm: 'school'    },
  { id: 'mood-check',  label: 'Mental health', emoji: '🧠',  realm: 'mind'      },
  { id: 'journaling',  label: 'Journaling',    emoji: '📖',  realm: 'creative'  },
  { id: 'moon-work',   label: 'Moon ritual',   emoji: '🌙',  realm: 'magic'     },
  { id: 'card-reading',label: 'Card reading',  emoji: '🃏',  realm: 'magic'     },
  { id: 'crystals',    label: 'Crystals',      emoji: '💎',  realm: 'magic'     },
  { id: 'herbs',       label: 'Herbalism',     emoji: '🌿',  realm: 'magic'     },
]

// ─── Default Recurrence ────────────────────────────────────────────────────

/** Static default — use makeDefaultRecurrence() when you need today's date as startDate. */
export const DEFAULT_RECURRENCE: RecurrenceRule = {
  frequency: 'none',
  interval: 1,
  startDate: '',
  end: { mode: 'never' },
  exceptions: [],
}

export function makeDefaultRecurrence(): RecurrenceRule {
  return {
    ...DEFAULT_RECURRENCE,
    startDate: new Date().toISOString().split('T')[0],
  }
}
