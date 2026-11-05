import {useState} from 'react';
import PrivateDemoKits from './PrivateDemoKits';
import {goldenGridPhotos, goldenGridRebuildPrompts, goldenGridDrive} from './golden-grid-kit';
import {sovaPhotos, sovaRebuildPrompts, sovaDrive} from './sova-kit';
import {mareaDrive} from './marea-kit';
import {havana19Photos,havana19RebuildPrompts,havana19Drive} from './havana19-kit';
import {lavenderPhotos,lavenderRebuildPrompts,lavenderDrive,lavenderOriginalPrompts} from './lavender-kit';
import {Film, Camera, BookOpen, FolderOpen, Copy} from 'lucide-react';
import {demoRebuildPrompts} from './demo-rebuild-prompts';
import {aftrRebuildPrompts} from './aftr-rebuild-prompts';
import {solunaPhotos} from './soluna-photos';
import {ivoryBloomPhotos} from './ivory-bloom-photos';
import {ivoryBloomRebuildPrompts} from './ivory-bloom-rebuild-prompts';
import {additionalDemoPhotos, additionalDemoPrompts, mareaPhotos, mareaRebuildPrompts, type FinishedDemoPhoto} from './finished-demo-resources';
import {ClassroomDemoPublication,ClassroomDemoPublishingSummary,useClassroomDemoPublishing} from './ClassroomDemoPublishing';
import './finished-demos.css';

import {solunaRebuildPrompts} from './soluna-rebuild-prompts';
const studioDemoPrompts = {...demoRebuildPrompts, aftr: aftrRebuildPrompts, soluna: solunaRebuildPrompts, 'ivory-bloom': ivoryBloomRebuildPrompts, ...additionalDemoPrompts, 'golden-grid': goldenGridRebuildPrompts, sova: sovaRebuildPrompts, marea: mareaRebuildPrompts, 'havana-19': havana19RebuildPrompts, 'lavender-edit': lavenderRebuildPrompts};

