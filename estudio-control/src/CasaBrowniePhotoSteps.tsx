import {useState} from 'react';
import {Copy,ExternalLink} from 'lucide-react';

export type PhotoShot={n:number;name:string;key:string;ratio:string;dest:string;step:string;label:string;check:string;prompt:string;image?:string|null};
export default function CasaBrowniePhotoSteps({shots,workflow}:{shots:PhotoShot[];workflow:string[]}){
 const [copied,setCopied]=useState<number|null>(null);
 const [message,setMessage]=useState('');
 async function copy(shot:PhotoShot){
  try{await navigator.clipboard.writeText(shot.prompt);setCopied(shot.n);setMessage('Prompt copiado. Revisa esta imagen antes de crear la siguiente.');}
  catch{setMessage('Selecciona el texto del prompt y cópialo manualmente.');}
 }
 return <div className="cb-photo-steps">
  <h4>Crear cada imagen, de una en una</h4>
  <p>Logo, portada estática, seis sabores y dos fotos de regalos. Guarda cada resultado antes de avanzar.</p>
  <ol>{workflow.map((s,i)=><li key={i}>{s.replace(/^\d\d\.\s*/,'')}</li>)}</ol>
  {shots.map((shot,i)=><details className="cb-photo-step" key={shot.key} open={i===0} data-photo-step={shot.n}>
   <summary><strong>{String(shot.n).padStart(2,'0')} · {shot.name}</strong><small>{shot.step} · {shot.key}</small></summary>
   <div className="cb-photo-step-body">
    {shot.image?.startsWith('https://')&&<a className="cb-photo-reference" href={shot.image} target="_blank" rel="noopener noreferrer"><img src={shot.image} loading="lazy" alt={'Referencia de '+shot.name}/><span>Ver foto aprobada <ExternalLink size={12}/></span></a>}
    <p><b>Formato:</b> {shot.ratio}</p>
    <p><b>Dónde colocarla:</b> {shot.dest}</p>
    <p><b>Antes de aprobar:</b> {shot.check}</p>
    <button className="cb-photo-copy" type="button" onClick={()=>void copy(shot)}><Copy size={14}/>{copied===shot.n?'Copiado':'Copiar prompt'}</button>
    <p className="cb-photo-prompt">{shot.prompt}</p>
    <p>Guarda el original como <b>{shot.key}</b> y una versión optimizada para subir a la web.</p>
   </div>
  </details>)}
  <p role="status" className="cb-photo-feedback">{message}</p>
  <p className="cb-photo-caution">Las fotos de regalo ya están aprobadas. Estos prompts permiten enseñar el proceso sin modificar el demo oficial. Las seis fotos de sabores externas no son archivos originales nuestros.</p>
 </div>;
}
