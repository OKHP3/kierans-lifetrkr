---
name: App data schema v3.0
description: localStorage schema for LifeTrkr v3.0 — key differences from v2.0
---

## Key differences from v2 (JSX) schema

### Routine templates
- **v2:** `{ Sun: RoutineItem[], Mon: RoutineItem[], ... }` — object keyed by 3-letter abbrev
- **v3:** `RoutineTemplate[]` — array, one per day, with `dayOfWeek: DayOfWeek` (full name like `'Monday'`), `id`, `name`, `items: RoutineItem[]`
- Template IDs default to the lowercase full day name (e.g. `'monday'`)

### Completions
- **v2 routineCompletions:** `{ [itemId_date]: boolean }` flat object
- **v3 routineCompletions:** `RoutineCompletion[]` — `{ date, routineTemplateId, completedItemIds: string[] }`
- **v2 habitCompletions:** `{ [habitId_date]: boolean }` flat object
- **v3 habitCompletions:** `HabitCompletion[]` — `{ habitId, date }`

### Task status values
- **v2:** `'Today'` | `'Done'` | `'Backlog'` (capitalized)
- **v3:** `'today'` | `'done'` | `'backlog'` (lowercase)

### Storage namespace
- **v2:** single key `lifetrkr_state` (JSON blob)
- **v3:** per-entity keys under `lifetrkr:{sub}:{entity}` where sub = Google user ID or `'guest'`
- Profile stored separately at `lifetrkr:profile` (no namespace)

**Why:** Cleaner typed schema; array-based completions are easier to query; namespacing enables per-user data isolation when Google auth is added.

**How to apply:** When querying completions, always `.find()` or `.some()` on the arrays. Never use bracket notation like `completions[key]`.
