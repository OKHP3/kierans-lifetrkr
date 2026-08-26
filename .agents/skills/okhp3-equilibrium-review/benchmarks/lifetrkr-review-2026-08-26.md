# LifeTrkr — Equilibrium Review

**Date:** August 26, 2026
**Protocol:** okhp3-equilibrium-review (conditional, 5-role)
**Target:** https://okhp3.github.io/kierans-lifetrkr/#/ (production, v0.1.10)
**Decision question:** Is the live app fully functional for its stated single-user purpose, and does the Google Calendar/Tasks connection specifically work correctly end-to-end?
**Release decision: REJECT** (both overall and for the Google connection specifically)

---

## What was reviewed

The live production site, not the source in isolation. Method: Claude in Chrome drove a real browser through all 8 routes, checked console/network output, source-read the two files that implement Google auth, then instrumented and clicked "Connect Google Account" twice from a fresh reload. That evidence dossier (11 sections, E1-E11) was then run through the actual okhp3-equilibrium-review protocol: three independent reviewers (evidence, outcome, safety/portability), each blind to the others' conclusions, then a negotiator since the three materially disagreed. The protocol says a disruptor only runs when the initial three agree — they didn't, so it was correctly skipped, not omitted for convenience.

## What was decided

Two decisions, since you asked about the app in general and the Google connection specifically:

| | Decision |
|---|---|
| App overall | **Reject** |
| Google Calendar/Tasks connection | **Reject** |

Not approve-with-limits. The negotiator's reasoning: the failures are concrete and reproducible (theme default, chip styling), or structurally guaranteed to recur (no OAuth timeout) — not speculative or borderline.

## Where the reviewers converged and diverged

All three agreed on the raw facts: all 8 routes load clean, the app defaults to light theme on a fresh visit (not the documented dark default), Calendar/Rituals/Habits filter chips render as broken outlined text while Someday's render fine, and clicking Connect Google Account produces an indefinite hang with zero console output and zero network requests.

Where they split was verdict, not fact. Outcome and Safety/Portability both landed on reject. Evidence landed on approve-with-limits — not because it disagreed the app has problems, but because it caught the dossier overclaiming in two places: calling the hang "indefinite" from a ~3-4 second observation, and ruling out an app-side cause for the hang when zero network requests is at least as consistent with the app never reaching Google's API as with Google silently failing after a real attempt. That's a genuine, useful correction — it changes *why* the connection is broken, not *whether* it is.

## Strongest surviving objection

The Evidence reviewer's challenge to the root-cause framing survived and reshaped the final decision: nobody can currently say whether this is a Google Cloud Console misconfiguration (Authorized JavaScript Origins not matching `https://okhp3.github.io`), a FedCM/third-party-cookie policy issue, or even the scripted click not registering as a browser-trusted gesture. The negotiator didn't need to resolve that to reject the connection, though — `useGoogleAuth.requestToken()` has no timeout, confirmed in source and uncontested by all three reviewers. A flow that only works when Google's callback fires, with no fallback when it doesn't, fails the "clear, recoverable error, not a silent hang" bar regardless of which of the three causes is actually at play.

## What's approved, limited, deferred, or rejected, and why

**Rejected, both overall and for Google connection specifically.** Three of five acceptance criteria fail on solid evidence:

1. Route sweep — **passes.** All 8 routes, zero console errors.
2. Design-system consistency — **fails.** Calendar/Rituals/Habits filter chips are a confirmed, screenshotted visual regression against Someday's working chips.
3. Google connect — **fails.** Indefinite hang, no error, no recovery path but a page reload. This is the one you asked about most, and it's the one most clearly broken.
4. No unhandled errors — **partial.** True for everything tested, but nothing was tested past navigation and one button click — no task/habit/ritual was ever actually created or saved.
5. Dark-mode default — **fails.** Confirmed live; matches a gap I'd already logged in source earlier this session.

---

## Findings ledger

| ID | Finding | Status | Consequence |
|---|---|---|---|
| Theme | Fresh visit renders light "Morning Parchment," not documented dark default | Supported | Fails criterion 5; cosmetic but confirmed, reproducible |
| FilterBar | Calendar/Rituals/Habits chips render as unstyled outlined text vs. Someday's working pills | Supported | Fails criterion 2; likely a scoped component regression |
| Google connect (symptom) | Click → permanent "Connecting…," zero error, zero console, zero network requests, twice | Supported | Fails criterion 3; the app's core value proposition is unreachable |
| Google connect (structural cause) | `requestToken()` has no timeout — hangs forever if GIS's callback never fires, for any reason | Supported (source-confirmed) | Will recur for any future silent GIS failure, not just this session's |
| Google connect (root cause) | GCP origin mismatch vs. FedCM/cookie policy vs. non-trusted scripted click | **Unresolved** | Determines whether this is your bug to fix or Google's config to fix |
| CRUD/persistence | Add-task, complete-habit, log-ritual, save-Settings never actually exercised | Blocked (not tested) | Criterion 4 only partially cleared |
| Mobile viewport | Resize tooling failed silently; BottomNav layout unverified | Blocked (tooling failure) | Not a finding about the app either way |
| Accessibility | No keyboard/screen-reader/zoom pass ever run | Carried forward | Open risk for a permanent daily-use tool |

## Recommendation

Fix the timeout first, regardless of root cause. Add a 10-15 second circuit-breaker to `requestToken()` that surfaces the existing (correctly-written) error UI if GIS's callback never fires. That alone turns "broken forever with no feedback" into "fails visibly, user can retry" — which is most of what criterion 3 actually wants, independent of whatever's misconfigured upstream.

Then have Kieran click it herself, for real, while you watch her whole screen (not a tab-scoped tool) — that's the one test that actually distinguishes "GCP origin mismatch," "FedCM/cookie policy," and "scripted clicks don't count as trusted gestures" from each other, and no amount of further automated poking from here will settle it.

The theme default and the FilterBar styling are both small, code-only fixes with no external dependency — worth doing in the same pass as the timeout since you'll already be in the file.

## Risks if you ship as-is

- Kieran hits the same silent hang, assumes the app is broken (it functionally is, for that feature), and stops trusting it for the one integration that was the headline promise of the original PRD.
- The missing timeout isn't a one-time bug — it'll resurface identically the next time GIS has a bad day, a cookie setting changes, or a browser update touches third-party-cookie policy.

## Next actions

- [ ] Add a timeout/circuit-breaker to `useGoogleAuth.requestToken()`
- [ ] Have Kieran do one real, watched, non-automated click-through of Connect Google Account
- [ ] Verify Authorized JavaScript Origins in Google Cloud Console match `https://okhp3.github.io` exactly
- [ ] Fix `ThemeContext`'s default (or update the docs, if the intent actually changed)
- [ ] Align the Calendar/Rituals/Habits filter-chip styling with Someday's working version
- [ ] Exercise real CRUD flows (add/complete/save, reload, confirm persistence) before trusting criterion 4
- [ ] Re-run this review once the above lands — the record above is the baseline to diff against

---

*Full per-role findings (all material_findings entries, evidence_ids, and next_test fields for all three initial reviewers plus the negotiator's complete rationale) are in the accompanying `equilibrium-review-record.json` and in this session's workflow journal.*
