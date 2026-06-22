const CACHE = 'quill-haven-v1';
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
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
