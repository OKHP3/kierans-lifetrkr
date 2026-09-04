# LifeTrkr Release Truth Baseline

**Baseline date:** September 3, 2026 — reconciliation refresh
**Artifact:** `kieran-lifetrkr`  
**Application version:** `0.1.10` (`package.json`, `src/constants.ts`)  
**Latest published evidence candidate:** `de5fa3a369174d9975ffa0f9af7b47b03b8e2e21`
**Current source reference:** `393c2aa74766d0572943306e372f5e35ec6cf950`
**Release posture:** Candidate approved-with-limits for controlled pre-production handoff; public stable release deferred for remaining owner-run live and manual evidence

This document is the current evidence baseline for LifeTrkr. Historical PRDs and session
notes remain useful for intent, but they do not override the source, package manifest,
lockfile, or active workflows recorded here.

## 1. Artifact identity and runtime

| Area | Current truth | Evidence |
|---|---|---|
| Repository | `OKHP3/kierans-lifetrkr` | Git remote and project docs |
| Branch model | Local `main` tracks `origin/main`; GitHub Actions runs on pushes to `main` | Git config, `.github/workflows/*.yml` |
| Application version | `0.1.10` / `v0.1.10` | `package.json`, `src/constants.ts` |
| Frontend | React 19.2.8, React DOM 19.2.8 | `package.json`, lockfile |
| Routing | React Router 7.18.2 with `HashRouter` | `package.json`, `src/App.tsx` |
| Build | Vite 8.2.1, TypeScript 7.0.2, type-check → Vite build → service-worker asset preparation | `package.json`, `vite.config.ts`, `scripts/prepare-service-worker.mjs` |
| Styling | Tailwind CSS 4.3.x through `@tailwindcss/postcss` | `package.json`, lockfile |
| Hosting | GitHub Pages at `/kierans-lifetrkr/`; static deployment through GitHub Actions | `vite.config.ts`, `static.yml` |
| Backend/database | None in the shipped source; local browser storage is the persistence layer | `src/context/AppContext.tsx`, `src/lib/storage.ts` |

The configured Replit workflow is `fuser -k 5000/tcp 2>/dev/null; npm run dev`.
The development server listens on `0.0.0.0:5000`; production builds use the
`/kierans-lifetrkr/` base path.

## 2. Routes and product surfaces

The current `HashRouter` routes are:

| Route | Surface | Evidence |
|---|---|---|
| `#/` | Home | `src/App.tsx` |
| `#/calendar` | Calendar | `src/App.tsx` |
| `#/today` | Today | `src/App.tsx` |
| `#/someday` | Someday / deferred backlog | `src/App.tsx`, `src/pages/Someday.tsx` |
| `#/rituals` | Rituals | `src/App.tsx` |
| `#/habits` | Habits | `src/App.tsx` |
| `#/settings` | Settings | `src/App.tsx` |
| `#/origin` | Origin story and project context | `src/App.tsx` |
| `#/privacy` | Published privacy notice and service boundaries | `src/App.tsx`, `src/pages/Privacy.tsx` |

`Archive` is historical terminology only. It is not a current route or product
surface. The internal task status remains `backlog`.

## 3. Data and persistence inventory

All persistent application data uses `localStorage`. The active user namespace is
derived from `lifetrkr:profile.sub`, or `guest` when no valid profile is available.

| Key pattern | Current value |
|---|---|
| `lifetrkr:profile` | `GoogleProfile` or null; not namespaced |
| `lifetrkr:{sub}:settings` | `UserSettings` |
| `lifetrkr:{sub}:routineTemplates` | `RoutineTemplate[]` |
| `lifetrkr:{sub}:routineCompletions` | `RoutineCompletion[]` |
| `lifetrkr:{sub}:habits` | `Habit[]` |
| `lifetrkr:{sub}:habitCompletions` | `HabitCompletion[]` |
| `lifetrkr:{sub}:tasks` | `Task[]` with `backlog`, `today`, or `done` status |
| `lifetrkr:{sub}:calendarEvents` | Local calendar events, including manual events |
| `lifetrkr:{sub}:oracle:{YYYY-MM-DD}` | Cached oracle message string |

