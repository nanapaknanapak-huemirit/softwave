const CACHE = "softwave-shell-v1";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/favicon.svg",
  "assets/css/theme.css",
  "assets/css/studio.css",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/og.png",
  "assets/js/app.js",
  "assets/js/composer.js",
  "assets/js/effects.js",
  "assets/js/engine.js",
  "assets/js/export.js",
  "assets/js/instruments.js",
  "assets/js/presets.js",
  "assets/js/render.js",
  "assets/js/seed.js",
  "assets/js/state.js",
  "assets/js/theory.js",
  "assets/js/ui.js",
  "assets/js/util.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cacheable(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function navigationResponse(request) {
  const cache = await caches.open(CACHE);
  const cached =
    (await cache.match(request)) ||
    (await cache.match("index.html")) ||
    (await cache.match("./"));
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put("index.html", response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!cacheable(request)) return;
  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
