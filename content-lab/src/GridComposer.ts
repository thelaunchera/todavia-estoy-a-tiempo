/**
 * Content Lab — 20 independently art-directed compositions.
 * The source photograph remains a bitmap. User-supplied captions/text are drawn
 * by Canvas after the AI photograph, avoiding AI-generated misspelled lettering.
 * All coordinates are relative to target canvas so every export is composed (not stretched).
 */
import {renderEditorial,type EditorialDesign} from './EditorialPoster';
import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {paintOriginalStickerImages} from './OriginalStickerOverlays';
import {paintCoverImage,type StickerPositions} from './TouchGeometry';
export type ExportSize='portrait'|'square'|'story';
export const EXPORT_SIZES:Record<ExportSize,{w:number;h:number;title:string;safeTop:number;safeBottom:number}>={
  portrait:{w:1080,h:1350,title:'Post · 4:5',safeTop:0.055,safeBottom:0.065},
  square:{w:1080,h:1080,title:'Square · 1:1',safeTop:0.07,safeBottom:0.075},
  story:{w:1080,h:1920,title:'Story / Reel · 9:16',safeTop:0.14,safeBottom:0.19}
};
export type VisualControls={imageX?:number;imageY?:number;imageZoom?:number;frameX?:number;frameY?:number;frameScale?:number;textX?:number;textY?:number;textScale?:number};
export type Layout={name:string;image:[number,number,number,number];type:[number,number,number,number];accent:string;shape:string;align?:CanvasTextAlign;dark?:boolean};
export const LAYOUTS:Layout[]=[
 // Photo-first editorial geometries. Saved format names and order are stable.
 {name:'Editorial Hero',image:[0.38,0.04,0.6,0.898],type:[0.055,0.27,0.3,0.46],accent:'rule',shape:'flat'},
 {name:'Bold Typography',image:[0.27,0.4,0.7,0.538],type:[0.06,0.07,0.88,0.26],accent:'frame',shape:'solid'},
 {name:'Macro Texture',image:[0,0,1,0.74],type:[0.07,0.79,0.86,0.14],accent:'rule',shape:'bottomPanel'},
 {name:'Lifestyle Scene',image:[0.06,0.055,0.88,0.74],type:[0.08,0.83,0.84,0.1],accent:'corner',shape:'paper'},
 {name:'Playful Props',image:[0.28,0.3,0.68,0.62],type:[0.06,0.06,0.87,0.19],accent:'circles',shape:'split'},
 {name:'Hands-on Editorial',image:[0.04,0.05,0.64,0.88],type:[0.72,0.18,0.24,0.52],accent:'rule',shape:'double'},
 {name:'High Contrast',image:[0.24,0.36,0.74,0.578],type:[0.06,0.08,0.85,0.22],accent:'bar',shape:'solid',dark:true},
 {name:'Minimal Premium',image:[0.05,0.34,0.9,0.57],type:[0.09,0.075,0.82,0.2],accent:'none',shape:'paper',align:'center'},
 {name:'Campaign Finale',image:[0,0.34,1,0.598],type:[0.07,0.08,0.86,0.21],accent:'sunburst',shape:'dark',dark:true},
 {name:'Color Block',image:[0.47,0.04,0.51,0.898],type:[0.055,0.26,0.38,0.45],accent:'stripe',shape:'split'},
 {name:'Magazine Cover',image:[0.055,0.36,0.89,0.578],type:[0.06,0.09,0.87,0.2],accent:'masthead',shape:'paper'},
 {name:'Arch Frame',image:[0.17,0.35,0.66,0.57],type:[0.11,0.09,0.78,0.18],accent:'arch',shape:'paper',align:'center'},
 {name:'Product Spotlight',image:[0.19,0.37,0.72,0.55],type:[0.05,0.09,0.87,0.19],accent:'spotlight',shape:'dark',dark:true,align:'center'},
 {name:'Floating Product',image:[0.1,0.05,0.82,0.64],type:[0.11,0.74,0.78,0.17],accent:'orbits',shape:'paper'},
 {name:'Typography Poster',image:[0.48,0.54,0.48,0.398],type:[0.055,0.08,0.9,0.35],accent:'mega',shape:'solid'},
 {name:'Negative Space',image:[0.35,0.4,0.6,0.53],type:[0.07,0.08,0.86,0.23],accent:'none',shape:'paper'},
 {name:'Diagonal Composition',image:[0.43,0.06,0.55,0.69],type:[0.07,0.8,0.85,0.13],accent:'diagonal',shape:'paper'},
 {name:'Soft Luxury',image:[0.15,0.34,0.7,0.598],type:[0.1,0.08,0.8,0.19],accent:'soft',shape:'paper',align:'center'},
 {name:'Graphic Cutout',image:[0.13,0.16,0.82,0.76],type:[0.05,0.05,0.89,0.09],accent:'cutout',shape:'split'},
 {name:'Story Card',image:[0.03,0.06,0.94,0.75],type:[0.08,0.83,0.84,0.10],accent:'pill',shape:'paper',align:'center'},
];
type Source={format?:string;headline?:string;subtext?:string;layout?:VisualControls;design?:EditorialDesign;backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[];stickerPositions?:StickerPositions};
type Brand={name:string;color:string;background:string;secondaryColor?:string;headingFont?:string;bodyFont?:string;logoAssetId?:string};
const validColor=(s:string|undefined,fallback:string)=>/^#[a-fA-F0-9]{6}$/.test(s||'')?s!:fallback;
const luminance=(color:string)=>{const cs=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*cs[0]+.7152*cs[1]+.0722*cs[2]};
const contrast=(a:string,b:string)=>{let x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const inkOn=(c:string)=>contrast(c,'#191919')>=contrast(c,'#ffffff')?'#191919':'#ffffff';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
function textFont(input:string|undefined,serif:boolean){
 const f=(input||'').toLowerCase();
 if(f==='futura')return 'Futura, "Century Gothic", Arial, sans-serif';
 if(f==='prompt')return '"Prompt", Arial, sans-serif';
 if(f==='sans'||f==='inter'||f==='dm sans')return 'Arial, sans-serif';
 return serif?'Georgia, serif':'Arial, sans-serif';
}
function drawWrapped(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,maxHeight:number,fontSize:number,font:string,color:string,align:CanvasTextAlign){
 const v=String(value||'').trim().slice(0,240);
 if(!v)return false;
 let lines:string[]=[];let size=fontSize;
 const words=v.split(/\s+/);
 for(let tries=0;tries<22;tries++){
  ctx.font='bold '+Math.round(size)+'px '+font;let row='';lines=[];
  for(const word of words){const possible=row?row+' '+word:word;
   if(ctx.measureText(possible).width>width&&row){lines.push(row);row=word;}else row=possible;
  }if(row)lines.push(row);
  if(lines.length*size*1.15<=maxHeight&&lines.every(t=>ctx.measureText(t).width<=width))break;
  size*=.93;
 }
 if(lines.length*size*1.15>maxHeight||size<16)return false;
 ctx.fillStyle=color;ctx.textBaseline='top';ctx.textAlign=align;ctx.font='bold '+Math.round(size)+'px '+font;
 const alignX=align==='center'?x+width/2:align==='right'?x+width:x;
 lines.forEach((l,i)=>ctx.fillText(l,alignX,y+i*size*1.15));
 return true;
}
function geometry(ctx:CanvasRenderingContext2D,layout:Layout,W:number,H:number,paper:string,accent:string,ink:string){
 const box=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(W*x,H*y,W*w,H*h)};
 // The finished PNG respects the same photo / type zones shown in the gallery.
 box(0,0,1,1,paper);
 switch(layout.shape){
  case 'solid':box(0,0,1,1,accent);break;
  case 'split':box(0,0,.5,1,accent);break;
  case 'double':box(.61,0,.39,1,accent);break;
  case 'bottomPanel':box(0,.76,1,.24,paper);break;
  case 'dark':box(0,0,1,1,'#19232a');break;
 }
 // One restrained art-direction accent per format, not Canva-style decorations.
 switch(layout.accent){
  case 'rule':box(.08,layout.name==='Macro Texture'?.75:.71,.22,.0015,accent);break;
  case 'corner':box(.06,.047,.2,.0025,accent);break;
  case 'frame':box(.07,.075,.3,.0035,ink);break;
  case 'circles':{
   ctx.strokeStyle=accent;ctx.lineWidth=Math.max(1,W*.002);ctx.beginPath();
   ctx.arc(W*.14,H*.79,W*.055,0,Math.PI*2);ctx.stroke();break;
  }
  case 'bar':box(.065,.075,.16,.0025,accent);break;
  case 'sunburst':box(.075,.32,.28,.002,accent);break;
  case 'stripe':box(.498,0,.0015,1,ink);break;
  case 'masthead':box(.08,.075,.84,.0015,ink);break;
  case 'arch':box(.13,.365,.2,.0015,accent);break;
  case 'spotlight':{
   const g=ctx.createRadialGradient(W*.5,H*.64,W*.08,W*.5,H*.64,W*.65);
   g.addColorStop(0,'#2a424b');g.addColorStop(1,'#19232a');
   ctx.fillStyle=g;ctx.fillRect(0,H*.4,W,H*.46);break;
  }
  case 'orbits':box(.08,.715,.24,.0015,accent);break;
  case 'mega':box(.07,.52,.84,.002,ink);break;
  case 'diagonal':box(.08,.6,.25,.002,accent);break;
  case 'soft':box(.4,.095,.2,.0015,accent);break;
  case 'cutout':box(.612,.18,.0018,.62,accent);break;
  case 'pill':box(.12,.09,.18,.0015,accent);break;
 }
}

