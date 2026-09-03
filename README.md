# Kieran's LifeTrkr

> A mobile-first, dark-mode personal life OS. Rituals, habits, calendar, tasks,
> and a daily oracle — one interface, no noise.

**Live:** https://okhp3.github.io/kierans-lifetrkr/#/
**Status:** v0.1.10 pre-production · approve-with-limits; stable release deferred pending evidence
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
| Someday | Deferred tasks — the "I'll get to it" backlog |

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
├── Versioned service worker (offline app shell only)
├── localStorage: rituals, habits, tasks, settings (keyed by Google sub ID)
└── sessionStorage: Google access token (1hr expiry, never sent to any server)
         ↕                              ↕
  Google Identity Services       Google Calendar API
  (consent popup, token grant)   Google Tasks API
                                  Optional oracle worker → Anthropic Claude
                                 tarotapi.dev
                                 freehoroscopeapi.com
```

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (dark mode, mobile-first) |
| Routing | React Router v7 — HashRouter (required for GitHub Pages) |
| Auth | Google Identity Services (GIS) — token model, Client ID only |
| Calendar | Google Calendar API v3 (browser fetch, read-only) |
| Tasks | Google Tasks API v1 (browser fetch, read-only) |
| Oracle | Local tarot/celestial fallback, with optional Claude wording via a server-side worker |
| Tarot | tarotapi.dev (free, no auth, CORS-enabled) |
| Horoscope | freehoroscopeapi.com (free, no auth) |
| Moon data | Client-side Julian date math — no API required |
| Deploy | GitHub Actions → GitHub Pages |

---

## Project Structure

```
src/
├── context/
│   ├── AppContext.tsx          # useReducer state + localStorage persistence
│   └── ThemeContext.tsx        # dark / light / system theme
├── components/
│   ├── BottomNav.tsx           # Mobile tab bar (6 tabs, ≤767px)
│   ├── CategoryPicker.tsx      # 31-category picker (Spiritual + Daily groups)
│   ├── CheckCircle.tsx         # Animated completion toggle
│   ├── DescriptionField.tsx    # Multi-line description input
│   ├── FilterBar.tsx           # Horizontal scrollable filter chips
│   ├── GoogleConnectButton.tsx # GIS OAuth initiation + connection status
│   ├── MobileHeader.tsx        # Mobile page header with back nav
│   ├── OracleCard.tsx          # Daily oracle display (tarot + moon + Claude msg)
│   ├── RecurrenceEditor.tsx    # Full recurrence rule UI
│   ├── SideNav.tsx             # Desktop sidebar (7 items, ≥768px)
│   ├── TagInput.tsx            # Chip-based tag input with kebab normalization
│   ├── ThemeToggle.tsx         # Dark / Light / Auto switcher
│   ├── Toast.tsx               # Toast notification with undo
│   └── TokenExpiryBanner.tsx   # Global Google token expiry warning
├── hooks/
│   ├── useGoogleAuth.ts        # GIS token flow, sessionStorage, expiry tracking
│   ├── useOracle.ts            # Oracle fetch orchestration (once per day)
│   └── useToast.ts             # Toast queue and auto-dismiss
├── lib/
│   ├── celestial.ts            # Moon phase math, astro seasons, Mercury Rx calendar
│   ├── cosmic.ts               # Deterministic daily cards and wisdom
│   ├── date.ts                 # Date helpers, greeting, seasonal badge, quote
│   ├── googleCalendar.ts       # Google Calendar API v3 fetch
│   ├── googleTasks.ts          # Google Tasks API v1 fetch
│   ├── oracle.ts               # Three-layer oracle stack (tarot / horoscope / Claude)
│   └── storage.ts              # localStorage abstraction, namespaced by sub
├── pages/
│   ├── Home.tsx                # Dashboard: rituals, oracle, upcoming, habits, tasks
│   ├── Rituals.tsx             # Day-of-week ritual template editor
│   ├── Habits.tsx              # Habit list with 7-day grid and streak counter
│   ├── Calendar.tsx            # Month grid + Google Calendar + moon phases + oracle
│   ├── Today.tsx               # Committed tasks (status=today) + Google Tasks
│   ├── Someday.tsx             # Deferred backlog (status=backlog), search, sort, promote
│   ├── Settings.tsx            # Profile, Google, oracle/celestial, theme, social
│   └── Privacy.tsx             # Published privacy notice and service boundaries
├── types.ts                    # All TypeScript types (source of truth)
├── constants.ts                # GOOGLE_CLIENT_ID, SCOPES, APP_VERSION, categories
└── App.tsx                     # HashRouter + app and privacy routes
```

---

## Development

```bash
npm install
npm run dev       # http://localhost:5000
npm run build     # type-check + production build
npm run sync      # type-check → reconcile origin/main → safe push
```

Supported toolchain: Node.js 20.19+ and npm 10+. For a clean, reproducible
install use `npm ci`; the lockfile is the source of dependency versions.

The app has an installable web manifest, responsive standalone layout, and a
versioned service worker (`lifetrkr-shell-v1`). After the shell has been loaded
once online, the worker precaches the built app shell and same-origin hashed
assets for offline reloads. It does not cache user data or external responses.
Local records remain available offline; Google Calendar/Tasks sync is paused and
the optional network oracle wording is unavailable until connectivity returns.
The local tarot and celestial fallback remains available.

Google uses a public OAuth Client ID. The optional oracle worker URL is also
safe to expose in the client because it contains no provider credential.

GitHub Actions builds and deploys GitHub Pages from `main`; no `gh-pages`
branch is used. See [`docs/GIT-SYNC.md`](docs/GIT-SYNC.md) for remote-ahead,
conflict, verification, and emergency rollback procedures.

```
VITE_GOOGLE_CLIENT_ID=your_gcp_client_id.apps.googleusercontent.com
VITE_ORACLE_WORKER_URL=https://your-worker.example
```

`VITE_GOOGLE_CLIENT_ID` is a public OAuth Client ID — safe to embed in client
code. `VITE_ORACLE_WORKER_URL` is optional. The browser never receives an
Anthropic API key. Without the worker, the oracle uses the tarot card's upright
meaning and remains fully local. The app runs without either variable set.

LifeTrkr keeps personal records in browser storage and does not send profile,
task, habit, or calendar data to the oracle. See the Privacy & Data section in
Settings and `docs/HANDOFF.md` for the provider boundary.

See `.env.example` for the full list.

For the current vision-to-delivery crosswalk, evidence tiers, and release
boundary, see [`docs/VISION-DELIVERY-MATRIX.md`](docs/VISION-DELIVERY-MATRIX.md).

---

## Privacy

LifeTrkr's published privacy notice is available at
[`https://okhp3.github.io/kierans-lifetrkr/#/privacy`](https://okhp3.github.io/kierans-lifetrkr/#/privacy).
It describes browser storage, the optional read-only Google connection, third-party
browser services, and the local oracle fallback. The current implementation is
personal-use ready with bounded evidence; Google production verification and
unrestricted public-user approval are not claimed. The owner-facing consent
checklist is [`docs/OAUTH-CONSENT-CHECKLIST.md`](docs/OAUTH-CONSENT-CHECKLIST.md).

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
| v0.1.10 | PRE-PRODUCTION | Current source baseline; core UI and integrations are not fully release-proven |
| v0.2.0 | Deferred | Google Calendar + Tasks evidence and scope review |
| v0.3.0+ | Planned | Reliability, privacy, accessibility, PWA, and release work |
| v1.0.0 | Reserved | Google-verified, Kieran-owned, public stable release |

