# Kieran's LifeTrkr — Product Requirements Document v4.0

**Document authority:** Addendum to PRD-v3.0. PRD-v3.0 remains the canonical architecture reference. This document supersedes PRD-v3.0 for planning and prioritization of all sessions from June 22, 2026 onward.
**Date:** June 22, 2026 (second session — Summer Solstice)
**Live app:** https://okhp3.github.io/kierans-lifetrkr/#/
**Repository:** https://github.com/OKHP3/kierans-lifetrkr
**Notion hub:** https://app.notion.com/p/overkillhill/Kieran-s-LifeTrkr-Project-Hub-386812e0ced481878291e92d5e428ce5
**Status:** Approved — planning authority for v0.2.0 and beyond

> **Baseline notice (August 22, 2026):** This document contains historical planning
> material and a dated audit, not a current release assertion. Current source truth
> is `v0.1.10`, uses Someday rather than Archive, and uses the React 19 / Vite 8 /
> Tailwind 4 toolchain. See `docs/RELEASE-TRUTH-BASELINE.md` before treating any
> shipped, planned, or release-readiness statement as current.

---

## Section 1 — Current State Audit (v0.1.8)

The June 22, 2026 second build session advanced from v0.1.0 (UI shell only) to v0.1.8, pulling in most of the planned v0.3.0 feature set ahead of schedule.

### Shipped and live (v0.1.8)

- All 7 navigation tabs functional (Home, Rituals, Habits, Calendar, Today, Archive, Settings) — both BottomNav mobile and SideNav desktop
- `src/lib/celestial.ts` — pure client-side Julian date math for moon phase illumination/age, moon phase name/emoji, next full/new moon prediction, astrological season detection, Mercury retrograde calendar through 2027
- `src/lib/cosmic.ts` — deterministic daily oracle data: daily cards, daily wisdom, cosmic events keyed to date
- `src/lib/oracle.ts` — three-layer oracle stack: `fetchTarotCard()` → tarotapi.dev, `fetchHoroscope()` → freehoroscopeapi.com, `generateOracleMessage()` → optional server-side oracle worker; localStorage daily cache
- `src/hooks/useOracle.ts` — orchestrates the fetch sequence; respects `oracleEnabled` and `birthSign` from settings
- `src/components/OracleCard.tsx` — display component; renders tarot card name, moon phase, Claude oracle message, horoscope; pulse loading state; mystical gradient
- `src/components/RecurrenceEditor.tsx` — full recurrence UI (frequency, interval, weekday pickers, end conditions)
- `src/components/CategoryPicker.tsx` — 31-category picker across Spiritual Practice and Daily Life groups
- `src/components/TagInput.tsx` — chip-based tag input with kebab normalization
- `src/components/FilterBar.tsx` — horizontal scrollable filter chips
- Settings page: Oracle & Celestial section with Daily Oracle toggle, Mercury Rx banner toggle, Moon phase on calendar toggle, 12-sign zodiac sun sign picker
- Calendar page: moon phase emoji on every calendar cell, oracle card panel below calendar grid for the selected date, First Quarter / phase meaning cards, "Today's Card" tarot display
- Home page: OracleCard imported and rendered in "More" section; celestial row (moon phase + astro season badges) below date line; Mercury Rx banner; Easter egg triple-tap

### Wired but awaiting environment keys

