import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Download,Search,Images,Upload,Check,LoaderCircle} from 'lucide-react';
import {unzip} from 'fflate';
import {displayAssetName,assetCategory,type LibraryAsset} from './MediaAsset';
import './StickerDownloads.css';

type Props={brandId:string;assets:LibraryAsset[];images:Record<string,string>;
 onUpload:(file:File)=>Promise<LibraryAsset|null>;
 onPublish:(file:File,category:string)=>Promise<LibraryAsset|null>;
 isAdmin:boolean;loadImage:(id:string)=>Promise<string|undefined>|void;onUse:(id:string,destination:'carousel'|'cover')=>void};
const groups=['Todos','Avatares','Matcha','Pilates','Ejercicios','Aesthetic'];
const groupOf=(name:string)=>{
 const n=name.toLowerCase();
 if(/avatar|character|girl|portrait/.test(n))return 'Avatares';
 if(/matcha|coffee|latte|tea|croissant|tumbler|cup/.test(n))return 'Matcha';
 if(/pilates|reformer|barre|grip.sock|yoga|stretch|mermaid|shoulder.bridge|magic.circle/.test(n))return 'Pilates';
 if(/squat|workout|gym|fitness|dumbbell|kettlebell|lunge|exercise|strength|sneaker|rope|run|training|treadmill|band|plank/.test(n))return 'Ejercicios';
 return 'Aesthetic';
};
function unpackZip(blob:Uint8Array):Promise<Record<string,Uint8Array>>{
 return new Promise((resolve,reject)=>unzip(blob,(error,files)=>error?reject(error):resolve(files)));
}
/** Load images only as cards reach the viewport. 138 transparent PNGs must
 * never block the library screen on mobile / iPad. */
