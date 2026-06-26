---
name: okhp3-daily-oracle
description: >
  OverKill Hill P³ three-layer daily reading system combining a tarot card, a daily
  horoscope, and an AI-synthesized oracle message — cached in localStorage so it
  generates once per day and stays stable across page refreshes. Use when building
  daily insight features, horoscope integrations, affirmation systems, oracle widgets,
  or any "word of the day" pattern that should feel personal and consistent within a
  single day. Also use when a user wants to add a tarot, astrology, or AI-powered
  daily message feature to a static or client-only app without a persistent database.
  Activate when someone asks how to build a daily reading, daily card draw, or
  AI-generated daily message — even if they don't mention this skill by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.2.0"
  category: wellness-astrology
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  compatibility: >
    Browser environment. Tarot and horoscope sources are free public APIs (no key
    required). Claude AI message requires an Anthropic API key — delivered via
    Cloudflare Worker proxy (Option A) or direct browser fetch (Option B). See
    "API key delivery" section.
  in_scope:
    - Tarot card draw via tarotapi.dev (live API + deterministic day-of-year fallback)
    - Daily horoscope fetch by zodiac sign via freehoroscopeapi.com
    - AI-synthesized oracle message via Anthropic Claude (Option A or B)
    - localStorage caching per user per day (key pattern + expiry design)
    - Graceful degradation when any layer fails
    - React component integration pattern
    - Prompt context enrichment (moon phase, season, Mercury status, birth sign)
  out_of_scope:
    - Birth chart / natal astrology calculation
    - Multi-day forecasting or trend prediction
    - Server-side persistence or user accounts
    - Push notification delivery of daily readings
    - Non-Claude AI providers
    - Write operations (the oracle only reads data, never writes to external services)
---

# okhp3-daily-oracle

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

A three-layer daily reading system: a tarot card draw, a zodiac-sign horoscope, and
a Claude-generated oracle message woven from both. Generates once per calendar day,
caches the result in localStorage, and degrades gracefully when any layer fails — so
the user always sees *something* meaningful, even fully offline.

---

## Scope

| In scope | Out of scope |
|---|---|
| Tarot card draw (live API + deterministic fallback) | Birth chart / natal astrology |
| Daily horoscope by zodiac sign | Multi-day forecasting |
| AI oracle message via Claude (Option A or B) | Server-side persistence |
| localStorage cache: per-user, per-day key | Push notification delivery |
| Graceful degradation on any layer failure | Non-Claude AI providers |
| React hook + component pattern | Writing to external services |

---

## Architecture overview

```
Day N starts
    ↓
Check localStorage: {appPrefix}:{userId}:oracle:{YYYY-MM-DD}
    ↓ cache miss
Fetch tarot card        → tarotapi.dev (free, no auth)
Fetch daily horoscope   → freehoroscopeapi.com (free, no auth, needs birth sign)
Generate AI message     → Claude API (Option A: CF Worker proxy
                                    / Option B: direct browser fetch)
    ↓
Combine → cache in localStorage → render
    ↓ cache hit (same day, any page refresh)
Serve from localStorage instantly
    ↓
Day N+1: new cache key, new reading
```

---

## Data sources

| Source | URL | Auth | Fallback |
|---|---|---|---|
| Tarot card | `tarotapi.dev/api/v1/cards/random?n=1` | None | 12-card Major Arcana pool, selected by day-of-year |
| Daily horoscope | `freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}` | None | Omit section gracefully |
| Oracle message (AI) | CF Worker URL or `api.anthropic.com` directly | Via Worker or `VITE_ANTHROPIC_API_KEY` | Tarot card's `meaning_up` field |

---

## API key delivery

The Anthropic API requires an `x-api-key` header. Choose one option:

### Option A — Cloudflare Worker proxy (recommended for production)

Keeps the API key server-side. Free at 100k requests/day. ~30 lines of code.
**Use when:** the app is public, multi-user, or you cannot accept any key exposure risk.

