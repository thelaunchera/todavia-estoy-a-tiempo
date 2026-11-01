/** Persisted percentage-based geometry used by mouse, pencil and finger.
 * All values are normalized to the actual export canvas, not screen pixels.
 */
import {normalizeCrop,type PhotoCrop} from './PhotoCrop';
export type TouchRect={x:number;y:number;w:number;h:number;angle?:number;crop?:PhotoCrop;cornerRadius?:number};
/** Radius as a 0–50 percentage of the shortest side; missing values preserve old appearance. */
export const normalizedCornerRadius=(value:unknown):number|undefined=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(50,value)):undefined;
export const layerCornerPixels=(rect:TouchRect,width:number,height:number,fallback=0)=>
 Math.min(width,height)*(rect.cornerRadius??fallback)/100;
export type StickerPositions=Record<string,TouchRect>;
export const safeNumber=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
export const clampRect=(r:TouchRect,minWidth=.055):TouchRect=>{
 const w=Math.max(minWidth,Math.min(1,safeNumber(r.w,.15)));
 const h=Math.max(.055,Math.min(1,safeNumber(r.h,.15)));
 return {x:Math.max(0,Math.min(1-w,safeNumber(r.x,.4))),y:Math.max(0,Math.min(1-h,safeNumber(r.y,.4))),w,h,angle:Math.max(-180,Math.min(180,safeNumber(r.angle,0))),...(r.crop?{crop:normalizeCrop(r.crop)}:{}),...(normalizedCornerRadius(r.cornerRadius)!==undefined?{cornerRadius:normalizedCornerRadius(r.cornerRadius)}:{})};
};
/** A single post can crop a photograph beyond the artboard, like a real layout editor.
 * Keep at least 10% visible so it remains recoverable by touch. This is about
 * the placement frame, not upscaling the source's pixels.
 */
export const clampFreePhotoRect=(r:TouchRect):TouchRect=>{
 const w=Math.max(.055,Math.min(3,safeNumber(r.w,.5)));
 const h=Math.max(.055,Math.min(3,safeNumber(r.h,.5)));
 const visible=.10;
 return {
  x:Math.max(-w+visible,Math.min(1-visible,safeNumber(r.x,.2))),
  y:Math.max(-h+visible,Math.min(1-visible,safeNumber(r.y,.2))),
  w,h,
  angle:Math.max(-180,Math.min(180,safeNumber(r.angle,0))),
  ...(r.crop?{crop:normalizeCrop(r.crop)}:{}),
  ...(normalizedCornerRadius(r.cornerRadius)!==undefined?{cornerRadius:normalizedCornerRadius(r.cornerRadius)}:{})
 };
};
/** Panorama layers may bleed beyond an edge; keep a small grab area reachable. */
export const clampPanoramaRect=(r:TouchRect,minWidth=.055/8):TouchRect=>{
 const w=Math.max(minWidth,Math.min(2,safeNumber(r.w,.15)));
 const h=Math.max(.055,Math.min(3,safeNumber(r.h,.15)));
 return {x:Math.max(-w+minWidth,Math.min(1-minWidth,safeNumber(r.x,.4))),
  y:Math.max(-h+.025,Math.min(.975,safeNumber(r.y,.4))),w,h,
  angle:Math.max(-180,Math.min(180,safeNumber(r.angle,0))),...(r.crop?{crop:normalizeCrop(r.crop)}:{}),...(normalizedCornerRadius(r.cornerRadius)!==undefined?{cornerRadius:normalizedCornerRadius(r.cornerRadius)}:{})};
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
  return [id,clampRect({x:safeNumber(item.x,.6),y:safeNumber(item.y,.65),w:safeNumber(item.w,.18),h:safeNumber(item.h,.16),angle:safeNumber(item.angle,0),cornerRadius:normalizedCornerRadius(item.cornerRadius)})];
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
