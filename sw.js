// Bump VERSION whenever any cached file changes.
const VERSION = "40ss-v20";

// Needed to open the app at all; install fails if any of these cannot be fetched.
const CORE = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "data/40_durood.json",
  "fonts/amiri-400.woff2",
  "fonts/amiri-700.woff2",
  "icons/icon-192.png",
];

// Cached too, but a failure here does not stop the app working offline.
const EXTRA = [
  "fonts/scheherazade-400.woff2",
  "fonts/scheherazade-700.woff2",
  "fonts/noto-naskh-400.woff2",
  "fonts/noto-naskh-700.woff2",
  "fonts/lateef-400.woff2",
  "fonts/lateef-700.woff2",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
];

// Bypass the browser's HTTP cache so a new version never stores stale files.
const fresh = (url) => new Request(url, { cache: "reload" });

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(CORE.map(fresh))
        .then(() => Promise.allSettled(EXTRA.map((u) => c.add(fresh(u))))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pages always get the cached app shell, whatever the exact URL (query strings, index.html, etc).
async function navigate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true }) || await cache.match("./") || await cache.match("index.html");
  if (hit) return hit;
  return fetch(req);
}

// Files: cache first; anything fetched from this site is kept for next time.
async function asset(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && new URL(req.url).origin === self.location.origin) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(e.request.mode === "navigate" ? navigate(e.request) : asset(e.request));
});
