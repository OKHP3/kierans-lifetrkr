import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))

// Release checks deliberately accept only final major.minor.patch versions.
export function stableVersion(value) {
  const match = /^(?:v|bun-v)?(\d+\.\d+\.\d+)$/.exec(value ?? '')
  return match?.[1] ?? null
}

export function compareVersions(a, b) {
  const left = stableVersion(a)?.split('.').map(Number)
  const right = stableVersion(b)?.split('.').map(Number)
  if (!left || !right) return null
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return Math.sign(left[i] - right[i])
  return 0
}

export function releaseStatus(current, latest) {
  const comparison = compareVersions(current, latest)
  if (comparison === null) return 'unknown'
  return comparison < 0 ? 'update available' : comparison > 0 ? 'ahead of latest tag; review' : 'current'
}

export function lockInventory(manifest, lock) {
  const direct = { ...manifest.dependencies, ...manifest.devDependencies }
  return Object.entries(lock.packages ?? {}).filter(([path]) => path.includes('node_modules/'))
    .map(([path, entry]) => {
      const name = entry.name ?? path.slice(path.lastIndexOf('node_modules/') + 13)
      const isDirect = path === `node_modules/${name}` && Object.hasOwn(direct, name)
      return {
        name, path, locked: entry.version ?? null,
        scope: isDirect ? (Object.hasOwn(manifest.dependencies ?? {}, name) ? 'direct runtime' : 'direct development') : 'transitive',
        declared: isDirect ? direct[name] : null,
        optional: Boolean(entry.optional), dev: Boolean(entry.dev),
      }
    }).sort((a, b) => a.path.localeCompare(b.path))
}

