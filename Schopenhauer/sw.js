const PREFIX='gbprof-schopenhauer-';
const CACHE=PREFIX+'v4';
const CORE=[
  "./",
  "./index.html",
  "../pwa-common/gbprof-accessibility.css?v=1",
  "../pwa-common/gbprof-accessibility.js?v=1",
  "../privacy.html",
  "../accessibilita.html",
  "./arte.html",
  "./ascesi.html",
  "./assets/copertina.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/icon.svg",
  "./assets/mappa-arte.svg",
  "./assets/mappa-ascesi.svg",
  "./assets/mappa-compassione.svg",
  "./assets/mappa-conclusione.svg",
  "./assets/mappa-confronto-finale.svg",
  "./assets/mappa-corpo.svg",
  "./assets/mappa-desiderio.svg",
  "./assets/mappa-individuazione.svg",
  "./assets/mappa-mondo-uomo.svg",
  "./assets/mappa-motore-uomo.svg",
  "./assets/mappa-pessimismo.svg",
  "./assets/mappa-problema.svg",
  "./assets/mappa-rappresentazione.svg",
  "./assets/mappa-salvezza.svg",
  "./assets/mappa-sofferenza.svg",
  "./assets/mappa-volonta.svg",
  "./assets/scene/arte.webp",
  "./assets/scene/ascesi.webp",
  "./assets/scene/compassione.webp",
  "./assets/scene/conclusione.webp",
  "./assets/scene/confronto-finale.webp",
  "./assets/scene/corpo.webp",
  "./assets/scene/desiderio.webp",
  "./assets/scene/individuazione.webp",
  "./assets/scene/mondo-uomo.webp",
  "./assets/scene/motore-uomo.webp",
  "./assets/scene/pessimismo.webp",
  "./assets/scene/problema.webp",
  "./assets/scene/rappresentazione.webp",
  "./assets/scene/salvezza.webp",
  "./assets/scene/sofferenza.webp",
  "./assets/scene/volonta.webp",
  "./assets/schopenhauer-ritratto.png",
  "./compassione.html",
  "./comprendere.html",
  "./conclusione.html",
  "./confronto-finale.html",
  "./corpo.html",
  "./desiderio.html",
  "./fonti.html",
  "./individuazione.html",
  "./letteratura.html",
  "./manifest.webmanifest",
  "./mondo-uomo.html",
  "./motore-uomo.html",
  "./pessimismo.html",
  "./problema.html",
  "./rappresentazione.html",
  "./salvezza.html",
  "./sofferenza.html",
  "./styles.css",
  "./verifica.html",
  "./volonta.html",
  "./app.js",
  "./app.js?v=2",
  "./styles.css?v=4"
];
const BASE=new URL('./',self.location.href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin)return;
 const known=CORE.some(p=>new URL(p,BASE).href===url.href);
 if(!url.pathname.startsWith(BASE.pathname)&&!known)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(event.request.mode==='navigate'){
   try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}
   catch{const hit=await cache.match(event.request,{ignoreSearch:true});return hit||new Response('Pagina non disponibile offline. Torna all’indice di Schopenhauer.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  }
  const hit=await cache.match(event.request);if(hit)return hit;
  const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
 })());
});
