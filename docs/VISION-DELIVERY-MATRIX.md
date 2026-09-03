# LifeTrkr — Vision-to-Delivery Matrix

**Current as of:** September 3, 2026  
**Application version:** `v0.1.10`  
**Reviewed source commit:** `393c2aa74766d0572943306e372f5e35ec6cf950`  
**Release decision:** `approve-with-limits` for controlled pre-production; public stable
and `v1.0.0` approval remain deferred

This is the current crosswalk between the product vision, later refinements, the
behavior present in the source tree, and the evidence still required. It is the
authoritative status matrix for delivery claims. The release baseline and review
record remain the authority for frozen artifact evidence and review procedure;
this matrix explains how those claims map back to product intent.

## Evidence classifications

- **Source-confirmed** — present in the current source/configuration. This does
  not claim a real account, device, provider, or stable-release result.
- **Runtime-tested** — exercised in a local harness, development preview, or
  bounded public transport check. The environment and limits are stated.
- **Owner-controlled** — requires Jamie/Kieran, a real account, an external
  provider, a physical device, or an ownership action unavailable to an agent.
- **Intentionally deferred** — deliberately remains outside the current
  `v0.1.10` release scope or is waiting on an explicit product decision.
- **Out of scope** — explicitly excluded by a settled architecture or product
  boundary, not an accidentally missing feature.

## Authority map

| Claim type | Current authority | How older material is used |
|---|---|---|
| Current source behavior, routes, types, and data boundary | `src/`, `README.md`, `replit.md` | Older code listings are historical when they conflict |
| Vision, principles, and original requirements | `docs/PRD-v3.0.md` | Intent only; its dated architecture/type listings are not current |
| Planning and deferred sequencing | `docs/ROADMAP.md`, `docs/PRD-v5.0.md` | Plans do not prove delivery |
| Current evidence and release decision | `docs/RELEASE-TRUTH-BASELINE.md`, `docs/RELEASE-REVIEW-RECORD.md` | Frozen addenda stay tied to their stated candidate |
| Owner actions and transfer gates | `docs/HANDOFF.md`, `docs/GOOGLE-READONLY-EVIDENCE.md`, `docs/ACCESSIBILITY-CHECKLIST.md`, `docs/DEPLOYMENT-CHECKLIST.md` | Existing checklists are reused; no duplicate task is created |

## Capability crosswalk

