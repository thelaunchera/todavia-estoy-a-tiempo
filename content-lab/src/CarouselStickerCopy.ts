/** Copy an existing sticker to another carousel slide without searching the library.
 * Preserve the exact rectangle shown in the source slide's exported PNG.
 * Never replace another sticker or change a slide background/photo/text.
 */
import {clampRect,stickerDefault,type StickerPositions} from './TouchGeometry';

export type StickerCopyResult='copied'|'exists'|'full'|'invalid';
type WithStickers={stickerIds?:string[];stickerPositions?:StickerPositions};
export function copyStickerToSlide<T extends WithStickers>(
 slides:T[],sourceIndex:number,targetIndex:number,stickerId:string,
):{slides:T[];result:StickerCopyResult}{
 if(sourceIndex===targetIndex||sourceIndex<0||targetIndex<0||
    sourceIndex>=slides.length||targetIndex>=slides.length||!stickerId)
   return {slides,result:'invalid'};
 const source=slides[sourceIndex],target=slides[targetIndex];
 const sourceIds=source.stickerIds||[],targetIds=target.stickerIds||[];
 const originalIndex=sourceIds.indexOf(stickerId);
 if(originalIndex<0)return {slides,result:'invalid'};
 if(targetIds.includes(stickerId))return {slides,result:'exists'};
 if(targetIds.length>=3)return {slides,result:'full'};
 // A sticker without an explicit saved position is drawn at stickerDefault(index).
 // Copy that visible position, not the potentially different target default slot.
 const rect=clampRect(source.stickerPositions?.[stickerId]||stickerDefault(originalIndex));
 const next=slides.map((page,index)=>index===targetIndex?({
  ...page,
  stickerIds:[...targetIds,stickerId],
  stickerPositions:{...target.stickerPositions,[stickerId]:rect},
 }):page) as T[];
 return {slides:next,result:'copied'};
}
