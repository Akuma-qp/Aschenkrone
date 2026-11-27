// Aschenkrone – Service Worker
// Mit Internet: holt immer die neueste Version (Updates kommen sofort an).
// Ohne Internet: startet das Spiel aus dem Speicher.
// Bei jedem Spiel-Update die Versionsnummer hier um 1 erhöhen.
const CACHE = 'aschenkrone-v25';

const FILES = [
  './',
  './index.html',
  './icons.js',
  './core.js',
  './sound.js',
  './r2d.js',
  './r3d.js',
  './ui.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-48.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netzwerk zuerst (max. 4 Sekunden warten), sonst Speicher
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await Promise.race([
        fetch(req, { cache: 'no-cache' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
      ]);
      if (net && net.ok) cache.put(req, net.clone());
      return net;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: true });
      return hit || cache.match('./index.html');
    }
  })());
});