Google Calendar events, Google Tasks, task lists, and the assembled oracle reading
are held in application state unless explicitly cached by the oracle implementation.
Storage reads tolerate malformed JSON by returning null/empty values. The app now
checks write read-back, surfaces a visible warning when persistence is unavailable,
and offers a retry for the current in-memory snapshot. Real browser quota/private
mode behavior remains an owner-run check.

The source of truth for types is `src/types.ts`. In particular, the implementation
uses `RecurrenceRule` and optional compatibility fields; older PRD type listings must
not be used to infer current payloads.

The next-release scope decision adds optional `Task.sortOrder`,
`Habit.timesPerDay`, `RoutineItem.description`, `RoutineItem.recurrence`, and
indexed `HabitCompletion.completionIndex` values. Missing values remain valid
legacy data and are defaulted on load or during completion evaluation; no
persistence key or namespace changes. An item recurrence override is evaluated
with the existing parent template schedule, and date-only completion history is
not rewritten when the rule changes. The limited evening wrap-up is an in-memory
projection and adds no persistence key or completion state; broader review
analytics remain deferred. See
[`docs/PRODUCT-SCOPE-DECISION.md`](PRODUCT-SCOPE-DECISION.md).

## 4. External and browser-facing services

| Service | Use | Current boundary | Evidence status |
|---|---|---|---|
| Google Identity Services | Browser OAuth token flow | `sessionStorage` token and expiry | Client configured; real-account lifecycle unproven |
| Google Calendar API v3 | Calendar reads | Direct browser fetch with bearer token | Local pagination/empty/error checks pass; real-account lifecycle unproven |
| Google Tasks API v1 | Task-list and task reads | Direct browser fetch with bearer token | Local pagination/empty/error checks pass; real-account lifecycle unproven |
| Google userinfo v3 | Connected profile | Direct browser fetch with bearer token | Local profile-path check passes; real-account profile unproven |
| Tarot API | Daily card | Direct browser fetch with deterministic local fallback | Supported in code; service/CORS not continuously proven |
| Free Horoscope API | Optional sign-based horoscope | Direct browser fetch; null on failure | Provisional; no service guarantee |
| Anthropic Messages API | Optional daily oracle wording | Server-side oracle worker only; no provider key in client bundle | Local fallback and simulated worker boundary pass; owner worker deployment, secret-store review, and live CORS/provider behavior remain unverified |
| Google Fonts / Analytics | Fonts and page tracking | Third-party browser scripts | Present; disclosed in the published privacy notice; provider policies and blocking behavior remain external considerations |

The Google integration now requests read-only scopes and does not expose write
helpers. Real-account lifecycle testing remains a handoff verification item.

## 5. Claim and evidence ledger

| Claim | Classification | Current evidence | Decisive test or condition |
|---|---|---|---|
| The app is client-only and has no publisher database | Supported | No server entrypoint or database; browser storage in source | Clean checkout confirms no backend runtime is required |
| Local data is namespaced by Google subject | Supported in code | `storage.ts`, profile namespace logic, and storage failure harness | Account-switch journey proves isolation and guest recovery |
| Manual core workflows persist across reload | Provisional | Reducer and persistence effects exist | Browser journey covering create/edit/complete/delete/reload |
| Ritual item recurrence overrides preserve inherited schedules and date exceptions | Supported in code | Optional `RoutineItem.recurrence`, shared calendar-date evaluator, reducer guard, and regression harness | Browser journey covers create/edit/complete/reload and the configured-timezone/account paths |
| Someday is the current deferred-task surface | Supported | Route, navigation, and page use Someday; status is `backlog` | Route and navigation smoke test; no active Archive route |
| Google Calendar and Tasks are usable | Provisional | Fetch clients, UI states, and local pagination/error harness pass; real-account evidence is recorded separately | Real OAuth test account: connect, refresh, expiry, disconnect, account switch, empty/error data |
| Google access is read-only | Supported in code and local harness | Read-only scopes, GET-only client paths, and no Google mutation helpers | Real OAuth test account confirms requested consent and API behavior |
| Oracle key is private | Supported in code | No `VITE_ANTHROPIC_API_KEY`; Claude path targets optional worker URL | Production bundle inspection and worker deployment review |
| Daily oracle is stable for a day | Supported in code | Date-scoped tarot, horoscope, and message caches use configured timezone | Reload/date-rollover/regeneration tests with a controlled clock |
| Dark mode is the default for new profiles | Supported in current source | `ThemeContext` and the pre-mount theme application default to `dark`; explicit saved `light`/`system` preferences remain honored | Clean-profile browser check on a light-system device; any theme initialization change |
| PWA has an installable manifest | Supported in code | `public/manifest.json`, subpath-safe metadata | Browser install prompt/standalone launch remains a manual check |
| Offline app shell is supported | Supported in code; manual device verification remains | Versioned worker precaches the built shell and same-origin assets; external services are not cached | Verify online load → offline reload → reconnect on supported browsers |
| GitHub Pages build artifact is reproducible | Supported for published candidate | Clean `npm ci`, lockfile portability, check, audit, build, artifact inspection, and post-push hash match | Re-run from a fresh clone after release-tree changes |
| Stable public release is ready | Deferred for evidence | Candidate review record; live OAuth, manual accessibility, and real browser storage failure remain bounded | Complete the remaining decisive checks in `docs/RELEASE-REVIEW-RECORD.md` |
| Published privacy notice is available | Supported in source and route | `src/pages/Privacy.tsx`, Settings link, and Pages-safe HashRouter route | Published route returns the app shell and a clean-browser check shows the policy before onboarding |

