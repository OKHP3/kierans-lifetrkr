---
title: "Kieran’s LifeTrkr Recurrence, Cosmic Overlay, and Alignment Roadmap"
primary_topic: "Kieran LifeTrkr recurrence cosmic overlay alignment roadmap"
source_platform: "ChatGPT"
capture_mode: "full-paste"
completeness: "partial"
extraction_depth: "comprehensive"
requested_extraction_depth: "comprehensive"
source_title: "Kieran’s LifeTrkr Project — recurrence and alignment planning"
source_date: "unknown"
source_time_context: "Visible labels Mon, Jun 22 at 8:54 AM and 2:09 PM; year and timezone unknown"
source_locator: "pasted-text.txt; private ChatGPT Project/thread locators withheld"
retention_decision: "redacted"
source_independence: "pass"
generated_at: "2026-07-21T21:01:28Z"
schema_version: "2.0"
artifact_type: thread-context-extract
---

# Kieran’s LifeTrkr Recurrence, Cosmic Overlay, and Alignment Roadmap

## Introduction

This partial ChatGPT capture preserves a product-architecture and planning thread for Kieran’s LifeTrkr. Its central design decision is to treat recurrence as a shared first-class primitive for Rituals, Habits, and Calendar Events, while keeping descriptions, categories, tags, filtering, and optional cosmic context in a reusable metadata layer. The source then expands that decision into a detailed Replit implementation prompt covering TypeScript data shapes, non-destructive local migration, UI components, filters, deterministic local moon/card/wisdom behavior, read-only cosmic events, Home and Calendar integration, documentation, and acceptance criteria. A later continuation asks for a current-state audit across the deployed site, GitHub, and Notion, explicit treatment of tarot/horoscope/Claude integrations, synchronization of project artifacts, and a detailed PRD-v4. The final visible user context clarifies that the app is a joint family project adjacent to—but separate from—the OverKill-Hill FoundRy, and may borrow process conventions from related repositories. The capture does not include the audit results, Notion changes, GitHub changes, PRD-v4, or the contents of four referenced document chips.

## Extraction profile

- **Requested depth:** high quality and very detailed
- **Selected depth:** comprehensive
- **Selection basis:** The user explicitly requested a high-quality, very detailed context extraction; this maps to the comprehensive profile.
- **Profile changes:** None.
- **Focus areas:** durable product decisions, shared recurrence and metadata model, V1 scope boundaries, cosmic/oracle direction, acceptance criteria, audit/synchronization follow-up, project ownership and lineage.
- **Must preserve:** the reusable Replit prompt requirements, data-model shapes, migration rules, external-service caveats, acceptance criteria, and unresolved audit/PRD work.
- **Safe exclusions:** repetitive blank lines, generic UI labels, and tool-progress chrome that does not change meaning.
- **Coverage rule:** All visible semantic blocks are individually ledgered. Repetitive UI chrome is grouped and excluded from semantic interpretation. Referenced files, private locators, and unavailable external artifacts remain cataloged with explicit missing or redacted dispositions.
- **Not carried forward:** the raw transcript, private ChatGPT/Notion URLs, exact attachment payloads, and unsupported claims about the current deployed state are not reproduced as repository content.
- **Source-independence test:** pass for understanding the product direction and resuming the proposed implementation/audit; blocked only for verifying live-site state, Notion state, hidden branches, and the four missing document payloads.

## Coverage accounting

| Material class | Assessed | Retained | Compressed | Omitted with reason | Missing or unavailable | Notes |
|---|---:|---:|---:|---:|---:|---|
| Turns or turn groups | 6 | 5 | 0 | 1 | 0 | Five semantic blocks plus one UI-chrome group; role uncertainty is recorded below. |
| Rich elements | 9 grouped records | 4 | 1 | 0 | 4 | Four document chips and private locators are cataloged without payload or direct URL retention. |
| Decisions and alternatives | 15 | 15 | 0 | 0 | 0 | Shared recurrence, client-only V1, local fallback, read-only cosmic layer, and sequencing decisions retained. |
| Reusable assets | 7 | 7 | 0 | 0 | 0 | Replit prompt structure, TypeScript shapes, category list, API ideas, deck examples, acceptance checklist, and reporting checklist. |

## Source synopsis

