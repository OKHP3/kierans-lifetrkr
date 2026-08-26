# Kieran's LifeTrkr v0.2.0 Completion PRD

**Status:** Implementation directive for Replit, pending owner approval of the
explicit decisions in Section 6

**Prepared:** August 26, 2026

**Audience:** Replit Agent and the project owner

**Product:** Kieran's LifeTrkr

**Current release baseline:** v0.1.10, candidate approved with limits for
pre-production use

**Primary repository:** https://github.com/OKHP3/kierans-lifetrkr

**Primary application URL:** https://okhp3.github.io/kierans-lifetrkr/#/

---

## 1. Executive summary

Kieran's LifeTrkr is a quiet, mobile-first personal life OS. It brings
rituals, habits, local tasks, calendar events, Google Calendar and Google Tasks
read access, and a daily oracle into one client-only interface.

The v0.1.10 application already has the central product shape. The remaining
work is a completion pass, not a change of product direction. This PRD turns
the documented gaps into a sequenced multi-task plan that Replit can execute in
small, reviewable slices.

The plan has four objectives:

1. Complete the in-scope daily workflows that the original vision described but
   that are only partially represented in the current UI or data model.
2. Preserve the client-only, low-noise architecture and all existing local
   user data.
3. Make the application honest and usable at its current pre-production
   status, including explicit behavior when storage, Google, or public APIs are
   unavailable.
4. Leave owner-only release, Google Cloud, and account-transfer actions
   clearly separated from code work.

This document is intentionally more detailed than the older PRDs. The older
PRDs remain historical product evidence. The current implementation contract is
the repository's `AGENTS.md`, current source, package manifest, active workflow,
and `docs/RELEASE-TRUTH-BASELINE.md`.

---

## 2. Product contract

### 2.1 The user problem

Kieran's daily life contains several kinds of attention:

- recurring routines that depend on the day of the week;
- habits that need light, repeated tracking rather than a heavy productivity
  system;
- tasks that belong to today or can wait for Someday;
- calendar events that should be visible without forcing the user into a second
  application;
- a small daily oracle that adds reflection without pretending to be a planner,
  therapist, or authority.

The product's core question is:

> What does today require from me?

LifeTrkr should answer that question quickly, calmly, and honestly. It should
not become a multi-tenant service, a social network, a task automation engine,
or a replacement for Google Calendar or Google Tasks.

### 2.2 Product principles

These principles are acceptance constraints for every task in this PRD:

1. **Personal first.** This is Kieran's personal tool. General public use is a
   possible future consequence of its MIT license, not a reason to introduce
   accounts, sharing, or a service backend.
2. **Client-only.** Browser storage is the source of truth for local data.
   Google Calendar and Google Tasks are read-only external sources held in
   transient application state.
3. **Quiet by default.** The user should see the next useful thing without
   being buried in configuration, badges, or promotional language.
4. **Explicit source boundaries.** Manual records, Google records, cosmic
   records, and oracle content must remain distinguishable.
5. **No data loss.** Existing localStorage records must continue to load. A
   schema improvement must include backward-compatible defaults or a
   versioned migration.
6. **Evidence before release claims.** A passing local build does not prove
   OAuth, third-party APIs, deployed Pages behavior, manual accessibility, or
   storage failure handling.
7. **No secret expansion.** Do not add API keys, server credentials, a backend,
   or a new direct provider call. Oracle wording continues to use the optional
   configured worker and local fallback.

### 2.3 Current delivered baseline

The current application already provides:

- React, Vite, TypeScript, Tailwind, and HashRouter;
- the Home, Rituals, Habits, Calendar, Today, Someday, Settings, and Origin
  routes;
- local persistence for settings, routine templates and completions, habits and
  completions, tasks, and manual calendar events;
- Google Identity Services token handling in the browser;
- read-only Google Calendar and Google Tasks fetches with pagination;
- calendar recurrence, categories, tags, descriptions, cosmic events, and
  manual event CRUD;
- Home oracle display with daily caching, tarot and horoscope fallbacks, and an
  optional worker-generated message;
- an installable manifest and responsive standalone metadata;
- current npm checks, the accessibility source check, and a production build.

Do not reimplement or replace these foundations merely to complete the tasks
below.

---

## 3. Evidence-led gap register

The following gaps are supported by current source inspection and the project's
vision documents. A gap marked **Confirmed** is an implementation or evidence
deficiency. **Owner decision** means Replit must pause that part until the owner
chooses the scope. **Historical** means it is not a task.

