# Rylee Life OS — Product Requirements Document
**Version:** 1.0 Draft  
**Date:** June 21, 2026  
**Author:** Derived from Rylee's requirements via structured elicitation  
**Status:** Ready for development kickoff  

---

## Executive Summary

- Personal life-organization web app for one user (Rylee), covering routines, habits, tasks, and calendar in a single dark-mode interface.
- Six-tab bottom navigation: Home, Routines, Habits, Calendar, To-Do, Backlog.
- Routines operate on day-of-week templates (Mon through Sun), not a single fixed list.
- Calendar pulls real events from Google Calendar via API (read-only).
- Backend: Notion free tier via Notion API, proxied through Vercel serverless functions.
- Deployment: GitHub repo → Vercel (free tier). GitHub Pages is ruled out -- Notion API is CORS-blocked for direct browser calls.
- v1 scope is intentionally lean: full UI shell + Notion-backed data + Google Calendar read integration. Auth, sharing, and notifications are post-v1.
- Target build time for v1: 2 to 4 hours in a Replit-style environment with an AI agent driving code generation.

---

## 1. Product Identity

| Field | Value |
|---|---|
| App Name | Rylee Life OS (working title; rename at will) |
| Primary User | Rylee (single-user, no auth required in v1) |
| Platform | Mobile-first responsive web app (React SPA) |
| Visual Mode | Dark mode, always on (no toggle required in v1) |
| Aesthetic | Clean, calm dark UI -- not gamer-dark, not terminal-dark. Think Notion dark + soft contrast |

---

## 2. Core Navigation Architecture

**Bottom navigation bar** with 6 tabs. Mobile-first means icons + short labels. Tab order:

| Position | Tab Label | Icon Suggestion |
|---|---|---|
| 1 | Home | House or sun (today-focused) |
| 2 | Routines | Repeat / refresh cycle |
| 3 | Habits | Checkmark streak or flame |
| 4 | Calendar | Calendar grid |
| 5 | To-Do | Checklist |
| 6 | Backlog | Archive / inbox |

Six tabs is at the upper edge of comfortable mobile nav. Consider using an icon-only bar with a tooltip label on tap if screen width is tight.

---

## 3. Feature Specifications

### 3.1 Home / Dashboard

**Purpose:** Morning glance screen. Show what matters right now, nothing else.

**Primary widgets (always visible):**
- Today's date + greeting (e.g., "Good morning, Rylee")
- Today's routine checklist (pulled from the active day-of-week template; checkable inline)
- Upcoming calendar events (next 3 to 5 events from Google Calendar, with time + title)

**"More" section (collapsed by default, expandable on tap):**
- Today's habits and completion status
- Today's active to-do items
- Streak / progress summary (total habits completed today, routine % done)
- Motivational quote (static rotating list is fine for v1; no external API needed)

**Behavior notes:**
- Routine checklist on the Home tab is a mirror of the Routines tab. Checking an item here marks it done there too (shared state, not a copy).
- Tapping a calendar event opens the Google Calendar event directly (deep link in a new tab).
- Home tab resets at midnight -- routine items uncheck, habit dots reset.

---

### 3.2 Routines

**Purpose:** Day-of-week routine templates. Set them once; use them every day.

**Structure:**
- 7 templates: Sunday through Saturday.
- Each template contains an ordered list of routine items (tasks, activities, time blocks).
- The app automatically loads today's template as the active routine.

**Routine item fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text | Required |
| Time (optional) | Time string | e.g., "7:00 AM" -- display only, no alarm in v1 |
| Order | Integer | Drag to reorder |
| Completed today | Boolean | Resets at midnight |

**Editing templates:**
- Long press or edit icon on any day tab to enter edit mode.
- Add, remove, reorder items within a day template.
- Changes save to Notion immediately (no draft state needed in v1).

**Navigation within Routines tab:**
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
| Color Tag | Select | For visual grouping (6 to 8 preset dark-mode-safe colors) |
| Active | Boolean | Soft-delete; hide without losing history |
| Created Date | Date | Auto |

**Daily tracking:**
- Each habit shows a tap-to-toggle completion circle for today.
- Streak counter visible below each habit name (consecutive days completed).
- Completion history stored in Notion as individual dated records (one row per habit per day).

**Habit view options:**
- List view (default): all habits, today's status, streak.
- Weekly view: 7-day grid showing which days each habit was completed (like a mini GitHub contribution graph).

**No habit scheduling by day-of-week in v1.** All habits are assumed to be daily. "Weekday only" habits can be a v2 feature.

---

### 3.4 Calendar

**Purpose:** Read-only view of Rylee's real Google Calendar events. No manual event entry in v1.

**Integration:** Google Calendar API (OAuth 2.0, read-only scope: `https://www.googleapis.com/auth/calendar.readonly`).

**Views:**
- Month view (default on tab open): grid with event dots.
- Tap a day: expand to show that day's event list below the grid.
- Week view (stretch goal for v1, can defer to v1.1).

