import assert from 'node:assert/strict'
import { rm } from 'node:fs/promises'
import { delay, startBrowser } from './rituals-browser-regression.mjs'

const baseUrl = process.env.BROWSER_TEST_URL ?? 'http://127.0.0.1:5000'
const beforeThreshold = Date.parse('2026-09-19T17:59:00.000Z')
const atThreshold = Date.parse('2026-09-19T18:00:00.000Z')

async function setBrowserTime(page, timestamp) {
  await page.connection.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `{
      const RealDate = Date;
      const fixedTime = ${timestamp};
      class FixedDate extends RealDate {
        constructor(...args) {
          super(...(args.length === 0 ? [fixedTime] : args));
        }
        static now() { return fixedTime; }
      }
      FixedDate.parse = RealDate.parse;
      FixedDate.UTC = RealDate.UTC;
      Object.setPrototypeOf(FixedDate, RealDate);
      globalThis.Date = FixedDate;
    }`,
  })
}

async function pressKey(page, key, options = {}) {
  const modifiers = options.shift ? 8 : 0
  await page.connection.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key,
    code: key,
    modifiers,
    windowsVirtualKeyCode: key === 'Escape' ? 27 : key === 'Tab' ? 9 : 0,
  })
  await page.connection.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: key,
    modifiers,
    windowsVirtualKeyCode: key === 'Escape' ? 27 : key === 'Tab' ? 9 : 0,
  })
  await delay(100)
}

async function seedState(page, { incomplete }) {
  await page.evaluate(`(() => {
    localStorage.clear()
    localStorage.setItem('lifetrkr:welcomed', 'true')
    localStorage.setItem('lifetrkr:guest:settings', JSON.stringify({
      timezone: 'UTC',
      googleConnected: false
    }))
    localStorage.setItem('lifetrkr:guest:routineTemplates', JSON.stringify(${JSON.stringify(
      [{
        id: 'saturday',
        dayOfWeek: 'Saturday',
        name: 'Review',
        items: incomplete ? [{ id: 'item-1', title: 'Item', sortOrder: 0 }] : [],
      }],
    )}))
    localStorage.setItem('lifetrkr:guest:routineCompletions', '[]')
    localStorage.setItem('lifetrkr:guest:habits', ${JSON.stringify(JSON.stringify(
      incomplete
        ? [{ id: 'habit-1', name: 'Habit', active: true, createdAt: '2026-09-19', timesPerDay: 2 }]
        : [],
    ))})
    localStorage.setItem('lifetrkr:guest:habitCompletions', '[]')
    localStorage.setItem('lifetrkr:guest:tasks', ${JSON.stringify(JSON.stringify(
      incomplete
        ? [{
            id: 'task-1',
            title: 'Task',
            status: 'today',
            priority: 'normal',
            createdAt: '2026-09-19',
            source: 'manual',
          }]
        : [],
    ))})
  })()`)
}

async function assertMobileLayout(page, expectedState) {
  const layout = await page.evaluate(`(() => {
    const dialog = document.querySelector('[role="dialog"]')
    const rect = dialog?.getBoundingClientRect()
    return {
      state: document.body.innerText.includes('Nothing logged yet.') ? 'empty' : 'incomplete',
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      dialogLeft: rect?.left ?? -1,
      dialogRight: rect?.right ?? Number.POSITIVE_INFINITY,
      dialogScrollable: dialog ? dialog.scrollHeight > dialog.clientHeight : false,
      controlsVisible: [...document.querySelectorAll('[role="dialog"] button')]
        .every(button => button.getBoundingClientRect().width > 0),
    }
  })()`)
  assert.equal(layout.state, expectedState)
  assert.ok(layout.documentWidth <= layout.viewportWidth, 'page clipped horizontally')
  assert.ok(layout.dialogLeft >= 0 && layout.dialogRight <= layout.viewportWidth, 'dialog clipped horizontally')
  assert.equal(layout.controlsVisible, true, 'dialog control was not rendered')
  return layout.dialogScrollable ? 'scrolls-within-sheet' : 'fits-within-sheet'
}

