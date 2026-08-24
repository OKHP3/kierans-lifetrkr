# LifeTrkr Release Truth Baseline

**Baseline date:** August 22, 2026  
**Artifact:** `kieran-lifetrkr`  
**Application version:** `0.1.10` (`package.json`, `src/constants.ts`)  
**Release posture:** Pre-production prototype; defer stable-release approval pending evidence

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
| Build | Vite 8.2.1, TypeScript 7.0.2, `tsc && vite build` | `package.json`, `vite.config.ts` |
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
Storage reads tolerate malformed JSON by returning null/empty values. Storage writes
and quota failures are not yet proven as recoverable behavior.

The source of truth for types is `src/types.ts`. In particular, the implementation
uses `RecurrenceRule` and optional compatibility fields; older PRD type listings must
not be used to infer current payloads.

## 4. External and browser-facing services

| Service | Use | Current boundary | Evidence status |
|---|---|---|---|
| Google Identity Services | Browser OAuth token flow | `sessionStorage` token and expiry | Wired; real-account lifecycle unproven |
| Google Calendar API v3 | Calendar reads and event create/delete paths | Direct browser fetch with bearer token | Provisional; scope and read-only promise conflict |
| Google Tasks API v1 | Task-list and task reads | Direct browser fetch with bearer token | Provisional; pagination and account lifecycle unproven |
| Google userinfo v3 | Connected profile | Direct browser fetch with bearer token | Provisional |
| Tarot API | Daily card | Direct browser fetch with deterministic local fallback | Supported in code; service/CORS not continuously proven |
| Free Horoscope API | Optional sign-based horoscope | Direct browser fetch; null on failure | Provisional; no service guarantee |
| Anthropic Messages API | Optional daily oracle wording | Server-side oracle worker only; no provider key in client bundle | Worker deployment is optional; local tarot meaning is the public fallback |
| Google Fonts / Analytics | Fonts and page tracking | Third-party browser scripts | Present; privacy disclosure and blocking behavior require review |

The Google integration now requests read-only scopes and does not expose write
helpers. Real-account lifecycle testing remains a handoff verification item.

## 5. Claim and evidence ledger

| Claim | Classification | Current evidence | Decisive test or condition |
|---|---|---|---|
| The app is client-only and has no publisher database | Supported | No server entrypoint or database; browser storage in source | Clean checkout confirms no backend runtime is required |
| Local data is namespaced by Google subject | Supported in code | `storage.ts` and profile namespace logic | Account-switch journey proves isolation and guest recovery |
| Manual core workflows persist across reload | Provisional | Reducer and persistence effects exist | Browser journey covering create/edit/complete/delete/reload |
| Someday is the current deferred-task surface | Supported | Route, navigation, and page use Someday; status is `backlog` | Route and navigation smoke test; no active Archive route |
| Google Calendar and Tasks are usable | Provisional | Fetch clients and UI paths exist | Real OAuth test account: connect, refresh, expiry, disconnect, account switch, empty/error data |
| Google access is read-only | Supported in code | Read-only scopes and GET-only client paths | Real OAuth test account confirms requested consent and API behavior |
| Oracle key is private | Supported in code | No `VITE_ANTHROPIC_API_KEY`; Claude path targets optional worker URL | Production bundle inspection and worker deployment review |
| Daily oracle is stable for a day | Supported in code | Date-scoped tarot, horoscope, and message caches use configured timezone | Reload/date-rollover/regeneration tests with a controlled clock |
| Dark mode is the default | Disputed | Theme context defaults to `system`; project intent says dark | First launch on light-system device must render dark, unless product decision changes |
| PWA works offline and is installable | Blocked | Manifest exists; no service worker found | Install and offline test on supported mobile browsers, or narrow the claim |
| GitHub Pages deploy is reproducible | Provisional | Active workflows build and deploy `dist` | Clean checkout with public registry, `npm ci`, check, build, and Pages route smoke test |
| Stable release is ready | Blocked | Evidence is incomplete and decisive tests are absent | Final equilibrium review with frozen artifact and passing release gates |

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

Run on August 22, 2026 from the current workspace:

| Check | Result | Interpretation |
|---|---|---|
| `npm run check` | Pass | TypeScript source currently type-checks |
| `git diff --check` | Pass | Documentation changes contain no whitespace errors |
| `npm run build` | Blocked | Installed modules are stale/incompatible with the manifest: workspace has Vite 6 and Tailwind 3, while the manifest/lockfile require Vite 8 and Tailwind 4; `@tailwindcss/postcss` is unavailable in `node_modules` |

The failed build is recorded rather than silently repaired here. Resolving clean
installation, lockfile portability, and production artifact validation belongs to the
installation/deployment workstream. Until it passes from a clean install, the release
baseline must not claim reproducible production builds.