/** Device-local idle clock for the product center and Content Lab.
 * This is a convenience timeout, not a substitute for Supabase auth and RLS.
 */
export const IDLE_LIMIT_MS=24*60*60*1000;
export const PRODUCT_ACTIVITY_PREFIX='tle-product-last-activity-v1:';
export function inactiveSince(last:number|null,now=Date.now()):boolean{
 return last!==null&&(!Number.isFinite(last)||last>now+120000||now-last>=IDLE_LIMIT_MS);
}
export function lastActivity(userId:string):number|null{
 try{
  const raw=localStorage.getItem(PRODUCT_ACTIVITY_PREFIX+userId);
  if(raw===null)return null;
  return Number(raw);
 }catch{return null;}
}
export function hasExpiredActivity(userId:string,now=Date.now()):boolean{
 return inactiveSince(lastActivity(userId),now);
}
export function recordActivity(userId:string,now=Date.now()):void{
 try{localStorage.setItem(PRODUCT_ACTIVITY_PREFIX+userId,String(now));}
 catch{/* Browser storage blocked: Supabase still owns access decisions. */}
}
export function clearActivity(userId:string):void{
 try{localStorage.removeItem(PRODUCT_ACTIVITY_PREFIX+userId)}catch{}
}
