import { useMemo, useState } from 'react';
import { CalendarDays, Check, ClipboardCopy, Download, ExternalLink, Gift, Image as ImageIcon, Languages, LockKeyhole, Sparkles } from 'lucide-react';
import { api } from './supabase-client';
import './freebie-library.css';

/** Private production record: launching does not send emails, post to Instagram or change Google Drive permissions. */
export const FREEBIES_SECTION = 'studio-freebies-v1';
const FREEBIE_TITLE = 'December Creative Pack — The Lavender Edit';
const LAUNCH_DATE = '2026-12-01';
const PACK = {
  pdf: 'https://drive.google.com/file/d/1qjwII782hZ-1ZZCLO2uow3ZxW1oIvTBZ/view',
  folder: 'https://drive.google.com/drive/folders/1qD7EmHCyKEs-aHUFlloKP9-nDuv1q7Ug',
  images: 'https://drive.google.com/drive/folders/1zqzLqSkPobH0DQnGfmFAhNkJ0o2YxQNm',
  prompts: 'https://drive.google.com/file/d/1YoVsthcjmxEamdB7CKah75eHzsnpWL4g/view',
  animation: 'https://drive.google.com/file/d/1QZ-QmXCnen-EEwWoYw50lmLRjHWaUoHX/view',
};
const PHOTOS = [
  { id: '1zkXZMsBLioAiG8-LfHDmhf4HyB6VTlMj', name: '01 · Sculpted Gloss Hero' },
  { id: '16LQJhPaM_vA63gsXaPzlsk-q_TrDlvS6', name: '02 · Droplet & Material Macro' },
  { id: '1g3eGkdLf34HqC0I1W-GY70YN7R59-XIK', name: '03 · Botanical Still Life' },
  { id: '1OqzMvTroJPrPdkpN9j0pZwQdt79ThLTO', name: '04 · Cream & Ritual Detail' },
  { id: '1ixa7B19jz0raQRHptQAewQjMcvK2JmZk', name: '05 · Holiday Gift Campaign' },
] as const;
type StudioEntry = { id: string; title: string; section?: string; status?: string; notes?: string };
type Props = { entries: StudioEntry[]; onChanged: () => Promise<unknown>; readOnly?: boolean };
function afterDecemberStart() {
  // Use the brand team's Eastern time, never a visitor's device timezone.
  const today = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/New_York' }).format(new Date());
  return today >= LAUNCH_DATE;
}
function driveThumbnail(id: string) {
  return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w650';
}
function external(url: string, label: string, Icon: typeof ExternalLink) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="freebies-link"><Icon size={17} /> {label}<ExternalLink size={14}/></a>;
}
export default function FreebieLibrary({entries, onChanged, readOnly=false}: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState('');
  const [copied, setCopied] = useState(false);
  const item = useMemo(() => entries.find(x => x.section === FREEBIES_SECTION && x.title === FREEBIE_TITLE),[entries]);
  const active = item?.status === 'activo';
  const canLaunch = afterDecemberStart();
  const onToggle = async () => {
    if (!item || saving || readOnly) return;
    if (!active && !canLaunch) {
      setFailed('La activación está reservada para diciembre de 2026. El recurso permanece en borrador privado.');
      return;
    }
    const nextActive = !active;
    const action = nextActive ? '¿Marcar el freebie como activo? Comprueba primero que el PDF de Drive se puede abrir con el acceso que deseas compartir. Esto NO publica contenido ni envía correos automáticamente.' : '¿Devolver este freebie a borrador privado?';
    if (!window.confirm(action)) return;
    setSaving(true); setFailed(''); setMessage('');
    try {
      await api.put('/api/items/ideas/' + item.id, {status: nextActive ? 'activo' : 'borrador'});
      await onChanged();
      setMessage(nextActive ? 'Estado guardado: activo. Ya puedes copiar el enlace para distribuirlo manualmente.' : 'Estado guardado: borrador privado. La ficha sigue disponible para editar.');
    } catch {
      setFailed('No se pudo guardar el estado. No se ha cambiado la activación.');
    } finally {setSaving(false);}
  };
  const onCopy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(PACK.pdf);
      setCopied(true); setFailed(''); setMessage('Enlace copiado. Verifica permisos de Drive antes de compartirlo.');
    } catch {
      setFailed('No se pudo copiar automáticamente. Abre el PDF y copia su URL desde Drive.');
    }
  };
  return <section className="freebies-workspace" aria-label="Biblioteca privada de freebies">
    <header className="freebies-header">
      <div>
        <div className="freebies-eyebrow"><Gift size={16}/> FREEBIES · MI ESTUDIO</div>
        <h2>Freebies listos para lanzar, a tu ritmo.</h2>
        <p>Una biblioteca de recursos para preparar campañas con anticipación. Cada pieza conserva su portada, guía, fotos y prompts en una misma ficha privada.</p>
      </div>
      <span className="freebies-sparkle" aria-hidden="true"><Sparkles size={26}/></span>
    </header>
    <div className="freebies-card">
      <div className="freebies-art">
        <div className="freebies-art-top"><span>THE LAUNCH ERA</span><span>DECEMBER / 2026</span></div>
        <span className="freebies-art-small">THE LAVENDER EDIT</span>
        <h3>December<br/><em>Creative Pack</em></h3>
        <p>ChatGPT Prompts for<br/>Product Ad Visuals</p>
        <div className="freebies-art-stamp">5 PROMPTS <span>·</span> 5 VISUALS</div>
        <span className="freebies-art-bottom">CREATIVE PROMPT GUIDE</span>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row">
          <span className={active ? 'freebies-status is-active' : 'freebies-status'}>{active ? <Check size={14}/> : <LockKeyhole size={14}/>} {active ? 'Activo · distribución manual' : 'Borrador privado'}</span>
          <span className="freebies-date"><CalendarDays size={15}/> Diciembre 2026</span>
        </div>
        <h3>{FREEBIE_TITLE}</h3>
        <p className="freebies-description">Freebie editorial para crear fotografías de producto en soft purple. Incluye una guía de ocho páginas, cinco visuales, cinco prompts originales reutilizables y una presentación GIF.</p>
        <div className="freebies-meta">
          <span><ImageIcon size={15}/> 5 PNG individuales</span>
          <span><Languages size={15}/> Inglés + español</span>
          <span><ClipboardCopy size={15}/> 5 prompts copiables</span>
        </div>
        <div className="freebies-actions">
          {external(PACK.pdf,'Ver guía PDF',Download)}
          {external(PACK.images,'Ver 5 imágenes',ImageIcon)}
          {external(PACK.prompts,'Prompts EN / ES',ClipboardCopy)}
          {external(PACK.animation,'Ver GIF',Sparkles)}
          {external(PACK.folder,'Carpeta completa',ExternalLink)}
        </div>
        <div className="freebies-publishing">
          <div>
            <strong>{active ? 'Disponible para compartir' : 'Reservado para diciembre'}</strong>
            <small>{active ? 'La activación está guardada en el Studio. Compartir la URL y cambiar permisos de Drive sigue siendo manual.' : 'El contenido ya está guardado; no se ha activado ni entregado públicamente.'}</small>
          </div>
          <button type="button" className={active ? 'freebies-toggle is-active' : 'freebies-toggle'} onClick={() => void onToggle()} disabled={saving || readOnly || !item || (!active && !canLaunch)}>
            {saving ? 'Guardando…' : active ? 'Volver a borrador' : 'Activar en diciembre'}
          </button>
        </div>
        {active && <button type="button" className="freebies-copy" onClick={() => void onCopy()}><ClipboardCopy size={17}/>{copied ? 'Enlace copiado' : 'Copiar enlace de entrega'}</button>}
        {!item && <p role="alert" className="freebies-alert">No se encontró el registro de este freebie en el Studio. La activación está deshabilitada hasta restaurarlo.</p>}
        {message && <p role="status" className="freebies-notice">{message}</p>}
        {failed && <p role="alert" className="freebies-alert">{failed}</p>}
        <p className="freebies-disclaimer">Esta sección es privada. Cambiar a «activo» no publica en Instagram, ni manda DMs o emails, ni hace públicas las carpetas de Drive.</p>
      </div>
    </div>
    <div className="freebies-photo-bank" aria-label="Galería de ejemplos">
      <div className="freebies-gallery-head"><h3>Visuales del freebie</h3><span>5 ejemplos · Fotos en Drive</span></div>
      <div className="freebies-photo-grid">
        {PHOTOS.map(photo=><a key={photo.id} href={'https://drive.google.com/file/d/' + photo.id + '/view'} target="_blank" rel="noopener noreferrer" className="freebies-photo">
          <span className="freebies-photo-preview"><img loading="lazy" src={driveThumbnail(photo.id)} alt={photo.name} onError={e => { e.currentTarget.style.display='none'; }}/></span>
          <span>{photo.name}<ExternalLink size={13}/></span>
        </a>)}
      </div>
    </div>
  </section>;
}