---

## Docs

| File | Contents |
|---|---|
| `docs/PRD-v4.0.md` | Historical build brief — intent and dated planning context |
| `docs/PRD-v3.0.md` | Complete product vision and TypeScript type definitions |
| `docs/DESIGN.md` | Moonlit Hearth design system — full color, type, component spec |
| `docs/HANDOFF.md` | Jamie → Kieran ownership transfer checklist |
| `docs/ARCHITECTURE.md` | Client-only architecture decisions and rationale |
| `docs/RELEASE-TRUTH-BASELINE.md` | Current artifact inventory, claims, gates, and validation protocol |
| `docs/DEPLOYMENT-CHECKLIST.md` | Clean install, Pages artifact, route, and offline-claim checks |
| `docs/RELEASE-REVIEW-RECORD.md` | Frozen candidate identity, evidence ledger, review, risks, and decision |
| `docs/VISION-DELIVERY-MATRIX.md` | Current vision-to-delivery crosswalk and evidence-tiered release boundary |
| `docs/OAUTH-CONSENT-CHECKLIST.md` | Exact owner-facing Google OAuth consent and verification checklist |

---

## Ownership

Stewarded by Jamie Hill during development.
Intended for transfer to Kieran when stable.
See `docs/HANDOFF.md` for the complete transfer checklist and timing.