| ID | Area | Status | Current evidence | Required disposition |
|---|---|---|---|---|
| G-01 | First-launch onboarding | Confirmed gap | No onboarding flow exists in `src/App.tsx` or `src/main.tsx`. | Build the non-blocking welcome flow. |
| G-02 | Dark default | Confirmed gap | `ThemeContext` defaults to `system`, while the product design intends a dark first experience. | Default new users to dark; preserve explicit preferences. |
| G-03 | Ritual item depth | Confirmed gap | Template-level metadata exists, but individual items do not fully support the planned description, category, tags, recurrence, optional state, edit, and reorder behavior. | Extend the existing model and UI without changing storage roots. |
| G-04 | Ritual recurrence filtering | Confirmed gap | Recurrence utilities exist, but the Rituals view does not consistently hide inactive items for the selected day. | Centralize and test date evaluation. |
| G-05 | Habit completion depth | Confirmed gap | `completionIndex` is typed but the UI records only one completion per day and has no configured times-per-day field. | Add target counts and partial completion behavior. |
| G-06 | Habit recurrence filtering | Confirmed gap | The Habits view filters active state and frequency but not whether a habit occurs today. | Apply the shared recurrence predicate. |
| G-07 | Calendar Mercury banner | Confirmed gap | Mercury settings and Home display exist, but Calendar does not present the planned visible banner. | Add the banner only when enabled and retrograde. |
| G-08 | Settings oracle regeneration | Confirmed gap | Home can regenerate; Settings has no equivalent control. | Add a Settings action with explicit full-reading semantics. |
| G-09 | Task ordering | Confirmed gap | Today and Someday sort local tasks by priority and do not provide persisted manual ordering. | Add accessible reorder controls and persistence if the owner accepts this v0.2 scope. |
| G-10 | Storage failure UX | Evidence gap with code weakness | Storage reads and writes catch errors, but write failures are silent and the UX has not been demonstrated. | Surface a recoverable warning and test quota/private-mode behavior. |
| G-11 | Live integration evidence | Evidence gap | Local code and build checks pass; published Pages, OAuth lifecycle, and third-party API health remain unverified. | Owner-run release verification, not simulated by Replit. |
| G-12 | Manual accessibility evidence | Evidence gap | Automated source checks pass; the manual keyboard, screen-reader, zoom, touch, and contrast matrix is not complete. | Run the manual matrix before stable-release language. |
| G-13 | PWA/offline behavior | Partial / owner decision | Manifest and install metadata exist; there is no service worker or offline shell. | Decide whether to implement offline shell support. Do not claim offline support until verified. |
| G-14 | Visual asset integration | Confirmed gap | Existing app icon, banner, cat accent, and social assets are present but not fully used by the application. | Integrate only existing assets and preserve Moonlit Hearth design. |
| G-15 | Privacy/release documentation | Partial / owner decision | Local privacy copy exists, but there is no dedicated stable privacy page and public OAuth verification has not been completed. | Separate a personal-use release path from any future public-user path. |
| G-16 | Ownership transfer | External owner task | The handoff record has not been completed. | Execute only through the owner-controlled GitHub, Replit, and Google Cloud checklist. |

### 3.1 Deliberately excluded historical requirements

The following items must not be resurrected as implementation tasks:

- the original Express, Replit server, Notion, or database architecture;
- server-side OAuth or publisher-managed user data;
- Google Calendar or Google Tasks write operations;
- a `gh-pages` branch or legacy deployment path;
- multi-user sharing, cross-device sync, social features, or a public account
  system;
- native mobile applications, Apple/Microsoft calendar integrations, push
  notifications, AI scheduling, or automatic task planning;
- the old `Archive` label, which has been deliberately replaced by `Someday`;
- old stack/version claims preserved in historical PRDs.

---

## 4. Target experience

### 4.1 First launch

When a new browser has no existing LifeTrkr data, the user sees a compact
welcome surface explaining:

- LifeTrkr is a personal, browser-based life OS;
- local records stay in this browser;
- Google is optional and read-only for Calendar and Tasks;
- the user can connect Google or continue without it.

The user must be able to continue as a guest. No account, email, consent to a
backend, or remote profile is required.

Existing users with persisted records must not be interrupted by onboarding.
Clearing application data should follow the documented decision for whether the
welcome surface reappears. The default recommendation is that clearing local
app data resets the first-launch state as well, while preserving the separate
browser-level theme preference only if the existing product contract requires
it.

### 4.2 Daily routines

The Rituals view remains organized around the days of the week, but every item
must be a real editable unit. Each item may have:

- title;
- optional time;
- optional description;
- optional category;
- zero or more tags;
- optional recurrence override;
- optional flag;
- stable order.

The template-level recurrence remains available for a whole routine. An item
recurrence override is evaluated in addition to the template schedule. The UI
must make this relationship understandable rather than exposing two unexplained
recurrence editors.

On a selected date, only items active on that date should be actionable. An
inactive item should not appear as an unchecked obligation. Historical
completion records must remain intact even when an item is later edited or
removed.

### 4.3 Habits

Each habit has a target completion count per active day. The default is one.
When the target is greater than one, the card shows a small set of accessible
completion controls, such as numbered circles or a progress count. The user can
record and undo individual completions.

A day is complete for streak purposes when the target count is met. A partial
day remains visible as partial, not falsely complete. Existing completion
records without an index count as completion index zero.

The habit list should show only active habits that occur today unless the user
has selected an explicit view that includes inactive or non-due records. A
weekday-only habit must not count against a weekend's remaining total.

### 4.4 Calendar

The Calendar view continues to distinguish:

- manual local events;
- read-only Google events;
- cosmic events;
- birthday-derived events.

When the Mercury banner setting is enabled and the current calculated state is
retrograde, Calendar displays a calm, dismissible or non-blocking informational
banner. It must not imply scientific certainty or prevent calendar use. When
the setting is disabled or Mercury is not retrograde, no banner is rendered.

