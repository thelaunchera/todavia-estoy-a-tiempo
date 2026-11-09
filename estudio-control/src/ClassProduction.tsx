import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import ClassWeeklyPlan, {type ClassWeeklyTask} from './ClassWeeklyPlan';
import ClassInterlude, {type ClassInterludeKind} from './ClassInterlude';
import ConnectorsLesson from './ConnectorsLesson';
import CasaBrownieStudioKit,{CASA_BROWNIE_KIT_SECTION,type CasaBrownieKitEntry} from './CasaBrownieStudioKit';
import {RECORDING_EXAMPLE,OFFICIAL_DEMO_URL} from './recording-starts';
import {coreClassLessons as classLessons,coreClassMinutes as classTotalMinutes,coreClassRecordingStarts as recordingStarts,coreClassLinks,coreClassIds} from './class-core-plan';
import { Check, CheckCircle2, Clipboard, ExternalLink, BookOpen, Film, Headphones, Video, ShieldCheck, Save, MonitorPlay, ChevronDown, FileText, UploadCloud } from 'lucide-react';
import { classRecordingScript, classStatusOptions, CLASS_DRIVE, CLASS_RECORDING_FOLDERS, CLASS_RECORDINGS_DRIVE, CLASS_AUDIO_DRIVE, CLASS_EXPORTS_DRIVE, CASA_BROWNIE_PHOTOS_DRIVE, CLASS_EXERCISE_DRIVE, CLASS_NOTION, CLASS_PLAN, CLASS_PROMPTS, CLASS_STUDENT, CLASS_SECTION } from './class-course';
import './class-production.css';

export type ClassEntry = {
  id: string; title: string; section?: string; subtitle?: string;
  status?: string; notes?: string; link?: string; performance_notes?: string;
  recording_path?: string; recording_name?: string; recording_bytes?: string;
};
type Props = {
  entries: ClassEntry[];
  tasks: ClassWeeklyTask[];
  focusPending?: {kind:'lesson'|'weekly';id:string}|null;
  onTaskToggle: (task:ClassWeeklyTask,next:'pendiente'|'completado')=>Promise<void>;
  launchStats?: {waitlist:number; buyers:number}|null;
  onSave: (item: ClassEntry, fields: Pick<ClassEntry,'status'|'notes'|'link'|'performance_notes'>) => Promise<void>;
  onUpload: (item:ClassEntry,file:File,onProgress:(percent:number)=>void)=>Promise<void>;
  onViewRecording: (path:string)=>Promise<string>;
};
function validVideoLink(value: string): boolean {
  if (!value.trim()) return true;
  try { const url=new URL(value); return url.protocol==='https:' && !url.username && !url.password; } catch { return false; }
}
function safeStatus(value?:string) {
  return classStatusOptions.includes(value as typeof classStatusOptions[number]) ? value! : 'pendiente';
}
function clipName(lessonId: string) { return 'CLASE01_'+lessonId+'_PANTALLA.mp4'; }
// Cuatro videos en el mismo orden del alumno.
const tabletFilmingOrder=classLessons;
type InterludeLaunch={
 chapter:string; title:string; subtitle:string; stepNumber:number;
 totalSteps:number; kind:ClassInterludeKind; advanceTo:number|null; fromLessonId:string;
};

