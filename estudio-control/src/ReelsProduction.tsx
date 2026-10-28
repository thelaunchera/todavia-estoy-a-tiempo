import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Film, Headphones, Mic2, Save, ShieldCheck } from 'lucide-react';
import { REELS_NOVIEMBRE, REELS_SECTION } from './reels-plan';
import './reels-production.css';

export type ReelEntry = {
  id: string;
  title: string;
  section?: string;
  subtitle?: string;
  date?: string;
  status?: string;
  script?: string;
  visual_idea?: string;
  notes?: string;
  link?: string;
  reel_overlay?: string;
  performance_notes?: string;
};

type Props = {
  entries: ReelEntry[];
  onSave: (entry: ReelEntry, patch: Partial<ReelEntry>) => Promise<void>;
  onCreate: (input: Partial<ReelEntry> & {title:string}) => Promise<void>;
};

const steps = [
  { id: 'guion', label: 'Guion revisado' },
  { id: 'audio', label: 'Voz creada en ElevenLabs' },
  { id: 'tomas', label: 'Tomas grabadas' },
  { id: 'edicion', label: 'Reel editado' },
  { id: 'aprobado', label: 'Montaje aprobado' }
] as const;
const statuses = ['pendiente', 'guion listo', 'audio listo', 'tomas grabadas', 'editando', 'aprobado'] as const;
function cleanUrl(value:string) {
  if (!value.trim()) return true;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch { return false; }
}

