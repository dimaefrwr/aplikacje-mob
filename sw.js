
const CACHE_NAME = "pwa-photo-locator-v1";


const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-256.png",
  "./icon-512.png"
];

// Instalacja Service Workera - cachowanie plików
self.addEventListener("install", event => {
  console.log("📦 Service Worker: Instalacja...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Cache otwarty, dodawanie plików...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  
  if (request.url.startsWith("blob:") || request.url.startsWith("data:")) {
    return;
  }
  
  if (request.url.includes("nominatim.openstreetmap.org") || 
      request.url.includes("cdnjs.cloudflare.com")) {
    return event.respondWith(fetch(request));
  }

  event.respondWith(
    caches.match(request).then(response => {
     
      if (response) {
        return response;
      }
      
      return fetch(request).then(response => {

        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      
      return caches.match("./index.html");
    })
  );
});

self.addEventListener("activate", event => {
  console.log("🔄 Service Worker: Aktywacja...");
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("🗑️ Usuwanie starego cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});