Classification meanings:

- **Supported:** directly evidenced by current source/configuration, with no broader
  runtime guarantee implied.
- **Provisional:** implementation exists but real-world or cross-state evidence is missing.
- **Disputed:** current source and product/documentation claims disagree.
- **Blocked:** a material risk or absent capability prevents the claim today.

## 6. Release gates

### Correctness

- `npm ci` succeeds from a clean checkout without private registry URLs.
- `npm run check` and `npm run build` pass.
- Core create/edit/complete/delete/reload journeys pass for tasks, rituals, habits,
  and manual calendar events.
- Date rollover, recurrence, timezone, DST, malformed storage, and storage failure
  behavior is tested.

### Usefulness

- Home answers what today requires without stale or cross-account data.
- Today and Someday counters, filters, promotion, completion, and empty states are
  correct.
- Calendar and Google-derived data have explicit loading, empty, stale, and error states.

### Privacy and safety

- No public build contains a reusable provider secret.
- OAuth scopes match the declared product promise.
- External requests, stored data, fallbacks, and user-controlled context are documented.
- The published privacy notice and owner-facing OAuth consent checklist match
  the current scopes and client-only behavior.
- Clear-data, disconnect, account-switch, and recovery behavior is demonstrated.

### Portability and deployment

- GitHub Pages serves every supported HashRouter route and static asset from the
  project subpath.
- CI validates the same install/build contract used for release.
- PWA/offline claims are either proven on supported devices or removed from release copy.

### Accessibility

- Keyboard, focus, labels, dialogs, live regions, contrast, zoom, reduced motion,
  touch targets, and narrow/mobile layouts pass automated and manual review.

### Evidence sufficiency

- The artifact identity, test environment, evidence ledger, and results are frozen.
- Independent correctness, outcome, and safety/portability reviews are complete.
- The final decision records scope, limitations, owners, and review-expiry triggers.

## 7. Repeatable validation protocol

From a fresh checkout:

```bash
git clone https://github.com/OKHP3/kierans-lifetrkr.git
cd kierans-lifetrkr
npm config set registry https://registry.npmjs.org/
npm ci --registry=https://registry.npmjs.org/
npm run check
npm run build
```

For local preview:

```bash
npm run dev
# Open the Replit preview, then verify #/, #/calendar, #/today,
# /someday, #/rituals, #/habits, #/settings, and #/origin.
```

For deployment truth:

```bash
bash scripts/verify-deployment.sh
```

For release identity and artifact validation:

```bash
npm run release:check
```

The release check prints the current reviewed commit and a deterministic artifact
identity, and writes the generated report to `dist/release-identity.json`. It
derives the application version from `package.json` and fails if the lockfile or
release identity disagrees. The candidate commit and dates in this document are
the exact historical evidence scope above; they must not be treated as current
without rerunning the check from that candidate.

The deployment workflow must also be checked in GitHub Actions after a `main` push.
A green local build is not evidence that OAuth, external APIs, accessibility, offline
behavior, or production routing works.