function StickerPreview({asset,src,loadImage}:{asset:LibraryAsset;src?:string;loadImage:(id:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(src)return;
  const node=ref.current;if(!node)return;
  if(typeof IntersectionObserver==='undefined'){loadImage(asset.id);return}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadImage(asset.id)}
  },{rootMargin:'220px'});
  observer.observe(node);return()=>observer.disconnect();
 },[asset.id,Boolean(src)]);
 return <div ref={ref} className="sticker-downloads-preview">{src?<img src={src} alt={displayAssetName(asset)} loading="lazy"/>:<span className="sticker-thumb-loading" aria-label="Cargando ilustración"><LoaderCircle size={18} className="spin"/></span>}</div>;
}
export default function StickerDownloads({brandId,assets,images,onUpload,onPublish,isAdmin,loadImage,onUse}:Props){
 const fileRef=useRef<HTMLInputElement>(null);
 const [category,setCategory]=useState('Todos'),[search,setSearch]=useState('');
 const [progress,setProgress]=useState(''),[running,setRunning]=useState(false);
 const [destination,setDestination]=useState<'carousel'|'cover'>('carousel');
 const [dragActive,setDragActive]=useState(false);
 const files=useMemo(()=>assets.filter(a=>(a.brandId===brandId||a.shared)&&assetCategory(a)==='sticker'),[assets,brandId]);
 const publicCount=files.filter(a=>a.shared).length;
 const userCount=files.length-publicCount;
 const matches=useMemo(()=>files.filter(a=>(category==='Todos'||(a.shared?a.stickerGroup:groupOf(a.name))===category)&&displayAssetName(a).toLowerCase().includes(search.toLowerCase())),[files,category,search]);
 const importFiles=async(list:File[])=>{
  if(!list.length)return;
  setRunning(true);let saved=0,duplicates=0,failed=0;
  try{
   const existing=new Set(files.filter(a=>!a.shared).map(a=>a.name.toLowerCase()));
   const uploadList:{file:File;group:string}[]=[];
   for(const file of list){
    if(/[.]zip$/i.test(file.name)){
     if(file.size>85000000)throw Error('El ZIP no puede superar 85 MB.');
     const archive=await unpackZip(new Uint8Array(await file.arrayBuffer()));
     const entries=Object.entries(archive).filter(([name,bytes])=>/[.]png$/i.test(name)&&!name.includes('__MACOSX')&&bytes.byteLength>200&&bytes.byteLength<=5000000);
     if(entries.length>200)throw Error('Colección demasiado grande: máximo 200 stickers.');
     for(const [name,bytes] of entries){
       const basename=name.split('/').pop()||'sticker.png';
       const group=name.includes('01_Avatars')?'Avatares':name.includes('02_Matcha')?'Matcha':name.includes('03_Pilates')?'Pilates':name.includes('04_Ejercicios')?'Ejercicios':groupOf(basename);
       const finalGroup=/pilates|reformer/i.test(basename)?'Pilates':group;
       if(!existing.has(basename.toLowerCase())){
         existing.add(basename.toLowerCase());
         uploadList.push({file:new File([new Uint8Array(bytes)],basename,{type:'image/png'}),group:finalGroup});
       }
     }
    }else if(file.type==='image/png'||/[.]png$/i.test(file.name)){
      if(!existing.has(file.name.toLowerCase())){
       existing.add(file.name.toLowerCase());uploadList.push({file,group:groupOf(file.name)});
      }
    }
   }
   if(!uploadList.length){setProgress('Esta colección ya está importada. No se añadieron duplicados.');return}
   for(let i=0;i<uploadList.length;i++){
     const item=uploadList[i];
     setProgress((isAdmin?'Publicando en la biblioteca compartida ':'Guardando stickers personales ')+(i+1)+' / '+uploadList.length);
     try{
       const result=isAdmin?await onPublish(item.file,item.group):await onUpload(item.file);
       if(result?.shared&&result?.sha256&&files.some(a=>a.sha256===result.sha256))duplicates++;
       else if(result)saved++;else failed++;
     }catch(e){failed++;if(failed===1)setProgress('Revisando archivos: '+(e instanceof Error?e.message:String(e)))}
   }
   setProgress((isAdmin?'Publicación terminada: ':'Importación terminada: ')+saved+' PNG nuevos'+(duplicates?' · '+duplicates+' duplicados omitidos':'')+(failed?' · '+failed+' no se pudieron guardar':'')+'. Sin créditos de IA.');
  }catch(e){setProgress('No se pudo importar: '+(e instanceof Error?e.message:String(e)))}
  finally{setRunning(false);if(fileRef.current)fileRef.current.value=''}
 };
 const download=async(asset:LibraryAsset)=>{
  const url=images[asset.id]||await Promise.resolve(loadImage(asset.id));
  if(!url){setProgress('No se pudo cargar este PNG. Revisa tu conexión y vuelve a probar.');return}
  const filename=(displayAssetName(asset).replace(/[^a-z0-9áéíóú_-]+/gi,'-')||'sticker')+'.png';
  const a=document.createElement('a');
  let blobUrl='';
  try{
    // Use a real PNG Blob for Safari/iPad downloads, not a transient data URI.
    const body=url.split(',')[1],raw=atob(body||''),bytes=new Uint8Array(raw.length);
    for(let n=0;n<raw.length;n++)bytes[n]=raw.charCodeAt(n);
    blobUrl=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
    a.href=blobUrl;
  }catch{a.href=url}
  a.download=filename;document.body.appendChild(a);a.click();a.remove();
  if(blobUrl)window.setTimeout(()=>URL.revokeObjectURL(blobUrl),60000);
 };
 return <section className="sticker-downloads" aria-label="Stickers PNG originales">
  <div className="sticker-downloads-head"><div><span className="eyebrow">STICKER LIBRARY · INCLUIDA</span><h2>Stickers originales para tus diseños.</h2><p>Avatares, matcha, Pilates, ejercicios y wellness. Los archivos compartidos los publica el estudio; puedes utilizarlos y descargar sus PNG transparentes.</p><p className="sticker-catalog-count">{publicCount} compartidos · {userCount} personales</p></div><div className="sticker-downloads-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar sticker…" aria-label="Buscar sticker"/></div></div>
  <div className={'sticker-import-bar'+(dragActive?' drag-active':'')}
   onDragOver={e=>{e.preventDefault();if(!running)setDragActive(true)}}
   onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDragActive(false)}}
   onDrop={e=>{e.preventDefault();setDragActive(false);if(!running)void importFiles(Array.from(e.dataTransfer.files))}}>
   <div><strong>{dragActive?'Suelta el archivo PNG o ZIP aquí 🎀':isAdmin?'Publicar colección para todos los compradores':'Tus propios stickers (opcional)'}</strong><p>{isAdmin?'Selecciona el paquete original completo una sola vez. Después estará disponible automáticamente para todos los compradores con acceso activo. Los duplicados exactos se descartan por contenido.':'La biblioteca compartida se actualiza automáticamente. También puedes añadir PNG privados de tu marca, sin modificar el catálogo compartido.'}</p></div><button type="button" className="btn dark" disabled={running} onClick={()=>fileRef.current?.click()}>{running?<LoaderCircle className="spin" size={15}/>:<Upload size={15}/>} {isAdmin?'Publicar PNG / ZIP':'Subir mis PNG'}</button><input type="file" ref={fileRef} hidden accept=".zip,image/png" multiple onChange={e=>void importFiles(Array.from(e.target.files||[]))}/></div>
  {progress&&<p role="status" className="sticker-import-status"><Check size={14}/>{progress}</p>}
  <div className="sticker-destination"><label htmlFor="sticker-use-where">Añadir sticker a</label><select id="sticker-use-where" value={destination} onChange={e=>setDestination(e.target.value as 'carousel'|'cover')}><option value="carousel">Carrusel (slide actual)</option><option value="cover">Post individual / cover</option></select><small>También puedes añadirlos directamente desde Brand Grid, Carousel Factory y el editor de posts.</small></div>
  <div className="sticker-downloads-filters" role="group" aria-label="Categorías de stickers">{groups.map(g=><button type="button" aria-pressed={category===g} className={category===g?'selected':''} key={g} onClick={()=>setCategory(g)}>{g}</button>)}</div>
  {matches.length?<div className="sticker-downloads-grid">{matches.map(asset=><article key={asset.id}><StickerPreview asset={asset} src={images[asset.id]} loadImage={loadImage}/><strong>{displayAssetName(asset)}</strong><small>{asset.shared?'✓ Incluido · '+(asset.stickerGroup||groupOf(asset.name)):'Privado · '+groupOf(asset.name)}</small><button type="button" className="sticker-use-button" onClick={()=>onUse(asset.id,destination)}>Usar en mi diseño</button><button type="button" disabled={!images[asset.id]} onClick={()=>void download(asset)}><Download size={14}/> {images[asset.id]?'Descargar PNG':'Preparando PNG…'}</button></article>)}</div>:<div className="sticker-downloads-empty"><Images size={22}/>{files.length?'No hay stickers en esta categoría.':'Todavía no hay stickers publicados en el catálogo. No mostramos ilustraciones falsas.'}</div>}
  <p className="sticker-downloads-note">Los stickers compartidos son de solo lectura para compradores. La administradora publica nuevos recursos una sola vez; el catálogo se distribuye automáticamente entre las cuentas autorizadas. Sin créditos IA.</p>
 </section>;
}