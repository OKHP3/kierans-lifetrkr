# Kieran's LifeTrkr — PRD Amendment 01
**Amends:** Kieran's LifeTrkr PRD v1.0  
**Date:** June 21, 2026  
**Subject:** Replit-native build architecture + Jamie-to-Kieran account transition plan  
**Status:** Approved — supersedes conflicting sections in PRD v1.0  

---

## What Changed and Why

PRD v1.0 assumed a GitHub Pages → Vercel deployment pipeline with Vercel serverless functions handling the Notion API proxy. Jamie confirmed the build environment is Replit, using his accounts initially with a planned handoff to Kieran later.

Replit runs a persistent Node.js process -- not a static host. That eliminates the need for Vercel entirely in v1. The Express backend runs inside the same Repl as the React frontend, handling all API proxying without a separate cloud function layer.

Net effect: fewer accounts, fewer services, simpler local-to-deployed path, easier for Kieran to eventually own.

---

## Section 4 Replacement — Technical Architecture (Replit-Native)

```
┌─────────────────────────────────────────────────┐
│              Replit Deployment                   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │   React SPA (Vite)  — /client            │   │
│  │   Served as static build via Express     │   │
│  │   Bottom Nav → 6 page components         │   │
│  │   Tailwind CSS (dark mode)               │   │
│  └────────────────┬─────────────────────────┘   │
│                   │ fetch('/api/...')             │
│  ┌────────────────▼─────────────────────────┐   │
│  │   Express.js Server — /server            │   │
│  │                                          │   │
│  │   POST /api/notion/routines              │   │
│  │   POST /api/notion/habits                │   │
│  │   POST /api/notion/completions           │   │
│  │   POST /api/notion/tasks                 │   │
│  │   GET  /api/google/calendar              │   │
│  │   GET  /api/google/auth                  │   │
│  │   GET  /api/google/callback              │   │
│  └──────────┬──────────────────┬────────────┘   │
│             │                  │                 │
└─────────────┼──────────────────┼─────────────────┘
              │                  │
              ▼                  ▼
   ┌─────────────────┐  ┌──────────────────────┐
   │   Notion API    │  │  Google Calendar API  │
   │   (free tier)   │  │  (read-only OAuth)    │
   └─────────────────┘  └──────────────────────┘
              │
   ┌──────────▼──────────┐
   │   GitHub Repo       │
   │   (source sync)     │
   │   Jamie's account   │
   │   → Kieran's later  │
   └─────────────────────┘
```

### Updated Stack Decisions

| Layer | v1.0 (Vercel) | Amendment 01 (Replit) | Reason |
|---|---|---|---|
| Frontend | React + Vite | React + Vite | No change |
| Styling | Tailwind CSS | Tailwind CSS | No change |
| Backend | Vercel Serverless Functions | Express.js (Node.js) | Replit runs persistent process |
| Hosting | Vercel (free tier) | Replit Deployments (Autoscale or Reserved VM) | Single platform |
| Source control | GitHub (CI/CD trigger) | GitHub (synced from Replit) | Replit has native GitHub sync |
| Database | Notion API | Notion API | No change |
| Calendar | Google Calendar API | Google Calendar API | No change |
| Local dev | N/A | Replit editor + live preview | Built-in |

### Project Structure Inside Replit

```
kieran-lifetrkr/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── nav/
│   │   │   └── shared/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Routines.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── ToDo.jsx
│   │   │   └── Backlog.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                  # Express backend
│   ├── routes/
│   │   ├── notion.js        # All Notion API proxy routes
│   │   └── google.js        # Google Calendar OAuth + data routes
│   ├── lib/
│   │   ├── notionClient.js  # @notionhq/client wrapper
│   │   └── googleClient.js  # googleapis wrapper
│   └── index.js             # Express entry point
├── .env                     # Secrets (Replit Secrets in prod)
├── .gitignore               # Must include .env
├── package.json             # Root; scripts for dev + build
└── replit.nix               # Replit environment config
```

### Dev vs. Prod in Replit

| Mode | Command | Notes |
|---|---|---|
| Development | `npm run dev` | Runs Vite dev server + Express concurrently via `concurrently` package |
| Production | `npm run build && npm start` | Vite builds `/client/dist`; Express serves it as static + handles `/api/*` |

Use the `concurrently` npm package to run both servers in dev mode from a single command. Replit's "Run" button maps to `npm run dev`.

---

## Section 7 Replacement — Environment Variables (Replit Secrets)

In Replit, environment variables are stored in the **Secrets** panel (padlock icon in the sidebar), not in a `.env` file committed to GitHub. The `.env` file is for local reference only and must be in `.gitignore`.

| Secret Key | Source | Where to Get It |
|---|---|---|
| `NOTION_API_KEY` | Notion integration | notion.so/my-integrations |
| `NOTION_ROUTINES_DB_ID` | Notion DB URL | 32-char hex in the URL |
| `NOTION_HABITS_DB_ID` | Notion DB URL | 32-char hex in the URL |
| `NOTION_HABIT_COMPLETIONS_DB_ID` | Notion DB URL | 32-char hex in the URL |
| `NOTION_TASKS_DB_ID` | Notion DB URL | 32-char hex in the URL |
| `NOTION_ROUTINE_COMPLETIONS_DB_ID` | Notion DB URL | 32-char hex in the URL |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | OAuth 2.0 Web Client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | OAuth 2.0 Web Client |
| `GOOGLE_REDIRECT_URI` | Your Replit deployment URL | `https://[repl-name].[username].repl.co/api/google/callback` |
| `SESSION_SECRET` | Generate a random 32-char string | Used to sign the OAuth session cookie |

