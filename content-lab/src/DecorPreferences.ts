/** Device-local favorites/recent selections, scoped to each Content Lab brand.
 * Resource IDs are stable; thumbnails and files stay in their original library.
 * Never stores images or personal content in localStorage.
 */
export type DecorPreferences={favorites:string[];recent:string[]};
const empty=():DecorPreferences=>({favorites:[],recent:[]});
export const decorPreferenceKey=(scope:string)=>'content-lab:decor-prefs:v1:'+encodeURIComponent(scope||'default');
export const readDecorPreferences=(scope:string):DecorPreferences=>{
 try{
  const data=JSON.parse(localStorage.getItem(decorPreferenceKey(scope))||'{}') as Partial<DecorPreferences>;
  const items=(list:unknown,max:number)=>Array.isArray(list)?Array.from(new Set(list.filter((id):id is string=>
    typeof id==='string'&&id.length>2&&id.length<175))).slice(0,max):[];
  return {favorites:items(data.favorites,100),recent:items(data.recent,24)};
 }catch{return empty()}
};
export const saveDecorPreferences=(scope:string,data:DecorPreferences)=>{
 try{localStorage.setItem(decorPreferenceKey(scope),JSON.stringify(data))}catch{/* Safari private mode or storage restrictions */}
};
export const rememberDecor=(data:DecorPreferences,key:string):DecorPreferences=>({
 ...data,recent:[key,...data.recent.filter(id=>id!==key)].slice(0,24)
});
export const toggleDecorFavorite=(data:DecorPreferences,key:string):DecorPreferences=>({
 ...data,favorites:data.favorites.includes(key)?data.favorites.filter(id=>id!==key):[key,...data.favorites].slice(0,100)
});
export const decorKey={
 sticker:(id:string)=>'sticker:'+id,
 imageBackground:(id:string)=>'background:image:'+id,
 freeBackground:(id:string)=>'background:free:'+id
};
