# LifeTrkr Technology Inventory

**Audit date:** July 13, 2026  
**Application version:** `v0.1.9` (`src/constants.ts`)  
**Scope:** Technologies present in the shipped source, package manifest/lockfile, build configuration, CI, and external browser integrations.

This inventory separates the version actually resolved in the local lockfile/install from the latest stable release available at audit time. Major-version targets are recorded for planning; this audit does not upgrade them automatically because React, React Router, Tailwind, Vite, and TypeScript major upgrades can require source/configuration changes.

## Application and build stack

| Technology | How LifeTrkr uses it | In-place version | Latest stable at audit | Upgrade note |
|---|---|---:|---:|---|
| JavaScript / ECMAScript | Runtime language emitted by the TypeScript/Vite build | ES2020 target (`tsconfig.json`) | Living standard; no project package version | Keep the target aligned with supported browsers and TypeScript/Vite defaults. |
| TypeScript | Application language and type-checker for `.ts`/`.tsx` | `6.0.3` | `7.0.2` | Major upgrade; test compiler changes before adoption. |
| React | UI library | `18.3.1` | `19.2.7` | Major upgrade; review React 19 migration guidance. |
| React DOM | Browser renderer | `18.3.1` | `19.2.7` | Upgrade with React. |
| React Router DOM | Hash-based client routing and navigation | `6.30.4` | `7.18.1` | Major upgrade; preserve `HashRouter` for GitHub Pages. |
| Vite | Dev server, bundler, and production build | `6.4.3` | `8.1.4` | Major upgrade; review Vite 7/8 migration notes and plugin compatibility. |
| `@vitejs/plugin-react` | React JSX transform and Fast Refresh integration | `4.7.0` | `6.0.3` | Upgrade with Vite and verify React 18 compatibility if React is not upgraded yet. |
| Tailwind CSS | Utility-first CSS generation and design tokens | `3.4.19` | `4.3.2` | Major upgrade; v4 changes configuration and PostCSS integration. |
| PostCSS | CSS transformation pipeline | `8.5.15` | `8.5.19` | Patch update is low risk; used by Tailwind config. |
| Autoprefixer | Browser vendor-prefix processing in PostCSS | `10.5.0` | `10.5.2` | Patch update is low risk. |
| `@types/react` | React TypeScript declarations | `18.3.31` | `19.2.17` | Upgrade with React types and React. |
| `@types/react-dom` | React DOM TypeScript declarations | `18.3.7` | `19.2.3` | Upgrade with React DOM types and React. |
| `@replit/connectors-sdk` | Installed connector SDK dependency | `0.4.1` | `0.4.1` | No newer npm `latest` version found at audit time; no direct source import was found. |

The versions in the “in-place” column come from `package-lock.json`/`npm ls`, not merely the semver ranges in `package.json`.

## Runtime, package manager, and source formats

| Technology | Evidence in this repository | In-place version/status |
|---|---|---|
| Node.js | Local development runtime; GitHub Actions runtime | Local `v24.11.1`; latest release is `v26.3.1` (Current) and latest LTS is `v24.18.0`. Deployment/CI now use `lts/*` with `check-latest: true` so they follow the current LTS line. |
| npm | Package manager and `package-lock.json` lockfile version 3 | Local `11.6.2`; npm `latest` is `12.0.1`; npm is bundled with the selected Node runtime in CI. |
| HTML | `index.html` application shell | HTML Living Standard; no separately pinned project version. |
| CSS | `src/index.css` plus Tailwind/PostCSS processing | CSS Living Standard; no separately pinned project version. |
| Bash | Existing maintenance scripts under `scripts/` | Shell scripts with no pinned Bash version; GitHub-hosted Ubuntu is the execution environment. |
| Python | Searched repository source/configuration | Not used by the solution. |
| JSON / YAML / CommonJS / ESM | Package/config/lock files and GitHub Actions | Formats/configuration, not independently versioned application dependencies. |

## Browser and platform APIs

