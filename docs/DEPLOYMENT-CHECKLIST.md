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

### Real-device acceptance record — August 27, 2026

**Status:** **PENDING REAL-DEVICE EVIDENCE**. This Replit Linux workspace has no
physical iOS or Android browser session, and the deployment metadata for this
workspace reports no Replit-hosted production deployment. The published target
for this project is GitHub Pages, so the checks below must be run against
`https://okhp3.github.io/kierans-lifetrkr/` on the named devices before the PWA
release is called fully verified.

**Worker observed from the public site:** `lifetrkr-shell-v1` from
`/kierans-lifetrkr/sw.js`, with three hashed app assets in its precache list:
`index-BwqnZ0EM.js`, `index-BGT3dLhJ.css`, and
`cat-accent-CMS_9x5N.png`. Public transport checks returned HTTP 200 for the
shell, manifest, worker, and fallback HTML on this date. Local source/build
checks also passed: `npm run check`, `npm run check:a11y`, `npm run build`, and
`npm run test:sync`.

#### Required iOS run

| Field | Record |
|---|---|
| Browser / OS | **Owner to fill:** Safari on the supported iOS version |
| Worker version | **Owner to fill:** confirm `lifetrkr-shell-v1` in Safari’s site data/worker inspection |
| Online load | **Owner to fill:** open the production URL, dismiss first-launch onboarding, create a local record, and reload |
| Offline home reload | **Owner to fill:** disable network/enable Airplane Mode, reload `/#/`, confirm the app shell and local record remain available |
| Offline Today reload | **Owner to fill:** while still offline, reload `/#/today`, confirm the shell/local records render |
| Network boundary | **Owner to fill:** Google Calendar/Tasks stay paused/read-only and the optional network oracle does not claim a successful response |
| Installation / launch | **Owner to fill:** use Safari’s **Add to Home Screen**, launch the icon, and confirm the standalone layout opens |
| Result / date | **PENDING — owner-run evidence required** |

#### Required Android run

| Field | Record |
|---|---|
| Browser / OS | **Owner to fill:** Chrome on the supported Android version |
| Worker version | **Owner to fill:** confirm `lifetrkr-shell-v1` in Chrome’s installed-app/site inspection |
| Online load | **Owner to fill:** open the production URL, dismiss first-launch onboarding, create a local record, and reload |
| Offline home reload | **Owner to fill:** disable network/enable Airplane Mode, reload `/#/`, confirm the app shell and local record remain available |
| Offline Today reload | **Owner to fill:** while still offline, reload `/#/today`, confirm the shell/local records render |
| Network boundary | **Owner to fill:** Google Calendar/Tasks stay paused/read-only and the optional network oracle does not claim a successful response |
| Installation / launch | **Owner to fill:** use Chrome’s install/Add to Home screen flow, launch the icon, and confirm the standalone layout opens |
| Result / date | **PENDING — owner-run evidence required** |

Re-enable network after each run and reload once to confirm the online state
resumes. Record any cache replacement observed after a later worker release;
the expected behavior is that the old `lifetrkr-shell-*` cache is removed
without leaving stale application assets.

### Offline-cache replacement verification — August 27, 2026

| Field | Record |
|---|---|
| Published worker version | **Not available:** the public Pages worker still reports `lifetrkr-shell-v1`; no later worker version was published during this verification |
| Device / browser | **Not run:** this workspace has no installed iOS Safari or Android Chrome session |
| Prior cache | **Not observable:** browser site storage is unavailable from this Replit Linux workspace |
| Expected activation behavior | **Source verified:** `public/sw.js` deletes every cache whose name starts with `lifetrkr-shell-` except the active `CACHE_NAME` during `activate` |
| Result / date | **BLOCKED — August 27, 2026:** real-device confirmation that a prior cache disappears after a later published worker remains owner-run evidence |

The live v1 observation and source verification do not substitute for the
required installed-browser check. After a later worker version is published,
repeat the iOS and Android runs above, inspect site storage after activation,
and replace this record with the worker version, device/browser, date, and
observed cache list.

### Current verification status — September 1, 2026

**Status:** **BLOCKED — OWNER DEVICE RUN REQUIRED.** The public Pages worker
was reachable over HTTPS from the Replit Linux workspace, but this workspace
does not provide a physical iOS Safari or Android Chrome session, device
network controls, installed-app launch, or browser site-storage inspection.
No device result is claimed here.

| Check | Current evidence | Result |
|---|---|---|
| Published worker transport | `https://okhp3.github.io/kierans-lifetrkr/sw.js` returned HTTP 200. The response was last modified August 29, 2026 and reports `lifetrkr-shell-v1`. | **PASS — transport only** |
| Published worker activation logic | The public worker calls `skipWaiting()`, removes every cache beginning `lifetrkr-shell-` other than `lifetrkr-shell-v1`, and calls `clients.claim()`. | **PASS — source observation only** |
| Published worker precache | The public worker lists `cat-accent-CMS_9x5N.png`, `index-BGT3dLhJ.css`, and `index-YxJBgd6I.js` as hashed app assets. | **PASS — transport only** |
| iOS Safari activation and installed launch | No physical iOS device or Safari site-data inspection is available in this workspace. | **BLOCKED — owner evidence required** |
| Android Chrome activation and installed launch | No physical Android device or Chrome site/app inspection is available in this workspace. | **BLOCKED — owner evidence required** |
| Older shell-cache replacement | No later published worker version or browser storage inspection was available, so removal of a prior `lifetrkr-shell-*` cache was not observed. | **BLOCKED — owner evidence required** |
| App shell after network interruption | A network-disabled device reload could not be performed here. The service-worker regression test and local build passed, but that is not device evidence. | **BLOCKED — owner evidence required** |

Local checks completed on September 1, 2026: `npm run check`,
`npm run check:a11y`, `npm run build`, `node scripts/inspect-artifact.mjs`,
`npm run test:service-worker`, `npm run test:sync`, and `node --check
public/sw.js`.

To close this gate, run the iOS and Android tables above against the published
URL. After a new worker version is deployed, inspect site storage before and
after activation and record the exact active cache plus confirmation that the
older `lifetrkr-shell-*` cache is gone. Re-enable the network and reload once
after each offline run.
