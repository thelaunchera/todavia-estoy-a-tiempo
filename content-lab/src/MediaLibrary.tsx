import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Upload,ImagePlus,Images,Check,Trash2,Pencil,Save,Search,ArrowRight,LoaderCircle,Palette,FolderHeart} from 'lucide-react';
import {api} from './platform/client';
import {MEDIA_CATEGORIES,assetCategory,displayAssetName,cleanAssetName,type LibraryAsset,type MediaCategory} from './MediaAsset';
import './MediaLibrary.css';
import StickerDownloads from './StickerDownloads';

type Props={
 brand:{id:string;name:string;referenceAssetId?:string};assets:LibraryAsset[];images:Record<string,string>;
 busy:boolean;notify:(s:string)=>void;showError:(e:unknown)=>void;
 onUpload:(file:File,category:MediaCategory)=>Promise<LibraryAsset|null>;
 onUpdate:(asset:LibraryAsset)=>void;onDelete:(asset:LibraryAsset)=>Promise<void>;
 onSaveDefaultReference:(id:string)=>Promise<void>;
 onCreateWithPhotos:(sourceId:string,referenceId:string)=>void;
};
const filters=[{id:'all',label:'Todo'},...MEDIA_CATEGORIES.map(c=>({id:c.id,label:c.label}))] as const;
export default function MediaLibrary({brand,assets,images,busy,notify,showError,onUpload,onUpdate,onDelete,onSaveDefaultReference,onCreateWithPhotos}:Props){
 const originalInput=useRef<HTMLInputElement>(null),referenceInput=useRef<HTMLInputElement>(null),otherInput=useRef<HTMLInputElement>(null);
 const [otherCategory,setOtherCategory]=useState<MediaCategory>('logo');
 const [filter,setFilter]=useState<string>('all'),[search,setSearch]=useState('');
 const [sourceId,setSourceId]=useState(''),[referenceId,setReferenceId]=useState('');
 const [saving,setSaving]=useState(''),[editing,setEditing]=useState(''),[name,setName]=useState('');
 useEffect(()=>{setSourceId('');setReferenceId('');setFilter('all');setSearch('');setEditing('')},[brand.id]);
 const own=assets.filter(a=>a.brandId===brand.id);
 const refs=own.filter(a=>assetCategory(a)==='reference'||a.id===brand.referenceAssetId);
 const originals=own.filter(a=>['original','screenshot','generated'].includes(assetCategory(a)));
 const visible=useMemo(()=>own.filter(a=>(filter==='all'||assetCategory(a)===filter)&&(!search.trim()||(displayAssetName(a)+' '+a.name).toLowerCase().includes(search.toLowerCase().trim()))),[own,filter,search]);
 const upload=async(file:File|undefined,category:MediaCategory)=>{
  if(!file)return;
  const created=await onUpload(file,category);
  if(created){
   if(category==='reference')setReferenceId(created.id);
   if(category==='original')setSourceId(created.id);
   notify((category==='reference'?'Referencia':'Imagen')+' guardada en '+brand.name+'.');
  }
  if(originalInput.current)originalInput.current.value='';
  if(referenceInput.current)referenceInput.current.value='';
  if(otherInput.current)otherInput.current.value='';
 };
 const update=async(a:LibraryAsset,patch:Partial<LibraryAsset>)=>{
  setSaving(a.id);
  try{const {data}=await api.put('/api/assets/'+a.id,patch);onUpdate(data as LibraryAsset);notify('Imagen actualizada para esta marca.');setEditing('')}
  catch(e){showError(e)}finally{setSaving('')}
 };
 const chosenSource=own.find(a=>a.id===sourceId);
 const chosenReference=own.find(a=>a.id===referenceId)||own.find(a=>a.id===brand.referenceAssetId);
 const selectedReferenceId=referenceId||chosenReference?.id||'';
 return <div className="ml-root">
  <header className="ml-heading"><div><span className="eyebrow">PRIVATE MEDIA STUDIO · {brand.name.toUpperCase()}</span><h1>Tus imágenes, <em>en orden.</em></h1><p>Fotografías reales, referencias, logos y resultados IA organizados por marca.</p></div>
   <div className="ml-heading-actions"><select aria-label="Tipo de nuevo archivo" value={otherCategory} onChange={e=>setOtherCategory(e.target.value as MediaCategory)}>
      <option value="logo">Logo</option><option value="screenshot">Screenshot</option><option value="original">Foto original</option><option value="reference">Referencia</option>
     </select><button type="button" className="btn ghost" onClick={()=>otherInput.current?.click()} disabled={busy}><Upload size={16}/> Subir archivo</button></div>
  </header>
  <section className="ml-reference-studio" aria-label="Reference Studio">
   <div className="ml-reference-heading"><div><span className="eyebrow">REFERENCE STUDIO</span><h2>Dos imágenes. Dos funciones diferentes.</h2><p>La primera define a la persona o producto real. La segunda solo inspira el estilo. No se cambia tu original.</p></div><Palette size={27}/></div>
   <div className="ml-upload-slots">
    <div className="ml-upload-slot"><div className="ml-slot-label"><span>01</span><div><strong>Foto original · sujeto</strong><small>La identidad que debes conservar</small></div></div>
     <div className="ml-slot-photo">{chosenSource&&images[chosenSource.id]?<img src={images[chosenSource.id]} alt="Foto original elegida"/>:<ImagePlus size={30}/>}</div>
     <select aria-label="Elegir foto original" value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Elegir de mis fotos</option>{originals.map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select>
     <button type="button" className="btn ghost" onClick={()=>originalInput.current?.click()} disabled={busy}><Upload size={15}/> Subir foto original</button>
    </div>
    <div className="ml-upload-slot reference"><div className="ml-slot-label"><span>02</span><div><strong>Referencia visual · estilo</strong><small>Colores, composición y luz; no otra identidad</small></div></div>
     <div className="ml-slot-photo">{chosenReference&&images[chosenReference.id]?<img src={images[chosenReference.id]} alt="Referencia visual elegida"/>:<Palette size={30}/>}</div>
     <select aria-label="Elegir referencia de estilo" value={selectedReferenceId} onChange={e=>setReferenceId(e.target.value)}><option value="">Sin referencia</option>{refs.map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select>
     <button type="button" className="btn ghost" onClick={()=>referenceInput.current?.click()} disabled={busy}><Upload size={15}/> Subir referencia</button>
     {selectedReferenceId&&<button type="button" className="ml-default-ref" disabled={saving==='default'} onClick={async()=>{setSaving('default');try{await onSaveDefaultReference(selectedReferenceId);notify('Referencia guardada como preferida para esta marca.')}catch(e){showError(e)}finally{setSaving('')}}}><FolderHeart size={15}/> Usar como referencia fija</button>}
    </div>
   </div>
   <div className="ml-reference-footer"><small><Check size={14}/> Subir y organizar fotos no consume créditos de IA.</small><button className="btn dark" disabled={!chosenSource} onClick={()=>onCreateWithPhotos(chosenSource!.id,selectedReferenceId)}>Diseñar con estas fotos <ArrowRight size={16}/></button></div>
  </section>
  <StickerDownloads/>
  <section className="ml-library" aria-label="Biblioteca de imágenes">
    <div className="ml-library-head"><div><h2>Biblioteca visual</h2><p>{own.length} archivos privados en esta marca · selecciona para cambiar nombre o categoría</p></div><div className="ml-search"><Search size={16}/><input aria-label="Buscar imágenes" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre…"/></div></div>
    <div className="ml-filters" aria-label="Filtrar imágenes">{filters.map(f=><button key={f.id} type="button" aria-pressed={filter===f.id} className={filter===f.id?'active':''} onClick={()=>setFilter(f.id)}>{f.label}<span>{f.id==='all'?own.length:own.filter(a=>assetCategory(a)===f.id).length}</span></button>)}</div>
    {visible.length?<div className="ml-grid">{visible.map(a=><article key={a.id} className="ml-card">
      <div className="ml-thumb">{images[a.id]?<img src={images[a.id]} alt={displayAssetName(a)} loading="lazy"/>:<LoaderCircle className="spin" size={23}/>}
       <span>{MEDIA_CATEGORIES.find(c=>c.id===assetCategory(a))?.label}</span></div>
      <div className="ml-card-body">
       {editing===a.id?<div className="ml-rename"><label htmlFor={'rename-'+a.id}>Nombre de la imagen</label><input id={'rename-'+a.id} value={name} maxLength={85} onChange={e=>setName(e.target.value)}/><div><button type="button" disabled={!cleanAssetName(name)||saving===a.id} onClick={()=>update(a,{displayName:cleanAssetName(name)})}><Save size={15}/> Guardar</button><button type="button" onClick={()=>setEditing('')}>Cancelar</button></div></div>:<div className="ml-card-title"><strong title={displayAssetName(a)}>{displayAssetName(a)}</strong><button aria-label={'Renombrar '+displayAssetName(a)} onClick={()=>{setEditing(a.id);setName(displayAssetName(a))}}><Pencil size={15}/></button></div>}
       <div className="ml-card-bottom"><select aria-label={'Categoría de '+displayAssetName(a)} value={assetCategory(a)} onChange={e=>update(a,{category:e.target.value as MediaCategory})} disabled={saving===a.id}>{MEDIA_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
       <button type="button" className="ml-trash" aria-label={'Eliminar '+displayAssetName(a)} onClick={()=>{if(window.confirm('¿Eliminar esta imagen de tu biblioteca?'))void onDelete(a)}}><Trash2 size={15}/></button></div>
      </div>
    </article>)}</div>:<div className="ml-empty"><Images size={27}/><strong>{own.length?'No hay imágenes en este filtro.':'Tu biblioteca empieza con tu primera foto.'}</strong><p>Puedes subir fotos, referencias y logos desde el panel superior.</p></div>}
  </section>
  <input ref={originalInput} type="file" accept="image/*,.heic,.heif" hidden onChange={e=>void upload(e.target.files?.[0],'original')}/>
  <input ref={referenceInput} type="file" accept="image/*,.heic,.heif" hidden onChange={e=>void upload(e.target.files?.[0],'reference')}/>
  <input ref={otherInput} type="file" accept="image/*,.heic,.heif" hidden onChange={e=>void upload(e.target.files?.[0],otherCategory)}/>
 </div>
}
