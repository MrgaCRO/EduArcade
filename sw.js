const cacheName = 'edu-arcade-hub-v2.6.0';
const assets = [
  './',
  'index.html',
  'manifest.json',
  'games/shared/edu-engine.js',
  'games/snake/index.html',
  'games/tablic/index.html',
  'games/pasijans/index.html',
  'games/pacman/index.html',
  'games/pacman/style.css',
  'games/pacman/script.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(cacheName).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
