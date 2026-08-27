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
  `/#/someday`, `/#/settings`, and `/#/origin` load without a server 404.
- `/kierans-lifetrkr/manifest.json`, `/favicon.svg`,
  `/icons/icon-192.png`, `/icons/icon-512.png`, and `/og-image.png` return
  successfully.
- The manifest offers installation and the standalone layout opens.
- Reloading a hash route preserves the route.

Offline behavior is intentionally not claimed: there is no service worker.
Test the installed shell while online and record browser/OS results rather
than treating localStorage persistence as offline app support.

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
**Published commit:** `b3d19b526608501e64faf468c5a995cf45399410`
**Workflow runs:** [CI #33031353223](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33031353223) — success; [Deploy to GitHub Pages #33031353237](https://github.com/OKHP3/kierans-lifetrkr/actions/runs/33031353237) — success
**Environment:** Replit Linux workspace, public GitHub Pages over HTTPS; browser capture at desktop 1920×1080; no Google account or token used

The deployed shell and a clean build from the published commit use the same
hashed entrypoints: `assets/index-CqpsoH4Q.js` and
`assets/index-DxwRTKsr.css`. The public SHA-256 hashes matched the clean local
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
| `/assets/index-CqpsoH4Q.js` | 200 | `application/javascript; charset=utf-8` |
| `/assets/index-DxwRTKsr.css` | 200 | `text/css; charset=utf-8` |

The supported fragment URLs `#/`, `#/calendar`, `#/today`, `#/rituals`,
`#/habits`, `#/someday`, `#/settings`, and `#/origin` each returned the same
HTTP 200 SPA shell (fragments are client-side and are not sent to the server).
A public browser capture of `#/today` rendered the first-launch shell without
application console errors. Route-specific authenticated content was not
claimed because no interactive authenticated browser path was available.