// A second, oversized typographic plane sits BEHIND the real photo — the same
// art direction as the gallery, but it uses the buyer's editable headline.
function paintGhostHeadline(ctx:CanvasRenderingContext2D,layout:Layout,text:string,W:number,H:number){
 const tokens=(text||'').toLocaleUpperCase().match(/[\p{L}\p{N}]{3,}/gu)||[];
 const word=tokens.find(t=>t.length>=4)||tokens[0];
 if(!word)return;
 ctx.save();
 const vertical=['Editorial Hero','Color Block','Diagonal Composition'].includes(layout.name);
 let fontSize=Math.round(W*(vertical?.22:.29));
 ctx.font='900 '+fontSize+'px Arial,sans-serif';
 const cap=vertical?H*.76:W*1.1;
 while(ctx.measureText(word).width>cap&&fontSize>Math.round(W*.08)){
  fontSize=Math.round(fontSize*.92);
  ctx.font='900 '+fontSize+'px Arial,sans-serif';
 }
 ctx.fillStyle=layout.dark?'rgba(255,255,255,.16)':'rgba(101,33,50,.17)';
 ctx.textBaseline='middle';
 if(vertical){
  ctx.translate(W*.04,H*.82);ctx.rotate(-Math.PI/2);ctx.fillText(word,0,0);
 }else{
  const y=['Magazine Cover','Typography Poster','Playful Props'].includes(layout.name)?.22:.43;
  ctx.fillText(word,-W*.025,H*y);
 }
 ctx.restore();
}

