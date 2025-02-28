self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('flask-pwa').then(function(cache) {
            return cache.addAll([
                '/',
                '/static/',
                '/templates/teacher','*','/static/main-t.css','','',''
                // Add more resources to cache as needed
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});