import { useCallback, useEffect, useMemo, useState } from 'react';
import { zipSync, strToU8 } from 'fflate';
import { Camera, Check, Copy, ImagePlus, Save, Users, CalendarDays, Film, Shirt, Search, UploadCloud, Trash2, RefreshCcw, Eye } from 'lucide-react';
import { api, loadYouTubeSavedPhotos, uploadYouTubePhoto, removeYouTubePhoto, type YouTubeSavedPhoto as PrivatePhoto } from './supabase-client';
import { youtubeBrief } from './youtube/brief';
import { youtubeEpisodes } from './youtube/episodes';
import { getYouTubePhotoPrompt, youtubePhotoBoard, type YouTubePhoto } from './youtube/visual-plan';
import { getEpisodeProductionBlocks, getEpisodeProductionMaster, type EpisodePhotoAvailability } from './youtube/episode-production-master';
import { getCharacterLookPrompt, youtubeHolidayFrames, youtubeWardrobe, youtubeReleasePlan } from './youtube/wardrobe';
import './youtube-visual-library.css';

export const YOUTUBE_PHOTO_SECTION = 'youtube-storyboards-v1';
export type YouTubeSavedPhoto = {id:string;title:string;section?:string;art?:string;notes?:string;status?:string;link?:string};
type Props={ entries:YouTubeSavedPhoto[]; onChanged:()=>Promise<void>;readOnly?:boolean };
const base=import.meta.env.BASE_URL;
const avatarImages:Record<string,string> = {
  Nia:base+'youtube/characters/nia.webp',
  Ruby:base+'youtube/characters/ruby.webp'
};
const episodeNum=(n:number)=>String(n).padStart(2,'0');
const safeImageUrl=(value:string)=>{
  try {
    const u=new URL(value.trim());
    return u.protocol==='https:'&&!u.username&&!u.password&&!/^(localhost|127\.|10\.|192\.168\.)/.test(u.hostname);
  } catch{return false;}
};

function drivePreviewUrl(link?:string):string{
  if(!link)return '';
  try{
    const url=new URL(link);
    if(url.protocol!=='https:'||url.hostname!=='drive.google.com')return '';
    const match=/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/.exec(url.pathname);
    return match?'https://drive.google.com/file/d/'+match[1]+'/preview':'';
  }catch{return '';}
}

