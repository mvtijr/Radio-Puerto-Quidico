// Service Worker para Radio Puerto Quidico 105.1 FM / 91.3 FM PWA
const CACHE_NAME = 'radio-quidico-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo-radio-puerto-quidico.jpg',
  '/images/originales_blog/header-banner.jpg',
  '/images/originales_blog/youtube-puerto-quidico-tv.jpg',
  '/images/originales_blog/auspiciador-don-nica.jpg',
  '/images/originales_blog/en-vivo-banner.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW Radio Quidico] Precaching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW Radio Quidico] Precaching non-critical error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW Radio Quidico] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Audio Streaming & APIs: SIEMPRE NETWORK ONLY (sin caché para evitar freeze, lag o desincronización de alertas)
  if (
    requestUrl.hostname.includes('zeno.fm') ||
    requestUrl.hostname.includes('portalfoxmix.club') ||
    requestUrl.hostname.includes('walmradio.com') ||
    requestUrl.pathname.includes('/api/') ||
    requestUrl.pathname.endsWith('.mp3') ||
    requestUrl.pathname.endsWith('.aac') ||
    requestUrl.pathname.includes('/8320') ||
    requestUrl.protocol === 'ws:' ||
    requestUrl.protocol === 'wss:' ||
    event.request.destination === 'audio' ||
    event.request.destination === 'video' ||
    event.request.headers.get('range')
  ) {
    return event.respondWith(fetch(event.request));
  }

  // 2. Páginas de navegación: Network first con fallback a caché
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // 3. Recursos estáticos (imágenes, fuentes, css, js): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
