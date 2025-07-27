// register-sw.js

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Ensure the path and scope are correct relative to your deployment
        // If service-worker.js is at the root of your domain, and your app is within '/audio-visualizer/',
        // you might want scope: '/' for it to control the entire domain.
        // If service-worker.js is *inside* '/audio-visualizer/', then the current path/scope is correct.
        navigator.serviceWorker.register('/audio-visualizer/service-worker.js', { scope: '/audio-visualizer/' })
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);

                // This block helps detect and notify when a new service worker is ready
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // A new updated service worker is installed and waiting.
                                    console.log('New content available! Please refresh.');
                                    // You can trigger a UI notification here, e.g.:
                                    // showStatusMessage("New version available! Refresh for updates.", 5000);
                                    // The `showStatusMessage` is in your index.html script, so this might not directly work here.
                                    // You might need a more global event or a simpler alert for this part.
                                } else {
                                    // Content is cached for offline use, this is the very first install.
                                    console.log('Content is cached for offline use for the first time.');
                                    // showStatusMessage("App is ready for offline use!", 3000);
                                }
                            }
                        };
                    }
                };
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
