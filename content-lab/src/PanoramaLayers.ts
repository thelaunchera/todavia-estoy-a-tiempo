import { clampPanoramaRect, layerCornerPixels, type TouchRect } from './TouchGeometry';
import { coverPlacement } from './PhotoCrop';
export type LayerMove = 'backward' | 'forward' | 'back' | 'front';
export type LayerPlacement = 'behind-text' | 'front';

/** Saved order is bottom-to-top, with behind-text layers rendered first. */
export function reorderPanoramaLayers(layers: PanoramaLayer[], id: string, action: LayerMove): PanoramaLayer[] {
  const sorted = [...layers.filter(layer => layer.placement === 'behind-text'),
    ...layers.filter(layer => layer.placement !== 'behind-text')];
  const from = sorted.findIndex(layer => layer.id === id);
  if (from < 0) return sorted;
  const current = sorted[from];
  sorted.splice(from, 1);
  const destination = action === 'back' ? 0 : action === 'front' ? sorted.length
    : Math.max(0, Math.min(sorted.length, from + (action === 'forward' ? 1 : -1)));
  const behindCount = sorted.filter(layer => layer.placement === 'behind-text').length;
  const placement: LayerPlacement = action === 'back' ? 'behind-text'
    : action === 'front' ? 'front'
    : destination < behindCount ? 'behind-text'
    : destination > behindCount ? 'front'
    : current.placement || 'front';
  sorted.splice(destination, 0, {...current, placement});
  return sorted;
}

export type PanoramaLayer = {
  id: string;
  assetId: string;
  name: string;
  kind: 'photo' | 'sticker' | 'text' | 'shape';
  text?:string; font?:string; fontSize?:number; fontWeight?:number; lineHeight?:number; spacing?:number;
  color?:string; outline?:boolean; shadow?:boolean;
  shape?:'paper'|'tape'|'circle'|'frame';
  placement?: LayerPlacement;
  rect: TouchRect;
};

export function normalizePanoramaLayers(value: unknown): PanoramaLayer[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.slice(0, 24).flatMap(item => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id ||
        (item.kind!==undefined && !['photo','sticker','text','shape'].includes(item.kind)) ||
        ((item.kind==='photo'||item.kind==='sticker')&&(typeof item.assetId !== 'string'||!item.assetId)) ||
        !item.rect || ids.has(item.id)) return [];
    ids.add(item.id);
    return [{
      id: item.id.slice(0, 160), assetId: typeof item.assetId==='string'?item.assetId.slice(0,150):'',
      name: String(item.name || 'Elemento').slice(0, 100),
      kind: (item.kind||'photo') as PanoramaLayer['kind'],
      ...(item.kind === 'text' ? {
        text:String(item.text||'').slice(0,1600),
        font:String(item.font||'serif').slice(0,40),
        fontSize:Math.max(20,Math.min(240,Number(item.fontSize)||76)),
        fontWeight:[400,500,600,700,800,900].includes(Number(item.fontWeight))?Number(item.fontWeight):700,
        lineHeight:Math.max(.7,Math.min(2,Number(item.lineHeight)||1.12)),
        spacing:Math.max(-6,Math.min(35,Number(item.spacing)||0)),
        color:/^#[0-9a-f]{6}$/i.test(String(item.color))?String(item.color):'#191919',
        outline:item.outline===true,shadow:item.shadow===true,
      }:{}),
      ...(item.kind === 'shape' ? {
        shape:['paper','tape','circle','frame'].includes(String(item.shape))?item.shape as PanoramaLayer['shape']:'paper',
        color:/^#[0-9a-f]{6}$/i.test(String(item.color))?String(item.color):'#F2E3CD',
      }:{}),
      ...(item.placement === 'behind-text' || item.placement === 'front' ? {placement: item.placement as LayerPlacement} : {}),
      rect: clampPanoramaRect(item.rect),
    }];
  });
}


