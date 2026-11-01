import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ImagePlus,Type,Layers3,Upload,Download,Paintbrush,Undo2,Redo2} from 'lucide-react';
import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {paintPanoramaLayers,reorderPanoramaLayers,type PanoramaLayer,type LayerMove} from './PanoramaLayers';
import {clampRect,clampFreePhotoRect,paintCoverImage,type TouchRect} from './TouchGeometry';
import {coverPlacement} from './PhotoCrop';
import TouchLayerCanvas,{type TouchLayer} from './TouchLayerCanvas';
import FreeDecorControls from './FreeDecorControls';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import {readCoverDecor,type CoverDecor} from './CoverDecor';
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
};
const plain=(en:string,es:string,locale:'es'|'en')=>locale==='es'?es:en;
function uniqueId(){return 'free-'+crypto.randomUUID();}
function legacyStickers(decor:CoverDecor):PanoramaLayer[]{
 return decor.stickerIds.filter(id=>!decor.layers.some(layer=>layer.assetId===id))
  .map((id,n)=>({id:'legacy-sticker-'+id,assetId:id,name:'Sticker',kind:'sticker',
   rect:decor.stickerPositions[id]||{x:.1+(n*.19),y:.7,w:.18,h:.18}}));
}
export function coverLayers(post:Post,brand:Brand,decor:CoverDecor):PanoramaLayer[]{
 const layers:PanoramaLayer[]=[];
 if(post.assetId&&post.assetId!==decor.backgroundImageId&&!decor.layers.some(layer=>layer.assetId===post.assetId))
  layers.push({id:'main-photo',assetId:post.assetId,name:'Foto principal',kind:'photo',
   rect:decor.primaryPhotoRect||{x:.16,y:.34,w:.68,h:.55}});
 const title=post.hook||post.title;
 if(title.trim())layers.push({id:'main-title',assetId:'',name:'Título',kind:'text',text:title,
   font:decor.headlineStyle?.font||brand.headingFont?.toLowerCase()||'serif',
   fontSize:decor.headlineStyle?.fontSize||84,lineHeight:decor.headlineStyle?.lineHeight||1.12,
   spacing:decor.headlineStyle?.spacing||0,color:decor.headlineStyle?.color||'#191919',
   shadow:decor.headlineStyle?.shadow,outline:decor.headlineStyle?.outline,
   rect:decor.headlineRect||{x:.08,y:.11,w:.84,h:.23}});
 return [...layers,...legacyStickers(decor),...decor.layers];
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
 omitLayers=false):Promise<HTMLCanvasElement>{
 const decor=readCoverDecor(post.designData);
 const {width,height}=freePostDimensions(post.format);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo crear el lienzo.');
 await backdrop(ctx,decor,images,width,height);
 if(!omitLayers)await paintPanoramaLayers(ctx,width,height,coverLayers(post,brand,decor),images);
 return canvas;
}
export async function exportFreePost(post:Post,brand:Brand,images:Record<string,string>){
 const canvas=await renderFreePost(post,brand,images);
 const a=document.createElement('a');
 const {width,height}=freePostDimensions(post.format);
 a.download=(post.title||'mi-post').replace(/[^a-z0-9-_]/gi,'-').slice(0,50)+'-'+width+'x'+height+'.png';
 a.href=canvas.toDataURL('image/png');a.click();
}
export default function FreePostStudio({post,brand,assets,images,onChange,onTitle,onUpload,loadImage,
 onOpenStickers,onUploadBackground,notify,locale}:Props){
 const decor=readCoverDecor(post.designData);
 const [preview,setPreview]=useState(''),[error,setError]=useState('');
 const [mediaOpen,setMediaOpen]=useState(false);
 const [backgroundOpen,setBackgroundOpen]=useState(false);
 const [history,setHistory]=useState<CoverDecor[]>([]);
 const [future,setFuture]=useState<CoverDecor[]>([]);
 const [busy,setBusy]=useState(false);
 const photosRef=useRef<HTMLInputElement>(null),backgroundRef=useRef<HTMLInputElement>(null);
 const layers=useMemo(()=>coverLayers(post,brand,decor),[post.designData,post.assetId,post.hook,post.title,brand.headingFont]);
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
  const width=sticker?.19:.46,height=sticker?.18:.40;
  update({...decor,layers:[...decor.layers,{id:uniqueId(),assetId,
    name:displayAssetName(asset),kind:sticker?'sticker':'photo',
    rect:clampRect({x:point.x-width/2,y:point.y-height/2,w:width,h:height})}]});
 };
 const addElement=(kind:'text'|'shape',shape:PanoramaLayer['shape']='paper')=>{
  if(decor.layers.length>=22){notify(plain('Maximum 22 layers','Máximo 22 elementos por post',locale));return}
  update({...decor,layers:[...decor.layers,
   kind==='text'?{id:uniqueId(),kind:'text',assetId:'',name:'Texto libre',
     text:plain('Write here','Escribe aquí',locale),font:'serif',fontSize:80,color:'#191919',
     rect:{x:.1,y:.42,w:.8,h:.23}}:
   {id:uniqueId(),kind:'shape',assetId:'',name:'Collage',shape,color:'#F1E5D2',
     rect:{x:.22,y:.43,w:.56,h:shape==='tape'?.08:.32}}]});
 };
 const updateLayer=(id:string,patch:Partial<PanoramaLayer>)=>{
  if(id==='main-title'){
   if(patch.text!==undefined)onTitle(patch.text);
   const {text:unused,...styling}=patch;
   void unused;
   if(Object.keys(styling).length)update({...decor,headlineStyle:{...decor.headlineStyle,...styling}});
   return;
  }
  update({...decor,layers:decor.layers.map(l=>l.id===id?{...l,...patch}:l)});
 };
 const commit=(kind:PanoramaLayer['kind'],id:string,rect:TouchRect)=>{
  if(id==='main-title')update({...decor,headlineRect:clampRect(rect)});
  else if(id==='main-photo')update({...decor,primaryPhotoRect:clampFreePhotoRect(rect)});
  else if(id.startsWith('legacy-sticker-')){
   const original=id.slice('legacy-sticker-'.length);
   update({...decor,stickerPositions:{...decor.stickerPositions,[original]:clampRect(rect)}});
  }else update({...decor,layers:decor.layers.map(l=>l.id===id?{...l,rect:kind==='photo'?clampFreePhotoRect(rect):clampRect(rect)}:l)});
 };
 const remove=(id:string)=>{
  if(id==='main-title'){onTitle('');return}
  if(id==='main-photo'){notify(plain('Use Remove photo above','Usa Quitar foto en el panel superior',locale));return}
  if(id.startsWith('legacy-sticker-')){
   const original=id.slice('legacy-sticker-'.length);
   update({...decor,stickerIds:decor.stickerIds.filter(x=>x!==original)});return;
  }
  update({...decor,layers:decor.layers.filter(l=>l.id!==id)});
 };
 const reorder=(id:string,move:LayerMove)=>{
  if(id==='main-title'||id==='main-photo')return;
  update({...decor,layers:reorderPanoramaLayers(decor.layers,id,move)});
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
   if(additions.length)update({...decor,layers:[...decor.layers,...additions].slice(-22)});
  }finally{setBusy(false)}
 };
 const chooseBackground=async(file?:File)=>{
  if(!file)return;setBusy(true);
  try{const asset=await onUploadBackground(file);
   if(asset)update({...decor,backgroundImageId:asset.id,backgroundId:'brand'});}
  finally{setBusy(false)}
 };
 const allowed=assets.filter(a=>assetCategory(a)!=='background');
 const touchLayers:TouchLayer[]=layers.map(l=>({...l,src:images[l.assetId]||''}));
 return <section className="free-post-studio" aria-label={plain('Free post editor','Editor libre de publicaciones',locale)}>
  <header className="free-post-heading">
   <span className="eyebrow">{plain('FREE CANVAS','LIENZO LIBRE',locale)}</span>
   <h3>{plain('Create your own composition','Diseña sin plantillas',locale)}</h3>
   <p>{plain('Start with your own photo. Add, move, resize and layer photos, text and decorations.',
      'Usa tu foto de fondo y añade encima otras fotos, textos y stickers. Arrastra y ajusta todo.',locale)}</p>
  </header>
  <div className="free-post-tools">
   <button type="button" onClick={()=>photosRef.current?.click()} disabled={busy}><ImagePlus size={17}/>{plain('Add photos','Añadir fotos',locale)}</button>
   <button type="button" onClick={()=>backgroundRef.current?.click()} disabled={busy}><Upload size={17}/>{plain('Upload background','Subir fondo',locale)}</button>
   {post.assetId&&<button type="button" onClick={()=>update({...decor,backgroundId:'brand',backgroundImageId:post.assetId})}>
    <Paintbrush size={17}/>{plain('Use my photo as background','Mi foto como fondo',locale)}</button>}
   <button type="button" onClick={()=>addElement('text')}><Type size={17}/>{plain('Add text','Añadir texto',locale)}</button>
   <button type="button" onClick={()=>setMediaOpen(v=>!v)}><Layers3 size={17}/>{plain('Photos and stickers','Fotos y stickers',locale)}</button>
   <button type="button" onClick={()=>setBackgroundOpen(v=>!v)}><Paintbrush size={17}/>{plain('Backgrounds','Fondos',locale)}</button>
   <button type="button" disabled={!history.length} onClick={undo} title={plain('Undo','Deshacer',locale)}><Undo2 size={17}/></button>
   <button type="button" disabled={!future.length} onClick={redo} title={plain('Redo','Rehacer',locale)}><Redo2 size={17}/></button>
  </div>
  <input ref={photosRef} type="file" multiple accept="image/*,.heic,.heif" hidden
   onChange={e=>{const files=[...(e.target.files||[])];e.target.value='';void uploadPhotos(files)}}/>
  <input ref={backgroundRef} type="file" accept="image/*,.heic,.heif" hidden
   onChange={e=>{const file=e.target.files?.[0];e.target.value='';void chooseBackground(file)}}/>
  {mediaOpen&&<div className="free-post-media">
    <strong>{plain('Your photo and sticker library','Tus fotos y stickers',locale)}</strong>
    <div className="free-post-media-grid">{allowed.map(item=><button type="button" key={item.id}
      onClick={()=>addAsset(item.id)} aria-label={plain('Add','Añadir',locale)+' '+displayAssetName(item)}>
       {images[item.id]?<img loading="lazy" src={images[item.id]} alt=""/>:<span>{displayAssetName(item)}</span>}
       <small>{displayAssetName(item)}</small>
       <span className="free-post-add-label">{plain('Add on top','Poner encima',locale)}</span></button>)}</div>
    {allowed.length===0&&<p>{plain('Upload a photo to start','Sube una foto para empezar',locale)}</p>}
    <details className="free-post-background-from-library">
       <summary>{plain('Use an existing photo as a full background','Poner una foto de mi biblioteca como fondo',locale)}</summary>
       <div className="free-post-media-grid">{allowed.filter(asset=>assetCategory(asset)!=='sticker').map(asset=>
         <button type="button" key={'background-'+asset.id}
           onClick={()=>{if(!images[asset.id])loadImage(asset.id);
             update({...decor,backgroundImageId:asset.id,backgroundId:'brand'});setMediaOpen(false)}}>
           {images[asset.id]?<img loading="lazy" src={images[asset.id]} alt=""/>:<span>{displayAssetName(asset)}</span>}
           <small>{displayAssetName(asset)}</small></button>)}
       </div>
     </details>

    <div className="free-post-extra">
     {(['paper','tape','frame','circle'] as const).map(shape=><button type="button" key={shape} onClick={()=>addElement('shape',shape)}>
       {({paper:'Papel',tape:'Cinta',frame:'Marco',circle:'Círculo'})[shape]}</button>)}
    </div>
   </div>}
  {backgroundOpen&&<div className="free-post-background-panel">
    <div className="free-post-background-colors">
     <label>{plain('Background color','Color de fondo',locale)} <input type="color" value={decor.color}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',color:e.target.value})}/></label>
     <label>{plain('Gradient','Degradado',locale)} <input type="checkbox" checked={!!decor.gradient}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:e.target.checked?'#F5D8E7':''})}/></label>
     {decor.gradient&&<label>{plain('Second color','Segundo color',locale)} <input type="color" value={decor.gradient}
      onChange={e=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:e.target.value})}/></label>}
     <button type="button" onClick={()=>update({...decor,backgroundId:'brand',backgroundImageId:'',gradient:'',color:'#FFFFFF'})}>
      {plain('White background','Fondo blanco',locale)}</button>
    </div>
    <FreeDecorControls preferenceScope={brand.id} title={plain('Stickers and backgrounds','Stickers y fondos',locale)}
      backgroundId={decor.backgroundId as FreeBackgroundId} backgroundImageId={decor.backgroundImageId}
      stickerIds={decor.stickerIds} assets={assets} images={images} loadImage={loadImage}
      onOpenLibrary={onOpenStickers} onUploadBackground={onUploadBackground}
      onChange={next=>update({...decor,...next})}/>
   </div>}
  {error&&<p role="alert" className="free-post-error">{error}</p>}
  {!preview?<div className="cover-loading">{plain('Preparing canvas…','Preparando lienzo…',locale)}</div>:
   <TouchLayerCanvas preview={preview} layers={touchLayers} ratio={1080/freePostDimensions(post.format).height} canvasHeight={freePostDimensions(post.format).height} onCommit={commit} onUpdate={updateLayer}
     onRemove={remove} onReorder={reorder} onDropAsset={addAsset}
     onDropFiles={(files,point)=>{void uploadPhotos(files,point)}}/>}
  <div className="free-post-under"><span>{plain('Editable','Lienzo editable',locale)} 1080 × {freePostDimensions(post.format).height} · {post.format==='Reel'?'Reel 9:16':post.format==='Story'?'Story 9:16':plain('no template or watermark','sin plantilla ni marcas',locale)}</span>
    <button type="button" disabled={busy} onClick={()=>void exportFreePost(post,brand,images)
      .then(()=>notify(plain('PNG ready','PNG descargado',locale)))
      .catch(e=>notify(e instanceof Error?e.message:'No se pudo descargar'))}>
      <Download size={17}/>{plain('Download PNG','Descargar PNG',locale)}</button></div>
 </section>;
}