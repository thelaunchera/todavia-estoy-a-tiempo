import { useState, useRef } from 'react';
import {
  LayoutDashboard, ShoppingBag, CreditCard, Mail, Gift, PanelsTopLeft,
  ShieldCheck, Users, Globe2, ExternalLink, ArrowUpRight, ArrowLeft,
  CalendarDays, Workflow, Link2, BookOpen, SearchCheck, LifeBuoy,
} from 'lucide-react';
import './operations-center.css';

export type OperationsDestination =
  | 'ventas' | 'inquiries' | 'productos' | 'links' | 'freebies'
  | 'demos' | 'soporte' | 'flujos' | 'seo' | 'audiencia' | 'calendario'
  | 'alumnos';

type CategoryId = 'clientes' | 'cobros' | 'correos' | 'recursos' | 'demos' | 'soporte';
type Category = {
  id: CategoryId;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
  kicker: string;
  details: string;
  primary: { label: string; page: OperationsDestination };
  more: { label: string; page: OperationsDestination }[];
};
const GROUPS: Category[] = [
  {
    id: 'clientes', title: 'Ventas y clientes', icon: ShoppingBag,
    kicker: 'CLIENTES / INGRESOS',
    description: 'Compras y solicitudes en un solo recorrido.',
    details: 'Abre los módulos que ya registran ventas y solicitudes. No creamos otra lista de clientes.',
    primary: {label:'Ver ventas verificadas',page:'ventas'},
    more: [{label:'Solicitudes de website',page:'inquiries'},{label:'Centro de productos',page:'productos'},{label:'Alumnos',page:'alumnos'}],
  },
  {
    id: 'cobros', title: 'Cobros y entregas', icon: CreditCard,
    kicker: 'WEBSITE / PAGOS',
    description: 'Pagos confirmados y proyectos por entregar.',
    details: 'Confirma el website terminado desde la administración protegida. La mensualidad de IA + CRM se cuenta desde la entrega, no desde el checkout.',
    primary: {label:'Ver solicitudes',page:'inquiries'},
    more: [{label:'Ingresos',page:'ventas'},{label:'Estado de automatizaciones',page:'flujos'}],
  },
  {
    id: 'correos', title: 'Email Center', icon: Mail,
    kicker: 'ENVÍOS / CALENDARIO',
    description: 'Newsletter, freebies y correos de compradores.',
    details: 'Las bienvenidas y los correos de compra dependen de los eventos verificados. Los envíos editoriales requieren recursos publicados, consentimiento y aprobación.',
    primary: {label:'Calendario editorial',page:'calendario'},
    more: [{label:'Audiencia y consentimiento',page:'audiencia'},{label:'Automatizaciones',page:'flujos'}],
  },
  {
    id: 'recursos', title: 'Freebie Library', icon: Gift,
    kicker: 'CREACIÓN / RECURSOS',
    description: 'Freebies y lanzamientos, sin duplicar archivos.',
    details: 'La biblioteca mantiene los recursos y sus enlaces originales. Un anuncio por pack de freebies del mes, solo después de aprobar la publicación.',
    primary: {label:'Abrir biblioteca de freebies',page:'freebies'},
    more: [{label:'Centro de enlaces',page:'links'},{label:'Calendario editorial',page:'calendario'}],
  },
  {
    id: 'demos', title: 'Demos y proyectos', icon: PanelsTopLeft,
    kicker: 'PORTFOLIO / BRANDING',
    description: 'Cada demo con su identidad y recursos propios.',
    details: 'Abre tus demos guardados y su centro de enlaces. El Studio permanece privado y no comparte proyectos con el Content Lab comercial.',
    primary: {label:'Ver demos',page:'demos'},
    more: [{label:'Centro de enlaces',page:'links'},{label:'Centro de productos',page:'productos'}],
  },
  {
    id: 'soporte', title: 'QA y soporte', icon: ShieldCheck,
    kicker: 'CALIDAD / AYUDA',
    description: 'Mensajes, SEO y revisión de automatizaciones.',
    details: 'Revisa las incidencias desde el buzón y los módulos existentes. No se presentan pruebas automáticas como aprobadas sin verificar sus resultados.',
    primary: {label:'Abrir soporte',page:'soporte'},
    more: [{label:'Sitios y SEO',page:'seo'},{label:'Revisar flujos',page:'flujos'}],
  },
];
const EXTERNAL_LINKS: Record<CategoryId, {label: string; url: string}[]> = {
  clientes: [],
  cobros: [{label:'Administración de entregas',url:'https://thelaunchera.com/website-delivery-admin/'}],
  correos: [
    {label:'Revisar correos en Resend',url:'https://resend.com/emails'},
    {label:'Newsletter en Make',url:'https://us2.make.com/2964061/scenarios/6930009'},
    {label:'Correo de compra en Make',url:'https://us2.make.com/2964061/scenarios/6930010'},
  ],
  recursos: [],
  demos: [],
  soporte: [],
};
const SCHEDULE = [
  {date:'01',title:'Freebie del mes',description:'Un solo anuncio para los recursos publicados y aprobados.'},
  {date:'15',title:'Newsletter editorial',description:'Una edición aprobada; no se envía automáticamente si no hay contenido.'},
];

