# Kieran's LifeTrkr — Product Requirements Document v3.0
**Document authority:** Supersedes PRD v1.0, PRD v2.0, PRD Amendment 01, PRD Amendment 02, PRD Amendment 03, and REPLIT_AGENT_PROMPT.md  
**Date:** June 22, 2026  
**Live app:** https://okhp3.github.io/kierans-lifetrkr/#/  
**Repository:** https://github.com/OKHP3/kierans-lifetrkr  
**Status:** Approved — single source of truth for all agent sessions  

---

## 1. Executive Summary

- Kieran's LifeTrkr is a mobile-first, dark-mode personal life OS combining ritual tracking, habit management, Google Calendar sync, Google Tasks, a daily task list, a master backlog, a celestial calendar layer, and an AI-powered daily oracle.
- The app is entirely client-side. No server. No publisher-managed database. All user data lives in the user's own browser.
- Google authentication uses the GIS implicit token model. The OAuth handshake occurs entirely between the user's browser and Google. The publisher never sees credentials, calendar data, or personal information.
- Any user in the world can use the app by visiting the URL and connecting their Google account. All their data is isolated to their own browser via localStorage namespaced by their Google sub ID.
- The architecture is: React 18 + Vite + TypeScript + Tailwind CSS, deployed as a static site on GitHub Pages, built in Replit.
- Design motif is Moonlit Hearth: deep jewel tones, amethyst primary, warmly mystical without being theatrical. Black cat. Crescent moon. Not goth. Not OKHP3-branded.
- Versioning is strictly pre-1.0. v1.0.0 is reserved for the first stable Google-verified Kieran-owned production release. Current build is v0.1.0 (Phase 1 shipped June 21, 2026).
- This PRD covers the complete arc from current state through v0.5.0, with full implementation detail for v0.2.0 and v0.3.0 sessions.

---

## 2. Origin

Started on Father's Day, June 21, 2026 — the Summer Solstice — as a father-daughter build session between Jamie Hill (OverKill Hill P³) and his daughter Kieran (Rylee Ann Hill, 21, Denton TX). The goal: teach by doing, ship something real, hand it over when it's done.

Kieran is the fourth generation of the Hill family operating system:  
Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0

These version numbers reference family generations, not software releases.

Published under MIT license. Sharing is caring.

---

## 3. Semantic Versioning Discipline

**This is a pre-production project. v1.0.0 is not a placeholder — it is earned.**

| Version | Phase | Status | Description |
|---|---|---|---|
| v0.1.0 | Phase 1 | SHIPPED | UI shell, all tabs, localStorage, Google auth profile |
| v0.1.x | Phase 1 patches | Active | Bug fixes, UI corrections from live review |
| v0.2.0 | Phase 2 | NEXT | Google Calendar + Tasks live integration |
| v0.2.x | Phase 2 patches | Planned | Token handling, edge cases |
| v0.3.0 | Phase 3 | SHIPPED EARLY (see PRD-v4.0.md) | Recurrence + Categories + Celestial Engine + Oracle |
| v0.3.x | Phase 3 patches | Planned | Tuning celestial data, oracle quality |
| v0.4.0 | Phase 4 | Planned | Brand assets, PWA manifest, polish, empty states |
| v0.4.x | Phase 4 patches | Planned | Performance, accessibility, mobile tuning |
| v0.5.0 | Phase 5 | Planned | Privacy policy, Google OAuth verification submission |
| v0.6.0 | Phase 6 | Planned | Account handoff to Kieran |
| v1.0.0 | Production | Reserved | First stable public release, Google-verified, Kieran-owned |

> Note (June 22, 2026): The v0.3.0 feature set (RecurrenceEditor, CategoryPicker, celestial engine,
> oracle stack) was pulled forward and shipped in v0.1.1–v0.1.8 during the second build session.
> See PRD-v4.0.md for the updated versioning alignment and current state audit.

Minor bumps (0.x.0) represent completed phase milestones. Patch bumps (0.x.y) are iterative fixes within a phase. No feature from a later phase ships in an earlier version.

---

## 4. Core Principles

1. **The publisher owns nothing.** No user data transits or rests on publisher infrastructure at any point.
2. **The browser is the database.** localStorage is the persistence layer. The user's device is the server.
3. **Google is the identity provider.** No username/password system. No account creation. The Google `sub` ID is the user identifier.
4. **Read, don't write.** Google Calendar and Google Tasks are read-only. The app never modifies the user's Google data.
5. **One question, fast.** What does today require from me?
6. **Calm over dense.** Every feature added is traded against simplicity and feel.
7. **Portable forever.** Because the data is local, users can clear it, walk away, and leave nothing behind.
8. **Seasonal awareness.** The app knows what day it is at a deeper level than a timestamp.

---

## 5. Architecture

### 5.1 The Client-Only Model

```
User's Browser
├── Kieran's LifeTrkr (HTML/CSS/JS from GitHub Pages)
├── localStorage: routines, habits, tasks, settings (namespaced by Google sub)
└── sessionStorage: Google access token (expires 1 hour, never sent to any server)
         ↕                                    ↕
  Google Identity Services             Google Calendar API
  (consent popup, token grant)         Google Tasks API
                                       (called directly from browser)

GitHub Pages — serves static files only. No PHP. No Node. No database.
Publisher manages: one GitHub repo + one GCP project (free).
```

### 5.2 Multi-User Data Isolation

Multiple Google accounts on the same device are fully isolated. Every localStorage key is namespaced by the Google `sub` ID:

```
lifetrkr:profile                       ← not namespaced (needed to derive namespace)
lifetrkr:{sub}:rituals                 ← RoutineTemplate[]
lifetrkr:{sub}:ritual_completions      ← RitualCompletion[]
lifetrkr:{sub}:habits                  ← Habit[]
lifetrkr:{sub}:habit_completions       ← HabitCompletion[]
lifetrkr:{sub}:tasks                   ← Task[]
lifetrkr:{sub}:settings                ← UserSettings
lifetrkr:{sub}:oracle:{YYYY-MM-DD}     ← OracleReading (cached daily)
lifetrkr:{sub}:tarot:{YYYY-MM-DD}      ← TarotCard (cached daily)
```

Google Calendar events and Google Tasks are fetched on-demand and held in React state only. They are never written to localStorage.

---

## 6. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite | SPA, fast HMR |
| Language | TypeScript | Strict mode throughout |
| Styling | Tailwind CSS v3 | Dark mode via class strategy, mobile-first |
| Routing | React Router v6 (HashRouter) | Required for GitHub Pages SPA |
| State | React Context + useReducer | No external state library |
| Storage | localStorage (namespaced) | Phase 1 persistence layer |
| Auth | Google Identity Services (GIS) | Token model, Client ID only |
| Calendar | Google Calendar API v3 | Browser fetch, read-only |
| Tasks | Google Tasks API v1 | Browser fetch, read-only |
| Oracle | Anthropic claude-sonnet-4-6 | Via fetch to Anthropic API |
| Tarot | tarotapi.dev | Free, no auth, CORS-enabled |
| Horoscope | freehoroscopeapi.com | Free, no auth |
| Moon data | Client-side Julian date math | No API, offline capable |
| Icons | Tabler Icons (outline, CDN) | ti-moon, ti-feather, ti-scroll, etc. |
| Fonts | Google Fonts | Cormorant Garamond + DM Sans + Space Mono |
| Build | Vite | `npm run build` → `dist/` |
| Deploy | gh-pages npm package | `npm run deploy` → `gh-pages` branch → GitHub Pages |
| Dev env | Replit | Build and test only, not hosting |
| Hosting | GitHub Pages | Free, static, globally distributed |

