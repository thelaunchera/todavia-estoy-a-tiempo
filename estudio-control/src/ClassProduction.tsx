import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clipboard, ExternalLink, BookOpen, Film, Headphones, Video, ShieldCheck, Save, MonitorPlay, ChevronDown, FileText } from 'lucide-react';
import { classLessons, classRecordingScript, classStatusOptions, classTotalMinutes, CLASS_DRIVE, CLASS_LAUNCH, CLASS_NOTION, CLASS_PLAN, CLASS_PROMPTS, CLASS_STUDENT, CLASS_SECTION } from './class-course';
import './class-production.css';

export type ClassEntry = {
  id: string; title: string; section?: string; subtitle?: string;
  status?: string; notes?: string; link?: string; performance_notes?: string;
};
type Props = {
  entries: ClassEntry[];
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

export default function ClassProduction({entries,launchStats,onSave}:Props) {
 const [lessonId,setLessonId]=useState('00');
 const [scene,setScene]=useState(0);
 const [mode,setMode]=useState<'scene'|'overview'>('scene');
 const [status,setStatus]=useState('pendiente');
 const [notes,setNotes]=useState('');
 const [url,setUrl]=useState('');
 const [checked,setChecked]=useState<number[]>([]);
 const [saving,setSaving]=useState(false);
 const [notice,setNotice]=useState('');
 const [copied,setCopied]=useState('');
 const lesson=useMemo(()=>classLessons.find(x=>x.id===lessonId)||classLessons[0],[lessonId]);
 const records=useMemo(()=>entries.filter(x=>x.section===CLASS_SECTION),[entries]);
 const record=records.find(x=>x.subtitle===lesson.id);
 const done=records.filter(x=>x.status==='aprobado').length;
 const recorded=records.filter(x=>x.status==='grabado'||x.status==='editando'||x.status==='aprobado').length;
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
 const recordingGuide='Antes de grabar: cierra notificaciones y cuentas privadas; abre solo las pestañas del módulo; pantalla horizontal 16:9 y zoom legible; graba cada escena por separado sin forzar una toma larga; captura clics reales; deja 2 segundos de aire al principio y al final; si te equivocas, repite esa escena, no todo el video; guarda el archivo con su número; después añade voz natural con ElevenLabs y revisa cada clic. El ejemplo de brownies infusionados es ficticio y no tiene cobros.';
 return <section className="class-room">
  <header className="class-intro">
    <div>
      <span className="class-overline"><Film size={15}/> TALLER · SALA PRIVADA DE PRODUCCIÓN</span>
      <h2>Tu primera landing <em>con IA.</em></h2>
      <p>Nueve grabaciones cortas. Un ejemplo en pantalla, guion por escenas y todo lo que necesitas mostrar, sin mezclar el estudio privado con lo que recibe el alumno.</p>
      <div className="class-intro-tags"><span>9 videos</span><span>{classTotalMinutes} min editados aprox.</span><span>Lanzamiento previsto: 3 dic 2026</span></div>
    </div>
    <div className="class-overview">
      <strong>{done}<small> / 9</small></strong>
      <span>Videos aprobados</span>
      <div className="class-progress-track" aria-label={done+' de 9 videos aprobados'}><div style={{width:(done/9*100)+'%'}}/></div>
      <small>{recorded} grabados o en edición</small>
    </div>
  </header>
  <div className="class-funnel-stats" aria-label="Primeras ventas y lista de espera">
    <div><strong>{launchStats?.waitlist ?? '—'}</strong><span>Correos confirmados de la clase</span></div>
    <div><strong>{launchStats?.buyers ?? '—'}</strong><span>Compras con acceso activo</span></div>
    <div><strong>Inactivo</strong><span>Checkout de la clase, pendiente de activar</span></div>
   </div>
   <div className="class-links">
    <a href={CLASS_NOTION} target="_blank" rel="noreferrer"><BookOpen size={16}/> Estudio privado de la clase <ExternalLink size={13}/></a>
    <a href={CLASS_PLAN} target="_blank" rel="noreferrer"><FileText size={16}/> Producción detallada <ExternalLink size={13}/></a>
    <a href="https://app.notion.com/p/407a68f2ee6e81f1b331eebd75b2e3d9?pvs=204" target="_blank" rel="noreferrer"><FileText size={16}/> Plan de primera venta <ExternalLink size={13}/></a>
    <a href={CLASS_DRIVE} target="_blank" rel="noreferrer"><FileText size={16}/> Materiales · Drive <ExternalLink size={13}/></a>
    <a href={CLASS_PROMPTS} target="_blank" rel="noreferrer"><Clipboard size={16}/> 12 prompts <ExternalLink size={13}/></a>
  </div>
  <div className="class-safety"><ShieldCheck size={19}/><span><b>Solo producción privada.</b> El alumno crea su propia landing. El ejemplo de brownies infusionados es un prototipo visual sin checkout, sin datos de clientes y sin cobros. Para enseñar pagos, utiliza un producto digital permitido en modo de prueba.</span></div>
  <div className="class-body">
    <aside className="class-module-list" aria-label="Elegir video">
      <p className="class-mini-heading">PLAN DE GRABACIÓN</p>
      {classLessons.map(item=>{
       const stage=safeStatus(records.find(x=>x.subtitle===item.id)?.status);
       return <button key={item.id} type="button" className={'class-module '+(item.id===lesson.id?'selected':'')} onClick={()=>choose(item.id)} aria-current={item.id===lesson.id?'step':undefined}>
        <span className="class-number">{item.id}</span>
        <span className="class-module-main"><b>{item.title}</b><small>{item.minutes} min aprox. · {stage}</small></span>
        {stage==='aprobado'?<CheckCircle2 size={17}/>:<ArrowRight size={16}/>}
       </button>;
      })}
    </aside>
    <div className="class-workspace">
      <div className="class-lesson-header">
       <span className="class-mini-heading">VIDEO {lesson.id} / 08 · META {lesson.minutes} MIN</span>
       <h3>{lesson.title}</h3>
       <p>{lesson.outcome}</p>
      </div>
      <div className="class-method">
       <div><span>01</span><b>Prepara</b><small>Abre las pestañas y materiales de este video.</small></div>
       <div><span>02</span><b>Graba la pantalla</b><small>Una escena cada vez, horizontal y sin notificaciones.</small></div>
       <div><span>03</span><b>Añade tu voz</b><small>Narra después con ElevenLabs, sin leer botones que no existen.</small></div>
       <div><span>04</span><b>Revisa y guarda</b><small>Guarda el enlace del video; no se publica automáticamente.</small></div>
      </div>
      <div className="class-prepare">
       <div className="class-section-heading"><h4>Antes de grabar</h4><span>{checked.length}/{lesson.prep.length} listos</span></div>
       {lesson.prep.map((step,i)=><label key={i} className="class-prep-row"><input type="checkbox" checked={checked.includes(i)} onChange={()=>togglePrep(i)}/><span>{step}</span></label>)}
       <div className="class-copy-row">
        <button type="button" onClick={()=>void copy(clipName(lesson.id),'file')}><Clipboard size={14}/> {copied==='file'?'Nombre copiado':'Copiar nombre del archivo'}</button>
        <code>{clipName(lesson.id)}</code>
       </div>
      </div>
      <div className="class-scene-head">
       <div><h4>Guion para grabar</h4><p>La frase que dices y la pantalla que enseñas, escena por escena.</p></div>
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
        <button type="button" disabled={scene===0} onClick={()=>{setScene(scene-1);setCopied('');}}><ArrowLeft size={17}/> Anterior</button>
        <span>{scene+1} / {lesson.beats.length}</span>
        <button type="button" disabled={scene===lesson.beats.length-1} onClick={()=>{setScene(scene+1);setCopied('');}}>Siguiente escena <ArrowRight size={17}/></button>
       </div>
      </div> : <div className="class-overview-beats">{lesson.beats.map((beat,i)=><article key={i}><h5>{i+1}. {beat.label}</h5><b>Qué decir</b><p>{beat.say}</p><b>Qué enseñar</b><p>{beat.show}</p></article>)}</div>}
      <div className="class-copy-row class-prompt-actions">
       <button type="button" onClick={()=>void copy(classRecordingScript(lesson),'script')}><Clipboard size={15}/>{copied==='script'?'Guion copiado':'Copiar guion completo'}</button>
       <button type="button" onClick={()=>void copy(recordingGuide,'guide')}><Clipboard size={15}/>{copied==='guide'?'Guía copiada':'Copiar guía de grabación'}</button>
      </div>
      <div className="class-prompt-section">
       <div className="class-section-heading"><h4>Prompt del módulo</h4><button type="button" onClick={()=>void copy(lesson.prompt,'prompt')}><Clipboard size={15}/>{copied==='prompt'?'Copiado':'Copiar prompt'}</button></div>
       <p>{lesson.prompt}</p>
       <div className="class-student-task"><Check size={17}/> <span><b>Resultado del alumno:</b> {lesson.exercise}</span></div>
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
       <label className="class-notes-label">Mis notas para repetir tomas o editar
        <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ej.: repetir escena 2, acercar zoom, corregir pronunciación..."/>
       </label>
       <div className="class-save-line"><button className="class-save-button" disabled={saving||!record} type="button" onClick={()=>void save()}><Save size={17}/>{saving?'Guardando…':changed?'Guardar progreso':'Guardar / confirmar'}</button><small role="status">{notice || (changed?'Hay cambios sin guardar':'Progreso sincronizado con el Estudio al guardar.')}</small></div>
      </div>
      <footer className="class-footer">
       <span>Clase 01 · Archivo de producción privado · 9 videos · {classTotalMinutes} minutos objetivo</span>
       <div>
        <a href={CLASS_STUDENT} target="_blank" rel="noreferrer">Paquete del alumno <ExternalLink size={13}/></a>
        {lesson.id!=='08'&&<button type="button" onClick={()=>choose(classLessons[Number(lesson.id)+1].id)}>Próximo video <ArrowRight size={16}/></button>}
       </div>
      </footer>
    </div>
  </div>
 </section>;
}