The source opens with a cross-pollination statement and a diagnosis that Rituals and Habits are semantically wrong when modeled like one-off appointments. The proposed correction is architectural rather than cosmetic: create one shared recurrence and tagging/metadata model, then reuse it across Rituals, Habits, and Calendar instead of building three unrelated forms. The source identifies five conceptual areas: recurring routines, recurring behavior history, dated or recurring events, read-only cosmic context, and deterministic daily reflection content.

The proposed domain split is explicit. A Ritual is a recurring routine, often with steps and completion by date. A Habit is a recurring behavior with completion history and simple progress. A Calendar Event is a one-time or recurring scheduled item. Cosmic Overlay items—moon phases, seasonal markers, daily cards, and daily wisdom—are generated contextual events and should not be mixed into the user-created event data model. Daily Wisdom/Card content is framed as reflection, encouragement, or mood-setting rather than factual fortune-telling.

The source recommends a shared `RecurrenceRule` with a frequency enum, interval, optional weekday or day-of-month selectors, start date, an end condition, and exception dates. The supported V1 set is intentionally bounded: no repeat, daily, weekly, monthly, custom weekly days, never-ending series, end-on-date, and end-after-count. Advanced recurrence is deferred. The default rule is non-repeating, interval one, starting today, never ending, with no exceptions. This creates one normalization target for all three user-created domains.

The metadata layer is also shared. Each entity should support an optional description, a category identifier, and string tags. Categories carry an ID, label, emoji, realm, and optional description. The suggested categories mix practical life domains—medication, sleep, rest, meditation, hydration, movement, study, chores, room reset, mood check, journaling, music, and friends—with soft aesthetic categories such as moon work, card reading, spellcasting, intention, reflection, black cat, crystals, and herbs. The tone constraint is important: playful and atmospheric, not religious, occult-heavy, scary, goth, or overly serious. Category is primary; tags are a lightweight secondary mechanism.

The proposed component architecture includes `RecurrenceEditor`, `CategoryPicker`, `TagInput`, `DescriptionField`, `ScheduleFields`, and `FilterBar`. The editor exposes repeat frequency, interval, weekday selection, and end conditions. The category picker exposes emoji and label, with realm grouping or search only if simple. The tag input permits existing-tag selection, lightweight custom tags, and removal without making tags the dominant interaction.

The suggested data shapes align Ritual, Habit, Calendar Event, and Cosmic Event around explicit provenance and lifecycle fields. Rituals include title, description, optional steps and times, recurrence, category, tags, active state, and timestamps. Habits add completed dates. Calendar Events add date/time, location, recurrence, category, tags, a source discriminator, and timestamps. Cosmic Events use a separate shape with date, type, optional emoji, and local/external source. Existing records must be migrated in place: missing recurrence becomes non-repeating, missing description becomes empty, missing category remains undefined or uncategorized, and missing tags becomes an empty array. Existing localStorage data must never be wiped.

The source also defines minimum filtering and sorting behavior. Rituals can filter by category, tag, recurrence frequency, and active state, and sort by title, next occurrence, or category. Habits can filter by category, tag, recurrence frequency, and completed-today state, and sort by title, progress, next due, or category. Calendar can filter by source, category, tag, date range, and recurring/one-time state, and sort by date/time ascending.

The cosmic layer is intentionally local-first and optional. The source suggests a local deterministic moon-phase calculation when practical, a date-seeded local card/wisdom generator, and an optional future adapter boundary for external APIs. It explicitly rejects required API keys, secrets, or app failure when cosmic data is unavailable. Suggested functions are `getMoonPhaseForDate`, `getDailyCard`, `getDailyWisdom`, and `getCosmicEventsForDateRange`. The daily output must be stable for a date across refreshes. A six-item sample deck—Lantern, Black Cat, Moon Bowl, Key, Thread, and Candle—provides the tone and implementation seed.

Calendar should render user events, generated recurring occurrences, optional existing mock/Google items, and enabled cosmic overlays with distinct visual source treatment. Cosmic events are read-only. Home should surface today’s rituals, habits, user calendar items, moon/cosmic note, and card/wisdom message with subtle labels such as “Today’s Orbit,” “Daily Card,” “Moon Note,” and “A Little Wisdom.”

