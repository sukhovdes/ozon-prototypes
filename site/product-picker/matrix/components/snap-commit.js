// A new drag or restored state invalidates any selection still waiting for its snap.
export class SnapCommit{
 constructor(commit){this.commit=commit;this.revision=0;}
 cancel(){this.revision++;}
 async select(position,arrival){
  const revision=++this.revision;
  try{await arrival;}catch{return false;}
  if(revision!==this.revision)return false;
  this.commit(position);return true;
 }
}
