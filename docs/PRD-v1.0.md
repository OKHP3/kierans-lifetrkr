> ⚠️ ARCHIVED — Superseded by PRD-v2.0.md, PRD-v3.0.md, and PRD-v4.0.md.
> This document describes the original Express + Notion + server-side OAuth architecture,
> which was replaced on June 21, 2026. Do not use this document for active development.
> Retained for historical reference only.

# Kieran's LifeTrkr — Product Requirements Document
**Version:** 1.1  
**Date:** June 21, 2026  
**Author:** Derived from Kieran's requirements via structured elicitation  
**Status:** Ready for development kickoff  

---

## Executive Summary

- Personal life-organization web app for one user (Kieran), covering rituals, habits, tasks, and calendar in a single dark-mode interface.
- Six-tab bottom navigation: Home, Rituals, Habits, Calendar, Today, Archive.
- Rituals operate on day-of-week templates (Mon through Sun), not a single fixed list.
- Calendar pulls real events from Google Calendar via API (read-only).
- Backend: Notion free tier via Notion API, proxied through an Express.js server.
- Deployment: GitHub repo → Replit Deployments. Notion API is CORS-blocked for direct browser calls, so all API routes go through the Express backend.
- v1 scope is intentionally lean: full UI shell with localStorage. v1.5 adds Google Calendar OAuth. v2 adds Notion-backed data.
- Target build time for v1: 2 to 4 hours in a Replit environment with an AI agent driving code generation.

---

## 1. Product Identity

| Field | Value |
|---|---|
| App Name | Kieran's LifeTrkr |
| Primary User | Kieran (single-user, no auth required in v1) |
| Platform | Mobile-first responsive web app (React SPA) |
| Visual Mode | Dark mode, always on (no toggle) |
| Aesthetic | Moonlit Hearth — warm mystical dark, inspired by Stevie Nicks / celestial / velvet |

---

## 2. Core Navigation Architecture

**Bottom navigation bar** with 6 tabs. Mobile-first: icons + short labels, max-width 480px centered. Tab order:

| Position | Tab Label | Icon |
|---|---|---|
| 1 | Home | House / sun |
| 2 | Rituals | Repeat / refresh cycle |
| 3 | Habits | Flame streak |
| 4 | Calendar | Calendar grid |
| 5 | Today | Checklist |
| 6 | Archive | Inbox / archive |

Six tabs is at the upper edge of comfortable mobile nav. The nav uses icons + short labels; active tab highlighted in Accent Amethyst.

---

## 3. Feature Specifications

### 3.1 Home / Dashboard

**Purpose:** Morning glance screen. Show what matters right now, nothing else.

**Primary widgets (always visible):**
- Today's date + greeting (e.g., "Good morning, Kieran") — time-aware, uses Cormorant Garamond display font
- Seasonal badge (solstices, equinoxes, celtic sabbats — auto-detected by date)
- Today's ritual checklist (mirror of the Rituals tab for today's day; shared state)
- Upcoming calendar events (next 3 to 5 events from Google Calendar, with time + title)

**"More" section (collapsed by default, expandable on tap):**
- Today's habits and completion status
- Today's active tasks
- Streak / progress summary (total habits completed today, ritual % done)
- Motivational quote (static rotating list; no external API needed)

**Behavior notes:**
- Ritual checklist on Home is a mirror of the Rituals tab. Checking an item here marks it done there too (shared state, not a copy).
- Tapping a calendar event opens the Google Calendar event directly (deep link, new tab).
- Home tab resets at midnight — ritual items uncheck, habit dots reset.
- Easter egg: triple-tap on the greeting reveals a generational message (✦).

---

### 3.2 Rituals

**Purpose:** Day-of-week ritual templates. Set them once; use them every day.

**Structure:**
- 7 templates: Sunday through Saturday.
- Each template contains an ordered list of ritual items (activities, time blocks).
- The app automatically loads today's template as the active ritual list.

