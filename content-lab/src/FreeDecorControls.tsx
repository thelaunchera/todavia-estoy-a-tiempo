import React,{useEffect,useRef,useState} from 'react';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {BACKGROUND_CATEGORIES,belongsToBackgroundCategory,type BackgroundCategory} from './BackgroundCategories';
import BackgroundThumbnail from './BackgroundThumbnail';
import {isBackgroundVisible} from './BackgroundVisibility';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './FreeDecorControls.css';
import type {StickerCopyResult} from './CarouselStickerCopy';
import {readDecorPreferences,saveDecorPreferences,rememberDecor,toggleDecorFavorite,decorKey} from './DecorPreferences';
type Props={
 backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[];
 onChange:(next:{backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[]})=>void;
 title?:string;assets?:LibraryAsset[];images?:Record<string,string>;loadImage?:(id:string)=>void;
 onOpenLibrary?:()=>void;onUploadBackground?:(file:File)=>Promise<LibraryAsset|null>;
 defaultTab?:'stickers'|'backgrounds';initiallyExpanded?:boolean;slideNumber?:number;
 backgroundScope?:'slide'|'all';preferenceScope?:string;
 slideCount?:number;onCopySticker?:(id:string,targetIndex:number)=>StickerCopyResult;
};
function StickerThumbnail({asset,src,loadImage}:{asset:LibraryAsset;src?:string;loadImage?:(id:string)=>void}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  if(src||!loadImage)return;
  const node=ref.current;if(!node)return;
  if(typeof IntersectionObserver==='undefined'){loadImage(asset.id);return}
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();loadImage(asset.id)}
  },{rootMargin:'140px'});
  observer.observe(node);return()=>observer.disconnect();
 },[asset.id,Boolean(src),loadImage]);
 return <span ref={ref} className="free-decor-real-preview">{src?<img alt={displayAssetName(asset)} src={src} loading="lazy"/>:<span aria-label="Cargando sticker" className="free-decor-loading"/>}</span>;
}
function LibraryBackgroundThumbnail({asset,src,loadImage}:{
 asset:LibraryAsset;src?:string;loadImage?:(id:string)=>void
}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  if(src||!loadImage)return;
  const node=ref.current;if(!node)return;
  if(typeof IntersectionObserver==='undefined'){loadImage(asset.id);return}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();loadImage(asset.id)}
  },{rootMargin:'200px'});
  observer.observe(node);
  return()=>observer.disconnect();
 },[asset.id,Boolean(src),loadImage]);
 return <span ref={ref} className="free-decor-library-background">
  {src?<img src={src} alt="" draggable={false} loading="lazy"/>:
   <span className="free-decor-loading" aria-label={'Cargando '+displayAssetName(asset)}/>}
 </span>;
}
export default function FreeDecorControls({
 backgroundId='brand',backgroundImageId='',stickerIds=[],onChange,
 title='Stickers & Backgrounds',assets=[],images={},loadImage,onOpenLibrary,onUploadBackground,
 defaultTab='stickers',initiallyExpanded=false,slideNumber,
 backgroundScope='all',preferenceScope='default',slideCount=0,onCopySticker,
}:Props){
 const [tab,setTab]=useState<'stickers'|'backgrounds'>(defaultTab);
 const [backgroundKind,setBackgroundKind]=useState<BackgroundCategory>('all');
 const [expanded,setExpanded]=useState(initiallyExpanded);
 const [group,setGroup]=useState('Todos');
 const [search,setSearch]=useState('');
 const [resourceFilter,setResourceFilter]=useState<'all'|'favorites'|'recent'>('all');
 const [prefs,setPrefs]=useState(()=>readDecorPreferences(preferenceScope));
 useEffect(()=>{setPrefs(readDecorPreferences(preferenceScope));},[preferenceScope]);
 const updatePrefs=(next:typeof prefs)=>{setPrefs(next);saveDecorPreferences(preferenceScope,next)};
 const addRecent=(key:string)=>updatePrefs(rememberDecor(prefs,key));
 const favorite=(key:string)=>updatePrefs(toggleDecorFavorite(prefs,key));
 const matchesFilter=(key:string)=>resourceFilter==='all'||(resourceFilter==='favorites'
   ?prefs.favorites.includes(key):prefs.recent.includes(key));
 const sortRecent=<T,>(items:T[],key:(item:T)=>string)=>resourceFilter==='recent'
   ?[...items].sort((a,b)=>prefs.recent.indexOf(key(a))-prefs.recent.indexOf(key(b))):items;
 const [feedback,setFeedback]=useState('');
 const [copyStickerId,setCopyStickerId]=useState('');
 useEffect(()=>{setCopyStickerId('')},[slideNumber]);
 const uploadRef=useRef<HTMLInputElement>(null);
 const [uploading,setUploading]=useState(false);
 const normalizeSearch=(text:string)=>text.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const query=normalizeSearch(search.trim());
 const matches=(name:string)=>!query||normalizeSearch(name).includes(query);
 const ownBackgrounds=assets.filter(a=>assetCategory(a)==='background'&&!a.shared);
 const studioBackgrounds=assets.filter(a=>assetCategory(a)==='background'&&a.shared);
 useEffect(()=>{studioBackgrounds.slice(0,12).forEach(a=>{if(!images[a.id])loadImage?.(a.id)})},
  [studioBackgrounds.map(a=>a.id).join('|')]);
 const originals=assets.filter(a=>assetCategory(a)==='sticker');
 // Preserve saved sticker IDs even if a library thumbnail has not yet loaded.
 const selected=stickerIds.slice(0,3);
 const stickerName=(id:string)=>{const item=originals.find(a=>a.id===id);return item?displayAssetName(item):'Sticker guardado'};
 const backgroundName=backgroundImageId
  ?(assets.find(a=>a.id===backgroundImageId)?displayAssetName(assets.find(a=>a.id===backgroundImageId)!):'Fondo guardado')
  :(FREE_BACKGROUNDS.find(b=>b.id===backgroundId)?.name||'Color de mi marca');
 const groupFor=(name:string)=>/avatar/i.test(name)?'Avatares':/matcha|coffee|tea|cup/i.test(name)?'Matcha':
   /pilates|reformer|barre|yoga|stretch/i.test(name)?'Pilates':
   /squat|fitness|gym|dumbbell|workout|exercise|lunge|treadmill|plank/i.test(name)?'Ejercicios':'Aesthetic';
 const visible=sortRecent(originals.filter(a=>(group==='Todos'||(a.shared?a.stickerGroup:groupFor(a.name))===group)
  &&matches(displayAssetName(a))&&matchesFilter(decorKey.sticker(a.id))),a=>decorKey.sticker(a.id));
 const ownMatches=sortRecent(ownBackgrounds.filter(a=>matches(displayAssetName(a))
  &&matchesFilter(decorKey.imageBackground(a.id))),a=>decorKey.imageBackground(a.id));
 const studioMatches=sortRecent(studioBackgrounds.filter(a=>
  (backgroundKind==='all'||a.backgroundGroup===BACKGROUND_CATEGORIES.find(cat=>cat.id===backgroundKind)?.label)
  &&matches(displayAssetName(a))&&matchesFilter(decorKey.imageBackground(a.id))),a=>decorKey.imageBackground(a.id));
 const builtInMatches=sortRecent(FREE_BACKGROUNDS.filter(b=>
  isBackgroundVisible(b.id)&&belongsToBackgroundCategory(b.id,backgroundKind)&&matches(b.name)
  &&matchesFilter(decorKey.freeBackground(b.id))),b=>decorKey.freeBackground(b.id));
 const changeTab=(next:'stickers'|'backgrounds')=>{setTab(next);setSearch('');setFeedback('');setResourceFilter('all')};
 const changeBackground=(id:FreeBackgroundId,imageId='')=>{
  if(imageId&&!images[imageId])loadImage?.(imageId);
  setFeedback('');addRecent(imageId?decorKey.imageBackground(imageId):decorKey.freeBackground(id));
  onChange({backgroundId:id,backgroundImageId:imageId});
 };
 const removeSticker=(id:string)=>{setFeedback('');onChange({stickerIds:selected.filter(x=>x!==id)})};
 const toggle=(id:string)=>{
  if(selected.includes(id)){removeSticker(id);return}
  if(selected.length>=3){
   setFeedback('Ya hay 3 stickers en este slide. Quita uno de los elegidos para añadir otro. Ninguno se borra automáticamente.');
   return;
  }
  setFeedback('');
  if(!images[id])loadImage?.(id);
  // Never resubmit or replace the selected background when changing stickers.
  addRecent(decorKey.sticker(id));
  onChange({stickerIds:[...selected,id]});
 };
 const favoriteButton=(key:string,name:string)=>(
  <button type="button" className={'free-decor-favorite'+(prefs.favorites.includes(key)?' is-favorite':'')}
    aria-pressed={prefs.favorites.includes(key)}
    aria-label={(prefs.favorites.includes(key)?'Quitar de favoritos: ':'Guardar como favorito: ')+name}
    onClick={()=>favorite(key)} title={prefs.favorites.includes(key)?'Quitar favorito':'Guardar favorito'}>
    {prefs.favorites.includes(key)?'★':'☆'} <span>{prefs.favorites.includes(key)?'Guardado':'Guardar'}</span>
  </button>
 );
 const upload=async(file?:File)=>{
  if(!file||!onUploadBackground)return;
  setUploading(true);setFeedback('');
  try{
   const item=await onUploadBackground(file);
   if(item)changeBackground('brand',item.id);
   else setFeedback('No se pudo guardar el fondo. Comprueba el archivo e inténtalo de nuevo.');
  }catch{setFeedback('No se pudo subir el fondo. Inténtalo de nuevo.')}
  finally{setUploading(false);if(uploadRef.current)uploadRef.current.value=''}
 };
 return <section className="free-decor-controls" aria-label="Stickers y fondos">
  <div className="free-decor-header">
   <div><strong>✦ {title}</strong><p>{slideNumber?'Slide '+slideNumber+' · ':''}Elige tus recursos sin perder el diseño.</p></div>
   <button type="button" className="free-decor-collapse" aria-expanded={expanded}
    onClick={()=>setExpanded(value=>!value)}>{expanded?'Cerrar ↑':'Elegir ↓'}</button>
  </div>
  <div className="free-decor-current" aria-label="Recursos seleccionados">
   <span><strong>Fondo:</strong> {backgroundName}<small> · {slideNumber?
    (backgroundScope==='slide'?'Solo slide '+slideNumber:'Todo el carrusel'):'Este diseño'}</small></span>
   <span><strong>Stickers:</strong> {selected.length}/3{slideNumber?' · Slide '+slideNumber:''}</span>
  </div>
  {expanded&&<div className="free-decor-expanded">
   <div className="free-decor-main-tabs">
    <button type="button" aria-pressed={tab==='stickers'} className={tab==='stickers'?'active':''}
     onClick={()=>changeTab('stickers')}>🎀 Stickers PNG</button>
    <button type="button" aria-pressed={tab==='backgrounds'} className={tab==='backgrounds'?'active':''}
     onClick={()=>changeTab('backgrounds')}>🎨 Fondos</button>
   </div>
   <div className="free-decor-search">
    <input type="search" aria-label={tab==='backgrounds'?'Buscar fondos':'Buscar stickers'}
     placeholder={tab==='backgrounds'?'Buscar fondos por nombre…':'Buscar stickers por nombre…'}
     value={search} onChange={e=>setSearch(e.target.value)}/>
    {search&&<button type="button" onClick={()=>setSearch('')}>Limpiar</button>}
   </div>
   <div className="free-decor-quick-filters" role="group" aria-label="Encontrar recursos guardados">
     <button type="button" className={resourceFilter==='all'?'active':''}
       aria-pressed={resourceFilter==='all'} onClick={()=>setResourceFilter('all')}>Todos</button>
     <button type="button" className={resourceFilter==='favorites'?'active':''}
       aria-pressed={resourceFilter==='favorites'} onClick={()=>setResourceFilter('favorites')}>★ Favoritos</button>
     <button type="button" className={resourceFilter==='recent'?'active':''}
       aria-pressed={resourceFilter==='recent'} onClick={()=>setResourceFilter('recent')}>Recientes</button>
   </div>
   {feedback&&<p className="free-decor-feedback" role="status">{feedback}</p>}
   {tab==='backgrounds'?<div>
    <div className="free-decor-upload"><strong>Mis fondos</strong>
     {onUploadBackground&&<><button type="button" disabled={uploading}
      onClick={()=>uploadRef.current?.click()}>{uploading?'Subiendo…':'+ Subir fondo'}</button>
      <input hidden ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic"
       onChange={e=>void upload(e.target.files?.[0])}/></>}
    </div>
    {ownMatches.length>0&&<><p className="free-decor-label">Mis archivos guardados</p>
     <div className="free-decor-backgrounds">{ownMatches.map(a=><div key={a.id} className="free-decor-background-tile">
      <button type="button" aria-pressed={backgroundImageId===a.id}
        className={backgroundImageId===a.id?'selected':''}
        onClick={()=>changeBackground('brand',a.id)}>
        <LibraryBackgroundThumbnail asset={a} src={images[a.id]} loadImage={loadImage}/>
        <span>{displayAssetName(a)}</span>
      </button>
      {favoriteButton(decorKey.imageBackground(a.id),displayAssetName(a))}
     </div>)}</div></>}
    {studioMatches.length>0&&<><p className="free-decor-label">Fondos del estudio · para todos</p>
     <div className="free-decor-backgrounds">{studioMatches.map(a=><div key={a.id} className="free-decor-background-tile">
      <button type="button" aria-pressed={backgroundImageId===a.id}
        className={backgroundImageId===a.id?'selected':''}
        onClick={()=>changeBackground('brand',a.id)}>
        <LibraryBackgroundThumbnail asset={a} src={images[a.id]} loadImage={loadImage}/>
        <span>{displayAssetName(a)}</span>
      </button>
      {favoriteButton(decorKey.imageBackground(a.id),displayAssetName(a))}
     </div>)}</div></>}
    <p className="free-decor-label">Fondos incluidos en Content Lab</p>
    <div className="free-decor-background-filters" role="group" aria-label="Categorías de fondos">
     <button type="button" aria-pressed={backgroundKind==='all'} className={backgroundKind==='all'?'active':''}
      onClick={()=>setBackgroundKind('all')}>Todos</button>
     {BACKGROUND_CATEGORIES.map(cat=><button type="button" key={cat.id}
      aria-pressed={backgroundKind===cat.id} className={backgroundKind===cat.id?'active':''}
      onClick={()=>setBackgroundKind(cat.id)}>{cat.label}</button>)}
    </div>
    {builtInMatches.length>0&&<div className="free-decor-backgrounds">{builtInMatches.map(b=>
     <div key={b.id} className="free-decor-background-tile">
      <button type="button" aria-pressed={!backgroundImageId&&backgroundId===b.id}
        className={!backgroundImageId&&backgroundId===b.id?'selected':''}
        onClick={()=>changeBackground(b.id)}>
        <BackgroundThumbnail id={b.id} alt={'Vista previa: '+b.name}/><span>{b.name}</span>
      </button>
      {favoriteButton(decorKey.freeBackground(b.id),b.name)}
     </div>)}</div>}
    {!ownMatches.length&&!studioMatches.length&&!builtInMatches.length&&
     <div className="free-decor-no-results">No encontramos ese fondo. Prueba otra palabra o cambia la categoría.
      <button type="button" onClick={()=>{setSearch('');setBackgroundKind('all')}}>Mostrar todos</button>
     </div>}
   </div>:<>
    <div className="free-decor-groups">{['Todos','Inspiración','Avatares','Matcha','Pilates','Ejercicios','Aesthetic']
     .map(g=><button type="button" key={g} aria-pressed={group===g} className={group===g?'active':''}
      onClick={()=>setGroup(g)}>{g}</button>)}</div>
    {selected.length>0&&<div className="free-decor-selected-stickers"
     aria-label="Stickers seleccionados para este slide"><strong>En este slide</strong>
     <div className="free-decor-selected-list">{selected.map(id=><div className="free-decor-selected-row" key={id}>
       <span className="free-decor-selected-name">{stickerName(id)}</span>
       {onCopySticker&&slideNumber&&slideCount>1&&<button type="button" className="free-decor-copy-toggle"
         aria-expanded={copyStickerId===id}
         onClick={()=>{setCopyStickerId(v=>v===id?'':id);setFeedback('')}}>Copiar a…</button>}
       <button type="button" className="free-decor-selected-remove" onClick={()=>removeSticker(id)}
         aria-label={'Quitar '+stickerName(id)}><span aria-hidden="true">×</span></button>
       {copyStickerId===id&&onCopySticker&&slideNumber&&slideCount>1&&
        <div className="free-decor-copy-destinations" role="group"
         aria-label={'Copiar '+stickerName(id)+' desde el slide '+slideNumber}>
          <small>Elige el slide. Mantendrá la misma posición, tamaño y giro.</small>
          <div>{Array.from({length:slideCount},(_,n)=>n).filter(n=>n!==slideNumber-1).map(n=>
            <button type="button" key={n} onClick={()=>{
              const outcome=onCopySticker(id,n);
              if(outcome==='copied')setFeedback('✓ Copiado al slide '+(n+1)+' en la misma posición.');
              else if(outcome==='full')setFeedback('El slide '+(n+1)+' ya tiene 3 stickers. No se ha eliminado ninguno.');
              else if(outcome==='exists')setFeedback('Este sticker ya está en el slide '+(n+1)+'. No hemos movido el original.');
              else setFeedback('No se pudo copiar. Vuelve a seleccionar el sticker.');
            }}>Slide {n+1}</button>)}</div>
        </div>}
     </div>)}</div>
    </div>}
    {visible.length?<div className="free-decor-stickers">{visible.map(a=>
     <div key={a.id} className="free-decor-sticker-cell"><button type="button"
      aria-pressed={selected.includes(a.id)} className={selected.includes(a.id)?'selected':''}
      onClick={()=>toggle(a.id)}>
      <StickerThumbnail asset={a} src={images[a.id]} loadImage={loadImage}/>
      <small>{displayAssetName(a)}</small></button>
      {favoriteButton(decorKey.sticker(a.id),displayAssetName(a))}
     </div>)}</div>:
     <div className="free-decor-empty">
      <strong>{resourceFilter==='favorites'&&!visible.length?'Aún no tienes stickers favoritos.':
        resourceFilter==='recent'&&!visible.length?'Todavía no has usado stickers recientemente.':
        originals.length?'No hay stickers con ese filtro.':'Todavía no hay stickers PNG en esta biblioteca.'}</strong>
      <p>{originals.length?'Prueba otro nombre o cambia la categoría.':'Cuando se publiquen, aparecerán aquí automáticamente.'}</p>
      {search&&<button type="button" onClick={()=>setSearch('')}>Limpiar búsqueda</button>}
      {onOpenLibrary&&<button type="button" onClick={onOpenLibrary}>Abrir biblioteca de stickers</button>}
     </div>}
   </>}
   <div className="free-decor-footer">
    <small>{tab==='stickers'&&selected.length===3
     ?'3 de 3 stickers. Quita uno si quieres elegir otro.'
     :tab==='stickers'?'Toca un sticker para añadirlo a tu diseño.':slideNumber
       ?backgroundScope==='slide'?'El fondo se aplica solo a este slide.':'El fondo se aplica a todo el carrusel.'
       :'Elegir un fondo lo aplica a este diseño.'}</small>
    {selected.length>0&&tab==='stickers'&&<button type="button" onClick={()=>onChange({stickerIds:[]})}>Quitar stickers</button>}
   </div>
  </div>}
 </section>;
}
