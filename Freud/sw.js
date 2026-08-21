'use strict';
const CACHE = 'freud-pwa-v1.2.0';
const PREFIX = 'freud-pwa-';
const CORE = [
  './','./index.html','./styles.css','./styles-p1.css','./styles-p2.css','./styles-p3.css','./styles-p4.css','./styles-p5.css','./dashboard.css','./topica.css','./comics.css',
  './data.js','./data-p1.js','./data-p2.js','./data-p3.js','./data-p4.js','./data-p5.js','./data-p6.js','./data-p7.js','./data-p8.js','./data-p9.js','./data-p10.js','./data-p11.js','./data-p12.js','./data-p13.js',
  './app.js','./app-p1.js','./app-p2.js','./app-p3.js','./app-p4.js','./app-p5.js','./topica.js','./comics.js',
  './comic-img-01.js','./comic-img-02.js','./comic-img-03.js','./comic-img-04.js','./comic-img-05.js','./comic-img-06.js','./comic-img-07.js','./comic-img-08.js',
  './manifest.webmanifest','./assets/cover-freud-dashboard.webp','./assets/icon.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.includes('/Freud/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (!response || !response.ok) throw new Error('network response not ok');
      const copy=response.clone(); caches.open(CACHE).then(cache => cache.put('./index.html', copy)); return response;
    }).catch(() => caches.match('./index.html').then(response => response || caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(request,response.clone()));
    return response;
  })));
});
