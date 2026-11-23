// Aschenkrone – Service Worker: speichert alle Spieldateien, damit das Spiel offline läuft.
// WICHTIG: Bei jedem Spiel-Update die Versionsnummer hier um 1 erhöhen,
// dann holen sich alle Handys automatisch die neue Version.
const CACHE = 'aschenkrone-v15';

const FILES = [
  './',
  './index.html',
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

// 1) Installieren: alle Dateien in den Speicher legen
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// 2) Aktivieren: alte Versionen aus dem Speicher löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3) Laden: zuerst aus dem Speicher (offline), sonst aus dem Internet
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(event.request).then(res => {
        if (res && res.ok && new URL(event.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
