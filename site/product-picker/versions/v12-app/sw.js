const CACHE='ozon-picker-app-20261111-dual-sliders-v1';
const BASE='/product-picker/app/';
const CORE=['index.html','sliders.html','styles.css','app.js','data.js','core.js','components/selector.js','components/product-card.js','components/install-guide.js','components/onboarding.js','components/two-sliders.js'].map(file=>BASE+file);
const ASSETS=['onest.woff2','v12-slider-track.svg','v09-01-stats.svg','v09-02-icmdisclosurebackfilled.svg','v09-03-icminfofilled.svg','v09-04-dots.svg','v09-05-mover.svg','v09-16-subtract.svg','v09-17-beak.svg','v09-18-icscrossfilled.svg','close.svg','install-share.svg','app-home.svg','v09-00-safecc1.png','v09-07-nakop2.png','v09-06-image22.png','v09-09-cfa4.png'].map(file=>'/product-picker/assets/'+file);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE,...ASSETS,'/product-picker/manifest.json','/product-picker/manifest-sliders.json'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ozon-picker-app-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.pathname==='/product-picker/live.html'){event.respondWith(Promise.resolve(Response.redirect(new URL(BASE,self.location.origin).href,302)));return;}
 const owned=url.pathname.startsWith(BASE)||url.pathname.startsWith('/product-picker/assets/')||url.pathname==='/product-picker/manifest.json'||url.pathname==='/product-picker/manifest-sliders.json';if(!owned)return;
 function remember(key,response){if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,response.clone())).catch(()=>{}));return response;}
 async function networkFirst(key){try{const response=await fetch(request);if(!response.ok)return await caches.match(key)||response;return remember(key,response);}catch{return await caches.match(key)||new Response('Нет подключения. Откройте приложение с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}}
 if(request.mode==='navigate'){event.respondWith(networkFirst(url.pathname===BASE+'sliders.html'?BASE+'sliders.html':BASE+'index.html'));return;}
 if(url.pathname.startsWith('/product-picker/assets/')){event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>remember(request,response))));return;}
 event.respondWith(networkFirst(request));
});
