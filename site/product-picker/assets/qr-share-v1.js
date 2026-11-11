/* Desktop sharing for both the variant viewer and standalone prototypes. */
(() => {
 'use strict';
 if(window.top!==window)return;
 const script=document.currentScript,localRoot=new URL('../',script.src);
 const shareRoot=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?new URL('product-picker/','https://sukhovdes.github.io/ozon-prototypes/'):localRoot;
 const style=document.createElement('style');
 style.textContent=`
 .prototype-qr{display:none;position:fixed;z-index:50;top:16px;right:16px;width:88px;padding:8px;background:#fff;border-radius:14px;box-shadow:0 4px 24px #001a3410;text-decoration:none;color:#637383;box-sizing:border-box;transform-origin:top right;transition:width 180ms ease,padding 180ms ease;cursor:pointer}
 .prototype-qr svg{display:block;width:100%;height:auto;shape-rendering:crispEdges}
 .prototype-qr span{display:block;max-height:0;overflow:hidden;opacity:0;text-align:center;font:12px/18px Onest,Arial,sans-serif;transition:opacity 140ms ease,max-height 180ms ease}
 @media(min-width:820px) and (hover:hover) and (pointer:fine){.prototype-qr{display:block}.prototype-qr:hover,.prototype-qr:focus-visible{width:224px;padding:12px}.prototype-qr:hover span,.prototype-qr:focus-visible span{max-height:24px;opacity:1}.prototype-qr:focus-visible{outline:2px solid #005bff;outline-offset:4px}}
 @media(prefers-reduced-motion:reduce){.prototype-qr,.prototype-qr span{transition:none}}
 `;
 document.head.append(style);
 const link=document.createElement('a');link.className='prototype-qr';link.setAttribute('aria-label','Открыть этот вариант на телефоне');
 const code=document.createElement('div');code.setAttribute('aria-hidden','true');
 const caption=document.createElement('span');caption.textContent='Открыть на телефоне';link.append(code,caption);document.body.append(link);
 const desktop=matchMedia('(min-width:820px) and (hover:hover) and (pointer:fine)');
 let rendered='';
 function render(){
  const version=document.documentElement.dataset.pickerVersion;
  const destination=version?(version==='v16'?'three/':version==='v14'?'matrix/':'#'+version):location.pathname.slice(localRoot.pathname.length)+location.search+location.hash;
  const url=new URL(destination,shareRoot).href;link.href=url;
  if(!desktop.matches||url===rendered)return;
  const qr=qrcode(0,'M');qr.addData(url);qr.make();code.innerHTML=qr.createSvgTag({cellSize:4,margin:16,scalable:true});rendered=url;
 }
 window.addEventListener('picker-version-change',render);window.addEventListener('hashchange',render);desktop.addEventListener('change',render);render();
})();
