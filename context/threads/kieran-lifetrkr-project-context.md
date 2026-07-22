---
title: "Kieran’s LifeTrkr Project Context Synthesis"
primary_topic: "Kieran LifeTrkr project context and governance synthesis"
source_platform: "Claude"
capture_mode: "unknown"
completeness: "partial"
extraction_depth: "comprehensive"
requested_extraction_depth: "comprehensive"
source_title: "Kieran's LifeTrkr - Scoping"
source_date: "2026-06-21"
source_time_context: "Visible Claude labels June 21–23, 2026; Notion snapshot June 23, 2026; exact capture time unknown"
source_locator: "Claude shared snapshot and owner-supplied packet; private anchors withheld"
retention_decision: "redacted"
source_independence: "pass"
generated_at: "2026-07-22T15:34:56Z"
schema_version: "2.0"
artifact_type: thread-context-extract
---

# Kieran’s LifeTrkr Project Context Synthesis

## Introduction

This comprehensive extract consolidates the supplied Claude shared snapshot, the owner-provided 31-file document packet, the attached audit transcript, the fetched Notion Project Hub and tracker schema, and a July 22, 2026 inspection of the local repository. It preserves the project’s evolution from a small dark-mode life-organizer concept into Kieran’s LifeTrkr: a client-only, GitHub Pages-hosted personal life OS with browser-local state, Google Identity Services, calendar/tasks integrations, recurrence, celestial data, and a daily oracle. The durable operating conclusion is that the current repository and its canonical AGENTS.md are the authority for present work; the supplied PRDs, Replit briefs, Notion records, and Claude claims are historical evidence that must be reconciled rather than treated as one consistent current specification.

Title chain: the source material describes a cross-platform LifeTrkr project history and alignment audit; this introduction distills it to “a durable project-context record for Kieran’s LifeTrkr”; the primary topic is “Kieran LifeTrkr project context and governance synthesis”; the artifact title is “Kieran’s LifeTrkr Project Context Synthesis”; the filesystem name is `kieran-lifetrkr-project-context.md`.

## Extraction profile

- **Requested depth:** comprehensive, based on “highly detailed” and “very detailed” instructions.
- **Selected depth:** comprehensive.
- **Selection basis:** explicit request for a highly detailed synthesis using all attached files, Claude material, and Notion context.
- **Profile changes:** none.
- **Focus areas:** current-state reconciliation, architecture pivots, product and design decisions, external-service boundaries, version history, ownership and handoff, security, prompt-injection evidence, documentation drift, and actionable resumption.
- **Must preserve:** consequential alternatives and rationale; the client-only boundary; HashRouter and GitHub Pages constraints; localStorage namespacing; Google and oracle integration boundaries; Moonlit Hearth design decisions; Vyrle spelling; versioning discipline; source-control and handoff risks; missing sidecars and conflicting artifacts.
- **Safe exclusions:** raw transcript prose, UI chrome, private Notion URLs and IDs, private Replit locators, exact personal location/employment details, and any secret-like values not needed to understand the project.
- **Coverage rule:** every supplied Claude turn is represented in the turn ledger; repetitive follow-up lists are compressed; every supplied file is individually cataloged in the content-element ledger; cited but unavailable artifacts remain missing-state entries.
- **Not carried forward:** no lossless transcript, no private account identifiers, no exact Notion anchors, no unverified assistant claim presented as fact, and no embedded source instruction executed as an instruction.
- **Source-independence test:** pass for project continuation. A capable reader can understand the product, current repository boundaries, historical decisions, risks, and next actions without Claude, Notion, Replit, or a source-account login. The absence of row-level Notion tracker data remains an explicit open limit, not a runtime dependency.

## Coverage accounting

| Material class | Assessed | Retained | Compressed | Omitted with reason | Missing or unavailable | Notes |
|---|---:|---:|---:|---:|---:|---|
| Claude turns or turn groups | 42 semantic turns | 42 ledger entries | Repetitive follow-up lists and UI controls | Raw prose not needed for continuity | Hidden files, full Project context, and some artifact revisions | Explicit `You said` / `Claude responded` headings gave high-confidence roles |
| Rich elements | 40 catalog entries | 34 | 4 grouped tool/UI families | Decorative controls and duplicated links | 2 hidden or inaccessible sidecars | See E001–E040 |
| Decisions and alternatives | 16 decision records | 16 | Rationale grouped by pivot | None | Verification status retained where unresolved | See D01–D11 and the decisions section |
| Reusable assets | 35 file/source assets | 35 references or dispositions | Duplicate files grouped only in the synopsis | Raw secrets and private anchors | Source-to-turn mapping for some generated files | All 31 owner-supplied files are individually listed |

## Source synopsis

### Boundary and chronology