The source proposes documentation for recurrence, taxonomy, and cosmic overlay, plus alignment updates to the README, PRD, data model, roadmap, handoff, and artifact ledger. Its definition of done covers recurrence in all three domains, shared descriptions/categories/tags, safe migration, filters, generated recurring occurrences, Home integration, local daily wisdom, visually distinct read-only cosmic events, no required external API, no secrets, and updated documentation. It also requires a post-change report covering files, data model, migration, recurrence patterns, category/tag behavior, cosmic behavior, build results, and deferred work.

The later continuation changes the immediate work from implementation-only to an audit-and-alignment sequence. It asks for a deep review of the deployed app against the thread’s vision, comparison with GitHub and Notion artifacts, explicit treatment of a proposed three-layer external-service stack—tarot API, horoscope API keyed by a Settings sun sign, and a Claude-generated oracle cached by date—then synchronization of Notion and GitHub and a long PRD-v4 for Replit. The visible assistant response only states an intended audit method; it does not provide findings or execute the requested synchronization. The last user block clarifies project identity and possible process borrowing from adjacent repositories, including sync scripts and agent-guide conventions.

## Turn ledger

| Turn | Role | Role confidence | Boundary evidence | Content elements | Summary |
|---|---|---|---|---|---|
| T001 | unknown, likely user-originated setup | low | First-person transition followed by a long pasted response-like block; no explicit role label | E001-E004 | States that information from a peer is being cross-pollinated and that recurrence plus reusable metadata should become a Replit change prompt. |
| T002 | unknown, likely assistant response | low | “Diagnosis,” recommendation language, domain table, and “Here is the Replit prompt addendum” suggest an assistant response, but the clipboard capture has no response-role control | E005-E006 | Diagnoses the one-off appointment model, defines the domain split, recommends one shared scheduling/metadata layer, and gives cautious treatment of outside-source ideas. |
| T003 | unknown, likely assistant-generated implementation artifact | medium | A self-contained heading “@Replit Prompt Addendum” and imperative repository instructions indicate a generated prompt artifact; source does not expose the owning response boundary | E007-E008 | Provides the detailed V1 prompt: architecture boundaries, recurrence, metadata, UI, data shapes, migration, filters, cosmic layer, calendar/Home behavior, docs, acceptance criteria, and reporting requirements. |
| T004 | unknown, likely user-originated continuation | low | Visible date marker followed by a direct request to inspect deployed, GitHub, and Notion state; no explicit role label | E009-E010 | Requests current-state audit, external-service treatment, artifact synchronization, and PRD-v4. |
| T005 | unknown, likely assistant response | low | “I’ll treat this as…” is a plan statement followed by tool-progress chrome; no response label | E006 | Commits only to an audit approach; no results, writes, or PRD content are present in the supplied material. |
| T006 | unknown, likely user-originated project context | low | Second date marker followed by first-person ownership and repository relationship statements; trailing “Stopped thinking” is UI chrome | E011-E012 | Clarifies family collaboration, separation from the FoundRy, adjacency to related repositories, and interest in borrowing process conventions. |

## Content element ledger

| Element | Turn | Type | Owner | Fidelity | Source locator | Destination reference | Catalog action |
|---|---|---|---|---|---|---|---|
| E001 | T001 | ui_chrome | unknown | metadata-only | Attachment lines 1-33 | Not carried forward as semantic content | exclude-chrome |
| E002 | T001 | file | user | referenced-not-supplied | `Pasted text(9).txt` chip | No payload in supplied attachment | flag-missing |
| E003 | T001 | file | user | referenced-not-supplied | `Pasted text (2)(1).txt` chip | No payload in supplied attachment | flag-missing |
| E004 | T001 | file | user | referenced-not-supplied | `Pasted text (3)(1).txt` and `Pasted text (4)(1).txt` chips | Two additional payloads absent; grouped because only filenames survived | flag-missing |
| E005 | T002 | ui_chrome | tool/platform | metadata-only | “Preparing app tools,” “Thought for 3m 13s,” and “Stopped thinking” markers | Tool execution details were not supplied and are not needed to preserve product intent | exclude-chrome |
| E006 | T002/T005 | tool_event | tool | unavailable | Tool-progress markers without event payload | No tool result, source trace, or generated artifact was captured | flag-missing |
| E007 | T003 | artifact | assistant/unknown | text-extracted | Replit prompt addendum, visible in attachment lines 60-763 | Reusable requirements retained in Source synopsis, Decisions, and Reusable assets | retain |
| E008 | T002/T004/T006 | reference set | unknown | metadata-only | Public repository/deployed-site references and external API names | Safe project/repository names retained; private account locators withheld | compress |
| E009 | T004 | reference/citation | unknown | referenced-not-supplied | Proposed tarot, horoscope, and Claude integration references | No external verification performed; claims remain source assertions needing verification | flag-missing |
| E010 | T004 | reference/citation | unknown | referenced-not-supplied | Supplied Notion Hub locator | Private locator withheld; no connector destination supplied | flag-missing |
| E011 | T006 | reference set | user | metadata-only | Adjacent repository names: FoundRy, BPMN for Mermaid, Mermaid Theme Builder, skillz, refoldec | Names and relationship rationale retained without importing their content | retain |
| E012 | T006 | operational idea | user | text-extracted | Borrowing sync/agent-guide conventions | Retained as a proposal requiring repository-specific review and owner authorization | retain |

