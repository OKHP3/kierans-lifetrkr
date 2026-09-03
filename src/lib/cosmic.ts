import type { CosmicEvent } from '../types'
import { addCalendarDays } from './date'

// ─── Moon Phase (deterministic Julian-day calculation) ────────────────────────

// Known new moon: 6 Jan 2000 18:14 UTC → JD 2451549.757
const KNOWN_NEW_MOON_JD = 2451549.757
const SYNODIC_MONTH = 29.530588853

function dateToJD(dateStr: string): number {
  const [yr, mo, da] = dateStr.split('-').map(Number)
  // Noon UTC for stability
  const y = yr, m = mo, d = da + 0.5
  const A = Math.floor((14 - m) / 12)
  const Y = y + 4800 - A
  const M = m + 12 * A - 3
  return (
    Math.floor(d) +
    Math.floor((153 * M + 2) / 5) +
    365 * Y +
    Math.floor(Y / 4) -
    Math.floor(Y / 100) +
    Math.floor(Y / 400) -
    32045
  ) + (d - Math.floor(d))
}

function getMoonAge(dateStr: string): number {
  const jd = dateToJD(dateStr)
  let age = (jd - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH
  if (age < 0) age += SYNODIC_MONTH
  return age
}

function moonEmoji(age: number): string {
  if (age < 1.85)  return '🌑'
  if (age < 7.38)  return '🌒'
  if (age < 9.22)  return '🌓'
  if (age < 14.77) return '🌔'
  if (age < 16.61) return '🌕'
  if (age < 22.15) return '🌖'
  if (age < 24.0)  return '🌗'
  return '🌘'
}

function moonPhaseName(age: number): string {
  if (age < 1.85)  return 'New Moon'
  if (age < 7.38)  return 'Waxing Crescent'
  if (age < 9.22)  return 'First Quarter'
  if (age < 14.77) return 'Waxing Gibbous'
  if (age < 16.61) return 'Full Moon'
  if (age < 22.15) return 'Waning Gibbous'
  if (age < 24.0)  return 'Last Quarter'
  return 'Waning Crescent'
}

function isNotablePhase(age: number): boolean {
  // Within ~0.9 days of new/first-quarter/full/last-quarter
  const phases = [0, 7.38, 14.77, 22.15]
  return phases.some(p => Math.abs(age - p) < 0.9 || Math.abs(age - SYNODIC_MONTH - p) < 0.9)
}

/** Returns the moon phase emoji for any date (always defined). */
export function getMoonPhaseEmoji(dateStr: string): string {
  return moonEmoji(getMoonAge(dateStr))
}

/** Returns a CosmicEvent on notable moon-phase dates; null otherwise. */
export function getMoonPhaseForDate(dateStr: string): CosmicEvent | null {
  const age = getMoonAge(dateStr)
  if (!isNotablePhase(age)) return null
  const name = moonPhaseName(age)
  const emoji = moonEmoji(age)
  return {
    id: `moon-${dateStr}`,
    title: name,
    description:
      age < 14.77
        ? 'A time for setting intentions and welcoming growth.'
        : 'A time for gratitude, release, and reflection.',
    date: dateStr,
    type: 'moon_phase',
    emoji,
    source: 'local',
  }
}

// ─── Daily Card ───────────────────────────────────────────────────────────────

const DAILY_CARDS = [
  'The Star ✦', 'The Moon 🌙', 'The Sun ☀️', 'The World 🌍',
  'The High Priestess 🔮', 'The Empress 👑', 'The Tower ⚡',
  'The Lovers 💕', 'The Magician ✨', 'The Hermit 🕯️',
  'Wheel of Fortune 🎡', 'Justice ⚖️', 'The Hanged Man 🌀',
  'Death 🦋', 'Temperance 🌊', 'The Devil 🗝️', 'The Chariot 🌟',
  'Strength 🦁', 'The Fool 🌬️', 'The Emperor 🔥',
  'The Hierophant 📜', 'Judgement 🎺', 'Ace of Cups 🥤',
  'Ten of Pentacles 🌳', 'Three of Swords 💔', 'Five of Wands 🌿',
  'Page of Cups 🐟', 'Queen of Pentacles 🍃', 'Knight of Wands 🐎',
  'King of Swords 🗡️',
]

// ─── Daily Wisdom ─────────────────────────────────────────────────────────────

const DAILY_WISDOMS = [
  'The moon does not fight. It shines.',
  'You carry the light you seek.',
  'Rest is not the absence of effort; it is its root.',
  'What you tend to, grows.',
  'Begin again. The invitation is always open.',
  'Small rituals hold the world together.',
  'Your becoming is not behind schedule.',
  'Stillness is its own kind of magic.',
  'The stars have been here longer than your worry.',
  'Tend the inner garden first.',
  'There is power in returning to yourself.',
  'Be as patient with yourself as the seasons are.',
  'Every ending is a threshold.',
  'You are the ritual and the altar.',
  'Let the night teach you what the day cannot.',
  'You do not have to earn rest.',
  'The universe is not in a hurry.',
  'Roots grow in the dark.',
  'Your intuition has been right more than you know.',
  'Grief and growth often walk together.',
  'You have survived every hard thing so far.',
  'The full moon holds nothing back.',
  'Some things are only visible in the quiet.',
  'Your sensitivity is a gift, not a flaw.',
  'Magic begins at the edge of what you know.',
  'Trust the slow unfolding.',
  'Let the day be enough.',
  'You are made of older things than you remember.',
  'Even in shadow, you are held.',
  'The path is still there in the dark.',
]

function dateIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return y * 10000 + m * 100 + d
}

/** Returns today's oracle card — deterministic per date. */
export function getDailyCard(dateStr: string): CosmicEvent {
  const card = DAILY_CARDS[dateIndex(dateStr) % DAILY_CARDS.length]
  return {
    id: `card-${dateStr}`,
    title: card,
    description: 'Your card for today.',
    date: dateStr,
    type: 'daily_card',
    emoji: '🃏',
    source: 'local',
  }
}

/** Returns today's wisdom — deterministic per date. */
export function getDailyWisdom(dateStr: string): CosmicEvent {
  const wisdom = DAILY_WISDOMS[(dateIndex(dateStr) * 7 + 3) % DAILY_WISDOMS.length]
  return {
    id: `wisdom-${dateStr}`,
    title: wisdom,
    date: dateStr,
    type: 'daily_wisdom',
    emoji: '✦',
    source: 'local',
  }
}

/** Returns notable moon-phase CosmicEvents within the given ISO date range (inclusive). */
export function getCosmicEventsForDateRange(startStr: string, endStr: string): CosmicEvent[] {
  const events: CosmicEvent[] = []
  let ds = startStr
  while (ds <= endStr) {
    const ev = getMoonPhaseForDate(ds)
    if (ev) events.push(ev)
    ds = addCalendarDays(ds, 1)
  }
  return events
}
