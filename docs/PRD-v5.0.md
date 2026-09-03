# Kieran's LifeTrkr — Product Requirements Document v5.0

**Document authority:** Addendum to PRD-v4.0. PRD-v3.0 remains the canonical architecture and
type reference. This document supersedes PRD-v4.0 for planning and prioritization of all sessions
from August 26, 2026 onward. It is written to be handed to a Replit build agent directly, one
Build Session at a time.

**Date:** August 26, 2026
**Live app:** https://okhp3.github.io/kierans-lifetrkr/#/
**Repository:** https://github.com/OKHP3/kierans-lifetrkr
**Status:** Historical build-session plan — current status is governed by the release matrix

> **How to use this document (Replit agent):** Work one Build Session at a time, in order, unless
> a session is explicitly marked optional or independent. Each session lists a **Do**, an
> **Acceptance criteria** checklist, and **Evidence to capture**. Do not mark a session complete
> until every acceptance-criteria box can be checked from something you actually ran or verified —
> not because the code compiles. This project's own culture is evidence-first: see
> `docs/RELEASE-TRUTH-BASELINE.md` and `docs/RELEASE-REVIEW-RECORD.md` before starting, and update
> them at the end of whichever session changes what they claim.

---

> **Current-status notice (September 3, 2026):** This document is a dated
> execution plan, not the current release record. The current source baseline is
> `v0.1.10` at `393c2aa74766d0572943306e372f5e35ec6cf950`, with
> `approve-with-limits` pre-production posture. Its session checklists preserve
> intent and owner prerequisites, but the current delivered-state crosswalk is
> `docs/VISION-DELIVERY-MATRIX.md`. No stable or `v1.0.0` claim follows from
> completing a local build alone.
>
> **Product-scope decision (September 3, 2026):** The next-release minimum is
> persisted task ordering with keyboard controls, multi-target habits,
> lightweight ritual-item metadata/optional state, and ritual ordering. Item-level
> recurrence overrides and end-of-day review are intentionally deferred. The
> decision record is `docs/PRODUCT-SCOPE-DECISION.md`; this historical session
> plan must not imply those deferred items are silently required for v1.0.

---

## Section 0 — Historical ground truth snapshot as of August 26, 2026

This section was the starting audit for the plan. It is retained for provenance.
Do not use its “still open” list as the current status; compare it with the
current matrix before acting on any item.

**Confirmed resolved (do not re-open without new evidence):**

- Oracle key is never exposed client-side. No `VITE_ANTHROPIC_API_KEY` reference exists anywhere
  in `src/`. The oracle worker boundary (`VITE_ORACLE_WORKER_URL`) is the only path.
- Google scopes are read-only. `SCOPES` in `src/constants.ts` is `calendar.readonly` +
  `tasks.readonly` only. `src/lib/googleCalendar.ts` exposes only `fetchCalendarEvents` and
  `fetchGoogleProfile` — no write, create, or delete function exists.
- `APP_VERSION` in `src/constants.ts` correctly reads `'v0.1.10'`, matching `package.json`.
- App icon, banner, and `og-image.png` are correctly wired into `index.html` and
  `public/manifest.json`.

