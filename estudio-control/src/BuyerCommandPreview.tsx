import {useMemo,useState} from 'react';
import {CalendarDays,Check,Inbox,LayoutDashboard,Package,Search,ShieldCheck,ShoppingBag,Users,X} from 'lucide-react';
import './buyer-command-preview.css';

export type BuyerPreviewIndustry='restaurant'|'cleaning'|'retail'|'services';
type Industry=BuyerPreviewIndustry;
type Panel='overview'|'inbox'|'calendar'|'catalog'|'customers';
type Status='new'|'confirmed'|'done';
type Request={id:number;customer:string;description:string;time:string;status:Status;contact:string};
type Item={id:number;name:string;category:string;price:number;discount:number;available:boolean};
type Language='en'|'es';
const brands:Record<Industry,{name:string;kind:string;requestLabel:string;dateLabel:string;cta:string;publicAction:string}>={
  restaurant:{name:'Golden Grid',kind:'Digital Menu & Reservations',requestLabel:'Table inquiries',dateLabel:'Reservations',cta:'Add table request',publicAction:'Request a table'},
  cleaning:{name:'Evergreen Cleaning · Sample',kind:'Services & Quotes',requestLabel:'Quote requests',dateLabel:'Appointments',cta:'Add cleaning inquiry',publicAction:'Request a quote'},
  retail:{name:'SOVA · Sample Shop',kind:'Product Catalog',requestLabel:'Product inquiries',dateLabel:'Follow-ups',cta:'Add product inquiry',publicAction:'Ask about a product'},
  services:{name:'SOLUNA · Sample Studio',kind:'Services & Appointments',requestLabel:'Session requests',dateLabel:'Sessions',cta:'Add session request',publicAction:'Request an appointment'}
};
const seeds:Record<Industry,{requests:Request[];items:Item[]}>={
 restaurant:{
  requests:[
   {id:101,customer:'Alex Parker',description:'Table for 2 · Saturday at 7:00 PM',time:'Today · 9:40 AM',status:'new',contact:'Email on file'},
   {id:102,customer:'Morgan Lee',description:'Table for 4 · Sunday at 12:30 PM',time:'Yesterday · 5:10 PM',status:'confirmed',contact:'Email on file'},
   {id:103,customer:'Jamie Rivera',description:'Birthday brunch · 6 guests',time:'Yesterday · 1:25 PM',status:'new',contact:'Email on file'}],
  items:[
   {id:101,name:'Signature Waffles',category:'Breakfast',price:18,discount:10,available:true},
   {id:102,name:'Golden Latte',category:'Drinks',price:6.5,discount:0,available:true},
   {id:103,name:'Berry French Toast',category:'Breakfast',price:16,discount:0,available:false}]},
 cleaning:{
  requests:[
   {id:201,customer:'Taylor Green',description:'Deep clean · 3 bedrooms',time:'Today · 10:10 AM',status:'new',contact:'Email on file'},
   {id:202,customer:'Jordan Wells',description:'Weekly cleaning · Monday',time:'Yesterday · 3:30 PM',status:'confirmed',contact:'Email on file'},
   {id:203,customer:'Sam Carter',description:'Move-out cleaning · estimate needed',time:'Yesterday · 11:40 AM',status:'new',contact:'Email on file'}],
  items:[
   {id:201,name:'Standard Home Cleaning',category:'Residential',price:120,discount:0,available:true},
   {id:202,name:'Deep Cleaning',category:'Residential',price:220,discount:10,available:true},
   {id:203,name:'Move-out Cleaning',category:'Residential',price:310,discount:0,available:true}]},
 retail:{
  requests:[
   {id:301,customer:'Avery Brooks',description:'Interested in SOVA One · Pearl',time:'Today · 9:05 AM',status:'new',contact:'Email on file'},
   {id:302,customer:'Casey Blake',description:'Asked about replacement cushions',time:'Yesterday · 4:15 PM',status:'confirmed',contact:'Email on file'},
   {id:303,customer:'Riley Scott',description:'Product availability question',time:'Yesterday · 1:05 PM',status:'new',contact:'Email on file'}],
  items:[
   {id:301,name:'SOVA One',category:'Headphones',price:199,discount:15,available:true},
   {id:302,name:'SOVA Air',category:'Headphones',price:149,discount:0,available:true},
   {id:303,name:'SOVA Case',category:'Accessories',price:29,discount:0,available:false}]},
 services:{
  requests:[
   {id:401,customer:'Harper Allen',description:'First yoga session · Tuesday',time:'Today · 8:50 AM',status:'new',contact:'Email on file'},
   {id:402,customer:'Reese Morgan',description:'Private yoga session · Friday',time:'Yesterday · 2:20 PM',status:'confirmed',contact:'Email on file'},
   {id:403,customer:'Blair Davis',description:'New member inquiry',time:'Yesterday · 12:20 PM',status:'new',contact:'Email on file'}],
  items:[
   {id:401,name:'Intro Yoga Session',category:'Classes',price:22,discount:0,available:true},
   {id:402,name:'Private Session',category:'Appointments',price:85,discount:0,available:true},
   {id:403,name:'Monthly Studio Pass',category:'Memberships',price:119,discount:10,available:true}]}
};
function initialData():Record<Industry,{requests:Request[];items:Item[]}>{
 return {
 restaurant:{requests:seeds.restaurant.requests.map(x=>({...x})),items:seeds.restaurant.items.map(x=>({...x}))},
 cleaning:{requests:seeds.cleaning.requests.map(x=>({...x})),items:seeds.cleaning.items.map(x=>({...x}))},
 retail:{requests:seeds.retail.requests.map(x=>({...x})),items:seeds.retail.items.map(x=>({...x}))},
 services:{requests:seeds.services.requests.map(x=>({...x})),items:seeds.services.items.map(x=>({...x}))},
 };
}
const text={
 en:{title:'Buyer Command Center',preview:'PRIVATE REVIEW · READ ONLY',overview:'Overview',inbox:'Inbox',calendar:'Calendar',catalog:'Menu & Catalog',customers:'Customers',activity:'AT A GLANCE',new:'New requests',confirmed:'Confirmed',offers:'Active offers',active:'Available items',quick:'YOUR NEXT STEP',requests:'Recent requests',all:'Open inbox',manage:'View catalog',welcome:'Welcome back.',email:'Email updates',noMessages:'Private example only. No real bookings, emails, payments or customer records.',available:'Available',unavailable:'Sold out',sample:'Sample records',reminder:'A booking is confirmed only after availability has been checked.',noRealAnalytics:'Live reporting is available only when verified activity exists.',back:'Close preview',customersLabel:'Sample customers',requestTitle:'Requests & inquiries',calendarTitle:'Confirmed appointments',itemsTitle:'Catalog & availability',handoff:'Each buyer receives their own Command Center only after their website is finished and delivery is approved.'},
 es:{title:'Command Center del comprador',preview:'REVISIÓN PRIVADA · SOLO LECTURA',overview:'Resumen',inbox:'Solicitudes',calendar:'Calendario',catalog:'Menú y catálogo',customers:'Clientes',activity:'EN UN VISTAZO',new:'Solicitudes nuevas',confirmed:'Confirmadas',offers:'Descuentos activos',active:'Artículos disponibles',quick:'TU SIGUIENTE PASO',requests:'Solicitudes recientes',all:'Abrir solicitudes',manage:'Ver catálogo',welcome:'Bienvenido de nuevo.',email:'Actualizaciones por correo',noMessages:'Ejemplo privado. Sin reservas, correos, pagos ni datos de clientes reales.',available:'Disponible',unavailable:'Agotado',sample:'Registros de ejemplo',reminder:'Una reserva se confirma solamente después de verificar disponibilidad.',noRealAnalytics:'Los reportes reales aparecen cuando existen actividades verificadas.',back:'Cerrar vista',customersLabel:'Clientes de ejemplo',requestTitle:'Solicitudes y consultas',calendarTitle:'Citas confirmadas',itemsTitle:'Catálogo y disponibilidad',handoff:'Cada comprador recibe su propio Command Center cuando el website está terminado y la entrega ha sido aprobada.'}
} as const;

