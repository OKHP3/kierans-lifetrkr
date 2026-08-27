/*
 * LifeTrkr offline shell
 *
 * Keep this list deliberately small. User data stays in localStorage and
 * network-backed services (Google and the optional oracle worker) are never
 * intercepted or cached by this worker.
 */
const CACHE_NAME = 'lifetrkr-shell-v1'
// Replaced with the production asset list by scripts/prepare-service-worker.mjs.
const BUILT_ASSETS = []
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-192.webp',
  './icons/icon-512.png',
  './icons/icon-512.webp',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './og-image.png',
]
const CACHE_FILES = [...SHELL_FILES, ...BUILT_ASSETS]

function shellUrl(path) {
  return new URL(path, self.registration.scope).toString()
}

function isShellAsset(url) {
  return CACHE_FILES.some(file => shellUrl(file) === url)
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES.map(shellUrl)))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('lifetrkr-shell-') && key !== CACHE_NAME)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => caches.match(shellUrl('./index.html'))),
    )
    return
  }

  if (!isShellAsset(request.url)) return

  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
        }
        return response
      })),
  )
})