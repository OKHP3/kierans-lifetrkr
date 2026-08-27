# LifeTrkr — Vision/Purpose vs. Delivered State: Gap Analysis and Closure Plan

**Prepared:** August 26, 2026
**Scope:** Kieran's LifeTrkr (`OKHP3/kierans-lifetrkr`), source baseline `v0.1.10`
**Method:** Cross-referenced README, PRD v1-v4, ROADMAP, RELEASE-TRUTH-BASELINE, RELEASE-REVIEW-RECORD, HANDOFF, the July 22 context-thread audit, and `overkillhill.com/projects/`, against actual `src/` behavior (verified by direct grep/read, not doc claims alone).

---

## Executive summary

- **LifeTrkr isn't on `overkillhill.com/projects/`, and that's correct, not a gap.** The README explicitly states the app is "Not OKHP3-branded" — it's a father-daughter personal project (Jamie + Kieran), MIT-licensed, intentionally kept off the OKHP3 professional site. No inconsistency to fix here.
- **Core product vision is real and mostly shipped.** The seven surfaces (Home, Rituals, Habits, Calendar, Today, Someday, Settings), the client-only/no-publisher-database architecture, Moonlit Hearth design language, recurrence engine, celestial math, and the three-layer oracle stack all exist in source and match the stated vision.
- **Two previously-flagged security/privacy risks are resolved.** The July 22 context audit flagged (a) a direct-browser Anthropic key exposure risk and (b) a Google Calendar write-scope conflicting with the "read-only" promise. Current code has neither: `SCOPES` is `calendar.readonly` + `tasks.readonly` only, `googleCalendar.ts` has no write/create/delete functions, and there's no `VITE_ANTHROPIC_API_KEY` reference anywhere in `src/`. Recent commit history ("Prove Google integrations are read-only and paginated", "Bound oracle delivery and disclose privacy behavior") confirms this was deliberate remediation, not accident.
- **Nine in-scope items from the app's own roadmap (v0.2.0-v0.5.0) remain undelivered**, most consequentially: Google Calendar/Tasks are wired but never activated against a real account, the Claude oracle layer has never generated a genuine AI message (falls back to static tarot text), there's no first-launch experience, and zero of the four ownership-handoff-to-Kieran steps have been performed.
- **The release evidence gates the project set for itself are also unmet.** Per `RELEASE-TRUTH-BASELINE.md`, published-Pages smoke test, real Google OAuth lifecycle, manual accessibility matrix, and storage-failure recovery are all "Not run." The project's own review record already reflects this honestly (`approve-with-limits` for pre-production only, `defer-for-evidence` for stable/v1.0).
- **One doc-hygiene defect:** `docs/ARCHITECTURE.md` is still literally "PRD Amendment 01" describing the superseded Express + Notion + Vercel backend — but the README's own docs table cites it as "Client-only architecture decisions and rationale." Anyone (including Kieran, during handoff) reading it as current would be misled. No disclaimer banner exists on this file, unlike PRD-v1-v4 and ROADMAP, which all carry one.
- **Net:** this is a well-run, honestly self-audited pre-production build with a real gap between "vision" and "delivered," but the gap is already itemized in the project's own docs. The value-add here is verifying those claims against actual code and turning the scattered checklist into a single prioritized closure sequence.

---

## Finding 1: overkillhill.com/projects/ cross-check

`overkillhill.com/projects/` lists eight "Built at the Hill" projects (Skillz Forge, Found-Rᵧ, Mermaid Theme Builder, BPMN for Mermaid, Mac Studio Local AI Workbench, Prompt Forge, Glee-fully Chai Chasers, Abrahamic Reference Engine) plus three external-tool links. LifeTrkr appears in none of it.

That's consistent with the repo's own positioning, not a discrepancy:

| Signal | Where stated |
|---|---|
| "Not OKHP3-branded" | `README.md`, Design System section |
| Personal origin, not a Hill build | `README.md` Origin section — Father's Day build session, Jamie + Kieran |
| Ownership intent | Transfers to Kieran personally, not retained as an OKHP3 property (`docs/HANDOFF.md`) |

**No action needed on this axis.** If Jamie ever wants LifeTrkr referenced from the OKHP3 site (e.g., as a case study in father-daughter AI-assisted building, without claiming it as an OKHP3 product), that's a separate branding decision, not a vision-delivery gap.