```javascript
// Cloudflare Worker — deploy at: your-app-oracle.workers.dev
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://your-domain.com',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    const body = await request.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,   // stored in CF Worker secrets
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system: body.system,
        messages: body.messages,
      }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-domain.com',
      },
    });
  }
};
```

Worker setup:
1. Cloudflare dashboard → Workers & Pages → Create Worker
2. Paste the code above, update `your-domain.com`
3. Settings → Variables → Add Secret: `ANTHROPIC_API_KEY`
4. Deploy → copy the worker URL

Store the worker URL in your app's environment:
```
VITE_ORACLE_WORKER_URL=https://your-app-oracle.workers.dev
```

### Option B — Direct browser fetch (personal / single-user apps only)

Anthropic allows direct browser calls using a special header that signals you accept
the key exposure risk. The key lives client-side in your JS bundle. **Only use for
personal apps where you are the sole user.**

```typescript
async function generateOracleMessage(card: TarotCard, context: OracleContext): Promise<string> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const userPrompt = buildPrompt(card, context);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system: 'You are a warm, grounded daily oracle. Write 2–3 sentences. No clichés.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || card.meaning_up;
  } catch {
    return card.meaning_up;
  }
}
```

Environment variable (Replit Secret or `.env`):
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> **WARNING:** `VITE_` env vars are embedded in your production JS bundle and visible
> to anyone who inspects the source. This is acceptable only for personal, single-user apps.

---

## Implementation

### Step 1 — Fetch the tarot card

```typescript
interface TarotCard {
  name: string;
  meaning_up: string;
  type: string;
  desc: string;
}

async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0];
  } catch {
    // Deterministic fallback — same card for same day of year
    const FALLBACK = [
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
    const doy = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const card = FALLBACK[doy % FALLBACK.length];
    return { name: card.name, meaning_up: card.meaning_up, type: 'major', desc: '' };
  }
}
```

### Step 2 — Fetch the horoscope (optional)

Only fires if the user has set their birth sign. Returns `null` silently on failure.

```typescript
async function fetchHoroscope(sign: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`
    );
    const data = await res.json();
    return data?.data?.horoscope || null;
  } catch {
    return null;
  }
}
```

### Step 3 — Generate the AI oracle message

Build the context prompt, then call your chosen delivery option (A or B — see "API key delivery" above). The prompt integrates moon phase, astrological season, and Mercury status from the `okhp3-celestial-data` skill for richer, more resonant output.

```typescript
interface OracleContext {
  moonPhase?: string;       // e.g. 'Full Moon' — from okhp3-celestial-data
  season?: string;          // e.g. 'Cancer' — from okhp3-celestial-data
  isRetrograde?: boolean;   // from okhp3-celestial-data
  sign?: string;            // user's birth sign from settings
}

function buildPrompt(card: TarotCard, context: OracleContext): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  return [
    `Today is ${today}.`,
    context.moonPhase    ? `The moon is ${context.moonPhase}.` : '',
    context.season       ? `The sun is in ${context.season}.` : '',
    context.isRetrograde ? 'Mercury is currently retrograde.' : '',
    context.sign         ? `This person's sun sign is ${context.sign}.` : '',
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    'Write a 2–3 sentence daily oracle message. Warm, grounded, quietly insightful.',
  ].filter(Boolean).join(' ');
}
```

### Step 4 — Cache and assemble

```typescript
interface Oracle {
  date: string;
  card: TarotCard;
  message: string;
  horoscope: string | null;
}

async function getOrCreateOracle(
  userId: string,
  context: OracleContext,
  appPrefix = 'myapp'
): Promise<Oracle> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = `${appPrefix}:${userId}:oracle:${today}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch tarot + horoscope in parallel; generate AI message after
  const [card, horoscope] = await Promise.all([
    fetchTarotCard(),
    context.sign ? fetchHoroscope(context.sign) : Promise.resolve(null),
  ]);

  const message = await generateOracleMessage(card, context);

  const oracle: Oracle = { date: today, card, message, horoscope };
  localStorage.setItem(cacheKey, JSON.stringify(oracle));
  return oracle;
}
```

