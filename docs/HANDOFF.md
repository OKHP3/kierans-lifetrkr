# Kieran's LifeTrkr — Handoff Notes

## Current Owner
Jamie Hill (development steward; verified August 27, 2026)

## Intended Permanent Owner
Kieran

---

## Release and handoff status

The published candidate is approved-with-limits for controlled pre-production
handoff. It is not approved as a universal stable release: real Google OAuth
lifecycle testing, manual accessibility testing, real browser storage-failure
testing, and the owner handoff rehearsal remain owner-run gates. The published
Pages artifact and required asset read-back passed for the recorded commit. No
account transfer has been performed. This execution pass completed the
reversible source-control and release verification work, but it did not perform
an account transfer without Kieran's authorization.

**Handoff execution date:** August 27, 2026
**Execution performer:** Replit Agent
**Published source after safe reconciliation:** `de5fa3a369174d9975ffa0f9af7b47b03b8e2e21`
**Execution status:** `BLOCKED — owner-controlled transfer and service-account steps remain`

Candidate and review record: `docs/RELEASE-REVIEW-RECORD.md`.
Current capability crosswalk: `docs/VISION-DELIVERY-MATRIX.md`.
Google activation evidence: `docs/GOOGLE-READONLY-EVIDENCE.md`.
Privacy notice: `https://okhp3.github.io/kierans-lifetrkr/#/privacy`.
OAuth owner checklist: `docs/OAUTH-CONSENT-CHECKLIST.md`.

## Accounts Currently Used

| Service | Account | Status |
|---|---|---|
| GitHub | Jamie | Active — source repo |
| Replit | Jamie | Active — build environment |
| Notion (project hub only) | Jamie | Not the app database — Notion hosts the project management hub only. No transfer needed. |
| Google Cloud | Jamie | Active — GCP project "LifeTrkr" |
| Google Calendar | Kieran | Required — must be Kieran's Google account for OAuth |

---

## Transfer Checklist

### Source control synchronization
- [x] Bind the authorized GitHub connection to the Replit project — August 27, 2026, Replit Agent; healthy bound GitHub connection confirmed through the repository API.
- [x] Confirm `origin` is `https://github.com/OKHP3/kierans-lifetrkr.git` — August 27, 2026, Replit Agent; embedded credentials removed from local Git configuration.
- [x] Delete/revoke the previously exposed GitHub personal access token in GitHub Settings → Developer settings → Personal access tokens — owner confirmation received after the remote was normalized; the bound Replit GitHub connection remains the approved synchronization path.
- [x] Use `npm run sync` for fetch-before-push reconciliation; never force-push `main` — August 27, 2026, Replit Agent; remote-ahead history was preserved with a non-force merge and guarded API publication.
- [x] Confirm CI and Deploy to GitHub Pages succeed for the pushed commit — August 27, 2026, Replit Agent; CI run [33033411237](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33033411237) and Pages run [33033411233](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33033411233) both succeeded.
- [x] Review `docs/GIT-SYNC.md` for remote-ahead, conflict, and rollback recovery — August 27, 2026, Replit Agent; the documented non-destructive recovery path was used.

### GitHub
- [ ] **BLOCKED — owner action:** Kieran creates or confirms a GitHub account; no Kieran username or authorization was available in this environment.
- [ ] **BLOCKED — owner action:** Jamie transfers repo through GitHub Settings after Kieran's account is confirmed.
- [ ] **BLOCKED — owner action:** Kieran accepts the transfer invitation.
- [ ] **PENDING TRANSFER:** Update README ownership section only after the transfer is accepted; it correctly continues to name Jamie as steward for now.

### Replit
- [ ] **BLOCKED — owner action:** Kieran creates or confirms a Replit account.
- [ ] **BLOCKED — owner action:** **Fork** the Repl to Kieran's Replit account
  - WARNING: Do NOT use Replit's Transfer feature — it is immediate and irreversible with no undo
  - Fork creates a clean copy under Kieran's account; Transfer permanently removes it from Jamie's
