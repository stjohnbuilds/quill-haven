// Quill Haven service worker.
// CACHE-FIRST — the page loads fast from cache. When a new version is pushed to
// GitHub, the browser installs this new SW in the background. The home screen's
// update check fetches version.json (different domain, bypasses the SW) and shows
// an "Update available" button. Tapping it clears the cache and reloads — the SW
// falls through to the network and serves the fresh version.
//
// BUMP VERSION on every release — keep it in step with version.json and
// LOCAL_VERSION in js/home.js.
const VERSION = '2.8';
const CACHE = 'quill-haven-' + VERSION;
const SHELL = [
  './',
  './index.html',
  './css/home.css',
  './js/home.js',
  './shared/theme.css',
  './shared/confirm.js',
  './img/quill.png',
  './apps/writing/index.html',
  './apps/writing/writing.css',
  './apps/writing/writing.js',
  './apps/files/index.html',
  './apps/files/files.css',
  './apps/files/files.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: serve from cache if available, otherwise fetch from the network
// and cache the response for next time. ignoreSearch means ?v=XX cache-busting
// params don't cause misses against the pre-cached shell entries.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          if (resp && resp.ok && resp.type === 'basic') {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return resp;
        });
      })
      .catch(() => caches.match('./index.html', { ignoreSearch: true }))
  );
});
