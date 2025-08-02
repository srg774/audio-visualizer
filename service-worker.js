const CACHE_VERSION = 'v3'; // <--- IMPORTANT: Increment the version number!
const ASSET_CACHE_NAME = `srg774-music-assets-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `srg774-music-audio-${CACHE_VERSION}`;

// List of static assets to cache on install.
// IMPORTANT: Do NOT include tracks.json here, as it is dynamic and should be fetched fresh.
const staticAssets = [
    '/', // Cache the root URL (index.html)
    'index.html',
    'manifest.json',
    'register-sw.js',
    'assets/android-chrome-512x512.png',
    // 'assets/techno-background.jpg', // Removed this as you no longer need it.
    // Add any other static assets like additional favicon images or fonts here
];

// This list is now just for fetch matching, not pre-caching
const musicTracks = [
    'assets/Cage.wav',
    'assets/Perhaps1.wav',
    'assets/nuhouse21.mp3',
    'assets/Throne21.wav'
];


// Install event: Caches specified static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(ASSET_CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching essential assets during install');
            // Cache the static assets, excluding the dynamic tracks.json
            return cache.addAll(staticAssets).catch(error => {
                console.error('Service Worker: Failed to add some static assets to cache:', error);
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
            return self.clients.claim(); // Take control of un-controlled clients
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
    if (requestUrl.pathname === '/' ||
        requestUrl.pathname === '/index.html' ||
        requestUrl.pathname === '/style.css' ||
        requestUrl.pathname === '/register-sw.js' ||
        requestUrl.pathname === '/tracks.json' || // The Network First strategy is now the ONLY rule for tracks.json
        requestUrl.pathname.includes('manifest.json')
    ) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
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
                    console.log('Service Worker: Network failed for critical asset, serving from cache:', event.request.url);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Strategy for other static assets and audio files: Cache First, then Network
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                // console.log('Service Worker: Serving from cache', event.request.url);
                return response;
            }

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

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

                return networkResponse;
            }).catch(error => {
                console.error('Service Worker: Fetch failed for', event.request.url, error);
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