## 8. Review expiry and limits

This baseline expires when any of the following changes:

- package manifest or lockfile, Vite/PostCSS/Tailwind configuration, or CI workflow;
- route names, persistence keys, type shapes, OAuth scopes, or external endpoints;
- oracle delivery boundary or public deployment configuration;
- Google Cloud, GitHub Pages, or provider account settings;
- a release artifact is rebuilt from a different commit.

This baseline is not approval for `v1.0.0`. It is a starting point for the dependent
reliability, integration, privacy, accessibility, deployment, and final-review work.

## 9. Baseline validation snapshot

Run on August 24, 2026 from the frozen candidate `2bd74eadfbca7d0fa29cf35783762d68b9496591`:

| Check | Result | Interpretation |
|---|---|---|
| `npm ci` + lockfile immutability | Pass | Public registry URLs; lockfile hash unchanged after install |
| `npm audit --omit=dev --audit-level=high` | Pass | 0 production vulnerabilities reported |
| `npm run check` | Pass | TypeScript source type-checks |
| `npm run check:a11y` | Pass | 27 JSX/TSX files pass the source heuristic |
| `npm run build` | Pass | Vite production build completed |
| `node scripts/inspect-artifact.mjs` | Pass | Required Pages files, fallback, metadata, and hashed assets present |
| Workflow/preview startup | Pass | Replit workflow restarted; Vite served on port 5000; preview rendered without browser console errors |
| Published Pages smoke test | Pass | Post-push CI/Pages runs and public URL/hash/asset read-back recorded below |
| Real Google OAuth lifecycle | Partially run locally; real-account portion not run | `docs/GOOGLE-READONLY-EVIDENCE.md`; requires owner/test-account browser journey |
| Manual accessibility matrix | Not run | Checklist exists; keyboard, screen reader, zoom, and touch results are not recorded |
| Storage quota/private-mode recovery | Partial | Simulated throwing and silent non-persisting storage now produce a visible warning with retry; real browser quota/private-mode run remains owner-only |

The complete bounded decision, hashes, independent reviews, falsification pass,
and risk ownership are recorded in `docs/RELEASE-REVIEW-RECORD.md`.

## 16. Current reconciliation snapshot

This refresh was performed against the current `v0.1.10` source reference
`393c2aa74766d0572943306e372f5e35ec6cf950`. The release decision remains
`approve-with-limits` for controlled pre-production. The current
vision-to-delivery classifications and capability-level evidence boundaries
are in [`docs/VISION-DELIVERY-MATRIX.md`](VISION-DELIVERY-MATRIX.md).

The current tree contains the previously planned local/documentation work:
dark-default initialization, first-launch onboarding, oracle regeneration,
privacy route, service-worker shell, cat accent, and current architecture
documentation. Their presence is source evidence only unless the matrix says a
bounded runtime check was performed. It does not close real Google-account,
physical-device, manual accessibility, real browser storage, live worker, or
ownership-transfer gates.

The older frozen candidate, publication hashes, workflow links, and dated
addenda in this file remain valid only for the candidate and environments named
in those records. A new release artifact or any change listed in the expiry
rules requires a fresh identity and evidence pass.

### Fresh local validation — September 3, 2026

| Check | Result | Observation |
|---|---|---|
| `npm run check` | PASS | TypeScript completed with no errors |
| `npm run check:a11y` | PASS | Accessibility source check covered 30 JSX/TSX files |
| `npm run test:account-isolation` | PASS | Guest plus two simulated Google subjects retained distinct historical completion dates after timezone updates and reload reads |
| `npm run test:scope` | PASS | Three regression tests cover legacy task ordering and indexed habit completion |
| `npm run test:service-worker` | PASS | One regression test passed |
| `npm run test:sync` | PASS | Nine sync regression tests passed |
| `npm run build` | PASS | Vite production build and service-worker preparation completed |
| `npm run release:check` | PASS | `v0.1.10`; reviewed source `d6c0aa0bb64793b06d7139633dba5fbb3833e5a0+dirty`; artifact `sha256:f814ae12bed94b01bb62d896e4e81de84bb23a497a04a1b563c1b1776bc414c8` |
| `node scripts/inspect-artifact.mjs` | PASS | Eight required deployment files present |
| `git diff --check` | PASS | No whitespace errors in tracked changes |

