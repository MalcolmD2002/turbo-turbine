const CACHE_NAME = "site-navigator-v3";
const CORE_ASSETS = [
  "/",                   // root
  "/index.html",
  "/exclude.html",
  "/navigation.html",
  "/route-planner.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",

  // External assets (CDNs)
  "https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js",
  "https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css",
  "https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;

  // Mapbox: network-first, fallback to cache
  if (r.url.includes("api.mapbox.com")) {
    e.respondWith(
      fetch(r)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(r, copy));
          return res;
        })
        .catch(() => caches.match(r))
    );
    return;
  }

  // Everything else: cache-first, then network, then offline response
  e.respondWith(
    caches.match(r).then(
      (cached) =>
        cached ||
        fetch(r)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(r, copy));
            return res;
          })
          .catch(() => new Response("Offline", { status: 503 }))
    )
  );
});
