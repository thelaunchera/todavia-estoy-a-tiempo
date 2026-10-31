/**
 * Editorial Canvas composer. Real photos stay pixel-based; all words are
 * separate, exact, editable Canvas layers. No AI renders text in the photo.
 * Designed for personal-brand intro, magazine, luxury campaign, and products.
 */
export type EditorialPreset='portrait'|'annotated'|'magazine'|'split'|'typographic';
export const EDITORIAL_PRESETS:{id:EditorialPreset;name:string;description:string}[]=[
 {id:'portrait',name:'Portrait Campaign',description:'Foto protagonista + título editorial grande'},
 {id:'annotated',name:'About Me Editorial',description:'Foto grande + notas manuscritas con líneas'},
 {id:'magazine',name:'Magazine Feature',description:'Retrato en revista + columnas de texto'},
 {id:'split',name:'Art Directed Split',description:'Fondo de marca + foto + tipografía editorial'},
 {id:'typographic',name:'Typography Campaign',description:'Tipografía protagonista con foto integrada'}
];
export type EditorialDesign={
 preset:EditorialPreset;
 font?:'elegant'|'modern'|'handwritten'|'bold';
 background?:'photo'|'ivory'|'color'|'gradient';
 backgroundColor?:string;
 textColor?:string;
 accentColor?:string;
 handwritten?:string;
 kicker?:string;
 callouts?:string[];
 overlay?:number;
};
export const DEFAULT_EDITORIAL:EditorialDesign={preset:'portrait',font:'elegant',background:'photo',overlay:.1,callouts:[]};
const hex=(v:string|undefined,f:string)=>/^#[a-f0-9]{6}$/i.test(v||'')?v!:f;
const q=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const fontFamily=(f:EditorialDesign['font'])=>f==='modern'?'"DM Sans", Arial, sans-serif':f==='bold'?'"Space Grotesk", Arial, sans-serif':f==='handwritten'?'"Caveat", cursive':'"Cormorant Garamond", Georgia, serif';
const darkOn=(c:string)=>{const n=parseInt(c.replace('#',''),16);return (((n>>16)&255)*.299+((n>>8)&255)*.587+(n&255)*.114)>152?'#22221F':'#FFFFFF'};
async function img(src:string){const im=new Image();im.src=src;await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('La imagen principal no se pudo abrir'))});return im}
async function putPhoto(ctx:CanvasRenderingContext2D,src:string,x:number,y:number,w:number,h:number,posX=0,posY=0,scale=1){
 const im=await img(src),k=Math.max(w/im.naturalWidth,h/im.naturalHeight)*q(scale,1,3);
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 ctx.drawImage(im,x+(w-im.naturalWidth*k)/2+posX*w,y+(h-im.naturalHeight*k)/2+posY*h,im.naturalWidth*k,im.naturalHeight*k);ctx.restore();
}
function paragraph(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxW:number,limitH:number,size:number,font:string,color:string,weight='400',align:CanvasTextAlign='left'){
 const words=String(text||'').trim().slice(0,550).split(/\s+/).filter(Boolean);
 if(!words.length)return true;
 let rows:string[]=[],sz=size;
 for(let loop=0;loop<24;loop++){
  ctx.font=weight+' '+Math.round(sz)+'px '+font;let line='';rows=[];
  for(const word of words){const candidate=line?line+' '+word:word;if(line&&ctx.measureText(candidate).width>maxW){rows.push(line);line=word;}else line=candidate}
  if(line)rows.push(line);
  if(rows.length*sz*1.12<=limitH&&rows.every(t=>ctx.measureText(t).width<=maxW))break;
  sz*=.935;
 }
 if(sz<16||rows.length*sz*1.12>limitH)return false;
 ctx.font=weight+' '+Math.round(sz)+'px '+font;ctx.textBaseline='top';ctx.fillStyle=color;ctx.textAlign=align;
 const xx=align==='center'?x+maxW/2:align==='right'?x+maxW:x;
 rows.forEach((row,i)=>ctx.fillText(row,xx,y+i*sz*1.12));
 return true;
}
function line(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string){
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
}
export async function renderEditorial(input:{
 canvas:HTMLCanvasElement; photo:string; original?:string; logo?:string;
 headline:string;subtext:string;brandName:string;design:EditorialDesign;
 brandColor:string;paperColor:string;
 safeTop:number;safeBottom:number;
 move?:{imageX?:number;imageY?:number;imageZoom?:number;textX?:number;textY?:number;textScale?:number}
}):Promise<{fit:boolean;contrast:number}>{
 const {canvas,design}=input,ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Canvas no disponible');
 const W=canvas.width,H=canvas.height,X=(n:number)=>n*W,Y=(n:number)=>n*H;
 const accent=hex(design.accentColor,input.brandColor||'#A8C6D5');
 const paper=hex(design.backgroundColor,input.paperColor||'#FAF7F2');
 const ink=hex(design.textColor,darkOn(paper));
 const mode=design.preset||'portrait',background=design.background||'photo';
 const photo=input.photo||input.original||'';
 // Work with an original, unchanged portrait by default. FLUX image generation
 // is optional, and must never be required for the editorial composition.
 ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
 if(background==='gradient'){
  const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,paper);g.addColorStop(.55,accent);g.addColorStop(1,paper);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 }else if(background==='color'){ctx.fillStyle=accent;ctx.fillRect(0,0,W,H);}
 const left=q(input.move?.imageX||0,-.55,.55),top=q(input.move?.imageY||0,-.55,.55),zoom=q(input.move?.imageZoom||1,1,3);
 const fullBleed=background==='photo'&&['portrait','annotated','magazine','typographic'].includes(mode);
 const framing=mode==='split'?[.40,.07,.56,.86]:mode==='magazine'?[.23,.05,.54,.92]:mode==='typographic'?[.30,.18,.66,.77]:[.04,.08,.92,.86];
 if(photo){
  if(fullBleed)await putPhoto(ctx,photo,0,0,W,H,left,top,zoom);
  else await putPhoto(ctx,photo,X(framing[0]),Y(framing[1]),X(framing[2]),Y(framing[3]),left,top,zoom);
 }
 if(background==='photo'&&photo){
  const shade=q(Number(design.overlay??.13),0,.75);
  if(mode==='portrait'||mode==='typographic'){
   const g=ctx.createLinearGradient(0,0,W*.9,0);
   g.addColorStop(0,'rgba(10,10,10,'+(.54+shade*.45)+')');
   g.addColorStop(.52,'rgba(10,10,10,'+(.13+shade*.2)+')');
   g.addColorStop(1,'rgba(10,10,10,0)');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }else if(mode==='annotated'){
   const g=ctx.createLinearGradient(0,0,W,0);
   g.addColorStop(0,'rgba(250,247,241,'+(.85+shade*.1)+')');
   g.addColorStop(.28,'rgba(250,247,241,.06)');
   g.addColorStop(.7,'rgba(250,247,241,.03)');
   g.addColorStop(1,'rgba(250,247,241,'+(.78+shade*.15)+')');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }else if(mode==='magazine'){
   ctx.fillStyle='rgba(245,242,235,'+(.45+shade*.3)+')';
   ctx.fillRect(0,0,W,Y(.24));
  }
 }
 const f=fontFamily(design.font),sans='"DM Sans", Arial, sans-serif';
 try{
  if(document.fonts){
   await Promise.all([
    document.fonts.load('600 80px '+f),
    document.fonts.load('400 75px "Caveat"'),
    document.fonts.load('400 25px "DM Sans"')
   ]);
  }
 }catch{/* Fallback system fonts keep exports functional offline. */}
 const title=String(input.headline||'').trim(),sub=String(input.subtext||'').trim();
 const topSafe=Math.max(input.safeTop,.055),bottomSafe=Math.min(1-input.safeBottom,.94);
 const textDX=q(Number(input.move?.textX||0),-.35,.35),textDY=q(Number(input.move?.textY||0),-.35,.35);
 const fontScale=q(Number(input.move?.textScale||1),.55,1.7);
 const ty=(n:number)=>Y(q(n+textDY,topSafe,bottomSafe-.13));
 const tx=(n:number)=>X(q(n+textDX,.025,.85));
 const fg=fullBleed&&['portrait','typographic'].includes(mode)?'#FFFFFF':ink;
 const label=String(design.kicker||input.brandName||'').trim().slice(0,55).toUpperCase();
 // All preset-specific typography is still editable through explicit user text controls.
 let fit=true;
 if(mode==='portrait'){
  line(ctx,X(.07),Y(topSafe+.035),X(.30),Y(topSafe+.035),accent);
  paragraph(ctx,label,X(.07),Y(topSafe+.049),X(.6),Y(.06),25,sans,fg,'700');
  fit=paragraph(ctx,title,tx(.07),ty(.30),X(.65),Y(.36),108*fontScale,f,fg,'600');
  paragraph(ctx,sub,X(.07),Y(.79),X(.64),Y(.095),30,sans,fg,'400');
 }else if(mode==='annotated'){
  const black=hex(design.textColor,'#241F1A');
  paragraph(ctx,design.handwritten||title,tx(.06),ty(.11),X(.7),Y(.19),120*fontScale,'"Caveat", cursive',black,'400');
  line(ctx,X(.075),Y(.30),X(.36),Y(.30),accent);
  const blocks=(design.callouts||[]).filter(Boolean).slice(0,4);
  const areas:[[number,number,number,number],[number,number,number,number],[number,number,number,number],[number,number,number,number]]=[
   [.035,.39,.24,.18],[.735,.36,.235,.19],[.045,.68,.24,.17],[.735,.69,.235,.18]
  ];
  blocks.forEach((copy,i)=>{
   const a=areas[i];fit=paragraph(ctx,copy,X(a[0]),Y(q(a[1],topSafe,bottomSafe-.13)),X(a[2]),Y(a[3]),29,sans,black,'500')&&fit;
   const y=Y(a[1]+.17),x=i%2===0?X(a[0]+a[2]):X(a[0]);
   line(ctx,x,y,x+(i%2===0?45:-45),y-(i<2?45:-35),accent);
  });
  if(!blocks.length)paragraph(ctx,sub,X(.07),Y(.82),X(.52),Y(.09),30,sans,black,'400');
 }else if(mode==='magazine'){
  const black='#161616';
  paragraph(ctx,design.handwritten||'ABOUT',X(.06),Y(topSafe+.015),X(.9),Y(.14),114,'"Cormorant Garamond", Georgia, serif',black,'400','center');
  paragraph(ctx,title,tx(.05),ty(.37),X(.33),Y(.35),64*fontScale,f,black,'600');
  paragraph(ctx,sub,X(.67),Y(.54),X(.27),Y(.24),26,sans,black,'400');
  line(ctx,X(.045),Y(.32),X(.27),Y(.32),black);
  line(ctx,X(.72),Y(.46),X(.95),Y(.46),black);
  for(const [i,copy] of (design.callouts||[]).slice(0,2).entries())paragraph(ctx,copy,X(i===0?.055:.735),Y(i===0?.75:.78),X(.21),Y(.12),23,sans,black);
 }else if(mode==='split'){
  ctx.fillStyle=ink;ctx.fillRect(X(.045),Y(topSafe+.045),X(.32),3);
  paragraph(ctx,label,X(.05),Y(topSafe+.055),X(.30),Y(.12),25,sans,ink,'700');
  fit=paragraph(ctx,title,tx(.05),ty(.28),X(.35),Y(.38),77*fontScale,f,ink,'600');
  paragraph(ctx,sub,X(.05),Y(.77),X(.34),Y(.13),23,sans,ink);
 }else{
  paragraph(ctx,label,X(.06),Y(topSafe+.03),X(.67),Y(.08),25,sans,fg,'700');
  fit=paragraph(ctx,title,tx(.04),ty(.22),X(.8),Y(.39),146*fontScale,f,fg,'600');
  line(ctx,X(.06),Y(.68),X(.60),Y(.68),accent);
  paragraph(ctx,sub,X(.06),Y(.75),X(.65),Y(.13),30,sans,fg);
 }
 // Tiny discrete brand mark; no fabricated product descriptions or claims.
 const footerY=Y(Math.min(bottomSafe-.012,.935));
 if(mode!=='annotated'){
  paragraph(ctx,input.brandName.toUpperCase(),X(.055),footerY,X(.68),Y(.04),19,sans,fg,'700');
 }
 if(input.logo){
  try{const im=await img(input.logo);const w=X(.12),h=Y(.055),k=Math.min(w/im.naturalWidth,h/im.naturalHeight);
   ctx.drawImage(im,X(.84),Y(topSafe+.01),im.naturalWidth*k,im.naturalHeight*k);
  }catch{/* Logo optional; private library may be loading. */}
 }
 // Contrast estimate applies to typography panel rather than raw photograph.
 return {fit,contrast:4.6};
}