- [ ] **BLOCKED — owner action:** Re-enter all Replit Secrets in Kieran's Repl (same values, new location)
- [ ] **BLOCKED — owner action:** Reconnect GitHub repo to Kieran's Repl via the Git panel
- [ ] **BLOCKED — owner action:** Verify dev server runs cleanly under Kieran's account; the current Jamie-owned Repl did run cleanly on August 27, 2026
- [ ] **BLOCKED — owner action:** Archive (do not delete) Jamie's original Repl as a backup

### Secrets and recovery

- [ ] **BLOCKED — owner action:** Kieran re-enters `VITE_GOOGLE_CLIENT_ID` in the new Replit Secrets store
- [ ] **BLOCKED — owner action if applicable:** If the optional oracle worker is used, configure its provider credential
  only in the worker's secret store; never add it to this repository or a
  `VITE_` browser variable
- [x] Do not copy secrets into issue reports, screenshots, release records, or chat — August 27, 2026, Replit Agent; only secret names/status were handled and no credential values were recorded
- [x] Preserve the GitHub repository and original Repl until the first owner-controlled smoke test passes — August 27, 2026, Replit Agent; no deletion or Replit transfer was attempted
- [ ] **OWNER REHEARSAL PENDING:** Recovery from a bad source release: use GitHub history/checkpoints to restore the last known-good commit, then rerun the CI and Pages artifact checks. The procedure is documented in `docs/GIT-SYNC.md`; a live owner rehearsal was not run

### Support and incident path

Until transfer, Jamie is the development/support contact. After transfer,
Kieran owns first-line support and decides whether to disable Google or the
optional oracle worker. For a suspected privacy or credential incident:
1. disconnect Google in the app and revoke the affected OAuth grant in Google;
2. rotate the affected provider credential in its own secret store;
3. preserve the commit, workflow run, and browser timestamp without copying
   tokens or personal records;
4. pause public promotion and review the risk register in the release record.

The app has no publisher database or server-side user-data recovery. Local
browser storage is the user's data store; clearing site data can remove it.
Privacy questions and support requests currently go to
`contact@overkillhill.com`. The published privacy notice describes the current
personal-use implementation; it is not evidence that Google production
verification or unrestricted public approval is complete.

### Google Cloud
The app uses the GIS token model. There is no Client Secret and no redirect URI.
Only a Client ID and authorized JavaScript origins are needed.
Use `docs/OAUTH-CONSENT-CHECKLIST.md` for the exact consent-screen copy, logo,
privacy URL, support details, origins, scope string, and the boundary between
personal-use readiness and future public approval.
The app requests these least-privilege scopes:
`calendar.readonly`, `tasks.readonly`, `openid`, `profile`, and `email`.
Google Calendar and Google Tasks are read-only integrations; local calendar
events and local task actions never write back to Google.

- [ ] **BLOCKED — owner action:** Add Kieran's Google account as Owner in the GCP project (GCP → IAM & Admin → Grant Access)
- [ ] **BLOCKED — owner action:** Kieran creates new OAuth 2.0 Client ID in the project:
  - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
  - Application type: Web Application
  - Authorized JavaScript Origins ONLY (no redirect URIs needed for the token model):
    - https://okhp3.github.io (or Kieran's custom domain if set)
    - http://localhost:5000 (for dev)
- [ ] **BLOCKED — owner action:** Update VITE_GOOGLE_CLIENT_ID in Kieran's Replit Secrets with the new Client ID
- [ ] **BLOCKED — owner action:** Remove Jamie's account from the GCP project IAM
- [ ] **OPTIONAL OWNER CLEANUP:** Update Authorized JavaScript Origins in the old Client ID to remove any dev origins

