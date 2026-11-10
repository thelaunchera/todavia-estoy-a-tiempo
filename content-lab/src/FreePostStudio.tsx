import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ImagePlus,Type,Layers3,Upload,Download,Paintbrush,Undo2,Redo2,Shapes,Check,Clock3,AlertCircle,Copy,LockKeyhole,LockKeyholeOpen} from 'lucide-react';
import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {paintPanoramaLayers,panoramaFont,panoramaTextWeight,type PanoramaLayer,type LayerMove} from './PanoramaLayers';
import {clampRect,clampFreePhotoRect,paintCoverImage,type TouchRect} from './TouchGeometry';
import {coverPlacement} from './PhotoCrop';
import TouchLayerCanvas,{type TouchLayer} from './TouchLayerCanvas';
import FreeDecorControls from './FreeDecorControls';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import {readCoverDecor,type CoverDecor} from './CoverDecor';
import {downloadLosslessPng,sourceAwareScale} from './ExportQuality';
import './FreePostStudio.css';

type Post={title:string;hook:string;cta:string;template:string;assetId:string;format?:string;designData?:string};
type Brand={id?:string;name:string;color:string;background:string;headingFont?:string};
type Point={x:number;y:number};
type Props={
 post:Post;brand:Brand;assets:LibraryAsset[];images:Record<string,string>;
 onChange:(next:CoverDecor)=>void;onTitle:(text:string)=>void;
 onUpload:(file:File)=>Promise<LibraryAsset|null>;loadImage:(id:string)=>void;
 onOpenStickers:()=>void;onUploadBackground:(file:File)=>Promise<LibraryAsset|null>;
 notify:(message:string)=>void;locale:'es'|'en';
 onSave?:()=>void;saving?:boolean;saveState?:'saved'|'unsaved'|'saving'|'offline';
};
const plain=(en:string,es:string,locale:'es'|'en')=>locale==='es'?es:en;
function uniqueId(){return 'free-'+crypto.randomUUID();}
function legacyStickers(decor:CoverDecor):PanoramaLayer[]{
 return decor.stickerIds.filter(id=>!decor.layers.some(layer=>layer.assetId===id))
  .map((id,n)=>({id:'legacy-sticker-'+id,assetId:id,name:'Sticker',kind:'sticker',locked:(decor.lockedStickerIds||[]).includes(id),tint:decor.stickerTints?.[id],
   opacity:decor.stickerOpacities?.[id]??1,
   rect:decor.stickerPositions[id]||{x:.1+(n*.19),y:.7,w:.18,h:.18}}));
}
export function coverLayers(post:Post,brand:Brand,decor:CoverDecor):PanoramaLayer[]{
 const layers:PanoramaLayer[]=[];
 if(post.assetId&&post.assetId!==decor.backgroundImageId&&
    !decor.layers.some(layer=>layer.role==='background'&&layer.assetId===post.assetId))
  layers.push({id:'main-photo',assetId:post.assetId,name:'Foto principal',kind:'photo',
   locked:decor.primaryPhotoLocked===true,opacity:decor.primaryPhotoOpacity??1,
   tintColor:decor.primaryPhotoTintColor,tintStrength:decor.primaryPhotoTintStrength,
   rect:decor.primaryPhotoRect||{x:.16,y:.34,w:.68,h:.55}});
 const title=post.hook;
 if(title.trim())layers.push({id:'main-title',assetId:'',name:'Título',kind:'text',text:title,
   font:decor.headlineStyle?.font||brand.headingFont?.toLowerCase()||'serif',
   fontSize:decor.headlineStyle?.fontSize||84,fontWeight:decor.headlineStyle?.fontWeight||700,lineHeight:decor.headlineStyle?.lineHeight||1.12,
   spacing:decor.headlineStyle?.spacing||0,color:decor.headlineStyle?.color||'#191919',
   shadow:decor.headlineStyle?.shadow,outline:decor.headlineStyle?.outline,locked:decor.headlineLocked===true,
   opacity:decor.headlineStyle?.opacity??1,
   rect:decor.headlineRect||{x:.08,y:.11,w:.84,h:.23}});
 // Preserve creation order: user-added images/text remain above older items.
 // Only a deliberate "Send behind" action places a layer underneath the title.
 const back=decor.layers.filter(l=>l.role==='background'||l.placement==='behind-text');
 const front=decor.layers.filter(l=>l.role!=='background'&&l.placement!=='behind-text');
 const defaultOrder=[...back,...layers,...legacyStickers(decor),...front];
 // A single explicit order includes legacy stickers and the original photo/title.
 // Keep new layers on top without resetting the customer's existing stack.
 if(!decor.layerOrder?.length)return defaultOrder;
 const rank=new Map(decor.layerOrder.map((id,index)=>[id,index]));
 const known=defaultOrder.filter(layer=>rank.has(layer.id))
   .sort((a,b)=>rank.get(a.id)!-rank.get(b.id)!);
 const fresh=defaultOrder.filter(layer=>!rank.has(layer.id));
 // Keep the wallpaper behind the saved creation order, even for older projects.
 return [...known,...fresh].sort((a,b)=>Number(b.role==='background')-Number(a.role==='background'));
}
export const freePostDimensions=(format?:string)=>format==='Reel'||format==='Story'?{width:1080,height:1920}:{width:1080,height:1350};
async function backdrop(ctx:CanvasRenderingContext2D,decor:CoverDecor,images:Record<string,string>,width:number,height:number){
 const {backgroundImageId,backgroundId,color,gradient}=decor;
 if(backgroundImageId){
  const img=images[backgroundImageId];
  if(!img)throw Error('La foto de fondo aún se está cargando. Intenta descargar de nuevo.');
  await paintCoverImage(ctx,img,width,height);return;
 }
 if(backgroundId&&backgroundId!=='brand'){paintFreeBackground(ctx,width,height,backgroundId);return}
 if(gradient){
  const g=ctx.createLinearGradient(0,0,width,height);
  g.addColorStop(0,color||'#FFFFFF');g.addColorStop(1,gradient);
  ctx.fillStyle=g;
 }else ctx.fillStyle=color||'#FFFFFF';
 ctx.fillRect(0,0,width,height);
}
export async function renderFreePost(post:Post,brand:Brand,images:Record<string,string>,
 omitLayers=false,pixelScale=1):Promise<HTMLCanvasElement>{
 const decor=readCoverDecor(post.designData);
 const {width,height}=freePostDimensions(post.format);
 const canvas=document.createElement('canvas');canvas.width=width*pixelScale;canvas.height=height*pixelScale;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo crear el lienzo.');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.scale(pixelScale,pixelScale);
 await backdrop(ctx,decor,images,width,height);
 if(!omitLayers)await paintPanoramaLayers(ctx,width,height,coverLayers(post,brand,decor),images);
 return canvas;
}
export async function exportFreePost(post:Post,brand:Brand,images:Record<string,string>){
 const decor=readCoverDecor(post.designData);
 const {width,height}=freePostDimensions(post.format);
 const ids=[post.assetId,decor.backgroundImageId,...decor.stickerIds,...decor.layers.map(layer=>layer.assetId)];
 const scale=await sourceAwareScale(ids.map(id=>images[id]),width,height);
 const canvas=await renderFreePost(post,brand,images,false,scale);
 try{await downloadLosslessPng(canvas,(post.title||'mi-post').replace(/[^a-z0-9-_]/gi,'-').slice(0,50))}
 finally{canvas.width=1;canvas.height=1}
}
function MediaThumbnail({asset,src,loadImage}:{asset:LibraryAsset;src?:string;loadImage:(id:string)=>void}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(src)return;const node=ref.current;if(!node)return;
  if(typeof IntersectionObserver==='undefined'){loadImage(asset.id);return}
  const observer=new IntersectionObserver(entries=>{if(entries.some(item=>item.isIntersecting)){
   loadImage(asset.id);observer.disconnect();
  }},{rootMargin:'110px'});
  observer.observe(node);return()=>observer.disconnect();
 },[asset.id,src,loadImage]);
 return <span className="free-post-media-preview" ref={ref}>{src?
  <img src={src} alt={displayAssetName(asset)} loading="lazy" draggable={false}/>:
  <span className="free-post-media-skeleton" aria-label="Cargando miniatura"/>}</span>;
}
export default function FreePostStudio({post,brand,assets,images,onChange,onTitle,onUpload,loadImage,
 onOpenStickers,onUploadBackground,notify,locale,onSave,saving=false,saveState='saved'}:Props){
 const decor=readCoverDecor(post.designData);
 const [preview,setPreview]=useState(''),[error,setError]=useState('');
 const [mediaOpen,setMediaOpen]=useState(false);
 const [mediaTab,setMediaTab]=useState<'sticker'|'photo'>('sticker');
 const [mediaQuery,setMediaQuery]=useState('');
 const [recentMedia,setRecentMedia]=useState<string[]>([]);
 const [backgroundOpen,setBackgroundOpen]=useState(false);
 const [layersOpen,setLayersOpen]=useState(false);
 const [history,setHistory]=useState<CoverDecor[]>([]);
 const [future,setFuture]=useState<CoverDecor[]>([]);
 const [busy,setBusy]=useState(false);
 const [focusLayerId,setFocusLayerId]=useState('');
 const [selectedLayerId,setSelectedLayerId]=useState<string|null>(null);
 const photosRef=useRef<HTMLInputElement>(null),backgroundRef=useRef<HTMLInputElement>(null);
 const layers=useMemo(()=>coverLayers(post,brand,decor),[post.designData,post.assetId,post.hook,post.title,brand.headingFont]);
 const selectedLayer=layers.find(layer=>layer.id===selectedLayerId)||null;
 const vertical=post.format==='Reel'||post.format==='Story';
 const needed=[post.assetId,decor.backgroundImageId,...decor.stickerIds,...decor.layers.map(l=>l.assetId)].filter(Boolean);
 useEffect(()=>{needed.forEach(id=>{if(!images[id])loadImage(id)})},[needed.join('|')]);
 useEffect(()=>{
  let alive=true;
  const run=async()=>{
   try{const c=await renderFreePost(post,brand,images,true);
    if(alive){setPreview(c.toDataURL('image/png'));setError('')}}
   catch(e){if(alive){setError(e instanceof Error?e.message:'No se pudo preparar el fondo.');setPreview('')}}
  };
  void run();return()=>{alive=false};
 },[post.designData,post.assetId,post.format,images,brand.color,brand.background]);
 const update=(next:CoverDecor)=>{
  setHistory(p=>[...p.slice(-24),decor]);setFuture([]);onChange(next);
 };
 const undo=()=>{
  const past=history[history.length-1];if(!past)return;
  setFuture(f=>[...f,decor]);setHistory(h=>h.slice(0,-1));onChange(past);
 };
 const redo=()=>{
  const next=future[future.length-1];if(!next)return;
  setHistory(h=>[...h,decor]);setFuture(f=>f.slice(0,-1));onChange(next);
 };
 const addAsset=(assetId:string,point:Point={x:.5,y:.5})=>{
  const asset=assets.find(a=>a.id===assetId);if(!asset)return;
  if(decor.layers.length>=22){notify(plain('Maximum 22 layers','Máximo 22 elementos por post',locale));return}
  if(!images[assetId])loadImage(assetId);
  const sticker=assetCategory(asset)==='sticker';
  const id=uniqueId();setFocusLayerId(id);
  // Larger initial sticker size, without modifying saved projects or photographs.
  const width=sticker?.4:.46,height=sticker?.34:.40;
  setRecentMedia(old=>[assetId,...old.filter(value=>value!==assetId)].slice(0,12));
  update({...decor,layers:[...decor.layers,{id,assetId,
    name:displayAssetName(asset),kind:sticker?'sticker':'photo',
    placement:'front',rect:clampFreePhotoRect({x:point.x-width/2,y:point.y-height/2,w:width,h:height})}]});
  if(window.matchMedia('(max-width:799px)').matches)setMediaOpen(false);
 };
 const addElement=(kind:'text'|'shape',shape:PanoramaLayer['shape']='paper')=>{
  if(kind==='text'){
   const starter=decor.layers.find(l=>l.kind==='text'&&['Escribe aquí','Write here',''].includes((l.text||'').trim()));
   if(starter){setFocusLayerId(starter.id);notify(plain('Edit the selected text on the canvas.','Edita este texto directamente en el lienzo.',locale));return}
  }
  if(decor.layers.length>=22){notify(plain('Maximum 22 layers','Máximo 22 elementos por post',locale));return}
  const id=uniqueId();setFocusLayerId(id);
  update({...decor,layers:[...decor.layers,
   kind==='text'?{id,kind:'text',assetId:'',name:'Texto libre',
     text:plain('Write here','Escribe aquí',locale),font:'serif',fontSize:80,fontWeight:700,color:'#191919',
     rect:{x:.1,y:.42,w:.8,h:.23}}:
   {id,kind:'shape',assetId:'',name:'Collage',shape,color:'#F1E5D2',
     rect:{x:.22,y:.43,w:.56,h:shape==='tape'?.08:.32}}]});
 };
 const addPosterTitle=()=>{
  const existing=decor.layers.find(l=>l.kind==='text'&&l.font==='poster');
  if(existing){setFocusLayerId(existing.id);notify('Ya tienes texto póster; edítalo en la publicación.');return}
  if(post.hook.trim()){
   update({...decor,headlineStyle:{...decor.headlineStyle,font:'poster',fontSize:116,fontWeight:900,lineHeight:.98}});
   setFocusLayerId('main-title');return;
  }
  if(decor.layers.length>=22){notify('Máximo 22 elementos por post');return;}
  const id=uniqueId();setFocusLayerId(id);
  update({...decor,layers:[...decor.layers,{
   id,kind:'text',assetId:'',name:'Texto póster',font:'poster',fontSize:116,
   fontWeight:900,color:'#191919',lineHeight:.98,spacing:-1,
   text:plain('YOUR BIG IDEA','TU GRAN IDEA',locale),
   rect:{x:.065,y:.36,w:.87,h:.29}
  }]});
  notify('Texto póster añadido. Tócalo y arrástralo; puedes cambiar su color.');
 };
 const fitNewText=(layer:PanoramaLayer,text:string):Partial<PanoramaLayer>=>{
   const size=layer.fontSize||76,ratio=freePostDimensions(post.format).height;
   const current=layer.rect;
   const ctx=document.createElement('canvas').getContext('2d');
   if(!ctx)return {text};
   const width=Math.max(50,current.w*1080-18);
   const leading=Math.max(.7,Math.min(2,layer.lineHeight||1.12));
   const maxHeight=Math.max(.16,1-Math.max(0,current.y));
   let fitSize=size;
   const countLines=(px:number)=>{
     ctx.font=panoramaTextWeight(layer.fontWeight)+' '+px+'px '+panoramaFont(layer.font);
     ctx.letterSpacing=(layer.spacing||0)+'px';
     let lines=0;
     for(const paragraph of text.split('\n')){
       const words=paragraph.split(/\s+/).filter(Boolean);
       if(!words.length){lines++;continue}
       let line='';
       for(const word of words){const next=line?line+' '+word:word;
         if(line&&ctx.measureText(next).width>width){lines++;line=word}else line=next;}
       lines++;
     }
     return Math.max(1,lines);
   };
   while(fitSize>20&&countLines(fitSize)*fitSize*leading+20>maxHeight*ratio)fitSize-=2;
   const targetH=Math.max(.09,Math.min(1,(countLines(fitSize)*fitSize*leading+22)/ratio));
   const y=Math.min(Math.max(0,current.y),Math.max(0,1-targetH));
   return {text,fontSize:fitSize,rect:clampFreePhotoRect({...current,y,h:targetH})};
 };
 const updateLayer=(id:string,patch:Partial<PanoramaLayer>)=>{
  const currentLayer=layers.find(layer=>layer.id===id);
  if(currentLayer?.locked)return;
  if(patch.text!==undefined&&currentLayer?.kind==='text'){
    patch={...fitNewText(currentLayer,patch.text),...patch};
  }
  if(id==='main-photo'){
   const effect:Partial<CoverDecor>={};
   if(typeof patch.opacity==='number')effect.primaryPhotoOpacity=Math.max(0,Math.min(1,patch.opacity));
   if('tintColor' in patch)effect.primaryPhotoTintColor=patch.tintColor;
   if('tintStrength' in patch)effect.primaryPhotoTintStrength=patch.tintStrength;
   if(Object.keys(effect).length)update({...decor,...effect});
   return;
  }
  if(id.startsWith('legacy-sticker-')){
   const asset=id.slice('legacy-sticker-'.length);
   // Upgrade only the selected legacy sticker to a true editable layer.
   // Reuse its ID and geometry; the asset stays private and is never duplicated.
   if('tintColor' in patch||'tintStrength' in patch){
    if(!currentLayer)return;
    const edited:PanoramaLayer={...currentLayer,...patch,tint:undefined};
    update({...decor,stickerIds:decor.stickerIds.filter(value=>value!==asset),
      layers:[...decor.layers,edited]});
    return;
   }
   if(typeof patch.opacity==='number')update({...decor,
     stickerOpacities:{...decor.stickerOpacities,[asset]:Math.max(0,Math.min(1,patch.opacity))}});
   if(patch.tint!==undefined){
    const tints={...decor.stickerTints};
    if(/^#[0-9a-f]{6}$/i.test(patch.tint))tints[asset]=patch.tint;
    else delete tints[asset];
    update({...decor,stickerTints:tints});
   }
   return;
  }
  if(id==='main-title'){
   if(patch.text!==undefined)onTitle(patch.text);
   const {text:unused,rect:nextRect,...styling}=patch;
   void unused;
   if(Object.keys(styling).length||nextRect)update({...decor,
     ...(nextRect?{headlineRect:clampFreePhotoRect(nextRect)}:{}),
     headlineStyle:{...decor.headlineStyle,...styling}});
   return;
  }
  update({...decor,layers:decor.layers.map(l=>l.id===id?{...l,...patch}:l)});
 };
 const commit=(kind:PanoramaLayer['kind'],id:string,rect:TouchRect)=>{
  if(layers.find(layer=>layer.id===id)?.locked)return;
  if(id==='main-title')update({...decor,headlineRect:clampFreePhotoRect(rect)});
  else if(id==='main-photo')update({...decor,primaryPhotoRect:clampFreePhotoRect(rect)});
  else if(id.startsWith('legacy-sticker-')){
   const original=id.slice('legacy-sticker-'.length);
   update({...decor,stickerPositions:{...decor.stickerPositions,[original]:clampFreePhotoRect(rect)}});
  }else update({...decor,layers:decor.layers.map(l=>l.id===id?{...l,rect:clampFreePhotoRect(rect)}:l)});
 };
 const toggleLock=(id:string,locked:boolean)=>{
  if(id==='main-title'){update({...decor,headlineLocked:locked});return}
  if(id==='main-photo'){update({...decor,primaryPhotoLocked:locked});return}
  if(id.startsWith('legacy-sticker-')){
   const asset=id.slice('legacy-sticker-'.length),ids=decor.lockedStickerIds||[];
   update({...decor,lockedStickerIds:locked?[...new Set([...ids,asset])]:ids.filter(x=>x!==asset)});return;
  }
  update({...decor,layers:decor.layers.map(l=>l.id===id?{...l,locked}:l)});
 };
 const duplicateElement=(id:string)=>{
  if(decor.layers.length>=22){notify(plain('Maximum 22 layers','Máximo 22 elementos por post',locale));return}
  const original=layers.find(layer=>layer.id===id);
  if(!original)return;
  const cloneId=uniqueId();
  const clone:PanoramaLayer={...original,id:cloneId,locked:false,role:undefined,
    name:original.name+' · copia',
    rect:clampFreePhotoRect({...original.rect,x:original.rect.x+.025,y:original.rect.y+.025})};
  const ordered=layers.map(layer=>layer.id);
  ordered.splice(ordered.indexOf(id)+1,0,cloneId);
  update({...decor,layers:[...decor.layers,clone],layerOrder:ordered});
  setFocusLayerId(cloneId);
  notify(plain('Element duplicated','Elemento duplicado',locale));
 };
 const duplicateText=(id:string)=>duplicateElement(id);
 const remove=(id:string)=>{
  if(layers.find(layer=>layer.id===id)?.locked)return;
  if(id==='main-title'){onTitle('');return}
  if(id==='main-photo'){notify(plain('Use Remove photo above','Usa Quitar foto en el panel superior',locale));return}
  if(id.startsWith('legacy-sticker-')){
   const original=id.slice('legacy-sticker-'.length);
   update({...decor,stickerIds:decor.stickerIds.filter(x=>x!==original)});return;
  }
  update({...decor,layers:decor.layers.filter(l=>l.id!==id)});
 };
 const reorder=(id:string,move:LayerMove)=>{
  if(layers.find(layer=>layer.id===id)?.locked)return;
  const ordered=layers.map(layer=>layer.id);
  const index=ordered.indexOf(id);if(index<0)return;
  ordered.splice(index,1);
  const destination=move==='back'?0:move==='front'?ordered.length:
    Math.max(0,Math.min(ordered.length,index+(move==='forward'?1:-1)));
  ordered.splice(destination,0,id);
  // One saved source of truth drives both preview stacking and PNG rendering.
  update({...decor,layerOrder:ordered});
 };
 const cleanStarterTexts=()=>{
  const samples=new Set(['escribe aquí','write here','tu gran idea','your big idea']);
  const extras=decor.layers.filter(l=>l.kind==='text'&&samples.has((l.text||'').trim().toLocaleLowerCase('es')));
  if(!extras.length){notify('No quedan textos de ejemplo adicionales.');return}
  update({...decor,layers:decor.layers.filter(l=>!extras.some(x=>x.id===l.id))});setFocusLayerId('');
  notify(extras.length+' textos de ejemplo retirados. Los textos que escribiste se conservaron.');
 };
 const uploadPhotos=async(files:File[],point:Point={x:.5,y:.5})=>{
  setBusy(true);
  try{
   // Every upload resolves to a separate movable photo rather than replacing the first one.
   const additions:PanoramaLayer[]=[];
   for(const file of files.slice(0,6)){
    const item=await onUpload(file);if(!item)continue;
    const n=additions.length;
    const width=.48,height=.38;
    additions.push({id:uniqueId(),assetId:item.id,name:displayAssetName(item),kind:'photo',
      rect:clampRect({x:point.x-width/2+n*.035,y:point.y-height/2+n*.035,w:width,h:height})});
   }
   if(additions.length){update({...decor,layers:[...decor.layers,...additions].slice(-22)});setFocusLayerId(additions[additions.length-1].id)};
  }finally{setBusy(false)}
 };
 const editImageBackground=(assetId:string)=>{
  if(!assetId)return;
  if(!images[assetId])loadImage(assetId);
  const existing=decor.layers.find(layer=>layer.role==='background');
  if(!existing&&decor.layers.length>=22){notify(plain('Maximum 22 layers','Máximo 22 elementos por post',locale));return}
  const id=existing?.id||uniqueId();
  const wallpaper:PanoramaLayer={
   ...(existing||{}),id,assetId,name:'Fondo editable',kind:'photo',
   role:'background',backgroundFit:'cover',placement:'behind-text',locked:false,
   rect:existing?.rect||{x:0,y:0,w:1,h:1,angle:0,cornerRadius:0},
  };
  update({...decor,backgroundId:'brand',backgroundImageId:'',
   layers:[wallpaper,...decor.layers.filter(layer=>layer.role!=='background')]});
  setFocusLayerId(id);setBackgroundOpen(false);
  notify(plain('Background ready to resize','Fondo listo: muévelo, pellizca o usa la esquina para agrandarlo.',locale));
 };
 const chooseBackground=async(file?:File)=>{
  if(!file)return;setBusy(true);
  try{const asset=await onUploadBackground(file);
   if(asset)editImageBackground(asset.id);}
  finally{setBusy(false)}
 };
 const allowed=assets.filter(a=>assetCategory(a)!=='background');
 const visibleMedia=allowed.filter(asset=>(mediaTab==='sticker'?assetCategory(asset)==='sticker':assetCategory(asset)!=='sticker')
  &&displayAssetName(asset).toLocaleLowerCase('es').includes(mediaQuery.trim().toLocaleLowerCase('es')))
  .sort((a,b)=>(recentMedia.indexOf(a.id)===-1?999:recentMedia.indexOf(a.id))-
    (recentMedia.indexOf(b.id)===-1?999:recentMedia.indexOf(b.id))).slice(0,90);
 const touchLayers:TouchLayer[]=layers.map(l=>({...l,src:images[l.assetId]||''}));
 return <section className={'free-post-studio'+(mediaOpen||backgroundOpen||layersOpen?' with-media':'')} aria-label={plain('Free post editor','Editor libre de publicaciones',locale)}>
  <div className="free-post-tools" role="toolbar" aria-label={plain('Editing tools','Herramientas de edición',locale)}>
   <button type="button" title={plain('Add photos','Añadir fotos',locale)} aria-label={plain('Add photos','Añadir fotos',locale)}
     onClick={()=>photosRef.current?.click()} disabled={busy}><ImagePlus size={21}/><span>{plain('Photos','Fotos',locale)}</span></button>
   <button type="button" onClick={()=>addElement('text')}><Type size={21}/><span>{plain('Text','Texto',locale)}</span></button>
   <button type="button" aria-pressed={mediaOpen&&mediaTab==='sticker'}
     onClick={()=>{const isOpen=mediaOpen&&mediaTab==='sticker';setMediaTab('sticker');setMediaOpen(!isOpen);setBackgroundOpen(false);setLayersOpen(false)}}>
     <Shapes size={21}/><span>Stickers</span></button>
   <button type="button" aria-pressed={layersOpen} onClick={()=>{setLayersOpen(v=>!v);setMediaOpen(false);setBackgroundOpen(false)}}>
     <Layers3 size={21}/><span>{plain('Layers','Capas',locale)}</span></button>
   <button type="button" aria-pressed={backgroundOpen} onClick={()=>{setBackgroundOpen(v=>!v);setMediaOpen(false);setLayersOpen(false)}}>
     <Paintbrush size={21}/><span>{plain('Background','Fondo',locale)}</span></button>
  </div>
  <div className="free-post-utility-bar">
   <span className={'free-post-save-state '+saveState} role="status" aria-live="polite">
    {saveState==='saved'?<Check size={14}/>:saveState==='offline'?<AlertCircle size={14}/>:<Clock3 size={14}/>}
    {plain(
      saveState==='saved'?'Autosaved':saveState==='saving'?'Saving…':saveState==='offline'?'Saved on this device':'Unsaved changes',
      saveState==='saved'?'Guardado automático':saveState==='saving'?'Guardando…':saveState==='offline'?'Guardado en este dispositivo':'Cambios pendientes',locale)}
   </span>
   <div className="free-post-utility-actions">
    <button type="button" disabled={!history.length} onClick={undo} title={plain('Undo','Deshacer',locale)}
      aria-label={plain('Undo','Deshacer',locale)}><Undo2 size={19}/></button>
    <button type="button" disabled={!future.length} onClick={redo} title={plain('Redo','Rehacer',locale)}
      aria-label={plain('Redo','Rehacer',locale)}><Redo2 size={19}/></button>
    <details className="free-post-more-menu">
      <summary aria-label={plain('More tools','Más herramientas',locale)}>···</summary>
      <div>
        <button type="button" onClick={addPosterTitle}>{plain('Poster bold','Texto póster BOLD',locale)}</button>
        {decor.layers.some(l=>l.kind==='text'&&['escribe aquí','write here','tu gran idea','your big idea'].includes((l.text||'').trim().toLocaleLowerCase('es')))&&
          <button type="button" onClick={cleanStarterTexts}>{plain('Clear sample texts','Quitar textos de ejemplo',locale)}</button>}
      </div>
    </details>
   </div>
  </div>
  {vertical&&selectedLayer&&<div className="free-post-selected-actions" role="group" aria-label={plain('Selected element tools','Acciones del elemento seleccionado',locale)}>
    <div className="free-post-selected-heading"><strong>{selectedLayer.name}</strong><span>{selectedLayer.locked?plain('Locked','Bloqueado',locale):plain('Selected','Seleccionado',locale)}</span></div>
    <div className="free-post-selected-buttons">
      <button type="button" onClick={()=>duplicateElement(selectedLayer.id)} title={plain('Duplicate element','Duplicar elemento',locale)}><Copy size={15}/>{plain('Duplicate','Duplicar',locale)}</button>
      <button type="button" disabled={selectedLayer.locked} onClick={()=>reorder(selectedLayer.id,'back')} title={plain('Send to back','Enviar al fondo',locale)}>{plain('To back','Al fondo',locale)}</button>
      <button type="button" disabled={selectedLayer.locked} onClick={()=>reorder(selectedLayer.id,'backward')} title={plain('Back one layer','Bajar una capa',locale)}>{plain('Back','Atrás',locale)}</button>
      <button type="button" disabled={selectedLayer.locked} onClick={()=>reorder(selectedLayer.id,'forward')} title={plain('Forward one layer','Subir una capa',locale)}>{plain('Forward','Delante',locale)}</button>
      <button type="button" disabled={selectedLayer.locked} onClick={()=>reorder(selectedLayer.id,'front')} title={plain('Bring to front','Traer al frente',locale)}>{plain('To front','Al frente',locale)}</button>
      <button type="button" aria-pressed={!!selectedLayer.locked} onClick={()=>toggleLock(selectedLayer.id,!selectedLayer.locked)}>{selectedLayer.locked?<LockKeyholeOpen size={15}/>:<LockKeyhole size={15}/>}{selectedLayer.locked?plain('Unlock','Desbloquear',locale):plain('Lock','Bloquear',locale)}</button>
    </div>
    <div className="free-post-selection-colors" role="group" aria-label={plain('Change element color','Cambiar color de elemento',locale)}>
      <label>{plain('Color','Color',locale)} <input type="color" disabled={selectedLayer.locked} aria-label={plain('Element color','Color del elemento',locale)}
        value={selectedLayer.kind==='photo'||selectedLayer.kind==='sticker'?(selectedLayer.tintColor||selectedLayer.tint||'#B74670'):(selectedLayer.color||'#191919')}
        onChange={e=>updateLayer(selectedLayer.id,selectedLayer.kind==='photo'||selectedLayer.kind==='sticker'
          ?{tintColor:e.target.value,tintStrength:selectedLayer.tintStrength??.38,tint:undefined}:{color:e.target.value})}/></label>
      {[...new Set([brand.color||'#244B5B','#191919','#FAF8F3','#FFFFFF','#F2D85B','#BED8E9','#B74670'].filter(v=>/^#[0-9a-f]{6}$/i.test(v)))].map(hex=>
        <button type="button" key={hex} disabled={selectedLayer.locked} aria-label={plain('Apply color','Aplicar color',locale)+' '+hex}
          style={{backgroundColor:hex}} onClick={()=>updateLayer(selectedLayer.id,selectedLayer.kind==='photo'||selectedLayer.kind==='sticker'
            ?{tintColor:hex,tintStrength:selectedLayer.tintStrength??.38,tint:undefined}:{color:hex})}/>)}
      {(selectedLayer.kind==='photo'||selectedLayer.kind==='sticker')&&<>
        <label className="free-post-color-strength">Intensidad <input type="range" min="0" max="100" step="1" disabled={selectedLayer.locked}
          aria-label="Intensidad del color" value={Math.round((selectedLayer.tintColor?selectedLayer.tintStrength??.38:selectedLayer.tint?1:.38)*100)}
          onChange={e=>updateLayer(selectedLayer.id,{tintColor:selectedLayer.tintColor||selectedLayer.tint||'#B74670',
            tintStrength:Number(e.target.value)/100,tint:undefined})}/></label>
        <button type="button" className="free-post-color-reset" disabled={selectedLayer.locked}
          onClick={()=>updateLayer(selectedLayer.id,{tintColor:undefined,tintStrength:undefined,tint:undefined})}>{plain('Original colors','Colores originales',locale)}</button>
      </>}
    </div>
  </div>}
  <input ref={photosRef} type="file" multiple accept="image/*,.heic,.heif" hidden
   onChange={e=>{const files=[...(e.target.files||[])];e.target.value='';void uploadPhotos(files)}}/>
  <input ref={backgroundRef} type="file" accept="image/*,.heic,.heif" hidden
   onChange={e=>{const file=e.target.files?.[0];e.target.value='';void chooseBackground(file)}}/>
  {error&&<p role="alert" className="free-post-error">{error}</p>}
  <div className="free-post-design-row">
 {!preview?<div className="cover-loading">{plain('Preparing canvas…','Preparando lienzo…',locale)}</div>:
   <TouchLayerCanvas preview={preview} layers={touchLayers} inlineTextTools focusLayerId={focusLayerId} ratio={1080/freePostDimensions(post.format).height} canvasHeight={freePostDimensions(post.format).height} onCommit={commit} onUpdate={updateLayer}
     onRemove={remove} onReorder={reorder} onToggleLock={toggleLock} onDuplicateText={duplicateText} onDuplicateLayer={duplicateElement} onSelectionChange={setSelectedLayerId} textPalette={[brand.color||'#244B5B',brand.background||'#FAF8F3','#191919','#FFFFFF','#F2D85B','#BED8E9']} onDropAsset={addAsset}
     onDropFiles={(files,point)=>{void uploadPhotos(files,point)}}/>}
  {mediaOpen&&<aside className="free-post-media" aria-label={plain('Photo and sticker picker','Selector de fotos y stickers',locale)}>
 <div className="free-post-media-top"><strong>{plain('Choose an element','Elige un elemento',locale)}</strong>
  <button type="button" onClick={()=>setMediaOpen(false)} aria-label={plain('Close picker','Cerrar selector',locale)}>×</button></div>
 <div className="free-post-media-tabs" role="group" aria-label="Tipo de recurso">
  <button type="button" className={mediaTab==='sticker'?'active':''} aria-pressed={mediaTab==='sticker'} onClick={()=>setMediaTab('sticker')}>Stickers</button>
  <button type="button" className={mediaTab==='photo'?'active':''} aria-pressed={mediaTab==='photo'} onClick={()=>setMediaTab('photo')}>{plain('Photos','Fotos',locale)}</button>
 </div>
 <input className="free-post-media-search" type="search" value={mediaQuery} onChange={e=>setMediaQuery(e.target.value)}
  placeholder={plain('Find by name…','Buscar por nombre…',locale)} aria-label={plain('Search media','Buscar fotos y stickers',locale)}/>
 <p className="free-post-media-hint">{plain('Tap an image: it appears in the center, ready to move.',
  'Toca una miniatura: aparece en el centro, lista para moverla.',locale)}</p>
 <div className="free-post-media-grid">{visibleMedia.map(item=><button type="button" key={item.id}
  aria-label={plain('Place','Colocar',locale)+' '+displayAssetName(item)}
  onClick={()=>addAsset(item.id)} onFocus={()=>{if(!images[item.id])loadImage(item.id)}}>
   <MediaThumbnail asset={item} src={images[item.id]} loadImage={loadImage}/>
   <small title={displayAssetName(item)}>{displayAssetName(item)}</small></button>)}</div>
 {!visibleMedia.length&&<p className="free-post-no-media">{plain('No results. Try another search or upload a photo.',
  'No hay resultados. Busca otra palabra o sube una imagen.',locale)}</p>}
 <div className="free-post-extra">
  {(['paper','tape','frame','circle'] as const).map(shape=><button type="button" key={shape} onClick={()=>addElement('shape',shape)}>
   {({paper:'Papel',tape:'Cinta',frame:'Marco',circle:'Círculo'})[shape]}</button>)}
 </div>
 </aside>}
  {layersOpen&&<aside className="free-post-layers" aria-label={plain('Design layers','Capas del diseño',locale)}>
   <div className="free-post-media-top">
    <strong>{plain('Your layers','Tus capas',locale)}</strong>
    <button type="button" onClick={()=>setLayersOpen(false)} aria-label={plain('Close layers','Cerrar capas',locale)}>×</button>
   </div>
   <p className="free-post-media-hint">{plain('Tap any layer to select it on the design.','Toca un elemento para seleccionarlo sobre la publicación.',locale)}</p>
   <div className="free-post-layer-list">
    {[...touchLayers].reverse().map(layer=><div key={layer.id} className="free-post-layer-item">
     <button type="button" onClick={()=>{setFocusLayerId(layer.id);if(window.matchMedia('(max-width:799px)').matches)setLayersOpen(false)}}
       aria-label={plain('Select','Seleccionar',locale)+' '+layer.name}>
      {(layer.kind==='photo'||layer.kind==='sticker')&&layer.src?<img src={layer.src} alt="" loading="lazy"/>:
        <span className="free-post-layer-symbol">{layer.kind==='text'?'T':layer.kind==='shape'?'▧':'◻'}</span>}
      <span>{layer.name}</span>
     </button>
     <div className="free-post-layer-actions">
      <button type="button" onClick={()=>reorder(layer.id,'back')} disabled={layer.locked}
        aria-label={plain('Send to back','Enviar al fondo',locale)}>↓</button>
      <button type="button" onClick={()=>reorder(layer.id,'front')} disabled={layer.locked}
        aria-label={plain('Bring to front','Traer al frente',locale)}>↑</button>
     </div>
    </div>)}
   </div>
  </aside>}
{backgroundOpen&&<div className="free-post-background-panel">
    <div className="free-post-media-top"><strong>{plain('Background','Fondo',locale)}</strong>
      <button type="button" onClick={()=>setBackgroundOpen(false)} aria-label={plain('Close background panel','Cerrar fondos',locale)}>×</button></div>
    <div className="free-post-background-shortcuts">
      <button type="button" onClick={()=>backgroundRef.current?.click()} disabled={busy}><Upload size={16}/>{plain('Upload background','Subir fondo',locale)}</button>
      {decor.backgroundImageId&&<button type="button" onClick={()=>editImageBackground(decor.backgroundImageId)}><ImagePlus size={16}/>{plain('Edit and resize background','Editar y agrandar fondo',locale)}</button>}
      {decor.layers.some(layer=>layer.role==='background')&&<button type="button" onClick={()=>{const wallpaper=decor.layers.find(layer=>layer.role==='background');if(wallpaper){setFocusLayerId(wallpaper.id);setBackgroundOpen(false)}}}><ImagePlus size={16}/>{plain('Select editable background','Seleccionar fondo editable',locale)}</button>}
      {post.assetId&&<button type="button" onClick={()=>editImageBackground(post.assetId)}>
       <ImagePlus size={16}/>{plain('Use my photo as background','Mi foto como fondo',locale)}</button>}
    </div>
    <div className="free-post-background-colors">
     <label>{plain('Background color','Color de fondo',locale)} <input type="color" value={decor.color}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',color:e.target.value,
        layers:decor.layers.filter(layer=>layer.role!=='background')})}/></label>
     <label>{plain('Gradient','Degradado',locale)} <input type="checkbox" checked={!!decor.gradient}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:e.target.checked?'#F5D8E7':'',
        layers:decor.layers.filter(layer=>layer.role!=='background')})}/></label>
     {decor.gradient&&<label>{plain('Second color','Segundo color',locale)} <input type="color" value={decor.gradient}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:e.target.value,
        layers:decor.layers.filter(layer=>layer.role!=='background')})}/></label>}
     <button type="button" onClick={()=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:'',color:'#FFFFFF',
        layers:decor.layers.filter(layer=>layer.role!=='background')})}>
      {plain('White background','Fondo blanco',locale)}</button>
    </div>
    <FreeDecorControls preferenceScope={brand.id} title={plain('Stickers and backgrounds','Stickers y fondos',locale)}
      backgroundId={decor.backgroundId as FreeBackgroundId} backgroundImageId={decor.backgroundImageId}
      stickerIds={decor.stickerIds} assets={assets} images={images} loadImage={loadImage}
      onOpenLibrary={onOpenStickers} onUploadBackground={onUploadBackground}
      onChange={next=>{
        if(next.backgroundImageId){editImageBackground(next.backgroundImageId);return}
        if(next.backgroundId&&next.backgroundId!=='brand'){
          update({...decor,...next,layers:decor.layers.filter(layer=>layer.role!=='background')});return;
        }
        update({...decor,...next});
      }}/>
   </div>}
  
 </div>
 <div className="free-post-under"><span>{plain('Editable','Lienzo editable',locale)} 1080 × {freePostDimensions(post.format).height} · {post.format==='Reel'?'Reel 9:16':post.format==='Story'?'Story 9:16':plain('no template or watermark','sin plantilla ni marcas',locale)}</span>
    {onSave&&<button type="button" className="free-post-save" disabled={saving} onClick={onSave}>{saving?plain('Saving…','Guardando…',locale):plain('Save post','Guardar publicación',locale)}</button>}
    <button type="button" disabled={busy} onClick={()=>void exportFreePost(post,brand,images)
      .then(()=>notify(plain('PNG ready','PNG descargado',locale)))
      .catch(e=>notify(e instanceof Error?e.message:'No se pudo descargar'))}>
      <Download size={17}/>{plain('Download PNG','Descargar PNG',locale)}</button></div>
 </section>;
}