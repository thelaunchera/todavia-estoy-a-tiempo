/** Two-hour, same-device navigation resume. Access controls always run first.
 * Keep only harmless navigation metadata; NEVER store credentials or tokens here.
 */
export const NAVIGATION_RESUME_MS = 2 * 60 * 60 * 1000;
export type NavigationPlace<View extends string,Context=unknown> = {
  view:View;
  stack:View[];
  scroll:Record<string,number>;
  context?:Context;
  savedAt:number;
};
const key=(app:string,owner:string)=>'tle:resume-location:v1:'+app+':'+owner.trim().toLowerCase();
export function readNavigationPlace<View extends string,Context=unknown>(
  app:string,owner:string,allowed:readonly View[],now=Date.now()
):NavigationPlace<View,Context>|null{
 if(!owner.trim())return null;
 try{
  const value=localStorage.getItem(key(app,owner));
  if(!value)return null;
  const parsed=JSON.parse(value) as NavigationPlace<View,Context>;
  if(!parsed||!Number.isFinite(parsed.savedAt)||parsed.savedAt>now||
     now-parsed.savedAt>=NAVIGATION_RESUME_MS||!allowed.includes(parsed.view)){
   localStorage.removeItem(key(app,owner));return null;
  }
  const scroll:Record<string,number>={};
  for(const [view,y] of Object.entries(parsed.scroll||{})){
    if(allowed.includes(view as View)&&typeof y==='number'&&Number.isFinite(y)&&y>=0)
      scroll[view]=Math.min(y,5_000_000);
  }
  return {view:parsed.view,stack:Array.isArray(parsed.stack)
    ?parsed.stack.filter((p):p is View=>allowed.includes(p)).slice(-25):[],
    scroll,context:parsed.context,savedAt:parsed.savedAt};
 }catch{return null}
}
export function writeNavigationPlace<View extends string,Context=unknown>(
 app:string,owner:string,place:Omit<NavigationPlace<View,Context>,'savedAt'>,now=Date.now()
):void{
 if(!owner.trim())return;
 try{localStorage.setItem(key(app,owner),JSON.stringify({
   view:place.view,stack:place.stack.slice(-25),scroll:place.scroll,
   ...(place.context===undefined?{}:{context:place.context}),savedAt:now,
 }));}catch{/* Storage quota/privacy mode must never crash the editor. */}
}
export function clearNavigationPlace(app:string,owner:string):void{
 if(!owner.trim())return;
 try{localStorage.removeItem(key(app,owner))}catch{}
}