---

## 7. Project Structure

```
kierans-lifetrkr/
├── public/
│   ├── favicon.ico
│   └── assets/           ← brand images (app icon, og-card, etc.)
├── src/
│   ├── pages/
│   │   ├── Home.tsx          ← dashboard: greeting, ritual, events, oracle
│   │   ├── Rituals.tsx       ← day-of-week templates + recurrence
│   │   ├── Habits.tsx        ← daily tracking + recurrence + moon streak
│   │   ├── Calendar.tsx      ← events + celestial layer
│   │   ├── Today.tsx         ← committed tasks + Google Tasks due today
│   │   ├── Archive.tsx       ← backlog + optional Google Tasks
│   │   └── Settings.tsx      ← Google connection + preferences + oracle
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   ├── Card.tsx
│   │   ├── Checklist.tsx
│   │   ├── MoreSection.tsx
│   │   ├── RecurrenceEditor.tsx   ← shared recurrence UI (v0.3.0)
│   │   ├── CategoryPicker.tsx     ← emoji tag picker (v0.3.0)
│   │   ├── OracleCard.tsx         ← daily oracle display (v0.3.0)
│   │   ├── CelestialBadge.tsx     ← moon phase + astro season display (v0.3.0)
│   │   ├── GoogleConnectButton.tsx
│   │   ├── CalendarEventCard.tsx
│   │   ├── GoogleTaskCard.tsx
│   │   └── TokenExpiryBanner.tsx
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AppReducer.ts
│   ├── hooks/
│   │   ├── useGoogleAuth.ts
│   │   ├── useCalendarEvents.ts   ← v0.2.0
│   │   ├── useGoogleTasks.ts      ← v0.2.0
│   │   └── useOracle.ts           ← v0.3.0
│   ├── lib/
│   │   ├── storage.ts             ← namespaced localStorage abstraction
│   │   ├── date.ts                ← date utils + seasonal badge + isActiveToday
│   │   ├── celestial.ts           ← moon phase + astro season + mercury (v0.3.0)
│   │   ├── googleCalendar.ts      ← Calendar API fetch (v0.2.0)
│   │   └── googleTasks.ts         ← Tasks API fetch (v0.2.0)
│   ├── types.ts                   ← all TypeScript interfaces
│   ├── constants.ts               ← CLIENT_ID, SCOPES, CATEGORIES, COLOR_TOKENS
│   ├── App.tsx
│   └── main.tsx
├── index.html                     ← GIS + GAPI scripts in <head>
├── vite.config.ts                 ← base: '/kierans-lifetrkr/'
├── tailwind.config.ts             ← Moonlit Hearth color tokens
├── tsconfig.json
├── package.json
├── .gitignore
├── .env.example
├── docs/
│   ├── PRD-v3.0.md               ← THIS FILE
│   ├── DESIGN.md                  ← Moonlit Hearth design system
│   ├── HANDOFF.md                 ← Jamie → Kieran transfer checklist
│   ├── ROADMAP.md                 ← Phase roadmap with deliverables
│   └── ARCHITECTURE.md            ← Replit-native build notes
└── README.md
```

---

## 8. Configuration Files

### package.json (scripts section)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.24.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "gh-pages": "^6.1.1",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kierans-lifetrkr/',
})
```

### tailwind.config.ts (Moonlit Hearth tokens)
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:             '#0D0B14',
        surface:        '#1A1424',
        surfaceRaised:  '#251B30',
        border:         '#3A2A4A',
        borderSubtle:   '#251B30',
        textPrimary:    '#EAE0F8',
        textSecondary:  '#9B8AB0',
        textMuted:      '#7B6A8C',
        textGhost:      '#4A3560',
        amethyst:       '#C4A0E8',
        amethystDeep:   '#9B59FF',
        gold:           '#E8B86D',
        sage:           '#4ECFA0',
        ruby:           '#E83B6F',
        sapphire:       '#3B6FE8',
        emerald:        '#1A8A5A',
        rose:           '#D4756B',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
      },
    },
  },
} satisfies Config
```

### index.html (head scripts — REQUIRED)
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kieran's LifeTrkr</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500&family=Space+Mono&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
  <!-- Google Identity Services -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <!-- Google APIs client -->
  <script src="https://apis.google.com/js/api.js" async defer></script>
</head>
```

---

## 9. Complete TypeScript Type Definitions

All types live in `src/types.ts`. This is the canonical schema for the entire application.

```typescript
// ─── Identity ──────────────────────────────────────────────────────────────

export type GoogleProfile = {
  sub: string;          // unique user ID — localStorage namespace key
  name: string;
  email: string;
  picture: string;      // profile photo URL
};

export type UserSettings = {
  displayName: string;             // pre-filled from Google, overridable
  email: string;                   // from Google, display only
  timezone: string;                // auto-detected, user-overridable
  googleConnected: boolean;
  // Calendar
  calendarDaysAhead: number;       // default 14
  showGoogleCalendar: boolean;     // toggle
  showMoonPhaseOnCalendar: boolean; // moon dots on calendar grid
  // Tasks
  selectedTaskLists: string[];     // Google Task list IDs
  showGoogleTasks: boolean;
  showTasksDueToday: boolean;      // in Today tab
  // Oracle
  birthSign: ZodiacSign | null;   // for oracle personalization
  oracleEnabled: boolean;
  showMercuryBanner: boolean;
};

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

// ─── Recurrence ────────────────────────────────────────────────────────────

export type RecurrenceFrequency =
  | 'none'
  | 'daily'
  | 'weekdays'          // Mon–Fri
  | 'weekends'          // Sat–Sun
  | 'specific_days'     // user-selected days
  | 'weekly'            // every N weeks on specific days
  | 'monthly'           // same date each month
  | 'custom';           // every N days

export type RecurrenceEnd =
  | { type: 'never' }
  | { type: 'after_count'; count: number }
  | { type: 'on_date'; date: string };   // YYYY-MM-DD

export type RecurrencePattern = {
  frequency: RecurrenceFrequency;
  interval: number;         // every N (days/weeks/months) — default 1
  daysOfWeek: number[];     // 0=Sun … 6=Sat — for specific_days and weekly
  timesPerDay: number;      // default 1 — habits with multiple daily targets
  end: RecurrenceEnd;
};

export const DEFAULT_RECURRENCE: RecurrencePattern = {
  frequency: 'daily',
  interval: 1,
  daysOfWeek: [],
  timesPerDay: 1,
  end: { type: 'never' },
};

// ─── Rituals (formerly Routines) ───────────────────────────────────────────

export type DayOfWeek =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'
  | 'Thursday' | 'Friday' | 'Saturday';

export type RitualItem = {
  id: string;
  title: string;
  description?: string;        // v0.3.0
  categories: string[];        // v0.3.0
  recurrence: RecurrencePattern; // v0.3.0
  optional?: boolean;
  sortOrder: number;
};

export type RitualTemplate = {
  id: string;
  dayOfWeek: DayOfWeek;
  name: string;
  description?: string;        // v0.3.0
  items: RitualItem[];
};

export type RitualCompletion = {
  date: string;                // YYYY-MM-DD
  ritualTemplateId: string;
  completedItemIds: string[];
};

// ─── Habits ────────────────────────────────────────────────────────────────

export type Habit = {
  id: string;
  name: string;
  description?: string;        // v0.3.0
  categories: string[];        // v0.3.0 — replaces single colorTag
  colorTag?: string;           // kept for backward compat
  recurrence: RecurrencePattern; // v0.3.0
  active: boolean;
  createdAt: string;
};