function PhotoCard({photo,entry,privatePhoto,readOnly,onChanged,onPrivateChanged}:{photo:YouTubePhoto,entry?:YouTubeSavedPhoto,privatePhoto?:PrivatePhoto,readOnly?:boolean,onChanged:()=>Promise<void>,onPrivateChanged:()=>Promise<void>}){
  const linked=entry?.art||photo.image;
  const saved=privatePhoto?.url||linked;
  const drivePreview=!saved?drivePreviewUrl(entry?.link):'';
  const alternativeUrl=linked?.startsWith('https://')?linked:'';
  const [link,setLink]=useState(alternativeUrl);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);
  const prompt=getYouTubePhotoPrompt(photo);
  useEffect(()=>{setLink(alternativeUrl);},[alternativeUrl]);
  const copy=async()=>{
    try { await navigator.clipboard.writeText(prompt);setCopied(true);setStatus('Prompt copiado.'); }
    catch{setStatus('No se pudo copiar. Selecciona el texto del prompt.');}
  };
  const canUpload=/^E0[1-8]-F(0[1-9]|10)$|^E0(5|8)-H0[1-4]$/.test(photo.id);
  const uploadFile=async(file:File)=>{
    if(readOnly){setStatus('Sal del modo grabación para guardar fotos.');return;}
    setBusy(true);setStatus('');
    try{await uploadYouTubePhoto(photo.id,file);await onPrivateChanged();setStatus('Archivo de imagen guardado en la galería privada.');}
    catch(error){setStatus(error instanceof Error?error.message:'No fue posible guardar la foto.');}
    finally{setBusy(false);}
  };
  const deletePrivate=async()=>{
    if(!privatePhoto||readOnly)return;
    if(!window.confirm('¿Eliminar la foto '+photo.id+'? El prompt se conserva.'))return;
    setBusy(true);setStatus('');
    try{await removeYouTubePhoto(photo.id);await onPrivateChanged();setStatus('Foto eliminada de la galería privada.');}
    catch(error){setStatus(error instanceof Error?error.message:'No fue posible eliminar la foto.');}
    finally{setBusy(false);}
  };
  const save=async()=>{
    const next=link.trim();
    if(next&&!safeImageUrl(next)){setStatus('Usa un enlace directo HTTPS válido a la imagen.');return;}
    if(readOnly){setStatus('Sal del modo grabación para guardar fotos.');return;}
    setBusy(true);setStatus('');
    try{
      if(entry) await api.put('/api/items/ideas/'+encodeURIComponent(entry.id),{...entry,art:next});
      else if(next) await api.post('/api/items/ideas',{title:photo.id,section:YOUTUBE_PHOTO_SECTION,art:next,status:'en desarrollo',notes:'Foto del storyboard '+photo.id+' · '+photo.title});
      await onChanged();setStatus(next?'Imagen guardada en tu Studio.':'Enlace quitado del Studio.');
    }catch{setStatus('No fue posible guardar la imagen. Revisa la sesión y vuelve a intentar.');}
    finally{setBusy(false);}
  };
  return <article className="yt-frame">
    <div className="yt-frame-image">
      {saved?<img src={saved} loading="lazy" alt={'Escena '+photo.id+' · '+photo.title} onError={event=>{event.currentTarget.style.visibility='hidden';}} onLoad={event=>{event.currentTarget.style.visibility='visible';}}/>:
      <div className="yt-frame-placeholder"><Camera size={30}/><strong>{photo.id}</strong><small>Foto pendiente</small></div>}
    </div>
    <div className="yt-frame-body">
      <div className="yt-frame-meta"><span>{photo.id}</span><span>Escena {photo.scene}</span>{photo.id.includes('-H')&&<span>Especial de temporada</span>}</div>
      <h4>{photo.title}</h4>
      <p><b>Plano:</b> {photo.shot}</p>
      <div className="yt-frame-buttons"><button type="button" onClick={copy}>{copied?<Check size={15}/>:<Copy size={15}/>} Copiar prompt</button>{entry?.link&&safeImageUrl(entry.link)&&<a href={entry.link} target="_blank" rel="noopener noreferrer"><Eye size={15}/> Ver PNG en Drive</a>}</div>
      {canUpload&&<div className="yt-private-photo-actions">
        <label className="yt-photo-file-upload" htmlFor={'yt-private-upload-'+photo.id}><UploadCloud size={15}/>{busy?'Guardando...':privatePhoto?'Reemplazar archivo':'Subir foto PNG/JPG/WEBP'}</label>
        <input id={'yt-private-upload-'+photo.id} className="yt-private-file-input" type="file" accept="image/png,image/jpeg,image/webp" disabled={readOnly||busy} aria-label={'Subir foto privada para '+photo.id}
          onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void uploadFile(file);}}/>
        {privatePhoto?.url&&<><a href={privatePhoto.url} target="_blank" rel="noopener noreferrer" className="yt-private-file-link"><Eye size={15}/> Ver</a>
          <button type="button" className="yt-private-file-delete" disabled={busy||readOnly} onClick={()=>void deletePrivate()}><Trash2 size={15}/> Eliminar</button></>}
      </div>}
      <details className="yt-frame-details"><summary>Ver prompt completo</summary><textarea readOnly value={prompt} rows={11} aria-label={'Prompt de la foto '+photo.id}/></details>
      <details className="yt-frame-link">
        <summary><ImagePlus size={15}/> {linked?'Editar enlace alternativo':'O guardar enlace HTTPS (alternativa)'}</summary>
        <label htmlFor={'yt-photo-'+photo.id}>URL HTTPS directa de la imagen</label>
        <div className="yt-frame-save"><input id={'yt-photo-'+photo.id} value={link} onChange={e=>setLink(e.target.value)} placeholder="https://.../imagen.webp" disabled={readOnly||busy}/><button type="button" onClick={save} disabled={readOnly||busy||link.trim()===(linked||'')}><Save size={16}/> Guardar</button></div>
        <p className="yt-muted">Este es un enlace alternativo, no una subida de archivo. Si has subido una foto privada, esa imagen tendrá prioridad al mostrar la vista previa.</p>
      </details>
      {status&&<p className="yt-frame-status" role="status">{status}</p>}
    </div>
  </article>;
}


