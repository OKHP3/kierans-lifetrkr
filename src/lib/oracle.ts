import type { TarotCard, MoonPhase, AstroSeason, ZodiacSign } from '../types'

// ─── Tarot ────────────────────────────────────────────────────────────────────

const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress',
  'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
  'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
  'The Hanged Man', 'Death', 'Temperance', 'The Devil',
  'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
]

const ORACLE_WORKER_URL = import.meta.env.VITE_ORACLE_WORKER_URL || ''

function todayISO(timezone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function readCache(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function writeCache(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* private mode or quota full */ }
}

function fallbackCard(date = todayISO()): TarotCard {
  const dayOfYear = Math.floor(
    (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${date.slice(0, 4)}-01-01T12:00:00Z`)) / 86400000,
  )
  const name = MAJOR_ARCANA[dayOfYear % MAJOR_ARCANA.length]
  return {
    name,
    name_short: name.toLowerCase().replace(/\s/g, '_'),
    type: 'major',
    meaning_up: 'Trust the path unfolding before you.',
    meaning_rev: 'Resistance may be slowing what is meant to flow.',
    desc: 'A powerful card of transformation and insight.',
  }
}

export async function fetchTarotCard(timezone?: string): Promise<TarotCard> {
  const date = todayISO(timezone)
  const cacheKey = `lifetrkr:public:tarot:${date}`
  const cached = readCache(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) as TarotCard } catch { /* refetch malformed cache */ }
  }
  try {
    const res = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1')
    if (!res.ok) throw new Error('tarot api error')
    const data = await res.json() as { cards?: TarotCard[] }
    const card = data.cards?.[0]
    if (!card?.name || !card.meaning_up) throw new Error('invalid tarot payload')
    writeCache(cacheKey, JSON.stringify(card))
    return card
  } catch {
    const card = fallbackCard(date)
    writeCache(cacheKey, JSON.stringify(card))
    return card
  }
}

// ─── Horoscope ────────────────────────────────────────────────────────────────

export async function fetchHoroscope(sign: ZodiacSign, timezone?: string): Promise<string | null> {
  const cacheKey = `lifetrkr:public:horoscope:${todayISO(timezone)}:${sign.toLowerCase()}`
  const cached = readCache(cacheKey)
  if (cached) return cached
  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`,
    )
    if (!res.ok) return null
    const data = await res.json()
    const horoscope = typeof data?.data?.horoscope === 'string'
      ? data.data.horoscope.trim()
      : ''
    if (!horoscope || horoscope.length > 2000) return null
    writeCache(cacheKey, horoscope)
    return horoscope
  } catch {
    return null
  }
}

// ─── Claude Oracle Message ────────────────────────────────────────────────────

function getUserSub(): string {
  try {
    const raw = localStorage.getItem('lifetrkr:profile')
    if (!raw) return 'guest'
    const sub = JSON.parse(raw).sub
    return typeof sub === 'string' && sub ? sub : 'guest'
  } catch {
    return 'guest'
  }
}

export async function generateOracleMessage(
  card: TarotCard,
  moon: MoonPhase,
  season: AstroSeason,
  mercury: { retrograde: boolean; endDate: string | null },
  birthSign?: ZodiacSign | null,
  timezone?: string,
): Promise<string> {
  const date = todayISO(timezone)
  const cacheKey = `lifetrkr:${getUserSub()}:oracle:${date}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  const fallback = card.meaning_up
  if (!ORACLE_WORKER_URL) {
    writeCache(cacheKey, fallback)
    return fallback
  }

  const userPrompt = [
    `Today is ${new Date().toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', month: 'long', day: 'numeric' })}.`,
    `The moon is in ${moon.name}.`,
    `The sun is in ${season.sign} (${season.element} sign).`,
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    mercury.retrograde ? `Mercury is retrograde until ${mercury.endDate}.` : '',
    birthSign ? `This person's sun sign is ${birthSign}.` : '',
    'Write a 2-3 sentence daily oracle message. Warm, grounded, quietly mystical. Do not use em dashes.',
  ].filter(Boolean).join(' ')

  try {
    const response = await fetch(ORACLE_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'You are a warm, grounded, slightly mystical daily oracle for a personal life app. Never use em dashes. Sound like someone who reads a lot and walks in the woods at dusk.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    if (!response.ok) throw new Error(`oracle worker error: ${response.status}`)
    const data = await response.json() as { content?: Array<{ text?: unknown }> }
    const message = typeof data.content?.[0]?.text === 'string'
      ? data.content[0].text.trim()
      : ''
    if (!message || message.length > 4000) throw new Error('invalid oracle payload')
    writeCache(cacheKey, message)
    return message
  } catch {
    writeCache(cacheKey, fallback)
    return fallback
  }
}

export function clearOracleCache(timezone?: string): void {
  const date = todayISO(timezone)
  try {
    localStorage.removeItem(`lifetrkr:${getUserSub()}:oracle:${date}`)
  } catch { /* private mode or unavailable storage */ }
}
