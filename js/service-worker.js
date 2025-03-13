// Enhanced Service Worker for Word Scramble Game
const CACHE_NAME = 'word-scramble-v1';

// Add all essential assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable.png',
  '/splash-screen.png',
  '/js/config.js',
  '/js/eventbus.js',
  '/js/gamestate.js',
  '/js/database.js',
  '/js/storage.js',
  '/js/audio.js',
  '/js/ui-factory.js',
  '/js/word-manager.js',
  '/js/touch-drag.js',
  '/js/drag-drop.js',
  '/js/wordcontroller.js',
  '/js/inputmanager.js',
  '/js/game-controller.js',
  '/js/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css',
  'https://assets.mixkit.co/sfx/preview/mixkit-fairy-arcade-sparkle-866.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-small-crowd-ovation-437.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com') && 
      !event.request.url.includes('mixkit.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses or non GET requests
        if (!response || response.status !== 200 || event.request.method !== 'GET') {
          return response;
        }
        
        // IMPORTANT: Clone the response. A response is a stream
        // and can only be consumed once. We need to save and return it.
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch((error) => {
        console.log('[Service Worker] Fetch failed; returning offline page instead.', error);
        
        // If the request is for an image, return a default placeholder
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('/icon-192x192.png');
        }
        
        // For HTML requests, show the offline page
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Background sync for offline word additions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-words') {
    event.waitUntil(syncWords());
  }
});

// Function to sync words when back online
async function syncWords() {
  try {
    const dbName = 'word_scramble_offline_queue';
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('words')) {
        db.createObjectStore('words', {keyPath: 'id', autoIncrement: true});
      }
    };
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = function() {
        // Process each offline word
        getAllRequest.result.forEach((item) => {
          // Here we would send the word to the server if this app had a backend
          console.log('[Service Worker] Syncing offline word:', item.word);
          
          // After successful sync, remove from offline queue
          store.delete(item.id);
        });
      };
    };
  } catch (error) {
    console.error('[Service Worker] Error syncing words:', error);
  }
}