The `+dirty` suffix reflects the pre-existing deleted files under
`attached_assets/`, which were not restored or modified during this
reconciliation. These local checks do not close owner-run account, device,
manual accessibility, live worker, storage-quota, or handoff gates.

## 14. Privacy and OAuth readiness addendum

**Verification date:** August 27, 2026

The client now has a stable `#/privacy` route at
`https://okhp3.github.io/kierans-lifetrkr/#/privacy`. Settings links to it, and
the route is exempted from first-launch onboarding so a clean browser can read
the policy directly. The policy covers local browser storage, the
session-scoped Google token, the exact read-only Google access boundary,
third-party browser services, the optional oracle worker, local fallback
behavior, user controls, and support contact.

`docs/OAUTH-CONSENT-CHECKLIST.md` captures the exact current app name,
description, privacy URL, support email, logo, Authorized JavaScript origins,
scope string, use explanation, and evidence cross-references. The development
origin is recorded as `http://localhost:5000`, matching the configured workflow.

This closes the repository's privacy-copy/readiness gap, not Google's external
approval boundary. The current posture remains personal-use ready with
approved-with-limits release evidence. Google Cloud consent configuration,
real-account lifecycle testing, any move to production, and any future
multi-user/public verification remain owner-run or external gates.

## 10. Core behavior verification addendum

**Verification date:** August 27, 2026
**Verification worktree:** candidate `52c872e` plus the targeted Mercury-banner fix
recorded below
**Environment:** Replit Linux workspace, Bun 1.3.6 for direct TypeScript/module
checks, Vite development workflow on port 5000, UTC-controlled test dates, and an
in-memory browser-storage/fetch harness for oracle states. No Google account or
Google API access was used.

The following checks exercised the shipped source paths rather than relying only on
source inspection:

### Recurrence visibility

| Case | Expected | Observed |
|---|---|---|
| Weekday pattern on Monday, August 24 | Active / `true` | Pass / `true` |
| Weekday pattern on Friday, August 28 | Active / `true` | Pass / `true` |
| Weekday pattern on Saturday, August 29 | Inactive / `false` | Pass / `false` |
| Weekday pattern on Sunday, August 30 | Inactive / `false` | Pass / `false` |
| Specific days Mon/Wed/Fri on Monday, August 24 | Active / `true` | Pass / `true` |
| Specific days Mon/Wed/Fri on Wednesday, August 26 | Active / `true` | Pass / `true` |
| Specific days Mon/Wed/Fri on Friday, August 28 | Active / `true` | Pass / `true` |
| Specific days Mon/Wed/Fri on Tuesday, August 25 | Inactive / `false` | Pass / `false` |
| Specific days Mon/Wed/Fri on Sunday, August 30 | Inactive / `false` | Pass / `false` |
| Calendar weekly Mon/Wed/Fri recurrence on Monday, August 24 | Visible / `true` | Pass / `true` |
| Calendar weekly Mon/Wed/Fri recurrence on Tuesday, August 25 | Hidden / `false` | Pass / `false` |
| Calendar weekly Mon/Wed recurrence with interval 2 on Monday, August 31 | Hidden / `false` | Pass / `false` |

The checks covered both `isActiveToday()` and the shared
`recurrenceOccursOnDate()` evaluator. No recurrence defect was found.

### Mercury banner

`getMercuryStatus()` returned retrograde through August 11, 2026 for the active
test date August 1, and returned inactive with no end date for August 27, 2026.
The rendered visibility predicate was then exercised in all setting/state
combinations:

| `showMercuryBanner` | Calculated state | Expected | Observed |
|---|---|---|---|
| enabled | retrograde | Show banner through `2026-08-11` | Pass |
| disabled | retrograde | Hide banner | Pass |
| enabled | inactive | Hide banner | Pass |
| disabled | inactive | Hide banner | Pass |

The check found and fixed two user-visible issues: Calendar had no Mercury banner,
and Home displayed its banner even when the setting was disabled. Both surfaces now
use the same setting-plus-calculated-state predicate.

### Horoscope and oracle fallback

