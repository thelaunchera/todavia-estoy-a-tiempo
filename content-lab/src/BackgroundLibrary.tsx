import React,{useRef,useState,useEffect} from 'react';
import {FREE_BACKGROUNDS,paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {isBowBackground} from './BowBackgrounds';
import {isScrapbookBackground} from './ScrapbookBackgrounds';
import BackgroundThumbnail from './BackgroundThumbnail';
import {ArrowRight,Download,Search,Upload} from 'lucide-react';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './BackgroundLibrary.css';

type Props={onDesign:(id:FreeBackgroundId,imageAssetId?:string)=>void;assets:LibraryAsset[];images:Record<string,string>;loadImage:(id:string)=>void;onUpload:(file:File)=>Promise<LibraryAsset|null>};
type Filter='all'|'scrapbook'|'bows'|'editorial'|'gradients'|'retro'|'dark';
const GRADIENT_IDS=new Set(['soft-gradient','sunset-peach','lavender-haze']);
const RETRO_IDS=new Set(['rust-autumn','terracotta-check','vintage-paper','journal-tape','coffee-check']);
const DARK_IDS=new Set(['night-editorial','night-stars']);
function inCollection(id:FreeBackgroundId,filter:Filter){
 if(filter==='all')return true;
 if(filter==='scrapbook')return isScrapbookBackground(id);
 if(filter==='bows')return isBowBackground(id);
 if(isScrapbookBackground(id)||isBowBackground(id))return false;
 if(filter==='gradients')return GRADIENT_IDS.has(id);
 if(filter==='retro')return RETRO_IDS.has(id);
 if(filter==='dark')return DARK_IDS.has(id);
 return !GRADIENT_IDS.has(id)&&!RETRO_IDS.has(id)&&!DARK_IDS.has(id);
}
const COLLECTIONS:{id:Filter;label:string}[]=[
 {id:'all',label:'Todos'},
 {id:'scrapbook',label:'✂️ Scrapbook'},
 {id:'bows',label:'🎀 Coquette & bows'},
 {id:'editorial',label:'✦ Minimal & editorial'},
 {id:'gradients',label:'🌈 Gradientes'},
 {id:'retro',label:'📷 Retro & papel'},
 {id:'dark',label:'🌙 Oscuros'},
];
export default function BackgroundLibrary({onDesign,assets,images,loadImage,onUpload}:Props){
 const fileRef=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [filter,setFilter]=useState<Filter>('scrapbook'),[search,setSearch]=useState('');
 const own=assets.filter(a=>assetCategory(a)==='background'&&!a.shared);
 useEffect(()=>{own.slice(0,12).forEach(a=>{if(!images[a.id])loadImage(a.id)})},[assets,images]);
 const upload=async(file?:File)=>{
   if(!file)return;setBusy(true);setError('');
   try{const item=await onUpload(file);if(item){loadImage(item.id);onDesign('brand',item.id)}}
   catch(e){setError(e instanceof Error?e.message:'No se pudo subir el fondo.')}
   finally{setBusy(false);if(fileRef.current)fileRef.current.value=''}
 };
 const backgrounds=FREE_BACKGROUNDS.filter(item=>{
  if(!inCollection(item.id,filter))return false;
  return (item.name+' '+item.description).toLowerCase().includes(search.toLowerCase().trim());
 });
 const download=(id:FreeBackgroundId)=>{
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');
  if(!ctx)return setError('No se pudo preparar el PNG.');
  paintFreeBackground(ctx,1080,1350,id);
  const link=document.createElement('a');link.download='content-lab-background-'+id+'.png';
  link.href=canvas.toDataURL('image/png');link.click();
 };
 return <section className="background-library">
  <header><span className="eyebrow">BACKGROUND STUDIO · GRATIS</span>
   <h1>Fondos que sí dan ganas de diseñar.</h1>
   <p>Explora {FREE_BACKGROUNDS.length} fondos por estilo: scrapbook, coquette, gradientes, retro, minimal y oscuro. Sin textos ni marcas; listos para personalizar cada slide.</p>
  </header>
  <div className="background-library-filters" role="group" aria-label="Colecciones de fondos">
   <div className="background-collection-chips">
    {COLLECTIONS.map(group=><button key={group.id} type="button" className={filter===group.id?'selected':''} aria-pressed={filter===group.id} onClick={()=>setFilter(group.id)}>{group.label} <span>{FREE_BACKGROUNDS.filter(item=>inCollection(item.id,group.id)).length}</span></button>)}
   </div>
   <label><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar fondo…" aria-label="Buscar fondos"/></label>
  </div>
  <p className="background-results" aria-live="polite">{backgrounds.length} diseños en esta colección · Selecciona uno para aplicarlo o descarga el PNG individual.</p>
  <div className="background-library-grid">{backgrounds.map(b=><article key={b.id}>
   <BackgroundThumbnail id={b.id} alt={'Vista previa sin texto: '+b.name}/>
   <div className="background-library-card-bottom"><div><strong>{b.name}</strong><small>{b.description}</small></div></div>
   <div className="background-card-actions">
    <button className="background-use-button" type="button" onClick={()=>onDesign(b.id)}>Usar fondo <ArrowRight size={14}/></button>
    <button className="background-download-button" type="button" aria-label={'Descargar '+b.name+' en PNG'} onClick={()=>download(b.id)} title="Descargar PNG individual"><Download size={16}/></button>
   </div>
  </article>)}</div>
  {backgrounds.length===0&&<p className="background-empty">No hay fondos con ese nombre. Prueba otra búsqueda.</p>}
  <details className="background-library-upload">
    <summary>Subir mi propio fondo</summary>
    <div><strong>Tu propia fotografía o diseño</strong>
     <p>Guárdalo en tu biblioteca privada y úsalo en el carrusel sin gastar créditos de IA.</p>
     <button className="btn dark" type="button" disabled={busy} onClick={()=>fileRef.current?.click()}>
       <Upload size={16}/>{busy?'Subiendo…':'Elegir archivo'}</button>
     <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/heic" onChange={e=>void upload(e.target.files?.[0])}/>
    </div>
  </details>
  {error&&<p role="alert">{error}</p>}
  {own.length>0&&<section className="background-own"><h2>Mis fondos guardados</h2>
   <div className="background-library-grid own-backgrounds">{own.map(a=><article key={a.id}>
     <div className="background-preview uploaded-background" style={{backgroundImage:images[a.id]?'url('+images[a.id]+')':undefined}}>
       {!images[a.id]&&<button type="button" onClick={()=>loadImage(a.id)}>Cargar imagen</button>}
     </div>
     <div className="background-library-card-bottom"><div><strong>{displayAssetName(a)}</strong><small>Mi fondo</small></div></div>
     <button className="background-use-button" type="button" onClick={()=>onDesign('brand',a.id)}>Usar fondo <ArrowRight size={14}/></button>
    </article>)}</div>
   </section>}
  <div className="background-library-action"><p>Los fondos se aplican al lienzo y se descargan sin marcas ni texto de muestra.</p>
   <button type="button" className="btn dark" onClick={()=>onDesign("brand")}>Abrir Carousel Factory <ArrowRight size={16}/></button></div>
 </section>;
}