### 4.5 Oracle

The Oracle remains optional. It must work with no provider key and no worker by
using the existing tarot/celestial fallback path.

The Settings action labeled **Regenerate today's reading** must:

1. clear the current user's message cache for today's date;
2. clear today's public tarot and horoscope cache entries in the same browser;
3. request a new reading through the existing hook;
4. fall back safely if any external request fails;
5. never send tasks, habits, calendar contents, profile details, or OAuth
   tokens to the oracle worker.

The UI must communicate that regeneration may still produce the deterministic
fallback when a public API or worker is unavailable.

### 4.6 Tasks

Local Today and Someday tasks may have an explicit stable order within their
status. Reordering must work with keyboard and pointer input, not only drag and
drop. Google Tasks remain read-only and are not reordered or written back.

If task ordering is deferred by the owner, the existing priority sort remains
the documented behavior and no half-built drag affordance should be added.

### 4.7 PWA and visual identity

The application may use the existing LifeTrkr visual asset pack, including the
app icon, banner, cat accent, and social preview. Asset integration must retain
the Moonlit Hearth system: warm mystical dark, candlelight, amethyst, gold,
sage, rose, Cormorant Garamond for display, DM Sans for body text, and Space
Mono for labels and streaks.

Offline support is a separate release decision. If approved, it means only:

- the application shell and local records remain available offline;
- Google, tarot, horoscope, and oracle-worker requests fail gracefully;
- stale external data is not presented as newly synchronized;
- the UI identifies unavailable network-backed features.

It does not mean background sync, server storage, Google writes, or a new
backend.

---

## 5. Technical direction

### 5.1 Repository and dependency rules

- Work only in the LifeTrkr repository.
- Read and obey the repository root `AGENTS.md`.
- Use npm and the checked-in `package-lock.json`.
- Do not add Express, a database, a server, a new authentication provider, or
  a new direct Anthropic call.
- Do not add API keys, `.env` files, OAuth secrets, or credentials.
- Do not bump `APP_VERSION` for documentation or infrastructure-only changes.
- Do not use destructive Git commands or broad cleanup commands.
- Preserve unrelated owner changes, including any pre-existing untracked files.

### 5.2 State and persistence rules

Use `src/context/AppContext.tsx`, `src/lib/storage.ts`, and existing type
definitions as the state boundary. Do not introduce component-specific
localStorage keys.

Any new persisted behavior must:

1. define its key or field in one canonical module;
2. have a backward-compatible default;
3. tolerate malformed or missing values;
4. preserve records that contain fields newer than the current code knows;
5. be exercised with an existing v0.1.10-shaped fixture and a new-shaped
   fixture.

Recommended model changes:

```ts
export type RoutineItem = {
  id: string
  title: string
  time?: string
  description?: string
  optional?: boolean
  categoryId?: string
  tags?: string[]
  recurrence?: RecurrenceRule
  sortOrder: number
}

export type Habit = {
  id: string
  name: string
  description?: string
  colorTag?: string
  active: boolean
  createdAt: string
  timesPerDay?: number
  recurrence?: RecurrenceRule
  categoryId?: string
  tags?: string[]
  updatedAt?: string
}

export type Task = {
  // existing fields remain unchanged
  sortOrder?: number
}
```

The exact implementation may differ if it preserves the same behavior and
compatibility guarantees. Do not add a parallel `Ritual` storage collection
unless a migration plan proves that the existing `routineTemplates` collection
cannot be extended safely.

### 5.3 Recurrence rules

Create one well-tested predicate for recurring local records. It must cover the
existing `RecurrenceRule` forms that the application exposes:

- none;
- daily intervals;
- weekly intervals with selected days;
- monthly date selection;
- yearly date selection;
- end dates;
- end counts;
- exceptions.

Use ISO dates and UTC-safe calculations for date-only comparisons. The predicate
must be used by Rituals, Habits, Calendar, and any future due-state display.

Minimum test cases:

1. a daily record is active on its start date and later interval dates;
2. a weekday record is inactive on Saturday and Sunday;
3. a selected Monday/Wednesday record is inactive on Tuesday;
4. an interval does not activate before its start date;
5. an on-date rule is inactive after its end date;
6. an after-count rule stops at the expected occurrence;
7. an exception suppresses one otherwise valid occurrence;
8. a legacy record with no recurrence preserves current behavior.

### 5.4 Oracle boundary

Keep `src/lib/oracle.ts` as the only oracle provider boundary. The client may
call the configured `VITE_ORACLE_WORKER_URL`, but it must not receive or use an
Anthropic provider key. The worker payload must remain limited to the existing
celestial/card context and optional birth sign.

Do not add user data to prompts. Do not make public tarot or horoscope APIs a
release blocker because deterministic and null fallbacks already exist.

### 5.5 Accessibility and interaction

Every new interaction must have:

- a keyboard path;
- a visible focus state;
- an accessible name;
- a state announcement where completion, save, failure, or regeneration changes
  matter;
- no reliance on color alone;
- touch targets that remain usable on a narrow viewport;
- reduced-motion compatibility for any animation.

Use existing primitives and styles where possible. Avoid adding a new design
system or a new icon dependency.

---

## 6. Owner decisions required before execution

