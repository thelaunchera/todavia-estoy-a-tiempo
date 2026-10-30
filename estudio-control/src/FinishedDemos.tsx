import {useState} from 'react';
import {ExternalLink, Film, BookOpen, CheckCircle2, FolderOpen, Copy} from 'lucide-react';
import {demoRebuildPrompts} from './demo-rebuild-prompts';
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
  image:'https://thelaunchera.com/demos/crumb/assets/CRUMB_Storefront_Approved_20261030.webp?v=20261030-studio',
  url:'https://thelaunchera.com/demos/crumb/',
  source:'https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/crumb',
  note:'Demo ficticio: no acepta pedidos ni pagos reales.'
 }
];
export default function FinishedDemos({onOpenClass}:{onOpenClass:()=>void}){
 const [copied,setCopied]=useState('');
 const [notice,setNotice]=useState('');
 async function copy(text:string,key:string) {
   try {await navigator.clipboard.writeText(text);setCopied(key);setNotice('Prompt copiado.');}
   catch {setNotice('Selecciona el texto para copiarlo manualmente.');}
 }
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
       <details className="finished-demo-prompts">
         <summary>Prompts para reconstruir desde cero <span>{demoRebuildPrompts[d.id as 'casa-brownie'|'crumb'].length} pasos</span></summary>
         <div className="finished-demo-prompt-list">
           <p className="finished-demo-prompt-context">Guía privada de grabación: en cada sección tienes qué decir en voz alta, qué enseñar y el prompt exacto para copiar a ChatGPT. Trabaja en la app de práctica, no en el demo oficial. Aquí no se genera ni publica ninguna web.</p>
           <div className="finished-demo-photo-guide" aria-label="Regla para fotografías en ChatGPT">
             <strong>Cómo pedir fotos sin confundir a ChatGPT</strong>
             <p><b>Fotografía individual:</b> copia UN comando, pide UNA imagen en UN archivo, revisa el resultado y solo después pasa a la siguiente. Nunca solicites seis fotos en un mismo mensaje: puede devolver un collage o mezclar sabores.</p>
             <p><b>Brand board:</b> ese es el único caso donde pedimos UNA imagen compuesta con 14 escenas. Es una referencia visual; después usamos 14 comandos separados para conseguir archivos individuales utilizables.</p>
             <p><b>Para que quede como el demo aprobado:</b> adjunta las fotografías originales de referencia. Un prompt de generación ayuda a mantener el estilo, pero por sí solo no reproduce píxel por píxel una foto anterior.</p>
           </div>
           {demoRebuildPrompts[d.id as 'casa-brownie'|'crumb'].map((item,i)=>(
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
                   <p>{photo.prompt}</p>
                 </div>)}
               </details>}
             </article>
           ))}
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