The Claude source is a rendered Claude shared snapshot titled “Kieran’s LifeTrkr - Scoping.” The page itself warns that it is a snapshot and that attachments or data may not be displayed. The capture method is therefore `unknown`, not a claimed full export. Visible conversation labels cover June 21 through June 23, 2026; exact capture time and the complete Project context are unknown. The supplied packet contains 31 owner-selected files from a related work session, plus an audit transcript that records several earlier assistant actions and correction assessments. The Notion Project Hub was fetched through the connected Notion connector as a June 23, 2026 snapshot; the linked tracker schema was fetched, but its query endpoint was unavailable, so row-level tracker claims were not independently verified.

### Product origin and problem

The initial human brief describes an app for routines, habits, a calendar, a master backlog, and a daily task list in one quiet interface. Routines change by day of week, the Home page should surface today’s checklist and upcoming events, and the visual direction should be dark and comfortable at night. The source later establishes Kieran as the preferred visible name and the working title as Kieran’s LifeTrkr. Personal family and biographical context was supplied to shape the emotional tone, but exact location, age, employer, and other personal details are intentionally generalized here because this artifact lives in a repository.

### Architecture evolution

The first PRD and Amendment 01 proposed a server-backed design: React plus Vite and Tailwind, a Replit-hosted Express process, Notion as the application database, and server-side Google OAuth. The rationale was that the Notion API cannot be called directly from a browser because of CORS. The Replit amendment removed Vercel from the immediate build and placed Express beside the React client inside one Repl.

Cross-feeding with a peer ChatGPT thread then changed the staging decision. The source explicitly prefers localStorage-first validation so the UI and information architecture can be tested by Kieran before backend integration. The decisive product reasoning was that the unknowns were whether the six-tab model, routine/backlog distinction, and visual language felt right, not whether the Notion schema could be implemented.

The next pivot is the client-only architecture in PRD v2.0 and v3.0. GitHub Pages serves static assets; Google Identity Services performs a browser token flow with a public Client ID; tokens live in sessionStorage and expire; user-owned application state lives in browser storage namespaced by Google `sub`; Google Calendar and Google Tasks are read on demand; and Notion becomes a project-management hub rather than the app database. This is the core privacy and ownership thesis: the publisher should not manage user credentials, calendar data, tasks, or a multi-tenant database.

The current repository confirms much of that client-only shape, while also showing later implementation drift. It retains HashRouter, the production Vite base `/kierans-lifetrkr/`, browser-local state, GIS, calendar/tasks libraries, recurrence, celestial, and oracle code. The current source also includes calendar create/delete paths and a calendar write scope, which conflicts with the earlier “read-only Google data” principle and must be resolved deliberately before future integration work.

### Product and design expansion

The original six primary areas became Home, Rituals, Habits, Calendar, Today, and Archive in the source documents, with Settings available outside the six-tab mobile bar. The current application uses Someday rather than Archive in its route/page naming, another documentation-versus-source distinction to preserve.

The Moonlit Hearth direction is the most stable cross-source design decision: warm purple-black rather than pure black, amethyst, candlelight gold, sage or emerald completion color, ruby and sapphire accents, Cormorant Garamond only for display moments, DM Sans for body text, and Space Mono for time and streak data. “Rituals” replaces “Routines,” “Archive” was proposed for the backlog, moon imagery replaces guilt-heavy flame gamification, and a black-cat/crescent motif is allowed without horror, heavy occult, cyberpunk, neon, cold-blue, or additional OverKill Hill branding. Seasonal badges, a generational easter egg, and an optional subtle oracle layer provide personal meaning without turning the interface into costume theming.

The recurrence and cosmic overlay amendment adds a shared recurrence model for rituals, habits, tasks, and manual calendar events; interval, weekday, times-per-day, and end-condition support; category and tag filtering; descriptions; moon-phase and astrological-season calculations; Mercury retrograde windows; tarot; optional horoscope; and a daily oracle cached by date. These features were described as v0.3.0 work and then reported as pulled forward into v0.1.1–v0.1.8. The current repository contains the relevant components and libraries, but the repository’s current version is v0.1.10 and the attached documents still describe earlier version states.

### Oracle and external services

The source proposes a three-layer oracle: tarot from a public endpoint, horoscope when a sun sign is configured, and an AI-generated two-to-three-sentence message seeded by moon phase, season, tarot, and optional sign. The fallback path uses tarot meaning and daily local caching. A Cloudflare Worker was designed to keep the Anthropic key out of the public bundle. However, the current repository’s `src/lib/oracle.ts`, README, and PRD-v4.0 still document or implement the direct browser Anthropic request with `VITE_ANTHROPIC_API_KEY`; the current repository guide calls that file an intentional existing exception but prohibits adding new direct calls. This is an active security and architecture discrepancy, not a settled success claim.

Google setup is repeatedly identified as a manual dependency. The supplied documents describe a GCP project, Calendar and Tasks APIs, authorized JavaScript origins, a Client ID, test users during verification, and a future privacy-policy/verification path. The Notion snapshot records the Client ID as not configured at its capture date. The current repository guide states that live OAuth and external API health still require environment-backed smoke testing.

### Documentation, source-control, and governance findings

