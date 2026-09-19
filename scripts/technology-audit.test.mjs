import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stableVersion, compareVersions, releaseStatus, lockInventory, actionInventory, fetchSource, pythonStable, nodeReleases } from './technology-audit.mjs'

test('stable channel rejects prereleases, malformed versions, and mutable aliases', () => {
  for (const value of ['1.0.0-rc.1', '3.15.0rc1', 'latest', 'v7', undefined]) assert.equal(stableVersion(value), null)
  assert.equal(stableVersion('bun-v1.4.2'), '1.4.2')
})

test('numeric comparisons never recommend a downgrade', () => {
  assert.equal(compareVersions('8.10.0', '8.9.9'), 1)
  assert.equal(releaseStatus('8.10.0', '8.9.9'), 'ahead of latest tag; review')
  assert.equal(releaseStatus('8.9.9', '8.10.0'), 'update available')
  assert.equal(releaseStatus('v7.0.0', '7.0.0'), 'current')
  assert.equal(releaseStatus('7.0.0', null), 'unknown')
})

test('lock inventory preserves scoped, optional, and nested versions separately', () => {
  const rows = lockInventory({ dependencies: { '@scope/a': '^1.0.0' } }, { packages: {
    '': { version: '0.1.10' },
    'node_modules/@scope/a': { version: '1.0.1' },
    'node_modules/native': { version: '2.0.0', optional: true },
    'node_modules/native/node_modules/@scope/a': { version: '0.9.0' },
  } })
  assert.equal(rows.length, 3)
  assert.equal(rows[0].scope, 'direct runtime')
  assert.equal(rows[1].optional, true)
  assert.equal(rows[2].name, '@scope/a')
  assert.equal(rows[2].scope, 'transitive')
})

test('action inventory deduplicates exact references without dropping differing versions', () => {
  const rows = actionInventory({ 'a.yml': '- uses: actions/checkout@v7.0.1\n- uses: actions/checkout@v6.0.0', 'b.yml': '  uses: "actions/checkout@v7.0.1" # note' })
  assert.equal(rows.length, 2)
  assert.deepEqual(rows[0].files, ['a.yml', 'b.yml'])
})

test('registry failures stay failures, including invalid JSON', async () => {
  await assert.rejects(fetchSource('https://registry.npmjs.org/react/latest', { sleep: async () => {}, fetchImpl: async () => ({ ok: false, status: 429 }) }), /HTTP 429/)
  await assert.rejects(fetchSource('https://registry.npmjs.org/react/latest', { fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('bad JSON') } }) }), /bad JSON/)
})

test('temporary throttling is retried with bounded backoff', async () => {
  let attempts = 0
  const delays = []
  const result = await fetchSource('https://registry.npmjs.org/react/latest', {
    sleep: async delay => delays.push(delay),
    fetchImpl: async () => ++attempts === 1 ? { ok: false, status: 429, headers: new Headers({ 'retry-after': '2' }) } : { ok: true, status: 200, json: async () => ({ version: '19.3.0' }) },
  })
  assert.equal(result.version, '19.3.0')
  assert.deepEqual(delays, [2000])
  assert.equal(attempts, 2)
})

test('GitHub token is host restricted and redirects are rejected', async () => {
  const calls = []
  const fetchImpl = async (url, options) => { calls.push({ url, ...options }); return { ok: true, json: async () => ({}) } }
  await fetchSource('https://registry.npmjs.org/react/latest', { token: 'fixture', fetchImpl })
  await fetchSource('https://api.github.com/repos/actions/checkout/releases/latest', { token: 'fixture', fetchImpl })
  assert.equal(calls[0].headers.Authorization, undefined)
  assert.equal(calls[1].headers.Authorization, 'Bearer fixture')
  assert.equal(calls[1].redirect, 'error')
})

test('Python release discovery ignores prereleases and fails on changed markup', () => {
  assert.equal(pythonStable('<a>Python 3.15.0rc2</a><a>Python 3.14.7</a><a>Python 3.13.15</a>'), '3.14.7')
  assert.throws(() => pythonStable('unavailable'), /No stable/)
})

test('Node Current and LTS are separate and do not depend on feed ordering', () => {
  assert.deepEqual(nodeReleases([{ version: 'v22.23.2', lts: 'Jod', npm: '10.9.8' }, { version: 'v27.0.0-rc.1' }, { version: 'v26.9.0', lts: false }, { version: 'v24.21.0', lts: 'Krypton', npm: '11.19.0' }]), { current: 'v26.9.0', lts: 'v24.21.0', ltsNpm: '11.19.0' })
  assert.throws(() => nodeReleases([]), /Missing stable/)
})
