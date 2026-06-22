# CLAUDE.md — Kieran's LifeTrkr

> This file is read automatically by Claude Code at session start.
> It is the single source of truth for project conventions, constraints, and architecture.
> Read it fully before touching any file. Do not skip sections.

---

## Project Identity

**Name:** Kieran's LifeTrkr
**Type:** Mobile-first React SPA — personal life OS
**Live URL:** https://okhp3.github.io/kierans-lifetrkr/#/
**Repo:** https://github.com/OKHP3/kierans-lifetrkr
**Current version:** v0.1.8 (pre-production — see versioning rules below)
**Owner:** Jamie Hill (OKHP3) — stewardship; Kieran Hill — intended permanent owner
**Origin:** Father's Day, June 21, 2026 — Summer Solstice

**Ecosystem position:** Adjacent to OverKill Hill FoundRy (https://github.com/OKHP3/OverKill-Hill-FoundRy)
but NOT part of it. Shares build patterns with mermaid-diagram-bpmn and mermaid-theme-builder.
May contribute to or draw from skillz (SKILL.md patterns) and ReFolDec (design token concepts).

---

## Family Lineage — LOCK THIS IN

The Hill family generational versioning is referenced in the app, the docs, and the easter egg:

```
Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0
```

**Kieran's grandfather's name is VYRLE. Not Virgil. Not Virginia. VYRLE.**
This is not up for correction, inference, or "fixing." It is a proper noun with an unusual spelling.
If you see "Virgil" anywhere in the codebase or docs: replace it with "Vyrle." Always.

**Kieran** is the preferred name. Not Rylee. Not Riley. Kieran.

---

## Architecture — READ BEFORE WRITING A SINGLE LINE

This app is **entirely client-side**. There is no server. There is no backend. There is no database.

```
User's Browser
├── React app (static files from GitHub Pages — gh-pages branch)
├── localStorage: all user data, namespaced by Google sub ID
└── sessionStorage: Google access token only (1hr, never sent to any server)
         ↕                                ↕
  Google Identity Services         Google Calendar API
  (consent popup, GIS library)     Google Tasks API
                                   Anthropic Claude API (via Cloudflare Worker)
                                   tarotapi.dev
                                   freehoroscopeapi.com
```

### What this means in practice

**NEVER add:**
- An Express server, FastAPI, Flask, or any backend framework
- A database connection (PostgreSQL, MongoDB, SQLite, etc.)
- Server-side session handling
- A `.env` file with NOTION_API_KEY, GOOGLE_CLIENT_SECRET, or SESSION_SECRET
- Any `server/` or `api/` folder with server-side code

**The ONE exception:** The Cloudflare Worker (external, not in this repo) holds the Anthropic
API key and proxies oracle requests. It is a 30-line Worker, already deployed at
`https://lifetrkr-oracle.okhp3.workers.dev`. Do not recreate this in-repo.

### Google OAuth — token model only

The app uses the GIS **implicit token model**. This means:
- Client ID only. No Client Secret. No redirect URIs.
- Authorized JavaScript Origins (not redirect URIs) in GCP Console.
- Token lives in `sessionStorage`, expires in 1 hour.
- Silent re-auth via `prompt: 'none'`.

If you see code that handles a callback route, a `code` parameter exchange, or a
`GOOGLE_CLIENT_SECRET` — it is wrong for this architecture. Remove it.

---

## Tech Stack

| Layer | Choice | Critical notes |
|---|---|---|
| Framework | React 18 + Vite | SPA only |
| Language | TypeScript | Strict mode — zero `any` in new code |
| Styling | Tailwind CSS v3 | Use Moonlit Hearth tokens (see below) |
| Routing | React Router v6 **HashRouter** | BrowserRouter will 404 on GitHub Pages |
| State | React Context + useReducer | No Redux, no Zustand, no Jotai |
| Package manager | npm | Not pnpm, not yarn |
| Icons | Tabler Icons (CDN, outline) | `<i className="ti ti-{name}"/>` |
| Fonts | Google Fonts (Cormorant Garamond, DM Sans, Space Mono) | Loaded in index.html |

### Critical Vite configuration

```typescript
// vite.config.ts — DO NOT REMOVE base
export default defineConfig({
  plugins: [react()],
  base: '/kierans-lifetrkr/',  // REQUIRED — without this, GitHub Pages returns blank page
})
```

### HashRouter is mandatory

```typescript
// App.tsx — MUST use HashRouter
import { HashRouter } from 'react-router-dom';
// NOT: BrowserRouter
```

Routes look like `/#/habits`, not `/habits`. This is correct for GitHub Pages.

---

## Design System — Moonlit Hearth

**Aesthetic:** Warmly mystical dark mode. Jewel tones. Not goth. Not neon. Not OKHP3-branded.
Think: Stevie Nicks. Velvet. Candlelight. Black cat. Crescent moon.

### Color tokens (tailwind.config.ts)

```
bg:             #0D0B14   — base background (never use #000000)
surface:        #1A1424   — cards, nav, modals
surfaceRaised:  #251B30   — inputs, hover states
border:         #3A2A4A   — card edges, dividers
textPrimary:    #EAE0F8   — main text (warm white)
textSecondary:  #9B8AB0   — labels, metadata
textMuted:      #7B6A8C   — timestamps, done items
amethyst:       #C4A0E8   — primary CTA, active tab, streaks
amethystDeep:   #9B59FF   — strong accent, crescent fills
gold:           #E8B86D   — calendar events, 30-day streak
sage:           #4ECFA0   — completion states
ruby:           #E83B6F   — high priority, destructive
sapphire:       #3B6FE8   — secondary calendar accent
```

### Typography rules

- **Cormorant Garamond 300** — greeting name on Home ONLY. Nothing else.
- **DM Sans 400/500** — all body text, labels, buttons
- **Space Mono 400** — times, streak counts, version numbers

### Component standards

- Cards: `rounded-2xl border border-border bg-surface p-4`
- Checkboxes: custom circle (not HTML default). Unchecked: hollow border. Checked: `bg-sage` with checkmark.
- FAB: 56px circle, `bg-amethyst`, + icon, bottom-right, 84px from bottom
- Streak badge: moon icon (ti-moon) + count. Turns gold at 30+ days.
- Active nav tab: `text-amethyst`. Inactive: `text-textMuted`.

### What NOT to do visually

- No pure black backgrounds (#000000) — always use `bg` (#0D0B14)
- No cold blue tones — this palette is warm purple-black
- No skull, pentagram, or horror imagery
- No OverKill Hill P³ wordmarks or OKHP3 branding in the app UI
- No em dashes in any user-facing text (house style)

---

## Tab Structure

| # | Label | Route | Icon |
|---|---|---|---|
| 1 | Home | /#/ | ti-home |
| 2 | Rituals | /#/rituals | ti-repeat |
| 3 | Habits | /#/habits | ti-moon |
| 4 | Calendar | /#/calendar | ti-calendar |
| 5 | Today | /#/today | ti-feather |
| 6 | Archive | /#/archive | ti-scroll |
| 7 | Settings | /#/settings | ti-settings (in Home header, not bottom nav) |

---

## localStorage Namespacing — CRITICAL

All data is keyed by `lifetrkr:{googleSubId}:{entity}`. The sub ID comes from
the Google profile stored at `lifetrkr:profile`.

**Always use the `storage` abstraction in `src/lib/storage.ts`.** Never call
`localStorage.setItem` or `localStorage.getItem` directly in components or pages.

```typescript
// CORRECT
import { storage } from '../lib/storage';
storage.set('habits', habits);
storage.get<Habit[]>('habits');

// WRONG — bypasses namespacing
localStorage.setItem('habits', JSON.stringify(habits));
```

---

## External APIs

| Service | URL pattern | Auth | Notes |
|---|---|---|---|
| Google GIS | accounts.google.com/gsi/client (CDN) | Client ID in code | Public — safe to embed |
| Google Calendar | googleapis.com/calendar/v3/ | Bearer token | Read-only |
| Google Tasks | tasks.googleapis.com/tasks/v1/ | Bearer token | Read-only |
| Tarot | tarotapi.dev/api/v1/cards/random?n=1 | None | Falls back to local 12-card array |
| Horoscope | freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign} | None | Skip gracefully if fails |
| Oracle (Claude) | lifetrkr-oracle.okhp3.workers.dev | None (CF Worker proxies) | 150 token max, cached daily |
| Moon phase | Client-side Julian date math | None | src/lib/celestial.ts |

**Never call `api.anthropic.com` directly from the browser.** The Cloudflare Worker
handles that. Call `ORACLE_WORKER_URL` from `src/constants.ts`.

---

## Versioning Discipline

v1.0.0 is not a placeholder. It is earned. We are in pre-production.

```
v0.1.8  — CURRENT (shipped June 22, 2026)
v0.2.0  — NEXT (Google Calendar + Tasks live integration)
v0.3.0  — PLANNED (originally; features shipped early in v0.1.x)
v0.4.0  — Polish, PWA, brand assets
v0.5.0  — Google OAuth verification
v1.0.0  — Reserved: Google-verified, Kieran-owned, public stable
```

When bumping version:
1. Update `APP_VERSION` in `src/constants.ts`
2. Update `version` in `package.json`
3. Commit with message: `chore: bump version to v0.x.x`

---

## Build and Deploy

```bash
# Development
npm run dev          # Vite dev server at localhost:5173

# Type check only (no build)
npx tsc --noEmit

# Full build
npm run build        # tsc + vite build → dist/

# Deploy to GitHub Pages
npm run deploy       # npm run build && gh-pages -d dist
```

**The deploy command pushes `dist/` to the `gh-pages` branch.**
The `main` branch holds source code. GitHub Pages serves from `gh-pages`.

After deploy: verify https://okhp3.github.io/kierans-lifetrkr/#/ loads correctly.

---

## Files You Will Encounter

```
src/
├── pages/              # One file per tab (Home, Rituals, Habits, Calendar, Today, Archive, Settings)
├── components/         # Shared UI: BottomNav, Card, Checklist, RecurrenceEditor, CategoryPicker,
│                       #            OracleCard, CelestialBadge, GoogleConnectButton, TokenExpiryBanner
├── context/            # AppContext.tsx + AppReducer.ts
├── hooks/              # useGoogleAuth, useCalendarEvents, useGoogleTasks, useOracle
├── lib/
│   ├── storage.ts      # Namespaced localStorage — ALWAYS use this, never raw localStorage
│   ├── date.ts         # Date utils, getSeasonalBadge, isActiveToday
│   ├── celestial.ts    # getMoonPhase, getAstroSeason, getMercuryStatus, getNextLunarEvents
│   ├── oracle.ts       # fetchTarotCard, fetchHoroscope, generateOracleMessage, getOrCreateOracle
│   ├── googleCalendar.ts
│   └── googleTasks.ts
├── types.ts            # ALL TypeScript interfaces — canonical schema
├── constants.ts        # GOOGLE_CLIENT_ID, ORACLE_WORKER_URL, CATEGORIES, APP_VERSION
├── App.tsx             # HashRouter + Routes
└── main.tsx
docs/                   # PRD-v4.0.md is the current build brief
                        # PRD-v3.0.md is the canonical product vision
                        # DESIGN.md is the full Moonlit Hearth spec
```

---

## Hard Rules

1. **Vyrle. Not Virgil.** See Family Lineage section.
2. **HashRouter. Not BrowserRouter.** See Architecture section.
3. **`base: '/kierans-lifetrkr/'` in vite.config.ts.** Non-negotiable.
4. **Use `storage.ts`. Never raw localStorage.** See localStorage Namespacing.
5. **No backend. No server. No Express.** See Architecture section.
6. **No `api.anthropic.com` direct calls.** Route through Cloudflare Worker.
7. **No em dashes in user-facing text.** House style.
8. **No OKHP3 branding in the UI.** Adjacent project, not OverKill Hill-branded.
9. **Read docs/PRD-v4.0.md before starting any feature session.**
10. **Run `npx tsc --noEmit` before `npm run deploy`.**

---

## Ecosystem Cross-Reference

This project is adjacent to — and may borrow from or contribute to — the following OKHP3 repos:

| Repo | Relationship | Potential exchange |
|---|---|---|
| mermaid-diagram-bpmn | Shared build pattern (Vite + TS + GitHub Pages) | Sync scripts, .agents/ pattern, GitHub Actions workflow |
| mermaid-theme-builder | Shared design token philosophy | Moonlit Hearth palette may formalize as a ReFolDec-compatible theme |
| skillz | SKILL.md ecosystem | Oracle, celestial, and habit-tracking logic could become SKILL.md entries |
| ReFolDec | Abstract palette token system | Moonlit Hearth color tokens are ReFolDec-adjacent |
| OverKill-Hill-FoundRy | Parent org | LifeTrkr is adjacent but independent. Do not add FoundRy branding. |

---

## Security Posture

- `VITE_GOOGLE_CLIENT_ID` — safe to embed in client code by design (Google's intent)
- `VITE_ORACLE_WORKER_URL` — safe to embed (public URL, no secret)
- `ANTHROPIC_API_KEY` — lives in Cloudflare Worker secrets ONLY. Never in this repo.
- No other secrets belong in this codebase.
- `.env` is in `.gitignore`. `.env.example` shows all variables with empty values.
- If you find a committed secret: flag it immediately, do not push, rotate the key.

---

*CLAUDE.md — Kieran's LifeTrkr · v0.1.8*
*Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0*
*MIT License*

---

## Agent Skills Available in This Repo

Four Agent Skills (SKILL.md format, agentskills.io standard) live in `.claude/skills/`.
Agents load them automatically on relevant tasks.

| Skill | Trigger | Location |
|---|---|---|
| `celestial-data` | Moon phase, astrological season, Mercury retrograde | `.claude/skills/celestial-data/` |
| `google-gis-client-auth` | Google OAuth without a backend, static site auth | `.claude/skills/google-gis-client-auth/` |
| `daily-oracle` | Daily tarot / horoscope / AI-synthesized reading | `.claude/skills/daily-oracle/` |
| `vite-github-pages` | Deploy Vite SPA to GitHub Pages, blank page, 404 | `.claude/skills/vite-github-pages/` |

These skills are publishable to OKHP3/skillz and agentskills.io independently of this repo.
