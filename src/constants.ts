export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid',
  'profile',
  'email',
].join(' ')

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const APP_VERSION = 'v0.1.0'

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
  '01-01': 'New Year\'s Day ✦',
  '02-02': 'Imbolc ✦',
  '02-14': 'Valentine\'s Day ♥',
  '03-17': 'St. Patrick\'s Day ☘',
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
  '12-31': 'New Year\'s Eve ✦',
}
