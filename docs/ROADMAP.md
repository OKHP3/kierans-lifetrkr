# Kieran's LifeTrkr — Roadmap

---

## Phase 1 — UI Shell
**Scope:** React SPA, Tailwind, localStorage, all 6 tabs functional
**Hosting:** Replit (dev) — no production deployment yet
**Unlock criteria:** Kieran uses it for one day and it feels right

### Deliverables
- [ ] Project scaffold: Vite + React + TypeScript + Tailwind
- [ ] BottomNav with 6 tabs and Moonlit Hearth styling
- [ ] AppContext + useReducer for shared state
- [ ] storage.ts abstraction layer (localStorage reads/writes)
- [ ] date.ts utility (day-of-week detection, seasonal badge logic)
- [ ] Home: greeting (time-aware), today's ritual mirror, upcoming events (manual), More section
- [ ] Rituals: day-of-week picker, checklist per day, edit mode, midnight reset
- [ ] Habits: daily toggle, 7-day grid, moon-streak counter, add/deactivate
- [ ] Calendar: month grid, day expansion, manual event CRUD, Google-ready structure
- [ ] Today: task list (status=today), complete/delete/demote, FAB
- [ ] Backlog: task list (status=backlog), promote to Today, search, sort, FAB
- [ ] Starter seed data on first launch
- [ ] Seasonal badge logic (solstices, equinoxes, sabbats)
- [ ] Generational Easter egg (App.tsx comment + triple-tap reveal)
- [ ] Empty states for all tabs
- [ ] Midnight auto-reset for routine completions
- [ ] Toast notifications (undo on delete)

---

## Phase 1.5 — Google Calendar
**Scope:** Read-only Google Calendar OAuth integration
**Hosting:** Replit Deployments (first public URL)
**Unlock criteria:** Phase 1 UI is stable; Kieran has a Google account connected

### Deliverables
- [ ] Express.js server scaffold (/server)
- [ ] concurrently dev setup (frontend + backend in one command)
- [ ] /api/google/auth — OAuth initiation route
- [ ] /api/google/callback — OAuth callback + session token storage
- [ ] /api/google/events — Fetch upcoming events from primary calendar
- [ ] Calendar.tsx updated to consume real events (source: "google")
- [ ] Home dashboard updated to show real upcoming events
- [ ] Google event display: read-only badge, no edit/delete controls
- [ ] Google Cloud project setup documented in docs/SETUP.md
- [ ] GOOGLE_* and SESSION_SECRET added to Replit Secrets

---

## Phase 2 — Notion Backend
**Scope:** Replace localStorage with Notion-backed persistence
**Hosting:** Replit Deployments (production)
**Unlock criteria:** Data model is fully stable; no further schema changes anticipated

### Deliverables
- [ ] Notion workspace + 5 databases created (schemas in PRD.md Section 5)
- [ ] Notion integration created and linked to all 5 databases
- [ ] /api/notion/routines — GET templates, POST/PATCH items
- [ ] /api/notion/habits — GET habits, POST/PATCH/DELETE
- [ ] /api/notion/completions — POST/GET habit + routine completion records
- [ ] /api/notion/tasks — GET/POST/PATCH/DELETE (status-filtered)
- [ ] Client-side storage.ts refactored to call /api/* instead of localStorage
- [ ] Data migration: export localStorage JSON → import to Notion via API
- [ ] NOTION_* variables added to Replit Secrets
- [ ] Full end-to-end test across all 6 tabs

---

## Phase 3 — Handoff
**Scope:** Transfer ownership from Jamie's accounts to Kieran's
**Unlock criteria:** Phase 2 is stable; Kieran is ready to own it

### Deliverables
- [ ] Kieran creates GitHub account (if not already)
- [ ] Transfer GitHub repo (Settings → Transfer → Kieran's username)
- [ ] Kieran creates Replit account (if not already)
- [ ] Fork Repl to Kieran's account (do NOT use Transfer — it is irreversible)
- [ ] Kieran creates Notion workspace + re-creates 5 databases
- [ ] Kieran creates new Notion integration + new API key
- [ ] Rotate NOTION_API_KEY in Replit Secrets (Kieran's Repl)
- [ ] Kieran assumes ownership of Google Cloud project (add as owner, Jamie removes self)
- [ ] Kieran creates new OAuth credentials in her GCP project
- [ ] Update GOOGLE_* secrets in Kieran's Repl
- [ ] Update GOOGLE_REDIRECT_URI to Kieran's Replit deployment URL
- [ ] Update authorized redirect URIs in Kieran's GCP project
- [ ] Verify app runs cleanly under Kieran's accounts
- [ ] Archive Jamie's dev Repl (do not delete — keep as backup)
- [ ] Update README ownership section

---

## Post-Handoff Ideas (No Committed Timeline)

These are not scheduled. They become Kieran's decisions to make.

- PWA / add-to-home-screen support
- Push notification reminders for habits and rituals
- Recurring tasks (e.g. "Take trash out every Tuesday")
- Habit scheduling by day-of-week (not all habits are daily)
- Energy or mood-based ritual selection
- End-of-week review screen
- Drag-and-drop task prioritization
- Custom themes (Kieran can fork Moonlit Hearth into her own colorway)
- Backlog triage assistant (AI-powered, Phase N)
- Calendar event creation from the app
- Export to PDF / weekly summary

---

*Last updated: June 2026 — Jamie Hill*
