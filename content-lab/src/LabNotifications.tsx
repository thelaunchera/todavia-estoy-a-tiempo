import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Bell,BellRing,Clock3,Mail,Smartphone,Check,ChevronRight,X,RotateCcw} from 'lucide-react';
import {labNotificationApi,type LabAlert,type LabAlertPrefs} from './platform/client';
import './LabNotifications.css';

type Props={email:string;locale:'es'|'en';onOpen:(alert:LabAlert)=>void;notify:(text:string)=>void};
export default function LabNotifications({email,locale,onOpen,notify}:Props){
 const [open,setOpen]=useState(false);
 const [items,setItems]=useState<LabAlert[]>([]);
 const [prefs,setPrefs]=useState<LabAlertPrefs|null>(null);
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [shaking,setShaking]=useState(false);
 const previous=useRef(0);
 const closeButton=useRef<HTMLButtonElement>(null);
 const es=locale==='es';
 const unread=useMemo(()=>items.filter(a=>!a.snoozed_until||Date.parse(a.snoozed_until)<=Date.now()),[items]);
 const activeCount=unread.length;
 const refresh=async()=>{
  const alerts=await labNotificationApi.list();
  setItems(alerts);
  const current=alerts.filter(a=>!a.snoozed_until||Date.parse(a.snoozed_until)<=Date.now()).length;
  if(current>previous.current)setShaking(true);
  previous.current=current;
 };
 useEffect(()=>{
  let live=true;
  void labNotificationApi.setup(locale).then(v=>{if(live)setPrefs(v)}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Alertas no disponibles')});
  void refresh().catch(()=>{});
  const poll=window.setInterval(()=>{if(!document.hidden)void refresh().catch(()=>{})},60000);
  const visible=()=>{if(!document.hidden)void refresh().catch(()=>{})};
  document.addEventListener('visibilitychange',visible);
  return()=>{live=false;window.clearInterval(poll);document.removeEventListener('visibilitychange',visible)};
 },[email]);
 useEffect(()=>{if(!shaking)return;const t=window.setTimeout(()=>setShaking(false),1600);return()=>window.clearTimeout(t)},[shaking]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);closeButton.current?.focus()}};
  document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[open]);
 const action=async(alert:LabAlert,kind:'open'|'snooze')=>{
  if(busy)return;
  setBusy(alert.id+kind);
  try{
   const ok=await labNotificationApi.act(alert.id,kind==='open'?'read':'snooze');
   if(!ok)throw Error(es?'No se pudo actualizar la alerta.':'Unable to update alert.');
   setItems(prev=>kind==='open'?prev.filter(x=>x.id!==alert.id):
     prev.map(x=>x.id===alert.id?{...x,snoozed_until:new Date(Date.now()+3600000).toISOString()}:x));
   if(kind==='open'){
    setOpen(false);
    onOpen(alert);
   }else notify(es?'Listo. Te lo recordaré en una hora.':'Okay! I’ll remind you in an hour.');
  }catch(e){setError(e instanceof Error?e.message:'Error');}
  finally{setBusy('')}
 };
 const toggleEmail=async()=>{
  if(!prefs||busy)return;
  setBusy('email');try{await labNotificationApi.setEmail(!prefs.email_enabled);
   setPrefs({...prefs,email_enabled:!prefs.email_enabled})}catch(e){setError(String(e))}
  finally{setBusy('')}
 };
 const togglePush=async()=>{
  if(!prefs||busy)return;
  setBusy('push');
  try{
   if(prefs.push_enabled)await labNotificationApi.disablePush();
   else await labNotificationApi.enablePush();
   setPrefs({...prefs,push_enabled:!prefs.push_enabled});
   notify(es?(prefs.push_enabled?'Avisos push desactivados.':'¡Perfecto! Recibirás avisos en este dispositivo.'):
    (prefs.push_enabled?'Push notifications turned off.':'You’ll receive notifications on this device!'));
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy('')}
 };
 const installed=typeof window!=='undefined'&&(window.matchMedia('(display-mode: standalone)').matches||
  Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
 return <>
  <button type="button" className={'lab-alert-bell'+(shaking?' is-ringing':'')+(open?' active':'')}
    aria-label={(es?'Notificaciones':'Notifications')+(activeCount?' · '+activeCount:'')}
    aria-expanded={open} onClick={()=>{setOpen(v=>!v);setShaking(false);if(!open)void refresh().catch(()=>{})}}
    ref={closeButton}>
   {activeCount?<BellRing size={21}/>:<Bell size={21}/>}
   {activeCount>0&&<span className="lab-alert-count">{activeCount>9?'9+':activeCount}</span>}
  </button>
  {open&&createPortal(<div className="lab-alert-layer">
   <button type="button" className="lab-alert-backdrop" onClick={()=>setOpen(false)} aria-label={es?'Cerrar notificaciones':'Close notifications'}/>
   <section className="lab-alert-panel" aria-label={es?'Centro de notificaciones':'Notification center'} role="dialog" aria-modal="true">
    <header><div><span className="lab-alert-kicker">CONTENT LAB</span><h2>{es?'Tus avisos':'Your alerts'}</h2></div>
     <button type="button" aria-label={es?'Cerrar':'Close'} onClick={()=>{setOpen(false);closeButton.current?.focus()}}><X size={18}/></button>
    </header>
    {error&&<div className="lab-alert-error" role="alert">{error}<button onClick={()=>setError('')} aria-label="Cerrar"><X size={14}/></button></div>}
    <div className="lab-alert-scroll">
     {unread.length?unread.map(alert=><article className="lab-alert-item" key={alert.id}>
      <span className="lab-alert-item-icon">{alert.kind==='unfinished'?<RotateCcw size={17}/>:<Clock3 size={17}/>}</span>
      <div className="lab-alert-item-main">
       <strong>{alert.kind==='unfinished'?(es?'¡Tu idea sigue aquí! ✨':'Your idea is waiting! ✨'):(es?'¡Ya casi es hora! ⏰':'It’s almost time! ⏰')}</strong>
       <p>{alert.kind==='unfinished'?(es?'¿Seguimos con tu diseño?':'Ready to keep creating?'):(es?'Tu post se acerca. ¡Vamos a revisarlo!':'Your post is coming up. Time for a quick look!')}</p>
       <small>{alert.project_title}</small>
       <div className="lab-alert-actions">
        <button type="button" className="primary" disabled={!!busy} onClick={()=>void action(alert,'open')}>
         {es?'Abrir proyecto':'Open project'}<ChevronRight size={15}/></button>
        <button type="button" disabled={!!busy} onClick={()=>void action(alert,'snooze')}>
         <Clock3 size={14}/>{es?'Posponer 1 h':'Snooze 1 h'}</button>
       </div>
      </div>
     </article>):<div className="lab-alert-empty"><Check size={22}/><strong>{es?'¡Todo al día!':'All caught up!'}</strong>
      <p>{es?'Cuando tengas algo pendiente, lo encontrarás aquí.':'You’ll see reminders here when there’s something to revisit.'}</p></div>}
    </div>
    <footer className="lab-alert-preferences">
      <strong>{es?'Cómo recibir avisos':'Delivery preferences'}</strong>
      <label className="lab-alert-setting"><Mail size={17}/><span>{es?'Correo de respaldo':'Email reminders'}</span>
       <input type="checkbox" disabled={!prefs||!!busy} checked={!!prefs?.email_enabled} onChange={()=>void toggleEmail()}/></label>
      <label className="lab-alert-setting"><Smartphone size={17}/><span>{es?'Push en este teléfono':'Push on this device'}</span>
       <input type="checkbox" disabled={!prefs||!!busy} checked={!!prefs?.push_enabled} onChange={()=>void togglePush()}/></label>
      {!installed&&/iPhone|iPad/i.test(navigator.userAgent)&&<small>{es?
        'Para recibir push en iPhone, añade Content Lab a la pantalla de inicio, abre la app y activa este interruptor.':
        'For iPhone push, add Content Lab to your Home Screen, open the app and enable this switch.'}</small>}
      <small>{es?'Avisos de proyectos a las 6 h y de publicaciones 2 h antes. No publica por ti.':
       'Project reminders after 6 hours; posting alerts 2 hours before. Posting remains manual.'}</small>
    </footer>
   </section>
  </div>,document.body)}
 </>;
}
