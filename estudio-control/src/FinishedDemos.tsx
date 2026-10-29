import {ExternalLink, Film, BookOpen, CheckCircle2, FolderOpen} from 'lucide-react';
import './finished-demos.css';

type Demo = {
 id:string; title:string; category:string; description:string; image:string;
 url:string; source:string; note:string;
};
const finishedDemos:Demo[]=[
 {
  id:'casa-brownie',
  title:'Casa Brownie',
  category:'Web de brownies · resultado final',
  description:'Demo terminado para mostrar el resultado de la clase. El proceso de reconstrucción empieza aparte, desde una app vacía.',
  image:'https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp',
  url:'https://thelaunchera.com/demos/casa-brownie/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/casa-brownie',
  note:'El video del hero pertenece al bono, no a la primera grabación.'
 },
 {
  id:'crumb',
  title:'CRUMB',
  category:'Tienda de cookies · demo interactivo',
  description:'Identidad de marca, seis sabores, fotografías, caja personalizada y entrega local de demostración.',
  image:'https://thelaunchera.com/demos/crumb/assets/hero-mobile.webp',
  url:'https://thelaunchera.com/demos/crumb/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/crumb',
  note:'Demo ficticio: no acepta pedidos ni pagos reales.'
 }
];
export default function FinishedDemos({onOpenClass}:{onOpenClass:()=>void}){
 return <section className="finished-demos" aria-label="Biblioteca de demos terminados">
   <div className="finished-demos-intro">
     <span className="finished-demos-eyebrow"><FolderOpen size={16}/> BIBLIOTECA PRIVADA · RESULTADOS FINALES</span>
     <h2>Demos terminados, <em>en un solo lugar.</em></h2>
     <p>Aquí encuentras las versiones aprobadas para enseñar o consultar. Cada demo abre su web oficial y su carpeta editable en el repositorio.</p>
   </div>
   <div className="finished-demos-grid">
   {finishedDemos.map(d=><article key={d.id} className="finished-demo-card">
     <div className="finished-demo-image"><img src={d.image} loading="lazy" alt={'Vista de '+d.title}/></div>
     <div className="finished-demo-body">
       <span className="finished-demo-status"><CheckCircle2 size={14}/> Demo terminado</span>
       <h3>{d.title}</h3><p className="finished-demo-category">{d.category}</p>
       <p>{d.description}</p>
       <div className="finished-demo-actions">
         <a href={d.url} target="_blank" rel="noopener noreferrer">Abrir demo <ExternalLink size={15}/></a>
         <a href={d.source} target="_blank" rel="noopener noreferrer" className="finished-demo-secondary">Ver en repositorio <ExternalLink size={14}/></a>
       </div>
       <small>{d.note}</small>
     </div>
   </article>)}
   </div>
   <div className="finished-demos-class-note">
    <BookOpen size={20}/>
    <div><strong>El demo de AppDeploy desde cero no va aquí.</strong>
    <p>Es tu punto de partida para grabar Casa Brownie. Lo encontrarás en <b>Clases · grabación</b>, junto al video que estás preparando.</p></div>
    <button type="button" onClick={onOpenClass}>Ir a grabar <Film size={16}/></button>
   </div>
 </section>;
}
