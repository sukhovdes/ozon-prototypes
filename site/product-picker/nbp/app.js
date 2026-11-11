'use strict';
import {IntroSequence} from '/product-picker/assets/intro-sequence-v1.js';
import {PRODUCTS,productsAt,EMPTY_TITLE} from './data.js?v=snap-cta-20261111';
const $=selector=>document.querySelector(selector);
const state={row:1,col:1,cardIndex:0,tutorialDismissed:false};
const positions=['Слева сверху','По центру сверху','Справа сверху','Слева по центру','В центре','Справа по центру','Слева снизу','По центру снизу','Справа снизу'];
const field=$('#field'),control=$('#control'),mover=$('#mover');
let announcementTimer,returnFocus=null,sheetProduct=null,dragPointer=null;
let tutorialSequence;
const interfaceReady=Promise.all([document.fonts?.ready,...[...document.querySelectorAll('img')].map(image=>image.decode().catch(()=>{}))]);
const clamp=(n,max=2)=>Math.max(0,Math.min(max,n));
const matches=()=>productsAt(state.row,state.col);
const mobileInput=matchMedia('(hover: none) and (pointer: coarse)');
const standaloneDisplay=matchMedia('(display-mode: standalone)'),fullscreenDisplay=matchMedia('(display-mode: fullscreen)');
const installGate=$('#install-gate'),installStorageKey='picker-nbp-install-skipped-v1';
let installSkipped=false;
try{installSkipped=sessionStorage.getItem(installStorageKey)==='1';}catch{}
function isIOSDevice(){return /iPad|iPhone|iPod/i.test(navigator.userAgent)||(/Mac/.test(navigator.platform)&&navigator.maxTouchPoints>1);}
function syncInstallGate(){
 const standalone=navigator.standalone===true||standaloneDisplay.matches||fullscreenDisplay.matches;
 const visible=isIOSDevice()&&!standalone&&!installSkipped;
 const opening=visible&&installGate.hidden;
 installGate.hidden=!visible;
 $('.device-stage').inert=visible;
 document.documentElement.classList.toggle('install-open',visible);
 if(tutorialSequence){if(visible)tutorialSequence.cancel();else tutorialSequence.request(productCard.pending);}
 if(opening)installGate.focus({preventScroll:true});
}
$('#skip-install').addEventListener('click',()=>{
 installSkipped=true;
 try{sessionStorage.setItem(installStorageKey,'1');}catch{}
 syncInstallGate();mover.focus({preventScroll:true});
});
for(const query of [standaloneDisplay,fullscreenDisplay])query.addEventListener('change',syncInstallGate);
addEventListener('pageshow',syncInstallGate);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncInstallGate();});
function resize(){
 const mobile=isIOSDevice()||mobileInput.matches||navigator.userAgentData?.mobile===true;
 const scale=mobile?1:Math.min(1,innerWidth/375,innerHeight/812);
 document.documentElement.classList.toggle('mobile',mobile);
 document.documentElement.style.setProperty('--scale',scale);
 document.documentElement.style.setProperty('--device-height','812px');
 syncInstallGate();
}
mobileInput.addEventListener('change',resize);
class ProductCard{
 constructor(element,products){
  this.element=element;this.views=new Map();this.request=0;this.requested=null;this.active=null;this.pending=Promise.resolve(false);this.button=element.querySelector('#selected-product');this.actionAnimation=null;
  const template=$('#product-card-template');
  for(const product of Object.values(products)){
   const view=template.content.firstElementChild.cloneNode(true),image=view.querySelector('[data-slot=icon]');
   view.dataset.product=product.id;view.inert=true;
   view.querySelector('[data-slot=title]').textContent=product.name;
   view.querySelector('[data-slot=terms]').textContent=product.terms;
   if(product.crop){const crop=product.crop;image.style.left=crop.left+'%';image.style.top=crop.top+'%';image.style.width=crop.size+'%';image.style.height=crop.size+'%';}
   else view.querySelector('[data-slot=image]').classList.add('show-whole-image');
   element.append(view);
   this.views.set(product.id,{view,image,hideTimer:null});
  }
  this.button.addEventListener('click',()=>openSheet(this.button.dataset.product));
 }
 updateAction(product){
  const button=this.button;
  // The action target follows the product even when its visible label is unchanged.
  button.dataset.product=product.id;
  button.setAttribute('aria-label',product.action+': '+product.name);
  const first=button.hidden;button.hidden=false;
  if(button.textContent===product.action)return;
  button.textContent=product.action;button.classList.toggle('invest',product.kind==='cfa');button.hidden=false;
  this.actionAnimation?.cancel();
  if(!first&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.actionAnimation=button.animate([{opacity:.25},{opacity:1}],{duration:200,easing:'ease-out'});
 }
 show(id){
  if(this.requested===id)return this.pending;
  this.requested=id;const request=++this.request,next=this.views.get(id);
  if(!next.image.getAttribute('src'))next.image.src=PRODUCTS[id].image;
  return this.pending=this.present(id,next,request);
 }
 clear(){
  if(this.requested==='empty')return this.pending;
  this.request++;this.requested='empty';this.active=null;this.button.hidden=true;this.button.removeAttribute('data-product');
  for(const entry of this.views.values()){clearTimeout(entry.hideTimer);entry.view.hidden=true;entry.view.inert=true;entry.view.setAttribute('aria-hidden','true');entry.view.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));}
  return this.pending=Promise.resolve(true);
 }
 async present(id,next,request){
  try{await next.image.decode();}catch{}
  if(request!==this.request||!next.image.naturalWidth)return false;
  if(this.active===next)return true;
  const previous=this.active;this.active=next;
  clearTimeout(next.hideTimer);
  for(const entry of this.views.values()){
   if(entry===next)continue;
   entry.view.inert=true;entry.view.setAttribute('aria-hidden','true');
   entry.view.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
   entry.view.style.opacity='0';clearTimeout(entry.hideTimer);
   entry.hideTimer=setTimeout(()=>{if(this.active!==entry)entry.view.hidden=true;},260);
  }
  next.view.hidden=false;next.view.inert=false;next.view.setAttribute('aria-hidden','false');
  const slots={image:'product-image',icon:'hero-icon',title:'hero-name',terms:'product-note'};
  for(const [slot,id]of Object.entries(slots))next.view.querySelector('[data-slot='+slot+']').id=id;
  this.updateAction(PRODUCTS[id]);
  if(!previous)next.view.style.transition='none';
  // Commit the transparent frame before starting the opacity transition.
  void next.view.offsetWidth;
  next.view.style.opacity='1';
  if(!previous)requestAnimationFrame(()=>next.view.style.removeProperty('transition'));
  return true;
 }
}
const productCard=new ProductCard($('#product-card'),PRODUCTS);
tutorialSequence=new IntroSequence({element:$('#onboarding'),shouldShow:()=>!state.tutorialDismissed&&installGate.hidden,interfaceReady});
function dismissTutorial(){state.tutorialDismissed=true;tutorialSequence.cancel();}
function render(){
 const ids=matches();state.cardIndex=clamp(state.cardIndex,ids.length-1);const p=PRODUCTS[ids[state.cardIndex]]||null;
 const empty=!p;$('#empty-state').hidden=!empty;$('#product-card').hidden=empty;
 const cardReady=empty?productCard.clear():productCard.show(p.id);
 const pagination=$('#product-pagination');
 if(pagination.dataset.products!==ids.join('|')){pagination.dataset.products=ids.join('|');pagination.replaceChildren();if(ids.length>1)for(let i=0;i<ids.length;i++){const button=document.createElement('button');button.dataset.productPage=i;button.setAttribute('aria-label','Показать: '+PRODUCTS[ids[i]].name);const dot=document.createElement('span');dot.className='page-dot';dot.setAttribute('aria-hidden','true');button.append(dot);pagination.append(button);}}
 pagination.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-current',String(i===state.cardIndex)));
 const x=3+state.col*86,y=3+state.row*86;mover.style.left=x+'px';mover.style.top=y+'px';
 const position=positions[state.row*3+state.col];mover.setAttribute('aria-label',position+'. '+(p?p.name:EMPTY_TITLE)+'. Двигайте стрелками');
 $('#grid-targets').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.row)===state.row&&Number(button.dataset.col)===state.col)));
 tutorialSequence.request(cardReady);
 clearTimeout(announcementTimer);announcementTimer=setTimeout(()=>{$('#announcement').textContent=position+'. '+(ids.length?ids.map(id=>PRODUCTS[id].name).join(', ')+'. '+ids.length+' '+(ids.length===1?'продукт':'продукта'):EMPTY_TITLE)+'.';},180);
}
function choose(row,col){row=clamp(row);col=clamp(col);dismissTutorial();if(row===state.row&&col===state.col)return;state.row=row;state.col=col;state.cardIndex=0;render();}
for(let row=0;row<3;row++)for(let col=0;col<3;col++){
 const button=document.createElement('button');button.className='grid-point';button.dataset.row=row;button.dataset.col=col;button.style.left=(3+col*86)+'px';button.style.top=(3+row*86)+'px';button.setAttribute('aria-label',positions[row*3+col]);button.setAttribute('aria-pressed','false');button.tabIndex=-1;$('#grid-targets').append(button);
}
function moveFromPointer(e){const r=field.getBoundingClientRect();const sx=r.width/178,sy=r.height/178;choose(Math.round(((e.clientY-r.top)/sy-3)/86),Math.round(((e.clientX-r.left)/sx-3)/86));}
// Safari can consider programmatic focus after a touch to be focus-visible.
document.addEventListener('pointerdown',()=>document.documentElement.classList.remove('keyboard-navigation'),{capture:true});
document.addEventListener('keydown',()=>document.documentElement.classList.add('keyboard-navigation'),{capture:true});
control.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dragPointer=e.pointerId;control.setPointerCapture(e.pointerId);field.classList.add('dragging');mover.focus({preventScroll:true});moveFromPointer(e);});
control.addEventListener('pointermove',e=>{if(e.pointerId===dragPointer)moveFromPointer(e);});
function endDrag(e){if(e.pointerId!==dragPointer)return;dragPointer=null;field.classList.remove('dragging');if(control.hasPointerCapture(e.pointerId))control.releasePointerCapture(e.pointerId);}
for(const event of ['pointerup','pointercancel','lostpointercapture'])control.addEventListener(event,endDrag);
$('#grid-targets').addEventListener('click',e=>{const b=e.target.closest('[data-row]');if(b)choose(Number(b.dataset.row),Number(b.dataset.col));});
mover.addEventListener('keydown',e=>{let row=state.row,col=state.col;if(e.key==='ArrowUp')row--;else if(e.key==='ArrowDown')row++;else if(e.key==='ArrowLeft')col--;else if(e.key==='ArrowRight')col++;else if(/^[1-9]$/.test(e.key)){const n=Number(e.key)-1;row=Math.floor(n/3);col=n%3;}else if(e.key==='Home'){row=0;col=0;}else if(e.key==='End'){row=2;col=2;}else return;e.preventDefault();choose(row,col);});
$('#product-pagination').addEventListener('click',e=>{const b=e.target.closest('[data-product-page]');if(b){dismissTutorial();state.cardIndex=Number(b.dataset.productPage);render();}});
let swipeStart=null;
$('#product-preview').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;swipeStart={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);});
$('#product-preview').addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)&&matches().length>1){dismissTutorial();state.cardIndex=dx<0?1:0;render();}});
$('#product-preview').addEventListener('pointercancel',()=>swipeStart=null);
function closeSheet(){if($('#sheet-backdrop').hidden)return;$('#sheet-backdrop').hidden=true;$('#app').inert=false;sheetProduct=null;returnFocus?.focus({preventScroll:true});}
function openSheet(id){
 dismissTutorial();returnFocus=document.activeElement;sheetProduct=id||'help';const p=PRODUCTS[id];$('#sheet-title').textContent=p?p.name:'Как работает подбор';const body=$('#sheet-body');body.replaceChildren();
 const paragraph=(text,className)=>{const el=document.createElement('p');el.textContent=text;if(className)el.className=className;body.append(el);};
 if(p){paragraph(p.terms,'terms');paragraph(p.description);paragraph('Это демонстрационный прототип. Оформление продукта здесь не выполняется; ставки и условия взяты из предоставленной матрицы.');}
 else{paragraph('Перемещайте ползунок между девятью точками или нажимайте на поле. Сверху появится один или два продукта из матрицы; в пустой ячейке будет сообщение.');paragraph('Если продуктов два, переключайте их точками под карточкой или свайпом по карточке. Ползунок также работает со стрелками клавиатуры.');const replay=document.createElement('button');replay.textContent='Показать подсказку снова';replay.addEventListener('click',()=>{closeSheet();state.tutorialDismissed=false;render();});body.append(replay);}
 $('#app').inert=true;$('#sheet-backdrop').hidden=false;$('#sheet').scrollTop=0;$('#close-sheet').focus({preventScroll:true});
}
$('#help').addEventListener('click',()=>openSheet());
$('#reset').addEventListener('click',()=>{state.row=1;state.col=1;state.cardIndex=0;state.tutorialDismissed=false;render();});
$('#dismiss-onboarding').addEventListener('click',dismissTutorial);
for(const id of ['close-sheet','sheet-done'])$('#'+id).addEventListener('click',closeSheet);
$('#sheet-backdrop').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSheet();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#sheet-backdrop').hidden)closeSheet();else dismissTutorial();}if(e.key==='Tab'&&!$('#sheet-backdrop').hidden){const buttons=[...$('#sheet').querySelectorAll('button')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
window.pickerSnapshot=()=>({risk:1-state.row/2,access:state.col/2,payout:null,cardIndex:state.cardIndex,scrollTop:0,openDetails:[],tutorialDismissed:state.tutorialDismissed,sheetProduct,sheetScroll:$('#sheet').scrollTop});
window.restorePicker=s=>{if(!s)return;if(Number.isFinite(s.risk))state.row=clamp(Math.round((1-s.risk)*2));if(Number.isFinite(s.access))state.col=clamp(Math.round(s.access*2));if(Number.isInteger(s.cardIndex))state.cardIndex=s.cardIndex;if('tutorialDismissed'in s)state.tutorialDismissed=!!s.tutorialDismissed;render();if(s.sheetProduct&&(s.sheetProduct==='help'||PRODUCTS[s.sheetProduct])){openSheet(s.sheetProduct);$('#sheet').scrollTop=s.sheetScroll||0;}else closeSheet();};
addEventListener('resize',resize);resize();render();

if('serviceWorker' in navigator&&location.pathname.startsWith('/product-picker/nbp/')&&window.top===window)addEventListener('load',()=>navigator.serviceWorker.register('/product-picker/nbp/sw.js',{scope:'/product-picker/nbp/'}).catch(()=>{}),{once:true});