| State | Expected | Observed |
|---|---|---|
| Configured Aries horoscope response | Non-empty horoscope is cached and available to the reading | Pass; content returned and second read reused the cache without another fetch |
| Cleared horoscope cache followed by unavailable provider | `null`; no exception escapes | Pass; `null` returned |
| Tarot meaning with failed horoscope | Oracle remains usable using tarot fallback | Pass; tarot meaning returned |
| `OracleCard` with horoscope | Horoscope text is rendered | Pass |
| `OracleCard` without horoscope | Main oracle message still renders and no empty horoscope block appears | Pass |

These results support the narrower claim that horoscope failure is isolated from the
local tarot/oracle fallback. Provider availability and real deployed browser CORS
behavior remain provisional.

### Mechanical and preview checks

| Check | Result |
|---|---|
| `npm run check` | Pass |
| `npm run build` | Pass |
| Replit workflow restart | Pass; Vite served on port 5000 |
| Browser console during preview capture | No errors reported |

This addendum confirms the targeted recurrence, Mercury predicate, and oracle
fallback behavior. It does not close the separate live OAuth, published Pages,
manual accessibility, real-browser storage quota/private-mode, or
ownership-transfer gates.

## 11. Google read-only activation addendum

**Verification date:** August 27, 2026
**Environment:** Replit Linux workspace; Vite workflow on port 5000; UTC-controlled
local API harness
**Evidence record:** `docs/GOOGLE-READONLY-EVIDENCE.md`

`VITE_GOOGLE_CLIENT_ID` is present in the Replit secret inventory, and the
development preview renders an enabled Google connection action. The value was
not read or recorded. Source inspection confirms the requested Calendar and
Tasks scopes remain read-only.

The local source-path harness passed populated two-page Calendar, Task List, and
Task responses; empty responses; typed 403 errors; profile subject handling; and
two simulated local subject namespaces. The UI changes add explicit Google
Tasks loading/error/retry states on Today and Someday, automatic expiry-boundary
re-rendering, Calendar visibility control, and no edit affordance for
read-only Google events. Type-check, accessibility-source check, production
build, artifact inspection, workflow restart, and preview console checks also
passed.

The real consent/profile/API/lifecycle/two-account journey was not run because
this agent session has no interactive authenticated browser path. GCP API
enablement, authorized origins, and the test-user list cannot be inferred from
secret presence. Accordingly, the Google runtime claims remain **Provisional**
and the release remains approved-with-limits until the owner-run matrix is
recorded without personal records or tokens.

## 12. Optional oracle worker boundary addendum

**Verification date:** August 27, 2026
**Environment:** Replit Linux workspace; Bun 1.3.6 source-path harness; Vite
production builds; in-memory browser-storage and fetch stubs

### Activation status

The owner-deployed worker was not available for live verification. The
environment has no configured `VITE_ORACLE_WORKER_URL`, and no
`ANTHROPIC_API_KEY` or `VITE_ANTHROPIC_API_KEY` is present in the Replit
environment. No credential values were requested, read, or recorded. This
means the worker-side secret store, deployed URL, CORS policy, provider
availability, and live Claude response remain **Owner-blocked / Not run**.

### Client boundary and behavior

The actual `src/lib/oracle.ts` source path was exercised with an isolated,
temporary non-secret worker URL and in-memory browser APIs. The valid-response
path returned the worker message and a second same-day call reused the cached
message with exactly one worker request. The request body contained only the
documented `system` and `messages` keys, with celestial/card context and the
optional selected sun sign; profile, name, email, task, habit, and calendar
values were absent.

| State | Expected | Observed |
|---|---|---|
| Configured worker, valid response | Return worker message | Pass |
| Same-day repeat | Reuse cache without another worker call | Pass; one request |
| Worker HTTP failure (`500`) | Return tarot `meaning_up` | Pass; fallback cached |
| Worker rate limit (`429`) | Return tarot `meaning_up` | Pass; fallback cached |
| Malformed worker content | Return tarot `meaning_up` | Pass; fallback cached |
| No worker URL | Return tarot `meaning_up` without network | Pass |
| Request payload privacy | Send only allowed oracle context | Pass |

### Bundle and artifact checks

`npm run check`, `npm run check:a11y`, and `npm run build` passed. A build with
an isolated test worker URL embedded only that URL and contained no
`ANTHROPIC_API_KEY`, `VITE_ANTHROPIC_API_KEY`, `api.anthropic.com`, or other
direct Anthropic browser reference. The final no-worker build passed
`node scripts/inspect-artifact.mjs` and the same provider/direct-call scan.

