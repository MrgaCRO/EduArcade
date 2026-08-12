const cacheName = 'edu-arcade-hub-v1.1.0'; // Promijenjen naziv verzije - prisiljava mobitel na osvježavanje!
const assets = [
  './',
  'index.html',
  'manifest.json',
  'games/snake/index.html',
  'games/tablic/index.html',
  'games/pasijans/index.html'
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
            return caches.delete(key); // Briše stare verzije keša s mobitela
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
