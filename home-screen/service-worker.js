// Quill Haven service worker.
// BUMP VERSION on every release — keep it in step with version.json and
// LOCAL_VERSION in js/home.js. A new VERSION makes a new cache; the old one is
// deleted on activate, so a device can never get stuck on a stale home screen.
const VERSION = '2.0';
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();                 // take over straight away
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())   // control open pages immediately
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // The home shell is NETWORK-FIRST, so a fresh version is picked up the moment
  // there's Wi-Fi. Falls back to the cached copy when offline.
  const isShell = req.mode === 'navigate'
    || url.pathname.endsWith('/')
    || url.pathname.endsWith('/index.html');
  if (isShell) {
    e.respondWith(
      fetch(req)
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Everything else is cache-first (assets are cache-busted with ?v=).
  // ignoreSearch so "home.css?v=25" still matches the cached "./css/home.css".
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(r => {
      if (r) return r;
      return fetch(req).then(resp => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match('./index.html', { ignoreSearch: true }));
    })
  );
});
