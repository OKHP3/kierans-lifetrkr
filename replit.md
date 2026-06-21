# Kieran's LifeTrkr

A personal life-management web app for Kieran — covering rituals, habits, tasks, and calendar in a single dark-mode mobile-first interface. Designed with the "Moonlit Hearth" aesthetic (warm mystical dark, inspired by Stevie Nicks / celestial / velvet).

## Project Structure

```
kieran-lifetrkr/
├── client/src/          # React (Vite) frontend
│   ├── context/         # AppContext — global state via useReducer + localStorage
│   ├── components/      # BottomNav, CheckCircle, Toast
│   ├── hooks/           # useToast
│   └── pages/           # Home, Rituals, Habits, Calendar, Today, Archive
├── server/              # Express.js backend
│   ├── routes/notion.js # Notion API proxy (Phase 2)
│   └── routes/google.js # Google Calendar OAuth (Phase 1.5)
├── docs/                # PRD, Architecture, Design System, Roadmap, Handoff
├── vite.config.js       # Vite — host 0.0.0.0:5000, proxy /api → localhost:3001
├── tailwind.config.js   # Moonlit Hearth color tokens
└── package.json         # Root; npm scripts for dev + build
```

## Running the App

```bash
npm run dev          # Starts both Vite (port 5000) + Express (port 3001) via concurrently
npm run build        # Builds Vite to /dist
npm start            # Production: Express serves /dist + handles /api/*
```

## Architecture

- **Frontend:** React + Vite SPA, Tailwind CSS (dark mode, mobile-first), state in localStorage via React Context + useReducer
- **Backend:** Express.js on port 3001; proxies Notion API and Google Calendar OAuth
- **Phase 1 (current):** Full UI shell, all data in localStorage — no API keys needed
- **Phase 1.5:** Google Calendar read-only OAuth — requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`
- **Phase 2:** Notion backend — requires all `NOTION_*` secrets

## Environment Variables (Replit Secrets)

| Secret | Phase | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | 1.5 | Google Cloud Console OAuth |
| `GOOGLE_CLIENT_SECRET` | 1.5 | Google Cloud Console OAuth |
| `GOOGLE_REDIRECT_URI` | 1.5 | `https://[your-repl].replit.app/api/google/callback` |
| `SESSION_SECRET` | 1.5 | Random 32-char string |
| `NOTION_API_KEY` | 2 | notion.so/my-integrations |
| `NOTION_ROUTINE_TEMPLATES_DB_ID` | 2 | 32-char hex from Notion DB URL |
| `NOTION_ROUTINE_COMPLETIONS_DB_ID` | 2 | 32-char hex from Notion DB URL |
| `NOTION_HABITS_DB_ID` | 2 | 32-char hex from Notion DB URL |
| `NOTION_HABIT_COMPLETIONS_DB_ID` | 2 | 32-char hex from Notion DB URL |
| `NOTION_TASKS_DB_ID` | 2 | 32-char hex from Notion DB URL |

## Design System — Moonlit Hearth

- Background: `#0D0B14` (deep midnight purple-black)
- Surface: `#1A1424` (cards, nav)
- Accent: `#C4A0E8` (amethyst — active nav, CTAs, streaks)
- Fonts: Cormorant Garamond (display), DM Sans (body), Space Mono (timestamps/streaks)

## Account Transition Plan (Jamie → Kieran)

See `docs/ARCHITECTURE.md` for the full handoff sequence. Summary:
1. Fork/transfer the Repl to Kieran's Replit account
2. Transfer the GitHub repo to Kieran's GitHub
3. Re-enter all Replit Secrets in Kieran's Repl
4. Create new Notion integration under Kieran's account
5. Create new Google OAuth credentials under Kieran's GCP project

## User Preferences

- App is for Kieran's personal use — single user, no auth needed in v1
- Always dark mode, never a light toggle
- Mobile-first layout, max-width 480px centered
