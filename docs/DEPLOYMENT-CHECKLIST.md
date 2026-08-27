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

Append the post-push workflow URL, published commit SHA, verification timestamp,
browser/OS, and HTTP status plus content type for every item above here. A green
local build is not a substitute for that read-back.