export default function ClassProduction({entries,tasks,focusPending,onTaskToggle,launchStats,onSave,onUpload,onViewRecording}:Props) {
 const [lessonId,setLessonId]=useState('01');
 const focusedLessonOnce = useRef<string|null>(null);
 const filePicker=useRef<HTMLInputElement>(null);
 const targetChapter=useRef<string>('01');
 const [uploadingId,setUploadingId]=useState<string|null>(null);
 const [uploadProgress,setUploadProgress]=useState(0);
 const [uploadNotice,setUploadNotice]=useState('');
 const [area,setArea]=useState<'grabar'|'alumno'|'recursos'|'plan'>('grabar');
 const [scene,setScene]=useState(0);
 const [mode,setMode]=useState<'scene'|'overview'>('scene');
 const [voiceMode,setVoiceMode]=useState<'pistas'|'texto'>('pistas');
 const [status,setStatus]=useState('pendiente');
 const [notes,setNotes]=useState('');
 const [url,setUrl]=useState('');
 const [checked,setChecked]=useState<number[]>([]);
 const [saving,setSaving]=useState(false);
 const [notice,setNotice]=useState('');
 const [copied,setCopied]=useState('');
 const [showAdminRoom,setShowAdminRoom]=useState(false);
 const [tabletMode,setTabletMode]=useState<boolean>(()=>{
  if(typeof window==='undefined')return false;
  try{const stored=window.localStorage.getItem('tle_class_tablet_filming_v1');if(stored!==null)return stored==='yes';}catch{}
  return Boolean(window.matchMedia?.('(pointer: coarse) and (min-width: 650px)').matches);
 });
 const [tabletCue,setTabletCue]=useState<'screen'|'voice'>('screen');
 const [interludeKind,setInterludeKind]=useState<ClassInterludeKind>('clase');
 const [interlude,setInterlude]=useState<InterludeLaunch|null>(null);
 useEffect(()=>{try{window.localStorage.setItem('tle_class_tablet_filming_v1',tabletMode?'yes':'no');}catch{}},[tabletMode]);
 // A task card in Mis tareas opens the exact existing class workspace.
 useEffect(()=>{
   if(focusPending?.kind==='weekly') setArea('plan');
   if(focusPending?.kind==='lesson' && coreClassIds.some(id=>id===focusPending.id)){
     setArea('grabar');
     setLessonId(focusPending.id);
   }
 },[focusPending?.kind,focusPending?.id]);
 useEffect(()=>{
   if(focusPending?.kind!=='lesson' || area!=='grabar' || lessonId!==focusPending.id)return;
   if(focusedLessonOnce.current===focusPending.id)return;
   const frame=window.requestAnimationFrame(()=>{
     const header=document.querySelector<HTMLElement>('#class-filming-workspace .class-lesson-header');
     if(!header)return;
     header.scrollIntoView({block:'start',behavior:'smooth'});
     focusedLessonOnce.current=focusPending.id;
   });
   return()=>window.cancelAnimationFrame(frame);
 },[focusPending?.kind,focusPending?.id,area,lessonId]);
 const lesson=useMemo(()=>classLessons.find(x=>x.id===lessonId)||classLessons[0],[lessonId]);
 const recordingStart=recordingStarts[lesson.id];
 const records=useMemo(()=>entries.filter(x=>x.section===CLASS_SECTION),[entries]);
 const visualKit=entries.find(x=>x.section===CASA_BROWNIE_KIT_SECTION) as CasaBrownieKitEntry|undefined;
 const record=records.find(x=>x.subtitle===lesson.id);
 const activeRecords=records.filter(x=>coreClassIds.some(id=>id===x.subtitle));
 const done=activeRecords.filter(x=>x.status==='aprobado').length;
 const recorded=activeRecords.filter(x=>x.status==='grabado'||x.status==='editando'||x.status==='aprobado').length;
 // El reel de la clase requiere material real, no la bienvenida (00), que se graba al final.
 const classFootage=activeRecords.filter(x=>['grabado','editando','aprobado'].includes(x.status||''));
 const hasClassFootage=classFootage.length>0;
 const originalStatus=safeStatus(record?.status);
 const originalChecked=(record?.performance_notes||'').split(',').filter(Boolean).map(x=>Number(x)).filter(n=>Number.isInteger(n)&&n>=0&&n<lesson.prep.length);
 const changed=status!==originalStatus || notes!==(record?.notes||'') || url!==(record?.link||'') || JSON.stringify([...checked].sort())!==JSON.stringify([...originalChecked].sort());
 useEffect(()=>{
   setStatus(safeStatus(record?.status));setNotes(record?.notes||'');setUrl(record?.link||'');
   setChecked((record?.performance_notes||'').split(',').filter(Boolean).map(x=>Number(x)).filter(n=>Number.isInteger(n)&&n>=0&&n<lesson.prep.length));
   setNotice('');setScene(0);setCopied('');setInterlude(null);
 },[lessonId,record?.id]);
 function choose(id:string){
   if(changed && !window.confirm('Tienes cambios sin guardar. ¿Cambiar de video y descartarlos?')) return;
   // Reset immediately, before rendering the next lesson: some chapters have fewer scenes.
   setInterlude(null);setScene(0);setTabletCue('screen');setLessonId(id);setMode('scene');
 }
 function showInterlude(preview:boolean,forcedKind?:ClassInterludeKind){
  const nextIndex=scene+1;
  const nextBeat=lesson.beats[nextIndex];
  const index=tabletFilmingOrder.findIndex(x=>x.id===lesson.id);
  const following=index>=0?tabletFilmingOrder[index+1]:undefined;
  const isDemo=forcedKind==='demo';
  const title=isDemo?'Casa Brownie · Nuestra web de ejemplo':
   nextBeat?nextBeat.label:following?following.title:'Tu web, lista para compartir';
  const subtitle=isDemo?'Una demostración educativa. Sin compras ni pagos reales.':
   nextBeat?(
    nextBeat.show.length>116?nextBeat.show.slice(0,113).trimEnd()+'…':nextBeat.show
   ):following?'Lo que viene en la siguiente clase, paso a paso.':
   'Revisión final de lo que construimos.';
  setInterlude({
   chapter:isDemo?lesson.id:(nextBeat?lesson.id:following?.id||lesson.id),
   title,subtitle,
   stepNumber:isDemo?scene+1:(nextBeat?nextIndex+1:1),
   totalSteps:nextBeat||isDemo?lesson.beats.length:(following?.beats.length||1),
   kind:forcedKind||interludeKind,
   advanceTo:!preview&&!isDemo&&nextBeat?nextIndex:null,
   fromLessonId:lesson.id
  });
 }
 function completeInterlude(){
  const target=interlude;
  setInterlude(null);
  if(target && target.advanceTo!==null && target.fromLessonId===lesson.id){
   setScene(target.advanceTo);
   setTabletCue('screen');
   setCopied('');
  }
 }
 async function copy(text:string, key:string) {
   try { await navigator.clipboard.writeText(text);setCopied(key); }
   catch {setNotice('No se pudo copiar automáticamente. Selecciona el texto en pantalla para copiarlo.');}
 }
 async function save(statusOverride?:string) {
   if(!record){setNotice('No se encontró la ficha privada de este video. Actualiza el Estudio y prueba otra vez.');return;}
   if(!validVideoLink(url)){setNotice('El enlace de video debe comenzar con https://; puedes dejarlo vacío hasta grabar.');return;}
   setSaving(true);setNotice('');
   try {
     await onSave(record,{status:statusOverride||status,notes,link:url.trim(),performance_notes:[...checked].sort((a,b)=>a-b).join(',')});
     if(statusOverride)setStatus(statusOverride);
     setNotice('Progreso guardado en tu Estudio privado. No se publicó para los alumnos.');
   } catch(e) {setNotice(e instanceof Error?e.message:'No se pudo guardar.');}
   finally{setSaving(false);}
 }
 function startUpload(id:string) {
   if(uploadingId)return;
   targetChapter.current=id;
   setUploadNotice('');
   filePicker.current?.click();
 }
 async function handleSelectedFile(event:ChangeEvent<HTMLInputElement>) {
   const file=event.target.files?.[0];
   event.target.value='';
   if(!file)return;
   const target=targetChapter.current;
   const chapter=records.find(entry=>entry.subtitle===target);
   if(!chapter){setUploadNotice('No se encontró la ficha de ese capítulo. Actualiza el Studio.');return;}
   const ext=file.name.split('.').pop()?.toLowerCase();
   if(!['mp4','mov','webm'].includes(ext||'')){setUploadNotice('Elige un archivo MP4, MOV o WEBM.');return;}
   if(file.size>50_000_000){setUploadNotice('El archivo supera 50 MB. Súbelo a YouTube como No listado y pega su enlace en el capítulo; así conservas el video completo.');return;}
   setUploadingId(target);setUploadProgress(0);setUploadNotice('');
   try {
     await onUpload(chapter,file,p=>setUploadProgress(p));
     setUploadNotice('Video '+target+' guardado en tu archivo privado. No está publicado para los alumnos.');
   }catch(error){
     setUploadNotice(error instanceof Error?error.message:'No se pudo subir el video. Vuelve a intentarlo.');
   }finally{setUploadingId(null);}
 }
 async function viewRecording(path:string){
   // Open a tab synchronously so Safari does not block the private signed link.
   const tab=window.open('about:blank','_blank');
   try{
     const signed=await onViewRecording(path);
     if(tab)tab.location.href=signed;
     else window.location.href=signed;
   }catch(error){
     tab?.close();
     setUploadNotice(error instanceof Error?error.message:'No pude abrir la grabación.');
   }
 }
 function togglePrep(i:number) {setChecked(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);}
 const chapterNotes=[
  `VIDEO ${lesson.id} · ${lesson.title}`,
  `Objetivo: ${lesson.outcome}`,
  'Prepara: '+recordingStart.tabs.join(' · '),
  ...lesson.beats.map((beat,i)=>`${i+1}. ${beat.label} · Pantalla: ${beat.show}`),
  `Prueba o entrega: ${lesson.exercise}`
 ].join('\n');
 const recordingGuide='Antes de grabar: cierra notificaciones y cuentas privadas; abre solo las pestañas del módulo; captura desde el teléfono con texto legible; conserva el formato nativo y usa 16:9 solo para montaje cuando no reduzca la lectura; graba cada escena por separado sin forzar una toma larga; captura clics reales; deja 2 segundos de aire al principio y al final; si te equivocas, repite esa escena, no todo el video; guarda el archivo con su número; después añade tu narración natural y revisa cada clic; valida primero una muestra de voz de 60–90 segundos. El ejemplo de brownies tradicionales es ficticio y no tiene cobros.';
 return <section className={"class-room"+(tabletMode&&area==='grabar'?" class-room--tablet":"")}>
  <header className="class-intro">
    <div>
      <span className="class-overline"><Film size={15}/> TALLER · SALA PRIVADA DE PRODUCCIÓN</span>
      <h2>Tu primera web <em>con IA.</em></h2>
      <p><b>Este espacio es solo para ti.</b> Elige un capítulo, prepara lo que mostrarás, graba y guarda el video. Las instrucciones que reciben los alumnos se revisan por separado en «Ruta del alumno».</p>
      <div className="class-intro-tags"><span>4 videos</span><span>{classTotalMinutes} min aprox.</span><span>Lanzamiento previsto: 3 dic 2026</span></div>
    </div>
    <div className="class-overview">
      <strong>{done}<small> / {classLessons.length}</small></strong>
      <span>Videos aprobados</span>
      <div className="class-progress-track" aria-label={done+' de '+classLessons.length+' videos aprobados'}><div style={{width:(done/classLessons.length*100)+'%'}}/></div>
      <small>{recorded} grabados o en edición</small>
    </div>
  </header>
  <nav className="class-area-nav" aria-label="Organización de la clase">
    <button type="button" className={area==='grabar'?'active':''} aria-current={area==='grabar'?'page':undefined} onClick={()=>setArea('grabar')}><Video size={16}/> 1. Grabar clase</button>
    <button type="button" className={area==='alumno'?'active':''} aria-current={area==='alumno'?'page':undefined} onClick={()=>setArea('alumno')}><BookOpen size={16}/> 2. Ruta del alumno</button>
     <button type="button" className={area==='recursos'?'active':''} aria-current={area==='recursos'?'page':undefined} onClick={()=>setArea('recursos')}><FileText size={16}/> 3. Materiales y herramientas</button>
    <button type="button" className={area==='plan'?'active':''} aria-current={area==='plan'?'page':undefined} onClick={()=>setArea('plan')}><Check size={16}/> 4. Plan y lanzamiento</button>
  </nav>
  <input ref={filePicker} type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" className="class-recording-picker" tabIndex={-1} aria-label="Elegir grabación del capítulo" onChange={event=>void handleSelectedFile(event)}/>
  {area==='grabar'&&<div className="class-tablet-mode-switch">
   <div><span className="class-mini-heading">GRABACIÓN EN iPAD</span><p>{tabletMode?'Vista concentrada: un capítulo y una escena a la vez.':'Activa una pantalla más sencilla para filmar desde tu tablet.'}</p></div>
   <button type="button" aria-pressed={tabletMode} onClick={()=>setTabletMode(v=>!v)}>{tabletMode?'Ver estudio completo':'Activar modo iPad'}</button>
  </div>}
  {area==='alumno'&&<section className="class-student-route" aria-label="Ruta del alumno, vista de la profesora">
    <div className="class-student-route-heading">
     <span className="class-overline"><BookOpen size={16}/> VISTA DE PROFESORA · NO ES EL AULA PÚBLICA</span>
     <h3>Lo que tú enseñas. Lo que ellos hacen.</h3>
     <p>En tus videos reconstruyes Casa Brownie para demostrar el método. Cada estudiante construye <b>su propia web</b> con su marca, sus textos y sus fotografías. No tiene que copiar la web de brownies ni utilizar tus archivos.</p>
     <div className="class-student-route-actions">
      <a href="../alumnos/?vista=admin" target="_blank" rel="noopener noreferrer">Revisar Centro de alumnos <ExternalLink size={15}/></a>
      <button type="button" onClick={()=>setArea('grabar')}><Video size={15}/> Ir a mis guiones de grabación</button>
     </div>
     <p className="class-student-route-location"><b>En el aula:</b> ChatGPT y conectores necesarios primero. Después cuatro videos con descripción breve y enlaces. Los PDF y prompts largos quedan como recursos opcionales.</p>
    </div>
    <div className="class-student-route-list">
     {classLessons.map((chapter,index)=><details key={chapter.id} className="class-student-route-chapter" open={undefined}>
      <summary><span>{chapter.id}</span><strong>{chapter.title}</strong><small>{chapter.minutes} min</small><ChevronDown size={16}/></summary>
      <div>
       <p><b>Tu demostración:</b> {chapter.outcome}</p>
       <p><b>Actividad del estudiante:</b> {chapter.exercise}</p>
       <p><b>Al grabar:</b> muestra la pantalla, explica en una frase y comprueba el resultado. No supongas que AppDeploy está conectado o que se publicó la web.</p>
       <nav className="class-core-lesson-links" aria-label={'Enlaces del video '+(index+1)}>
        {coreClassLinks[chapter.id as keyof typeof coreClassLinks].map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={13}/></a>)}
       </nav>
       <button type="button" onClick={()=>{choose(chapter.id);setArea('grabar');}}>Abrir guion privado del video {String(index+1).padStart(2,'0')}</button>
      </div>
     </details>)}
    </div>
   </section>}
   {area==='plan'&&<div className="class-plan-panel">
  <div className="class-funnel-stats" aria-label="Primeras ventas y lista de espera">
    <div><strong>{launchStats?.waitlist ?? '—'}</strong><span>Correos confirmados de la clase</span></div>
    <div><strong>{launchStats?.buyers ?? '—'}</strong><span>Compras con acceso activo</span></div>
    <div><strong>Inactivo</strong><span>Checkout de la clase, pendiente de activar</span></div>
   </div>
   <ClassWeeklyPlan tasks={tasks} lessons={entries} focusTaskId={focusPending?.kind==='weekly'?focusPending.id:null} onToggle={onTaskToggle}/>
  </div>}
  {area==='recursos'&&<div className="class-resources-panel">
   <div className="class-admin-room-entry">
    <div>
      <span className="class-overline"><ShieldCheck size={15}/> ACCESO DE ADMINISTRADORA</span>
      <h3>Centro de alumnos</h3>
      <p>Revisa el aula tal como se va construyendo: los módulos, videos en preparación y materiales. Abre con tu sesión actual del Estudio, sin otra contraseña ni una compra.</p>
      <small>La vista es privada y no modifica el avance de los alumnos.</small>
    </div>
    <div className="class-admin-room-actions">
      <button type="button" onClick={()=>setShowAdminRoom(!showAdminRoom)} aria-expanded={showAdminRoom} aria-controls="studio-classroom-preview"><MonitorPlay size={17}/>{showAdminRoom?'Cerrar vista del aula':'Ver el Centro de alumnos'}</button>
      <a href="../alumnos/?vista=admin" target="_blank" rel="noopener noreferrer">Abrir vista del alumno <ExternalLink size={15}/></a>
      <a href="../alumnos/?vista=admin&gestionar_demos=1" target="_blank" rel="noopener noreferrer"><ShieldCheck size={15}/> Gestionar demos visibles · solo propietaria</a>
    </div>
  </div>
  {showAdminRoom && <div id="studio-classroom-preview" className="class-admin-room-preview">
    <div className="class-admin-preview-heading"><strong>Vista real del aula</strong><span>Solo tu sesión autorizada de administradora</span></div>
    <iframe src="../alumnos/?vista=admin" title="Vista administrativa del Centro de alumnos" loading="lazy" referrerPolicy="same-origin"/>
  </div>}
  <div className="class-links">
    <a href={CLASS_NOTION} target="_blank" rel="noreferrer"><BookOpen size={16}/> Estudio privado de la clase <ExternalLink size={13}/></a>
    <a href={CLASS_PLAN} target="_blank" rel="noreferrer"><FileText size={16}/> Producción detallada <ExternalLink size={13}/></a>
    <a href="https://app.notion.com/p/407a68f2ee6e81f1b331eebd75b2e3d9?pvs=204" target="_blank" rel="noreferrer"><FileText size={16}/> Plan de primera venta <ExternalLink size={13}/></a>
    <a href={CLASS_DRIVE} target="_blank" rel="noreferrer"><FileText size={16}/> Materiales · Drive <ExternalLink size={13}/></a>
    <a href={CLASS_PROMPTS} target="_blank" rel="noreferrer"><Clipboard size={16}/> 12 prompts <ExternalLink size={13}/></a>
    <a href="https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video" target="_blank" rel="noopener noreferrer"><MonitorPlay size={16}/> Resultado a reproducir · Foto estática <ExternalLink size={13}/></a>
  </div>
  <div className="class-safety"><ShieldCheck size={19}/><span><b>Solo producción privada.</b> La versión aprobada de Casa Brownie es exclusivamente la publicada desde el repositorio en thelaunchera.com/demos/casa-brownie/. AppDeploy es solo para construir la práctica del alumno; nunca sobrescribas el demo oficial. El prototipo no tiene pedidos ni cobros reales. Para enseñar pagos, utiliza Stripe en modo de prueba sin datos de clientes.</span></div>
  <CasaBrownieStudioKit entry={visualKit}/>
  <ConnectorsLesson/>
  </div>}
  {area==='grabar'&&<>
  {area==='grabar'&&tabletMode&&<section className="class-tablet-desk" aria-label="Modo iPad · grabación privada de la clase">
   <header className="class-tablet-head">
    <span className="class-overline"><Film size={17}/> TU MESA DE GRABACIÓN · PRIVADA</span>
    <h3>Una escena a la vez.</h3>
    <p>Cuatro videos. Enseña el clic, di una frase y muestra el resultado. Nada se publica automáticamente.</p>
    <nav className="class-core-tablet-links" aria-label="Enlaces de este video">
     {coreClassLinks[lesson.id as keyof typeof coreClassLinks].map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={13}/></a>)}
    </nav>
    <label htmlFor="class-tablet-lesson">¿Qué capítulo vas a grabar?
     <select id="class-tablet-lesson" value={lesson.id} onChange={e=>choose(e.target.value)}>
      {tabletFilmingOrder.map(item=><option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
     </select>
    </label>
   </header>
   <div className="class-tablet-scene">
    <div className="class-tablet-scene-top">
     <span>ESCENA {scene+1} DE {lesson.beats.length}</span>
     <span>VIDEO {classLessons.findIndex(x=>x.id===lesson.id)+1} DE 4 · {lesson.minutes} MIN APROX.</span>
    </div>
    <h4>{lesson.beats[scene].label}</h4>
    <div className="class-tablet-cue-switch" role="group" aria-label="Elegir qué mirar durante la grabación">
     <button type="button" className={tabletCue==='screen'?'active':''} aria-pressed={tabletCue==='screen'} onClick={()=>setTabletCue('screen')}><MonitorPlay size={17}/> Qué mostrar</button>
     <button type="button" className={tabletCue==='voice'?'active':''} aria-pressed={tabletCue==='voice'} onClick={()=>setTabletCue('voice')}><Headphones size={17}/> Qué decir</button>
    </div>
    <div className="class-tablet-cue" aria-live="polite">
     <p>{tabletCue==='screen'?lesson.beats[scene].show:lesson.beats[scene].say}</p>
    </div>
    <div className="class-tablet-scene-nav">
     <button type="button" disabled={scene===0} onClick={()=>{setScene(n=>Math.max(0,n-1));setCopied('');}}><span aria-hidden="true">‹</span> Anterior</button>
     <strong>{scene+1} / {lesson.beats.length}</strong>
     <button type="button" disabled={scene===lesson.beats.length-1} onClick={()=>showInterlude(false)}>Siguiente escena <span aria-hidden="true">›</span></button>
    </div>
   </div>
   <details className="class-tablet-interlude-setup" aria-labelledby="class-transition-title">
    <summary className="class-tablet-interlude-heading">
     <span className="class-mini-heading">MINI PÁGINAS ANIMADAS</span>
     <h4 id="class-transition-title">Una pausa bonita entre escenas.</h4>
     <p>Opcional: separadores bonitos entre escenas.</p>
    </summary>
    <div className="class-tablet-interlude-options">
     <label>Rótulo de la transición
      <select aria-label="Rótulo de la transición" value={interludeKind} onChange={e=>setInterludeKind(e.target.value as ClassInterludeKind)}>
       <option value="clase">CLASE · 01</option>
       <option value="concepto">CONCEPTO · 01</option>
       <option value="demo">DEMO · 01</option>
      </select>
     </label>
     <button type="button" onClick={()=>showInterlude(true)}><MonitorPlay size={18}/> Ver transición de la siguiente escena</button>
     <button type="button" onClick={()=>showInterlude(true,'demo')}><Film size={17}/> Probar ejemplo DEMO</button>
    </div>
    <p className="class-tablet-interlude-tip"><ShieldCheck size={15}/> Opcional. No modifica la web ni genera un video automáticamente.</p>
   </details>
   <div className="class-tablet-actions">
    <a href={OFFICIAL_DEMO_URL+'?etapa=sin-video'} target="_blank" rel="noopener noreferrer"><MonitorPlay size={18}/> Ver referencia con foto fija</a>
    <button type="button" onClick={()=>void copy(recordingStart.readyPrompt,'tablet-ready')}><Clipboard size={18}/>{copied==='tablet-ready'?'Prompt copiado':'Copiar prompt listo'}</button>
   </div>
   <section className="class-tablet-drive-section" aria-label="Guardar las tomas del capítulo">
    <a className="class-tablet-folder-primary" href={CLASS_RECORDING_FOLDERS[lesson.id]} target="_blank" rel="noopener noreferrer"><Film size={18}/> Abrir carpeta de tomas · Capítulo {lesson.id}</a>
    <details className="class-tablet-drive-more">
     <summary>Ver las demás carpetas de trabajo</summary>
     <nav className="class-tablet-drive-links" aria-label="Carpetas privadas y materiales de grabación">
      <a href={CLASS_RECORDINGS_DRIVE} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Todas las grabaciones</a>
      <a href={CLASS_EXERCISE_DRIVE} target="_blank" rel="noopener noreferrer"><FileText size={16}/> Práctica Casa Brownie · 8 carpetas</a>
      <a href={CASA_BROWNIE_PHOTOS_DRIVE} target="_blank" rel="noopener noreferrer"><BookOpen size={16}/> Fotos originales del demo</a>
      <a href={CLASS_AUDIO_DRIVE} target="_blank" rel="noopener noreferrer"><Headphones size={16}/> Audios y subtítulos</a>
      <a href={CLASS_EXPORTS_DRIVE} target="_blank" rel="noopener noreferrer"><CheckCircle2 size={16}/> Videos finales aprobados</a>
     </nav>
    </details>
   </section>
   <details className="class-tablet-helper">
    <summary>Preparar esta escena en el iPad</summary>
    <div className="class-tablet-helper-body">
     <p><b>1.</b> Abre el taller y prepara las pestañas de este capítulo.</p>
     <ul>{recordingStart.tabs.map(item=><li key={item}>{item}</li>)}</ul>
     <h5>Antes de pulsar Grabar: {lesson.prep.length} comprobaciones</h5>
     <div className="class-tablet-prep-list">
      {lesson.prep.map((item,index)=><label key={index} className="class-tablet-prep-check">
       <input type="checkbox" checked={checked.includes(index)} onChange={e=>setChecked(prev=>e.target.checked?[...prev,index]:prev.filter(n=>n!==index))}/>
       <span>{item}</span>
      </label>)}
     </div>
     <p><b>Guarda el punto de partida:</b> {recordingStart.savedPoint}</p>
     <p><b>2.</b> Desactiva las notificaciones. Abre el Centro de control del iPad y toca Grabación de pantalla. El Studio no puede iniciar la grabación por ti.</p>
     <p><b>3.</b> Graba una escena por vez. Detén la grabación desde iPadOS y guarda cada toma con nombre <code>CLASE01_{lesson.id}_ESCENA_01.mov</code> en la carpeta Drive de este capítulo. Añade la voz después si lo prefieres.</p>
     <p><b>4.</b> El botón «Subir video desde el iPad» guarda una copia en el almacenamiento privado del Studio, no en Drive. Los videos de más de 50 MB deben permanecer en Drive y registrarse mediante enlace privado.</p>
     <p><b>Termina cuando:</b> {recordingStart.finish}</p>
    </div>
   </details>
   <section className="class-tablet-finish" aria-label="Guardar la grabación privada">
    <div className="class-tablet-finish-head"><div><span className="class-mini-heading">GUARDA TU TOMA</span><h4>Capítulo {lesson.id} · {lesson.title}</h4></div><span className="class-tablet-private"><ShieldCheck size={15}/> Privado</span></div>
    {record?.recording_path&&<button className="class-tablet-view-saved" type="button" onClick={()=>void viewRecording(record.recording_path!)}><CheckCircle2 size={16}/> Ver grabación guardada · {record.recording_name||lesson.id}</button>}
    <button className="class-tablet-upload" type="button" disabled={!!uploadingId||!record} onClick={()=>startUpload(lesson.id)}><UploadCloud size={19}/>{uploadingId===lesson.id?'Subiendo '+uploadProgress+'%':record?.recording_path?'Cambiar archivo de video':'Subir video desde el iPad'}</button>
    {uploadingId===lesson.id&&<div className="class-upload-progress" aria-label={'Subida '+uploadProgress+'%'}><div style={{width:uploadProgress+'%'}}/></div>}
    <small className="class-tablet-limit">MP4, MOV o WEBM hasta 50 MB. Para grabaciones más largas, utiliza un enlace privado o No listado.</small>
    <label className="class-tablet-field">Enlace al video (opcional)
     <input type="url" inputMode="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtu.be/… o enlace privado"/>
    </label>
    <label className="class-tablet-field">Notas para repetir o editar
     <textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej.: repetir escena 2, ajustar tamaño del texto…"/>
    </label>
    <div className="class-tablet-save-actions">
     <button type="button" disabled={saving||!record} className="class-tablet-save" onClick={()=>void save('grabado')}><Check size={18}/>{saving?'Guardando…':'Marcar grabado y guardar'}</button>
     <button type="button" disabled={saving||!record} className="class-tablet-save-alt" onClick={()=>void save()}><Save size={17}/> Guardar avance</button>
    </div>
    <p className="class-tablet-feedback" role="status">{uploadNotice||notice||'Las tomas y tus notas permanecen privadas hasta que apruebes la clase.'}</p>
   </section>
  </section>}
   <section className="class-reel-gate" aria-label="Reel de la clase después de la grabación">
    <div className="class-reel-gate-copy">
     <span className="class-mini-heading"><Film size={15}/> REEL DE LA CLASE · MATERIAL REAL</span>
     <h3>{hasClassFootage?'Ya puedes revisar fragmentos de la clase.':'Primero grabamos la clase. Después hacemos el reel.'}</h3>
     <p>{hasClassFootage
      ? 'Hay al menos una clase práctica marcada como grabada o en edición. Selecciona escenas auténticas de pantalla y del proceso de Casa Brownie; prepara el montaje sin dar por aprobado ni publicado el reel.'
      : 'Todavía no hay una grabación práctica marcada como terminada. El reel se hará con cortes de tu primera clase real: no prepares tomas falsas, no uses mockups ni lo programes antes.'}</p>
     <p className="class-reel-gate-steps"><b>Secuencia:</b> grabar la clase, elegir los momentos más claros, editar 15–25 segundos, revisar subtítulos y publicar solo después de tu aprobación.</p>
    </div>
    <div className="class-reel-gate-action">
     <strong>{hasClassFootage?'Grabación de clase registrada':'Pendiente de grabación'}</strong>
     <small>{hasClassFootage?classFootage.length+' módulo(s) con material registrado. El reel sigue pendiente de edición y aprobación.':'No hay material fuente confirmado en las fichas del Studio.'}</small>
     <a href="https://app.notion.com/p/407a68f2ee6e8125b83ff36388d27335" target="_blank" rel="noopener noreferrer">Ver ficha del reel (borrador) <ExternalLink size={14}/></a>
    </div>
   </section>
   <section className="class-safety" aria-label="Recorrido definitivo de producción">
    <BookOpen size={19}/><div><b>Recorrido definitivo · Casa Brownie sin video</b>
    <p>Reconstruye en la práctica independiente el header, hero estático, banner, seis sabores, regalos, historia, entrega ilustrativa en Miami y footer. CRUMB queda como referencia adicional en Demos terminados. El video del hero se enseña solo en el bono.</p>
    <p><b>Orden:</b> 1) ChatGPT y conectores, 2) crea con un prompt, 3) mejora con capturas, 4) publica y comprueba. Stripe, Make, Gmail y hero animado pasan a bonos opcionales.</p>
    <p><b>Para grabar:</b> abre solo las herramientas del video, usa fotos aprobadas sin duplicarlas, guarda un antes/después real y marca probado solo lo que hayas comprobado.</p>
    <p><b>Cierre:</b> URL real, portada móvil y CTA comprobado. Dudas en Ayuda; extras opcionales. No abrir checkout ni accesos antes del QA.</p></div>
   </section>
   <section className="class-start-here" aria-label="Punto de partida de grabación">
    <div className="class-start-here-copy"><span className="class-mini-heading">TU PUNTO DE PARTIDA · SOLO GRABACIÓN</span><h3>Casa Brownie · comienza desde cero.</h3><p>Esta es la app limpia para mostrar cada paso en pantalla. No abras el demo terminado para grabar la construcción; úsalo solo como referencia del resultado.</p></div>
    <div className="class-start-here-actions"><a className="class-primary-link" href="https://casa-brownie-taller-desde-cero-b37dq5.v2.appdeploy.ai/" target="_blank" rel="noopener noreferrer">Abrir AppDeploy desde cero <ExternalLink size={15}/></a><a href="https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video" target="_blank" rel="noopener noreferrer">Ver resultado sin video <ExternalLink size={14}/></a></div>
   </section>
  <div id="class-filming-workspace" className="class-body">
    <aside className="class-module-list" aria-label="Elegir video">
      <p className="class-mini-heading">PLAN DE GRABACIÓN</p>
      <p className="class-upload-hint">Sube la grabación original de cada capítulo. Privada · MP4, MOV o WEBM · hasta 50 MB por archivo.</p>
      {classLessons.map(item=>{
       const entry=records.find(x=>x.subtitle===item.id);
       const stage=safeStatus(entry?.status);
       return <div key={item.id} className="class-module-entry">
         <button type="button" className={'class-module '+(item.id===lesson.id?'selected':'')} onClick={()=>choose(item.id)} aria-current={item.id===lesson.id?'step':undefined}>
          <span className="class-number">{item.id}</span>
          <span className="class-module-main"><b>{item.title}</b><small>{item.minutes} min aprox. · {stage}{entry?.recording_path?' · archivo guardado':''}</small></span>
          {stage==='aprobado'&&<CheckCircle2 size={17}/>}
         </button>
         <button type="button" className="class-module-upload" disabled={!!uploadingId||!entry} onClick={()=>startUpload(item.id)}
          aria-label={'Subir video del capítulo '+item.id+' · '+item.title}>
          <UploadCloud size={15}/>{uploadingId===item.id?'Subiendo '+uploadProgress+'%':entry?.recording_path?'Cambiar video':'Subir video'}
         </button>
       </div>;
      })}
    </aside>
    <div className="class-workspace">
      <div className="class-core-recording-links">
       <div><strong>Enlaces de este video</strong><small>Abre las herramientas y referencias. Comprueba los permisos de tus conectores antes de usarlos.</small></div>
       <nav aria-label="Enlaces para grabar">
        {coreClassLinks[lesson.id as keyof typeof coreClassLinks].map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={13}/></a>)}
       </nav>
      </div>
      <div className="class-lesson-header">
       <span className="class-mini-heading">VIDEO {classLessons.findIndex(x=>x.id===lesson.id)+1} / {classLessons.length} · META {lesson.minutes} MIN</span>
       <h3>{lesson.title}</h3>
       <p>{lesson.outcome}</p>
       <p><strong>Ejemplo de toda la clase:</strong> {RECORDING_EXAMPLE}</p>
      </div>
      <details className="class-extra class-method-details"><summary>Cómo grabar esta sesión</summary><div className="class-method">
       <div><span>01</span><b>Prepara</b><small>Abre las pestañas y materiales de este video.</small></div>
       <div><span>02</span><b>Graba la pantalla</b><small>Una escena cada vez, horizontal y sin notificaciones.</small></div>
       <div><span>03</span><b>Añade tu voz</b><small>Narra después con ElevenLabs, sin leer botones que no existen.</small></div>
       <div><span>04</span><b>Revisa y guarda</b><small>Guarda el enlace del video; no se publica automáticamente.</small></div>
      </div>
      </details>
      <div className="class-prepare">
       <div className="class-section-heading"><h4>Antes de grabar</h4><span>{checked.length}/{lesson.prep.length} listos</span></div>
       {lesson.prep.map((step,i)=><label key={i} className="class-prep-row"><input type="checkbox" checked={checked.includes(i)} onChange={()=>togglePrep(i)}/><span>{step}</span></label>)}
       <div className="class-copy-row">
        <button type="button" onClick={()=>void copy(clipName(lesson.id),'file')}><Clipboard size={14}/> {copied==='file'?'Nombre copiado':'Copiar nombre del archivo'}</button>
        <code>{clipName(lesson.id)}</code>
       </div>
      </div>
      <details className="class-extra class-start-details"><summary>Pestañas, clics exactos y prompt de esta sesión</summary><div className="recording-start-card">
       <div className="recording-start-head"><h4>Tu sesión lista para grabar</h4><span className="recording-start-small">No es otra lección del alumno</span></div>
       <p>Abre solo estas pestañas y sigue los clics. Si debes repetir una escena, vuelve al punto guardado sin rehacer todo el proyecto.</p>
       <h5>Pestañas que preparas</h5><ul>{recordingStart.tabs.map(item=><li key={item}>{item}</li>)}</ul>
       <h5>Dónde tocar, en orden</h5><ol>{recordingStart.actions.map(item=><li key={item}>{item}</li>)}</ol>
       <h5>Punto de partida para repetir</h5><p>{recordingStart.savedPoint}</p>
       <h5>Hasta dónde grabar</h5><p className="recording-start-fin">{recordingStart.finish}</p>
       <div className="recording-start-head"><h5>Prompt ya rellenado con el proyecto de ejemplo</h5><button className="recording-start-copy" type="button" onClick={()=>void copy(recordingStart.readyPrompt,'filled')}>{copied==='filled'?'Prompt copiado':'Copiar prompt completo'}</button></div>
       <p className="recording-ready-prompt">{recordingStart.readyPrompt}</p>
      </div>
      </details>
      <details className="class-extra class-start-details"><summary>Tu voz en toda la clase · Guía rápida</summary>
       <div className="recording-start-card">
        <p><b>Tu estilo:</b> español natural, una explicación a la vez y un ejemplo real en pantalla. Inspiración didáctica cercana, sin copiar la voz de otra creadora.</p>
        <ol><li>Empieza por una duda que el alumno reconozca.</li><li>Di qué vamos a hacer y por qué sirve.</li><li>Señala dónde tocar y muestra el cambio.</li><li>Prueba el botón o la sección antes de avanzar.</li><li>Cierra diciendo qué guardar y cuál es el próximo paso.</li></ol>
        <p>En Casa Brownie construimos desde cero en AppDeploy. El resultado de referencia siempre es la versión con <b>foto estática</b>; el video va solo en el bono.</p>
        <p><a href="https://github.com/thelaunchera/todavia-estoy-a-tiempo/blob/main/estudio-control/GUIA-DE-VOZ-CLASE-01.md" target="_blank" rel="noopener noreferrer">Abrir la guía editorial completa <ExternalLink size={13}/></a></p>
       </div>
      </details>
      <div className="class-scene-head">
       <div><h4>Guía para grabar sin leer</h4><p>Ideas breves para explicar mientras haces cada paso. El guion completo queda como apoyo opcional.</p></div>
       <div className="class-segment">
        <button type="button" onClick={()=>setMode('scene')} className={mode==='scene'?'active':''}>Una escena</button>
        <button type="button" onClick={()=>setMode('overview')} className={mode==='overview'?'active':''}>Guion completo</button>
       </div>
      </div>
      {mode==='scene' ? <div className="class-prompter" aria-live="polite">
       <div className="class-prompter-meta"><span>ESCENA {scene+1} DE {lesson.beats.length}</span><span>{lesson.beats[scene].label}</span></div>
       <div className="class-script-box">
        <span><Headphones size={15}/> VOZ NATURAL · PISTAS PARA EXPLICAR</span>
        <div className="class-voice-toggle" role="group" aria-label="Elegir guía de voz">
         <button type="button" className={voiceMode==='pistas'?'active':''} aria-pressed={voiceMode==='pistas'} onClick={()=>setVoiceMode('pistas')}>Pistas, sin leer</button>
         <button type="button" className={voiceMode==='texto'?'active':''} aria-pressed={voiceMode==='texto'} onClick={()=>setVoiceMode('texto')}>Texto de apoyo</button>
        </div>
        {voiceMode==='pistas'?<div className="class-voice-cues">
         <b>Escena: {lesson.beats[scene].label}</b>
         <ol>
          <li><strong>Qué problema resuelve:</strong> cuenta por qué este paso importa para Casa Brownie o para una web real.</li>
          <li><strong>Hazlo mientras hablas:</strong> {lesson.beats[scene].show}</li>
          <li><strong>Comprueba y cierra:</strong> muestra qué cambió y qué debe guardar el alumno.</li>
         </ol>
         <p>Una idea por toma. Puedes hablar con tus propias palabras, dejar silencios mientras tocas la pantalla y repetir solo una frase si te equivocas.</p>
        </div>:<><p>{lesson.beats[scene].say}</p><button type="button" onClick={()=>void copy(lesson.beats[scene].say,'say')}><Clipboard size={14}/>{copied==='say'?'Copiado':'Copiar texto de apoyo'}</button></>}
       </div>
       <div className="class-screen-box">
        <span><MonitorPlay size={16}/> QUÉ MOSTRAR EN PANTALLA</span>
        <p>{lesson.beats[scene].show}</p>
       </div>
       <div className="class-scene-nav">
        <button type="button" disabled={scene===0} onClick={()=>{setScene(scene-1);setCopied('');}}> Anterior</button>
        <span>{scene+1} / {lesson.beats.length}</span>
        <button type="button" disabled={scene===lesson.beats.length-1} onClick={()=>showInterlude(false)}>Siguiente con transición </button>
       </div>
      </div> : <div className="class-overview-beats">{lesson.beats.map((beat,i)=><article key={i}><h5>{i+1}. {beat.label}</h5><b>Qué decir</b><p>{beat.say}</p><b>Qué enseñar</b><p>{beat.show}</p></article>)}</div>}
      <div className="class-copy-row class-prompt-actions">
       <button type="button" onClick={()=>void copy(classRecordingScript(lesson),'script')}><Clipboard size={15}/>{copied==='script'?'Guion copiado':'Copiar guion completo'}</button>
       <button type="button" onClick={()=>void copy(recordingGuide,'guide')}><Clipboard size={15}/>{copied==='guide'?'Guía copiada':'Copiar guía de grabación'}</button>
      </div>
      <details className="class-extra class-prompt-details"><summary>Prompt y actividad para el alumno</summary><div className="class-prompt-section">
       <div className="class-section-heading"><h4>Prompt del módulo</h4><button type="button" onClick={()=>void copy(lesson.prompt,'prompt')}><Clipboard size={15}/>{copied==='prompt'?'Copiado':'Copiar prompt'}</button></div>
       <p>{lesson.prompt}</p>
       <div className="class-student-task"><Check size={17}/> <span><b>Resultado del alumno:</b> {lesson.exercise}</span></div>
      </div>
      </details>
      <div className="class-production-state">
       <div className="class-section-heading"><h4>Notas oficiales actualizadas · Capítulo {lesson.id}</h4><button type="button" onClick={()=>void copy(chapterNotes,'chapter-notes')}><Clipboard size={14}/>{copied==='chapter-notes'?'Notas copiadas':'Copiar notas'}</button></div>
       <p>Estas notas siguen el guion vigente y cambian con cada capítulo. Tus anotaciones personales se guardan aparte y no se sobrescriben.</p>
       <details className="class-extra class-start-details"><summary>Ver orden de escenas y pruebas del capítulo</summary>
        <div className="recording-start-card">
         <p><b>Resultado:</b> {lesson.outcome}</p>
         <ol>{lesson.beats.map((beat,i)=><li key={i}><b>{beat.label}:</b> {beat.show}</li>)}</ol>
         <p><b>Actividad de cierre:</b> {lesson.exercise}</p>
         <p><a href={CLASS_PLAN} target="_blank" rel="noopener noreferrer">Ver guía vigente de cuatro videos <ExternalLink size={13}/></a></p>
        </div>
       </details>
      </div>
      <div className="class-upload-status" role="region" aria-label="Grabación privada del capítulo">
        <div className="class-section-heading"><h4>Grabación del capítulo {lesson.id}</h4><span>Solo tú puedes verla</span></div>
        {record?.recording_path?
          <div className="class-upload-saved"><CheckCircle2 size={18}/><span>Archivo privado: <strong>{record.recording_name||'Grabación guardada'}</strong></span><button type="button" onClick={()=>void viewRecording(record.recording_path!)}>Revisar video</button></div>
          : <p>No has subido un video para este capítulo. Puedes grabarlo primero y añadirlo cuando esté listo.</p>}
        <button type="button" className="class-upload-main" disabled={!!uploadingId||!record} onClick={()=>startUpload(lesson.id)}><UploadCloud size={17}/>{uploadingId===lesson.id?'Subiendo '+uploadProgress+'%':record?.recording_path?'Cambiar grabación':'Subir video de este capítulo'}</button>
        {uploadingId&&<div className="class-upload-progress" aria-label={'Cargando capítulo '+uploadingId+' '+uploadProgress+'%'}><div style={{width:uploadProgress+'%'}}/></div>}
        <p className="class-upload-limit">MP4, MOV o WEBM · máximo 50 MB. Para grabaciones largas, sube el video a YouTube como <strong>No listado</strong> y pega el enlace abajo.</p>
        <p className="class-upload-notice" role="status">{uploadNotice}</p>
      </div>
      <div className="class-production-state">
       <div className="class-section-heading"><h4>Guarda tu avance</h4><span>No publica nada</span></div>
       <div className="class-form-grid">
        <label>Estado de la lección
         <select value={status} onChange={e=>setStatus(e.target.value)}>
           {classStatusOptions.map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
         </select>
        </label>
        <label>Enlace del video terminado (opcional)
         <input type="url" placeholder="https://youtu.be/... o enlace privado" value={url} onChange={e=>setUrl(e.target.value)}/>
        </label>
       </div>
       <label className="class-notes-label">Mis notas personales para repetir tomas o editar (no se sobrescriben)
        <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej.: repetir escena 2, acercar zoom, corregir pronunciación..."/>
       </label>
       <div className="class-save-line"><button className="class-save-button" disabled={saving||!record} type="button" onClick={()=>void save()}><Save size={17}/>{saving?'Guardando…':changed?'Guardar progreso':'Guardar / confirmar'}</button><small role="status">{notice || (changed?'Hay cambios sin guardar':'Progreso sincronizado con el Estudio al guardar.')}</small></div>
      </div>
      <footer className="class-footer">
       <span>Clase 01 · Producción privada · {classLessons.length} videos · {classTotalMinutes} minutos aprox.</span>
       <div>
        <a href={CLASS_STUDENT} target="_blank" rel="noreferrer">Paquete del alumno <ExternalLink size={13}/></a>
        {classLessons.findIndex(x=>x.id===lesson.id)<classLessons.length-1&&<button type="button" onClick={()=>choose(classLessons[classLessons.findIndex(x=>x.id===lesson.id)+1].id)}>Próximo video</button>}
       </div>
      </footer>
    </div>
  </div>
  </>}
  {interlude&&<ClassInterlude
   chapter={interlude.chapter} title={interlude.title} subtitle={interlude.subtitle}
   stepNumber={interlude.stepNumber} totalSteps={interlude.totalSteps}
   kind={interlude.kind} onComplete={completeInterlude} onCancel={()=>setInterlude(null)}
  />}
 </section>;
}