Replit may implement the code-only tasks without waiting for these decisions,
but must not silently decide them:

| Decision | Recommendation | Why it matters |
|---|---|---|
| D-01: Offline shell | Defer until core workflows and live verification pass. | It changes service-worker behavior and release language. |
| D-02: Task reorder | Include in v0.2 if the user values manual order more than a shorter slice; otherwise defer. | It adds persisted state and interaction complexity. |
| D-03: OAuth verification | For a single permanent personal user, retain Testing mode unless the owner intends broader access. | Full verification is an external process and is not needed for the current personal-use contract. |
| D-04: Privacy page | Build if the app will be presented as a public project or used by additional people; otherwise keep current in-app disclosure and record the limitation. | A public release needs a stable, shareable privacy boundary. |
| D-05: Ownership transfer | Execute after technical and release checks are clear. | It requires account and permission changes outside the repository. |
| D-06: Existing OverKill Hill footer branding | Remove only with explicit approval. | It conflicts with the personal-app design intent but is an existing UI exception. |

When a decision is not made, mark the related task `DEFERRED`, not `DONE`.

---

## 7. Replit multi-task execution plan

Replit should execute one task at a time in the order below. Each task has a
bounded purpose, expected files, tests, and a stop condition. A later task must
not conceal a failure in an earlier task.

### R0. Baseline and safety checkpoint

**Purpose:** Establish the starting state before modifying application code.

**Actions:**

- read `AGENTS.md` and this PRD;
- inspect `git status --short --branch`;
- preserve unrelated changes;
- run `npm run check`, `npm run check:a11y`, and `npm run build`;
- record the current route list, persisted entities, and any baseline failures.

**Acceptance criteria:**

- no unapproved file is overwritten or deleted;
- baseline commands and their exact results are recorded;
- the task starts from the current branch, not an invented branch or stale
  snapshot.

**Stop condition:** If the baseline cannot be reproduced, report `BLOCKED` and
do not begin a broad refactor.

### R1. Persistence compatibility and shared recurrence

**Purpose:** Establish the domain behavior that later UI tasks depend on.

**Actions:**

- extend `RoutineItem` only as required for item-level metadata and recurrence;
- add `timesPerDay` or an equivalent compatible habit target field;
- add optional task ordering only if D-02 is approved;
- centralize due/active evaluation;
- add migration/default handling for existing stored shapes;
- add unit tests for the recurrence cases in Section 5.3.

**Expected files:** `src/types.ts`, `src/lib/date.ts`, `src/lib/storage.ts`,
`src/context/AppContext.tsx`, and the smallest appropriate test or validation
files.

**Acceptance criteria:**

- current v0.1.10-shaped records load unchanged;
- no user data is cleared or rewritten destructively;
- recurrence tests cover positive, negative, end, and exception cases;
- `npm run check` passes.

### R2. First-launch welcome and dark default

**Purpose:** Make the initial experience match the product promise.

**Actions:**

- add a compact welcome surface for a genuinely empty browser;
- provide Connect Google and Continue without Google paths using existing auth
  behavior;
- keep guest use available;
- skip onboarding when existing local data is present;
- define the canonical onboarding state through the storage boundary;
- change the first-launch theme fallback to dark while retaining explicit light
  and system choices.

**Expected files:** `src/App.tsx`, `src/main.tsx` only if necessary,
`src/context/ThemeContext.tsx`, storage/context files, and focused components.

**Acceptance criteria:**

- a new browser can reach Home without Google;
- a user with existing records is not interrupted;
- onboarding is keyboard accessible and has no hard dependency on a network;
- saved theme choices continue to win over the default;
- automated accessibility checks and build pass.

### R3. Complete Rituals

**Purpose:** Deliver the planned recurring ritual model without replacing the
existing day-based workflow.

**Actions:**

- add item-level description, category, tags, optional state, and recurrence
  editing;
- add item edit controls with clear save/cancel behavior;
- make reorder controls work with keyboard and pointer input;
- retain stable `sortOrder` values;
- filter items by the selected date using the shared recurrence predicate;
- preserve completion records when items are edited;
- handle removed items without displaying them as current obligations.

**Expected files:** `src/pages/Rituals.tsx`, `src/types.ts`,
`src/context/AppContext.tsx`, shared form components, and tests.

**Acceptance criteria:**

- a user can create, edit, reorder, and remove a ritual item;
- item metadata survives reload;
- a Monday-only item does not appear as actionable on Tuesday;
- an optional item remains distinguishable from a required item;
- the existing template-level day selection still works;
- no Google or server behavior is introduced.

### R4. Complete Habits

**Purpose:** Make the typed completion model real in the UI.

**Actions:**

- add a times-per-day field with a safe default of one;
- render accessible per-completion controls;
- add and remove individual completion indices;
- calculate today progress and streaks using target completion counts;
- apply recurrence filtering before calculating due/remaining totals;
- preserve old completion records as the first completion where no index exists;
- test weekday/weekend and partial-completion cases.

**Expected files:** `src/pages/Habits.tsx`, `src/types.ts`,
`src/context/AppContext.tsx`, shared components, and tests.

**Acceptance criteria:**

