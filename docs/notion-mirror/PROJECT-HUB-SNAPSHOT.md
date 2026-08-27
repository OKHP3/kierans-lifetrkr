# Notion Mirror — Kieran's LifeTrkr — Project Hub

**Source:** https://app.notion.com/p/overkillhill/Kieran-s-LifeTrkr-Project-Hub-386812e0ced481878291e92d5e428ce5
**Notion content dated:** June 23, 2026
**Fetched:** August 26, 2026
**Parent:** "jmhDb — Jamie's Brain" (Jamie's personal knowledge base workspace)

This is a mirror of the page content as Notion currently holds it, followed
by a reconciliation section comparing each claim against the repo's actual
state on August 26, 2026. Read the reconciliation before acting on anything
in the mirror below — the mirror is two months stale.

---

## Reconciliation against Aug 26, 2026 repo state

| Notion claim (June 23) | Current repo state (Aug 26) |
|---|---|
| Version live: v0.1.8 | `src/constants.ts` → `APP_VERSION = 'v0.1.10'`. Two point releases shipped since this page was last touched. |
| 🔐 Security remediation in progress — `VITE_ANTHROPIC_API_KEY` baked into client bundle via direct fetch | **Resolved.** `src/lib/oracle.ts` now calls `VITE_ORACLE_WORKER_URL` (Cloudflare Worker proxy), not a direct Anthropic fetch. `.env.example` documents the Worker as the correct path and explicitly notes "the browser never receives that key." |
| 🚨 Security flag — `[OBFUSCATED PROMPT INJECTION]` lines in `docs/DESIGN.md` | **False positive, already logged as resolved.** `docs/SESSION_LOG.md` (Session 3A, June 22) records: markers were only in a test/spec document, never in the actual file. Direct `grep -i "obfuscated\|prompt injection"` against the current 277-line `docs/DESIGN.md` returns zero matches. |
| `VITE_GOOGLE_CLIENT_ID` — ❌ Not set | **Set.** A real OAuth Client ID (`130627305463-...apps.googleusercontent.com`) is baked into the production bundle as of this session's live evaluation. |
| v0.2.0 (Google Calendar + Tasks live) → 🔜 NEXT | **Attempted, not working.** Live evaluation (Aug 26, 2026) confirms clicking "Connect Google Account" hangs indefinitely — no error, no console output, no network request, no timeout in `useGoogleAuth.requestToken()`. See the equilibrium review below. This is worse than "not started," and better framed as "wired but broken," not on the Notion roadmap's own terms. |
| GCP Project — Not yet created — ⚠️ BLOCKER | Superseded — a Client ID exists and is deployed, so a GCP project and OAuth client have since been created. Whether its Authorized JavaScript Origins correctly match `https://okhp3.github.io` is the leading unresolved hypothesis for the connect-button hang. |
| 6 tabs listed in "Current Product Shape" (Home, Rituals, Habits, Calendar, Today, Archive, Settings — actually 7) | Current app ships 8 routes including `#/origin` (Origin Story page), not reflected in this Notion page at all. |
| "Archive *(renamed from Someday)*" | Current app's live route/tab is named **Someday**, not Archive — the rename direction implied here does not match the shipped app. |
| Manual steps still required: commit doc fixes, bump `APP_VERSION`, `npm run build`, update GitHub About description | Doc fixes and version bump are done (v0.1.10). GitHub repo About description was not independently checked this session. |

---

## Mirrored page content (as captured, June 23, 2026)

> 🔐 **Security remediation in progress — Oracle API key exposure**
> The June 22 build session baked `VITE_ANTHROPIC_API_KEY` into the client bundle via direct browser fetch. This was identified on June 22 and is being corrected. The Cloudflare Worker proxy (PRD-v4.0.md Section C0) is the correct implementation. A Replit instruction prompt has been issued to remove all direct Anthropic references from the source and switch to `VITE_ORACLE_WORKER_URL`. Do NOT deploy to gh-pages until Replit confirms the `dist/` grep for `ANTHROPIC_API_KEY` returns empty.

> ✅ **Documentation corrections applied — June 22, 2026 (8 corrections)**
> **Vyrle:** Locked permanently across all docs. Ralph v0.0 → Vyrle v1.0 → Jamie v2.0 → Kieran v3.0.
> **PRD-v1.0.md:** Archived status header added.
> **PRD-v3.0.md:** v0.3.0 marked SHIPPED EARLY (features delivered in v0.1.1–v0.1.8).
> **PRD-v4.0.md:** Vyrle/Virgil open question marked RESOLVED.
> **HANDOFF.md:** Notion database transfer section removed (Notion is project hub only, not app DB). GCP section updated for token model (no Client Secret, no redirect URIs). 6 tabs → 7 tabs. NOTION_API_KEY warning removed. Handoff time corrected to ~65 min.

> 🚨 **Security flag:** docs/DESIGN.md in the GitHub repo contains two `[OBFUSCATED PROMPT INJECTION]` lines inserted by the Replit agent session. The clean output version has these removed. Check the DESIGN.md commit history in GitHub to understand origin.
> *(See reconciliation table above — confirmed a false positive, already closed out in `SESSION_LOG.md`.)*

> ⚠️ **Manual steps still required:** (1) Commit corrected doc files. (2) Edit `src/constants.ts` in Replit: APP_VERSION `v0.1.0` → `v0.1.8`. (3) `npm run build` — confirm no TS errors. (4) Update GitHub repo About description (still says "Notion in Phase 2"). Do NOT deploy until owner review.

> ⚠️ **Architecture Updated — June 21, 2026 (Father's Day / Summer Solstice)**
> The project has undergone a significant architectural pivot since this page was initially created. The Express backend, Replit-as-host, and Notion-as-database approach have all been replaced with a purely client-side architecture. PRD v2.0 is the current reference document (superseded again since by PRD-v4.0.md). Sections below reflect the state as of this page's last edit.

### Current Status (per Notion, June 22, 2026)

Live at v0.1.8. Second build session complete. Celestial engine, three-layer oracle stack, recurrence system, category picker, and full Calendar overhaul shipped. Advanced from v0.1.0 (UI shell only) to v0.1.8 — pulling most of the planned v0.3.0 feature set forward ahead of schedule.

### Phase / Roadmap (per Notion)

- v0.1.x — UI Shell + Celestial Engine + Three-Layer Oracle + Recurrence + Categories → SHIPPED — June 22, 2026
- v0.2.0 — Google Calendar + Tasks live (activate `VITE_GOOGLE_CLIENT_ID`) → NEXT
- v0.3.0 — Close remaining gaps: dark default, first-launch flow, Settings About section, oracle Regenerate button → Planned
- v0.4.0 — PWA + brand assets + polish (offline, add-to-home-screen, og-image) → Planned
- v0.5.0 — OAuth verification + privacy policy (GCP app verification submission) → Planned
- v1.0.0 — Production — Google-verified, Kieran-owned account handoff complete → Reserved

### What's Live Now (v0.1.8, per Notion)

All 7 navigation tabs functional (Home, Rituals, Habits, Calendar, Today, Archive, Settings); `celestial.ts` (moon phase, astro season, Mercury retrograde through 2027); `cosmic.ts`; `oracle.ts` three-layer stack; `useOracle.ts`; `OracleCard.tsx`; `RecurrenceEditor.tsx`; `CategoryPicker.tsx` (31 categories); `TagInput.tsx`; `FilterBar.tsx`; Settings Oracle & Celestial section; Calendar moon-phase cells and oracle panel; Home celestial row and Mercury Rx banner.

Wired but awaiting environment keys (per Notion, now stale — see reconciliation): Google Calendar + Tasks blocked by `VITE_GOOGLE_CLIENT_ID`; Claude oracle message falls back without `VITE_ANTHROPIC_API_KEY`; horoscope requires `birthSign`.

### Three-Layer Oracle Stack (per Notion)

```
Layer 1 — Tarot
  API: tarotapi.dev/api/v1/cards/random?n=1
  Auth: none required
  CORS: enabled
  Cache: daily localStorage cache (lifetrkr:{sub}:tarot:{YYYY-MM-DD})

Layer 2 — Horoscope
  API: freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}
  Auth: none required
  Requires: sun sign set in Settings -> Oracle & Celestial
  Note: free third-party API, no SLA; fails silently

Layer 3 — Claude Oracle Message
  Model: claude-sonnet-4-5
  Method: direct browser fetch with anthropic-dangerous-direct-browser-access: true header
  Seed: moon phase + astrological season + tarot card + optional sun sign
  Output: 2-3 sentence mystical oracle message
  Requires: VITE_ANTHROPIC_API_KEY (Replit Secret)
  Cache: daily localStorage cache (lifetrkr:{sub}:oracle:{YYYY-MM-DD})
  Fallback: tarot card upright meaning when key is absent
```

Note: Layer 3's method as documented here (direct browser fetch with the Anthropic key) is the pre-remediation design. The current repo implements the Cloudflare Worker proxy instead (`VITE_ORACLE_WORKER_URL`) — see reconciliation table.

### Environment Variables (per Notion, June 23 — now stale, see reconciliation)

- `VITE_GOOGLE_CLIENT_ID` — Google Calendar + Tasks OAuth (GIS token flow) — listed as not set; now set in the production build.
- `VITE_ANTHROPIC_API_KEY` — listed as the activation path for the Claude oracle; superseded by `VITE_ORACLE_WORKER_URL` in the current repo.

### Project Brief (per Notion)

Kieran's LifeTrkr is a father-daughter personal software project for Kieran, initially incubated by Jamie using Jamie's Replit, GitHub, and Notion accounts, with a later transition path to Kieran's own accounts. The app is a mobile-first, dark-mode life organization dashboard focused on routines, habits, calendar visibility, active to-dos, and a master someday list.

### Product Thesis (per Notion)

Kieran's LifeTrkr should feel like personal software: useful first, emotionally resonant second, and never performative. Core product question: "What does today require from me, and what rhythm helps me move through it?"

### Design Direction (per Notion)

Motif: Moonlit Hearth. Calm, warm, moonlit, softly mystical, cat-adjacent, and personally meaningful. Avoid goth, horror, gamer-dark, cyberpunk, heavy occult styling, and visible OverKill Hill branding in the primary interface. Suggested tone: Stevie-Nicks-adjacent without direct celebrity imagery, lyrics, likeness, or costume-witch treatment.

### Architecture Direction v2.0 — Client-Only (per Notion)

No server, no publisher-managed database. All data lives in the user's browser. The OAuth handshake happens entirely client-side via Google Identity Services (GIS) — Jamie never sees, stores, or is responsible for user credentials or data.

Stack: React 18 + Vite + TypeScript + Tailwind CSS; React Router v6 HashRouter; GIS client-side token model (no Client Secret); Google Calendar/Tasks APIs called directly from the browser; localStorage for user data (namespaced by Google `sub` ID); sessionStorage for the access token only (expires in 1 hour, never sent to a server).

Removed from the original design: Express.js backend, Replit as deployment host, Notion as app database, server-side OAuth flow, Vercel serverless functions (never built).

Hosting: GitHub Pages (static, free). Build environment: Replit. Source of truth: GitHub repo `OKHP3/kierans-lifetrkr`. Live URL: https://okhp3.github.io/kierans-lifetrkr/

Multi-user model: any visitor clicks Connect Google Account and the app is theirs; all data stays in their own browser; no account system, no passwords; the Google `sub` ID namespaces localStorage keys so multiple accounts on one device stay isolated.

### Key Decisions Locked (per Notion)

- No server, no backend, no publisher-managed database — client-only by design.
- Notion is not the app database; it serves as this project hub only.
- Google OAuth uses the GIS token model (Client ID only, no Client Secret, no server callback).
- Google Tasks is in scope alongside Google Calendar — same consent popup, same token.
- MIT license — open source, freely forkable.
- Moonlit Hearth aesthetic — Stevie Nicks adjacent, warmly mystical, not goth, not OKHP3-branded.
- Tab labels: Home, Rituals, Habits, Calendar, Today, Archive, Settings. *(Current shipped app uses "Someday," not "Archive," for that tab — see reconciliation.)*
- Seasonal Easter egg for solstices, equinoxes, and the eight Wiccan sabbats.
- Generational Easter egg in an `App.tsx` comment block: Ralph v0.0 -> Vyrle v1.0 -> Jamie v2.0 -> Rylee (Kieran) v3.0. These refer to Hill family generations, not software releases.
- Semantic versioning discipline: v1.0.0 is reserved for the first stable, Google-verified, Kieran-owned production release.

### Governance rule (per Notion)

"Use the tracker as the source of truth for delivery status. Do not let Replit prompts, chat summaries, or ad hoc notes become the operating ledger." See `DELIVERABLES-TRACKER.md` in this same folder for the mirrored ledger.

### Linked sub-pages (not separately mirrored this pass)

- Repo Doc Repair Prompt — June 22, 2026
- Ecosystem Connections — OKHP3 Repo Map
- Agent Skills Audit — LifeTrkr Skills Inventory & Publishing Plan
- DEPLOYMENT GAP — Local Work Not Pushed to GitHub Main *(content summarized in the README's "two things this mirror settles" section — confirmed resolved via current `git log` on `main`)*
- okhp3-skill-cataloger — Skill Documentation

These four (minus DEPLOYMENT GAP, addressed above) are OKHP3-ecosystem meta-documentation about repo structure and skill publishing, not LifeTrkr product/vision content — out of scope for this mirror unless you want them pulled in too.