The oracle boundary is therefore **Confirmed for source, simulated worker,
fallback, payload, and bundle states**. It is **Provisional for live activation**
until the owner deploys the worker, stores the provider credential only in the
worker secret store, configures `VITE_ORACLE_WORKER_URL`, and records a
redacted deployed response/CORS check. The local tarot meaning remains the
 public reliability fallback.

## 13. Release evidence closure addendum

**Verification date:** August 27, 2026
**Environment:** Replit Linux workspace; Vite workflow on port 5000; public
GitHub Pages URL `https://okhp3.github.io/kierans-lifetrkr/`
**Artifact identity:** application candidate
`b3d19b526608501e64faf468c5a995cf45399410`; final evidence records are in the
documentation-only child published as `b112e761849dc49721088efead1191a476e0d9cd`.
The public artifact hashes match a clean build from the application candidate.

### Local release gates

| Check | Result | Evidence |
|---|---|---|
| `npm ci` with public registry | PASS | Lockfile installation completed without mutation |
| Type-check and source accessibility check | PASS | `npm run check`; `npm run check:a11y` |
| Sync regression suite | PASS | Nine regression tests; the fixture now explicitly clones the `main` branch |
| Production audit | PASS | `npm audit --omit=dev --audit-level=high`; zero vulnerabilities |
| Production build and artifact inspection | PASS | `npm run build`; `node scripts/inspect-artifact.mjs` |
| Storage failure harness | PASS | Normal write/read-back, throwing, and silent non-persisting storage all produced the expected result |
| Preview startup/render | PASS | Workflow served port 5000; desktop rendered smoke had no application browser-console errors |

### Deployment and manual limits

The pre-push Pages read-back is retained as a transport check only. After
publication, CI and Deploy to GitHub Pages both succeeded for the application
candidate and for the documentation-only child. The public shell, `404.html`,
manifest, favicon, all required icons, OG image, and hashed JS/CSS entrypoints
returned HTTP 200 with the expected content types and matched a clean build by
SHA-256. Each supported fragment URL returned the HTTP 200 SPA shell.
HashRouter fragments require a browser to exercise; plain HTTP cannot send the
fragment to the server.

The available browser capture covered a desktop `#/today` rendered smoke
without application console errors. An interactive narrow/desktop keyboard,
screen-reader, zoom, contrast, and touch matrix was not available in this agent
session and remains **NOT RUN**, not a pass inferred from the source heuristic.

### Bounded decision

The release remains **approve-with-limits** for controlled pre-production
handoff. The Pages identity/read-back objection is resolved for the published
shell, fallback, assets, and clean-build identity. The storage failure
objection is **partially resolved for simulated failures** because the app now
gives visible, recoverable guidance. Public stable approval remains deferred
for the real Google lifecycle and account-isolation journey, the manual
accessibility matrix, real browser quota/private-mode behavior, live
optional-worker activation, and ownership handoff. This addendum expires on
any change to the release tree, routes, persistence behavior, OAuth scopes,
external endpoints, workflow, or Pages configuration.

## 15. Deterministic date semantics addendum

**Verification date:** September 3, 2026
**Scope:** local source, deterministic harness, accessibility check, production build,
and running preview. No local records were sent to an external service.

The configured timezone is now the source of truth for current dates and weekdays,
calendar month labels, event date/time labels, recurrence expansion, habit streak
history, completion dates, and Google-task due-date comparisons. Date-only values
remain `YYYY-MM-DD` strings; changing timezone does not rewrite historical
completion records or alter the existing guest/Google-subject storage namespaces.
Recurrence arithmetic uses UTC-neutral calendar dates, so DST transitions do not
change the number or identity of calendar days.

| Check | Result | Evidence |
|---|---|---|
| Deterministic date/recurrence harness | PASS | `npm run test:date`; six suites cover timezone midnight boundaries, DST day offsets, inactive/active weekday, inactive/active specific-day, weekly/monthly/yearly/custom recurrence, and event labels |
| Type-check | PASS | `npm run check` |
| Accessibility source check | PASS | `npm run check:a11y` |
| Production build | PASS | `npm run build` |

