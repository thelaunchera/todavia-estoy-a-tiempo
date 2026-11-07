import {useCallback,useEffect,useMemo,useState} from 'react';
import {Check,Copy,Download,Film,ImagePlus,Palette,RefreshCw,Trash2,UploadCloud,Volume2} from 'lucide-react';
import {offBriefBrand,offBriefAssetSlots,offBriefSlogans,type BrandAssetSlot} from './youtube/off-brief-brand';
import {loadYouTubeBrandVault,removeYouTubeBrandAsset,saveYouTubeBrandCopy,uploadYouTubeBrandAsset,type StudioBrandAsset} from './supabase-client';
import './youtube-brand-kit.css';
const groups=['Marca','Canal','Elementos','Portadas T1','Portadas T2'] as const;
const VIDEO_DRIVE_KEY='video_bumper_drive_url';
function normalizedDriveVideoUrl(value:string):string{
 let url:URL;
 try{url=new URL(value.trim())}catch{throw new Error('Pega el enlace completo del archivo de Google Drive.')}
 if(url.protocol!=='https:'||url.hostname!=='drive.google.com')throw new Error('El enlace debe ser de drive.google.com.');
 const match=url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]{15,})(?:\/|$)/);
 const id=match?.[1]||((url.pathname==='/open'||url.pathname==='/uc')?url.searchParams.get('id'):null);
 if(!id||!/^[a-zA-Z0-9_-]{15,}$/.test(id))throw new Error('Copia el enlace de un archivo de video, no de una carpeta.');
 return 'https://drive.google.com/file/d/'+id+'/view';
}
function getIcon(slot:BrandAssetSlot){return slot.kind==='video'?<Film size={24}/>:slot.kind==='audio'?<Volume2 size={24}/>:<ImagePlus size={24}/>;}
function saveJson(name:string,data:unknown){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function checkBumperDuration(file:File,maxSeconds:number):Promise<void>{
 return new Promise((resolve,reject)=>{
  const video=document.createElement('video');
  const url=URL.createObjectURL(file);
  let completed=false;
  let timer:number|undefined;
  const finish=(error?:Error)=>{
   if(completed)return;
   completed=true;
   if(timer!==undefined)window.clearTimeout(timer);
   video.onloadedmetadata=null;
   video.onerror=null;
   video.removeAttribute('src');
   video.load();
   URL.revokeObjectURL(url);
   if(error)reject(error);else resolve();
  };
  video.preload='metadata';
  video.playsInline=true;
  video.onloadedmetadata=()=>{
   const seconds=video.duration;
   if(!Number.isFinite(seconds)||seconds<=0)finish(new Error('No se pudo leer la duración del video. Usa un MP4 o WEBM válido.'));
   else if(seconds>maxSeconds+0.1)finish(new Error('Este video dura '+Math.round(seconds*10)/10+' segundos. La animación del logo admite hasta '+maxSeconds+' segundos.'));
   else finish();
  };
  video.onerror=()=>finish(new Error('No se pudo abrir el video. Comprueba que sea MP4 o WEBM.'));
  timer=window.setTimeout(()=>finish(new Error('No se pudo comprobar la duración del video. Prueba con un MP4 optimizado para web.')),10000);
  video.src=url;
  video.load();
 });
}
function showPreview(asset:StudioBrandAsset|undefined){
 if(!asset?.url)return null;
 if(asset.mime_type.startsWith('video/'))return <video src={asset.url} controls preload="metadata" playsInline/>;
 if(asset.mime_type.startsWith('audio/'))return <audio src={asset.url} controls preload="metadata"/>;
 return <img src={asset.url} alt={asset.file_name} loading="lazy"/>;
}
export default function YouTubeBrandKit({entries}:{entries:{title:string;section?:string;art?:string;link?:string}[]}){
 const [files,setFiles]=useState<Record<string,StudioBrandAsset>>({});
 const [savedCopy,setSavedCopy]=useState<Record<string,string>>({});
 const [draftCopy,setDraftCopy]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState('');
 const [loading,setLoading]=useState(false);
 const [notice,setNotice]=useState('');
 const [error,setError]=useState('');
 const [openPrompts,setOpenPrompts]=useState<Record<string,boolean>>({});
 const [coverSeason,setCoverSeason]=useState(1);
 const [driveDraft,setDriveDraft]=useState('');
 const [driveError,setDriveError]=useState('');
 const [fileErrors,setFileErrors]=useState<Record<string,string>>({});
 const reload=useCallback(async()=>{
  setLoading(true);setError('');
  try{const data=await loadYouTubeBrandVault();
   setFiles(Object.fromEntries(data.assets.map(a=>[a.asset_id,a])));
   setSavedCopy(Object.fromEntries(data.copies.map(t=>[t.copy_key,t.content])));
   setDriveDraft(data.copies.find(t=>t.copy_key===VIDEO_DRIVE_KEY)?.content||'');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo cargar la biblioteca.');}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 const done=useMemo(()=>offBriefAssetSlots.filter(x=>Boolean(files[x.id]||(x.id==='video_bumper'&&savedCopy[VIDEO_DRIVE_KEY])||entries.some(entry=>entry.section==='youtube-storyboards-v1'&&entry.title==='OFF BRIEF brand: '+x.id&&Boolean(entry.art||entry.link)))).length,[files,entries,savedCopy]);
 const copy=async(text:string,title:string)=>{
  try{await navigator.clipboard.writeText(text);setNotice(title+' copiado.');}
  catch{setNotice('No se pudo copiar; selecciona el texto manualmente.');}
 };
 const upload=async(slot:BrandAssetSlot,file:File)=>{
  setBusy(slot.id);setNotice('');setError('');
  setFileErrors(old=>({...old,[slot.id]:''}));
  try{
   if(slot.id==='video_bumper'){
    if(file.size>slot.maxMb*1000000)throw new Error('Este video pesa '+(file.size/1000000).toFixed(1)+' MB. El Studio admite hasta '+slot.maxMb+' MB para subirlo directamente. Para un archivo mayor usa «Vincular video de Drive» debajo, sin comprimir el original.');
    await checkBumperDuration(file,10);
   }
   await uploadYouTubeBrandAsset(slot.id,file,slot.maxMb);
   await reload();
   setNotice(slot.title+' guardado en la biblioteca privada.');
   setFileErrors(old=>({...old,[slot.id]:''}));
  }
  catch(e){
   const message=e instanceof Error?e.message:'No se pudo guardar el archivo.';
   setError(message);setFileErrors(old=>({...old,[slot.id]:message}));
  }
  finally{setBusy('');}
 };
 const saveDriveVideo=async()=>{
  setBusy('drive-video');setNotice('');setError('');setDriveError('');
  try{
   const link=normalizedDriveVideoUrl(driveDraft);
   await saveYouTubeBrandCopy(VIDEO_DRIVE_KEY,link);
   setSavedCopy(old=>({...old,[VIDEO_DRIVE_KEY]:link}));
   setDriveDraft(link);
   setNotice('Enlace guardado en tu biblioteca privada. El video original sigue en Drive, sin compresión ni copia.');
  }catch(e){
   const message=e instanceof Error?e.message:'No se pudo vincular el video de Drive.';
   setError(message);setDriveError(message);
  }
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
  const linked=entries.find(entry=>entry.section==='youtube-storyboards-v1' && entry.title==='OFF BRIEF brand: '+slot.id);
  const driveLink=slot.id==='video_bumper'?(savedCopy[VIDEO_DRIVE_KEY]||''):'';
  const accept=slot.kind==='image'?'image/png,image/jpeg,image/webp':slot.kind==='video'?'video/mp4,video/webm,.mp4,.webm':'audio/mpeg,audio/wav,audio/x-wav';
  return <article key={slot.id} className="ob-kit-card">
   <div className="ob-kit-preview">
    {asset?.url?showPreview(asset):linked?.art?<img src={linked.art} alt={slot.title} loading="lazy"/>:<div className="ob-kit-blank">{getIcon(slot)}<span>{driveLink?'Video original en Drive':'Pendiente de subir'}</span></div>}
    <span className="ob-kit-state">{asset||linked?'Archivo guardado':driveLink?'Vinculado en Drive':'Sin archivo'}</span>
   </div>
   <div className="ob-kit-card-body">
    <h4>{slot.title}</h4>
    <p>{slot.details}</p>
    <p className="ob-kit-format">{slot.format} · límite {slot.maxMb} MB</p>
    {asset&&<p className="ob-kit-filename" title={asset.file_name}>{asset.file_name}</p>}
    {slot.id==='video_bumper'&&<p className="ob-kit-file-help">MP4/WEBM de hasta 10 segundos. Para archivos de hasta 50 MB usa «Subir archivo». Si pesa más, guarda el enlace original de Drive aquí debajo sin reducir su calidad.</p>}
    <div className="ob-kit-actions">
     <label htmlFor={'offbrief-'+slot.id} className={'ob-kit-upload'+(busy===slot.id?' is-busy':'')}>
      <UploadCloud size={15}/>{busy===slot.id?'Guardando...':asset?'Reemplazar':'Subir archivo'}
     </label>
     <input className="ob-kit-file" type="file" id={'offbrief-'+slot.id} accept={accept}
       disabled={busy===slot.id||loading} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void upload(slot,file);}}/>
     {asset&&<a href={asset.url} target="_blank" rel="noopener noreferrer">Ver</a>}
     {!asset&&linked?.link&&<a href={linked.link} target="_blank" rel="noopener noreferrer">Ver original en Drive</a>}
     {asset&&<button type="button" onClick={()=>void remove(slot)} disabled={busy===slot.id} aria-label={'Eliminar '+slot.title}><Trash2 size={15}/></button>}
    </div>
    {fileErrors[slot.id]&&<p className="ob-kit-inline-error" role="alert">{fileErrors[slot.id]}</p>}
    {slot.id==='video_bumper'&&<div className="ob-kit-drive-link">
     <label htmlFor="ob-video-drive-link">Vincular video de Drive · sin límite de tamaño del Studio</label>
     <p>Para archivos mayores de 50 MB. El video permanece en tu Drive y el Studio guarda únicamente el enlace privado. La duración prevista sigue siendo hasta 10 segundos.</p>
     <div className="ob-kit-drive-controls">
      <input id="ob-video-drive-link" type="url" inputMode="url" value={driveDraft} onChange={e=>{setDriveDraft(e.target.value);setDriveError('');}} placeholder="https://drive.google.com/file/d/…/view" aria-label="Enlace del video original de Google Drive"/>
      <button type="button" onClick={()=>void saveDriveVideo()} disabled={busy==='drive-video'||loading||!driveDraft.trim()}>{busy==='drive-video'?'Guardando...':'Guardar enlace de Drive'}</button>
     </div>
     {driveError&&<p className="ob-kit-inline-error" role="alert">{driveError}</p>}
     {driveLink&&<a href={driveLink} target="_blank" rel="noopener noreferrer">Abrir video original en Drive</a>}
    </div>}
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
     <button type="button" onClick={()=>saveJson('OFF-BRIEF-brand-guide.json',{brand:offBriefBrand,slogans:offBriefSlogans.map(s=>({...s,text:savedCopy[s.id]??s.text})),assets:offBriefAssetSlots.map(s=>({...s,stored:Boolean(files[s.id]||entries.some(entry=>entry.section==='youtube-storyboards-v1'&&entry.title==='OFF BRIEF brand: '+s.id))}))})}><Download size={15}/> Guía JSON</button>
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
