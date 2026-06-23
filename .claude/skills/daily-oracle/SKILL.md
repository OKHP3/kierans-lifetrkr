---
name: daily-oracle
description: >
  Generates a personalized daily reading by combining a tarot card, a daily horoscope,
  and an AI-synthesized message — all cached in localStorage so it generates once per
  day and stays stable. Use when building daily insight features, horoscope integrations,
  affirmation systems, or any "word of the day" pattern that should feel personal and
  consistent within a single day. Also use when a user wants to add a tarot, astrology,
  or AI-powered daily message feature to an app without a persistent database.
license: MIT
metadata:
  author: Jamie Hill (OKHP3 / OverKill Hill P³)
  version: "1.1"
  origin: Kieran's LifeTrkr (https://github.com/OKHP3/kierans-lifetrkr)
  published-via: OKHP3/skillz
compatibility: >
  Browser environment. Tarot and horoscope sources are free public APIs (no key required).
  Claude AI message: two delivery options — Cloudflare Worker proxy (recommended for production,
  API key stays server-side) or direct browser fetch with anthropic-dangerous-direct-browser-access
  header (acceptable for personal single-user apps). See "API key delivery" section below.
---

# daily-oracle

A three-layer daily reading system that combines a tarot card, a daily horoscope,
and an AI-synthesized oracle message. Generates once per day and caches the result
in localStorage. Degrades gracefully if any layer fails.

## Architecture overview

```
Day N starts
    ↓
Check localStorage cache key: myapp:{userId}:oracle:{YYYY-MM-DD}
    ↓ cache miss
Fetch tarot card        → tarotapi.dev (free, no auth)
Fetch daily horoscope   → freehoroscopeapi.com (free, no auth, needs birth sign)
Generate AI message     → Claude API (via proxy or direct browser fetch — see "API key delivery")
    ↓
Combine all three → cache in localStorage → render
    ↓
Day N+1: same flow, new key, new reading
```

## Data sources

| Source | URL | Auth | Fallback |
|---|---|---|---|
| Tarot card | `tarotapi.dev/api/v1/cards/random?n=1` | None | Hardcoded 12-card Major Arcana pool, selected by day-of-year |
| Daily horoscope | `freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}` | None | Omit section gracefully |
| Oracle message (AI) | Your Claude proxy URL | Via proxy | Use tarot card's `meaning_up` field as fallback |

## API key delivery

The Anthropic API requires an `x-api-key` header. Two approaches, depending on context:

### Option A — Cloudflare Worker proxy (recommended for production)

Keeps the API key server-side. Free at 100k requests/day. ~30 lines of code.
Use when: the app is public, multi-user, or you cannot accept any key exposure risk.

Deploy a Worker that holds your API key in secrets and accepts POST requests from
your app's domain:

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
        model: 'claude-sonnet-4-6',
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
2. Paste the code above
3. Settings → Variables → Add Secret: `ANTHROPIC_API_KEY`
4. Deploy → copy the worker URL

Store the worker URL as an environment variable:
```
VITE_ORACLE_WORKER_URL=https://your-app-oracle.workers.dev
```

### Option B — Direct browser fetch (personal / single-user apps only)

Anthropic allows direct browser calls using a special header that signals you
accept the risk of key exposure. The key must be stored client-side (e.g. as a
`VITE_` env var), which is visible in your JS bundle. Only use for personal apps
where you are the sole user and the exposure risk is acceptable to you.