## Normalization exceptions

1. The capture is flattened and lacks explicit `User`, `ChatGPT`, `Assistant`, or structured role labels. Roles in T001-T006 are therefore low or medium confidence and must not be treated as verified speaker attribution.
2. The four document chips prove that source files were present in the original UI context, but their contents, MIME types, timestamps, and relationships are unavailable. They are not silently treated as empty or irrelevant.
3. “Preparing app tools,” “Thought for 3m 13s,” and “Stopped thinking” are UI/tool chrome. They establish possible response boundaries but do not constitute semantic evidence or proof that a tool action completed.
4. The source includes private ChatGPT Project/conversation and Notion locators supplied by the owner. They are withheld from the repository artifact to avoid retaining account-scoped URLs in a potentially public repository. The source boundary remains documented without those direct locators.
5. The source mentions current deployed/GitHub/Notion state and external API behavior, but the supplied paste contains no audit evidence, fetch results, screenshots, export records, or verification dates. All such claims remain stated source intent or unresolved work, not verified current facts.
6. The phrase “created by your peer” does not identify the peer, the earlier material, or the missing source boundary. No peer output is inferred.
7. The source time labels include “Mon, Jun 22 at 8:54 AM” and “Mon, Jun 22 at 2:09 PM,” but no year, timezone, or export timestamp. The year and exact chronology relative to other artifacts are unknown.

## Value inventory

| Area | Extracted value | Claim class | Source support |
|---|---|---|---|
| Purpose | Align LifeTrkr’s domain model around recurrence and reusable metadata, then use that model to guide implementation and later audit/alignment work. | stated | T001-T005 |
| Context and constraints | Personal, client-only V1; local/browser persistence; no backend, runtime Notion database, secrets, or required external API for the recurrence pass. | stated | T003 artifact sections 1 and 10 |
| Reasoning and alternatives | A shared scheduling/metadata layer is preferred over three separate recurrence systems; cosmic integrations are adapters/fallbacks rather than core dependencies; recurrence should precede visual polish. | proposal | T002 and T003 |
| Domain model | Ritual, Habit, Calendar Event, Cosmic Event, and Daily Wisdom/Card have distinct semantics and lifecycle rules. | stated | T002-T003 |
| Data migration | Normalize missing fields without clearing existing local data. | stated | T003 section 8 |
| Reusable assets | TypeScript-style types, component list, category catalog, local wisdom deck, helper function names, filters, acceptance checklist, and reporting checklist. | stated/proposal | T003 sections 4-16 |
| External services | Tarot, horoscope, and Claude are proposed/remembered integration ideas; caching and availability are asserted but not verified by this capture. | unresolved | T004 |
| Project identity | Family collaboration; separate from the FoundRy while adjacent to related repositories and methods. | stated | T006 |
| Operational follow-up | Audit deployed/GitHub/Notion state, synchronize approved artifacts, and write PRD-v4. | stated | T004-T005 |

## Decisions and rationale

### Accepted or strongly recommended in the source

