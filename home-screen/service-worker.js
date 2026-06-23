// Quill Haven service worker.
// BUMP VERSION on every release — keep it in step with version.json and
// LOCAL_VERSION in js/home.js. A new VERSION makes a new cache; the old one is
// deleted on activate, so a device can never get stuck on a stale home screen.
const VERSION = '2.1';
const CACHE = 'quill-haven-' + VERSION;
const SHELL = [
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();                 // take over straight away
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())   // control open pages immediately
  );
});

// NETWORK-FIRST for everything. When there's Wi-Fi we always serve the freshest
// file (so ?v= bumps and updates always take). The cache is only a fallback for
// when there's no internet, so the device still works offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then(r => r || caches.match('./index.html', { ignoreSearch: true }))
      )
  );
});
