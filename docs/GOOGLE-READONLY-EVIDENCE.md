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

## Disposable browser privacy matrix

**Verification date:** September 4, 2026
**Environment:** Chromium 152 headless on the Replit Linux workspace, isolated
temporary browser profile, local Vite app at `http://127.0.0.1:5000`
**Data boundary:** disposable labels and placeholder GIS responses only. No real
Google account, token, email address, Google record, or completion content was
read or written to this repository.

The browser harness used the rendered Settings page, changed each timezone
through the visible selector, reloaded the page, switched between one guest
namespace and two disposable Google-subject namespaces, and inspected only
redacted key names plus date fields needed for the pass/fail result.

| Profile label | Timezone change | Routine date retained | Habit date retained | Reload/isolation |
|---|---|---:|---:|---|
| guest | `America/Los_Angeles` → `Asia/Tokyo` | `2026-08-31` | `2026-09-01` | PASS |
| subject-a | `Europe/London` → `Australia/Sydney` | `2026-07-15` | `2026-07-16` | PASS |
| subject-b | `America/New_York` → `Pacific/Auckland` | `2026-06-10` | `2026-06-11` | PASS |

Observed redacted localStorage key names were:
`lifetrkr:welcomed`, `lifetrkr:<profile>:settings`,
`lifetrkr:<profile>:routineTemplates`,
`lifetrkr:<profile>:routineCompletions`, `lifetrkr:<profile>:habits`, and
`lifetrkr:<profile>:habitCompletions`. Subject identifiers were not recorded.

| Browser journey | Result | Boundary |
|---|---|---|
| Disconnect disposable subject-a | PASS — profile and session keys cleared; subject-a history remained in its namespace | App disconnect path with placeholder session |
| Reconnect disposable subject-b | PASS — connected UI/profile label and subject-b history restored | App connect path with stubbed GIS/userinfo |
| Expired session and banner recovery | PASS — paused-sync banner appeared; reconnect restored a future expiry and cleared the banner | App token lifecycle path with placeholder GIS callback |
| Write failure / quota analogue | PASS — welcome flow remained available and the visible storage warning plus retry action appeared | Chromium page with `Storage.prototype.setItem` forced to throw |
| Native Chromium incognito persistence | PASS — write/read worked within the session; probe was absent after browser restart | Incognito browser process, temporary profile |

This closes disposable real-browser evidence for namespace isolation,
historical-date preservation, disconnect/reconnect state handling, token
expiry/recovery UI, and browser storage failure handling. It does **not** prove
Google consent, Google API responses, or account switching against real Google
accounts; those remain owner-run release gates.

## Real-account gate

The following checks were **NOT RUN** in this agent session:

- consent popup completion and expected profile display;
- populated Calendar and Tasks responses from a configured test account;
- real-account empty/error behavior;
- token expiry, reconnect, disconnect, and refresh against GIS;
- a second real Google account with before/after browser-key inventory;
- local-data preservation across a real disconnect/account switch.

The disposable browser matrix above covers the application state transitions
without exposing personal data, but it intentionally does not complete an
interactive Google consent flow or call Google APIs. GCP API enablement,
authorized origins, and the test-user list are also not observable from the
Replit secret inventory. These real-account checks therefore remain owner-run
release gates rather than being inferred from the configured client ID.

## Next action

Run the real-account matrix from `docs/HANDOFF.md` using disposable/test
accounts. Record only account labels, date, environment, pass/fail results, and
namespaced key names. Do not copy tokens, client IDs, email addresses, or Google
records into project files.