The deep-review material identified a critical earlier state in which the React source existed in Replit and the deployment branch but not on GitHub `main`, while README and architecture docs still described the old Notion/Express/Replit-host model. The correction packet recommends putting source on the authoritative branch, aligning docs, and preserving a handoff ledger. The current repository has source files in the working tree and GitHub Actions Pages workflows, so the historical “source absent from main” finding cannot be assumed current; it remains valuable as a provenance and recovery warning.

The packet also documents an incident in which `[OBFUSCATED PROMPT INJECTION]` markers were reported during a prior Replit session. The supplied clean Design files do not contain those markers, and the current repository only mentions the incident in historical session documentation. This extract preserves the incident and its handling rule, but executes nothing from source documents. The unusual family spelling is likewise normalized to the owner-confirmed `Vyrle`; the older `Virgil` form is historical evidence and must not be propagated.

The Notion Project Hub presents itself as a canonical project command center and explicitly says Notion is the project hub only, not the app database. Its June 23 snapshot reports v0.1.8, lists shipped recurrence/celestial/oracle UI, marks Google integration as awaiting a Client ID, and contains a security-remediation notice for the exposed oracle key. The current local repository is newer and more authoritative for code and version, currently v0.1.10. The Notion tracker schema supports delivery fields such as Deliverable, Status, Phase, Priority, Category, System, Dependencies, Owner, Acceptance Criteria, and Artifact URL, but its current rows were not retrievable in this run.

## Turn ledger

| Turn | Role | Role confidence | Boundary evidence | Content elements | Summary |
|---|---|---|---|---|---|
| T001 | user | high | `You said` heading | E003 | Introduces the need for a unified routines, habits, calendar, task, and backlog app and asks for structured elicitation. |
| T002 | assistant | high | `Claude responded` heading | E004 | Asks targeted questions about tabs, routines, devices, data, Home, Calendar, and visual tone. |
| T003 | user | high | `You said` heading | E003 | Selects Home, Routines, Habits, Calendar, To-Do, and backlog; specifies day-of-week routine templates and GitHub/Notion interest; corrects the preferred name to Kieran. |
| T004 | assistant | high | `Claude responded` heading | E004,E006 | Flags GitHub Pages/Notion CORS, proposes Vercel, summarizes the first PRD, and identifies Notion/GCP prerequisites. |
| T005 | user | high | `You said` heading | E003 | Locks the working title as Kieran’s LifeTrkr. |
| T006 | assistant | high | `Claude responded` heading | E004 | Records the name change and asks whether to regenerate the PRD or use a find-and-replace instruction. |
| T007 | user | high | `You said` heading | E003 | Chooses Jamie’s Replit, GitHub, and Notion accounts initially with later transition to Kieran. |
| T008 | assistant | high | `Claude responded` heading | E004,E006 | Replaces Vercel with Replit-hosted Express for the interim plan, adds Secrets and handoff guidance, and warns against irreversible Replit transfer. |
| T009 | user | high | `You said` heading | E003,E002 | Supplies peer output for cross-pollination. |
| T010 | assistant | high | `Claude responded` heading | E004,E006 | Compares Claude and ChatGPT; adopts localStorage-first staging, HANDOFF discipline, TypeScript types, and the Google redirect/session-secret warnings. |
| T011 | user | high | `You said` heading | E003 | Adds personal and family context for the emotional design brief. |
| T012 | assistant | high | `Claude responded` heading | E004,E005,E006 | Names Moonlit Hearth; specifies warm mystical color, moon streaks, seasonal badge, and optional generational easter egg. |
| T013 | user | high | `You said` heading | E003 | Requests the GitHub repository description and initial artifact package. |
| T014 | assistant | high | `Claude responded` heading | E004,E006 | Proposes nine repository files, GitHub setup, MIT-license review, and a Replit handoff package. |
| T015 | user | high | `You said` heading | E003 | Provides GitHub and Notion locations and describes storing project artifacts in both systems. |
| T016 | assistant | high | `Claude responded` heading | E004 | Reports a public repo status, notices an MIT/readme conflict, and asks whether the Notion database is a hub or the proposed five-table app backend. |
| T017 | user | high | `You said` heading | E003 | Chooses sharing and MIT licensing as part of the father-daughter origin story. |
| T018 | assistant | high | `Claude responded` heading | E004 | Recommends MIT wording, an Origin section, and lineage comments. |
| T019 | user | high | `You said` heading | E003 | Asks for the easiest way to connect the app to Google Calendar or a Notion calendar. |
| T020 | assistant | high | `Claude responded` heading | E004 | Recommends a private iCal URL for a single-user read-only setup and explains why Notion Calendar is not the app’s event source. |
| T021 | user | high | `You said` heading | E003 | Expands the question to an app usable by anyone with personal identity and Google Calendar. |
| T022 | assistant | high | `Claude responded` heading | E004 | Explains the multi-user architecture, Google verification, per-user storage, and staging options. |
| T023 | user | high | `You said` heading | E003 | Asks whether Google access can remain entirely client-side and out of publisher-managed storage. |
| T024 | assistant | high | `Claude responded` heading | E004 | Confirms GIS token-model feasibility, explains public Client ID and local storage, and outlines a client-only phase plan. |
| T025 | user | high | `You said` heading | E003 | Requests a long-form PRD for the client-only multi-user direction, including Calendar and Tasks. |
| T026 | assistant | high | `Claude responded` heading | E004,E006 | Summarizes PRD v2.0: GIS, localStorage namespacing, Calendar plus Tasks, and a reserved pre-1.0 path. |
| T027 | user | high | `You said` heading | E003 | Asks Claude to update the Notion hub with current plan and live app/repo status. |
| T028 | assistant | high | `Claude responded` heading | E004 | Fails to load the Notion read in one visible response; this is not evidence of a successful write. |
| T029 | user | high | `You said` heading | E003 | Repeats the Notion update request with the same public project references. |
| T030 | assistant | high | `Claude responded` heading | E004 | Claims two Notion updates and reports Phase 1 shipped, GCP as the next blocker, and a v0.1.5-style posture; the claim is later compared to the fetched hub. |
| T031 | user | high | `You said` heading | E003 | Requests a logo, background, banner, and full visual asset package. |
| T032 | assistant | high | `Claude responded` heading | E004,E005,E006 | Proposes four concept directions, jewel-tone adjustments, a black-cat motif, and implementation notes. |
| T033 | user | high | `You said` heading | E003 | Identifies missing recurrence, descriptions, categories, celestial data, and daily divination in the deployed UI vision. |
| T034 | assistant | high | `Claude responded` heading | E004,E006 | Specifies shared recurrence, category groups, moon math, seasonal events, tarot, horoscope, oracle caching, and verification cautions. |
| T035 | user | high | `You said` heading | E003 | Requests a very detailed PRD v3 while keeping software versioning below 1.0. |
| T036 | assistant | high | `Claude responded` heading | E004,E006 | Produces the v3.0 specification and reserves v1.0 for a stable, verified, Kieran-owned release. |
| T037 | user | high | `You said` heading | E003 | Requests a deep deployed/repository/Notion audit and a PRD v4 for the next work. |
| T038 | assistant | high | `Claude responded` heading | E004,E006 | Reports historical deployment/source/doc gaps, proposes a three-session PRD v4, and raises the oracle-key exposure issue and Cloudflare Worker alternative. |
| T039 | user | high | `You said` heading | E003 | Corrects the family name from historical `Virgil` to `Vyrle`. |
| T040 | assistant | high | `Claude responded` heading | E004 | Claims a broad spelling correction across memory, Notion, README, and PRDs. The owner’s current repository guide is the authoritative spelling lock. |
| T041 | user | high | `You said` heading | E003,E002 | Asks for validation that the app meets all linked architecture/design/handoff/roadmap/PRD and Notion requirements. |
| T042 | assistant | high | `Claude responded` heading | E004,E039,E040 | Reports seven safe corrections and one held correction because two PRD-v4.0 files conflict; flags stale tracker rows and recommends reconciliation before execution. |

