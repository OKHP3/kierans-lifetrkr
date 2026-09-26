import assert from 'node:assert/strict'

import { delay, startBrowser, stopBrowser } from './rituals-browser-regression.mjs'

const baseUrl = process.env.BROWSER_TEST_URL ?? 'http://127.0.0.1:5000'
const eventTitle = 'Recurring browser event'

async function setControlValue(page, selector, value) {
  const changed = await page.evaluate(`(() => {
    const control = document.querySelector(${JSON.stringify(selector)})
    if (!control) return false
    const prototype = control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(control, ${JSON.stringify(value)})
    control.dispatchEvent(new Event('change', { bubbles: true }))
    control.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
  assert.equal(changed, true, `could not change ${selector}`)
  await delay(100)
}

async function openEventEditor(page) {
  const opened = await page.evaluate(`(() => {
    const title = [...document.querySelectorAll('p')]
      .find(candidate => candidate.textContent?.trim() === ${JSON.stringify(eventTitle)})
    const card = title?.closest('.card')
    const button = card?.querySelector('button[title="Edit event"]')
    if (!button) return false
    button.click()
    return true
  })()`)
  assert.equal(opened, true, 'could not open the recurring manual event')
  await page.waitFor(
    'document.querySelector("#calendar-event-recurrence-frequency") !== null',
    'calendar recurrence editor',
  )
}

async function readStoredEvents(page) {
  return page.evaluate(`JSON.parse(
    localStorage.getItem('lifetrkr:guest:calendarEvents') || '[]'
  )`)
}

async function assertSavedRule(page, expectedEnd) {
  await page.waitFor(
    `(() => {
      const events = JSON.parse(localStorage.getItem('lifetrkr:guest:calendarEvents') || '[]')
      return events.some(event => event.title === ${JSON.stringify(eventTitle)}
        && JSON.stringify(event.recurrence?.end) === ${JSON.stringify(JSON.stringify(expectedEnd))})
    })()`,
    `saved ${expectedEnd.mode} recurrence end`,
  )

  const events = await readStoredEvents(page)
  const manualEvent = events.find(event => event.title === eventTitle)
  assert.equal(manualEvent.source, 'manual', 'calendar save changed the manual event source')
  assert.deepEqual(manualEvent.recurrence.end, expectedEnd)
  assert.equal(
    events.every(event => event.source === 'manual'),
    true,
    'manual calendar persistence started retaining transient Google events',
  )
  assert.equal(
    await page.evaluate(`JSON.parse(
      localStorage.getItem('lifetrkr:guest:settings') || '{}'
    ).showGoogleCalendar`),
    true,
    'saving the manual recurrence changed the Google Calendar visibility setting',
  )

  await page.reload()
  await page.waitFor(
    `document.body.innerText.includes(${JSON.stringify(eventTitle)})`,
    `reloaded ${expectedEnd.mode} calendar event`,
  )
  await openEventEditor(page)

  const expectedLabel = {
    never: 'Never ends',
    onDate: 'Ends on a date',
    afterCount: 'Ends after a number of times',
  }[expectedEnd.mode]
  assert.equal(
    await page.evaluate(`document.querySelector(
      'input[name="calendar-event-recurrence-end"]:checked'
    )?.getAttribute('aria-label')`),
    expectedLabel,
    `${expectedEnd.mode} was not selected after reload`,
  )
  if (expectedEnd.mode === 'onDate') {
    assert.equal(
      await page.evaluate('document.querySelector(\'input[aria-label="Recurrence end date"]\')?.value'),
      expectedEnd.date,
      'recurrence end date did not survive reload',
    )
  }
  if (expectedEnd.mode === 'afterCount') {
    assert.equal(
      await page.evaluate('Number(document.querySelector(\'input[aria-label="Number of repetitions"]\')?.value)'),
      expectedEnd.count,
      'recurrence count did not survive reload',
    )
  }
}

async function chooseEndMode(page, label) {
  const selected = await page.evaluate(`(() => {
    const input = [...document.querySelectorAll(
      'input[name="calendar-event-recurrence-end"]'
    )].find(candidate => candidate.getAttribute('aria-label') === ${JSON.stringify(label)})
    if (!input) return false
    input.click()
    return true
  })()`)
  assert.equal(selected, true, `could not select ${label}`)
  await delay(100)
}

async function main() {
  const runtime = await startBrowser()
  const { page } = runtime
  try {
    await page.navigate(`${baseUrl}/#/calendar`)
    const today = await page.evaluate(`(() => {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
      }).formatToParts(new Date())
      const value = type => parts.find(part => part.type === type)?.value
      return \`\${value('year')}-\${value('month')}-\${value('day')}\`
    })()`)
    await page.evaluate(`(() => {
      localStorage.setItem('lifetrkr:welcomed', 'true')
      localStorage.setItem('lifetrkr:guest:settings', JSON.stringify({
        timezone: 'UTC',
        googleConnected: false,
        showGoogleCalendar: true,
      }))
      localStorage.setItem('lifetrkr:guest:calendarEvents', JSON.stringify([{
        id: 'google-browser-event',
        title: 'Google browser event',
        start: ${JSON.stringify(today)},
        allDay: true,
        location: null,
        description: null,
        colorId: null,
        source: 'google',
      }]))
    })()`)
    await page.reload()
    await page.waitFor(
      'document.querySelector("h1")?.textContent?.trim() === "Calendar"',
      'Calendar page',
    )

    await page.clickButton('+ Add event')
    await page.insertText('input[aria-label="Event title"]', eventTitle)
    await page.clickButton('▸ Recurrence')
    await setControlValue(page, '#calendar-event-recurrence-frequency', 'daily')
    await page.clickButton('Add event')
    await assertSavedRule(page, { mode: 'never' })

    await chooseEndMode(page, 'Ends on a date')
    await setControlValue(page, 'input[aria-label="Recurrence end date"]', '2026-10-31')
    await page.clickButton('Update event')
    await assertSavedRule(page, { mode: 'onDate', date: '2026-10-31' })

    await chooseEndMode(page, 'Ends after a number of times')
    await setControlValue(page, 'input[aria-label="Number of repetitions"]', '7')
    await page.clickButton('Update event')
    await assertSavedRule(page, { mode: 'afterCount', count: 7 })

    await page.clickButton('Cancel')
    console.log(JSON.stringify({
      check: 'calendar recurrence end persistence',
      modes: ['never', 'onDate', 'afterCount'],
      googleEventGuard: 'passed',
      result: 'passed',
    }, null, 2))
  } finally {
    await stopBrowser(runtime)
  }
}

main().catch(error => {
  console.error(error.stack ?? error)
  process.exitCode = 1
})