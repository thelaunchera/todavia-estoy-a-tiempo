import React,{useEffect,useState} from 'react';
import {CalendarDays,Check,Clock3} from 'lucide-react';
import {contentKindLabel,localDate,validDate,validTime} from './CalendarPlannerModel';
import './ScheduleFromEditor.css';

type Props={
 format:string;date?:string;time?:string;locale:'es'|'en';
 onSchedule:(date:string,time:string)=>Promise<boolean>;
};
export default function ScheduleFromEditor({format,date,time,locale,onSchedule}:Props){
 const [open,setOpen]=useState(false);
 const [day,setDay]=useState(()=>validDate(date||'')?date!:localDate(new Date()));
 const [hour,setHour]=useState(()=>validTime(time||'')?time!:'09:00');
 const [saving,setSaving]=useState(false);
 useEffect(()=>{if(validDate(date||''))setDay(date!)},[date]);
 useEffect(()=>{if(validTime(time||''))setHour(time!)},[time]);
 const es=locale==='es';
 return <section className="lab-editor-calendar-action" aria-label={es?'Planificar publicación':'Plan a post'}>
   <button type="button" className="lab-editor-calendar-open" aria-expanded={open}
     onClick={()=>setOpen(value=>!value)}>
     <CalendarDays size={19}/>
     <span><strong>{es?'Añadir al calendario':'Add to calendar'}</strong>
     <small>{es?'Elige cuándo vas a publicar':'Choose when you plan to post'} · {contentKindLabel(format,locale)}</small></span>
   </button>
   {open&&<div className="lab-editor-calendar-fields">
     <label>{es?'Día de publicación':'Posting date'}
       <input type="date" value={day} onChange={e=>setDay(e.target.value)}/></label>
     <label>{es?'Hora':'Time'}
       <input type="time" value={hour} onChange={e=>setHour(e.target.value)}/></label>
     <button type="button" disabled={saving||!validDate(day)||!validTime(hour)}
       onClick={async()=>{
         setSaving(true);
         try{if(await onSchedule(day,hour))setOpen(false)}
         finally{setSaving(false)}
       }}><Check size={16}/>{saving?(es?'Guardando…':'Saving…'):(es?'Guardar y ver calendario':'Save and open calendar')}</button>
     <p><Clock3 size={13}/>{es?'Planificación privada. No publica automáticamente.':'Private planning only. Does not publish automatically.'}</p>
   </div>}
 </section>;
}
