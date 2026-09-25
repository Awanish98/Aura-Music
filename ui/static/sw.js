// Aura Music Service Worker — Fast App Shell Caching & Offline Fallback
// Version: 1.3.0

const CACHE_NAME = 'aura-music-v1.3.0';
const STATIC_ASSETS = [
	'/',
	'/manifest.json',
	'/favicon.svg',
	'/favicon.png',
	'/pwa-192x192.png',
	'/pwa-512x512.png',
	'/pwa-maskable-512x512.png',
	'/apple-touch-icon.png',
	'/offline.html',
	'/robots.txt',
	'/llms.txt'
];

// Install: Pre-cache core app shell assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}).then(() => self.skipWaiting())
	);
});

// Activate: Clean up older caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((name) => {
					if (name !== CACHE_NAME) {
						return caches.delete(name);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);

	// 1. NEVER cache audio media streams, video streams, or range requests (prevents playback latency & bloat)
	if (
		request.headers.get('range') ||
		url.pathname.includes('/stream') ||
		url.pathname.includes('/audio') ||
		url.hostname.includes('googlevideo.com') ||
		url.hostname.includes('saavn.com') ||
		url.hostname.includes('jiosaavn.com') ||
		request.destination === 'audio' ||
		request.destination === 'video'
	) {
		return;
	}

	// 2. API requests: Network-first
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(request).catch(() => {
				return caches.match(request);
			})
		);
		return;
	}

	// 3. Static assets & SPA Pages: Cache-first with Network Fallback & Offline Page
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(() => {
				return caches.match(request).then((cached) => {
					return cached || caches.match('/offline.html');
				});
			})
		);
		return;
	}

	// Static assets (CSS, JS, Fonts, Images)
	if (
		url.origin === self.location.origin &&
		(url.pathname.match(/\.(js|css|woff2|svg|png|jpg|webp|ico)$/) || url.hostname.includes('fonts.gstatic.com'))
	) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request).then((networkResponse) => {
					if (networkResponse && networkResponse.status === 200) {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseToCache);
						});
					}
					return networkResponse;
				});
			})
		);
	}
});
