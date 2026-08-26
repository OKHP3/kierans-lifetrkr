# LifeTrkr — Vision vs. Delivery Gap Analysis and Closure Plan

**Prepared:** August 26, 2026
**Prepared by:** Claude, at Jamie's request
**Scope:** Cross-reference original vision/purpose docs in this repo against overkillhill.com/projects/, then identify in-scope items not fully implemented or delivered.

---

## 0. Website check — public link-out page delivered

The initial audit found no LifeTrkr entry on `overkillhill.com/projects/`. That
finding was subsequently addressed with a deliberately separate public
project page: [overkillhill.com/projects/kierans-lifetrkr/](https://overkillhill.com/projects/kierans-lifetrkr/).
The page returns HTTP 200 and follows the site's existing project-page pattern.
It links to the GitHub Pages app and source repository, and deep-links to the
Manifesto section that identifies Rylee Hill as Kieran; it does not embed the
app or expose the app's private Google-OAuth context.

The app itself remains deliberately "Not OKHP3-branded" per `docs/DESIGN.md`
and the README. The OverKill Hill page is therefore a public provenance and
link-out surface, not a change to the product's primary interface or ownership
model. The remaining gap work below is vision-docs versus actual shipped code
and verified runtime behavior.

## 1. Vision lineage (for context)

| Doc | Date | What it locked in |
|---|---|---|
| PRD-v1.0 | Jun 21, 2026 | Original scope: 6-tab shell, Notion backend (v2), Google Calendar read-only (v1.5), Express server |
| PRD-v2.0 / v3.0 | Jun 22, 2026 | Canonical architecture + type reference; pivoted off Express/Notion toward client-only |
| PRD-v4.0 | Jun 22, 2026 | Current build brief; supersedes v3 for planning; defines v0.2.0–v1.0.0 |
| README / replit.md | current | Client-only architecture confirmed; Notion backend explicitly "not planned for the current client-only product" |
| ROADMAP.md | last touched Jun 22, baseline note Aug 22 | Version checklist v0.1.x → v1.0.0 |
| RELEASE-TRUTH-BASELINE.md | Aug 24, 2026 | Evidence-based current-state audit at v0.1.10 |
| HANDOFF.md | current | Jamie → Kieran ownership transfer checklist (not started) |

Two scope changes are already documented and are **not** gaps: Notion-backed persistence was deliberately dropped in favor of client-only localStorage, and Express/server-side OAuth was replaced by client-side Google Identity Services. Both are settled architecture decisions, not abandoned commitments.

Everything below is checked against the actual source (`src/`, `public/`, `docs/`) as of this session, not against what older docs assumed had shipped.

## 2. Gap ledger

Confirmed by reading source directly — grep evidence noted, not inference from docs.

| # | Item | In scope per | Status | Evidence |
|---|---|---|---|---|
| 1 | Real Google Calendar + Tasks data | PRD-v1 §3.4, PRD-v4 §4 | Code complete, inert | `VITE_GOOGLE_CLIENT_ID` unset; RELEASE-TRUTH-BASELINE calls the whole integration "provisional, real-account lifecycle unproven" |
| 2 | Claude-authored daily oracle line | PRD-v4 §3, §8 | Code complete, inert | `VITE_ORACLE_WORKER_URL` unset in `oracle.ts`; falls back to the tarot card's static `meaning_up` text every day |
| 3 | Dark mode as the default theme | PRD-v3 intent, PRD-v4 §5.1 | Not done | `ThemeContext.tsx` line 18 still defaults to `'system'` |
| 4 | First-launch welcome screen | PRD-v3 §16.1, PRD-v4 §5.3 | Not built | Zero matches for welcome/onboarding/first-launch anywhere in `src/` |
| 5 | "Regenerate today's oracle" button | PRD-v4 §5.5 | Not built | `Settings.tsx` has an About card, no regenerate control |
| 6 | Mercury retrograde banner on **Calendar** tab | PRD-v4 §5.8 | Not built there | `getMercuryStatus` is wired into `Home.tsx` only; zero references in `Calendar.tsx` |
| 7 | Recurrence day-filtering verified (`isActiveToday`) | PRD-v4 §5.7 | Unverified | Function exists in `date.ts`; no test evidence it correctly excludes weekday/specific-day items |
| 8 | Offline support / service worker | README (explicitly disclaimed), PRD-v4 §6.1 | Not built | Manifest is solid; no `sw.js`, no `serviceWorker` registration anywhere |
| 9 | Cat-accent brand asset in the UI | PRD-v4 §6.2 | Not built | Asset ships in `src/assets/images/cat-accent.*`; zero references in any component |
| 10 | Drag-to-reorder in Today / Someday | PRD-v4 §6.4 | Not built | Zero drag-event code in either page |
| 11 | End-of-day review view | PRD-v4 §6.3 | Not built | Explicitly marked optional/non-blocking in the PRD — lowest priority here too |
| 12 | Performance audit (oracle re-fetch, celestial recalculation, recurrence expansion) | PRD-v4 §6.5 | Unverified | No profiling evidence either way |
| 13 | Privacy policy page | PRD-v4 §7 | Not built | No file or route matching "privacy" anywhere in the repo |
| 14 | GCP OAuth production verification | PRD-v4 §7 | Not started | App is still in Testing mode; only listed test users (Kieran) can connect |
| 15 | Manual accessibility matrix | RELEASE-TRUTH-BASELINE §6/§9 | Not run | Automated source check (`check:a11y`) passes; keyboard/screen-reader/zoom/touch matrix in `ACCESSIBILITY-CHECKLIST.md` has no recorded results |
| 16 | Storage-failure recovery UX | RELEASE-TRUTH-BASELINE §6/§9 | Unproven | Reads tolerate malformed JSON; write-failure/quota behavior isn't demonstrated |
| 17 | Live GitHub Pages smoke test | RELEASE-TRUTH-BASELINE §9 | Not run this cycle | Baseline explicitly logs this as "Not run" for the frozen candidate |
| 18 | Ownership transfer to Kieran | HANDOFF.md; the stated purpose of the whole project | Not started | GitHub repo, Replit, and GCP project are all still Jamie's; zero checklist items in `HANDOFF.md` are checked |

Item 18 is the one worth sitting with: the project's own README calls Kieran the "Intended Permanent Owner," and nothing on the transfer checklist has moved since the doc was written.

## 3. The one decision this plan can't make for you

PRD-v4 §7 commits to full Google OAuth production verification (privacy policy page + 4–6 week Google review) before v1.0.0. I checked the actual mechanics of Google's Testing-mode limits before assuming that's still the right call:

| | Testing mode (current) | Full verification (as scoped) |
|---|---|---|
| Test user cap | 100 (Kieran is 1 of 100) | Unlimited |
| Re-consent cadence | Every 7 days — Google expires test-user authorizations for sensitive scopes on a fixed schedule, no exceptions short of a Workspace admin override | Persistent, no forced re-consent |
| Cost to get there | Zero — already configured | Privacy policy page + submission + 4–6 week wait |
| Fits a single permanent user (Kieran)? | Yes, with a minor weekly tap to reconnect | Yes, but pays for a capability (public/unlimited users) this app will never use |

**Recommendation:** skip full verification. This is a single-user app for one named person, permanently. Paying for a multi-user-capable verification path — weeks of calendar time plus a privacy policy page nobody but Kieran will ever read — doesn't buy anything the app needs. Formalize "Testing mode, Kieran as the permanent test user" as the actual release model, and drop items 13 and 14 from the pre-v1.0 gate. If LifeTrkr is ever opened to a second user, that's the trigger to revisit this, not before.

That's a call worth confirming with yourself (or Kieran) before I write it into `ROADMAP.md` as the plan of record — I've built the rest of this plan assuming you take it, but say the word if you'd rather keep v0.5.0 as originally scoped.

## 4. Closure sequence

Reordered by dependency and effort, not by version number — items 3 through 7, 9, and 12 are pure code changes with no external dependency and can be knocked out in one sitting.

**Phase A — Code-only, no external setup (targets items 2*, 3, 4, 5, 6, 7, 9, 12)**
Dark-mode default, first-launch screen, regenerate-oracle button, Mercury banner on Calendar, recurrence filtering verification, cat-accent placement, performance pass. (*Item 2 needs the worker deployed — see Phase B — but the client-side call is already correct.)

**Phase B — One Google Cloud Console session (item 1, and unblocks item 2's real test)**
Create the GCP project, enable Calendar + Tasks APIs, create the OAuth client, add Kieran as a test user, set `VITE_GOOGLE_CLIENT_ID` in Replit Secrets. HANDOFF.md already estimates this at ~20 minutes. Deploy the oracle Cloudflare Worker in the same session if you're doing infra work anyway (item 2).

**Phase C — PWA polish (item 8, remainder of item 10, item 11 if you want it)**
Service worker for offline shell caching, drag-to-reorder, optional end-of-day review.

**Phase D — Verification gates, no code (items 15, 16, 17)**
Run the manual accessibility matrix, force a storage-quota/private-mode failure and document the UX, and smoke-test every hash route on the live Pages URL.

**Phase E — Ownership transfer (item 18)**
Execute `HANDOFF.md` in full: GitHub transfer, Replit fork, GCP IAM handoff, new OAuth client under Kieran's account. Already estimated at ~65 minutes total. This is the actual finish line for the project's stated purpose — everything else is groundwork for this step.

Items 13 and 14 are intentionally absent from this sequence per the recommendation in §3.

## 5. Risks

| Risk | Mitigation |
|---|---|
| 7-day re-consent (if Option in §3 is taken) annoys Kieran enough that she stops using the app | It's a single tap through a consent screen she's already approved once; worth a real trial before assuming it's friction |
| Google/tarot/horoscope third-party APIs have no SLA (documented in PRD-v4 §13) | Fallbacks already exist for all three; no action needed beyond what's shipped |
| Storage-failure UX (item 16) surfaces a real data-loss bug once tested | Test before Phase E, not after — a bug found post-handoff is Kieran's problem to report back to you |
| Skipping OAuth verification (§3) becomes wrong later if the app gets a second user | Explicit revisit trigger noted above; not a silent risk |

## 6. Next actions

- [ ] Confirm or override the §3 recommendation (skip full OAuth verification)
- [ ] Run Phase A (code-only fixes) — no prerequisites, can start immediately
- [ ] Book the GCP console session (Phase B) — the actual product promise (real Calendar/Tasks) is gated on this
- [ ] Decide whether Phase C's optional end-of-day review is worth building or cut for good
- [ ] Run Phase D's verification gates before treating anything as "release-ready"
- [ ] Execute Phase E (`HANDOFF.md`) once B–D are clear — this is the project's actual finish line