---

## Finding 2: In-scope items not fully delivered

Verified directly against `src/`, not just doc claims. "In-scope" = appears in README, PRD v1-v4, or ROADMAP v0.1.x-v1.0.0 (excludes "Post-v1.0 Ideas," which the roadmap itself marks not scheduled).

| # | Item | Vision source | Delivered state | Verified in code |
|---|---|---|---|---|
| 1 | Dark mode as default first-launch experience | README ("dark-mode personal life OS"), ROADMAP v0.1.x known gap, PRD-v4 §5.1 | **Not done.** Theme defaults to `'system'`. On a light-OS device, first launch is light/parchment, not the intended Moonlit Hearth dark aesthetic. | `ThemeContext.tsx`: `loadThemePref` returns `'system'` when nothing is saved |
| 2 | First-launch welcome screen | PRD-v3.0 §16.1, ROADMAP v0.3.0 | **Not built.** No conditional welcome/onboarding flow exists; app renders the normal shell immediately, Google or not. | `App.tsx` has no first-launch branch; grep for "first launch"/"welcome" flow found nothing beyond the existing connect button |
| 3 | Google Calendar + Tasks live against a real account | README (core feature), ROADMAP v0.2.0, PRD-v4 §4 | **Wired, never activated.** All client code exists (`googleCalendar.ts`, `googleTasks.ts`, `useGoogleAuth.ts`) but `VITE_GOOGLE_CLIENT_ID` has never been set and no real-account lifecycle test has run. | `RELEASE-TRUTH-BASELINE.md` §4/§9: "Provisional; real-account lifecycle unproven," "Not run" |
| 4 | Claude-generated daily oracle message | README, PRD-v4 §3/§8 (canonical oracle spec) | **Never live.** Oracle worker (`VITE_ORACLE_WORKER_URL`) has never been deployed; every oracle message shown to date is the static tarot `meaning_up` fallback, not an AI-generated line. | `RELEASE-TRUTH-BASELINE.md` §4: "Worker deployment is optional; local tarot meaning is the public fallback" |
| 5 | Settings "Regenerate today's oracle" button | ROADMAP v0.3.0, PRD-v4 §5.5 | **Not built.** About section exists, but no regenerate control anywhere in `Settings.tsx`. | Grep for "Regenerate" in `src/pages/Settings.tsx`: no match |
| 6 | Recurrence `isActiveToday()` behavior verified for habits/rituals | ROADMAP v0.3.0, PRD-v4 §5.7 | **Unverified.** Logic exists in `date.ts` but no manual test of weekday/specific-day filtering has been recorded. | `PRD-v4.0.md` §15 checklist item unchecked; no test artifact found |
| 7 | PWA offline support (service worker) | README architecture table, ROADMAP v0.4.0 | **Code complete; device verification remains.** A hand-written, versioned worker precaches the built shell and same-origin assets. README and `DEPLOYMENT-CHECKLIST.md` state the narrower offline claim and external-service limits. | `public/sw.js`, production-only registration in `src/main.tsx`, and `scripts/prepare-service-worker.mjs` |
| 8 | Cat-accent brand asset placed in UI | PRD-v4 §6.2, ROADMAP v0.4.0 | **Asset exists, unused.** `cat-accent.png`/`.webp` sit in `src/assets/images/` with zero references in any component. (App icon, banner, and og-image *are* correctly wired — that part of §6.2 is done.) | Grep across `src/**/*.tsx` for "cat-accent": no match |
| 9 | Drag-to-reorder tasks (Today/Someday) | ROADMAP v0.4.0 | **Not built.** No drag handlers anywhere in source. | Grep for `draggable`/`onDragStart`: no match |
| 10 | Privacy policy page + GCP OAuth production verification | ROADMAP v0.5.0, PRD-v4 §7 | **Not started.** No privacy page exists in `src/pages/`; OAuth consent screen is still in Testing mode by implication (no verification submission recorded anywhere). | No `Privacy*.tsx` found; no evidence of submission in any doc |
| 11 | Ownership handoff to Kieran | README Ownership section, `docs/HANDOFF.md` | **0 of ~20 checklist items done.** GitHub repo, Replit project, and GCP project are all still Jamie's. No transfer has been initiated. | `docs/HANDOFF.md` — every checklist line is an open `[ ]` |
| 12 | Release evidence gates (own bar, not external) | `RELEASE-TRUTH-BASELINE.md` §6, `RELEASE-REVIEW-RECORD.md` | **4 of 4 "not run" gates still not run:** published Pages smoke test, real Google OAuth lifecycle, manual accessibility matrix, forced storage-failure recovery test. | `RELEASE-TRUTH-BASELINE.md` §9 baseline snapshot table |
| 13 | `docs/ARCHITECTURE.md` describes current architecture | README docs table claims "Client-only architecture decisions and rationale" | **Wrong document.** File is literally titled "PRD Amendment 01," describes the superseded Express + Notion + Vercel/Replit-server design, and carries no superseded/historical banner (PRD-v1-v4 and ROADMAP all do). | `docs/ARCHITECTURE.md` lines 1-15 |

