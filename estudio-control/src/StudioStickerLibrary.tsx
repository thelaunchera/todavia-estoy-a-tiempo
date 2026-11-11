import {useEffect,useMemo,useRef,useState} from 'react';
import {Archive,Check,Download,FolderOpen,ImagePlus,LockKeyhole,RefreshCw,Search,Share2,Star,Upload} from 'lucide-react';
import {
 loadStudioLabAssets,loadStudioPrivateCharacterAssets,
 type StudioLabAsset
} from './supabase-client';
import {readEditorRecord,writeEditorRecord} from './seamless-persistence';
import {LAB_ASSETS} from './lab-assets';
import {EDITORIAL_STICKER_ASSETS} from './editorial-sticker-assets';
import {isPersonalCharacterAssetName,isSafeGenericStudioSticker,organizedStudioKind,isStudioBackgroundName} from './studio-asset-organization';
import {stickerCollectionFor,visibleStickerCollections,type StickerCollection} from '../../content-lab/src/StudioLibraryOrganization';
import {useStudioLibrarySync} from './studio-library-sync';
import {
 STUDIO_CATEGORY_OVERRIDES,STUDIO_APPROVED_SHARES,
 loadLocalStudioStickers,importLocalStudioStickers
} from './studio-sticker-store';
import './studio-sticker-library.css';

type Kind='sticker'|'background';
type Source='local'|'private-character'|'catalog'|'bundled'|'editorial';
type Entry={id:string;name:string;url:string;kind:Kind;source:Source;private:boolean;category?:string};
import {dedupeStudioGallery} from './studio-gallery-dedup';
import {friendlyStickerName} from '../../creative-shared/sticker-display-name';
type View='Todos'|'Mis stickers'|'Personajes privados'|'Fondos'|'Content Lab'|'Favoritos';
const views:View[]=['Todos','Mis stickers','Personajes privados','Fondos','Content Lab','Favoritos'];
const FAVORITES_KEY='studio-sticker-favorites-v1';

function resourceUrl(file:string){return new URL('/content-lab/'+file.replace(/^\/+/,''),window.location.origin).href;}
const nameKey=(name:string)=>name.trim().toLocaleLowerCase('es');
const isPersonal=(name:string)=>isPersonalCharacterAssetName(name);
const onDevice=(item:Entry)=>item.source==='local';
function toEntries(
 local:StudioLabAsset[],personal:StudioLabAsset[],
 shared:StudioLabAsset[],overrides:Record<string,Kind>
):Entry[]{
 const originals:Entry[]=local.map(a=>({
  id:a.id,name:a.name,url:a.url,kind:organizedStudioKind(a,overrides),
  source:'local' as const,private:true
 }));
 const seenPrivate=new Set(originals.map(item=>nameKey(item.name)));
 const owner=personal.filter(a=>!seenPrivate.has(nameKey(a.name))).map(a=>({
  id:'owner-'+a.id,name:a.name,url:a.url,kind:'sticker' as const,
  source:'private-character' as const,private:true
 }));
 const remote=shared.filter(a=>!isPersonal(a.name)).map(a=>({
  id:'catalog-'+a.id,name:a.name,url:a.url,
  kind:isStudioBackgroundName(a.name)?'background' as const:a.category,
  source:'catalog' as const,private:false
 }));
 // Included resources already approved for the commercial Lab. They are
 // read-only and don't belong to this device's private editable ZIP index.
 const bundled=LAB_ASSETS.map(a=>({
  id:a.id,name:a.name,url:resourceUrl(a.file),kind:a.category,
  source:'bundled' as const,private:false
 }));
 const editorial=EDITORIAL_STICKER_ASSETS.map(a=>({
  id:'editorial-'+a.id,name:a.name,kind:'sticker' as const,
  url:new URL('brand-kits/editorial-stickers/'+a.file,document.baseURI).href,
  source:'editorial' as const,private:true
 }));
 // Local ZIP assets and privately owned characters remain separate from buyer art.
 // The same source image may have multiple references, but only one card is shown.
 return dedupeStudioGallery([...originals,...owner,...remote,...bundled,...editorial]);
}