| Capability | Original vision | Later refinement | Current source behavior | Classification | Evidence now | Decisive evidence / expiry trigger |
|---|---|---|---|---|---|---|
| Client-only personal life OS | Browser-owned records; no publisher ownership (`PRD-v3.0` §§4–5) | Removed Express, Notion database, and server OAuth | React/Vite static SPA; browser storage; no application server or database | **Source-confirmed** | `docs/ARCHITECTURE.md`, `src/context/AppContext.tsx`, `src/lib/storage.ts` | Clean checkout still has no backend runtime. Revisit if a server, database, sync layer, or data flow is added. |
| Core surfaces and navigation | Home, rituals, habits, calendar, today, archive (`PRD-v1.0` / `PRD-v3.0`) | `Archive` became `Someday`; Settings and Origin were added | `#/`, `/calendar`, `/today`, `/someday`, `/rituals`, `/habits`, `/settings`, `/origin`, `/privacy`; mobile BottomNav and desktop SideNav | **Runtime-tested** | Current route table; local preview and published shell/asset checks | Open every route after any routing, base-path, or deployment change. |
| Local routines, habits, and tasks | Daily rituals, recurring habits, active tasks, backlog | Recurrence, categories, descriptions, and Someday terminology | Reducer-backed local records with recurrence fields, category/tag UI, completion state, explicit task order, multi-target habit completion, and `backlog`/`today`/`done` task status | **Source-confirmed** | `src/types.ts`, pages/components, scope regression checks | Owner browser journey must cover create/edit/complete/delete/reload and malformed or unavailable storage. Any schema, reducer, or persistence-key change expires this claim. |
| Manual calendar | Calendar visibility alongside Google events | Manual CRUD retained as a local fallback | Manual calendar records persist locally; moon/celestial layers render alongside them | **Source-confirmed** | `src/pages/Calendar.tsx`, storage inventory, local calendar types | Browser CRUD/reload journey and timezone/DST checks remain part of the release gate. |
| Recurrence and date visibility | Day-of-week templates and recurring habits | Full recurrence editor and shared active-date evaluator | `RecurrenceEditor`, `isActiveToday()`, and calendar recurrence evaluator are implemented | **Runtime-tested** | August 27 UTC-controlled matrix: weekday, specific-day, weekly interval cases passed | Re-run when date semantics, timezone, DST, recurrence types, or evaluator logic change. |
| Celestial layer | Moon phase, seasons, Mercury retrograde, daily awareness | Julian-date math, deterministic cosmic data, Calendar and Home surfaces | Local moon/season/Mercury calculations and settings-controlled banners are present | **Runtime-tested** | August 27 active/inactive Mercury and rendered visibility matrix passed | Re-run when celestial tables, date semantics, or display predicates change. |
| Google Calendar and Tasks | Read-only Google visibility in Calendar, Home, Today, and backlog | GIS token model, pagination, explicit loading/error/empty states | Direct browser GET paths use read-only scopes; UI has connected and fallback states | **Owner-controlled** | Local API harness passed pagination, empty responses, typed errors, and simulated namespaces | Owner-run test account must cover consent, profile, populated/empty data, refresh, expiry/reconnect, disconnect, and two-account isolation. Any scope, GIS, API, or account-setting change expires source evidence. |
| Google write boundary | “Read, don't write” principle | Removed prior write-scope/write-helper risk | Scopes are `calendar.readonly` and `tasks.readonly`; no Google mutation helpers | **Source-confirmed** | `src/constants.ts`, Google client modules, local harness | Real consent/API journey confirms runtime behavior. Any added write scope or mutation path is a release-blocking change. |
| Local oracle fallback | Daily oracle companion | Three-layer tarot, optional horoscope, optional worker wording | Tarot/celestial fallback works locally; daily cache and regeneration are wired; horoscope failure is isolated | **Runtime-tested** | August 27 fallback, cache, horoscope, payload, and rendered-card checks | Controlled-clock date rollover/regeneration and provider availability checks expire on oracle/date/cache changes. |
| Optional Claude oracle wording | AI-generated 2–3 sentence daily message | Worker-only provider boundary; no browser key | Worker URL is optional; absent/failed worker falls back to tarot meaning | **Owner-controlled** | Simulated worker contract, privacy payload, fallback, and bundle scans passed | Owner must deploy/configure the worker and record a redacted live response/CORS/secret-store review. Never add a provider key to `VITE_` or the client bundle. |
| PWA shell and offline behavior | Installable app and offline shell | Narrowed claim: cache shell/assets only, not Google or external oracle data | Manifest and versioned service worker are present; local records remain browser-owned; network services pause | **Owner-controlled** | Build/artifact checks and service-worker regression/transport checks passed | Physical iOS and Android runs must prove offline reload, install/standalone launch, and cache replacement. Any worker, asset, or cache change expires this evidence. |
| Brand and Moonlit Hearth presentation | Warm mystical dark, not goth or OKHP3-branded | App icon/banner/OG metadata and subtle cat accent | Theme system defaults to dark for new profiles; cat accent, manifest icons, and OG metadata are wired | **Source-confirmed** | Current source/assets and artifact inspection | Visual review at narrow and desktop widths; any asset or theme change requires another artifact/accessibility check. |
| Privacy and consent readiness | Explain local storage and Google access before public use | Published privacy route and owner OAuth checklist | `#/privacy` is linked from Settings and can be read before onboarding; exact read-only scopes are documented | **Runtime-tested** | Published route/shell transport check and source review | Owner must confirm consent-screen configuration and any Google verification decision. Privacy, scope, origin, or data-flow changes expire this status. |
| Accessibility | Calm, usable mobile-first interface | Automated source heuristic plus manual matrix | Accessible names/roles and reduced-motion/source checks exist; manual phone/desktop matrix is not complete | **Owner-controlled** | `npm run check:a11y` passes the source heuristic | Complete `docs/ACCESSIBILITY-CHECKLIST.md` on narrow and desktop viewports. Any shared control, dialog, navigation, or CSS change expires results. |
| Storage recovery | Browser is the database without silent loss | Write read-back, visible warning, retry of in-memory snapshot | Malformed reads are tolerated; simulated throwing and silent non-persisting writes surface recovery guidance | **Owner-controlled** | Storage-failure harness passed simulated states | Owner-run quota/private-mode browser test must confirm visible guidance and recovery. Any storage/reducer change expires the result. |
| Kieran ownership handoff | Transfer the project to Kieran | Fork-not-transfer warning and account/service checklist | Reversible source/deployment preparation is complete; ownership remains with Jamie | **Owner-controlled** | `docs/HANDOFF.md` records completed preparation and open owner gates | Kieran authorizes and completes GitHub transfer, Replit fork, secret re-entry, GCP IAM/client work, and final smoke/recovery rehearsal. |
| Task ordering with keyboard equivalent | PRD-v4 §6.4 drag reorder | Next-release decision narrows this to local ordering plus a non-drag keyboard path | Today/Someday persist order; native drag is a convenience and labelled arrow controls are the accessible path | **Source-confirmed** | `src/lib/taskOrdering.ts`, Today/Someday, scope regression checks | Owner browser journey must cover reload, status moves, empty buckets, and keyboard operation. |
| Multi-target habit completion | PRD-v3 recurrence type reference | Next-release decision limits this to 1–12 daily repetitions | Indexed completion records support partial progress; legacy unindexed records mean repetition 1 | **Source-confirmed** | `src/lib/habitCompletion.ts`, Habits, scope regression checks | Owner browser journey must cover partial/full completion, reload, timezone date boundary, and account switch. |
| Ritual item metadata, optional state, and ordering | PRD-v3 item metadata reference; PRD-v4 §6.4 polish | Next-release decision approves title/time/description/optional plus persisted ordering; full item recurrence/category/tag metadata is deferred | Create/edit UI exposes the approved lightweight metadata; labelled keyboard order controls persist `sortOrder` | **Source-confirmed** | `src/types.ts`, Rituals, scope regression checks | Owner browser journey must cover create/edit/complete/reload and optional items without assuming altered completion math. |
| Item-level recurrence overrides | PRD-v3/v4 recurrence ideas | Explicitly deferred | Parent template/habit recurrence remains; no child override editor is claimed | **Intentionally deferred** | `docs/PRODUCT-SCOPE-DECISION.md` | Revisit only with a concrete daily-use case and a new acceptance/test boundary. |
| End-of-day review | PRD-v4 §6.3 optional | Explicitly deferred | No evening mode, reflective prompt, or review dashboard is in the release claim | **Intentionally deferred** | `docs/PRODUCT-SCOPE-DECISION.md`, Roadmap | Revisit as a separate insight-surface decision, not as a missing completion feature. |
| Notion persistence/synchronization | Early PRD-v1/v2 proposal | Deliberately removed during client-only pivot | Notion is project-hub/mirror context only; app data is not synchronized to Notion | **Out of scope** | Architecture decision and README/replit.md boundary | Reconsider only through an explicit architecture/product decision; do not infer it from repository mirrors. |
| Google event/task mutation | Early broad integration ideas | Locked to least-privilege, read-only access | Local task/calendar actions stay local; Google resources are not created or edited | **Out of scope** | Scope list and absence of mutation helpers | Requires a new product/privacy/security decision, not a silent extension of the current release. |
| Public stable / `v1.0.0` release | Stable, Google-verified, Kieran-owned release | Evidence-first bounded release process | Current candidate is pre-production only | **Owner-controlled** | Review record: `approve-with-limits`; stable claim explicitly deferred | All owner-run live/manual gates and ownership conditions must close. Any release-tree, route, persistence, scope, provider, workflow, or deployment change expires the review. |

## Current release boundary

The current claim is deliberately narrow:

> LifeTrkr `v0.1.10` is a client-only, browser-local personal app with a
> source/build-checked UI, local oracle fallback, and read-only Google code paths
> that are ready for owner-run testing. It is approved with limits for controlled
> pre-production use, not declared stable or `v1.0.0`.

The remaining gates are already covered by existing records:

1. **Google account lifecycle and isolation:** `docs/GOOGLE-READONLY-EVIDENCE.md`
   and the Google section of `docs/HANDOFF.md`.
2. **Accessibility:** `docs/ACCESSIBILITY-CHECKLIST.md`.
3. **Real browser storage failure:** `docs/HANDOFF.md` risk register and
   `docs/RELEASE-REVIEW-RECORD.md`.
4. **PWA/device verification:** `docs/DEPLOYMENT-CHECKLIST.md`.
5. **Optional worker activation:** `docs/RELEASE-TRUTH-BASELINE.md` and the
   oracle section of `docs/HANDOFF.md`.
6. **Ownership transfer and final rehearsal:** `docs/HANDOFF.md`.

No credential values, tokens, account identifiers, or personal records belong in
this matrix or its linked evidence.