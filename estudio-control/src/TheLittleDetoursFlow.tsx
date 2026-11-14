import {useState} from 'react';
import {BookOpen, Check, ClipboardCopy, Download, ExternalLink, Film, Link2, Play, ShieldCheck, Workflow} from 'lucide-react';
import {flowClips,flowCompleteProductionPlan,flowMaster} from './youtube/google-flow-umbrella';
import './the-little-detours-flow.css';

function downloadText(filename:string, content:string) {
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function TheLittleDetoursFlow() {
  const [open, setOpen]=useState<number>(1);
  const [feedback,setFeedback]=useState('');
  async function copy(value:string,label:string) {
    try{await navigator.clipboard.writeText(value);setFeedback(label+' copiado.');}
    catch{setFeedback('No se pudo copiar automáticamente. Usa el cuadro de texto y selecciona el contenido.');}
  }

  return <section className="tld-flow" aria-labelledby="tld-flow-heading">
    <div className="tld-flow-intro">
      <div>
        <span className="tle-yt-eyebrow"><Film size={16}/> PRODUCCIÓN ACTUAL · GOOGLE FLOW</span>
        <h3 id="tld-flow-heading">The Umbrella Thief · Prompts por escena</h3>
        <p>Una sola secuencia cinematográfica de unos 42 segundos. Los siete segmentos se continúan entre sí con el mismo movimiento, encuadre y personajes, en lugar de crearse como clips independientes.</p>
        <div className="tld-flow-tags"><span>7 segmentos conectados</span><span>≈ 6 s cada uno</span><span>16:9</span><span>Sin diálogos</span></div>
      </div>
      <a className="tld-flow-open" href="https://flow.google.com/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Abrir Google Flow</a>
    </div>

    <div className="tld-flow-steps">
      <div><span className="tld-flow-number">01</span><strong>Primer segmento</strong><p>Usa las imágenes máster de Nora y Pip como referencias. Genera un clip inicial con Frames to Video, sin cortes internos.</p></div>
      <div><span className="tld-flow-number">02</span><strong>Segmentos 2–7</strong><p>En el mismo video, usa Extend (Omni Flash 1.2 y suscripción compatible). Cada prompt continúa exactamente el último fotograma del clip anterior.</p></div>
      <div><span className="tld-flow-number">03</span><strong>Revisión de continuidad</strong><p>Comprueba rostro, ropa, paraguas, cuatro naranjas, bolsa, pañuelo y llave. La lluvia, la luz, la calle y la posición de cámara no deben reiniciarse.</p></div>
    </div>

    <div className="tld-flow-alternative"><Link2 size={17}/><p><strong>Si no está disponible Extend:</strong> guarda el último fotograma aprobado, úsalo como <em>start frame</em> del siguiente video en Frames to Video y revisa visualmente la unión. No se puede garantizar continuidad perfecta solo escribiendo un prompt.</p></div>
    <div className="tld-flow-actions">
      <button type="button" onClick={()=>void copy(flowCompleteProductionPlan,'Plan completo Google Flow')}><ClipboardCopy size={16}/> Copiar los 7 prompts</button>
      <button type="button" onClick={()=>downloadText('THE-LITTLE-DETOURS-E01-GOOGLE-FLOW-CONTINUOUS-PROMPTS.txt',flowCompleteProductionPlan)}><Download size={16}/> Descargar plan TXT</button>
    </div>
    <div className="tld-flow-scenes">
      {flowClips.map(s=><article className={'tld-flow-scene '+(open===s.number?'active':'')} key={s.number}>
        <button className="tld-flow-scene-header" type="button" aria-expanded={open===s.number} onClick={()=>setOpen(open===s.number?0:s.number)}>
          <span className="tld-flow-scene-num">{String(s.number).padStart(2,'0')}</span>
          <span className="tld-flow-scene-copy"><strong>{s.title}</strong><small>{s.time} · {s.mode}</small></span>
          <span className="tld-flow-toggle">{open===s.number?'−':'+'}</span>
        </button>
        {open===s.number && <div className="tld-flow-scene-body">
          <div className="tld-flow-handoff">
            <p><strong><Play size={14}/> Inicio:</strong> {s.opening}</p>
            <p><strong><Workflow size={14}/> Movimiento:</strong> {s.action}</p>
            <p><strong><ShieldCheck size={14}/> Final sin corte:</strong> {s.ending}</p>
          </div>
          <label className="tld-flow-prompt-label" htmlFor={'tld-prompt-'+s.number}>Master Prompt completo en inglés · listo para pegar en Flow</label>
          <textarea id={'tld-prompt-'+s.number} readOnly value={s.prompt} rows={13}/>
          <div className="tld-flow-actions">
            <button type="button" onClick={()=>void copy(s.prompt,'Prompt de escena '+s.number)}><ClipboardCopy size={16}/> Copiar este prompt</button>
            <button type="button" onClick={()=>downloadText('THE-LITTLE-DETOURS-E01-SEGMENT-'+String(s.number).padStart(2,'0')+'.txt',s.prompt)}><Download size={16}/> Descargar TXT</button>
          </div>
        </div>}
      </article>)}
    </div>
    {feedback&&<p className="tld-flow-feedback" role="status"><Check size={16}/>{feedback}</p>}
    <p className="tld-flow-disclaimer"><BookOpen size={16}/> {flowMaster.model}. Los prompts están preparados, no los videos. Confirma en Flow la duración, disponibilidad y créditos antes de generar; no existe sincronización automática entre este Studio y Flow.</p>
  </section>;
}
