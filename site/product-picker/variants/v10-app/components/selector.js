import {cellFromPoint,cellCenter,clamp} from '../core.js';
import {PRIORITIES,ACCESS} from '../data.js';
export class Selector{
 constructor(field,{onSelect,onInteract}){
  this.field=field;this.thumb=field.querySelector('.selector-thumb');this.onSelect=onSelect;this.onInteract=onInteract;this.row=1;this.col=1;this.pointer=null;this.frame=0;
  const grid=field.querySelector('.selector-grid');
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const cell=document.createElement('button');cell.className='selector-cell';cell.dataset.row=row;cell.dataset.col=col;cell.tabIndex=-1;cell.setAttribute('aria-label',PRIORITIES[row]+', '+ACCESS[col]);cell.setAttribute('aria-pressed','false');
   const dot=document.createElement('span');dot.className='cell-dot';dot.setAttribute('aria-hidden','true');cell.append(dot);grid.append(cell);
   cell.addEventListener('click',()=>{this.onInteract();this.setCell(row,col);this.onSelect(row,col);});
  }
  field.addEventListener('pointerdown',e=>this.start(e));field.addEventListener('pointermove',e=>this.move(e));
  for(const name of ['pointerup','pointercancel','lostpointercapture'])field.addEventListener(name,e=>this.end(e));
  this.thumb.addEventListener('keydown',e=>this.key(e));
  this.observer=new ResizeObserver(()=>{if(this.pointer!==null)this.bounds=field.getBoundingClientRect();this.paintCenter();});this.observer.observe(field);
  this.setCell(1,1);
 }
 setCell(row,col){this.row=row;this.col=col;this.paintCells();if(this.pointer===null)this.paintCenter();}
 paintCells(){
  this.field.querySelectorAll('.selector-cell').forEach(cell=>cell.setAttribute('aria-pressed',String(Number(cell.dataset.row)===this.row&&Number(cell.dataset.col)===this.col)));
  this.thumb.setAttribute('aria-label','Выбранная ячейка: '+PRIORITIES[this.row]+', '+ACCESS[this.col]+'. Перемещайте стрелками.');
 }
 paintCenter(){const {x,y}=cellCenter(this.row,this.col);this.paint(x,y);}
 paint(x,y){const width=this.field.clientWidth,height=this.field.clientHeight;this.thumb.style.transform='translate3d('+(x*width-24)+'px,'+(y*height-24)+'px,0)';}
 applyPoint(point){
  const x=clamp((point.x-this.bounds.left)/this.bounds.width),y=clamp((point.y-this.bounds.top)/this.bounds.height);
  this.paint(clamp(x,1/6,5/6),clamp(y,1/6,5/6));const next=cellFromPoint(x,y);
  if(next.row!==this.row||next.col!==this.col){this.row=next.row;this.col=next.col;this.paintCells();this.onSelect(this.row,this.col);}
 }
 start(e){
  if(this.pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();this.onInteract();this.pointer=e.pointerId;this.bounds=this.field.getBoundingClientRect();this.field.classList.add('dragging');
  try{this.field.setPointerCapture(e.pointerId);}catch{}
  this.thumb.focus({preventScroll:true});this.applyPoint({x:e.clientX,y:e.clientY});
 }
 move(e){if(this.pointer!==e.pointerId)return;e.preventDefault();this.pending={x:e.clientX,y:e.clientY};if(!this.frame)this.frame=requestAnimationFrame(()=>{this.frame=0;if(this.pointer!==null&&this.pending)this.applyPoint(this.pending);});}
 end(e){
  if(this.pointer!==e.pointerId)return;
  cancelAnimationFrame(this.frame);this.frame=0;
  if(e.type==='pointerup')this.applyPoint({x:e.clientX,y:e.clientY});
  this.pointer=null;this.pending=null;this.field.classList.remove('dragging');this.paintCenter();
  try{if(this.field.hasPointerCapture(e.pointerId))this.field.releasePointerCapture(e.pointerId);}catch{}
 }
 key(e){
  let row=this.row,col=this.col;
  if(e.key==='ArrowUp')row--;else if(e.key==='ArrowDown')row++;else if(e.key==='ArrowLeft')col--;else if(e.key==='ArrowRight')col++;
  else if(/^[1-9]$/.test(e.key)){const n=Number(e.key)-1;row=Math.floor(n/3);col=n%3;}
  else if(e.key==='Home'){row=0;col=0;}else if(e.key==='End'){row=2;col=2;}else return;
  e.preventDefault();this.onInteract();row=Math.round(clamp(row,0,2));col=Math.round(clamp(col,0,2));this.setCell(row,col);this.onSelect(row,col);
 }
}
