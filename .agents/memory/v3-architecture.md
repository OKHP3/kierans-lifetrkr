---
name: v3.0 architecture decisions
description: Key architectural choices made in the TypeScript migration (v3.0)
---

## Rules

1. **No Express server.** All API calls go client-side. The only backend is the Google APIs (Calendar, Tasks, userinfo).
2. **HashRouter required.** GitHub Pages doesn't support HTML5 history API. All routes use `#/path`.
3. **Google Identity Services (GIS) — token flow.** `window.google.accounts.oauth2.initTokenClient`. Token stored in `sessionStorage`. CDN loaded via `<script src="https://accounts.google.com/gsi/client">` in index.html.
4. **One env var only.** `VITE_GOOGLE_CLIENT_ID` — a public OAuth client ID, safe to embed in client code. Set as Replit Secret or `.env`. App degrades gracefully if missing.
5. **gh-pages npm package** for deployment. `npm run deploy` = `tsc && vite build && gh-pages -d dist`. Pushes `/dist` to the `gh-pages` branch. No GitHub Actions workflow needed.
6. **src/ at project root** (not client/src/). Vite root is the workspace root.
7. **Settings is not a BottomNav tab.** 6 tabs in BottomNav, 7 items in SideNav (adds Settings). Settings also accessible via gear icon in Home header.
8. **vite.config.ts base** = `'/kierans-lifetrkr/'` when `NODE_ENV === 'production'`, `'/'` for dev.

**Why:** PRD v2.0 approved by Kieran Hill. The Express server was removed to eliminate the server-side complexity and enable pure gh-pages static deployment.

**How to apply:** Any future Google API call should go through `useGoogleAuth.getToken()` then fetch directly to googleapis.com. Never add a server proxy.
