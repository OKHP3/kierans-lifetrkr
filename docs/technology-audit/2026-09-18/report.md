# Technology release audit

Retrieved: 2026-09-19T03:50:05.929Z. Source commit: 38554e511aae5df62d11e85f8e703ed6ec4d2ee2 (working tree has uncommitted changes).

130 lockfile entries; 119 unique package names checked (includes reference tools).
Lookup failures: 0. All values describe this execution host, not other machines.

The latest npm dist-tag is the publisher-designated stable channel. A newer release is a review candidate, not proof of compatibility.

## Direct packages

| Package | Declared | Locked | Installed on this host | Latest stable | Status |
|---|---|---|---|---|---|
| @replit/connectors-sdk | ^0.4.2 | 0.4.2 | 0.4.2 | [0.4.3](https://registry.npmjs.org/%40replit%2Fconnectors-sdk/latest) | update available |
| @tailwindcss/postcss | ^4.3.3 | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fpostcss/latest) | current |
| @types/react | ^19.2.18 | 19.2.18 | 19.2.18 | [19.3.0](https://registry.npmjs.org/%40types%2Freact/latest) | update available |
| @types/react-dom | ^19.2.5 | 19.2.5 | 19.2.5 | [19.3.0](https://registry.npmjs.org/%40types%2Freact-dom/latest) | update available |
| @vitejs/plugin-react | ^6.1.0 | 6.1.0 | 6.1.0 | [6.1.1](https://registry.npmjs.org/%40vitejs%2Fplugin-react/latest) | update available |
| autoprefixer | ^10.5.4 | 10.5.4 | 10.5.4 | [10.6.1](https://registry.npmjs.org/autoprefixer/latest) | update available |
| postcss | ^8.5.26 | 8.5.26 | 8.5.26 | [8.5.28](https://registry.npmjs.org/postcss/latest) | update available |
| react | ^19.2.8 | 19.2.8 | 19.2.8 | [19.3.0](https://registry.npmjs.org/react/latest) | update available |
| react-dom | ^19.2.8 | 19.2.8 | 19.2.8 | [19.3.0](https://registry.npmjs.org/react-dom/latest) | update available |
| react-router-dom | ^7.18.2 | 7.18.2 | 7.18.2 | [7.18.4](https://registry.npmjs.org/react-router-dom/latest) | update available |
| tailwindcss | ^4.3.3 | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/tailwindcss/latest) | current |
| typescript | ^7.0.2 | 7.0.2 | 7.0.2 | [7.0.2](https://registry.npmjs.org/typescript/latest) | current |
| vite | ^8.2.2 | 8.2.2 | 8.2.2 | [8.3.0](https://registry.npmjs.org/vite/latest) | update available |

## GitHub Actions

| Action | Selected | Latest stable | Status |
|---|---|---|---|
| actions/checkout | v7.0.1 | [v7.0.1](https://api.github.com/repos/actions/checkout/releases/latest) | current |
| actions/setup-node | v7.0.0 | [v7.0.0](https://api.github.com/repos/actions/setup-node/releases/latest) | current |
| actions/configure-pages | v6.0.0 | [v6.0.0](https://api.github.com/repos/actions/configure-pages/releases/latest) | current |
| actions/upload-pages-artifact | v5.0.0 | [v5.0.0](https://api.github.com/repos/actions/upload-pages-artifact/releases/latest) | current |
| actions/deploy-pages | v5.0.0 | [v5.0.1](https://api.github.com/repos/actions/deploy-pages/releases/latest) | update available |
| actions/upload-artifact | v7.0.1 | [v7.0.1](https://api.github.com/repos/actions/upload-artifact/releases/latest) | current |

## Runtime and reference releases

| Technology | This host / selection | Latest stable | Source |
|---|---|---|---|
| Node.js Current | v24.11.1 | v26.9.0 | [Official source](https://nodejs.org/dist/index.json) |
| Node.js LTS | v24.11.1 | v24.21.0 | [Official source](https://nodejs.org/dist/index.json) |
| npm | 11.6.2 | 12.0.2 | [Official source](https://registry.npmjs.org/npm/latest) |
| Python (support tools) | Python 3.14.0rc1 | 3.14.7 | [Official source](https://www.python.org/downloads/) |
| Bun (test runner) | unknown | 1.4.2 | [Official source](https://registry.npmjs.org/bun/latest) |
| Mermaid (reference only; not installed) | not an application dependency | 12.0.0 | [Official source](https://registry.npmjs.org/mermaid/latest) |

## Configuration and support tooling

```json
{
  "engines": {
    "node": ">=20.19.0",
    "npm": ">=10"
  },
  "lockfileVersion": 3,
  "nodeSelections": {
    ".github/workflows/ci.yml": [
      "22.x"
    ],
    ".github/workflows/static.yml": [
      "22.x"
    ],
    ".github/workflows/technology-watch.yml": [
      "22.x",
      "lts/*"
    ]
  },
  "replitModules": "[\"nodejs-20\", \"python-3.11\"]",
  "replitChannel": "stable-25_05",
  "typescriptTarget": "ES2020",
  "pythonFiles": [
    ".agents/skills/okhp3-brand-style-registry/scripts/extract_css_signals.py",
    ".agents/skills/okhp3-equilibrium-review/scripts/run_equilibrium_review.py",
    ".agents/skills/okhp3-outcome-modeling-core/scripts/calculate-outcome-model.py",
    ".agents/skills/okhp3-outcome-modeling-core/tests/test_calculations.py",
    ".agents/skills/okhp3-repl-repo-janitor/scripts/audit-repo.py",
    ".agents/skills/okhp3-replit-repl-janitor/scripts/audit-repo.py",
    ".agents/skills/okhp3-replit-repl-janitor/tests/test_audit_repo.py",
    ".agents/skills/okhp3-repository-janitor/scripts/audit_mirrors.py",
    ".agents/skills/okhp3-repository-organizer/scripts/inventory_repo.py",
    ".agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py",
    ".agents/skills/okhp3-skill-cataloger/tests/test_write_family_md.py",
    ".agents/skills/okhp3-skill-promotion/scripts/sync_skill_mirror.py",
    ".agents/skills/okhp3-skill-promotion/tests/test_sync_skill_mirror.py",
    ".agents/skills/okhp3-thread-context-extraction/scripts/create_thread_extract.py",
    ".agents/skills/okhp3-thread-context-extraction/scripts/validate_package.py",
    ".agents/skills/okhp3-thread-extract-chatgpt/scripts/create_thread_extract.py",
    ".agents/skills/okhp3-thread-extract-chatgpt/scripts/validate_package.py",
    ".agents/skills/okhp3-thread-extract-claude/scripts/create_thread_extract.py",
    ".agents/skills/okhp3-thread-extract-claude/scripts/validate_package.py",
    "skills/okhp3-skill-promotion/scripts/sync_skill_mirror.py",
    "skills/okhp3-skill-promotion/tests/test_sync_skill_mirror.py"
  ],
  "supportManifests": [
    {
      "path": ".agents/skills/okhp3-as-is-process-capture/package.json",
      "name": "@bp-skill/as-is-process-capture",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-decision-model-authoring/package.json",
      "name": "@bp-skill/decision-model-authoring",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-elicitation-interviews/package.json",
      "name": "@bp-skill/elicitation-and-interview-facilitation",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-future-state-strategy/package.json",
      "name": "@bp-skill/future-state-and-change-strategy",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-handoff-packaging/package.json",
      "name": "@bp-skill/publication-and-handoff-packaging",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-process-gap-analysis/package.json",
      "name": "@bp-skill/process-gap-and-exception-analysis",
      "version": "0.1.0",
      "dependencies": {}
    },
    {
      "path": ".agents/skills/okhp3-process-intake-and-scope/package.json",
      "name": "@bp-skill/process-intake-and-scope",
      "version": "0.1.0",
      "dependencies": {}
    }
  ]
}
```

## Complete lockfile inventory

Optional platform binaries are included even when not installed on this OS. Multiple versions retain separate rows. Transitive latest values are informational; parent constraints control updates.

| Package path | Scope | Locked | Installed | Latest stable | Status |
|---|---|---|---|---|---|
| node_modules/@alloc/quick-lru | transitive | 5.2.0 | 5.2.0 | [5.3.0](https://registry.npmjs.org/%40alloc%2Fquick-lru/latest) | update available |
| node_modules/@emnapi/core | transitive | 1.11.3 | unknown | [1.11.3](https://registry.npmjs.org/%40emnapi%2Fcore/latest) | current |
| node_modules/@emnapi/core/node_modules/@emnapi/wasi-threads | transitive | 1.2.3 | unknown | [2.1.0](https://registry.npmjs.org/%40emnapi%2Fwasi-threads/latest) | update available |
| node_modules/@emnapi/runtime | transitive | 1.11.3 | unknown | [1.11.3](https://registry.npmjs.org/%40emnapi%2Fruntime/latest) | current |
| node_modules/@jridgewell/gen-mapping | transitive | 0.3.13 | 0.3.13 | [0.3.13](https://registry.npmjs.org/%40jridgewell%2Fgen-mapping/latest) | current |
| node_modules/@jridgewell/remapping | transitive | 2.3.5 | 2.3.5 | [2.3.5](https://registry.npmjs.org/%40jridgewell%2Fremapping/latest) | current |
| node_modules/@jridgewell/resolve-uri | transitive | 3.1.2 | 3.1.2 | [3.1.2](https://registry.npmjs.org/%40jridgewell%2Fresolve-uri/latest) | current |
| node_modules/@jridgewell/sourcemap-codec | transitive | 1.5.5 | 1.5.5 | [1.6.0](https://registry.npmjs.org/%40jridgewell%2Fsourcemap-codec/latest) | update available |
| node_modules/@jridgewell/trace-mapping | transitive | 0.3.31 | 0.3.31 | [0.3.31](https://registry.npmjs.org/%40jridgewell%2Ftrace-mapping/latest) | current |
| node_modules/@oxc-project/types | transitive | 0.146.0 | 0.146.0 | [0.150.0](https://registry.npmjs.org/%40oxc-project%2Ftypes/latest) | update available |
| node_modules/@replit/connectors-sdk | direct runtime | 0.4.2 | 0.4.2 | [0.4.3](https://registry.npmjs.org/%40replit%2Fconnectors-sdk/latest) | update available |
| node_modules/@rolldown/binding-android-arm-eabi | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-android-arm-eabi/latest) | update available |
| node_modules/@rolldown/binding-android-arm64 | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-android-arm64/latest) | update available |
| node_modules/@rolldown/binding-darwin-arm64 | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-darwin-arm64/latest) | update available |
| node_modules/@rolldown/binding-darwin-x64 | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-darwin-x64/latest) | update available |
| node_modules/@rolldown/binding-freebsd-x64 | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-freebsd-x64/latest) | update available |
| node_modules/@rolldown/binding-linux-arm-gnueabihf | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm-gnueabihf/latest) | update available |
| node_modules/@rolldown/binding-linux-arm64-gnu | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm64-gnu/latest) | update available |
| node_modules/@rolldown/binding-linux-arm64-musl | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm64-musl/latest) | update available |
| node_modules/@rolldown/binding-linux-ppc64-gnu | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-ppc64-gnu/latest) | update available |
| node_modules/@rolldown/binding-linux-s390x-gnu | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-s390x-gnu/latest) | update available |
| node_modules/@rolldown/binding-linux-x64-gnu | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-x64-gnu/latest) | update available |
| node_modules/@rolldown/binding-linux-x64-musl | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-x64-musl/latest) | update available |
| node_modules/@rolldown/binding-openharmony-arm64 | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-openharmony-arm64/latest) | update available |
| node_modules/@rolldown/binding-win32-arm64-msvc | transitive | 1.2.5 | unknown | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-win32-arm64-msvc/latest) | update available |
| node_modules/@rolldown/binding-win32-x64-msvc | transitive | 1.2.5 | 1.2.5 | [1.2.9](https://registry.npmjs.org/%40rolldown%2Fbinding-win32-x64-msvc/latest) | update available |
| node_modules/@rolldown/pluginutils | transitive | 1.0.1 | 1.0.1 | [1.0.1](https://registry.npmjs.org/%40rolldown%2Fpluginutils/latest) | current |
| node_modules/@tailwindcss/node | transitive | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fnode/latest) | current |
| node_modules/@tailwindcss/oxide | transitive | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide/latest) | current |
| node_modules/@tailwindcss/oxide-android-arm64 | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-android-arm64/latest) | current |
| node_modules/@tailwindcss/oxide-darwin-arm64 | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-darwin-arm64/latest) | current |
| node_modules/@tailwindcss/oxide-darwin-x64 | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-darwin-x64/latest) | current |
| node_modules/@tailwindcss/oxide-freebsd-x64 | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-freebsd-x64/latest) | current |
| node_modules/@tailwindcss/oxide-linux-arm-gnueabihf | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-arm-gnueabihf/latest) | current |
| node_modules/@tailwindcss/oxide-linux-arm64-gnu | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-arm64-gnu/latest) | current |
| node_modules/@tailwindcss/oxide-linux-arm64-musl | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-arm64-musl/latest) | current |
| node_modules/@tailwindcss/oxide-linux-x64-gnu | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-x64-gnu/latest) | current |
| node_modules/@tailwindcss/oxide-linux-x64-musl | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-x64-musl/latest) | current |
| node_modules/@tailwindcss/oxide-wasm32-wasi | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-wasm32-wasi/latest) | current |
| node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads | transitive | 1.2.2 | unknown | [2.1.0](https://registry.npmjs.org/%40emnapi%2Fwasi-threads/latest) | update available |
| node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@napi-rs/wasm-runtime | transitive | 1.1.4 | unknown | [1.2.4](https://registry.npmjs.org/%40napi-rs%2Fwasm-runtime/latest) | update available |
| node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@tybys/wasm-util | transitive | 0.10.2 | unknown | [0.10.4](https://registry.npmjs.org/%40tybys%2Fwasm-util/latest) | update available |
| node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/tslib | transitive | 2.8.1 | unknown | [2.8.1](https://registry.npmjs.org/tslib/latest) | current |
| node_modules/@tailwindcss/oxide-win32-arm64-msvc | transitive | 4.3.3 | unknown | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-win32-arm64-msvc/latest) | current |
| node_modules/@tailwindcss/oxide-win32-x64-msvc | transitive | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-win32-x64-msvc/latest) | current |
| node_modules/@tailwindcss/postcss | direct development | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fpostcss/latest) | current |
| node_modules/@types/react | direct development | 19.2.18 | 19.2.18 | [19.3.0](https://registry.npmjs.org/%40types%2Freact/latest) | update available |
| node_modules/@types/react-dom | direct development | 19.2.5 | 19.2.5 | [19.3.0](https://registry.npmjs.org/%40types%2Freact-dom/latest) | update available |
| node_modules/@typescript/typescript-aix-ppc64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-aix-ppc64/latest) | current |
| node_modules/@typescript/typescript-darwin-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-darwin-arm64/latest) | current |
| node_modules/@typescript/typescript-darwin-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-darwin-x64/latest) | current |
| node_modules/@typescript/typescript-freebsd-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-freebsd-arm64/latest) | current |
| node_modules/@typescript/typescript-freebsd-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-freebsd-x64/latest) | current |
| node_modules/@typescript/typescript-linux-arm | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-arm/latest) | current |
| node_modules/@typescript/typescript-linux-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-arm64/latest) | current |
| node_modules/@typescript/typescript-linux-loong64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-loong64/latest) | current |
| node_modules/@typescript/typescript-linux-mips64el | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-mips64el/latest) | current |
| node_modules/@typescript/typescript-linux-ppc64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-ppc64/latest) | current |
| node_modules/@typescript/typescript-linux-riscv64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-riscv64/latest) | current |
| node_modules/@typescript/typescript-linux-s390x | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-s390x/latest) | current |
| node_modules/@typescript/typescript-linux-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-linux-x64/latest) | current |
| node_modules/@typescript/typescript-netbsd-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-netbsd-arm64/latest) | current |
| node_modules/@typescript/typescript-netbsd-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-netbsd-x64/latest) | current |
| node_modules/@typescript/typescript-openbsd-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-openbsd-arm64/latest) | current |
| node_modules/@typescript/typescript-openbsd-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-openbsd-x64/latest) | current |
| node_modules/@typescript/typescript-sunos-x64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-sunos-x64/latest) | current |
| node_modules/@typescript/typescript-win32-arm64 | transitive | 7.0.2 | unknown | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-win32-arm64/latest) | current |
| node_modules/@typescript/typescript-win32-x64 | transitive | 7.0.2 | 7.0.2 | [7.0.2](https://registry.npmjs.org/%40typescript%2Ftypescript-win32-x64/latest) | current |
| node_modules/@vitejs/plugin-react | direct development | 6.1.0 | 6.1.0 | [6.1.1](https://registry.npmjs.org/%40vitejs%2Fplugin-react/latest) | update available |
| node_modules/autoprefixer | direct development | 10.5.4 | 10.5.4 | [10.6.1](https://registry.npmjs.org/autoprefixer/latest) | update available |
| node_modules/baseline-browser-mapping | transitive | 2.11.12 | 2.11.12 | [2.11.25](https://registry.npmjs.org/baseline-browser-mapping/latest) | update available |
| node_modules/browserslist | transitive | 4.28.7 | 4.28.7 | [4.29.0](https://registry.npmjs.org/browserslist/latest) | update available |
| node_modules/caniuse-lite | transitive | 1.0.30001806 | 1.0.30001806 | [1.0.30001810](https://registry.npmjs.org/caniuse-lite/latest) | update available |
| node_modules/cookie | transitive | 1.1.1 | 1.1.1 | [2.0.1](https://registry.npmjs.org/cookie/latest) | update available |
| node_modules/csstype | transitive | 3.2.3 | 3.2.3 | [3.2.3](https://registry.npmjs.org/csstype/latest) | current |
| node_modules/detect-libc | transitive | 2.1.2 | 2.1.2 | [2.1.2](https://registry.npmjs.org/detect-libc/latest) | current |
| node_modules/electron-to-chromium | transitive | 1.5.400 | 1.5.400 | [1.5.433](https://registry.npmjs.org/electron-to-chromium/latest) | update available |
| node_modules/enhanced-resolve | transitive | 5.24.3 | 5.24.3 | [5.25.1](https://registry.npmjs.org/enhanced-resolve/latest) | update available |
| node_modules/escalade | transitive | 3.2.0 | 3.2.0 | [3.2.0](https://registry.npmjs.org/escalade/latest) | current |
| node_modules/fraction.js | transitive | 5.3.4 | 5.3.4 | [5.3.4](https://registry.npmjs.org/fraction.js/latest) | current |
| node_modules/fsevents | transitive | 2.3.3 | unknown | [2.3.3](https://registry.npmjs.org/fsevents/latest) | current |
| node_modules/graceful-fs | transitive | 4.2.11 | 4.2.11 | [4.2.11](https://registry.npmjs.org/graceful-fs/latest) | current |
| node_modules/jiti | transitive | 2.7.0 | 2.7.0 | [2.7.0](https://registry.npmjs.org/jiti/latest) | current |
| node_modules/lightningcss | transitive | 1.32.0 | 1.32.0 | [1.33.0](https://registry.npmjs.org/lightningcss/latest) | update available |
| node_modules/lightningcss-android-arm64 | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-android-arm64/latest) | update available |
| node_modules/lightningcss-darwin-arm64 | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-darwin-arm64/latest) | update available |
| node_modules/lightningcss-darwin-x64 | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-darwin-x64/latest) | update available |
| node_modules/lightningcss-freebsd-x64 | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-freebsd-x64/latest) | update available |
| node_modules/lightningcss-linux-arm-gnueabihf | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/latest) | update available |
| node_modules/lightningcss-linux-arm64-gnu | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm64-gnu/latest) | update available |
| node_modules/lightningcss-linux-arm64-musl | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm64-musl/latest) | update available |
| node_modules/lightningcss-linux-x64-gnu | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-x64-gnu/latest) | update available |
| node_modules/lightningcss-linux-x64-musl | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-x64-musl/latest) | update available |
| node_modules/lightningcss-win32-arm64-msvc | transitive | 1.32.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-win32-arm64-msvc/latest) | update available |
| node_modules/lightningcss-win32-x64-msvc | transitive | 1.32.0 | 1.32.0 | [1.33.0](https://registry.npmjs.org/lightningcss-win32-x64-msvc/latest) | update available |
| node_modules/magic-string | transitive | 0.30.21 | 0.30.21 | [1.4.1](https://registry.npmjs.org/magic-string/latest) | update available |
| node_modules/nanoid | transitive | 3.3.18 | 3.3.18 | [6.0.1](https://registry.npmjs.org/nanoid/latest) | update available |
| node_modules/node-releases | transitive | 2.0.52 | 2.0.52 | [2.0.56](https://registry.npmjs.org/node-releases/latest) | update available |
| node_modules/picocolors | transitive | 1.1.1 | 1.1.1 | [1.1.1](https://registry.npmjs.org/picocolors/latest) | current |
| node_modules/picomatch | transitive | 4.0.5 | 4.0.5 | [4.0.7](https://registry.npmjs.org/picomatch/latest) | update available |
| node_modules/postcss | direct development | 8.5.26 | 8.5.26 | [8.5.28](https://registry.npmjs.org/postcss/latest) | update available |
| node_modules/postcss-value-parser | transitive | 4.2.0 | 4.2.0 | [4.2.0](https://registry.npmjs.org/postcss-value-parser/latest) | current |
| node_modules/react | direct runtime | 19.2.8 | 19.2.8 | [19.3.0](https://registry.npmjs.org/react/latest) | update available |
| node_modules/react-dom | direct runtime | 19.2.8 | 19.2.8 | [19.3.0](https://registry.npmjs.org/react-dom/latest) | update available |
| node_modules/react-router | transitive | 7.18.2 | 7.18.2 | [8.4.0](https://registry.npmjs.org/react-router/latest) | update available |
| node_modules/react-router-dom | direct runtime | 7.18.2 | 7.18.2 | [7.18.4](https://registry.npmjs.org/react-router-dom/latest) | update available |
| node_modules/rolldown | transitive | 1.2.5 | 1.2.5 | [1.2.9](https://registry.npmjs.org/rolldown/latest) | update available |
| node_modules/scheduler | transitive | 0.27.0 | 0.27.0 | [0.28.0](https://registry.npmjs.org/scheduler/latest) | update available |
| node_modules/set-cookie-parser | transitive | 2.7.2 | 2.7.2 | [3.1.2](https://registry.npmjs.org/set-cookie-parser/latest) | update available |
| node_modules/source-map-js | transitive | 1.2.1 | 1.2.1 | [1.2.1](https://registry.npmjs.org/source-map-js/latest) | current |
| node_modules/tailwindcss | direct development | 4.3.3 | 4.3.3 | [4.3.3](https://registry.npmjs.org/tailwindcss/latest) | current |
| node_modules/tapable | transitive | 2.3.3 | 2.3.3 | [2.3.3](https://registry.npmjs.org/tapable/latest) | current |
| node_modules/tinyglobby | transitive | 0.2.17 | 0.2.17 | [0.2.17](https://registry.npmjs.org/tinyglobby/latest) | current |
| node_modules/tinyglobby/node_modules/fdir | transitive | 6.5.0 | 6.5.0 | [6.5.0](https://registry.npmjs.org/fdir/latest) | current |
| node_modules/tslib | transitive | 2.8.1 | unknown | [2.8.1](https://registry.npmjs.org/tslib/latest) | current |
| node_modules/typescript | direct development | 7.0.2 | 7.0.2 | [7.0.2](https://registry.npmjs.org/typescript/latest) | current |
| node_modules/update-browserslist-db | transitive | 1.2.3 | 1.2.3 | [1.3.3](https://registry.npmjs.org/update-browserslist-db/latest) | update available |
| node_modules/vite | direct development | 8.2.2 | 8.2.2 | [8.3.0](https://registry.npmjs.org/vite/latest) | update available |
| node_modules/vite/node_modules/lightningcss | transitive | 1.33.0 | 1.33.0 | [1.33.0](https://registry.npmjs.org/lightningcss/latest) | current |
| node_modules/vite/node_modules/lightningcss-android-arm64 | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-android-arm64/latest) | current |
| node_modules/vite/node_modules/lightningcss-darwin-arm64 | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-darwin-arm64/latest) | current |
| node_modules/vite/node_modules/lightningcss-darwin-x64 | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-darwin-x64/latest) | current |
| node_modules/vite/node_modules/lightningcss-freebsd-x64 | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-freebsd-x64/latest) | current |
| node_modules/vite/node_modules/lightningcss-linux-arm-gnueabihf | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/latest) | current |
| node_modules/vite/node_modules/lightningcss-linux-arm64-gnu | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm64-gnu/latest) | current |
| node_modules/vite/node_modules/lightningcss-linux-arm64-musl | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-arm64-musl/latest) | current |
| node_modules/vite/node_modules/lightningcss-linux-x64-gnu | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-x64-gnu/latest) | current |
| node_modules/vite/node_modules/lightningcss-linux-x64-musl | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-linux-x64-musl/latest) | current |
| node_modules/vite/node_modules/lightningcss-win32-arm64-msvc | transitive | 1.33.0 | unknown | [1.33.0](https://registry.npmjs.org/lightningcss-win32-arm64-msvc/latest) | current |
| node_modules/vite/node_modules/lightningcss-win32-x64-msvc | transitive | 1.33.0 | 1.33.0 | [1.33.0](https://registry.npmjs.org/lightningcss-win32-x64-msvc/latest) | current |

## Lookup failures

None.

See docs/TECHNOLOGY-UPDATE-PLAN.md for automation coverage, review gates, environment migrations, and service/API checks.
