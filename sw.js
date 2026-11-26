const CACHE = "softwave-shell-v4";
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
  "assets/js/lyrics.js",
  "assets/js/presets.js",
  "assets/js/render.js",
  "assets/js/rhymes.js",
  "assets/js/seed.js",
  "assets/js/songwriter.js",
  "assets/js/state.js",
  "assets/js/theory.js",
  "assets/js/ui.js",
  "assets/js/util.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          SHELL.map((entry) => new Request(new URL(entry, self.location.href), { cache: "reload" }))
        )
      )
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

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok) {
      try {
        await cache.put(request, response.clone());
        if (request.mode === "navigate") {
          await cache.put("index.html", response.clone());
        }
      } catch {
        /* caching is best-effort; never fail the response over it */
      }
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return (await cache.match("index.html")) || (await cache.match("./")) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!cacheable(request)) return;
  event.respondWith(networkFirst(request));
});
