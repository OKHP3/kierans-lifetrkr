# Kieran's LifeTrkr

> A dark-mode personal life OS. Rituals, habits, calendar, tasks, and archive — one interface, zero noise.

**Version:** v0.1.0  
**Status:** Phase 1 — UI Shell (live)  
**Stack:** React 18 · Vite 5 · TypeScript · Tailwind CSS  
**Aesthetic:** Moonlit Hearth — warmly mystical dark mode

---

## What It Does

Kieran's LifeTrkr is a mobile-first personal organization app built around one question:

**What does today require from me?**

Six tabs. One user. No corporate productivity overhead.

| Tab | Purpose |
|---|---|
| Home | Today's rituals, upcoming events, at-a-glance dashboard |
| Rituals | Day-of-week routine templates (Sun through Sat) |
| Habits | Daily practice tracking with moon-streak counter |
| Calendar | Google Calendar sync (Phase 1.5) |
| Today | Committed tasks for the current day |
| Archive | Master backlog — the someday list |

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite 5 | SPA, fast HMR |
| Language | TypeScript | Strict typing throughout |
| Styling | Tailwind CSS | Moonlit Hearth tokens, mobile-first |
| State | React Context + useReducer | localStorage in Phase 1 |
| Router | HashRouter | Required for GitHub Pages SPA |
| Calendar | Google Calendar API (read-only) | Client-side GIS token flow |
| Hosting | GitHub Pages | Auto-deploys via GitHub Actions on push to main |
| Icons | Tabler Icons (outline) | ti-moon, ti-feather, ti-scroll, etc. |
| Fonts | Cormorant Garamond · DM Sans · Space Mono | Google Fonts |

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Local Development

```bash
# Clone
git clone https://github.com/OKHP3/kierans-lifetrkr.git
cd kierans-lifetrkr

# Install
npm install

# Run
npm run dev
# App runs at http://localhost:5000
```

No environment variables are required for Phase 1. The app runs fully on localStorage.

To enable Google Calendar and Tasks sync, set one value:

```bash
# .env (not committed — see .env.example)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

---

## Project Structure

```
kierans-lifetrkr/
├── src/
│   ├── context/             # AppContext (useReducer + localStorage), ThemeContext
│   ├── components/          # BottomNav, SideNav, ThemeToggle, CheckCircle,
│   │                        #   Toast, GoogleConnectButton, TokenExpiryBanner
│   ├── hooks/               # useGoogleAuth, useToast
│   ├── lib/                 # storage.ts, date.ts, googleCalendar.ts, googleTasks.ts
│   ├── pages/               # Home, Rituals, Habits, Calendar, Today, Archive, Settings
│   ├── types.ts             # All TypeScript types
│   ├── constants.ts         # APP_VERSION, GOOGLE_CLIENT_ID, quotes, seasonal dates
│   ├── App.tsx              # HashRouter + Routes
│   └── main.tsx             # Entry point
├── docs/                    # PRD, Architecture, Design System, Roadmap, Handoff
├── .github/workflows/       # static.yml — builds and deploys to GitHub Pages on push
├── index.html               # Vite entry point
├── vite.config.ts           # host 0.0.0.0:5000, base /kierans-lifetrkr/ in production
├── tailwind.config.js       # Moonlit Hearth color tokens
├── tsconfig.json
└── package.json
```

---

## Phase Roadmap

| Version | Phase | Scope |
|---|---|---|
| **v0.1.0** | UI Shell | React + localStorage + all 6 tabs + Google Auth shell |
| **v0.2.0** | Calendar | Google Calendar live sync (client-side GIS) |
| **v0.3.0** | Tasks | Google Tasks live sync |
| **v0.4–0.9** | Polish | Public prep, OAuth verification, real-user testing |
| **v1.0.0** | Production | Google-verified, battle-tested, Kieran owns it |

---

## Design System

**Moonlit Hearth** — warmly mystical dark mode. Stevie Nicks, not goth.

| Token | Hex | Usage |
|---|---|---|
| bg | #0D0B14 | Base background — deep midnight purple-black |
| surface | #1A1424 | Cards, nav, modals |
| accentAmethyst | #C4A0E8 | Primary CTA, active nav, streaks |
| accentGold | #E8B86D | Calendar events, 30-day milestone |
| accentSage | #4ECFA0 | Completion states |
| textPrimary | #EAE0F8 | Warm moonstone white |

Display: Cormorant Garamond (greeting only) · Body: DM Sans · Mono: Space Mono

See `docs/DESIGN.md` for the full token and component spec.

---

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/static.yml`.

Live at: **https://okhp3.github.io/kierans-lifetrkr/**

---

## Environment Variables

Only one value needed, and it's not a secret:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

See `.env.example` for setup instructions.

---

## Origin

Started on Father's Day, June 21, 2026 — the Summer Solstice — as a build session between Jamie Hill and his daughter Rylee (Kieran).

The goal: teach by doing, ship something real, hand it to her when it's done.

```
Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Rylee v0.1.0
```

The fourth Hill. Pay it forward.

---

## License

MIT — free to use, fork, and build on.
