# Kieran's LifeTrkr

> A mobile-first, dark-mode personal life OS. Rituals, habits, calendar, tasks,
> and a daily oracle — one interface, no noise.

**Live:** https://okhp3.github.io/kierans-lifetrkr/#/
**Status:** v0.1.x deployed · v0.2.0 (Google Calendar + Tasks) in progress
**License:** MIT — free to use, fork, and build on

---

## Origin

Started on Father's Day, June 21, 2026 — the Summer Solstice — as a build session
between Jamie Hill (OverKill Hill P³) and his daughter Kieran.

Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0.

If this sparked something for you, a nod to where it came from is appreciated.

---

## What It Does

One question, answered fast: **What does today require from me?**

| Tab | Purpose |
|---|---|
| Home | Dashboard: today's ritual, upcoming events, daily oracle |
| Rituals | Day-of-week templates with recurrence and category tags |
| Habits | Daily tracking with moon-streak counter |
| Calendar | Google Calendar sync + lunar phase calendar layer |
| Today | Committed tasks + Google Tasks due today |
| Archive | Master backlog + someday list |

---

## Architecture

**Entirely client-side. No server. No publisher-managed database.**

The OAuth handshake between the user and Google happens in the user's browser
via the Google Identity Services (GIS) library. The publisher never sees,
stores, or touches any user credential or calendar data.

All user data lives in the user's own browser (localStorage, namespaced by
Google sub ID). Any user can visit the URL, connect their Google account, and
the app is theirs.

```
User's Browser
├── React app (served from GitHub Pages — static files only)
├── localStorage: rituals, habits, tasks, settings (keyed by Google sub ID)
└── sessionStorage: Google access token (1hr expiry, never sent to any server)
         ↕                              ↕
  Google Identity Services       Google Calendar API
  (consent popup, token grant)   Google Tasks API
                                 Anthropic Claude API (direct browser fetch)
                                 tarotapi.dev
                                 freehoroscopeapi.com
```

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v3 (dark mode, mobile-first) |
| Routing | React Router v6 — HashRouter (required for GitHub Pages) |
| Auth | Google Identity Services (GIS) — token model, Client ID only |
| Calendar | Google Calendar API v3 (browser fetch, read-only) |
| Tasks | Google Tasks API v1 (browser fetch, read-only) |
| Oracle | claude-sonnet-4-5 via direct browser fetch (`VITE_ANTHROPIC_API_KEY`) |
| Tarot | tarotapi.dev (free, no auth, CORS-enabled) |
| Horoscope | freehoroscopeapi.com (free, no auth) |
| Moon data | Client-side Julian date math — no API required |
| Deploy | gh-pages npm package → GitHub Pages |

---

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run deploy    # build → push to gh-pages → live
```

Two environment variables. Both set as Replit Secrets.

```
VITE_GOOGLE_CLIENT_ID=your_gcp_client_id.apps.googleusercontent.com
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

`VITE_GOOGLE_CLIENT_ID` is a public OAuth Client ID — safe to embed in client
code. `VITE_ANTHROPIC_API_KEY` enables the Claude daily oracle message; without
it the oracle falls back to the tarot card's upright meaning. Both have graceful
fallbacks — the app runs fully without either key set.

See `.env.example` for the full list.

---

## Design System

**Moonlit Hearth** — warmly mystical dark mode. Jewel tones: amethyst · gold ·
sage · ruby · sapphire. Black cat energy. Stevie Nicks adjacent. Not goth.
Not OKHP3-branded.

Full spec in `docs/DESIGN.md`.

---

## Pre-1.0 Versioning

v1.0.0 is not a placeholder — it is earned.

| Version | Status | Description |
|---|---|---|
| v0.1.x | LIVE | UI shell, localStorage, Google auth button |
| v0.2.0 | In progress | Google Calendar + Tasks live integration |
| v0.3.0 | Planned | Close remaining gaps (dark default, About, Regenerate oracle, activate Claude) |
| v0.4.0 | Planned | Brand assets, PWA, polish |
| v0.5.0 | Planned | Privacy policy, Google OAuth verification |
| v1.0.0 | Reserved | Google-verified, Kieran-owned, public stable release |

---

## Docs

| File | Contents |
|---|---|
| `docs/PRD-v4.0.md` | Current agent build brief — drives v0.2.0 + v0.3.0 |
| `docs/PRD-v3.0.md` | Complete product vision and TypeScript type definitions |
| `docs/DESIGN.md` | Moonlit Hearth design system — full color, type, component spec |
| `docs/HANDOFF.md` | Jamie → Kieran ownership transfer checklist |
| `docs/ARCHITECTURE.md` | Client-only architecture decisions and rationale |

---

## Ownership

Stewarded by Jamie Hill during development.
Intended for transfer to Kieran when stable.
See `docs/HANDOFF.md` for the complete transfer checklist and timing.
