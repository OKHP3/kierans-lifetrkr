# Technology update plan

Prepared September 18, 2026. Preserve the existing client-only app, HashRouter, npm lockfile, browser-local data, and Pages Actions deployment. This infrastructure work does not change app version 0.1.10.

## Implemented locally

1. **Daily Dependabot version PRs (Monday-Friday):** npm at 06:00 and Actions at 06:30 America/Chicago. Manifest-declared npm dependencies are eligible; minor/patch releases stay grouped, majors stay separate. npm version updates have a three-day cooldown. Security updates bypass cooldown when enabled in repository settings. Sources: [Dependabot configuration](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference), [cooldown policy](https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/).
2. **Complete audit script:** `npm run audit:technology` reads every lock entry, host-installed package versions, workflow action references, runtime selections, and support manifests. It queries official npm, GitHub, Node, and Python releases, including Bun and reference-only Mermaid. Reports go to ignored `.cache/technology-audit/`. It never installs upgrades or rewrites app configuration.
3. **Weekly Technology watch Action:** Mondays 12:23 UTC plus manual dispatch. Read-only access; saves a run summary and 30-day report artifact. Lookup failures fail the run and preserve partial evidence. Available versions are reported, not treated as build failures.
4. **Latest Node LTS candidate build:** same workflow automatically tests the checked-in lockfile against `lts/*`, including production audit, type check, accessibility, technology/sync/service-worker tests, build, and artifact inspection. It does not deploy or change production Node selection.
5. **Offline regression tests in CI:** stable/prerelease classification, numeric comparisons, nested/scoped lock entries, action references, HTTP failures/backoff, credential restrictions, and separate Current/LTS discovery.