- a one-time-per-day habit behaves exactly as before;
- a three-times-per-day habit can show 0/3, 1/3, 2/3, and 3/3;
- individual completions can be undone;
- a partial day is not counted as a completed streak day;
- a non-due habit does not count toward today's due total;
- existing data remains visible after reload.

### R5. Calendar completion

**Purpose:** Close the documented Calendar-specific gap.

**Actions:**

- add the Mercury retrograde banner to Calendar using existing celestial data and
  settings;
- keep it informational, non-blocking, and accessible;
- verify it does not appear when the setting is off or the state is not
  retrograde;
- verify manual, Google, cosmic, and birthday source labels remain distinct.

**Expected files:** `src/pages/Calendar.tsx` and focused tests if available.

**Acceptance criteria:**

- banner visibility follows the setting and calculated state;
- calendar interactions remain usable with the banner present;
- no claim of scientific prediction or remote calendar write behavior is added.

### R6. Oracle settings and cache semantics

**Purpose:** Make the oracle controls consistent across Home and Settings.

**Actions:**

- expose Regenerate today's reading in Settings;
- centralize cache clearing for today's message, tarot, and horoscope values;
- reuse `useOracle` rather than duplicating fetch logic;
- show loading, success, and fallback states without exposing provider details;
- preserve the privacy boundary that user data is not sent to the worker.

**Expected files:** `src/pages/Settings.tsx`, `src/hooks/useOracle.ts`,
`src/lib/oracle.ts`, and focused tests.

**Acceptance criteria:**

- Settings and Home produce the same regeneration behavior;
- the current day's cached reading is actually invalidated;
- no secrets or personal records appear in the request payload;
- worker failure returns a usable local fallback;
- the action is available with `oracleEnabled` on and behaves clearly when the
  oracle is disabled.

### R7. Task ordering, if approved

**Purpose:** Complete the deferred Today/Someday ordering behavior only if D-02
is approved.

**Actions:**

- add a stable local `sortOrder` with backward-compatible fallback;
- support keyboard move-up/move-down controls;
- support pointer reorder only as an enhancement, not the sole path;
- persist order by task status;
- never reorder or write Google Tasks.

**Acceptance criteria:**

- ordering survives reload;
- keyboard users can perform every reorder action;
- Google-sourced items remain read-only and visually distinct;
- existing priority behavior remains available where no manual order exists.

**Stop condition:** If accessible ordering cannot be implemented cleanly in the
current slice, defer the entire task rather than ship a decorative drag handle.

### R8. Storage failure and recoverability

**Purpose:** Make browser storage failures visible and actionable.

**Actions:**

- have the storage boundary return or publish a write-failure result rather than
  silently swallowing it;
- show a calm warning when persistence is unavailable or quota-limited;
- distinguish an unsaved change from a successfully persisted change;
- keep the app usable for transient/read-only views;
- do not transmit local data to recover from a local storage failure.

**Acceptance criteria:**

- malformed reads fall back safely as they do now;
- simulated write failure produces visible user feedback;
- the user is told what may not have been saved;
- no data-clearing recovery action occurs automatically.

### R9. PWA and asset track, owner-gated

**Purpose:** Finish the installable experience only after D-01 is resolved.

**Actions if offline support is approved:**

- add a narrowly scoped service worker for the application shell and static
  assets;
- do not cache private Google responses or user data in a shared cache;
- provide offline state messaging for external integrations;
- add tests or a manual verification checklist for offline launch and return to
  online;
- update README and release truth so offline claims are accurate.

**Actions regardless of offline decision:**

- integrate existing app assets where the application design calls for them;
- verify manifest paths, icons, theme colors, and social metadata;
- do not invent a second visual language.

**Acceptance criteria:**

- if deferred, the application explicitly continues to disclaim offline use;
- if implemented, offline behavior is manually verified before claiming it;
- no shared cache contains user-specific or OAuth material.

### R10. Release evidence and documentation handoff

**Purpose:** Close the implementation loop without overstating readiness.

**Actions:**

- update only current-status documentation that the owner authorizes;
- preserve historical PRDs and architecture records;
- record completed tasks, deferred decisions, changed files, migrations, and
  validation results;
- run the full local validation set;
- provide an owner-run checklist for Pages, Google OAuth, third-party APIs,
  manual accessibility, storage failure, and account transfer.

**Acceptance criteria:**

- the implementation status is explicit: `CLEAR`, `AMBIGUOUS`, or `NEEDS INPUT`;
- no local pass is described as live production proof;
- no version bump occurs unless the owner identifies a shipped milestone;
- the Replit handoff includes exact commands and any checks not run.

---

## 8. Validation plan

### 8.1 Automated checks after every code task

Run from the repository root:

```bash
npm run check
npm run check:a11y
```

Run after any build-affecting task:

```bash
npm run build
git diff --check
```

Inspect the diff after each task. Do not use a successful command to justify a
scope expansion.

### 8.2 Data compatibility checks

Use fixtures or a controlled browser profile to verify:

- empty browser;
- existing guest data;
- existing Google-profile-namespaced data;
- records with missing optional v2 fields;
- malformed JSON;
- old completion records without an index;
- clear-data behavior;
- storage write failure.

No test may require a real Google account or a provider secret to validate local
behavior.

