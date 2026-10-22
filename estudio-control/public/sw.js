/* Podcast studio PWA — only static assets; never cache private Supabase traffic. */
const CACHE = 'podcast-studio-static-v1';
const PREFIX = new URL(self.registration.scope).pathname;
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('podcast-studio-static-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') return;
  const localAsset = url.pathname.startsWith(PREFIX + 'assets/') || url.pathname.startsWith(PREFIX + 'icons/');
  if (!localAsset || request.headers.has('Authorization')) return;
  event.respondWith((async () => {
    const store = await caches.open(CACHE);
    const saved = await store.match(request);
    if (saved) return saved;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await store.put(request, response.clone());
    return response;
  })());
});
