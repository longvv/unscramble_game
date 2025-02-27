const CACHE_NAME = 'word-scramble-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/js/main.js',
    '/js/config.js',
    '/js/audio.js',
    '/js/drag-drop.js',
    '/js/game-controller.js',
    '/js/storage.js',
    '/js/touch-drag.js',
    '/js/ui-factory.js',
    '/js/word-manager.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});