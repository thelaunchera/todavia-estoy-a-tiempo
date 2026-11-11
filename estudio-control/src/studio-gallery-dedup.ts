/** Presentation-only deduplication. Never delete an IndexedDB or Storage file.
 * Keep buyer-shared and private collections independent so an owner upload
 * cannot accidentally remove a resource from the Lab catalogue view.
 */
export type StudioGalleryCard={
 id:string;name:string;kind:'sticker'|'background';private:boolean;
 source:'local'|'private-character'|'catalog'|'bundled'|'editorial';
 sha256?:string|null;
};
function normalizedName(name:string):string{
 return name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/\.(?:png|jpe?g|webp|svg)$/,'').replace(/[_-]+/g,' ')
  .replace(/^0+(\d+)(?=\s)/,'$1').replace(/\s+/g,' ').trim();
}
export function dedupeStudioGallery<T extends StudioGalleryCard>(items:readonly T[]):T[]{
 const seenIds=new Set<string>(),seenHashes=new Set<string>(),seenNames=new Map<string,string|null>();
 const result:T[]=[];
 for(const item of items){
  if(!item.id||!item.name||seenIds.has(item.id))continue;
  const partition=(item.private?'studio-private:':'buyer-shared:')+item.kind+':';
  const byName=partition+normalizedName(item.name);
  const hash=item.sha256&&/^[a-f0-9]{64}$/i.test(item.sha256)?partition+item.sha256.toLowerCase():null;
  // A confirmed different hash can be a deliberate variant even with the same
  // title. If hashes are absent, repeated *exact labels* are one gallery card.
  if(hash&&seenHashes.has(hash))continue;
  const priorHash=seenNames.get(byName);
  if(seenNames.has(byName)&&(!hash||!priorHash||hash===priorHash))continue;
  seenIds.add(item.id);
  if(!seenNames.has(byName))seenNames.set(byName,hash);
  if(hash)seenHashes.add(hash);
  result.push(item);
 }
 return result;
}
