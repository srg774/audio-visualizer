// service-worker.js

const CACHE_VERSION = 'v2'; // <--- IMPORTANT: Increment this version for updates!
const ASSET_CACHE_NAME = `srg774-music-assets-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `srg774-music-audio-${CACHE_VERSION}`;

// List of static assets to cache on install
const staticAssets = [
    '/', // Cache the root URL (index.html)
    'index.html',
    'manifest.json',
    'style.css',
    'register-sw.js', // The script to register this service worker
    'assets/android-chrome-512x512.png', // Your PWA icon
    'assets/techno-background.jpg', // Your background image
    'tracks.json' // <--- NEW: Your dynamic track list JSON
    // Add any other static assets like additional favicon images or fonts here if you download them
];

// NOTE: musicTracks are NOT pre-cached here anymore, as they'll be fetched on demand
// when playing, and then cached. This reduces initial install size.
const musicTracks = [
    // These paths are still important for URL matching in the fetch handler
    // but the actual list will come from tracks.json
    'assets/Chant.wav',
    'assets/Perhaps1.wav',
    'assets/waves.wav',
    'assets/Cage.wav',
    'assets/%27981.wav',
    'assets/nuhouse21.mp3',
    'assets/Tin Hat1.wav',
    'assets/Throne21.wav',
    'assets/Rise.wav',
    'assets/revos (1) (1).wav'
    // Add any new audio tracks here so they can be matched and cached by the service worker
];


// Install event: Caches specified static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(ASSET_CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching essential assets during install');
            return cache.addAll(staticAssets).catch(error => {
                console.error('Service Worker: Failed to add some static assets to cache during install:', error);
                // Even if some fail, try to proceed with the others
            });
        }).then(() => {
            console.log('Service Worker: Installation complete. New version ready.');
            return self.skipWaiting(); // Force the new service worker to activate immediately
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
                    // Delete old caches that don't match the current names
                    if (cacheName !== ASSET_CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete. Taking control of clients.');
            return self.clients.claim(); // Take control of un-controlled clients (e.g., refreshing the page)
        })
    );
});

// Fetch event: Intercepts network requests and serves from cache or network
self.addEventListener('fetch', event => {
    // Only handle HTTP/HTTPS requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    const requestUrl = new URL(event.request.url);

    // Strategy for 'critical' assets (HTML, main CSS, SW registration, manifest, tracks.json): Network First, then Cache
    // This ensures these files are always fresh if the network is available.
    // Make sure 'tracks.json' is added to this list.
    if (requestUrl.pathname === '/' ||
        requestUrl.pathname === '/index.html' ||
        requestUrl.pathname === '/style.css' ||
        requestUrl.pathname === '/register-sw.js' ||
        requestUrl.pathname === '/tracks.json' || // <--- NEW: Ensure tracks.json is network first
        requestUrl.pathname.includes('manifest.json') // Using includes for manifest in case of sub-paths
    ) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // If network successful, update cache and return response
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(ASSET_CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                            // console.log('Service Worker: Updated critical asset in cache:', event.request.url);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // If network fails, try to serve from cache
                    console.log('Service Worker: Network failed for critical asset, serving from cache:', event.request.url);
                    return caches.match(event.request);
                })
        );
        return; // Important: Stop processing further for these requests
    }

    // Strategy for other static assets (images, fonts, etc.) and audio files: Cache First, then Network
    // This is good for assets that rarely change or are large (like audio).
    event.respondWith(
        caches.match(event.request).then(response => {
            // Cache hit - return response
            if (response) {
                // console.log('Service Worker: Serving from cache', event.request.url);
                return response;
            }

            // No cache hit - fetch from network and then cache
            // console.log('Service Worker: Fetching from network', event.request.url);
            return fetch(event.request).then(networkResponse => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

                // Determine which cache to put it in: AUDIO_CACHE_NAME or ASSET_CACHE_NAME
                const isAudioRequest = musicTracks.some(trackPath => event.request.url.endsWith(trackPath));
                const isAssetRequest = staticAssets.some(assetPath => event.request.url.endsWith(assetPath) || event.request.url === new URL(assetPath, self.location).href);

                if (isAudioRequest) {
                    caches.open(AUDIO_CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                            // console.log('Service Worker: Cached new audio track', event.request.url);
                        });
                } else if (isAssetRequest) {
                    caches.open(ASSET_CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                            // console.log('Service Worker: Cached new static asset', event.request.url);
                        });
                }
                // For any other unhandled requests (e.g., external scripts not in staticAssets),
                // they are simply returned without caching.

                return networkResponse;
            }).catch(error => {
                // This catch block handles network errors for cache-first items
                console.error('Service Worker: Fetch failed for', event.request.url, error);
                // For a music player, if a track isn't cached and network fails, it just won't play.
                // For navigation requests (like if an un-cached page is requested offline), you can return an offline page.
                if (event.request.mode === 'navigate') {
                    // You might want to pre-cache an 'offline.html' page and serve it here.
                    // For now, a simple message:
                    return new Response('<h1>Offline</h1><p>It looks like you are offline and this content is not cached.</p>', {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
                // For other assets (e.g., an image not in cache), return a generic error response
                return new Response(null, { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});
