import React,{useEffect,useMemo,useState} from 'react';
import {api} from './platform/client';
import {ArrowLeft,ArrowRight,CalendarDays,Check,Clock3,ImageIcon,LayoutGrid,Plus,Save} from 'lucide-react';
import {localDate,monthCells,plannedItems,validDate,validTime,type CalendarGrid,type CalendarPost,type PlannedItem} from './CalendarPlannerModel';
import './ContentCalendar.css';

type Props={
 brand:{id:string;name:string};posts:CalendarPost[];images:Record<string,string>;
 onPostSaved:(post:CalendarPost)=>void;loadImage:(id:string)=>void;
 onNewPost:()=>void;onOpenGrid:()=>void;locale:'es'|'en';
 notify:(value:string)=>void;showError:(error:unknown)=>void;
};
const labels={
 es:{name:'Calendario editorial',description:'Organiza tus publicaciones por día y hora, y revisa cómo quedará tu feed.',
 calendar:'Mes',feed:'Vista del feed',new:'Nueva publicación',month:'Mes actual',schedule:'Planificar una publicación',
 select:'Elige un post o una idea de 1 Photo → 9 Posts',date:'Día',time:'Hora',save:'Guardar planificación',
 unschedule:'Quitar del calendario',planned:'Planificado',published:'Publicado',empty:'No tienes publicaciones para esta fecha.',
 none:'Todavía no hay publicaciones guardadas. Crea una o prepara tu campaña de nueve posts.',
 note:'Este calendario es tu planificador privado: no publica automáticamente en Instagram ni en otras redes.',
 zone:'Las horas se muestran según la zona horaria de este dispositivo.',pick:'Selecciona una publicación',
 picture:'Sin foto final',ready:'Con imagen',stats:'Publicaciones este mes',grid:'Crear 9 posts',
 mark:'Marcar como publicado',unmark:'Marcar como pendiente',hint:'El feed es una vista previa: ordenado de la publicación más reciente a la más antigua.',
 day:'Publicaciones del día',noFeed:'Programa tus primeras publicaciones para visualizar el feed.',next:'Mes siguiente',prev:'Mes anterior'},
 en:{name:'Content calendar',description:'Plan posts by day and time, and preview your Instagram-style feed.',
 calendar:'Month',feed:'Feed preview',new:'New post',month:'Current month',schedule:'Schedule a post',
 select:'Choose a post or a 1 Photo → 9 Posts idea',date:'Date',time:'Time',save:'Save plan',
 unschedule:'Remove from calendar',planned:'Planned',published:'Published',empty:'No posts for this date.',
 none:'No saved content yet. Create a post or start a nine-post campaign.',
 note:'This calendar is a private planner: it does not automatically publish to Instagram or other networks.',
 zone:'Times use this device’s time zone.',pick:'Choose a post',picture:'No final photo',ready:'With image',
 stats:'Posts this month',grid:'Create 9 posts',mark:'Mark published',unmark:'Mark pending',
 hint:'Feed preview shows newest scheduled posts first.',day:'Posts on this date',
 noFeed:'Schedule some posts to preview your feed.',next:'Next month',prev:'Previous month'}
};
const weekdays:{es:string[];en:string[]}={es:['L','M','X','J','V','S','D'],en:['M','T','W','T','F','S','S']};
const dateLabel=(d:string,language:'es'|'en')=>{
 if(!validDate(d))return d;
 const [year,month,day]=d.split('-').map(Number);
 return new Intl.DateTimeFormat(language==='es'?'es-US':'en-US',{day:'numeric',month:'short',year:'numeric'}).format(new Date(year,month-1,day));
};
export default function ContentCalendar({brand,posts,images,onPostSaved,loadImage,onNewPost,onOpenGrid,locale,notify,showError}:Props){
 const lang=labels[locale],today=useMemo(()=>new Date(),[]);
 const [month,setMonth]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1));
 const [selectedDay,setSelectedDay]=useState(()=>localDate(today));
 const [view,setView]=useState<'month'|'feed'>('month');
 const [grids,setGrids]=useState<CalendarGrid[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [key,setKey]=useState(''),[date,setDate]=useState(()=>localDate(today)),[time,setTime]=useState('09:00');
 const [loadError,setLoadError]=useState('');
 useEffect(()=>{
  let mounted=true;
  setGrids([]);setKey('');setLoading(true);setLoadError('');
  void api.get('/api/grids').then(({data})=>{if(mounted)setGrids((data.grids||[]) as CalendarGrid[])}).catch(e=>{
   if(mounted){setLoadError(locale==='es'?'No se pudieron cargar las campañas.':'Unable to load campaigns.');showError(e)}
  }).finally(()=>{if(mounted)setLoading(false)});
  return()=>{mounted=false};
 },[brand.id]);
 const options=useMemo(()=>[
  ...posts.filter(p=>p.brandId===brand.id&&p.id).map(p=>({
   key:'post:'+p.id!,title:p.title||p.hook||'Post',date:p.date||'',time:p.time||'09:00'
  })),
  ...grids.filter(g=>g.brandId===brand.id).flatMap(g=>g.posts.map((p,i)=>({
   key:'grid:'+g.id+':'+i,title:(p.headline||g.title)+' · '+(i+1)+' / '+g.posts.length,
   date:p.scheduledDate||'',time:p.scheduledTime||'09:00'
  })))
 ],[posts,grids,brand.id]);
 const events=useMemo(()=>plannedItems(posts,grids,brand.id),[posts,grids,brand.id]);
 const selectedEvents=events.filter(item=>item.date===selectedDay);
 const monthKey=localDate(month).slice(0,7),current=events.filter(x=>x.date.startsWith(monthKey));
 const cells=useMemo(()=>monthCells(month.getFullYear(),month.getMonth()),[month]);
 const formatMonth=new Intl.DateTimeFormat(locale==='es'?'es-US':'en-US',{month:'long',year:'numeric'}).format(month);
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local';
 const choose=(id:string)=>{
  setKey(id);const chosen=options.find(x=>x.key===id);
  if(chosen){setDate(validDate(chosen.date)?chosen.date:selectedDay);setTime(validTime(chosen.time)?chosen.time:'09:00');}
 };
 const pickDay=(d:string)=>{setSelectedDay(d);setDate(d);setKey('');};
 const shift=(n:number)=>{const next=new Date(month.getFullYear(),month.getMonth()+n,1);setMonth(next);pickDay(localDate(next));};
 const saveSchedule=async(remove=false,status?:'planned'|'published')=>{
  if(!key)return notify(lang.pick);
  const targetDate=remove?'':date,targetTime=remove?'':time;
  if(!remove&&(!validDate(date)||!validTime(time)))return notify(locale==='es'?'Selecciona una fecha y hora válidas.':'Choose a valid date and time.');
  setSaving(true);
  try{
   if(key.startsWith('post:')){
    const id=key.slice(5),item=posts.find(p=>p.brandId===brand.id&&p.id===id);
    if(!item)throw Error('Publicación no encontrada');
    const update={...item,date:targetDate,time:targetTime,
     planningStatus:status||(item.planningStatus==='published'?'published':'planned')};
    const {data}=await api.put('/api/posts/'+id,update);onPostSaved(data as CalendarPost);
   }else{
    const match=/^grid:([^:]+):(\d+)$/.exec(key);
    if(!match)throw Error('Publicación no encontrada');
    const gid=match[1],index=Number(match[2]),g=grids.find(x=>x.id===gid&&x.brandId===brand.id);
    if(!g||!g.posts[index])throw Error('Esta campaña no está disponible');
    const updated=g.posts.map((p,i)=>i===index?{...p,scheduledDate:targetDate,scheduledTime:targetTime,
      planningStatus:status||(p.planningStatus==='published'?'published':'planned')}:p);
    const {data}=await api.put('/api/grids/'+gid,{posts:updated});
    setGrids(prev=>prev.map(x=>x.id===gid?{...x,...data,posts:updated}:x));
   }
   if(remove){setKey('');notify(locale==='es'?'Retirado del calendario.':'Removed from calendar.');}
   else{setSelectedDay(targetDate);setMonth(new Date(Number(targetDate.slice(0,4)),Number(targetDate.slice(5,7))-1,1));
    notify(locale==='es'?'Fecha y hora guardadas. No se publicará automáticamente.':'Date and time saved. It will not auto-publish.');}
  }catch(e){showError(e)}finally{setSaving(false)}
 };
 const chosen=options.find(p=>p.key===key);
 const currentEvent=events.find(p=>p.id===key);
 const loadIds=useMemo(()=>[...new Set(events.filter(p=>p.assetId).map(p=>p.assetId))].filter(id=>!images[id]).slice(0,16),[events,images]);
 useEffect(()=>{for(const id of loadIds)loadImage(id)},[loadIds.join('|')]);
 const feed=current.slice().sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time));
 return <div className="lab-calendar">
  <div className="lab-calendar-heading">
   <div><div className="eyebrow">{locale==='es'?'PLANIFICADOR DE CONTENIDO':'CONTENT PLANNER'}</div>
    <h1>{lang.name}</h1><p>{lang.description}</p></div>
   <button className="btn dark" type="button" onClick={onNewPost}><Plus size={17}/>{lang.new}</button>
  </div>
  <div className="lab-calendar-disclaimer" role="note"><CalendarDays size={19}/><span><strong>{lang.note}</strong> {lang.zone} ({zone}).</span></div>
  <div className="lab-calendar-toolbar">
   <div className="lab-calendar-view-switch" role="group" aria-label={locale==='es'?'Vista del planificador':'Planner view'}>
    <button type="button" className={view==='month'?'active':''} aria-pressed={view==='month'} onClick={()=>setView('month')}><CalendarDays size={17}/>{lang.calendar}</button>
    <button type="button" className={view==='feed'?'active':''} aria-pressed={view==='feed'} onClick={()=>setView('feed')}><LayoutGrid size={17}/>{lang.feed}</button>
   </div>
   <div className="lab-calendar-month-nav">
    <button type="button" aria-label={lang.prev} onClick={()=>shift(-1)}><ArrowLeft size={19}/></button>
    <strong>{formatMonth}</strong>
    <button type="button" aria-label={lang.next} onClick={()=>shift(1)}><ArrowRight size={19}/></button>
   </div>
   <button type="button" className="lab-calendar-today" onClick={()=>{
    const now=new Date();setMonth(new Date(now.getFullYear(),now.getMonth(),1));pickDay(localDate(now));
   }}>{lang.month}</button>
  </div>
  {loading?<p className="lab-calendar-loading">{locale==='es'?'Cargando tus publicaciones…':'Loading your posts…'}</p>:<>
   {loadError&&<p role="alert" className="lab-calendar-error">{loadError}</p>}
   {view==='month'?<div className="lab-calendar-body">
    <section className="lab-calendar-month" aria-label={formatMonth}>
     <div className="lab-calendar-weekdays">{weekdays[locale].map((w,i)=><span key={i}>{w}</span>)}</div>
     <div className="lab-calendar-days">
      {cells.map((d,i)=>d?<button key={d} type="button"
        aria-label={dateLabel(d,locale)+' · '+events.filter(p=>p.date===d).length+' posts'}
        aria-pressed={selectedDay===d}
        className={'lab-calendar-day '+(selectedDay===d?'selected ':'')+(d===localDate(today)?'today':'')}
        onClick={()=>pickDay(d)}>
        <span className="lab-calendar-day-number">{Number(d.slice(-2))}</span>
        <span className="lab-calendar-day-events">{events.filter(p=>p.date===d).slice(0,2).map(p=>
         <span className={'lab-calendar-pill '+(p.status==='published'?'published':'')} key={p.id}>
          <Clock3 size={10}/>{p.time} <span>{p.title}</span></span>)}
        </span>
        {events.filter(p=>p.date===d).length>2&&<small className="lab-calendar-more">+{events.filter(p=>p.date===d).length-2}</small>}
       </button>:<div aria-hidden="true" className="lab-calendar-blank" key={'blank-'+i}/>)}
     </div>
    </section>
    <section className="lab-calendar-agenda">
     <div className="lab-calendar-panel-heading"><div><span className="eyebrow">{lang.day}</span>
      <h2>{dateLabel(selectedDay,locale)}</h2></div><strong>{selectedEvents.length}</strong></div>
     {selectedEvents.length?selectedEvents.map(p=><button type="button" className={'lab-calendar-agenda-post '+(key===p.id?'active':'')}
      key={p.id} onClick={()=>choose(p.id)}>
      {p.assetId&&images[p.assetId]?<img src={images[p.assetId]} alt=""/>:<span className="lab-calendar-noimage"><ImageIcon size={19}/></span>}
      <span><strong>{p.title}</strong><small><Clock3 size={13}/>{p.time} · {p.format}</small></span>
      <span className={'lab-calendar-state '+p.status}>{p.status==='published'?lang.published:lang.planned}</span>
     </button>):<p className="lab-calendar-empty-day">{lang.empty}</p>}
     <div className="lab-calendar-day-add"><Plus size={15}/>{locale==='es'?'Elige un post abajo para asignarlo a este día.':'Choose a post below to assign it to this date.'}</div>
    </section>
   </div>:<section className="lab-calendar-feedview">
     <div className="lab-calendar-feedhead"><div><h2>{lang.feed}</h2><p>{lang.hint}</p></div><span>{current.length} {lang.stats.toLowerCase()}</span></div>
     {feed.length?<div className="lab-calendar-feed">{feed.map(p=><button type="button" key={p.id}
      className={key===p.id?'selected':''} onClick={()=>{choose(p.id);setSelectedDay(p.date)}}>
      {p.assetId&&images[p.assetId]?<img src={images[p.assetId]} alt={p.title}/>:<div className="lab-calendar-feed-placeholder">
       <ImageIcon size={24}/><strong>{p.title}</strong><small>{lang.picture}</small></div>}
      <span>{p.date.slice(8)} · {p.time}</span>
     </button>)}</div>:<p className="lab-calendar-feedempty">{lang.noFeed}</p>}
    </section>}
   <section className="lab-calendar-form" aria-label={lang.schedule}>
    <div className="lab-calendar-form-heading"><div><span className="eyebrow">{locale==='es'?'PLANIFICA TU CONTENIDO':'PLAN YOUR CONTENT'}</span>
     <h2>{lang.schedule}</h2><p>{locale==='es'?'Puedes elegir un post guardado o cualquiera de las nueve ideas de tu campaña.':'Choose a saved post or any of your nine campaign ideas.'}</p></div>
     <span><Check size={15}/>{current.length} {lang.stats.toLowerCase()}</span></div>
    {options.length?<div className="lab-calendar-form-fields">
     <label className="lab-calendar-form-picker">{lang.select}
      <select value={key} onChange={e=>choose(e.target.value)}>
       <option value="">{lang.pick}</option>
       <optgroup label={locale==='es'?'Mis publicaciones':'My posts'}>{options.filter(x=>x.key.startsWith('post:')).map(p=><option key={p.key} value={p.key}>{p.title}</option>)}</optgroup>
       <optgroup label="1 Photo → 9 Posts">{options.filter(x=>x.key.startsWith('grid:')).map(p=><option key={p.key} value={p.key}>{p.title}</option>)}</optgroup>
      </select></label>
     <label>{lang.date}<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
     <label>{lang.time}<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>
     <div className="lab-calendar-form-actions">
      <button type="button" className="btn dark" disabled={!key||saving} onClick={()=>void saveSchedule()}>
       <Save size={16}/>{saving?'…':lang.save}</button>
      {chosen&&validDate(chosen.date)&&<button type="button" className="btn ghost" disabled={saving} onClick={()=>void saveSchedule(true)}>{lang.unschedule}</button>}
      {currentEvent&&<button type="button" className="btn ghost" disabled={saving} onClick={()=>void saveSchedule(false,currentEvent.status==='published'?'planned':'published')}>
       {currentEvent.status==='published'?lang.unmark:lang.mark}</button>}
     </div>
     {currentEvent&&<p className="lab-calendar-assigned">✓ {dateLabel(currentEvent.date,locale)} · {currentEvent.time} · {currentEvent.status==='published'?lang.published:lang.planned}</p>}
    </div>:<div className="lab-calendar-no-posts"><p>{lang.none}</p>
     <div><button className="btn dark" type="button" onClick={onNewPost}>{lang.new}</button>
     <button className="btn ghost" type="button" onClick={onOpenGrid}>{lang.grid}</button></div></div>}
   </section>
  </>}
 </div>;
}
