import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { request } from 'node:http'
import net from 'node:net'
import { randomBytes } from 'node:crypto'
import { URL } from 'node:url'

const baseUrl = process.env.BROWSER_TEST_URL ?? 'http://127.0.0.1:5000'
const chromiumPath = process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium'

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function waitForProcessExit(child) {
  if (child.exitCode !== null) return Promise.resolve()
  return new Promise(resolve => child.once('exit', resolve))
}

function getJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    const req = request({
      hostname: target.hostname,
      port: target.port,
      path: `${target.pathname}${target.search}`,
      method: options.method ?? 'GET',
    }, response => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { body += chunk })
      response.on('end', () => {
        if ((response.statusCode ?? 500) >= 400) {
          reject(new Error(`${options.method ?? 'GET'} ${url} returned ${response.statusCode}: ${body}`))
          return
        }
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(new Error(`Invalid JSON from ${url}: ${error.message}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

function waitForLine(stream, pattern, timeoutMilliseconds = 10_000) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error(`Timed out waiting for ${pattern}`))
    }, timeoutMilliseconds)

    function onData(chunk) {
      buffer += chunk.toString()
      const line = buffer.match(pattern)
      if (!line) return
      cleanup()
      resolve(line[1])
    }

    function onError(error) {
      cleanup()
      reject(error)
    }

    function cleanup() {
      clearTimeout(timeout)
      stream.off('data', onData)
      stream.off('error', onError)
    }

    stream.on('data', onData)
    stream.on('error', onError)
  })
}

function connectWebSocket(webSocketUrl) {
  const target = new URL(webSocketUrl)
  const key = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
  const socket = new net.Socket()
  let receiveBuffer = Buffer.alloc(0)
  let handshakeComplete = false
  let nextId = 0
  const pending = new Map()
  let resolveReady
  let rejectReady
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  function cleanup(error) {
    if (!handshakeComplete) rejectReady(error)
    for (const { reject } of pending.values()) reject(error)
    pending.clear()
  }

  socket.on('error', cleanup)
  socket.on('close', () => cleanup(new Error('Chrome DevTools websocket closed')))
  socket.on('data', chunk => {
    receiveBuffer = Buffer.concat([receiveBuffer, chunk])
    if (!handshakeComplete) {
      const headerEnd = receiveBuffer.indexOf('\r\n\r\n')
      if (headerEnd === -1) return
      const headers = receiveBuffer.subarray(0, headerEnd).toString()
      if (!/^HTTP\/\d(?:\.\d)?\s+101\b/i.test(headers)) {
        cleanup(new Error(`Chrome DevTools websocket handshake failed: ${headers}`))
        return
      }
      handshakeComplete = true
      receiveBuffer = receiveBuffer.subarray(headerEnd + 4)
      resolveReady()
    }

    while (handshakeComplete) {
      if (receiveBuffer.length < 2) return
      const first = receiveBuffer[0]
      const second = receiveBuffer[1]
      const opcode = first & 0x0f
      const masked = (second & 0x80) !== 0
      let length = second & 0x7f
      let offset = 2
      if (length === 126) {
        if (receiveBuffer.length < 4) return
        length = receiveBuffer.readUInt16BE(2)
        offset = 4
      } else if (length === 127) {
        if (receiveBuffer.length < 10) return
        const bigLength = receiveBuffer.readBigUInt64BE(2)
        if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
          cleanup(new Error('Chrome DevTools websocket frame is too large'))
          return
        }
        length = Number(bigLength)
        offset = 10
      }
      const maskOffset = masked ? 4 : 0
      if (receiveBuffer.length < offset + maskOffset + length) return
      const mask = masked ? receiveBuffer.subarray(offset, offset + 4) : null
      const payloadStart = offset + maskOffset
      const payload = Buffer.from(receiveBuffer.subarray(payloadStart, payloadStart + length))
      receiveBuffer = receiveBuffer.subarray(payloadStart + length)
      if (mask) {
        for (let index = 0; index < payload.length; index += 1) {
          payload[index] ^= mask[index % 4]
        }
      }
      if (opcode === 0x8) {
        socket.end()
        cleanup(new Error('Chrome DevTools websocket closed'))
        return
      }
      if (opcode === 0x9) {
        writeFrame(0xA, payload)
        continue
      }
      if (opcode !== 0x1) continue
      let message
      try {
        message = JSON.parse(payload.toString('utf8'))
      } catch {
        continue
      }
      if (!message.id || !pending.has(message.id)) continue
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
  })

  function writeFrame(opcode, payload) {
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload)
    const mask = cryptoRandomBytes(4)
    let header
    if (body.length < 126) {
      header = Buffer.from([0x80 | opcode, 0x80 | body.length])
    } else if (body.length < 65_536) {
      header = Buffer.alloc(4)
      header[0] = 0x80 | opcode
      header[1] = 0x80 | 126
      header.writeUInt16BE(body.length, 2)
    } else {
      header = Buffer.alloc(10)
      header[0] = 0x80 | opcode
      header[1] = 0x80 | 127
      header.writeBigUInt64BE(BigInt(body.length), 2)
    }
    const maskedBody = Buffer.from(body)
    for (let index = 0; index < maskedBody.length; index += 1) {
      maskedBody[index] ^= mask[index % 4]
    }
    socket.write(Buffer.concat([header, mask, maskedBody]))
  }

  function send(method, params = {}) {
    const id = ++nextId
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
      writeFrame(0x1, JSON.stringify({ id, method, params }))
    })
  }

  socket.connect(Number(target.port), target.hostname, () => {
    socket.write([
      `GET ${target.pathname}${target.search} HTTP/1.1`,
      `Host: ${target.host}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
      '',
      '',
    ].join('\r\n'))
  })

  return {
    send,
    ready,
    close() {
      socket.end()
    },
  }
}