```typescript
async function generateOracleMessage(card: TarotCard, context: OracleContext): Promise<string> {
  const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  // ... build userPrompt ...
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
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

Environment variable (Replit Secret — not a server secret, but not shared publicly):
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Implementation

### Step 1 — Fetch the tarot card

```typescript
async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0];
  } catch {
    // Deterministic fallback — same card for same day each year
    const FALLBACK = [
      { name: 'The Star',      meaning_up: 'Hope, renewal, trust in the unfolding.' },
      { name: 'The Moon',      meaning_up: 'Cycles, dreams, what lies beneath.' },
      { name: 'The Sun',       meaning_up: 'Clarity, vitality, things coming to light.' },
      { name: 'Temperance',    meaning_up: 'Balance, patience, the middle path.' },
      { name: 'Strength',      meaning_up: 'Inner courage, gentle power, compassion.' },
      { name: 'The Hermit',    meaning_up: 'Stillness, inner guidance, turning inward.' },
      { name: 'The World',     meaning_up: 'Completion, wholeness, the journey fulfilled.' },
      { name: 'The Empress',   meaning_up: 'Abundance, creativity, nurturing life.' },
      { name: 'The High Priestess', meaning_up: 'Intuition, inner knowing, the unseen.' },
      { name: 'Judgement',     meaning_up: 'Awakening, reckoning, the call toward purpose.' },
      { name: 'Wheel of Fortune', meaning_up: 'Change, cycles, forces larger than yourself.' },
      { name: 'The Fool',      meaning_up: 'New beginnings, open heart, the unknown.' },
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

Only fires if the user has set their birth sign:

```typescript
async function fetchHoroscope(sign: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`
    );
    const data = await res.json();
    return data?.data?.horoscope || null;
  } catch {
    return null; // skip gracefully
  }
}
```

### Step 3 — Generate the AI oracle message

```typescript
async function generateOracleMessage(
  card: TarotCard,
  context: { moonPhase?: string; season?: string; sign?: string; isRetrograde?: boolean }
): Promise<string> {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const userPrompt = [
    `Today is ${today}.`,
    context.moonPhase   ? `The moon is ${context.moonPhase}.` : '',
    context.season      ? `The sun is in ${context.season}.` : '',
    context.isRetrograde ? 'Mercury is currently retrograde.' : '',
    context.sign        ? `This person's sun sign is ${context.sign}.` : '',
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    'Write a 2–3 sentence daily oracle message. Warm, grounded, quietly insightful.',
  ].filter(Boolean).join(' ');

  // Option A: CF Worker proxy (VITE_ORACLE_WORKER_URL)
  // Option B: Direct browser fetch — see "API key delivery" section above
  const proxyUrl = import.meta.env.VITE_ORACLE_WORKER_URL;
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'You are a warm, grounded daily oracle. Write 2–3 sentences. No clichés.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || card.meaning_up;
  } catch {
    return card.meaning_up; // always have something to show
  }
}
```

### Step 4 — Cache and assemble

```typescript
async function getOrCreateOracle(userId: string, context: OracleContext): Promise<Oracle> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = `myapp:${userId}:oracle:${today}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const [card, horoscope] = await Promise.all([
    fetchTarotCard(),
    context.sign ? fetchHoroscope(context.sign) : Promise.resolve(null),
  ]);

  const message = await generateOracleMessage(card, context);

  const oracle = { date: today, card, message, horoscope };
  localStorage.setItem(cacheKey, JSON.stringify(oracle));
  return oracle;
}
```

## React component pattern

```tsx
function OracleCard({ userId, context }: Props) {
  const [oracle, setOracle] = useState<Oracle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateOracle(userId, context)
      .then(setOracle)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Skeleton />;
  if (!oracle) return null;

  return (
    <div>
      <h3>{oracle.card.name}</h3>
      <p>{oracle.message}</p>
      {oracle.horoscope && <p>{oracle.horoscope}</p>}
    </div>
  );
}
```

## Cache key design

The cache key pattern `myapp:{userId}:oracle:{YYYY-MM-DD}` provides:
- **Per-user isolation** — different users get different readings
- **Daily stability** — the same reading all day, even across page refreshes
- **Automatic expiry** — yesterday's reading is simply never accessed again
  (no explicit TTL needed; old keys can be cleaned up periodically)

If you don't have a userId yet, use `guest` as a fallback.

## Customizing the AI prompt

The oracle context object passed to `generateOracleMessage` can be expanded to include:
- Current moon phase (from the `celestial-data` skill)
- Astrological season (from the `celestial-data` skill)
- Mercury retrograde status (from the `celestial-data` skill)
- User's sun sign (from a settings screen)
- User's mood (from a mood-check prompt)
- Day of the week

The more contextual signal you pass, the more specific and resonant the message feels.

## Graceful degradation

The system produces *something useful* even when every external call fails:

| Scenario | Output |
|---|---|
| All APIs succeed | Full three-layer reading |
| Tarot API down | Deterministic fallback card by day-of-year |
| Horoscope API down | Reading without horoscope (no error shown) |
| Claude proxy down | Tarot card's `meaning_up` field as the message |
| Total offline | Deterministic card + `meaning_up` as message |

## Files

- `references/oracle.ts` — Full TypeScript implementation
