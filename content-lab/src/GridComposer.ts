/**
 * Content Lab — 20 independently art-directed compositions.
 * The source photograph remains a bitmap. User-supplied captions/text are drawn
 * by Canvas after the AI photograph, avoiding AI-generated misspelled lettering.
 * All coordinates are relative to target canvas so every export is composed (not stretched).
 */
import {renderEditorial,type EditorialDesign} from './EditorialPoster';
export type ExportSize='portrait'|'square'|'story';
export const EXPORT_SIZES:Record<ExportSize,{w:number;h:number;title:string;safeTop:number;safeBottom:number}>={
  portrait:{w:1080,h:1350,title:'Post · 4:5',safeTop:0.055,safeBottom:0.065},
  square:{w:1080,h:1080,title:'Square · 1:1',safeTop:0.07,safeBottom:0.075},
  story:{w:1080,h:1920,title:'Story / Reel · 9:16',safeTop:0.14,safeBottom:0.19}
};
export type VisualControls={imageX?:number;imageY?:number;imageZoom?:number;frameX?:number;frameY?:number;frameScale?:number;textX?:number;textY?:number;textScale?:number};
export type Layout={name:string;image:[number,number,number,number];type:[number,number,number,number];accent:string;shape:string;align?:CanvasTextAlign;dark?:boolean};
export const LAYOUTS:Layout[]=[
 {name:'Editorial Hero',image:[.06,.06,.88,.59],type:[.065,.70,.87,.19],accent:'rule',shape:'flat'},
 {name:'Bold Typography',image:[.53,.53,.39,.31],type:[.07,.17,.83,.35],accent:'frame',shape:'solid'},
 {name:'Macro Texture',image:[0,0,1,.79],type:[.07,.83,.86,.12],accent:'rule',shape:'bottomPanel'},
 {name:'Lifestyle Scene',image:[.08,.13,.84,.61],type:[.08,.81,.84,.12],accent:'corner',shape:'paper'},
 {name:'Playful Props',image:[.24,.34,.54,.45],type:[.06,.12,.88,.22],accent:'circles',shape:'split'},
 {name:'Hands-on Editorial',image:[.05,.09,.54,.81],type:[.62,.25,.34,.5],accent:'rule',shape:'double'},
 {name:'High Contrast',image:[.33,.33,.65,.65],type:[.06,.08,.82,.25],accent:'bar',shape:'solid',dark:true},
 {name:'Minimal Premium',image:[.25,.39,.5,.47],type:[.13,.14,.74,.22],accent:'none',shape:'paper',align:'center'},
 {name:'Campaign Finale',image:[0,.26,1,.74],type:[.07,.1,.86,.23],accent:'sunburst',shape:'dark',dark:true},
 {name:'Color Block',image:[.48,0,.52,1],type:[.07,.24,.36,.53],accent:'stripe',shape:'split'},
 {name:'Magazine Cover',image:[.06,.18,.88,.7],type:[.06,.05,.86,.21],accent:'masthead',shape:'paper'},
 {name:'Arch Frame',image:[.16,.32,.68,.58],type:[.1,.1,.8,.2],accent:'arch',shape:'paper',align:'center'},
 {name:'Product Spotlight',image:[.19,.34,.63,.53],type:[.1,.10,.8,.20],accent:'spotlight',shape:'dark',dark:true,align:'center'},
 {name:'Floating Product',image:[.3,.23,.56,.49],type:[.07,.72,.86,.2],accent:'orbits',shape:'paper'},
 {name:'Typography Poster',image:[.5,.47,.44,.38],type:[.06,.09,.86,.42],accent:'mega',shape:'solid'},
 {name:'Negative Space',image:[.57,.58,.35,.3],type:[.08,.14,.72,.18],accent:'none',shape:'paper'},
 {name:'Diagonal Composition',image:[.52,.08,.43,.45],type:[.07,.62,.65,.27],accent:'diagonal',shape:'paper'},
 {name:'Soft Luxury',image:[.17,.42,.66,.4],type:[.12,.13,.76,.22],accent:'soft',shape:'paper',align:'center'},
 {name:'Graphic Cutout',image:[.11,.27,.54,.65],type:[.58,.12,.36,.44],accent:'cutout',shape:'split'},
 {name:'Story Card',image:[.12,.17,.76,.52],type:[.12,.74,.76,.14],accent:'pill',shape:'paper',align:'center'}
];
type Source={format?:string;headline?:string;subtext?:string;layout?:VisualControls;design?:EditorialDesign};
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
 box(0,0,1,1,paper);
 switch(layout.shape){
  case 'solid':box(0,0,1,1,accent);break;
  case 'split':box(0,0,.5,1,accent);break;
  case 'double':box(0,0,.6,1,accent);break;
  case 'bottomPanel':box(0,.77,1,.23,paper);break;
  case 'dark':box(0,0,1,1,'#191919');break;
 }
 const stroke=(x:number,y:number,w:number,h:number)=>{ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(W*x,H*y,W*w,H*h)};
 switch(layout.accent){
  case 'rule':box(.07,.93,.86,.004,accent);break;
  case 'corner':box(.05,.07,.22,.008,accent);break;
  case 'frame':stroke(.06,.06,.88,.88);break;
  case 'circles':for(const [x,y,r] of [[.13,.68,.12],[.77,.15,.1],[.87,.89,.07]]){ctx.beginPath();ctx.fillStyle=paper;ctx.arc(W*x,H*y,W*r,0,Math.PI*2);ctx.fill()}break;
  case 'bar':box(0,.08,.08,.77,ink);break;
  case 'sunburst':ctx.strokeStyle=accent;ctx.lineWidth=2;for(let i=0;i<18;i++){const a=i*Math.PI/9;ctx.beginPath();ctx.moveTo(W*(.5+.18*Math.cos(a)),H*(.58+.18*Math.sin(a)));ctx.lineTo(W*(.5+.27*Math.cos(a)),H*(.58+.27*Math.sin(a)));ctx.stroke()}break;
  case 'stripe':box(.46,0,.018,1,ink);break;
  case 'masthead':box(.05,.045,.9,.004,accent);break;
  case 'arch':ctx.strokeStyle=accent;ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(W*.5,H*.58,W*.38,H*.38,0,Math.PI,0,true);ctx.stroke();break;
  case 'spotlight':ctx.save();const grad=ctx.createRadialGradient(W*.5,H*.62,W*.05,W*.5,H*.62,W*.65);grad.addColorStop(0,accent);grad.addColorStop(1,'#191919');ctx.fillStyle=grad;ctx.fillRect(0,H*.25,W,H*.75);ctx.restore();break;
  case 'orbits':ctx.strokeStyle=accent;ctx.lineWidth=4;for(const r of [.25,.34,.43]){ctx.beginPath();ctx.ellipse(W*.55,H*.55,W*r,H*r*.73,0,0,Math.PI*2);ctx.stroke()}break;
  case 'mega':for(let i=0;i<6;i++)box(.07,.75+i*.025,.84,.006,ink);break;
  case 'diagonal':ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(W*.35,0);ctx.lineTo(W,0);ctx.lineTo(0,H);ctx.lineTo(0,H*.6);ctx.closePath();ctx.fill();break;
  case 'soft':ctx.fillStyle=accent+'88';ctx.beginPath();ctx.ellipse(W*.52,H*.62,W*.39,H*.25,0,0,Math.PI*2);ctx.fill();break;
  case 'cutout':box(.1,.18,.7,.7,ink);break;
  case 'pill':ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(W*.07,H*.07,W*.86,H*.85,Math.min(W,H)*.035);ctx.stroke();break;
 }
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
export async function composeGridPoster(tile:Source,index:number,brand:Brand,photos:{photo?:string;original?:string;logo?:string;preserve?:boolean},size:ExportSize='portrait'){
 const fmt=LAYOUTS.find(x=>x.name===tile.format)||LAYOUTS[index%LAYOUTS.length],metrics=EXPORT_SIZES[size];
 const W=metrics.w,H=metrics.h,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 try{if((brand.headingFont||'').toLowerCase()==='prompt'&&document.fonts)await document.fonts.load('700 82px Prompt');}catch{/* fall back without blocking export */}
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo crear el canvas');
 if(tile.design){
   const editorial=await renderEditorial({
    canvas,
    photo:photos.photo||photos.original||'',
    original:photos.original,logo:photos.logo,
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
 return {canvas,fit:didFit,contrast:contrast(headlineColor,fmt.shape==='dark'?'#191919':base),format:fmt.name};
}