type Demo = {
 id:string; title:string; category:string; description:string; image:string;
 url:string; source:string; note:string; kind:'static'|'video'|'other'|'live';
 promptsFor:keyof typeof studioDemoPrompts;
 photos:FinishedDemoPhoto[];
};
const finishedDemos:Demo[]=[
 {
  id:'lavender-edit',
  title:'The Lavender Edit · Soft Beauty Editorial',
  category:'Belleza editorial · campaña conceptual bilingüe',
  description:'Una landing de belleza editorial en tonos lavanda y marfil, construida con ocho fotografías originales individuales, con secciones de ritual, textura, gifting y galería.',
  image:lavenderPhotos[0].url,
  url:'https://thelaunchera.com/demos/lavender-edit/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/lavender-edit',
  note:'Concepto ficticio, no tienda real. Kit privado: 8 PNG originales en Drive, 8 prompts de recreación, documento de prompts fuente y 6 pasos de construcción. Sin checkout, descuentos ni promesas de producto.',
  kind:'other',
  photos:lavenderPhotos,
  promptsFor:'lavender-edit',
 },
 {
  id:'havana-19',
  title:'Havana 19 · Cuban Cuisine · Boston',
  category:'Restaurante cubano de lujo · website bilingüe',
  description:'Web editorial directamente en GitHub: portada luminosa, historia, platos cubanos, servicio, galería y formulario de reservas ilustrativo. Doce fotografías distintas en la página.',
  image:havana19Photos[0].url,
  url:'https://thelaunchera.com/demos/havana-19/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/havana-19',
  note:'Concepto ficticio. Reservas solo de muestra, sin envíos ni disponibilidad real. Kit privado con 13 fotos individuales de archivo (una fachada anterior no se publica), prompts de recreación y 7 pasos de construcción directa en GitHub.',
  kind:'other',
  photos:havana19Photos,
  promptsFor:'havana-19',
 },

 {
  id:'marea-wigs-miami',
  title:'Marea Wigs · Miami',
  category:'Pelucas · marca editorial y website bilingüe',
  description:'Catorce fotografías originales, colección de cuatro looks, filtros, favoritos, buscador de estilo, moodboard ampliable y consulta local de demostración.',
  image:mareaPhotos[12].url,
  url:'https://thelaunchera.com/demos/marea-wigs-miami/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/demo-source/marea-wigs-miami',
  note:'Marca conceptual creada con AppDeploy y publicada en GitHub. Conserva los 14 PNG y sus prompts originales, la carpeta Drive y seis pasos de reconstrucción. No procesa compras, citas ni envía consultas.',
  kind:'other',
  photos:mareaPhotos,
  promptsFor:'marea',
 },
 {
  id:'sova',
  title:'SOVA Headphones',
  category:'Audífonos · marca y website bilingüe',
  description:'Demo editorial con tu fotografía original, diez imágenes individuales, colección por colores, bolsa de demostración y galería con descarga PNG.',
  image:sovaPhotos[0].url,
  url:'https://thelaunchera.com/demos/sova/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/demo-source/sova',
  note:'Diez PNG originales publicados con autorización de la propietaria. Incluye los prompts originales de las fotografías y seis pasos de reconstrucción. No recibe pedidos ni pagos.',
  kind:'other',
  photos:sovaPhotos,
  promptsFor:'sova',
 },
 {
  id:'golden-grid',
  title:'Golden Grid · Waffle Co.',
  category:'Marca de waffles · branding y website bilingüe',
  description:'Demo editorial con nueve imágenes originales, waffles, mezcla y empaques. Incluye colección con detalles, historia, galería ampliable, selector español/inglés y contacto de demostración.',
  image:goldenGridPhotos[0].url,
  url:'https://thelaunchera.com/demos/golden-grid/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/demo-source/golden-grid',
  note:'Marca conceptual. No acepta pedidos ni pagos y el contacto no envía ni guarda datos. Kit con nueve fotos originales, prompts de recreación y cuatro pasos de reconstrucción.',
  kind:'other',
  photos:goldenGridPhotos,
  promptsFor:'golden-grid',
 },

 {
  id:'casa-brownie-static',
  title:'Casa Brownie · Foto estática',
  category:'Web de brownies · clase principal',
  description:'La misma web aprobada con fotografía fija en el hero. Úsala como referencia mientras grabas la construcción de Casa Brownie desde cero.',
  image:'https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp',
  url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/casa-brownie',
  note:'Sin video en el hero. Es una vista del mismo demo oficial, no una copia ni una segunda web.',
  kind:'static',
  photos:additionalDemoPhotos['casa-brownie'],
  promptsFor:'casa-brownie',
 },

 {
  id:'casa-brownie',
  title:'Casa Brownie · Con video',
  category:'Web de brownies · bono final',
  description:'La misma web con el hero animado. Úsala para mostrar el antes y después cuando presentes el bono del video.',
  image:'https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp',
  url:'https://thelaunchera.com/demos/casa-brownie/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/casa-brownie',
  note:'Versión con video: reservar para el bono, después de grabar la web con foto estática.',
  kind:'video',
  photos:additionalDemoPhotos['casa-brownie'],
  promptsFor:'casa-brownie',
 },

 {
  id:'crumb',
  title:'CRUMB',
  category:'Tienda de cookies · demo interactivo',
  description:'Identidad de marca, seis sabores, fotografías, caja personalizada y entrega local de demostración.',
  image:'https://thelaunchera.com/demos/crumb/assets/CRUMB_Storefront_Approved_20261030.webp?v=20261030-studio',
  url:'https://thelaunchera.com/demos/crumb/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/crumb',
  note:'Demo ficticio: no acepta pedidos ni pagos reales.',
  kind:'other',
  photos:additionalDemoPhotos['crumb'],
  promptsFor:'crumb',
 },

 {
  id:'aftr',
  title:'AFTR. · Las Vegas',
  category:'Nightclub de lujo · demo de branding y website',
  description:'Chrome Afterglow: identidad futurista, ocho fotografías originales, eventos, lineup, guest list y experiencias VIP en una web responsive.',
  image:'https://thelaunchera.com/demos/aftr/assets/hero-real-20261031.webp',
  url:'https://thelaunchera.com/demos/aftr/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/aftr',
  note:'Concepto ficticio 21+. Las reservas, entradas, ofertas y formularios solo se simulan; no hay cobros ni datos reales.',
  kind:'other',
  photos:additionalDemoPhotos['aftr'],
  promptsFor:'aftr',
 },

 {
  id:'jaramillo-boutique',
  title:'Jaramillo Boutique · Fashion Editorial',
  category:'Boutique de moda femenina · demo de website y selección de looks',
  description:'Muestra la identidad editorial de una diseñadora de moda colombiana en EE. UU.: jeans colombianos, outfits de noche, colecciones por temporada, selección de tallas y bolsa de favoritos.',
  image:'https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/assets/hero-editorial-user.jpg',
  url:'https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/',
  source:'https://github.com/thelaunchera/demo-booking-landing-/tree/demo/jaramillo-boutique/demos/jaramillo-boutique',
  note:'Vista demostrativa de la boutique: la selección de prendas permite consultar interés, pero no procesa pagos. Disponibilidad, precios definitivos y datos de tiendas requieren confirmación.',
  kind:'other',
  photos:additionalDemoPhotos['jaramillo-boutique'],
  promptsFor:'jaramillo-boutique',
 },

 {
  id:'yummm',
  title:'YUMMM · Coffee, Bakery & Sweets',
  category:'Cafetería y bakery · demo de tienda creativa',
  description:'Concepto original con cafetería, cookies, repostería, vitrina de productos y caja interactiva. Incluye selección de productos, cantidades y subtotal de muestra.',
  image:'https://thelaunchera.github.io/demo-booking-landing-/yummm/images/10.webp',
  url:'https://thelaunchera.github.io/demo-booking-landing-/yummm/',
  source:'https://github.com/thelaunchera/demo-booking-landing-/tree/main/demos/yummm',
  note:'Concepto ficticio; el catálogo y los precios son ilustrativos. No se aceptan pedidos ni pagos reales.',
  kind:'other',
  photos:additionalDemoPhotos['yummm'],
  promptsFor:'yummm',
 },

 {
  id:'la-vie-in-pink',
  title:'La Vie in Pink · European Pâtisserie',
  category:'Croissants gourmet, desayunos europeos y pastries · demo bilingüe',
  description:'Website de pâtisserie europea en español e inglés: fachada editorial, croissants, desayunos, regalos, galería, historia y personas, membresía de muestra y contacto. Construido con AppDeploy.',
  image:additionalDemoPhotos['la-vie-in-pink'][0].url,
  url:'https://thelaunchera.com/demos/la-vie-in-pink/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/demo-source/la-vie-in-pink',
  note:'Demo publicado en GitHub, con 10 fotografías originales del proyecto y 4 pasos educativos de reconstrucción. No procesa pedidos ni pagos reales; las funciones de membresía son de demostración.',
  kind:'other',
  photos:additionalDemoPhotos['la-vie-in-pink'],
  promptsFor:'la-vie-in-pink',
 },

 {
  id:'soluna-yoga',
  title:'SOLUNA Yoga · Fort Lauderdale',
  category:'Estudio de yoga · lanzamiento y membresías',
  description:'Demo editorial para un estudio de yoga en Fort Lauderdale: hero fotográfico, clases interactivas, bienvenida del 30%, membresías y SOLUNA Shop con matcha y ropa conceptual.',
  image:solunaPhotos[0].url,
  url:'https://thelaunchera.github.io/demo-booking-landing-/soluna-yoga/',
  source:'https://github.com/thelaunchera/demo-booking-landing-/tree/main/demos/soluna-yoga',
  note:'Concepto ficticio: la lista de espera es una simulación local, no se envían emails ni se realizan cobros. Incluye 13 fotos originales individuales, con sus prompts y enlaces.',
  kind:'other',
  photos:solunaPhotos,
  promptsFor:'soluna',
 },

 {
  id:'ivory-bloom',
  title:'IVORY & BLOOM · Wedding Cake Atelier',
  category:'Pastelería de bodas · branding, galería y solicitudes personalizadas',
  description:'Demo editorial con 17 fotografías individuales aprobadas: cakes negros, rosa, amarillo mantequilla, marfil, atelier y celebración con cake azul. Hero con cake artist, galería con diseños únicos y formulario mobile-first.',
  image:ivoryBloomPhotos[0].url,
  url:'https://thelaunchera.com/demos/ivory-and-bloom/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/ivory-and-bloom',
  note:'Concepto ficticio. Los formularios simulan la solicitud; no se reciben pedidos, no se procesan pagos ni se envían datos a una tienda real. Incluye 17 fotos individuales y sus prompts de recreación.',
  kind:'other',
  photos:ivoryBloomPhotos,
  promptsFor:'ivory-bloom',
 },

 {
  id:'cb-depot',
  title:'CB Depot · Mobile Detailing',
  category:'Proyecto de cliente · web y reservas de detailing',
  description:'Proyecto real para un negocio de detailing móvil: identidad visual, fotografías de vehículos, catálogo de servicios y recorrido para solicitar una cita o cotización.',
  image:'https://thelaunchera.com/assets/clients/cb-depot/photos/hero-desktop.webp',
  url:'https://cb-depot-booking.pages.dev/',
  source:'https://github.com/thelaunchera/cb-depot-booking',
  note:'Proyecto de cliente real. El formulario puede recibir reservas y solicitudes auténticas: no lo utilices para pruebas ni compartas información privada del cliente.',
  kind:'live',
  photos:additionalDemoPhotos['cb-depot'],
  promptsFor:'cb-depot',
 },

 {
  id:'experience-cleaning',
  title:'Experience Cleaning · Booking Journey',
  category:'Limpieza residencial y comercial · demo interactivo actualizado',
  description:'El demo más reciente de limpieza: servicios con fotografías, reserva residencial de muestra, solicitud de estimado comercial y recorrido conectado al Command Center de la dueña.',
  image:'https://thelaunchera.com/assets/cleaning-demo/hero-cleaner-original.jpg',
  url:'https://thelaunchera.com/experience-cleaning/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/experience-cleaning',
  note:'Demo pública y segura, con información ilustrativa. No crea reservas, no cobra ni modifica datos reales. El Command Center mostrado pertenece a la simulación, no a una cuenta privada.',
  kind:'other',
  photos:additionalDemoPhotos['experience-cleaning'],
  promptsFor:'experience-cleaning',
 },
];
export default function FinishedDemos({onOpenClass,entries=[]}:{onOpenClass:()=>void;entries?:{id:string;title:string;section?:string;notes?:string}[]}){
 const [copied,setCopied]=useState('');
 const [notice,setNotice]=useState('');
 const classroom=useClassroomDemoPublishing();
 async function copy(text:string,key:string,kind:'prompt'|'link'='prompt') {
   try {await navigator.clipboard.writeText(text);setCopied(key);setNotice(kind==='link'?'Enlace de la foto copiado.':'Prompt copiado.');}
   catch {setNotice('Selecciona el texto para copiarlo manualmente.');}
 }
 return <section className="finished-demos" aria-label="Biblioteca de demos terminados">
   <div className="finished-demos-intro">
     <span className="finished-demos-eyebrow"><FolderOpen size={16}/> BIBLIOTECA PRIVADA · RESULTADOS FINALES</span>
     <h2>Demos terminados, <em>en un solo lugar.</em></h2>
     <p>Tu biblioteca reúne The Lavender Edit, Havana 19, Marea Wigs · Miami, SOVA Headphones, Casa Brownie (con foto y con video), CRUMB, AFTR. Las Vegas, Jaramillo Boutique, YUMMM, La Vie in Pink, Golden Grid, SOLUNA Yoga, IVORY & BLOOM, CB Depot y Experience Cleaning. Distingue los conceptos de práctica, las vistas de boutique y los proyectos reales de cliente. Las dos vistas de Casa Brownie comparten una misma web: solo cambia el hero.</p>
     <ClassroomDemoPublishingSummary control={classroom}/>
   </div>
   <PrivateDemoKits entries={entries} publishedBrands={['sova']}/>
   <div className="finished-demos-grid">
   {finishedDemos.map(d=><article key={d.id} className="finished-demo-card">
     <div className="finished-demo-image"><img src={d.image} loading="lazy" alt={'Vista de '+d.title}/><span className={'finished-demo-variant finished-demo-variant-'+d.kind}>{d.kind==='static'?<Camera size={14}/>:d.kind==='video'?<Film size={14}/>:null} {d.kind==='static'?'SIN VIDEO':d.kind==='video'?'CON VIDEO':d.kind==='live'?'PROYECTO REAL':'DEMO INTERACTIVO'}</span></div>
     <div className="finished-demo-body">
       <span className="finished-demo-status">{d.kind==='live'?'Proyecto entregado':'Demo terminado'}</span>
       <h3>{d.title}</h3><p className="finished-demo-category">{d.category}</p>
       <p>{d.description}</p>
       <ClassroomDemoPublication control={classroom} demo={{
         id:d.id,title:d.title,category:d.category,description:d.description,
         image:d.image,url:d.url,note:d.note,kind:d.kind,photos:d.photos,
         steps:studioDemoPrompts[d.promptsFor]
       }}/>
       <div className="finished-demo-actions">
         <a href={d.url} target="_blank" rel="noopener noreferrer">{d.kind==='static'?'Abrir versión con foto':d.kind==='video'?'Abrir versión con video':d.kind==='live'?'Ver sitio del cliente':'Abrir demo'}</a>
         <a href={d.source} target="_blank" rel="noopener noreferrer" className="finished-demo-secondary">Ver en repositorio</a>
       </div>
       {d.id==='golden-grid'&&<p><a href={goldenGridDrive} target="_blank" rel="noopener noreferrer">Abrir carpeta de fotos en Drive</a></p>}
       {d.id==='sova'&&<p><a href={sovaDrive} target="_blank" rel="noopener noreferrer">Abrir carpeta de fotos en Drive</a></p>}
       {d.id==='havana-19'&&<p><a href={havana19Drive} target="_blank" rel="noopener noreferrer">Abrir carpeta Havana 19 en Drive</a></p>}
       {d.id==='lavender-edit'&&<p><a href={lavenderDrive} target="_blank" rel="noopener noreferrer">Abrir las 8 fotografías de Lavanda en Drive</a> · <a href={lavenderOriginalPrompts} target="_blank" rel="noopener noreferrer">Prompts originales disponibles</a></p>}
       {d.id==='marea-wigs-miami'&&<p><a href={mareaDrive} target="_blank" rel="noopener noreferrer">Abrir carpeta de fotos en Drive</a></p>}
       <small>{d.note}</small>
       <details className="finished-demo-kit">
         <summary><span>Ver kit completo: fotos + prompts + pasos</span><span>{d.photos.length} fotos · {studioDemoPrompts[d.promptsFor].length} pasos</span></summary>
         <h4 className="finished-demo-kit-heading">Fotografías y prompts de cada imagen</h4>
         <p>Imágenes del proyecto, enlaces y prompts para crear fotografías similares. Los pasos para reconstruir la web se guardan en este mismo kit. Los prompts de referencia no deben confundirse con los textos originales cuando estos no están documentados.</p>
         <div className="finished-demo-photos-grid">
           {d.photos.map(photo=><div className="finished-demo-photo-tile" key={photo.key}>
             <a href={photo.url} target="_blank" rel="noopener noreferrer" aria-label={'Abrir fotografía '+photo.title}>
               <img src={photo.url} alt={photo.title} loading="lazy" decoding="async"/>
             </a>
             <div className="finished-demo-photo-meta">
               <strong>{photo.title}</strong>
               <span>{photo.placement}</span>
               <div className="finished-demo-photo-actions">
                 <a href={photo.url} target="_blank" rel="noopener noreferrer">Abrir foto</a>
                 <button type="button" onClick={()=>void copy(photo.url,d.id+'-photo-url-'+photo.key,'link')}>{copied===d.id+'-photo-url-'+photo.key?'Copiado':'Copiar enlace'}</button>
               </div>
               {!!photo.prompt&&<details className="finished-demo-photo-instructions">
                 <summary>Ver prompt de esta foto</summary>
                 <p>{photo.prompt}</p>
                 <button type="button" onClick={()=>void copy(photo.prompt,d.id+'-photo-prompt-'+photo.key)}><Copy size={13}/>{copied===d.id+'-photo-prompt-'+photo.key?'Copiado':'Copiar prompt'}</button>
               </details>}
             </div>
           </div>)}
         </div>
       <div className="finished-demo-prompts">
         <h4 className="finished-demo-kit-heading">Pasos y prompts para reconstruir la web</h4>
         <div className="finished-demo-prompt-list">
           <p className="finished-demo-prompt-context">Guía privada de grabación: qué decir, qué mostrar y qué copiar en cada paso. Los prompts que se conservaron originalmente se mantienen; otros se han reconstruido como instrucciones de práctica. Nunca construyas las pruebas encima del demo oficial ni sobre la web de un cliente.</p>
           <div className="finished-demo-photo-guide" aria-label="Regla para fotografías en ChatGPT">
             <strong>Cómo pedir fotos sin confundir a ChatGPT</strong>
             <p><b>Fotografía individual:</b> copia UN comando, pide UNA imagen en UN archivo, revisa el resultado y solo después pasa a la siguiente. Nunca solicites seis fotos en un mismo mensaje: puede devolver un collage o mezclar sabores.</p>
             {d.id==='ivory-bloom'
               ? <p><b>Colección IVORY & BLOOM:</b> 17 fotos individuales publicadas, cada una con su prompt y enlace. Hero con la cake artist, galería de cakes distintos en negro, rosa y amarillo mantequilla, y novios cortando el pastel azul solamente debajo de la galería. No generes collages.</p>
               : d.id==='soluna-yoga'
               ? <p><b>Colección SOLUNA:</b> 13 fotografías reales del concepto, cada una como archivo independiente. Hero cinematográfico, foto tabletop, estudio, clases, matcha y tres fotografías separadas de ropa. No uses un collage como imagen final.</p>
               : <p><b>Brand board:</b> cuando el ejercicio lo pida, puedes crear una composición de referencia; las fotografías finales siempre deben generarse y guardarse por separado.</p>}
             <p><b>Para que quede como el demo aprobado:</b> adjunta las fotografías originales de referencia. Un prompt de generación ayuda a mantener el estilo, pero por sí solo no reproduce píxel por píxel una foto anterior.</p>
           </div>
           {studioDemoPrompts[d.promptsFor].map((item,i)=>(
             <article className="finished-demo-prompt" key={d.id+'-'+i}>
               <div className="finished-demo-prompt-heading">
                 <div><span>{item.step}</span><h4>{item.title}</h4></div>
               </div>
               <div className="finished-demo-lesson-talk">
                 <div className="finished-demo-lesson-label">
                   <strong>Lo que digo durante la clase</strong>
                   <button type="button" onClick={()=>void copy(item.say,d.id+'-say-'+i)}><Copy size={13}/>{copied===d.id+'-say-'+i?'Copiado':'Copiar guion'}</button>
                 </div>
                 <p>{item.say}</p>
                 <p className="finished-demo-show"><b>Qué muestro en pantalla:</b> {item.show}</p>
               </div>
               <div className="finished-demo-command">
                 <div className="finished-demo-lesson-label">
                   <strong>Prompt para pegar en ChatGPT</strong>
                   <button type="button" onClick={()=>void copy(item.prompt,d.id+'-prompt-'+i)}><Copy size={13}/>{copied===d.id+'-prompt-'+i?'Copiado':'Copiar prompt'}</button>
                 </div>
                 <p>{item.prompt}</p>
               </div>
               {!!item.photoCommands?.length&&<details className="finished-demo-photo-steps">
                 <summary>Comandos de fotos individuales <span>{item.photoCommands.length} fotos · una por vez</span></summary>
                 <p className="finished-demo-photo-help">Copia solo un comando y genera UNA imagen. Comprueba la fotografía y apruébala antes de continuar. No pegues los comandos juntos.</p>
                 {item.photoCommands.map((photo,j)=><div className="finished-demo-photo-step" key={photo.title}>
                   <div className="finished-demo-lesson-label">
                     <strong>{photo.title}</strong>
                     <button type="button" onClick={()=>void copy(photo.prompt,d.id+'-photo-'+i+'-'+j)}><Copy size={13}/>{copied===d.id+'-photo-'+i+'-'+j?'Copiado':'Copiar foto'}</button>
                   </div>
                   {!!photo.imageUrl&&<a href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="finished-demo-photo-reference"><img src={photo.imageUrl} loading="lazy" decoding="async" alt={'Referencia fotográfica aprobada: '+photo.title}/><span>Abrir foto de referencia</span></a>}
                   <p>{photo.prompt}</p>
                 </div>)}
               </details>}
             </article>
           ))}
         </div>
       </div>
       </details>
     </div>
   </article>)}
   </div>
   <p className="finished-demos-prompt-notice" role="status">{notice}</p>
   <div className="finished-demos-class-note">
    <BookOpen size={20}/>
    <div><strong>El demo de AppDeploy desde cero no va aquí.</strong>
    <p>Es tu punto de partida para grabar Casa Brownie. Lo encontrarás en <b>Clases · grabación</b>, junto al video que estás preparando.</p></div>
    <button type="button" onClick={onOpenClass}>Ir a grabar <Film size={16}/></button>
   </div>
 </section>;
}
