import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import vm from 'node:vm'
import test from 'node:test'

const projectRoot = join(import.meta.dirname, '..')
const serviceWorkerSource = await readFile(join(projectRoot, 'public', 'sw.js'), 'utf8')

test('activation removes only older LifeTrkr shell caches', async () => {
  const deletedCaches = []
  let activateHandler

  const serviceWorker = {
    registration: { scope: 'https://lifetrkr.example/' },
    location: new URL('https://lifetrkr.example/sw.js'),
    addEventListener(type, handler) {
      if (type === 'activate') activateHandler = handler
    },
    clients: {
      claim: async () => {},
    },
    skipWaiting: async () => {},
  }

  const caches = {
    keys: async () => [
      'lifetrkr-shell-v1',
      'lifetrkr-shell-v0',
      'unrelated-cache-v1',
    ],
    delete: async (cacheName) => {
      deletedCaches.push(cacheName)
      return true
    },
    open: async () => ({
      addAll: async () => {},
      put: async () => {},
    }),
    match: async () => undefined,
  }

  vm.runInNewContext(serviceWorkerSource, {
    URL,
    Promise,
    caches,
    self: serviceWorker,
  })

  assert.equal(typeof activateHandler, 'function')

  let activation
  activateHandler({
    waitUntil(promise) {
      activation = promise
    },
  })

  await activation

  assert.deepEqual(deletedCaches, ['lifetrkr-shell-v0'])
})