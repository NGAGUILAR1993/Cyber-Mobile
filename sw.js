// Service worker mínimo de Cyber Mobile: habilita "Instalar app" (PWA) y un respaldo offline simple.
// Estrategia: network-first con caché de respaldo. No cachea nada sensible: solo respuestas GET del propio sitio.
const CACHE = 'cm-pwa-v1';
const CORE = ['/', '/index.html', '/site.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon-48.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
  );
});
