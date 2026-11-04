import {useState} from 'react';

export const PRIVATE_DEMO_KIT_SECTION = 'studio-demo-kits-v1';
type Entry = {id:string;title:string;section?:string;notes?:string};
type Photo = {key:string;title:string;placement:string;url:string;prompt:string};
type Step = {step:number;title:string;show:string;say:string;prompt:string};
type Kit = {brand:string;demoUrl:string;sourceUrl:string;archiveUrl:string;folderUrl:string;description:string;status:'awaiting_publication';photos:Photo[];steps:Step[]};
function safeLink(value:unknown):value is string {
  if(typeof value!=='string')return false;
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['drive.google.com','github.com','chatgpt.com'].includes(url.hostname);}catch{return false;}
}
function parse(entry:Entry):Kit|null {
  if(entry.section!==PRIVATE_DEMO_KIT_SECTION)return null;
  try{
    const kit=JSON.parse(entry.notes||'{}') as Kit;
    if(kit.status!=='awaiting_publication'||typeof kit.brand!=='string'||typeof kit.description!=='string'||![kit.demoUrl,kit.sourceUrl,kit.archiveUrl,kit.folderUrl].every(safeLink)||!Array.isArray(kit.photos)||!kit.photos.length||!Array.isArray(kit.steps)||!kit.steps.length)return null;
    if(!kit.photos.every(p=>typeof p.key==='string'&&typeof p.title==='string'&&typeof p.placement==='string'&&typeof p.prompt==='string'&&safeLink(p.url)))return null;
    if(!kit.steps.every(s=>typeof s.title==='string'&&typeof s.show==='string'&&typeof s.say==='string'&&typeof s.prompt==='string'))return null;
    return kit;
  }catch{return null;}
}
export default function PrivateDemoKits({entries,publishedBrands=[]}:{entries:Entry[];publishedBrands?:string[]}){
  const [notice,setNotice]=useState('');
  const kits=entries.map(entry=>({entry,kit:parse(entry)})).filter(row=>row.kit!==null&&!publishedBrands.some(brand=>row.kit!.brand.toLowerCase().includes(brand.toLowerCase())));
  if(!kits.length)return null;
  async function copy(value:string){try{await navigator.clipboard.writeText(value);setNotice('Copiado.');}catch{setNotice('Selecciona el texto para copiarlo.');}}
  return <section aria-label="Kits privados pendientes de publicación" style={{marginBottom:26}}>
    {kits.map(({entry,kit})=>kit&&<article className="finished-demo-card" key={entry.id} style={{marginBottom:20}}>
      <div style={{background:'#1051c5',color:'#faf8f3',padding:'32px 28px',fontSize:44,fontWeight:800,letterSpacing:'-.06em'}}>{kit.brand}</div>
      <div className="finished-demo-body">
        <span className="finished-demo-status">Kit privado · Pendiente de publicación</span>
        <h3>{entry.title}</h3><p>{kit.description}</p>
        <div className="finished-demo-actions">
          <a href={kit.demoUrl} target="_blank" rel="noopener noreferrer">Descargar demo y kit con vistas previas</a>
          <a href={kit.sourceUrl} target="_blank" rel="noopener noreferrer" className="finished-demo-secondary">Código en repositorio</a>
          <a href={kit.folderUrl} target="_blank" rel="noopener noreferrer" className="finished-demo-secondary">Carpeta con originales</a>
          <a href={kit.archiveUrl} target="_blank" rel="noopener noreferrer" className="finished-demo-secondary">Archivo completo</a>
        </div>
        <small>Descarga el HTML y ábrelo para ver el demo y las fotos completas. La web pública con el retrato requiere autorización. Este kit no se presenta como demo publicado y no se ofrece al aula.</small>
        <details className="finished-demo-kit">
          <summary><span>Fotos + prompts originales + pasos</span><span>{kit.photos.length} fotos · {kit.steps.length} pasos</span></summary>
          <p>Las vistas previas están dentro del kit privado. Los enlaces de cada foto abren su original en Drive con el acceso de la propietaria.</p>
          <div className="finished-demo-photos-grid">{kit.photos.map(photo=><article className="finished-demo-photo-tile" key={photo.key}><div className="finished-demo-photo-meta">
            <strong>{photo.title}</strong><span>{photo.placement}</span>
            <div className="finished-demo-photo-actions"><a href={photo.url} target="_blank" rel="noopener noreferrer">Abrir foto original</a></div>
            <details className="finished-demo-photo-instructions"><summary>Prompt original</summary><pre style={{whiteSpace:'pre-wrap'}}>{photo.prompt}</pre><button type="button" onClick={()=>void copy(photo.prompt)}>Copiar prompt</button></details>
          </div></article>)}</div>
          <h4 className="finished-demo-kit-heading">Reconstrucción de la web</h4>
          {kit.steps.map(step=><details className="finished-demo-prompt" key={step.step}><summary>{step.step} · {step.title}</summary><p><b>Qué mostrar:</b> {step.show}</p><p><b>Qué explicar:</b> {step.say}</p><pre style={{whiteSpace:'pre-wrap'}}>{step.prompt}</pre><button type="button" onClick={()=>void copy(step.prompt)}>Copiar paso</button></details>)}
        </details>
        {notice&&<p role="status">{notice}</p>}
      </div>
    </article>)}
  </section>;
}