**Confirmed still open (this document's job is to close these):**

1. Theme defaults to `'system'`, not `'dark'` (`src/context/ThemeContext.tsx`).
2. No first-launch welcome screen exists (`src/App.tsx` has no first-launch branch).
3. Google Calendar/Tasks are fully wired in code but never activated: `VITE_GOOGLE_CLIENT_ID` has
   never been set, and no real-account lifecycle test has run.
4. The oracle Claude worker has never been deployed; every oracle message shown to date is the
   static tarot `meaning_up` fallback, not AI-generated text.
5. No "Regenerate today's oracle" button exists in `src/pages/Settings.tsx`.
6. `isActiveToday()` weekday/specific-day recurrence filtering has never been manually verified
   and recorded.
7. No PWA service worker exists — correctly disclaimed in README and
   `docs/DEPLOYMENT-CHECKLIST.md`, not falsely claimed, but still undelivered.
8. `cat-accent.png`/`.webp` exist in `src/assets/images/` with zero references in any component.
9. No drag-to-reorder exists for Today/Someday tasks.
10. No privacy policy page exists in `src/pages/`.
11. Zero of the ~20 items in `docs/HANDOFF.md`'s ownership-transfer checklist are done.
12. Four release-evidence gates are "Not run" per `docs/RELEASE-TRUTH-BASELINE.md` §9: published
    Pages smoke test, real Google OAuth lifecycle, manual accessibility matrix, forced
    storage-failure recovery test.
13. `docs/ARCHITECTURE.md` is still titled "PRD Amendment 01" and describes the superseded
    Express + Notion + Vercel backend, with no superseded-document banner, while README's own
    docs table cites it as the current client-only architecture reference.

Full detail and file-level evidence for every item above lives in
`docs/VISION-PURPOSE-GAP-ANALYSIS.md`.

---

## Section 1 — Versioning alignment (historical plan, reconciled)

| Version | Scope | Status | This document's session |
|---|---|---|---|
| v0.1.10 | Current source baseline | **Current, pre-production; approve-with-limits** | Source/documentation work from Session A is present; no version bump is claimed |
| v0.1.11 | Doc-hygiene + cheap UI fixes | Historical session target; not released as a version | Build Session A |
| v0.2.0 | Google Calendar + Tasks live | Owner-gated; real-account evidence pending | Build Session C |
| v0.3.0 | Oracle activation + recurrence verification | Partial; local fallback and targeted checks pass, live worker/date evidence pending | Build Sessions B, D |
| v0.4.0 | PWA + brand polish + drag-reorder | Source/transport work present; device and future polish remain pending | Build Session F |
| v0.5.0 | Privacy policy + OAuth production verification | Privacy route is present; external verification remains an owner/product decision | Build Session G |
| — | Release-evidence gates | Blocks any "stable" claim | Build Session E |
| — | Kieran ownership handoff | Final step, after evidence gates close | Build Session H |
| v1.0.0 | Production, Google-verified, Kieran-owned | Reserved | — |

Recommended execution order: **A → B → E (partial, non-blocked gates) → C → D → E (remaining
gates) → F → G → H**. Session F is independent and can be interleaved anywhere after A if the
agent has spare capacity. Do not attempt C, D, G, or H without the explicit manual prerequisite
each session names — those steps require a GCP console, a Cloudflare account, or Jamie/Kieran's
authorization, and cannot be completed by an agent alone.

---

## Section 2 — Build Session A: Cheap, self-contained fixes (v0.1.11)

No external dependency. No manual setup. Every item in this session is a same-repo code or docs
change with a locally verifiable acceptance test. Do all of them in one session.

### A.1 — Dark mode as the default theme

**Do:** In `src/context/ThemeContext.tsx`, change `loadThemePref()` so that when
`localStorage.getItem('lifetrkr_theme')` returns `null` (no saved preference), the function
returns `'dark'` instead of `'system'`. A user who has already saved a preference (light, dark, or
system) must be unaffected — only the *no-preference* default changes.

**Acceptance criteria:**
- [ ] Clearing `localStorage` and loading the app on a light-OS device renders dark mode.
- [ ] A user who has explicitly picked "System" or "Light" in Settings still gets that choice on
      reload — the change only affects users with no saved preference at all.
- [ ] `npm run check` and `npm run build` pass.

**Evidence to capture:** before/after screenshot or console log of `document.documentElement`'s
`data-theme` attribute on a clean profile, light-OS simulated environment.

### A.2 — First-launch welcome screen

**Do:** Per PRD-v3.0 §16.1 and PRD-v4.0 §5.3. If `localStorage.getItem('lifetrkr:profile')` is
null AND no local ritual/habit/task data exists for any namespace, render a full-screen centered
welcome flow instead of the normal app shell, wrapping `<App>` in `main.tsx` or as a conditional in
`App.tsx`:
- App name in Cormorant Garamond 300, 36px
- Tagline: "Your day. Your rituals. Your rules."
- ✦ glyph in amethyst
- "Connect Google Account" — primary CTA (amethyst background, dark text) — triggers the existing
  Google connect flow
- "Use without Google" — secondary link, smaller, `textSecondary` color — dismisses the welcome
  screen and enters the app in local-only mode

Once the user picks either option, persist a flag (e.g. `lifetrkr:welcomed`) so the screen does
not reappear on subsequent visits, independent of whether they ever add data.

**Acceptance criteria:**
- [ ] A completely clean profile (no localStorage keys at all) shows the welcome screen, not the
      normal app shell.
- [ ] Clicking "Use without Google" enters the app and the welcome screen never reappears on
      reload, even with zero data added.
- [ ] Clicking "Connect Google Account" triggers the existing GIS flow and, on success or
      cancellation, does not show the welcome screen again.
- [ ] An existing user with data (most real usage) is completely unaffected — this only fires for
      a genuinely empty profile.

**Evidence to capture:** manual walkthrough recording (screenshots are sufficient) of a cleared
profile through both CTA paths.

### A.3 — Settings: "Regenerate today's oracle" button

**Do:** Per PRD-v4.0 §5.5. Add a "Regenerate today's oracle" button to the Oracle & Celestial
section of `src/pages/Settings.tsx`. On tap:
1. Remove `lifetrkr:{sub}:oracle:{today}` and `lifetrkr:{sub}:tarot:{today}` (if that key exists)
   from `localStorage`.
2. Dispatch `SET_ORACLE` with `null`.
3. Confirm `useOracle.ts`'s existing fetch-trigger logic (`shouldFetch`) re-fires because
   `oracle.date !== today` is now true (oracle is null).

**Acceptance criteria:**
- [ ] Tapping the button visibly clears the current oracle card and shows the loading state.
- [ ] A new tarot card (and, if configured, a new worker-generated message) appears without a page
      reload.
- [ ] Reloading the page after regenerating does not re-fetch again — the newly cached value
      persists for the rest of the day, matching the existing daily-cache contract.

**Evidence to capture:** before/after oracle card content, and confirmation that a second reload
does not trigger a second fetch (check network tab or add a temporary console log).

### A.4 — Place the cat-accent asset in the UI

**Do:** Per PRD-v4.0 §6.2. `src/assets/images/cat-accent.png`/`.webp` exist but are referenced
nowhere. Place it once, tastefully, in a single location — the Settings "About" card is the
lowest-risk placement (small, decorative, does not compete with functional UI). Use the `.webp`
with a `.png` fallback if the project already has a pattern for that (check other asset usage in
`src/pages/` and `src/components/` for the convention); otherwise a plain `<img>` with `loading="lazy"`
is sufficient.

**Acceptance criteria:**
- [ ] The asset renders in exactly one place in the built app.
- [ ] It does not shift or crowd adjacent text/controls at mobile widths (≤767px).
- [ ] `npm run check:a11y` still passes (the image needs `alt=""` if purely decorative, or a real
      `alt` if it conveys meaning).

**Evidence to capture:** screenshot at mobile and desktop widths.

### A.5 — Fix `docs/ARCHITECTURE.md`

**Do:** This file is currently titled "PRD Amendment 01" and describes the superseded
Express + Notion + Vercel/Replit-server backend, with **no superseded-document banner** — unlike
`PRD-v1.0.md` through `PRD-v4.0.md` and `ROADMAP.md`, which all carry one. README's own docs table
cites `docs/ARCHITECTURE.md` as "Client-only architecture decisions and rationale," which is
currently false. Pick one of two fixes (do not do both):

- **Option 1 (minimal):** Add the same style of baseline-notice banner used at the top of
  `PRD-v4.0.md` and `ROADMAP.md`, stating plainly that this file describes a superseded
  architecture and pointing to the actual current client-only design in `README.md`'s Architecture
  section and `PRD-v3.0.md`.
- **Option 2 (recommended):** Replace the file's content with a short, current description of the
  actual client-only architecture (React SPA, GitHub Pages, GIS token model, browser-local
  storage, optional oracle worker), matching what `README.md` already states, so the docs table
  entry becomes accurate without a reader needing to know the file used to mean something else.

**Acceptance criteria:**
- [ ] A first-time reader following README's docs table to `docs/ARCHITECTURE.md` does not come
      away believing the app has an Express backend or a Notion-backed database.
- [ ] If Option 1 is chosen, the banner matches the tone and placement of the existing banners in
      `PRD-v4.0.md`/`ROADMAP.md` exactly (do not invent a new format).

**Evidence to capture:** the diff itself is sufficient evidence for a docs-only change.

---

## Section 3 — Build Session B: Verification (no code changes, evidence only)

These items already have implementations. This session is about running them and recording the
result — not writing new code, unless verification uncovers an actual bug, in which case fix the
bug and re-verify.

### B.1 — `isActiveToday()` recurrence filtering

**Do:** Per PRD-v4.0 §5.7. Manually verify, using the running app (not by reading the source):
- A habit with `frequency: 'weekdays'` does **not** appear on a Saturday or Sunday.
- A ritual item with `frequency: 'specific_days': [1,3,5]` (Mon/Wed/Fri) does **not** appear on a
  Tuesday.
- The inverse also holds: both items **do** appear on their correct active days.

You will need to either manipulate the system clock/timezone in a test environment or temporarily
seed test data with known day-of-week rules and check across at least 3 different days.

**Acceptance criteria:**
- [ ] All four checks above pass and are recorded (date tested, expected vs. actual visibility).
- [ ] If any check fails, the bug is fixed in `src/lib/date.ts` (or wherever `isActiveToday()`
      lives) and all four checks are re-run and re-recorded.

### B.2 — Mercury retrograde banner

**Do:** Verify the Mercury Rx banner renders at the top of the Calendar tab when
`getMercuryStatus()` in `src/lib/celestial.ts` reports an active retrograde window (test against a
known past or upcoming retrograde date from the hardcoded 2026–2028 calendar), and that the
`showMercuryBanner` Settings toggle correctly hides it when off.

**Acceptance criteria:**
- [ ] Banner appears during a known retrograde window.
- [ ] Banner does not appear outside a retrograde window.
- [ ] Toggling `showMercuryBanner` off hides the banner even during an active window.

### B.3 — Horoscope section rendering

**Do:** Verify the horoscope section on the Oracle card renders when `settings.birthSign` is set,
and is silently absent (not an error state) when it is not set or when `freehoroscopeapi.com`
fails.

**Acceptance criteria:**
- [ ] Setting a birth sign in Settings causes a horoscope line to appear on the next oracle fetch.
- [ ] Clearing the birth sign removes it on the next fetch without any visible error.
- [ ] Simulating a failed fetch (e.g., block the request in devtools) does not break the rest of
      the oracle card.

---

## Section 4 — Build Session C: Google Calendar + Tasks activation (v0.2.0)

**Manual prerequisite — cannot be done by an agent:** Jamie or Kieran must complete the GCP setup
described in PRD-v4.0 §10 and HANDOFF.md: create/confirm the GCP project, enable the Calendar and
Tasks APIs, create an OAuth 2.0 Web Application Client ID, set authorized JavaScript origins
(`https://okhp3.github.io` and `http://localhost:5173`), add the test Google account, and set
`VITE_GOOGLE_CLIENT_ID` in Replit Secrets. **Stop and request this before starting Section 4** if
it has not already happened — do not attempt to fabricate or guess a Client ID.

**Do (once the Client ID is set):** Run every item in PRD-v4.0 §15's "v0.2.0" testing checklist
against a real (ideally disposable/test) Google account:
- Connect flow opens the consent popup and completes.
- Profile name/photo appear in Settings.
- Calendar tab shows real events with a "G" source badge; manual events keep the pencil icon.
- Today tab shows Google Tasks due today under "From Google Tasks."
- Someday/Archive tab shows undated Google Tasks when `showGoogleTasks` is on.
- Token-expiry banner appears and reconnecting works (test by clearing `sessionStorage.gal_token`).
- Disconnect clears the token and returns the app to manual-only mode without losing local data.
- **Two-account isolation**: connect a second Google account and confirm it does not see the first
  account's namespace, profile, or data. This is the single highest-priority check in this
  session — it is the exact objection the July 2026 context audit raised about the client-only
  architecture, and it has never been tested against a real account.

**Acceptance criteria:**
- [ ] Every bullet above is checked and recorded with the account/date/environment used.
- [ ] The two-account isolation test specifically has a before/after storage inventory
      (`localStorage` keys per namespace) attached as evidence, not just a visual check.
- [ ] `docs/RELEASE-TRUTH-BASELINE.md` §4 and §9 are updated to move "Google Calendar and Tasks are
      usable" and the real-account-lifecycle rows from Provisional/Not run to their tested status.

---

## Section 5 — Build Session D: Oracle worker activation (v0.1.9/v0.3.0)

**Manual prerequisite — cannot be done by an agent:** Deploy the Cloudflare Worker described in
PRD-v4.0 §3/§10 at `lifetrkr-oracle.okhp3.workers.dev` (or an equivalent endpoint), with
`ANTHROPIC_API_KEY` stored only as a Worker secret — never as a `VITE_` variable, never in this
repository. This requires a Cloudflare account and is Jamie's step to take, potentially using the
`okhp3-cloudflare-worker-api-proxy` pattern already documented for this exact use case.

**Do (once the worker is deployed):** Set `VITE_ORACLE_WORKER_URL` in Replit Secrets. Confirm:
- The oracle card shows a genuine Claude-generated 2-3 sentence message (not the static
  `card.meaning_up` fallback text) that references the day's moon phase, astrological season, and
  tarot card.
- A page reload within the same day reuses the cached message (`lifetrkr:{sub}:oracle:{date}`) and
  does **not** trigger a second worker call.
- Inspect the production JS bundle (`dist/assets/*.js` after `npm run build`) and confirm no
  Anthropic API key or credential string appears anywhere in it. This is a hard gate — do not ship
  if this check fails.
- If the worker is unreachable, rate-limited, or returns an invalid payload, confirm the app falls
  back gracefully to the tarot `meaning_up` text with no visible error to the user.

**Acceptance criteria:**
- [ ] All four checks above pass and are recorded.
- [ ] `docs/RELEASE-TRUTH-BASELINE.md` §4 is updated to reflect the worker as deployed and the
      oracle message as Confirmed rather than the current fallback-only state.

---

## Section 6 — Build Session E: Release-evidence gates

These four items are listed as "Not run" in `docs/RELEASE-TRUTH-BASELINE.md` §9. They are the
actual bar between "approve-with-limits, pre-production" and any public stable claim. Some can run
independent of Sessions C/D; run those first.

### E.1 — Published Pages smoke test (independent — run any time)

**Do:** Against the live `https://okhp3.github.io/kierans-lifetrkr/` URL (not local dev), verify:
- Every route loads without a server 404: `/#/`, `/#/today`, `/#/rituals`, `/#/habits`,
  `/#/calendar`, `/#/someday`, `/#/settings`, `/#/origin`.
- `manifest.json`, `favicon.svg`, `icons/icon-192.png`, `icons/icon-512.png`, and `og-image.png`
  all return successfully at their published paths.
- The manifest offers install / the standalone layout opens on at least one mobile browser.
- Reloading a hash route preserves the route (does not bounce to `/`).

Run `bash scripts/verify-deployment.sh` first if it automates any of this, then do the manual
checks it does not cover.

**Acceptance criteria:** all four bullets checked and recorded with URL, browser, and date.

### E.2 — Manual accessibility matrix (independent — run any time)

**Do:** Complete `docs/ACCESSIBILITY-CHECKLIST.md`'s manual matrix on both a narrow phone viewport
and a desktop viewport: keyboard reachability, screen reader announcements, 200% zoom, contrast,
touch target size, reduced-motion behavior — across Navigation, Forms, Calendar, Dialogs,
Feedback, and Motion/touch.

**Acceptance criteria:** the full matrix in `docs/ACCESSIBILITY-CHECKLIST.md` is filled in with
actual pass/fail per cell, not left as the template.

### E.3 — Storage-failure recovery test (independent — run any time)

**Do:** Force a storage-quota-exceeded or private-browsing-mode condition and observe: does the
app show a visible, honest failure state (not silent data loss), and can the user recover without
losing prior data? This is Jamie's item per the risk register in `docs/HANDOFF.md`.

**Acceptance criteria:** documented behavior for both forced-quota and private-mode conditions,
with a recorded verdict on whether recovery guidance is visible to the user.

### E.4 — Real Google OAuth lifecycle (depends on Session C)

This is Session C's own acceptance criteria — do not duplicate the work, just confirm Session C's
evidence satisfies this gate and cross-reference it here when updating
`docs/RELEASE-TRUTH-BASELINE.md`.

---

## Section 7 — Build Session F: PWA + polish (v0.4.0, independent)

Lower priority than Sessions A–E, but still in-scope per ROADMAP.md. Can run in parallel with C/D
if the agent has capacity, since it touches different files.

### F.1 — PWA manifest + service worker

**Do:** Verify `public/manifest.json` has correct `start_url`, `display: "standalone"`,
`background_color: "#0D0B14"`, `theme_color: "#C4A0E8"`. Add a service worker (Vite PWA plugin or
a small hand-written one) for offline shell caching — HTML shell, CSS, JS bundle, and icons at
minimum. Once a service worker ships, update README and `docs/DEPLOYMENT-CHECKLIST.md`'s current
"offline is not claimed" language to describe what is actually cached and what still requires
network (Google Calendar/Tasks and the oracle worker will always need network).

**Acceptance criteria:**
- [ ] "Add to Home Screen" works on at least one iOS and one Android browser.
- [ ] Loading the app shell with the network disabled (after at least one prior successful load)
      still renders the UI shell, even if calendar/oracle data is stale or absent.
- [ ] README and the deployment checklist are updated to match the new, narrower offline claim —
      do not overclaim "offline support" broadly; describe exactly what works offline.

### F.2 — Drag-to-reorder tasks (historical plan, narrowed and implemented)

**Historical intent:** Add drag-and-drop reordering for tasks within Today and
Someday. The current decision narrows the required behavior to persisted local
ordering with labelled keyboard move controls; native HTML5 drag is only a
pointer convenience and no external library is used.

**Acceptance criteria:**
- [x] Reordering has a keyboard-accessible move-up/move-down equivalent.
- [x] Order is persisted within the local status bucket and remains local-only.
- [ ] Owner browser journey still verifies reload, status moves, and manual accessibility.

### F.3 — Performance audit

**Do:** Confirm `useOracle.ts` fetches once per day, not on every Home mount; confirm
`celestial.ts` calculations do not re-run on every keystroke in a form; confirm Calendar recurrence
expansion does not recalculate on every scroll event.

**Acceptance criteria:** each of the three checks above is verified with either a render-count log
or the React DevTools profiler, not just "looks fine."

### F.4 — Deferred scope decision (September 3, 2026)

The current next-release decision is authoritative for the remaining deferred
capabilities. Multi-target habits, lightweight ritual-item metadata/optional
state, and ritual ordering are approved minimum behavior and are implemented in
the current source. Item-level recurrence overrides and end-of-day review are
intentionally deferred and have no current v1.0 acceptance claim. See
`docs/PRODUCT-SCOPE-DECISION.md` and `docs/VISION-DELIVERY-MATRIX.md`.

---

## Section 8 — Build Session G: OAuth verification + privacy policy (v0.5.0)

**Depends on:** Session C (Google integration must be live and tested first).

**Manual prerequisite:** moving the GCP OAuth consent screen from Testing to Production and
submitting for Google verification is Jamie's action; sensitive-scope review typically takes
4–6 weeks. This session's agent-doable work is everything that precedes submission.

**Do:**
- Build a privacy policy page (`src/pages/Privacy.tsx` or similar) at a stable route, stating
  plainly: no data is collected by the publisher (everything is local), what Google data is
  accessed (`calendar.readonly`, `tasks.readonly`) and why, and a contact path.
- Add the route to `App.tsx` and link it from Settings.
- Prepare the OAuth consent screen content Jamie will need to paste in: app name "Kieran's
  LifeTrkr", app logo (`app-icon.png`), privacy policy URL, support email, and the exact scope list
  (`calendar.readonly`, `tasks.readonly`, `openid`, `profile`, `email`).

**Acceptance criteria:**
- [ ] Privacy policy page is live at a stable URL and linked from Settings.
- [ ] The consent-screen content is handed to Jamie as a ready-to-paste checklist, not left as an
      open question.

---

## Section 9 — Build Session H: Kieran ownership handoff

**Depends on:** Sessions C, D, and E all closed. Do not start this session while any release-
evidence gate is still open — handing off an unverified candidate defeats the point of the gates.

**Do:** Work through `docs/HANDOFF.md`'s checklist in order: source-control sync confirmation,
GitHub repo transfer, Replit **fork** (never Transfer — it is irreversible), secrets re-entry, GCP
IAM and OAuth Client ID handoff, and the final verification pass (all 7 tabs, Google Calendar sync,
Google Tasks, timezone display, empty states, token expiry/disconnect/reconnect, second-account
isolation, oracle generation, README ownership section).

**Acceptance criteria:** every checkbox in `docs/HANDOFF.md` is checked with a date and who
performed it, and the README Ownership section is updated to reflect Kieran as the current
maintainer.

---

## Section 10 — Environment variables reference

| Variable | Purpose | Required for | Session |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google Calendar + Tasks OAuth | Session C | C |
| `VITE_ORACLE_WORKER_URL` | Claude oracle message via Cloudflare Worker proxy | Session D | D |

Both remain optional with graceful fallback. `VITE_ANTHROPIC_API_KEY` is never supported — do not
introduce it in any session, including Session D. See `docs/RELEASE-TRUTH-BASELINE.md` §4 for the
full external-service boundary table.

---

## Section 11 — Testing discipline for every session

Before marking any session complete:
1. `npm run check` (TypeScript) passes.
2. `npm run check:a11y` passes.
3. `npm run build` completes cleanly.
4. Every acceptance-criteria box in the session is checked against something actually run, not
   inferred from reading the code.
5. If the session's work changes a claim in `docs/RELEASE-TRUTH-BASELINE.md` or
   `docs/RELEASE-REVIEW-RECORD.md`, update that claim in the same session — do not let evidence and
   documentation drift apart again.

---

## Section 12 — Version history

| Document | Date | Author | Notes |
|---|---|---|---|
| PRD-v3.0 | June 22, 2026 | Jamie + Kieran | Full product vision — canonical architecture/type reference |
| PRD-v4.0 | June 22, 2026 | Agent (session 2) | Post-session truth; planning authority for v0.2.0+ |
| PRD-v5.0 (this) | August 26, 2026 | Agent, from `docs/VISION-PURPOSE-GAP-ANALYSIS.md` | Closes every remaining gap between vision and delivered state; structured as Replit build sessions A–H |

Built on Father's Day, Summer Solstice 2026. The fourth hill. ✦
