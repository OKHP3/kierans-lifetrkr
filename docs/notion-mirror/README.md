# docs/notion-mirror/ — Notion Content Mirror

> Local copies of the project's Notion pages and databases, captured so this
> information survives even without Notion access. Per `docs/HANDOFF.md`,
> Notion does not transfer to Kieran — it is a project-hub convenience for
> Jamie, not the app database and not part of the handoff. These files are
> the record that outlives that access boundary.

## Why this exists

The three canonical Notion sources for this project are the **Project Hub**
page, its index/routing card in Jamie's personal knowledge base, and the
**Jamie-to-Kieran handoff package** row in the Deliverables Tracker
database. All three were captured on **August 26, 2026** and are mirrored
here as markdown, each reconciled against the actual repo state as of that
same date — because the Notion source content itself dates from **June
21–23, 2026** and does not reflect two months of shipped work.

Treat each file below as a dated snapshot plus a reconciliation note, not
as a live source of truth. The repo's own `docs/` files (`PRD-v4.0.md`,
`ROADMAP.md`, `SESSION_LOG.md`, `RELEASE-TRUTH-BASELINE.md`,
`GAP-CLOSURE-PLAN.md`) are more current for anything that conflicts.

## Files

| File | Mirrors | Captured | Notes |
|---|---|---|---|
| [`PROJECT-HUB-SNAPSHOT.md`](./PROJECT-HUB-SNAPSHOT.md) | [Kieran's LifeTrkr — Project Hub](https://app.notion.com/p/overkillhill/Kieran-s-LifeTrkr-Project-Hub-386812e0ced481878291e92d5e428ce5) | Content dated June 23, 2026; fetched Aug 26, 2026 | Full page mirror + reconciliation against Aug 26 repo state |
| [`DELIVERABLES-TRACKER.md`](./DELIVERABLES-TRACKER.md) | [Deliverables Tracker database](https://app.notion.com/e4e7789d56904cfba6bec68df86a5965) (23 rows, linked from the Project Hub) | Rows created June 21, 2026; queried Aug 26, 2026 | Full row-by-row mirror + status reconciliation column |
| [`HANDOFF-PACKAGE.md`](./HANDOFF-PACKAGE.md) | [Jamie-to-Kieran handoff package](https://app.notion.com/p/overkillhill/Jamie-to-Kieran-handoff-package-386812e0ced481e5aae7dbdb72b415b8) | Row created June 21, 2026; fetched Aug 26, 2026 | One-row mirror + cross-check against `docs/HANDOFF.md` |

The routing card at
[Kieran's LifeTrkr](https://app.notion.com/p/overkillhill/Kieran-s-LifeTrkr-5eb45731dee84ed1a1c161cb2f286667)
is not separately mirrored — it is a blank-body index card in Jamie's
personal knowledge base confirming the Project Hub page above as canonical,
with no additional content of its own.

## Two things this mirror settles

Both were open questions carried into this session from the Notion content
itself; both are now resolved by cross-referencing the actual repo:

1. **The `[OBFUSCATED PROMPT INJECTION]` flag in `docs/DESIGN.md`.** The
   Project Hub page raises this as an active security flag. `docs/SESSION_LOG.md`
   (Session 3A, June 22) already recorded the resolution: the markers were
   only ever present in a test/spec document, never in the actual
   `docs/DESIGN.md`. A direct `grep` of the current file (277 lines) on
   Aug 26, 2026 confirms zero matches for `obfuscated` or `prompt injection`.
   No action needed; the flag was a false positive, already logged as such.
2. **The June 23, 2026 "DEPLOYMENT GAP" finding** (local work not pushed to
   GitHub `main`). `main` now carries 200 commits, including an active
   `chore: sync N file(s) to main` pattern from `scripts/sync.sh` (added
   Session 3B). The gap was resolved; the sync automation is what fixed it.

## How this relates to the other two reports in this repo

- [`docs/GAP-CLOSURE-PLAN.md`](../GAP-CLOSURE-PLAN.md) — vision-vs-delivery
  gap ledger and closure plan, written Aug 26, 2026 against `docs/PRD-v1.0.md`
  and `docs/PRD-v4.0.md`. The Deliverables Tracker mirror here is a second,
  independent ledger of the same project from a different source (Notion,
  not the PRDs) — read them together, not in isolation.
- [`.agents/skills/okhp3-equilibrium-review/benchmarks/lifetrkr-review-2026-08-26.md`](../../.agents/skills/okhp3-equilibrium-review/benchmarks/lifetrkr-review-2026-08-26.md) —
  live multi-agent evaluation of the production app, same day. Its REJECT
  finding on the Google Calendar connection is the sharpest evidence that
  the Deliverables Tracker's "Google Calendar read-only integration: Not
  Started" row (mirrored below) undersells the actual state — code exists,
  a Client ID is baked into the production bundle, and the connect button
  hangs indefinitely with no timeout. That is past "Not Started" and past
  "Not Ready" — it is broken in a specific, fixable way.

## Write-back — August 26, 2026

Since the Notion content above was confirmed stale with no ongoing value in its original form, the reconciliation findings in these four files were pushed back into Notion the same day, rather than left as a one-way, repo-only mirror:

- **Project Hub page** — a dated status-update callout was inserted at the top (original content preserved below it, matching the page's own convention of layering dated notices rather than deleting history).
- **Deliverables Tracker** — 5 existing rows had their `Status` corrected (Google Calendar read-only integration → Blocked; Google Cloud OAuth setup → In Progress; UX polish and empty states → In Progress; Documentation set → Done), each with a dated comment explaining the change. 3 rows (the Notion/Express-backend deliverables) got clarifying comments marking them architecturally obsolete rather than merely deferred, since `Status` has no "obsolete" option. 4 new rows were added for the concrete next actions this session surfaced: OAuth timeout fix, GCP origin verification, filter-chip styling fix, dark-mode-default fix.
- **Handoff package row** — status left as-is (still accurate) with a comment noting the practical blocker (the OAuth timeout fix) and a correction to the stale "Notion workspace/database strategy" language in its acceptance criteria.

The files in this folder remain the point-in-time record of what the Notion content said *before* that update, plus the same-day reasoning for each change. Notion itself is now current; these files are the audit trail for how it got there.
