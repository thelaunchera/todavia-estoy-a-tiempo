import {useEffect,useMemo,useState} from 'react';
import {Check,Clipboard,ExternalLink,Film,Save,ShieldCheck} from 'lucide-react';
import {BRAND_REELS,BRAND_REELS_SECTIONS,type Brand,type BrandReel} from './brand-reels-plan';
import type {ReelEntry} from './ReelsProduction';
import './brand-reels-production.css';

type Props={
  brand:Brand;
  entries:ReelEntry[];
  onSave:(entry:ReelEntry,patch:Partial<ReelEntry>)=>Promise<void>;
  onCreate:(input:Partial<ReelEntry>&{title:string})=>Promise<void>;
};
const steps=['Guion revisado','Capturas reales grabadas','Edición completada','Reel aprobado'] as const;
const statuses=['guion listo','por grabar','grabando','editando','aprobado','publicado'] as const;
const localDate=(d?:string)=>d?new Date(d+'T12:00:00').toLocaleDateString('es-US',{day:'numeric',month:'short',year:'numeric'}):'Sin fecha';

export default function BrandReelsProduction({brand,entries,onSave,onCreate}:Props){
  const section=BRAND_REELS_SECTIONS[brand];
  const seeds=BRAND_REELS[brand] as BrandReel[];
  const records=useMemo(()=>entries.filter(e=>e.section===section),[entries,section]);
  const items=useMemo(()=>seeds.map(s=>({...s,record:records.find(e=>e.subtitle===s.id)})),[seeds,records]);
  const [selected,setSelected]=useState<string>(brand==='clase'?'cumple-19-web':seeds[0].id);
  useEffect(()=>setSelected(brand==='clase'?'cumple-19-web':seeds[0].id),[brand]);
  const active=items.find(x=>x.id===selected)||items[0];
  const record=active.record;
  const [voice,setVoice]=useState(active.voice);
  const [shots,setShots]=useState(active.shots.join('\n'));
  const [overlay,setOverlay]=useState(active.overlay);
  const [caption,setCaption]=useState(active.caption);
  const [status,setStatus]=useState<string>('guion listo');
  const [checks,setChecks]=useState<string[]>([]);
  const [notice,setNotice]=useState('');
  const [saving,setSaving]=useState(false);
  const [copied,setCopied]=useState('');
  useEffect(()=>{
    setVoice(record?.script||active.voice);
    setShots(record?.visual_idea||active.shots.join('\n'));
    setOverlay(record?.reel_overlay||active.overlay);
    setCaption(record?.notes||active.caption);
    setStatus(record?.status||'guion listo');
    setChecks((record?.performance_notes||'').split('|').filter(s=>steps.includes(s as typeof steps[number])));
    setNotice('');setCopied('');
  },[active.id,record?.id,record?.script,record?.visual_idea,record?.reel_overlay,record?.notes,record?.status,record?.performance_notes]);
  const count=records.filter(r=>r.status==='aprobado'||r.status==='publicado').length;
  async function copy(value:string,key:string){try{await navigator.clipboard.writeText(value);setCopied(key);}catch{setNotice('No se pudo copiar automáticamente. Selecciona el texto.');}}
  async function save(){
    if(saving)return;
    setSaving(true);setNotice('');
    const patch:Partial<ReelEntry>={title:'Reel · '+active.title,date:active.date,script:voice,visual_idea:shots,reel_overlay:overlay,notes:caption,status,performance_notes:checks.join('|')};
    try{
      if(record)await onSave(record,patch);
      else await onCreate({...patch,title:'Reel · '+active.title,section,subtitle:active.id,date:active.date});
      setNotice('Guardado en tu Studio privado. No se publicó ni programó el video.');
    }catch{setNotice('No se pudo guardar. Los cambios siguen visibles en el editor.');}
    finally{setSaving(false)}
  }
  return <section className="brand-reels">
    <header className="brand-reels-header">
      <span className="brand-reels-kicker"><Film size={16}/> PRODUCCIÓN PRIVADA · NOVIEMBRE 2026</span>
      <h2>{brand==='clase'?'Reels de la clase':'Reels de Content Lab'}</h2>
      <p>Guiones, tomas, fechas y progreso en un solo lugar. Tú grabas y editas; aquí no se publica automáticamente.</p>
      <small>{items.length} reels preparados · {count} aprobados o publicados</small>
    </header>
    <div className="brand-reels-grid">
      <nav className="brand-reels-list" aria-label={'Reels de '+(brand==='clase'?'la clase':'Content Lab')}>
        {items.map(item=><button type="button" key={item.id} onClick={()=>setSelected(item.id)} aria-pressed={item.id===active.id} className={item.id===active.id?'selected':''}>
          <span>{localDate(item.date)}</span>
          <strong>{item.title}</strong>
          <small>{item.record?.status||'Guion preparado · por grabar'}</small>
        </button>)}
      </nav>
      <div className="brand-reels-detail">
        <div className="brand-reels-title">
          <div><span className="brand-reels-kicker">{localDate(active.date)} · 9:16</span><h3>{active.title}</h3><p>{active.goal}</p></div>
          <span className="brand-reels-private"><ShieldCheck size={14}/> Privado</span>
        </div>
        {active.id==='cumple-19-web'&&<p className="brand-reels-birthday">🎂 19 de noviembre · Regalo de cumpleaños · Un prompt · CTA único: WEB · Entrega por correo · No revelar toda la clase en el Reel</p>}
        <section className="brand-reels-panel">
          <div className="brand-reels-panel-head"><h4>01 · Voz</h4><button type="button" onClick={()=>void copy(voice,'voice')}><Clipboard size={15}/>{copied==='voice'?'Copiado':'Copiar voz'}</button></div>
          <textarea aria-label="Guion de voz" rows={7} value={voice} onChange={e=>setVoice(e.target.value)}/>
          <span className="brand-reels-note">Portada: {active.cover}</span>
        </section>
        <section className="brand-reels-panel">
          <div className="brand-reels-panel-head"><h4>02 · Tomas que vas a grabar</h4><button type="button" onClick={()=>void copy(shots,'shots')}><Clipboard size={15}/>{copied==='shots'?'Copiado':'Copiar tomas'}</button></div>
          <textarea aria-label="Tomas por grabar" rows={8} value={shots} onChange={e=>setShots(e.target.value)}/>
        </section>
        <section className="brand-reels-panel">
          <h4>03 · Textos y CTA</h4>
          <label>Texto sobre el video<input value={overlay} onChange={e=>setOverlay(e.target.value)} /></label>
          <label>Caption<textarea value={caption} rows={5} onChange={e=>setCaption(e.target.value)}/></label>
          <p className="brand-reels-cta"><strong>CTA:</strong> {active.cta}</p>
          {active.source&&<a href={active.source} target="_blank" rel="noreferrer">Abrir guion original en Notion <ExternalLink size={14}/></a>}
        </section>
        <section className="brand-reels-panel">
          <h4>04 · Progreso</h4>
          <div className="brand-reels-checks">{steps.map(s=><label key={s}><input type="checkbox" checked={checks.includes(s)} onChange={()=>setChecks(v=>v.includes(s)?v.filter(x=>x!==s):[...v,s])}/>{s}{checks.includes(s)&&<Check size={15}/>}</label>)}</div>
          <label>Estado<select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <button type="button" className="brand-reels-save" disabled={saving} onClick={()=>void save()}><Save size={16}/>{saving?'Guardando…':'Guardar progreso'}</button>
          {notice&&<p role="status">{notice}</p>}
        </section>
      </div>
    </div>
  </section>;
}