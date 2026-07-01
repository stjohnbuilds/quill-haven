// Quill Haven service worker — CACHE-FIRST / PINNED (this is the update gate).
//
// The home screen is "pinned" to the version Marie approved: it is served from the
// cache and does NOT silently change on reboot or refresh. A newer version is fetched
// ONLY when Marie taps "Update", which clears this cache (see doUpdate in home.js /
// quill-overlay.js) — so the very next load re-fetches everything fresh and re-pins.
//
// IMPORTANT: keep this file BYTE-STABLE from now on. The cache name has no version in
// it, and a new copy of the shell is only ever pulled when the cache is empty. If you
// change this file the browser will install a new worker, which would re-pin to
// whatever is live at that moment — defeating the gate. The one allowed exception was
// the single switch-over from the old network-first worker to this one.
//
// (History: this used to be network-first, which fetched fresh on every load — handy
//  for "pushes show up immediately", but it also meant a bad push auto-applied with no
//  approval. The gate trades that for "nothing changes until Marie says so".)
const CACHE = 'quill-haven';
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

// Cache the shell, but NEVER overwrite an entry that is already pinned. So even if the
// worker is ever reinstalled, it cannot silently replace the approved home screen.
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(SHELL.map(u =>
      c.match(u, { ignoreSearch: true }).then(hit => hit || c.add(u).catch(() => {}))
    ))
  ));
});

// Runs once, at the switch-over from the old (versioned) worker to this one: drop any
// stale cache so only the single pinned 'quill-haven' cache remains. This worker is
// byte-stable, so it never re-activates — this cleanup can't silently re-pin later.
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

// Cache-first: serve the pinned/approved copy. Only same-origin assets are cached, so
// the cross-origin version.json check (which finds new versions) is never intercepted.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(resp => {
          if (resp && resp.ok && resp.type === 'basic') {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }));
    })
  );
});
