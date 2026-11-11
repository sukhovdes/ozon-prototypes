import {PRODUCTS,ASSETS,PRIORITIES,ACCESS} from './data.js?v=snap-cta-20261111';
import {normalizeState,matches,selectedProduct,needsInstallGuide,readSession,writeSession} from './core.js?v=snap-cta-20261111';
import {Selector} from './components/selector.js?v=snap-cta-20261111';
import {ProductCard} from './components/product-card.js?v=snap-cta-20261111';
import {InstallGuide} from './components/install-guide.js?v=snap-cta-20261111';
import {Onboarding} from './components/onboarding.js?v=snap-cta-20261111';
const $=s=>document.querySelector(s),STATE_KEY='ozon-picker-webapp-v2',SKIP_KEY='ozon-picker-webapp-install-skip';
const state=normalizeState(readSession(STATE_KEY,{}));
// Each app launch starts with the coach; navigating within the app keeps it dismissed.
state.coachSeen=false;
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Mac/.test(navigator.platform)&&navigator.maxTouchPoints>1);
const standaloneQuery=matchMedia('(display-mode:standalone)'),fullscreenQuery=matchMedia('(display-mode:fullscreen)');
const standalone=()=>navigator.standalone===true||standaloneQuery.matches||fullscreenQuery.matches;
let view=needsInstallGuide({ios,standalone:standalone(),skipped:readSession(SKIP_KEY,false)})?'install':'main';
let sheetReturnFocus=null,sheetKey=null,announcementTimer,pagerSignature='';
const persist=()=>writeSession(STATE_KEY,state);
const card=new ProductCard($('#product-card'),openProduct);
const onboarding=new Onboarding($('#main-view'));
function dismissCoach(){if(state.coachSeen)return;state.coachSeen=true;onboarding.setVisible(false);persist();}
const selector=new Selector($('#selector-field'),{onSelect:(row,col)=>{if(state.row===row&&state.col===col)return;state.row=row;state.col=col;state.cardIndex=0;renderChoice();persist();},onInteract:dismissCoach});
const savedStep=state.guideStep;
const guide=new InstallGuide($('#install-view'),{onSkip:()=>{writeSession(SKIP_KEY,true);showView('main');},onStep:step=>{state.guideStep=step;persist();}});guide.setStep(savedStep);
function renderChoice(){
 const ids=matches(state.row,state.col);state.cardIndex=Math.min(state.cardIndex,ids.length-1);const product=selectedProduct(state);card.show(product);selector.setCell(state.row,state.col);
 const signature=ids.join('|');if(signature!==pagerSignature){pagerSignature=signature;$('#pagination').replaceChildren();if(ids.length>1)ids.forEach((id,i)=>{const button=document.createElement('button');button.dataset.page=i;button.setAttribute('aria-label','Показать: '+PRODUCTS[id].name);const dot=document.createElement('i');dot.setAttribute('aria-hidden','true');button.append(dot);$('#pagination').append(button);});}
 $('#pagination').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-current',String(i===state.cardIndex)));
 onboarding.setVisible(!state.coachSeen&&view==='main');
 clearTimeout(announcementTimer);announcementTimer=setTimeout(()=>{$('#announcement').textContent=PRIORITIES[state.row]+'. '+ACCESS[state.col]+'. '+ids.map(id=>PRODUCTS[id].name).join(', ');},150);
}
function showView(next){
 view=next;$('#main-view').hidden=view!=='main';$('#install-view').hidden=view!=='install';$('#back').setAttribute('aria-label',view==='install'?'Назад':'Сбросить выбор');
 if(view==='main')renderChoice();
 else onboarding.setVisible(false);
 const panel=$('#'+view+'-view');if(!matchMedia('(prefers-reduced-motion:reduce)').matches)panel.animate([{opacity:.45},{opacity:1}],{duration:160});
}
$('#pagination').addEventListener('click',e=>{const button=e.target.closest('[data-page]');if(!button)return;state.cardIndex=Number(button.dataset.page);renderChoice();persist();});
$('#close-coach').addEventListener('click',()=>{dismissCoach();$('#selector-thumb').focus({preventScroll:true});});
$('#back').addEventListener('click',()=>{if(!$('#sheet-mask').hidden){closeSheet();return;}if(view==='install'){if(!guide.previous()){writeSession(SKIP_KEY,true);showView('main');}return;}state.row=1;state.col=1;state.cardIndex=0;renderChoice();persist();});
$('#help').addEventListener('click',openHelp);
let swipe=null;$('#hero').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;swipe={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}});
$('#hero').addEventListener('pointerup',e=>{if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)&&matches(state.row,state.col).length>1){state.cardIndex=dx<0?1:0;renderChoice();persist();}});$('#hero').addEventListener('pointercancel',()=>swipe=null);
function openSheet(title){
 sheetReturnFocus=document.activeElement;$('#sheet-title').textContent=title;$('#sheet-content').replaceChildren();$('#sheet-mask').hidden=false;$('#screens').inert=true;$('#navbar').inert=true;$('#system-status').inert=true;$('#sheet').scrollTop=0;$('#sheet-close').focus({preventScroll:true});
}
function closeSheet(){if($('#sheet-mask').hidden)return;$('#sheet-mask').hidden=true;sheetKey=null;$('#screens').inert=false;$('#navbar').inert=false;$('#system-status').inert=false;sheetReturnFocus?.focus({preventScroll:true});}
function paragraph(text,cls=''){const p=document.createElement('p');p.textContent=text;p.className=cls;$('#sheet-content').append(p);}
function sheetButton(text,callback,primary=false){const button=document.createElement('button');button.className=primary?'primary-button':'text-button';button.textContent=text;button.addEventListener('click',callback);$('#sheet-content').append(button);}
function openProduct(id){const product=PRODUCTS[id];openSheet(product.name);sheetKey=id;paragraph(product.terms,'terms');paragraph('Демонстрационные условия из макета. Оформление продукта в этом прототипе не выполняется.');sheetButton('Понятно',closeSheet,true);}
function openHelp(){openSheet('Как работает подбор');sheetKey='help';paragraph('Двигайте ползунок по двум шкалам: приоритет доходности и доступность денег. Можно нажать на точку или перетащить кружок.');paragraph('Сверху появятся один или два продукта. Переключайте их точками под карточкой или свайпом.');sheetButton('Показать подсказку на поле',()=>{closeSheet();state.coachSeen=false;showView('main');persist();},true);if(standalone())paragraph('Подборщик уже открыт как приложение, без панелей Safari.');else sheetButton('Как открыть на весь экран',()=>{closeSheet();guide.setStep(0);showView('install');});}
$('#sheet-close').addEventListener('click',closeSheet);$('#sheet-mask').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSheet();});
document.addEventListener('pointerdown',()=>document.documentElement.classList.remove('keyboard'),{capture:true});
document.addEventListener('keydown',e=>{
 document.documentElement.classList.add('keyboard');
 if(e.key==='Escape'){if(!$('#sheet-mask').hidden)closeSheet();else dismissCoach();}
 if(e.key==='Tab'&&!$('#sheet-mask').hidden){const buttons=[...$('#sheet').querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
for(const query of [standaloneQuery,fullscreenQuery])query.addEventListener('change',()=>{if(standalone())showView('main');});
window.pickerSnapshot=()=>({risk:1-state.row/2,access:state.col/2,row:state.row,col:state.col,cardIndex:state.cardIndex,coachSeen:state.coachSeen,guideStep:state.guideStep,scrollTop:document.scrollingElement?.scrollTop||0,guideScroll:$('#install-view .install-body').scrollTop,openDetails:[],sheetProduct:sheetKey,sheetScroll:$('#sheet').scrollTop,view});
window.restorePicker=saved=>{if(!saved)return;closeSheet();Object.assign(state,normalizeState(saved));guide.setStep(state.guideStep);showView(saved.view==='install'&&!standalone()?'install':'main');if(saved.sheetProduct==='help')openHelp();else if(PRODUCTS[saved.sheetProduct])openProduct(saved.sheetProduct);$('#sheet').scrollTop=saved.sheetScroll||0;$('#install-view .install-body').scrollTop=saved.guideScroll||0;requestAnimationFrame(()=>window.scrollTo(0,saved.scrollTop||0));persist();};
showView(view);
if('serviceWorker'in navigator&&location.pathname.startsWith('/product-picker/app/')&&window.top===window){addEventListener('load',()=>{navigator.serviceWorker.register('/product-picker/sw.js',{scope:'/product-picker/'}).catch(()=>{});},{once:true});}