1. **Recurrence is a shared first-class primitive.** Rituals, Habits, and user-created Calendar Events all need recurrence, so one rule shape and one occurrence-calculation path should be reused.
2. **User-created and cosmic data remain separate.** Cosmic/lunar/daily-wisdom events are contextual and read-only; they must not be editable as if they were user events.
3. **V1 remains client-only and local-first.** No backend, Notion runtime database, or required external service is part of this pass.
4. **Migration is additive and non-destructive.** Existing localStorage records must survive; absent fields receive safe defaults.
5. **Category is first-class; tags are secondary.** The UI should make category selection easy and keep tags lightweight.
6. **Cosmic content fails soft.** Local deterministic fallbacks keep the app usable and stable across refreshes.
7. **Cosmic content is reflective, not predictive.** Daily card and wisdom language should support mood-setting and encouragement rather than claim factual divination.
8. **Recurrence precedes polish.** The source identifies the risk of a visually finished app with a weak underlying domain model.
9. **Audit before synchronization.** The later request sequences current-state review, cross-artifact comparison, external-service assessment, synchronization, and PRD-v4 creation.
10. **Project boundaries matter.** LifeTrkr is adjacent to the FoundRy and related repositories, not a FoundRy subproject; borrowed process conventions require local adaptation.

### Rejected, deferred, or bounded alternatives

- **Three one-off recurrence implementations:** rejected in favor of shared primitives because they would duplicate logic and drift semantically.
- **Advanced recurrence engine in V1:** deferred; exceptions, monthly edge cases, and custom patterns beyond the explicit V1 set should not be overbuilt without a later decision.
- **External APIs as required runtime dependencies:** deferred/rejected for this pass because reliability, licensing, CORS, secrets, and client-only safety remain concerns.
- **Cosmic events in the user event model:** rejected because read-only generated context needs different edit and provenance behavior.
- **Notion as app database:** explicitly rejected; Notion remains project hub/artifact ledger in the source’s V1 direction.
- **Rewriting the project from scratch:** explicitly rejected; inspect and align the existing routes/components first.

## Actionable handoff

- **Current state:** The durable design direction and a detailed proposed Replit prompt are captured. The later audit request is visible, but no audit results, Notion update, GitHub update, or PRD-v4 content is present in the supplied source.
- **Resume point:** Load the target repository’s canonical `AGENTS.md`, inspect current source and active workflows, then compare actual implementation and docs with the recurrence/cosmic acceptance matrix below. Treat the source’s external-service statements as hypotheses to verify.
- **Required context:** The full four missing document payloads, a complete ChatGPT export or a broader capture, live deployed-site evidence, current GitHub state, authorized Notion destination/schema, and owner decisions about whether to implement the proposed V1 scope or only document it.

| Action | Owner | Status | Dependencies | Evidence or acceptance condition |
|---|---|---|---|---|
| Recover or review the four referenced document payloads | user | blocked | Original ChatGPT attachments or export | Each file has a retained source record or an accepted-loss decision. |
| Inspect current Rituals, Habits, and Calendar implementation | agent | ready | Repository access and canonical guide | Current fields, persistence, occurrence logic, and UI are mapped against T003. |
| Verify localStorage migration safety | agent | ready | Source inspection and focused tests | Existing records are preserved and missing fields normalize without data loss. |
| Verify recurrence occurrence generation | agent | ready | Current source and test/runtime path | Supported V1 patterns produce expected dates and end conditions. |
| Verify cosmic/oracle behavior and boundary | agent | ready | Current `src/lib` and settings/source inspection | Cosmic data is read-only/contextual, deterministic where required, and fallback-safe. |
| Audit deployed app against the source vision | agent + user | blocked | Live smoke test and source version | Findings include concrete routes/behaviors, not assumptions. |
| Compare GitHub and Notion artifacts | agent + user | blocked | Authorized Notion connector/destination and current repository docs | Drift is listed with source links/paths and proposed owners. |
| Decide whether to synchronize Notion/GitHub | user | blocked | Audit findings and visibility/authorization decision | No write occurs until destination and scope are explicit. |
| Produce PRD-v4 for Replit | agent | proposed | Audit results, accepted scope, and open decisions | PRD includes current-state facts, requirements, out-of-scope items, acceptance tests, and reporting contract. |
| Borrow sync/AGENTS/CLAUDE conventions selectively | user + agent | proposed | Review adjacent repositories and current repository guide | Any borrowed convention is adapted to LifeTrkr’s client-only boundary and does not alter deployment without authorization. |

