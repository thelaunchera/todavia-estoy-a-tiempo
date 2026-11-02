import { useEffect, useMemo, useState } from 'react';
import {uploadPodcastReelAudio,getPodcastReelAudioUrl} from './supabase-client';
import { Check, Clipboard, Download, Film, Headphones, Mic2, Save, ShieldCheck } from 'lucide-react';
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
  { id: 'audio', label: 'Audio de voz listo' },
  { id: 'tomas', label: 'Videos cortos grabados' },
  { id: 'edicion', label: 'Reel editado' },
  { id: 'aprobado', label: 'Reel revisado y aprobado' }
] as const;
const statuses = ['pendiente', 'guion listo', 'audio listo', 'tomas grabadas', 'editando', 'aprobado'] as const;
export default function ReelsProduction({entries,onSave,onCreate}:Props) {
  const [selected,setSelected] = useState('03');
  const reel = useMemo(() => REELS_NOVIEMBRE.find(r=>r.id===selected) || REELS_NOVIEMBRE[0],[selected]);
  const entry = entries.find(e=>e.section===REELS_SECTION && e.subtitle===reel.id);
  const [script,setScript] = useState<string>(reel.voice);
  const [shots,setShots] = useState<string>(reel.shots.join('\n'));
  const [notes,setNotes] = useState('');
  const [url,setUrl] = useState('');
  const [audioPreview,setAudioPreview] = useState('');
  const [uploading,setUploading] = useState(false);
  const [downloading,setDownloading] = useState(false);
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

  useEffect(()=>{let active=true;setAudioPreview('');if(url.startsWith('https://')){setAudioPreview(url)}else if(url){getPodcastReelAudioUrl(url).then(value=>{if(active)setAudioPreview(value)}).catch(()=>{if(active)setNotice('No se pudo reproducir el audio privado.')})}return()=>{active=false}},[url]);
  async function chooseAudio(file:File|undefined){if(!file)return;setUploading(true);setNotice('Subiendo audio…');try{const path=await uploadPodcastReelAudio(reel.id,file,()=>{});setUrl(path);setNotice('Audio subido. Pulsa Guardar progreso para asociarlo al reel.')}catch(e){setNotice(e instanceof Error?e.message:'Error al subir audio.')}finally{setUploading(false)}}
  async function downloadAudio(){if(!url)return;setDownloading(true);setNotice('Preparando descarga…');try{const source=await getPodcastReelAudioUrl(url);const response=await fetch(source);if(!response.ok)throw new Error('No se pudo descargar el audio.');const blob=await response.blob();const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download='PODCAST_REEL_'+reel.id+'.'+(url.split('.').pop()||'mp3');document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);setNotice('Audio listo para guardar en Archivos.')}catch(e){setNotice(e instanceof Error?e.message:'No se pudo descargar el audio.')}finally{setDownloading(false)}}
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
        <p>Aquí están los reels, separados de los capítulos del podcast. Graba o crea tu audio, súbelo desde tu teléfono y descárgalo cuando lo necesites. Ninguna acción publica contenido.</p>
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
          <div className="reels-panel-head"><div><span>01 / TU VOZ</span><h4>Texto que se escucha en el reel</h4></div>
            <button type="button" onClick={()=>void copy(script,'script')} className="reels-copy"><Clipboard size={16}/>{copied==='script'?'Copiado':'Copiar voz'}</button></div>
          <p className="reels-tip">Este es el texto que se escucha mientras aparecen las imágenes. Puedes cambiarlo y copiarlo para grabar tu voz.</p>
          <textarea className="reels-voice-input" aria-label="Guion de voz para ElevenLabs" value={script} onChange={e=>setScript(e.target.value)} rows={7} maxLength={16000} />
          <p className="reels-performance"><Headphones size={16}/><span><strong>Cómo debe sonar tu voz:</strong> {reel.tone}</span></p>
          <label className="reels-audio-field">Subir audio del reel (MP3, M4A, WAV o AAC)
            <input type="file" accept=".mp3,.m4a,.wav,.aac,audio/*" disabled={uploading||busy} onChange={e=>{void chooseAudio(e.target.files?.[0]);e.target.value=''}}/>
          </label>
          {uploading&&<p role="status">Subiendo audio privado…</p>}
          {audioPreview&&<><audio controls preload="none" src={audioPreview} style={{width:'100%',marginTop:10}}/><button type="button" className="reels-copy" disabled={downloading} onClick={()=>void downloadAudio()}><Download size={16}/>{downloading?'Preparando…':'Descargar audio'}</button></>}
        </section>

        <section className="reels-panel">
          <div className="reels-panel-head"><div><span>02 / QUÉ VIDEOS GRABAR</span><h4>Instrucciones para grabar cada escena</h4></div>
            <button type="button" onClick={()=>void copy(shots,'shots')} className="reels-copy"><Clipboard size={16}/>{copied==='shots'?'Copiado':'Copiar tomas'}</button></div>
          <p className="reels-tip">Cómo hacerlo: Pon el iPhone vertical. Cada línea te dice dónde colocar el teléfono, qué debe verse y qué hacer. Graba un video corto por cada paso. No tienes que hablar frente a la cámara.</p>
          <textarea aria-label="Instrucciones sencillas para grabar cada escena" className="reels-shots-input" rows={10} maxLength={12000} value={shots} onChange={e=>setShots(e.target.value)} />
          <div className="reels-note">Cuando termines, puedes nombrar el video <strong>{reel.filename}</strong>. Pon el logo pequeño. No necesitas flechas ni inventar resultados.</div>
        </section>

        <section className="reels-panel">
          <div className="reels-panel-head"><div><span>03 / TERMINAR EL REEL</span><h4>Marca lo que ya hiciste</h4></div></div>
          <div className="reels-checks">
            {steps.map(step=><label key={step.id}><input type="checkbox" checked={checks.includes(step.id)} onChange={()=>toggleCheck(step.id)} /><span>{step.label}</span>{checks.includes(step.id)&&<Check size={16}/>}</label>)}
          </div>
          <div className="reels-fields">
            <label>¿En qué paso vas?
              <select value={status} onChange={e=>setStatus(e.target.value)}>
                {statuses.map(s=><option value={s} key={s}>{s}</option>)}
              </select>
            </label>
            <label>Notas o videos que te faltan
              <textarea rows={3} maxLength={40000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Qué corregir, qué grabar de nuevo, dónde guardaste el video…" />
            </label>
          </div>
          <div className="reels-savebar">
            <span><ShieldCheck size={16}/> Nada se publica automáticamente.</span>
            <button type="button" onClick={()=>void save()} disabled={busy||uploading}><Save size={17}/>{busy?'Guardando…':'Guardar progreso'}</button>
          </div>
          {notice && <p className="reels-notice" role="status">{notice}</p>}
        </section>
      </div>
    </div>
  </section>;
}
