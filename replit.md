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
│   ├── pages/               # Home, Calendar, Today, Someday, Rituals, Habits, Settings
│   ├── types.ts             # All TypeScript types
│   ├── constants.ts         # GOOGLE_CLIENT_ID, SCOPES, DAILY_QUOTES, SEASONAL_DATES
│   ├── App.tsx              # HashRouter + Routes (7 routes incl. /settings)
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
- **Google auth:** Client-side OAuth token via `window.google.accounts.oauth2.initTokenClient`. Token stored in `sessionStorage` (expires after ~1 hour). Requires only `VITE_GOOGLE_CLIENT_ID` (a public value, not a secret).

## Phase Status

| Phase | Feature | Status |
|---|---|---|
| Current | Full UI shell, local browser data | ✅ Current |
| Integration | Google Calendar and Tasks | 🔧 Wired, release evidence pending |
| Future | Notion backend sync | 📋 Not planned for the current client-only product |

## Environment Variables

The current optional browser configuration is:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_ANTHROPIC_API_KEY=YOUR_KEY_IF_USING_DIRECT_ORACLE
```

Set values as Replit Secrets or in a local `.env` file. The app runs without either;
Google sections remain unavailable and the oracle uses its local fallback. The direct
Anthropic browser path is not approved for a public stable release until its key
exposure is resolved. See `docs/RELEASE-TRUTH-BASELINE.md`.

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
5. Run `npm run deploy` from Kieran's machine to publish to GitHub Pages

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