### 8.3 Manual interaction matrix

Before calling the code work complete, manually verify at minimum:

| Surface | Keyboard | Narrow mobile | Desktop | Reduced motion | Failure state |
|---|---|---|---|---|---|
| Onboarding | Required | Required | Required | Required | Google unavailable |
| Ritual item edit/reorder | Required | Required | Required | N/A | Persistence unavailable |
| Habit multiple completion | Required | Required | Required | N/A | Persistence unavailable |
| Calendar banner and events | Required | Required | Required | N/A | Google unavailable |
| Oracle regeneration | Required | Required | Required | N/A | Worker/API unavailable |
| Task ordering, if built | Required | Required | Required | N/A | Persistence unavailable |

Record failures as failures. Do not convert a skipped manual test into a pass.

### 8.4 Owner-run external checks

Replit must not fabricate these results:

- actual published Pages smoke test from the deployed URL;
- Google OAuth consent, token expiry, reconnect, disconnect, and account
  switching;
- Google Calendar and Tasks API behavior with the configured client ID;
- Tarot, horoscope, and oracle-worker availability from the deployed origin;
- manual screen-reader, zoom, and touch testing on real devices;
- Google Cloud OAuth verification or account ownership transfer.

The handoff must list these as `NOT RUN`, `BLOCKED`, or `PASS` with evidence.

---

## 9. Definition of done

The v0.2.0 completion slice is ready for owner review when:

- R0 baseline is recorded;
- R1 recurrence and persistence compatibility are tested;
- R2 onboarding and dark default are complete;
- R3 Rituals and R4 Habits satisfy their acceptance criteria;
- R5 Calendar and R6 Oracle controls are complete;
- R7 is either complete with D-02 evidence or explicitly deferred;
- R8 storage failure behavior is visible and documented;
- R9 has a recorded offline decision and accurate release language;
- R10 contains the final changed-file list and validation ledger;
- `npm run check`, `npm run check:a11y`, `npm run build`, and `git diff --check`
  pass for the final code state;
- no secrets, backend, Google write path, or unrelated branding expansion was
  introduced;
- the release remains labeled pre-production until the owner-run external gates
  are complete.

This definition of done does not include stable public release, OAuth approval,
or account ownership transfer. Those are separate gates.

---

## 10. Replit handoff format

At the end of each task, Replit should report:

```text
Task: R[number] [name]
Status: COMPLETE | DEFERRED | BLOCKED
Intent: [one sentence]
Changed files:
  - [path]
Preserved owner files:
  - [path or “none”]
Data compatibility: [how old records were handled]
Validation:
  - [command] [PASS/FAIL/NOT RUN]
  - [manual check] [PASS/FAIL/NOT RUN]
Open questions:
  - [question or “none”]
Next task: [R[number] or owner decision]
```

The final handoff should include a short user-facing summary, the complete
validation ledger, known limitations, and the exact owner actions still
required.

---

## 11. Source and authority notes

### Local evidence used

- `AGENTS.md`, canonical repository guide and current architecture boundary;
- `README.md`, current purpose, feature summary, and pre-production status;
- `src/types.ts`, current domain shapes and compatibility fields;
- `src/context/AppContext.tsx` and `src/lib/storage.ts`, state and persistence;
- `src/pages/Rituals.tsx`, `Habits.tsx`, `Calendar.tsx`, `Today.tsx`,
  `Someday.tsx`, and `Settings.tsx`, current user-facing behavior;
- `src/lib/date.ts` and `src/lib/oracle.ts`, recurrence and oracle boundaries;
- `docs/PRD-v1.0.md` through `docs/PRD-v4.0.md`, original vision and historical
  evolution;
- `docs/ROADMAP.md` and `docs/GAP-CLOSURE-PLAN.md`, documented remaining work;
- `docs/RELEASE-TRUTH-BASELINE.md` and `docs/RELEASE-REVIEW-RECORD.md`, current
  evidence limits and release gates.

### Authority order

When sources disagree, use this order:

1. owner instructions in the current task;
2. `AGENTS.md`;
3. current source, package manifest, lockfile, and active workflow;
4. current release truth and handoff records;
5. README and roadmap current-status sections;
6. historical PRDs, architecture documents, and session entries.

Historical documents are retained because they explain why the product became
client-only and why terminology or scope changed. They are not permission to
reintroduce superseded architecture.

---

## 12. Notion reconciliation and implementation disposition

This appendix incorporates the implementation-relevant findings from the
private Notion project hub, the associated LifeTrkr catalog record, the
Jamie-to-Kieran handoff record, and the nested LifeTrkr deliverables database.
The exact private Notion locators, workspace structure, page IDs, and copied
private source text are intentionally excluded from this public-safe PRD. A
fuller local-only provenance packet is maintained outside the repository.

### 12.1 Source coverage and evidence tier

The Notion pages were fetched read-only on August 26, 2026. Their substantive
content was last updated or captured June 21–23, 2026. The repository baseline
used for reconciliation is v0.1.10. Therefore, Notion status labels are useful
historical delivery evidence but are not current release proof.

