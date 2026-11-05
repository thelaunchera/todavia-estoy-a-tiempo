import { useMemo, useState } from 'react';
import { CalendarDays, ClipboardCopy, ExternalLink, Gift, Image as ImageIcon, Languages, LockKeyhole, Sparkles, Mail } from 'lucide-react';
import { api } from './supabase-client';
import './freebie-library.css';

/** Private production record: launching does not send emails, post to Instagram or change Google Drive permissions. */
export const FREEBIES_SECTION = 'studio-freebies-v1';
const FREEBIE_TITLE = 'December Creative Pack — The Lavender Edit';
const LAUNCH_DATE = '2026-12-01';
const NOVEMBER_TITLE = 'Freebie · Tu web con un solo prompt · Borrador ES/EN';
const NOVEMBER_SECTION = 'studio-link-center-v1';
const PACK = {
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

  const item = useMemo(() => entries.find(x => x.section === FREEBIES_SECTION && x.title === FREEBIE_TITLE),[entries]);
  const november = useMemo(() => entries.find(x => x.section === NOVEMBER_SECTION && x.title === NOVEMBER_TITLE),[entries]);
  const active = item?.status === 'activo';
  const canLaunch = afterDecemberStart();
  // Never enable a public launch until the email registration, protected access
  // and delivery have passed an end-to-end test. A date alone is insufficient.
  const emailDeliveryVerified = false;
  const onToggle = async () => {
    if (!item || saving || readOnly) return;
    if (!active && (!canLaunch || !emailDeliveryVerified)) {
      setFailed('Activación bloqueada: falta comprobar el formulario, el correo y el acceso privado al recurso. No se enviará ningún PDF.');
      return;
    }
    const nextActive = !active;
    const action = nextActive ? '¿Marcar el freebie como activo? Confirma que la página privada y el correo de acceso funcionan. No se enviarán PDFs ni enlaces de Drive al público.' : '¿Devolver este freebie a borrador privado?';
    if (!window.confirm(action)) return;
    setSaving(true); setFailed(''); setMessage('');
    try {
      await api.put('/api/items/ideas/' + item.id, {status: nextActive ? 'activo' : 'borrador'});
      await onChanged();
      setMessage(nextActive ? 'Estado actualizado. Verifica la entrega por correo antes de promocionarlo.' : 'Estado guardado: borrador privado. La ficha sigue disponible para editar.');
    } catch {
      setFailed('No se pudo guardar el estado. No se ha cambiado la activación.');
    } finally {setSaving(false);}
  };
  return <section className="freebies-workspace" aria-label="Biblioteca privada de freebies">
    <header className="freebies-header">
      <div>
        <div className="freebies-eyebrow"><Gift size={16}/> FREEBIES · MI ESTUDIO</div>
        <h2>Monthly Creative Packs</h2>
        <p>Todos tus freebies en un solo lugar: noviembre y diciembre, con sus recursos de producción y su propio estado. La entrega al público será por correo con acceso a una página, nunca mediante PDF.</p>
      </div>
      <span className="freebies-sparkle" aria-hidden="true"><Sparkles size={26}/></span>
    </header>
    <div className="freebies-card freebies-november-card">
      <div className="freebies-art freebies-art-november">
        <div className="freebies-art-top"><span>THE LAUNCH ERA</span><span>NOVEMBER / 2026</span></div>
        <span className="freebies-art-small">FREEBIE · NOVEMBER</span>
        <h3>One Prompt.<br/><em>Your Website.</em></h3>
        <p>Create your first website with AI</p>
        <div className="freebies-art-stamp">CHATGPT <span>·</span> APPDEPLOY</div>
        <span className="freebies-art-bottom">THE LAUNCH ERA · FREE RESOURCE</span>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row"><span className="freebies-status"><LockKeyhole size={14}/> {november?.status || 'Pendiente de revisión'}</span><span className="freebies-date"><CalendarDays size={15}/> Noviembre 2026</span></div>
        <h3>Tu web con un solo prompt</h3>
        <p className="freebies-description">Freebie de noviembre para crear una web con ChatGPT y AppDeploy. Recurso en español e inglés; mantenemos su ficha de producción existente y su enlace de Notion sin duplicar archivos.</p>
        <div className="freebies-meta"><span><Languages size={15}/> ES / EN</span><span><Mail size={15}/> Acceso por correo · pendiente de QA</span></div>
        {external('https://app.notion.com/p/40da68f2ee6e81eb8308c07323903949?pvs=204','Abrir ficha original de noviembre',ExternalLink)}
        {!november && <p className="freebies-alert">No se encontró la ficha original de noviembre en el Studio.</p>}
      </div>
    </div>
    <div className="freebies-card">
      <div className="freebies-art">
        <div className="freebies-art-top"><span>THE LAUNCH ERA</span><span>DECEMBER / 2026</span></div>
        <span className="freebies-art-small">THE LAVENDER EDIT</span>
        <h3>ChatGPT<br/><em>Prompts</em></h3>
        <p>for Product Visuals<br/>5 ready-to-use prompts</p>
        <div className="freebies-art-stamp">5 PROMPTS <span>·</span> 5 VISUALS</div>
        <span className="freebies-art-bottom">CREATIVE PROMPT GUIDE</span>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row">
          <span className="freebies-status"><LockKeyhole size={14}/>{active ? 'Activo en Studio · entrega sin verificar' : 'Borrador · entrega por correo pendiente'}</span>
          <span className="freebies-date"><CalendarDays size={15}/> Diciembre 2026</span>
        </div>
        <h3>{FREEBIE_TITLE}</h3>
        <p className="freebies-description">Freebie de diciembre con cinco prompts de ChatGPT y cinco visuales de producto en lavanda. La audiencia recibirá por email acceso a una página con los prompts copiables y las imágenes; no recibirá un PDF.</p>
        <div className="freebies-meta">
          <span><ImageIcon size={15}/> 5 PNG individuales</span>
          <span><Languages size={15}/> Inglés + español</span>
          <span><ClipboardCopy size={15}/> 5 prompts copiables</span>
        </div>
        <div className="freebies-actions">
          {external(PACK.images,'Ver 5 imágenes',ImageIcon)}
          {external(PACK.prompts,'Prompts fuente · solo administración',ClipboardCopy)}
          {external(PACK.animation,'Ver GIF',Sparkles)}
          {external(PACK.folder,'Carpeta completa',ExternalLink)}
        </div>
        <div className="freebies-publishing">
          <div>
            <strong>{emailDeliveryVerified ? 'Preparado para activar' : 'Entrega por correo pendiente de configurar y probar'}</strong>
            <small>Falta comprobar registro de email, envío, enlace de acceso y protección de la página. El material de Drive es solo para producción interna.</small>
          </div>
          <button type="button" className={active ? 'freebies-toggle is-active' : 'freebies-toggle'} onClick={() => void onToggle()} disabled={saving || readOnly || !item || (!active && (!canLaunch || !emailDeliveryVerified))}>
            {saving ? 'Guardando…' : active ? 'Volver a borrador' : 'Activar tras verificar email'}
          </button>
        </div>
        {!item && <p role="alert" className="freebies-alert">No se encontró el registro de este freebie en el Studio. La activación está deshabilitada hasta restaurarlo.</p>}
        {message && <p role="status" className="freebies-notice">{message}</p>}
        {failed && <p role="alert" className="freebies-alert">{failed}</p>}
        <p className="freebies-disclaimer">No compartir los archivos de Drive ni el PDF fuente con el público. La activación permanece bloqueada hasta comprobar el flujo de correo y acceso a la página.</p>
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
