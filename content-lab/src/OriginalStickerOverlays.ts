/** Real transparent PNG sticker overlays, no emojis and no AI generation. */
export async function paintOriginalStickerImages(ctx:CanvasRenderingContext2D,w:number,h:number,ids:string[]|undefined,images:Record<string,string>={}){
 const chosen=(Array.isArray(ids)?ids:[]).filter(id=>!!images[id]).slice(0,3);
 const positions=[[.84,.20,-.13],[.18,.79,.12],[.79,.79,.08]];
 for(let i=0;i<chosen.length;i++){
  const src=images[chosen[i]];if(!src)continue;
  const img=new Image();img.src=src;
  try{
   await img.decode();if(!img.naturalWidth||!img.naturalHeight)continue;
   const size=Math.min(w,h)*.18;
   const scale=Math.min(size/img.naturalWidth,size/img.naturalHeight);
   const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
   const [x,y,rotation]=positions[i];
   ctx.save();ctx.translate(w*x,h*y);ctx.rotate(rotation);
   ctx.shadowColor='rgba(24,29,30,.14)';ctx.shadowBlur=Math.min(w,h)*.018;ctx.shadowOffsetY=Math.min(w,h)*.01;
   ctx.drawImage(img,-width/2,-height/2,width,height);ctx.restore();
  }catch{/* Unavailable private sticker must never break a valid design export. */}
 }
}