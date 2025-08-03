const CACHE_VERSION = 'v4'; // <--- IMPORTANT: Increment the version number!
const ASSET_CACHE_NAME = `srg774-music-assets-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `srg774-music-audio-${CACHE_VERSION}`;

// List of static assets to cache on install.
// The tracks.json file is intentionally left out to always fetch fresh.
const staticAssets = [
    '/', // Cache the root URL (index.html)
    'index.html',
    'manifest.json',
    'register-sw.js',
    'assets/android-chrome-512x512.png',
    // 'assets/techno-background.jpg', // Removed this as you no longer need it.
    // Add any other static assets like additional favicon images or fonts here
];

// Install event: Caches specified static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(ASSET_CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching essential assets during install');
            return cache.addAll(staticAssets).catch(error => {
                console.error('Service Worker: Failed to add some static assets to cache:', error);
            });
        }).then(() => {
            console.log('Service Worker: Installation complete. New version ready.');
            return self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Installation failed:', error);
        })
    );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== ASSET_CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete. Taking control of clients.');
            return self.clients.claim();
        })
    );
});

// Fetch event: Intercepts network requests and serves from cache or network
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith('http')) {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const pathname = requestUrl.pathname;

    // A list of file extensions that indicate an audio file.
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const isAudioRequest = audioExtensions.some(ext => pathname.endsWith(ext));

    // Strategy for 'critical' assets (Network First, then Cache)
    if (pathname === '/' ||
        pathname === '/index.html' ||
        pathname === '/style.css' ||
        pathname === '/register-sw.js' ||
        pathname === '/tracks.json' ||
        pathname.includes('manifest.json')
    ) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(ASSET_CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    console.log('Service Worker: Network failed for critical asset, serving from cache:', event.request.url);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // New logic for audio and other assets: Cache First, then Network, then cache new items.
    event.respondWith(
        caches.match(event.request).then(response => {
            // Found in cache, return it immediately
            if (response) {
                return response;
            }

            // Not in cache, so go to the network
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // If it's a new audio track, cache it in the audio cache
                if (isAudioRequest) {
                    const responseToCache = networkResponse.clone();
                    caches.open(AUDIO_CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                        console.log('Service Worker: Dynamically cached new audio track', event.request.url);
                    });
                }
                
                // For other non-critical assets not in the initial list, you could cache them here too,
                // but the current logic handles static assets on install and dynamic assets (like audio) on first fetch.

                return networkResponse;
            }).catch(error => {
                console.error('Service Worker: Fetch failed for', event.request.url, error);
                // The offline response for navigation requests is a nice touch, let's keep that.
                if (event.request.mode === 'navigate') {
                    return new Response('<h1>Offline</h1><p>It looks like you are offline and this content is not cached.</p>', {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
                return new Response(null, { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});
