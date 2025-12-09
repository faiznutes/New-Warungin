/**
 * Service Worker for Warungin PWA
 * Provides offline support and caching
 */

const CACHE_NAME = 'warungin-v2';
const RUNTIME_CACHE = 'warungin-runtime-v2';
const PRODUCT_IMAGES_CACHE = 'warungin-product-images-v1';
const POS_LAYOUT_CACHE = 'warungin-pos-layout-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/site.webmanifest',
  '/app/pos', // Cache POS layout
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name !== CACHE_NAME && 
            name !== RUNTIME_CACHE && 
            name !== PRODUCT_IMAGES_CACHE &&
            name !== POS_LAYOUT_CACHE
          )
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Product images - Cache first, fallback to network
  if (url.pathname.startsWith('/uploads/products/') || url.pathname.includes('/product-image')) {
    event.respondWith(
      caches.open(PRODUCT_IMAGES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              cache.put(request, responseClone);
            }
            return response;
          }).catch(() => {
            // Return placeholder image if offline
            return new Response('', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // POS layout and assets - Cache aggressively
  if (url.pathname.startsWith('/app/pos') || url.pathname.includes('pos-simple')) {
    event.respondWith(
      caches.open(POS_LAYOUT_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              cache.put(request, responseClone);
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response for API calls
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response for caching
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Network failed, return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Sync orders when back online
async function syncOrders() {
  // This will be implemented with IndexedDB
  console.log('[Service Worker] Syncing orders...');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Warungin';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

