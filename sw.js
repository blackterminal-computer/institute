
const CACHE_NAME = "bt-shell-v7";

const APP_SHELL = [
  "/",
  "/index.html",
  "/masterAdmin.html",
  "/manifest.json",
  "/manifest-main.json",
  "/main-icon-192.png",
  "/main-icon-512.png",
  "/icon-192.png",
  "/icon-512.png"
];

const NAVIGATION_PATHS = [
  "/",
  "/index.html",
  "/masterAdmin.html"
];

const STATIC_PATHS = [
  "/manifest.json",
  "/manifest-main.json",
  "/main-icon-192.png",
  "/main-icon-512.png",
  "/icon-192.png",
  "/icon-512.png"
];

// Firebase Cloud Messaging background support
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCEYfwfZv2Ckpg-uFLRvJkMBRlXA2w_WpI",
  authDomain: "black-terminal-f2c91.firebaseapp.com",
  databaseURL:
    "https://black-terminal-f2c91-default-rtdb.firebaseio.com",
  projectId: "black-terminal-f2c91",
  storageBucket: "black-terminal-f2c91.firebasestorage.app",
  messagingSenderId: "552489994197",
  appId: "1:552489994197:web:7662331264c334ffbadf5c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  // Firebase handles notification-payload messages.
  if (payload.notification) return;

  const data = payload.data || {};

  const options = {
    body: data.body || "You have a new update.",
    icon: "/main-icon-192.png",
    data: {
      url: data.url || "/index.html"
    }
  };

  if (data.image) {
    options.image = data.image;
  }

  return self.registration.showNotification(
    data.title || "BlackTerminal",
    options
  );
});

// Install: cache available app files.
// Missing optional files will not prevent installation.
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        APP_SHELL.map(async path => {
          try {
            const response = await fetch(path, {
              cache: "reload"
            });

            if (response.ok) {
              await cache.put(path, response);
            }
          } catch (error) {
            console.warn("Could not cache:", path);
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

// Remove old BlackTerminal shell caches.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith("bt-shell-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Notification click: open the selected same-origin page.
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/index.html",
    self.location.origin
  );

  if (target.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.openWindow(target.href)
  );
});

// Network-first navigation with offline fallback.
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Do not cache query-string URLs or dynamic API requests.
  if (url.search) return;

  if (
    request.mode === "navigate" &&
    NAVIGATION_PATHS.includes(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE_NAME);

            await cache.put(url.pathname, copy);
          }

          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);

          const cached =
            await cache.match(url.pathname) ||
            (
              url.pathname === "/" ?
                await cache.match("/index.html") :
                null
            );

          return cached || new Response(
            "BlackTerminal is offline. Please reconnect.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })()
    );

    return;
  }

  // Cache-first for known manifest and icon files.
  if (STATIC_PATHS.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url.pathname);

        if (cached) return cached;

        const response = await fetch(request);

        if (response.ok) {
          await cache.put(url.pathname, response.clone());
        }

        return response;
      })()
    );
  }
});
