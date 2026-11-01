import React,{useEffect,useRef,useState} from 'react';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {BACKGROUND_CATEGORIES,belongsToBackgroundCategory,type BackgroundCategory} from './BackgroundCategories';
import BackgroundThumbnail from './BackgroundThumbnail';
import {isBackgroundVisible} from './BackgroundVisibility';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './FreeDecorControls.css';
type Props={
 backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[];
 onChange:(next:{backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[]})=>void;
 title?:string;assets?:LibraryAsset[];images?:Record<string,string>;loadImage?:(id:string)=>void;
 onOpenLibrary?:()=>void;onUploadBackground?:(file:File)=>Promise<LibraryAsset|null>;
 defaultTab?:'stickers'|'backgrounds';initiallyExpanded?:boolean;
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
export default function FreeDecorControls({backgroundId='brand',backgroundImageId='',stickerIds=[],onChange,title='Stickers & Backgrounds',assets=[],images={},loadImage,onOpenLibrary,onUploadBackground,defaultTab='stickers',initiallyExpanded=false}:Props){
 const [tab,setTab]=useState<'stickers'|'backgrounds'>(defaultTab);
 const [backgroundKind,setBackgroundKind]=useState<BackgroundCategory>('all');
 const [expanded,setExpanded]=useState(initiallyExpanded);
 const [group,setGroup]=useState('Todos');
 const uploadRef=useRef<HTMLInputElement>(null),[uploading,setUploading]=useState(false);
 const ownBackgrounds=assets.filter(a=>assetCategory(a)==='background'&&!a.shared);
 const studioBackgrounds=assets.filter(a=>assetCategory(a)==='background'&&a.shared);
 useEffect(()=>{studioBackgrounds.slice(0,12).forEach(a=>{if(!images[a.id])loadImage?.(a.id)})},
    [studioBackgrounds.map(a=>a.id).join('|')]);
 const upload=async(file?:File)=>{if(!file||!onUploadBackground)return;setUploading(true);try{const item=await onUploadBackground(file);if(item){loadImage?.(item.id);onChange({backgroundId:'brand',backgroundImageId:item.id,stickerIds:selected})}}finally{setUploading(false);if(uploadRef.current)uploadRef.current.value=''}};
 const originals=assets.filter(a=>assetCategory(a)==='sticker');
 const selected=stickerIds.filter(id=>originals.some(a=>a.id===id)).slice(0,3);
 const groupFor=(name:string)=>/avatar/i.test(name)?'Avatares':/matcha|coffee|tea|cup/i.test(name)?'Matcha':/pilates|reformer|barre|yoga|stretch/i.test(name)?'Pilates':/squat|fitness|gym|dumbbell|workout|exercise|lunge|treadmill|plank/i.test(name)?'Ejercicios':'Aesthetic';
 const visible=originals.filter(a=>group==='Todos'||(a.shared?a.stickerGroup:groupFor(a.name))===group);
 const toggle=(id:string)=>{
  if(!images[id])loadImage?.(id);
  // Keep the existing background untouched when adding or removing stickers.
  onChange({stickerIds:selected.includes(id)?selected.filter(x=>x!==id):[...selected,id].slice(-3)})
 };
 return <section className="free-decor-controls" aria-label="Stickers y fondos">
  <div className="free-decor-header"><div><strong>✦ {title}</strong><p>Stickers y fondos a tu gusto, sin ocupar toda la pantalla.</p></div>
    <button type="button" className="free-decor-collapse" aria-expanded={expanded}
      onClick={()=>setExpanded(value=>!value)}>{expanded?'Recoger panel ↑':'Abrir panel ↓'}</button></div>
  {expanded && <div className="free-decor-expanded">
  <div className="free-decor-main-tabs"><button type="button" aria-pressed={tab==='stickers'} className={tab==='stickers'?'active':''} onClick={()=>setTab('stickers')}>🎀 Stickers PNG</button><button type="button" aria-pressed={tab==='backgrounds'} className={tab==='backgrounds'?'active':''} onClick={()=>setTab('backgrounds')}>🎨 Fondos</button></div>
  {tab==='backgrounds'?<div>
    <div className="free-decor-upload"><strong>Mis fondos</strong>{onUploadBackground&&<><button type="button" disabled={uploading} onClick={()=>uploadRef.current?.click()}>{uploading?'Subiendo…':'+ Subir fondo'}</button><input hidden ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic" onChange={e=>void upload(e.target.files?.[0])}/></>}</div>
    <p className="free-decor-label">Mis archivos guardados</p>
    {ownBackgrounds.length>0&&<div className="free-decor-backgrounds">{ownBackgrounds.map(a=><button type="button" key={a.id} aria-pressed={backgroundImageId===a.id} className={backgroundImageId===a.id?'selected':''} onClick={()=>{if(!images[a.id])loadImage?.(a.id);onChange({backgroundId:'brand',backgroundImageId:a.id,stickerIds:selected})}}><i className="free-decor-swatch custom" style={images[a.id]?{backgroundImage:'url('+images[a.id]+')'}:undefined}/><span>{displayAssetName(a)}</span></button>)}</div>}
    <p className="free-decor-label">Fondos del estudio · para todos</p>
    {studioBackgrounds.length>0&&<div className="free-decor-backgrounds">
      {studioBackgrounds.filter(a=>backgroundKind==='all'||a.backgroundGroup===BACKGROUND_CATEGORIES.find(cat=>cat.id===backgroundKind)?.label)
        .map(a=><button type="button" key={a.id} aria-pressed={backgroundImageId===a.id}
        className={backgroundImageId===a.id?'selected':''}
        onClick={()=>{if(!images[a.id])loadImage?.(a.id);onChange({backgroundId:'brand',backgroundImageId:a.id,stickerIds:selected})}}>
        <i className="free-decor-swatch custom" style={images[a.id]?{backgroundImage:'url('+images[a.id]+')'}:undefined}/>
        <span>{displayAssetName(a)}</span></button>)}
    </div>}
    <p className="free-decor-label">Fondos incluidos en Content Lab</p>
    <div className="free-decor-background-filters" role="group" aria-label="Categorías de fondos">
      <button type="button" aria-pressed={backgroundKind==='all'} className={backgroundKind==='all'?'active':''} onClick={()=>setBackgroundKind('all')}>Todos</button>
      {BACKGROUND_CATEGORIES.map(category=><button type="button" key={category.id} aria-pressed={backgroundKind===category.id}
        className={backgroundKind===category.id?'active':''} onClick={()=>setBackgroundKind(category.id)}>{category.label}</button>)}
    </div>
    <div className="free-decor-backgrounds">{FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&belongsToBackgroundCategory(b.id,backgroundKind))
      .map(b=><button type="button" aria-pressed={!backgroundImageId&&backgroundId===b.id}
        className={!backgroundImageId&&backgroundId===b.id?'selected':''} key={b.id}
        onClick={()=>onChange({backgroundId:b.id,backgroundImageId:'',stickerIds:selected})}>
        <BackgroundThumbnail id={b.id} alt={'Vista previa: '+b.name}/><span>{b.name}</span>
      </button>)}</div></div>:
   <>
    <div className="free-decor-groups">{['Todos','Inspiración','Avatares','Matcha','Pilates','Ejercicios','Aesthetic'].map(g=><button type="button" key={g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{g}</button>)}</div>
    {visible.length?<div className="free-decor-stickers">{visible.map(a=><div key={a.id} className="free-decor-sticker-cell"><button type="button" aria-pressed={selected.includes(a.id)} className={selected.includes(a.id)?'selected':''} onClick={()=>toggle(a.id)}><StickerThumbnail asset={a} src={images[a.id]} loadImage={loadImage}/><small>{displayAssetName(a)}</small></button></div>)}</div>:
    <div className="free-decor-empty"><strong>Aquí aparecerán tus stickers PNG originales.</strong><p>No se mostrarán emojis de relleno. Cuando la administradora publique la colección, aparecerá aquí automáticamente.</p>{onOpenLibrary&&<button type="button" onClick={onOpenLibrary}>Abrir biblioteca de stickers</button>}</div>}
   </>}
  <div className="free-decor-footer"><small>Máximo 3 stickers por slide. Las fotografías originales no se modifican.</small>{selected.length>0&&<button type="button" onClick={()=>onChange({stickerIds:[]})}>Quitar stickers</button>}</div>
  </div>}
 </section>
}