| Source | Observed content | Evidence treatment |
|---|---|---|
| Project Hub | Product brief, thesis, design direction, architecture pivot, roadmap snapshot, security note, operating notes, and a nested delivery-ledger reference | Confirmed source context; current source and release records supersede its dated status claims. |
| LifeTrkr catalog record | Metadata, aliases, canonical-hub relationship, private/publicity note; blank body | Confirmed metadata only; no additional runtime requirement. |
| Jamie-to-Kieran handoff record | Handoff acceptance criteria and ownership metadata; blank body | Confirmed external deliverable; not an application feature. |
| Build-out Deliverables database | 22 active rows and schema for phase, status, priority, category, systems, dependencies, acceptance criteria, artifact URL, and target date | Confirmed mutable delivery ledger; reconcile row-by-row with current code and `docs/HANDOFF.md`. |

The current database-view snapshot contains 14 `Done`, 3 `In Progress`, 2 `Not
Started`, and 3 `Deferred` rows. A separate SQL materialization returned an
older/different row set, so the view result is the status snapshot used here;
re-fetch before any future status write. “Done” means the source’s acceptance
criterion was recorded as delivered; it does not negate the deeper completion
gaps in this PRD.

### 12.2 Findings that affect this PRD

#### A. The Notion source confirms the product contract

The sources reinforce the current product meaning: a father-daughter,
Kieran-centered personal life OS for rituals, habits, calendar visibility,
today tasks, a someday backlog, and a small daily oracle. The intended feeling
is Moonlit Hearth: warm, calm, softly mystical, cat-adjacent, and personally
meaningful, without turning the primary interface into an OverKill Hill brand
surface. These statements support Sections 2, 4, and 5; they do not add a new
runtime subsystem.

#### B. The old Notion/Express architecture is explicitly not a missing feature

The database contains deferred rows for Notion product schemas, an Express
backend API shell, and Notion API proxy routes. The Project Hub records that the
architecture pivoted away from those elements and that Notion is the project
hub/delivery ledger, not the application database.

Disposition: do not copy the Notion database into the runtime, add a Notion
connector, introduce Express, or create server-side OAuth. Those are
historical/deferred requirements and conflict with the canonical client-only
repository boundary. If cross-device persistence becomes desirable later, it
requires a new owner-approved architecture and privacy decision.

#### C. V1 delivery rows confirm the baseline, not full completion

The rows for the Home dashboard, day-of-week routines, habits, Today tasks,
Someday backlog, calendar mock, design tokens, and app shell are recorded as
Done. Current source inspection shows that the V1 surfaces exist, while the
following deeper behaviors remain incomplete or unproven: item-level routine
metadata and recurrence filtering, habit target counts and recurrence
filtering, Calendar Mercury presentation, Settings oracle regeneration,
manual task ordering, storage failure feedback, and manual/live integration
evidence. These are already represented by G-03 through G-12 and remain in
scope.

#### D. Google delivery status must be split into code, configuration, and proof

The current database view marks Google Cloud OAuth setup and Google Calendar
read-only integration `In Progress`, while the current repository contains the
client-side GIS, Calendar, and Tasks code. The correct interpretation is:

1. integration code is present;
2. environment and owner configuration are not established by repository
   evidence; and
3. real-account lifecycle behavior is not proven until the owner runs the
   external smoke-test matrix.

Replit must not mark Google delivery complete because TypeScript and Vite
builds pass.

#### E. The Notion security warning exposes a documentation authority conflict

The Project Hub records a prior direct-browser Anthropic key exposure and
directs migration to the oracle worker URL. Current `src/lib/oracle.ts` uses
`VITE_ORACLE_WORKER_URL` only, but repository guidance and historical/session
artifacts still contain conflicting direct-browser examples and environment
names. This makes the guidance unsafe for an implementation agent even though
the current runtime source follows the safer worker path.

Add this as a release-blocking documentation reconciliation in R0/R10:

- canonicalize `AGENTS.md`, current README/PRD guidance, and any active Replit
  instruction so the worker URL is the only supported application path;
- label or retire historical direct-browser examples and test fixtures so they
  cannot be mistaken for current implementation guidance;
- scan application source and the production bundle for direct key references;
- verify the worker contract and fallback behavior separately; and
- never claim “no key exposure” based only on a repository-wide grep that also
  includes intentionally historical documentation.

This is a confirmed documentation/authority conflict and a proposed repair
path; it is not evidence that a live secret value exists in the repository.

#### G. Existing Notion mirror material is not yet safe or complete

The worktree also contains untracked `docs/notion-mirror/` mirror material that
includes private Notion links and was not part of the tracked repository
baseline. Its README says 23 deliverables while the latest database-view
snapshot returned 22 active rows, so it must not be treated as a complete or
current repository artifact. Historical tracked documentation also contains
private hub locators. R11 must either remove/redact those locators before any
public commit or keep the full mirror outside the repository as a private local
artifact. The untracked mirror material was preserved unchanged during this
planning pass because it may be owner work.

#### F. Handoff is an external completion gate

The handoff record’s acceptance criteria cover GitHub, Replit, Notion strategy,
Google Cloud ownership, OAuth credentials, and secret rotation/re-entry. The
current `docs/HANDOFF.md` provides a more detailed checklist, but account
transfer, secret re-entry, OAuth setup, and owner-controlled smoke testing are
still external actions. They must not be modeled as user tasks inside
LifeTrkr, and they must not be declared complete by Replit.

