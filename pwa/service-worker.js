const CACHE_NAME = 'agenda-ggs-v3';

const APP_SHELL = [
  './',
  './index.html',
  './calculadora.html',
  './calculadora.js',
  './diagrama-losa.png',
  './diagrama-muro.png',
  './diagrama-prisma.png',
  './diagrama-cilindro.png',
  './diagrama-escalera.png',
  './diagrama-tubo.png',
  './manifest.json',
  '../favicon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

self.addEventListener('fetch', event => {

  // Los datos de Agenda siempre se solicitan a Apps Script.
  if (
    event.request.url.includes(
      'script.google.com/macros/'
    )
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() =>
        caches.match(event.request)
      )
  );
});
