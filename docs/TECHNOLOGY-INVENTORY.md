# LifeTrkr technology inventory

Audit: **September 18, 2026, America/Chicago** (some retrieval timestamps are September 19 UTC). App version: **0.1.10**. Audited Windows and live GitHub/main source: **38554e511aae5df62d11e85f8e703ed6ec4d2ee2**. The working tree was initially clean. This replaces the July inventory and September 16 correction with source-backed evidence.

Question: which technologies are actually used, what versions are selected, what stable releases exist, and how should updates reach the solution? **Confirmed** means observed in source, a version command, or an official release source. **Unknown** means not verified. Available upgrades are **proposals** until validated.

## Direct application and build dependencies

In-place means resolved in `package-lock.json`, not merely allowed by `package.json`. Latest stable means the publisher's npm `latest` tag, excluding prereleases. Every link below is the package publisher's official npm registry record retrieved during this audit.

| Technology | Use | In-place | Latest stable | Result |
|---|---|---|---|---|
| React | UI | 19.2.8 | [19.3.0](https://registry.npmjs.org/react/latest) | Update available |
| React DOM | Browser renderer | 19.2.8 | [19.3.0](https://registry.npmjs.org/react-dom/latest) | Update with React |
| React Router DOM | HashRouter and navigation | 7.18.2 | [7.18.4](https://registry.npmjs.org/react-router-dom/latest) | Patch available |
| TypeScript | TS/TSX and type-checking | 7.0.2 | [7.0.2](https://registry.npmjs.org/typescript/latest) | Current |
| Vite | Development and production build | 8.2.2 | [8.3.0](https://registry.npmjs.org/vite/latest) | Minor available |
| @vitejs/plugin-react | Vite React integration | 6.1.0 | [6.1.1](https://registry.npmjs.org/%40vitejs%2Fplugin-react/latest) | Patch available |
| Tailwind CSS | Utility CSS and design tokens | 4.3.3 | [4.3.3](https://registry.npmjs.org/tailwindcss/latest) | Current |
| @tailwindcss/postcss | Tailwind v4 CSS integration | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fpostcss/latest) | Current |
| PostCSS | CSS processing | 8.5.26 | [8.5.28](https://registry.npmjs.org/postcss/latest) | Patch available |
| Autoprefixer | **Active** in `postcss.config.cjs` | 10.5.4 | [10.6.1](https://registry.npmjs.org/autoprefixer/latest) | Minor available |
| @types/react | React declarations | 19.2.18 | [19.3.0](https://registry.npmjs.org/%40types%2Freact/latest) | Update with React |
| @types/react-dom | React DOM declarations | 19.2.5 | [19.3.0](https://registry.npmjs.org/%40types%2Freact-dom/latest) | Update with React DOM |
| @replit/connectors-sdk | Declared dependency; no direct import in `src/` | 0.4.2 | [0.4.3](https://registry.npmjs.org/%40replit%2Fconnectors-sdk/latest) | Patch available |

**Ten of thirteen** direct dependencies have newer stable releases. These upgrades are not applied by this infrastructure change. The lockfile contains **130 entries, representing 116 unique package names**, including optional platform binaries and nested versions. See the [complete generated version list](technology-audit/2026-09-18/report.md) and [JSON source ledger](technology-audit/2026-09-18/report.json).

Indirect technologies include Rolldown 1.2.5, Oxc types 0.146.0, Lightning CSS 1.32.0 plus Vite's nested 1.33.0, Tailwind Oxide/native bindings, Browserslist 4.28.7/browser data, React Router 7.18.2, Scheduler 0.27.0, TypeScript platform binaries, source-map utilities, and WebAssembly/N-API support. The generated list includes every selected version and latest comparison. Update them through parent-compatible lockfile changes, not independent major-version overrides.

## Runtime and host versions

A configured major is not an observed hosted patch. These columns intentionally represent different execution environments.

| Technology | Windows at audit start | Replit browser-shell observation | CI/Pages selection | Latest stable / source |
|---|---|---|---|---|
| Node.js | 24.11.1 | **20.20.0** | `22.x`, hosted patch unverified | [26.9.0 Current; 24.21.0 latest LTS; 22.23.2 latest Node 22](https://nodejs.org/dist/index.json) |
| npm | 11.6.2 | 10.8.2 | Bundled with Node | [12.0.2](https://registry.npmjs.org/npm/latest); latest Node LTS bundles 11.19.0 |
| Python | **3.14.0rc1**, prerelease | 3.11.14 | No Python job | [3.14.7](https://www.python.org/downloads/) |
| Bun | Not on PATH | 1.3.6 | Not selected | [1.4.2](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.2) |
| Git | 2.55.0.windows.5 | 2.50.1 | Runner managed | [2.55.0 upstream](https://www.kernel.org/pub/software/scm/git/); Windows packaging has its own suffix |
| Bash | 5.3.15(2) via Git for Windows | 5.2.37(1) | Runner managed | [5.3](https://www.gnu.org/software/bash/manual/html_node/index.html), [patch 020](https://ftp.gnu.org/gnu/bash/bash-5.3-patches/) = 5.3.20 |
| Chromium | Test binary not selected | 152.0.7977.64 | No browser test job | [Chrome for Testing stable 153.0.8010.52](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json); Replit's Chromium package availability is distribution dependent |
| Nix/Nixpkgs | Not needed for build | `.replit` channel `stable-25_05`; Nix executable version unverified | Not used | [NixOS/Nixpkgs 26.05](https://nixos.org/blog/announcements/2026/nixos-2605/); verify Replit-supported channel separately |
| PowerShell | 7.6.5 (owner/audit shell) | Not app tooling | Not selected | [7.6.6](https://github.com/PowerShell/PowerShell/releases/tag/v7.6.6); outside app dependency automation |

Node 20 is **end-of-life**, while 22/24 are LTS according to the [official release schedule](https://nodejs.org/en/about/previous-releases). `.replit` selects `nodejs-20` and `python-3.11`. Root engines permit Node >=20.19.0/npm >=10; that minimum is not a support policy. Vite's engine range is `^20.19.0 || >=22.12.0`, so the root range is more permissive than its build tooling.

Replit reported clean source at **77b2dd9**, equal to its cached origin/main (`0/0`). Live GitHub main was **38554e5**, a later documentation commit. No fetch/pull or Replit mutation was performed. The Replit connector required reauthentication; the version commands were verified directly through the existing browser workspace.

Initial Windows `node_modules` differed from the lockfile: connectors SDK 0.4.1, Router 7.18.1, plugin-react 6.0.4, PostCSS 8.5.23, React types 19.2.17, React DOM types 19.2.3, Vite 8.1.5. A clean `npm ci` during this audit restored the existing lockfile installation. The final `npm ls --depth=0` and generated report confirm all thirteen direct installed versions equal their locked versions; the manifest dependency ranges and lockfile were not upgraded.

## Languages, standards, formats, and support tools

| Technology | In-place evidence | Latest/version interpretation |
|---|---|---|
| JavaScript / ECMAScript | `tsconfig.json`: target/lib **ES2020**, modules **ESNext**; JS maintenance scripts | [ECMAScript 2026 / ECMA-262 edition 17](https://ecma-international.org/publications-and-standards/standards/ecma-262/). A browser compatibility target is not a dependency bump; Vite has separate output-target defaults. |
| JSX/TSX | React transform `react-jsx` | Tracks React/TypeScript; no independent package version |
| HTML | `index.html` | Living Standard; no project-pinned version |
| CSS | `src/index.css`, variables, Tailwind/PostCSS | Module-based web standards, no single current CSS version |
| ESM/CommonJS | `type: module`, `.mjs`, `.cjs` | Node/browser module systems, not separate dependencies |
| JSON | Configs, local data, lockfile **format 3** | Data format; npm owns lockfile format |
| YAML | Workflows, Dependabot schema **2**, skill fixtures | Service/parser-managed format; no YAML library dependency |
| TOML | `.replit`, agent asset metadata | Platform parser managed; no repository-pinned parser |
| Markdown | Docs/skills | Host renderer managed; no app renderer dependency |
| Mermaid | Skill examples and adjacent-project references | [12.0.0](https://registry.npmjs.org/mermaid/latest) for reference only; **not installed or shipped** |
| Python standard library | **21 tracked `.py` files** in skills and tests | AST scan found no third-party imports; no requirements/pyproject/Pipfile/lockfile |
| Node standard library / node:test | Maintenance/tests/skill scripts | Tracks selected Node. Seven private support packages at **0.1.0**, with no external dependencies |
| Bun test runner | Five `bun test` commands in package.json | Version in runtime table; existing CI does not run these suites |
| Chromium DevTools Protocol/WebSocket | `scripts/rituals-browser-regression.mjs` | Browser-owned protocol; no Playwright or Puppeteer package |
| Browser APIs | DOM, Fetch, URL, Date/Intl, local/session storage | Browser-managed implementations; test supported browsers |
| Web App Manifest/service worker/Cache API | `public/manifest.json`, `public/sw.js`, build preparation | Standards plus project-owned JS, no separate framework package |
| SVG/PNG/WebP | Icons and image assets | File formats, no updatable application package |
| Shell utilities/GitHub CLI | Maintenance scripts/HTTP checks | Host-managed tools; record their versions when migrating hosts |

Python/skill tooling is not shipped to the browser. Examples mentioning Express, Next.js, databases, or pnpm in a reusable skill do not establish an application dependency. Node embeds V8, libuv, OpenSSL, etc.; their selected versions follow the Node distribution rather than separate application pins.

## Integrations and managed services

| Technology/service | Confirmed source use | Latest stable / ownership |
|---|---|---|
| Google Identity Services/OAuth 2.0 | `accounts.google.com/gsi/client`, token model | [Unversioned managed script](https://developers.google.com/identity/oauth2/web/guides/use-token-model) |
| Google API JavaScript client (`gapi`) | `apis.google.com/js/api.js` loaded in index.html | Unversioned managed script, no npm pin |
| Google Calendar | REST `calendar/v3`, **read-only**, paginated | [v3 documented API](https://developers.google.com/workspace/calendar/api/v3/reference) |
| Google Tasks | REST `tasks/v1`, **read-only**, paginated | [v1 documented API](https://developers.google.com/tasks/reference/rest/v1/tasks) |
| Google OAuth userinfo | `oauth2/v3/userinfo` | Endpoint v3, no package pin |
| Tarot API | `/api/v1/cards/random`, fallback | [Provider v1](https://tarotapi.dev/); backend release unknown |
| Free Horoscope API | `/api/v1/get-horoscope/daily`, nullable fallback | [Provider v1](https://freehoroscopeapi.com/); backend release unknown |
| Optional oracle worker | `VITE_ORACLE_WORKER_URL`, POST in `src/lib/oracle.ts` | **Unknown** worker code/model/provider/deployment; no implementation in this repo |
| Anthropic/Claude | Historical references; current shipped source has no direct call/model selection | Not an app-managed version; inspect optional worker before proposing model updates |
| Google Analytics | Hosted `gtag.js`, page tracking hook | Managed script, no pinned release |
| Google Fonts | Cormorant Garamond, DM Sans, Space Mono, CSS API v2 | Managed fonts, no release pin |
| Replit Notion integration | `.replit` has `notion:1.0.0` for agent tooling | Platform integration revision; latest **unknown**, not app Notion CRUD |
| GitHub/Pages/Dependabot | Source, static hosting, dependency PRs | Managed services, no selectable server version |
| Replit | Development/preview; old deployment entry references absent `server/index.js` | Managed service; stale config is not proof of a backend |
| GitHub runner | `ubuntu-latest` | Managed moving image; exact image is in each run's logs |

The app remains client-only with HashRouter and `/kierans-lifetrkr/` production base. No server/database/worker implementation, Python web runtime, Mermaid renderer, Express, or gh-pages package exists in the shipped solution. `npm run deploy` now only builds. Documentation checks do not prove live OAuth, endpoint health, or browser CORS.

## GitHub Actions

Official action repository releases, retrieved during this audit:

| Action | In-place before this change | Latest stable | Result |
|---|---|---|---|
| actions/checkout | v7.0.1 | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | Current |
| actions/setup-node | v7.0.0 | [v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0) | Current |
| actions/configure-pages | v6.0.0 | [v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | Current |
| actions/upload-pages-artifact | v5.0.0 | [v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | Current |
| actions/deploy-pages | v5.0.0 | [v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | Patch available |
| actions/upload-artifact | Added by new report workflow: v7.0.1 | [v7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) | New reporting dependency |

An action's embedded Node runtime and nested dependencies belong to that action release, separately from the application's setup-node selection.

## Evidence boundaries

| Claim | Tier/evidence | Consequence if wrong | Next check |
|---|---|---|---|
| Package/source inventory | Confirmed: configs, imports, all lock entries | Wrong upgrade scope | Regenerate after upgrades |
| Stable release values | Confirmed for successful official lookups; failed lookups remain unknown | Incorrect targets | Retry failed sources after cooldown |
| Replit environment | Confirmed: browser shell commands at cached ref 77b2dd9 | Incompatible migration | Recheck after reviewed module change |
| Windows install matches lock | Confirmed after npm ci and repeat npm ls; initially false | Stale validation | Repeat after future dependency changes |
| New automation active remotely | Unknown until published/run | Monitoring gap | Activation checklist in plan |
| Main merge enforcement | Branch API reported `protected: false`; separate rulesets not audited | Unsafe unattended merge | Check rules before any auto-merge proposal |
| Optional worker/live APIs | Unknown; source contracts only | Misstated security/behavior | Configured disposable smoke test |

Primary-source authority and exact claims are identified in each linked row. The JSON ledger records source URLs, retrieval time, source SHA, and release dates where available. Replit configuration semantics were checked against [official documentation](https://docs.replit.com/features/project-setup/configuration).

Next action: review/publish the [prepared update plan and automation](TECHNOLOGY-UPDATE-PLAN.md), then migrate Replit off Node 20 with host-specific checks. Older guide/PRD claims about versions, direct Anthropic calls, Calendar writes, and deployment remain documentation drift; current source evidence above takes precedence for this audit.
