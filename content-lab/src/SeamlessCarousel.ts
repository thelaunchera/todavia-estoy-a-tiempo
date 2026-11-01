import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {isBowBackground} from './BowBackgrounds';
import {paintOriginalStickerImages} from './OriginalStickerOverlays';
import {clampRect,photoDefault,type TouchRect,type StickerPositions} from './TouchGeometry';
import {coverPlacement,normalizeCrop} from './PhotoCrop';
import {paintPanoramaLayers,type PanoramaLayer} from './PanoramaLayers';
import {carouselFontFamily,readableColor,type CarouselFont} from './CarouselArtDirection';
import {editorialPlan,type EditorialLayout} from './EditorialRhythm';
export type SeamlessPage={title:string;eyebrow:string;description:string;layout?:string;photoFocus?:string;titleFont?:CarouselFont;assetId?:string;stickerIds?:string[];photoPosition?:TouchRect;stickerPositions?:StickerPositions;backgroundImageId?:string;backgroundId?:FreeBackgroundId;backgroundColor?:string;backgroundGradient?:string};
export type SeamlessBrand={name:string;color:string;background:string;headingFont?:string;bodyFont?:string};
export type SeamlessOptions={backgroundId?:FreeBackgroundId;assetId?:string;accent?:string;editorMode?:boolean;font?:CarouselFont;layers?:PanoramaLayer[];freeCanvas?:boolean;editorialRhythm?:boolean;canvasColor?:string;canvasGradient?:string;usePageBackgrounds?:boolean};
const W=1080,H=1350;
const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{
 const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('No se pudo abrir el fondo seamless'));im.src=src;
});
const words=(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,font:number,maxLines:number,color:string,fontName:string)=>{
 const segments=text.split(/\s+/).filter(Boolean);if(!segments.length)return;
 let size=font,lines:string[]=[];
 for(let t=0;t<28;t++){
  ctx.font='700 '+Math.round(size)+'px '+fontName;lines=[];let current='';
  for(const segment of segments){const candidate=current?current+' '+segment:segment;if(ctx.measureText(candidate).width>width&&current){lines.push(current);current=segment}else current=candidate}
  if(current)lines.push(current);
  if(lines.length<=maxLines&&lines.every(l=>ctx.measureText(l).width<=width))break;
  size*=.92;
 }
 ctx.fillStyle=color;ctx.font='700 '+Math.round(size)+'px '+fontName;ctx.textBaseline='top';
 lines.slice(0,maxLines).forEach((line,i)=>ctx.fillText(line,x,y+i*size*1.13));
};
const splitIntoPages=(wide:HTMLCanvasElement,count:number)=>{
 const output:HTMLCanvasElement[]=[];
 for(let i=0;i<count;i++){
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const ctx=c.getContext('2d');if(!ctx)throw Error('No se pudo cortar el carrusel.');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(wide,i*W,0,W,H,0,0,W,H);output.push(c);
 }
 return output;
};

/** Paints transparent typography over back-layer photos (matches the original layout). */
export async function paintSeamlessTypography(
 ctx: CanvasRenderingContext2D,pages: SeamlessPage[],brand: SeamlessBrand, backgroundId?: FreeBackgroundId, fontId:CarouselFont='brand', freeCanvas=false, canvasColor='#FFFFFF', editorialRhythm=false,
) {
 for(const [i,page] of pages.entries()){
  const font=carouselFontFamily(page.titleFont||fontId,brand.headingFont);
  try{await document.fonts?.load('700 90px '+font)}catch{/* Font fallback */}
  const pageBackground=page.backgroundId||backgroundId;
   const x=i*W,ink=(pageBackground==='night-editorial'||pageBackground==='night-stars'||pageBackground==='rust-autumn')
     ?'#FFFFFF':freeCanvas&&pageBackground==='brand'?readableColor(page.backgroundColor||canvasColor):'#191919';
  const plan=editorialRhythm?editorialPlan((page.layout||'statement') as EditorialLayout,!!page.assetId,!!page.description.trim()):null;
  if(page.eyebrow){ctx.fillStyle=ink;ctx.textBaseline='top';
   ctx.font='700 25px Arial, sans-serif';ctx.fillText(page.eyebrow.slice(0,45).toUpperCase(),x+(plan?.eyebrow.x??82),plan?.eyebrow.top??95);}
  // In a text-only slide, center the headline more intentionally.
  const headlineY=page.assetId?244:page.description.trim()?360:475;
  if(plan)words(ctx,page.title,x+plan.title.x,plan.title.top,plan.title.width,plan.title.size,plan.title.lines,ink,font);
  else words(ctx,page.title,x+82,headlineY,W-164,page.assetId?92:112,5,ink,font);
  if(page.description){
   if(plan)words(ctx,page.description,x+plan.body.x,plan.body.top,plan.body.width,plan.body.size,plan.body.lines,ink,'Arial, sans-serif');
   else words(ctx,page.description,x+84,H-345,W-170,38,3,ink,'Arial, sans-serif');
  }
  ctx.font='700 20px Arial, sans-serif';ctx.fillStyle=ink;ctx.textBaseline='top';
  if(!freeCanvas){
    ctx.fillText(brand.name.toUpperCase().slice(0,35),x+82,H-90);
    ctx.fillText(String(i+1).padStart(2,'0')+' / '+String(pages.length).padStart(2,'0'),x+W-183,H-90);
  }
 }
}

