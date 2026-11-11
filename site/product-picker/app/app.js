import {PRODUCTS,ASSETS,PRIORITIES,ACCESS} from './data.js?v=products-20261111';
import {normalizeState,matches,selectedProduct,needsInstallGuide,readSession,writeSession} from './core.js?v=products-20261111';
import {Selector} from './components/selector.js?v=products-20261111';
import {ProductCard} from './components/product-card.js?v=products-20261111';
import {InstallGuide} from './components/install-guide.js?v=products-20261111';
import {Onboarding} from './components/onboarding.js?v=products-20261111';
import {TwoSliders,DEFAULT_PROGRESS} from './components/two-sliders.js?v=products-20261111';
const $=s=>document.querySelector(s),slidersMode=$('#shell').dataset.picker==='sliders',STATE_KEY=slidersMode?'ozon-picker-sliders-v1':'ozon-picker-webapp-v2',SKIP_KEY='ozon-picker-webapp-install-skip';
const rememberedState=readSession(STATE_KEY,{}),state=normalizeState(rememberedState);
for(const key of ['sliderRisk','sliderAccess'])if(Number.isFinite(rememberedState[key]))state[key]=rememberedState[key];
const TRANSITION_KEY='ozon-picker-variant-transition',transition=readSession(TRANSITION_KEY);
try{sessionStorage.removeItem(TRANSITION_KEY);}catch{}
// Each app launch starts with the coach; navigating within the app keeps it dismissed.
state.coachSeen=slidersMode;
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Mac/.test(navigator.platform)&&navigator.maxTouchPoints>1);
const standaloneQuery=matchMedia('(display-mode:standalone)'),fullscreenQuery=matchMedia('(display-mode:fullscreen)');
const standalone=()=>navigator.standalone===true||standaloneQuery.matches||fullscreenQuery.matches;
let view=needsInstallGuide({ios,standalone:standalone(),skipped:readSession(SKIP_KEY,false)})?'install':'main';
let sheetReturnFocus=null,sheetKey=null,announcementTimer,pagerSignature='';
const persist=()=>writeSession(STATE_KEY,state);
const card=new ProductCard($('#product-card'),openProduct);
const onboarding=slidersMode?{setVisible(){}}:new Onboarding($('#main-view'));
function dismissCoach(){if(state.coachSeen)return;state.coachSeen=true;onboarding.setVisible(false);persist();}
const onSelect=(row,col)=>{if(state.row===row&&state.col===col)return;state.row=row;state.col=col;state.cardIndex=0;renderChoice();persist();};
const selector=slidersMode?new TwoSliders($('#slider-section'),{onSelect,onValue:(risk,access)=>{state.sliderRisk=risk;state.sliderAccess=access;},onCommit:persist}):new Selector($('#selector-field'),{onSelect,onInteract:dismissCoach});
if(slidersMode){const saved=readSession(STATE_KEY,{});selector.restore({sliderRisk:saved.sliderRisk??DEFAULT_PROGRESS,sliderAccess:saved.sliderAccess??DEFAULT_PROGRESS});}
// The temporary demo catalogue is shared; this alternative starts with the pair shown in Figma.
const currentIds=()=>slidersMode&&state.row===1&&state.col===1?['deposit','savings']:matches(state.row,state.col);
const savedStep=state.guideStep;
const guide=new InstallGuide($('#install-view'),{onSkip:()=>{writeSession(SKIP_KEY,true);showView('main');},onStep:step=>{state.guideStep=step;persist();}});guide.setStep(savedStep);
function renderChoice(){
 const ids=currentIds();state.cardIndex=Math.min(state.cardIndex,ids.length-1);const product=PRODUCTS[ids[state.cardIndex]];card.show(product);selector.setCell(state.row,state.col);
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
$('#close-coach')?.addEventListener('click',()=>{dismissCoach();$('#selector-thumb').focus({preventScroll:true});});
$('#back').addEventListener('click',()=>{if(!$('#sheet-mask').hidden){closeSheet();return;}if(view==='install'){if(!guide.previous()){writeSession(SKIP_KEY,true);showView('main');}return;}state.row=1;state.col=1;state.cardIndex=0;if(slidersMode)selector.restore({sliderRisk:DEFAULT_PROGRESS,sliderAccess:DEFAULT_PROGRESS});renderChoice();persist();});
$('#help').addEventListener('click',openHelp);
let swipe=null;$('#hero').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;swipe={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}});
$('#hero').addEventListener('pointerup',e=>{if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)&&currentIds().length>1){state.cardIndex=dx<0?1:0;renderChoice();persist();}});$('#hero').addEventListener('pointercancel',()=>swipe=null);
function openSheet(title){
 sheetReturnFocus=document.activeElement;$('#sheet-title').textContent=title;$('#sheet-content').replaceChildren();$('#sheet-mask').hidden=false;$('#screens').inert=true;$('#navbar').inert=true;$('#system-status').inert=true;$('#sheet').scrollTop=0;$('#sheet-close').focus({preventScroll:true});
}
function closeSheet(){if($('#sheet-mask').hidden)return;$('#sheet-mask').hidden=true;sheetKey=null;$('#screens').inert=false;$('#navbar').inert=false;$('#system-status').inert=false;sheetReturnFocus?.focus({preventScroll:true});}
function paragraph(text,cls=''){const p=document.createElement('p');p.textContent=text;p.className=cls;$('#sheet-content').append(p);}
function sheetButton(text,callback,primary=false){const button=document.createElement('button');button.className=primary?'primary-button':'text-button';button.textContent=text;button.addEventListener('click',callback);$('#sheet-content').append(button);}
function openProduct(id){const product=PRODUCTS[id];openSheet(product.name);sheetKey=id;paragraph(product.terms,'terms');paragraph('Демонстрационные условия из макета. Оформление продукта в этом прототипе не выполняется.');sheetButton('Понятно',closeSheet,true);}
function switchVariant(target){
 closeSheet();
 try{if(window.top!==window&&typeof window.parent.selectVersion==='function'){window.parent.selectVersion(target==='sliders'?'v12':'v11');return;}}catch{}
 writeSession(TRANSITION_KEY,{target,snapshot:{...window.pickerSnapshot(),view:'main',sheetProduct:null,coachSeen:true}});
 location.assign('/product-picker/app/'+(target==='sliders'?'':'grid.html'));
}
function openHelp(){openSheet('Как работает подбор');sheetKey='help';paragraph(slidersMode?'Передвигайте два ползунка: доходность и доступность денег. Можно нажать на шкалу или использовать стрелки клавиатуры.':'Двигайте ползунок по двум шкалам: приоритет доходности и доступность денег. Можно нажать на точку или перетащить кружок.');paragraph('Сверху появятся один или два продукта. Переключайте их точками под карточкой или свайпом.');sheetButton(slidersMode?'Переключить на поле 3×3':'Переключить на две шкалы',()=>switchVariant(slidersMode?'grid':'sliders'));if(!slidersMode)sheetButton('Показать подсказку на поле',()=>{closeSheet();state.coachSeen=false;showView('main');persist();},true);if(standalone())paragraph('Подборщик уже открыт как приложение, без панелей Safari.');else sheetButton('Как открыть на весь экран',()=>{closeSheet();guide.setStep(0);showView('install');});}
$('#sheet-close').addEventListener('click',closeSheet);$('#sheet-mask').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSheet();});
document.addEventListener('pointerdown',()=>document.documentElement.classList.remove('keyboard'),{capture:true});
document.addEventListener('keydown',e=>{
 document.documentElement.classList.add('keyboard');
 if(e.key==='Escape'){if(!$('#sheet-mask').hidden)closeSheet();else dismissCoach();}
 if(e.key==='Tab'&&!$('#sheet-mask').hidden){const buttons=[...$('#sheet').querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
for(const query of [standaloneQuery,fullscreenQuery])query.addEventListener('change',()=>{if(standalone())showView('main');});
window.pickerSnapshot=()=>({risk:1-state.row/2,access:state.col/2,row:state.row,col:state.col,cardIndex:state.cardIndex,coachSeen:state.coachSeen,guideStep:state.guideStep,scrollTop:document.scrollingElement?.scrollTop||0,guideScroll:$('#install-view .install-body').scrollTop,openDetails:[],sheetProduct:sheetKey,sheetScroll:$('#sheet').scrollTop,view,sliderRisk:state.sliderRisk,sliderAccess:state.sliderAccess,...selector.snapshot?.()});
window.restorePicker=saved=>{if(!saved)return;closeSheet();Object.assign(state,normalizeState(saved));for(const key of ['sliderRisk','sliderAccess'])if(Number.isFinite(saved[key]))state[key]=saved[key];if(slidersMode){state.coachSeen=true;selector.restore(saved);}guide.setStep(state.guideStep);showView(saved.view==='install'&&!standalone()?'install':'main');if(saved.sheetProduct==='help')openHelp();else if(PRODUCTS[saved.sheetProduct])openProduct(saved.sheetProduct);$('#sheet').scrollTop=saved.sheetScroll||0;$('#install-view .install-body').scrollTop=saved.guideScroll||0;requestAnimationFrame(()=>window.scrollTo(0,saved.scrollTop||0));persist();};
showView(view);
if(transition?.target===(slidersMode?'sliders':'grid'))window.restorePicker(transition.snapshot);
if('serviceWorker'in navigator&&location.pathname.startsWith('/product-picker/app/')&&window.top===window){addEventListener('load',()=>{navigator.serviceWorker.register('/product-picker/sw.js',{scope:'/product-picker/'}).catch(()=>{});},{once:true});}
