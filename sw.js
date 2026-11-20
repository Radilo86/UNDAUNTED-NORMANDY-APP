// Solo Commander — service worker (versión 202611200802)
const CACHE = 'usc-202611200802';
const FILES = ["./","./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/favicon-32.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('usc-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(key, { ignoreSearch: true });
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) c.put(key, res.clone());
          return res;
        })
        .catch(() => undefined);
      if (hit) {
        e.waitUntil(net);
        return hit;
      }
      return (await net) || new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }),
  );
});