export function actionInventory(files) {
  const actions = new Map()
  for (const [path, source] of Object.entries(files)) {
    for (const match of source.matchAll(/^\s*(?:-\s*)?uses:\s*['"]?([\w.-]+\/[\w./-]+)@([^\s'"#]+)/gm)) {
      const [, name, version] = match
      const key = `${name}@${version}`
      if (!actions.has(key)) actions.set(key, { name, version, files: [] })
      actions.get(key).files.push(path)
    }
  }
  return [...actions.values()]
}

export async function fetchSource(url, { fetchImpl = fetch, token = process.env.GITHUB_TOKEN, json = true, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const headers = { 'User-Agent': 'lifetrkr-technology-audit' }
  // Never send a GitHub credential to npm, Node, Python, or a redirected host.
  if (new URL(url).hostname === 'api.github.com' && token) headers.Authorization = `Bearer ${token}`
  let response
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(20000), redirect: 'error' })
    if (![429, 502, 503, 504].includes(response.status) || attempt === 2) break
    const retryAfter = response.headers?.get('retry-after')
    const delay = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt
    if (delay > 60000) break
    await sleep(Math.max(delay, 1000))
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return json ? response.json() : response.text()
}

export function pythonStable(html) {
  const versions = [...html.matchAll(/>Python\s+(\d+\.\d+\.\d+)</g)].map(match => match[1])
  versions.sort((a, b) => compareVersions(b, a))
  if (!versions.length) throw new Error('No stable Python releases in source')
  return versions[0]
}

export function nodeReleases(releases) {
  const stable = releases.filter(row => stableVersion(row.version)).sort((a, b) => compareVersions(b.version, a.version))
  const lts = stable.find(row => row.lts)
  if (!stable.length || !lts) throw new Error('Missing stable Node or LTS release')
  return { current: stable[0].version, lts: lts.version, ltsNpm: lts.npm }
}

async function mapLimited(values, fn, { concurrency = 6, delayMs = 0 } = {}) {
  const results = []
  for (let i = 0; i < values.length; i += concurrency) {
    if (i && delayMs) await new Promise(resolve => setTimeout(resolve, delayMs))
    results.push(...await Promise.all(values.slice(i, i + concurrency).map(fn)))
  }
  return results
}

function command(commandName, args, cwd) {
  try { return execFileSync(commandName, args, { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }).trim() }
  catch { return null }
}

const cell = value => String(value ?? 'unknown').replaceAll('|', '\\|').replaceAll('\n', ' ')
export function markdown(report) {
  const rows = report.packages
  const lines = [
    '# Technology release audit', '',
    `Retrieved: ${report.retrievedAt}. Source commit: ${report.sourceCommit}${report.sourceHasUncommittedChanges ? ' (working tree has uncommitted changes)' : ''}.`, '',
    `${rows.length} lockfile entries; ${report.registry.length} unique package names checked (includes reference tools).`,
    `Lookup failures: ${report.errors.length}. All values describe this execution host, not other machines.`, '',
    'The latest npm dist-tag is the publisher-designated stable channel. A newer release is a review candidate, not proof of compatibility.', '',
    '## Direct packages', '',
    '| Package | Declared | Locked | Installed on this host | Latest stable | Status |',
    '|---|---|---|---|---|---|',
    ...rows.filter(row => row.scope.startsWith('direct')).map(row => `| ${cell(row.name)} | ${cell(row.declared)} | ${cell(row.locked)} | ${cell(row.installed)} | [${cell(row.latest)}](${row.source}) | ${cell(row.status)} |`), '',
    '## GitHub Actions', '', '| Action | Selected | Latest stable | Status |', '|---|---|---|---|',
    ...report.actions.map(row => `| ${row.name} | ${row.version} | [${cell(row.latest)}](${row.source}) | ${row.status} |`), '',
    '## Runtime and reference releases', '', '| Technology | This host / selection | Latest stable | Source |', '|---|---|---|---|',
    ...report.runtimes.map(row => `| ${row.name} | ${cell(row.current)} | ${cell(row.latest)} | [Official source](${row.source}) |`), '',
    '## Configuration and support tooling', '',
    '```json', JSON.stringify(report.configuration, null, 2), '```', '',
    '## Complete lockfile inventory', '',
    'Optional platform binaries are included even when not installed on this OS. Multiple versions retain separate rows. Transitive latest values are informational; parent constraints control updates.', '',
    '| Package path | Scope | Locked | Installed | Latest stable | Status |', '|---|---|---|---|---|---|',
    ...rows.map(row => `| ${cell(row.path)} | ${row.scope} | ${cell(row.locked)} | ${cell(row.installed)} | [${cell(row.latest)}](${row.source}) | ${row.status} |`), '',
    '## Lookup failures', '', ...report.errors.map(row => `- ${row.name}: ${row.error} (${row.source})`),
    ...(report.errors.length ? [] : ['None.']), '',
    'See docs/TECHNOLOGY-UPDATE-PLAN.md for automation coverage, review gates, environment migrations, and service/API checks.', '',
  ]
  return lines.join('\n')
}

export async function audit(root = ROOT, request = fetchSource) {
  const readJson = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'))
  const manifest = await readJson('package.json')
  const lock = await readJson('package-lock.json')
  const packages = lockInventory(manifest, lock)
  const errors = []
  for (const section of ['dependencies', 'devDependencies']) {
    if (JSON.stringify(manifest[section] ?? {}) !== JSON.stringify(lock.packages?.['']?.[section] ?? {})) {
      errors.push({ name: section, source: 'package-lock.json', error: 'Manifest and lockfile declarations differ' })
    }
  }
  for (const name of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })) {
    if (!packages.some(row => row.name === name && row.scope.startsWith('direct'))) {
      errors.push({ name, source: 'package-lock.json', error: 'Direct dependency missing from lockfile' })
    }
  }
  async function lookup(name, source, extract, options) {
    try { return { name, source, ...extract(await request(source, options)) } }
    catch (error) { errors.push({ name, source, error: error.message }); return { name, source, latest: null } }
  }
  const registry = await mapLimited([...new Set([...packages.map(row => row.name), 'npm', 'bun', 'mermaid'])].sort(), name =>
    lookup(name, `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, data => {
      const latest = stableVersion(data.version)
      if (!latest) throw new Error('latest tag is not a stable release')
      return { latest, engines: data.engines ?? null, deprecated: data.deprecated ?? null }
    }), { concurrency: 1, delayMs: 1050 })
  const byName = new Map(registry.map(row => [row.name, row]))
  for (const row of packages) {
    const upstream = byName.get(row.name)
    try { row.installed = (await readJson(`${row.path}/package.json`)).version }
    catch { row.installed = null }
    Object.assign(row, { latest: upstream.latest, source: upstream.source, status: releaseStatus(row.locked, upstream.latest) })
  }
  const workflowFiles = {}
  for (const name of await readdir(resolve(root, '.github/workflows'))) {
    if (/\.ya?ml$/.test(name)) workflowFiles[`.github/workflows/${name}`] = await readFile(resolve(root, '.github/workflows', name), 'utf8')
  }
  const actions = await mapLimited(actionInventory(workflowFiles), async row => {
    const repo = row.name.split('/').slice(0, 2).join('/')
    const release = await lookup(row.name, `https://api.github.com/repos/${repo}/releases/latest`, data => {
      if (data.draft || data.prerelease || !stableVersion(data.tag_name)) throw new Error('No stable action release')
      return { latest: data.tag_name, publishedAt: data.published_at }
    })
    return { ...row, ...release, status: releaseStatus(row.version, release.latest) }
  })
  const node = await lookup('Node.js', 'https://nodejs.org/dist/index.json', data => ({ ...nodeReleases(data), latest: nodeReleases(data).current }))
  const python = await lookup('Python', 'https://www.python.org/downloads/', html => ({ latest: pythonStable(html) }), { json: false })
  const tracked = (command('git', ['ls-files', '-z'], root) ?? '').split('\0').filter(Boolean)
  const supportManifests = []
  for (const path of tracked.filter(path => path.endsWith('/package.json'))) {
    const data = await readJson(path)
    supportManifests.push({ path, name: data.name, version: data.version, dependencies: { ...data.dependencies, ...data.devDependencies } })
    if (Object.keys(supportManifests.at(-1).dependencies).length) errors.push({ name: path, source: path, error: 'New support-package dependencies require inventory and Dependabot coverage' })
  }
  const replit = await readFile(resolve(root, '.replit'), 'utf8')
  return {
    schemaVersion: 1, retrievedAt: new Date().toISOString(), sourceCommit: command('git', ['rev-parse', 'HEAD'], root),
    sourceHasUncommittedChanges: Boolean(command('git', ['status', '--porcelain'], root)),
    appVersion: manifest.version, host: process.platform,
    configuration: {
      engines: manifest.engines, lockfileVersion: lock.lockfileVersion,
      nodeSelections: Object.fromEntries(Object.entries(workflowFiles).map(([path, source]) => [path, [...source.matchAll(/node-version:\s*['"]?([^\s'"]+)/g)].map(match => match[1])])),
      replitModules: replit.match(/^modules\s*=\s*(.+)$/m)?.[1] ?? 'unknown',
      replitChannel: replit.match(/^channel\s*=\s*"([^"]+)"/m)?.[1] ?? 'unknown',
      typescriptTarget: (await readJson('tsconfig.json')).compilerOptions.target,
      pythonFiles: tracked.filter(path => path.endsWith('.py')), supportManifests,
    },
    packages, registry, actions,
    runtimes: [
      { name: 'Node.js Current', current: process.version, latest: node.latest, source: node.source },
      { name: 'Node.js LTS', current: process.version, latest: node.lts ?? null, source: node.source },
      { name: 'npm', current: process.env.npm_config_user_agent?.match(/npm\/([^ ]+)/)?.[1] ?? command(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], root), latest: byName.get('npm').latest, source: byName.get('npm').source },
      { name: 'Python (support tools)', current: process.platform === 'win32' ? command('py', ['-3', '--version'], root) : command('python3', ['--version'], root), latest: python.latest, source: python.source },
      { name: 'Bun (test runner)', current: command('bun', ['--version'], root), latest: byName.get('bun').latest, source: byName.get('bun').source },
      { name: 'Mermaid (reference only; not installed)', current: 'not an application dependency', latest: byName.get('mermaid').latest, source: byName.get('mermaid').source },
    ], errors,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length && (args[0] !== '--output' || args.length !== 2)) throw new Error('Usage: node scripts/technology-audit.mjs [--output DIRECTORY]')
    const output = resolve(ROOT, args[1] ?? '.cache/technology-audit')
    const report = await audit()
    await mkdir(output, { recursive: true })
    await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
    await writeFile(resolve(output, 'report.md'), markdown(report))
    console.log(`${report.packages.length} lock entries; ${report.packages.filter(row => row.scope.startsWith('direct') && row.status === 'update available').length} direct updates; ${report.errors.length} lookup failures. Reports: ${output}`)
    if (report.errors.length) process.exitCode = 1
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
