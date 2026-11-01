/**
 * A single non-destructive art direction shared by all slides.
 * Reference images inspire a locally sampled palette; their pixels are NOT copied.
 * This deliberately consumes zero Workers AI credits.
 */
import {brandPalette,type BrandIdentity,type SocialPlatform} from './BrandIdentity';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {normalizePanoramaLayers,type PanoramaLayer} from './PanoramaLayers';
export type CarouselMood='editorial'|'soft'|'bold'|'dark';
export const CAROUSEL_FONTS=[
 {id:'brand',label:'Mi Brand Kit',family:'',category:'Marca'},
 {id:'serif',label:'Editorial clásica',family:'Georgia, serif',category:'Editorial'},
 {id:'sans',label:'Minimal moderna',family:'Arial, sans-serif',category:'Moderna'},
 {id:'poster',label:'Poster Extra Bold',family:'"Archivo Black", Impact, "Arial Black", sans-serif',category:'Póster'},
 {id:'cormorant',label:'Cormorant Garamond',family:'"Cormorant Garamond", Georgia, serif',category:'Editorial'},
 {id:'playfair',label:'Playfair Display',family:'"Playfair Display", Georgia, serif',category:'Editorial'},
 {id:'fraunces',label:'Fraunces',family:'"Fraunces", Georgia, serif',category:'Editorial'},
 {id:'bodoni',label:'Bodoni Moda',family:'"Bodoni Moda", Georgia, serif',category:'Editorial'},
 {id:'libre',label:'Libre Baskerville',family:'"Libre Baskerville", Georgia, serif',category:'Editorial'},
 {id:'outfit',label:'Outfit',family:'Outfit, Arial, sans-serif',category:'Moderna'},
 {id:'manrope',label:'Manrope',family:'Manrope, Arial, sans-serif',category:'Moderna'},
 {id:'syne',label:'Syne',family:'Syne, Arial, sans-serif',category:'Moderna'},
 {id:'space',label:'Space Grotesk',family:'"Space Grotesk", Arial, sans-serif',category:'Moderna'},
 {id:'caveat',label:'Caveat · a mano',family:'Caveat, cursive',category:'A mano'},
] as const;
export type CarouselFont=typeof CAROUSEL_FONTS[number]['id'];
export function isCarouselFont(value:unknown):value is CarouselFont{
 return CAROUSEL_FONTS.some(font=>font.id===value);
}
export function carouselFontFamily(value:CarouselFont,brandHeadingFont?:string):string{
 if(value!=='brand')return CAROUSEL_FONTS.find(font=>font.id===value)?.family||'Georgia, serif';
 const key=(brandHeadingFont||'').toLowerCase();
 return key==='prompt'?'Prompt, Arial, sans-serif':
  key==='futura'?'Futura, Arial, sans-serif':
  key==='dm serif display'?'"DM Serif Display", Georgia, serif':
  key==='cormorant garamond'?'"Cormorant Garamond", Georgia, serif':
  key==='space grotesk'?'"Space Grotesk", Arial, sans-serif':'Georgia, serif';
}
export type CarouselStyle={
  mood:CarouselMood;
  font:CarouselFont;
  referenceAssetId:string;
  accentSource:'brand'|'reference';
  referenceColor:string;
  targetPlatform:'brand'|SocialPlatform;
  seamlessEnabled:boolean;
  perSlideBackgrounds:boolean;
  seamlessBackgroundId:FreeBackgroundId;
  seamlessAssetId:string;
  panoramaLayers?:PanoramaLayer[];
  lockedLayerIds?:string[];
  freeCanvas:boolean;
  editorialRhythm:boolean;
  canvasColor:string;
  canvasGradient:string;
};
export const DEFAULT_CAROUSEL_STYLE:CarouselStyle={
  mood:'editorial',font:'brand',referenceAssetId:'',
  accentSource:'brand',referenceColor:'',targetPlatform:'brand',seamlessEnabled:false,perSlideBackgrounds:false,seamlessBackgroundId:'brand',seamlessAssetId:'',
  freeCanvas:true,editorialRhythm:false,canvasColor:'#FFFFFF',canvasGradient:''
};
export function normalizeCarouselStyle(value:unknown):CarouselStyle{
  const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
  return {
    mood:['editorial','soft','bold','dark'].includes(String(v.mood))?v.mood as CarouselMood:'editorial',
    font:isCarouselFont(v.font)?v.font:'brand',
    referenceAssetId:typeof v.referenceAssetId==='string'?v.referenceAssetId.slice(0,110):'',
    accentSource:v.accentSource==='reference'?'reference':'brand',
    referenceColor:typeof v.referenceColor==='string'&&/^#[0-9A-F]{6}$/i.test(v.referenceColor)?v.referenceColor:'',
    targetPlatform:['brand','instagram','facebook','tiktok','threads','youtube','pinterest','linkedin'].includes(String(v.targetPlatform))?v.targetPlatform as CarouselStyle['targetPlatform']:'brand',
    seamlessEnabled:v.seamlessEnabled===true,
    perSlideBackgrounds:v.perSlideBackgrounds===true,
    seamlessBackgroundId:FREE_BACKGROUNDS.some(b=>b.id===v.seamlessBackgroundId)?v.seamlessBackgroundId as FreeBackgroundId:'soft-gradient',
    seamlessAssetId:typeof v.seamlessAssetId==='string'?v.seamlessAssetId.slice(0,120):'',
    freeCanvas:v.freeCanvas!==false,
    editorialRhythm:v.editorialRhythm===true,
    canvasColor:typeof v.canvasColor==='string'&&/^#[0-9a-f]{6}$/i.test(v.canvasColor)?v.canvasColor:'#FFFFFF',
    canvasGradient:typeof v.canvasGradient==='string'&&/^#[0-9a-f]{6}$/i.test(v.canvasGradient)?v.canvasGradient:'',
    panoramaLayers:normalizePanoramaLayers(v.panoramaLayers),
    lockedLayerIds:Array.isArray(v.lockedLayerIds)?v.lockedLayerIds.filter((id:unknown)=>typeof id==='string').slice(0,55):[]
  };
}
export function readCarouselDesign(value:string):{slides:unknown[]|null;style:CarouselStyle}{
  try{
    const parsed=JSON.parse(value);
    if(Array.isArray(parsed))return {slides:parsed,style:{...DEFAULT_CAROUSEL_STYLE}};
    if(parsed&&typeof parsed==='object'&&parsed.version===2&&Array.isArray(parsed.slides)){
      return {slides:parsed.slides,style:normalizeCarouselStyle(parsed.style)};
    }
  }catch{/* Legacy empty drafts use text rows. */}
  return {slides:null,style:{...DEFAULT_CAROUSEL_STYLE}};
}
export function encodeCarouselDesign(slides:unknown[],style:CarouselStyle):string{
  return JSON.stringify({version:2,slides:slides.slice(0,8),style:normalizeCarouselStyle(style)});
}
const safe=(s:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(s)?s:fallback;
const channels=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const toHex=(c:number)=>Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0');
export function blendColors(a:string,b:string,weight:number){
  const left=channels(safe(a,'#FAF8F3')),right=channels(safe(b,'#FFFFFF'));
  const w=Math.max(0,Math.min(1,weight));
  return '#'+left.map((v,i)=>toHex(v*(1-w)+right[i]*w)).join('');
}
export function readableColor(color:string){
  const [r,g,b]=channels(safe(color,'#FAF8F3'));
  const lum=(c:number)=>{const v=c/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
  return .2126*lum(r)+.7152*lum(g)+.0722*lum(b)>.26?'#191919':'#FFFFFF';
}
export function getCarouselPalette(brand:BrandIdentity,style:CarouselStyle,slideAccentIndex=0){
  const colors=brandPalette(brand);
  const source=safe(brand.color,'#BED8E9');
  const ref=safe(style.referenceColor,source);
  // Default is one shared accent; alternate colors are opt-in per-slide.
  const chosen=slideAccentIndex>0&&slideAccentIndex<colors.length?colors[slideAccentIndex]:null;
  const accent=chosen||((style.accentSource==='reference')?ref:source);
  const base=safe(brand.background,'#FAF8F3');
  const paper=style.mood==='dark'?'#191919':style.mood==='soft'?blendColors(base,accent,.12):style.mood==='bold'?blendColors(base,'#FFFFFF',.45):base;
  return {paper,accent,ink:readableColor(paper),onAccent:readableColor(accent),
    muted:style.mood==='dark'?blendColors('#191919',accent,.16):blendColors(paper,accent,.14),
    outline:style.mood==='dark'?blendColors('#191919','#FFFFFF',.3):blendColors(paper,'#191919',.14)};
}
export async function sampleReferencePalette(url:string):Promise<{color:string;mood:CarouselMood;summary:string}>{
  const img=new Image();img.src=url;
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error('No se pudo analizar la referencia.'))});
  const canvas=document.createElement('canvas');canvas.width=36;canvas.height=36;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Sin acceso al analizador visual.');
  ctx.drawImage(img,0,0,36,36);
  const pixels=ctx.getImageData(0,0,36,36).data;
  const buckets=new Map<string,{n:number;r:number;g:number;b:number;score:number}>();
  let n=0,lum=0,sat=0;
  for(let p=0;p<pixels.length;p+=4){
    const [r,g,b,a]=[pixels[p],pixels[p+1],pixels[p+2],pixels[p+3]];
    if(a<180)continue;
    const bright=(r+g+b)/765;const delta=(Math.max(r,g,b)-Math.min(r,g,b))/255;
    lum+=bright;sat+=delta;n++;
    if(bright<.12||bright>.92||delta<.12)continue;
    const key=[r,g,b].map(x=>Math.floor(x/42)).join('-');
    const weight=.4+delta;
    const value=buckets.get(key)||{n:0,r:0,g:0,b:0,score:0};
    value.n++;value.r+=r;value.g+=g;value.b+=b;value.score+=weight;
    buckets.set(key,value);
  }
  const average=n?lum/n:.8,chromatic=n?sat/n:0;
  const mood:CarouselMood=average<.42?'dark':chromatic>.28?'bold':average>.74?'soft':'editorial';
  const dominant=[...buckets.values()].sort((a,b)=>b.score-a.score)[0];
  const color=dominant?'#'+[dominant.r,dominant.g,dominant.b].map(x=>toHex(x/dominant.n)).join(''):'#B8C4CE';
  const summary=mood==='dark'?'Contraste oscuro':mood==='bold'?'Acentos más intensos':mood==='soft'?'Fondos suaves y claros':'Tonos editoriales equilibrados';
  return {color,mood,summary};
}