| Technology/service | How LifeTrkr uses it | Version/status |
|---|---|---|
| Browser Web APIs | `localStorage`, `sessionStorage`, `fetch`, `URL`, `Date`, `Intl`, and DOM APIs | Browser-standard APIs; implementation version comes from the user's browser. |
| Google Identity Services | Client-side OAuth token flow via `https://accounts.google.com/gsi/client` | Script URL has no pinned release version. |
| Google Calendar API | Browser fetches Calendar events and creates/deletes events | REST API `v3`. |
| Google Tasks API | Browser fetches task lists/tasks | REST API `v1`. |
| Google OAuth userinfo | Reads the connected profile | `https://www.googleapis.com/oauth2/v3/userinfo`; endpoint version `v3`. |
| Anthropic Messages API | Daily oracle synthesis | REST endpoint `/v1/messages`; request header `anthropic-version: 2023-06-01`; Claude model is selected in `src/lib/oracle.ts`. |
| Tarot API | Daily card draw | `tarotapi.dev` endpoint `/api/v1/cards/random`; public API, no package version. |
| Free Horoscope API | Optional daily horoscope | `freehoroscopeapi.com` endpoint `/api/v1/get-horoscope/daily`; public API, no package version. |
| Google Analytics | Page tracking script in `index.html` | `gtag.js` script URL; no pinned library version. |
| Google Fonts | Cormorant Garamond, DM Sans, and Space Mono | Hosted font families; no app-managed package version. |

## Hosting and CI/CD

| Technology | How LifeTrkr uses it | In-place version | Latest stable at audit |
|---|---|---:|---:|
| GitHub Pages | Static hosting at the `/kierans-lifetrkr/` subpath | GitHub-managed service | Service; no app-pinned version |
| GitHub Actions: `actions/checkout` | Checks out the repository | `v7` tag | `v7.0.0` |
| GitHub Actions: `actions/setup-node` | Installs Node and caches npm | `v6` tag | `v6.4.0` |
| GitHub Actions: `actions/configure-pages` | Configures Pages metadata | `v6` tag | `v6.0.0` |
| GitHub Actions: `actions/upload-pages-artifact` | Packages the `dist` directory | `v5` tag | `v5.0.0` |
| GitHub Actions: `actions/deploy-pages` | Publishes the Pages artifact | `v5` tag | `v5.0.0` |

The workflow currently uses major tags. Dependabot is configured to keep these action references current, and the Pages workflow is being pinned to the current exact tags so each update is reviewable.

## Not used / stale references

- Python, Express, a database, and a backend server are not present in the shipped implementation.
- `gh-pages` appears in the legacy `npm run deploy` script and older planning documents, but it is not a dependency in `package.json` and is not the active deployment mechanism. The active mechanism is GitHub Actions plus GitHub Pages; the project rules prohibit creating or pushing a `gh-pages` branch.
- `CLAUDE.md`, `replit.md`, and some older PRD material contain historical architecture/version statements. This inventory is based on the current source, manifest, lockfile, and active workflow.

## Sources checked

- [Node.js release/status page](https://nodejs.org/en/about/previous-releases)
- [Node.js v24.18.0 LTS release](https://nodejs.org/en/blog/release/v24.18.0)
- [Vite releases](https://vite.dev/releases) and [Vite 8.1 announcement](https://vite.dev/blog/announcing-vite8-1)
- [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2)
- [React Router changelog](https://reactrouter.com/start/start/changelog)
- [Tailwind CSS v4.3 announcement](https://tailwindcss.com/blog/tailwindcss-v4-3)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- [npm registry latest metadata for React](https://registry.npmjs.org/react/latest), [TypeScript](https://registry.npmjs.org/typescript/latest), and the remaining packages in `package.json`
- [npm registry latest metadata](https://registry.npmjs.org/npm/latest)
- [Google Calendar API reference](https://developers.google.com/calendar/api/v3/reference), [Google Tasks API reference](https://developers.google.com/tasks/reference/rest/v1/tasks), and [Google Identity Services reference](https://developers.google.com/identity/gsi/web/reference/js-reference)
- [Anthropic API versioning](https://docs.anthropic.com/en/api/versioning)
- [actions/checkout releases](https://github.com/actions/checkout/releases), [actions/setup-node releases](https://github.com/actions/setup-node/releases), and the [GitHub Pages action repositories](https://github.com/actions/upload-pages-artifact)

## Update policy

`.github/dependabot.yml` checks npm dependencies and GitHub Actions weekly. It groups patch/minor npm updates, while major updates are opened separately for focused review. Dependabot opens pull requests instead of mutating `main`. Every update PR must pass `.github/workflows/ci.yml`, which runs `npm ci`, `npm run check`, and `npm run build`. Major framework/toolchain upgrades remain review-required because they may require source or configuration migrations.