async function drawPhoto(ctx:CanvasRenderingContext2D,src:string,x:number,y:number,w:number,h:number,zoom:number,offsetX:number,offsetY:number){
 if(!src)return false;
 const im=new Image();im.src=src;
 await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(new Error('No se pudo abrir la foto de este post'))});
 const k=Math.max(w/im.naturalWidth,h/im.naturalHeight)*zoom;
 const px=x+(w-im.naturalWidth*k)/2+offsetX;
 const py=y+(h-im.naturalHeight*k)/2+offsetY;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,px,py,im.naturalWidth*k,im.naturalHeight*k);ctx.restore();
 return true;
}
export async function composeGridPoster(tile:Source,index:number,brand:Brand,photos:{photo?:string;original?:string;logo?:string;preserve?:boolean;stickerImages?:Record<string,string>;omitStickers?:boolean},size:ExportSize='portrait'){
 const fmt=LAYOUTS.find(x=>x.name===tile.format)||LAYOUTS[index%LAYOUTS.length],metrics=EXPORT_SIZES[size];
 const W=metrics.w,H=metrics.h,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 try{if((brand.headingFont||'').toLowerCase()==='prompt'&&document.fonts)await document.fonts.load('700 82px Prompt');}catch{/* fall back without blocking export */}
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo crear el canvas');
 if(tile.design){
   const editorial=await renderEditorial({
    canvas,
    photo:photos.photo||photos.original||'',
    original:photos.original,logo:photos.logo,stickerImages:photos.stickerImages,
    stickerPositions:tile.stickerPositions,omitStickers:photos.omitStickers,
    backgroundImageSrc:tile.backgroundImageId?photos.stickerImages?.[tile.backgroundImageId]:undefined,
    headline:tile.headline||'',subtext:tile.subtext||'',
    brandName:brand.name,design:tile.design,
    brandColor:brand.color,paperColor:brand.background,
    safeTop:metrics.safeTop,safeBottom:metrics.safeBottom,
    move:tile.layout
   });
   return {canvas,fit:editorial.fit,contrast:editorial.contrast,format:'Editorial · '+tile.design.preset};
 }
 const accent=validColor(brand.color,'#BED8E9'),paper=validColor(brand.background,'#FAF8F3'),second=validColor(brand.secondaryColor,'#E5D5C6');
 const dark=fmt.dark,base=fmt.shape==='solid'?accent:fmt.shape==='dark'?'#191919':paper;
 const ink=inkOn(base),secondaryInk=inkOn(paper);
 geometry(ctx,fmt,W,H,paper,accent,ink);
 paintGhostHeadline(ctx,fmt,tile.headline||'',W,H);
 if(tile.backgroundId&&tile.backgroundId!=='brand')paintFreeBackground(ctx,W,H,tile.backgroundId,accent,paper);
 if(tile.backgroundImageId&&photos.stickerImages?.[tile.backgroundImageId]){
  try{await paintCoverImage(ctx,photos.stickerImages[tile.backgroundImageId],W,H)}catch{/* Keep backup background. */}
 }
 const control=tile.layout||{};
 const dx=clamp(Number(control.imageX||0),-.55,.55)*W,dy=clamp(Number(control.imageY||0),-.55,.55)*H;
 const tx=clamp(Number(control.textX||0),-.35,.35)*W,ty=clamp(Number(control.textY||0),-.35,.35)*H;
 const zoom=clamp(Number(control.imageZoom||1),1,3);
 const [ix,iy,iw,ih]=fmt.image;const [hx,hy,hw,hh]=fmt.type;
 // Unlike crop position, frame controls move/resize the actual photo rectangle.
 // Keep the full frame within the composed export, including on a narrow iPhone.
 const frameScale=clamp(Number(control.frameScale||1),.45,1.7);
 const fw=clamp(iw*frameScale,.12,.98),fh=clamp(ih*frameScale,.12,.87);
 const fx=clamp(ix+(iw-fw)/2+clamp(Number(control.frameX||0),-.75,.75),0,1-fw);
 const fy=clamp(iy+(ih-fh)/2+clamp(Number(control.frameY||0),-.75,.75),0,1-fh);
 if(photos.preserve&&photos.original){
  // Use the actual unaltered photo in this selected layout, not a tiny inset.
  // Contain the entire bitmap: never crop faces, hands or screenshots.
  const im=new Image();im.src=photos.original;
  await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('No se pudo abrir la foto original'))});
  const ox=fx*W,oy=fy*H,ow=fw*W,oh=fh*H;
  const scale=Math.min(ow/im.naturalWidth,oh/im.naturalHeight);
  const w=im.naturalWidth*scale,h=im.naturalHeight*scale;
  ctx.fillStyle=paper;ctx.fillRect(ox,oy,ow,oh);
  ctx.drawImage(im,ox+(ow-w)/2,oy+(oh-h)/2,w,h);
 }else{
  await drawPhoto(ctx,photos.photo||'',fx*W,fy*H,fw*W,fh*H,zoom,dx,dy);
 }
 // Text is always drawn from EXACT editor strings, never delegated to an image model.
 // Safe areas are respected for Reels/Stories.
 const headlineColor=(fmt.shape==='dark'||(fmt.shape==='solid'&&!dark))?inkOn(fmt.shape==='dark'?'#191919':accent):fmt.shape==='split'&&hx<.5?inkOn(accent):secondaryInk;
 const safeTop=metrics.safeTop*H,safeBottom=(1-metrics.safeBottom)*H;
 const capY=clamp(hy*H+ty,safeTop,safeBottom-30);
 const allowedH=Math.max(75,Math.min(hh*H,safeBottom-capY-12));
 const textSize=clamp(Number(control.textScale||1),.55,1.7)*Math.min(W/1080,H/1350)*91;
 const didFit=drawWrapped(ctx,tile.headline||'',clamp(hx*W+tx,W*.03,W*.92),capY,Math.max(80,hw*W-Math.abs(tx)),allowedH,textSize,textFont(brand.headingFont,true),headlineColor,fmt.align||'left');
 const footerY=clamp(H*.952,safeTop+20,safeBottom);
 ctx.font='bold '+Math.round(19*Math.min(W/1080,H/1350))+'px '+textFont(brand.bodyFont,false);
 ctx.textAlign='left';ctx.fillStyle=fmt.dark?'#ffffff':inkOn(paper);
 ctx.fillText((brand.name||'').toUpperCase().slice(0,35),W*.065,footerY);
 ctx.textAlign='right';ctx.fillText((tile.subtext||'').slice(0,54),W*.935,footerY);
 if(photos.logo){
  const im=new Image();im.src=photos.logo;
  try{
   await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('Logo no disponible'))});
   const lw=W*.15,lh=H*.065,k=Math.min(lw/im.naturalWidth,lh/im.naturalHeight);
   ctx.drawImage(im,W*.81+(lw-im.naturalWidth*k)/2,H*(metrics.safeTop+.01),im.naturalWidth*k,im.naturalHeight*k);
  }catch{/* An inaccessible logo cannot prevent an otherwise safe export. */}
 }
 if(!photos.omitStickers)await paintOriginalStickerImages(ctx,W,H,tile.stickerIds,photos.stickerImages,tile.stickerPositions);
 return {canvas,fit:didFit,contrast:contrast(headlineColor,fmt.shape==='dark'?'#191919':base),format:fmt.name};
}