**Event display:**
- Event title + start time.
- Color-coded by Google Calendar's own calendar color where possible.
- All-day events shown at top of day list.

**Authentication flow:**
- First time user opens Calendar tab: "Connect Google Calendar" button.
- OAuth popup, user grants read-only access.
- Token stored in browser localStorage for session persistence.
- Refresh token handling handled by the Vercel serverless function (not exposed client-side).

**Important scope limitation:** Calendar tab is read-only in v1. Creating, editing, or deleting events is out of scope.

---

### 3.5 To-Do / Task List

**Purpose:** Today's active task list. The things Rylee has committed to doing today.

**Task fields:**
| Field | Type | Notes |
|---|---|---|
| Title | Text | Required |
| Notes | Text | Optional detail |
| Priority | Select | High / Normal / Low |
| Due Date | Date | Optional; today by default when added from this tab |
| Status | Select | Today / Done |
| Source | Auto | "Manual" or "Promoted from Backlog" |

**Interactions:**
- Tap to complete (strike-through + move to done section at bottom).
- Swipe left to delete (with undo toast).
- Swipe right or long-press to promote back to Backlog.
- "Add task" button (plus icon, floating action button or top bar).
- Completed tasks collapse into a "Done today" section, not removed from view.

**Daily reset:**
- Done tasks from previous days are archived in Notion but not shown in the active list.
- Incomplete tasks from yesterday carry forward (do not auto-delete).

---

### 3.6 Master Backlog

**Purpose:** The "someday" holding tank. Everything Rylee wants to do eventually, without committing it to today.

**Same task schema as To-Do**, with these differences:
- Status defaults to "Backlog."
- No due date required.
- Tasks here do NOT appear in Home or To-Do tabs unless promoted.

