const clamp=value=>Math.max(0,Math.min(2,Number.isFinite(value)?value:1));
export function labelStrengths(row,col){
 row=clamp(row);col=clamp(col);
 return {top:Math.max(0,1-row),bottom:Math.max(0,row-1),left:Math.max(0,1-col),right:Math.max(0,col-1)};
}
export function rateRange(terms){
 const match=String(terms).match(/(\d+(?:[.,]\d+)?)(?:\s*[–—-]\s*(\d+(?:[.,]\d+)?))?\s*%/u);
 if(!match)return null;
 const parse=value=>Number(value.replace(',','.'));
 return {low:parse(match[1]),high:parse(match[2]||match[1]),text:match[0],start:match.index,end:match.index+match[0].length};
}
export function rateChange(previous,next){
 if(!previous||!next)return null;
 if(next.low>previous.high)return 'up';
 if(next.high<previous.low)return 'down';
 return null;
}
