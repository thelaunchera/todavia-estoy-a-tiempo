import {useMemo, useState} from 'react';
import {ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, Circle, Clock3, ExternalLink, LockKeyhole, ShieldCheck, Video} from 'lucide-react';
import {classLessons, CLASS_SECTION, CLASS_TASK_SECTION, CLASS_CHECKLIST} from './class-course';
import './class-weekly-plan.css';

/** Utiliza las tareas ya guardadas en el Estudio, nunca crea copias al renderizar. */
export type ClassWeeklyTask = {
 id:string; title:string; section?:string; status?:string; date?:string; summary?:string; notes?:string;
};
export type ClassLessonRecord = {
 id:string; section?:string; subtitle?:string; status?:string;
};
type Props = {
 tasks:ClassWeeklyTask[];
 lessons:ClassLessonRecord[];
 onToggle:(task:ClassWeeklyTask,next:'pendiente'|'completado')=>Promise<void>;
};

export const classWeeks=[
 {id:'w0',start:'2026-10-26',end:'2026-11-01',title:'Base y lista de espera',focus:'Comprobar la bienvenida antes de promocionar el registro.',phase:'PREPARACIÓN'},
 {id:'w1',start:'2026-11-02',end:'2026-11-08',title:'Ejemplo y primeros planos',focus:'Terminar el ejemplo visual y preparar las primeras grabaciones.',phase:'PRODUCCIÓN'},
 {id:'w2',start:'2026-11-09',end:'2026-11-15',title:'Primera mitad de los videos',focus:'Grabar 00–04 en sesiones cortas. Guardar avances en las fichas originales.',phase:'GRABACIÓN'},
 {id:'w3',start:'2026-11-16',end:'2026-11-22',title:'Segunda mitad de los videos',focus:'Grabar 05–08; pagos solo con un producto digital de prueba permitido.',phase:'GRABACIÓN'},
 {id:'w4',start:'2026-11-23',end:'2026-11-29',title:'Edición, materiales y pruebas',focus:'Aprobar los nueve videos, cerrar materiales y probar el aula antes de conectar ventas.',phase:'REVISIÓN'},
 {id:'w5',start:'2026-11-30',end:'2026-12-06',title:'Decisión de apertura',focus:'Solo comunicar y abrir compras cuando el recorrido completo tenga QA aprobado.',phase:'LANZAMIENTO'},
 {id:'w6',start:'2026-12-07',end:'2026-12-13',title:'Primer seguimiento',focus:'Revisar accesos, correos, primeras compras y dudas sin cambiar lo que ya funciona.',phase:'SEGUIMIENTO'}
] as const;

