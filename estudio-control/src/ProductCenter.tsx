import {useMemo,useState} from 'react';
import {Copy, ExternalLink, Search, BookOpen, LockKeyhole, ShoppingBag, AlertCircle} from 'lucide-react';
import {resolveStudioLinks, type StudioEntry, type Category, PUBLICATION_LABELS, type PublicationState} from './LinkCenter';
import './product-center.css';

export type ProductInfo={
  id:string;category:Category;title:string;description:string;linkKey:string;sourceKey:string;
  state:PublicationState;price?:string;note:string;shareable:boolean
};
export const PRODUCTS_CATALOG:ProductInfo[]=[
  {id:'cleaning-app',category:'thelaunchera',title:'Cleaning App + Booking Page',description:'Clientes, bookings, quotes, invoices, jobs y seguimiento en una misma app.',linkKey:'tle-app',sourceKey:'tle-app-code',state:'publicado',note:'GitHub Pages y CI verificados. El cliente usa Cash, Zelle o Check; la app no procesa tarjetas.',shareable:true},
  {id:'booking',category:'thelaunchera',title:'Booking Automation + Command Center',description:'Organización de solicitudes y seguimiento para cleaning businesses.',linkKey:'tle-booking',sourceKey:'tle-home-code',state:'revision',note:'La presentación tiene referencia en el sitio. Confirmar checkout y precio actual antes de vender.',shareable:false},
  {id:'ai-booking',category:'thelaunchera',title:'AI Booking Assistant',description:'Asistente de IA para solicitudes y reservas.',linkKey:'tle-ai-booking',sourceKey:'tle-home-code',state:'revision',note:'Revisar precio, implementación y activación antes de compartir una oferta.',shareable:false},
  {id:'website-auto',category:'thelaunchera',title:'Website Automation',description:'Automatizaciones para capturar y atender solicitudes en websites.',linkKey:'tle-website-auto',sourceKey:'tle-home-code',state:'revision',note:'La ruta requiere validación comercial antes de enviarla.',shareable:false},
  {id:'va',category:'thelaunchera',title:'VA Essential Support',description:'Servicio de asistencia para tareas administrativas acordadas.',linkKey:'tle-va',sourceKey:'tle-home-code',state:'revision',note:'Confirmar condiciones y disponibilidad antes de ofrecerlo.',shareable:false},
  {id:'starter',category:'thelaunchera',title:'Lead-to-Booking Starter Kit',description:'Recurso gratuito para dueños de cleaning businesses.',linkKey:'tle-free',sourceKey:'tle-home-code',state:'revision',note:'Ruta histórica del recurso; comprobar formulario y correo de entrega antes de compartirla.',shareable:false},
  {id:'pod-guide',category:'podcast',title:'5 preguntas para cuando sientes que vas tarde',description:'Guía gratuita entregada desde el formulario del podcast.',linkKey:'pod-free',sourceKey:'pod-code',state:'publicado',price:'Gratis',note:'Compartir el formulario, no la carpeta fuente ni un enlace de descarga privado.',shareable:true},
  {id:'pod-diary',category:'podcast',title:'No voy tarde · Diario',description:'Diario digital de reflexiones y escritura personal.',linkKey:'pod-diario',sourceKey:'pod-code',state:'revision',price:'$1.99',note:'Landing y enlace de pago configurados en GitHub. Falta verificar compra y entrega completas.',shareable:false},
  {id:'pod-workbook',category:'podcast',title:'Empezar de nuevo · Cuaderno',description:'Cuaderno digital de 14 días para organizar pequeños pasos.',linkKey:'pod-empezar',sourceKey:'pod-code',state:'revision',price:'$3.99',note:'Landing y enlace de pago configurados en GitHub. Falta verificar compra y entrega completas.',shareable:false},
  {id:'course',category:'escuela',title:'Tu primera web con IA · Clase 01',description:'Formación práctica desde cero y lecciones en preparación.',linkKey:'school-wait',sourceKey:'school-code',state:'produccion',price:'$9.99 al lanzamiento',note:'Solo lista de espera; apertura prevista el 3 de diciembre de 2026. Checkout y acceso de compradores cerrados.',shareable:true},
  {id:'aula',category:'escuela',title:'Centro de alumnos',description:'Aula, progreso, materiales, Club de Ideas y bonos.',linkKey:'school-aula',sourceKey:'school-portal-code',state:'produccion',note:'Vista privada construida; aún no hay acceso comercial general ni prueba final de entrega.',shareable:false},
  {id:'club',category:'escuela',title:'Club de Ideas',description:'Comunidad y proyectos de alumnos asociados a la escuela.',linkKey:'school-club',sourceKey:'school-portal-code',state:'produccion',note:'Requiere acceso autorizado. No se comparte como enlace abierto.',shareable:false},
  {id:'casa',category:'escuela',title:'Casa Brownie · Demo de clase',description:'Versión sin video para enseñar y con video para el bono.',linkKey:'school-casa-static',sourceKey:'school-demos-code',state:'demo',note:'Ejemplo ficticio de web; no recibe compras.',shareable:true},
  {id:'crumb',category:'escuela',title:'CRUMB · Demo de cookies',description:'Demo de selección de sabores y diseño de tienda.',linkKey:'school-crumb',sourceKey:'school-demos-code',state:'demo',note:'Ejemplo de enseñanza; no acepta pedidos ni pagos reales.',shareable:true},
  {id:'aftr',category:'escuela',title:'AFTR. · Las Vegas',description:'Demo editorial de nightclub ficticio.',linkKey:'school-aftr',sourceKey:'school-demos-code',state:'demo',note:'No acepta reservas ni entradas reales.',shareable:true},
  {id:'lab',category:'lab',title:'The Content Lab',description:'Editor visual de publicaciones, carruseles, reels, historias, fondos y stickers.',linkKey:'lab-editor',sourceKey:'lab-repo',state:'produccion',price:'$10 previsto',note:'Editor privado para administración. Venta, comprador nuevo y créditos comerciales aún sin verificación completa.',shareable:false},
  {id:'prompts',category:'lab',title:'Master Prompts gratuitos',description:'Biblioteca pública para probar ideas y composiciones.',linkKey:'lab-prompts',sourceKey:'lab-repo',state:'publicado',price:'Gratis',note:'Se puede compartir. No requiere comprar el editor privado.',shareable:true},
  {id:'brand-board',category:'lab',title:'Brand Board Studio',description:'Editor de identidades demo: colores, fotos, tipografías y exportación.',linkKey:'lab-brand-board',sourceKey:'lab-brand-board-code',state:'interno',note:'Construido y publicado en GitHub Pages; herramienta de trabajo, no producto abierto a compradores.',shareable:false}
];
const CATEGORIES:{id:Category;name:string;description:string}[]=[
  {id:'thelaunchera',name:'The Launch Era',description:'Sistemas, servicios y herramientas para cleaning business owners'},
  {id:'podcast',name:'Podcast',description:'Diarios, cuadernos y recursos de Todavía estoy a tiempo'},
  {id:'escuela',name:'Escuela',description:'Clase, aula y demos de aprendizaje'},
  {id:'lab',name:'Content Lab',description:'Herramientas de creación y bibliotecas'}
];
const statusColor:Record<PublicationState,string>={publicado:'live',demo:'demo',produccion:'work',revision:'review',interno:'private'};
export default function ProductCenter({entries,readOnly=false}:{entries:StudioEntry[];readOnly?:boolean}){
 const [category,setCategory]=useState<Category|'todos'>('todos');
 const [query,setQuery]=useState('');
 const [expanded,setExpanded]=useState(false);
 const [copied,setCopied]=useState('');
 const [feedback,setFeedback]=useState('');
 const links=useMemo(()=>resolveStudioLinks(entries),[entries]);
 const linkByKey=useMemo(()=>Object.fromEntries(links.map(x=>[x.key,x])),[links]);
 const visible=PRODUCTS_CATALOG.filter(x=>(category==='todos'||x.category===category)&&(!readOnly||x.shareable)&&
   [x.title,x.description,x.note].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const searching=query.trim().length>0;
 const browsing=searching||category!=='todos';
 const openCategory=(id:Category|'todos')=>{setCategory(id);setExpanded(false);};
 async function copy(url:string,id:string){
   try{await navigator.clipboard.writeText(url);setCopied(id);setFeedback('Enlace público copiado.');}
   catch{setFeedback('No se pudo copiar automáticamente; mantén pulsado el enlace.');}
 }
 return <section className="pc-root" aria-label="Centro de productos">
  <header className="pc-hero">
   <div><span className="pc-kicker"><ShoppingBag size={15}/> PORTAFOLIO COMPLETO · GITHUB</span>
   <h2>Productos y proyectos, <em>con su estado real.</em></h2>
   <p>Una página para ver qué puedes compartir, qué está en producción y qué necesita pruebas. Los checkouts no se abren ni se activan desde aquí.</p></div>
  </header>
  <div className="pc-controls">
   <label className="pc-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto, demo o proyecto…" aria-label="Buscar productos"/></label>
   <nav aria-label="Filtrar productos">{[{id:'todos',name:'Inicio'},...CATEGORIES].map(x=><button key={x.id} className={category===x.id?'active':''} onClick={()=>openCategory(x.id as Category|'todos')}>{x.name}</button>)}</nav>
  </div>
  {!browsing&&<div className="pc-category-grid" aria-label="Elegir una categoría de productos">
    {CATEGORIES.map(g=><button className="pc-category-tile" key={g.id} onClick={()=>openCategory(g.id)}>
     <span className="pc-category-tile-icon"><ShoppingBag size={19}/></span>
     <strong>{g.name}</strong><span>{g.description}</span>
     <small>{PRODUCTS_CATALOG.filter(p=>p.category===g.id&&(!readOnly||p.shareable)).length} proyectos · Explorar</small>
    </button>)}
   </div>}
  {feedback&&<p role="status" className="pc-feedback">{feedback}</p>}
  {browsing&&CATEGORIES.filter(g=>category==='todos'||g.id===category).map(group=>{
   const shown=visible.filter(p=>p.category===group.id);
   const display=expanded||searching?shown:shown.slice(0,6);
   if(!shown.length)return null;
   return <div key={group.id} className="pc-category">
     <header><h3>{group.name}</h3><p>{group.description}</p></header>
     <div className="pc-items">{display.map(p=>{
       const page=linkByKey[p.linkKey],source=linkByKey[p.sourceKey];
       const canCopy=!!page&&p.shareable&&['publico','demo'].includes(page.visibility);
       return <article key={p.id} className="pc-product">
          <div className="pc-info">
            <div className="pc-tags"><span className={'pc-phase pc-'+statusColor[p.state]}>{PUBLICATION_LABELS[p.state]}</span>{p.price&&<span className="pc-price">{p.price}</span>}</div>
            <h4>{p.title}</h4><p>{p.description}</p>
            <small>{p.note}</small>
          </div>
          <div className="pc-actions">
           {page&&<a href={page.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/>{p.state==='produccion'&&p.id==='course'?'Lista de espera':'Abrir enlace'}</a>}
           {canCopy&&<button onClick={()=>void copy(page.url,p.id)}><Copy size={15}/>{copied===p.id?'Copiado':'Copiar link'}</button>}
           {source&&<a href={source.url} target="_blank" rel="noopener noreferrer" className="pc-source"><BookOpen size={15}/>GitHub</a>}
           {!p.shareable&&<span className="pc-hold"><LockKeyhole size={13}/> No promocionar todavía</span>}
          </div>
       </article>;
     })}</div>
     {!searching&&!expanded&&shown.length>6&&<button className="pc-load-more" onClick={()=>setExpanded(true)}>Ver {shown.length-6} proyectos más</button>}
   </div>;
  })}
  {browsing&&!visible.length&&<div className="pc-empty">No se encontraron productos para esta búsqueda.</div>}
  <div className="pc-footer"><AlertCircle size={17}/><p><b>Importante:</b> «Publicado» significa que existen página o despliegue de GitHub con pruebas técnicas; no certifica una compra real. «En producción» significa que todavía no se permite vender o conceder acceso. Los enlaces privados siguen protegidos por sus propias autorizaciones.</p></div>
 </section>;
}
