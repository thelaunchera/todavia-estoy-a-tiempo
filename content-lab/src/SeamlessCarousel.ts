import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {paintOriginalStickerImages} from './OriginalStickerOverlays';
export type SeamlessPage={title:string;eyebrow:string;description:string;assetId?:string;stickerIds?:string[]};
export type SeamlessBrand={name:string;color:string;background:string;headingFont?:string;bodyFont?:string};
export type SeamlessOptions={backgroundId?:FreeBackgroundId;assetId?:string;accent?:string};
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
  ctx.drawImage(wide,i*W,0,W,H,0,0,W,H);output.push(c);
 }
 return output;
};
/** Renders ONE continuous design first and then slices it on exact 1080px boundaries. */
export async function drawSeamlessPages(pages:SeamlessPage[],brand:SeamlessBrand,images:Record<string,string>,opts:SeamlessOptions={}):Promise<HTMLCanvasElement[]>{
 if(pages.length<2||pages.length>8)throw Error('El carrusel seamless necesita entre 2 y 8 slides.');
 const total=pages.length,wide=document.createElement('canvas');wide.width=total*W;wide.height=H;
 const ctx=wide.getContext('2d');if(!ctx)throw Error('No hay canvas para seamless.');
 const accent=/^#[0-9a-f]{6}$/i.test(opts.accent||'')?opts.accent!:brand.color;
 paintFreeBackground(ctx,wide.width,H,opts.backgroundId||'soft-gradient',accent,brand.background);
 if(opts.assetId&&images[opts.assetId]){
  const im=await load(images[opts.assetId]);const ratio=Math.max(wide.width/im.naturalWidth,H/im.naturalHeight);
  const sw=wide.width/ratio,sh=H/ratio;
  ctx.save();ctx.globalAlpha=.27;
  ctx.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,0,0,wide.width,H);
  ctx.restore();
 }
 // Continuous graphic paths deliberately CROSS every 1080px cut.
 ctx.save();ctx.globalAlpha=.18;ctx.fillStyle=accent;
 ctx.beginPath();ctx.moveTo(0,H*.67);
 for(let i=0;i<total;i++){const x=i*W;ctx.bezierCurveTo(x+W*.25,H*.45,x+W*.6,H*.8,x+W,H*.56)}
 ctx.lineTo(wide.width,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
 ctx.strokeStyle=accent;ctx.globalAlpha=.45;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(0,H*.68);
 for(let i=0;i<total;i++){const x=i*W;ctx.bezierCurveTo(x+W*.3,H*.55,x+W*.72,H*.81,x+W,H*.62)}
 ctx.stroke();ctx.restore();
 const font=brand.headingFont==='Prompt'?'Prompt, Arial, sans-serif':brand.headingFont==='Futura'?'Futura, Arial, sans-serif':'Georgia, serif';
 try{await document.fonts?.load('700 90px '+font)}catch{/* use fallback */}
 for(let i=0;i<total;i++){
  const x=i*W,page=pages[i];
  const dark=opts.backgroundId==='night-editorial',ink=dark?'#FFFFFF':'#191919';
  // Light local text halo: readable without breaking the continuous artwork.
  const grad=ctx.createLinearGradient(x,0,x+W*.88,H*.20);
  grad.addColorStop(0,dark?'rgba(25,25,25,.67)':'rgba(250,248,243,.72)');
  grad.addColorStop(1,'rgba(250,248,243,0)');
  ctx.fillStyle=grad;ctx.fillRect(x,0,W,H*.65);
  const label=((page.eyebrow||brand.name).slice(0,45)).toUpperCase();
  ctx.fillStyle=ink;ctx.textBaseline='top';ctx.font='700 25px Arial, sans-serif';
  ctx.fillText(label,x+82,95);
  words(ctx,page.title,x+82,244,W-164,92,5,ink,font);
  if(page.description){
   words(ctx,page.description,x+84,H-345,W-170,38,3,ink,'Arial, sans-serif');
  }
  ctx.font='700 20px Arial, sans-serif';ctx.fillStyle=ink;
  ctx.fillText(brand.name.toUpperCase().slice(0,35),x+82,H-90);
  ctx.fillText(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),x+W-183,H-90);
  ctx.save();ctx.translate(x,0);await paintOriginalStickerImages(ctx,W,H,page.stickerIds,images);ctx.restore();
 }
 return splitIntoPages(wide,total);
}
