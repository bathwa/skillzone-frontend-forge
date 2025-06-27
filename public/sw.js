const CACHE_NAME = 'skillzone-v1'
const STATIC_CACHE = 'skillzone-static-v1'
const DYNAMIC_CACHE = 'skillzone-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/opportunities/,
  /\/api\/skills/,
  /\/api\/profiles/,
  /\/api\/projects/,
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static files')
      return cache.addAll(STATIC_FILES)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // For other requests, try network first
  event.respondWith(fetch(request))
})

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
  } catch (error) {
    console.log('Network failed, trying cache:', error)
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  // Return offline response
  return new Response(
    JSON.stringify({ error: 'Offline - No cached data available' }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// Handle static files with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Static file fetch failed:', error)
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Failed to process pending action:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from SkillZone',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('SkillZone', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// IndexedDB helpers for offline data
async function getPendingActions() {
  // This would be implemented with IndexedDB
  // For now, return empty array
  return []
}

async function processPendingAction(action) {
  // Process pending actions like proposals, opportunities, etc.
  console.log('Processing pending action:', action)
}

async function removePendingAction(actionId) {
  // Remove processed action from IndexedDB
  console.log('Removing pending action:', actionId)
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_DATA') {
    event.waitUntil(cacheData(event.data.key, event.data.data))
  }
})

async function cacheData(key, data) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
  await cache.put(key, response)
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent())
  }
})

async function syncContent() {
  try {
    // Sync opportunities, skills, and other content
    const opportunitiesResponse = await fetch('/api/opportunities')
    if (opportunitiesResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put('/api/opportunities', opportunitiesResponse.clone())
    }
    
    const skillsResponse = await fetch('/api/skills')
    if (skillsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put('/api/skills', skillsResponse.clone())
    }
  } catch (error) {
    console.error('Periodic sync failed:', error)
  }
} 