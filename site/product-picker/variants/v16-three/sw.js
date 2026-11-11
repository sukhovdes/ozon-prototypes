const CACHE='ozon-picker-three-20261111-round32',BASE='/product-picker/three/';
const CORE=['index.html','base.css','styles.css','app.js','data.js','core.js','model.js','manifest.json','components/three-sliders.js','components/product-card.js','components/install-guide.js','assets/slider-track-three.svg'].map(file=>BASE+file);
const SHARED=['product-matrix-v2.js','travel-savings.png','tops-fund.svg','qr-encoder-v1.js','qr-share-v1.js','onest.woff2','v09-01-stats.svg','v09-02-icmdisclosurebackfilled.svg','v09-03-icminfofilled.svg','close.svg','install-share.svg','app-home.svg','v09-00-safecc1.png','v09-07-nakop2.png','v09-06-image22.png','v09-09-cfa4.png'].map(file=>'/product-picker/assets/'+file);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE.map(file=>new Request(file,{cache:"reload"})),...SHARED])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ozon-picker-three-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||(!url.pathname.startsWith(BASE)&&!SHARED.includes(url.pathname)))return;
 function remember(key,response){if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,response.clone())).catch(()=>{}));return response;}
 async function networkFirst(key){try{const response=await fetch(request,{cache:"no-cache"});if(!response.ok)return await caches.match(key)||response;return remember(key,response);}catch{return await caches.match(key)||new Response('Откройте приложение с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}}
 if(url.pathname.endsWith('/product-matrix-v2.js')){event.respondWith(networkFirst(url.pathname));return;}
 if(request.mode==='navigate'){event.respondWith(networkFirst(BASE+'index.html'));return;}
 if(SHARED.includes(url.pathname)||url.pathname.startsWith(BASE+'assets/')){event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>remember(request,response))));return;}
 event.respondWith(networkFirst(url.pathname));
});