export type HabitCompletion = {
  habitId: string;
  date: string;                // YYYY-MM-DD
  completionIndex: number;     // 0-based, for habits with timesPerDay > 1
};

// ─── Tasks ─────────────────────────────────────────────────────────────────

export type TaskStatus = 'backlog' | 'today' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskSource = 'manual' | 'google_tasks';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  source: TaskSource;
  googleTaskId?: string;
  googleTaskListId?: string;
};

// ─── Google Tasks (read-only source) ───────────────────────────────────────

export type TaskList = {
  id: string;
  title: string;
};

export type GoogleTask = {
  id: string;
  title: string;
  notes: string | null;
  due: string | null;          // RFC 3339 datetime
  status: 'needsAction' | 'completed';
  source: 'google_tasks';
};

// ─── Calendar ──────────────────────────────────────────────────────────────

export type CalendarEventSource = 'google' | 'manual' | 'lunar' | 'astro';

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;        // v0.3.0
  categories: string[];        // v0.3.0
  recurrence?: RecurrencePattern; // v0.3.0 — for manual events only
  start: string;               // ISO datetime or YYYY-MM-DD for all-day
  end?: string;
  allDay: boolean;
  location: string | null;
  description_text: string | null;
  colorId: string | null;
  source: CalendarEventSource;
};

// ─── Celestial ─────────────────────────────────────────────────────────────

export type MoonPhaseName =
  | 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous'
  | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

export type MoonPhase = {
  name: MoonPhaseName;
  emoji: string;
  illumination: number;    // 0.0 to 1.0
  daysUntilNext: number;
};

export type AstroSeason = {
  sign: ZodiacSign;
  emoji: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dates: string;           // display string e.g. "Jun 21 – Jul 22"
};

// ─── Oracle ────────────────────────────────────────────────────────────────

export type TarotCard = {
  name: string;
  name_short: string;
  type: string;            // 'major' | 'minor'
  suit?: string;
  value?: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
};

export type OracleReading = {
  date: string;            // YYYY-MM-DD
  tarotCard: TarotCard;
  moonPhase: MoonPhase;
  astroSeason: AstroSeason;
  message: string;         // Claude-generated oracle text
  horoscope?: string;      // from freehoroscopeapi.com if birth sign set
};

// ─── App State ─────────────────────────────────────────────────────────────

