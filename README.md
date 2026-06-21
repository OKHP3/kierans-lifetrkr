# Kieran's LifeTrkr

> A dark-mode personal life OS. Routines, habits, calendar, tasks, and backlog — one interface, zero noise.

**Status:** Phase 1 — UI Shell (in development)
**Stack:** React 18 · Vite · TypeScript · Tailwind CSS
**Deployment:** Replit · GitHub sync
**Aesthetic:** Moonlit Hearth — warmly mystical dark mode

---

## What It Does

Kieran's LifeTrkr is a mobile-first personal organization app built around one question:

**What does today require from me?**

Six tabs. One user. No corporate productivity overhead. Not Notion.

| Tab | Label | Purpose |
|---|---|---|
| Home | Home | Today's ritual, upcoming events, at-a-glance dashboard |
| Rituals | Rituals | Day-of-week routine templates (Mon through Sun) |
| Habits | Habits | Daily practice tracking with moon-streak counter |
| Calendar | Calendar | Google Calendar sync (Phase 1.5) |
| Today | Today | Committed tasks for the current day |
| Archive | Archive | Master backlog — the someday list |

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite | SPA, fast HMR |
| Language | TypeScript | Strict typing throughout |
| Styling | Tailwind CSS | Dark mode, mobile-first |
| State | React Context + useReducer | No external state library in Phase 1 |
| Storage | localStorage | Phase 1 only — swaps to Notion in Phase 2 |
| Backend | Express.js on Replit | Phase 2 — Notion API proxy |
| Calendar | Google Calendar API (read-only) | Phase 1.5 |
| Hosting | Replit Deployments | Continuous deploy from this repo |
| Icons | Tabler Icons (outline) | ti-moon, ti-feather, ti-scroll, etc. |
| Fonts | Cormorant Garamond · DM Sans · Space Mono | Loaded via Google Fonts |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Local Development

```bash
# Clone
git clone https://github.com/[username]/kierans-lifetrkr.git
cd kierans-lifetrkr

# Install
npm install

# Environment (Phase 1 — not required; Phase 2 — required)
cp .env.example .env
# Fill in values per docs/SETUP.md

# Run
npm run dev
```

App runs at `http://localhost:5173` (frontend) and `http://localhost:3001` (backend, Phase 2 only).

### Phase 1 Note

Phase 1 uses localStorage exclusively. No environment variables are required to run the app locally in Phase 1. The `.env` file is only needed when wiring up Notion (Phase 2) and Google Calendar OAuth (Phase 1.5).

---

## Project Structure

```
kierans-lifetrkr/
├── client/                   # React (Vite) frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Dashboard — greeting, ritual, calendar preview
│   │   │   ├── Rituals.tsx   # Day-of-week routine templates
│   │   │   ├── Habits.tsx    # Daily habit tracking + moon-streak grid
│   │   │   ├── Calendar.tsx  # Event view (manual Phase 1, Google Phase 1.5)
│   │   │   ├── Todo.tsx      # Today's committed task list
│   │   │   └── Backlog.tsx   # Master someday list
│   │   ├── components/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checklist.tsx
│   │   │   └── MoreSection.tsx
│   │   ├── context/
│   │   │   └── AppContext.tsx # Shared state + dispatch
│   │   ├── lib/
│   │   │   ├── storage.ts    # localStorage abstraction layer
│   │   │   └── date.ts       # Date utilities + seasonal badge logic
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── server/                   # Express backend (Phase 2)
│   ├── routes/
│   │   ├── notion.js         # CRUD proxy for all Notion databases
│   │   └── google.js         # Google Calendar OAuth + read handler
│   ├── lib/
│   │   ├── notionClient.js
│   │   └── googleClient.js
│   └── index.js
├── docs/
│   ├── PRD.md                # Full product requirements document
│   ├── HANDOFF.md            # Account transition checklist (Jamie → Kieran)
│   ├── ROADMAP.md            # Phase plan with scope and unlock criteria
│   └── DESIGN.md             # Moonlit Hearth design system spec
├── .env.example              # Environment variable template (no secrets)
├── .gitignore
├── package.json
└── README.md
```

---

## Phase Roadmap

| Phase | Scope | Unlock Criteria |
|---|---|---|
| **1 — UI Shell** | React + Tailwind + localStorage + all 6 tabs | Kieran uses it for one day |
| **1.5 — Calendar** | Google Calendar OAuth, read-only event sync | Phase 1 UI is stable |
| **2 — Notion Backend** | Express.js server + Notion API + data migration | Data model is stable |
| **3 — Handoff** | Transfer repo, Replit, Notion, and GCP to Kieran | Phase 2 is stable |

See `docs/ROADMAP.md` for full scope detail per phase.

---

## Design System

**Moonlit Hearth** — warmly mystical dark mode. Stevie Nicks, not goth.

| Token | Hex | Usage |
|---|---|---|
| bg | #0D0B14 | Base background |
| surface | #1A1424 | Cards, nav, modals |
| accentAmethyst | #C4A0E8 | Primary CTA, active nav, streaks |
| accentGold | #E8B86D | Calendar events, 30-day milestone |
| accentSage | #4ECFA0 | Completion states |
| textPrimary | #EAE0F8 | Warm moonstone white |

Display type: Cormorant Garamond (300 weight, greeting only)
Body: DM Sans · Mono: Space Mono

See `docs/DESIGN.md` for the full token and component spec.

---

## Environment Variables

See `.env.example` for the full list. Secrets are stored in Replit's Secrets panel — never committed to this repo.

---

## Ownership

Built by Jamie and Kieran Hill.
Stewarded under Jamie's accounts during development.
Transfer to Kieran's accounts is planned post Phase 2 stabilization.

See `docs/HANDOFF.md` for the complete transfer checklist.

---

## License

Personal use only. Not licensed for redistribution.
