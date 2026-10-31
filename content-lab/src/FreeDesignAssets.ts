/**
 * Content Lab's free aesthetic assets.
 * Decorative vocabulary is adapted from the owner's recovered 2026 sticker
 * collections (bows, hearts, flowers, sparkle, washi and notes) and ivory/
 * blue editorial brand backgrounds. These are fresh scalable canvas drawings,
 * not false claims of importing the original raster PNGs.
 *
 * No generative AI or credits are used. All export sizes use the same painter.
 */
export const FREE_STICKERS=[
 {id:'pink-bow',name:'Lazo rosa',emoji:'🎀',group:'Cute'},
 {id:'pink-heart',name:'Corazón suave',emoji:'🩷',group:'Cute'},
 {id:'sparkle',name:'Destellos',emoji:'✨',group:'Detalles'},
 {id:'flower',name:'Flor',emoji:'🌸',group:'Florales'},
 {id:'peony',name:'Peonía',emoji:'🌷',group:'Florales'},
 {id:'leaves',name:'Hojas',emoji:'🌿',group:'Florales'},
 {id:'stars',name:'Estrellitas',emoji:'✦',group:'Detalles'},
 {id:'gold-star',name:'Estrella dorada',emoji:'⭐',group:'Detalles'},
 {id:'coffee',name:'Café aesthetic',emoji:'☕',group:'Lifestyle'},
 {id:'moon',name:'Luna',emoji:'🌙',group:'Detalles'},
 {id:'butterfly',name:'Mariposa',emoji:'🦋',group:'Cute'},
 {id:'cherry',name:'Cerezas',emoji:'🍒',group:'Cute'},
 {id:'pin',name:'Pin',emoji:'📌',group:'Editorial'},
 {id:'paperclip',name:'Clip',emoji:'📎',group:'Editorial'},
 {id:'star-washi',name:'Washi tape rosa',emoji:'✳',group:'Editorial'},
 {id:'cream-washi',name:'Washi tape crema',emoji:'〰',group:'Editorial'},
 {id:'hand-drawn-arrow',name:'Flecha dibujada',emoji:'↗',group:'Editorial'},
 {id:'underline',name:'Subrayado',emoji:'〰',group:'Editorial'},
 {id:'notecard',name:'Nota de papel',emoji:'📝',group:'Editorial'},
 {id:'check',name:'Check doodle',emoji:'✓',group:'Editorial'}
 ,{id:'avatar-pilates',name:'Avatar Pilates',emoji:'🧘🏽‍♀️',group:'Avatares'},
 {id:'avatar-gym',name:'Avatar Gym',emoji:'🏋🏽‍♀️',group:'Avatares'},
 {id:'avatar-stretch',name:'Avatar Stretch',emoji:'🤸🏽‍♀️',group:'Avatares'},
 {id:'matcha-latte',name:'Matcha latte',emoji:'🍵',group:'Matcha'},
 {id:'matcha-cup',name:'Matcha Club',emoji:'🧋',group:'Matcha'},
 {id:'pilates-mat',name:'Pilates Mat',emoji:'🧘',group:'Pilates'},
 {id:'pilates-ball',name:'Pilates Ball',emoji:'🏐',group:'Pilates'},
 {id:'workout',name:'Workout',emoji:'💪',group:'Ejercicios'},
 {id:'training',name:'Training',emoji:'🏃🏽‍♀️',group:'Ejercicios'},
 {id:'sports',name:'Sports',emoji:'👟',group:'Ejercicios'}
] as const;
export type FreeStickerId=typeof FREE_STICKERS[number]['id'];
export type FreeBackgroundId='brand'|'warm-paper'|'soft-blue'|'sage'|'butter-cream'|'pink-paper'|'editorial-grid'|'soft-gradient'|'grain-ivory'|'night-editorial'|'dotted-paper';
export const FREE_BACKGROUNDS:{id:FreeBackgroundId;name:string;color:string;description:string}[]=[
 {id:'brand',name:'Colores de mi marca',color:'#FAF8F3',description:'Usa el Brand Kit'},
 {id:'warm-paper',name:'Warm Ivory',color:'#FAF8F3',description:'Papel cálido'},
 {id:'soft-blue',name:'Soft Blue',color:'#DCECF4',description:'Azul editorial'},
 {id:'sage',name:'Sage Studio',color:'#E4EDE1',description:'Salvia suave'},
 {id:'butter-cream',name:'Butter Cream',color:'#FFF4C4',description:'Crema amarilla'},
 {id:'pink-paper',name:'Blush Paper',color:'#FCE9EF',description:'Rosa claro'},
 {id:'editorial-grid',name:'Editorial Grid',color:'#F4F6F2',description:'Cuadrícula ligera'},
 {id:'soft-gradient',name:'Soft Gradient',color:'#E2EDF5',description:'Gradiente luminoso'},
 {id:'grain-ivory',name:'Paper Texture',color:'#F5F0E8',description:'Textura sutil'},
 {id:'night-editorial',name:'Dark Editorial',color:'#22282C',description:'Contraste premium'},
 {id:'dotted-paper',name:'Dotted Journal',color:'#FCFAF5',description:'Puntos discretos'}
];
export type FreeDecoration={stickerIds?:string[];backgroundId?:FreeBackgroundId};
const color=(s:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(s)?s:fallback;
export function paintFreeBackground(ctx:CanvasRenderingContext2D,w:number,h:number,id:FreeBackgroundId|undefined,brandColor='#BED8E9',brandPaper='#FAF8F3'){
 const chosen=FREE_BACKGROUNDS.find(x=>x.id===id)||FREE_BACKGROUNDS[0];
 const base=chosen.id==='brand'?color(brandPaper,'#FAF8F3'):chosen.color;
 ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 if(id==='soft-gradient'){
  const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#F6F6F2');g.addColorStop(.52,'#D6EAF4');g.addColorStop(1,'#F8E5E4');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 }
 if(id==='editorial-grid'||id==='dotted-paper'){
  ctx.save();ctx.strokeStyle=id==='editorial-grid'?'rgba(70,95,104,.09)':'rgba(50,50,50,.08)';
  ctx.fillStyle='rgba(70,95,104,.16)';const d=Math.max(22,w/22);
  for(let x=d;x<w;x+=d)for(let y=d;y<h;y+=d){
   if(id==='dotted-paper'){ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fill()}
   else{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  }
  if(id==='editorial-grid')for(let y=d;y<h;y+=d){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.restore();
 }
 if(id==='grain-ivory'||id==='warm-paper'||id==='pink-paper'){
  // Deterministic subtle paper specks; no random or external textures.
  ctx.save();ctx.fillStyle='rgba(110,93,73,.045)';
  for(let n=0;n<180;n++){const x=((n*233+37)%997)/997*w,y=((n*487+17)%991)/991*h;ctx.fillRect(x,y,Math.max(1,w/900),Math.max(1,w/900))}
  ctx.restore();
 }
}
function sketch(ctx:CanvasRenderingContext2D,id:string,c:string,size:number){
 ctx.strokeStyle=c;ctx.lineWidth=Math.max(3,size*.035);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
 if(id==='hand-drawn-arrow'){
  ctx.moveTo(-size*.35,size*.27);ctx.bezierCurveTo(-size*.2,-size*.07,size*.07,size*.14,size*.31,-size*.27);
  ctx.moveTo(size*.04,-size*.28);ctx.lineTo(size*.32,-size*.3);ctx.lineTo(size*.30,-size*.03);
 }else if(id==='underline'){
  ctx.moveTo(-size*.45,size*.1);ctx.bezierCurveTo(-size*.22,-size*.06,size*.12,size*.21,size*.43,-size*.08);
 }else if(id==='check'){
  ctx.moveTo(-size*.28,-size*.02);ctx.lineTo(-size*.07,size*.22);ctx.lineTo(size*.32,-size*.28);
 }else if(id==='stars'){
  for(const [x,y,k] of [[-.2,-.2,.26],[.28,.19,.16],[.3,-.32,.10]]){
   const m=size*k;ctx.moveTo(size*x-m,size*y);ctx.lineTo(size*x+m,size*y);ctx.moveTo(size*x,size*y-m);ctx.lineTo(size*x,size*y+m);
  }
 }ctx.stroke();
}
export function paintFreeStickers(ctx:CanvasRenderingContext2D,w:number,h:number,ids:string[]|undefined,accent='#191919'){
 const chosen=(Array.isArray(ids)?ids:[]).filter(id=>FREE_STICKERS.some(x=>x.id===id)).slice(0,3);
 const points:[[number,number,number,number],[number,number,number,number],[number,number,number,number]]=[
 [.86,.18,.135,-.16],[.13,.78,.12,.16],[.84,.79,.11,.2]
 ];
 for(let i=0;i<chosen.length;i++){
  const id=chosen[i],st=FREE_STICKERS.find(x=>x.id===id);if(!st)continue;
  const [px,py,scale,rot]=points[i];const size=Math.min(w,h)*scale;
  ctx.save();ctx.translate(px*w,py*h);ctx.rotate(rot);
  if(['hand-drawn-arrow','underline','check','stars'].includes(id))sketch(ctx,id,color(accent,'#191919'),size);
  else if(id==='star-washi'||id==='cream-washi'){
   const cream=id==='cream-washi';ctx.fillStyle=cream?'rgba(247,230,197,.85)':'rgba(245,182,205,.82)';
   ctx.rotate(-.28);ctx.fillRect(-size*.56,-size*.2,size*1.12,size*.4);ctx.font=(size*.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=cream?'#9F7A85':'#9A5A74';ctx.fillText(cream?'♡ ♡':'✦ ✦',0,0);
  }else if(id==='notecard'){
   ctx.rotate(.08);ctx.shadowColor='rgba(27,27,27,.12)';ctx.shadowBlur=size*.12;ctx.fillStyle='#FFF9E9';ctx.fillRect(-size*.42,-size*.36,size*.84,size*.72);
   ctx.shadowBlur=0;ctx.strokeStyle='#ADC7CE';ctx.lineWidth=2;for(let j=0;j<3;j++){const y=-size*.12+j*size*.17;ctx.beginPath();ctx.moveTo(-size*.28,y);ctx.lineTo(size*.28,y);ctx.stroke()}
  }else{
   ctx.font=size+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(st.emoji,0,size*.06);
  }
  ctx.restore();
 }
}

/** Downloadable free preview icons, separately from the original artist PNG bundle. */
export function downloadFreeStickerPNG(id:string){
 if(!FREE_STICKERS.some(x=>x.id===id))throw Error('Sticker desconocido');
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=640;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo exportar el sticker.');
 ctx.save();
 const scale=3.5;
 ctx.translate(320-640*.86*scale,320-640*.18*scale);
 ctx.scale(scale,scale);
 paintFreeStickers(ctx,640,640,[id],'#A97892');
 ctx.restore();
 const a=document.createElement('a');a.download='sticker-'+id+'-gratis.png';a.href=canvas.toDataURL('image/png');a.click();
}