- **Google Calendar / Tasks:** All library code exists (`googleCalendar.ts`, `googleTasks.ts`, `useGoogleAuth.ts`, `GoogleConnectButton.tsx`, `TokenExpiryBanner.tsx`). Blocked by `VITE_GOOGLE_CLIENT_ID` not set in Replit environment. Settings shows "VITE_GOOGLE_CLIENT_ID not set in environment."
- **Claude oracle message:** `generateOracleMessage()` in `oracle.ts` calls the configured oracle worker. Without a worker, it falls back gracefully to `card.meaning_up` (the tarot card's upright meaning). The fallback is functional but generic.
- **Horoscope:** `fetchHoroscope()` requires `birthSign` set in Settings. When set, it calls freehoroscopeapi.com. Reliability of this free API is unknown.

### Known bugs / gaps from live review

- `APP_VERSION` in `src/constants.ts` is still `'v0.1.0'` — displayed version in SideNav footer says `v0.1.0` but deployed build is v0.1.8
- Default theme is `Auto` — on most systems (light OS) this launches the app in light/parchment mode. PRD-v3.0 specifies dark as the default. The Moonlit Hearth aesthetic is intended for dark mode; light mode is "Morning Parchment" (secondary).
- The optional oracle worker's model and deployment still require production-owner verification.
- No first-launch experience (welcome screen for users without any saved data) — PRD-v3.0 Section 16.1 specifies a full-screen first-launch flow.
- Settings page is missing the "About" section (app version, origin story, MIT license link). (Note: an About card exists but shows `v0.1.0` — it needs the `APP_VERSION` constant and a "Regenerate" button.)
- Settings page is missing the "Regenerate today's oracle" button (clears cache key for today, triggers re-fetch).
- No `src/lib/AppReducer.ts` split — `AppContext.tsx` contains both context and reducer.
- The Archive tab uses "backlog" terminology in some places and "archive" in others — PRD-v3.0 calls it Archive tab with backlog tasks.
- Vyrle vs Virgil: RESOLVED — June 22, 2026. Jamie confirmed the correct spelling is VYRLE. All doc files have been updated. Home.tsx and README.md (which already had Vyrle) are correct. PRD-v3.0 and DESIGN.md have been corrected. No further action needed.

---

## Section 2 — Versioning Alignment

| Version | Scope | Status | Notes |
|---|---|---|---|
| v0.1.0 | Phase 1 UI shell | SHIPPED June 21 | First session |
| v0.1.1–v0.1.8 | Recurrence, celestial, oracle, categories | SHIPPED June 22 | Second session — pulled v0.3.0 work forward |
| v0.2.0 | Google Calendar + Tasks live | NEXT | Activate VITE_GOOGLE_CLIENT_ID |
| v0.3.0 | Close remaining Phase 3 gaps | Planned | First-launch, About, Regenerate oracle, dark default, Claude oracle activation |
| v0.4.0 | PWA + brand assets + polish | Planned | Offline, add-to-home-screen, og-image |
| v0.5.0 | OAuth verification + privacy policy | Planned | GCP app verification submission |
| v1.0.0 | Production — Google-verified, Kieran-owned | Reserved | Account handoff complete |

---

## Section 3 — Immediate Priority: Optional Oracle Worker Activation (v0.1.9 patch)

The public-safe way to activate Claude wording is deploying the oracle worker.
The entire three-layer stack remains functional without it.

**VITE_ORACLE_WORKER_URL:**
Deploy the worker described in the architectural decision below, store the
Anthropic key only as a worker secret, then set the worker URL in Replit
Secrets. Never set `VITE_ANTHROPIC_API_KEY`; it is not supported.

**Model name:** The worker owns model selection. Confirm the current model at
worker deployment time. The browser prompt and caching logic do not change.

**Tarot API:** tarotapi.dev is free, no auth, CORS-enabled. The fallback (day-of-year modulo major arcana) already exists. No action needed.

**Horoscope API:** freehoroscopeapi.com is a free third-party with no SLA. The code already handles failure silently. No action needed — the horoscope section simply doesn't render if the API fails.

**After activation:** The oracle card in Home "More" section will show a genuine Claude-generated daily message seeded with moon phase, astrological season, tarot card, and optionally the user's sun sign. The cache key (`lifetrkr:{sub}:oracle:{YYYY-MM-DD}`) ensures it generates once and stays stable all day.

---

## Section 4 — v0.2.0 Build Session: Google Calendar + Tasks Activation

**Prerequisites:**
- GCP project must exist with Calendar API and Tasks API enabled
- OAuth 2.0 Client ID created (Web Application type)
- Authorized JavaScript origins: `https://okhp3.github.io` and `http://localhost:5173`
- `VITE_GOOGLE_CLIENT_ID` added to Replit Secrets
- Kieran's Gmail added as test user in GCP OAuth consent screen (while app is in Testing mode)

**What's already built (do not rebuild):**
- `src/lib/googleCalendar.ts` — fetches events from primary calendar
- `src/lib/googleTasks.ts` — fetches task lists and tasks
- `src/hooks/useGoogleAuth.ts` — GIS token model, sessionStorage, expiry tracking
- `src/components/GoogleConnectButton.tsx` — OAuth initiation and status display
- `src/components/TokenExpiryBanner.tsx` — global expiry banner

**What needs verification/completion in v0.2.0:**
1. Verify `useGoogleAuth.ts` correctly initiates GIS token flow when Client ID is present
2. Verify Calendar tab switches from manual-only mode to real events mode when connected
3. Verify Today tab shows "From Google Tasks" section when connected and `showTasksDueToday: true`
4. Verify Archive tab shows undated Google Tasks when connected and `showGoogleTasks: true`
5. Verify Settings Google Account section shows connection status, email, last synced, Disconnect button
6. Verify Settings Google Calendar section shows "Days ahead" control and "Refresh" button
7. Verify Settings Google Tasks section shows task list checkboxes
8. Verify `TokenExpiryBanner` appears when token is about to expire
9. Verify multi-account isolation: switching Google accounts shows different data

**v0.2.0 acceptance criteria:**
- Kieran can connect her Google account
- Her next 14 days of Google Calendar events appear in Calendar tab and Home upcoming strip
- Her Google Tasks appear in Today tab (due today) and Archive tab (undated)
- Disconnecting Google returns the app to manual-only mode without losing local data
- Push to `main` → GitHub Actions deploys to GitHub Pages

---

## Section 5 — v0.3.0 Build Session: Close Remaining Gaps

These items were planned for v0.3.0 in PRD-v3.0 but did not ship in the June 22 session:

**5.1 Dark mode as default**
Change `ThemeContext.tsx` so the initial theme is `'dark'` instead of `'auto'` when no preference is saved in localStorage. Users who have already set a preference are unaffected. The Moonlit Hearth aesthetic is optimized for dark mode; first-time visitors should see the intended experience.

**5.2 APP_VERSION constant**
Update `src/constants.ts`: `APP_VERSION = 'v0.2.0'` after v0.2.0 ships, or set it to the correct current semantic version before each deploy. This value is displayed in the SideNav footer.

**5.3 First-launch experience**
Per PRD-v3.0 Section 16.1: if `localStorage.getItem('lifetrkr:profile')` is null AND no local data exists, show a full-screen centered welcome flow instead of the normal app shell:
- App name in Cormorant Garamond 300, 36px
- Tagline: "Your day. Your rituals. Your rules."
- ✦ glyph in amethyst
- "Connect Google Account" — primary CTA (amethyst bg, dark text)
- "Use without Google" — secondary link (textSecondary, smaller)

This should wrap the main `<App>` router, rendered in `main.tsx` or as a conditional in `App.tsx`. Once the user clicks either option, it does not appear again.

**5.4 Settings — About section**
The Settings page has an About card but it shows a hardcoded `v0.1.0`. Update it to use `APP_VERSION` from constants and add a "Regenerate today's oracle" button:
- App name: "Kieran's LifeTrkr"
- Version: `APP_VERSION` from constants (e.g. "v0.2.0 — pre-production")
- "Built on Father's Day, Summer Solstice 2026"
- "Jamie + Kieran Hill · MIT License"

**5.5 Settings — Regenerate today's oracle**
Add a "Regenerate today's oracle" button in the Oracle & Celestial settings section. On tap:
1. Remove `lifetrkr:{sub}:oracle:{today}` and `lifetrkr:{sub}:tarot:{today}` from localStorage
2. Dispatch `SET_ORACLE` with `null`
3. `useOracle.ts` will re-trigger and fetch fresh data

**5.6 Activate the optional oracle worker**
Set `VITE_ORACLE_WORKER_URL` only after deploying the worker and storing the
Anthropic credential in the worker. Confirm Claude wording generates
successfully, then verify the daily cache prevents a second request on reload.

**5.7 Recurrence active-day filtering**
Verify that `isActiveToday()` in `date.ts` correctly gates which ritual items and habits appear on the current day. A habit with `frequency: 'weekdays'` should not show on Saturday. A ritual item with `frequency: 'specific_days': [1,3,5]` (Mon/Wed/Fri) should not show on Tuesday.

**5.8 Mercury retrograde banner on Calendar**
Verify the Mercury Rx banner renders at the top of the Calendar tab when Mercury is retrograde per `getMercuryStatus()` in `celestial.ts`, and that the `showMercuryBanner` settings toggle hides it.

---

## Section 6 — v0.4.0 Build Session: PWA + Polish

**6.1 PWA manifest**
`public/manifest.json` already exists. Verify it has correct `start_url`, `display: "standalone"`, `background_color: "#0D0B14"`, `theme_color: "#C4A0E8"`. Add service worker (Vite PWA plugin or manual) for offline shell caching. Goal: "Add to Home Screen" works on iOS and Android.

**6.2 Brand asset integration**
The following brand assets exist in `src/assets/` but are not yet used in the app UI:
- `app-icon.png` / `app-icon.webp` — app icon (used in manifest and og-image)
- `cat-accent.png` / `cat-accent.webp` — decorative black cat; target placement: Home header decoration or Settings about section
- `app-banner.png` / `app-banner.webp` — wide banner; target: og-image / social share
- `design-system-overview.png` — dev reference only, not in app UI

Integrate `app-icon` into PWA manifest icons. Surface `cat-accent` tastefully in the UI (one placement, subtle). Ensure `og-image.png` in `public/` references the banner asset.

**6.3 End-of-day review (optional, v0.4.x)**
A lightweight "wrap up" view accessible from Home (when it's evening) or Today tab:
- Habits completed today: N of M
- Ritual items checked: N of M
- Tasks done: N of M
- Optional reflective prompt (one of 3–4 rotating questions)

This is optional and should not block v0.4.0 if scope is tight.

**6.4 Drag-to-reorder tasks**
Today tab and Archive tab: allow drag-and-drop reordering of tasks within their status bucket. No external drag library — use native HTML5 drag events. Order persists to localStorage.

**6.5 Performance audit**
- Verify no unnecessary re-renders in `useOracle.ts` (oracle should fetch once per day, not on every Home mount)
- Verify `celestial.ts` calculations are not running on every keystroke
- Verify Calendar recurrence expansion is not recalculating on every scroll

---

## Section 7 — v0.5.0 Build Session: OAuth Verification

Before v1.0.0, the GCP OAuth consent screen must be moved from "Testing" to "Production" and submitted for Google verification. This is required to allow any Google account (not just test-listed accounts) to connect Google Calendar and Tasks.

**Checklist:**
- Privacy policy page must exist at a stable URL (GitHub Pages or custom domain). Minimum content: what data is collected (none — all local), what Google data is accessed (Calendar read-only, Tasks read-only), how it's used, contact.
- OAuth consent screen: App name = "Kieran's LifeTrkr", App logo = app-icon.png, Privacy policy URL, Support email
- Scopes to declare: `calendar.readonly`, `tasks.readonly`, `openid`, `profile`, `email`
- Submit for verification. Google review typically takes 4–6 weeks for sensitive scopes.
- After approval: move from Testing to Production in GCP console. Remove Kieran from test-user list (she'll connect as a regular user).

---

## Section 8 — Three-Layer Oracle Stack: Complete Specification

This section is the canonical reference for the oracle system as designed and implemented. Use this as the authoritative spec for any oracle-related work.

**Layer 1: Tarot (tarotapi.dev)**
- Endpoint: `GET https://tarotapi.dev/api/v1/cards/random?n=1`
- Response: `{ cards: [TarotCard] }` where TarotCard has `name`, `name_short`, `type`, `suit`, `value`, `meaning_up`, `meaning_rev`, `desc`
- CORS-enabled, no auth, free
- Cache key: `lifetrkr:{sub}:tarot:{YYYY-MM-DD}` — persists all day; no re-fetch on reload
- Fallback: deterministic card from MAJOR_ARCANA array using `dayOfYear % 22` — card is different each day but consistent within a day
- Code location: `src/lib/oracle.ts` → `fetchTarotCard()`

**Layer 2: Daily Horoscope (freehoroscopeapi.com)**
- Endpoint: `GET https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign.toLowerCase()}`
- Response: `{ data: { horoscope: string } }`
- Only fetched when `settings.birthSign` is set
- Failure is silent — horoscope section simply does not render
- Result stored in `OracleReading.horoscope` (optional field)
- Code location: `src/lib/oracle.ts` → `fetchHoroscope(sign)`

**Layer 3: Claude Oracle Message (optional worker)**
- Requires `VITE_ORACLE_WORKER_URL` only; the Anthropic credential remains in the worker
- Endpoint: `POST` to the configured worker URL
- The worker forwards the request to Anthropic and returns an Anthropic-shaped response
- System prompt: `"You are a warm, grounded, slightly mystical daily oracle for a personal life app. Never use em dashes. Sound like someone who reads a lot and walks in the woods at dusk."`
- User prompt (assembled in `generateOracleMessage()`):
  - Today's date (formatted long)
  - Moon phase name
  - Astrological season (sign + element)
  - Tarot card name + upright meaning
  - Mercury retrograde status (if applicable)
  - User's sun sign (if `settings.birthSign` is set)
  - Instruction: "Write a 2-3 sentence daily oracle message. Warm, grounded, quietly mystical. Do not use em dashes."
- max_tokens: 150
- Cache key: `lifetrkr:{sub}:oracle:{YYYY-MM-DD}` — the Claude message string is stored here; generates once per day, stable all day
- Fallback: `card.meaning_up` stored in cache key — so even if API fails, re-renders don't re-call
- Code location: `src/lib/oracle.ts` → `generateOracleMessage()`

**OracleCard display spec:**
```
┌─────────────────────────────────────────────────────┐
│ ✦ Oracle                              🌗 First Quarter│
│ ─────────────────────────────────────────────────── │
│   The Sun                                           │
│   major arcana · upright: clarity, joy, success     │
│                                                     │
│   "Today calls you toward what is already bright    │
│    within you. The sun does not apologize for       │
│    shining — neither should you."                   │
│                                                     │
│ ♋ Cancer season                    ♊ Gemini today ↗ │
└─────────────────────────────────────────────────────┘
```
- Background: `var(--surface)` with subtle amethyst gradient overlay
- Left accent bar: 3px solid `var(--accent-amethyst)`
- Card name: Cormorant Garamond 300, 18px, textPrimary
- Oracle message: DM Sans 400, 13px, italic, textSecondary, in quotation marks
- Moon phase pill: Space Mono, 11px
- Horoscope link: if available, tapping "↗" opens full horoscope text in a bottom sheet modal

**Fetch sequence in `useOracle.ts`:**
1. On Home mount, check `shouldFetch` = `oracleEnabled && !isLoadingOracle && (!oracle || oracle.date !== today)`
2. If shouldFetch: dispatch `SET_LOADING_ORACLE` true
3. In parallel: `fetchTarotCard()`, `getMoonPhase()`, `getAstroSeason()`, `getMercuryStatus()`
4. If birthSign set: `fetchHoroscope(birthSign)`
5. `generateOracleMessage(card, moon, season, mercury, birthSign)`
6. Assemble `OracleReading`, dispatch `SET_ORACLE`
7. `SET_LOADING_ORACLE` false

---

## Section 9 — Data Schema Addenda (v0.1.8 state)

The following deviates from or extends PRD-v3.0 Section 9:

**localStorage keys confirmed in current code:**
```
lifetrkr:profile                          ← GoogleProfile | null
lifetrkr:{sub}:settings                   ← UserSettings
lifetrkr:{sub}:routineTemplates           ← RitualTemplate[]
lifetrkr:{sub}:routineCompletions         ← RitualCompletion[]
lifetrkr:{sub}:habits                     ← Habit[]
lifetrkr:{sub}:habitCompletions           ← HabitCompletion[]
lifetrkr:{sub}:tasks                      ← Task[]
lifetrkr:{sub}:oracle:{YYYY-MM-DD}        ← string (Claude message, daily cache)
lifetrkr:{sub}:tarot:{YYYY-MM-DD}         ← NOT YET IMPLEMENTED as separate key
                                          (tarot card is embedded in OracleReading)
```

Note: The PRD-v3.0 specified `lifetrkr:{sub}:tarot:{date}` as a separate key, but the current `useOracle.ts` and `oracle.ts` implementation embeds the tarot card inside the `OracleReading` object and caches the Claude message string at `oracle:{date}`. If a separate tarot cache key is desired for the "Regenerate" button to selectively clear only the message (not the card), it should be added as part of the v0.3.0 settings work.

**RecurrenceRule type (actual implementation — differs from PRD-v3.0):**
The shipped `types.ts` uses `RecurrenceRule` with `{ frequency, interval, startDate, end: { mode: 'never' | 'after_count' | 'on_date' }, exceptions: string[] }` — PRD-v3.0 specified `RecurrencePattern` with `{ frequency, interval, daysOfWeek, timesPerDay, end: { type: ... } }`. The implementation diverged. Use the actual `src/types.ts` as the source of truth for all type definitions — never PRD-v3.0 types.ts listings when they conflict.

---

## Section 10 — Environment Variables

| Variable | Purpose | Required | Notes |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google Calendar + Tasks OAuth | For Google features | Not a secret — safe to embed in client code. Set in Replit Secrets. |
| `VITE_ORACLE_WORKER_URL` | Claude oracle message — via Cloudflare Worker proxy | Optional | The worker holds the Anthropic credential; omit for local tarot fallback. |

`VITE_GOOGLE_CLIENT_ID` is optional for Google features. `VITE_ORACLE_WORKER_URL`
is optional for Claude wording. Both have graceful fallbacks when absent. The
app is fully functional without either — Google sections show "not connected"
state, and the oracle falls back to tarot card's upright meaning.

`.env.example` in the repo documents the supported variables with setup
instructions. Never commit `.env` to the repo.

**Oracle delivery — public-release architectural decision:**

The public-release boundary is the Cloudflare Worker proxy
(`VITE_ORACLE_WORKER_URL`). The browser never receives an Anthropic API key and
never calls Anthropic directly. The worker receives only `{ system, messages }`
and forwards the request using its server-side `ANTHROPIC_API_KEY` secret.
When no worker URL is configured, or when the worker is unavailable,
rate-limited, or returns an invalid payload, the app uses the local tarot
meaning. Direct browser access with `VITE_ANTHROPIC_API_KEY` is not supported.

To activate the optional Claude wording: (1) deploy a Worker at
`lifetrkr-oracle.okhp3.workers.dev`, (2) set `ANTHROPIC_API_KEY` as a Worker
secret, and (3) set `VITE_ORACLE_WORKER_URL` in Replit Secrets. The app remains
fully functional without this optional service.

**GCP setup for VITE_GOOGLE_CLIENT_ID (one-time manual task):**
1. console.cloud.google.com → New Project → "LifeTrkr"
2. APIs & Services → Library → Enable: Google Calendar API, Google Tasks API
3. Credentials → Create OAuth 2.0 Client ID (Web Application)
4. Authorized JavaScript Origins (NOT redirect URIs):
   - `https://okhp3.github.io`
   - `http://localhost:5173`
5. OAuth Consent Screen → Testing mode → Add Kieran's Gmail as test user
6. Copy Client ID to Replit Secrets as `VITE_GOOGLE_CLIENT_ID`
7. Ignore the Client Secret — not used in this architecture

---

## Section 11 — Deployment

```bash
npm run dev       # Vite dev at localhost:5173 (or 0.0.0.0:5000 in Replit)
npm run build     # tsc && vite build → dist/
npm run sync      # type-check + commit + push to main
```

**After every build session:** push to `main` and verify the GitHub Actions deploy plus live URL before closing the session. Confirm version string in SideNav footer matches the intended release.

GitHub Actions `.github/workflows/static.yml` auto-deploys on push to `main`. Do not create or push a `gh-pages` deployment branch.

---

## Section 12 — Open Questions / Decisions Needed

**1. Vyrle vs Virgil — RESOLVED**
Jamie confirmed June 22, 2026: the correct spelling is VYRLE. All doc files updated. Home.tsx, README.md, App.tsx, DESIGN.md, PRD-v1.0.md, PRD-v2.0.md, PRD-v3.0.md corrected. No further action needed.

**2. Horoscope API reliability**
`freehoroscopeapi.com` is a free, unverified third-party API with no SLA. If it becomes unreliable, a replacement should be sourced. Candidate: Aztro API, or a simple hardcoded daily horoscope table seeded by sign + week-of-year. This decision is deferred to v0.3.0 unless the API fails before then.

**3. Oracle on Home vs Calendar**
The oracle card currently renders in both the Home "More" section (via `OracleCard` in `Home.tsx`) and on the Calendar page below the grid. This duplication is intentional per PRD-v3.0 design (oracle is a daily companion, accessible from both the dashboard and the celestial view). No change needed; just confirm both placements feel right in actual use.

**4. VITE_GOOGLE_CLIENT_ID setup**
Requires GCP project, API enablement, and OAuth consent screen setup. This is a one-time manual task that cannot be automated. Jamie or Kieran must do this in the GCP console. The Replit environment variable is then set once and persists across sessions. Until this is done, the Google Calendar/Tasks UI shows a graceful "not connected" state.

**5. Claude model name**
`claude-sonnet-4-5` is in `oracle.ts`. PRD-v3.0 said `claude-sonnet-4-6`. The correct current model should be confirmed via the Anthropic API or the external_apis skill at the time of activation. Use whatever is current.

---

## Section 13 — External API Registry

All external APIs used by the app. Before building any integration, verify CORS behavior by testing from the browser console on the production origin (`okhp3.github.io`).

| API | Base URL | Auth | CORS | Rate Limit | Fallback |
|---|---|---|---|---|---|
| Google Calendar | `https://www.googleapis.com/calendar/v3/` | Bearer token (GIS) | Yes — via browser with token | 1M req/day free tier | Show manual events only |
| Google Tasks | `https://tasks.googleapis.com/tasks/v1/` | Bearer token (GIS) | Yes — via browser with token | 50k req/day free tier | Hide Google Tasks sections |
| Tarot | `https://tarotapi.dev/api/v1/cards/random?n=1` | None | Yes | Not documented | Local 12-card Major Arcana fallback array (day-of-year % length) |
| Horoscope | `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}` | None | Unverified — test before using | Unknown | Skip horoscope section silently |
| Claude (worker) | Configured `VITE_ORACLE_WORKER_URL` | None in browser (Worker holds key) | Configured in Worker | Worker/provider dependent | Use tarot `meaning_up` as message |
| Moon phases | Client-side Julian date math | None | N/A | None | None needed |
| Astro season | Hardcoded date ranges in `celestial.ts` | None | N/A | None | None needed |
| Mercury retrograde | Hardcoded 2026–2028 dates in `celestial.ts` | None | N/A | None | None needed |

**CORS verification command (run in browser console on production origin):**
```javascript
fetch('https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=cancer')
  .then(r => r.json()).then(console.log).catch(console.error)
```
If this returns a CORS error, route horoscope calls through the Cloudflare Worker instead.

---

## Section 14 — Recurrence Helper Spec

The `formatRecurrence()` helper should be added to `src/lib/date.ts` if not already present. It converts a `RecurrenceRule` into a short human-readable badge string for display in list views.

```typescript
// src/lib/date.ts — add if not present
export function formatRecurrence(rule: RecurrenceRule): string | null {
  if (!rule || rule.frequency === 'none') return null;
  if (rule.frequency === 'daily') return 'Daily';
  if (rule.frequency === 'weekdays') return 'Weekdays';
  if (rule.frequency === 'weekends') return 'Weekends';
  if (rule.frequency === 'specific_days' && rule.daysOfWeek?.length) {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return rule.daysOfWeek.map((d: number) => dayNames[d]).join(' · ');
  }
  if (rule.frequency === 'weekly') return `Every ${rule.interval ?? 1}w`;
  if (rule.frequency === 'monthly') return 'Monthly';
  if (rule.frequency === 'custom') return `Every ${rule.interval ?? 1} days`;
  return null;
}
```

Display pattern in list views: `↻ {formatRecurrence(item.recurrence)}` in `text-textMuted text-[11px]`.

**Note:** The actual `RecurrenceRule` type in `src/types.ts` is the source of truth. The field names above (`daysOfWeek`, `interval`, etc.) may differ — check `src/types.ts` and adjust accordingly before implementing.

---

## Section 15 — Build Session Testing Checklists

Comprehensive per-session acceptance tests. Run these manually after each session before marking it complete.

### v0.2.0 (Google Calendar + Tasks)
- [ ] Clicking "Connect Google Account" in Settings opens Google consent popup
- [ ] After auth: profile name and photo appear in Settings header
- [ ] Settings Google Account section shows email, last synced time, Disconnect button
- [ ] Calendar tab: real events from connected Google account appear (not just manual)
- [ ] Calendar tab: Google events show "G" source badge; manual events show pencil icon
- [ ] Today tab: Google Tasks due today appear under "From Google Tasks" heading (if any exist)
- [ ] Archive tab: undated Google Tasks appear when `showGoogleTasks: true`
- [ ] Token expiry banner: appears and reconnect works (test by clearing `sessionStorage.gal_token`)
- [ ] Disconnect in Settings: clears token, app returns to manual-only mode
- [ ] Multi-account: switching Google accounts shows different namespaced data
- [ ] Push to `main` → verify GitHub Actions deploy and live URL, confirm no broken tabs

### v0.3.0 (Close Gaps)
- [ ] App launches in dark mode by default (no saved preference → dark, not auto/light)
- [ ] Habit add/edit form: shows title + description field + RecurrenceEditor + CategoryPicker
- [ ] Ritual item add/edit form: same
- [ ] Recurrence badge shows in habit/ritual list views: `↻ Daily`, `↻ Mon · Wed · Fri`
- [ ] Category filter pills filter the list correctly; "All" shows everything
- [ ] `isActiveToday()`: habit with `frequency: 'weekdays'` does NOT show on Saturday
- [ ] `isActiveToday()`: ritual item with Mon/Wed/Fri does NOT show on Tuesday
- [ ] Calendar grid: moon phase emoji visible on every date cell
- [ ] Calendar tab: Mercury retrograde banner shows when active (test with a past retrograde date)
- [ ] Calendar tab: Mercury Rx banner is hidden when `showMercuryBanner` toggle is off
- [ ] Home: moon phase + astrological season row visible below date line
- [ ] Home: Oracle card appears in "More" section with tarot card name and message
- [ ] Oracle card: tarot card name and oracle message both populated
- [ ] Oracle: tarot card fetched from tarotapi.dev and cached in localStorage for the day
- [ ] Oracle: horoscope appears if birth sign is set in Settings
- [ ] Oracle: worker URL configured → Claude message generated; page reload uses cached message, not a new API call
- [ ] Settings: About section shows correct `APP_VERSION` (not hardcoded `v0.1.0`)
- [ ] Settings: "Regenerate today's oracle" button clears cache and triggers re-fetch
- [ ] SideNav footer: version string matches intended release
- [ ] Push to `main` → verify GitHub Actions deploy and live URL

### v0.4.0 (PWA + Polish)
- [ ] `public/manifest.json`: `start_url`, `display: "standalone"`, `background_color: "#0D0B14"`, `theme_color: "#C4A0E8"` all correct
- [ ] "Add to Home Screen" prompt works on iOS Safari and Android Chrome
- [ ] App icon (`app-icon.png`) used in PWA manifest icons array
- [ ] `cat-accent` image appears tastefully in the UI (one placement, subtle)
- [ ] `public/og-image.png` uses the banner asset
- [ ] Drag-to-reorder: tasks in Today and Archive tabs can be reordered; order persists on reload
- [ ] No unnecessary oracle re-fetches: navigate away from Home and back — oracle does not re-call API
- [ ] `celestial.ts` calculations: typing in a form field does not trigger celestial recalculation
- [ ] Push to `main` → verify GitHub Actions deploy and live URL

### v0.5.0 (OAuth Verification)
- [ ] Privacy policy page exists at a stable URL
- [ ] GCP OAuth consent screen: App name = "Kieran's LifeTrkr", logo = app-icon.png, privacy policy URL filled in
- [ ] Scopes declared: `calendar.readonly`, `tasks.readonly`, `openid`, `profile`, `email`
- [ ] Verification submitted to Google
- [ ] After approval: move GCP app from Testing to Production mode

---

## Section 16 — Build Session Checklist (for Replit agent)

Before starting a build session, the agent should:
1. Read `docs/PRD-v4.0.md` (this file) in full
2. Read `docs/PRD-v3.0.md` for architecture and type definitions
3. Check `src/types.ts` directly — it is the ground truth for schema
4. Run `npm run dev` and verify the dev server starts clean
5. After all changes: `npm run build` to confirm TypeScript compiles
6. After build: push to `main` to publish through GitHub Actions
7. Screenshot https://okhp3.github.io/kierans-lifetrkr/#/ to confirm deploy

---

## Section 17 — Version History

**Family lineage:**

| App Version | Date | Author | Notes |
|---|---|---|---|
| v0.0 | — | Ralph | Grandfather — generation 0 |
| v1.0 | — | Vyrle | Father — generation 1 |
| v2.0 | — | Jamie | Son — generation 2; original app concept |
| v3.0 | June 21, 2026 | Kieran (session 1) | TypeScript migration, HashRouter, GIS auth, GitHub Pages |

**Build session history:**

| App Version | Date | Session | Key Deliverables |
|---|---|---|---|
| v0.1.0 | June 21, 2026 | Session 1 | UI shell, basic forms, localStorage, deployed to GitHub Pages |
| v0.1.x patch | June 22, 2026 | Pre-session | Source pushed to GitHub main; README corrected; PRD-v3.0 committed |
| v0.1.8 | June 22, 2026 | Session 2 | Recurrence, categories, celestial engine, three-layer oracle, Calendar overhaul — pulled v0.3.0 work forward |
| v0.2.0 | TBD | Session 3 | Google Calendar + Tasks live; token expiry; Settings wired |
| v0.3.0 | TBD | Session 4 | Close remaining gaps: dark default, first-launch, About, Regenerate oracle, Claude oracle activation |
| v0.4.0 | TBD | Session 5 | Brand assets, PWA manifest, offline, drag-to-reorder, polish |
| v0.5.0 | TBD | Session 6 | Privacy policy, GCP OAuth verification submission |
| v1.0.0 | TBD | TBD | Google-verified, Kieran-owned, public stable release |

**PRD document history:**

| PRD | Date | Author | Notes |
|---|---|---|---|
| PRD-v3.0 | June 22, 2026 | Jamie + Kieran | Full product vision (1624 lines) — canonical architecture and type reference |
| PRD-v4.0 (plan) | June 22, 2026 | Jamie (pre-session) | Pre-session plan for Sessions A/B/C — original CF Worker oracle approach |
| PRD-v4.0 (this) | June 22, 2026 | Agent (session 2) | Post-session truth — planning authority for v0.2.0+; incorporates both sources |

Built on Father's Day, Summer Solstice 2026. The fourth hill. ✦
