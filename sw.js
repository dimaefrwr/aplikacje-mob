
const CACHE_NAME = "pwa-photo-locator-v1";

// Lista plików do cachowania
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

// Fetch - strategia cache-first
self.addEventListener("fetch", event => {
  const { request } = event;
  
  // Ignoruj żądania blob: i data: (stream kamery, base64 zdjęcia)
  if (request.url.startsWith("blob:") || request.url.startsWith("data:")) {
    return;
  }
  
  // Ignoruj żądania do zewnętrznych API
  if (request.url.includes("nominatim.openstreetmap.org") || 
      request.url.includes("cdnjs.cloudflare.com")) {
    return event.respondWith(fetch(request));
  }

  event.respondWith(
    caches.match(request).then(response => {
      // Jeśli zasób jest w cache, zwróć go
      if (response) {
        return response;
      }
      
      // W przeciwnym razie pobierz z sieci
      return fetch(request).then(response => {
        // Sprawdź czy odpowiedź jest prawidłowa
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        
        // Sklonuj odpowiedź (można użyć tylko raz)
        const responseToCache = response.clone();
        
        // Dodaj do cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Jeśli offline i brak w cache, zwróć domyślną stronę
      return caches.match("./index.html");
    })
  );
});

// Activate - czyszczenie starych cache
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