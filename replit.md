# Kieran's LifeTrkr

A personal life-management web app for Kieran — covering rituals, habits, tasks, and calendar in a single dark-mode mobile-first interface. Designed with the "Moonlit Hearth" aesthetic (warm mystical dark, inspired by Stevie Nicks / celestial / velvet).

## Project Structure

```
kieran-lifetrkr/
├── src/                     # React (Vite + TypeScript) frontend
│   ├── context/             # AppContext (useReducer + localStorage), ThemeContext
│   ├── components/          # BottomNav, SideNav, ThemeToggle, CheckCircle, Toast,
│   │                        #   GoogleConnectButton, TokenExpiryBanner
│   ├── hooks/               # useGoogleAuth, useToast
│   ├── lib/                 # storage.ts, date.ts, googleCalendar.ts, googleTasks.ts
│   ├── pages/               # Home, Calendar, Today, Someday, Rituals, Habits, Settings, Origin, Privacy
│   ├── types.ts             # All TypeScript types
│   ├── constants.ts         # GOOGLE_CLIENT_ID, SCOPES, DAILY_QUOTES, SEASONAL_DATES
│   ├── App.tsx              # HashRouter + Routes (9 current routes)
│   └── main.tsx             # Entry point
├── docs/                    # PRD, Architecture, Design System, Roadmap, Handoff
├── vite.config.ts           # Vite — host 0.0.0.0:5000, no proxy, base conditional
├── tailwind.config.js       # Moonlit Hearth color tokens
├── tsconfig.json            # TypeScript config
└── package.json             # Root; npm scripts for dev, build, deploy
```

## Running the App

```bash
npm run dev          # Starts Vite dev server on port 5000
npm run build        # Type-checks (tsc) then builds to /dist
npm run build        # type-check + production build
npm run preview      # Preview the production build locally
```

## Architecture (current implementation)

- **Frontend:** React 19 + Vite 8 + **TypeScript** SPA, Tailwind CSS v4 (dark/light/system), state in localStorage via React Context + useReducer
- **Router:** **HashRouter** (react-router-dom v7) — required for GitHub Pages compatibility
- **No backend:** Express server removed. Google auth is **client-side GIS** (Google Identity Services token flow)
- **Deploy:** GitHub Actions builds and deploys `/dist` to GitHub Pages on pushes to `main`
- **Release branch:** `main` is the only release branch; no `gh-pages` branch is used
- **Release sync:** `npm run sync` type-checks, fetches `origin/main`, reconciles
  remote-ahead/divergent histories non-destructively, pushes without force, and
  verifies convergence. See `docs/GIT-SYNC.md`.
- **Google auth:** Client-side OAuth token via `window.google.accounts.oauth2.initTokenClient`. Token stored in `sessionStorage` (expires after ~1 hour). Requires only `VITE_GOOGLE_CLIENT_ID` (a public value, not a secret).

## Phase Status

| Phase | Feature | Status |
|---|---|---|
| Current | Full UI shell, local browser data, local oracle fallback, PWA shell | ✅ v0.1.10 pre-production |
| Integration | Google Calendar and Tasks | 🔧 Source/local-harness checked; owner real-account evidence pending |
| Release | Public stable / v1.0.0 | ⏸ Deferred until owner-run live and manual gates close |
| Out of scope | Notion backend sync and Google writes | 🚫 Excluded by the current client-only/read-only boundary |

## Environment Variables

The current optional browser configuration is:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_ORACLE_WORKER_URL=https://your-worker.example
```

Set values as Replit Secrets or in a local `.env` file. The app runs without either;
Google sections remain unavailable and the oracle uses its local fallback. The direct
Anthropic browser path is not supported. If Claude wording is enabled, the provider
credential remains only in the optional worker's secret store. See
`docs/RELEASE-TRUTH-BASELINE.md`.

## Design System — Moonlit Hearth

### Colors
- Background: `#0D0B14` (deep midnight purple-black)
- Surface: `#1A1424` (cards, nav)
- Accent: `#C4A0E8` (amethyst — active nav, CTAs, streaks)
- Light mode: `#F7F3FF` bg, `#7B4FBF` accent (Morning Parchment)

### Typography
- Display: Cormorant Garamond (serif) — page titles, headers
- Body: DM Sans — all other text
- Mono: Space Mono — timestamps, streaks, labels, version

## Navigation

- **Mobile (< 768px):** BottomNav with 6 tabs (Home, Calendar, Today, Someday, Rituals, Habits)
- **Desktop (≥ 768px):** SideNav with 7 items (all 6 + Settings), bottom nav hidden
- **Settings:** Accessible via gear icon in Home header AND as 7th SideNav item (not in BottomNav)

## Data Schema (localStorage)

Namespaced under `lifetrkr:{sub}:` where `sub` is the Google user ID (or `'guest'` if not connected).

| Key | Type | Notes |
|---|---|---|
| `lifetrkr:profile` | `GoogleProfile` | Not namespaced; top-level |
| `lifetrkr:{sub}:settings` | `UserSettings` | Display name, pronouns, birthday, social, theme prefs |
| `lifetrkr:{sub}:routineTemplates` | `RoutineTemplate[]` | One per day of week, with `items[]` |
| `lifetrkr:{sub}:routineCompletions` | `RoutineCompletion[]` | Per-date, per-template completion arrays |
| `lifetrkr:{sub}:habits` | `Habit[]` | Active habits with color tags |
| `lifetrkr:{sub}:habitCompletions` | `HabitCompletion[]` | Per-habit, per-date records |
| `lifetrkr:{sub}:tasks` | `Task[]` | status: `'today'` \| `'done'` \| `'backlog'` |

## Account Transition Plan (Jamie → Kieran)

1. Fork/transfer the Repl to Kieran's Replit account
2. Transfer the GitHub repo to Kieran's GitHub
3. Set `VITE_GOOGLE_CLIENT_ID` as a Replit Secret in Kieran's Repl
4. *(Optional)* Create a new GCP project / OAuth 2.0 Client ID under Kieran's Google account
5. Run `npm run sync` from Kieran's machine to publish through GitHub Actions

## Version History

| Version | Author | Notes |
|---|---|---|
| v0.0 | Ralph | Initial concept |
| v1.0 | Virgil | First working build |
| v2.0 | Jamie | Full feature set (JSX + Express) |
| v3.0 | Kieran | TypeScript migration, HashRouter, client-side Google auth, gh-pages |

Built on Father's Day, Summer Solstice 2026. The fourth hill. ✦

## User Preferences

- App is for Kieran's personal use — single user, no server-side auth needed
- Dark mode default, with theme toggle available (dark / light / system)
- Mobile-first layout, max-width 480px on mobile; desktop sidebar at ≥ 768px

## Release truth

The current release is `v0.1.10`, approved with limits for controlled
pre-production use. It is not a stable or `v1.0.0` release. See
`docs/VISION-DELIVERY-MATRIX.md` for the capability crosswalk and
`docs/RELEASE-TRUTH-BASELINE.md` for evidence and expiry rules.
