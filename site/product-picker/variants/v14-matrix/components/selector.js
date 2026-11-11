import {cellFromPoint,cellCenter,clamp} from '../core.js?v=snap-cta-20261111';
import {PRIORITIES,ACCESS} from '../data.js?v=snap-cta-20261111';
import {SnapCommit} from './snap-commit.js?v=snap-cta-20261111';
export class Selector{
 constructor(field,{onSelect,onInteract}){
  this.field=field;this.canvas=field.closest('.matrix-canvas');this.thumb=field.querySelector('.selector-thumb');this.onSelect=onSelect;this.onInteract=onInteract;this.row=1;this.col=1;this.pointer=null;this.frame=0;this.draft={row:1,col:1};this.snapTarget=null;
  this.snapCommit=new SnapCommit(({row,col})=>{this.row=row;this.col=col;this.snapTarget=null;this.paintCells();this.onSelect(row,col);});this.suppressClickUntil=0;
  const grid=field.querySelector('.selector-grid');
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const cell=document.createElement('button');cell.className='selector-cell';cell.dataset.row=row;cell.dataset.col=col;cell.tabIndex=-1;cell.setAttribute('aria-label',PRIORITIES[row]+', '+ACCESS[col]);cell.setAttribute('aria-pressed','false');
   grid.append(cell);
   cell.addEventListener('click',e=>{if(e.detail!==0||performance.now()<this.suppressClickUntil)return;this.onInteract();this.snapTo(row,col);});
  }
  field.addEventListener('pointerdown',e=>this.start(e));field.addEventListener('pointermove',e=>this.move(e));
  for(const name of ['pointerup','pointercancel','lostpointercapture'])field.addEventListener(name,e=>this.end(e));
  this.thumb.addEventListener('keydown',e=>this.key(e));
  this.observer=new ResizeObserver(()=>{if(this.pointer!==null){this.bounds=field.getBoundingClientRect();return;}this.setCell(this.row,this.col);});this.observer.observe(field);
  this.setCell(1,1);
 }
 setCell(row,col){this.snapCommit.cancel();this.snapTarget=null;this.row=row;this.col=col;this.paintCells();if(this.pointer===null){this.thumb.style.transition='none';this.paintCenter();void this.thumb.offsetWidth;this.thumb.style.removeProperty('transition');}}
 paintCells(){
  this.field.querySelectorAll('.selector-cell').forEach(cell=>cell.setAttribute('aria-pressed',String(Number(cell.dataset.row)===this.row&&Number(cell.dataset.col)===this.col)));
  this.thumb.setAttribute('aria-label','Выбранная ячейка: '+PRIORITIES[this.row]+', '+ACCESS[this.col]+'. Перемещайте стрелками.');
 }
 paintCenter(row=this.row,col=this.col){const {x,y}=cellCenter(row,col);this.paint(x,y);}
 snapTo(row,col){
  const before=this.thumb.getBoundingClientRect(),bounds=this.field.getBoundingClientRect(),target=cellCenter(row,col);
  const moving=Math.hypot(before.left+before.width/2-bounds.left-target.x*bounds.width,before.top+before.height/2-bounds.top-target.y*bounds.height)>.5;
  this.snapTarget={row,col};this.paintCenter(row,col);
  // Flush the target style so CSS has created the transform transition.
  const style=getComputedStyle(this.thumb);void style.transform;
  const motions=(this.thumb.getAnimations?.()||[]).filter(animation=>animation.transitionProperty==='transform');
  const milliseconds=value=>Math.max(...value.split(',').map(time=>parseFloat(time)*(time.trim().endsWith('ms')?1:1000)))||0;
  const duration=milliseconds(style.transitionDuration)+milliseconds(style.transitionDelay);
  // Some browsers expose CSS transitions only on the following frame.
  const settled=motions.length?Promise.allSettled(motions.map(animation=>animation.finished)):moving&&duration?new Promise(resolve=>setTimeout(resolve,duration)):Promise.resolve();
  const arrival=settled.then(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
  return this.snapCommit.select({row,col},arrival);
 }
 paint(x,y){
  const width=this.field.clientWidth,height=this.field.clientHeight;
  this.thumb.style.transform='translate3d('+(x*width-24)+'px,'+(y*height-24)+'px,0)';
  const cx=this.field.offsetLeft-width/2+x*width,cy=this.field.offsetTop-height/2+y*height;
  this.canvas.style.setProperty('--glow-x',cx+'px');this.canvas.style.setProperty('--glow-y',cy+'px');
  // The second source SVG is rotated 90° around its native centre (187.5, 203).
  this.canvas.style.setProperty('--glow-v-x',(cy-15.5)+'px');this.canvas.style.setProperty('--glow-v-y',(390.5-cx)+'px');
 }
 applyPoint(point){
  const x=clamp((point.x-this.bounds.left)/this.bounds.width),y=clamp((point.y-this.bounds.top)/this.bounds.height);
  this.paint(clamp(x,1/6,5/6),clamp(y,1/6,5/6));this.draft=cellFromPoint(x,y);
 }
 start(e){
  if(this.pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();this.snapCommit.cancel();this.snapTarget=null;this.onInteract();this.pointer=e.pointerId;this.bounds=this.field.getBoundingClientRect();this.field.classList.add('dragging');this.canvas.classList.add('is-dragging');
  try{this.field.setPointerCapture(e.pointerId);}catch{}
  this.thumb.focus({preventScroll:true});this.applyPoint({x:e.clientX,y:e.clientY});
 }
 move(e){if(this.pointer!==e.pointerId)return;e.preventDefault();this.pending={x:e.clientX,y:e.clientY};if(!this.frame)this.frame=requestAnimationFrame(()=>{this.frame=0;if(this.pointer!==null&&this.pending)this.applyPoint(this.pending);});}
 end(e){
  if(this.pointer!==e.pointerId)return;
  cancelAnimationFrame(this.frame);this.frame=0;
  if(e.type==='pointerup')this.applyPoint({x:e.clientX,y:e.clientY});
  void this.thumb.offsetWidth;
  const target=e.type==='pointerup'?this.draft:{row:this.row,col:this.col};this.suppressClickUntil=performance.now()+500;
  this.pointer=null;this.pending=null;this.field.classList.remove('dragging');this.canvas.classList.remove('is-dragging');this.snapTo(target.row,target.col);
  try{if(this.field.hasPointerCapture(e.pointerId))this.field.releasePointerCapture(e.pointerId);}catch{}
 }
 key(e){
  let {row,col}=this.snapTarget||this;
  if(e.key==='ArrowUp')row--;else if(e.key==='ArrowDown')row++;else if(e.key==='ArrowLeft')col--;else if(e.key==='ArrowRight')col++;
  else if(/^[1-9]$/.test(e.key)){const n=Number(e.key)-1;row=Math.floor(n/3);col=n%3;}
  else if(e.key==='Home'){row=0;col=0;}else if(e.key==='End'){row=2;col=2;}else return;
  e.preventDefault();this.onInteract();row=Math.round(clamp(row,0,2));col=Math.round(clamp(col,0,2));this.snapTo(row,col);
 }
}