export type AppState = {
  profile: GoogleProfile | null;
  settings: UserSettings;
  ritualTemplates: RitualTemplate[];
  ritualCompletions: RitualCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];      // in-memory — Google + manual + lunar
  googleTasks: GoogleTask[];            // in-memory — Google Tasks
  taskLists: TaskList[];                // in-memory — Google Task lists
  oracle: OracleReading | null;         // today's oracle (from cache or fresh)
  isGoogleConnected: boolean;
  tokenExpiry: number | null;           // Unix ms
  isLoadingCalendar: boolean;
  isLoadingTasks: boolean;
  isLoadingOracle: boolean;
  lastGoogleSync: string | null;        // ISO datetime
};
```

---

## 10. Design System — Moonlit Hearth

Full specification is in `docs/DESIGN.md`. This section contains the values required by the agent.

### Color Tokens (tailwind.config.ts — see Section 8)

| Token | Hex | Usage |
|---|---|---|
| bg | #0D0B14 | App base — never use pure black |
| surface | #1A1424 | Cards, nav, modals |
| surfaceRaised | #251B30 | Inputs, hover states, badges |
| border | #3A2A4A | Dividers, card edges, unchecked circles |
| borderSubtle | #251B30 | Inner card dividers |
| textPrimary | #EAE0F8 | Main text — warm moonstone white |
| textSecondary | #9B8AB0 | Labels, metadata |
| textMuted | #7B6A8C | Timestamps, done items |
| textGhost | #4A3560 | Decorative, very subtle |
| amethyst | #C4A0E8 | Primary CTA, active nav, streaks (default) |
| amethystDeep | #9B59FF | Stronger accent, crescent fills |
| gold | #E8B86D | Calendar events, 30-day streak milestone |
| sage | #4ECFA0 | Completion states, checked habits, done tasks |
| ruby | #E83B6F | High priority, destructive |
| sapphire | #3B6FE8 | Secondary calendar accent |
| emerald | #1A8A5A | Tertiary completion accent |
| rose | #D4756B | Error, delete confirmation |

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display (greeting name) | Cormorant Garamond | 300 | 28–32px |
| Section headers | DM Sans | 500 | 16–18px |
| Card labels | DM Sans | 500 | 13px |
| Body / item text | DM Sans | 400 | 13px |
| Secondary labels | DM Sans | 400 | 11–12px |
| Time / streak / mono | Space Mono | 400 | 11px |

Cormorant Garamond is used ONLY for the greeting name on Home and major display moments. DM Sans for everything else.

### Navigation Tabs

| # | Label | Icon (Tabler) | Route |
|---|---|---|---|
| 1 | Home | ti-home | /#/ |
| 2 | Rituals | ti-repeat | /#/rituals |
| 3 | Habits | ti-moon | /#/habits |
| 4 | Calendar | ti-calendar | /#/calendar |
| 5 | Today | ti-feather | /#/today |
| 6 | Archive | ti-scroll | /#/archive |

Settings accessible via gear icon (ti-settings) in Home header — not a 7th nav tab.

### Component Standards

**Cards:** `rounded-2xl border border-[#3A2A4A] bg-[#1A1424] p-4`  
**Bottom nav:** fixed, 64px height, `bg-[#1A1424]`, border-top 0.5px `#3A2A4A`, active tab `#C4A0E8`, inactive `#7B6A8C`  
**Checkboxes:** custom circular toggle — unchecked: hollow `border-[#3A2A4A]`, checked: `bg-[#4ECFA0]` with white checkmark  
**FAB:** 56px circle, `bg-[#C4A0E8]`, + icon in bg color, bottom-right 20px from edge, 84px from bottom  
**Streak badge:** moon icon + count in Space Mono. Default amethyst. Turns gold at 30+ days.  
**Category pills:** `text-[11px] bg-[#251B30] text-[#9B8AB0] rounded-full px-2 py-0.5`  
**Recurrence badge:** `text-[11px] text-[#7B6A8C]` below item title, prefixed with ↻

---

## 11. Greeting Logic and Seasonal Badges

```typescript
// src/lib/date.ts

export function getGreetingTime(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function getSeasonalBadge(date: Date): string | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;
  const badges: Record<number, string> = {
    101: 'New Year', 120: 'Imbolc', 214: 'Valentine\'s', 202: 'Imbolc',
    317: 'St. Patrick\'s Day', 320: 'Spring Equinox', 501: 'Beltane',
    621: 'Summer Solstice', 801: 'Lughnasadh', 922: 'Autumn Equinox',
    1031: 'Samhain', 1121: 'Winter Solstice', 1221: 'Winter Solstice',
    1225: 'Yule', 1231: 'New Year\'s Eve',
  };
  return badges[md] || null;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek(date: Date): DayOfWeek {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()] as DayOfWeek;
}

export function isActiveToday(pattern: RecurrencePattern, date: Date = new Date()): boolean {
  if (pattern.frequency === 'none') return false;
  const day = date.getDay();
  switch (pattern.frequency) {
    case 'daily': return true;
    case 'weekdays': return day >= 1 && day <= 5;
    case 'weekends': return day === 0 || day === 6;
    case 'specific_days': return pattern.daysOfWeek.includes(day);
    case 'weekly':
    case 'monthly':
    case 'custom':
      return true; // simplified for v0.3.0 — full implementation adds interval math
  }
}
```

---

## 12. Celestial Engine

All celestial calculations are client-side. No external API required.

```typescript
// src/lib/celestial.ts — complete implementation

// ─── Moon Phase ─────────────────────────────────────────────────────────────

function toJulianDate(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return 367 * y
    - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
    + Math.floor(275 * m / 9)
    + d + 1721013.5;
}

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', min: 0,      max: 0.0625 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 0.0625, max: 0.25   },
  { name: 'First Quarter',   emoji: '🌓', min: 0.25,   max: 0.375  },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.375,  max: 0.5    },
  { name: 'Full Moon',       emoji: '🌕', min: 0.5,    max: 0.625  },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 0.625,  max: 0.75   },
  { name: 'Last Quarter',    emoji: '🌗', min: 0.75,   max: 0.875  },
  { name: 'Waning Crescent', emoji: '🌘', min: 0.875,  max: 1.0    },
] as const;

const KNOWN_NEW_MOON = 2451550.1;  // Jan 6, 2000
const SYNODIC_MONTH  = 29.53058867;

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const jd = toJulianDate(date);
  const raw = ((jd - KNOWN_NEW_MOON) % SYNODIC_MONTH) / SYNODIC_MONTH;
  const phase = ((raw % 1) + 1) % 1;
  const current = MOON_PHASES.find(p => phase >= p.min && phase < p.max) ?? MOON_PHASES[0];
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const daysUntilNext = Math.ceil((current.max - phase) * SYNODIC_MONTH);
  return { name: current.name as MoonPhaseName, emoji: current.emoji, illumination, daysUntilNext };
}

export function getNextLunarEvents(count: number = 3): { type: 'New Moon' | 'Full Moon'; date: Date; emoji: string }[] {
  const events: { type: 'New Moon' | 'Full Moon'; date: Date; emoji: string }[] = [];
  const now = new Date();
  let d = new Date(now);
  while (events.length < count * 2) {
    d = new Date(d.getTime() + 86400000);
    const phase = getMoonPhase(d);
    if (phase.daysUntilNext <= 1) {
      if (phase.name === 'New Moon')  events.push({ type: 'New Moon',  date: new Date(d), emoji: '🌑' });
      if (phase.name === 'Full Moon') events.push({ type: 'Full Moon', date: new Date(d), emoji: '🌕' });
    }
    if (events.length >= count * 2) break;
  }
  return events.slice(0, count * 2);
}

// ─── Astrological Season ────────────────────────────────────────────────────

const ASTRO_SEASONS: (AstroSeason & { startMD: number; endMD: number })[] = [
  { sign: 'Capricorn',   emoji: '♑', element: 'Earth', dates: 'Dec 22 – Jan 19', startMD: 1222, endMD: 119  },
  { sign: 'Aquarius',    emoji: '♒', element: 'Air',   dates: 'Jan 20 – Feb 18', startMD: 120,  endMD: 218  },
  { sign: 'Pisces',      emoji: '♓', element: 'Water', dates: 'Feb 19 – Mar 20', startMD: 219,  endMD: 320  },
  { sign: 'Aries',       emoji: '♈', element: 'Fire',  dates: 'Mar 21 – Apr 19', startMD: 321,  endMD: 419  },
  { sign: 'Taurus',      emoji: '♉', element: 'Earth', dates: 'Apr 20 – May 20', startMD: 420,  endMD: 520  },
  { sign: 'Gemini',      emoji: '♊', element: 'Air',   dates: 'May 21 – Jun 20', startMD: 521,  endMD: 620  },
  { sign: 'Cancer',      emoji: '♋', element: 'Water', dates: 'Jun 21 – Jul 22', startMD: 621,  endMD: 722  },
  { sign: 'Leo',         emoji: '♌', element: 'Fire',  dates: 'Jul 23 – Aug 22', startMD: 723,  endMD: 822  },
  { sign: 'Virgo',       emoji: '♍', element: 'Earth', dates: 'Aug 23 – Sep 22', startMD: 823,  endMD: 922  },
  { sign: 'Libra',       emoji: '♎', element: 'Air',   dates: 'Sep 23 – Oct 22', startMD: 923,  endMD: 1022 },
  { sign: 'Scorpio',     emoji: '♏', element: 'Water', dates: 'Oct 23 – Nov 21', startMD: 1023, endMD: 1121 },
  { sign: 'Sagittarius', emoji: '♐', element: 'Fire',  dates: 'Nov 22 – Dec 21', startMD: 1122, endMD: 1221 },
];

export function getAstroSeason(date: Date = new Date()): AstroSeason {
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  const found = ASTRO_SEASONS.find(s => {
    if (s.startMD > s.endMD) return md >= s.startMD || md <= s.endMD;
    return md >= s.startMD && md <= s.endMD;
  });
  return found ?? ASTRO_SEASONS[0];
}

// ─── Mercury Retrograde (hardcoded 2026–2028) ───────────────────────────────

export const MERCURY_RETROGRADE = [
  { start: '2026-03-15', end: '2026-04-07' },
  { start: '2026-07-17', end: '2026-08-11' },
  { start: '2026-11-11', end: '2026-12-01' },
  { start: '2027-03-03', end: '2027-03-25' },
  { start: '2027-07-03', end: '2027-07-28' },
  { start: '2027-10-27', end: '2027-11-16' },
  { start: '2028-02-15', end: '2028-03-09' },
  { start: '2028-06-16', end: '2028-07-11' },
  { start: '2028-10-09', end: '2028-10-30' },
];

export function getMercuryStatus(date: Date = new Date()): { retrograde: boolean; endDate: string | null } {
  const iso = date.toISOString().split('T')[0];
  const period = MERCURY_RETROGRADE.find(r => iso >= r.start && iso <= r.end);
  return { retrograde: !!period, endDate: period?.end ?? null };
}
```

---

## 13. Category / Emoji Tag System

### Full Category List

Stored in `src/constants.ts`. Used by CategoryPicker.tsx.

```typescript
export type Category = { emoji: string; label: string; group: 'Spiritual' | 'Daily' };

export const CATEGORIES: Category[] = [
  // ── Spiritual Practice ──────────────────────────
  { emoji: '🌙', label: 'Moon ritual',    group: 'Spiritual' },
  { emoji: '🔮', label: 'Divination',     group: 'Spiritual' },
  { emoji: '🃏', label: 'Card reading',   group: 'Spiritual' },
  { emoji: '✨', label: 'Spellwork',      group: 'Spiritual' },
  { emoji: '🕯️', label: 'Candle work',   group: 'Spiritual' },
  { emoji: '🧿', label: 'Protection',     group: 'Spiritual' },
  { emoji: '🌿', label: 'Herbalism',      group: 'Spiritual' },
  { emoji: '🌸', label: 'Altar work',     group: 'Spiritual' },
  { emoji: '🌟', label: 'Manifestation',  group: 'Spiritual' },
  { emoji: '💎', label: 'Crystals',       group: 'Spiritual' },
  { emoji: '📿', label: 'Ritual',         group: 'Spiritual' },
  { emoji: '🌀', label: 'Energy work',    group: 'Spiritual' },
  // ── Daily Life ──────────────────────────────────
  { emoji: '💊', label: 'Medication',     group: 'Daily' },
  { emoji: '🧘', label: 'Meditation',     group: 'Daily' },
  { emoji: '😴', label: 'Sleep / Rest',   group: 'Daily' },
  { emoji: '🏃', label: 'Movement',       group: 'Daily' },
  { emoji: '💪', label: 'Exercise',       group: 'Daily' },
  { emoji: '🍎', label: 'Nutrition',      group: 'Daily' },
  { emoji: '💧', label: 'Hydration',      group: 'Daily' },
  { emoji: '🫁', label: 'Breathwork',     group: 'Daily' },
  { emoji: '🧠', label: 'Mental health',  group: 'Daily' },
  { emoji: '📖', label: 'Journaling',     group: 'Daily' },
  { emoji: '📚', label: 'Study',          group: 'Daily' },
  { emoji: '💼', label: 'Work',           group: 'Daily' },
  { emoji: '🧹', label: 'Cleaning',       group: 'Daily' },
  { emoji: '🌱', label: 'Self-care',      group: 'Daily' },
  { emoji: '💰', label: 'Finance',        group: 'Daily' },
  { emoji: '🤝', label: 'Connection',     group: 'Daily' },
  { emoji: '🎵', label: 'Creative',       group: 'Daily' },
  { emoji: '☕', label: 'Morning ritual', group: 'Daily' },
  { emoji: '🙏', label: 'Gratitude',      group: 'Daily' },
];
```

### CategoryPicker Component Behavior

Displayed in Rituals and Habits add/edit forms, and Calendar event form.  
Two-section scrollable row, grouped under "Spiritual Practice" and "Daily Life" headers.  
Multi-select. Selected pills show in amethyst. Deselect by tapping again.  
Max 5 categories per item (soft cap — warn at 5, don't block).

### Filter Bar

Shown at top of Rituals tab, Habits tab, and Archive tab.  
Horizontal scrollable row of emoji+label pills.  
"All" pill on far left, always shown, clears filter.  
Active filter pill shows in amethyst. Inactive in textMuted.  
Filter state is React state only — not persisted.

---

## 14. Recurrence System

### RecurrenceEditor Component

Shared UI component used in Habits, Rituals, and Calendar event forms.

```
Repeats: [Does not repeat ▾]
         ├ Does not repeat
         ├ Daily
         ├ Weekdays (Mon–Fri)
         ├ Weekends (Sat–Sun)
         ├ Specific days →  [S] [M] [T] [W] [T] [F] [S]
         ├ Weekly
         ├ Monthly (same date)
         └ Every N days

[if recurring]:
Every [1 ▴▾] [day(s) ▾]    ← interval + unit

[habits only]:
Times per day [1 ▴▾]        ← timesPerDay

Ends: [Never ▾]
      ├ Never
      ├ After [10 ▴▾] occurrences
      └ On date [YYYY-MM-DD]
```

### Recurrence Badge in List View

Displayed below item title in muted text:
- `↻ Daily`
- `↻ Mon · Wed · Fri`
- `↻ Weekdays · 2× per day`
- `↻ Every 3 days`
- `↻ Monthly`
- _(nothing shown if frequency: 'none')_

### Times Per Day (Habits Only)

When `timesPerDay > 1`, the habit card shows N completion circles instead of 1. Each circle is independent. Completion count for the day is stored as multiple HabitCompletion records with different `completionIndex` values.

---

## 15. External APIs

### 15.1 Google Identity Services (GIS)

```typescript
// src/hooks/useGoogleAuth.ts

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid', 'profile', 'email',
].join(' ');

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    sessionStorage.getItem('gal_token')
  );
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(
    Number(sessionStorage.getItem('gal_expiry')) || null
  );

  const isTokenValid = () => {
    if (!accessToken || !tokenExpiry) return false;
    return Date.now() < tokenExpiry - 60000; // 1-min buffer
  };

  const requestToken = (silent = false) =>
    new Promise<string>((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: silent ? 'none' : '',
        callback: (resp: any) => {
          if (resp.error) { reject(resp.error); return; }
          const expiry = Date.now() + resp.expires_in * 1000;
          sessionStorage.setItem('gal_token', resp.access_token);
          sessionStorage.setItem('gal_expiry', String(expiry));
          setAccessToken(resp.access_token);
          setTokenExpiry(expiry);
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken();
    });

  const getToken = async (): Promise<string> => {
    if (isTokenValid()) return accessToken!;
    return requestToken(true).catch(() => requestToken(false));
  };

  const disconnect = () => {
    sessionStorage.removeItem('gal_token');
    sessionStorage.removeItem('gal_expiry');
    setAccessToken(null);
    setTokenExpiry(null);
  };

  return { isConnected: isTokenValid(), connect: () => requestToken(false), getToken, disconnect };
}
```

After token is obtained, fetch user profile:
```typescript
const profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
// profile.sub → namespace key
// profile.name, profile.email, profile.picture → store in localStorage
```

### 15.2 Google Calendar API

```typescript
// src/lib/googleCalendar.ts

export async function fetchCalendarEvents(token: string, daysAhead = 14): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() + daysAhead * 86400000).toISOString();
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', now);
  url.searchParams.set('timeMax', cutoff);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Calendar API ${res.status}`);
  const data = await res.json();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary || '(no title)',
    description_text: item.description || null,
    categories: [],
    start: item.start.dateTime || item.start.date,
    end: item.end?.dateTime || item.end?.date,
    allDay: !item.start.dateTime,
    location: item.location || null,
    colorId: item.colorId || null,
    source: 'google' as const,
  }));
}
```

### 15.3 Google Tasks API

```typescript
// src/lib/googleTasks.ts