## Content element ledger

| Element | Turn | Type | Owner | Fidelity | Source locator | Destination reference | Catalog action |
|---|---|---|---|---|---|---|---|
| E001 | orphaned | ui_chrome | Claude surface | metadata-only | Rendered shared-page banner and warning | This artifact’s provenance section | exclude-chrome after boundary evidence |
| E002 | T009,T041 | ui_chrome / missing sidecar | Claude surface | referenced-not-supplied | “Files hidden in shared chats” and hidden artifact chips | Normalization exceptions and open limits | flag-missing |
| E003 | T001–T041 | conversation text | user | text-extracted | Rendered `You said` blocks | Turn ledger and source synopsis | retain as summarized evidence |
| E004 | T002–T042 | conversation text / tool_event | assistant or tool | text-extracted | Rendered `Claude responded`, search, tool, and status blocks | Turn ledger and decisions | compress with claim labels |
| E005 | T012,T032 | interactive_visual | assistant | unavailable | “Log in to see interactive visuals” | Open questions and limits | flag-missing |
| E006 | T004,T008,T010,T012,T014,T026,T030,T032,T034,T036,T038 | generated_file / artifact | assistant | referenced-not-supplied | “Created a file” cards and named artifacts | Supplied Downloads packet where a matching file exists; otherwise missing | retain matching files; flag unmapped artifacts |
| E007 | orphaned | file | user | text-extracted | Downloads/AGENTS.md | Current-state comparison | retain as historical governance evidence |
| E008 | orphaned | file | user | text-extracted | Downloads/APP_VERSION_PATCH.md | Version history and drift | retain as historical patch note |
| E009 | orphaned | file | user | text-extracted | Downloads/ARCHITECTURE.md | Architecture pivot comparison | retain as superseded Express/Notion plan |
| E010 | orphaned | file | user | text-extracted | Downloads/catalog-meta-schema.json | Skills tooling inventory | retain as reusable schema |
| E011 | orphaned | file | user | text-extracted | Downloads/catalog-skills.md | Skills tooling inventory | retain as reusable procedure |
| E012 | orphaned | file | user | text-extracted | Downloads/CLAUDE.md | Governance and architecture comparison | retain as historical predecessor; do not treat as current authority |
| E013 | orphaned | file | user | text-extracted | Downloads/DESIGN.md | Moonlit Hearth design decisions | retain |
| E014 | orphaned | file | user | text-extracted | Downloads/gen-skills-readme.py | Skill catalog implementation asset | retain as reusable tooling reference |
| E015 | orphaned | file | user | text-extracted | Downloads/HANDOFF.md | Ownership transfer decisions | retain |
| E016 | orphaned | file | user | text-extracted | Downloads/index-skills.md | Distribution catalog procedure | retain |
| E017 | orphaned | file | user | text-extracted | Downloads/Kieran-LifeTrkr-Design-Moonlit-Hearth.md | Design duplicate/formatting variant | retain as companion variant; compare with E013 |
| E018 | orphaned | file | user | text-extracted | Downloads/Kieran-LifeTrkr-PRD-Amendment-01.md | Architecture duplicate | retain as duplicate of E009 |
| E019 | orphaned | file | user | text-extracted | Downloads/kierans-lifetrkr-example-skills-readme.md | Project skills catalog example | retain as reusable template/example |
| E020 | orphaned | file | user | text-extracted | Downloads/library-skills-readme.template.md | Skills library template | retain |
| E021 | orphaned | file | user | text-extracted | Downloads/MODES.md | Skill scanner mode definition | retain |
| E022 | orphaned | file | user | text-extracted | Downloads/PRD.md | Superseded original product plan | retain as historical source; do not execute |
| E023 | orphaned | file | user | text-extracted | Downloads/PRD-v1.0.md | Duplicate superseded original product plan | retain as historical duplicate of E022 |
| E024 | orphaned | file | user | text-extracted | Downloads/PRD-v2.0.md | Client-only pivot | retain as key architectural rationale |
| E025 | orphaned | file | user | text-extracted | Downloads/PRD-v3.0.md | Product vision and feature plan | retain as superseded detailed vision |
| E026 | orphaned | file | user | text-extracted | Downloads/PRD-v4.0.md | Deep review and three-session build brief | retain; flag contradictions with current repo |
| E027 | orphaned | file | user | text-extracted | Downloads/project-skills-readme.template.md | Project skills template | retain |
| E028 | orphaned | file | user | text-extracted | Downloads/README.md | Corrected snapshot README | retain; compare with current repo README |
| E029 | orphaned | file | user | text-extracted | Downloads/replit.md | Replit session brief | retain; historical operational guidance |
| E030 | orphaned | file | user | text-extracted | Downloads/REPLIT_AGENT_PROMPT.md | Phase 1 build prompt | retain as reusable build sequence, not active authority |
| E031 | orphaned | file | user | text-extracted | Downloads/ROADMAP.md | Historical roadmap | retain; mark architecture drift |
| E032 | orphaned | file | user | text-extracted | Downloads/Rylee-LifeOS-PRD-v1.0.md | Original product plan variant | retain as historical duplicate/variant |
| E033 | orphaned | file | user | text-extracted | Downloads/SKILL.md | Skill cataloger instructions | retain as tooling reference |
| E034 | orphaned | file | user | text-extracted | Downloads/SKILL_PACKAGING_STANDARD.md | Skill packaging standard | retain as reusable governance asset |
| E035 | orphaned | file | user | text-extracted | Downloads/sync.sh | Historical synchronization/deploy script | retain; execution not authorized |
| E036 | orphaned | file | user | text-extracted | Downloads/update-skills-catalog.yml | Catalog automation workflow | retain as infrastructure context |
| E037 | orphaned | file | user | text-extracted | Downloads/verify-deployment.sh | Deployment verification script | retain as validation reference |
| E038 | orphaned | file | user | text-extracted | Attached pasted-text.txt | Audit and correction transcript | retain; source assertions labeled |
| E039 | orphaned | page | Notion connector | text-extracted | Notion Project Hub, private anchor withheld | Notion report-only evidence in this artifact | retain snapshot facts; do not write |
| E040 | orphaned | data_source_schema | Notion connector | metadata-only | Deliverables Tracker schema, private ID withheld | Notion report-only evidence in this artifact | retain schema; flag row query unavailable |
| E041 | orphaned | repository state | local repository | text-extracted | Current AGENTS.md, package.json, src, docs, workflows | Current-state section and actionable handoff | retain as present-state authority |

