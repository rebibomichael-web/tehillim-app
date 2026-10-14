/* Guarded service worker for the Tehillim PWA.
   Handles same-origin GET requests inside this app's scope only.
   Ignores non-GET, cross-origin, and Chrome's only-if-cached/no-cors bug.
   Does not intercept sw.js, so updates are always fetched from the network.
*/
'use strict';

var CACHE = 'tehillim-v2';
var PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

function scopeUrl(path) {
  return new URL(path, self.registration.scope);
}

function isGuarded(request) {
  if (!request || request.method !== 'GET') return false;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return false;
  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return false;
  }
  if (url.origin !== self.location.origin) return false;
  var scopePath = new URL(self.registration.scope).pathname;
  if (url.pathname.indexOf(scopePath) !== 0) return false;
  if (url.pathname.endsWith('/sw.js')) return false;
  return true;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (path) {
        var url = scopeUrl(path);
        return fetch(url, { cache: 'reload' }).then(function (response) {
          if (!response || !response.ok) {
            throw new Error('precache failed: ' + url.href);
          }
          return cache.put(url, response);
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return cache.match(scopeUrl('./index.html')).then(function (indexHit) {
        if (indexHit) return indexHit;
        return cache.match(scopeUrl('./'));
      });
    });
  });
}

self.addEventListener('fetch', function (event) {
  if (!isGuarded(event.request)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            return cache.put(scopeUrl('./index.html'), copy);
          });
        }
        return response;
      }).catch(function () {
        return fromCache(event.request).then(function (cached) {
          return cached || Response.error();
        });
      })
    );
    return;
  }

  event.respondWith(
    fromCache(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            return cache.put(event.request, copy);
          });
        }
        return response;
      });
    })
  );
});
