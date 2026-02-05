const CACHE = "v14";
const FILES = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/js/main.js",
  "/js/albums.js",
  "/js/camera.js",
  "/js/gallery.js",
  "/js/geolocation.js",
  "/js/navigation.js",
  "/js/photoEditor.js",
  "/js/serviceWorker.js",
  "/js/settings.js",
  "/js/utils.js",
  "/icons/icon-256.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", function(e) {
  console.log("INSTALL v14");
  self.skipWaiting(); // NATYCHMIAST!
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
});

self.addEventListener("activate", function(e) {
  console.log("ACTIVATE v14");
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.map(function(k) {
          if (k !== CACHE) return caches.delete(k);
        }));
      })
      .then(function() {
        return self.clients.claim(); // PRZEJMIJ KONTROLĘ!
      })
  );
});

self.addEventListener("fetch", function(e) {
  console.log("FETCH:", e.request.url);
  
  if (e.request.method !== "GET") return;
  
  e.respondWith(
    caches.match(e.request).then(function(r) {
      if (r) {
        console.log("FROM CACHE:", e.request.url);
        return r;
      }
      return fetch(e.request).catch(function() {
        console.log("OFFLINE FALLBACK");
        if (e.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});