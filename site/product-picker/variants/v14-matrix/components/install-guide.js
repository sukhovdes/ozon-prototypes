import {ASSETS} from '../data.js?v=products-20261111';
const STEPS=[
 {title:'Нажмите «Поделиться»',text:'Откройте меню Safari и выберите «Поделиться». В некоторых видах Safari эта кнопка находится на нижней панели.',icon:'install-share.svg'},
 {title:'Выберите «На экран Домой»',text:'Прокрутите список действий вниз. Нужный пункт называется «На экран Домой».',icon:'app-home.svg'},
 {title:'Добавьте иконку',text:'Включите «Открывать как веб-приложение», если есть переключатель, и нажмите «Добавить». Затем откройте подборщик с новой иконки.',icon:'app-home.svg'}
];
export class InstallGuide{
 constructor(element,{onSkip,onStep}){
  this.element=element;this.step=0;this.onSkip=onSkip;this.onStep=onStep;
  element.querySelectorAll('[data-install-step]').forEach(button=>button.addEventListener('click',()=>this.setStep(Number(button.dataset.installStep))));
  element.querySelector('#install-next').addEventListener('click',()=>{if(this.step<2)this.setStep(this.step+1);else this.onSkip();});
  element.querySelector('#install-skip').addEventListener('click',onSkip);
  this.setStep(0);
 }
 setStep(step){
  this.step=step;const item=STEPS[step];
  this.element.querySelectorAll('[data-install-step]').forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.installStep)===step)));
  this.element.querySelector('#install-step-title').textContent=item.title;this.element.querySelector('#install-step-text').textContent=item.text;
  this.element.querySelector('#install-step-icon').style.setProperty('--icon',"url('"+ASSETS+item.icon+"')");
  this.element.querySelector('#install-next').textContent=step<2?'Следующий шаг':'Пока продолжить в браузере';
  this.element.querySelector('#install-skip').hidden=step===2;
  this.onStep(step);
 }
 previous(){if(this.step>0){this.setStep(this.step-1);return true;}return false;}
}
