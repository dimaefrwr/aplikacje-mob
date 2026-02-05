const CACHE_NAME = "pwa-photo-locator-v4";

const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/js/main.js",
  "/js/serviceWorker.js",
  "/js/utils.js",
  "/js/navigation.js",
  "/js/geolocation.js",
  "/js/albums.js",
  "/js/camera.js",
  "/js/gallery.js",
  "/js/photoEditor.js",
  "/js/settings.js"
];

self.addEventListener("install", event => {
  console.log("📦 Service Worker: Instalacja...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Cache otwarty, dodawanie plików...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("🔄 Service Worker: Aktywacja...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Usuwanie starego cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  
  // Ignoruj blob/data URLs
  if (request.url.startsWith("blob:") || request.url.startsWith("data:")) {
    return;
  }
  
  // Network only dla zewnętrznych API
  if (request.url.includes("nominatim.openstreetmap.org") || 
      request.url.includes("cdnjs.cloudflare.com")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response("Offline - API niedostępne", { status: 503 });
      })
    );
    return;
  }

  // Cache First dla wszystkiego innego
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log("✅ Z cache:", request.url);
        return cachedResponse;
      }
      
      return fetch(request).then(networkResponse => {
        // Nie cachuj niepoprawnych odpowiedzi
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Cachuj nowe zasoby
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Offline fallback - zwróć index.html dla navigation
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});