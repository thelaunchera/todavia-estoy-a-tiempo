import {useCallback,useEffect,useMemo,useState} from 'react';
import {BookOpen,Check,Clapperboard,Copy,Download,FolderArchive,ImagePlus,MonitorPlay,RefreshCcw,Smartphone,Video,Wallet} from 'lucide-react';
import {zipSync,strToU8} from 'fflate';
import {getMicroEpisode,microEpisodes,microFrames,microScriptText,microWindowsFiles,microRecordingChecklist,microVoiceCues,microEpisodeMasterPrompt,microPilotChecklist} from './youtube/micro-production';
import {loadYouTubeSavedPhotos,type YouTubeSavedPhoto} from './supabase-client';
import './youtube-quick-episodes.css';

function downloadText(name:string,content:string){
 const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function downloadZip(name:string,files:Record<string,string>){
 const zip=zipSync(Object.fromEntries(Object.entries(files).map(([path,content])=>[path,strToU8(content)])),{level:6});
 const blob=new Blob([new Uint8Array(zip)],{type:'application/zip'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function YouTubeQuickEpisodes(){
 const [season,setSeason]=useState(1),[episode,setEpisode]=useState(1);
 const [saved,setSaved]=useState<Record<string,YouTubeSavedPhoto>>({});
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false);
 const [prompts,setPrompts]=useState<Record<string,'still'|'motion'|undefined>>({});
 const q=getMicroEpisode(season,episode)!;
 const frames=useMemo(()=>microFrames(season,episode),[season,episode]);
 const ready=frames.filter(x=>saved[x.id]?.url).length;
 const reload=useCallback(async()=>{
   setLoading(true);setError('');
   try{const assets=await loadYouTubeSavedPhotos();setSaved(Object.fromEntries(assets.map(p=>[p.shot_id,p])));}
   catch(e){setError(e instanceof Error?e.message:'No se pudo cargar las fotos guardadas.');}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 const copy=async(content:string,caption:string)=>{
  try{await navigator.clipboard.writeText(content);setNotice(caption+' copiado.');}
  catch{setNotice('No se pudo copiar automáticamente. Selecciona el texto manualmente.');}
 };
 const prefix='OFF_BRIEF_S'+season+'_E'+String(episode).padStart(2,'0');
 return <div className="mq-shell" role="tabpanel">
  <section className="yt-paper mq-hero">
   <div className="yt-small-title"><Video size={16}/> PRODUCCIÓN RÁPIDA · TEMPORADAS 1 Y 2</div>
   <h3>OFF BRIEF · Capítulos de 2 minutos</h3>
   <p>La versión principal de cada episodio es corta, divertida, educativa y termina con una pregunta al público. No hay que producir los 80/192 planos anteriores para lanzar la serie: conservamos esos guiones como archivo.</p>
   <div className="mq-facts">
    <span><b>16</b> capítulos</span><span><b>120 s</b> máximo objetivo</span><span><b>3</b> fotos base por capítulo</span><span><b>2</b> formatos con las mismas fotos</span>
   </div>
   <p className="mq-tip"><Wallet size={16}/> Ahorro: haz una sola versión de cada foto en ChatGPT. Para la otra plataforma solo se adapta el encuadre en Windows, sin créditos extra.</p>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title">ESCOGE LA TEMPORADA Y EL CAPÍTULO</div>
   <div className="mq-season-toggle" role="group" aria-label="Temporada"><button className={season===1?'active':''} aria-pressed={season===1} onClick={()=>{setSeason(1);setEpisode(1);setNotice('')}}>Temporada 1</button><button className={season===2?'active':''} aria-pressed={season===2} onClick={()=>{setSeason(2);setEpisode(1);setNotice('')}}>Temporada 2</button></div>
   <div className="mq-picker" role="group" aria-label="Capítulo">{microEpisodes.filter(e=>e.season===season).map(e=><button key={e.episode} className={episode===e.episode?'active':''} aria-pressed={episode===e.episode} onClick={()=>{setEpisode(e.episode);setNotice('')}}><b>{String(e.episode).padStart(2,'0')}</b><span>{e.title}</span></button>)}</div>
   <div className="mq-intro"><div><small>TEMPORADA {season} · CAPÍTULO {String(episode).padStart(2,'0')}</small><h3>{q.title}</h3><p><b>Gancho:</b> {q.hook}</p><p><b>Aprendizaje:</b> {q.lesson}</p><p><b>Interacción:</b> {q.question}</p></div><strong>~2:00</strong></div>
   <div className="mq-actions">
    <button type="button" onClick={()=>void copy(microEpisodeMasterPrompt(season,episode),'Master Prompt completo')}><Copy size={16}/> Copiar Master Prompt completo</button>
    {season===1&&episode===1&&<button type="button" onClick={()=>downloadText(prefix+'_PRUEBA_PILOTO_QA.txt',microPilotChecklist(season,episode))}><Download size={16}/> Descargar prueba piloto</button>}
    <button type="button" onClick={()=>downloadText(prefix+'_MASTER_PROMPT_COMPLETO.txt',microEpisodeMasterPrompt(season,episode))}><Download size={16}/> Descargar Master Prompt completo</button>
    <button type="button" onClick={()=>downloadZip(prefix+'_DOS_FORMATOS_WINDOWS.zip',microWindowsFiles(season,episode))}><FolderArchive size={16}/> Descargar proyecto para Windows</button>
    <button type="button" onClick={()=>downloadText(prefix+'_GUION_CORTO.txt',microScriptText(q))}><Download size={16}/> Descargar guion corto</button>
    <button type="button" onClick={()=>downloadText(prefix+'_GUIA_GRABACION.txt',microRecordingChecklist(q))}><Download size={16}/> Guía de grabación</button>
    <button type="button" onClick={()=>downloadText(prefix+'_VOCES_POR_PERSONAJE.csv',microVoiceCues(q))}><Download size={16}/> Turnos de voz CSV</button>
    <button type="button" onClick={()=>void copy(microScriptText(q),'Guion del capítulo')}><Copy size={16}/> Copiar diálogos</button>
   </div>
   {notice&&<p role="status" className="mq-notice"><Check size={16}/>{notice}</p>}
   <div className="mq-beats">{q.beats.map((beat,i)=><article key={i}><div className="mq-beat-top"><b>{beat.label}</b><span>{beat.start}–{beat.end} s</span></div><p lang="en">{beat.script}</p></article>)}</div>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title"><ImagePlus size={16}/> TRES FOTOS, NO TREINTA</div>
   <div className="mq-photos-heading"><div><h3>Fotografías esenciales del capítulo</h3><p>Reutiliza tus avatares y escenarios existentes. Puedes trabajar con tres imágenes por episodio, luego agregar tomas extra solo si el resultado realmente lo necesita.</p></div><button type="button" disabled={loading} onClick={()=>void reload()}><RefreshCcw size={15}/>{loading?'Actualizando':'Actualizar'}</button></div>
   <p className="mq-filecount">{ready}/{frames.length} imágenes asociadas ya guardadas en el Studio</p>
   {error&&<p role="alert" className="mq-error">{error}</p>}
   <div className="mq-frame-grid">{frames.map((frame,i)=>{
    const photo=saved[frame.id];
    const mode=prompts[frame.id];
    return <article key={frame.id}>
      <div className="mq-frame-image">{photo?.url?<img src={photo.url} loading="lazy" alt={'Imagen de '+frame.title}/>:<div><ImagePlus size={23}/><span>Foto por producir</span></div>}</div>
      <div className="mq-frame-content">
       <small>FOTO {i+1} · {frame.id}</small><h4>{frame.title}</h4>
       <div className="mq-actions">
        <button type="button" onClick={()=>setPrompts(old=>({...old,[frame.id]:mode==='still'?undefined:'still'}))}><ImagePlus size={15}/> Prompt de foto</button>
        <button type="button" onClick={()=>setPrompts(old=>({...old,[frame.id]:mode==='motion'?undefined:'motion'}))}><Clapperboard size={15}/> Foto → video</button>
       </div>
       {mode&&<div className="mq-prompt"><textarea readOnly rows={9} value={mode==='still'?frame.imagePrompt:frame.motionPrompt} aria-label={'Prompt de '+frame.id}/><button type="button" onClick={()=>void copy(mode==='still'?frame.imagePrompt:frame.motionPrompt,frame.id)}><Copy size={15}/> Copiar prompt</button></div>}
      </div>
    </article>;
   })}</div>
  </section>
  <section className="yt-paper">
   <div className="yt-small-title">UNA EDICIÓN, DOS EXPORTACIONES</div><h3>Formato YouTube y TikTok</h3>
   <div className="mq-formats">
    <div><MonitorPlay size={23}/><b>YouTube horizontal</b><span>1920 × 1080 · 16:9</span><small>Video normal de aproximadamente dos minutos</small></div>
    <div><Smartphone size={23}/><b>TikTok / YouTube Short</b><span>1080 × 1920 · 9:16</span><small>Misma voz y fotos; encuadre vertical con fondo difuminado o recorte</small></div>
   </div>
   <div className="mq-recording-flow"><h4>Grabación sencilla · orden recomendado</h4><ol>
   <li><strong>Lee el guion corto</strong> y abre la guía de voces por personaje.</li>
   <li><strong>Graba las voces primero</strong> con la Grabadora de Windows o tu herramienta gratuita de voz.</li>
   <li><strong>Usa tres fotos aprobadas</strong> y no vuelvas a generarlas para TikTok.</li>
   <li><strong>Abre el ZIP en el editor Windows</strong>, selecciona las imágenes y la pista WAV/MP3.</li>
   <li><strong>Haz una prueba de 12 segundos</strong>, revisa rostros y audio, y exporta ambos MP4.</li>
   </ol><p>La duración se ajusta a las voces: objetivo 90–120 segundos, sin rellenar silencios artificialmente.</p></div>
   <p>En el PC: descarga el proyecto ZIP de arriba, ábrelo con el complemento Windows «OFF BRIEF · Dos formatos», coloca las tres fotos y un archivo de diálogo WAV/MP3, elige «YouTube + TikTok» y exporta ambos MP4. También puedes hacer tomas animadas extra si lo necesitas.</p>
   <p className="mq-warning"><BookOpen size={16}/> Este sistema usa movimientos de cámara sobre imágenes y montaje gratuito. No crea animación facial completa ni voces automáticamente; las voces se añaden desde los archivos que prepares.</p>
  </section>
 </div>;
}
