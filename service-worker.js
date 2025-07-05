self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("reha-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "styles.css",
        "script.js",
        "manifest.json",
        "background.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});