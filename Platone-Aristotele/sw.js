const CACHE='platone-aristotele-v30';
const CORE=[
 './','./index.html','./home.js','./manifest.webmanifest','./assets/icon.svg',
 './scopro/','./scopro/index.html',
 './studio/','./studio/index.html','./studio/style.css','./studio/extra.css','./studio/data-platone.js','./studio/data-aristotele.js','./studio/glossary.js','./studio/comparisons.js','./studio/app.js','./studio/full-lesson.html','./studio/full-style.css','./studio/full-lessons-platone.js','./studio/full-lessons-aristotele.js','./studio/full-app.js',
 './approfondisco/','./approfondisco/index.html','./approfondisco/style.css','./approfondisco/data-platone.js','./approfondisco/data-aristotele-1.js','./approfondisco/data-aristotele-2.js','./approfondisco/app.js',
 './fumetti/','./fumetti/index.html','./fumetti/style.css','./fumetti/overview.css','./fumetti/data.js','./fumetti/app.js','./fumetti/assets/platone-sei-scene.jpg','./fumetti/assets/aristotele-sei-scene.jpg',
 './dizionario/','./dizionario/index.html','./dizionario/style.css','./dizionario/data.js','./dizionario/app.js',
 './atlante/','./atlante/index.html','./atlante/style.css','./atlante/data.js','./atlante/app.js',
 './confronti/','./confronti/index.html','./confronti/style.css','./confronti/data.js','./confronti/app.js',
 './laboratorio/','./laboratorio/index.html','./laboratorio/style.css','./laboratorio/data-1.js','./laboratorio/data-2.js','./laboratorio/app.js',
 './linea-del-tempo/','./linea-del-tempo/index.html','./linea-del-tempo/style.css','./linea-del-tempo/data.js','./linea-del-tempo/app.js',
 './biblioteca/','./biblioteca/index.html','./biblioteca/style.css','./biblioteca/data-platone.js','./biblioteca/data-aristotele.js','./biblioteca/app.js',
 './visita-accademia/','./visita-accademia/index.html','./visita-accademia/style.css','./visita-accademia/app.js','./visita-accademia/stage.css','./visita-accademia/stage.js','./visita-accademia/stage-data.js','./visita-accademia/tappa/','./visita-accademia/tappa/index.html','./visita-accademia/platone-1/','./visita-accademia/platone-1/index.html',
 './visita-accademia/assets/mappa-generale.png',
 './visita-accademia/assets/scenes/p1-giardino-socrate.webp','./visita-accademia/assets/scenes/p2-portico-dialogo.webp','./visita-accademia/assets/scenes/p3-sala-idee.webp','./visita-accademia/assets/scenes/p4-aula-matematica.webp','./visita-accademia/assets/scenes/p5-cortile-repubblica.webp','./visita-accademia/assets/scenes/p6-sala-leggi.webp',
 './visita-accademia/assets/scenes/a1-maestro-metodo.webp','./visita-accademia/assets/scenes/a2-logica.webp','./visita-accademia/assets/scenes/a3-metafisica.webp','./visita-accademia/assets/scenes/a4-fisica.webp','./visita-accademia/assets/scenes/a5-biologia.webp','./visita-accademia/assets/scenes/a6-etica.webp','./visita-accademia/assets/scenes/a7-politica.webp','./visita-accademia/assets/scenes/a8-poetica.webp'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
  return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
