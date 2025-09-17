// Eventra PWA Service Worker
// Version 1.0 - Full offline support for event management app

const CACHE_NAME = 'eventra-v1';
const OFFLINE_URL = '/4phasteprompt-eventra/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/4phasteprompt-eventra/',
  '/4phasteprompt-eventra/index.html',
  '/4phasteprompt-eventra/manifest.json',
  '/4phasteprompt-eventra/eventra-icon.svg',
  'https://cdn.tailwindcss.com/tailwind.min.css'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('🚀 Eventra Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Eventra Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (!url.pathname.startsWith('/4phasteprompt-eventra/') && url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 Serving from cache:', request.url);
          return cachedResponse;
        }
        
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response for caching
            const responseToCache = networkResponse.clone();
            
            // Cache successful responses
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('💾 Caching new resource:', request.url);
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('🌐 Network failed, checking cache for:', request.url);
            
            // For navigation requests, return cached page or offline page
            if (request.destination === 'document') {
              return caches.match('/4phasteprompt-eventra/') || 
                     caches.match('/4phasteprompt-eventra/index.html') ||
                     new Response('Eventra is offline. Please check your connection.', {
                       headers: { 'Content-Type': 'text/html' }
                     });
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline event creation/updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-events') {
    console.log('🔄 Background syncing events...');
    event.waitUntil(syncEventData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New event notification',
    icon: '/4phasteprompt-eventra/eventra-icon.svg',
    badge: '/4phasteprompt-eventra/eventra-icon.svg',
    vibrate: [200, 100, 200],
    tag: 'eventra-notification',
    actions: [
      {
        action: 'view',
        title: 'View Event',
        icon: '/4phasteprompt-eventra/eventra-icon.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Eventra', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/4phasteprompt-eventra/')
    );
  }
});

// Helper function for syncing event data
async function syncEventData() {
  try {
    // In a real app, this would sync pending events with the server
    console.log('📡 Syncing event data with server...');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Failed to sync event data:', error);
    throw error;
  }
}

// Message handling for app communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎉 Eventra Service Worker loaded successfully!');
