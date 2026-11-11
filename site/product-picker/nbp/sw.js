const CACHE='ozon-picker-nbp-20261111-snap-cta',BASE='/product-picker/nbp/';
const CORE=["index.html", "styles.css", "app.js", "data.js", "manifest.json"].map(file=>BASE+file);
const SHARED=["/product-picker/assets/install-share.svg", "/product-picker/assets/intro-sequence-v1.js", "/product-picker/assets/onest.woff2", "/product-picker/assets/qr-encoder-v1.js", "/product-picker/assets/qr-share-v2.js", "/product-picker/assets/v09-00-safecc1.png", "/product-picker/assets/v09-01-stats.svg", "/product-picker/assets/v09-02-icmdisclosurebackfilled.svg", "/product-picker/assets/v09-03-icminfofilled.svg", "/product-picker/assets/v09-04-dots.svg", "/product-picker/assets/v09-05-mover.svg", "/product-picker/assets/v09-06-image22.png", "/product-picker/assets/v09-07-nakop2.png", "/product-picker/assets/v09-09-cfa4.png", "/product-picker/assets/v09-16-subtract.svg", "/product-picker/assets/v09-17-beak.svg", "/product-picker/assets/v09-18-icscrossfilled.svg"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE.map(file=>new Request(file,{cache:"reload"})),...SHARED])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ozon-picker-nbp-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||(!url.pathname.startsWith(BASE)&&!SHARED.includes(url.pathname)))return;
 function remember(key,response){if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,response.clone())).catch(()=>{}));return response;}
 async function networkFirst(key){try{const response=await fetch(request);if(!response.ok)return await caches.match(key)||response;return remember(key,response);}catch{return await caches.match(key)||new Response('Откройте приложение с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}}
 if(request.mode==='navigate'){event.respondWith(networkFirst(BASE+'index.html'));return;}
 if(SHARED.includes(url.pathname)||url.pathname.startsWith(BASE+'assets/')){event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>remember(request,response))));return;}
 event.respondWith(networkFirst(url.pathname));
});
