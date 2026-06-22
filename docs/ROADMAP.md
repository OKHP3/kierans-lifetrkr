# Kieran's LifeTrkr — Roadmap

**Last updated:** June 22, 2026 — second build session (v0.1.8)
**Versioning discipline:** See PRD-v3.0 Section 3. v1.0.0 is earned, not assigned.

---

## v0.1.x — UI Shell + Core Features (SHIPPED)

Phase 1 shipped June 21, 2026. Phase 1 patches (v0.1.1–v0.1.8) shipped June 22, 2026, pulling most planned v0.3.0 features forward.

### Shipped ✅
- [x] React 18 + Vite + TypeScript + Tailwind SPA, deployed to GitHub Pages
- [x] Moonlit Hearth design system (amethyst, dark/light/auto themes, Cormorant Garamond + DM Sans)
- [x] All 7 tabs: Home, Rituals, Habits, Calendar, Today, Archive, Settings
- [x] BottomNav (mobile, ≤767px) + SideNav (desktop, ≥768px)
- [x] AppContext + useReducer + namespaced localStorage (keyed by Google sub)
- [x] storage.ts abstraction, HashRouter, Google Identity Services (GIS) token model
- [x] Ritual templates: day-of-week, items, edit mode, completion, midnight reset
- [x] Habits: daily toggle, 7-day grid, moon-streak counter, add/deactivate/delete
- [x] Calendar: month grid, day expansion, manual event CRUD, moon phase on every cell
- [x] Today: task list (status=today), complete/archive/delete, FAB
- [x] Archive/Backlog: search, sort, promote to Today, FAB
- [x] Settings: profile, Google connection (UI only), oracle/celestial toggles, theme, social handles
- [x] Seasonal badge (solstices, equinoxes, sabbats)
- [x] Toast notifications with undo
- [x] RecurrenceEditor, CategoryPicker, TagInput, FilterBar components
- [x] celestial.ts: moon phase math, astrological season detection, Mercury retrograde calendar
- [x] cosmic.ts: deterministic daily cards and wisdom
- [x] oracle.ts: three-layer oracle (tarotapi.dev + freehoroscopeapi.com + Anthropic Claude)
- [x] useOracle.ts hook, OracleCard component
- [x] Oracle card in Home "More" section and Calendar detail panel
- [x] Settings: Oracle & Celestial section, 12-sign sun sign picker
- [x] Easter egg: triple-tap ✦ → generational lineage modal

### Open patch items (v0.1.x)
- [ ] APP_VERSION constant — still at v0.1.0, must match deployed version
- [ ] Default theme — should be Dark, not Auto (first-time visitors see light mode)
- [ ] First-launch welcome screen (PRD-v3.0 Section 16.1)
- [ ] Settings: About section (version, origin, MIT license)
- [ ] Settings: "Regenerate today's oracle" button (clears daily cache, re-fetches)
- [ ] VITE_ANTHROPIC_API_KEY not set — Claude oracle falls back to card.meaning_up

---

## v0.2.0 — Google Calendar + Tasks Live (NEXT)

**Hard prerequisite (manual, ~15 min):** GCP project setup — see PRD-v3.0 Section 19 and PRD-v4.0 Session B prerequisite block. `VITE_GOOGLE_CLIENT_ID` must be in Replit Secrets before this session can start.

### Deliverables
- [ ] VITE_GOOGLE_CLIENT_ID set, Google auth flow verified end-to-end
- [ ] Calendar tab: real Google Calendar events loaded
- [ ] Home upcoming strip: real Google events
- [ ] Today tab: "From Google Tasks" section (tasks due today)
- [ ] Archive tab: "From Google Tasks" section (undated tasks)
- [ ] TokenExpiryBanner verified functional
- [ ] Settings: Google Calendar (days ahead, refresh) and Tasks (list selector) sections wired
- [ ] Multi-account isolation verified (different Google accounts see different data)
- [ ] Deployed and tested with Kieran's Google account

---

## v0.3.0 — Close Remaining Gaps

### Deliverables
- [ ] Dark mode as default for first-time visitors
- [ ] APP_VERSION kept current through deploys
- [ ] First-launch welcome screen
- [ ] Settings About section
- [ ] Settings "Regenerate today's oracle" button
- [ ] VITE_ANTHROPIC_API_KEY activated via Replit external_apis skill
- [ ] Claude oracle confirmed live (genuine AI-generated daily message)
- [ ] Recurrence isActiveToday() filtering verified for habits and ritual items
- [ ] Mercury retrograde banner verified on Calendar
- [ ] Horoscope section renders correctly when birthSign is set

---

## v0.4.0 — PWA + Brand Assets + Polish

### Deliverables
- [ ] PWA manifest verified (start_url, display: standalone, bg/theme colors)
- [ ] Service worker for offline shell caching
- [ ] "Add to Home Screen" works on iOS and Android
- [ ] App icon integrated into manifest
- [ ] Cat accent asset placed in UI (one tasteful placement)
- [ ] Drag-to-reorder tasks in Today and Archive
- [ ] End-of-day review view (optional)
- [ ] Performance audit: oracle fetch, celestial calc, calendar recurrence expansion

---

## v0.5.0 — OAuth Verification

### Deliverables
- [ ] Privacy policy page at stable URL
- [ ] GCP OAuth consent screen configured for Production mode
- [ ] App submitted for Google verification (sensitive scopes: calendar.readonly, tasks.readonly)
- [ ] Google approval received (~4–6 weeks)

---

## v1.0.0 — Production (Reserved)

v1.0.0 is not a milestone to schedule — it is a standard to meet.

**Criteria:**
- Google OAuth verification approved and active
- App runs stably on Kieran's own Google account
- GitHub repo transferred to Kieran's account
- Kieran owns the GCP project and credentials
- VITE_GOOGLE_CLIENT_ID reflects Kieran's credential, not Jamie's

See `docs/HANDOFF.md` for the complete ownership transfer checklist.

---

## Post-v1.0 Ideas (Kieran's Decisions)

Not scheduled. These become Kieran's choices to make when she's ready.

- Push notification reminders for habits and rituals
- End-of-week review screen with habit/task stats
- Drag-and-drop ritual item reordering
- Custom themes (fork Moonlit Hearth into Kieran's own colorway)
- Backlog triage assistant (AI-powered)
- Calendar event creation (currently read-only Google Calendar)
- Export: weekly summary, monthly habit report
- Notion backend sync (if cross-device persistence beyond one browser is wanted)
- Multiple oracle modes: tarot-only, cosmic-only, full AI

---

*Built on Father's Day, Summer Solstice 2026. The fourth hill. ✦*
