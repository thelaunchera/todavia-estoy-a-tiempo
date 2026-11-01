import { useEffect, useMemo, useState } from 'react';
import ClassWeeklyPlan, {type ClassWeeklyTask} from './ClassWeeklyPlan';
import ConnectorsLesson from './ConnectorsLesson';
import CasaBrownieStudioKit,{CASA_BROWNIE_KIT_SECTION,type CasaBrownieKitEntry} from './CasaBrownieStudioKit';
import {recordingStarts, RECORDING_EXAMPLE} from './recording-starts';
import { Check, CheckCircle2, Clipboard, ExternalLink, BookOpen, Film, Headphones, Video, ShieldCheck, Save, MonitorPlay, ChevronDown, FileText } from 'lucide-react';
import { classLessons, classRecordingScript, classStatusOptions, classTotalMinutes, CLASS_DRIVE, CLASS_LAUNCH, CLASS_NOTION, CLASS_PLAN, CLASS_PROMPTS, CLASS_STUDENT, CLASS_SECTION } from './class-course';
import './class-production.css';

export type ClassEntry = {
  id: string; title: string; section?: string; subtitle?: string;
  status?: string; notes?: string; link?: string; performance_notes?: string;
};
type Props = {
  entries: ClassEntry[];
  tasks: ClassWeeklyTask[];
  onTaskToggle: (task:ClassWeeklyTask,next:'pendiente'|'completado')=>Promise<void>;
  launchStats?: {waitlist:number; buyers:number}|null;
  onSave: (item: ClassEntry, fields: Pick<ClassEntry,'status'|'notes'|'link'|'performance_notes'>) => Promise<void>;
};
function validVideoLink(value: string): boolean {
  if (!value.trim()) return true;
  try { const url=new URL(value); return url.protocol==='https:' && !url.username && !url.password; } catch { return false; }
}
function safeStatus(value?:string) {
  return classStatusOptions.includes(value as typeof classStatusOptions[number]) ? value! : 'pendiente';
}
function clipName(lessonId: string) { return 'CLASE01_'+lessonId+'_PANTALLA.mp4'; }

