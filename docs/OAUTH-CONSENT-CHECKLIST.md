# Google OAuth consent readiness checklist

**Application:** Kieran's LifeTrkr  
**Current posture:** Ready for owner review and personal-use testing; **not
submitted for Google verification and not approved for unrestricted public
use**.  
**Prepared:** August 27, 2026

This is an owner-facing package for the Google Cloud Console. It records the
values that can be prepared from the current source and published artifact. It
does not submit verification, change the consent-screen audience or publishing
state, create credentials, or prove a live Google account journey.

## 1. Consent-screen copy

Use the following values unless the owner intentionally changes the product
identity and updates the privacy and release records together.

| Field | Exact value |
|---|---|
| App name | `Kieran's LifeTrkr` |
| Application homepage | `https://okhp3.github.io/kierans-lifetrkr/#/` |
| Privacy policy URL | `https://okhp3.github.io/kierans-lifetrkr/#/privacy` |
| Support email | `contact@overkillhill.com` |
| App description | `Personal life-ops hub for rituals, habits, tasks, and scheduling. Track your daily routines, build streaks, manage your calendar, and reflect — all in one dark-mode mobile-first app.` |
| App logo | `public/icons/icon-512.png`; published URL `https://okhp3.github.io/kierans-lifetrkr/icons/icon-512.png` |

The privacy URL is a client-side HashRouter route. GitHub Pages serves the
application shell and `404.html`; the app deliberately makes `/privacy`
readable before first-launch onboarding. The route is therefore stable at the
published URL even though the fragment is handled in the browser.

## 2. OAuth client configuration

- [ ] Google Calendar API is enabled in the owning Google Cloud project.
- [ ] Google Tasks API is enabled in the owning Google Cloud project.
- [ ] Create or confirm an **OAuth 2.0 Client ID** with application type
  **Web application**.
- [ ] Add these **Authorized JavaScript origins exactly**:
  - `https://okhp3.github.io`
  - `http://localhost:5000`
- [ ] Do not add a path, trailing route, or hash to an origin.
- [ ] No redirect URI is required for this GIS browser token model.
- [ ] Do not create or distribute a client secret for this static client.
- [ ] Store the public Client ID as `VITE_GOOGLE_CLIENT_ID` in the deployment
  environment. Its value is intentionally not recorded in this repository.

The development origin is port `5000` because that is the configured Vite
workflow port. If a future development workflow changes ports, update this
checklist and the GCP origin together.

## 3. Exact requested scopes

The current client sends this space-separated scope set:

```text
https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly openid profile email
```

Individual scopes:

- [ ] `https://www.googleapis.com/auth/calendar.readonly` — read Google
  Calendar events for display.
- [ ] `https://www.googleapis.com/auth/tasks.readonly` — read Google Tasks
  lists and tasks for display.
- [ ] `openid` — establish the OpenID identity subject used to namespace local
  browser records.
- [ ] `profile` — show the connected Google profile in the app.
- [ ] `email` — show the connected account email and validate the profile
  response.

There are no write scopes. Calendar and Tasks client modules use read requests
only; adding or changing a local record does not write to Google.

## 4. User-facing data-use explanation

Use or adapt this explanation in the consent-screen review notes:

> Kieran's LifeTrkr is a client-side personal life organizer. Google Calendar
> and Google Tasks read-only access lets the user view their upcoming calendar
> events, task lists, and tasks alongside local routines and habits. OpenID,
> profile, and email identify the connected browser account and keep separate
> local namespaces. The app does not create, edit, complete, or delete Google
> records. The publisher has no app database and does not receive the browser
> access token or Google records. The privacy policy explains browser storage,
> direct Google API requests, optional third-party browser services, and the
> oracle boundary.

## 5. Evidence cross-reference

Before an owner submits anything, review these records together:

- [`docs/GOOGLE-READONLY-EVIDENCE.md`](GOOGLE-READONLY-EVIDENCE.md) — local
  source-path evidence for scopes, pagination, empty/error states, profile
  subject handling, local namespaces, and read-only behavior.
- [`docs/RELEASE-TRUTH-BASELINE.md`](RELEASE-TRUTH-BASELINE.md) — current
  evidence tiers and release gates.
- [`docs/HANDOFF.md`](HANDOFF.md) — ownership, support, secret handling, and
  owner-run Google lifecycle matrix.
- Published policy:
  `https://okhp3.github.io/kierans-lifetrkr/#/privacy`

The evidence is strong for source and simulated API behavior. It does not
replace a real-account consent, profile, expiry, disconnect, account-switch,
or production-origin journey.

## 6. Personal-use versus public approval

### Personal-use readiness

- [x] The app works without Google as a local browser app.
- [x] The policy describes the current client-only data and service boundary.
- [x] The client requests read-only Calendar and Tasks scopes.
- [x] A public support address and privacy URL are recorded.
- [ ] Owner runs the real Google lifecycle matrix with a disposable/test
  account and records only redacted results.

### Future multi-user/public path

- [ ] Owner confirms the Google Cloud project, APIs, origins, support contact,
  logo, and test-user/audience settings.
- [ ] Owner decides whether the consent screen should move from testing to
  production.
- [ ] If required by Google's review process, owner submits the exact scopes
  and supporting privacy/use explanation for verification.
- [ ] Owner records Google's decision and any requested scope or copy changes.
- [ ] Only after approval and live-account evidence, update the release posture;
  do not treat this checklist as approval.

The current product is a personal-use static application. A future
multi-user/public approval would be an external Google decision and a separate
release gate, not something this repository can claim or complete.