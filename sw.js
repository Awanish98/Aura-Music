var CACHE_NAME = 'aura-music-v168.0';

var AD_PATTERNS = [
  'googleads',
  'doubleclick.net',
  'pagead2.googlesyndication.com',
  'adservice.google',
  'www.googleadservices.com',
  '/api/stats/ads',
  '/pagead/',
  'get_midroll_info',
  'ad_break',
  'ptracking',
  'adunit',
  'pubads.g.doubleclick.net',
  'securepubads.g.doubleclick.net',
  'static.doubleclick.net',
  'ad.doubleclick.net',
  'adformat=',
  'youtube.com/pagead',
  'youtube.com/api/stats/ads'
];

function isAdUrl(url) {
  if (!url || typeof url !== 'string') return false;
  for (var i = 0; i < AD_PATTERNS.length; i++) {
    if (url.indexOf(AD_PATTERNS[i]) !== -1) return true;
  }
  return false;
}

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  
  // 🛡️ Block Ad requests with 204 No Content so YouTube player immediately skips ads
  if (isAdUrl(url)) {
    e.respondWith(new Response('', { status: 204, statusText: 'No Content' }));
    return;
  }

  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request);
    })
  );
});
