# Kieran's LifeTrkr — Notion Mirror

**Purpose:** a redundant, repo-native copy of the project's Notion workspace, so project history and delivery tracking survive independent of Notion access. This document is a **snapshot mirror**, not a live sync — it will drift from Notion over time unless someone re-runs the import.

**Sources mirrored (3):**

| Source | Notion URL | Snapshot date (per Notion's own `as of` timestamp) |
|---|---|---|
| Project Hub page | Private Notion workspace reference omitted from public mirror | 2026-06-23 |
| "Kieran's LifeTrkr" card-catalog routing entry | Private Notion workspace reference omitted from public mirror | 2026-06-21 |
| "Jamie-to-Kieran handoff package" tracker row | Private Notion workspace reference omitted from public mirror | 2026-06-21 |
| Deliverables Tracker database (embedded in the Hub) | Private Notion workspace reference omitted from public mirror | 2026-06-21 |

**Imported into this repo:** 2026-08-26.

**Written back to Notion:** 2026-08-26, same day. The reconciliation below drove live edits to the Project Hub page (a new Status Refresh callout, plus the two resolved-security banners, the manual-steps banner, the Current Status line, and the Live Artifacts table), the Deliverables Tracker (two rows moved to Ready for Review, three new rows added for the OKH project page / PRD-v5.0 / release evidence gates), the handoff-package row (Ready for Review + a note pointing at `docs/HANDOFF.md`), and the routing entry's Notes. This document is now a historical snapshot of what Notion looked like *before* that update — Notion itself is current as of 2026-08-26.

---

## ⚠️ Read this first: Notion is two build sessions behind the repo

Every page above dates to **June 21–23, 2026**, right after the second Replit build session. The repo has since moved to `v0.1.10` (per `docs/ROADMAP.md` and `docs/RELEASE-TRUTH-BASELINE.md`, both dated **August 22, 2026**). Treat this mirror as historical record, not current status. Two specific things Notion flags as open risks were checked directly against the live deployment and GitHub source while building this mirror, and can be marked resolved:

| Notion's June 22 flag | Verified state as of 2026-08-26 | Verification method |
|---|---|---|
| 🔐 `VITE_ANTHROPIC_API_KEY` baked into the client bundle via direct browser fetch; "Do NOT deploy to gh-pages until confirmed clean" | **Resolved.** The deployed bundle (`https://okhp3.github.io/kierans-lifetrkr/assets/index-*.js`) contains no Anthropic key, no `anthropic-dangerous-direct-browser-access` header, and no direct-to-Anthropic fetch. The oracle code now branches on "configured server-side oracle proxy... if the proxy is absent" — the Cloudflare Worker proxy architecture (PRD-v4.0 §C0) is live in the shipped code. | `curl`'d the live JS bundle and grepped for key patterns, header strings, and proxy-related strings directly. |
| 🚨 `docs/DESIGN.md` contains two `[OBFUSCATED PROMPT INJECTION]` lines from a Replit agent session | **Resolved.** No such string appears anywhere in the current `docs/DESIGN.md` on `main`. | Fetched `docs/DESIGN.md` from GitHub `main` and scanned it directly. |

The remaining status claims below (tab count, versioning, which phases are shipped) are Notion's own words as of its snapshot date — cross-check against `docs/ROADMAP.md`, `docs/RELEASE-TRUTH-BASELINE.md`, and `docs/PRD-v5.0.md` for what's actually true today. In particular, the **Deliverables Tracker** below still lists "Documentation set" as In Progress and "Jamie-to-Kieran handoff package" as Not Started — `docs/HANDOFF.md` already exists in this repo and is considerably more detailed than the tracker's acceptance criteria for that row (transfer checklist, secrets handling, risk register, estimated handoff time). Worth updating the tracker status in Notion the next time you're in there.

---

## Part 1 — Project Hub (full mirror)

> Icon: 🌙 · Title: "Kieran's LifeTrkr — Project Hub" · Parent: jmhDb — Jamie's Brain

### Banners present on the page at snapshot time

> 🔐 **Security remediation in progress — Oracle API key exposure**
> The June 22 build session baked `VITE_ANTHROPIC_API_KEY` into the client bundle via direct browser fetch. This was identified on June 22 and is being corrected. The Cloudflare Worker proxy (PRD-v4.0.md Section C0) is the correct implementation. A Replit instruction prompt has been issued to remove all direct Anthropic references from the source and switch to `VITE_ORACLE_WORKER_URL`. Do NOT deploy to gh-pages until Replit confirms the `dist/` grep for `ANTHROPIC_API_KEY` returns empty.
> *(See resolution table above — this is closed as of the current deployed build.)*

> ✅ **Documentation corrections applied — June 22, 2026 (8 corrections)**
> **Vyrle:** Locked permanently across all docs. Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0.
> **PRD-v1.0.md:** Archived status header added.
> **PRD-v3.0.md:** v0.3.0 marked SHIPPED EARLY (features delivered in v0.1.1–v0.1.8).
> **PRD-v4.0.md:** Vyrle/Virgil open question marked RESOLVED.
> **HANDOFF.md:** Notion database transfer section removed (Notion is project hub only, not app DB). GCP section updated for token model (no Client Secret, no redirect URIs). 6 tabs → 7 tabs. NOTION_API_KEY warning removed. Handoff time corrected to ~65 min.

> 🚨 **Security flag:** `docs/DESIGN.md` in the GitHub repo contains two `[OBFUSCATED PROMPT INJECTION]` lines inserted by the Replit agent session. The clean output version has these removed. Check the DESIGN.md commit history in GitHub to understand origin.
> *(See resolution table above — not present in the current file.)*

> ⚠️ **Manual steps still required (as of snapshot):** (1) Commit corrected doc files. (2) Edit `src/constants.ts` in Replit: `APP_VERSION` `v0.1.0` → `v0.1.8`. (3) `npm run build` — confirm no TS errors. (4) Update GitHub repo About description (still says "Notion in Phase 2"). Do NOT deploy until owner review.
> *(`APP_VERSION` is now `v0.1.10` per the current `src/constants.ts` — this has since moved further than the requested `v0.1.8`.)*

> ⚠️ **Architecture updated — June 21, 2026 (Father's Day / Summer Solstice):** the project underwent a significant architectural pivot since this page was first created. The Express backend, Replit-as-host, and Notion-as-database approach have all been replaced with a purely client-side architecture. PRD v2.0 was the reference document at snapshot time; the repo has since progressed through PRD-v3.0, v4.0, and v5.0.

### Current status (at snapshot)

Live at v0.1.8 — June 22, 2026. Second build session complete. Celestial engine, three-layer oracle stack, recurrence system, category picker, and full Calendar overhaul shipped. Advanced from v0.1.0 (UI shell only) to v0.1.8 — pulling most of the planned v0.3.0 feature set forward ahead of schedule.

### Phase / roadmap (at snapshot)

- **v0.1.x** — UI Shell + Celestial Engine + Three-Layer Oracle + Recurrence + Categories → ✅ SHIPPED — June 22, 2026
- **v0.2.0** — Google Calendar + Tasks live (activate `VITE_GOOGLE_CLIENT_ID`) → 🔜 NEXT
- **v0.3.0** — Close remaining gaps: dark default, first-launch flow, Settings About section, oracle Regenerate button → 📋 Planned
- **v0.4.0** — PWA + brand assets + polish (offline, add-to-home-screen, og-image) → 📋 Planned
- **v0.5.0** — OAuth verification + privacy policy (GCP app verification submission) → 📋 Planned
- **v1.0.0** — Production — Google-verified, Kieran-owned account handoff complete → 🔒 Reserved

### What's live now (v0.1.8, at snapshot)

- All 7 navigation tabs functional (Home, Rituals, Habits, Calendar, Today, Archive, Settings) — BottomNav on mobile, SideNav on desktop
- `celestial.ts` — pure client-side Julian date math: moon phase illumination/age/name/emoji, next full/new moon prediction, astrological season detection, Mercury retrograde calendar through 2027
- `cosmic.ts` — deterministic daily oracle data: daily cards, daily wisdom, cosmic events keyed to date
- `oracle.ts` — three-layer oracle stack
- `useOracle.ts` hook — orchestrates fetch sequence, respects `oracleEnabled` and `birthSign` from Settings
- `OracleCard.tsx` — tarot card name, moon phase, Claude oracle message, horoscope, pulse loading, mystical gradient
- `RecurrenceEditor.tsx` — full recurrence UI (frequency, interval, weekday pickers, end conditions)
- `CategoryPicker.tsx` — 31-category picker across Spiritual Practice and Daily Life groups
- `TagInput.tsx` — chip-based tag input with kebab normalization
- `FilterBar.tsx` — horizontal scrollable filter chips
- Settings — Oracle & Celestial section: Daily Oracle toggle, Mercury Rx banner toggle, Moon phase on calendar toggle, 12-sign zodiac sun sign picker
- Calendar page — moon phase emoji on every cell, oracle card panel for selected date, First Quarter / phase meaning cards, "Today's Card" tarot display
- Home page — OracleCard in "More" section, celestial row (moon phase + astro season badges), Mercury Rx banner, Easter egg triple-tap

**Wired but awaiting environment keys (at snapshot):**
- Google Calendar + Tasks — all library code exists; blocked by `VITE_GOOGLE_CLIENT_ID` not set
- Claude oracle message — falls back gracefully to tarot card meaning without `VITE_ANTHROPIC_API_KEY`
- Horoscope — requires `birthSign` set in Settings

### Three-layer oracle stack

```
Layer 1 — Tarot
  API: tarotapi.dev/api/v1/cards/random?n=1
  Auth: none required
  CORS: enabled
  Cache: daily localStorage cache (lifetrkr:{sub}:tarot:{YYYY-MM-DD})

Layer 2 — Horoscope
  API: freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}
  Auth: none required
  Requires: sun sign set in Settings → Oracle & Celestial
  Note: free third-party API, no SLA; fails silently

Layer 3 — Claude Oracle Message
  Model: claude-sonnet-4-5
  Method (at snapshot): direct browser fetch with anthropic-dangerous-direct-browser-access: true header
  Method (current, verified 2026-08-26): server-side oracle proxy; falls back gracefully if proxy absent
  Seed: moon phase + astrological season + tarot card + optional sun sign
  Output: 2–3 sentence mystical oracle message
  Cache: daily localStorage cache (lifetrkr:{sub}:oracle:{YYYY-MM-DD})
  Fallback: tarot card upright meaning when key/proxy is absent
```

### Environment variables (at snapshot)

- `VITE_GOOGLE_CLIENT_ID` — Google Calendar + Tasks OAuth (GIS token flow) — ❌ Not set — GCP project + OAuth 2.0 Client ID needed
- `VITE_ANTHROPIC_API_KEY` — Claude oracle AI message (Layer 3 of oracle stack) — ❌ Not set — use Replit `external_apis` skill to activate

### Project brief

Kieran's LifeTrkr is a father-daughter personal software project for Kieran, initially incubated by Jamie using Jamie's Replit, GitHub, and Notion accounts, with a later transition path to Kieran's own accounts.

The app is a mobile-first, dark-mode life organization dashboard focused on routines, habits, calendar visibility, active to-dos, and a master someday list.

### Product thesis

Kieran's LifeTrkr should feel like personal software: useful first, emotionally resonant second, and never performative.

The core product question is: *What does today require from me, and what rhythm helps me move through it?*

### Current product shape (at snapshot)

- **Home**: dashboard for today's rhythm, upcoming events, routine checklist, celestial row (moon phase + astro season badges), Mercury Rx banner, OracleCard in "More" section, Easter egg triple-tap.
- **Rituals** *(renamed from Routines)*: day-of-week routine templates (Mon–Sun).
- **Habits**: daily habit tracking, 7-day grid, moon-streak counter.
- **Calendar**: moon phase emoji on every cell, oracle card panel for selected date, tarot display. Google Calendar read-only sync pending GCP setup.
- **Today**: active tasks + Google Tasks due today (read-only, promote-to-local action). Google Tasks pending GCP setup.
- **Archive** *(renamed from Someday)*: master backlog + optional Google Tasks without due dates.
- **Settings**: Google account connection, display name, calendar preferences, task list selector, timezone, data reset, Oracle & Celestial controls.

### Design direction

**Motif:** Moonlit Hearth. The app should feel calm, warm, moonlit, softly mystical, cat-adjacent, and personally meaningful. It should avoid goth, horror, gamer-dark, cyberpunk, heavy occult styling, and visible OverKill Hill branding in the primary interface.

Suggested tone: Stevie-Nicks-adjacent without direct celebrity imagery, lyrics, likeness, or costume-witch treatment.

### Architecture direction — v2.0 (client-only)

The architecture was fundamentally redesigned at snapshot time. There is no server. There is no database owned or managed by the publisher. All data lives in the user's browser.

**Core principle:** the OAuth handshake between the user and Google happens entirely in the user's browser via the Google Identity Services (GIS) library. Jamie never sees, stores, or is responsible for any user credentials, calendar events, tasks, or personal data.

**Stack:**
- React 18 + Vite + TypeScript + Tailwind CSS *(current repo: React 19 + Vite 8 + Tailwind v4, per `docs/ROADMAP.md`)*
- React Router v6 with HashRouter (required for GitHub Pages SPA)
- Google Identity Services (GIS) library — client-side token model, no Client Secret needed
- Google Calendar API — called directly from the browser with the access token
- Google Tasks API — called directly from the browser with the same access token
- localStorage — all user data (routines, habits, tasks, settings) persisted per user, namespaced by Google sub ID
- sessionStorage — Google access token only (expires in 1 hour, never written to a server)

**What was removed:** Express.js backend, Replit as deployment host, Notion as app database, server-side OAuth flow, Vercel serverless functions (never built).

**Hosting:** GitHub Pages (static, free). **Build environment:** Replit (build only — `npm run build && gh-pages -d dist`). **Source of truth:** GitHub repo (`OKHP3/kierans-lifetrkr`). **Live URL:** https://okhp3.github.io/kierans-lifetrkr/

**Multi-user model:** any user visits the URL, clicks Connect Google Account, and the app is theirs. All their data lives in their own browser. No account system, no passwords. The Google `sub` ID namespaces all localStorage keys so multiple Google accounts on the same device remain isolated.

### Operating notes

- Use **Kieran** in visible app copy.
- Use **Kieran's LifeTrkr** as the working title.
- Keep family/manifesto provenance subtle and delayed.
- Do not make this an OverKill Hill-branded interface.
- Treat the Notion Hub page as the project command center; use the tracker database as the delivery ledger.

### Key decisions locked (at snapshot)

- No server. No backend. No publisher-managed database. Client-only, by design.
- Notion is not the app database. Notion serves as the project hub only.
- Google OAuth uses the GIS token model (Client ID only, no Client Secret, no server callback).
- Google Tasks is in scope alongside Google Calendar — same consent popup, same token.
- MIT license — open source, freely forkable. A nod to the source is appreciated, not required.
- Moonlit Hearth aesthetic — Stevie Nicks adjacent, warmly mystical, not goth, not OKHP3-branded.
- Tab labels: Home, Rituals, Habits, Calendar, Today, Archive, Settings.
- Seasonal Easter egg — the app detects solstices, equinoxes, and the eight Wiccan sabbats and shows a subtle date badge on the Home screen. Summer Solstice fired on first launch (June 21, 2026).
- Generational Easter egg — `App.tsx` comment block: Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Rylee (Kieran) v3.0. These version numbers refer to Hill family generations, not software releases.
- Semantic versioning discipline — version `1.0.0` is reserved for the first stable, Google-verified, Kieran-owned production release. All current and near-term builds are `0.x` pre-production, by design.

### Live artifacts table (at snapshot)

| Artifact | Link | Status at snapshot |
|---|---|---|
| GitHub Repo | https://github.com/OKHP3/kierans-lifetrkr | ✅ Live |
| GitHub Pages — Live App | https://okhp3.github.io/kierans-lifetrkr/#/ | 🚀 Live — v0.1.8 |
| PRD v2.0 | `docs/PRD-v2.0.md` in repo | ✅ Archived reference |
| PRD v3.0 | `docs/PRD-v3.0.md` in repo | ✅ Current reference (at snapshot) |
| PRD v4.0 | `docs/PRD-v4.0.md` in repo | ✅ Current reference (at snapshot) |
| Moonlit Hearth Design Spec | `docs/DESIGN.md` in repo | ✅ Complete |
| ROADMAP.md | `docs/ROADMAP.md` in repo | ✅ Current (at snapshot) |
| HANDOFF.md | `docs/HANDOFF.md` in repo | ✅ Complete |
| GCP Project | Not yet created | ⚠️ BLOCKER — required for v0.2.0 |
| Replit Build Environment | Connected to OKHP3/kierans-lifetrkr | ✅ Connected — v0.1.8 built and deployed |

*Repo now also has `docs/PRD-v5.0.md`, `docs/RELEASE-TRUTH-BASELINE.md`, `docs/RELEASE-REVIEW-RECORD.md`, and `docs/VISION-PURPOSE-GAP-ANALYSIS.md`, none of which existed at snapshot time.*

### Sub-pages linked from the Hub (not fetched into this mirror — titles only)

- "Repo Doc Repair Prompt — June 22, 2026"
- "Ecosystem Connections — OKHP3 Repo Map"
- "Agent Skills Audit — LifeTrkr Skills Inventory & Publishing Plan"
- "DEPLOYMENT GAP — Local Work Not Pushed to GitHub Main"
- "okhp3-skill-cataloger — Skill Documentation"

---

## Part 2 — Deliverables Tracker (full mirror, 22 rows)

Database: "🛢️ db_Kieran's LifeTrkr — Build-out Deliverables", embedded in the Project Hub. Fields: Deliverable, Status, Category, Priority, Owner, System, Dependencies, Acceptance Criteria, Artifact URL, Target Date, Phase.

### Phase 0 — Setup (5 items, all Done)

| Deliverable | Owner | System |
|---|---|---|
| Deliverables tracker database | Jamie | Notion, Docs |
| Consolidated PRD | Jamie | Docs, Notion |
| Visual motif specification: Moonlit Hearth | Jamie | Docs, App UI, Notion |
| GitHub repository: kierans-lifetrkr | Jamie | GitHub |
| Project hub page | Jamie | Notion, Docs |

<details>
<summary>Acceptance criteria (Phase 0)</summary>

- **Deliverables tracker database** — Database exists with phase, status, priority, category, owner, system, acceptance criteria, dependencies, artifact URL, and target date fields. *Depends on: Project hub page.*
- **Consolidated PRD** — Single clean PRD reconciles ChatGPT and Claude outputs, uses Kieran's LifeTrkr naming, and includes Replit-native architecture and Moonlit Hearth design direction. *Depends on: Project hub page; PRD source material.*
- **Visual motif specification: Moonlit Hearth** — Design addendum captures palette, tone, iconography, copy rules, and guardrails: subtle mystical/cat vibe, not goth, not gamer-dark, not OverKill Hill branded. *Depends on: Consolidated PRD.*
- **GitHub repository: kierans-lifetrkr** — Private GitHub repo exists under Jamie's account with README, .gitignore, docs folder, and clean initial commit. *Depends on: Project naming confirmed.*
- **Project hub page** — Initial Notion command-center page exists for Kieran's LifeTrkr. *Depends on: None.*

</details>

### Phase 1 — Shell (9 items, all Done)

| Deliverable | Priority | Owner | System |
|---|---|---|---|
| Moonlit Hearth design tokens | High | Jamie + Kieran | App UI, Docs |
| Someday backlog V1 | High | Jamie + Kieran | App UI |
| Replit project scaffold | High | Jamie | Replit, GitHub |
| Home dashboard V1 | High | Jamie + Kieran | App UI |
| Today task list V1 | High | Jamie + Kieran | App UI |
| React + Vite app shell | High | Jamie + Kieran | Replit, App UI |
| Routines: day-of-week templates | High | Jamie + Kieran | App UI |
| Calendar mock agenda V1 | Medium | Jamie + Kieran | App UI, Google Calendar |
| Habits tracker V1 | Medium | Jamie + Kieran | App UI |

<details>
<summary>Acceptance criteria (Phase 1)</summary>

- **Moonlit Hearth design tokens** — Tailwind/theme tokens implement night background, deep plum surfaces, moonlit border, moon white text, mystic purple, candle gold, sage green, and rose ember. *Depends on: Visual motif specification.*
- **Someday backlog V1** — Someday tab supports add, delete, search, and promote-to-Today behavior using localStorage. *Depends on: Today task list V1.*
- **Replit project scaffold** — Replit project is created/imported, connected to GitHub, and configured as a Node/Express-capable project, not static-only. *Depends on: GitHub repository.*
- **Home dashboard V1** — Home shows greeting, today's date, Today's Rhythm routine checklist, Up Next mock events, and collapsed More section. *Depends on: React + Vite app shell; mock data.*
- **Today task list V1** — Today tab supports add, complete, delete, and done section for active tasks using localStorage. *Depends on: React + Vite app shell.*
- **React + Vite app shell** — App renders successfully with fixed bottom nav and six visible sections: Home, Routines, Habits, Calendar, Today, Someday. *Depends on: Replit project scaffold.*
- **Routines: day-of-week templates** — Routines tab supports seven day templates, today pre-selected, editable checklist items, and local completion state. *Depends on: React + Vite app shell.*
- **Calendar mock agenda V1** — Calendar tab shows mock agenda/events and a placeholder Connect Google Calendar action without implementing OAuth yet. *Depends on: React + Vite app shell.*
- **Habits tracker V1** — Habits can be added, toggled complete for today, and displayed with simple progress using localStorage. *Depends on: React + Vite app shell.*

</details>

### Phase 2 — Notion (3 items, all Deferred — superseded by the client-only architecture pivot)

| Deliverable | Priority | Owner | System |
|---|---|---|---|
| Notion product data schemas | High | Jamie | Notion |
| Express backend API shell | High | Jamie | Replit |
| Notion API proxy routes | High | Jamie | Replit, Notion |

<details>
<summary>Acceptance criteria (Phase 2)</summary>

- **Notion product data schemas** — Five Notion databases exist for Routine_Templates, Routine_Completions, Habits, Habit_Completions, and Tasks with app-compatible fields. *Depends on: Consolidated PRD.*
- **Express backend API shell** — Express server runs in Replit, serves the built React app, and exposes `/api` health route plus route modules for Notion and Google. *Depends on: Replit project scaffold.*
- **Notion API proxy routes** — Server-side routes perform CRUD for tasks, routines, habits, and completion records using Replit Secrets; no Notion token is exposed in frontend code. *Depends on: Express backend API shell; Notion product data schemas; Replit Secrets.*

</details>

### Phase 3 — Calendar (2 items, Not Started at snapshot)

| Deliverable | Priority | Owner | System |
|---|---|---|---|
| Google Cloud OAuth setup | Medium | Jamie | Google Cloud, Google Calendar, Replit |
| Google Calendar read-only integration | Medium | Jamie + Kieran | Google Calendar, Replit, App UI |

<details>
<summary>Acceptance criteria (Phase 3)</summary>

- **Google Cloud OAuth setup** — Google Cloud project has Calendar API enabled, OAuth client created, and Replit redirect URI configured. *Depends on: Replit deployment URL.*
- **Google Calendar read-only integration** — Kieran can connect Google Calendar; backend fetches read-only events; Home and Calendar display real upcoming events without storing tokens in browser localStorage. *Depends on: Google Cloud OAuth setup; Express backend API shell.*

*Both acceptance criteria still describe the pre-pivot backend-fetch model; the client-only GIS token model (see Architecture Direction above) supersedes the "backend fetches" language. This is a live open item — see `docs/PRD-v5.0.md` Build Session C, and `docs/HANDOFF.md`'s Google Cloud section for the current token-model steps.*

</details>

### Phase 4 — Polish (2 items)

| Deliverable | Status | Priority | Owner | System |
|---|---|---|---|---|
| Documentation set: README, PRD, DATA_MODEL, ROADMAP, HANDOFF | In Progress | High | Jamie | GitHub, Docs |
| UX polish and empty states | Not Started | Medium | Jamie + Kieran | App UI |

<details>
<summary>Acceptance criteria (Phase 4)</summary>

- **Documentation set** — Repository includes README.md and docs/PRD.md, docs/DATA_MODEL.md, docs/ROADMAP.md, docs/HANDOFF.md aligned with Notion tracker. *Depends on: GitHub repository; consolidated PRD.*
  *(The repo now has all of these plus PRD-v3 through v5, DESIGN.md, ARCHITECTURE.md, RELEASE-TRUTH-BASELINE.md, RELEASE-REVIEW-RECORD.md, and VISION-PURPOSE-GAP-ANALYSIS.md — well beyond the original acceptance criteria. Worth marking Done in Notion.)*
- **UX polish and empty states** — App includes calm empty states, accessible contrast, mobile spacing, tasteful moon/cat accents, and no heavy occult or OKHP branding. *Depends on: Phase 1 shell; Moonlit Hearth design tokens.*

</details>

### Phase 5 — Handoff (1 item, Not Started at snapshot)

| Deliverable | Status | Priority | Owner | System |
|---|---|---|---|---|
| Jamie-to-Kieran handoff package | Not Started | Medium | Jamie + Kieran | GitHub, Replit, Notion, Google Cloud, Docs |

<details>
<summary>Acceptance criteria</summary>

Checklist covers GitHub repo transfer, Replit fork/transfer, Notion workspace/database strategy, Google Cloud ownership, OAuth credentials, and secret rotation/re-entry. *Depends on: Documentation set; stable app deployment.*

*(`docs/HANDOFF.md` in this repo already satisfies — and substantially exceeds — this acceptance criteria: it has a full transfer checklist, a secrets-and-recovery section, an incident-response path, a release risk register, and an estimated handoff-time table. What's genuinely still open is the deployment/OAuth prerequisites HANDOFF.md itself gates on, not the handoff document. Worth updating this tracker row's status the next time you're in Notion — this deliverable is closer to "Ready for Review" than "Not Started.")*

</details>

---

## Part 3 — "Jamie-to-Kieran handoff package" (standalone card, blank body)

This page is a row in the Deliverables Tracker (Part 2, Phase 5) with no body content of its own beyond its properties. Full properties as captured:

| Field | Value |
|---|---|
| Deliverable | Jamie-to-Kieran handoff package |
| Category | Handoff |
| Status | Not Started |
| Priority | Medium |
| Phase | 5 - Handoff |
| Owner | Jamie + Kieran |
| System | GitHub, Replit, Notion, Google Cloud, Docs |
| Dependencies | Documentation set; stable app deployment |
| Acceptance Criteria | Checklist covers GitHub repo transfer, Replit fork/transfer, Notion workspace/database strategy, Google Cloud ownership, OAuth credentials, and secret rotation/re-entry. |
| Artifact URL | *(empty)* |
| Created | 2026-06-21T19:08:24.941Z |

See the reconciliation note in Part 2's Phase 5 section — `docs/HANDOFF.md` is the de facto artifact this row is waiting on, and it already exists.

---

## Part 4 — "Kieran's LifeTrkr" card-catalog routing entry (blank body)

A routing/index entry in Jamie's Notion "Card Catalog — Topic Routing" database, used to point other Notion pages back to the canonical Project Hub. No body content beyond properties:

| Field | Value |
|---|---|
| Topic | Kieran's LifeTrkr |
| Canonical Page URL | Private Notion workspace reference omitted from public mirror (the Project Hub) |
| Aliases | Kieran's LifeTrkr — Project Hub, LifeTrkr, Kieran LifeTrkr, father-daughter life tracker app, Moonlit Hearth app, db_Kieran's LifeTrkr — Build-out Deliverables |
| Tags | Canonical |
| Subdomain | AI Personalization |
| Notes | Private father-daughter life-organization app (routines, habits, calendar, to-dos, someday). Canonical hub re-homed under jmhDb; the Build-out Deliverables database is nested inside the hub. Not OverKill Hill-branded; queued as a future OKH public feature (Father's Day AI + vibe-coding origin) once complete. |
| Added | 2026-06-21T20:06:45.127Z |

*Note the last line: at snapshot time, Jamie's own routing notes flagged this as a **future** OKH public feature once complete. The `overkillhill.com/projects/kierans-lifetrkr/` page built and validated on 2026-08-26 (see `docs/PRD-v5.0.md` and the site build session notes) acts on that queued intent — deliberately keeping the public page link-out-only (no embed) rather than fully OKH-branding the app, consistent with "Not OverKill Hill-branded" above.*

---

*Imported by Claude (Cowork) on 2026-08-26 from the three Notion URLs Jamie provided. This is a point-in-time copy; re-run the import if Notion has moved on and you want a fresher mirror.*