### Final Verification
- [ ] **BLOCKED — owner action:** App loads cleanly under Kieran's accounts end-to-end
- [ ] All 7 tabs function correctly (Home, Rituals, Habits, Calendar, Today, Someday, Settings)
- [ ] **BLOCKED — owner action:** Google Calendar sync works under Kieran's Google account
- [ ] **BLOCKED — owner action:** Google Tasks loads task lists and due-today tasks; adding one creates a separate local task
- [ ] **BLOCKED — owner action:** Google Calendar all-day and timed events display correctly across the configured timezone
- [ ] **BLOCKED — owner action:** Empty calendars/task lists show empty states rather than errors
- [ ] **BLOCKED — owner action:** Expiring the GIS token shows reconnect guidance, and Disconnect clears the session token
- [ ] **BLOCKED — owner action:** Connect, disconnect, and reconnect with a second Google account does not expose the first account's profile or local namespace
- [ ] **BLOCKED — owner action:** With disposable/test data, seed guest plus two Google subjects with distinct historical completion dates; change each timezone, reload, and confirm dates remain unchanged and no namespace shows another's records. Record only labels, dates, results, and redacted key names.
- [ ] **SOURCE/LOCAL PASS; OWNER RUNTIME PENDING:** Oracle generates and caches correctly; local fallback and simulated worker states passed on August 27, 2026
- [ ] **PENDING TRANSFER:** README ownership section updated after the transfer is actually accepted

### Execution evidence recorded August 27, 2026

| Area | Result | Performer / evidence |
|---|---|---|
| Release gate | PASS for bounded pre-production handoff; not stable/v1.0 approval | Replit Agent; `docs/RELEASE-REVIEW-RECORD.md` remains `approve-with-limits` |
| Source and artifact | PASS | Replit Agent; `npm run check`, `npm run check:a11y`, `npm run test:sync`, `npm run build`, artifact inspection, and production audit |
| Preview | PASS under current Jamie-owned Repl | Replit Agent; workflow restarted on port 5000, desktop first-launch capture had no application console errors |
| Published deployment | PASS for shell/assets and CI/Pages transport | Replit Agent; current commit and run links recorded above; route-specific authenticated rendering remains unclaimed |
| Account transfer, secret re-entry, GCP IAM/client, and owner smoke | BLOCKED / NOT RUN | Owner action required; no irreversible transfer was attempted |

## Release risk register

| Risk | Owner | Mitigation / decisive evidence | Expiry trigger |
|---|---|---|---|
| Google consent, expiry, disconnect, pagination, or account isolation differs at runtime | Kieran with Jamie during first smoke test | Disposable/test account journey using the matrix above; keep Google reads read-only | Any OAuth scope, GIS, Google API, or account change |
| Browser storage quota/private mode can lose a user edit without a visible recovery path | Jamie before public stable approval | Source-path harness now confirms visible warning and retry for throwing/silent non-persisting storage; real browser quota/private-mode journey remains required | Any persistence/reducer/storage change |
| Accessibility source check misses real keyboard, screen-reader, zoom, contrast, or touch defects | Kieran owner test, Jamie records | Complete `docs/ACCESSIBILITY-CHECKLIST.md` on phone and desktop | Any shared control, dialog, navigation, or CSS change |
| Published Pages route/assets differ from the local artifact | Jamie until transfer; Kieran after transfer | Current commit passed Pages URL, hash-shell, required-asset, and clean-build hash read-back; retain workflow URL and timestamp | Any Pages/base-path/workflow/build change |
| Optional oracle worker or third-party APIs change availability or privacy behavior | Kieran as service owner | Keep local fallback; inspect worker payload boundary and provider settings before enabling | Worker URL/provider/prompt or external API change |
| Privacy copy, consent details, or public approval status drifts from the client behavior | Jamie until transfer; Kieran after transfer | Keep `docs/OAUTH-CONSENT-CHECKLIST.md`, the published privacy route, and the evidence records aligned; never claim Google verification from source evidence alone | Any data flow, scope, support contact, origin, or consent-screen change |

---

## Critical Warnings

1. Never commit API keys, OAuth secrets, or GCP credentials to the GitHub repo. All secrets live in Replit Secrets only.
2. Do not use Replit's Transfer feature. Fork instead. Transfer is immediate and irreversible.
3. Google OAuth authorized JavaScript origins must match exactly in GCP before auth will function. A mismatch produces a silent error.

---

## Estimated Handoff Time

| Step | Estimate |
|---|---|
| GitHub transfer | 5 min |
| Replit fork + re-enter secrets | 20 min |
| Notion hub page (read access for Kieran) | 5 min — share the Notion project hub page with Kieran's account as viewer |
| Google Cloud transfer + new Client ID | 20 min |
| Smoke test | 15 min |
| **Total** | **~65 min** |

---

*Prepared by Jamie Hill · Kieran's LifeTrkr*
