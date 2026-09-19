import assert from 'node:assert/strict'
import { rm } from 'node:fs/promises'

import { delay, startBrowser } from './rituals-browser-regression.mjs'

const baseUrl = process.env.BROWSER_TEST_URL ?? 'http://127.0.0.1:5000'

function waitForProcessExit(child) {
  if (child.exitCode !== null) return Promise.resolve()
  return new Promise(resolve => child.once('exit', resolve))
}

async function main() {
  const { browser, profileDirectory, page } = await startBrowser()

  try {
    await page.navigate(`${baseUrl}/#/habits`)
    await page.waitFor(
      `location.origin === ${JSON.stringify(new URL(baseUrl).origin)}`,
      'Habit app origin',
    )
    await page.evaluate(`(() => {
      localStorage.setItem('lifetrkr:welcomed', 'true')
      localStorage.setItem('lifetrkr:guest:settings', JSON.stringify({
        timezone: 'UTC',
        googleConnected: false,
      }))
      localStorage.setItem('lifetrkr:guest:habits', JSON.stringify([{
        id: 'browser-habit',
        name: 'Browser habit',
        active: true,
        createdAt: '2026-09-19',
        updatedAt: '2026-09-19',
        timesPerDay: 1,
        recurrence: {
          frequency: 'daily',
          interval: 1,
          startDate: '2026-09-19',
          end: { mode: 'never' },
          exceptions: [],
        },
      }]))
    })()`)
    await page.reload()
    await page.waitFor(
      `document.querySelector('h1')?.textContent?.trim() === 'Habits'
        && document.body.innerText.includes('Browser habit')`,
      'seeded Habits page',
    )

    await page.clickButton('edit')
    await page.waitFor(
      'document.querySelector("#habit-browser-habit-recurrence-frequency") !== null',
      'existing habit recurrence editor',
    )
    await page.click('button.fab')
    await page.evaluate(`(() => {
      const recurrenceButtons = [...document.querySelectorAll('button')]
        .filter(button => button.textContent?.includes('Recurrence'))
      const addFormButton = recurrenceButtons.at(-1)
      if (!addFormButton) throw new Error('Missing new habit recurrence toggle')
      addFormButton.click()
    })()`)
    await page.waitFor(
      'document.querySelector("#new-habit-recurrence-frequency") !== null',
      'new habit recurrence editor',
    )

    const expectedGroups = [
      'habit-browser-habit-recurrence-end',
      'new-habit-recurrence-end',
    ]
    assert.deepEqual(
      await page.evaluate(`(() => [...new Set(
        [...document.querySelectorAll('input[type="radio"]')]
          .map(input => input.name)
          .filter(name => name.endsWith('-recurrence-end'))
      )].sort())()`),
      expectedGroups,
      'open habit recurrence editors did not use their stable independent prefixes',
    )

    const checkedEndModes = `(() => [...document.querySelectorAll('input[type="radio"]:checked')]
      .map(input => ({ name: input.name, label: input.getAttribute('aria-label') }))
      .filter(selection => selection.name.endsWith('-recurrence-end'))
      .sort((left, right) => left.name.localeCompare(right.name)))()`
    assert.deepEqual(
      await page.evaluate(checkedEndModes),
      [
        { name: 'habit-browser-habit-recurrence-end', label: 'Never ends' },
        { name: 'new-habit-recurrence-end', label: 'Never ends' },
      ],
      'habit recurrence editors did not start with independent Never selections',
    )

    await page.evaluate(`(() => {
      const choose = (name, label) => {
        const input = [...document.querySelectorAll('input[type="radio"]')]
          .find(candidate => candidate.name === name && candidate.getAttribute('aria-label') === label)
        if (!input) throw new Error(\`Missing \${label} control in \${name}\`)
        input.click()
      }
      choose('habit-browser-habit-recurrence-end', 'Ends on a date')
    })()`)
    await delay(200)
    assert.deepEqual(
      await page.evaluate(checkedEndModes),
      [
        { name: 'habit-browser-habit-recurrence-end', label: 'Ends on a date' },
        { name: 'new-habit-recurrence-end', label: 'Never ends' },
      ],
      'selecting On date in the existing habit changed the new habit from Never',
    )

    await page.evaluate(`(() => {
      const input = [...document.querySelectorAll('input[type="radio"]')]
        .find(candidate => candidate.name === 'new-habit-recurrence-end'
          && candidate.getAttribute('aria-label') === 'Ends after a number of times')
      if (!input) throw new Error('Missing After control in new-habit-recurrence-end')
      input.click()
    })()`)
    await delay(200)

    assert.deepEqual(
      await page.evaluate(checkedEndModes),
      [
        { name: 'habit-browser-habit-recurrence-end', label: 'Ends on a date' },
        { name: 'new-habit-recurrence-end', label: 'Ends after a number of times' },
      ],
      'changing one open habit recurrence editor changed the other end mode',
    )

    console.log(JSON.stringify({
      check: 'habit recurrence editor end-mode isolation',
      existingHabit: 'onDate',
      newHabit: 'afterCount',
      result: 'passed',
    }, null, 2))
  } finally {
    page.connection.close()
    browser.kill('SIGKILL')
    await waitForProcessExit(browser)
    await rm(profileDirectory, { recursive: true, force: true })
  }
}

main().catch(error => {
  console.error(error.stack ?? error)
  process.exitCode = 1
})