### 12.3 Notion-informed additions to the multi-task plan

#### R11. Public-safe product context and documentation reconciliation

**Purpose:** Preserve the useful product brief and provenance without making
private Notion project-management material part of the app runtime or public
repository.

**Inputs:** The existing `Origin` and Settings/About surfaces, current README,
`docs/HANDOFF.md`, the current release records, and the public-safe findings in
this appendix.

**Implementation tasks:**

1. Review the existing Origin/About copy against the confirmed product
   contract: Kieran-centered personal tool, browser-local data, optional
   read-only Google integrations, Moonlit Hearth, and pre-production status.
2. Keep only public-safe provenance in the app. Exact private Notion links,
   workspace/database names, account-transfer instructions, secret details,
   and internal delivery statuses do not belong in the user interface.
3. Add or revise a concise About/Origin disclosure only if it improves user
   understanding; do not create a second project-management dashboard inside
   LifeTrkr.
4. Reconcile `README.md`, `docs/ROADMAP.md`, `docs/HANDOFF.md`, and the current
   PRD so they agree on v0.1.10, Someday terminology, client-only architecture,
   worker-based oracle boundary, and the limits of live evidence.
5. Preserve historical PRDs and session records as historical material. Mark
   superseded architecture and stale status claims rather than silently
   rewriting history.

**Acceptance criteria:**

- no public repository file contains the supplied private Notion URLs, page IDs,
  database IDs, or copied private workspace structure;
- public app copy contains only the owner-approved provenance and product
  boundary;
- current docs no longer instruct Replit to build the superseded Notion/Express
  architecture;
- the documentation set distinguishes `V1 delivered`, `code present`,
  `configured`, `externally verified`, and `owner complete`; and
- `git diff --check`, `npm run check`, `npm run build`, and the repository’s
  accessibility check pass when code or UI changes are made.

#### R12. Handoff-readiness and delivery-ledger crosswalk

**Purpose:** Turn the Notion handoff acceptance criteria and deliverables
ledger into a reviewable owner handoff without copying Notion into the app.

**Implementation tasks:**

1. Crosswalk each still-relevant Notion delivery row to a current repository
   file, current code behavior, or explicit external gate.
2. Update `docs/HANDOFF.md` only where the current repository evidence supports
   a correction. Do not mark GitHub, Replit, Google Cloud, secrets, or OAuth
   transfer complete from local evidence.
3. Add a handoff evidence table containing status, evidence source, owner, and
   next check for configuration, live OAuth, deployment, accessibility, storage
   failure, and account isolation.
4. Keep the Notion delivery ledger as a private project-management source;
   produce a public-safe documentation crosswalk rather than an app-side sync.

**Acceptance criteria:**

- every handoff item is `confirmed`, `inferred`, `proposal`, or `unknown` with
  an explicit next check;
- no owner-controlled transfer or secret operation is simulated or performed
  by Replit;
- the final handoff record identifies the remaining external gates; and
- a clean local build is not described as proof of deployment, OAuth, or
  ownership transfer.

### 12.4 Explicit no-copy boundary

The request to consider copies of the Notion material does not authorize a
runtime Notion mirror. The implementation boundary is:

| Notion material | Where a copy may live | Where it must not live |
|---|---|---|
| Product purpose, thesis, design direction, and public-safe provenance | Current PRD, README/About/Origin after owner review | Raw private Notion export or internal workspace structure |
| Deliverable names, acceptance criteria, and current evidence crosswalk | Public-safe documentation, with private locators omitted | End-user task/habit/calendar data model |
| Handoff checklist | `docs/HANDOFF.md` and owner-run release records | Runtime UI or automated account-transfer code |
| Notion database schemas for the old backend | Historical/deferred notes only | Client runtime persistence, Express, or Notion API proxy |
| Security remediation history | Canonical security/release guidance and validation records | Secrets, copied credentials, or misleading “all clear” claims |

### 12.5 Additional owner decisions

| ID | Decision | Recommended default | Why it matters |
|---|---|---|---|
| D-07: Public provenance | Retain a short public-safe Origin/About story | Keep the existing story but review its level of personal detail before broader promotion. | Notion records the project as private and future-public; the app should not accidentally publish internal context. |
| D-08: Documentation security repair | Correct active guidance now | Make the worker-only oracle path canonical before any Replit execution. | Conflicting instructions can reintroduce the key-exposure pattern. |
| D-09: Notion runtime mirror | Do not implement in v0.2.0 | Keep Notion as project-management source only. | A mirror would violate the client-only boundary and add privacy, sync, and ownership complexity. |
| D-10: Handoff execution | Owner-controlled after technical gates | Use `docs/HANDOFF.md` as the checklist; do not automate account transfer. | The actions affect external accounts, credentials, and recovery. |

### 12.6 Revised completion condition

The v0.2.0 completion effort is complete only when R0–R10 are complete or
explicitly deferred with evidence, and R11/R12 have either been completed or
recorded as owner-approved documentation-only deferrals. The result must
preserve the client-only architecture, keep the public/private boundary
explicit, reconcile the oracle security guidance, and leave the external
handoff gates visible.