### Acceptance matrix for the recurrence/cosmic pass

| Area | Required outcome |
|---|---|
| Rituals | Recurrence, description, category, tags, completion-by-date behavior, and minimum filters/sorts. |
| Habits | Recurrence, description, category, tags, completion history, progress, and completed-today filtering. |
| Calendar | One-time and recurring user events, generated occurrences, metadata, source distinction, date-range filtering, and read-only cosmic overlay. |
| Migration | Existing local records remain; missing recurrence/description/category/tags receive safe defaults. |
| Cosmic layer | Local deterministic moon/card/wisdom behavior with soft failure and no required key/service. |
| Home | Today’s recurring rituals, habits, user calendar items, and subtle cosmic/card/wisdom context. |
| Documentation | Recurrence model, taxonomy, cosmic overlay, data model, roadmap, handoff, artifact ledger, and README are aligned after implementation. |
| Security/architecture | No new secrets, backend, Notion runtime database, or unrelated account system. |

## Reusable methods and assets

### Shared recurrence contract

```ts
type RecurrenceFrequency =
  | "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

type DayOfWeek =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";

type RecurrenceEnd =
  | { mode: "never" }
  | { mode: "onDate"; date: string }
  | { mode: "afterCount"; count: number };

type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number | null;
  startDate: string;
  end: RecurrenceEnd;
  exceptions?: string[];
};
```

Default normalization is `frequency: "none"`, `interval: 1`, `startDate: today`, `end: { mode: "never" }`, and `exceptions: []`.

### Shared metadata contract

```ts
type TaggedMetadata = {
  description?: string;
  categoryId?: string;
  tags: string[];
};
```

Category records use `id`, `label`, `emoji`, a realm such as `body`, `mind`, `home`, `school`, `social`, `health`, `magic`, `creative`, `calendar`, or `other`, and an optional description.

### Suggested reusable UI

`RecurrenceEditor`, `CategoryPicker`, `TagInput`, `DescriptionField`, `ScheduleFields`, and `FilterBar` are the preferred seams. Keep the category picker primary, tags secondary, and advanced search/grouping optional until the basic interaction is stable.

### Cosmic helper boundary

```ts
getMoonPhaseForDate(date: string): CosmicEvent | null
getDailyCard(date: string): CosmicEvent
getDailyWisdom(date: string): CosmicEvent
getCosmicEventsForDateRange(startDate: string, endDate: string): CosmicEvent[]
```

Seed daily selections by date so a refresh does not change the message. Keep cosmic events read-only and visually distinct from user events. Use the source’s six sample cards as tone seeds, not as factual claims.

### External-service evaluation checklist

Treat tarot, horoscope, Claude, Open-Meteo, astronomy-engine-style packages, and tarot-api as candidate adapters or claims to verify. Before adopting any one of them, verify current endpoint behavior, CORS, licensing, availability, caching, error handling, secrets exposure, and whether the dependency is truly optional for the client-only app. The source’s remembered “free/no-auth/CORS-enabled” language is not evidence of current behavior.

### Replit prompt structure

For a future implementation prompt, preserve this sequence: existing architecture and routes; product boundaries; core problem; domain definitions; shared types; UI components; migration; filters/sorts; cosmic fallback; Calendar; Home; docs; acceptance criteria; reporting requirements; explicit out-of-scope list. This keeps the prompt actionable without inviting a rewrite or backend expansion.

## Open questions and limits

- Is the supplied paste a complete visible capture of the target conversation, or only an excerpt assembled from several documents? The file chips and absent role labels make completeness `partial`.
- What are the four referenced document contents, and do they contain earlier requirements, implementation results, or contradictory decisions?
- What year and timezone do the June 22 timestamps represent?
- What was the outcome of the proposed deployed-site audit?
- What is actually present in the current GitHub repository and deployed build relative to T003? The target repo must be inspected; this artifact does not infer completion from the prompt.
- What is the authorized Notion destination? The supplied Notion URL is withheld and no connector/schema was available in this run. Notion capture therefore remains report-only.
- Does the proposed tarot endpoint still support the stated behavior? Does the horoscope endpoint accept the expected sign? Is Claude intentionally configured in the current client-only build? These are all needs-verification questions.
- Does the owner want a recurrence implementation, a documentation alignment pass, a PRD-v4, or the full audit-and-sync sequence first? The source requests all of them over time but does not provide acceptance ordering beyond audit before synchronization.
- Should `yearly` remain in the shared type while unsupported in V1 UI/occurrence logic? The source includes it in the type but explicitly lists a narrower supported V1 set.
- What are the exact monthly recurrence semantics, timezone rules, exception editing rules, and occurrence-window performance requirements? These remain deferred design details.
- Should external Google data be included in the same filter/source model as manual events? The source says optional mock/Google events may remain, but does not settle a full integration contract.

