# Performance checks

**Verification date:** August 27, 2026  
**Scope:** Oracle, celestial calculations, and Calendar recurrence rendering

## Checks

| Area | Check | Result |
|---|---|---|
| Oracle | The fetch effect is keyed to oracle settings and an explicit regenerate action; the daily reading is also cached by user and date. | Pass |
| Celestial | Home memoizes moon, season, and Mercury status for the current local date. Calendar memoizes the visible month's moon labels and cosmic event map. | Pass |
| Calendar | Recurrence expansion is derived during render from the visible calendar state; there is no scroll listener or background recalculation loop. Editing a form does not recalculate the visible month's moon labels. | Pass |

## Boundary notes

- This is a client-only app. No background sync, server storage, or push
  processing was added.
- The offline worker precaches the built app shell, not Google responses,
  oracle-worker responses, fonts, or localStorage records.
- Task ordering was not changed because no owner approval for persisted Today
  or Someday ordering was recorded for this release.

## Repeatable verification

```sh
npm run check
npm run check:a11y
npm run build
node scripts/inspect-artifact.mjs
node --check public/sw.js
```