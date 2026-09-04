# LifeTrkr — Product Scope Decision

**Decision date:** September 3, 2026  
**Applies to:** the next local-only release after `v0.1.10`  
**Decision owner:** Product owner  
**Status:** Approved scope boundary; this does not promote the app to stable or `v1.0.0`

## Decision

LifeTrkr remains a calm, browser-local personal tool. This release increment
responds to a concrete daily-use case without introducing a second storage model,
a server, Google writes, or a new review/analytics surface: a user may need to
skip one item in a Monday ritual on a travel day, or do another item only every
other Monday, without changing the rest of the parent ritual.

| Capability | Decision | Acceptance boundary |
|---|---|---|
| Persisted manual task ordering | **Required for next release** | Manual Today and Someday tasks have a stable order within each status bucket. New, moved, deleted, and reordered tasks persist through reload. Google data remains read-only and is not reordered remotely. |
| Keyboard-accessible task ordering | **Required for next release** | Every visible manual task has labelled move-up/move-down controls. Native drag is an optional pointer convenience, never the only ordering path. Disabled boundary controls remain keyboard-safe. |
| Habit times-per-day / partial completion | **Required for next release** | A habit may target 1–12 repetitions per configured calendar day. Each repetition is independently toggleable and persisted by `completionIndex`; the habit is fully done only when all repetitions are complete. Legacy `{ habitId, date }` records remain the first repetition. |
| Ritual item metadata and optional state | **Required for next release, limited form** | Ritual items support title, time, short description, and an optional marker in create/edit mode. Optional is descriptive only in this release; it does not silently change completion math. Full item-level category/tag metadata is not part of this boundary. |
| Recurrence overrides | **Required for this daily-use increment, limited form** | Each item may optionally store a `RecurrenceRule` override, including date exceptions. An item is due only when its parent template schedule and its own rule both occur; an item without an override inherits the parent schedule. The editor explains this relationship, and explicit `none` means the item is not due. No separate item calendar, backfill, or completion-history rewrite is included. |
| Ritual ordering | **Required for next release** | Items can be moved up/down with labelled keyboard controls; order is persisted through the existing routine-template storage. Existing `sortOrder` values are normalized on load. |
| End-of-day review | **Intentionally deferred** | No evening mode, reflective prompt, or review dashboard is included. Today remains the action surface; summary analytics are future work. |

## Non-goals and invariants

- No backend, sync service, database migration, or replacement for browser
  `localStorage`.
- No Google Calendar/Tasks mutation. Local copies of Google Tasks are still
  ordinary local tasks, but the Google source remains read-only.
- No changes to configured-timezone date semantics. Date-only completion records
  are not rewritten when the timezone setting changes.
- No provider credential or personal task, habit, ritual, or calendar data is
  sent to the optional oracle worker.
- No stable-release claim follows from these code changes. The owner-run Google,
  browser timezone/DST, accessibility, storage, device, worker, and handoff gates
  remain separate.

## Compatibility and verification boundary

Missing `Task.sortOrder`, `Habit.timesPerDay`, `RoutineItem.description`, and
`RoutineItem.recurrence` values are valid legacy data. Load-time defaults and the
existing storage namespace preserve those records. Existing completion records
remain intact when an item is later edited or removed. The regression suites
cover task migration/order behavior, single- versus multi-target habit
completion semantics, calendar-date recurrence, item schedule intersection,
reload persistence, and account namespaces; the full release checks remain
required after this release tree changes.

## Revisit triggers

Reconsider the remaining deferred items only when a user wants a deliberate
review/insight surface. Reconsider the broader OAuth/public-release plan only if
the product opens beyond the intended owner/test-user model.