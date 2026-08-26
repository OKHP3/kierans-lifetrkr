# Kieran's LifeTrkr — Handoff Notes

## Current Owner
Jamie Hill (development steward)

## Intended Permanent Owner
Kieran

---

## Release and handoff status

The frozen candidate is approved-with-limits for controlled pre-production
handoff. It is not approved as a universal stable release: published Pages
smoke testing, real Google OAuth lifecycle testing, manual accessibility
testing, and storage-failure testing remain owner-run gates. No account
transfer has been performed.

Candidate and review record: `docs/RELEASE-REVIEW-RECORD.md`.

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
- [ ] Bind the authorized GitHub connection to the Replit project
- [ ] Confirm `origin` is `https://github.com/OKHP3/kierans-lifetrkr.git`
- [ ] Use `npm run sync` for fetch-before-push reconciliation; never force-push `main`
- [ ] Confirm CI and Deploy to GitHub Pages succeed for the pushed commit
- [ ] Review `docs/GIT-SYNC.md` for remote-ahead, conflict, and rollback recovery

### GitHub
- [ ] Kieran creates GitHub account (or confirm existing)
- [ ] Jamie transfers repo: Settings → Transfer → enter Kieran's username
- [ ] Kieran accepts transfer via email invite
- [ ] Update README ownership section

### Replit
- [ ] Kieran creates Replit account (or confirm existing)
- [ ] **Fork** the Repl to Kieran's Replit account
  - WARNING: Do NOT use Replit's Transfer feature — it is immediate and irreversible with no undo
  - Fork creates a clean copy under Kieran's account; Transfer permanently removes it from Jamie's
- [ ] Re-enter all Replit Secrets in Kieran's Repl (same values, new location)
- [ ] Reconnect GitHub repo to Kieran's Repl via the Git panel
- [ ] Verify dev server runs cleanly under Kieran's account
- [ ] Archive (do not delete) Jamie's original Repl as a backup

### Secrets and recovery

- [ ] Kieran re-enters `VITE_GOOGLE_CLIENT_ID` in the new Replit Secrets store
- [ ] If the optional oracle worker is used, configure its provider credential
  only in the worker's secret store; never add it to this repository or a
  `VITE_` browser variable
- [ ] Do not copy secrets into issue reports, screenshots, release records, or
  chat
- [ ] Preserve the GitHub repository and original Repl until the first
  owner-controlled smoke test passes
- [ ] Recovery from a bad source release: use GitHub history/checkpoints to
  restore the last known-good commit, then rerun the CI and Pages artifact
  checks

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

### Google Cloud
The app uses the GIS token model. There is no Client Secret and no redirect URI.
Only a Client ID and authorized JavaScript origins are needed.
The app requests these least-privilege scopes:
`calendar.readonly`, `tasks.readonly`, `openid`, `profile`, and `email`.
Google Calendar and Google Tasks are read-only integrations; local calendar
events and local task actions never write back to Google.

- [ ] Add Kieran's Google account as Owner in the GCP project (GCP → IAM & Admin → Grant Access)
- [ ] Kieran creates new OAuth 2.0 Client ID in the project:
  - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
  - Application type: Web Application
  - Authorized JavaScript Origins ONLY (no redirect URIs needed for the token model):
    - https://okhp3.github.io (or Kieran's custom domain if set)
    - http://localhost:5173 (for dev)
- [ ] Update VITE_GOOGLE_CLIENT_ID in Kieran's Replit Secrets with the new Client ID
- [ ] Remove Jamie's account from the GCP project IAM
- [ ] Update Authorized JavaScript Origins in the old Client ID to remove any dev origins (optional cleanup)

### Final Verification
- [ ] App loads cleanly under Kieran's accounts end-to-end
- [ ] All 7 tabs function correctly (Home, Rituals, Habits, Calendar, Today, Someday, Settings)
- [ ] Google Calendar sync works under Kieran's Google account
- [ ] Google Tasks loads task lists and due-today tasks; adding one creates a separate local task
- [ ] Google Calendar all-day and timed events display correctly across the configured timezone
- [ ] Empty calendars/task lists show empty states rather than errors
- [ ] Expiring the GIS token shows reconnect guidance, and Disconnect clears the session token
- [ ] Connect, disconnect, and reconnect with a second Google account does not expose the first account's profile or local namespace
- [ ] Oracle generates and caches correctly
- [ ] README ownership section updated

## Release risk register

| Risk | Owner | Mitigation / decisive evidence | Expiry trigger |
|---|---|---|---|
| Google consent, expiry, disconnect, pagination, or account isolation differs at runtime | Kieran with Jamie during first smoke test | Disposable/test account journey using the matrix above; keep Google reads read-only | Any OAuth scope, GIS, Google API, or account change |
| Browser storage quota/private mode can lose a user edit without a visible recovery path | Jamie before public stable approval | Forced unavailable/full-storage test; document user-visible behavior and recovery | Any persistence/reducer/storage change |
| Accessibility source check misses real keyboard, screen-reader, zoom, contrast, or touch defects | Kieran owner test, Jamie records | Complete `docs/ACCESSIBILITY-CHECKLIST.md` on phone and desktop | Any shared control, dialog, navigation, or CSS change |
| Published Pages route/assets differ from the local artifact | Jamie until transfer; Kieran after transfer | Pages URL smoke test for every hash route and required asset; retain workflow URL and timestamp | Any Pages/base-path/workflow/build change |
| Optional oracle worker or third-party APIs change availability or privacy behavior | Kieran as service owner | Keep local fallback; inspect worker payload boundary and provider settings before enabling | Worker URL/provider/prompt or external API change |

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
