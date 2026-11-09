import {useEffect,useState} from 'react';
import {Eye,EyeOff,RefreshCw} from 'lucide-react';
import {
 getClassroomDemoCatalog,setClassroomDemoVisibility,type ClassroomDemoEntry
} from './supabase-client';
import type {FinishedDemoPhoto} from './finished-demo-resources';
import type {DemoRebuildPrompt} from './demo-rebuild-prompts';

export type PublishableDemo={
 id:string;title:string;category:string;description:string;image:string;url:string;
 note:string;kind:'static'|'video'|'other'|'live';
 photos:FinishedDemoPhoto[];steps:DemoRebuildPrompt[];
};
const alias:Record<string,string>={
 'casa-brownie-static':'casa-brownie','jaramillo-boutique':'jaramillo',
 'soluna-yoga':'soluna','experience-cleaning':'cleaning'
};
const cats:Record<string,[string,string,string]>={
 'casa-brownie':['food','Repostería y comida','Food & bakery'],
 'crumb':['food','Repostería y comida','Food & bakery'],
 'aftr':['services','Eventos y entretenimiento','Events & entertainment'],
 'jaramillo':['fashion','Moda y accesorios','Fashion & accessories'],
 'yummm':['food','Cafetería y repostería','Coffee & bakery'],
 'wok-social':['food','Restaurante chino y hibachi','Chinese street kitchen & hibachi'],
 'soluna':['wellness','Bienestar y yoga','Wellness & yoga'],
 'ivory-bloom':['food','Pastelería de bodas','Wedding cakes'],
 'la-vie-in-pink':['food','Pastelería europea y desayunos','European pâtisserie & breakfast'],
 'nail-room':['beauty','Uñas y belleza','Nails & beauty'],
 'cleaning':['services','Servicios de limpieza','Residential cleaning']
};
const english:Record<string,string>={
 'casa-brownie':'Fictional brownie website with still photography, product sections and an optional animated hero.',
 'crumb':'Fictional cookie shop with product photographs, packaging and example interactions.',
 'aftr':'Nightclub concept with original editorial photographs and simulated guest experiences.',
 'jaramillo':'Fashion boutique concept with photography, collections and example shopping interactions.',
 'yummm':'Creative bakery and coffee website with product photos and non-transactional checkout examples.',
 'wok-social':'Fictional Chinese street kitchen demo with 14 original conceptual images, noodle and hibachi examples and an interactive non-transactional menu.',
 'soluna':'Yoga studio concept with class sections, studio photography and example memberships.',
 'ivory-bloom':'Wedding cake atelier with original cake photos, an editorial gallery and example inquiries.',
 'la-vie-in-pink':'Bilingual European pâtisserie concept with gourmet croissants, breakfasts, pastry gifts, original imagery and a preview-only membership.',
 'nail-room':'Editorial nail studio demo with approved pink ombré imagery, interactive mood banner, four example treatments, full-screen photo inspiration and preview-only appointments.',
 'cleaning':'Cleaning company demo with an example booking journey and no real charges.'
};
function toEntry(d:PublishableDemo):ClassroomDemoEntry{
 const id=alias[d.id]||d.id;
 const [category,category_es,category_en]=cats[id]||['services','Servicios','Services'];
 const brownie=id==='casa-brownie';
 return {
  id,title:brownie?'Casa Brownie':d.title,category,category_es,category_en,
  url:brownie?'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video':d.url,
  image:d.image,description_es:d.description,
  description_en:english[id]||'Educational website case study.',
  notes_es:d.note,
  notes_en:'Educational example. Forms, payments and bookings (if shown) are simulations.',
  published:false,
  ...(brownie?{video_url:'https://thelaunchera.com/demos/casa-brownie/'}:{}),
  photos:d.photos.filter(p=>/^https:\/\//.test(p.url)).map((p,i)=>({name:p.title,url:p.url,order:i+1})),
  prompts:d.steps.map((p,i)=>({
   title:p.title,step:p.step,body:p.prompt,order:i+1,
   photos:(p.photoCommands||[]).map(photo=>({title:photo.title,body:photo.prompt}))
  }))
 };
}
export function useClassroomDemoPublishing(){
 const [catalog,setCatalog]=useState<ClassroomDemoEntry[]|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  let alive=true;setLoading(true);setError('');
  void getClassroomDemoCatalog()
   .then(rows=>{if(alive)setCatalog(rows);})
   .catch(()=>{if(alive)setError('No se pudo consultar Inspiración del aula. Actualiza la selección.');})
   .finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[revision]);
 async function setVisible(d:PublishableDemo,visible:boolean){
  if(d.kind==='live')return;
  const entry=toEntry(d);
  setSaving(entry.id);setError('');setNotice('');
  try{
   const rows=await setClassroomDemoVisibility(entry,visible);
   setCatalog(rows);
   setNotice(visible?entry.title+' ya está disponible en el Aula, con sus recursos.':entry.title+' ya no está visible en el Aula; permanece en Studio.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar la selección.');}
  finally{setSaving('');}
 }
 return {catalog,loading,saving,error,notice,setVisible,refresh:()=>setRevision(n=>n+1)};
}
type Controller=ReturnType<typeof useClassroomDemoPublishing>;
export function ClassroomDemoPublication({demo,control}:{demo:PublishableDemo;control:Controller}){
 const entry=toEntry(demo);
 const found=control.catalog?.find(d=>d.id===entry.id);
 const visible=!!found&&found.published!==false;
 const syncNeeded=visible&&((found.photos?.length||0)<entry.photos.length||(found.prompts?.length||0)<entry.prompts.length);
 const busy=control.loading||!!control.saving||!control.catalog;
 return <div className="finished-demo-classroom-controls" aria-label={'Disponibilidad de '+demo.title+' en el aula'}>
  <span className={visible?'finished-demo-classroom-status published':'finished-demo-classroom-status'}>
   {demo.kind==='live'?'Solo privado · cliente real':control.loading?'Consultando…':visible?'Visible para alumnos':found?'Oculto para alumnos':'No añadido al aula'}
  </span>
  {demo.kind==='live'
   ?<p>Este proyecto pertenece a un cliente real. No se publica automáticamente por privacidad.</p>
   :<div className="finished-demo-classroom-buttons">
      <button type="button" disabled={busy} onClick={()=>void control.setVisible(demo,!visible)}>
       {visible?<EyeOff size={15}/>:<Eye size={15}/>}
       {control.saving===entry.id?'Guardando…':visible?'Quitar del Aula':'Agregar al Aula'}
      </button>
      {syncNeeded&&<button type="button" className="finished-demo-sync" disabled={busy}
       onClick={()=>void control.setVisible(demo,true)}><RefreshCw size={14}/> Actualizar fotos y prompts</button>}
    </div>}
  {entry.id==='casa-brownie'&&<small>Las dos versiones de Casa Brownie comparten el mismo caso en el aula.</small>}
 </div>;
}
export function ClassroomDemoPublishingSummary({control}:{control:Controller}){
 return <>
  <div className="finished-demo-classroom-summary">
   <div><strong>Demos disponibles en el Aula</strong><span>Cada demo terminado incluye la opción «Agregar al Aula». Por defecto permanece en Studio; tú decides si mostrarlo a los alumnos.</span></div>
   <span>{control.loading?'Consultando…':control.catalog?control.catalog.filter(d=>d.published!==false).length+' visibles':'No disponible'}</span>
   <button type="button" disabled={control.loading||!!control.saving} onClick={control.refresh}><RefreshCw size={15}/> Actualizar</button>
  </div>
  {control.error&&<p className="finished-demo-publish-error" role="alert">{control.error}</p>}
  {control.notice&&<p className="finished-demo-publish-notice" role="status">{control.notice}</p>}
 </>;
}
