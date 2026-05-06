// ============================================================
//  AQUAFLOW PRO — Service Worker
//  Permet l'installation PWA et le cache des ressources
// ============================================================

const CACHE_NAME = 'aquaflow-pro-v1';

// Fichiers à mettre en cache pour fonctionner hors ligne
const ASSETS = [
  '/aerosmart-pro/',
  '/aerosmart-pro/index.html',
  '/aerosmart-pro/manifest.json',
  '/aerosmart-pro/icon-192.png',
  '/aerosmart-pro/icon-512.png',
];

// Installation — mise en cache des ressources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — réseau d'abord, cache en fallback
self.addEventListener('fetch', (event) => {
  // Firebase et APIs externes — toujours réseau
  if (
    event.request.url.includes('firebase') ||
    event.request.url.includes('gstatic') ||
    event.request.url.includes('googleapis')
  ) {
    return; // laisser passer sans intercepter
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Pas de réseau — retourner depuis le cache
        return caches.match(event.request);
      })
  );
});