export async function fetchTaskLists(token: string): Promise<TaskList[]> {
  const res = await fetch(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=20',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return (data.items || []).map((l: any) => ({ id: l.id, title: l.title }));
}

export async function fetchTasks(token: string, listId = '@default'): Promise<GoogleTask[]> {
  const url = new URL(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`);
  url.searchParams.set('showCompleted', 'false');
  url.searchParams.set('maxResults', '100');
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return (data.items || []).map((t: any) => ({
    id: t.id, title: t.title, notes: t.notes || null,
    due: t.due || null, status: t.status, source: 'google_tasks' as const,
  }));
}
```

### 15.4 Tarot Card API

Endpoint: `https://tarotapi.dev/api/v1/cards/random?n=1`  
Free, no auth, CORS-enabled.

```typescript
// src/lib/oracle.ts

export async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0] as TarotCard;
  } catch {
    // Fallback: deterministic card selection from hardcoded Major Arcana
    const majorArcana = ['The Fool','The Magician','The High Priestess','The Empress',
      'The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit',
      'Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil',
      'The Tower','The Star','The Moon','The Sun','Judgement','The World'];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000);
    const card = majorArcana[dayOfYear % majorArcana.length];
    return { name: card, name_short: card.toLowerCase().replace(/\s/g, '_'),
      type: 'major', meaning_up: 'Trust the path unfolding before you.',
      meaning_rev: 'Resistance may be slowing what is meant to flow.',
      desc: 'A powerful card of transformation and insight.' };
  }
}
```

### 15.5 Daily Horoscope API

Endpoint: `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}`  
Free, no auth. Returns `{ data: { horoscope: string } }`.

```typescript
export async function fetchHoroscope(sign: ZodiacSign): Promise<string | null> {
  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`
    );
    const data = await res.json();
    return data?.data?.horoscope || null;
  } catch {
    return null;
  }
}
```

### 15.6 Claude API — Oracle Message

Model: `claude-sonnet-4-6`. Max tokens: 150. Cached in localStorage by date.

```typescript
// src/lib/oracle.ts

