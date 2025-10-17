// Enhanced Service Worker with advanced caching strategies
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache duration in milliseconds
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  dynamic: 24 * 60 * 60 * 1000, // 1 day
  api: 5 * 60 * 1000, // 5 minutes
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper: Check if cache is stale
const isCacheStale = (cachedResponse, maxAge) => {
  if (!cachedResponse) return true;
  
  const cachedTime = new Date(cachedResponse.headers.get('sw-cached-time'));
  const now = new Date();
  return (now - cachedTime) > maxAge;
};

// Helper: Add timestamp to response
const addTimestamp = (response) => {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.set('sw-cached-time', new Date().toISOString());
  
  return clonedResponse.blob().then((body) => {
    return new Response(body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers,
    });
  });
};

// Strategy: Network First (for API calls)
const networkFirst = async (request, cacheName, maxAge) => {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    const responseWithTimestamp = await addTimestamp(response.clone());
    cache.put(request, responseWithTimestamp);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    throw error;
  }
};

// Strategy: Cache First (for images and static assets)
const cacheFirst = async (request, cacheName, maxAge) => {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isCacheStale(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    const responseWithTimestamp = await addTimestamp(response.clone());
    cache.put(request, responseWithTimestamp);
    return response;
  } catch (error) {
    if (cachedResponse) {
      console.log('[SW] Serving stale cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
};

// Strategy: Stale While Revalidate (for dynamic content)
const staleWhileRevalidate = async (request, cacheName, maxAge) => {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (response) => {
    const cache = await caches.open(cacheName);
    const responseWithTimestamp = await addTimestamp(response.clone());
    cache.put(request, responseWithTimestamp);
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
};

// Fetch event - route requests to appropriate strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - Network First
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(networkFirst(request, API_CACHE, CACHE_DURATIONS.api));
    return;
  }
  
  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, CACHE_DURATIONS.images));
    return;
  }
  
  // Static assets - Cache First
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, CACHE_DURATIONS.static));
    return;
  }
  
  // Everything else - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, CACHE_DURATIONS.dynamic));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medication-actions') {
    event.waitUntil(syncMedicationActions());
  }
});

// Sync medication actions when back online
async function syncMedicationActions() {
  try {
    // Get pending actions from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pendingActions', 'readonly');
    const store = tx.objectStore('pendingActions');
    const actions = await store.getAll();
    
    // Send each action to the server
    for (const action of actions) {
      try {
        await fetch('/rest/v1/medication_actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        
        // Remove from IndexedDB after successful sync
        const deleteTx = db.transaction('pendingActions', 'readwrite');
        await deleteTx.objectStore('pendingActions').delete(action.id);
      } catch (error) {
        console.error('[SW] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NurtureCareDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Medication Reminder';
  const options = {
    body: data.body || 'Time to take your medication',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'medication-reminder',
    requireInteraction: true,
    actions: [
      { action: 'taken', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze 15 min' },
    ],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'taken') {
    // Handle mark as taken
    event.waitUntil(
      clients.openWindow('/medications?action=taken&id=' + event.notification.data.medicationId)
    );
  } else if (event.action === 'snooze') {
    // Handle snooze
    event.waitUntil(
      clients.openWindow('/medications?action=snooze&id=' + event.notification.data.medicationId)
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Enhanced service worker loaded');
