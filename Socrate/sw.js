const CACHE='socrate-atene-v1';
const CORE=[
 './','./index.html','./home.js','./shared.css','./common.js','./data.js','./manifest.webmanifest',
 './assets/icon.svg','./assets/socrate-ad-atene.png',
 './scopro/','./scopro/index.html',
 './studio/','./studio/index.html','./studio/app.js',
 './approfondisco/','./approfondisco/index.html',
 './fumetti/','./fumetti/index.html',
 './attraversa-atene/','./attraversa-atene/index.html',
 './dizionario/','./dizionario/index.html',
 './confronti/','./confronti/index.html',
 './laboratorio/','./laboratorio/index.html',
 './linea-del-tempo/','./linea-del-tempo/index.html',
 './biblioteca/','./biblioteca/index.html'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
  return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
