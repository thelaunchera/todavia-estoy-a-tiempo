import React,{useEffect,useMemo,useState} from 'react';
import {Bell,BellRing,Check,ChevronRight,Clock3,Mail,Smartphone,X} from 'lucide-react';
import {notificationsApi,type LabAlert} from './LabNotifications';
import './LabNotificationBell.css';

type Props={email:string;locale:'es'|'en';onOpen:(alert:LabAlert)=>Promise<void>|void;notify:(message:string)=>void};
const when=(s:string,locale:'es'|'en')=>{
 try{return new Intl.DateTimeFormat(locale==='es'?'es-US':'en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})
  .format(new Date(s))}catch{return '';}
};
export default function LabNotificationBell({email,locale,onOpen,notify}:Props){
 const [expanded,setExpanded]=useState(false);
 const [items,setItems]=useState<LabAlert[]>([]);
 const [pushEnabled,setPushEnabled]=useState(false);
 const [emailEnabled,setEmailEnabled]=useState(true);
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState('');
 const [initialized,setInitialized]=useState(false);
 const es=locale==='es';
 const refresh=async()=>{try{setItems(await notificationsApi.list())}catch{/* Session expiry is handled by the Lab login. */}};
 useEffect(()=>{
  if(!email)return;
  let alive=true;setInitialized(false);setItems([]);
  void notificationsApi.init(locale).then(async prefs=>{
   if(!alive)return;
   setPushEnabled(prefs.push);setEmailEnabled(prefs.email);
   const latest=await notificationsApi.list();
   if(alive){setItems(latest);setInitialized(true)}
  }).catch(()=>{if(alive)setInitialized(false)});
  const active=()=>{if(document.visibilityState==='visible')void refresh()};
  const timer=window.setInterval(active,60000);
  window.addEventListener('focus',active);document.addEventListener('visibilitychange',active);
  return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('focus',active);document.removeEventListener('visibilitychange',active);};
 },[email,locale]);
 const visible=useMemo(()=>items.filter(a=>!a.read_at&&(!a.snoozed_until||Date.parse(a.snoozed_until)<=Date.now())),[items,expanded]);
 const count=visible.length;
 const action=async(item:LabAlert,kind:'read'|'snooze')=>{
  if(busy)return;setBusy(item.id);
  try{
   await notificationsApi.act(item.id,kind);
   setItems(previous=>previous.filter(p=>p.id!==item.id));
   if(kind==='read'){setExpanded(false);await onOpen(item)}
   else notify(es?'Aviso pospuesto 1 hora.':'Reminder snoozed for 1 hour.');
  }catch(e){notify(e instanceof Error?e.message:(es?'No se pudo abrir.':'Could not open.'))}
  finally{setBusy('')}
 };
 const togglePush=async()=>{
  if(loading)return;setLoading(true);
  try{
   if(pushEnabled){await notificationsApi.disablePush();setPushEnabled(false);notify(es?'Avisos push desactivados.':'Push alerts off.')}
   else{await notificationsApi.enablePush();setPushEnabled(true);notify(es?'¡Listo! Te avisaremos en este dispositivo.':'Push alerts are on for this device.')}
  }catch(e){notify(e instanceof Error?e.message:'Notification permission unavailable')}
  finally{setLoading(false)}
 };
 const toggleEmail=async()=>{
  if(loading)return;setLoading(true);
  try{await notificationsApi.toggleEmail(!emailEnabled);setEmailEnabled(!emailEnabled)}
  catch(e){notify(e instanceof Error?e.message:'Unable to update email alerts')}
  finally{setLoading(false)}
 };
 return <div className="lab-notification-wrap">
  <button type="button" className={'lab-notification-button'+(count?' has-alerts':'')}
    aria-label={es?'Notificaciones':'Notifications'} aria-expanded={expanded}
    title={es?'Notificaciones':'Notifications'} onClick={()=>{setExpanded(v=>!v);void refresh()}}>
   {count?<BellRing size={20}/>:<Bell size={20}/>}
   {count>0&&<span className="lab-notification-count">{count>9?'9+':count}</span>}
  </button>
  {expanded&&<>
   <button type="button" className="lab-notification-backdrop" aria-label={es?'Cerrar notificaciones':'Close notifications'} onClick={()=>setExpanded(false)}/>
   <section className="lab-notification-panel" aria-label={es?'Tus notificaciones':'Your notifications'}>
    <header><div><strong>{es?'Para ti ✨':'For you ✨'}</strong><small>{es?'Tus proyectos te esperan':'Your creative reminders'}</small></div>
     <button type="button" aria-label={es?'Cerrar':'Close'} onClick={()=>setExpanded(false)}><X size={18}/></button>
    </header>
    <div className="lab-notification-list">
     {!count&&<div className="lab-notification-empty"><Bell size={24}/><strong>{es?'Todo al día. ¡Sigue creando!':'All caught up. Keep creating!'}</strong></div>}
     {visible.map(alert=><article key={alert.id}>
      <span className="lab-notification-type">{alert.kind==='unfinished'?(es?'TU PROYECTO':'YOUR PROJECT'):(es?'PRÓXIMA PUBLICACIÓN':'UPCOMING POST')}</span>
      <strong>{alert.kind==='unfinished'?(es?'¡Qué bueno verte de nuevo! 💛':'Welcome back! 💛'):(es?'¡Ya casi es hora! ⏰':'It’s almost time! ⏰')}</strong>
      <p>{alert.kind==='unfinished'?(es?'Tu idea sigue aquí: ':'Your idea is waiting: '):(es?'En 2 horas toca publicar: ':'Posting in two hours: ')}<b>{alert.project_title}</b></p>
      {alert.kind==='scheduled'&&alert.scheduled_at&&<small><Clock3 size={13}/>{when(alert.scheduled_at,locale)}</small>}
      <div className="lab-notification-actions">
       <button type="button" disabled={Boolean(busy)} onClick={()=>void action(alert,'read')}>
        {es?'Abrir proyecto':'Open project'} <ChevronRight size={15}/>
       </button>
       <button type="button" disabled={Boolean(busy)} onClick={()=>void action(alert,'snooze')}>
        {es?'En 1 hora':'In 1 hour'}
       </button>
      </div>
     </article>)}
    </div>
    <div className="lab-notification-preferences">
     <strong>{es?'Dónde te avisamos':'Where to reach you'}</strong>
     <button type="button" disabled={loading||!initialized} onClick={()=>void togglePush()}>
       <Smartphone size={16}/><span>{es?'Notificaciones del teléfono':'Phone notifications'}</span>
       <b>{pushEnabled?(es?'Activadas':'On'):(es?'Activar':'Enable')}</b>
     </button>
     <button type="button" disabled={loading||!initialized} onClick={()=>void toggleEmail()}>
       <Mail size={16}/><span>{es?'Correo alternativo':'Email fallback'}</span>
       <b>{emailEnabled?<Check size={15}/>:es?'Desactivado':'Off'}</b>
     </button>
     <small>{es?'Los avisos del calendario no publican automáticamente.':'Calendar alerts do not publish posts automatically.'}</small>
    </div>
   </section>
  </>}
 </div>;
}
