const CACHE = "cinemax-v1";
const OFFLINE = ["/offline", "/manifest.json", "/brand/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r || caches.match("/offline"))),
  );
});
