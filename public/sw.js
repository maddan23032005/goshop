const CACHE_NAME = 'gocart-v1'
const STATIC_ASSETS = [
    '/',
    '/shop',
    '/cart',
    '/offline',
]

// Install service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// Fetch strategy — Network first, cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET and API requests
    if (
        event.request.method !== 'GET' ||
        event.request.url.includes('/api/') ||
        event.request.url.includes('clerk') ||
        event.request.url.includes('supabase')
    ) {
        return
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const cloned = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, cloned)
                    })
                }
                return response
            })
            .catch(() => {
                // Return cached version if network fails
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline')
                    }
                })
            })
    )
})

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    event.waitUntil(
        self.registration.showNotification(data.title || 'GoCart', {
            body: data.body || 'You have a new notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: { url: data.url || '/' },
        })
    )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    )
})