**Ritual item fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text | Required |
| Time (optional) | Time string | e.g., "7:00 AM" — display only, no alarm in v1 |
| Order | Integer | Drag to reorder |
| Completed today | Boolean | Resets at midnight |

**Editing templates:**
- Long press or edit icon on any day tab to enter edit mode.
- Add, remove, reorder items within a day template.
- Changes save to localStorage (v1) / Notion (v2) immediately.

**Navigation within Rituals tab:**
- Day-of-week pills across the top (Sun Mon Tue Wed Thu Fri Sat).
- Today's day pre-selected on open.
- Switching days shows that template for editing; does not affect the "active today" state.

---

### 3.3 Habits

**Purpose:** Track repeating daily behaviors. Celebrate streaks. See patterns.

**Habit item fields:**
| Field | Type | Notes |
|---|---|---|
| Habit Name | Text | Required |
| Description | Text | Optional reminder of what "done" looks like |
| Color Tag | Select | For visual grouping (preset dark-mode-safe colors) |
| Active | Boolean | Soft-delete; hide without losing history |
| Created Date | Date | Auto |

**Daily tracking:**
- Each habit shows a tap-to-toggle completion circle for today.
- Streak counter visible below each habit name (consecutive days completed). Displayed via Space Mono font.
- Completion history stored as individual dated records (one row per habit per day).

**Habit view options:**
- List view (default): all habits, today's status, streak.
- Weekly view: 7-day grid showing which days each habit was completed (mini contribution graph).

**No habit scheduling by day-of-week in v1.** All habits are assumed to be daily.

---

### 3.4 Calendar

**Purpose:** Read-only view of Kieran's real Google Calendar events. No manual event entry in v1.

**Integration:** Google Calendar API (OAuth 2.0, read-only scope: `https://www.googleapis.com/auth/calendar.readonly`).

**Views:**
- Month view (default on tab open): grid with event dots.
- Tap a day: expand to show that day's event list below the grid.

**Event display:**
- Event title + start time.
- Color-coded by Google Calendar's own calendar color where possible.
- All-day events shown at top of day list.

**Authentication flow:**
- First time Kieran opens Calendar tab: "Connect Google Calendar" button.
- OAuth popup, user grants read-only access.
- Token stored server-side via Express session; refresh token not exposed client-side.

**Important scope limitation:** Calendar tab is read-only in v1. Creating, editing, or deleting events is out of scope.

---

### 3.5 Today / Task List

**Purpose:** Today's active task list. The things Kieran has committed to doing today.

**Task fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text | Required |
| Notes | Text | Optional detail |
| Priority | Select | High / Normal / Low |
| Due Date | Date | Optional; today by default when added from this tab |
| Status | Select | Today / Done |
| Source | Auto | "Manual" or "Promoted from Archive" |

**Interactions:**
- Tap to complete (strike-through + move to done section at bottom).
- Swipe left to delete (with undo toast).
- Swipe right or long-press to demote back to Archive.
- "Add task" button (FAB, bottom-right).
- Completed tasks collapse into a "Done today" section, not removed from view.

**Daily reset:**
- Done tasks from previous days are archived but not shown in the active list.
- Incomplete tasks from yesterday carry forward (do not auto-delete).

---

### 3.6 Archive / Backlog

**Purpose:** The "someday" holding tank. Everything Kieran wants to do eventually, without committing it to today.

**Same task schema as Today**, with these differences:
- Status defaults to "Backlog."
- No due date required.
- Tasks here do NOT appear in Home or Today tabs unless promoted.

