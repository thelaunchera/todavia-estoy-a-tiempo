import React,{useRef,useState,useEffect} from 'react';
import {unzipSync} from 'fflate';
import {FREE_BACKGROUNDS,paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';
import {isBowBackground} from './BowBackgrounds';
import {isScrapbookBackground} from './ScrapbookBackgrounds';
import BackgroundThumbnail from './BackgroundThumbnail';
import {ArrowRight,Download,Search,Upload} from 'lucide-react';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './BackgroundLibrary.css';

type Props={onDesign:(id:FreeBackgroundId,imageAssetId?:string)=>void;assets:LibraryAsset[];images:Record<string,string>;loadImage:(id:string)=>void;onUpload:(file:File)=>Promise<LibraryAsset|null>;isAdmin?:boolean};
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
export default function BackgroundLibrary({onDesign,assets,images,loadImage,onUpload,isAdmin=false}:Props){
 const fileRef=useRef<HTMLInputElement>(null),bulkFileRef=useRef<HTMLInputElement>(null),
  [busy,setBusy]=useState(false),[error,setError]=useState(''),[zipError,setZipError]=useState(''),
  [bulkProgress,setBulkProgress]=useState<{done:number;total:number;failed:number}|null>(null);
 const [filter,setFilter]=useState<Filter>('scrapbook'),[search,setSearch]=useState('');
 const own=assets.filter(a=>assetCategory(a)==='background'&&!a.shared);
 const requestedPreviews=useRef(new Set<string>());
 useEffect(()=>{
   // A large imported ZIP must still show every thumbnail after a reload.
   own.slice(0,80).forEach(a=>{
     if(!images[a.id]&&!requestedPreviews.current.has(a.id)){
       requestedPreviews.current.add(a.id);
       loadImage(a.id);
     }
   });
 },[assets,images,loadImage]);
 const upload=async(file?:File)=>{
   if(!file)return;setBusy(true);setError('');
   try{const item=await onUpload(file);if(item){loadImage(item.id);onDesign('brand',item.id)}}
   catch(e){setError(e instanceof Error?e.message:'No se pudo subir el fondo.')}
   finally{setBusy(false);if(fileRef.current)fileRef.current.value=''}
 };
 const importCollection=async(file?:File)=>{
   if(!file)return;
   setZipError('');setBusy(true);setBulkProgress(null);
   try{
     const name=file.name||'archivo';
     const sizeMB=(file.size/1_000_000).toFixed(1);
     if(!/\.zip$/i.test(name)&&!/(application\\/zip|x-zip-compressed)/i.test(file.type))
       throw Error('El archivo seleccionado no es ZIP. Usa el paquete “Content_Lab_Importar_36_Fondos.zip”.');
     if(file.size>15_000_000)
       throw Error('Elegiste “'+name+'” ('+sizeMB+' MB). Esa es la versión pesada. Descarga el ZIP ligero de 3.2 MB desde el enlace de arriba.');
     const extracted=unzipSync(new Uint8Array(await file.arrayBuffer()));
     const entries=Object.entries(extracted).filter(([entry])=>
       !entry.startsWith('__MACOSX/')&&!entry.includes('..')&&/\.(png|jpe?g|webp)$/i.test(entry)
     );
     if(entries.length<1||entries.length>60)
       throw Error('El ZIP no contiene una colección válida. Usa el de 36 fondos preparado para el Lab.');
     const totalBytes=entries.reduce((sum,[,bytes])=>sum+bytes.byteLength,0);
     if(totalBytes>42_000_000)throw Error('Los archivos del ZIP son demasiado grandes para importar desde el móvil.');
     const existing=new Set(own.map(a=>displayAssetName(a).toLowerCase().replace(/[^a-z0-9]/g,'')));
     let done=0,failed=0;
     setBulkProgress({done,total:entries.length,failed});
     for(const [path,bytes] of entries){
       const filename=path.split('/').pop()||'fondo.webp';
       const clean=filename.replace(/\.(png|jpe?g|webp)$/i,'').replace(/[_-]+/g,' ');
       const key=clean.toLowerCase().replace(/[^a-z0-9]/g,'');
       if(existing.has(key)){done++;setBulkProgress({done,total:entries.length,failed});continue}
       const mime=/\.png$/i.test(filename)?'image/png':/\.webp$/i.test(filename)?'image/webp':'image/jpeg';
       const uploadFile=new File([new Uint8Array(bytes)],filename,{type:mime});
       try{
         const item=await onUpload(uploadFile);
         if(item){existing.add(key);loadImage(item.id)}else failed++;
       }catch{failed++}
       done++;setBulkProgress({done,total:entries.length,failed});
     }
     if(failed) setZipError('Se guardaron '+(entries.length-failed)+' fondos; '+failed+' fallaron. Puedes intentar otra vez: se omitirán los duplicados.');
   }catch(e){
     setZipError(e instanceof Error?e.message:'No se pudo leer el ZIP. Prueba el paquete ligero preparado para el Lab.');
   }finally{setBusy(false);if(bulkFileRef.current)bulkFileRef.current.value=''}
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
  {isAdmin&&<details className="background-library-upload background-collection-import">
   <summary>Importar colección completa · ZIP</summary>
   <div>
    <strong>Todos tus fondos individuales, en una sola importación</strong>
    <p>Importa los 36 fondos a tu biblioteca en una sola vez, sin gastar créditos de IA.</p>
    <a className="background-zip-download" href="https://drive.google.com/file/d/1P4askVlzAjOBP4PuoSpgwOk7vs0yeeVr/view?usp=drivesdk" target="_blank" rel="noopener noreferrer">
      <Download size={17}/> Paso 1 · Descargar ZIP ligero (3.2 MB)
    </a>
    <small className="background-import-hint">No selecciones «Content_Lab_Fondos_Originales.zip» (77 MB). Ese paquete es solo para guardar los archivos en alta resolución.</small>
    <button className="btn dark" type="button" disabled={busy} onClick={()=>bulkFileRef.current?.click()}>
      <Upload size={16}/>{busy?'Importando colección…':'Paso 2 · Elegir ZIP ligero'}
    </button>
    <input ref={bulkFileRef} hidden type="file" accept=".zip,application/zip,application/x-zip-compressed"
      onChange={e=>void importCollection(e.target.files?.[0])}/>
    {zipError&&<p className="background-zip-error" role="alert">{zipError}</p>}
    {bulkProgress&&<div className="background-import-progress" role="status" aria-live="polite">
      <progress value={bulkProgress.done} max={bulkProgress.total}/>
      <span>{bulkProgress.done} de {bulkProgress.total} fondos procesados
       {bulkProgress.failed>0?' · '+bulkProgress.failed+' pendientes de revisar':''}</span>
      {bulkProgress.done===bulkProgress.total&&!busy&&bulkProgress.failed===0&&<strong>Colección importada ✓</strong>}
    </div>}
   </div>
  </details>}
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