export default function ClassProduction({entries,tasks,onTaskToggle,launchStats,onSave}:Props) {
 const [lessonId,setLessonId]=useState('00');
 const [area,setArea]=useState<'grabar'|'recursos'|'plan'>('grabar');
 const [scene,setScene]=useState(0);
 const [mode,setMode]=useState<'scene'|'overview'>('scene');
 const [status,setStatus]=useState('pendiente');
 const [notes,setNotes]=useState('');
 const [url,setUrl]=useState('');
 const [checked,setChecked]=useState<number[]>([]);
 const [saving,setSaving]=useState(false);
 const [notice,setNotice]=useState('');
 const [copied,setCopied]=useState('');
 const [showAdminRoom,setShowAdminRoom]=useState(false);
 const lesson=useMemo(()=>classLessons.find(x=>x.id===lessonId)||classLessons[0],[lessonId]);
 const recordingStart=recordingStarts[lesson.id];
 const records=useMemo(()=>entries.filter(x=>x.section===CLASS_SECTION),[entries]);
 const visualKit=entries.find(x=>x.section===CASA_BROWNIE_KIT_SECTION) as CasaBrownieKitEntry|undefined;
 const record=records.find(x=>x.subtitle===lesson.id);
 const done=records.filter(x=>x.status==='aprobado').length;
 const recorded=records.filter(x=>x.status==='grabado'||x.status==='editando'||x.status==='aprobado').length;
 // El reel de la clase requiere material real, no la bienvenida (00), que se graba al final.
 const classFootage=records.filter(x=>x.subtitle!=='00' && ['grabado','editando','aprobado'].includes(x.status||''));
 const hasClassFootage=classFootage.length>0;
 const originalStatus=safeStatus(record?.status);
 const originalChecked=(record?.performance_notes||'').split(',').filter(Boolean).map(x=>Number(x)).filter(n=>Number.isInteger(n)&&n>=0&&n<lesson.prep.length);
 const changed=status!==originalStatus || notes!==(record?.notes||'') || url!==(record?.link||'') || JSON.stringify([...checked].sort())!==JSON.stringify([...originalChecked].sort());
 useEffect(()=>{
   setStatus(safeStatus(record?.status));setNotes(record?.notes||'');setUrl(record?.link||'');
   setChecked((record?.performance_notes||'').split(',').filter(Boolean).map(x=>Number(x)).filter(n=>Number.isInteger(n)&&n>=0&&n<lesson.prep.length));
   setNotice('');setScene(0);setCopied('');
 },[lessonId,record?.id]);
 function choose(id:string){
   if(changed && !window.confirm('Tienes cambios sin guardar. ¿Cambiar de video y descartarlos?')) return;
   setLessonId(id);setMode('scene');
 }
 async function copy(text:string, key:string) {
   try { await navigator.clipboard.writeText(text);setCopied(key); }
   catch {setNotice('No se pudo copiar automáticamente. Selecciona el texto en pantalla para copiarlo.');}
 }
 async function save() {
   if(!record){setNotice('No se encontró la ficha privada de este video. Actualiza el Estudio y prueba otra vez.');return;}
   if(!validVideoLink(url)){setNotice('El enlace de video debe comenzar con https://; puedes dejarlo vacío hasta grabar.');return;}
   setSaving(true);setNotice('');
   try {
     await onSave(record,{status,notes,link:url.trim(),performance_notes:[...checked].sort((a,b)=>a-b).join(',')});
     setNotice('Progreso guardado en tu Estudio privado.');
   } catch(e) {setNotice(e instanceof Error?e.message:'No se pudo guardar.');}
   finally{setSaving(false);}
 }
 function togglePrep(i:number) {setChecked(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);}
 const recordingGuide='Antes de grabar: cierra notificaciones y cuentas privadas; abre solo las pestañas del módulo; captura desde el teléfono con texto legible; conserva el formato nativo y usa 16:9 solo para montaje cuando no reduzca la lectura; graba cada escena por separado sin forzar una toma larga; captura clics reales; deja 2 segundos de aire al principio y al final; si te equivocas, repite esa escena, no todo el video; guarda el archivo con su número; después añade tu narración natural y revisa cada clic; valida primero una muestra de voz de 60–90 segundos. El ejemplo de brownies tradicionales es ficticio y no tiene cobros.';
 return <section className="class-room">
  <header className="class-intro">
    <div>
      <span className="class-overline"><Film size={15}/> TALLER · SALA PRIVADA DE PRODUCCIÓN</span>
      <h2>Tu primera web <em>con IA.</em></h2>
      <p>Aquí grabas una lección a la vez, con el guion y los clics a mano. Los demos terminados, materiales y tareas de lanzamiento tienen su propio espacio.</p>
      <div className="class-intro-tags"><span>9 videos</span><span>{classTotalMinutes} min editados aprox.</span><span>Lanzamiento previsto: 3 dic 2026</span></div>
    </div>
    <div className="class-overview">
      <strong>{done}<small> / 9</small></strong>
      <span>Videos aprobados</span>
      <div className="class-progress-track" aria-label={done+' de 9 videos aprobados'}><div style={{width:(done/9*100)+'%'}}/></div>
      <small>{recorded} grabados o en edición</small>
    </div>
  </header>
  <nav className="class-area-nav" aria-label="Organización de la clase">
    <button type="button" className={area==='grabar'?'active':''} aria-current={area==='grabar'?'page':undefined} onClick={()=>setArea('grabar')}><Video size={16}/> 1. Grabar clase</button>
    <button type="button" className={area==='recursos'?'active':''} aria-current={area==='recursos'?'page':undefined} onClick={()=>setArea('recursos')}><BookOpen size={16}/> 2. Materiales y referencia</button>
    <button type="button" className={area==='plan'?'active':''} aria-current={area==='plan'?'page':undefined} onClick={()=>setArea('plan')}><Check size={16}/> 3. Plan y lanzamiento</button>
  </nav>
  {area==='plan'&&<div className="class-plan-panel">
  <div className="class-funnel-stats" aria-label="Primeras ventas y lista de espera">
    <div><strong>{launchStats?.waitlist ?? '—'}</strong><span>Correos confirmados de la clase</span></div>
    <div><strong>{launchStats?.buyers ?? '—'}</strong><span>Compras con acceso activo</span></div>
    <div><strong>Inactivo</strong><span>Checkout de la clase, pendiente de activar</span></div>
   </div>
   <ClassWeeklyPlan tasks={tasks} lessons={entries} onToggle={onTaskToggle}/>
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
      <a href="../alumnos/?vista=admin" target="_blank" rel="noopener noreferrer">Abrir pantalla completa <ExternalLink size={15}/></a>
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
    <p><b>Orden de grabación:</b> prueba de pantalla y voz de 60–90 segundos; lecciones 01–04; construcción 05A/05B; correcciones 06; prueba independiente Stripe + Make + Gmail 07; cierre 08; bienvenida 00 al final.</p>
    <p><b>Antes de cada toma:</b> abre archivos y URLs reales, guarda el punto inicial y muestra un resultado al terminar. En 03 demuestra una foto y repite el método con los demás sabores; en 06 conserva dos errores auténticos con su antes/después. Registra el ensayo y su resultado en las notas de la ficha, sin marcarlo probado antes de hacerlo.</p>
    <p><b>Cierre del alumno:</b> compartir URL, capturas y una pregunta en Proyectos del Club de Ideas; dudas técnicas en Ayuda. La revisión y la entrega del bono se comprueban antes de filmar el cierre, sin prometer plazos ni revisiones ilimitadas. Checkout y permisos siguen cerrados hasta QA.</p></div>
   </section>
   <section className="class-start-here" aria-label="Punto de partida de grabación">
    <div className="class-start-here-copy"><span className="class-mini-heading">TU PUNTO DE PARTIDA · SOLO GRABACIÓN</span><h3>Casa Brownie · comienza desde cero.</h3><p>Esta es la app limpia para mostrar cada paso en pantalla. No abras el demo terminado para grabar la construcción; úsalo solo como referencia del resultado.</p></div>
    <div className="class-start-here-actions"><a className="class-primary-link" href="https://casa-brownie-taller-desde-cero-b37dq5.v2.appdeploy.ai/" target="_blank" rel="noopener noreferrer">Abrir AppDeploy desde cero <ExternalLink size={15}/></a><a href="https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video" target="_blank" rel="noopener noreferrer">Ver resultado sin video <ExternalLink size={14}/></a></div>
   </section>
  <div id="class-filming-workspace" className="class-body">
    <aside className="class-module-list" aria-label="Elegir video">
      <p className="class-mini-heading">PLAN DE GRABACIÓN</p>
      {classLessons.map(item=>{
       const stage=safeStatus(records.find(x=>x.subtitle===item.id)?.status);
       return <button key={item.id} type="button" className={'class-module '+(item.id===lesson.id?'selected':'')} onClick={()=>choose(item.id)} aria-current={item.id===lesson.id?'step':undefined}>
        <span className="class-number">{item.id}</span>
        <span className="class-module-main"><b>{item.title}</b><small>{item.minutes} min aprox. · {stage}</small></span>
        {stage==='aprobado'&&<CheckCircle2 size={17}/>}
       </button>;
      })}
    </aside>
    <div className="class-workspace">
      <div className="class-lesson-header">
       <span className="class-mini-heading">VIDEO {Number(lesson.id)+1} / {classLessons.length} · META {lesson.minutes} MIN</span>
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
        <p><b>Tu estilo:</b> español latino natural, una explicación a la vez y un ejemplo real en pantalla. Inspiración didáctica cercana, sin copiar la voz de otra creadora.</p>
        <ol><li>Empieza por una duda que el alumno reconozca.</li><li>Di qué vamos a hacer y por qué sirve.</li><li>Señala dónde tocar y muestra el cambio.</li><li>Prueba el botón o la sección antes de avanzar.</li><li>Cierra diciendo qué guardar y cuál es el próximo paso.</li></ol>
        <p>En Casa Brownie construimos desde cero en AppDeploy. El resultado de referencia siempre es la versión con <b>foto estática</b>; el video va solo en el bono.</p>
        <p><a href="https://github.com/thelaunchera/todavia-estoy-a-tiempo/blob/main/estudio-control/GUIA-DE-VOZ-CLASE-01.md" target="_blank" rel="noopener noreferrer">Abrir la guía editorial completa <ExternalLink size={13}/></a></p>
       </div>
      </details>
      <div className="class-scene-head">
       <div><h4>Guion para grabar</h4><p>Qué dices, dónde tocas y cómo comprobarlo, escena por escena, con una sola voz de principio a fin.</p></div>
       <div className="class-segment">
        <button type="button" onClick={()=>setMode('scene')} className={mode==='scene'?'active':''}>Una escena</button>
        <button type="button" onClick={()=>setMode('overview')} className={mode==='overview'?'active':''}>Guion completo</button>
       </div>
      </div>
      {mode==='scene' ? <div className="class-prompter" aria-live="polite">
       <div className="class-prompter-meta"><span>ESCENA {scene+1} DE {lesson.beats.length}</span><span>{lesson.beats[scene].label}</span></div>
       <div className="class-script-box">
        <span><Headphones size={15}/> QUÉ DECIR · VOZ NATURAL</span>
        <p>{lesson.beats[scene].say}</p>
        <button type="button" onClick={()=>void copy(lesson.beats[scene].say,'say')}><Clipboard size={14}/>{copied==='say'?'Copiado':'Copiar esta frase'}</button>
       </div>
       <div className="class-screen-box">
        <span><MonitorPlay size={16}/> QUÉ MOSTRAR EN PANTALLA</span>
        <p>{lesson.beats[scene].show}</p>
       </div>
       <div className="class-scene-nav">
        <button type="button" disabled={scene===0} onClick={()=>{setScene(scene-1);setCopied('');}}> Anterior</button>
        <span>{scene+1} / {lesson.beats.length}</span>
        <button type="button" disabled={scene===lesson.beats.length-1} onClick={()=>{setScene(scene+1);setCopied('');}}>Siguiente escena </button>
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
       <label className="class-notes-label">Mis notas para repetir tomas o editar
        <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej.: repetir escena 2, acercar zoom, corregir pronunciación..."/>
       </label>
       <div className="class-save-line"><button className="class-save-button" disabled={saving||!record} type="button" onClick={()=>void save()}><Save size={17}/>{saving?'Guardando…':changed?'Guardar progreso':'Guardar / confirmar'}</button><small role="status">{notice || (changed?'Hay cambios sin guardar':'Progreso sincronizado con el Estudio al guardar.')}</small></div>
      </div>
      <footer className="class-footer">
       <span>Clase 01 · Archivo de producción privado · 9 videos · {classTotalMinutes} minutos objetivo</span>
       <div>
        <a href={CLASS_STUDENT} target="_blank" rel="noreferrer">Paquete del alumno <ExternalLink size={13}/></a>
        {lesson.id!=='08'&&<button type="button" onClick={()=>choose(classLessons[Number(lesson.id)+1].id)}>Próximo video </button>}
       </div>
      </footer>
    </div>
  </div>
  </>}
 </section>;
}
