export class Onboarding{
 constructor(screen){
  this.screen=screen;this.coach=screen.querySelector('#coach');this.products=screen.querySelector('.product-region');this.visible=null;this.frame=0;
  this.coach.hidden=false;
 }
 setVisible(visible){
  if(this.visible===visible)return;
  this.visible=visible;cancelAnimationFrame(this.frame);
  this.products.inert=visible;this.coach.inert=!visible;this.coach.setAttribute('aria-hidden',String(!visible));
  if(!visible){this.screen.classList.remove('onboarding-active');return;}
  // Let the newly opened screen paint before starting the entrance transition.
  this.frame=requestAnimationFrame(()=>{this.frame=requestAnimationFrame(()=>{this.screen.classList.add('onboarding-active');});});
 }
}
