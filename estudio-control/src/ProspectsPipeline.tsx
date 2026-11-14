import {useCallback,useEffect,useMemo,useRef,useState,type FormEvent,type PointerEvent as ReactPointerEvent,type DragEvent} from 'react';
import {Plus,Search,RefreshCw,GripVertical,ExternalLink,Phone,Mail,CalendarDays,Pencil,Trash2,X,Check,LayoutGrid,ShieldCheck} from 'lucide-react';
import {getStudioProspects,saveStudioProspect,moveStudioProspect,deleteStudioProspect} from './supabase-client';
import {PROSPECT_STAGES,SERVICES,WEBSITE_STATUS,EMPTY_PROSPECT,activePipelineTotal,stageTotals,moveProspect,parseEstimate,prospectProjectLinks,
  type StudioProspect,type StudioProspectInput,type ProspectStage,type ProspectService,type ProspectWebsite} from './prospects-model';
import './prospects-pipeline.css';

const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const validWebLink=(value:string)=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}};
const shortDate=(date:string)=>new Intl.DateTimeFormat('es-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));

function ProjectShortcuts({notes,business,compact=false}:{notes:string;business:string;compact?:boolean}){
  const links=prospectProjectLinks(notes);
  if(!links.length)return null;
  return <nav className={'tle-prospects-project-shortcuts'+(compact?' is-compact':'')}
    aria-label={'Abrir enlaces de '+business}>
    <strong>ABRIR PROYECTOS</strong>
    <div className="tle-prospects-project-shortcut-grid">
      {links.map(link=><a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
        aria-label={'Abrir '+link.label+' de '+business}>
        <span>{link.label}</span><ExternalLink size={14} aria-hidden="true"/>
      </a>)}
    </div>
  </nav>;
}

const cleanForm=(form:StudioProspectInput):StudioProspectInput=>({
  ...form,business_name:form.business_name.trim().slice(0,160),
  contact_name:form.contact_name.trim().slice(0,140),phone:form.phone.trim().slice(0,50),
  email:form.email.trim().slice(0,180),city:form.city.trim().slice(0,120),
  state:form.state.trim().slice(0,80),website_url:form.website_url.trim().slice(0,500),
  source_url:form.source_url.trim().slice(0,500),notes:form.notes.trim().slice(0,4000),
  next_follow_up:form.next_follow_up||null,
  estimated_value:parseEstimate(String(form.estimated_value)),
});

export default function ProspectsPipeline({readOnly=false}:{readOnly?:boolean}) {
 const [rows,setRows]=useState<StudioProspect[]>([]);
 const [ready,setReady]=useState(false),[loading,setLoading]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [query,setQuery]=useState(''),[editing,setEditing]=useState<string|null>(null);
 const [formOpen,setFormOpen]=useState(false),[form,setForm]=useState<StudioProspectInput>({...EMPTY_PROSPECT});
 const [saving,setSaving]=useState(false),[moving,setMoving]=useState('');
 const [hover,setHover]=useState<ProspectStage|null>(null);
 const desktopDrag=useRef('');
 const touchDrag=useRef<{id:string;pointerId:number;startX:number;startY:number;moved:boolean}|null>(null);
 const refresh=useCallback(async()=>{
   setLoading(true);setError('');
   try{setRows(await getStudioProspects());setReady(true);}
   catch(err){setError(err instanceof Error?err.message:'No se pudieron cargar los prospectos.');}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{if(!readOnly)void refresh();},[readOnly,refresh]);
 const visible=useMemo(()=>{
   const needle=query.trim().toLocaleLowerCase('es');
   if(!needle)return rows;
   return rows.filter(row=>[row.business_name,row.contact_name,row.phone,row.city,row.state,row.service,row.notes].join(' ').toLocaleLowerCase('es').includes(needle));
 },[rows,query]);
 const totals=useMemo(()=>stageTotals(rows),[rows]);
 const pipeline=useMemo(()=>activePipelineTotal(rows),[rows]);
 const won=totals.find(t=>t.id==='won')?.total||0;
 function editField<K extends keyof StudioProspectInput>(key:K,value:StudioProspectInput[K]){
   setForm(old=>({...old,[key]:value}));
 }
 function openNew(){setEditing(null);setForm({...EMPTY_PROSPECT});setFormOpen(true);setError('');}
 function openEdit(row:StudioProspect){
   const {id,owner_id,created_at,updated_at,...fields}=row;
   void owner_id;void created_at;void updated_at;
   setEditing(id);setForm({...fields});setFormOpen(true);setError('');
 }
 async function submit(event:FormEvent<HTMLFormElement>){
   event.preventDefault();if(saving||readOnly)return;
   const next=cleanForm(form);
   if(!next.business_name){setError('Escribe el nombre del negocio.');return;}
   if(next.website_url&&!validWebLink(next.website_url)){setError('El website debe empezar con https:// o http://');return;}
   if(next.source_url&&!validWebLink(next.source_url)){setError('La fuente debe ser un enlace http o https válido.');return;}
   setSaving(true);setError('');setNotice('');
   try{
     const saved=await saveStudioProspect(next,editing||undefined);
     setRows(prev=>editing?prev.map(item=>item.id===editing?saved:item):[saved,...prev]);
     setFormOpen(false);setNotice(editing?'Prospecto actualizado.':'Prospecto guardado en tu Studio privado.');
   }catch(err){setError(err instanceof Error?err.message:'No pudimos guardar el prospecto.');}
   finally{setSaving(false);}
 }
 async function move(id:string,stage:ProspectStage){
   if(moving||readOnly)return;
   const prior=rows;
   const target=prior.find(row=>row.id===id);
   if(!target||target.stage===stage)return;
   setRows(moveProspect(prior,id,stage));setMoving(id);setError('');setNotice('');
   try{const saved=await moveStudioProspect(id,stage);
     setRows(old=>old.map(item=>item.id===id?saved:item));
     setNotice(target.business_name+' pasó a '+PROSPECT_STAGES.find(x=>x.id===stage)?.label+'.');
   }catch(err){setRows(prior);setError(err instanceof Error?err.message:'No pudimos mover el prospecto.');}
   finally{setMoving('');setHover(null);}
 }
 async function remove(row:StudioProspect){
   if(saving||moving||readOnly||!window.confirm('¿Borrar '+row.business_name+' de tu pipeline? Esta acción no se puede deshacer.'))return;
   setSaving(true);setError('');
   try{await deleteStudioProspect(row.id);setRows(old=>old.filter(x=>x.id!==row.id));setNotice('Prospecto borrado.');}
   catch(err){setError(err instanceof Error?err.message:'No se pudo borrar.');}
   finally{setSaving(false);}
 }
 function onDesktopDragStart(event:DragEvent<HTMLButtonElement>,id:string){
   if(moving)return;desktopDrag.current=id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',id);
 }
 function onDesktopDrop(event:DragEvent<HTMLElement>,stage:ProspectStage){
   event.preventDefault();const id=desktopDrag.current||event.dataTransfer.getData('text/plain');
   desktopDrag.current='';setHover(null);if(id)void move(id,stage);
 }
 function targetStage(x:number,y:number):ProspectStage|null {
   const node=document.elementFromPoint(x,y) as HTMLElement|null;
   const stage=node?.closest<HTMLElement>('[data-pipeline-stage]')?.dataset.pipelineStage;
   return PROSPECT_STAGES.some(s=>s.id===stage)?stage as ProspectStage:null;
 }
 function onPointerStart(event:ReactPointerEvent<HTMLButtonElement>,id:string){
   if(event.pointerType==='mouse'||moving)return;
   touchDrag.current={id,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false};
   event.currentTarget.setPointerCapture(event.pointerId);
 }
 function onPointerMove(event:ReactPointerEvent<HTMLButtonElement>){
   const drag=touchDrag.current;if(!drag||drag.pointerId!==event.pointerId)return;
   if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>8)drag.moved=true;
   if(drag.moved)setHover(targetStage(event.clientX,event.clientY));
 }
 function onPointerEnd(event:ReactPointerEvent<HTMLButtonElement>){
   const drag=touchDrag.current;if(!drag||drag.pointerId!==event.pointerId)return;
   const stage=drag.moved?targetStage(event.clientX,event.clientY):null;
   touchDrag.current=null;setHover(null);if(stage)void move(drag.id,stage);
 }
 if(readOnly)return <section className="tle-prospects tle-prospects-private"><ShieldCheck size={24}/><h2>Prospects · modo grabación</h2><p>Ocultamos nombres, contactos y valores privados mientras grabas.</p></section>;
 return <section className="tle-prospects" aria-label="Prospects CRM privado">
   <header className="tle-prospects-intro">
     <div><span className="tle-prospects-kicker"><LayoutGrid size={16}/> THE LAUNCH ERA / PROSPECTS</span>
       <h2>De prospecto a cliente.</h2>
       <p>Organiza las oportunidades que encuentras en Google. Mueve cada tarjeta por etapas y mantén tus próximos contactos en un solo lugar.</p>
     </div>
     <button className="tle-prospects-primary" type="button" onClick={openNew}><Plus size={18}/> Nuevo prospecto</button>
   </header>
   <div className="tle-prospects-overview" aria-label="Resumen del pipeline">
     <div><span>PROSPECTOS</span><strong>{ready?rows.length:'—'}</strong><small>Registros privados</small></div>
     <div><span>PIPELINE ACTIVO</span><strong>{ready?money.format(pipeline):'—'}</strong><small>Valor estimado, sin ganados ni descartados</small></div>
     <div><span>GANADOS</span><strong>{ready?money.format(won):'—'}</strong><small>Estimado, no ventas verificadas</small></div>
   </div>
   <div className="tle-prospects-toolbar">
     <label className="tle-prospects-search"><Search size={17}/><input aria-label="Buscar prospectos" placeholder="Buscar negocio, ciudad o servicio..." value={query} onChange={event=>setQuery(event.target.value)}/></label>
     <button type="button" onClick={()=>void refresh()} disabled={loading||!!moving}><RefreshCw size={16}/>{loading?'Cargando…':'Actualizar'}</button>
   </div>
   {error&&<p role="alert" className="tle-prospects-alert">{error}</p>}
   {notice&&<p role="status" className="tle-prospects-notice">{notice}</p>}
   {!ready&&!loading&&!error&&<p>Abre tu conexión segura para ver las oportunidades.</p>}
   {ready&&!rows.length&&<div className="tle-prospects-empty"><LayoutGrid size={25}/><h3>Tu pipeline está listo.</h3><p>Añade tu primer negocio. No hemos inventado prospectos ni cargado contactos sin verificar.</p><button type="button" onClick={openNew}>Añadir prospecto</button></div>}
   {ready&&!!rows.length&&<p className="tle-prospects-tip">Arrastra con el asa de cada tarjeta. En iPhone, también puedes mantener pulsada el asa y soltarla sobre otra columna o usar “Mover a”.</p>}
   {ready&&<div className="tle-prospects-board" role="region" aria-label="Columnas del pipeline" tabIndex={0}>
     {totals.map(stage=><section key={stage.id} data-pipeline-stage={stage.id}
       className={'tle-prospects-column '+(hover===stage.id?'is-drop-target':'')}
       onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect='move';setHover(stage.id);}}
       onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setHover(null);}}
       onDrop={event=>onDesktopDrop(event,stage.id)}>
       <header className="tle-prospects-column-head"><div><span className={'tle-prospects-stage-dot stage-'+stage.id}/><h3>{stage.label}</h3><span className="tle-prospects-stage-count">{stage.count}</span></div>
         <strong>{money.format(stage.total)}</strong><small>{stage.detail}</small></header>
       <div className="tle-prospects-deals">
         {visible.filter(row=>row.stage===stage.id).map(row=><article className="tle-prospects-deal" key={row.id}>
           <div className="tle-prospects-deal-top">
             <span className="tle-prospects-service">{SERVICES[row.service]||'Servicio'}</span>
             <button className="tle-prospects-drag" type="button" draggable={!moving}
               aria-label={'Arrastrar '+row.business_name}
               onDragStart={event=>onDesktopDragStart(event,row.id)}
               onDragEnd={()=>{desktopDrag.current='';setHover(null);}}
               onPointerDown={event=>onPointerStart(event,row.id)}
               onPointerMove={onPointerMove} onPointerUp={onPointerEnd}
               onPointerCancel={()=>{touchDrag.current=null;setHover(null);}}><GripVertical size={19}/></button>
           </div>
           <h4>{row.business_name}</h4>
           <p className="tle-prospects-location">{[row.city,row.state].filter(Boolean).join(', ')||'Ubicación pendiente'}</p>
           <span className="tle-prospects-web-status">{WEBSITE_STATUS[row.website_status]}</span>
           <strong className="tle-prospects-deal-value">{money.format(row.estimated_value)}</strong>
           {row.next_follow_up&&<small className="tle-prospects-next"><CalendarDays size={13}/> Seguimiento: {shortDate(row.next_follow_up)}</small>}
           {row.notes&&<p className="tle-prospects-card-note">{row.notes}</p>}
           <ProjectShortcuts notes={row.notes} business={row.business_name} compact/>
           <div className="tle-prospects-card-links">
             {row.phone&&<a href={'tel:'+row.phone.replace(/[^+0-9]/g,'')} aria-label={'Llamar a '+row.business_name}><Phone size={15}/></a>}
             {row.email&&<a href={'mailto:'+row.email} aria-label={'Enviar email a '+row.business_name}><Mail size={15}/></a>}
             {validWebLink(row.source_url||row.website_url)&&<a href={validWebLink(row.source_url||row.website_url)} target="_blank" rel="noopener noreferrer" aria-label={'Abrir fuente de '+row.business_name}><ExternalLink size={15}/></a>}
             <button type="button" onClick={()=>openEdit(row)} aria-label={'Editar '+row.business_name}><Pencil size={15}/></button>
             <button type="button" className="tle-prospects-remove" onClick={()=>void remove(row)} aria-label={'Borrar '+row.business_name}><Trash2 size={15}/></button>
           </div>
           <label className="tle-prospects-stage-select">Mover a
             <select value={row.stage} disabled={!!moving||saving} onChange={event=>void move(row.id,event.target.value as ProspectStage)}
               aria-label={'Mover '+row.business_name+' a otra etapa'}>
               {PROSPECT_STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
             </select>
           </label>
         </article>)}
         {!visible.some(row=>row.stage===stage.id)&&<p className="tle-prospects-no-deals">Sin prospectos en esta etapa</p>}
       </div>
     </section>)}
   </div>}
   {formOpen&&<div className="tle-prospects-modal" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!saving)setFormOpen(false);}}>
     <div className="tle-prospects-dialog" role="dialog" aria-modal="true" aria-labelledby="tle-prospect-form-heading">
       <header><div><small>MI STUDIO / PROSPECTOS</small><h3 id="tle-prospect-form-heading">{editing?'Editar prospecto':'Nuevo prospecto'}</h3></div><button type="button" onClick={()=>setFormOpen(false)} disabled={saving} aria-label="Cerrar formulario"><X size={19}/></button></header>
       <ProjectShortcuts notes={form.notes} business={form.business_name||'prospecto'}/>
       <form onSubmit={event=>void submit(event)}>
         <div className="tle-prospects-fields">
           <label className="tle-prospects-full">Negocio *<input required maxLength={160} autoFocus value={form.business_name} onChange={event=>editField('business_name',event.target.value)} placeholder="Nombre del negocio"/></label>
           <label>Nombre de contacto<input maxLength={140} value={form.contact_name} onChange={event=>editField('contact_name',event.target.value)} placeholder="Opcional"/></label>
           <label>Teléfono<input type="tel" maxLength={50} value={form.phone} onChange={event=>editField('phone',event.target.value)} placeholder="+1 555 000 0000"/></label>
           <label>Email<input type="email" maxLength={180} value={form.email} onChange={event=>editField('email',event.target.value)} placeholder="contact@business.com"/></label>
           <label>Ciudad<input maxLength={120} value={form.city} onChange={event=>editField('city',event.target.value)}/></label>
           <label>Estado<input maxLength={80} value={form.state} onChange={event=>editField('state',event.target.value)} placeholder="FL, NY, TX..."/></label>
           <label>Oportunidad<select value={form.service} onChange={event=>editField('service',event.target.value as ProspectService)}>
             {Object.entries(SERVICES).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label>
           <label>Presencia web<select value={form.website_status} onChange={event=>editField('website_status',event.target.value as ProspectWebsite)}>
             {Object.entries(WEBSITE_STATUS).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label>
           <label>Etapa<select value={form.stage} onChange={event=>editField('stage',event.target.value as ProspectStage)}>
             {PROSPECT_STAGES.map(stage=><option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
           <label>Valor estimado (USD)<input inputMode="decimal" type="number" min="0" max="100000000" step="0.01" value={form.estimated_value}
             onChange={event=>editField('estimated_value',parseEstimate(event.target.value))}/></label>
           <label>Próximo seguimiento<input type="date" value={form.next_follow_up||''} onChange={event=>editField('next_follow_up',event.target.value||null)}/></label>
           <label className="tle-prospects-full">Website actual<input type="url" maxLength={500} value={form.website_url} onChange={event=>editField('website_url',event.target.value)} placeholder="https://..."/></label>
           <label className="tle-prospects-full">Fuente (Google Maps / directorio)<input type="url" maxLength={500} value={form.source_url} onChange={event=>editField('source_url',event.target.value)} placeholder="https://..."/></label>
           <label className="tle-prospects-full">Notas y oportunidad concreta<textarea rows={4} maxLength={4000} value={form.notes} onChange={event=>editField('notes',event.target.value)} placeholder="Qué necesita, cómo lo verificaste, qué ofrecer y próximos pasos…"/></label>
         </div>
         <div className="tle-prospects-dialog-actions"><button type="button" onClick={()=>setFormOpen(false)} disabled={saving}>Cancelar</button>
           <button type="submit" disabled={saving||!form.business_name.trim()}><Check size={17}/>{saving?'Guardando…':'Guardar prospecto'}</button></div>
       </form>
     </div>
   </div>}
   <p className="tle-prospects-footer"><ShieldCheck size={15}/> Tus prospectos se guardan en la cuenta privada del Studio con control de acceso. No se envían mensajes ni se crean clientes automáticamente.</p>
 </section>;
}
