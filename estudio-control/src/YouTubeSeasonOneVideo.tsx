import {useCallback,useEffect,useMemo,useState} from 'react';
import {BookOpen,Camera,Check,Copy,Download,FolderArchive,ImagePlus,Play,RefreshCcw,Video} from 'lucide-react';
import {zipSync,strToU8} from 'fflate';
import {youtubeEpisodes} from './youtube/episodes';
import {getYouTubePhotoPrompt} from './youtube/visual-plan';
import {loadYouTubeSavedPhotos,type YouTubeSavedPhoto} from './supabase-client';
import {
 getSeasonOneScenes,getSeasonOneSceneMaster,getSeasonOneEpisodeMaster,
 getSeasonOneImageToVideoPrompt,getSeasonOneMissingSceneStillPrompt,getSeasonOneWindowsFiles,
 s1SceneCount,s1BasePhotoCount
} from './youtube/season-1-scene-masters';
import './youtube-season-one-video.css';

function saveText(fileName:string,content:string){
 const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download=fileName;link.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function saveZip(fileName:string,files:Record<string,string>){
 const encoded=Object.fromEntries(Object.entries(files).map(([name,content])=>[name,strToU8(content)]));
 const compressed=zipSync(encoded,{level:6});
 const blob=new Blob([new Uint8Array(compressed)],{type:'application/zip'});
 const url=URL.createObjectURL(blob);const link=document.createElement('a');
 link.href=url;link.download=fileName;link.click();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function YouTubeSeasonOneVideo(){
 const [episode,setEpisode]=useState(1);
 const [sceneNumber,setSceneNumber]=useState(1);
 const [expanded,setExpanded]=useState('');
 const [notice,setNotice]=useState('');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [savedPhotos,setSavedPhotos]=useState<YouTubeSavedPhoto[]>([]);
 const ep=youtubeEpisodes[episode-1];
 const scenes=useMemo(()=>getSeasonOneScenes(episode),[episode]);
 const scene=scenes.find(s=>s.scene===sceneNumber)||scenes[0];
 const photoById=useMemo(()=>new Map(savedPhotos.map(p=>[p.shot_id,p])),[savedPhotos]);
 const present=useMemo(()=>scenes.reduce((sum,s)=>sum+s.photos.filter(p=>photoById.has(p.id)).length,0),[scenes,photoById]);
 const refresh=useCallback(async()=>{
  setLoading(true);setError('');
  try{setSavedPhotos(await loadYouTubeSavedPhotos())}
  catch(e){setError(e instanceof Error?e.message:'No se pudo consultar la galería privada.');}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void refresh()},[refresh]);
 const copy=async(value:string,label:string)=>{
  try{await navigator.clipboard.writeText(value);setNotice(label+' copiado.');}
  catch{setNotice('No se pudo copiar automáticamente. Selecciona el texto y cópialo.');}
 };
 const scenePrefix='OFF-BRIEF-S01-E'+String(episode).padStart(2,'0')+'-S'+String(scene.scene).padStart(2,'0');
 const epPrefix='OFF-BRIEF-S01-E'+String(episode).padStart(2,'0');
 return <div className="s1v-shell" role="tabpanel">
  <section className="yt-paper s1v-intro">
   <div className="yt-small-title"><Video size={16}/> OFF BRIEF · TEMPORADA 01 · VIDEO STUDIO</div>
   <h3>Master Prompts para convertir fotos en escenas animadas</h3>
   <p>Conservan cada diálogo original de Nia y Ruby. Primero prepara la fotografía aprobada, luego crea clips de movimiento, añade las voces y monta cada escena en el editor gratuito de Windows.</p>
   <div className="s1v-stats"><span><b>8</b> capítulos</span><span><b>{s1SceneCount}</b> escenas</span><span><b>{s1BasePhotoCount}</b> imágenes de referencia</span><span><b>{s1BasePhotoCount}</b> prompts de foto a video</span></div>
   <p className="s1v-note">Los Master Prompts no generan videos automáticamente. Se utilizan con fotografías y voces aprobadas. Las escenas sin fotografía asignada están identificadas para crear una referencia nueva, sin sustituir las originales.</p>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title">SELECCIONAR CAPÍTULO</div><h3>Temporada 1 · Producción escena por escena</h3>
   <div className="s1v-picker" role="group" aria-label="Seleccionar capítulo temporada uno">
    {youtubeEpisodes.map(item=><button key={item.number} type="button" className={episode===item.number?'active':''}
      aria-pressed={episode===item.number} onClick={()=>{setEpisode(item.number);setSceneNumber(1);setExpanded('');setNotice('')}}><strong>{String(item.number).padStart(2,'0')}</strong><span>{item.title}</span></button>)}
   </div>
   <div className="s1v-episode">
    <div><div className="yt-small-title">EPISODIO {String(episode).padStart(2,'0')}</div><h3>{ep.title}</h3><p>{ep.logline}</p></div>
    <span>{present}/{scenes.reduce((sum,s)=>sum+s.photos.length,0)} fotografías guardadas</span>
   </div>
   <div className="s1v-actions">
    <button type="button" onClick={()=>saveText(epPrefix+'-ALL-SCENES-MASTER.txt',getSeasonOneEpisodeMaster(episode))}><Download size={16}/> Descargar Master Prompts del capítulo</button>
    <button type="button" onClick={()=>{saveZip(epPrefix+'-WINDOWS-VIDEO-STUDIO.zip',getSeasonOneWindowsFiles(episode));setNotice('ZIP descargado: guion, escenas, prompts de fotos y animaciones. No contiene videos generados.')}}><FolderArchive size={16}/> Descargar paquete Windows ZIP</button>
    <button type="button" disabled={loading} onClick={()=>void refresh()}><RefreshCcw size={16}/>{loading?'Actualizando...':'Actualizar fotografías'}</button>
   </div>
   {notice&&<p className="s1v-feedback" role="status"><Check size={16}/>{notice}</p>}
   {error&&<p className="s1v-error" role="alert">{error}</p>}
   <p className="s1v-detail">El ZIP organiza el material en guiones, escenas, fotos, clips y voces. El archivo <code>project.json</code> es una guía para montar el capítulo, no una importación automática garantizada del editor.</p>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title">MASTER PROMPT DE ESCENA</div>
   <div className="s1v-scenes" role="group" aria-label="Seleccionar escena">
    {scenes.map(s=><button key={s.scene} type="button" aria-pressed={scene.scene===s.scene} className={scene.scene===s.scene?'active':''} onClick={()=>{setSceneNumber(s.scene);setExpanded('');setNotice('')}}><span>Escena {String(s.scene).padStart(2,'0')}</span><small>{s.title}</small></button>)}
   </div>
   <div className="s1v-master-heading"><div><div className="yt-small-title">CAPÍTULO {String(episode).padStart(2,'0')} · ESCENA {String(scene.scene).padStart(2,'0')}</div><h3>{scene.title}</h3></div><span>{scene.photos.length} tomas base</span></div>
   {scene.needsExtraStill&&<div className="s1v-warning">
      Esta escena todavía no tiene foto asignada en las 80 referencias. Preparé un prompt adicional para crear su imagen sin mezclarla con otro capítulo.
      <div className="s1v-actions"><button type="button" onClick={()=>void copy(getSeasonOneMissingSceneStillPrompt(episode,scene.scene),'Prompt de foto adicional')}><Copy size={15}/> Copiar foto adicional</button></div>
    </div>}
   <textarea className="s1v-master-text" rows={18} readOnly value={getSeasonOneSceneMaster(episode,scene.scene)} aria-label={'Master Prompt completo del capítulo '+episode+' escena '+scene.scene}/>
   <div className="s1v-actions">
    <button type="button" onClick={()=>void copy(getSeasonOneSceneMaster(episode,scene.scene),'Master Prompt de escena')}><Copy size={16}/> Copiar Master Prompt</button>
    <button type="button" onClick={()=>saveText(scenePrefix+'-MASTER.txt',getSeasonOneSceneMaster(episode,scene.scene))}><Download size={16}/> Descargar escena TXT</button>
   </div>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title">IMÁGENES DE LA ESCENA → CLIPS DE VIDEO</div>
   <h3>Los planos y cómo animarlos</h3>
   <p>Selecciona una foto y usa su Master Prompt de animación. Los archivos guardados en «Fotos y prompts» aparecen aquí como vista previa privada.</p>
   {scene.photos.length?<div className="s1v-photo-grid">{scene.photos.map(photo=>{
    const asset=photoById.get(photo.id);
    return <article key={photo.id} className="s1v-photo">
      <div className="s1v-photo-preview">
       {asset?.url?<img src={asset.url} loading="lazy" alt={'Imagen guardada de '+photo.title}/>:<div><ImagePlus size={27}/><span>Foto todavía pendiente</span></div>}
       <small>{photo.id}</small>
      </div>
      <div className="s1v-photo-body">
       <h4>{photo.title}</h4><p>{photo.shot}</p><p>{photo.action}</p>
       <div className="s1v-actions">
        <button type="button" onClick={()=>setExpanded(expanded===photo.id?'':photo.id)}><Play size={15}/> {expanded===photo.id?'Cerrar':'Master Prompt foto → video'}</button>
        <button type="button" onClick={()=>void copy(getSeasonOneImageToVideoPrompt(episode,photo),'Prompt de '+photo.id)}><Copy size={15}/> Copiar video</button>
        <button type="button" onClick={()=>void copy(getYouTubePhotoPrompt(photo),'Prompt para generar '+photo.id)}><Camera size={15}/> Copiar foto</button>
       </div>
       {expanded===photo.id&&<div className="s1v-photo-prompt"><textarea readOnly rows={11} value={getSeasonOneImageToVideoPrompt(episode,photo)} aria-label={'Prompt imagen a video '+photo.id}/><div className="s1v-actions"><button type="button" onClick={()=>saveText('OFF-BRIEF-'+photo.id+'-IMAGE-TO-VIDEO.txt',getSeasonOneImageToVideoPrompt(episode,photo))}><Download size={15}/> Descargar prompt TXT</button></div></div>}
      </div>
    </article>;
   })}</div>:<p className="s1v-detail">No hay fotografías de base para esta escena. Usa el Master Prompt de arriba para crear una fotografía nueva y después animarla.</p>}
  </section>
  <section className="yt-paper">
   <div className="yt-small-title"><BookOpen size={16}/> PROCESO PARA WINDOWS</div>
   <h3>De fotos individuales a un capítulo completo</h3>
   <p><b>1.</b> Genera o selecciona una foto de cada plano, aprobada con los rostros y vestuario correctos.</p>
   <p><b>2.</b> Usa el Master Prompt correspondiente para crear clips cortos de 4–8 segundos, o anima los PNG con zoom, pan y keyframes gratuitos.</p>
   <p><b>3.</b> Añade cada línea original en una pista de voz, sincroniza reacciones y movimientos y usa efectos o música originales.</p>
   <p><b>4.</b> Monta las escenas en orden, incluye el bumper oficial después del cold open y exporta el MP4 a 1080p y 24 fps.</p>
   <p className="s1v-note">Con esto queda organizado todo el proceso creativo. La clonación de voz y la generación automática de videos requieren herramientas adicionales realmente instaladas; el paquete ZIP no las instala por sí solo.</p>
  </section>
 </div>;
}
