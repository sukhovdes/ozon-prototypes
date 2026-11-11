export const AXES=['income','reliability','withdrawal'];
export const TITLES={income:'Доходность',reliability:'Надежность',withdrawal:'Доступность денег к выводу'};
export const TICKS=[25,171.5,318];
export const LEVEL_NAMES=['Минимум','Средне','Максимум'];
export const DEFAULT_LEVELS={income:1,reliability:1,withdrawal:1};
const level=(value,fallback=1)=>Number.isFinite(value)?Math.max(0,Math.min(2,Math.round(value))):fallback;
export function normalizeState(input={}){
 // Old four-stop sessions and history snapshots keep their relative positions.
 const legacy=input.levelsVersion!==2&&(Array.isArray(input.touched)||AXES.some(axis=>input[axis]>2));
 const convert=value=>level(legacy?value*2/3:value);
 const state={levelsVersion:2,...DEFAULT_LEVELS,cardIndex:input.cardIndex===1?1:0,guideStep:level(input.guideStep,0)};
 state.income=Number.isFinite(input.income)?convert(input.income):Number.isFinite(input.reliability)?2-convert(input.reliability):1;
 state.withdrawal=Number.isFinite(input.withdrawal)?convert(input.withdrawal):1;
 // The history shell carries the shared 3×3 point between different variants.
 if(Number.isFinite(input.risk))state.income=level(input.risk*2);
 if(Number.isFinite(input.access))state.withdrawal=level((1-input.access)*2);
 state.reliability=2-state.income;
 return state;
}
export function changeLevel(input,axis,target){
 if(!AXES.includes(axis))throw new Error('Unknown slider');
 const state=normalizeState(input);state[axis]=level(target,state[axis]);
 let adjusted=null;
 if(axis==='income'){state.reliability=2-state.income;adjusted='reliability';}
 if(axis==='reliability'){state.income=2-state.reliability;adjusted='income';}
 return {state,adjusted};
}
export function pointToLevel(nativeX){return level((nativeX-TICKS[0])/(TICKS[2]-TICKS[0])*2);}