function currentWeekIndex(){
 const today=new Date().toLocaleDateString('sv-SE',{timeZone:'America/New_York'});
 const index=classWeeks.findIndex(w=>today>=w.start&&today<=w.end);
 if(index!==-1)return index;
 return today<classWeeks[0].start?0:classWeeks.length-1;
}
function shortDate(value:string){
 return new Date(value+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}
function taskVideoProgress(title:string,lessons:ClassLessonRecord[]){
 const isEarly=title.includes('00–04');
 const isLate=title.includes('05–08');
 const isAll=title.includes('nueve videos');
 if(!isEarly&&!isLate&&!isAll)return '';
 const selected=classLessons.filter(l=>isAll||Number(l.id)<=(isEarly?4:8)&&Number(l.id)>=(isEarly?0:5));
 const finished=selected.filter(l=>{
  const record=lessons.find(x=>x.section===CLASS_SECTION && x.subtitle===l.id);
  return isAll?record?.status==='aprobado':['grabado','editando','aprobado'].includes(record?.status||'');
 }).length;
 return finished+'/'+selected.length+' videos '+(isAll?'aprobados':'grabados');
}

export default function ClassWeeklyPlan({tasks,lessons,onToggle}:Props){
 const now=currentWeekIndex();
 const [selected,setSelected]=useState(now);
 const [busy,setBusy]=useState<string|null>(null);
 const [feedback,setFeedback]=useState('');
 const unique=useMemo(()=>{
  const visited=new Set<string>();
  return tasks.filter(t=>{
   if(t.section!==CLASS_TASK_SECTION)return false;
   const key=t.title.toLocaleLowerCase('es').trim().replace(/\s+/g,' ');
   if(visited.has(key))return false;
   visited.add(key);
   return true;
  });
 },[tasks]);
 const byWeek=classWeeks.map(w=>unique.filter(t=>Boolean(t.date)&&(t.date||'')>=w.start&&(t.date||'')<=w.end).sort((a,b)=>(a.date||'').localeCompare(b.date||'')));
 const allDone=unique.filter(t=>t.status==='completado').length;
 const approved=classLessons.filter(l=>lessons.some(x=>x.section===CLASS_SECTION&&x.subtitle===l.id&&x.status==='aprobado')).length;
 const selectedWeek=classWeeks[selected], selectedTasks=byWeek[selected];
 async function toggle(t:ClassWeeklyTask){
  if(busy)return;
  setBusy(t.id);setFeedback('');
  try {await onToggle(t,t.status==='completado'?'pendiente':'completado');}
  catch(e){setFeedback('No se pudo guardar. '+(e instanceof Error?e.message:'Vuelve a intentarlo.'));}
  finally{setBusy(null);}
 }
 return <section className="weekly-plan" aria-label="Plan semanal privado de la clase">
  <div className="weekly-plan-header">
   <div>
    <span className="weekly-plan-eyebrow"><CalendarDays size={15}/> TU PLAN SEMANAL · SOLO ESTUDIO</span>
    <h3>Una semana a la vez.</h3>
    <p>Las mismas tareas que ya tienes guardadas, ahora ordenadas por fechas. Marca cada una cuando esté terminada: se sincroniza con el Estudio. Las fichas de los nueve videos siguen siendo el registro de sus grabaciones.</p>
   </div>
   <div className="weekly-plan-totals" aria-label="Progreso del plan">
    <strong>{allDone}<span> / {unique.length}</span></strong>
    <small>tareas completadas</small>
    <div className="weekly-plan-meter"><span style={{width:unique.length?(allDone/unique.length*100)+'%':'0%'}}/></div>
    <small>{approved}/9 videos aprobados</small>
   </div>
  </div>
  <div className="weekly-plan-weeks" aria-label="Elegir semana">
   {classWeeks.map((w,i)=>{
    const done=byWeek[i].filter(t=>t.status==='completado').length;
    const total=byWeek[i].length;
    return <button type="button" key={w.id} className={'weekly-plan-week'+(selected===i?' selected':'')+(now===i?' current':'')} onClick={()=>{setSelected(i);setFeedback('');}} aria-pressed={selected===i}>
     <span className="weekly-plan-week-top">{'SEMANA '+(i+1)} {now===i&&<em>ACTUAL</em>}</span>
     <b>{shortDate(w.start)} — {shortDate(w.end)}</b>
     <small>{w.title}</small>
     <span className="weekly-plan-week-foot">{total?done+' / '+total+' tareas':'Sin tareas duplicadas'}{total>0&&done===total&&<CheckCircle2 size={15}/>}</span>
    </button>;
   })}
  </div>
  <div className="weekly-plan-detail">
   <div className="weekly-plan-detail-head">
    <div>
     <span>{selectedWeek.phase} · {shortDate(selectedWeek.start)} – {shortDate(selectedWeek.end)}</span>
     <h4>{selectedWeek.title}</h4>
     <p>{selectedWeek.focus}</p>
    </div>
    {selected===now&&<span className="weekly-plan-now"><Clock3 size={15}/> En esta semana</span>}
   </div>
   {selectedWeek.id==='w5'&&<div className="weekly-plan-gate"><LockKeyhole size={17}/> <span><b>Activación bloqueada hasta el QA.</b> Completar casillas no publica el checkout ni activa Make; la apertura se decide y ejecuta aparte.</span></div>}
   {selectedTasks.length>0?<div className="weekly-plan-list">
    {selectedTasks.map(t=>{
     const done=t.status==='completado';
     const video=taskVideoProgress(t.title,lessons);
     return <article className={'weekly-plan-item'+(done?' is-done':'')} key={t.id}>
      <button type="button" disabled={busy!==null} onClick={()=>void toggle(t)} className="weekly-plan-check" aria-label={(done?'Reabrir tarea: ':'Marcar completada: ')+t.title} aria-pressed={done}>{busy===t.id?<Clock3 size={18}/>:done?<Check size={18}/>:<Circle size={18}/>}</button>
      <div className="weekly-plan-item-main">
       <div className="weekly-plan-item-row"><strong>{t.title.replace(/^CLASE 01 · /,'')}</strong><span>{t.date?shortDate(t.date):'Sin fecha'}</span></div>
       {t.summary&&<p>{t.summary}</p>}
       {video&&<small className="weekly-plan-video"><Video size={13}/>{video} · <a href="#class-filming-workspace">Abrir fichas <ArrowRight size={12}/></a></small>}
       <small className="weekly-plan-item-state">{done?'Completado y guardado':t.status==='en curso'?'En curso':'Pendiente'}</small>
      </div>
     </article>;
    })}
   </div>:<p className="weekly-plan-empty">Esta semana no tiene tareas nuevas. Revisa las fichas de grabación y no adelantes la apertura sin tener todo aprobado.</p>}
   <div className="weekly-plan-actions">
    <button type="button" disabled={selected===0} onClick={()=>setSelected(v=>Math.max(0,v-1))}>Semana anterior</button>
    <button type="button" disabled={selected===classWeeks.length-1} onClick={()=>setSelected(v=>Math.min(classWeeks.length-1,v+1))}>Siguiente semana <ArrowRight size={15}/></button>
   </div>
   {feedback&&<p className="weekly-plan-error" role="alert">{feedback}</p>}
  </div>
  <footer className="weekly-plan-footer">
   <span><ShieldCheck size={15}/> Un único seguimiento: sin crear copias en Tareas o en las fichas de video.</span>
   <a href={CLASS_CHECKLIST} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/> Documentación completa <ExternalLink size={13}/></a>
  </footer>
 </section>;
}
