# Kieran's LifeTrkr — Roadmap

**Last updated:** June 22, 2026 — second build session  
**Versioning:** See PRD-v3.0 Section 3 for semantic versioning discipline.

> **Current release truth (August 22, 2026):** The source baseline is `v0.1.10`.
> This roadmap is a planning document, not proof that its checkboxes are shipped.
> Stable-release approval is deferred pending the evidence gates in
> `docs/RELEASE-TRUTH-BASELINE.md`.

---

## v0.1.x — UI Shell + Core Features (SHIPPED)

Phase 1 shipped June 21, 2026. Phase 1 patches (v0.1.1–v0.1.8) shipped June 22, 2026.

### Shipped
- [x] React 19 + Vite 8 + TypeScript + Tailwind CSS v4 SPA
- [x] Moonlit Hearth design system (amethyst, dark mode, Cormorant Garamond + DM Sans)
- [x] All current surfaces: Home, Calendar, Today, Someday, Rituals, Habits, Settings
- [x] BottomNav (mobile) + SideNav (desktop, ≥768px)
- [x] AppContext + useReducer + localStorage (namespaced by Google sub)
- [x] storage.ts abstraction layer
- [x] HashRouter (GitHub Pages compatible)
- [x] Google Identity Services (GIS) client-side token model
- [x] Ritual templates: day-of-week, items, edit mode, completion tracking, midnight reset
- [x] Habits: daily toggle, 7-day grid, moon-streak counter, add/deactivate/delete
- [x] Calendar: month grid, day expansion, manual event CRUD, Google-ready structure, moon phases
- [x] Today: task list (status=today), complete/archive/delete, FAB
- [x] Someday/Backlog: task list (status=backlog), promote to Today, search, sort, FAB
- [x] Settings: profile, Google connection, oracle/celestial toggles, theme, social
- [x] Theme toggle: Dark / Light / System (Auto)
- [x] Seasonal badge (solstices, equinoxes, sabbats)
- [x] Toast notifications with undo
- [x] RecurrenceEditor component
- [x] CategoryPicker component (31 categories: Spiritual Practice + Daily Life)
- [x] TagInput component
- [x] FilterBar component
- [x] celestial.ts: moon phase math, astro season detection, Mercury retrograde calendar
- [x] cosmic.ts: deterministic daily cards and wisdom
- [x] oracle.ts: three-layer oracle stack (tarotapi.dev + freehoroscopeapi.com + Claude)
- [x] useOracle.ts hook
- [x] OracleCard component
- [x] Oracle integration in Home "More" section and Calendar detail panel
- [x] Settings: Oracle & Celestial section (Daily Oracle toggle, Mercury Rx banner, moon phase on calendar, sun sign picker)
- [x] Easter egg: triple-tap ✦ reveals generational lineage modal

### Known gaps (v0.1.x patch items)
- [ ] APP_VERSION constant not bumped — displays v0.1.0, should match deployed version
- [ ] Default theme should be Dark, not Auto
- [ ] First-launch welcome screen (PRD-v3.0 Section 16.1)
- [ ] Settings: About section
- [ ] Settings: "Regenerate today's oracle" button
- [ ] VITE_ANTHROPIC_API_KEY not set — Claude oracle falls back to card.meaning_up

---

## v0.2.0 — Google Calendar + Tasks Live (NEXT)

**Prerequisite:** GCP project setup (see PRD-v4.0 Section 4 and PRD-v3.0 Section 19)

### Deliverables
- [ ] VITE_GOOGLE_CLIENT_ID set in Replit Secrets
- [ ] Google auth flow verified end-to-end (connect, token, expiry, reconnect, disconnect)
- [ ] Calendar tab: real Google events loaded from primary calendar
- [ ] Home upcoming strip: real Google events
- [ ] Today tab: "From Google Tasks" section (tasks due today)
- [ ] Archive tab: "From Google Tasks" section (undated tasks)
- [ ] TokenExpiryBanner verified functional
- [ ] Settings: Google Calendar (days ahead, refresh) and Tasks (list selection) sections
- [ ] Deploy + test with Kieran's Google account

---

## v0.3.0 — Close Remaining Gaps

### Deliverables
- [ ] Dark mode as default theme (first-time users)
- [ ] APP_VERSION bumped and kept current
- [ ] First-launch experience screen
- [ ] Settings About section
- [ ] Settings "Regenerate today's oracle" button
- [ ] VITE_ANTHROPIC_API_KEY activated via Replit external_apis
- [ ] Claude oracle confirmed live (genuine AI-generated daily message)
- [ ] Recurrence `isActiveToday()` filtering verified for habits and ritual items
- [ ] Mercury retrograde banner on Calendar verified
- [ ] Horoscope section renders when birthSign is set

---

## v0.4.0 — PWA + Brand + Polish

### Deliverables
- [x] PWA manifest verified (start_url, display: standalone, theme/bg colors, icons)
- [x] Versioned service worker for offline shell caching
- [ ] "Add to Home Screen" works on iOS and Android
- [ ] App icon integrated (app-icon.png/webp)
- [x] Cat accent asset placed tastefully in UI (one placement)
- [ ] og-image.png verified
- [ ] Drag-to-reorder tasks in Today and Archive
- [ ] End-of-day review view (optional)
- [x] Performance audit recorded (oracle, celestial, calendar recurrence)

---

## v0.5.0 — OAuth Verification

### Deliverables
- [ ] Privacy policy page at stable URL
- [ ] GCP OAuth consent screen configured for production
- [ ] App submitted to Google for verification (sensitive scopes: calendar.readonly, tasks.readonly)
- [ ] Awaiting Google approval (4–6 weeks)

---

## v1.0.0 — Production (Reserved)

**Criteria for v1.0.0:**
- Google OAuth verification approved
- App runs stably on Kieran's Google account
- GitHub repo transferred to Kieran's account (OKHP3 → Kieran's personal account)
- Kieran owns the GCP project
- VITE_GOOGLE_CLIENT_ID reflects Kieran's own credential

---

## Post-v1.0 Ideas (Kieran's Decisions)

These are not scheduled. They're captured here for future consideration.

- Push notification reminders for habits and rituals
- End-of-week review screen with stats
- Custom themes (fork Moonlit Hearth into Kieran's own colorway)
- Backlog triage assistant (AI-powered)
- Calendar event creation from app (currently read-only)
- Export: weekly summary PDF / monthly habit report
- Notion backend sync (if Kieran wants cross-device persistence beyond one browser)
- Multiple oracle modes: tarot-only, cosmic-only, full AI