function money(amount:number){return '$'+amount.toFixed(2)}
export default function BuyerCommandPreview({onClose,industry='restaurant',lang='en'}:{
 onClose:()=>void;industry?:BuyerPreviewIndustry;lang?:Language;
}){
 // Read-only, owner-accessible visual review only. No production records or edit mutations.
 const [panel,setPanel]=useState<Panel>('overview');
 const [selected,setSelected]=useState<number|null>(null);
 const [search,setSearch]=useState('');
 const demoData=useMemo(initialData,[]);
 const t=text[lang],brand=brands[industry],current=demoData[industry];
 const newCount=current.requests.filter(r=>r.status==='new').length;
 const confirmed=current.requests.filter(r=>r.status==='confirmed').length;
 const offers=current.items.filter(p=>p.discount>0&&p.available).length;
 const available=current.items.filter(p=>p.available).length;
 const activeRequest=current.requests.find(r=>r.id===selected);
 const filtered=current.requests.filter(r=>(r.customer+' '+r.description).toLowerCase().includes(search.toLowerCase()));
 const customers=useMemo(()=>[...new Map(current.requests.map(r=>[r.customer,r])).values()],[current.requests]);
 const stats=[{label:t.new,value:newCount},{label:t.confirmed,value:confirmed},{label:t.offers,value:offers},{label:t.active,value:available}];
 const tabs:[Panel,typeof LayoutDashboard][]=[['overview',LayoutDashboard],['inbox',Inbox],['calendar',CalendarDays],['catalog',Package],['customers',Users]];
 const labels:Record<Panel,string>={overview:t.overview,inbox:t.inbox,calendar:t.calendar,catalog:t.catalog,customers:t.customers};
 const go=(next:Panel)=>{setPanel(next);setSelected(null)};
 const statusLabel=(status:Status)=>lang==='es'?({new:'Nueva',confirmed:'Confirmada',done:'Completada'}[status]):({new:'New',confirmed:'Confirmed',done:'Done'}[status]);
 return <section className="tle-buyer-review" aria-label="Vista privada del Command Center, solo lectura">
  <div className="tle-buyer-review-head">
   <div>
    <span className="tle-buyer-review-kicker"><ShieldCheck size={15}/> THE LAUNCH ERA / REVISIÓN INTERNA</span>
    <h3>Así verá el cliente <em>su espacio.</em></h3>
    <p>Una vista de ejemplo, sin editar precios, solicitudes ni cambiar de negocio. El Command Center de cada comprador se personaliza para su marca y se entrega con su website terminado.</p>
   </div>
   <button type="button" onClick={onClose} className="tle-buyer-review-close"><X size={17}/>{t.back}</button>
  </div>
  <div className="tle-buyer-device-wrap tle-buyer-phone">
   <div className="tle-buyer-shell">
    <aside className="tle-buyer-sidebar">
     <div className="tle-buyer-sidebar-brand"><span className="tle-buyer-mark">TLE<span>.</span></span><small>BUSINESS WORKSPACE</small><strong>{brand.name}</strong><small>{brand.kind}</small></div>
     <nav className="tle-buyer-side-nav" aria-label="Secciones del Command Center">
      {tabs.map(([id,Icon])=><button type="button" key={id} onClick={()=>go(id)} aria-current={panel===id?'page':undefined}><Icon size={17}/>{labels[id]}</button>)}
     </nav>
     <div className="tle-buyer-sidebar-note">{t.noMessages}</div>
    </aside>
    <div className="tle-buyer-main">
     <div className="tle-buyer-mobile-bar"><span className="tle-buyer-mark">TLE<span>.</span></span><div><strong>{brand.name}</strong><small>{brand.kind}</small></div><span className="tle-buyer-demo-chip">{lang==='es'?'VISTA PREVIA':'PREVIEW'}</span></div>
     <header className="tle-buyer-inner-header">
      <div><span className="tle-buyer-inner-kicker">{t.preview}</span><h4>{panel==='overview'?t.welcome:labels[panel]}</h4><p>{panel==='overview'?brand.requestLabel+' · '+brand.dateLabel:brand.name}</p></div>
     </header>
     {panel==='overview'&&<>
      <div className="tle-buyer-metrics">{stats.map(stat=><article key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></article>)}</div>
      <section className="tle-buyer-focus"><span>{t.quick}</span><strong>{newCount?newCount+' '+brand.requestLabel.toLowerCase()+' need attention':'Everything is up to date.'}</strong><p>{brand.publicAction} · {t.email}</p><button type="button" onClick={()=>go('inbox')}>{t.all}</button></section>
      <div className="tle-buyer-section-title"><h5>{t.requests}</h5><button type="button" onClick={()=>go('inbox')}>{t.all}</button></div>
      <div className="tle-buyer-rows">{current.requests.slice(0,3).map(req=><button key={req.id} type="button" onClick={()=>{setPanel('inbox');setSelected(req.id)}}><span><b>{req.customer}</b><small>{req.description}</small></span><span className={'tle-buyer-status status-'+req.status}>{statusLabel(req.status)}</span></button>)}</div>
      <div className="tle-buyer-shortcuts"><button type="button" onClick={()=>go('calendar')}><CalendarDays size={16}/>{t.calendar}</button><button type="button" onClick={()=>go('catalog')}><Package size={16}/>{t.manage}</button><button type="button" onClick={()=>go('customers')}><Users size={16}/>{t.customers}</button></div>
     </>}
     {panel==='inbox'&&<>
      <div className="tle-buyer-section-title"><h5>{t.requestTitle}</h5><label className="tle-buyer-search"><Search size={15}/><input aria-label={lang==='es'?'Buscar consultas de ejemplo':'Search sample inquiries'} placeholder={lang==='es'?'Buscar…':'Search…'} value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
      <div className="tle-buyer-rows">{!filtered.length?<p className="tle-buyer-note">{lang==='es'?'No hay solicitudes con esa búsqueda.':'No sample requests found.'}</p>:filtered.map(req=><button type="button" key={req.id} onClick={()=>setSelected(req.id)} aria-pressed={selected===req.id}><span><b>{req.customer}</b><small>{req.description}</small><small>{req.time}</small></span><span className={'tle-buyer-status status-'+req.status}>{statusLabel(req.status)}</span></button>)}</div>
      {activeRequest&&<div className="tle-buyer-detail"><h5>{activeRequest.customer}</h5><p>{activeRequest.description}</p><small>{t.sample} · {activeRequest.contact}</small><p className="tle-buyer-readonly-note">{t.reminder}</p></div>}
     </>}
     {panel==='calendar'&&<>
      <div className="tle-buyer-section-title"><h5>{t.calendarTitle}</h5><span>{t.sample}</span></div>
      <div className="tle-buyer-rows">{!confirmed?<p className="tle-buyer-note">{lang==='es'?'Sin citas confirmadas de ejemplo.':'No confirmed sample appointments.'}</p>:current.requests.filter(req=>req.status==='confirmed').map(req=><button type="button" key={req.id} onClick={()=>{setPanel('inbox');setSelected(req.id)}}><span><b>{req.customer}</b><small>{req.description}</small></span><span className="tle-buyer-status status-confirmed"><Check size={13}/>{statusLabel(req.status)}</span></button>)}</div>
      <p className="tle-buyer-note">{t.reminder}</p>
     </>}
     {panel==='catalog'&&<>
      <div className="tle-buyer-section-title"><h5>{t.itemsTitle}</h5><span>{t.sample}</span></div>
      <div className="tle-buyer-catalog">{current.items.map(item=><article key={item.id}><div className="tle-buyer-product-symbol"><ShoppingBag size={21}/></div><div className="tle-buyer-product-copy"><strong>{item.name}</strong><small>{item.category}</small><div className="tle-buyer-product-price">{money(item.price*(1-item.discount/100))}{item.discount>0&&<del>{money(item.price)}</del>}</div></div><span className={'tle-buyer-availability'+(item.available?'':' off')}>{item.available?t.available:t.unavailable}</span></article>)}</div>
      <p className="tle-buyer-note">{t.noRealAnalytics}</p>
     </>}
     {panel==='customers'&&<>
      <div className="tle-buyer-section-title"><h5>{t.customersLabel}</h5><span>{t.sample}</span></div>
      <div className="tle-buyer-rows">{customers.map(req=><button type="button" key={req.id} onClick={()=>{setPanel('inbox');setSelected(req.id)}}><span><b>{req.customer}</b><small>{req.description}</small></span><span className="tle-buyer-status status-confirmed">{req.contact}</span></button>)}</div>
     </>}
     <footer className="tle-buyer-inner-foot"><ShieldCheck size={13}/>{t.noMessages}</footer>
    </div>
    <nav className="tle-buyer-bottom-nav" aria-label="Navegación móvil del Command Center">
     {tabs.map(([id,Icon])=><button type="button" key={id} aria-current={panel===id?'page':undefined} onClick={()=>go(id)}><Icon size={19}/><small>{labels[id]}</small></button>)}
    </nav>
   </div>
  </div>
  <p className="tle-buyer-review-foot"><ShieldCheck size={15}/>{t.handoff}</p>
 </section>
}
