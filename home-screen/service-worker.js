// Quill Haven service worker.
// NETWORK-FIRST: always try the network so a freshly-pushed version shows up
// immediately. Fall back to the cache ONLY when offline, so the home screen
// still boots with no Wi-Fi. Successful loads refresh the cache for next time.
//
// (This used to be CACHE-FIRST with a hand-bumped VERSION. When the bump was
//  forgotten the old cache served forever, so new pushes "didn't show up". That
//  is exactly the bug this rewrite fixes — no more stale home screen.)
const VERSION = '4.8';
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

// Network-first: fetch fresh, cache the success, fall back to cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(cached => cached || caches.match('./index.html', { ignoreSearch: true })))
  );
});
