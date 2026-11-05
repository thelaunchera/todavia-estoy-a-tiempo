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
const MATCHA_TITLE = 'Matcha · One Photo, Eight Prompts';
const MATCHA_LINK_ES = 'https://podcast.thelaunchera.com/content-lab/prompts/';
const MATCHA_LINK_EN = 'https://podcast.thelaunchera.com/content-lab/prompts/en/';
const DECEMBER_APPROVED_COVER_ID = '12FpBKPtlwdACHZsVOxLIcRX_puTvfzTf';
const PACK = {
  folder: 'https://drive.google.com/drive/folders/1qD7EmHCyKEs-aHUFlloKP9-nDuv1q7Ug',
  images: 'https://drive.google.com/drive/folders/1zqzLqSkPobH0DQnGfmFAhNkJ0o2YxQNm',
  prompts: 'https://drive.google.com/file/d/1YoVsthcjmxEamdB7CKah75eHzsnpWL4g/view',
  animation: 'https://drive.google.com/file/d/1QZ-QmXCnen-EEwWoYw50lmLRjHWaUoHX/view',
  access: 'https://podcast.thelaunchera.com/freebies/december-lavender/',
  signup: 'https://podcast.thelaunchera.com/freebies/december-lavender/signup/',
  make: 'https://us2.make.com/2964061/scenarios/6912342',
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
  const matcha = useMemo(() => entries.find(x => x.section === FREEBIES_SECTION && x.title === MATCHA_TITLE),[entries]);
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
        <p>Matcha, noviembre y diciembre juntos, conservando sus fotos y diseños originales. No se sustituirán las portadas por recreaciones. Los nuevos accesos por email requieren verificación antes de activar.</p>
      </div>
      <span className="freebies-sparkle" aria-hidden="true"><Sparkles size={26}/></span>
    </header>
    <div className="freebies-collection" aria-label="Los tres freebies en una galería">
    <div className="freebies-card freebies-matcha-card">
      <div className="freebies-matcha-art">
        <div className="freebies-art-top"><span>THE LAUNCH ERA</span><span>FREEBIE · ORIGINAL</span></div>
        <span className="freebies-art-small">ONE PHOTO · EIGHT PROMPTS</span>
        <h3>Matcha <em>Visuals</em></h3>
        <div className="freebies-matcha-photos" aria-label="Las ocho fotos originales del freebie de matcha">
          {Array.from({length:8},(_,i)=><img key={i} src={'/content-lab/prompts/matcha-'+String(i+1).padStart(2,'0')+'.jpg'} alt={'Matcha · fotografía original '+String(i+1).padStart(2,'0')} loading="lazy" />)}
        </div>
        <span className="freebies-art-bottom">IMÁGENES ORIGINALES · SIN RECREACIONES</span>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row"><span className="freebies-status"><ImageIcon size={14}/> Original en Content Lab</span><span className="freebies-date">8 imágenes</span></div>
        <h3>{MATCHA_TITLE}</h3>
        <p className="freebies-description">8 fotografías originales y prompts para crear imágenes de producto.</p>
        <div className="freebies-meta"><span><Languages size={15}/> Español / English</span><span><ImageIcon size={15}/> 8 fotos originales</span></div>
        <div className="freebies-actions">{external(MATCHA_LINK_ES,'Abrir freebie · ES',ExternalLink)}{external(MATCHA_LINK_EN,'English',ExternalLink)}</div>
        {!matcha && <p className="freebies-alert">Falta el registro de matcha en el Studio; la página original permanece intacta.</p>}
      </div>
    </div>
    <div className="freebies-card freebies-november-card">
      <div className="freebies-art freebies-art-november freebies-art-source-only">
        <div className="freebies-art-top"><span>THE LAUNCH ERA</span><span>NOVEMBER / 2026</span></div>
        <span className="freebies-art-small">NOVEMBER · WEBSITE FREEBIE</span>
        <h3>One Prompt.<br/><em>Your Website.</em></h3>
        <p>Un prompt para crear tu propia web con IA.</p>
        <span className="freebies-art-bottom">PORTADA ORIGINAL PENDIENTE · VER FICHA</span>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row"><span className="freebies-status"><LockKeyhole size={14}/> {november?.status || 'Pendiente de revisión'}</span><span className="freebies-date"><CalendarDays size={15}/> Noviembre 2026</span></div>
        <h3>Tu web con un solo prompt</h3>
        <p className="freebies-description">Crea tu primera web con ChatGPT y AppDeploy. Recursos ES / EN.</p>
        <div className="freebies-meta"><span><Languages size={15}/> ES / EN</span><span><Mail size={15}/> Acceso por correo · pendiente de QA</span></div>
        <div className="freebies-actions">{external('https://app.notion.com/p/40da68f2ee6e81eb8308c07323903949?pvs=204','Ver freebie original',ExternalLink)}</div>
        {!november && <p className="freebies-alert">No se encontró la ficha original de noviembre en el Studio.</p>}
      </div>
    </div>
    <div className="freebies-card">
      <div className="freebies-approved-cover">
        <a href={'https://drive.google.com/file/d/' + DECEMBER_APPROVED_COVER_ID + '/view'} target="_blank" rel="noopener noreferrer" aria-label="Abrir la portada original aprobada de diciembre">
          <img src={driveThumbnail(DECEMBER_APPROVED_COVER_ID)} alt="Portada original aprobada: December ChatGPT Prompts for Product Visuals en tonos soft purple" loading="lazy" />
          <span>Portada original · Ver en Drive <ExternalLink size={13}/></span>
        </a>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row">
          <span className="freebies-status"><LockKeyhole size={14}/>{active ? 'Activo en Studio · entrega sin verificar' : 'Borrador · entrega por correo pendiente'}</span>
          <span className="freebies-date"><CalendarDays size={15}/> Diciembre 2026</span>
        </div>
        <h3>{FREEBIE_TITLE}</h3>
        <p className="freebies-description">5 prompts para fotografías de producto con estética soft purple. Acceso web por correo, sin PDF.</p>
        <div className="freebies-meta">
          <span><ImageIcon size={15}/> 5 PNG individuales</span>
          <span><Languages size={15}/> Inglés + español</span>
          <span><ClipboardCopy size={15}/> 5 prompts copiables</span>
        </div>
        <details className="freebies-details"><summary>Gestionar freebie de diciembre</summary><div className="freebies-actions">
          {external(PACK.access,'Página de acceso · 5 prompts',ExternalLink)}
          {external(PACK.signup,'Formulario de registro · diciembre',Mail)}
          {external(PACK.make,'Automatización Make · QA pendiente',ExternalLink)}
          {external(PACK.images,'Ver 5 imágenes',ImageIcon)}
          {external(PACK.prompts,'Prompts fuente · solo administración',ClipboardCopy)}
          {external(PACK.animation,'Ver GIF',Sparkles)}
          {external(PACK.folder,'Carpeta completa',ExternalLink)}
        </div>
        </details>
        <details className="freebies-details"><summary>Estado de lanzamiento y envío</summary><div className="freebies-publishing">
          <div>
            <strong>{emailDeliveryVerified ? 'Preparado para activar' : 'Escenario de envío creado en Make · inactivo hasta QA'}</strong>
            <small>Formulario y envío preparados; falta probar una entrega real, revisar el acceso y validar los cinco ejemplos visuales. El material de Drive es solo para producción interna.</small>
          </div>
          <button type="button" className={active ? 'freebies-toggle is-active' : 'freebies-toggle'} onClick={() => void onToggle()} disabled={saving || readOnly || !item || (!active && (!canLaunch || !emailDeliveryVerified))}>
            {saving ? 'Guardando…' : active ? 'Volver a borrador' : 'Activar tras verificar email'}
          </button>
        </div>
        {!item && <p role="alert" className="freebies-alert">No se encontró el registro de este freebie en el Studio. La activación está deshabilitada hasta restaurarlo.</p>}
        {message && <p role="status" className="freebies-notice">{message}</p>}
        {failed && <p role="alert" className="freebies-alert">{failed}</p>}
        <p className="freebies-disclaimer">No compartir los archivos de Drive ni el PDF fuente con el público. La activación permanece bloqueada hasta comprobar el flujo de correo y acceso a la página.</p></details>
      </div>
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
