// service-worker.js

const CACHE_NAME = 'srg774-music-player-v1';
const ASSET_CACHE_NAME = 'srg774-music-assets-v1'; // Separate cache for assets
const AUDIO_CACHE_NAME = 'srg774-music-audio-v1'; // Separate cache for audio

// List of static assets to cache on install
const staticAssets = [
    '/', // Cache the root URL (index.html)
    'index.html',
    'manifest.json',
    'style.css', // Assuming you'll move your inline CSS here later
    'register-sw.js', // The script to register this service worker
    'assets/android-chrome-512x512.png' // Your PWA icon
    // Add any other static assets like additional images or fonts here
];

// List of your music tracks (these should match the paths in your HTML)
// Make sure these paths are correct relative to the service worker file
const musicTracks = [
    'assets/Layer 2.wav',
    'assets/Perhaps1.wav',
    'assets/waves.wav',
    'assets/Pulse_.wav',
    'assets/%27981.wav', // Note: Special characters like ' need to be URL encoded or handled carefully
    'assets/nuhouse21.mp3',
    'assets/Tin Hat1.wav',
    'assets/Throne21.wav',
    'assets/Rise.wav',
    'assets/revos (1) (1).wav'
];

// Combine all URLs to cache on install
const urlsToCache = [...staticAssets, ...musicTracks];


// Install event: Caches static assets and initial music tracks
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        Promise.all([
            caches.open(ASSET_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(staticAssets);
            }),
            caches.open(AUDIO_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching music tracks');
                return cache.addAll(musicTracks);
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            return self.skipWaiting(); // Force the new service worker to activate immediately
        }).catch(error => {
            console.error('Service Worker: Caching failed during install', error);
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
            console.log('Service Worker: Activation complete');
            return self.clients.claim(); // Take control of un-controlled clients (e.g., refreshing the page)
        })
    );
});

// Fetch event: Intercepts network requests and serves from cache or network
self.addEventListener('fetch', event => {
    // Only handle HTTP/HTTPS requests and not extensions, etc.
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Cache hit - return response
            if (response) {
                // console.log('Service Worker: Serving from cache', event.request.url);
                return response;
            }

            // No cache hit - fetch from network
            // console.log('Service Worker: Fetching from network', event.request.url);
            return fetch(event.request).then(networkResponse => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // If it's a music file, cache it for future offline use
                if (musicTracks.some(trackUrl => event.request.url.endsWith(trackUrl))) {
                    const responseToCache = networkResponse.clone();
                    caches.open(AUDIO_CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                            // console.log('Service Worker: Cached new audio track', event.request.url);
                        });
                } else if (staticAssets.some(assetUrl => event.request.url.endsWith(assetUrl) || event.request.url === new URL(assetUrl, self.location).href)) {
                     // If it's a static asset, cache it
                    const responseToCache = networkResponse.clone();
                    caches.open(ASSET_CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                            // console.log('Service Worker: Cached new static asset', event.request.url);
                        });
                }

                return networkResponse;
            }).catch(error => {
                // This catch block handles network errors (e.g., no internet connection)
                console.error('Service Worker: Fetch failed for', event.request.url, error);
                // You might want to return a fallback page or a message for offline state here
                // For a music player, if a track isn't cached and network fails, it just won't play.
                // You could return an offline page or just an empty response.
                return new Response('<h1>Offline</h1><p>It looks like you are offline and this content is not cached.</p>', {
                    headers: { 'Content-Type': 'text/html' }
                });
            });
        })
    );
});
