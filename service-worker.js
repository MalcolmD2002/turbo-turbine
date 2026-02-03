const CACHE_NAME = "site-navigator-v2";
const CORE_ASSETS = [
  "./","./index.html","./exclude.html","./navigation.html",
  "./route-planner.js","./manifest.json",
  "./icons/icon-192.png","./icons/icon-512.png",
  "https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css",
  "https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js"
];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.map(key=>key!==CACHE_NAME&&caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  if(r.url.includes("api.mapbox.com")){
    e.respondWith(fetch(r).then(res=>{
      const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));return res;
    }).catch(()=>caches.match(r)));
  } else {
    e.respondWith(caches.match(r).then(cached=>cached||fetch(r).then(res=>{
      const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));return res;
    }).catch(()=>new Response("Offline",{status:503}))));
  }
});