---

## React component pattern

```tsx
function OracleCard({ userId, context }: { userId: string; context: OracleContext }) {
  const [oracle, setOracle] = useState<Oracle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateOracle(userId, context)
      .then(setOracle)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Skeleton />;
  if (!oracle)  return null;

  return (
    <div>
      <h3>{oracle.card.name}</h3>
      <p>{oracle.message}</p>
      {oracle.horoscope && <p>{oracle.horoscope}</p>}
    </div>
  );
}
```

---

## Cache key design

The pattern `{appPrefix}:{userId}:oracle:{YYYY-MM-DD}` provides:

- **Per-user isolation** — different users get different readings on the same day
- **Daily stability** — same reading all day, across page refreshes and device sleep
- **Zero-cost expiry** — yesterday's key is simply never accessed again; no TTL needed

If you don't have a `userId` yet, use `'guest'` as a fallback. Old keys accumulate
harmlessly in localStorage — clean them with a periodic sweep if storage matters.

---

## Graceful degradation

The system always produces *something useful*, even when every external call fails:

| Scenario | Output |
|---|---|
| All APIs succeed | Full three-layer reading |
| Tarot API down | Deterministic fallback card by day-of-year |
| Horoscope API down | Reading without horoscope (no error shown to user) |
| Claude proxy / key missing | Tarot card's `meaning_up` field as the message |
| Total offline | Deterministic card + `meaning_up` as message |

---

## Enriching the oracle with celestial context

Pair this skill with `okhp3-celestial-data` for the richest output:

```typescript
import { getMoonPhase, getAstroSeason, getMercuryStatus } from './celestial';

const context: OracleContext = {
  moonPhase:    getMoonPhase().name,
  season:       getAstroSeason().sign,
  isRetrograde: getMercuryStatus().retrograde,
  sign:         userSettings.birthSign,  // e.g. 'cancer'
};

const oracle = await getOrCreateOracle(userId, context);
```

The more contextual signal you pass, the more specific and resonant the message.

---

## Gotchas

- **Always use ISO date for the cache key** — extract with `new Date().toISOString().split('T')[0]`, not `toLocaleDateString()`. The locale-based method produces strings like `"6/26/2026"` that vary by browser locale, silently breaking caching for non-US users and making keys non-sortable.

- **Fallback uses day-of-year, not random** — `doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)`, then `FALLBACK[doy % FALLBACK.length]`. Never use `Math.random()` in the fallback path — the oracle's core contract is daily stability (same card on refresh).

- **The Anthropic browser header is required** — direct browser fetch must include `'anthropic-dangerous-direct-browser-access': 'true'`. Without it Anthropic's API rejects with a CORS error. The env var is `VITE_ANTHROPIC_API_KEY` (not `VITE_ANTHROPIC_KEY`).

- **Old cache keys accumulate silently** — yesterday's and last week's keys remain in localStorage but are never read. If storage size matters, add a periodic sweep: `Object.keys(localStorage).filter(k => k.startsWith('myapp:') && !k.includes(today)).forEach(k => localStorage.removeItem(k))`.

---

## References

- `references/oracle.ts` — full TypeScript implementation. Load when implementing a function from scratch or debugging a type error.

---

## Available scripts

- **`scripts/test-oracle-apis.cjs`** — tests tarotapi.dev and freehoroscopeapi.com connectivity and response shapes. Run before deploying or after an API outage report.
  ```bash
  node .agents/skills/okhp3-daily-oracle/scripts/test-oracle-apis.cjs
  node .agents/skills/okhp3-daily-oracle/scripts/test-oracle-apis.cjs --sign scorpio
  ```

---

## Assets

- **`assets/oracle-component-template.tsx`** — complete copy-paste React component. Load when the user wants a working `OracleCard` implementation to drop into their app.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