export default function ReelsProduction({entries,onSave,onCreate}:Props) {
  const [selected,setSelected] = useState('03');
  const reel = useMemo(() => REELS_NOVIEMBRE.find(r=>r.id===selected) || REELS_NOVIEMBRE[0],[selected]);
  const entry = entries.find(e=>e.section===REELS_SECTION && e.subtitle===reel.id);
  const [script,setScript] = useState<string>(reel.voice);
  const [shots,setShots] = useState<string>(reel.shots.join('\n'));
  const [notes,setNotes] = useState('');
  const [url,setUrl] = useState('');
  const [status,setStatus] = useState<string>('guion listo');
  const [checks,setChecks] = useState<string[]>([]);
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [copied,setCopied] = useState('');
  useEffect(()=>{
    setScript(entry?.script || reel.voice);
    setShots(entry?.visual_idea || reel.shots.join('\n'));
    setNotes(entry?.notes || '');
    setUrl(entry?.link || '');
    setStatus(entry?.status || 'guion listo');
    setChecks((entry?.performance_notes || '').split(',').filter(x=>steps.some(step=>step.id===x)));
    setNotice('');
    setCopied('');
  },[reel.id,entry?.id,entry?.script,entry?.visual_idea,entry?.notes,entry?.link,entry?.status,entry?.performance_notes]);

  const records = entries.filter(e=>e.section===REELS_SECTION);
  const completed = records.filter(e=>e.status==='aprobado').length;
  const drafted = records.filter(e=>(e.script||'').length>0).length;
  async function copy(value:string,which:string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch { setNotice('No se pudo copiar automáticamente. Selecciona el texto y cópialo.'); }
  }
  function toggleCheck(value:string) {
    setChecks(current=> current.includes(value) ? current.filter(x=>x!==value) : [...current,value]);
  }
  async function save() {
    if (busy) return;
    if (!script.trim()) { setNotice('El guion de voz no puede estar vacío.'); return; }
    if (!cleanUrl(url)) { setNotice('Utiliza un enlace https válido para el audio, o deja ese campo vacío por ahora.'); return; }
    setBusy(true);setNotice('');
    try {
      const patch = { script:script.trim(),visual_idea:shots.trim(),notes:notes.trim(),link:url.trim(),
        status,performance_notes:checks.join(',') };
      if (entry) await onSave(entry,patch);
      else await onCreate({title:'Reel '+reel.id+' · '+reel.title,subtitle:reel.id,section:REELS_SECTION,date:reel.date,...patch});
      setNotice('Cambios guardados en tu Studio privado. No se publicó nada.');
    } catch {
      setNotice('No se pudo guardar. El texto sigue aquí para volver a intentarlo.');
    } finally { setBusy(false); }
  }
  const dateLabel = (date:string) => new Date(date+'T12:00:00').toLocaleDateString('es-US',{day:'numeric',month:'short'});

  return <section className="reels-studio" aria-label="Producción privada de reels">
    <header className="reels-hero">
      <div>
        <span className="reels-kicker"><Film size={16}/> PRODUCCIÓN EDITORIAL · NOVIEMBRE 2026</span>
        <h2>De tu voz, <em>a una historia visual.</em></h2>
        <p>Aquí están los reels, separados de los capítulos del podcast. Tú produces la voz en ElevenLabs y guardas el audio cuando esté listo. Ninguna acción publica contenido.</p>
      </div>
      <div className="reels-tally" aria-label={completed+' reels aprobados de cuatro'}>
        <strong>{completed}<span> / 04</span></strong>
        <small>montajes aprobados</small>
        <span>{drafted} guiones guardados</span>
      </div>
    </header>

    <div className="reels-layout">
      <nav className="reels-selector" aria-label="Elegir reel de noviembre">
        <div className="reels-selector-top">TUS CUATRO REELS</div>
        {REELS_NOVIEMBRE.map(item=>{
          const saved=records.find(x=>x.subtitle===item.id);
          return <button type="button" key={item.id} aria-pressed={reel.id===item.id}
            className={'reels-selector-card '+(reel.id===item.id?'chosen':'')}
            onClick={()=>setSelected(item.id)}>
            <span className="reels-selector-meta"><b>{item.id}</b> <small>{dateLabel(item.date)}</small></span>
            <span className="reels-selector-title">{item.title}</span>
            <span className="reels-selector-status">{saved?.status || 'Guion preparado'}</span>
          </button>;
        })}
        <p>Los capítulos completos siguen en «Episodios». Aquí solo trabajamos sus reels.</p>
      </nav>

      <div className="reels-workspace">
        <div className="reels-heading">
          <div><span className="reels-kicker">REEL {reel.id} · {dateLabel(reel.date)} · 9:16</span><h3>{reel.title}</h3><p>{reel.goal}</p></div>
          <span className="reels-private"><ShieldCheck size={14}/> Solo en tu estudio</span>
        </div>
        <p className="reels-episode-label"><Mic2 size={17}/> Relacionado con el capítulo: <strong>{reel.episode}</strong></p>
        <section className="reels-panel">
          <div className="reels-panel-head"><div><span>01 / TU VOZ</span><h4>Guion para ElevenLabs</h4></div>
            <button type="button" onClick={()=>void copy(script,'script')} className="reels-copy"><Clipboard size={16}/>{copied==='script'?'Copiado':'Copiar voz'}</button></div>
          <p className="reels-tip">Texto original para este reel, independiente del audio del episodio. Puedes revisarlo antes de generar tu voz. Copiar no incluye indicaciones ni etiquetas.</p>
          <textarea className="reels-voice-input" aria-label="Guion de voz para ElevenLabs" value={script} onChange={e=>setScript(e.target.value)} rows={7} maxLength={16000} />
          <p className="reels-performance"><Headphones size={16}/><span><strong>Dirección de voz:</strong> {reel.tone}</span></p>
          <label className="reels-audio-field">Enlace del audio terminado <span>(opcional, cuando lo generes)</span>
            <input type="url" inputMode="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://.../reel-03.mp3" />
          </label>
          {url && cleanUrl(url) && <a className="reels-audio-link" href={url} target="_blank" rel="noopener noreferrer">Abrir audio guardado</a>}
        </section>

        <section className="reels-panel">
          <div className="reels-panel-head"><div><span>02 / RODAJE</span><h4>Qué grabar, plano por plano</h4></div>
            <button type="button" onClick={()=>void copy(shots,'shots')} className="reels-copy"><Clipboard size={16}/>{copied==='shots'?'Copiado':'Copiar tomas'}</button></div>
          <p className="reels-tip">Graba clips de 6–10 segundos por toma para poder elegir después. Usa iluminación de ventana y el iPhone en vertical; cada reel tiene una secuencia distinta.</p>
          <textarea aria-label="Direcciones de grabación" className="reels-shots-input" rows={10} maxLength={12000} value={shots} onChange={e=>setShots(e.target.value)} />
          <div className="reels-note">Guardar el material como <strong>{reel.filename}</strong>. El logo del podcast va pequeño; no añadir flechas ni presentar escenas de prueba como ventas reales.</div>
        </section>

        <section className="reels-panel">
          <div className="reels-panel-head"><div><span>03 / MONTAJE</span><h4>Avance y revisión</h4></div></div>
          <div className="reels-checks">
            {steps.map(step=><label key={step.id}><input type="checkbox" checked={checks.includes(step.id)} onChange={()=>toggleCheck(step.id)} /><span>{step.label}</span>{checks.includes(step.id)&&<Check size={16}/>}</label>)}
          </div>
          <div className="reels-fields">
            <label>Etapa actual
              <select value={status} onChange={e=>setStatus(e.target.value)}>
                {statuses.map(s=><option value={s} key={s}>{s}</option>)}
              </select>
            </label>
            <label>Notas de edición o tomas pendientes
              <textarea rows={3} maxLength={40000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Qué corregir, qué grabar de nuevo, dónde guardaste el video…" />
            </label>
          </div>
          <div className="reels-savebar">
            <span><ShieldCheck size={16}/> El reel solo se marca como aprobado si tú lo indicas.</span>
            <button type="button" onClick={()=>void save()} disabled={busy}><Save size={17}/>{busy?'Guardando…':'Guardar progreso'}</button>
          </div>
          {notice && <p className="reels-notice" role="status">{notice}</p>}
        </section>
      </div>
    </div>
  </section>;
}
