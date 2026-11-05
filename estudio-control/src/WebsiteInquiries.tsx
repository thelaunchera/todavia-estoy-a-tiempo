import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWebsiteInquiries, updateWebsiteInquiry, type WebsiteInquiry, type WebsiteInquiryStatus } from './supabase-client';
import { Check, Clock3, ExternalLink, Mail, Search, RefreshCw, X } from 'lucide-react';
import './website-inquiries.css';

const labels:Record<WebsiteInquiryStatus,string>={new:'Nueva',contacted:'Contactada',in_progress:'En proceso',closed:'Cerrada'};
const packages:Record<string,string>={'website-basic':'Website · $15','website-ai-crm':'Website + IA + CRM · $25'};
const nextStatuses:WebsiteInquiryStatus[]=['new','contacted','in_progress','closed'];
const formatDate=(date:string)=>new Intl.DateTimeFormat('es-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'}).format(new Date(date));

export default function WebsiteInquiries({readOnly=false}:{readOnly?:boolean}) {
 const [rows,setRows]=useState<WebsiteInquiry[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[ready,setReady]=useState(false);
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[expanded,setExpanded]=useState('');
 const [noteDraft,setNoteDraft]=useState<Record<string,string>>({});
 const [saving,setSaving]=useState('');
 const refresh=useCallback(async()=>{
  setBusy(true);
  try{
   const next=await getWebsiteInquiries();
   setRows(next);
   setReady(true);
   setError('');
   setNoteDraft(previous=>Object.fromEntries(next.map(x=>[x.id,previous[x.id]??x.admin_notes??''])));
  }catch(err){setError(err instanceof Error?err.message:'No pudimos leer los inquiries.');}
  finally{setBusy(false);}
 },[]);
 useEffect(()=>{
  if(readOnly)return;
  void refresh();
  const onFocus=()=>{if(document.visibilityState==='visible')void refresh()};
  const timer=window.setInterval(onFocus,45000);
  window.addEventListener('focus',onFocus);
  return()=>{window.clearInterval(timer);window.removeEventListener('focus',onFocus)};
 },[refresh,readOnly]);
 const visible=useMemo(()=>rows.filter(x=>{
  if(filter!=='all' && x.status!==filter && x.package_slug!==filter && x.kind!==filter)return false;
  const haystack=[x.name,x.email,x.business_name,x.industry,x.package_slug,x.goals,x.customer_action].join(' ').toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
 }),[rows,filter,query]);
 const newCount=rows.filter(x=>x.status==='new').length;
 async function save(row:WebsiteInquiry,status:WebsiteInquiryStatus){
  if(readOnly||saving)return;
  setSaving(row.id);setError('');setNotice('');
  try{
   const notes=(noteDraft[row.id]||'').trim().slice(0,4000);
   await updateWebsiteInquiry(row.id,status,notes);
   setRows(prev=>prev.map(x=>x.id===row.id?{...x,status,admin_notes:notes}:x));
   setNotice('Seguimiento guardado en tu Studio privado.');
  }catch(err){setError(err instanceof Error?err.message:'No se pudo guardar el cambio.');}
  finally{setSaving('');}
 }
 if(readOnly)return <section className="website-inquiries"><div className="wi-banner"><strong>Inquiries · modo grabación</strong><p>Los datos personales y formularios de clientes quedan ocultos mientras grabas.</p></div></section>;
 return <section className="website-inquiries" aria-label="Inquiries de websites y automatizaciones">
  <div className="wi-header">
   <div><span className="wi-kicker">THE LAUNCH ERA · INQUIRIES</span><h2>Solicitudes de websites</h2><p>Desde los dos intakes oficiales, directamente al Studio. Esta bandeja no envía leads al Command Center.</p></div>
   <button type="button" onClick={()=>void refresh()} disabled={busy} className="wi-refresh"><RefreshCw size={16}/>{busy?'Cargando…':'Actualizar'}</button>
  </div>
  <div className="wi-stats"><div><span>Nuevas</span><strong>{ready?newCount:'—'}</strong></div><div><span>Recibidas (últimas 200)</span><strong>{ready?rows.length:'—'}</strong></div><div><span>En proceso</span><strong>{ready?rows.filter(x=>x.status==='in_progress').length:'—'}</strong></div></div>
  <div className="wi-toolbar">
   <div className="wi-search"><Search size={17}/><input aria-label="Buscar solicitudes" placeholder="Nombre, negocio, correo, industria…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Borrar búsqueda" onClick={()=>setQuery('')}><X size={15}/></button>}</div>
   <label>Filtrar <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todas</option><option value="new">Nuevas</option><option value="contacted">Contactadas</option><option value="in_progress">En proceso</option><option value="closed">Cerradas</option><option value="website-basic">Paquete $15</option><option value="website-ai-crm">Paquete $25</option><option value="inquiry">Consultas</option><option value="intake">Intakes</option></select></label>
  </div>
  {error&&<p role="alert" className="wi-error">{error} {ready&&'Se conservan los últimos datos consultados.'}</p>}
  {notice&&<p role="status" className="wi-notice">{notice}</p>}
  {ready&&!visible.length&&!busy&&<p className="wi-empty">No hay solicitudes para este filtro.</p>}
  <div className="wi-list">{visible.map(row=><article className="wi-item" key={row.id}>
   <button type="button" className="wi-summary" aria-expanded={expanded===row.id} onClick={()=>setExpanded(expanded===row.id?'':row.id)}>
    <div className="wi-summary-main"><span className="wi-badge">{packages[row.package_slug]||row.package_slug}</span><span className={'wi-status wi-status-'+row.status}>{labels[row.status]}</span><strong>{row.business_name}</strong><small>{row.name} · {row.industry}</small></div>
    <div className="wi-summary-side"><small><Clock3 size={13}/>{formatDate(row.created_at)}</small><span>{row.kind==='intake'?'Intake':'Inquiry'}</span><span>{expanded===row.id?'Ocultar':'Ver detalles'}</span></div>
   </button>
   {expanded===row.id&&<div className="wi-details">
    <div className="wi-detail-grid">
     <div><span>Contacto</span><strong>{row.name}</strong><a href={'mailto:'+row.email}>{row.email}<Mail size={14}/></a>{row.phone&&<p>{row.phone}</p>}</div>
     <div><span>Negocio</span><strong>{row.business_name}</strong><p>{row.industry}</p>{row.existing_website&&<a href={row.existing_website} target="_blank" rel="noopener noreferrer">Website actual <ExternalLink size={14}/></a>}</div>
     <div><span>Flujo solicitado</span><strong>{row.customer_action}</strong><p>Enviar avisos a: {row.preferred_email}</p></div>
     <div><span>Solicitud y pago</span><strong>{row.kind==='intake'?'Intake / alcance por confirmar':'Consulta inicial'}</strong><p>Pago: {row.payment_status==='verified'?'Verificado':'SIN VERIFICAR'}</p><p>Idioma: {row.language.toUpperCase()}</p></div>
    </div>
    <div className="wi-message"><span>Qué necesita</span><p>{row.goals}</p></div>
    {row.brand_notes&&<div className="wi-message"><span>Marca y estilo</span><p>{row.brand_notes}</p></div>}
    {row.automation_goals&&<div className="wi-message"><span>Automatización</span><p>{row.automation_goals}</p></div>}
    {row.ai_brief&&<div className="wi-message"><span>Asistente IA</span><p>{row.ai_brief}</p></div>}
    <label className="wi-private-note"><span>Notas privadas de seguimiento</span><textarea rows={3} maxLength={4000} value={noteDraft[row.id]??row.admin_notes??''} placeholder="Anota lo que falta, próxima llamada o decisión…" onChange={e=>setNoteDraft(prev=>({...prev,[row.id]:e.target.value}))}/></label>
    <div className="wi-actions"><label>Estado <select value={row.status} disabled={saving===row.id} onChange={e=>void save(row,e.target.value as WebsiteInquiryStatus)}>{nextStatuses.map(x=><option value={x} key={x}>{labels[x]}</option>)}</select></label><button type="button" onClick={()=>void save(row,row.status)} disabled={saving===row.id}><Check size={15}/>{saving===row.id?'Guardando…':'Guardar notas'}</button><a className="wi-email" href={'mailto:'+encodeURIComponent(row.email)+'?subject='+encodeURIComponent('The Launch Era · '+(packages[row.package_slug]||'Website')+' · '+row.business_name)}>Responder por correo</a></div>
    <p className="wi-warning">Cambiar el estado aquí no confirma el pago ni activa automatizaciones de clientes. Responder por correo abre tu aplicación de email; no envía un mensaje automáticamente.</p>
   </div>}
  </article>)}</div>
  <p className="wi-footer">Acceso privado: solo la cuenta propietaria del Studio puede consultar y cambiar estas solicitudes. No se muestran a los clientes ni en el CRM.</p>
 </section>;
}
