// Service Worker for Trading Bot v3.1
const CACHE_NAME = 'trading-bot-v3.1-cache-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/logo.svg',
];

const API_CACHE_PATTERNS = [
  /\/api\/strategies/,
  /\/api\/symbols/,
  /\/api\/data\/available/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first strategy for specific endpoints
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache and update in background
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  const responseClone = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
              })
              .catch(() => {
                // Network failed, cached version is still valid
              });
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }

  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
}); 