export default function OperationsCenter({onNavigate}:{onNavigate:(page:OperationsDestination)=>void}) {
  const [selected,setSelected]=useState<CategoryId|null>(null);
  const detailsRef=useRef<HTMLElement>(null);
  const current=GROUPS.find(x=>x.id===selected);
  const open=(id:CategoryId)=>{
    setSelected(id);
    window.requestAnimationFrame(()=>detailsRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  };
  return <div className="tle-ops">
    <header className="tle-ops-intro">
      <div>
        <span className="tle-ops-overline"><LayoutDashboard size={15} aria-hidden="true"/> THE LAUNCH ERA / PRIVATE OPERATIONS</span>
        <h2>Todo tu negocio. <em>Un solo Studio.</em></h2>
        <p>Entra al módulo que necesitas. Las herramientas y los registros siguen en sus lugares originales: no se duplican clientes, correos ni proyectos.</p>
      </div>
      <div className="tle-ops-mark" aria-hidden="true">TLE<span>.</span></div>
    </header>
    <div className="tle-ops-grid" aria-label="Centro de operaciones privado">
      {GROUPS.map(group=>{
        const Icon=group.icon;
        return <button type="button" key={group.id} className={'tle-ops-tile'+(selected===group.id?' selected':'')} aria-pressed={selected===group.id} onClick={()=>open(group.id)}>
          <span className="tle-ops-icon"><Icon size={22} strokeWidth={1.75}/></span>
          <strong>{group.title}</strong>
          <span className="tle-ops-summary">{group.description}</span>
          <span className="tle-ops-card-action">Abrir sección <ArrowUpRight size={15}/></span>
        </button>;
      })}
    </div>
    {current&&<section ref={detailsRef} className="tle-ops-details" aria-label={'Opciones de '+current.title}>
      <div className="tle-ops-detail-heading">
        <div><span className="tle-ops-eyebrow">{current.kicker}</span><h3>{current.title}</h3></div>
        <button type="button" className="tle-ops-close" onClick={()=>setSelected(null)} aria-label="Cerrar detalles"><ArrowLeft size={16}/> Volver</button>
      </div>
      <p>{current.details}</p>
      {current.id==='correos'&&<div className="tle-ops-schedule" aria-label="Calendario de comunicaciones">
        {SCHEDULE.map(x=><div key={x.date}><b>{x.date}<small> / MES</small></b><span><strong>{x.title}</strong><small>{x.description}</small></span></div>)}
      </div>}
      <div className="tle-ops-links">
        <button type="button" className="tle-ops-primary" onClick={()=>onNavigate(current.primary.page)}>
          {current.primary.label}<ArrowUpRight size={16}/>
        </button>
        {current.more.map(link=><button type="button" key={link.page} className="tle-ops-secondary" onClick={()=>onNavigate(link.page)}>{link.label}<ArrowUpRight size={15}/></button>)}
        {EXTERNAL_LINKS[current.id].map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="tle-ops-secondary">{link.label}<ExternalLink size={15}/></a>)}
      </div>
      {current.id==='correos'&&<p className="tle-ops-footnote">Estado: las bienvenidas son automáticas; las campañas editoriales del día 1 y 15 necesitan edición y aprobación. Revisa entregas y fallos en Resend.</p>}
      {current.id==='cobros'&&<p className="tle-ops-footnote">La administración de entregas requiere autorización de propietario. No confirma ninguna compra ni activa cobros al abrirla.</p>}
    </section>}
    <footer className="tle-ops-footer"><ShieldCheck size={15}/> Administración privada de The Launch Era · Ningún enlace público concede acceso al Studio.</footer>
  </div>;
}