/** Renders ONE continuous design first and then slices it on exact 1080px boundaries. */
export async function drawSeamlessCanvas(pages:SeamlessPage[],brand:SeamlessBrand,images:Record<string,string>,opts:SeamlessOptions={}):Promise<HTMLCanvasElement>{
 if(pages.length<2||pages.length>10)throw Error('El carrusel seamless necesita entre 2 y 10 slides.');
 const total=pages.length,wide=document.createElement('canvas');wide.width=total*W;wide.height=H;
 const ctx=wide.getContext('2d');if(!ctx)throw Error('No hay canvas para seamless.');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const accent=/^#[0-9a-f]{6}$/i.test(opts.accent||'')?opts.accent!:brand.color;
 // Library images applied across all slides must keep their original 4:5
 // framing and full opacity; a 4-slide panoramic crop loses bows and lace.
 const sharedImageIsBackground=Boolean(opts.assetId&&pages.every(
   page=>page.backgroundImageId===opts.assetId
 ));
 if(opts.usePageBackgrounds||sharedImageIsBackground){
    // Each slide has its own backdrop; panorama layers still span all slides.
    for(let i=0;i<total;i++){
      const page=pages[i];
      ctx.save();ctx.translate(i*W,0);
      if(page.backgroundImageId&&images[page.backgroundImageId]){
        const im=await load(images[page.backgroundImageId]);
        const ratio=Math.max(W/im.naturalWidth,H/im.naturalHeight);
        const sw=W/ratio,sh=H/ratio;
        ctx.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,0,0,W,H);
      }else if(page.backgroundId&&page.backgroundId!=='brand'){
        paintFreeBackground(ctx,W,H,page.backgroundId,accent,brand.background);
      }else{
        const a=page.backgroundColor||opts.canvasColor||'#FFFFFF';
        const b=page.backgroundGradient||opts.canvasGradient;
        if(b){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,a);g.addColorStop(1,b);
          ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
        else{ctx.fillStyle=a;ctx.fillRect(0,0,W,H);}
      }
      ctx.restore();
    }
  }else if(opts.freeCanvas&&(!opts.backgroundId||opts.backgroundId==='brand')){
   const a=opts.canvasColor||'#FFFFFF',b=opts.canvasGradient;
   if(b){const g=ctx.createLinearGradient(0,0,wide.width,H);g.addColorStop(0,a);g.addColorStop(1,b);
     ctx.fillStyle=g;ctx.fillRect(0,0,wide.width,H);}
   else{ctx.fillStyle=a;ctx.fillRect(0,0,wide.width,H);}
 }else if(isBowBackground(opts.backgroundId)){
   // Keep bows at true slide scale on panoramas; avoid gigantic ribbons on 8-slide canvases.
   // Every tile is painted using the same 1080×1350 renderer as regular slides.
   for(let n=0;n<total;n++){
     ctx.save();ctx.translate(n*W,0);
     paintFreeBackground(ctx,W,H,opts.backgroundId,accent,brand.background);
     ctx.restore();
   }
 }else paintFreeBackground(ctx,wide.width,H,opts.backgroundId||'brand',accent,brand.background);
 if(!opts.usePageBackgrounds&&!sharedImageIsBackground&&opts.assetId&&images[opts.assetId]){
  const im=await load(images[opts.assetId]);const ratio=Math.max(wide.width/im.naturalWidth,H/im.naturalHeight);
  const sw=wide.width/ratio,sh=H/ratio;
  ctx.save();ctx.globalAlpha=.27;
  ctx.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,0,0,wide.width,H);
  ctx.restore();
 }
 // Paint a stretched wallpaper below photos/stickers across every slide.
 // In the editor the same wallpaper is a draggable photo layer instead.
 if(!opts.editorMode){
  const wallpaper=(opts.layers||[]).filter(layer=>layer.role==='background');
  if(wallpaper.length)await paintPanoramaLayers(ctx,wide.width,H,wallpaper,images);
 }
 // Legacy decorative waves are hidden for the new clean design studio.
 if(!opts.freeCanvas){ctx.save();ctx.globalAlpha=.18;ctx.fillStyle=accent;
 ctx.beginPath();ctx.moveTo(0,H*.67);
 for(let i=0;i<total;i++){const x=i*W;ctx.bezierCurveTo(x+W*.25,H*.45,x+W*.6,H*.8,x+W,H*.56)}
 ctx.lineTo(wide.width,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
 ctx.strokeStyle=accent;ctx.globalAlpha=.45;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(0,H*.68);
 for(let i=0;i<total;i++){const x=i*W;ctx.bezierCurveTo(x+W*.3,H*.55,x+W*.72,H*.81,x+W,H*.62)}
 ctx.stroke();ctx.restore();}
 // The heading is resolved for each slide, so local overrides match the master type picker.
 for(let i=0;i<total;i++){
  const x=i*W,page=pages[i];
  const font=carouselFontFamily(page.titleFont||opts.font||'brand',brand.headingFont);
  try{await document.fonts?.load('700 90px '+font)}catch{/* use fallback */}
  const plan=opts.editorialRhythm?editorialPlan((page.layout||'statement') as EditorialLayout,!!page.assetId,!!page.description.trim()):null;
  const pageBackground=opts.usePageBackgrounds?page.backgroundId:opts.backgroundId;
   const pageColor=opts.usePageBackgrounds?page.backgroundColor||opts.canvasColor:opts.canvasColor;
   const dark=pageBackground==='night-editorial'||pageBackground==='night-stars'||pageBackground==='rust-autumn'||
     (opts.freeCanvas&&(!pageBackground||pageBackground==='brand')&&readableColor(pageColor||'#FFFFFF')==='#FFFFFF');
   const ink=dark?'#FFFFFF':'#191919';
  if(!opts.freeCanvas){
    const grad=ctx.createLinearGradient(x,0,x+W*.88,H*.20);
    grad.addColorStop(0,dark?'rgba(25,25,25,.67)':'rgba(250,248,243,.72)');
    grad.addColorStop(1,'rgba(250,248,243,0)');
    ctx.fillStyle=grad;ctx.fillRect(x,0,W,H*.65);
  }
  if(!opts.editorMode){
  const label=(page.eyebrow||'').slice(0,45).toUpperCase();
  ctx.fillStyle=ink;ctx.textBaseline='top';ctx.font='700 25px Arial, sans-serif';
  ctx.fillText(label,x+(plan?.eyebrow.x??82),plan?.eyebrow.top??95);
  // In a text-only slide, center the headline more intentionally.
  const headlineY=page.assetId?244:page.description.trim()?360:475;
  if(plan)words(ctx,page.title,x+plan.title.x,plan.title.top,plan.title.width,plan.title.size,plan.title.lines,ink,font);
  else words(ctx,page.title,x+82,headlineY,W-164,page.assetId?92:112,5,ink,font);
  if(page.description){
   if(plan)words(ctx,page.description,x+plan.body.x,plan.body.top,plan.body.width,plan.body.size,plan.body.lines,ink,'Arial, sans-serif');
   else words(ctx,page.description,x+84,H-345,W-170,38,3,ink,'Arial, sans-serif');
  }
  ctx.font='700 20px Arial, sans-serif';ctx.fillStyle=ink;
  if(!opts.freeCanvas){
    ctx.fillText(brand.name.toUpperCase().slice(0,35),x+82,H-90);
    ctx.fillText(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),x+W-183,H-90);
  }
  }
  ctx.save();ctx.translate(x,0);
  if(!opts.editorMode&&page.assetId&&images[page.assetId]){
    try{
      const p=clampRect(page.photoPosition||photoDefault(page.layout||'photo')),im=await load(images[page.assetId]);
      const fw=p.w*W,fh=p.h*H,placement=coverPlacement(im.naturalWidth,im.naturalHeight,fw,fh,p.crop||normalizeCrop({y:page.photoFocus==='top'?.12:page.photoFocus==='bottom'?.9:.5}));
      ctx.save();ctx.translate((p.x+p.w/2)*W,(p.y+p.h/2)*H);
      ctx.rotate((p.angle||0)*Math.PI/180);
      ctx.beginPath();ctx.roundRect(-fw/2,-fh/2,fw,fh,Math.min(fw,fh)*.06);ctx.clip();
      ctx.drawImage(im,-fw/2+placement.x,-fh/2+placement.y,placement.width,placement.height);ctx.restore();
    }catch{/* Keep all other pages exportable. */}
  }
  if(!opts.editorMode)await paintOriginalStickerImages(ctx,W,H,page.stickerIds,images,page.stickerPositions);
  ctx.restore();
 }
 if(!opts.editorMode) {
  const behind=(opts.layers||[]).filter(layer=>layer.role!=='background'&&layer.placement==='behind-text');
  const front=(opts.layers||[]).filter(layer=>layer.role!=='background'&&layer.placement!=='behind-text');
  await paintPanoramaLayers(ctx,wide.width,H,behind,images);
  if(behind.length)await paintSeamlessTypography(ctx,
     opts.usePageBackgrounds?pages:pages.map(p=>({...p,backgroundId:opts.backgroundId,backgroundColor:opts.canvasColor})),
     brand,opts.backgroundId,opts.font,opts.freeCanvas,opts.canvasColor,opts.editorialRhythm);
  await paintPanoramaLayers(ctx,wide.width,H,front,images);
 }
 return wide;
}

export async function drawSeamlessPages(pages:SeamlessPage[],brand:SeamlessBrand,images:Record<string,string>,opts:SeamlessOptions={}):Promise<HTMLCanvasElement[]>{
 const wide=await drawSeamlessCanvas(pages,brand,images,opts);
 return splitIntoPages(wide,pages.length);
}
