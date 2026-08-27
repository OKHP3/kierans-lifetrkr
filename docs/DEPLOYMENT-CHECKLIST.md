# Installation and deployment checklist

## Clean checkout

Use Node.js 20.19+ and npm 10+:

```sh
npm ci
npm run check
npm run check:a11y
npm audit --omit=dev --audit-level=high
npm run build
node scripts/inspect-artifact.mjs
```

`npm ci` must not mutate `package-lock.json`. The artifact check verifies the
Pages fallback, manifest, icons, favicon, OG image, and repository-subpath-safe
metadata.

## GitHub Pages acceptance

After the Pages workflow completes, verify:

- `https://okhp3.github.io/kierans-lifetrkr/` loads the app shell.
- `/#/`, `/#/today`, `/#/rituals`, `/#/habits`, `/#/calendar`,
  `/#/someday`, `/#/settings`, `/#/origin`, and `/#/privacy` load without a
  server 404. Open `/#/privacy` in a clean browser profile to confirm the
  first-launch screen does not obscure the policy.
- `/kierans-lifetrkr/manifest.json`, `/favicon.svg`,
  `/icons/icon-192.png`, `/icons/icon-512.png`, and `/og-image.png` return
  successfully.
- The manifest offers installation and the standalone layout opens.
- Reloading a hash route preserves the route.

- `/kierans-lifetrkr/sw.js` returns the versioned shell worker, and the build
  injects the same-origin hashed app assets into its precache list.
- After one successful online load, disable network access and reload `/#/` and
  `/#/today`: the shell and local records remain available.
- While offline, Google Calendar/Tasks remain read-only and show a failed or
  paused network state; the optional network oracle wording does not pretend to
  have succeeded. Local tarot/celestial fallback may still render.
- Re-enable network access, reload, and confirm the next worker version replaces
  the prior `lifetrkr-shell-*` cache without leaving stale application assets.

## Evidence record — August 27, 2026

### Pre-push transport check

From the Replit Linux workspace, the public Pages host returned HTTP 200 for
the app shell, `404.html`, `manifest.json`, `favicon.svg`,
`icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`,
`icons/favicon-32.png`, and `og-image.png`. The shell also rendered from a
hash URL in a browser capture without application console errors.

The remote `main` SHA at this point was the older published candidate, not the
storage-failure repair being reviewed. Therefore these results are a transport
check only and do not close the published-identity gate. Hash fragments are
client-side and cannot be tested by plain HTTP requests; each supported
fragment must be opened in a browser after the deployment workflow completes.

### Final publication record

**Verification date:** August 27, 2026
**Published commit:** `de5fa3a369174d9975ffa0f9af7b47b03b8e2e21`
**Workflow runs:** [CI #33033411237](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33033411237) — success; [Deploy to GitHub Pages #33033411233](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33033411233) — success
**Environment:** Replit Linux workspace, public GitHub Pages over HTTPS; browser capture at desktop 1920×1080; no Google account or token used

The deployed shell and a clean build from the published commit use the same
hashed entrypoints: `assets/index-BwqnZ0EM.js` and
`assets/index-BGT3dLhJ.css`. The public SHA-256 hashes matched the clean local
build for `index.html`, `404.html`, both entrypoints, `manifest.json`,
`favicon.svg`, `icons/icon-192.png`, `icons/icon-512.png`,
`icons/apple-touch-icon.png`, `icons/favicon-32.png`, and `og-image.png`.

| Public URL path | HTTP | Content type |
|---|---:|---|
| `/` | 200 | `text/html; charset=utf-8` |
| `/404.html` | 200 | `text/html; charset=utf-8` |
| `/manifest.json` | 200 | `application/json; charset=utf-8` |
| `/favicon.svg` | 200 | `image/svg+xml` |
| `/icons/icon-192.png` | 200 | `image/png` |
| `/icons/icon-512.png` | 200 | `image/png` |
| `/icons/apple-touch-icon.png` | 200 | `image/png` |
| `/icons/favicon-32.png` | 200 | `image/png` |
| `/og-image.png` | 200 | `image/png` |
| `/assets/index-BwqnZ0EM.js` | 200 | `application/javascript; charset=utf-8` |
| `/assets/index-BGT3dLhJ.css` | 200 | `text/css; charset=utf-8` |

The supported fragment URLs `#/`, `#/calendar`, `#/today`, `#/rituals`,
`#/habits`, `#/someday`, `#/settings`, `#/origin`, and `#/privacy` each returned
the same HTTP 200 SPA shell (fragments are client-side and are not sent to the
server). The Replit browser capture rendered the current first-launch shell
without application console errors. Route-specific authenticated content was
not claimed because no interactive authenticated browser path was available.