**Interactions:**
- Tap + hold or swipe right to "Send to Today" (promotes task to Today tab with today's date).
- Search bar at top (filter by keyword).
- Simple sort options: by priority, by date added, by title.
- "Add to archive" is the primary action here, not completion.

**Relationship to Today:**
- Archive and Today share the same tasks store. Status field drives which tab shows the item.

---

## 4. Technical Architecture

```
┌─────────────────────────────────────────────┐
│         React SPA (Vite + React)             │
│         Hosted on Replit Deployments         │
│                                              │
│  Bottom Nav → 6 page components              │
│  Shared state via AppContext + useReducer    │
│  Tailwind CSS (Moonlit Hearth, mobile-first) │
└────────────────┬────────────────────────────┘
                 │ fetch()
                 ▼
┌─────────────────────────────────────────────┐
│        Express.js Server (port 3001)         │
│        /api/* routes                         │
│                                              │
│  /api/notion/rituals      (CRUD)             │
│  /api/notion/habits       (CRUD)             │
│  /api/notion/completions  (CRUD)             │
│  /api/notion/tasks        (CRUD)             │
│  /api/google/auth         (OAuth initiation) │
│  /api/google/callback     (OAuth callback)   │
│  /api/google/events       (READ proxy)       │
└──────────┬──────────────────────┬────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐    ┌──────────────────────┐
│   Notion API     │    │  Google Calendar API  │
│   (free tier)    │    │  (read-only OAuth)    │
│   5 databases    │    │                       │
└──────────────────┘    └──────────────────────┘
```

**Stack decisions:**
| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 (Vite) | Fast build, SPA routing, wide AI codegen support |
| Styling | Tailwind CSS | Utility classes, dark mode via arbitrary values |
| State (v1) | AppContext + useReducer + localStorage | No backend session; lightweight |
| State (v2) | Same context, swapped to /api/* calls | Minimal refactor path |
| Backend | Express.js on port 3001 | Notion API CORS proxy; Google OAuth handler |
| Deployment | Replit Deployments | Single-environment; no Vercel/serverless needed |
| Source control | GitHub | Version history; backup |
| Database (v2) | Notion API (free tier) | No SQL server; Kieran can see/edit data in Notion GUI |
| Calendar | Google Calendar API | Read-only; OAuth 2.0 |
| Dev runner | concurrently | Vite (port 5000) + Express (port 3001) in one command |

---

## 5. Notion Data Schema

Five databases in Kieran's Notion workspace. All databases are private (not shared publicly).

### 5.1 Routine_Templates
| Property | Type | Notes |
|---|---|---|
| Title | Title | Ritual item name (e.g., "Brew tea") |
| Day_Of_Week | Select | Sun / Mon / Tue / Wed / Thu / Fri / Sat |
| Time_Label | Text | Optional display time (e.g., "7:00 AM") |
| Sort_Order | Number | Lower = appears first |
| Active | Checkbox | False = hidden from UI |

### 5.2 Routine_Completions
| Property | Type | Notes |
|---|---|---|
| Title | Title | Auto: "{item_id}_{date}" |
| Routine_Item | Relation | → Routine_Templates |
| Date | Date | Completion date |
| Completed | Checkbox | True = done |

### 5.3 Habits
| Property | Type | Notes |
|---|---|---|
| Title | Title | Habit name |
| Description | Text | Optional "done means..." note |
| Color | Select | Preset Moonlit Hearth color tokens |
| Active | Checkbox | Soft-delete |
| Created | Created time | Auto |

### 5.4 Habit_Completions
| Property | Type | Notes |
|---|---|---|
| Title | Title | Auto: "{habit_id}_{date}" |
| Habit | Relation | → Habits |
| Date | Date | Log date |
| Completed | Checkbox | |

### 5.5 Tasks
| Property | Type | Notes |
|---|---|---|
| Title | Title | Task name |
| Notes | Text | Optional detail |
| Priority | Select | High / Normal / Low |
| Due_Date | Date | Optional |
| Status | Select | Backlog / Today / Done / Archived |
| Source | Select | Manual / Promoted |
| Created | Created time | Auto |
| Completed_Date | Date | Set when Status → Done |

---

## 6. UI / UX Design Spec — Moonlit Hearth

### 6.1 Color Tokens (Dark Mode)
| Token | Hex | Usage |
|---|---|---|
| Background | #0D0B14 | App base layer (deep midnight purple-black) |
| Surface | #1A1424 | Cards, bottom nav, modals |
| Surface-Raised | #251B30 | Input fields, hover states |
| Border | #3A2A4A | Dividers, card borders |
| Text-Primary | #EAE0F8 | Main readable text |
| Text-Secondary | #9A86B0 | Labels, secondary info |
| Accent-Amethyst | #C4A0E8 | Active nav, CTAs, streaks |
| Accent-Sage | #4ECFA0 | Completion states, habits done |
| Accent-Rose | #D4756B | High priority, delete confirmation |
| Accent-Gold | #E8B86D | Motivational accents, quotes, seasonal badges |

### 6.2 Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Greeting | Cormorant Garamond | 600 | 28–32px |
| Section Headers | DM Sans | 600 | 18px |
| Body / Item Labels | DM Sans | 400 | 15px |
| Secondary Labels | DM Sans | 400 | 13px |
| Timestamps / Streaks | Space Mono | 400 | 12px |

**Load via Google Fonts:**
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500;600&family=Space+Mono&display=swap
```

### 6.3 Component Standards
- **Cards:** `rounded-2xl`, `border border-[#3A2A4A]`, `bg-[#1A1424]`, 16px padding.
- **Bottom Nav:** Fixed, 64px height, `bg-[#1A1424]`, active tab icon in Accent-Amethyst, inactive in Text-Secondary.
- **FAB (Floating Action Button):** 56px circle, Accent-Amethyst background, `+` icon, bottom-right corner above nav bar.
- **Check circles:** Custom circular toggle (not default HTML checkbox). Unchecked: hollow circle in Border color. Checked: filled circle in Accent-Sage with checkmark.
- **Streak badge:** Flame icon + number, Accent-Amethyst, shown on habit cards when streak ≥ 2. Font: Space Mono.
- **Seasonal badges:** Small pill in Accent-Gold. Auto-detected from date (solstices, equinoxes, and celtic sabbats).

---

## 7. Environment Variables Required

| Variable | Phase | Source | Where stored |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | 1.5 | Google Cloud Console | Replit Secrets |
| `GOOGLE_CLIENT_SECRET` | 1.5 | Google Cloud Console | Replit Secrets |
| `GOOGLE_REDIRECT_URI` | 1.5 | Your Replit deployment URL + `/api/google/callback` | Replit Secrets |
| `SESSION_SECRET` | 1.5 | Random 32-char string | Replit Secrets |
| `NOTION_API_KEY` | 2 | notion.so/my-integrations | Replit Secrets |
| `NOTION_ROUTINE_TEMPLATES_DB_ID` | 2 | 32-char hex from Notion DB URL | Replit Secrets |
| `NOTION_ROUTINE_COMPLETIONS_DB_ID` | 2 | 32-char hex from Notion DB URL | Replit Secrets |
| `NOTION_HABITS_DB_ID` | 2 | 32-char hex from Notion DB URL | Replit Secrets |
| `NOTION_HABIT_COMPLETIONS_DB_ID` | 2 | 32-char hex from Notion DB URL | Replit Secrets |
| `NOTION_TASKS_DB_ID` | 2 | 32-char hex from Notion DB URL | Replit Secrets |

---

## 8. v1 Scope Boundary

### In Scope (v1 — UI Shell, complete)
- Full 6-tab UI shell with Moonlit Hearth dark mode
- Rituals: 7-day templates, daily check-off, midnight reset
- Habits: daily tracking, streak counter, weekly grid view
- Calendar: month grid with manual event CRUD (Google-ready structure)
- Today: daily task list, status management, carry-forward of incomplete items
- Archive: full CRUD, promote-to-today action, search + sort
- Home dashboard: greeting, seasonal badge, today's ritual mirror, upcoming events, expandable "More" section
- All data in localStorage (no API keys needed)
- Deployed to Replit

### In Scope (v1.5 — Google Calendar)
- Google Calendar OAuth (read-only) via Express.js backend
- Real events displayed in Calendar tab and Home dashboard
- Deployed to Replit Deployments (first public URL)

### In Scope (v2 — Notion Backend)
- Replace localStorage with Notion-backed persistence
- All 5 Notion databases wired to Express.js /api/* routes
- localStorage → Notion data migration

### Out of Scope (post-v2)
- User authentication / login
- Push notifications or reminders
- Calendar event creation or editing
- Habit scheduling by day-of-week (all habits assumed daily in v1)
- Recurring tasks
- Dark/light mode toggle
- PWA / installable app (add to home screen)
- Data export
- Multiple users or sharing
- Offline mode

---

## 9. Setup Prerequisites (Before v1.5 / v2)

Kieran and/or Jamie needs to complete these before the agent can build Phase 1.5 and Phase 2:

1. **Notion setup (Phase 2):**
   - Create a free Notion account (or use existing).
   - Create a new Notion Integration at https://www.notion.so/my-integrations.
   - Copy the API key → add to Replit Secrets as `NOTION_API_KEY`.
   - Create 5 empty databases (schemas in Section 5) and share each one with the integration.
   - Copy each database ID from the URL (the 32-char hex string) → add to Replit Secrets.

2. **Google Cloud setup (Phase 1.5):**
   - Go to https://console.cloud.google.com.
   - Create a new project ("Kieran's LifeTrkr").
   - Enable Google Calendar API.
   - Create OAuth 2.0 credentials (Web Application type).
   - Add the Replit deployment URL + `/api/google/callback` to authorized redirect URIs.
   - Copy Client ID and Client Secret → add to Replit Secrets.

3. **GitHub repo:**
   - Repo at https://github.com/OKHP3/kierans-lifetrkr.
   - Keep in sync with the Replit workspace.

---

## 10. Open Questions

| # | Question | Impact |
|---|---|---|
| 1 | Does Kieran want to add calendar events from the app in v1.5 or v2? | Scope planning |
| 2 | Habit frequency — should some habits be "weekday only" vs daily? | Data schema (can add Day_Mask field) |
| 3 | Ritual carry-forward: if Kieran doesn't complete a ritual item, does it show as missed or just reset? | UX and data |
| 4 | Does Kieran have a Google account she's comfortable connecting? | OAuth prerequisite |
| 5 | Final Notion workspace structure — shared with Jamie or Kieran-only from the start? | Phase 3 handoff planning |

---

## 11. Suggested Build Sequence (Agent-Friendly)

Phase 1 — Shell (complete ✅):
- ✅ Vite + React + Tailwind project scaffold
- ✅ Bottom nav with 6 tabs, Moonlit Hearth design tokens
- ✅ AppContext + useReducer + localStorage persistence
- ✅ All 6 tab pages (Home, Rituals, Habits, Calendar, Today, Archive)
- ✅ Greeting, seasonal badge, easter egg, daily quote rotation
- ✅ Midnight reset, toast notifications, empty states

Phase 1.5 — Google Calendar (next):
- Express.js Google OAuth routes (/api/google/auth, /api/google/callback, /api/google/events)
- Calendar tab updated to consume real events
- Home dashboard updated for real upcoming events
- Deploy to Replit Deployments

Phase 2 — Notion Backend:
- Create 5 Notion databases + integration
- Wire /api/notion/* routes in Express
- Swap localStorage reads/writes for API calls in AppContext
- Data migration: export localStorage JSON → import to Notion

Phase 3 — Handoff:
- Transfer GitHub repo to Kieran's account
- Fork Repl to Kieran's Replit account
- Kieran creates new Notion integration + new OAuth credentials
- Rotate all secrets in Kieran's Repl

---

*PRD version 1.1 — updated June 2026 for Kieran's LifeTrkr — Jamie Hill*
