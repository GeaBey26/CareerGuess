const CACHE_NAME = 'careerguess-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.js',
  './basketballData.js',
  './nhlData.js',
  './nflData.js',
  './volleyballData.js',
  './cricketData.js',
  './f1Data.js',
  './tennisData.js',
  './esportsData.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request); // Fallback to network
      })
  );
});
