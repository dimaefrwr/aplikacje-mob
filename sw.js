const CACHE_NAME = 'pwa-photo-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-256.png',
  './icons/icon-512.png'
];

// Instalacja SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// NOWY, POPRAWNY FETCH!
self.addEventListener('fetch', event => {

  const request = event.request;

  // 🔥 1. Ignoruj żądania blob, data:base64, camera, chrome-extension itd.
  if (
    request.url.startsWith("blob:") ||
    request.url.startsWith("data:") ||
    request.url.includes("chrome-extension") ||
    request.destination === 'video' ||
    request.destination === 'image' && request.url.includes('blob')
  ) {
    return; // NIE przechwytuj
  }

  // 🔥 2. Normalne cache-first dla plików statycznych
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