### Resolved since the last audit (worth confirming closed, not re-opening)

| Item | Prior concern (July 22 context audit) | Current verified state |
|---|---|---|
| Oracle API key exposure | `oracle.ts` allegedly still called Anthropic directly from the browser via `VITE_ANTHROPIC_API_KEY` | No such reference exists anywhere in `src/`. Only historical mentions remain in `docs/SESSION_LOG.md` (a log, not an active instruction). |
| Google Calendar write scope | Scopes included `calendar.events` plus create/delete functions, contradicting the "read-only" product promise | `SCOPES` in `constants.ts` is `calendar.readonly` + `tasks.readonly` only. `googleCalendar.ts` exposes only `fetchCalendarEvents` and `fetchGoogleProfile` — no write path exists. |
| APP_VERSION display bug | Roadmap listed "APP_VERSION not bumped, displays v0.1.0" | `constants.ts` correctly reads `v0.1.10`, matching `package.json`. |
| Brand icon/banner/og-image wiring | PRD-v4 §6.2 listed these as "exist but not used" | `index.html` and `manifest.json` correctly reference all of them; only `cat-accent` remains unintegrated. |

---

## Options for closing the gap

| Option | What it does | Tradeoff |
|---|---|---|
| **A. Sequential roadmap execution** (v0.2.0 → v0.3.0 → v0.4.0 → v0.5.0 → v1.0.0, as already planned) | Follow the existing ROADMAP/PRD-v4 order exactly | Clean, matches all existing docs, no replanning cost. But front-loads a hard external dependency (GCP OAuth setup, which only Jamie or Kieran can do manually) before the cheaper UI-polish items in v0.3.0/v0.4.0, so the highest-effort blocker sits first in the queue. |
| **B. Cheap-wins-first, re-sequenced** | Do the ~1-day items first regardless of version number: dark-mode default, first-launch screen, Regenerate button, cat-accent placement, `docs/ARCHITECTURE.md` fix — then tackle Google/oracle activation and handoff | Delivers visible, testable progress fast and fixes the doc-drift issue immediately. Slight risk of version-number churn (you'd be shipping v0.3.0-scope work before v0.2.0 is "done"), but the project has already done this once (pulled v0.3.0 work into v0.1.8 per PRD-v4 §1) so it's a proven pattern here. |
| **C. Freeze feature work, close evidence gates first** | Stop adding scope; run the four "not run" release-evidence checks (Pages smoke test, OAuth lifecycle, accessibility matrix, storage-failure test) against the current v0.1.10 candidate before building anything else | Directly answers "is what's shipped actually solid," which is the more urgent question than "what's still missing." Costs calendar time up front with no new visible feature progress, which may feel like it stalls momentum on what's otherwise a fast-moving two-person project. |

---

## Recommendation

**Option B, with Option C's evidence gates folded in as the gating step before any Google/oracle activation work.**

Reasoning: the cheap-wins items (dark default, first-launch screen, Regenerate button, cat-accent, the `ARCHITECTURE.md` fix) are all small, self-contained, and don't touch anything with real-world consequences. They should just get done. The Google/oracle activation items and the handoff checklist, by contrast, are exactly what `RELEASE-TRUTH-BASELINE.md` says they are: provisional until tested against a real account, real published URL, and real assistive technology. Doing the evidence-gate work right after the cheap wins (not after full v0.2.0-v0.5.0 build-out) means you find out whether the client-only architecture actually holds up under a real Google account and a real published Pages deploy before sinking more build time into features layered on top of it. Sequencing evidence before more feature work is cheaper than discovering an OAuth or storage-isolation bug after v0.4.0/v0.5.0 are built on top of it.

Straight sequential roadmap execution (Option A) isn't wrong, just slower to first real signal, since GCP setup is a hard external dependency that can sit blocked for days while cheaper wins pile up behind it for no reason.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| GCP OAuth setup (the actual blocker on v0.2.0, v0.5.0, and real evidence gates) is a manual, external, one-time task that can't be scripted or delegated to an agent session | Treat it as its own tracked action item with an owner and a date, not a rolled-up "next" roadmap bullet. It's the single highest-leverage unblock in this whole list. |
| `docs/ARCHITECTURE.md` misleads a reader (especially Kieran, post-handoff) into thinking the app still has an Express/Notion backend | Add the same "Baseline notice" banner pattern already used in PRD-v4.0.md and ROADMAP.md, or replace the file's content with a short current-architecture summary that points to README's architecture section as canonical |
| Oracle worker activation reintroduces the exact key-exposure risk that was already fixed once | Follow PRD-v4 §10's stated pattern exactly: `ANTHROPIC_API_KEY` only ever as a Cloudflare Worker secret, never a `VITE_` variable. The current code already enforces this by omission; just don't regress it when the worker gets deployed. |
| Storage-quota/private-mode failure test has never been run, and silent data loss during a real ritual/habit-tracking session would undermine user trust in a "your data stays yours" product | Run the forced-failure test (`RELEASE-TRUTH-BASELINE.md` §9) before public stable release, not after. This is Jamie's item per the risk register in `HANDOFF.md`. |
| Handoff to Kieran (repo, Replit, GCP) has zero steps completed, and Replit's Transfer feature is explicitly irreversible if used by mistake | Follow `HANDOFF.md`'s fork-not-transfer warning literally; don't let time pressure at handoff time cause a shortcut through the checklist |

---

## Next actions

- [ ] Fix `docs/ARCHITECTURE.md`: add a superseded-doc banner (matching PRD-v1-v4 style) or replace its content with the current client-only architecture, since the README docs table currently points readers to a wrong description
- [ ] Set `ThemeContext.tsx` default to `'dark'` when no saved preference exists (PRD-v4 §5.1 — smallest fix on this list)
- [ ] Build the first-launch welcome screen per PRD-v3.0 §16.1 / PRD-v4 §5.3
- [ ] Add the "Regenerate today's oracle" button to Settings (PRD-v4 §5.5)
- [ ] Place `cat-accent.png` in one tasteful UI location (PRD-v4 §6.2)
- [ ] Manually verify `isActiveToday()` weekday/specific-day filtering for habits and rituals (PRD-v4 §5.7) and record the result
- [ ] Run the GCP OAuth one-time setup (new project, enable Calendar + Tasks APIs, create OAuth Client ID, add Kieran as test user) — this single item unblocks v0.2.0, v0.5.0, and two of the four release-evidence gates
- [ ] After GCP setup: run the real-account Google Calendar/Tasks lifecycle test (connect, refresh, expire, disconnect, second-account isolation)
- [ ] Deploy the oracle Cloudflare Worker and activate `VITE_ORACLE_WORKER_URL`, confirming the Anthropic key never appears in the client bundle
- [ ] Run the published-Pages smoke test, manual accessibility matrix, and forced storage-failure test — the three remaining release-evidence gates
- [ ] Begin the Kieran ownership handoff checklist in `docs/HANDOFF.md` once the above evidence gates are closed

---

## Suggested follow-ups

- Want me to draft the `docs/ARCHITECTURE.md` replacement content now, using README's architecture section as the source of truth?
- Want a second pass specifically on `docs/PRD-v3.0.md` (1,632 lines, not fully read line-by-line here) to check for any additional Section-16-style UI specs that haven't made it into ROADMAP as tracked items?
- Should the "Post-v1.0 Ideas" list (push notifications, end-of-week review, custom themes, Notion sync) get its own lightweight tracking doc, or stay informal until v1.0 ships?
- Want me to check the actual GitHub Actions workflow runs (not just the workflow file) to confirm the last few deploys actually went green, as a quick proxy for the "published Pages smoke test" gate?
