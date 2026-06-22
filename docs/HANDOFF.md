# Kieran's LifeTrkr — Handoff Notes

## Current Owner
Jamie Hill (development steward)

## Intended Permanent Owner
Kieran

---

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

### Google Cloud
The app uses the GIS token model. There is no Client Secret and no redirect URI.
Only a Client ID and authorized JavaScript origins are needed.

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
- [ ] All 7 tabs function correctly (Home, Rituals, Habits, Calendar, Today, Archive, Settings)
- [ ] Google Calendar sync works under Kieran's Google account
- [ ] Oracle generates and caches correctly
- [ ] README ownership section updated

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