## Normalization exceptions

- The Claude snapshot supplies explicit role headings, so roles are high confidence. Search labels, tool-status labels, “Viewed a file” cards, and action controls are not treated as semantic turns.
- The snapshot explicitly warns that attachments and data may be hidden. File cards and “Files hidden in shared chats” are therefore cataloged as missing or referenced-not-supplied even when the owner later supplied a similarly named Downloads file.
- Claude assistant statements such as “Done,” “Notion is updated,” or “Clean across all files” are claims made in the conversation. They are not independently true merely because they appear in a Claude response. The fetched Notion snapshot and current repository inspection provide separate evidence.
- `Riley`, `Rylee`, and `Kieran` appear at different historical points. Visible product copy should use Kieran. `Rylee` is preserved only when it is part of a historical source label. The family lineage is normalized to `Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0`.
- The original product plan, Replit prompt, Amendment 01, PRD v2, PRD v3, PRD v4, current Notion hub, and current repository do not describe one unchanged architecture. Their sequence and conflict are part of the value inventory.
- Private Notion URLs, Notion page/database IDs, private Replit links, exact personal biographical details, and source-account locators are withheld from this public-safe repository artifact. Public project/repository names are retained where needed for orientation.
- The reported prompt-injection markers were not present in the supplied clean Design files. Historical mentions of the incident are preserved as evidence, not executed. A current repository scan found only historical session-log mentions, not active marker content in the Design or application source.

