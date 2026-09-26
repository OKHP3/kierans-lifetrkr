import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

test('browser harness runs directly from a path with spaces but stays idle when imported', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lifetrkr-harness-test-'))
  const entry = join(directory, 'browser journey.mjs')
  try {
    await copyFile(new URL('./rituals-browser-regression.mjs', import.meta.url), entry)
    const env = { ...process.env, TMPDIR: directory, TMP: directory, TEMP: directory,
      CHROMIUM_PATH: join(directory, 'deliberately-missing-browser') }
    const direct = spawnSync(process.execPath, [entry], { env, encoding: 'utf8', timeout: 15_000 })
    assert.equal(direct.error, undefined)
    assert.notEqual(direct.status, 0, 'direct execution silently skipped the browser journey')
    assert.match(direct.stderr, /ENOENT|Timed out waiting for .*DevTools/,
      'the browser startup path was not reached')

    const imported = spawnSync(process.execPath,
      ['--input-type=module', '-e', `await import(${JSON.stringify(pathToFileURL(entry).href)})`],
      { env, encoding: 'utf8', timeout: 5_000 })
    assert.equal(imported.error, undefined)
    assert.equal(imported.status, 0, imported.stderr)
    assert.equal(imported.stdout, '')
    assert.equal(imported.stderr, '')
  } finally {
    await rm(directory, { recursive: true, force: true, maxRetries: 10 })
  }
})

test('profile cleanup refuses paths outside disposable test profiles', async () => {
  const { removeBrowserProfile } = await import('./rituals-browser-regression.mjs')
  await assert.rejects(removeBrowserProfile(tmpdir()), /Refusing to remove/)
  await assert.rejects(removeBrowserProfile(process.cwd()), /Refusing to remove/)
})