## Rehydration test

| Test | Result | Evidence or gap |
|---|---|---|
| A reader can explain the objective without the source platform | pass | Introduction, Source synopsis, and Value inventory define the product problem and intended direction. |
| Decisions and consequential rationale are recoverable | pass | Decisions and rationale retain the shared-layer, local-first, cosmic-separation, migration, and sequencing choices. |
| Current state and next action are unambiguous | pass | Actionable handoff identifies that the prompt is captured but audit/synchronization/PRD results are absent, and names the first resume actions. |
| Retained assets are available or missing assets are explicitly cataloged | pass | Type shapes, category ideas, helper names, and acceptance matrix are retained; four document chips and tool payloads are marked missing. |
| No source account, thread, project, canvas, or connector is a runtime dependency | pass | The artifact is self-contained; private URLs are withheld and only provenance caveats remain. |

- **Overall source-independence result:** pass for the captured design intent and implementation handoff; blocked for live-state verification and missing sidecar recovery.
- **Blocked capability, if any:** A future reader cannot reconstruct the four referenced documents, hidden branches, tool outputs, live deployed audit, or Notion contents from this artifact alone. Those gaps do not prevent understanding or implementing the retained recurrence/cosmic direction, but they prevent claiming a complete project migration or artifact synchronization.

## Provenance and retention

- **Capture boundary:** A user-supplied attachment named `pasted-text.txt` containing flattened visible ChatGPT text associated with a Kieran’s LifeTrkr Project/conversation. The supplied ChatGPT URLs are treated as private source locators and are not reproduced here.
- **Completeness:** partial.
- **Source time context:** Visible labels “Mon, Jun 22 at 8:54 AM” and “Mon, Jun 22 at 2:09 PM”; year, timezone, export time, and full conversation span are unknown.
- **Retention decision:** redacted.
- **Source caveats:** This is a full-paste-style clipboard capture of visible material, not a ChatGPT data export. It may omit hidden branches, prior turns, regenerated alternatives, Project instructions, attached-file payloads, citations, tool output, Canvas content, and current platform state. Assistant assertions and remembered API properties remain unverified source claims.

## Notion capture routing report

**Mode:** report-only. **Destination:** unresolved; no page, database, or data-source destination was explicitly authorized for this run. **Write performed:** none.

The extracted artifact is the repository-side durable handoff. A future Notion capture should first resolve and fetch the intended private Project Hub page or database, inspect its schema/content, search for an existing LifeTrkr thread record, classify this material as `net-new`, `complementary`, `duplicate`, or `conflicted`, and then append or upsert only after confirming visibility and authorization. Suggested record metadata: title, platform `ChatGPT`, partial-capture status, captured-at timestamp, redaction status, source topic, repository artifact path, and open exceptions. The full source corpus should not be copied into Notion merely to make it searchable.

## Migration coverage report

**Batch:** Kieran’s LifeTrkr recurrence/cosmic-overlay planning capture, 2026-07-21 processing date  
**Source:** `ui_capture_only` / user-supplied flattened paste; no export ZIP available  
**Threads:** 1 supplied thread locator / 1 partial capture / 0 fully reconciled  
**Nodes:** 0 export mapping nodes available; 6 semantic turn groups retained from pasted text  
**Assets:** 4 referenced document payloads unavailable; reusable text artifact retained  
**Exceptions:** 7 open source-boundary or sidecar exceptions, including missing files, missing tool payloads, absent roles, private locators, and unverified live-state claims  
**Artifact routing:** 1 durable context extract to `context/threads/`; no raw source or Notion write  
**Owner decisions needed:** recover missing sidecars if material, authorize any Notion destination/write, and choose the audit/implementation/PRD sequencing.