function cryptoRandomBytes(length) {
  return randomBytes(length)
}

function createPageClient(connection) {
  async function evaluate(expression) {
    const response = await connection.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? 'Browser evaluation failed')
    }
    return response.result?.value
  }

  async function waitFor(expression, description, timeoutMilliseconds = 8_000) {
    const started = Date.now()
    while (Date.now() - started < timeoutMilliseconds) {
      try {
        if (await evaluate(expression)) return
      } catch {
        // Navigation can briefly leave the execution context without a body.
        // Keep polling until the page settles or the descriptive timeout fires.
      }
      await delay(75)
    }
    throw new Error(`Timed out waiting for ${description}`)
  }

  async function navigate(url) {
    await connection.send('Page.navigate', { url })
    await waitFor('document.readyState === "complete"', 'page load')
  }

  async function reload() {
    await connection.send('Page.reload', { ignoreCache: true })
    await waitFor('document.readyState === "complete"', 'page reload')
  }

  async function click(selector) {
    const clicked = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)})
      if (!element || element.disabled) return false
      element.click()
      return true
    })()`)
    assert.equal(clicked, true, `could not click ${selector}`)
    await delay(100)
  }

  async function clickButton(text) {
    const clicked = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find(candidate => candidate.textContent.trim() === ${JSON.stringify(text)} && !candidate.disabled)
      if (!button) return false
      button.click()
      return true
    })()`)
    assert.equal(clicked, true, `could not click button ${text}`)
    await delay(100)
  }

  async function pressButton(text, key = 'Enter') {
    const focused = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find(candidate => candidate.textContent.trim() === ${JSON.stringify(text)} && !candidate.disabled)
      if (!button) return false
      button.focus()
      return document.activeElement === button
    })()`)
    assert.equal(focused, true, `could not focus button ${text}`)
    await connection.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      code: key,
      text: key === 'Enter' ? '\r' : undefined,
      unmodifiedText: key === 'Enter' ? '\r' : undefined,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : undefined,
    })
    await connection.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code: key,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : undefined,
    })
    await delay(120)
  }

  async function focus(selector) {
    const focused = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)})
      if (!element) return false
      element.focus()
      return document.activeElement === element
    })()`)
    assert.equal(focused, true, `could not focus ${selector}`)
  }

  async function pressKey(selector, key, code = key) {
    await focus(selector)
    await connection.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key,
      code,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : key === ' ' ? 32 : undefined,
    })
    await connection.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : key === ' ' ? 32 : undefined,
    })
    await delay(120)
  }

  async function insertText(selector, text) {
    await focus(selector)
    await connection.send('Input.insertText', { text })
    await delay(100)
  }

  async function bodyText() {
    return evaluate('document.body.innerText')
  }

  return {
    connection,
    evaluate,
    waitFor,
    navigate,
    reload,
    click,
    clickButton,
    pressButton,
    focus,
    pressKey,
    insertText,
    bodyText,
  }
}

