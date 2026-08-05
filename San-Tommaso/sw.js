const VERSION='san-tommaso-v1.0.0';
const STATIC_CACHE=`${VERSION}-static`;
const RUNTIME_CACHE=`${VERSION}-runtime`;
const CORE=[
  './','./index.html','./manifest.webmanifest','./css/main.css','./js/app.js','./data/content.js',
  './assets/icons/icon.svg',
  './assets/images/tommaso-hero.webp','./assets/images/tommaso-hero.jpg',
  './assets/images/mondo-tommaso.webp','./assets/images/mondo-tommaso.jpg',
  './assets/images/fumetto-01-06.webp','./assets/images/fumetto-01-06.jpg',
  './assets/images/fumetto-07-12.webp','./assets/images/fumetto-07-12.jpg'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)))));
  self.clients.claim();
});

function normalizedNavigation(request){
  const url=new URL(request.url);
  url.search='';
  url.hash='';
  return new Request(url.toString(),{method:'GET',headers:request.headers,mode:'same-origin',credentials:'same-origin',redirect:'follow'});
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok)(await caches.open(RUNTIME_CACHE)).put(normalizedNavigation(request),response.clone());
        return response;
      }catch{
        const exact=await caches.match(normalizedNavigation(request));
        return exact||caches.match('./index.html');
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok)(await caches.open(RUNTIME_CACHE)).put(request,response.clone());
    return response;
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='GET_VERSION')event.source?.postMessage({type:'VERSION',version:VERSION});
});
