/** Renders real uploaded PNGs at the exact same normalized positions that
 * the finger editor displays. Transparent pixels stay transparent.
 */
import {stickerDefault,clampRect,type StickerPositions} from './TouchGeometry';
export async function paintOriginalStickerImages(
 ctx:CanvasRenderingContext2D,w:number,h:number,ids:string[]|undefined,
 images:Record<string,string>={},positions:StickerPositions={}
){
 const chosen=(Array.isArray(ids)?ids:[]).slice(0,3);
 for(let i=0;i<chosen.length;i++){
  const id=chosen[i],src=images[id];if(!src)continue;
  const img=new Image();img.src=src;
  try{
   await img.decode();if(!img.naturalWidth||!img.naturalHeight)continue;
   const rect=clampRect(positions[id]||stickerDefault(i));
   const sw=rect.w*w,sh=rect.h*h;
   const scale=Math.min(sw/img.naturalWidth,sh/img.naturalHeight);
   const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
   ctx.save();
   ctx.translate(w*(rect.x+rect.w/2),h*(rect.y+rect.h/2));
   ctx.rotate((rect.angle||0)*Math.PI/180);
   ctx.shadowColor='rgba(24,29,30,.12)';ctx.shadowBlur=Math.min(w,h)*.014;
   ctx.drawImage(img,-width/2,-height/2,width,height);
   ctx.restore();
  }catch{/* A missing asset must not break other slides. */}
 }
}
