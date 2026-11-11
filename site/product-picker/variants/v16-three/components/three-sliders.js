import {TICKS,LEVEL_NAMES,changeLevel,pointToLevel,normalizeState} from '../model.js?v=natural-spacing-20261111';
export class ThreeSliders{
 constructor(section,{state,onChange}){
  this.state=normalizeState(state);this.onChange=onChange;this.pointer=null;
  this.controls=[...section.querySelectorAll('[role="slider"]')];
  this.controls.forEach(element=>{
   element.addEventListener('pointerdown',e=>this.start(element,e));element.addEventListener('pointermove',e=>this.move(element,e));
   for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>this.end(element,e));
   element.addEventListener('keydown',e=>this.key(element,e));
  });
  this.observer=new ResizeObserver(()=>this.controls.forEach(element=>element.style.setProperty('--rail-scale',element.clientWidth/343||1)));this.controls.forEach(element=>this.observer.observe(element));
  this.setState(this.state);
 }
 setState(state){this.state=normalizeState(state);this.controls.forEach(element=>{const value=this.state[element.dataset.axis];element.querySelector('.range-fill').style.width=(TICKS[value]+25)+'px';element.setAttribute('aria-valuenow',value);element.setAttribute('aria-valuetext',LEVEL_NAMES[value]);});}
 choose(element,value){const axis=element.dataset.axis;if(this.state[axis]===value)return;const result=changeLevel(this.state,axis,value);this.setState(result.state);this.onChange(result.state,result.adjusted);}
 apply(element,x){const rect=element.getBoundingClientRect();this.choose(element,pointToLevel((x-rect.left)*343/rect.width));}
 start(element,e){if(this.pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();this.pointer=e.pointerId;element.classList.add('dragging');element.focus({preventScroll:true});try{element.setPointerCapture(e.pointerId);}catch{}this.apply(element,e.clientX);}
 move(element,e){if(this.pointer!==e.pointerId)return;e.preventDefault();this.apply(element,e.clientX);}
 end(element,e){if(this.pointer!==e.pointerId)return;if(e.type==='pointerup')this.apply(element,e.clientX);this.pointer=null;element.classList.remove('dragging');try{if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);}catch{}}
 key(element,e){const value=this.state[element.dataset.axis];let next;if(['ArrowRight','ArrowUp'].includes(e.key))next=value+1;else if(['ArrowLeft','ArrowDown'].includes(e.key))next=value-1;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();this.choose(element,Math.max(0,Math.min(2,next)));}
}
