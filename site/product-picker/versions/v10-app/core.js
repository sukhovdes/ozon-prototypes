import {MATRIX,PRODUCTS} from './data.js';
export const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
export function cellFromPoint(x,y){return {row:Math.min(2,Math.floor(clamp(y)*3)),col:Math.min(2,Math.floor(clamp(x)*3))};}
export function cellCenter(row,col){return {x:(clamp(col,0,2)+.5)/3,y:(clamp(row,0,2)+.5)/3};}
export function matches(row,col){return MATRIX[Math.round(clamp(row,0,2))][Math.round(clamp(col,0,2))];}
export function normalizeState(input={}){
 const row=Number.isInteger(input.row)?Math.round(clamp(input.row,0,2)):Number.isFinite(input.risk)?Math.round((1-clamp(input.risk))*2):1;
 const col=Number.isInteger(input.col)?Math.round(clamp(input.col,0,2)):Number.isFinite(input.access)?Math.round(clamp(input.access)*2):1;
 return {row,col,cardIndex:Math.round(clamp(input.cardIndex,0,matches(row,col).length-1)),coachSeen:input.coachSeen===true,guideStep:Math.round(clamp(input.guideStep,0,2))};
}
export function selectedProduct(state){return PRODUCTS[matches(state.row,state.col)[state.cardIndex]];}
export function needsInstallGuide({ios,standalone,skipped}){return Boolean(ios&&!standalone&&!skipped);}
export function readSession(key,fallback=null){try{return JSON.parse(sessionStorage.getItem(key))??fallback;}catch{return fallback;}}
export function writeSession(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}}
