import {useState} from 'react';
import {Copy,Camera,Film,ExternalLink,ShieldCheck} from 'lucide-react';
import './casa-brownie-kit.css';

export const CASA_BROWNIE_KIT_SECTION='clase-01-recursos-visuales';
type Photo={id:string;title:string;src:string;type:'foto'|'video';provenance?:string;use?:string;studentVisibility?:string};
type Step={number:number;name:string;where:string;deliverable:string;say:string};
type Prompt={id:string;title:string;lesson:string;kind:string;description:string;prompt:string};
export type CasaBrownieKitEntry={
 id:string; title:string; section?:string; photos?:Photo[];steps?:Step[];prompts?:Prompt[];
 official_url?:string;static_url?:string;practice_app_url?:string;practice_note?:string;warning?:string;bonus_after_main_course?:boolean;
};
type Tab='ruta'|'fotos'|'prompts'|'bono';
function validUrl(input?:string){
 try{const u=new URL(input||'');return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
}
export default function CasaBrownieStudioKit({entry}:{entry?:CasaBrownieKitEntry}){
 const [tab,setTab]=useState<Tab>('ruta');
 const [copied,setCopied]=useState('');
 const [notice,setNotice]=useState('');
 const [expanded,setExpanded]=useState(false);
 const [promptFilter,setPromptFilter]=useState('todos');
 const photos=(entry?.photos||[]).filter(p=>p.type==='foto'&&validUrl(p.src));
 const video=(entry?.photos||[]).find(p=>p.type==='video'&&validUrl(p.src));
 const prompts=(entry?.prompts||[]);
 const withoutBonus=prompts.filter(p=>p.lesson!=='bonus');
 const visible=promptFilter==='todos'?withoutBonus:withoutBonus.filter(p=>p.lesson===promptFilter);
 async function copy(text:string,key:string){
  try{await navigator.clipboard.writeText(text);setCopied(key);setNotice('Instrucciones copiadas.');}
  catch{setNotice('No se pudo copiar: selecciona el texto y cópialo manualmente.');}
 }
 return <section className="cb-kit" aria-label="Materiales privados para reconstruir Casa Brownie">
  <div className="cb-kit-intro">
   <div><span className="cb-kit-eyebrow">CLASE 01 · CUADERNO DE PRODUCCIÓN PRIVADO</span>
    <h3>Casa Brownie · <em>de cero al demo final.</em></h3>
    <p>La práctica empieza desde una página básica nueva de AppDeploy, no desde la demo terminada. Primero construirás las secciones y el hero SIN VIDEO. <b>El video animado se muestra únicamente como bono final.</b></p>
   </div>
   <button type="button" className="cb-kit-toggle" onClick={()=>setExpanded(x=>!x)} aria-expanded={expanded}>{expanded?'Cerrar materiales':'Abrir fotos y prompts'}</button>
  </div>
  <div className="cb-kit-links">
    {validUrl(entry?.practice_app_url)&&<a href={entry!.practice_app_url} target="_blank" rel="noopener noreferrer"><Camera size={15}/> AppDeploy · Mi proyecto desde cero <ExternalLink size={13}/></a>}
    {validUrl(entry?.static_url)&&<a href={entry!.static_url} target="_blank" rel="noopener noreferrer"><Camera size={15}/> Paso principal · Web sin video <ExternalLink size={13}/></a>}
    {validUrl(entry?.official_url)&&<a href={entry!.official_url} target="_blank" rel="noopener noreferrer"><Film size={15}/> Demo final aprobado · Con video <ExternalLink size={13}/></a>}
  </div>
  {expanded&&<div className="cb-kit-inner">
    {!entry?<p>Los recursos todavía no se han sincronizado. Actualiza tu Studio.</p>:<>
    <div className="cb-kit-tabs" role="group" aria-label="Elegir recursos">{([
      ['ruta','Paso a paso'],['fotos','Fotos oficiales'],['prompts','Prompts por sección'],['bono','Bono del video']
    ] as const).map(([id,label])=><button key={id} type="button" className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>{setTab(id);setCopied('');}}>{label}</button>)}</div>
    {tab==='ruta'&&<>
     <div className="cb-kit-explain"><strong>Cómo grabar algo que ya construiste</strong><p>Abre AppDeploy desde tu panel y selecciona «Casa Brownie · Taller desde cero». Esta página básica es tu punto de partida: no tiene logo final, catálogo, fotografías ni video. Graba cada cambio en esta app independiente mientras vas pegando los prompts y aprobando cada sección. La web oficial SIN VIDEO sirve solo de referencia; el video animado se revela en el bono. No presentes las tomas nuevas como grabaciones antiguas.</p>{validUrl(entry.practice_app_url)&&<p><a href="https://dashboard.appdeploy.ai" target="_blank" rel="noopener noreferrer">Abrir panel de AppDeploy para editar esta práctica <ExternalLink size={12}/></a></p>}</div>
     <div className="cb-kit-steps">{(entry.steps||[]).map(step=><article key={step.number} className="cb-kit-step">
       <span>{String(step.number).padStart(2,'0')}</span><div><h4>{step.name}</h4><p><b>Abre:</b> {step.where}</p><p><b>Di:</b> {step.say}</p><p><b>Guarda:</b> {step.deliverable}</p></div>
       </article>)}</div>
    </>}
    {tab==='fotos'&&<>
      <p className="cb-kit-small">Estas imágenes están guardadas en el repositorio oficial y enlazadas aquí para que no se creen copias distintas. Puedes abrir el archivo original. No se incluyen como recursos propios las seis fotos de sabores que todavía dependen de sitios externos.</p>
      <div className="cb-kit-gallery">{photos.map(photo=><article key={photo.id}>
        <a href={photo.src} target="_blank" rel="noopener noreferrer"><img loading="lazy" src={photo.src} alt={photo.title} /></a>
        <div><h4>{photo.title}</h4><p>{photo.use}</p><small>{photo.provenance}</small>
          <a href={photo.src} target="_blank" rel="noopener noreferrer">Abrir fotografía <ExternalLink size={12}/></a></div>
      </article>)}</div>
      <div className="cb-kit-note"><ShieldCheck size={18}/><p>Faltan seis fotos originales individuales de sabores antes de compartir un paquete descargable. Las fotos del catálogo actual provienen de fuentes externas y deben sustituirse o contar con permiso.</p></div>
    </>}
    {tab==='prompts'&&<>
      <p className="cb-kit-small">Copia el prompt correspondiente a la sección que vas a grabar. Haz una sola parte cada vez, toma captura, aprueba y guarda la versión antes de seguir. El proyecto de AppDeploy es nuevo, nunca el demo oficial.</p>
      <label className="cb-kit-filter">Mostrar prompts
        <select value={promptFilter} onChange={e=>setPromptFilter(e.target.value)}>
          <option value="todos">Todas las secciones</option>
          {Array.from(new Set(withoutBonus.map(x=>x.lesson))).map(id=><option value={id} key={id}>Lección {id}</option>)}
        </select>
      </label>
      <div className="cb-kit-prompts">{visible.map(p=><article key={p.id}>
        <div className="cb-kit-prompt-title"><div><small>SECCIÓN {p.id} · VIDEO {p.lesson}</small><h4>{p.title}</h4><p>{p.description}</p></div><button type="button" onClick={()=>void copy(p.prompt,p.id)}><Copy size={14}/>{copied===p.id?'Copiado':'Copiar prompt'}</button></div>
        <p className="cb-kit-prompt-text">{p.prompt}</p></article>)}</div>
    </>}
    {tab==='bono'&&<div className="cb-kit-bonus">
      <span className="cb-kit-eyebrow">BONO · DESPUÉS DE PUBLICAR LA WEB ESTÁTICA</span>
      <h4>El truco del hero con movimiento</h4>
      <p>Este video no se enseña en las nueve clases base. Al final, muestra la diferencia entre <b>la misma web con fotografía fija</b> y <b>el demo oficial con video</b>, sin cambiar la marca ni la disposición de las secciones.</p>
      <div className="cb-kit-links">{validUrl(entry.static_url)&&<a href={entry.static_url} target="_blank" rel="noopener noreferrer">Antes · Hero sin video</a>}{validUrl(entry.official_url)&&<a href={entry.official_url} target="_blank" rel="noopener noreferrer">Después · Demo con video</a>}</div>
      {video&&<p><a href={video.src} target="_blank" rel="noopener noreferrer">Ver el MP4 del hero <ExternalLink size={13}/></a> · El origen de la imagen de referencia debe tener permisos antes de distribuirlo.</p>}
      {prompts.filter(p=>p.lesson==='bonus').map(p=><article key={p.id} className="cb-kit-bonus-prompt"><div className="cb-kit-prompt-title"><h4>{p.title}</h4><button type="button" onClick={()=>void copy(p.prompt,p.id)}><Copy size={14}/>{copied===p.id?'Copiado':'Copiar prompt'}</button></div><p className="cb-kit-prompt-text">{p.prompt}</p></article>)}
      <p className="cb-kit-small">Ajustar MP4 a tamaño web, sin sonido, en bucle y con imagen fija de respaldo. No prometer un giro de 360° perfecto si la herramienta solo consigue una órbita parcial.</p>
    </div>}
    <p className="cb-kit-status" role="status">{notice}</p>
    </>}
  </div>}
 </section>;
}
