import { useMemo, useState } from 'react';
import { Copy, Check, Pencil, Trash2, Plus, Search, Link2, Globe2, LockKeyhole, X, Save } from 'lucide-react';
import { api } from './supabase-client';
import './link-center.css';

export const LINK_CENTER_SECTION = 'studio-link-center-v1';
type Category = 'thelaunchera' | 'podcast' | 'escuela' | 'lab';
type Visibility = 'publico' | 'demo' | 'interno' | 'revision';
type BaseLink = { key:string; title:string; url:string; category:Category; visibility:Visibility; description:string };
type StudioEntry = { id:string; title:string; section?:string; notes?:string };
type DisplayLink = BaseLink & { rowId?:string; hidden?:boolean };
const GROUPS: {id:Category; title:string; intro:string}[] = [
  {id:'thelaunchera',title:'The Launch Era',intro:'Productos, páginas de venta y demos de servicios'},
  {id:'podcast',title:'Podcast',intro:'Episodios, recursos y páginas de la colección digital'},
  {id:'escuela',title:'Escuela',intro:'Clases, lista de espera, aula y proyectos de práctica'},
  {id:'lab',title:'Content Lab',intro:'Editor creativo, prompts, herramientas y archivos'}
];
const INITIAL:BaseLink[] = [
  {key:'tle-site',title:'The Launch Era · Website',url:'https://thelaunchera.com/',category:'thelaunchera',visibility:'publico',description:'Web principal'},
  {key:'tle-app-info',title:'Cleaning App · Información',url:'https://thelaunchera.com/cleaning-web-app/',category:'thelaunchera',visibility:'publico',description:'Página del producto principal'},
  {key:'tle-app',title:'Cleaning App · Entrar',url:'https://app.thelaunchera.com/',category:'thelaunchera',visibility:'publico',description:'Acceso a la aplicación para clientes'},
  {key:'tle-booking',title:'Booking Automation · Landing',url:'https://thelaunchera.com/booking-lead-automation/',category:'thelaunchera',visibility:'publico',description:'Página de presentación'},
  {key:'tle-booking-demo',title:'Booking · Demo pública',url:'https://thelaunchera.com/demo-booking/',category:'thelaunchera',visibility:'demo',description:'Ejemplo interactivo para mostrar el flujo'},
  {key:'tle-experience',title:'Experience Cleaning · Demo',url:'https://thelaunchera.com/experience-cleaning/',category:'thelaunchera',visibility:'demo',description:'Demo más reciente de limpieza, sin reservas reales'},
  {key:'tle-free',title:'Lead-to-Booking · Recurso gratuito',url:'https://thelaunchera.com/free-cleaning-lead-guide/',category:'thelaunchera',visibility:'publico',description:'Guía gratuita en inglés'},
  {key:'tle-cb-depot',title:'CB Depot · Proyecto real',url:'https://cb-depot-booking.pages.dev/',category:'thelaunchera',visibility:'revision',description:'Cliente real: no enviar reservas de prueba; confirmar permiso para difusión'},
  {key:'tle-checkout',title:'Checkout Booking · Revisar antes de usar',url:'https://thelaunchera.com/service-checkout/?offer=booking-flow&lang=en',category:'thelaunchera',visibility:'revision',description:'Verificar precio y oferta actual antes de compartir'},
  {key:'pod-home',title:'Todavía estoy a tiempo · Website',url:'https://podcast.thelaunchera.com/',category:'podcast',visibility:'publico',description:'Landing editorial del podcast'},
  {key:'pod-spotify',title:'Spotify · Escuchar el podcast',url:'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh',category:'podcast',visibility:'publico',description:'Página de episodios en Spotify'},
  {key:'pod-ep1',title:'Spotify · Episodio 01',url:'https://open.spotify.com/episode/21aYHKY0kodWEzg1835xcD',category:'podcast',visibility:'publico',description:'Primer episodio'},
  {key:'pod-ep2',title:'Spotify · Episodio 02',url:'https://open.spotify.com/episode/6ICSx9E7BVlU8Qi8rFC0s3',category:'podcast',visibility:'publico',description:'Segundo episodio'},
  {key:'pod-diario',title:'No voy tarde · Diario',url:'https://podcast.thelaunchera.com/productos/no-voy-tarde.html',category:'podcast',visibility:'publico',description:'Página del producto digital'},
  {key:'pod-empezar',title:'Empezar de nuevo · Cuaderno',url:'https://podcast.thelaunchera.com/productos/empezar-de-nuevo.html',category:'podcast',visibility:'publico',description:'Página del producto digital'},
  {key:'pod-free-source',title:'5 preguntas · Archivo para administración',url:'https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view',category:'podcast',visibility:'interno',description:'Recurso fuente; a la audiencia se le comparte el formulario, no el archivo interno'},
  {key:'pod-studio',title:'Mi Studio · Administración',url:'https://podcast.thelaunchera.com/estudio/',category:'podcast',visibility:'interno',description:'Solo acceso privado de la propietaria'},
  {key:'school-class',title:'Tu primera web con IA · Landing',url:'https://podcast.thelaunchera.com/clases/primera-landing.html',category:'escuela',visibility:'publico',description:'Clase anunciada; compra todavía cerrada'},
  {key:'school-wait',title:'Tu primera web con IA · Lista de espera',url:'https://podcast.thelaunchera.com/clases/primera-landing.html#lista-espera',category:'escuela',visibility:'publico',description:'Enlace directo al formulario de espera'},
  {key:'school-casa-static',title:'Casa Brownie · Demo sin video',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video',category:'escuela',visibility:'demo',description:'Demo con hero estático, proyecto ficticio'},
  {key:'school-casa-video',title:'Casa Brownie · Demo con video',url:'https://thelaunchera.com/demos/casa-brownie/',category:'escuela',visibility:'demo',description:'Demo con video, proyecto ficticio'},
  {key:'school-crumb',title:'CRUMB · Demo de cookies',url:'https://thelaunchera.com/demos/crumb/',category:'escuela',visibility:'demo',description:'Tienda de demostración: sin pedidos reales'},
  {key:'school-aftr',title:'AFTR. · Demo Las Vegas',url:'https://thelaunchera.com/demos/aftr/',category:'escuela',visibility:'demo',description:'Nightclub ficticio: no recibe reservaciones'},
  {key:'school-aula',title:'Aula de alumnos',url:'https://podcast.thelaunchera.com/alumnos/',category:'escuela',visibility:'interno',description:'Requiere acceso autorizado; la clase aún no está a la venta'},
  {key:'school-club',title:'Club de Ideas',url:'https://podcast.thelaunchera.com/alumnos/comunidad.html',category:'escuela',visibility:'interno',description:'Comunidad privada de alumnos'},
  {key:'school-pdf',title:'Materiales · PDF de la clase',url:'https://drive.google.com/drive/folders/1sR_keLOjf3OuXdKKJ8TAYRwCPI9i5NQq',category:'escuela',visibility:'interno',description:'Carpeta de producción, no enviar a público'},
  {key:'lab-editor',title:'The Content Lab · Editor',url:'https://podcast.thelaunchera.com/content-lab/',category:'lab',visibility:'interno',description:'Herramienta privada; venta y acceso de compradores aún no abiertos'},
  {key:'lab-prompts',title:'Master Prompts · Biblioteca gratis',url:'https://podcast.thelaunchera.com/content-lab/prompts/',category:'lab',visibility:'publico',description:'Recurso público, listo para compartir'},
  {key:'lab-repo',title:'Content Lab · Código GitHub',url:'https://github.com/thelaunchera/todavia-estoy-a-tiempo/tree/main/content-lab',category:'lab',visibility:'interno',description:'Fuente del editor en GitHub'},
  {key:'lab-notion',title:'Inventario general · Notion',url:'https://app.notion.com/p/40aa68f2ee6e817bbccbc3c56095cbf8?pvs=204',category:'lab',visibility:'interno',description:'Registro maestro de enlaces y cambios del 31 de octubre'}
];
const shareable = (v:Visibility) => v==='publico' || v==='demo';
const statusText:Record<Visibility,string> = {publico:'Público',demo:'Demo',interno:'Privado',revision:'Revisar'};
function safeUrl(raw:string) {
  try {const u=new URL(raw.trim());return u.protocol==='https:' && !u.username && !u.password && !!u.hostname && !/^(localhost|127\.|0\.0\.0\.0)/.test(u.hostname);}catch{return false;}
}
function decode(entry:StudioEntry) {
  try {
    const obj=JSON.parse(entry.notes||'{}');
    if(!obj || typeof obj!=='object')return null;
    if(!GROUPS.some(g=>g.id===obj.category))return null;
    if(!['publico','demo','interno','revision'].includes(obj.visibility))return null;
    if(typeof obj.url!=='string' || !safeUrl(obj.url))return null;
    return obj as {key?:string;category:Category;visibility:Visibility;url:string;description?:string;hidden?:boolean};
  } catch {return null;}
}
const blank:Omit<BaseLink,'key'>={title:'',url:'',category:'thelaunchera',visibility:'publico',description:''};
export default function LinkCenter({entries,onChanged,readOnly=false}:{entries:StudioEntry[];onChanged:()=>Promise<unknown>;readOnly?:boolean}) {
  const [category,setCategory]=useState<Category|'todos'>('todos');
  const [query,setQuery]=useState('');
  const [editor,setEditor]=useState<(Partial<DisplayLink> & {isNew?:boolean})|null>(null);
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState('');
  const [notice,setNotice]=useState('');
  const [issue,setIssue]=useState('');
  const links=useMemo(()=>{
    const records=entries.filter(x=>x.section===LINK_CENTER_SECTION).map(row=>({row,config:decode(row)})).filter((x):x is {row:StudioEntry;config:NonNullable<ReturnType<typeof decode>>}=>!!x.config);
    const original=new Set(INITIAL.map(x=>x.key));
    const basics:DisplayLink[]=INITIAL.map(base=>{
      const changed=records.find(x=>x.config.key===base.key);
      return changed ? {...base,title:changed.row.title,url:changed.config.url,category:changed.config.category,visibility:changed.config.visibility,description:changed.config.description||'',rowId:changed.row.id,hidden:changed.config.hidden} : base;
    });
    const extras:DisplayLink[]=records.filter(x=>!x.config.key || !original.has(x.config.key)).map(x=>({
      key:x.config.key||x.row.id,title:x.row.title,url:x.config.url,category:x.config.category,
      visibility:x.config.visibility,description:x.config.description||'',rowId:x.row.id,hidden:x.config.hidden
    }));
    return [...basics,...extras].filter(x=>!x.hidden);
  },[entries]);
  const shown=links.filter(x=>(category==='todos'||x.category===category) && [x.title,x.description,x.url].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
  async function copy(text:string,key:string){
    try{await navigator.clipboard.writeText(text);setCopied(key);setNotice('Enlace copiado al portapapeles.');}
    catch{setIssue('No se pudo copiar automáticamente. Mantén pulsado el enlace para copiarlo.');}
  }
  async function copyCategory(){
    const allowed=shown.filter(x=>shareable(x.visibility));
    if(!allowed.length){setNotice('No hay enlaces públicos o demos para copiar en esta selección.');return;}
    await copy(allowed.map(x=>x.title+'\n'+x.url).join('\n\n'),'group');
  }
  async function save(){
    if(!editor || busy)return;
    const title=(editor.title||'').trim(),url=(editor.url||'').trim();
    if(!title || title.length>180){setIssue('Escribe un nombre de máximo 180 caracteres.');return;}
    if(!safeUrl(url)){setIssue('Introduce una URL HTTPS válida.');return;}
    const selected=editor.category || blank.category;
    const visibility=editor.visibility || blank.visibility;
    const payload={key:editor.key,category:selected,visibility,url,description:(editor.description||'').trim().slice(0,350)};
    setBusy(true);setIssue('');
    try{
      const data={title,section:LINK_CENTER_SECTION,status:'archivada',notes:JSON.stringify(payload)};
      if(editor.rowId)await api.put('/api/items/ideas/'+editor.rowId,data);
      else await api.post('/api/items/ideas',data);
      await onChanged();
      setEditor(null);setNotice('Enlace guardado en tu Studio privado.');
    }catch{setIssue('No se pudo guardar en el Studio. Revisa la conexión e inténtalo de nuevo.');}
    finally{setBusy(false);}
  }
  async function remove(link:DisplayLink){
    if(busy || readOnly)return;
    if(!window.confirm('¿Quitar «'+link.title+'» del centro de enlaces?'))return;
    setBusy(true);setIssue('');
    try{
      if(INITIAL.some(x=>x.key===link.key)){
        const data={title:link.title,section:LINK_CENTER_SECTION,status:'archivada',notes:JSON.stringify({key:link.key,url:link.url,category:link.category,visibility:link.visibility,description:link.description,hidden:true})};
        if(link.rowId)await api.put('/api/items/ideas/'+link.rowId,data);
        else await api.post('/api/items/ideas',data);
      } else if(link.rowId)await api.delete('/api/items/ideas/'+link.rowId);
      await onChanged();setNotice('Enlace retirado del centro.');
    }catch{setIssue('No se pudo retirar el enlace.');}
    finally{setBusy(false);}
  }
  return <section className="link-center" aria-label="Centro de enlaces">
    <div className="lc-hero">
      <div><span className="lc-kicker"><Link2 size={15}/> TU BIBLIOTECA DE ENLACES</span>
        <h2>Todo en un lugar. <em>Listo para compartir.</em></h2>
        <p>Encuentra el enlace correcto sin buscar entre mensajes. Los enlaces privados y pendientes de revisión no se incluyen al copiar una categoría.</p>
      </div>
      {!readOnly&&<button className="lc-primary" onClick={()=>{setEditor({...blank,isNew:true});setIssue('');}}><Plus size={17}/> Añadir enlace</button>}
    </div>
    <div className="lc-tools">
      <div className="lc-search"><Search size={19}/><input aria-label="Buscar enlaces" placeholder="Buscar por producto, demo o nombre…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label="Limpiar búsqueda"><X size={16}/></button>}</div>
      <button className="lc-bulk" onClick={()=>void copyCategory()}><Copy size={15}/>{copied==='group'?'Copiado':'Copiar enlaces públicos'}</button>
    </div>
    <div className="lc-tabs" role="group" aria-label="Filtrar por categoría">
      <button className={category==='todos'?'active':''} onClick={()=>setCategory('todos')}>Todos <span>{links.length}</span></button>
      {GROUPS.map(group=><button key={group.id} className={category===group.id?'active':''} onClick={()=>setCategory(group.id)}>{group.title}<span>{links.filter(x=>x.category===group.id).length}</span></button>)}
    </div>
    {(issue||notice)&&<div className={'lc-message '+(issue?'lc-error':'')} role="status">{issue||notice}<button aria-label="Cerrar aviso" onClick={()=>{setIssue('');setNotice('');}}><X size={15}/></button></div>}
    {GROUPS.filter(g=>category==='todos'||g.id===category).map(group=>{
      const groupLinks=shown.filter(x=>x.category===group.id);
      if(!groupLinks.length)return null;
      return <section className="lc-group" key={group.id}>
        <div className="lc-group-head"><div><h3>{group.title}</h3><p>{group.intro}</p></div><span>{groupLinks.length} enlaces</span></div>
        <div className="lc-list">{groupLinks.map(item=><article className="lc-item" key={item.key}>
          <div className="lc-item-info"><div className="lc-item-top"><strong>{item.title}</strong><span className={'lc-status lc-status-'+item.visibility}>{item.visibility==='interno'&&<LockKeyhole size={12}/>} {statusText[item.visibility]}</span></div><p>{item.description}</p><a href={item.url} target="_blank" rel="noopener noreferrer" title="Abrir enlace">{item.url}</a></div>
          <div className="lc-actions">
            <button type="button" onClick={()=>void copy(item.url,item.key)} title={item.visibility==='interno'?'Copiar enlace privado: no compartir':'Copiar enlace'}><Copy size={16}/><span>{copied===item.key?'Copiado':'Copiar'}</span></button>
            <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={'Abrir '+item.title}><Globe2 size={18}/></a>
            {!readOnly&&<>
              <button type="button" onClick={()=>{setEditor({...item});setIssue('');}} aria-label={'Editar '+item.title}><Pencil size={16}/></button>
              <button type="button" onClick={()=>void remove(item)} aria-label={'Quitar '+item.title}><Trash2 size={16}/></button>
            </>}
          </div>
        </article>)}</div>
      </section>;
    })}
    {!shown.length&&<p className="lc-empty">No encontré enlaces con esa búsqueda. Puedes añadir uno nuevo o probar otra palabra.</p>}
    <p className="lc-note"><LockKeyhole size={15}/> El Studio guarda tus cambios con tu acceso protegido. Los enlaces internos, los de clientes reales y los pendientes de revisar nunca se incluyen al copiar por categoría. Copiar no publica ni habilita ninguna compra.</p>
    {editor&&!readOnly&&<div className="lc-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setEditor(null);}}>
      <div className="lc-modal" role="dialog" aria-modal="true" aria-label="Editar enlace"><div className="lc-modal-top"><div><span>MI ESTUDIO</span><h3>{editor.isNew?'Nuevo enlace':'Editar enlace'}</h3></div><button onClick={()=>setEditor(null)} aria-label="Cerrar"><X size={20}/></button></div>
      <label>Nombre claro<input autoFocus value={editor.title||''} maxLength={180} onChange={e=>setEditor({...editor,title:e.target.value})} placeholder="Ej. Mi landing de la clase"/></label>
      <label>Enlace HTTPS<input value={editor.url||''} onChange={e=>setEditor({...editor,url:e.target.value})} placeholder="https://..."/></label>
      <label>Categoría<select value={editor.category||blank.category} onChange={e=>setEditor({...editor,category:e.target.value as Category})}>{GROUPS.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
      <label>Tipo de enlace<select value={editor.visibility||blank.visibility} onChange={e=>setEditor({...editor,visibility:e.target.value as Visibility})}><option value="publico">Público · listo para compartir</option><option value="demo">Demo · contenido de ejemplo</option><option value="interno">Privado · solo mi trabajo</option><option value="revision">Revisar · no compartir todavía</option></select></label>
      <label>Nota breve<textarea rows={2} value={editor.description||''} onChange={e=>setEditor({...editor,description:e.target.value})} maxLength={350} placeholder="¿Para qué se usa?"/></label>
      {issue&&<p className="lc-inline-error" role="alert">{issue}</p>}
      <div className="lc-modal-bottom"><button onClick={()=>setEditor(null)}>Cancelar</button><button className="lc-primary" disabled={busy} onClick={()=>void save()}><Save size={16}/>{busy?'Guardando…':'Guardar enlace'}</button></div>
      </div>
    </div>}
  </section>;
}
