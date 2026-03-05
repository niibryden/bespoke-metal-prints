// Service Worker for Bespoke Metal Prints - v4.0.0
// Provides offline support and caching for static assets

const CACHE_NAME = 'bespoke-v4.0.0';
const STATIC_CACHE = 'static-v4.0.0';
const IMAGE_CACHE = 'images-v4.0.0';
const API_CACHE = 'api-v4.0.0';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/styles/globals.css',
  '/public/robots.txt',
  '/public/sitemap.xml',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v4.0.0...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache static assets:', err);
      });
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v4.0.0...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== IMAGE_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API requests - network first, cache fallback
  if (url.pathname.includes('/functions/v1/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Image requests - cache first, network fallback
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  
  // Static assets - cache first
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // HTML pages - network first, cache fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }
  
  // Default: network only
  event.respondWith(fetch(request));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Return offline page if available
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Network first, fetching:', request.url);
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Returning cached version');
      return cached;
    }
    
    console.error('[SW] No cached version available');
    throw error;
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service worker script loaded');