function shapePaint(ctx:CanvasRenderingContext2D,shape:PanoramaLayer,w:number,h:number){
 const c=shape.color||'#F2E3CD';
 const radius=layerCornerPixels(shape.rect,w,h);
 ctx.save();ctx.fillStyle=c;ctx.strokeStyle=c;
 const kind=shape.shape||'paper';
 const rounded=()=>{ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,radius)};
 if(kind==='paper'){
  ctx.shadowColor='#12182035';ctx.shadowBlur=Math.max(5,w*.032);
  rounded();ctx.fill();
 } else if(kind==='tape'){
  rounded();ctx.save();ctx.clip();ctx.globalAlpha=.72;ctx.fill();
  ctx.globalAlpha=.25;ctx.fillStyle='#FFFFFF';ctx.fillRect(-w/2,-h/2,w,h*.13);ctx.restore();
 } else if(kind==='circle'){
  ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);ctx.fill();
 } else {
  ctx.lineWidth=Math.max(6,Math.min(w,h)*.065);
  rounded();ctx.stroke();
 }
 ctx.restore();
}
export function panoramaFont(font?:string){
 const fonts:Record<string,string>={
  serif:'Georgia,serif',sans:'Arial,sans-serif',brand:'Georgia,serif',
  prompt:'Prompt,Arial,sans-serif',futura:'Futura,Arial,sans-serif',
  poster:'"Archivo Black",Impact,"Arial Black",Arial,sans-serif',
  'dm serif display':'"DM Serif Display",Georgia,serif',
  cormorant:'"Cormorant Garamond",Georgia,serif',
  playfair:'"Playfair Display",Georgia,serif',
  fraunces:'Fraunces,Georgia,serif',bodoni:'"Bodoni Moda",Georgia,serif',
  libre:'"Libre Baskerville",Georgia,serif',outfit:'Outfit,Arial,sans-serif',
  manrope:'Manrope,Arial,sans-serif',syne:'Syne,Arial,sans-serif',
  space:'"Space Grotesk",Arial,sans-serif',caveat:'Caveat,cursive'};
 return fonts[font||'']||fonts.serif;
}
export function panoramaTextWeight(value:unknown):number{
 const n=Number(value);
 return [400,500,600,700,800,900].includes(n)?n:700;
}
function textPaint(ctx:CanvasRenderingContext2D,layer:PanoramaLayer,w:number,h:number){
 const size=Math.max(20,Math.min(240,layer.fontSize||76));
 const leading=Math.max(.7,Math.min(2,layer.lineHeight||1.12));
 const text=layer.text||'';
 const maxWidth=Math.max(50,w-12);
 ctx.save();ctx.fillStyle=layer.color||'#191919';
 ctx.font=panoramaTextWeight(layer.fontWeight)+' '+size+'px '+panoramaFont(layer.font);
 ctx.textBaseline='top';
 ctx.letterSpacing=(layer.spacing||0)+'px';
 if(layer.shadow){ctx.shadowColor='#1A1A1A66';ctx.shadowBlur=size*.13;ctx.shadowOffsetY=size*.05}
 if(layer.outline){ctx.lineWidth=Math.max(1,size*.045);ctx.strokeStyle='#FFFFFF';ctx.lineJoin='round'}
 const lines:string[]=[];
 for(const paragraph of text.split('\n')){
  const words=paragraph.split(/\s+/).filter(Boolean);
  if(!words.length){lines.push('');continue}
  let line='';
  for(const word of words){const next=line?line+' '+word:word;
   if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word}else line=next;}
  lines.push(line);
 }
 ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();
 lines.slice(0,Math.max(1,Math.floor(h/(size*leading)))).forEach((line,i)=>{
  const x=-w/2+6,y=-h/2+size*leading*i;
  if(layer.outline)ctx.strokeText(line,x,y,maxWidth);
  ctx.fillText(line,x,y,maxWidth);
 });
 ctx.restore();
}
export async function paintPanoramaLayers(
  ctx: CanvasRenderingContext2D, width: number, height: number,
  layers: PanoramaLayer[], images: Record<string, string>,
) {
 for(const layer of layers){
  const r=clampPanoramaRect(layer.rect),w=r.w*width,h=r.h*height;
  ctx.save();ctx.translate((r.x+r.w/2)*width,(r.y+r.h/2)*height);
  ctx.rotate((r.angle||0)*Math.PI/180);
  if(layer.kind==='text'){
    try{await document.fonts?.load(panoramaTextWeight(layer.fontWeight)+' '+(layer.fontSize||76)+'px '+panoramaFont(layer.font));}
    catch{/* Offline fallback retains exported text. */}
    textPaint(ctx,layer,w,h);
   }
  else if(layer.kind==='shape')shapePaint(ctx,layer,w,h);
  else{
   const src=images[layer.assetId];
   if(!src)throw Error('Una foto del lienzo todavía está cargando. Espera antes de descargar.');
   const img=new Image();img.src=src;await img.decode();
   if(layer.kind==='photo'){
    ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,layerCornerPixels(r,w,h,6));ctx.clip();
    const p=coverPlacement(img.naturalWidth,img.naturalHeight,w,h,r.crop);
    ctx.drawImage(img,-w/2+p.x,-h/2+p.y,p.width,p.height);
   }else{
    const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
    const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
    if((r.cornerRadius??0)>0){
     ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,layerCornerPixels(r,w,h));ctx.clip();
    }
    ctx.drawImage(img,-iw/2,-ih/2,iw,ih);
   }
  }
  ctx.restore();
 }
}

/** Applies retained cross-slide layers even if the continuous background is turned off. */
export async function overlayPanoramaPages(
  pages: HTMLCanvasElement[], layers: PanoramaLayer[], images: Record<string, string>,
  paintTextOnTop?: (ctx:CanvasRenderingContext2D) => Promise<void>,
) {
  if (!layers.length) return pages;
  const wide = document.createElement('canvas');
  wide.width = pages.length * 1080; wide.height = 1350;
  const ctx = wide.getContext('2d');
  if (!ctx) throw Error('No se pudo preparar la descarga.');
  pages.forEach((page, n) => ctx.drawImage(page, n * 1080, 0));
  const behind = layers.filter(layer=>layer.placement==='behind-text');
  const front = layers.filter(layer=>layer.placement!=='behind-text');
  await paintPanoramaLayers(ctx, wide.width, wide.height, behind, images);
  if (behind.length && paintTextOnTop) await paintTextOnTop(ctx);
  await paintPanoramaLayers(ctx, wide.width, wide.height, front, images);
  return pages.map((_, n) => {
    const page = document.createElement('canvas'); page.width = 1080; page.height = 1350;
    const context = page.getContext('2d');
    if (!context) throw Error('No se pudo cortar el carrusel.');
    context.drawImage(wide, n * 1080, 0, 1080, 1350, 0, 0, 1080, 1350);
    return page;
  });
}
