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

  // Ignoruj żądania blob, data:base64, camera, chrome-extension itd.
  if (
    request.url.startsWith("blob:") ||
    request.url.startsWith("data:") ||
    request.url.includes("chrome-extension") ||
    request.url.includes("browser-sync") ||
    request.destination === 'video' ||
    request.destination === 'image' && request.url.includes('blob')
  ) {
    return; // NIE przechwytuj
  }

  // Cache-first dla plików statycznych
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});