export default function YouTubeVisualLibrary({entries,onChanged,readOnly=false}:Props){
  const [selected,setSelected]=useState(1);
  const [filter,setFilter]=useState('');
  const [batchStatus,setBatchStatus]=useState('');
  const [privatePhotos,setPrivatePhotos]=useState<Map<string,PrivatePhoto>>(new Map());
  const [privateError,setPrivateError]=useState('');
  const [loadingPhotos,setLoadingPhotos]=useState(false);
  const [packageBusy,setPackageBusy]=useState(false);
  const refreshPrivate=useCallback(async()=>{
    setLoadingPhotos(true);setPrivateError('');
    try{const saved=await loadYouTubeSavedPhotos();setPrivatePhotos(new Map(saved.map(p=>[p.shot_id,p])));}
    catch(error){setPrivateError(error instanceof Error?error.message:'No se pudo cargar la galería privada.');}
    finally{setLoadingPhotos(false);}
  },[]);
  useEffect(()=>{void refreshPrivate();},[refreshPrivate]);
  const episode=youtubeEpisodes.find(item=>item.number===selected)||youtubeEpisodes[0];
  const look=youtubeWardrobe[selected];
  const photos=useMemo(()=>[...(youtubePhotoBoard[selected]||[]),...youtubeHolidayFrames.filter(x=>x.id.startsWith('E'+episodeNum(selected)))], [selected]);
  const filtered=useMemo(()=>photos.filter(p=>(p.title+' '+p.id+' '+p.action+' '+p.shot).toLowerCase().includes(filter.toLowerCase())),[photos,filter]);
  const owned=useMemo(()=>new Map(entries.filter(x=>x.section===YOUTUBE_PHOTO_SECTION).map(x=>[x.title,x])),[entries]);
  const corePhotos=youtubePhotoBoard[selected]||[];
  const blocks=getEpisodeProductionBlocks(corePhotos);
  const extras=photos.filter(photo=>photo.id.includes('-H'));
  const available:EpisodePhotoAvailability[]=corePhotos.map((p):EpisodePhotoAvailability=>{
    const local=privatePhotos.get(p.id);
    if(local?.url)return {id:p.id,source:'private',fileName:local.file_name};
    if(owned.get(p.id)?.art||p.image)return {id:p.id,source:'studio',fileName:p.id+'.png'};
    return {id:p.id,source:'missing',fileName:p.id+'.png'};
  });
  const ready=available.filter(item=>item.source!=='missing').length;
  const masterVideoPrompt=getEpisodeProductionMaster(selected,available);
  const batchText=useMemo(()=>photos.map(p=>'=== '+p.id+' · '+p.title+' ===\n'+getYouTubePhotoPrompt(p)).join('\n\n-----------------------\n\n'),[photos]);
  const downloadAll=()=>{ const b=new Blob([batchText],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='off-brief-ep-'+episodeNum(selected)+'-photo-prompts.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);setBatchStatus('Archivo TXT creado.'); };
  const copyAll=async()=>{try{await navigator.clipboard.writeText(batchText);setBatchStatus('Todos los prompts del capítulo copiados.');}catch{setBatchStatus('Usa Descargar TXT para guardar todos los prompts.');}};
  const copyLook=async(who:'nia'|'ruby')=>{try{await navigator.clipboard.writeText(getCharacterLookPrompt(selected,who));setBatchStatus('Prompt del look de '+(who==='nia'?'Nia':'Ruby')+' copiado.');}catch{setBatchStatus('No se pudo copiar el prompt del vestuario.');}};
  const copyVideoMaster=async()=>{
    try{await navigator.clipboard.writeText(masterVideoPrompt);setBatchStatus('Master Prompt único de video copiado con las diez fotos del capítulo.');}
    catch{setBatchStatus('No se pudo copiar automáticamente. Abre el texto completo del Master Prompt.');}
  };
  const downloadVideoMaster=()=>{
    const blob=new Blob([masterVideoPrompt],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='OFF-BRIEF-E'+episodeNum(selected)+'-VIDEO-MASTER-10-FOTOS.txt';
    document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    setBatchStatus('Master Prompt de video descargado.');
  };
  const exportEpisodePackage=async()=>{
    if(packageBusy||ready!==corePhotos.length)return;
    setPackageBusy(true);setBatchStatus('');
    const files:Record<string,Uint8Array>={};
    const inaccessible:string[]=[];
    try{
      for(const photo of corePhotos){
        const src=privatePhotos.get(photo.id)?.url||owned.get(photo.id)?.art||photo.image;
        if(!src||(!src.startsWith('data:image/')&&!src.startsWith('https://'))){inaccessible.push(photo.id);continue;}
        try{
          const response=await fetch(src,{credentials:'omit'});
          if(!response.ok)throw new Error('HTTP '+response.status);
          const blob=await response.blob();
          if(!blob.size||(!blob.type.startsWith('image/')&&blob.type!=='application/octet-stream'))throw new Error('Formato de imagen inválido');
          const fileName=privatePhotos.get(photo.id)?.file_name||photo.id+'.png';
          const ext=(blob.type==='image/webp'?'webp':blob.type==='image/jpeg'?'jpg':blob.type==='image/png'?'png':fileName.toLowerCase().split('.').pop()==='webp'?'webp':'png');
          files['FOTOS/'+photo.id+'.'+ext]=new Uint8Array(await blob.arrayBuffer());
        }catch{inaccessible.push(photo.id);}
      }
      if(inaccessible.length){
        setBatchStatus('No se descargó un paquete incompleto. Verifica los archivos de: '+inaccessible.join(', '));
        return;
      }
      files['MASTER-PROMPT-VIDEO.txt']=strToU8(masterVideoPrompt);
      files['LEEME.txt']=strToU8('OFF BRIEF — EP '+episodeNum(selected)+'\\nLas diez fotos originales y un solo Master Prompt de producción.\\nLa herramienta que genere el video debe recibir los archivos de FOTOS/ y el prompt. El ZIP no renderiza videos automáticamente.');
      const archive=zipSync(files,{level:0});
      const blob=new Blob([new Uint8Array(archive)],{type:'application/zip'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='OFF-BRIEF-E'+episodeNum(selected)+'-10-FOTOS-Y-MASTER.zip';
      document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setBatchStatus('Paquete con las diez imágenes y el Master Prompt creado.');
    }finally{setPackageBusy(false);}
  };
  return <div className="yt-visual">
    <details className="yt-production-references">
      <summary><Users size={16}/> Abrir referencias de personajes y vestuario</summary>
    <section className="yt-paper">
      <div className="yt-small-title"><Users size={17}/> BIBLIA DE PERSONAJES</div>
      <h3>Nia y Ruby · Avatares originales</h3>
      <p>Estas dos imágenes son las referencias que compartiste. Conservamos cara, cabello y proporciones; la ropa cambia por capítulo. Las miniaturas están optimizadas para el Studio.</p>
      <div className="yt-avatar-cards">
        {youtubeBrief.protagonists.map(person=><article className="yt-avatar-card" key={person.name}>
          <div className="yt-avatar-photo"><img src={avatarImages[person.name]} alt={'Avatar original de '+person.name}/></div>
          <div className="yt-avatar-info"><span className="yt-small-title">PERSONAJE PRINCIPAL</span><h4>{person.name}</h4>
            <p className="yt-cast-role">{person.role}</p><p><strong>Personalidad:</strong> {person.personality}</p>
            <p><strong>Fortalezas:</strong> {person.strength}</p><p><strong>Debilidad:</strong> {person.flaw}</p>
            <p><strong>Frase:</strong> “{person.catchphrase}”</p><p><strong>Arco:</strong> {person.growth}</p>
          </div>
        </article>)}
      </div>
    </section>
    <section className="yt-paper">
      <div className="yt-small-title"><Shirt size={16}/> CONTINUIDAD VISUAL</div>
      <h3>Vestuario diferente en cada episodio</h3>
      <p>Sus identidades son fijas, pero no tienen que vestir igual durante toda la temporada. Thanksgiving y Navidad llevan looks propios sin convertirlos en disfraces.</p>
      <div className="yt-wardrobe-grid">{Object.values(youtubeWardrobe).map(w=><button type="button" className={'yt-wardrobe-card '+(selected===w.id?'active':'')} key={w.id} onClick={()=>{setSelected(w.id);setFilter('');}}>
        <span>EP {episodeNum(w.id)} · {w.season==='thanksgiving'?'THANKSGIVING':w.season==='christmas'?'CHRISTMAS':w.season==='fall'?'FALL':'REGULAR'}</span>
        <strong>{w.mood}</strong><small><b>Nia:</b> {w.nia}</small><small><b>Ruby:</b> {w.ruby}</small>
      </button>)}</div>
      <div className="yt-look-tools"><span>EP {episodeNum(selected)} · {look.mood}</span><button type="button" onClick={()=>copyLook('nia')}><Copy size={15}/> Prompt look Nia</button><button type="button" onClick={()=>copyLook('ruby')}><Copy size={15}/> Prompt look Ruby</button></div>
    </section>
    </details>
    <section className="yt-paper">
      <div className="yt-visual-heading">
        <div><div className="yt-small-title"><Film size={16}/> STORYBOARD Y FOTOS POR CAPÍTULO</div><h3>Un capítulo · 10 fotos · 1 Master Prompt</h3><p>Guarda las diez tomas individuales. Se ordenan en tres bloques narrativos, sin limitar la cantidad de fotos por escena. Cada toma conserva su ID y prompt original.</p></div>
        <div className="yt-visual-counter">{ready}/{corePhotos.length}<small>fotos principales vinculadas</small></div>
      </div>
      <div className="yt-visual-batch"><button type="button" onClick={copyAll}><Copy size={16}/> Copiar prompts del capítulo</button><button type="button" onClick={downloadAll}><Save size={16}/> Descargar prompts TXT</button><button type="button" onClick={()=>void refreshPrivate()} disabled={loadingPhotos}><RefreshCcw size={16}/> {loadingPhotos?'Actualizando...':'Actualizar fotos'}</button>{batchStatus&&<small role="status">{batchStatus}</small>}</div>
      {privateError&&<p role="alert" className="yt-private-error">{privateError}</p>}
      <div className="yt-visual-episode-nav">{youtubeEpisodes.map(ep=><button type="button" key={ep.number} className={selected===ep.number?'active':''} onClick={()=>{setSelected(ep.number);setFilter('')}}>EP {episodeNum(ep.number)}</button>)}</div>
      <div className="yt-visual-episode-header">
        <div><span className="yt-small-title">CAPÍTULO {episodeNum(selected)}</span><h4>{episode.title}</h4><p>{episode.logline}</p></div>
        <span className="yt-look-label">{look.mood}</span>
      </div>
      <div className="yt-holiday-note"><CalendarDays size={18}/><span>{selected===5?'Especial Thanksgiving: cuatro tomas opcionales añadidas a este episodio.':selected===8?'Especial Christmas: cuatro tomas opcionales añadidas al cierre de temporada.':look.note} <b>Publicaciones mensuales: {youtubeReleasePlan.cadence}.</b> Decidiremos la frecuencia al terminar y probar el Video Studio gratuito.</span></div>
      <div className="yt-production-master">
        <div className="yt-small-title"><Film size={16}/> PROMPT ÚNICO POR CAPÍTULO</div>
        <h4>De las diez fotos a un video completo</h4>
        <p>Este Master Prompt reúne las diez imágenes en el orden del storyboard, el guion breve en inglés y las instrucciones para animarlas y montar el capítulo. Necesitas suministrar los archivos originales y usar un editor o una herramienta de video compatible: el texto solo no exporta un MP4.</p>
        <div className="yt-visual-batch">
          <button type="button" onClick={()=>void copyVideoMaster()}><Copy size={16}/> Copiar Master Prompt completo</button>
          <button type="button" onClick={downloadVideoMaster}><Save size={16}/> Descargar Master Prompt TXT</button>
          <button type="button" disabled={packageBusy||ready!==corePhotos.length} onClick={()=>void exportEpisodePackage()}><ImagePlus size={16}/> {packageBusy?'Preparando paquete...':'Descargar 10 fotos + prompt ZIP'}</button>
        </div>
        {ready<corePhotos.length&&<p className="yt-production-alert">Faltan {corePhotos.length-ready} imágenes por vincular. Sus espacios están disponibles abajo; no se dan por producidas.</p>}
        <details className="yt-production-master-preview">
          <summary>Ver el Master Prompt de este episodio</summary>
          <textarea readOnly rows={14} value={masterVideoPrompt} aria-label={'Master Prompt de producción del episodio '+selected}/>
        </details>
      </div>
      <label className="yt-gallery-search"><Search size={17}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar un plano o una escena..." aria-label="Buscar imágenes del capítulo"/></label>
      <div className="yt-production-groups">
        {blocks.map(block=>{
          const visible=block.photos.filter(photo=>filtered.some(match=>match.id===photo.id));
          const count=block.photos.filter(photo=>available.some(asset=>asset.id===photo.id&&asset.source!=='missing')).length;
          return visible.length?<section className="yt-production-group" key={block.number}>
            <header><div><span className="yt-small-title">BLOQUE {block.number} DE 3</span><h4>{block.title}</h4><p>{block.detail} · {block.photos.length} espacios para fotos individuales</p></div><strong>{count}/{block.photos.length}</strong></header>
            <div className="yt-photo-grid">{visible.map(photo=><PhotoCard key={photo.id} photo={photo} entry={owned.get(photo.id)} privatePhoto={privatePhotos.get(photo.id)} readOnly={readOnly} onChanged={onChanged} onPrivateChanged={refreshPrivate}/>)}</div>
          </section>:null;
        })}
        {extras.some(photo=>filtered.some(match=>match.id===photo.id))&&<section className="yt-production-group">
          <header><div><span className="yt-small-title">EXTRAS OPCIONALES</span><h4>Fotos especiales</h4><p>Separadas de las diez tomas principales.</p></div></header>
          <div className="yt-photo-grid">{extras.filter(photo=>filtered.some(match=>match.id===photo.id)).map(photo=><PhotoCard key={photo.id} photo={photo} entry={owned.get(photo.id)} privatePhoto={privatePhotos.get(photo.id)} readOnly={readOnly} onChanged={onChanged} onPrivateChanged={refreshPrivate}/>)}</div>
        </section>}
      </div>
      {filtered.length===0&&<p className="yt-muted">No hay planos que coincidan con la búsqueda.</p>}
      <p className="yt-gallery-disclaimer">Los espacios en blanco son fotos todavía por generar. Los dos avatares sí están cargados. Nada de esta biblioteca programa publicaciones ni produce videos automáticamente.</p>
    </section>
  </div>;
}