async function downloadSticker(item:Entry):Promise<void>{
 // A Blob download works for private signed URLs and local IndexedDB images.
 const response=await fetch(item.url);
 if(!response.ok)throw Error('No se pudo cargar el archivo para descargar.');
 const blob=await response.blob();
 const suffix=blob.type.includes('svg')?'.svg':blob.type.includes('webp')?'.webp':
  blob.type.includes('jpeg')?'.jpg':'.png';
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=(friendlyStickerName(item.name).replace(/[^\p{L}\p{N}_-]+/gu,'-')||'sticker')+suffix;
 document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),60000);
}

export default function StudioStickerLibrary({onOpenCarousel}:{onOpenCarousel:()=>void}){
 const [local,setLocal]=useState<StudioLabAsset[]>([]);
 const [personal,setPersonal]=useState<StudioLabAsset[]>([]);
 const [shared,setShared]=useState<StudioLabAsset[]>([]);
 const [overrides,setOverrides]=useState<Record<string,Kind>>({});
 const [approved,setApproved]=useState<string[]>([]);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [view,setView]=useState<View>('Mis stickers');
 const [category,setCategory]=useState<StickerCollection|'Todas'>('Todas');
 const [query,setQuery]=useState('');
 const [visibleLimit,setVisibleLimit]=useState(48);
 const [status,setStatus]=useState('');
 const [libraryError,setLibraryError]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const fileInput=useRef<HTMLInputElement>(null);
 const objectUrls=useRef<string[]>([]);
 const mounted=useRef(false);
 const importedRef=useRef<StudioLabAsset[]>([]);
 const [syncError,setSyncError]=useState('');
 const {syncStatus,retry}=useStudioLibrarySync(local,setShared,setSyncError,approved,overrides);

 const refreshLocal=async()=>{
  const data=await loadLocalStudioStickers();
  const previous=objectUrls.current;
  objectUrls.current=data.objectUrls;
  importedRef.current=data.assets;
  setLocal(data.assets);
  previous.forEach(URL.revokeObjectURL);
  if(data.missing)setStatus(data.missing+' PNG guardados no pudieron leerse; no se borraron.');
 };
 const refreshRemote=async()=>{
  const results=await Promise.allSettled([loadStudioLabAssets(),loadStudioPrivateCharacterAssets()]);
  if(results[0].status==='fulfilled')setShared(results[0].value);
  else setLibraryError('No se pudieron cargar los recursos del Lab. Los locales siguen disponibles.');
  if(results[1].status==='fulfilled')setPersonal(results[1].value);
  else setLibraryError('Los personajes remotos necesitan una sesión de administración activa.');
 };
 useEffect(()=>{
  mounted.current=true;
  void Promise.all([
   Promise.all([
    readEditorRecord<Record<string,Kind>>(STUDIO_CATEGORY_OVERRIDES),
    readEditorRecord<string[]>(STUDIO_APPROVED_SHARES),
    readEditorRecord<string[]>(FAVORITES_KEY)
   ]).then(([kinds,shares,savedFavorites])=>{
    if(!mounted.current)return;
    setOverrides(kinds||{});
    setApproved(Array.isArray(shares)?shares:[]);
    setFavorites(Array.isArray(savedFavorites)?savedFavorites:[]);
   }),
   refreshLocal(),
   refreshRemote()
  ]).catch(error=>{if(mounted.current)setLibraryError(error instanceof Error?error.message:'No se pudo abrir la biblioteca.')})
   .finally(()=>{if(mounted.current)setLoading(false)});
  return()=>{mounted.current=false;objectUrls.current.forEach(URL.revokeObjectURL);objectUrls.current=[]};
 },[]);

 const assets=useMemo(()=>toEntries(local,personal,shared,overrides),[local,personal,shared,overrides]);
 const viewAssets=useMemo(()=>{
  if(view==='Mis stickers')return assets.filter(a=>a.private&&a.kind==='sticker'&&!isPersonal(a.name));
  if(view==='Personajes privados')return assets.filter(a=>a.private&&isPersonal(a.name));
  if(view==='Fondos')return assets.filter(a=>a.kind==='background');
  if(view==='Content Lab')return assets.filter(a=>!a.private&&a.kind==='sticker');
  if(view==='Favoritos')return dedupeStudioGallery(assets.filter(a=>favorites.includes(a.id)&&!isPersonal(a.name)));
  return dedupeStudioGallery(assets.filter(a=>a.kind==='sticker'&&!isPersonal(a.name)));
 },[assets,view,favorites]);
 const collections=useMemo(()=>visibleStickerCollections(
  viewAssets.filter(a=>a.kind==='sticker').map(a=>({
   name:a.name,shared:!a.private,stickerGroup:a.category
  }))
 ).filter(x=>x.label!=='Mis stickers'&&x.label!=='Todos'),[viewAssets]);
 const matches=useMemo(()=>viewAssets.filter(a=>
  (view==='Fondos'||a.kind==='sticker')&&
  (category==='Todas'||stickerCollectionFor({name:a.name,stickerGroup:a.category})===category)&&
  (nameKey(friendlyStickerName(a.name)).includes(nameKey(query))||nameKey(a.name).includes(nameKey(query)))
 ).sort((a,b)=>friendlyStickerName(a.name).localeCompare(friendlyStickerName(b.name),'es',{numeric:true})),[viewAssets,category,query]);
 const shown=matches.slice(0,visibleLimit);
 const count=(tab:View)=>tab==='Todos'?dedupeStudioGallery(assets.filter(a=>a.kind==='sticker'&&!isPersonal(a.name))).length:tab==='Mis stickers'
  ?assets.filter(a=>a.private&&a.kind==='sticker'&&!isPersonal(a.name)).length
  :tab==='Personajes privados'?assets.filter(a=>a.private&&isPersonal(a.name)).length
  :tab==='Fondos'?assets.filter(a=>a.kind==='background').length
  :tab==='Content Lab'?assets.filter(a=>!a.private&&a.kind==='sticker').length
  :assets.filter(a=>favorites.includes(a.id)&&!isPersonal(a.name)).length;

 const changeView=(next:View)=>{
  setView(next);setCategory('Todas');setVisibleLimit(48);
 };
 const move=async(item:Entry,target:Kind)=>{
  if(!onDevice(item))return;
  const next={...overrides,[item.id]:target};
  try{
   await writeEditorRecord(STUDIO_CATEGORY_OVERRIDES,next);
   setOverrides(next);setStatus(friendlyStickerName(item.name)+' se verá en '+(target==='background'?'Fondos':'Stickers')+' también dentro del carrusel.');
  }catch{setStatus('No se pudo guardar la categoría. Ningún archivo se borró.');}
 };
 const toggleFavorite=async(item:Entry)=>{
  const next=favorites.includes(item.id)?favorites.filter(x=>x!==item.id):[...favorites,item.id];
  try{await writeEditorRecord(FAVORITES_KEY,next);setFavorites(next)}
  catch{setStatus('No se pudo guardar en Favoritos.');}
 };
 const shareGeneral=async(item:Entry)=>{
  if(!onDevice(item)||!item.id.startsWith('studio-import-')||item.kind!=='sticker'||!isSafeGenericStudioSticker(item.name)){
   setStatus('Este recurso no es un sticker general aprobado. Sigue privado en tu Studio.');return;
  }
  if(approved.includes(item.id))return;
  const next=[...approved,item.id];
  try{
   await writeEditorRecord(STUDIO_APPROVED_SHARES,next);
   setApproved(next);
   setStatus('Se solicitó compartir '+friendlyStickerName(item.name)+'. Comprueba la confirmación de sincronización.');
  }catch{setStatus('No se pudo autorizar el recurso. Se mantiene privado.');}
 };
 const importFiles=async(files:File[])=>{
  if(busy||!files.length)return;
  setBusy(true);setStatus('Importando archivos privados en tu Studio…');
  try{
   const result=await importLocalStudioStickers(
    files,new Set(importedRef.current.map(x=>x.id)),setStatus
   );
   await refreshLocal();
   setView('Mis stickers');setQuery('');setCategory('Todas');setVisibleLimit(48);
   setStatus(result.added+' guardados privados'+(result.duplicates?' · '+result.duplicates+' duplicados omitidos':'')+
    (result.error?' · Algunos pendientes: '+result.error:'')+'.');
  }catch(e){setStatus(e instanceof Error?e.message:'No se pudieron importar los stickers.')}
  finally{setBusy(false);if(fileInput.current)fileInput.current.value=''}
 };

 return <section className="standalone-stickers" aria-label="Biblioteca privada de stickers">
  <header className="standalone-stickers-header">
   <div><span className="standalone-stickers-eyebrow">MI STUDIO / DISEÑO Y RECURSOS</span>
    <h1>Mi biblioteca de stickers</h1>
    <p>Encuentra, organiza y guarda tus PNG sin abrir ningún carrusel. Los archivos importados se quedan privados hasta que decidas compartir un elemento general.</p>
   </div>
   <div className="standalone-stickers-actions">
    <button type="button" className="standalone-stickers-primary" disabled={busy} onClick={()=>fileInput.current?.click()}>
     <Upload size={17}/>{busy?'Importando…':'Importar PNG o ZIP'}
    </button>
    <button type="button" onClick={onOpenCarousel}><ImagePlus size={17}/> Abrir Carousel Studio</button>
    <button type="button" aria-label="Actualizar biblioteca" disabled={busy} onClick={()=>void Promise.all([refreshLocal(),refreshRemote()]).then(()=>setStatus('Biblioteca actualizada.')).catch(()=>setStatus('No se pudo actualizar todo el contenido.'))}><RefreshCw size={17}/> Actualizar</button>
   </div>
   <input ref={fileInput} type="file" hidden multiple accept=".zip,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
    onChange={e=>void importFiles(Array.from(e.target.files||[]))}/>
  </header>
  <div className="standalone-stickers-summary">
   <span><Archive size={15}/>{count('Mis stickers')} mis stickers</span>
   <span><LockKeyhole size={15}/>{count('Personajes privados')} personajes privados</span>
   <span><FolderOpen size={15}/>{count('Fondos')} fondos</span>
  </div>
  <div className="standalone-stickers-tabs" role="group" aria-label="Secciones de la biblioteca">
   {views.map(item=><button type="button" key={item} className={view===item?'active':''}
    aria-pressed={view===item} onClick={()=>changeView(item)}>
    {item}{item==='Personajes privados'&&<LockKeyhole size={13}/>} <span>{count(item)}</span>
   </button>)}
  </div>
  <div className="standalone-stickers-tools">
   <label className="standalone-stickers-search"><Search size={18}/><input type="search" value={query}
    placeholder="Buscar cintas, animales, etiquetas…" aria-label="Buscar en stickers"
    onChange={e=>{setQuery(e.target.value);setVisibleLimit(48)}}/></label>
   <p>{matches.length} recursos encontrados</p>
  </div>
  {view!=='Fondos'&&<div className="standalone-stickers-filters" role="group" aria-label="Filtrar por tipo">
   <button type="button" className={category==='Todas'?'active':''} aria-pressed={category==='Todas'}
    onClick={()=>{setCategory('Todas');setVisibleLimit(48)}}>Todas</button>
   {collections.map(c=><button type="button" key={c.label} className={category===c.label?'active':''}
    aria-pressed={category===c.label} onClick={()=>{setCategory(c.label);setVisibleLimit(48)}}>
     {c.label} <span>{c.count}</span>
   </button>)}
  </div>}
  {loading&&<p className="standalone-stickers-feedback" role="status">Cargando biblioteca guardada…</p>}
  {status&&<p className="standalone-stickers-feedback" role="status">{status}</p>}
  {libraryError&&<p className="standalone-stickers-feedback" role="alert">{libraryError}</p>}
  {syncError&&<p className="standalone-stickers-feedback" role="alert">{syncError}</p>}
  {syncStatus&&<p className="standalone-stickers-feedback" role="status">{syncStatus} {syncStatus.includes('pendientes')&&<button type="button" onClick={retry}>Reintentar</button>}</p>}
  {view==='Personajes privados'&&<p className="standalone-stickers-private-note"><LockKeyhole size={16}/> Estos personajes son exclusivamente tuyos. No aparecen en Content Lab.</p>}
  {!loading&&(matches.length?<div className="standalone-stickers-grid">
   {shown.map(item=><article key={item.id} className="standalone-stickers-card">
    <div className="standalone-stickers-preview">
     <img loading="lazy" src={item.url} alt={friendlyStickerName(item.name)}/>
     <button type="button" className={'standalone-stickers-favorite'+(favorites.includes(item.id)?' active':'')}
      aria-label={(favorites.includes(item.id)?'Quitar de Favoritos ':'Añadir a Favoritos ')+friendlyStickerName(item.name)}
      onClick={()=>void toggleFavorite(item)}><Star size={17} fill={favorites.includes(item.id)?'currentColor':'none'}/></button>
    </div>
    <div className="standalone-stickers-card-details"><strong title={friendlyStickerName(item.name)}>{friendlyStickerName(item.name)}</strong>
     <small>{item.private?<><LockKeyhole size={12}/> {item.source==='editorial'?'Solo Studio':'Privado'}</>:<><Check size={12}/> Incluido en Lab</>}
      {item.kind==='background'?' · Fondo':isPersonal(item.name)?' · Personaje privado':' · '+stickerCollectionFor({name:item.name,stickerGroup:item.category})}</small>
    </div>
    <div className="standalone-stickers-card-actions">
     {onDevice(item)&&<button type="button" onClick={()=>void move(item,item.kind==='background'?'sticker':'background')}>
      {item.kind==='background'?'Mover a Stickers':'Mover a Fondos'}</button>}
     {onDevice(item)&&item.id.startsWith('studio-import-')&&item.kind==='sticker'&&!isPersonal(item.name)&&!approved.includes(item.id)&&isSafeGenericStudioSticker(item.name)&&
      <button type="button" onClick={()=>void shareGeneral(item)}><Share2 size={13}/> Compartir en Lab</button>}
     {onDevice(item)&&approved.includes(item.id)&&<small className="standalone-stickers-shared-request">Compartir solicitado</small>}
     <button type="button" onClick={()=>void downloadSticker(item).catch(e=>setStatus(e instanceof Error?e.message:'No se pudo descargar el recurso.'))}><Download size={13}/> Descargar</button>
    </div>
   </article>)}
  </div>:<div className="standalone-stickers-empty">
   <Archive size={28}/>
   <strong>{view==='Mis stickers'?'Aquí aparecerán tus stickers importados y recursos exclusivos del Studio.':'No hay recursos en esta categoría.'}</strong>
   <p>{view==='Mis stickers'?'Importa tu ZIP una sola vez. Después los verás también en el carrusel.':'Prueba otra categoría o búsqueda.'}</p>
  </div>)}
  {matches.length>visibleLimit&&<button type="button" className="standalone-stickers-more"
    onClick={()=>setVisibleLimit(n=>n+48)}>Ver más · {visibleLimit} de {matches.length}</button>}
  <p className="standalone-stickers-footer">Los archivos que importas en este dispositivo también aparecen en el editor. No se borran diseños ni se publican automáticamente en el Lab.</p>
 </section>;
}