export async function generateOracleMessage(
  card: TarotCard,
  moon: MoonPhase,
  season: AstroSeason,
  mercury: { retrograde: boolean; endDate: string | null },
  birthSign?: ZodiacSign | null,
): Promise<string> {
  const cacheKey = `lifetrkr:${getUserSub()}:oracle:${getTodayISO()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const userPrompt = [
    `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`,
    `The moon is in ${moon.name}.`,
    `The sun is in ${season.sign} (${season.element} sign).`,
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    mercury.retrograde ? `Mercury is retrograde until ${mercury.endDate}.` : '',
    birthSign ? `This person's sun sign is ${birthSign}.` : '',
    'Write a 2–3 sentence daily oracle message. Warm, grounded, quietly mystical. Do not use em dashes.',
  ].filter(Boolean).join(' ');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: 'You are a warm, grounded, slightly mystical daily oracle for a personal life app. Never use em dashes. Sound like someone who reads a lot and walks in the woods at dusk.',
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const data = await response.json();
  const message = data.content?.[0]?.text || 'Trust the rhythm of this day.';
  localStorage.setItem(cacheKey, message);
  return message;
}
```

---

## 16. Feature Specifications

### 16.1 First Launch Experience

If `localStorage.getItem('lifetrkr:profile')` is null:

Full-screen centered layout on `bg-[#0D0B14]`:  
- App name in Cormorant Garamond 300, 36px, `textPrimary`
- Tagline: "Your day. Your rituals. Your rules." in DM Sans, `textSecondary`
- ✦ glyph in `amethyst`
- **"Connect Google Account"** — primary button, `bg-[#C4A0E8]`, `text-[#0D0B14]`
- **"Use without Google"** — secondary link, `textSecondary`, smaller

"Use without Google" allows full app functionality except Google-sourced data. Calendar shows manual events only. Today tab shows no Google Tasks section. Oracle still generates using Claude API.

### 16.2 Home / Dashboard

**Header row:**
```
GOOD EVENING           ← 10px, DM Sans, textMuted, letter-spacing 0.12em
Kieran ✦               ← 28–32px, Cormorant Garamond 300, textPrimary; ✦ in amethyst
Monday, June 21        ← 12px, DM Sans, textSecondary
[Summer Solstice]      ← badge, shown on seasonal dates (see getSeasonalBadge)
[♋ Cancer season]     ← 11px pill, amethyst, shown always (v0.3.0)
[🌕 Full Moon]         ← 11px pill, gold when Full/New Moon (v0.3.0)
[☿ Retrograde · Jul 28] ← amber pill, shown when Mercury retrograde (v0.3.0)
```

**Today's ritual checklist card:**  
Pulls `RitualTemplate` matching today's `DayOfWeek`.  
Items filtered by `isActiveToday(item.recurrence)`.  
Inline completion circles (tap to check). Progress badge: "2 of 5".  
Shares state with Rituals tab — checking here marks it done there.  
Midnight reset: compare `RitualCompletion.date` to today's ISO.

**Upcoming events strip:**  
Next 3 events from `calendarEvents` sorted by start, including lunar events (v0.3.0).  
If not connected: "✦ Connect Google to see your calendar" tappable link to Settings.  
If token expired: replaced by "Google sync paused · Tap to reconnect" banner.

**"More" section** (collapsed, tap `∿ more ∿` to expand):  
- Today's habit completion summary: "3 of 5 habits today"
- Today's active task count: "2 tasks remaining"
- Google Tasks due today count (if connected)
- **Oracle of the Day card** (v0.3.0) — see Section 16.9
- Motivational quote (rotating pool of 12, index = dayOfYear % 12)

**Settings access:**  
Gear icon (ti-settings) in top-right corner of header row. Routes to `/#/settings`.

### 16.3 Rituals Tab

**Day-of-week pill selector:** Sun Mon Tue Wed Thu Fri Sat  
Today's day pre-selected on open. Tap to switch and edit that day's template.

**For the active day:**  
List of `RitualItem[]` from the matching `RitualTemplate`.  
Items filtered by `isActiveToday(item.recurrence)` when viewing today.  
Each item shows: completion circle, title, recurrence badge (if set), category pills (if set), collapsed description (if set).

**Edit mode** (pencil icon or long press):  
Add / remove / reorder ritual items.  
Each item's add/edit form includes:
- Title (required)
- Description (optional textarea, placeholder: "What does doing this feel like when you show up for it?")
- Categories (CategoryPicker — multi-select)
- Recurrence (RecurrenceEditor)
- Optional toggle

**Empty state (no template for that day):**  
"No ritual set for [day]. Tap + to build one."

**Filter bar:** category emoji strip above list, filters visible items.

### 16.4 Habits Tab

**Header:** "YOUR PRACTICE" label + "Habits" in display treatment.

**Habit card (per habit):**  
- Completion circle(s) — one per `timesPerDay` (tap to toggle)
- Habit name
- Recurrence badge below name (e.g., `↻ Weekdays · 2× per day`)
- Category pills (up to 3 shown, + N more badge if more)
- Moon streak counter: 🌙 12 (turns gold 🌙 30 at 30+ days)
- 7-day completion grid: 7 circles labeled S M T W T F S

**Add/edit habit form:**  
- Name (required)
- Description (optional)
- Categories (CategoryPicker)
- Recurrence (RecurrenceEditor, includes times-per-day)

**Long press on habit:**  
Opens edit sheet with options: Edit, Deactivate (soft delete: `active: false`), Delete (permanent).

**Filter bar:** category emoji strip at top.

### 16.5 Calendar Tab

**Tab header:** month + year + `♋ Cancer season` pill + manual refresh button (ti-refresh).

**Month grid:**  
Each date cell: day number + tiny moon phase emoji in top-right corner (v0.3.0).  
Full Moon and New Moon dates: date number in amethyst ring.  
Dates with events: 1–3 colored dots below date number. Google = amethyst, manual = gold, lunar = gold.  
Tap a date: expand event list below the grid.

**Event list for selected day:**  
All-day events at top.  
Timed events sorted by start time.  
Each event card shows: color accent bar + title + start time + source badge (G for Google, 🌕 for lunar, pencil for manual).  
Google events: no edit/delete controls (read-only).  
Manual events: edit (ti-edit) and delete (ti-trash) controls.  
Lunar events: date, phase name, illumination %. Tap for lore card (brief moon phase meaning).

**Mercury retrograde banner (v0.3.0):**  
Shown at top of tab when Mercury is retrograde:  
`☿ Mercury retrograde — ends [date]`  
`Double-check everything. Back up your work. Give grace.`  
Amber background (`gold` at 15% opacity), `gold` text and icon.  
Dismissable per session (ti-x). Re-appears on next session if still retrograde.

**Upcoming lunar events (v0.3.0):**  
Next 3 full moons and 3 new moons auto-added to `calendarEvents` as `source: 'lunar'`.  
They appear in the event list on their dates and in Home upcoming strip.

**Add manual event form:**  
- Title (required)
- Description (optional)
- Categories (CategoryPicker)
- Date (required)
- Start time / End time (optional)
- All-day toggle
- Location (optional)
- Recurrence (RecurrenceEditor)

**No-connection state:**  
Banner: "Connect Google in Settings to see your Google Calendar events."  
Tab remains fully functional with manual events.

### 16.6 Today Tab

**Header:** today's date + "TODAY" label.

**"My Tasks" section:**  
Tasks where `status === 'today'`, sorted by priority (high → normal → low).  
Tap to complete: strike-through + move to "Done" section.  
Long press: options — Edit, Send to Archive, Delete.  
FAB (ti-plus): opens add task form.

**"From Google Tasks" section (v0.2.0, shown when connected + enabled):**  
Google Tasks due today from selected task lists.  
Each card shows: task title + list name + optional note snippet.  
"Add to My List" action: creates a local Task with `source: 'google_tasks'` and `googleTaskId`. Does NOT modify the original Google Task.  
Section hidden when: not connected, or `showTasksDueToday: false` in Settings.

**"Done today" section:**  
Collapsible section at bottom showing completed tasks for today.  
Strike-through + dimmed. Not removed from view.

**Task form fields:**  
- Title (required)  
- Notes (optional)  
- Priority (select: High / Normal / Low)  
- Due date (optional, defaults to today)  
- Category (free text, single tag)

### 16.7 Archive Tab

**Tasks where `status === 'backlog'`.**

Search bar at top (client-side keyword filter).  
Sort options: Date added / Priority / Title (toggle button, state persists to localStorage).  
Filter by category tag (filter bar strip at top).

**Task card:**  
Title + priority badge + source indicator.  
Long press: Edit, Send to Today (sets `status: 'today'`, `dueDate: today`), Delete.

**"From Google Tasks" section (optional, v0.2.0):**  
Google Tasks without a due date, from selected lists.  
Controlled by Settings toggle. Same "Add to My List" pattern as Today tab.

**FAB:** add new backlog item.

### 16.8 Settings Page

Accessible via ti-settings icon in Home header. Route: `/#/settings`.

**Profile section:**  
- Avatar: Google profile photo (64px circle) or initials fallback
- Display Name: editable text input
- Email: read-only

**Google Account section:**  
- Connection status badge
- Connected: shows email + "Disconnect" button  
- Disconnected: "Connect Google Account" primary CTA
- Token status: "Synced [time ago]" / "Expires in N min" / "Reconnect needed" CTA
- Last synced timestamp

**Google Calendar section** (shown when connected):  
- Toggle: Show Google Calendar events (default: on)
- Days ahead: 7 / 14 / 30 / 60 slider (default: 14)
- "Refresh Calendar" button

**Google Tasks section** (shown when connected):  
- Toggle: Show Google Tasks (default: on)
- Task lists: checkbox list of all user's Task lists
- Toggle: Show tasks due today in Today tab (default: on)

**Oracle section (v0.3.0):**  
- Toggle: Daily oracle (default: on)
- Sun sign picker: 12-sign scrollable list with emoji (for oracle personalization)
  "Only stored on your device. Used to personalize the daily oracle message."
- "Regenerate today's oracle" button (clears cache for today, refetches)

**Celestial section (v0.3.0):**  
- Toggle: Moon phase on calendar (default: on)
- Toggle: Mercury retrograde banner (default: on)

**App section:**  
- Timezone: auto-detected, dropdown override
- "Clear all app data" — danger button, requires confirmation modal  
  "This will delete your rituals, habits, tasks, and settings from this device. Your Google data is not affected."

**About section:**  
- "Kieran's LifeTrkr"
- "v0.x.x — pre-production"
- "Built on Father's Day, Summer Solstice 2026"
- "Jamie + Kieran Hill · MIT License"
- Link: overkillhill.com/manifesto/

### 16.9 Oracle of the Day (v0.3.0)

Appears in Home "More" section as a tappable card.  
Collapses to a teaser line when "More" is closed.  
Generates once per day. Cached in localStorage by date.

**Oracle card collapsed:**  
`🌙 [Card Name] · [2-word oracle teaser]`

**Oracle card expanded:**  
```
✦  Oracle                        [moon emoji] [phase]
─────────────────────────────────────────────────────
   [Card Name]
   [suit] · [keywords]

   " [Claude oracle message — 2–3 sentences] "

[sign emoji] [astrological season]          [horoscope link ↗ if available]
```

Background: `surface`. Left accent bar: `amethyst`. Card name in Cormorant Garamond. Message in DM Sans, italic. Tap "↗" to expand to full horoscope text in a modal.

**Fetch sequence (runs once per day on Home mount):**  
1. Check `localStorage.getItem('lifetrkr:{sub}:tarot:{date}')` — use if exists
2. If not: fetch `tarotapi.dev/api/v1/cards/random?n=1` → cache
3. Check `localStorage.getItem('lifetrkr:{sub}:oracle:{date}')` — use if exists
4. If not: call Claude API with card + moon + season + mercury + birthSign → cache
5. If `birthSign` set: fetch `freehoroscopeapi.com` → store in oracle object
6. Dispatch to AppState

**Error handling:**  
If tarot API fails: use hardcoded Major Arcana fallback (deterministic by day).  
If Claude API fails: use card's `meaning_up` as the oracle message.  
If horoscope API fails: omit horoscope section silently.  
If any step fails: oracle card still renders with whatever data is available.

### 16.10 Token Expiry Banner

Global banner shown on all screens when `Date.now() > tokenExpiry - 60000`:

```
[↻] Google sync paused — tap to reconnect          [×]
```

- Tap banner or ↻: attempt silent re-auth (`prompt: 'none'`). If fails, full consent popup.  
- Tap ×: dismiss for current session. Banner re-appears on next app load.  
- Banner is NOT shown if: user chose "Use without Google" or explicitly disconnected.

---

## 17. localStorage Storage Layer

```typescript
// src/lib/storage.ts

const APP_PREFIX = 'lifetrkr';

function getUserSub(): string {
  try {
    const raw = localStorage.getItem(`${APP_PREFIX}:profile`);
    if (!raw) return 'guest';
    return JSON.parse(raw).sub || 'guest';
  } catch { return 'guest'; }
}

function key(entity: string): string {
  return `${APP_PREFIX}:${getUserSub()}:${entity}`;
}

export const storage = {
  get<T>(entity: string): T | null {
    const raw = localStorage.getItem(key(entity));
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  set<T>(entity: string, value: T): void {
    localStorage.setItem(key(entity), JSON.stringify(value));
  },
  remove(entity: string): void {
    localStorage.removeItem(key(entity));
  },
  clearUser(): void {
    const sub = getUserSub();
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${APP_PREFIX}:${sub}:`))
      .forEach(k => localStorage.removeItem(k));
  },
};
```

---

## 18. Seed Data (First Launch)

```typescript
// Injected by storage.ts on first launch if no existing data found

