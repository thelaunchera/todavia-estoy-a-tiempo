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


/** Web Push works even after the installed PWA is closed. */
self.addEventListener('push',event=>{
 let data={title:'Content Lab ✨',body:'Tu espacio creativo te espera.',url:'/content-lab/',tag:'content-lab-reminder'};
 try{data={...data,...event.data?.json()}}catch{/* Keep a safe fallback without showing raw payload. */}
 const url=new URL(String(data.url||'/content-lab/'),self.location.origin);
 const destination=url.origin===self.location.origin&&url.pathname.startsWith('/content-lab/')
   ?url.href:self.location.origin+'/content-lab/';
 event.waitUntil(self.registration.showNotification(String(data.title||'Content Lab ✨').slice(0,100),{
  body:String(data.body||'').slice(0,220),
  icon:'/content-lab/icon-192.png',badge:'/content-lab/favicon-32.png',
  tag:String(data.tag||'content-lab-reminder').slice(0,120),renotify:false,
  data:{url:destination}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const requested=new URL(event.notification.data?.url||'/content-lab/',self.location.origin);
 const destination=requested.origin===self.location.origin&&requested.pathname.startsWith('/content-lab/')
  ?requested.href:self.location.origin+'/content-lab/';
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
  const existing=windows.find(client=>new URL(client.url).pathname.startsWith('/content-lab/'));
  if(existing){
   if('navigate' in existing)await existing.navigate(destination);
   if('focus' in existing)return existing.focus();
  }
  return self.clients.openWindow(destination);
 }));
});
