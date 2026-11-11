import {clamp,normalizeState} from '../core.js?v=tops-cta-20261111';
import {PRIORITIES,ACCESS} from '../data.js?v=tops-cta-20261111';

// Native geometry from Figma 273:1656–1658 (343 × 60 rail).
const WIDTH=343,MIN_FILL=60,TRAVEL=WIDTH-MIN_FILL,GRIP_INSET=25.95;
export const DEFAULT_PROGRESS=(163.95-MIN_FILL)/TRAVEL;
export function restoredSliderValues(saved){
 const expected=normalizeState(saved);
 let risk=Number.isFinite(saved.sliderRisk)?clamp(saved.sliderRisk):1-expected.row/2;
 let access=Number.isFinite(saved.sliderAccess)?clamp(saved.sliderAccess):expected.col/2;
 // History merges snapshots. A point changed in the 3×3 variant wins over stale fractions.
 if((Number.isFinite(saved.risk)||Number.isInteger(saved.row))&&Math.round((1-risk)*2)!==expected.row)risk=1-expected.row/2;
 if((Number.isFinite(saved.access)||Number.isInteger(saved.col))&&Math.round(access*2)!==expected.col)access=expected.col/2;
 return {risk,access};
}
export class TwoSliders{
 constructor(section,{onSelect,onValue,onCommit}){
  this.section=section;this.onSelect=onSelect;this.onValue=onValue;this.onCommit=onCommit;this.row=1;this.col=1;
  this.controls=[...section.querySelectorAll('[role="slider"]')].map((element,index)=>{
   const control={element,index,value:DEFAULT_PROGRESS,pointer:null,frame:0};
   element.addEventListener('pointerdown',e=>this.start(control,e));
   element.addEventListener('pointermove',e=>this.move(control,e));
   for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>this.end(control,e));
   element.addEventListener('keydown',e=>this.key(control,e));
   return control;
  });
  this.observer=new ResizeObserver(()=>this.controls.forEach(control=>this.scale(control)));this.controls.forEach(control=>this.observer.observe(control.element));
  this.restore({sliderRisk:DEFAULT_PROGRESS,sliderAccess:DEFAULT_PROGRESS});
 }
 scale(control){control.element.style.setProperty('--rail-scale',Math.min(1,control.element.clientWidth/WIDTH));}
 paint(control){
  control.element.querySelector('.range-fill').style.width=(MIN_FILL+TRAVEL*control.value)+'px';
  const value=Math.round(control.value*100);control.element.setAttribute('aria-valuenow',value);
  control.element.setAttribute('aria-valuetext',control.index===0?PRIORITIES[Math.round((1-control.value)*2)]:ACCESS[Math.round(control.value*2)]);
 }
 publish(){
  const risk=this.controls[0].value,access=this.controls[1].value,row=Math.round((1-risk)*2),col=Math.round(access*2);
  this.onValue(risk,access);
  if(row!==this.row||col!==this.col){this.row=row;this.col=col;this.onSelect(row,col);}
 }
 setCell(row,col){
  if(row===this.row&&col===this.col)return;
  this.row=row;this.col=col;this.controls[0].value=1-row/2;this.controls[1].value=col/2;this.controls.forEach(control=>this.paint(control));
  this.onValue(this.controls[0].value,this.controls[1].value);
 }
 restore(saved){
  const {risk,access}=restoredSliderValues(saved);
  this.controls[0].value=risk;this.controls[1].value=access;this.row=Math.round((1-risk)*2);this.col=Math.round(access*2);
  this.controls.forEach(control=>{this.scale(control);this.paint(control);});this.onValue(risk,access);
 }
 snapshot(){return {sliderRisk:this.controls[0].value,sliderAccess:this.controls[1].value};}
 apply(control,x){const bounds=control.element.getBoundingClientRect(),scale=bounds.width/WIDTH;control.value=clamp(((x-bounds.left)/scale-(MIN_FILL-GRIP_INSET))/TRAVEL);this.paint(control);this.publish();}
 start(control,e){
  if(control.pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();
  control.pointer=e.pointerId;control.element.classList.add('dragging');control.element.focus({preventScroll:true});
  try{control.element.setPointerCapture(e.pointerId);}catch{}
  this.apply(control,e.clientX);
 }
 move(control,e){if(control.pointer!==e.pointerId)return;e.preventDefault();control.x=e.clientX;if(!control.frame)control.frame=requestAnimationFrame(()=>{control.frame=0;if(control.pointer!==null)this.apply(control,control.x);});}
 end(control,e){
  if(control.pointer!==e.pointerId)return;cancelAnimationFrame(control.frame);control.frame=0;
  if(e.type==='pointerup')this.apply(control,e.clientX);control.pointer=null;control.element.classList.remove('dragging');
  try{if(control.element.hasPointerCapture(e.pointerId))control.element.releasePointerCapture(e.pointerId);}catch{}
  this.onCommit();
 }
 key(control,e){
  let next;if(['ArrowRight','ArrowUp'].includes(e.key))next=(Math.round(control.value*3)+1)/3;
  else if(['ArrowLeft','ArrowDown'].includes(e.key))next=(Math.round(control.value*3)-1)/3;
  else if(e.key==='Home')next=0;else if(e.key==='End')next=1;else return;
  e.preventDefault();control.value=clamp(next);this.paint(control);this.publish();this.onCommit();
 }
}
