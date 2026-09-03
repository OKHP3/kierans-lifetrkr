# Kieran's LifeTrkr — Current Architecture

**Status:** Current as of September 3, 2026
**Scope:** Client-only release architecture

This document describes the architecture that is actually shipped. It is
current architecture documentation, not a stable-release approval. The
application baseline is `v0.1.10` and the release posture is
`approve-with-limits` for controlled pre-production. See
`docs/VISION-DELIVERY-MATRIX.md` for the vision-to-delivery evidence boundary.
Earlier
Express, Notion, Vercel, and server-backed OAuth proposals are historical and
are not part of the current application.

## Runtime shape

LifeTrkr is a React and TypeScript single-page application built with Vite.
GitHub Pages serves the static production bundle from the repository subpath
`/kierans-lifetrkr/`. `HashRouter` keeps every supported route refreshable on a
static host.

```
Browser
├── React UI and client state
├── Browser storage
│   ├── guest or Google-subject namespaces for app records
│   ├── sessionStorage for Google access tokens
│   └── browser-level theme preference
├── Google Identity Services token flow
│   └── read-only Calendar and Tasks API requests
└── Optional oracle worker
    └── Claude wording request without personal app records
```

There is no Express server, application database, Notion sync layer, or
publisher-managed user account system. Local routines, habits, tasks, manual
calendar entries, settings, and oracle cache remain in the user's browser.

## Google boundary

Google Identity Services provides an in-browser OAuth token for the configured
public client ID. The app requests read-only Calendar and Tasks access only.
Calendar and Tasks data is fetched directly from Google's APIs, paginated, and
kept separate from local records. Disconnecting or switching accounts clears
the active Google data and loads the namespace for the new Google subject.

The Google access token remains in the browser session and is never committed
to the repository or sent to an application backend.

## Oracle boundary

Tarot, celestial calculations, caching, and the deterministic fallback run in
the browser. Claude wording is optional and uses `VITE_ORACLE_WORKER_URL` when
configured. The worker receives only the daily celestial summary, tarot
meaning, and optional selected sun sign. Personal profile, task, habit,
calendar, and routine records are not sent to the oracle.

The provider credential belongs only in the worker's secret configuration. A
provider key must never be placed in a `VITE_` variable or shipped in the
browser bundle.

## Deployment and maintenance

- Development: `npm run dev`
- Production validation: type-check, accessibility source check, Vite build,
  and generated artifact inspection
- Deployment: GitHub Actions publishes the Vite artifact to GitHub Pages
- Supported routing: `/`, `/rituals`, `/habits`, `/calendar`, `/today`,
  `/someday`, `/settings`, and `/origin`

See `README.md`, `docs/DEPLOYMENT-CHECKLIST.md`, and
`docs/RELEASE-TRUTH-BASELINE.md` for setup, deployment, and evidence status.

# Kieran's LifeTrkr — PRD Amendment 01 (Historical)
**Amends:** Kieran's LifeTrkr PRD v1.0  
**Date:** June 21, 2026  
**Subject:** Replit-native build architecture + Jamie-to-Kieran account transition plan  
**Status:** Historical reference — does not describe the current application

> **Current architecture:** LifeTrkr is a client-only React/Vite SPA deployed as
> static files to GitHub Pages. It uses `HashRouter`, browser `localStorage` for
> user data, session storage for the Google access token, and direct browser
> requests to Google APIs and optional public oracle providers. There is no
> Express server, application database, or publisher-managed credential
> boundary in the shipped app. See `README.md` and
> `docs/RELEASE-TRUTH-BASELINE.md` for the current source-backed description.
>
> The sections below preserve the approved Replit-native proposal for historical
> context. They are not implementation instructions for the current codebase.

---