const SEED_RITUALS: RitualTemplate[] = [
  {
    id: 'seed-mon', dayOfWeek: 'Monday', name: 'Monday Ritual',
    items: [
      { id: 's1', title: 'Wake up', categories: ['☕'], recurrence: DEFAULT_RECURRENCE, sortOrder: 0 },
      { id: 's2', title: 'Brush teeth', categories: [], recurrence: DEFAULT_RECURRENCE, sortOrder: 1 },
      { id: 's3', title: 'Take vitamins', categories: ['💊'], recurrence: DEFAULT_RECURRENCE, sortOrder: 2 },
      { id: 's4', title: 'Check calendar', categories: ['💼'], recurrence: DEFAULT_RECURRENCE, sortOrder: 3 },
    ],
  },
  // ... similar for Tue–Sun
];

const SEED_HABITS: Habit[] = [
  { id: 'h1', name: 'Drink water', categories: ['💧'], recurrence: { ...DEFAULT_RECURRENCE, timesPerDay: 8 }, active: true, createdAt: today },
  { id: 'h2', name: 'Move for 20 min', categories: ['🏃'], recurrence: DEFAULT_RECURRENCE, active: true, createdAt: today },
  { id: 'h3', name: 'Read for 15 min', categories: ['📚'], recurrence: DEFAULT_RECURRENCE, active: true, createdAt: today },
  { id: 'h4', name: 'Journal', categories: ['📖'], recurrence: { ...DEFAULT_RECURRENCE, frequency: 'weekdays' }, active: true, createdAt: today },
  { id: 'h5', name: 'Take vitamins', categories: ['💊'], recurrence: DEFAULT_RECURRENCE, active: true, createdAt: today },
];