**Google OAuth redirect URI note:** Replit deployment URLs follow the pattern `https://[repl-name].[username].repl.co`. This must be added to the authorized redirect URIs in Google Cloud Console before OAuth will work. Add both the `.repl.co` URL and `http://localhost:3001` for local dev.

---

## Account Transition Plan (Jamie → Kieran)

### What Gets Transferred and When

| Asset | Jamie's Role | Kieran's Role | Transition Method | Complexity |
|---|---|---|---|---|
| GitHub Repo | Owner (build phase) | Owner (permanent) | Repo Transfer (Settings → Transfer) | Low |
| Replit Repl | Owner (build phase) | Owner (permanent) | Fork Repl to Kieran's account, or transfer | Low |
| Notion Workspace | Workspace owner, databases live here | New workspace owner | Export + re-import, OR share databases | Medium |
| Notion Integration | Jamie's integration token | New token under Kieran's account | Create new integration, update Replit Secrets | Low |
| Google Cloud Project | Jamie's GCP account | Kieran's GCP account | Add Kieran as owner, then remove Jamie | Low |
| Google OAuth Credentials | Jamie's project | Kieran's project | New credentials after GCP transfer | Low |
| Replit Secrets (env vars) | Jamie's Repl | Kieran's Repl | Re-enter after Repl fork/transfer | Low |

### Recommended Transition Sequence

**Phase 1 — Build (now):** Everything runs under Jamie's accounts. Kieran uses the app as a user. No account work needed.

**Phase 2 — Soft handoff (when app is stable):**
1. Fork or transfer the Repl to Kieran's Replit account.
2. Transfer the GitHub repo (Settings → Transfer ownership → enter Kieran's GitHub username).
3. Re-enter all Replit Secrets in Kieran's Repl (same values, new location).

**Phase 3 — Data handoff (Notion):**

Option A -- Share and promote (simplest):
- Share each Notion database with Kieran as a workspace member.
- Create a new Notion integration under Kieran's account.
- Update `NOTION_API_KEY` in Kieran's Replit Secrets.
- Jamie's databases remain but Kieran controls them via her integration token.

Option B -- Clean break (cleanest long-term):
- Kieran creates her own Notion workspace.
- Export each database from Jamie's Notion as CSV.
- Re-create the database schemas in Kieran's workspace.
- Import CSV data to populate existing records.
- Create a new integration under Kieran's account.
- Update all Notion Secrets in Kieran's Repl.

**Recommendation:** Start with Option A (faster), plan Option B for when Kieran is ready to own everything independently. Option B is a 30-minute task once the schemas are already built.

**Phase 4 — Google Cloud handoff:**
1. Add Kieran's Google account as Owner in the GCP project.
2. She creates new OAuth credentials tied to her account.
3. Update `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in her Replit Secrets.
4. Remove Jamie's account from the GCP project.

### What Kieran Needs (Accounts to Create Now or Later)

| Service | Free Tier | When Needed |
|---|---|---|
| GitHub | Yes | Phase 2 handoff |
| Replit | Yes (Core for deployments) | Phase 2 handoff |
| Notion | Yes | Phase 3 handoff |
| Google Account | Already has one likely | Phase 4 handoff (and for Calendar auth now) |
| Google Cloud Console | Free (OAuth only, no cost) | Phase 4 handoff |

---

## Revised Section 9 — Setup Prerequisites (Jamie's Accounts)

Since Jamie is building under his own accounts, the setup steps are streamlined:

**Step 1 — Notion (Jamie's workspace):**
- Go to notion.so/my-integrations → Create new integration → name it "Kieran LifeTrkr Dev"
- Copy the API key → store in Replit Secrets as `NOTION_API_KEY`
- Create 5 databases using the schemas in PRD v1.0 Section 5
- Share each database with the integration (open the database → ... menu → Connections → add integration)
- Copy each database ID from the URL (the 32-char segment between the last `/` and the `?`)

**Step 2 — Google Cloud (Jamie's account):**
- console.cloud.google.com → New Project → "Kieran LifeTrkr"
- APIs & Services → Enable → Google Calendar API
- APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web Application)
- Add authorized redirect URIs:
  - `http://localhost:3001/api/google/callback`
  - `https://[repl-name].[username].repl.co/api/google/callback` (add after Repl is created)
- Copy Client ID + Client Secret → store in Replit Secrets

**Step 3 — Replit:**
- Create a new Repl → Node.js template
- Connect to GitHub repo (Replit has native Git integration)
- Add all Secrets via the padlock panel
- Set Run command to `npm run dev`

**Step 4 — GitHub (Jamie's account):**
- Create new repo: `kieran-lifetrkr`
- Set visibility to Private (transition to Kieran's account later)
- Connect from Replit via the Git panel

---

## Revised Build Sequence for Replit Agent

Hand this to the Replit AI agent verbatim as the build prompt preamble:

---

*"Build a React + Express full-stack app called Kieran's LifeTrkr inside this Replit. Use Vite for the React frontend and Express.js for the backend API proxy. The frontend lives in /client and the backend in /server. Use concurrently to run both in development. Tailwind CSS for styling, dark mode only. The app has 6 tabs in a fixed bottom nav: Home, Routines, Habits, Calendar, To-Do, and Backlog. All data is persisted to Notion via the Express backend (Notion API key is in Replit Secrets as NOTION_API_KEY). Google Calendar integration is read-only OAuth via the backend. Follow the full PRD at [attach PRD v1.0 + this amendment]. Start with Phase 1: scaffold the project structure, install dependencies, verify dev server runs, and render all 6 tab shells with placeholder content."*

---

*PRD Amendment 01 — approved for agent handoff*
