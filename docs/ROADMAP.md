# Kieran's LifeTrkr — Roadmap

**Last updated:** September 3, 2026 — release-truth reconciliation
**Versioning:** See PRD-v3.0 Section 3 for semantic versioning discipline.

> **Current release truth (September 3, 2026):** The source baseline is
> `v0.1.10` at `393c2aa74766d0572943306e372f5e35ec6cf950`. This roadmap is a
> planning document, not proof that its checkboxes are shipped. The candidate is
> approved with limits for controlled pre-production; stable-release approval is
> deferred pending the owner-run evidence gates in
> `docs/VISION-DELIVERY-MATRIX.md` and `docs/RELEASE-TRUTH-BASELINE.md`.
>
> **Product scope (September 3, 2026):** The approved next-release
> boundary is recorded in [`docs/PRODUCT-SCOPE-DECISION.md`](PRODUCT-SCOPE-DECISION.md).
> Task ordering, multi-target habits, limited ritual-item metadata/optional state,
> ritual ordering, and limited item-level recurrence overrides are required.
> End-of-day review remains intentionally deferred; it is not a silent v1.0 gap.

---

## v0.1.x — UI Shell + Core Features (SHIPPED)

The original shell shipped June 21, 2026. Later source work brought the current
baseline to `v0.1.10`; the dated session labels below are historical lineage,
not separate current release claims.

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

### Current boundaries (not defects in the v0.1.10 source baseline)
- [x] Version identity is derived from `package.json` and displays `v0.1.10`
- [x] New profiles default to dark; explicit light/system preferences remain supported
- [x] First-launch welcome flow, Settings About, privacy route, and oracle regeneration are present
- [x] Claude wording is worker-only and optional; the local tarot meaning is the supported fallback
- [x] Notion persistence and Google writes remain outside the current client-only/read-only product

### Next-release scope decision

The following items define the next coherent local-use increment. They are not
part of the `v0.1.10` release identity and do not close the owner-run release
gates.

- [x] Persist manual task order within Today and Someday, with keyboard move controls
- [x] Support 1–12 habit repetitions per configured day and independent completion
- [x] Support ritual-item title, time, description, optional marker, and keyboard ordering
- [x] Item-level recurrence overrides — optional item rules intersect with the parent schedule and preserve legacy items
- [ ] End-of-day review — intentionally deferred; no review surface is claimed

---

## v0.2.0 — Google Calendar + Tasks Live (OWNER-GATED)

**Prerequisite:** GCP project setup (see PRD-v4.0 Section 4 and PRD-v3.0 Section 19)

### Deliverables
- [ ] Owner confirms configured `VITE_GOOGLE_CLIENT_ID` without recording its value
- [ ] Owner verifies Google auth flow end-to-end (connect, token, expiry, reconnect, disconnect)
- [ ] Calendar tab: real Google events loaded from primary calendar
- [ ] Home upcoming strip: real Google events
- [ ] Today tab: "From Google Tasks" section (tasks due today)
- [ ] Someday tab: "From Google Tasks" section (undated tasks)
- [ ] TokenExpiryBanner verified functional
- [ ] Settings: Google Calendar (days ahead, refresh) and Tasks (list selection) sections
- [ ] Owner runs the two-account isolation and Kieran smoke matrix

---

## v0.3.0 — Oracle and date verification (PARTIAL / OWNER-GATED)

### Deliverables
- [x] Dark mode default, first-launch flow, About, and oracle regeneration are implemented
- [x] Recurrence, Mercury banner, horoscope isolation, and local oracle fallback are runtime-tested for recorded states
- [ ] Optional Claude worker deployed and live wording verified by owner
- [ ] Controlled-clock date rollover and regeneration evidence recorded for the current release

---

## v0.4.0 — PWA + Brand + Polish (SOURCE COMPLETE / DEVICE-GATED)

### Deliverables
- [x] PWA manifest verified (start_url, display: standalone, theme/bg colors, icons)
- [x] Versioned service worker for offline shell caching
- [ ] "Add to Home Screen" works on iOS and Android (owner device evidence)
- [x] App icon integrated (app-icon.png/webp)
- [x] Cat accent asset placed tastefully in UI (one placement)
- [ ] og-image.png verified
- [x] Task ordering is implemented in source; pointer drag is a convenience and labelled keyboard controls are the required path
- [ ] End-of-day review view — intentionally deferred by `PRODUCT-SCOPE-DECISION.md`
- [x] Performance audit recorded (oracle, celestial, calendar recurrence)

---

## v0.5.0 — OAuth Verification (OWNER DECISION / GATED)

### Deliverables
- [x] Privacy policy page at stable URL
- [ ] GCP OAuth consent screen configured for production
- [ ] App submitted to Google for verification (sensitive scopes: calendar.readonly, tasks.readonly)
- [ ] Awaiting Google approval (4–6 weeks)

---

## v1.0.0 — Production (Reserved, no current claim)

**Criteria for v1.0.0:**
- Google OAuth verification decision completed if the product is opened beyond
  the controlled owner/test-user model
- App passes the owner-run lifecycle and accessibility/storage/device evidence
- GitHub repo transferred to Kieran's account (OKHP3 → Kieran's personal account)
- Kieran owns the GCP project and accepts the handoff
- The configured client ID is owned and managed under the intended account

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
