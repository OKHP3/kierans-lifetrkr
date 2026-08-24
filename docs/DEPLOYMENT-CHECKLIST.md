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