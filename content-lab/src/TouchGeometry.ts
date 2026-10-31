/** Persisted percentage-based geometry used by mouse, pencil and finger.
 * All values are normalized to the actual export canvas, not screen pixels.
 */
import {normalizeCrop,type PhotoCrop} from './PhotoCrop';
export type TouchRect={x:number;y:number;w:number;h:number;angle?:number;crop?:PhotoCrop};
export type StickerPositions=Record<string,TouchRect>;
export const safeNumber=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
export const clampRect=(r:TouchRect,minWidth=.055):TouchRect=>{
 const w=Math.max(minWidth,Math.min(1,safeNumber(r.w,.15)));
 const h=Math.max(.055,Math.min(1,safeNumber(r.h,.15)));
 return {x:Math.max(0,Math.min(1-w,safeNumber(r.x,.4))),y:Math.max(0,Math.min(1-h,safeNumber(r.y,.4))),w,h,angle:Math.max(-180,Math.min(180,safeNumber(r.angle,0))),...(r.crop?{crop:normalizeCrop(r.crop)}:{})};
};
export const stickerDefault=(index:number):TouchRect=>[
 {x:.76,y:.13,w:.19,h:.17,angle:-9},{x:.08,y:.71,w:.18,h:.17,angle:8},{x:.72,y:.72,w:.17,h:.16,angle:12}
][index%3];
export const photoDefault=(layout:string):TouchRect=>layout==='cover'?{x:.588,y:.544,w:.368,h:.330}:
 layout==='photo'?{x:0,y:0,w:1,h:.54}:
 layout==='split'?{x:.491,y:0,w:.509,h:1}:
 {x:.18,y:.34,w:.64,h:.46};
export const normalizedPositions=(input:unknown):StickerPositions=>{
 if(!input||typeof input!=='object'||Array.isArray(input))return {};
 return Object.fromEntries(Object.entries(input as Record<string,unknown>)
 .filter(([key,value])=>key.length<150&&value&&typeof value==='object'&&!Array.isArray(value))
 .slice(0,12).map(([id,raw])=>{
  const item=raw as Record<string,unknown>;
  return [id,clampRect({x:safeNumber(item.x,.6),y:safeNumber(item.y,.65),w:safeNumber(item.w,.18),h:safeNumber(item.h,.16),angle:safeNumber(item.angle,0)})];
 }));
};
export async function paintCoverImage(ctx:CanvasRenderingContext2D,src:string,w:number,h:number){
 if(!src)return;
 const im=new Image();im.src=src;
 await im.decode();
 if(!im.naturalWidth||!im.naturalHeight)return;
 const k=Math.max(w/im.naturalWidth,h/im.naturalHeight);
 const iw=im.naturalWidth*k,ih=im.naturalHeight*k;
 ctx.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);
}