async function main() {
  const runtime = await startBrowser()
  const { browser, profileDirectory, page } = runtime
  const results = []
  try {
    await page.connection.send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      mobile: true,
    })
    await setBrowserTime(page, beforeThreshold)
    await page.navigate(`${baseUrl}/#/today`)
    await seedState(page, { incomplete: false })
    await page.reload()
    await page.waitFor("document.querySelector('h1')?.textContent?.trim() === 'Today'", 'Today page')
    assert.equal(
      await page.evaluate("document.body.innerText.includes('Open review')"),
      false,
      'evening trigger appeared before 6 PM',
    )
    results.push({ check: 'before-local-6pm-trigger', outcome: 'pass' })

    const thresholdRuntime = await startBrowser()
    try {
      const thresholdPage = thresholdRuntime.page
      await thresholdPage.connection.send('Emulation.setDeviceMetricsOverride', {
        width: 360,
        height: 640,
        deviceScaleFactor: 2,
        mobile: true,
      })
      await setBrowserTime(thresholdPage, atThreshold)
      await thresholdPage.navigate(`${baseUrl}/#/today`)
      await seedState(thresholdPage, { incomplete: false })
      await thresholdPage.reload()
      await thresholdPage.waitFor("document.body.innerText.includes('Open review')", '6 PM trigger')
      results.push({ check: 'at-local-6pm-trigger', outcome: 'pass' })

      await thresholdPage.pressButton('Open review')
      await thresholdPage.waitFor("document.querySelector('[role=\"dialog\"]') !== null", 'evening dialog')
      assert.equal(
        await thresholdPage.evaluate("document.activeElement?.getAttribute('aria-label')"),
        'Close evening wrap-up',
        'dialog did not receive initial focus',
      )
      await pressKey(thresholdPage, 'Tab')
      assert.equal(
        await thresholdPage.evaluate("document.activeElement?.textContent?.trim()"),
        'Close review',
        'Tab did not move to the next dialog control',
      )
      await pressKey(thresholdPage, 'Tab')
      assert.equal(
        await thresholdPage.evaluate("document.activeElement?.getAttribute('aria-label')"),
        'Close evening wrap-up',
        'focus did not wrap inside the dialog',
      )
      await pressKey(thresholdPage, 'Tab', { shift: true })
      assert.equal(
        await thresholdPage.evaluate("document.activeElement?.textContent?.trim()"),
        'Close review',
        'reverse focus did not wrap inside the dialog',
      )
      await pressKey(thresholdPage, 'Escape')
      assert.equal(
        await thresholdPage.evaluate("document.querySelector('[role=\"dialog\"]') === null"),
        true,
        'Escape did not close the dialog',
      )
      assert.equal(
        await thresholdPage.evaluate("document.activeElement?.textContent?.trim()"),
        'Open review',
        'focus did not return to the trigger',
      )
      results.push({ check: 'keyboard-dialog-focus-and-escape', outcome: 'pass' })

      await thresholdPage.pressButton('Open review')
      const emptyLayout = await assertMobileLayout(thresholdPage, 'empty')
      results.push({ check: 'mobile-empty-state', outcome: 'pass', layout: emptyLayout })
      await thresholdPage.clickButton('Close review')

      await seedState(thresholdPage, { incomplete: true })
      await thresholdPage.reload()
      await thresholdPage.waitFor("document.body.innerText.includes('Open review')", 'incomplete trigger')
      await thresholdPage.pressButton('Open review')
      const incompleteLayout = await assertMobileLayout(thresholdPage, 'incomplete')
      assert.equal(
        await thresholdPage.evaluate("document.querySelectorAll('.evening-wrap-up-categories section').length"),
        3,
        'incomplete review categories were not rendered',
      )
      results.push({ check: 'mobile-incomplete-state', outcome: 'pass', layout: incompleteLayout })

      console.log(JSON.stringify({ suite: 'evening-wrap-up-browser', results }, null, 2))
    } finally {
      thresholdRuntime.page.connection.close()
      thresholdRuntime.browser.kill('SIGKILL')
      await new Promise(resolve => thresholdRuntime.browser.once('exit', resolve))
      await rm(thresholdRuntime.profileDirectory, { recursive: true, force: true })
    }
  } finally {
    page.connection.close()
    browser.kill('SIGKILL')
    await new Promise(resolve => browser.once('exit', resolve))
    await rm(profileDirectory, { recursive: true, force: true })
  }
}

main().catch(error => {
  console.error(error.stack ?? error)
  process.exitCode = 1
})