
const CACHE_NAME = "bt-master-shell-v4";

const APP_SHELL = [
  "/",
  "/index.html",
  "/masterAdmin.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith("bt-master-shell-") &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Only cache the approved app-shell files.
  const allowedPaths = [
    "/",
    "/index.html",
    "/masterAdmin.html",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png"
  ];

  if (!allowedPaths.includes(url.pathname)) {
    return;
  }

  // Navigation: network first, cached page if offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(url.pathname, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(url.pathname);
          if (cached) return cached;

          // Use the cached master dashboard as a fallback.
          const master = await caches.match("/masterAdmin.html");
          if (master) return master;

          return new Response(
            "You are offline. Please reconnect to the internet and reopen BT Admin.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            }
          );
        })
    );
    return;
  }

  // Static app-shell files: cache first.
  event.respondWith(
    caches.match(url.pathname).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(url.pathname, copy));
        }
        return response;
      });
    })
  );
});
