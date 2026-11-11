const afterPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export class IntroSequence{
 constructor({element,shouldShow,interfaceReady=Promise.resolve(),paint=afterPaint,delay=pause}){
  Object.assign(this,{element,shouldShow,interfaceReady,paint,delay});this.revision=0;this.current=null;this.pending=Promise.resolve();element.hidden=true;
 }
 request(cardReady){
  if(!this.shouldShow()){this.cancel();return this.pending;}
  if(this.current===cardReady)return this.pending;
  this.cancel();this.current=cardReady;const revision=this.revision;
  return this.pending=Promise.all([cardReady,this.interfaceReady]).then(async([ready])=>{
   if(ready===false||revision!==this.revision)return;
   await this.paint();
   // Give the completed interface a clear frame before introducing the hint.
   await this.delay(300);
   if(revision!==this.revision||!this.shouldShow())return;
   this.element.hidden=false;
   if(!globalThis.matchMedia?.('(prefers-reduced-motion:reduce)').matches)this.element.animate?.([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});
  });
 }
 cancel(){this.revision++;this.current=null;this.element.hidden=true;}
}