const SEED_TASKS: Task[] = [
  { id: 't1', title: 'Review calendar for the week', status: 'today', priority: 'high', source: 'manual', createdAt: today },
  { id: 't2', title: 'Reply to that message', status: 'today', priority: 'medium', source: 'manual', createdAt: today },
  { id: 't3', title: 'Research that thing I was curious about', status: 'backlog', source: 'manual', createdAt: today },
  { id: 't4', title: 'Organize phone photos', status: 'backlog', source: 'manual', createdAt: today },
];
```

---

## 19. GCP Setup (Publisher One-Time Task)

This is a prerequisite for any Google integration. Must be completed before v0.2.0.

1. console.cloud.google.com → New Project → "LifeTrkr"
2. APIs & Services → Library → Enable: **Google Calendar API**, **Google Tasks API**
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web Application**
   - Authorized JavaScript Origins:
     ```
     https://okhp3.github.io
     http://localhost:5173
     ```
   - No redirect URIs needed (token model, not code model)
4. Copy Client ID. Ignore Client Secret.
5. OAuth Consent Screen → Testing → Add Kieran's Gmail as test user
6. Store `VITE_GOOGLE_CLIENT_ID` in Replit Secrets

---

## 20. Deployment

```bash
# Dev
npm run dev           # Vite dev server at localhost:5173

# Build + deploy to GitHub Pages
npm run deploy        # tsc && vite build && gh-pages -d dist

# Result:
# → dist/ folder built
# → dist/ pushed to gh-pages branch on GitHub
# → GitHub Pages serves from gh-pages branch
# → Live at: https://okhp3.github.io/kierans-lifetrkr/#/
```

**After every agent session:** run `npm run deploy` and verify the live URL.

---

## 21. Versioned Build Sequence

### v0.2.0 Build Session — Google Calendar + Tasks

**Prerequisites:** GCP Client ID in Replit Secrets. Kieran added as test user in GCP Console.

**Step 1:** Add `VITE_GOOGLE_CLIENT_ID` to `src/constants.ts` or Replit env.  
**Step 2:** Complete `useGoogleAuth.ts` hook (Section 15.1).  
**Step 3:** Build `googleCalendar.ts` (Section 15.2).  
**Step 4:** Build `googleTasks.ts` (Section 15.3).  
**Step 5:** Build `useCalendarEvents.ts` hook — fetches on auth + refresh.  
**Step 6:** Build `useGoogleTasks.ts` hook — fetches task lists + tasks.  
**Step 7:** Wire Calendar tab — real events from `calendarEvents`.  
**Step 8:** Wire Today tab — "From Google Tasks" section.  
**Step 9:** Wire Archive tab — Google Tasks without due date section.  
**Step 10:** Build `TokenExpiryBanner.tsx` — global.  
**Step 11:** Update Settings — task list selector, refresh buttons.  
**Step 12:** Update Home — real upcoming events strip.  
**Step 13:** `npm run deploy`. Test with Kieran's account.  
**Step 14:** Bump to v0.2.0 in package.json. Tag in GitHub.

### v0.3.0 Build Session — Recurrence + Categories + Celestial + Oracle

**Prerequisites:** v0.2.0 is stable and deployed.

**Step 1:** Add all new types to `types.ts` (RecurrencePattern, updated Habit/RitualItem, OracleReading, TarotCard).  
**Step 2:** Add CATEGORIES array to `constants.ts`.  
**Step 3:** Build `celestial.ts` (Section 12 — moon phase, astro season, Mercury retrograde).  
**Step 4:** Update `date.ts` — add `isActiveToday()` function.  
**Step 5:** Build `RecurrenceEditor.tsx` component.  
**Step 6:** Build `CategoryPicker.tsx` component.  
**Step 7:** Update Habit add/edit form — add description, CategoryPicker, RecurrenceEditor.  
**Step 8:** Update RitualItem add/edit form — add description, CategoryPicker, RecurrenceEditor.  
**Step 9:** Update Calendar event add/edit form — add description, CategoryPicker, RecurrenceEditor.  
**Step 10:** Add recurrence badges to Habit and RitualItem list views.  
**Step 11:** Add category filter bars to Habits, Rituals, Archive tabs.  
**Step 12:** Build `CelestialBadge.tsx` — displays moon phase + astro season.  
**Step 13:** Update Calendar tab — moon dots on grid, lunar events, Mercury banner, season pill.  
**Step 14:** Update Home — celestial row below date, Mercury mini-pill.  
**Step 15:** Build oracle fetch functions in `src/lib/oracle.ts` (Sections 15.4, 15.5, 15.6).  
**Step 16:** Build `useOracle.ts` hook.  
**Step 17:** Build `OracleCard.tsx` component.  
**Step 18:** Wire OracleCard into Home "More" section.  
**Step 19:** Add sun sign picker + oracle toggles to Settings.  
**Step 20:** Update seed data to include recurrence and categories.  
**Step 21:** Migrate existing localStorage data (add `recurrence: DEFAULT_RECURRENCE` and `categories: []` to any items missing them).  
**Step 22:** `npm run deploy`. Test full flow.  
**Step 23:** Bump to v0.3.0 in package.json. Tag in GitHub.

---

## 22. Easter Eggs

### App.tsx Generational Comment Block

```typescript
/*
 * Kieran's LifeTrkr
 * ─────────────────
 * Built on Father's Day, Summer Solstice 2026.
 * Jamie + Kieran Hill.
 *
 * v3.0 — Kieran
 * v2.0 — Jamie
 * v1.0 — Vyrle
 * v0.0 — Ralph
 *
 * The fourth Hill. Pay it forward.
 */
```

### Triple-Tap Reveal

If the ✦ glyph on the Home screen is tapped 3 times within 2 seconds, display a modal:

```
┌────────────────────────────────┐
│  Kieran's LifeTrkr  ·  v0.x.x  │
│                                │
│  The fourth generation.        │
│  Ralph · Vyrle · Jamie · Kieran│
│                                │
│  Built with ✦                  │
│  Father's Day, June 21, 2026   │
└────────────────────────────────┘
```

### Summer Solstice Auto-Badge

The app's first launch was June 21, 2026 — the Summer Solstice. The seasonal badge system will display "Summer Solstice" automatically every June 21. This fires for free on first launch and every year after.

---

## 23. Out of Scope — All Versions

- Writing to Google Calendar (event creation/editing/deletion)
- Writing to Google Tasks (task creation/completion from within app)
- Server-side database of any kind
- User-to-user features, sharing, collaboration
- Native mobile app (PWA add-to-home-screen is v0.4.0+, not a native build)
- AI-generated schedule suggestions
- Data sync across devices (fundamental localStorage limitation)
- Apple Calendar / iCloud (future roadmap)
- Microsoft Outlook / M365 Calendar (future roadmap)

---

## 24. Governance and Ownership

**Current owner:** Jamie Hill (development steward)  
**Intended owner:** Kieran Hill  
**Transfer plan:** See `docs/HANDOFF.md`  
**Brand integrity:** No OKHP3 branding in the app UI. Origin story surfaces subtly (About section, easter egg) but doesn't dominate.  
**Repository:** Public, MIT license. Freely forkable.  
**Notion hub:** overkillhill workspace — project command center only, not app database.

---

*PRD v3.0 — Kieran's LifeTrkr*  
*Father's Day / Summer Solstice 2026*  
*Compiled by Jamie Hill (OKHP3) with Claude Sonnet 4.6 (Anthropic)*  
*MIT License — free to build on. A nod to the source is appreciated.*
