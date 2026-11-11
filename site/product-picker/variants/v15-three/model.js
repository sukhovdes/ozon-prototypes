export const AXES=['income','reliability','withdrawal'];
export const TITLES={income:'Доходность',reliability:'Надежность',withdrawal:'Доступность денег к выводу'};
export const TICKS=[25,122.667,220.333,318];
export const DEFAULT_LEVELS={income:1,reliability:2,withdrawal:1};
const level=(value,fallback)=>Number.isFinite(value)?Math.max(0,Math.min(3,Math.round(value))):fallback;
export function normalizeState(input={}){
 const state={...DEFAULT_LEVELS,touched:AXES.map((_,i)=>Math.max(0,Math.floor(Number(input.touched?.[i])||0))),cardIndex:input.cardIndex===1?1:0,guideStep:Math.max(0,Math.min(2,Math.round(input.guideStep||0)))};
 AXES.forEach(axis=>state[axis]=level(input[axis],DEFAULT_LEVELS[axis]));
 // Preserve precise four-step positions unless a different legacy 3×3 point was selected.
 if(Number.isFinite(input.risk)&&(!Number.isFinite(input.income)||Math.round(state.income/3*2)!==Math.round(input.risk*2)))state.income=level(input.risk*3,1);
 if(Number.isFinite(input.access)&&(!Number.isFinite(input.withdrawal)||Math.round((1-state.withdrawal/3)*2)!==Math.round(input.access*2)))state.withdrawal=level((1-input.access)*3,1);
 if(AXES.every(axis=>state[axis]===3)){const oldest=AXES.reduce((a,b)=>state.touched[AXES.indexOf(a)]<=state.touched[AXES.indexOf(b)]?a:b);state[oldest]=2;}
 return state;
}
export function changeLevel(input,axis,target){
 if(!AXES.includes(axis))throw new Error('Unknown slider');
 const state=normalizeState(input);state[axis]=level(target,state[axis]);state.touched[AXES.indexOf(axis)]=Math.max(...state.touched)+1;
 let adjusted=null;
 if(AXES.every(key=>state[key]===3)){
  adjusted=AXES.filter(key=>key!==axis).reduce((a,b)=>state.touched[AXES.indexOf(a)]<=state.touched[AXES.indexOf(b)]?a:b);
  state[adjusted]=2;
 }
 return {state,adjusted};
}
export function pointToLevel(nativeX){return Math.max(0,Math.min(3,Math.round((nativeX-TICKS[0])/(TICKS[3]-TICKS[0])*3)));}
