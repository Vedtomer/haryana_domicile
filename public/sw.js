self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // This is required to pass the PWA installation criteria
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
