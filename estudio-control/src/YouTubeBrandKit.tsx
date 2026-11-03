import {useCallback,useEffect,useMemo,useState} from 'react';
import {Check,Copy,Download,Film,ImagePlus,Palette,RefreshCw,Trash2,UploadCloud,Volume2} from 'lucide-react';
import {offBriefBrand,offBriefAssetSlots,offBriefSlogans,type BrandAssetSlot} from './youtube/off-brief-brand';
import {loadYouTubeBrandVault,removeYouTubeBrandAsset,saveYouTubeBrandCopy,uploadYouTubeBrandAsset,type StudioBrandAsset} from './supabase-client';
import './youtube-brand-kit.css';
const groups=['Marca','Canal','Elementos','Portadas T1','Portadas T2'] as const;
function getIcon(slot:BrandAssetSlot){return slot.kind==='video'?<Film size={24}/>:slot.kind==='audio'?<Volume2 size={24}/>:<ImagePlus size={24}/>;}
function saveJson(name:string,data:unknown){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function showPreview(asset:StudioBrandAsset|undefined){
 if(!asset?.url)return null;
 if(asset.mime_type.startsWith('video/'))return <video src={asset.url} controls preload="metadata" playsInline/>;
 if(asset.mime_type.startsWith('audio/'))return <audio src={asset.url} controls preload="metadata"/>;
 return <img src={asset.url} alt={asset.file_name} loading="lazy"/>;
}
export default function YouTubeBrandKit(){
 const [files,setFiles]=useState<Record<string,StudioBrandAsset>>({});
 const [savedCopy,setSavedCopy]=useState<Record<string,string>>({});
 const [draftCopy,setDraftCopy]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState('');
 const [loading,setLoading]=useState(false);
 const [notice,setNotice]=useState('');
 const [error,setError]=useState('');
 const [openPrompts,setOpenPrompts]=useState<Record<string,boolean>>({});
 const [coverSeason,setCoverSeason]=useState(1);
 const reload=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await loadYouTubeBrandVault();
   setFiles(Object.fromEntries(data.assets.map(a=>[a.asset_id,a])));
   setSavedCopy(Object.fromEntries(data.copies.map(t=>[t.copy_key,t.content])));
  }catch(e){setError(e instanceof Error?e.message:'No se pudo cargar la biblioteca.');}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 const done=useMemo(()=>offBriefAssetSlots.filter(x=>Boolean(files[x.id])).length,[files]);
 const copy=async(text:string,title:string)=>{
  try{await navigator.clipboard.writeText(text);setNotice(title+' copiado.');}
  catch{setNotice('No se pudo copiar; selecciona el texto manualmente.');}
 };
 const upload=async(slot:BrandAssetSlot,file:File)=>{
  setBusy(slot.id);setNotice('');setError('');
  try{await uploadYouTubeBrandAsset(slot.id,file,slot.maxMb);await reload();setNotice(slot.title+' guardado en la biblioteca privada.');}
  catch(e){setError(e instanceof Error?e.message:'No se pudo guardar el archivo.');}
  finally{setBusy('');}
 };
 const remove=async(slot:BrandAssetSlot)=>{
  if(!window.confirm('¿Eliminar el archivo guardado de '+slot.title+'? El prompt permanecerá.'))return;
  setBusy(slot.id);setNotice('');setError('');
  try{await removeYouTubeBrandAsset(slot.id);await reload();setNotice('Archivo eliminado. La ficha permanece para reemplazarlo.');}
  catch(e){setError(e instanceof Error?e.message:'No se pudo eliminar.');}
  finally{setBusy('');}
 };
 const saveCopy=async(key:string,defaultText:string)=>{
  const text=(draftCopy[key]??savedCopy[key]??defaultText).trim();
  setBusy('copy-'+key);setError('');setNotice('');
  try{await saveYouTubeBrandCopy(key,text);setSavedCopy(old=>({...old,[key]:text}));setNotice('Texto guardado.');}
  catch(e){setError(e instanceof Error?e.message:'No se pudo guardar el texto.');}
  finally{setBusy('');}
 };
 const renderCard=(slot:BrandAssetSlot)=>{
  const asset=files[slot.id];
  const accept=slot.kind==='image'?'image/png,image/jpeg,image/webp':slot.kind==='video'?'video/mp4,video/webm':'audio/mpeg,audio/wav,audio/x-wav';
  return <article key={slot.id} className="ob-kit-card">
   <div className="ob-kit-preview">
    {asset?.url?showPreview(asset):<div className="ob-kit-blank">{getIcon(slot)}<span>Pendiente de subir</span></div>}
    <span className="ob-kit-state">{asset?'Archivo guardado':'Sin archivo'}</span>
   </div>
   <div className="ob-kit-card-body">
    <h4>{slot.title}</h4>
    <p>{slot.details}</p>
    <p className="ob-kit-format">{slot.format} · límite {slot.maxMb} MB</p>
    {asset&&<p className="ob-kit-filename" title={asset.file_name}>{asset.file_name}</p>}
    <div className="ob-kit-actions">
     <label htmlFor={'offbrief-'+slot.id} className={'ob-kit-upload'+(busy===slot.id?' is-busy':'')}>
      <UploadCloud size={15}/>{busy===slot.id?'Guardando...':asset?'Reemplazar':'Subir archivo'}
     </label>
     <input className="ob-kit-file" type="file" id={'offbrief-'+slot.id} accept={accept}
       disabled={busy===slot.id||loading} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void upload(slot,file);}}/>
     {asset&&<a href={asset.url} target="_blank" rel="noopener noreferrer">Ver</a>}
     {asset&&<button type="button" onClick={()=>void remove(slot)} disabled={busy===slot.id} aria-label={'Eliminar '+slot.title}><Trash2 size={15}/></button>}
    </div>
    <button type="button" className="ob-kit-toggle" onClick={()=>setOpenPrompts(old=>({...old,[slot.id]:!old[slot.id]}))}>{openPrompts[slot.id]?'Ocultar':'Ver'} Master Prompt visual</button>
    {openPrompts[slot.id]&&<div className="ob-kit-prompt"><textarea readOnly rows={10} value={slot.prompt} aria-label={'Prompt de '+slot.title}/><button type="button" onClick={()=>void copy(slot.prompt,'Prompt de '+slot.title)}><Copy size={15}/> Copiar prompt</button></div>}
   </div>
  </article>;
 };
 return <div className="ob-kit">
   <section className="yt-paper ob-kit-head">
    <div className="yt-small-title"><Palette size={15}/> OFF BRIEF · BRAND & CHANNEL KIT</div>
    <h3>Identidad, slogans y portadas de la serie</h3>
    <p>Tu biblioteca privada de producción. Cada archivo queda asociado a su función, a su prompt original y a la temporada correspondiente. No se publica en YouTube automáticamente.</p>
    <div className="ob-kit-summary"><strong>{done}/{offBriefAssetSlots.length}</strong> archivos guardados <button type="button" disabled={loading} onClick={()=>void reload()}><RefreshCw size={15}/>{loading?'Actualizando...':'Actualizar'}</button>
     <button type="button" onClick={()=>saveJson('OFF-BRIEF-brand-guide.json',{brand:offBriefBrand,slogans:offBriefSlogans.map(s=>({...s,text:savedCopy[s.id]??s.text})),assets:offBriefAssetSlots.map(s=>({...s,stored:Boolean(files[s.id])}))})}><Download size={15}/> Guía JSON</button>
    </div>
    {notice&&<p className="ob-kit-success" role="status"><Check size={15}/>{notice}</p>}
    {error&&<p className="ob-kit-error" role="alert">{error}</p>}
   </section>
   <section className="yt-paper">
    <div className="yt-small-title">DIRECCIÓN DE ARTE</div><h3>Sistema visual OFF BRIEF</h3>
    <div className="ob-kit-palette">{offBriefBrand.palette.map(c=><div key={c.hex}><span style={{background:c.hex}}/><strong>{c.name}</strong><small>{c.hex}</small></div>)}</div>
    <p><b>Tipografía:</b> {offBriefBrand.fonts}</p>
    <p><b>Tono:</b> {offBriefBrand.tone}</p>
    <p><b>Intro:</b> {offBriefBrand.logoMotion}</p>
    <p><b>Portadas:</b> {offBriefBrand.thumbnailSystem}</p>
   </section>
   <section className="yt-paper">
     <div className="yt-small-title">TEXTOS EDITABLES Y GUARDADOS</div><h3>Slogans y descripción de YouTube</h3>
     <p>Cada slogan se puede cambiar sin modificar el guion. El botón «Guardar» lo deja disponible en tu cuenta del Studio.</p>
     <div className="ob-kit-copy-grid">{offBriefSlogans.map(item=>{
       const text=draftCopy[item.id]??savedCopy[item.id]??item.text;
       const changed=text!==(savedCopy[item.id]??item.text);
       return <article key={item.id}>
        <h4>{item.label}</h4><p>{item.purpose}</p>
        <textarea value={text} rows={item.id==='channel_bio'?4:2} maxLength={1500}
         onChange={e=>setDraftCopy(old=>({...old,[item.id]:e.target.value}))} aria-label={'Editar '+item.label}/>
        <div className="ob-kit-copy-actions"><button type="button" disabled={busy==='copy-'+item.id||!changed} onClick={()=>void saveCopy(item.id,item.text)}>Guardar</button>
         <button type="button" onClick={()=>void copy(text,item.label)}><Copy size={14}/> Copiar</button></div>
       </article>;
     })}</div>
   </section>
   {groups.filter(g=>!g.startsWith('Portadas')).map(group=><section key={group} className="yt-paper">
     <div className="yt-small-title">{group==='Marca'?'LOGOTIPO Y SÍMBOLO':group==='Canal'?'YOUTUBE · CABECERA Y PERFIL':'RECURSOS RECURRENTES DE LOS EPISODIOS'}</div>
     <h3>{group==='Marca'?'Logo y versiones':group==='Canal'?'Banner y foto de perfil':'Elementos distintivos de la serie'}</h3>
     <div className="ob-kit-grid">{offBriefAssetSlots.filter(s=>s.group===group).map(renderCard)}</div>
   </section>)}
   <section className="yt-paper">
    <div className="yt-small-title">THUMBNAILS · TEMPORADAS</div><h3>Portadas individuales de cada capítulo</h3>
    <p>Las propuestas se basan en la entrada real de cada capítulo, con hooks diferentes. Genera la imagen sin letras y añade el título en el editor para mantener nitidez y tipografía consistente.</p>
    <div className="ob-kit-switch" role="group" aria-label="Temporada de portadas">
     <button type="button" aria-pressed={coverSeason===1} className={coverSeason===1?'active':''} onClick={()=>setCoverSeason(1)}>Temporada 1 · 8 portadas</button>
     <button type="button" aria-pressed={coverSeason===2} className={coverSeason===2?'active':''} onClick={()=>setCoverSeason(2)}>Temporada 2 · 8 portadas</button>
    </div>
    <div className="ob-kit-grid">{offBriefAssetSlots.filter(s=>s.season===coverSeason).map(renderCard)}</div>
   </section>
   <p className="ob-kit-help">Banner recomendado: 2560×1440, máximo 6 MB; elementos centrales dentro del área segura. Portadas recomendadas para videos: 3840×2160, 16:9. Las imágenes subidas aquí son privadas hasta que tú decidas exportarlas y publicarlas.</p>
  </div>;
}
