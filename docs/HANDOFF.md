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
| Notion | Jamie | Phase 2 — not yet active |
| Google Cloud | Jamie | Phase 1.5 — pending setup |
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

### Notion
Two options. Pick one based on timing and Kieran's readiness.

**Option A — Share and promote (faster, good immediately post-build):**
- [ ] Share each Notion database with Kieran as a workspace member
- [ ] Kieran creates a new Notion integration under her own account
- [ ] Update NOTION_API_KEY in Kieran's Replit Secrets

**Option B — Clean break (better long-term separation):**
- [ ] Kieran creates her own Notion workspace
- [ ] Re-create all 5 database schemas (see docs/PRD.md Section 5)
- [ ] Export data from Jamie's databases as CSV (Notion → ... → Export → CSV)
- [ ] Import CSV data into Kieran's databases
- [ ] Kieran creates new Notion integration
- [ ] Update NOTION_API_KEY and all NOTION_*_DB_ID values in Kieran's Replit Secrets

Recommendation: Option A first. Option B when Kieran is ready to fully own the workspace independently.

### Google Cloud
- [ ] Add Kieran's Google account as Owner in the GCP project (GCP → IAM & Admin → Grant Access)
- [ ] Kieran creates new OAuth 2.0 credentials in the project (APIs & Services → Credentials → Web Application)
- [ ] Add Kieran's Replit deployment URL to authorized redirect URIs:
  `https://[kieran-repl-name].[kieran-username].repl.co/api/google/callback`
- [ ] Update GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in Kieran's Replit Secrets
- [ ] Remove Jamie's account from the GCP project IAM

### Final Verification
- [ ] App loads cleanly under Kieran's accounts end-to-end
- [ ] All 6 tabs function correctly
- [ ] Google Calendar sync works under Kieran's Google account
- [ ] Notion data persists correctly across sessions
- [ ] README ownership section updated

---

## Critical Warnings

1. Never commit API keys, OAuth secrets, or Notion tokens to the GitHub repo. All secrets live in Replit Secrets only.
2. Do not use Replit's Transfer feature. Fork instead. Transfer is immediate and irreversible.
3. Rotate and deactivate Jamie's NOTION_API_KEY after Kieran's new integration is active.
4. Google OAuth redirect URIs must match exactly in GCP before OAuth will function. A mismatch produces a silent 400 error.

---

## Estimated Handoff Time

| Step | Estimate |
|---|---|
| GitHub transfer | 5 min |
| Replit fork + re-enter secrets | 20 min |
| Notion Option A | 15 min |
| Notion Option B | 30 min |
| Google Cloud transfer + new credentials | 20 min |
| Smoke test | 15 min |
| **Total (Option A path)** | **~75 min** |
| **Total (Option B path)** | **~90 min** |

---

*Prepared by Jamie Hill · Kieran's LifeTrkr*
