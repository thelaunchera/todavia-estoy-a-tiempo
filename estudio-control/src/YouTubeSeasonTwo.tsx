import { useMemo, useState } from 'react';
import { BookOpen, Camera, Check, Clapperboard, Copy, Download, FolderArchive, ImagePlus, Play, Users, WandSparkles } from 'lucide-react';
import { zipSync, strToU8 } from 'fflate';
import { seasonTwo } from './youtube/season-2';
import { seasonTwoScriptForEpisode } from './youtube/season-2-scripts';
import { getSeasonTwoShots, seasonTwoShotTotal } from './youtube/season-2-shots';
import { promptForSeasonTwoStill, promptForSeasonTwoMotion, type SeasonTwoShot } from './youtube/season-2-shot-model';
import { masterPromptForSeasonTwoScene, masterPromptForSeasonTwoEpisode, seasonTwoProjectTextFiles } from './youtube/season-2-scene-masters';
import './youtube-season-two.css';

type Section = 'synopsis'|'dialogue'|'shots'|'masters';
type PromptKind = 'image'|'video';

const groups = ['Protagonista original','Equipo principal','Recurrente'] as const;
function promptText(shot:SeasonTwoShot,kind:PromptKind) {
 return kind==='image'?promptForSeasonTwoStill(shot):promptForSeasonTwoMotion(shot);
}
function downloadText(filename:string,content:string){
 const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');
 link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Screenplay({content}:{content:string}){
 return <div className="yt2-screenplay" lang="en">
  {content.split(/\r?\n/).map((line,index)=>{
   const text=line.trim();
   if(!text)return <div key={index} className="yt2-screenplay-space"/>;
   if(text.startsWith('# '))return <h3 key={index}>{text.slice(2)}</h3>;
   if(text.startsWith('### '))return <h4 key={index}>{text.slice(4)}</h4>;
   if(text.startsWith('**'))return <p key={index} className="yt2-script-stage">{text.replace(/\*\*/g,'')}</p>;
   const dialogue=/^([A-Z][A-Z0-9 .()'-]+):\s*(.*)$/.exec(text);
   if(dialogue)return <div className="yt2-script-line" key={index}><strong>{dialogue[1]}</strong><span>{dialogue[2]}</span></div>;
   return <p className="yt2-script-stage" key={index}>{text}</p>;
  })}
 </div>;
}
function ShotCard({shot,onCopy}:{shot:SeasonTwoShot,onCopy:(text:string,message:string)=>void}){
 const [kind,setKind]=useState<PromptKind>('image');
 const [expanded,setExpanded]=useState(false);
 const prompt=promptText(shot,kind);
 return <article className="yt2-shot">
  <div className="yt2-shot-preview" aria-label="Plano pendiente de ilustrar"><ImagePlus size={24} strokeWidth={1.5}/><span>Foto por producir</span><small>{shot.id}</small></div>
  <div className="yt2-shot-body">
   <div className="yt-small-title">PLANO {String(shot.shot).padStart(2,'0')} · {shot.cast.length?shot.cast.join(' + '):'Producto / ambiente'}</div>
   <h5>{shot.camera}</h5>
   <p>{shot.action}</p>
   <p className="yt2-cue"><b>Diálogo de referencia:</b> {shot.dialogueCue}</p>
   <div className="yt2-shot-buttons">
     <button type="button" onClick={()=>{setKind('image');setExpanded(true)}} aria-pressed={expanded&&kind==='image'}><Camera size={15}/> Prompt foto</button>
     <button type="button" onClick={()=>{setKind('video');setExpanded(true)}} aria-pressed={expanded&&kind==='video'}><Play size={15}/> Prompt animación</button>
     <button type="button" onClick={()=>onCopy(promptText(shot,kind),'Prompt de '+shot.id+' copiado.')}><Copy size={15}/> Copiar</button>
   </div>
   {expanded&&<div className="yt2-full-prompt">
      <div className="yt2-prompt-top"><strong>{kind==='image'?'Prompt cinematográfico · imagen':'Prompt de movimiento · video'}</strong><button type="button" onClick={()=>setExpanded(false)}>Cerrar</button></div>
      <textarea rows={12} readOnly value={prompt} aria-label={'Prompt '+kind+' del plano '+shot.id}/>
   </div>}
  </div>
 </article>;
}
export default function YouTubeSeasonTwo(){
 const [view,setView]=useState<Section>('synopsis');
 const [episode,setEpisode]=useState(1);
 const [masterScene,setMasterScene]=useState(1);
 const [notice,setNotice]=useState('');
 const selected=seasonTwo.episodes.find(ep=>ep.number===episode)||seasonTwo.episodes[0];
 const script=seasonTwoScriptForEpisode(episode);
 const shots=getSeasonTwoShots(episode);
 const sceneGroups=useMemo(()=>{
   return Array.from({length:8},(_,i)=>({
     number:i+1,
     shots:shots.filter(shot=>shot.scene===i+1)
   }));
 },[shots]);
 const copy=async(text:string,message:string)=>{
   try{await navigator.clipboard.writeText(text);setNotice(message)}
   catch{setNotice('No se pudo copiar automáticamente. Usa Descargar TXT.')}
 };
 const downloadWindowsPack=()=>{
   const files=seasonTwoProjectTextFiles(episode);
   const packed=zipSync(Object.fromEntries(Object.entries(files).map(([name,content])=>[name,strToU8(content)])),{level:6});
   const bytes=new Uint8Array(packed);
   const blob=new Blob([bytes],{type:'application/zip'});
   const url=URL.createObjectURL(blob);
   const link=document.createElement('a');
   link.href=url;link.download='OFF-BRIEF-S02-E'+String(episode).padStart(2,'0')+'-WINDOWS-PRODUCTION.zip';
   link.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setNotice('Paquete ZIP de guiones, prompts y estructura de carpetas preparado. No contiene vídeos generados.');
 };
 const downloadAll=(kind:'image'|'video')=>{
   const text=shots.map(s=>'=== '+s.id+' | ESCENA '+s.scene+' PLANO '+s.shot+' ===\n\n'+promptText(s,kind)).join('\n\n-----------------------------\n\n');
   downloadText('off-brief-s02-e'+String(episode).padStart(2,'0')+'-'+(kind==='image'?'imagen':'animacion')+'-prompts.txt',text);
 };
 const episodePicker=<div className="yt2-picker" role="group" aria-label="Seleccionar episodio de temporada dos">
   {seasonTwo.episodes.map(ep=><button type="button" className={episode===ep.number?'active':''} key={ep.number} onClick={()=>{setEpisode(ep.number);setNotice('')}} aria-pressed={episode===ep.number}>
      <span>{String(ep.number).padStart(2,'0')}</span><small>{ep.title}</small>
    </button>)}
 </div>;
 return <div className="yt2-shell" role="tabpanel">
   <section className="yt-paper yt2-intro">
     <div className="yt-small-title">TEMPORADA 02 · DESARROLLO DE LA SERIE</div>
     <h3>{seasonTwo.workingTitle}</h3>
     <p className="yt2-tagline">“{seasonTwo.tagline}”</p>
     <p>{seasonTwo.premise}</p>
     <div className="yt2-facts"><span>8 guiones completos</span><span>64 escenas</span><span>{seasonTwoShotTotal} planos clave</span><span>Prompt de imagen + movimiento por plano</span></div>
     <p className="yt2-note">Material escrito y organizado para producción. Los diálogos y prompts están preparados; las fotos, voces y videos todavía no se han producido. Los nombres nuevos siguen siendo propuestas.</p>
   </section>
   <div className="yt2-view-switch" role="tablist" aria-label="Temporada dos">
     <button type="button" role="tab" aria-selected={view==='synopsis'} className={view==='synopsis'?'active':''} onClick={()=>setView('synopsis')}><Users size={16}/> Personajes e historia</button>
     <button type="button" role="tab" aria-selected={view==='dialogue'} className={view==='dialogue'?'active':''} onClick={()=>setView('dialogue')}><BookOpen size={16}/> Guiones completos</button>
     <button type="button" role="tab" aria-selected={view==='shots'} className={view==='shots'?'active':''} onClick={()=>setView('shots')}><Clapperboard size={16}/> Storyboard y prompts</button>
     <button type="button" role="tab" aria-selected={view==='masters'} className={view==='masters'?'active':''} onClick={()=>setView('masters')}><WandSparkles size={16}/> Master Prompts · Video Studio</button>
   </div>
   {view==='synopsis' ? <>
     <section className="yt-paper">
      <div className="yt-small-title">CASTING VISUAL · AVATARES APORTADOS</div>
      <h3>Personajes y funciones</h3>
      <p>Los números corresponden al orden de las nueve imágenes que compartiste. La imagen 7 vuelve a mostrar a Nia; Ruby conserva su avatar de la temporada 1. Los nombres nuevos son provisionales.</p>
      {groups.map(group=><div className="yt2-group" key={group}>
       <h4>{group==='Protagonista original'?'Las dos protagonistas':group==='Equipo principal'?'Cuatro colaboradores habituales':'Cuatro personajes recurrentes'}</h4>
       <div className="yt2-cast-grid">
        {seasonTwo.roster.filter(person=>person.group===group).map(person=><article className="yt2-cast-card" key={person.name}>
          <div className="yt2-cast-heading">
           {person.avatar===0
             ? <img className="yt2-cast-photo" src={import.meta.env.BASE_URL+'youtube/characters/ruby.webp'} alt="Avatar de Ruby" loading="lazy"/>
             : <div className="yt2-cast-photo" role="img" aria-label={'Avatar original de '+person.name}
                  style={{backgroundImage:'url('+import.meta.env.BASE_URL+'youtube/season-2/cast-grid.webp)',backgroundSize:'300% 300%',backgroundPosition:((person.avatar-1)%3)*50+'% '+Math.floor((person.avatar-1)/3)*50+'%'}}/>}
           <div><strong>{person.name}</strong><span>{person.role}</span></div>
          </div>
          <p>{person.trait}</p><p><b>En la serie:</b> {person.job}</p>
          <p><b>Con quién choca:</b> {person.chemistry}</p>
          <p className="yt2-quote">“{person.catchphrase}”</p>
          <small>{person.avatar===0?'Avatar original de Ruby':'Imagen original '+person.avatar}</small>
        </article>)}
       </div>
      </div>)}
     </section>
     <section className="yt-paper">
      <div className="yt-small-title">TEMPORADA COMPLETA</div><h3>Los ocho capítulos</h3>
      <div className="yt2-episodes">{seasonTwo.episodes.map(ep=><article key={ep.number}>
       <div className="yt2-ep-head"><span>{String(ep.number).padStart(2,'0')}</span><h4>{ep.title}</h4></div>
       <p>{ep.plot}</p><p><b>Cold open:</b> {ep.hook}</p><p><b>Destacados:</b> {ep.primary}</p>
       <p className="yt2-resolution"><b>Final:</b> {ep.payoff}</p>
       <button type="button" className="yt2-open-ep" onClick={()=>{setEpisode(ep.number);setView('dialogue')}}>Leer los diálogos</button>
       <button type="button" className="yt2-open-ep" onClick={()=>{setEpisode(ep.number);setView('shots')}}>Ver planos y prompts</button>
      </article>)}</div>
     </section>
     <section className="yt-paper"><h3>Reglas creativas</h3><p>{seasonTwo.castRule}</p><p>{seasonTwo.visualRule}</p><p className="yt2-note">Los guiones están en primera versión completa, pendientes de lectura de mesa y animatic. No se ha programado su publicación.</p></section>
   </> : <>
     <section className="yt-paper">
      <div className="yt-small-title">{view==='dialogue'?'GUIÓN Y DIÁLOGOS':view==='masters'?'PRODUCCIÓN COMPLETA DE VIDEO · WINDOWS':'STORYBOARD · IMAGEN + VIDEO'}</div>
      <h3>Selecciona el capítulo</h3>{episodePicker}
      <div className="yt2-episode-info">
        <div><span className="yt-small-title">CAPÍTULO {String(selected.number).padStart(2,'0')}</span><h3>{selected.title}</h3><p>{selected.plot}</p></div>
        <span className="yt2-episode-counter">{view==='dialogue'?'8 escenas':view==='masters'?'8 Master Prompts':shots.length+' planos clave'}</span>
      </div>
      {notice&&<p className="yt2-notice" role="status"><Check size={15}/>{notice}</p>}
      {view==='dialogue'?<>
        <div className="yt2-actions">
          <button type="button" onClick={()=>void copy(script,'Guion completo copiado.')}><Copy size={16}/> Copiar guion</button>
          <button type="button" onClick={()=>downloadText('off-brief-s02-e'+String(episode).padStart(2,'0')+'-dialogos.txt',script)}><Download size={16}/> Descargar guion TXT</button>
        </div>
        <Screenplay content={script}/>
      </>:view==='masters'?<>
        <p className="yt2-shot-guidance">Cada Master Prompt reúne el diálogo completo, los personajes, los planos y las instrucciones para crear una escena en clips cortos y montarla con el editor gratuito en Windows. No convierte automáticamente texto en video: para eso necesitas generar o grabar los recursos.</p>
        <div className="yt2-actions">
          <button type="button" onClick={()=>downloadText('off-brief-s02-e'+String(episode).padStart(2,'0')+'-8-MASTER-PROMPTS.txt',masterPromptForSeasonTwoEpisode(episode))}><Download size={16}/> Descargar 8 Master Prompts</button>
          <button type="button" onClick={downloadWindowsPack}><FolderArchive size={16}/> Paquete completo para Windows ZIP</button>
        </div>
        <div className="yt2-master-selector" role="group" aria-label="Seleccionar escena para producción">
          {Array.from({length:8},(_,i)=>i+1).map(i=><button key={i} type="button" className={masterScene===i?'active':''} aria-pressed={masterScene===i} onClick={()=>setMasterScene(i)}>Escena {String(i).padStart(2,'0')}</button>)}
        </div>
        <section className="yt2-master-pane">
          <div className="yt2-master-heading"><div><span className="yt-small-title">MASTER PROMPT COMPLETO · EP {String(episode).padStart(2,'0')} · ESCENA {String(masterScene).padStart(2,'0')}</span><h4>{sceneGroups[masterScene-1]?.shots[0]?.title}</h4></div></div>
          <textarea rows={18} readOnly aria-label={'Master Prompt de episodio '+episode+' escena '+masterScene} value={masterPromptForSeasonTwoScene(episode,masterScene)}/>
          <div className="yt2-actions">
            <button type="button" onClick={()=>void copy(masterPromptForSeasonTwoScene(episode,masterScene),'Master Prompt de escena '+masterScene)}><Copy size={16}/> Copiar Master Prompt</button>
            <button type="button" onClick={()=>downloadText('OFF-BRIEF-S02-E'+String(episode).padStart(2,'0')+'-SCENE-'+String(masterScene).padStart(2,'0')+'-MASTER.txt',masterPromptForSeasonTwoScene(episode,masterScene))}><Download size={16}/> Descargar escena</button>
          </div>
        </section>
        <p className="yt2-shot-guidance"><b>En Windows:</b> descarga el ZIP, extráelo, crea o importa fotografías y clips en las carpetas indicadas y abre el editor. El archivo <code>project.json</code> sirve de guía de producción; no es una importación automática garantizada.</p>
      </>:<>
        <p className="yt2-shot-guidance">Cada escena tiene tres planos base: establecimiento, acción y reacción. Cada plano incluye una indicación de encuadre, el diálogo de referencia y prompts distintos para generar la imagen y animarla. No se han generado imágenes todavía.</p>
        <div className="yt2-actions">
          <button type="button" onClick={()=>downloadAll('image')}><Download size={16}/> Descargar {shots.length} prompts de foto</button>
          <button type="button" onClick={()=>downloadAll('video')}><Download size={16}/> Descargar {shots.length} prompts de video</button>
        </div>
        <div className="yt2-scenes">{sceneGroups.map(group=><details key={group.number} className="yt2-scene" open={group.number===1?true:undefined}>
         <summary><span className="yt2-scene-num">ESCENA {String(group.number).padStart(2,'0')}</span><strong>{group.shots[0]?.title}</strong><small>{group.shots.length} planos</small></summary>
         <div className="yt2-scene-list">{group.shots.map(shot=><ShotCard key={shot.id} shot={shot} onCopy={copy}/>)}</div>
        </details>)}</div>
      </>}
     </section>
   </>}
 </div>;
}