Existing Dependabot was already weekly; this extends it without adding a competing bot. New files become active only after owner-authorized publication to the default branch. Scheduled execution can be delayed or disabled after public-repository inactivity; verify actual runs. [GitHub schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

## Coverage and ownership

| Technology | Discovery | Update path |
|---|---|---|
| Root npm packages | Daily Dependabot and weekly inventory | Manifest/lockfile PR, CI, owner review/merge, existing Pages deployment |
| Transitive/platform packages | Full lockfile inventory; security updates for vulnerable lockfile entries | Parent-compatible lock refresh or parent upgrade; no forced breaking overrides |
| GitHub Actions | Daily Dependabot and weekly releases check | Bot PR, workflow review, owner merge |
| Node patches in `22.x` | setup-node selection and weekly report | Available matching patch on workflow execution; inspect logs for exact version |
| New Node LTS line | Weekly latest-LTS candidate build | Reviewed migration updates both CI and Pages plus engine policy; verify each host |
| npm | Weekly stable lookup | Paired runtime/package-manager migration and clean install; bundled npm is not npm latest |
| Bun | Weekly stable lookup, host version commands | Reviewed runner installation, all five TS suites, future explicit pin/CI wiring |
| Python | Weekly stable lookup, tracked support-file list | Owner/Replit runtime upgrade and script/test checks; no pip dependencies today |
| Private support packages | Every audit scans seven manifests | New external dependencies fail coverage until own lockfile and Dependabot directory are added |
| Replit modules/Nix channel | Config selections in weekly report | Verify available platform versions, reviewed module change, fresh shell validation |
| Git/Bash/OS/Chromium/CLI tools | Monthly host inventory/vendor notices | Host package-manager updates followed by maintenance/browser tests |
| Language targets/formats/web standards | Monthly compatibility review | Deliberate source/config changes based on supported browsers |
| Mermaid | Weekly reference release lookup | No app update while uninstalled; use a locked dependency if later adopted |
| APIs/fonts/analytics/Notion integration | Monthly provider notices and disposable smoke tests | Explicit contract migration; often no package version for a bot to update |
| Optional oracle worker | Inspect owning source/deployment when available | Provider/model changes in its owning project; do not guess its version |

Automatic discovery/PR creation is not unattended merging. No auto-merge, audit write permissions, deployment-setting changes, or pull_request_target workflow is introduced. Main's branch endpoint reported `protected: false`; applicable rulesets were not audited. Review effective protections before considering unattended merges.

## First upgrade batches (proposals)

1. Restore Windows install fidelity with `npm ci --registry=https://registry.npmjs.org/`; verify `npm ls --depth=0`. Keep the checked-in lockfile; do not regenerate it just to hide an install failure.
2. Retire Replit Node 20. Verify available Node 24 modules, or supported Node 22 as an intermediate. Preferred upstream LTS target is 24.21.0; Node 26.9.0 Current is a separate candidate. Windows Node 24.11.1 and Python 3.14.0rc1 also need an owner-environment upgrade plan; stable Python is 3.14.7.
3. Patches: Router 7.18.4, plugin-react 6.1.1, PostCSS 8.5.28, connectors SDK 0.4.3, deploy-pages v5.0.1. Review SDK usefulness separately before removal.
4. React family: React, React DOM, and both types packages to 19.3.0 together; test rendering, hooks, account isolation, saved data, and mobile navigation.
5. Build tooling: Vite 8.3.0 and Autoprefixer 10.6.1; inspect output and CSS/layout. TypeScript 7.0.2 and both Tailwind packages 4.3.3 are current.
6. npm/Bun: npm 12.0.2 requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`, so neither current Windows Node 24.11.1 nor Replit Node 20.20.0 is eligible. Upgrade/test the runtime first. Validate all TS suites on Bun 1.4.2; keep npm as the app package manager.

For non-vulnerable transitive releases, the weekly report feeds a reviewed lockfile-refresh PR (`npm update --package-lock-only`, followed by clean installation and the full checks). Dependabot version updates for npm do not independently track every transitive package.

Targets are a dated snapshot; regenerate before upgrading and review migration notes. No listed upgrade is applied merely by adding this plan.

## Validation and release path

1. Review each PR's dependency/lockfile diff, engines, release notes, and advisories. Separate major framework migrations; preserve unrelated work and recovery refs.
2. Run clean install, production security audit, type check, accessibility source check, technology/sync/service-worker tests, build, and artifact inspection. Existing CI covers these after this change.
3. On a Bun-equipped host, run `test:date`, `test:evening-wrap-up`, `test:settings-timezone`, `test:account-isolation`, and `test:scope`. Existing ordinary CI does **not** run these suites. Run `test:rituals-browser` on configured Chromium with disposable browser data. Wiring these missing suites into CI remains follow-up work.
4. Validate the Pages subpath, navigation, saved-data continuity, token expiry, and optional API fallbacks. A source/build check does not establish live OAuth/CORS behavior.
5. Owner reviews/merges after successful evidence; existing main-push Pages workflow deploys. Verify source SHA, successful deployment, live routes/assets, and release identity.
6. Reconcile Windows/Replit through normal fetch/inspect/integrate procedures. Prove source/runtime state per host; cached 0/0 alone is not live GitHub parity.

If a batch fails, keep the previous deployed version and fix/close its PR. If a regression appears after merge, prepare a scoped revert PR and deploy through existing Actions. Do not bypass checks, force-push, reset work, or discard browser data.

## Activation checklist

- Review and publish these local files through an owner-authorized commit/PR. No app milestone bump is needed.
- Confirm Dependabot accepts the configuration. Verify security updates/alerts settings separately; file presence is not execution or security-settings evidence.
- Manually run **Technology watch** on the default branch. Verify both jobs, source timestamps, and report artifact. Failures use ordinary Actions notifications; package updates use Dependabot PRs.
- Review weekly runtime gaps and perform monthly managed-service/host checks. Weekly reports are artifacts, avoiding automatic documentation commits.
- Refresh locally with `npm run audit:technology`. For an intentional checked-in snapshot: `npm run audit:technology -- --output docs/technology-audit/YYYY-MM-DD`. A process-scoped `GITHUB_TOKEN` can authenticate release reads when anonymous limits are exhausted; never save it to a file. Respect source retry delays.

Limitations: latest releases are candidates, not compatibility/security guarantees. Transitive latest versions can exceed valid parent ranges. Optional platform binaries appear even when not installed on the current OS. The LTS candidate build does not prove browser/API behavior, all Bun suites, or an upgrade on another machine. Git/Bash/Chromium/Nix and hosted services have an explicit review plan rather than automatic version rewriting.

## Validation recorded for this change

- Clean public-registry install passed; all thirteen direct installed versions match the unchanged lockfile. Installation audit reported zero vulnerabilities.
- Final live inventory completed with **130 lock entries, 119 unique npm lookups including reference tools, six action releases, and zero lookup failures**. Ten direct package updates were found. Node/Python sources also succeeded. Initial rate-limit failures were resolved by respecting cooldown, pacing registry requests, and authenticating GitHub release reads.
- **Nine technology regression tests passed.** Type-check, accessibility source check (31 JSX/TSX files), service-worker regression, production build, and release artifact inspection passed on Windows Node 24.11.1.
- Dependabot and all three workflow files validated against their JSON schemas. `git diff --check` passed. No credentials, application version bump, or dependency lockfile changes were introduced.
- Existing sync regression suite: **two passed, seven failed on Windows**. Failures reported missing `truncate` and Windows Bash service `HCS_E_SERVICE_NOT_AVAILABLE`. Those files were unchanged; these are unresolved host/test-harness limitations, not passing full-suite evidence.
- Hosted CI, the new latest-LTS candidate job, deployment, Bun suites, and browser/API smoke tests were not executed for this local infrastructure change. They remain required at their respective upgrade/release stages.
- Changes are local and uncommitted; no PR, merge, deployment, or Replit mutation was performed.