async function startBrowser() {
  const profileDirectory = await mkdtemp(`${tmpdir()}/lifetrkr-rituals-browser-`)
  const browser = spawn(chromiumPath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDirectory}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  try {
    const port = await waitForLine(browser.stderr, /DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//)
    const targets = await getJson(`http://127.0.0.1:${port}/json/list`)
    const target = targets.find(candidate => candidate.type === 'page')
    assert.ok(target?.webSocketDebuggerUrl, 'Chromium did not expose a page target')
    const connection = connectWebSocket(target.webSocketDebuggerUrl)
    await connection.ready
    await connection.send('Page.enable')
    await connection.send('Runtime.enable')
    return {
      browser,
      profileDirectory,
      page: createPageClient(connection),
    }
  } catch (error) {
    browser.kill('SIGKILL')
    await waitForProcessExit(browser)
    await rm(profileDirectory, { recursive: true, force: true })
    throw error
  }
}

async function main() {
  const runtime = await startBrowser()
  const { browser, profileDirectory, page } = runtime
  try {
    await page.navigate(`${baseUrl}/#/rituals`)

    const configured = await page.evaluate(`(() => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
      }).formatToParts(new Date())
      const value = type => parts.find(part => part.type === type)?.value ?? ''
      const date = \`\${value('year')}-\${value('month')}-\${value('day')}\`
      const calendar = new Date(\`\${date}T00:00:00Z\`)
      calendar.setUTCDate(calendar.getUTCDate() - 1)
      const previousDate = [
        calendar.getUTCFullYear(),
        String(calendar.getUTCMonth() + 1).padStart(2, '0'),
        String(calendar.getUTCDate()).padStart(2, '0'),
      ].join('-')
      return { date, previousDate, weekday: value('weekday'), timezone: 'UTC' }
    })()`)

    await page.evaluate(`(() => {
      localStorage.setItem('lifetrkr:welcomed', 'true')
      localStorage.setItem('lifetrkr:guest:settings', JSON.stringify({
        timezone: 'UTC',
        googleConnected: false,
      }))
      localStorage.setItem('lifetrkr:guest:routineCompletions', JSON.stringify([{
        date: ${JSON.stringify(configured.previousDate)},
        routineTemplateId: ${JSON.stringify(configured.weekday.toLowerCase())},
        completedItemIds: ['historic-item'],
      }]))
    })()`)
    await page.reload()
    await page.waitFor(
      `document.querySelector('h1')?.textContent?.trim() === 'Rituals'`,
      'Rituals page',
    )
    await delay(400)
    assert.deepEqual(
      await page.evaluate("JSON.parse(localStorage.getItem('lifetrkr:guest:routineCompletions') || '[]')"),
      [{
        date: configured.previousDate,
        routineTemplateId: configured.weekday.toLowerCase(),
        completedItemIds: ['historic-item'],
      }],
      'seeded completion history was not available after hydration',
    )

    await page.clickButton('Edit')
    await page.click('button.fab')
    await page.insertText('input[aria-label="Ritual name"]', 'Keyboard ritual')

    // The override checkbox is toggled with the browser's Space key.
    await page.pressKey('input[aria-label="Use a different schedule for new ritual item"]', ' ', 'Space')
    await page.waitFor(
      'document.querySelector("#new-item-recurrence-frequency") !== null',
      'new item recurrence controls',
    )

    // Move the new override from Daily to Weekly using the select's keyboard controls.
    await page.pressKey('#new-item-recurrence-frequency', 'Home')
    await page.pressKey('#new-item-recurrence-frequency', 'ArrowDown')
    await page.pressKey('#new-item-recurrence-frequency', 'ArrowDown')
    await page.pressKey('#new-item-recurrence-frequency', 'Enter')
    await page.pressButton('Add')

    try {
      await page.waitFor(
        `JSON.parse(localStorage.getItem('lifetrkr:guest:routineTemplates') || '[]')
          .some(template => template.items.some(item => item.title === 'Keyboard ritual'))`,
        'created ritual item',
      )
    } catch (error) {
      const draft = await page.evaluate(`(() => ({
        title: document.querySelector('input[aria-label="Ritual name"]')?.value ?? null,
        override: document.querySelector('input[aria-label="Use a different schedule for new ritual item"]')?.checked ?? null,
        frequency: document.querySelector('#new-item-recurrence-frequency')?.value ?? null,
        body: document.body.innerText,
      }))()`)
      throw new Error(`${error.message}\n${JSON.stringify(draft, null, 2)}`)
    }
    await delay(300)

    const created = await page.evaluate(`(() => {
      const templates = JSON.parse(localStorage.getItem('lifetrkr:guest:routineTemplates') || '[]')
      const template = templates.find(candidate => candidate.dayOfWeek === ${JSON.stringify(configured.weekday)})
      const item = template?.items.find(candidate => candidate.title === 'Keyboard ritual')
      return item ? {
        id: item.id,
        frequency: item.recurrence?.frequency,
        exceptions: item.recurrence?.exceptions ?? [],
      } : null
    })()`)
    assert.ok(created, 'created item was not persisted')
    assert.equal(created.frequency, 'weekly', 'keyboard recurrence selection was not saved')
    assert.deepEqual(created.exceptions, [])

    await page.reload()
    await page.waitFor(
      'document.body.innerText.includes("Keyboard ritual")',
      'reloaded ritual item',
    )
    const reloaded = await page.evaluate(`(() => {
      const templates = JSON.parse(localStorage.getItem('lifetrkr:guest:routineTemplates') || '[]')
      const template = templates.find(candidate => candidate.dayOfWeek === ${JSON.stringify(configured.weekday)})
      const item = template?.items.find(candidate => candidate.id === ${JSON.stringify(created.id)})
      return item ? {
        title: item.title,
        frequency: item.recurrence?.frequency,
        startDate: item.recurrence?.startDate,
      } : null
    })()`)
    assert.deepEqual(reloaded, {
      title: 'Keyboard ritual',
      frequency: 'weekly',
      startDate: configured.date,
    }, 'override did not survive reload')

    const beforePreview = await page.evaluate(`JSON.parse(
      localStorage.getItem('lifetrkr:guest:routineCompletions') || '[]'
    )`)
    await page.clickButton('Preview')
    await page.waitFor(
      'document.body.innerText.includes("Upcoming schedule")',
      'upcoming ritual schedule preview',
    )
    const afterPreview = await page.evaluate(`(() => ({
      completions: JSON.parse(localStorage.getItem('lifetrkr:guest:routineCompletions') || '[]'),
      hasUpcomingDate: document.body.innerText.includes('Today') || document.body.innerText.includes('Monday'),
      hasStatusLegend: document.body.innerText.includes('Inherited = follows the ritual')
    }))()`)
    assert.deepEqual(afterPreview.completions, beforePreview, 'preview changed completion history')
    assert.equal(afterPreview.hasUpcomingDate, true, 'preview did not show an upcoming date')
    assert.equal(afterPreview.hasStatusLegend, true, 'preview did not show schedule status guidance')
    await page.clickButton('Close preview')

    await page.clickButton('Edit')
    await page.click(`button[aria-label="Edit Keyboard ritual"]`)
    const itemFrequency = `#item-${created.id}-recurrence-frequency`
    await page.waitFor(`document.querySelector(${JSON.stringify(itemFrequency)}) !== null`, 'item recurrence editor')

    // Edit the rule to Daily with Home/ArrowDown, again through keyboard input.
    await page.pressKey(itemFrequency, 'Home')
    await page.pressKey(itemFrequency, 'ArrowDown')
    await page.pressKey(itemFrequency, 'Enter')
    const exceptionSelector = `input[aria-label="Skip ${configured.date}"]`
    await page.waitFor(`document.querySelector(${JSON.stringify(exceptionSelector)}) !== null`, 'date exception control')

    // Skip the configured-timezone date and close the editor.
    await page.pressKey(exceptionSelector, ' ', 'Space')
    await page.waitFor(
      `document.querySelector(${JSON.stringify(exceptionSelector)})?.checked === true`,
      'date exception toggle',
    )
    await page.click(`button[aria-label="Close Keyboard ritual"]`)
    await page.clickButton('Done')
    await page.waitFor(
      'document.body.innerText.includes("No ritual items are scheduled today.")',
      'skipped item empty state',
    )

    const afterSkip = await page.evaluate(`(() => {
      const templates = JSON.parse(localStorage.getItem('lifetrkr:guest:routineTemplates') || '[]')
      const template = templates.find(candidate => candidate.dayOfWeek === ${JSON.stringify(configured.weekday)})
      const item = template?.items.find(candidate => candidate.id === ${JSON.stringify(created.id)})
      const completions = JSON.parse(localStorage.getItem('lifetrkr:guest:routineCompletions') || '[]')
      return {
        frequency: item?.recurrence?.frequency,
        exceptions: item?.recurrence?.exceptions ?? [],
        completions,
        completionButtons: document.querySelectorAll('button.check-circle').length,
      }
    })()`)
    assert.equal(afterSkip.frequency, 'daily', 'edited recurrence rule was not saved')
    assert.deepEqual(afterSkip.exceptions, [configured.date], 'date exception was not saved')
    assert.deepEqual(afterSkip.completions, [{
      date: configured.previousDate,
      routineTemplateId: configured.weekday.toLowerCase(),
      completedItemIds: ['historic-item'],
    }], 'skipping today disturbed existing completion history')

    // A skipped item has no keyboard-focusable completion control, so Enter cannot create history.
    assert.equal(afterSkip.completionButtons, 0, 'skipped item still exposed a completion control')
    await page.focus('body')
    await page.connection.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' })
    await page.connection.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' })
    assert.equal(
      await page.evaluate("document.activeElement?.classList.contains('check-circle') ?? false"),
      false,
      'keyboard focus reached a completion control for a skipped item',
    )
    await page.connection.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Enter',
      code: 'Enter',
      text: '\r',
      unmodifiedText: '\r',
      windowsVirtualKeyCode: 13,
    })
    await page.connection.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
    })
    await delay(100)
    const completionGuard = await page.evaluate(`JSON.parse(
      localStorage.getItem('lifetrkr:guest:routineCompletions') || '[]'
    )`)
    assert.deepEqual(completionGuard, afterSkip.completions, 'keyboard interaction changed skipped-date history')

    console.log(JSON.stringify({
      check: 'ritual schedule browser journey',
      timezone: configured.timezone,
      configuredDate: configured.date,
      previousHistoryDate: configured.previousDate,
      createdOverride: 'weekly',
      editedOverride: 'daily',
      skippedDate: configured.date,
      completionGuard: 'passed',
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