**Interactions:**
- Tap + hold or swipe right to "Send to Today" (promotes task to To-Do tab with today's date).
- Search bar at top (filter by keyword).
- Simple sort options: by priority, by date added, by title.
- "Add to backlog" is the primary action here, not completion.

**Relationship to To-Do:**
- Backlog and To-Do share the same Notion database. Status field drives which tab shows the item.

---

## 4. Technical Architecture

```
┌─────────────────────────────────────────────┐
│           React SPA (Vite + React)           │
│           Hosted on Vercel                   │
│                                              │
│  Bottom Nav → 6 page components              │
│  Shared state via Context + useReducer       │
│  Tailwind CSS (dark mode, mobile-first)      │
└────────────────┬────────────────────────────┘
                 │ fetch()
                 ▼
┌─────────────────────────────────────────────┐
│        Vercel Serverless Functions           │
│        /api/* routes                         │
│                                              │
│  /api/notion/routines     (CRUD)             │
│  /api/notion/habits       (CRUD)             │
│  /api/notion/completions  (CRUD)             │
│  /api/notion/tasks        (CRUD)             │
│  /api/google/calendar     (READ proxy)       │
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
| Framework | React (Vite) | Fast build, SPA routing, wide AI codegen support |
| Styling | Tailwind CSS | Utility classes, dark mode via `dark:` prefix |
| State | React Context + useReducer | No backend session; lightweight |
| Deployment | Vercel (free tier) | Supports serverless functions; deploys from GitHub |
| Source control | GitHub | Required; Vercel CI/CD pulls from here |
| Database | Notion API (free tier) | No SQL server needed; free; GUI for Rylee to see data |
| Calendar | Google Calendar API | Read-only; OAuth 2.0 |
| Package manager | npm | Default |

---

## 5. Notion Data Schema

Five databases in Rylee's Notion workspace. All databases are private (not shared publicly).

### 5.1 Routine_Templates
| Property | Type | Notes |
|---|---|---|
| Title | Title | Item name (e.g., "Brush teeth") |
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
| Color | Select | Preset color tokens |
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

## 6. UI / UX Design Spec

### 6.1 Color Tokens (Dark Mode)
| Token | Hex | Usage |
|---|---|---|
| Background | #0F0F12 | App base layer |
| Surface | #1A1A22 | Cards, bottom nav, modals |
| Surface-Raised | #242432 | Input fields, hover states |
| Border | #2E2E40 | Dividers, card borders |
| Text-Primary | #E8E8F0 | Main readable text |
| Text-Secondary | #8888A8 | Labels, secondary info |
| Accent-Purple | #9B7FFF | Primary CTA, active nav tab, streak |
| Accent-Green | #4ECFA0 | Completion states, habits done |
| Accent-Red | #FF6B7A | High priority, delete confirmation |
| Accent-Gold | #F5B942 | Motivational accents, quotes |

### 6.2 Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Greeting | Inter | 700 | 28px |
| Section Headers | Inter | 600 | 18px |
| Body / Item Labels | Inter | 400 | 15px |
| Secondary Labels | Inter | 400 | 13px |
| Time stamps / Meta | Inter Mono | 400 | 12px |

**Load via:** `https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Inter+Mono&display=swap`

### 6.3 Component Standards
- **Cards:** `rounded-2xl`, `border border-[#2E2E40]`, `bg-[#1A1A22]`, 16px padding.
- **Bottom Nav:** Fixed, 64px height, `bg-[#1A1A22]`, active tab icon in Accent-Purple, inactive in Text-Secondary.
- **FAB (Floating Action Button):** 56px circle, Accent-Purple background, `+` icon, bottom-right corner above nav bar.
- **Checkboxes:** Custom circular toggle (not default HTML checkbox). Unchecked: hollow circle in Border color. Checked: filled circle in Accent-Green with checkmark.
- **Swipe gestures:** Left = delete (red background reveal). Right = promote/archive (purple background reveal).
- **Streak badge:** Flame icon + number, Accent-Purple, shown on habit cards when streak >= 2.

---

## 7. Environment Variables Required

| Variable | Source | Where stored |
|---|---|---|
| `NOTION_API_KEY` | Notion integration token | Vercel env vars |
| `NOTION_ROUTINES_DB_ID` | Notion database URL | Vercel env vars |
| `NOTION_HABITS_DB_ID` | Notion database URL | Vercel env vars |
| `NOTION_HABIT_COMPLETIONS_DB_ID` | Notion database URL | Vercel env vars |
| `NOTION_TASKS_DB_ID` | Notion database URL | Vercel env vars |
| `NOTION_ROUTINE_COMPLETIONS_DB_ID` | Notion database URL | Vercel env vars |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | Vercel env vars |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Vercel env vars |

---

## 8. v1 Scope Boundary

### In Scope (v1)
- Full 6-tab UI shell with dark mode
- Routines: 7-day templates, daily check-off, midnight reset
- Habits: daily tracking, streak counter, weekly grid view
- Calendar: Google Calendar read-only integration
- To-Do: daily task list, status management, carry-forward of incomplete items
- Backlog: full CRUD, promote-to-today action, search + sort
- Home dashboard: greeting, today's routine, upcoming calendar events, expandable "More" section
- All data persisted to Notion via Vercel API routes
- Deployed to Vercel from GitHub

### Out of Scope (v1 -- move to v1.1 or v2)
- User authentication / login (single user assumed)
- Push notifications or reminders
- Calendar event creation or editing
- Habit scheduling by day-of-week (all habits assumed daily)
- Recurring tasks
- Dark/light mode toggle
- PWA / installable app behavior (add to home screen)
- Data export
- Multiple users or sharing
- Offline mode

---

## 9. Setup Prerequisites (Before Writing One Line of Code)

Rylee and/or Jamie needs to complete these before the agent can build:

1. **Notion setup:**
   - Create a free Notion account (or use existing).
   - Create a new Notion Integration at https://www.notion.so/my-integrations.
   - Copy the API key.
   - Create 5 empty databases (schemas above) and share each one with the integration.
   - Copy each database ID from the URL (the 32-char hex string).

2. **Google Cloud setup:**
   - Go to https://console.cloud.google.com.
   - Create a new project ("Rylee Life OS").
   - Enable Google Calendar API.
   - Create OAuth 2.0 credentials (Web Application type).
   - Add `http://localhost:5173` and the Vercel deployment URL to authorized redirect URIs.
   - Copy Client ID and Client Secret.

3. **GitHub repo:**
   - Create a new public or private repo (private recommended).
   - Connect to Vercel via Vercel dashboard.

4. **Vercel setup:**
   - Create free account at https://vercel.com.
   - Import the GitHub repo.
   - Add all environment variables listed in Section 7.

---

## 10. Open Questions for Next Session

| # | Question | Impact |
|---|---|---|
| 1 | What is the app's final name? | URL slug, page title, branding |
| 2 | Does Rylee want to be able to add calendar events from the app in v1.1? | Scope planning |
| 3 | Habit frequency -- should some habits be "weekday only" vs daily? | Data schema (can add Day_Mask field) |
| 4 | Routine carry-forward: if Rylee doesn't complete a routine item, does it show as missed or just resets? | UX and data |
| 5 | Does Rylee have a Google account she's comfortable connecting? | OAuth prerequisite |

---

## 11. Suggested Build Sequence (Agent-Friendly)

Phase 1 -- Shell (30 min):
- Scaffold Vite + React + Tailwind project
- Build bottom nav with 6 tabs, dark theme tokens, all placeholder screens

Phase 2 -- Notion API layer (45 min):
- Create Vercel `/api/notion/*` routes
- Wire up Tasks and Habits CRUD first (highest interaction density)
- Wire up Routine_Templates

Phase 3 -- Feature screens (60 min):
- To-Do tab: full list, add, complete, swipe delete
- Backlog tab: list, add, promote
- Routines tab: day picker, checklist, edit mode
- Habits tab: daily toggle, streak counter

Phase 4 -- Home + Calendar (30 min):
- Home dashboard assembly
- Google Calendar OAuth + read proxy + month view

Phase 5 -- Polish (15 min):
- Midnight reset logic
- Toast confirmations
- Empty states for all tabs
- Mobile viewport tuning

---

*PRD version 1.0 -- ready for agent handoff*