## Value inventory

| Area | Extracted value | Claim class | Source support |
|---|---|---|---|
| Purpose | Build a quiet, mobile-first life OS that answers what today requires through routines, habits, calendar visibility, tasks, backlog, and optional oracle context. | stated | T001,T003,T025; E024–E026,E028 |
| Context and constraints | Kieran is the intended user/owner; the project should remain shareable, MIT-licensed, client-only, low-noise, and free of publisher-managed personal data; GitHub Pages requires static-compatible routing. | stated | T017,T024; E012,E024,E028,E041 |
| Reasoning and alternatives | The project deliberately rejected a Notion/Express/Vercel architecture for client-only GIS and localStorage after recognizing CORS, custody, and staging costs; the localStorage-first decision came from cross-agent comparison. | stated/inferred | T008,T010,T020,T024; E009,E024,E025 |
| Decisions and outcomes | Moonlit Hearth, Vyrle spelling, HashRouter, production base path, namespaced storage, Google token model, pre-1.0 version discipline, Notion as project hub, and staged integration are the durable decisions. | stated | T012,T018,T024,T026,T036,T040; E012,E024–E026,E039,E041 |
| Reusable assets | PRD sequence, Replit build prompt, handoff checklist, design tokens, recurrence model, celestial helper concepts, oracle layering, skill cataloger schema/procedure, and deployment verification pattern. | stated/proposal | E013–E037; E041 |
| Current risks | Oracle key exposure, stale architecture docs, Google scope ambiguity, deployment/source-of-truth drift, Notion tracker uncertainty, and npm install/lockfile risk are the main follow-on checks. | inferred/unknown | E026,E039,E040,E041; current repository inspection |

## Decisions and rationale

| ID | Decision or conflict | Rationale and status |
|---|---|---|
| D01 | Client-only application boundary | Accepted in PRD v2.0 and current AGENTS.md. It avoids publisher-managed user data and keeps the app compatible with GitHub Pages. Earlier Express/Notion plans are historical and superseded for active application work. |
| D02 | GitHub Pages plus HashRouter and `/kierans-lifetrkr/` base | Accepted. Hash routing avoids server rewrite requirements; the base path is required for the deployed subpath. |
| D03 | Browser-local data namespaced by Google `sub` | Accepted. The storage abstraction is the data boundary. Google tokens belong in sessionStorage; fetched Google data is held in React state rather than persisted by default. |
| D04 | GIS token model rather than server OAuth | Accepted in the client-only plan. Only a public Client ID and authorized JavaScript origins are needed. GCP configuration and Google verification remain external dependencies. |
| D05 | Google Calendar/Tasks initially read-only | Accepted in PRD history, but current source uses `calendar.events` and has event create/delete functions. This is unresolved and needs an owner-approved product decision before claiming read-only compliance. |
| D06 | Notion as project hub, not app database | Accepted in the fetched Notion hub and current AGENTS.md. The old five-database Notion app schema remains useful historical design material only. |
| D07 | LocalStorage-first staging | Accepted after cross-agent comparison. It shortens the path to validating the UI and preserves a future data-source seam. |
| D08 | Moonlit Hearth visual language | Accepted. Warm purple-black, amethyst/gold/sage/rose, restrained type, moon streaks, seasonal badges, subtle cat/celestial cues, and no added OKHP3 branding are the durable design rules. |
| D09 | Recurrence, category, celestial, and oracle expansion | Proposed in Amendment 03 and reported as pulled forward into v0.1.x. Current source contains the feature families; exact deployed behavior and API health still require verification. |
| D10 | Oracle key handling | The safer Cloudflare Worker proxy was specified, but the current source still has the direct-browser Anthropic exception. The repository guide permits no new direct calls but does not prove the migration complete. Treat as an active security remediation. |
| D11 | Open sharing and MIT license | Accepted by the owner in the Claude conversation. The old personal-use wording was identified as conflicting with MIT and should not be reintroduced. |

Rejected alternatives with consequential rationale:

