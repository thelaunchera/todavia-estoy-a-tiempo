import {useMemo,useState} from 'react';
import {ArrowLeft,CalendarDays,Check,Clock3,ExternalLink,Inbox,LayoutDashboard,Package,RotateCcw,Search,ShieldCheck,ShoppingBag,Users, X} from 'lucide-react';
import './buyer-command-preview.css';

type Industry='restaurant'|'cleaning'|'retail'|'services';
type Panel='overview'|'inbox'|'calendar'|'catalog'|'customers';
type Status='new'|'confirmed'|'done';
type Request={id:number;customer:string;description:string;time:string;status:Status;contact:string};
type Item={id:number;name:string;category:string;price:number;discount:number;available:boolean};
type Sample={name:string;kind:string;requestLabel:string;dateLabel:string;cta:string;publicAction:string;requests:Request[];items:Item[]};
type Device='phone'|'desktop';
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
const industryLabels:Record<Industry,string>={restaurant:'Restaurante',cleaning:'Limpieza',retail:'Tienda',services:'Servicios'};
const text={
 en:{title:'Buyer Command Center',preview:'OWNER REVIEW · SAMPLE DATA',device:'Screen',buyerType:'Business type',reset:'Reset samples',overview:'Overview',inbox:'Inbox',calendar:'Calendar',catalog:'Menu & Catalog',customers:'Customers',activity:'AT A GLANCE',new:'New requests',confirmed:'Confirmed',offers:'Active offers',active:'Available items',quick:'YOUR NEXT STEP',requests:'Recent requests',all:'Open inbox',manage:'Manage items',welcome:'Welcome back.',customerAction:'What customers see',email:'Email only · no SMS',noMessages:'Nothing here sends an email, confirms a real booking or charges a customer.',viewDetails:'View request',markConfirm:'Mark confirmed',markDone:'Complete',reopen:'Reopen',sample:'Fictional sample records',copy:'Make a sample request',edit:'Edit price',discount:'Discount',available:'Available',unavailable:'Sold out',published:'Catalog preview',reminder:'Email confirmation is prepared only after verified availability.',noRealAnalytics:'No revenue or best-seller charts without real orders.',back:'Close buyer view',customersLabel:'Sample customer list',requestTitle:'Requests & inquiries',calendarTitle:'Confirmed appointments',itemsTitle:'Edit prices & availability'},
 es:{title:'Command Center de compradores',preview:'REVISIÓN PRIVADA · DATOS FICTICIOS',device:'Pantalla',buyerType:'Tipo de negocio',reset:'Restablecer ejemplos',overview:'Resumen',inbox:'Solicitudes',calendar:'Calendario',catalog:'Menú y catálogo',customers:'Clientes',activity:'EN UN VISTAZO',new:'Solicitudes nuevas',confirmed:'Confirmadas',offers:'Descuentos activos',active:'Productos disponibles',quick:'TU PRÓXIMO PASO',requests:'Solicitudes recientes',all:'Abrir solicitudes',manage:'Editar artículos',welcome:'Bienvenido de nuevo.',customerAction:'Lo que ve el cliente',email:'Solo correo · sin SMS',noMessages:'Nada aquí envía correos reales, confirma una reserva ni cobra.',viewDetails:'Ver solicitud',markConfirm:'Marcar confirmada',markDone:'Completar',reopen:'Reabrir',sample:'Registros de ejemplo ficticios',copy:'Crear solicitud de prueba',edit:'Editar precio',discount:'Descuento',available:'Disponible',unavailable:'Agotado',published:'Vista de catálogo',reminder:'El correo de confirmación se prepara solo cuando se verifica disponibilidad.',noRealAnalytics:'No mostrar ingresos ni productos más vendidos sin ventas reales.',back:'Cerrar vista comprador',customersLabel:'Lista de clientes ficticios',requestTitle:'Solicitudes y consultas',calendarTitle:'Citas confirmadas',itemsTitle:'Editar precios y disponibilidad'}
} as const;
function money(amount:number){return '$'+amount.toFixed(2)}
export default function BuyerCommandPreview({onClose}:{onClose:()=>void}){
 const [industry,setIndustry]=useState<Industry>('restaurant');
 const [panel,setPanel]=useState<Panel>('overview');
 const [device,setDevice]=useState<Device>('phone');
 const [lang,setLang]=useState<Language>('en');
 const [dataset,setDataset]=useState(initialData);
 const [selected,setSelected]=useState<number|null>(null);
 const [search,setSearch]=useState('');
 const [editingPrice,setEditingPrice]=useState<number|null>(null);
 const [draftPrice,setDraftPrice]=useState('');
 const [notice,setNotice]=useState('');
 const t=text[lang],brand=brands[industry],current=dataset[industry];
 const newCount=current.requests.filter(r=>r.status==='new').length;
 const confirmed=current.requests.filter(r=>r.status==='confirmed').length;
 const offers=current.items.filter(p=>p.discount>0&&p.available).length;
 const available=current.items.filter(p=>p.available).length;
 const activeRequest=current.requests.find(r=>r.id===selected);
 const filtered=current.requests.filter(r=>(r.customer+' '+r.description).toLowerCase().includes(search.toLowerCase()));
 const customers=useMemo(()=>[...new Map(current.requests.map(r=>[r.customer,r])).values()], [current.requests]);
 const setData=(fn:(data:{requests:Request[];items:Item[]})=>{requests:Request[];items:Item[]})=>setDataset(old=>({...old,[industry]:fn(old[industry])}));
 const switchIndustry=(value:Industry)=>{setIndustry(value);setPanel('overview');setSelected(null);setSearch('');setEditingPrice(null);setNotice('')};
 const setRequestStatus=(id:number,status:Status)=>{
  setData(d=>({...d,requests:d.requests.map(r=>r.id===id?{...r,status}:r)}));
  setSelected(null);setNotice(lang==='es'?'Estado actualizado solo en la demostración.':'Demo status updated. No messages sent.');
 };
 const newRequest=()=>{
  const next=Math.max(0,...current.requests.map(r=>r.id))+1;
  setData(d=>({...d,requests:[{id:next,customer:'Sample Guest '+next,description:industry==='restaurant'?'Table for 2 · next Friday':industry==='retail'?'Product inquiry':industry==='cleaning'?'New cleaning estimate':'New appointment inquiry',time:'Just now',status:'new',contact:'Demo email'},...d.requests]}));
  setPanel('inbox');setNotice(lang==='es'?'Solicitud ficticia añadida.':'Sample inquiry added.');
 };
 const toggleAvailability=(id:number)=>{setData(d=>({...d,items:d.items.map(p=>p.id===id?{...p,available:!p.available}:p)}));setNotice(lang==='es'?'Disponibilidad actualizada solo en esta vista.':'Sample availability changed.')};
 const editDiscount=(id:number,value:number)=>{if(!Number.isFinite(value)||value<0||value>90)return;setData(d=>({...d,items:d.items.map(p=>p.id===id?{...p,discount:value}:p)}));};
 const savePrice=(id:number)=>{const p=Number(draftPrice);if(!Number.isFinite(p)||p<0||p>100000)return;setData(d=>({...d,items:d.items.map(i=>i.id===id?{...i,price:Math.round(p*100)/100}:i)}));setEditingPrice(null);setNotice('Sample price updated. No public site changed.')};
 const stats=[{label:t.new,value:newCount},{label:t.confirmed,value:confirmed},{label:t.offers,value:offers},{label:t.active,value:available}];
 const tabs:[Panel,typeof LayoutDashboard][]=[['overview',LayoutDashboard],['inbox',Inbox],['calendar',CalendarDays],['catalog',Package],['customers',Users]];
 const labels:{[K in Panel]:string}={overview:t.overview,inbox:t.inbox,calendar:t.calendar,catalog:t.catalog,customers:t.customers};
 return <section className="tle-buyer-review" aria-label="Vista privada del Command Center de compradores">
  <div className="tle-buyer-review-head">
   <div><span className="tle-buyer-review-kicker"><ShieldCheck size={15}/> THE LAUNCH ERA / OPERACIONES</span><h3>Vista de compradores. <em>Así de simple.</em></h3><p>Cambia de negocio y pantalla. Ajusta solicitudes, precios y descuentos de ejemplo sin tocar datos ni sistemas reales.</p></div>
   <button type="button" onClick={onClose} className="tle-buyer-review-close"><X size={17}/>{t.back}</button>
  </div>
  <div className="tle-buyer-review-bar">
   <label>{t.buyerType}<select value={industry} onChange={e=>switchIndustry(e.target.value as Industry)}>{(Object.keys(industryLabels) as Industry[]).map(key=><option key={key} value={key}>{industryLabels[key]}</option>)}</select></label>
   <div className="tle-buyer-review-devices" aria-label={t.device}><button type="button" aria-pressed={device==='phone'} onClick={()=>setDevice('phone')}>iPhone</button><button type="button" aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Desktop</button></div>
   <div className="tle-buyer-review-devices" aria-label="Language"><button type="button" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button><button type="button" aria-pressed={lang==='es'} onClick={()=>setLang('es')}>ES</button></div>
   <button type="button" className="tle-buyer-review-reset" onClick={()=>{setDataset(initialData());setPanel('overview');setSelected(null);setNotice('');setEditingPrice(null)}}><RotateCcw size={14}/>{t.reset}</button>
  </div>
  <div className={'tle-buyer-device-wrap '+(device==='phone'?'tle-buyer-phone':'tle-buyer-desktop')}>
   <div className="tle-buyer-shell">
    <aside className="tle-buyer-sidebar">
     <div className="tle-buyer-sidebar-brand"><span className="tle-buyer-mark">TLE<span>.</span></span><small>PRIVATE WORKSPACE</small><strong>{brand.name}</strong><small>{brand.kind}</small></div>
     <nav className="tle-buyer-side-nav" aria-label="Buyer dashboard sections">{tabs.map(([id,Icon])=><button type="button" key={id} onClick={()=>{setPanel(id);setSelected(null)}} aria-current={panel===id?'page':undefined}><Icon size={17}/>{labels[id]}</button>)}</nav>
     <div className="tle-buyer-sidebar-note">SIMULATED VIEW<br/>No real customer data.</div>
    </aside>
    <div className="tle-buyer-main">
     <div className="tle-buyer-mobile-bar"><span className="tle-buyer-mark">TLE<span>.</span></span><div><strong>{brand.name}</strong><small>{brand.kind}</small></div><span className="tle-buyer-demo-chip">DEMO</span></div>
     <header className="tle-buyer-inner-header"><div><span className="tle-buyer-inner-kicker">{t.preview}</span><h4>{panel==='overview'?t.welcome:labels[panel]}</h4><p>{panel==='overview'?brand.requestLabel+' · '+brand.dateLabel:brand.name}</p></div><button type="button" onClick={newRequest}>+ {brand.cta}</button></header>
     {panel==='overview'&&<><div className="tle-buyer-metrics">{stats.map(s=><article key={s.label}><span>{s.label}</span><strong>{s.value}</strong></article>)}</div>
      <section className="tle-buyer-focus"><span>{t.quick}</span><strong>{newCount?newCount+' '+brand.requestLabel.toLowerCase()+' need attention':'Everything is up to date.'}</strong><p>{brand.publicAction} · {t.email}</p><button type="button" onClick={()=>setPanel('inbox')}>{t.all}</button></section>
      <div className="tle-buyer-section-title"><h5>{t.requests}</h5><button type="button" onClick={()=>setPanel('inbox')}>{t.all}</button></div>
      <div className="tle-buyer-rows">{current.requests.slice(0,3).map(r=><button key={r.id} type="button" onClick={()=>{setPanel('inbox');setSelected(r.id)}}><span><b>{r.customer}</b><small>{r.description}</small></span><span className={'tle-buyer-status status-'+r.status}>{r.status==='new'?'New':r.status==='confirmed'?'Confirmed':'Done'}</span></button>)}</div>
      <div className="tle-buyer-shortcuts"><button type="button" onClick={()=>setPanel('calendar')}><CalendarDays size={16}/>{t.calendar}</button><button type="button" onClick={()=>setPanel('catalog')}><Package size={16}/>{t.manage}</button><button type="button" onClick={()=>setPanel('customers')}><Users size={16}/>{t.customers}</button></div></>}
     {panel==='inbox'&&<><div className="tle-buyer-section-title"><h5>{t.requestTitle}</h5><label className="tle-buyer-search"><Search size={15}/><input aria-label="Search sample inquiries" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
       <div className="tle-buyer-rows">{filtered.length===0?<p className="tle-buyer-note">No matching sample requests.</p>:filtered.map(r=><button type="button" key={r.id} onClick={()=>setSelected(r.id)} aria-pressed={selected===r.id}><span><b>{r.customer}</b><small>{r.description}</small><small>{r.time}</small></span><span className={'tle-buyer-status status-'+r.status}>{r.status}</span></button>)}</div>
       {activeRequest&&<div className="tle-buyer-detail"><div><h5>{activeRequest.customer}</h5><p>{activeRequest.description}</p><small>{t.sample} · {activeRequest.contact}</small></div><div className="tle-buyer-detail-buttons"><button type="button" onClick={()=>setRequestStatus(activeRequest.id,'confirmed')}><Check size={15}/>{t.markConfirm}</button><button type="button" onClick={()=>setRequestStatus(activeRequest.id,'done')}>{t.markDone}</button><button type="button" onClick={()=>setRequestStatus(activeRequest.id,'new')}>{t.reopen}</button></div><small>{t.reminder}</small></div>}</>}
     {panel==='calendar'&&<><div className="tle-buyer-section-title"><h5>{t.calendarTitle}</h5><span>{t.sample}</span></div><div className="tle-buyer-rows">{current.requests.filter(r=>r.status==='confirmed').length===0?<p className="tle-buyer-note">No confirmed sample appointments yet.</p>:current.requests.filter(r=>r.status==='confirmed').map(r=><button type="button" key={r.id} onClick={()=>{setPanel('inbox');setSelected(r.id)}}><span><b>{r.customer}</b><small>{r.description}</small></span><span className="tle-buyer-status status-confirmed"><Check size={13}/> Confirmed</span></button>)}</div><p className="tle-buyer-note">{t.reminder} {t.noMessages}</p></>}
     {panel==='catalog'&&<><div className="tle-buyer-section-title"><h5>{t.itemsTitle}</h5><span>{t.sample}</span></div><div className="tle-buyer-catalog">{current.items.map(p=><article key={p.id}><div className="tle-buyer-product-symbol"><ShoppingBag size={21}/></div><div className="tle-buyer-product-copy"><strong>{p.name}</strong><small>{p.category}</small><div className="tle-buyer-product-price">{money(p.price*(1-p.discount/100))}{p.discount>0&&<del>{money(p.price)}</del>}</div><div className="tle-buyer-product-editor">{editingPrice===p.id?<><input type="number" min="0" max="100000" step=".01" aria-label="Sample price" value={draftPrice} onChange={e=>setDraftPrice(e.target.value)}/><button type="button" onClick={()=>savePrice(p.id)}>{lang==='es'?'Guardar':'Save'}</button></>:<button type="button" onClick={()=>{setEditingPrice(p.id);setDraftPrice(String(p.price))}}>{t.edit}</button>}<label>{t.discount} <select aria-label={'Discount for '+p.name} value={p.discount} onChange={e=>editDiscount(p.id,Number(e.target.value))}>{[0,10,15,20,25].map(n=><option key={n} value={n}>{n}%</option>)}</select></label></div></div><button className={'tle-buyer-availability'+(p.available?'':' off')} onClick={()=>toggleAvailability(p.id)} type="button" aria-pressed={p.available}>{p.available?t.available:t.unavailable}</button></article>)}</div><div className="tle-buyer-note">{t.noRealAnalytics} {t.noMessages}</div></>}
     {panel==='customers'&&<><div className="tle-buyer-section-title"><h5>{t.customersLabel}</h5><span>{t.sample}</span></div><div className="tle-buyer-rows">{customers.map(r=><button key={r.id} type="button" onClick={()=>{setPanel('inbox');setSelected(r.id)}}><span><b>{r.customer}</b><small>{r.description}</small></span><span className="tle-buyer-status status-confirmed">{r.contact}</span></button>)}</div></>}
     {notice&&<p role="status" className="tle-buyer-inline-notice">{notice}</p>}
     <footer className="tle-buyer-inner-foot"><ShieldCheck size={13}/>{t.noMessages}</footer>
    </div>
    <nav className="tle-buyer-bottom-nav" aria-label="Buyer mobile navigation">{tabs.map(([id,Icon])=><button type="button" key={id} aria-current={panel===id?'page':undefined} onClick={()=>{setPanel(id);setSelected(null)}}><Icon size={19}/><small>{labels[id]}</small></button>)}</nav>
   </div>
  </div>
  <p className="tle-buyer-review-foot"><ShieldCheck size={15}/> Esta vista permite practicar sin usar registros de CB Depot ni de otros compradores. La app privada de producción y los correos reales permanecen separados. <a href="https://thelaunchera.com/command-center/" target="_blank" rel="noopener noreferrer">Abrir Command Center real <ExternalLink size={12}/></a></p>
 </section>
}