Owner-run browser timezone/DST acceptance, physical-device behavior, storage
quota/private-mode behavior, and Google OAuth/API lifecycle checks remain
separate manual evidence and are not claimed by this addendum.

## 16. Account isolation and historical-date verification addendum

**Verification date:** September 3, 2026
**Scope:** local storage namespace and date-only completion preservation
**Evidence:** `npm run test:account-isolation`

The local regression harness seeded one guest namespace and two simulated Google
subject namespaces with different routine and habit completion dates. It then
changed each namespace's stored timezone and performed fresh storage reads to
represent a reload. All three namespaces retained their original date-only
completion records, and each read returned only the active namespace's records.
The harness uses an in-memory `localStorage` implementation only; it does not
invoke OAuth, Google APIs, or any external service and does not send local
records outside the process.

| Check | Result | Boundary |
|---|---|---|
| Guest historical routine and habit dates survive a timezone update and reload read | PASS | Local namespace harness |
| Google subject A and subject B historical routine and habit dates survive a timezone update and reload read | PASS | Local namespace harness |
| Guest, subject A, and subject B completion keys remain distinct | PASS | Local namespace harness |
| Browser storage quota/private mode and real reload persistence | NOT RUN | Requires owner-run browser/device evidence; simulated storage failures are recorded separately |
| Google consent, token expiry/reconnect, disconnect, and real account switching | NOT RUN | Requires owner-run disposable/test-account OAuth journey; no token or personal record was used |

This closes the deterministic local regression gap for historical-date
preservation but does not upgrade the real browser account-switch claim. The
owner-run matrix must record only profile labels, timezone changes, pass/fail
results, and redacted key names; never record tokens, email addresses, or
completion contents.

## 17. Ownership handoff execution addendum

**Execution date:** August 27, 2026
**Performer:** Replit Agent
**Published source:** `de5fa3a369174d9975ffa0f9af7b47b03b8e2e21`

The reversible handoff preparation is complete: the canonical credential-free
GitHub remote was confirmed, the remote-ahead history was reconciled without a
force-push, the current tree was published through the bound GitHub connection,
and CI plus Deploy to GitHub Pages succeeded. The current Replit workflow also
restarted cleanly and the published shell, privacy route, and service worker
returned HTTP 200.

Ownership remains with Jamie until Kieran authorizes and completes the GitHub
transfer, Replit fork, secret re-entry, GCP IAM/client-ID changes, and owner
smoke/recovery rehearsal. Real Google lifecycle and account-isolation testing,
manual accessibility, real browser storage quota/private-mode behavior, and
live optional-worker activation remain unresolved. This addendum records
handoff readiness evidence; it does not promote the release beyond
`approve-with-limits` or claim stable/v1.0 approval.

## 18. Product scope increment addendum

**Decision date:** September 4, 2026
**Decision record:** [`docs/PRODUCT-SCOPE-DECISION.md`](PRODUCT-SCOPE-DECISION.md)

The approved next-release increment is deliberately small: persisted local task
ordering with labelled keyboard controls, 1–12 independently completable habit
repetitions, lightweight ritual-item metadata/optional state, persisted ritual
ordering, and limited item-level recurrence overrides. Item rules are optional
fields on existing routine items, inherit the parent when absent, and intersect
the parent schedule when present. Explicit date exceptions can therefore skip an
individual item without changing its parent ritual. The source preserves the
existing client-only architecture, storage namespace, configured-timezone date
model, read-only Google boundary, and oracle privacy boundary.

The evening wrap-up is now included as a deliberately limited increment: from
6:00 PM in the configured timezone, Today offers an optional dialog that
summarizes due ritual items, active habit repetitions, and today's local task
records. It is read-only, has no persisted review record, does not change
completion semantics, and does not invoke or send data to the oracle. Empty,
incomplete, reload, account-local, and timezone-boundary states are covered by
the deterministic regression checks. Journaling, weekly review, and broader
analytics remain deferred.

The source regression suite covers migration/order, habit completion semantics,
calendar-date recurrence, item schedule intersection, reload persistence,
account namespaces, and the evening projection. The standard type,
accessibility, build, artifact, and owner-run release gates still apply, and
this addendum does not change the `approve-with-limits` posture.