- The original Vercel/Notion proxy was rejected after the project chose Replit as an interim build environment and then rejected publisher-managed backend state entirely.
- The iCal secret URL is useful for a single-user read-only calendar but was not the chosen general multi-user architecture because each user would need to paste a private calendar URL and the source later favored GIS.
- Supabase and conventional multi-user auth were discussed as a product path, but they were deliberately deferred because a browser-local model meets the stated no-publisher-data requirement.
- Replit transfer was rejected in favor of forking because the source describes transfer as immediate and irreversible. This is a handoff warning, not an instruction to perform a transfer now.

## Actionable handoff

- **Current state:** The local repository is the present source of truth and is at application version v0.1.10. It contains React source, current CI/Pages workflows, HashRouter routes, browser-local persistence, GIS/calendar/tasks code, recurrence/category/celestial/oracle feature families, and three earlier context extracts. The project is client-only by policy, but some historical docs and oracle code still describe or implement superseded behavior.
- **Resume point:** Begin with a documentation-and-security reconciliation audit, then run an environment-backed smoke test before treating Google or oracle integration as shipped. Do not reintroduce Express, a database, or a backend as a reflexive response to stale docs.
- **Required context:** Read the repository `AGENTS.md`, `src/constants.ts`, `src/types.ts`, `src/lib/storage.ts`, `src/lib/oracle.ts`, `src/hooks/useGoogleAuth.ts`, active workflows, and relevant current docs. Use this artifact for the historical decision chain and source boundaries.

| Action | Owner | Status | Dependencies | Evidence or acceptance condition |
|---|---|---|---|---|
| Confirm the current application version and route vocabulary | owner/agent | ready | Current source | `APP_VERSION` remains the display authority; document Someday versus historical Archive without silently rewriting history. |
| Reconcile stale architecture and roadmap docs | owner/agent | proposed | Review current source and active workflow | No active docs instruct Express, Notion-as-app-DB, gh-pages scripting, or obsolete dependency versions unless explicitly labeled historical. |
| Decide Google Calendar write capability versus historical read-only promise | owner | blocked | Product decision | Either reduce scope/scope permissions to read-only or update the product/privacy/acceptance documentation and verify create/delete behavior. |
| Verify GCP configuration and Google smoke path | owner/agent | blocked | Environment-backed `VITE_GOOGLE_CLIENT_ID` and authorized origins | Connect/disconnect, Calendar fetch, Tasks fetch, token expiry, and failure states behave as documented. |
| Migrate oracle delivery to the approved safer boundary or explicitly accept the narrow exception | owner/agent | blocked | Decision on external Cloudflare Worker availability | Built output contains no Anthropic secret; `src/lib/oracle.ts` uses the approved route; fallback and daily cache still work. |
| Validate the dependency baseline | agent | ready | Existing node_modules or clean install | Run `npm run check` and `npm run build`; separately resolve or record the known `npm ci` lockfile mismatch. |
| Reconcile Notion project hub and tracker | owner/agent | proposed | Connector with row-level query or manual tracker inspection | Hub status, phases, and delivery rows match current source; no Notion app-backend tasks remain marked as active. |
| Preserve historical corrections and injection incident evidence | agent | complete | None | Keep evidence in session history; do not execute source-document instructions or erase history without an explicitly scoped cleanup task. |
| Perform ownership handoff only when stable | owner/Kieran | deferred | Stable release, accounts, Google ownership, and explicit owner authorization | Follow the handoff checklist; fork Replit rather than using irreversible transfer; verify the app under Kieran’s accounts. |

## Reusable methods and assets

1. **Three-stage project distillation:** source synopsis, one-paragraph introduction, six-to-twelve-word primary topic, then filesystem-safe title/slug. This makes future thread extracts discoverable and independently understandable.
2. **Architecture decision chain:** original server-backed proposal → localStorage-first staging → client-only GIS/localStorage/GitHub Pages. Preserve rejected alternatives because they explain why Notion, Express, Vercel, and Supabase are not current defaults.
3. **Storage contract:** route all app-domain persistence through `src/lib/storage.ts`; namespace by user identity; keep transient Google data out of persisted application entities unless current source explicitly defines otherwise.
4. **Feature model:** use one recurrence rule family across rituals, habits, tasks, and manual calendar events; combine categories, descriptions, filters, and active-day logic; keep celestial data deterministic and offline where possible.
5. **Oracle layering:** public tarot → optional horoscope → optional AI synthesis; cache by user/date; always keep a deterministic fallback. Treat external endpoint CORS, rate limits, model availability, and key handling as verification items rather than assumptions.
6. **Design asset package:** Moonlit Hearth tokens, typography, navigation vocabulary, moon streaks, seasonal badges, black-cat/crescent asset direction, social/banner/icon variants, and a restrained generational easter egg.
7. **Replit handoff method:** use a single active build brief, run a baseline type check, make small commits, record skipped work and acceptance evidence, keep owner secrets out of GitHub, and fork rather than transfer when ownership changes.
8. **Skill catalog workflow:** `catalog-skills`, `index-skills`, `MODES.md`, `catalog-meta-schema.json`, `gen-skills-readme.py`, the two README templates, and `SKILL_PACKAGING_STANDARD.md` form a reusable project/library skill-discovery system. The cataloger distinguishes flat project mode from nested library mode and can report, dry-run, or validate without writes.
9. **Deployment verification:** the supplied `sync.sh` and `verify-deployment.sh` show historical patterns for checking base paths, type/build status, source synchronization, and deployed URLs. Current AGENTS.md and active workflows override their older push/deploy defaults.

