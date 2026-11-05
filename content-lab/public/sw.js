/* Content Lab install shell. NEVER cache private Supabase API/photo responses,
   documents, or user-created media on a shared device. Online-first by design. */
const CACHE_NAME='content-lab-offline-v1';
const OFFLINE_URL='/content-lab/offline.html';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.add(OFFLINE_URL)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('content-lab-offline-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.mode!=='navigate'||new URL(request.url).origin!==self.location.origin)return;
 if(!new URL(request.url).pathname.startsWith('/content-lab/'))return;
 event.respondWith(fetch(request).catch(async()=>{
   const cache=await caches.open(CACHE_NAME);
   return (await cache.match(OFFLINE_URL))||Response.error();
 }));
});
