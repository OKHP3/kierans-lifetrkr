import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delay, startBrowser, stopBrowser, removeBrowserProfile } from './rituals-browser-regression.mjs'

const baseUrl = process.env.BROWSER_TEST_URL ?? 'http://127.0.0.1:5000'
const normalProbeKey = 'lifetrkr:storage-regression:disposable-normal'
const incognitoProbeKey = 'lifetrkr:storage-regression:disposable-incognito'
const warningText = 'Local storage is unavailable. Your latest changes are only in memory and may be lost if you reload.'

async function checkNormalReloadRetention() {
  const runtime = await startBrowser()
  try {
    await runtime.page.navigate(`${baseUrl}/#/settings`)
    await runtime.page.evaluate(`localStorage.setItem(${JSON.stringify(normalProbeKey)}, 'disposable')`)
    await runtime.page.reload()
    assert.equal(
      await runtime.page.evaluate(`localStorage.getItem(${JSON.stringify(normalProbeKey)}) !== null`),
      true,
      'normal-profile disposable probe was not retained after reload',
    )
  } finally {
    await stopBrowser(runtime)
  }
}

async function checkIncognitoRestartLifetime() {
  const profileDirectory = await mkdtemp(`${tmpdir()}/lifetrkr-storage-incognito-`)
  let runtime = await startBrowser({ incognito: true, profileDirectory })
  try {
    await runtime.page.navigate(`${baseUrl}/#/settings`)
    await runtime.page.evaluate(`localStorage.setItem(${JSON.stringify(incognitoProbeKey)}, 'disposable')`)
    assert.equal(
      await runtime.page.evaluate(`localStorage.getItem(${JSON.stringify(incognitoProbeKey)}) !== null`),
      true,
      'incognito disposable probe was not readable within its browser session',
    )
    await stopBrowser(runtime, { removeProfile: false })

    runtime = await startBrowser({ incognito: true, profileDirectory })
    await runtime.page.navigate(`${baseUrl}/#/settings`)
    assert.equal(
      await runtime.page.evaluate(`localStorage.getItem(${JSON.stringify(incognitoProbeKey)}) === null`),
      true,
      'incognito disposable probe survived a browser restart',
    )
  } finally {
    await stopBrowser(runtime, { removeProfile: false })
    await removeBrowserProfile(profileDirectory)
  }
}

async function checkVisibleFailureAndRecovery() {
  const runtime = await startBrowser()
  const { page } = runtime
  try {
    await page.navigate(`${baseUrl}/#/settings`)
    await page.evaluate(`(() => {
      localStorage.clear()
      localStorage.setItem('lifetrkr:welcomed', 'true')
      localStorage.setItem('lifetrkr:guest:settings', JSON.stringify({
        timezone: 'UTC',
        googleConnected: false
      }))
    })()`)
    await page.reload()
    await page.waitFor(
      `document.querySelector('#timezone-select')?.value === 'UTC'`,
      'seeded disposable settings',
    )

    await page.evaluate(`(() => {
      globalThis.__storageRegressionSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function () {
        throw new DOMException('Disposable quota analogue', 'QuotaExceededError')
      }
      const select = document.querySelector('#timezone-select')
      select.value = 'Europe/London'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })()`)

    await page.waitFor(
      `document.querySelector('[role="alert"]')?.innerText.includes(${JSON.stringify(warningText)}) === true`,
      'visible storage warning text',
    )
    assert.equal(
      await page.evaluate(`(() => {
        const alert = document.querySelector('[role="alert"]')
        return [...(alert?.querySelectorAll('button') ?? [])]
          .some(button => button.textContent.trim() === 'Try saving again' && !button.disabled)
      })()`),
      true,
      'storage retry action was not visible and enabled',
    )
    assert.equal(
      await page.evaluate(`document.querySelector('#timezone-select')?.value`),
      'Europe/London',
      'failed write did not remain available in app memory',
    )

    await page.evaluate(`(() => {
      Storage.prototype.setItem = globalThis.__storageRegressionSetItem
      delete globalThis.__storageRegressionSetItem
    })()`)
    await page.clickButton('Try saving again')
    await page.waitFor(
      `document.querySelector('[role="alert"]') === null`,
      'storage warning to clear after retry',
    )
    assert.equal(
      await page.evaluate(`JSON.parse(localStorage.getItem('lifetrkr:guest:settings')).timezone`),
      'Europe/London',
      'restored retry did not save the in-memory settings',
    )

    await page.reload()
    await page.waitFor(
      `document.querySelector('#timezone-select')?.value === 'Europe/London'`,
      'retried settings after reload',
    )
    await delay(100)
  } finally {
    await stopBrowser(runtime)
  }
}

async function main() {
  await checkNormalReloadRetention()
  await checkIncognitoRestartLifetime()
  await checkVisibleFailureAndRecovery()
  console.log(JSON.stringify({
    check: 'storage warning browser recovery',
    dataBoundary: 'disposable labels only',
    normalReloadRetention: 'passed',
    incognitoRestartLifetime: 'passed',
    visibleWarningAndRetry: 'passed',
    restoredSaveAndReload: 'passed',
  }, null, 2))
}

main().catch(error => {
  console.error(error.stack ?? error)
  process.exitCode = 1
})