## Open questions and limits

- The Claude shared snapshot is partial or at least uncertain: hidden attachments, Project instructions, knowledge files, tool output, full citation payloads, and artifact versions are not available. The supplied Downloads packet covers many named files but cannot prove exact attachment-to-turn identity.
- The fetched Notion Project Hub is a June 23 snapshot. It reports current-at-that-time values, not July 2026 state. The linked tracker schema was fetched, but row-level query failed because the query tool was unavailable; claims about tracker rows remain historical assertions from Claude/audit text.
- The current deployed site was not treated as independently verified in this extraction. Current local source and repository instructions are the July evidence. Live OAuth, API CORS, deployed asset contents, and worker deployment need environment-backed or browser smoke tests.
- The read-only Google principle conflicts with the current calendar write scope and create/delete functions. This is the most important product/privacy acceptance question before public use.
- The oracle path is not fully reconciled. Current `src/lib/oracle.ts` directly calls Anthropic when `VITE_ANTHROPIC_API_KEY` is present, while the safer Worker approach is specified in other docs and flagged by Notion as a remediation. The current source also exposes the variable name in README and documentation. No key value was found in the supplied packet, but the architecture still deserves correction or explicit owner acceptance.
- Documentation is version-drifting. The supplied packet and Notion hub cite v0.1.8; the current repository guide and `src/constants.ts` cite v0.1.10; older session history cites v0.1.0, v0.1.8, and v0.1.9. Do not infer a milestone from a doc version alone.
- Current docs/ARCHITECTURE.md, parts of README.md, docs/ROADMAP.md, docs/PRD-v4.0.md, and historical session entries retain stale or mixed architecture language. Reconcile intentionally and preserve historical superseded documents with clear labels.
- The checked-in package metadata has a known `npm ci` risk in the repository guide: package.json and package-lock.json were previously reported out of sync around optional `@emnapi` packages. A clean install/build should be verified before any feature work.
- The supplied source says Notion is project hub only, but the old five-database app schema remains in PRD v1 and roadmap files. Those schema files are historical reusable material, not authorization to create a backend or Notion app database.
- The family lineage spelling is locked as `Vyrle`; historical `Virgil` occurrences in old source are evidence of the correction path, not a current open question.

## Rehydration test

| Test | Result | Evidence or gap |
|---|---|---|
| A reader can explain the objective without the source platform | pass | Introduction, source synopsis, and T001–T004 recover the product problem and intended feel. |
| Decisions and consequential rationale are recoverable | pass | D01–D11 and rejected alternatives preserve the server-backed-to-client-only pivot and staging rationale. |
| Current state and next action are unambiguous | pass | Current-state section and actionable handoff anchor present work to repository AGENTS.md and source. |
| Retained assets are available or missing assets are explicitly cataloged | pass | E007–E041 identify supplied files, repository paths, Notion snapshot/schema, hidden Claude sidecars, and unavailable visuals. |
| No source account, thread, project, canvas, or connector is a runtime dependency | pass | Required operating context is restated locally; URLs and account anchors are provenance only. |

- **Overall source-independence result:** pass.
- **Blocked capability, if any:** exact Notion tracker row verification and complete Claude attachment/artifact reconstruction remain unavailable, but neither prevents a capable reader from resuming repository work.

## Provenance and retention

- **Capture boundary:** rendered Claude shared snapshot titled “Kieran’s LifeTrkr - Scoping,” owner-supplied 31-file packet, attached audit transcript, fetched Notion Project Hub snapshot and tracker schema, and current local-repository inspection. No direct Claude account access, full Claude Project context, hidden files, or lossless export is claimed.
- **Completeness:** partial. The shared snapshot itself warns that attachments and data may not be displayed; the owner-supplied packet is complete only for the files named in the current request.
- **Source time context:** visible Claude labels span June 21–23, 2026; the Notion snapshot was returned as of June 23, 2026; the current repository was inspected July 22, 2026. Exact Claude export/capture time is unknown.
- **Retention decision:** redacted. Public-safe project decisions and local relative paths are retained; private page IDs/URLs, private Replit anchors, exact personal details, raw transcript, and secrets are withheld.
- **Source caveats:** Claude content is assistant/user snapshot text with incomplete sidecars; assistant claims are not independent verification; old PRDs and scripts contain superseded architecture; Notion was used in report-only mode; no Notion write, page update, database mutation, commit, push, deployment, or source-feature change was authorized or performed.
