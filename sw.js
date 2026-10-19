// Bump VERSION whenever any cached file changes.
const VERSION = "40ss-v16";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "data/40_durood.json",
  "fonts/amiri-400.woff2",
  "fonts/amiri-700.woff2",
  "fonts/scheherazade-400.woff2",
  "fonts/scheherazade-700.woff2",
  "fonts/noto-naskh-400.woff2",
  "fonts/noto-naskh-700.woff2",
  "fonts/lateef-400.woff2",
  "fonts/lateef-700.woff2",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first, falling back to network.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
