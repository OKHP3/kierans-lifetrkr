/**
 * oracle-component-template.tsx
 * okhp3-daily-oracle — copy-paste starter component
 *
 * Drop this into src/components/OracleCard.tsx and wire up:
 *   1. Replace `generateOracleMessage` with your Option A or Option B implementation
 *      (see SKILL.md "API key delivery" section)
 *   2. Replace `myapp` prefix with your app name
 *   3. Pass userId (from Google sub or 'guest') and optional context
 *
 * Compatible with React 18+, TypeScript, Tailwind CSS.
 */

import { useState, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TarotCard {
  name: string;
  meaning_up: string;
  type: string;
  desc: string;
}

interface OracleContext {
  moonPhase?: string;     // from okhp3-celestial-data: getMoonPhase().name
  season?: string;        // from okhp3-celestial-data: getAstroSeason().sign
  isRetrograde?: boolean; // from okhp3-celestial-data: getMercuryStatus().retrograde
  sign?: string;          // user's birth sign from settings (e.g. 'cancer')
}

interface Oracle {
  date: string;       // YYYY-MM-DD
  card: TarotCard;
  message: string;
  horoscope: string | null;
}

// ── Fallback card pool (12 Major Arcana) ─────────────────────────────────────

const FALLBACK_CARDS: Pick<TarotCard, 'name' | 'meaning_up'>[] = [
  { name: 'The Star',           meaning_up: 'Hope, renewal, trust in the unfolding.' },
  { name: 'The Moon',           meaning_up: 'Cycles, dreams, what lies beneath.' },
  { name: 'The Sun',            meaning_up: 'Clarity, vitality, things coming to light.' },
  { name: 'Temperance',         meaning_up: 'Balance, patience, the middle path.' },
  { name: 'Strength',           meaning_up: 'Inner courage, gentle power, compassion.' },
  { name: 'The Hermit',         meaning_up: 'Stillness, inner guidance, turning inward.' },
  { name: 'The World',          meaning_up: 'Completion, wholeness, the journey fulfilled.' },
  { name: 'The Empress',        meaning_up: 'Abundance, creativity, nurturing life.' },
  { name: 'The High Priestess', meaning_up: 'Intuition, inner knowing, the unseen.' },
  { name: 'Judgement',          meaning_up: 'Awakening, reckoning, the call toward purpose.' },
  { name: 'Wheel of Fortune',   meaning_up: 'Change, cycles, forces larger than yourself.' },
  { name: 'The Fool',           meaning_up: 'New beginnings, open heart, the unknown.' },
];

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res  = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0];
  } catch {
    // Deterministic fallback — same card for same day of year, every year
    const doy = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const card = FALLBACK_CARDS[doy % FALLBACK_CARDS.length];
    return { name: card.name, meaning_up: card.meaning_up, type: 'major', desc: '' };
  }
}

async function fetchHoroscope(sign: string): Promise<string | null> {
  try {
    const res  = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`
    );
    const data = await res.json();
    return data?.data?.horoscope || null;
  } catch {
    return null; // always degrade gracefully — horoscope is optional
  }
}

function buildPrompt(card: TarotCard, context: OracleContext): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  return [
    `Today is ${today}.`,
    context.moonPhase    ? `The moon is ${context.moonPhase}.`          : '',
    context.season       ? `The sun is in ${context.season}.`           : '',
    context.isRetrograde ? 'Mercury is currently retrograde.'           : '',
    context.sign         ? `This person's sun sign is ${context.sign}.` : '',
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    'Write a 2–3 sentence daily oracle message. Warm, grounded, quietly insightful.',
  ].filter(Boolean).join(' ');
}

/**
 * TODO: Replace this stub with your Option A or Option B implementation.
 * Option A (recommended): POST to your Cloudflare Worker proxy (VITE_ORACLE_WORKER_URL)
 * Option B (personal apps only): direct browser fetch with anthropic-dangerous-direct-browser-access header
 * See SKILL.md "API key delivery" section for full code.
 */
async function generateOracleMessage(card: TarotCard, context: OracleContext): Promise<string> {
  const userPrompt = buildPrompt(card, context);
  const proxyUrl   = import.meta.env.VITE_ORACLE_WORKER_URL;

  if (!proxyUrl) return card.meaning_up; // no proxy configured — use fallback

  try {
    const res  = await fetch(proxyUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        system:   'You are a warm, grounded daily oracle. Write 2–3 sentences. No clichés.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || card.meaning_up;
  } catch {
    return card.meaning_up;
  }
}

// ── Cache key + orchestrator ──────────────────────────────────────────────────

/**
 * Cache key pattern: `{APP_PREFIX}:{userId}:oracle:{YYYY-MM-DD}`
 *
 * - userId       → per-user isolation (use Google `sub`, or 'guest')
 * - YYYY-MM-DD   → always use ISO format via toISOString().split('T')[0]
 *                  Never use toLocaleDateString() — it is locale-dependent and
 *                  will produce different keys in different browser locales.
 */
const APP_PREFIX = 'myapp'; // change to your app's namespace

async function getOrCreateOracle(
  userId: string,
  context: OracleContext
): Promise<Oracle> {
  const today    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD — not toLocaleDateString()
  const cacheKey = `${APP_PREFIX}:${userId}:oracle:${today}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as Oracle;

  // Parallel: tarot card + horoscope (independent requests)
  const [card, horoscope] = await Promise.all([
    fetchTarotCard(),
    context.sign ? fetchHoroscope(context.sign) : Promise.resolve(null),
  ]);

  // Sequential: AI message needs the card
  const message = await generateOracleMessage(card, context);

  const oracle: Oracle = { date: today, card, message, horoscope };
  localStorage.setItem(cacheKey, JSON.stringify(oracle));
  return oracle;
}

// ── React component ───────────────────────────────────────────────────────────

interface OracleCardProps {
  userId:  string;
  context: OracleContext;
  className?: string;
}

export function OracleCard({ userId, context, className = '' }: OracleCardProps) {
  const [oracle,  setOracle]  = useState<Oracle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getOrCreateOracle(userId, context)
      .then(setOracle)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]); // re-fetch if userId changes (e.g. user signs in)

  if (loading) {
    return (
      <div className={`oracle-card oracle-card--loading ${className}`}>
        <div className="oracle-card__skeleton" aria-label="Loading daily oracle…" />
      </div>
    );
  }

  if (error || !oracle) {
    return (
      <div className={`oracle-card oracle-card--error ${className}`}>
        <p>Oracle unavailable — check your connection and refresh.</p>
      </div>
    );
  }

  return (
    <div className={`oracle-card ${className}`}>
      <header className="oracle-card__header">
        <h2 className="oracle-card__card-name">{oracle.card.name}</h2>
        <time className="oracle-card__date" dateTime={oracle.date}>
          {new Date(oracle.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </time>
      </header>

      <p className="oracle-card__message">{oracle.message}</p>

      {oracle.horoscope && (
        <blockquote className="oracle-card__horoscope">
          {oracle.horoscope}
        </blockquote>
      )}
    </div>
  );
}

export default OracleCard;
