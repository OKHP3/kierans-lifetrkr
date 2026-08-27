# Google read-only activation evidence

**Verification date:** August 27, 2026  
**Environment:** Replit Linux workspace; Vite development workflow on port 5000;
UTC-controlled local harness  
**Scope:** Google Identity Services, userinfo, Calendar read-only, and Tasks
read-only paths

## Evidence handling

No OAuth token, client ID value, email address, calendar record, task record, or
other personal Google data is stored in this record. The Replit secret inventory
confirmed that `VITE_GOOGLE_CLIENT_ID` exists; its value was intentionally not
read or printed.

## Local activation checks

| Check | Result | Evidence |
|---|---|---|
| GIS client is configured | PASS | `VITE_GOOGLE_CLIENT_ID` secret exists; the preview shows an enabled Connect Google Account action |
| Requested scopes remain least-privilege | PASS | `src/constants.ts`: `calendar.readonly`, `tasks.readonly`, `openid`, `profile`, `email` |
| Calendar reads paginate | PASS | Mocked source-path harness returned two pages and verified the second request carried `pageToken` |
| Task-list reads paginate | PASS | Mocked source-path harness returned two pages |
| Task reads paginate | PASS | Mocked source-path harness returned two pages |
| Profile read parses the subject | PASS | Mocked userinfo response returned a non-empty subject and was consumed by the profile client |
| Empty Calendar, Task List, and Task responses | PASS | Mocked 200 responses with empty item arrays returned empty arrays |
| Calendar, Tasks, and profile API errors | PASS | Mocked 403 responses became typed `GoogleApiError` values with the correct service |
| Local account namespaces | PASS (local harness) | Simulated subjects `account-a` and `account-b` retained separate task keys; no token or real record was used |
| Manual actions write to Google | PASS (source review) | Google clients contain reads only; local add/edit/complete actions dispatch to browser state |
| Expiry notification scheduling | PASS (source review) | `useGoogleAuth` schedules a render at the stored expiry boundary |
| Task loading, empty, error, populated states | PASS (source review) | Shared `useGoogleTasks` state is rendered on Today and Someday with retry |
| Calendar loading, empty, error, populated states | PASS (source review) | Calendar sync status and empty detail state are rendered; refresh remains available |
| Preview startup | PASS | Workflow restarted successfully; browser console had no application errors |
| Type/build/accessibility/artifact gates | PASS | `npm run check`, `npm run check:a11y`, `npm run build`, and `node scripts/inspect-artifact.mjs` |

## Real-account gate

The following checks were **NOT RUN** in this agent session:

- consent popup completion and expected profile display;
- populated Calendar and Tasks responses from a configured test account;
- real-account empty/error behavior;
- token expiry, reconnect, disconnect, and refresh against GIS;
- a second real Google account with before/after browser-key inventory;
- local-data preservation across a real disconnect/account switch.

The static preview tool can inspect the rendered page but cannot complete an
interactive Google consent flow or switch authenticated accounts. GCP API
enablement, authorized origins, and the test-user list are also not observable
from the Replit secret inventory. These checks therefore remain owner-run
release gates rather than being inferred from the configured client ID.

## Next action

Run the real-account matrix from `docs/HANDOFF.md` using disposable/test
accounts. Record only account labels, date, environment, pass/fail results, and
namespaced key names. Do not copy tokens, client IDs, email addresses, or Google
records into project files.