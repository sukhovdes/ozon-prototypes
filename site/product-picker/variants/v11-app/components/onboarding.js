export class Onboarding{
 constructor(screen){
  this.screen=screen;this.coach=screen.querySelector('#coach');this.products=screen.querySelector('.product-region');this.shell=screen.closest('#shell');this.visible=null;this.frame=0;
  this.coach.hidden=false;
  this.observer=new ResizeObserver(()=>this.measure());this.observer.observe(screen);
 }
 measure(){if(!this.visible)return;const field=this.screen.querySelector('.selector-section').getBoundingClientRect(),shell=this.shell.getBoundingClientRect();this.shell.style.setProperty('--onboarding-cutout-top',(field.top-shell.top)+'px');this.shell.style.setProperty('--onboarding-cutout-height',Math.max(field.height,shell.bottom-field.top)+'px');}
 setVisible(visible){
  if(this.visible===visible)return;
  this.visible=visible;cancelAnimationFrame(this.frame);
  // Safari also samples the page background outside the content viewport.
  document.documentElement.classList.toggle('picker-onboarding',visible);
  document.querySelector('meta[name="theme-color"]').setAttribute('content',visible?'#c3c4c5':'#ffffff');
  this.products.inert=visible;this.coach.inert=!visible;this.coach.setAttribute('aria-hidden',String(!visible));
  if(!visible){this.screen.classList.remove('onboarding-active');this.shell.classList.remove('onboarding-active');return;}
  this.measure();
  // Let the newly opened screen paint before starting the entrance transition.
  this.frame=requestAnimationFrame(()=>{this.frame=requestAnimationFrame(()=>{this.screen.classList.add('onboarding-active');this.shell.classList.add('onboarding-active');});});
 }
}
