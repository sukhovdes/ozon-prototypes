import {PRODUCTS} from '../data.js?v=products-20261111';
export class ProductCard{
 constructor(element,onOpen){
  this.element=element;this.views=new Map();this.active=null;this.button=element.querySelector('#product-action');this.animation=null;
  const template=document.querySelector('#product-template');
  for(const product of Object.values(PRODUCTS)){
   const view=template.content.firstElementChild.cloneNode(true),image=view.querySelector('img');view.dataset.product=product.id;view.inert=true;
   view.querySelector('h2').textContent=product.name;view.querySelector('p').textContent=product.terms;view.querySelector('p').style.opacity=product.termsMuted?'.4':'1';
   if(product.crop){const [left,top,size]=product.crop;image.style.cssText='left:'+left+'%;top:'+top+'%;width:'+size+'%;height:'+size+'%';}else view.querySelector('.product-art').classList.add('whole');
   image.addEventListener('load',()=>image.classList.add('loaded'));element.append(view);this.views.set(product.id,{view,image,timer:null});
  }
  this.button.addEventListener('click',()=>onOpen(this.button.dataset.product));
 }
 show(product){
  if(this.active===product.id)return;
  const first=this.active===null;this.active=product.id;const next=this.views.get(product.id);
  for(const [id,entry]of this.views){
   clearTimeout(entry.timer);entry.view.inert=id!==product.id;entry.view.setAttribute('aria-hidden',String(id!==product.id));
   if(id!==product.id){entry.view.style.opacity='0';entry.timer=setTimeout(()=>{if(this.active!==id)entry.view.hidden=true;},260);}
  }
  next.view.hidden=false;if(!next.image.getAttribute('src'))next.image.src=product.image;
  if(first)next.view.style.transition='none';void next.view.offsetWidth;next.view.style.opacity='1';if(first)requestAnimationFrame(()=>next.view.style.removeProperty('transition'));
  this.button.dataset.product=product.id;this.button.setAttribute('aria-label',product.action+': '+product.name);
  if(this.button.textContent!==product.action){this.animation?.cancel();this.button.textContent=product.action;this.button.classList.toggle('invest',product.id==='cfa');if(!first&&!matchMedia('(prefers-reduced-motion:reduce)').matches)this.animation=this.button.animate([{opacity:.4},{opacity:1}],{duration:180});}
  this.element.dataset.product=product.id;
 }
}
