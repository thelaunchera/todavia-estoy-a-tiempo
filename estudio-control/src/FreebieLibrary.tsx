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
const NOVEMBER_FILES = {
  folder: 'https://drive.google.com/drive/folders/1bwCsa_Kn-NNBADo8ZisSTba63wvgN7cU',
  photos: 'https://drive.google.com/drive/folders/1_axcVjDNox1P0jevZay4OEuIOh1pHHgj',
  access: 'https://podcast.thelaunchera.com/freebies/november-website/access/',
  signup: 'https://podcast.thelaunchera.com/freebies/november-website/',
  automation: 'https://us2.make.com/2964061/scenarios/6912483',
};
const NOVEMBER_PHOTOS = [
  {src:'/assets/freebies/november-website/01_laptop_workspace.svg',name:'01 · Website planning'},
  {src:'/assets/freebies/november-website/02_coffee_planning.svg',name:'02 · Creative process'},
  {src:'/assets/freebies/november-website/03_mobile_review.svg',name:'03 · Mobile review'},
] as const;
const SALT_LINE = {
  folder: 'https://drive.google.com/drive/folders/1KcEkuwkLcmzUY9PWsh0cvUSsCOyAzDsA',
  pdf: 'https://drive.google.com/file/d/1kkRLliJaRtHKYes8X8FzPuSxP2vqZ5jc/view',
  access: 'https://podcast.thelaunchera.com/freebies/january-salt-line/access/',
  signup: 'https://podcast.thelaunchera.com/freebies/january-salt-line/',
  hero: '1cjtBtDSUEsMmh_v9zzpExZJYWgJLN7g0',
  make: 'https://us2.make.com/2964061/scenarios/6912745',
} as const;
const SALT_LINE_PHOTOS = [
  { id: '1wbN3yQEhlC6hAWg9h5oDQSXhhsfy7Pkx', name: '01 · The Woman' },
  { id: '1PBlU6oDOb2EIVkULqJpw4rHaFt0bXVRI', name: '04 · The Iris' },
  { id: '1Mk-bNVW1vZ0SVFTPs2nN57U8eYLEdfsR', name: '07 · The Lip' },
  { id: '1PIe48A_dJaZmQ7noiDLijxBivcqIz9l6', name: '06 · The Hollow' },
] as const;
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
function drivePreview(id: string) {
  return 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/preview';
}
function external(url: string, label: string, Icon: typeof ExternalLink) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="freebies-link"><Icon size={17} /> {label}<ExternalLink size={14}/></a>;
}
/** The owner can always preview a prepared freebie; this does not publish it or bypass email-delivery QA. */
function openFreebie(url: string, title: string) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="freebies-link freebies-link-primary" aria-label={'Abrir freebie: '+title}>
    <ExternalLink size={17}/> Abrir freebie <ExternalLink size={14}/>
  </a>;
}
export default function FreebieLibrary({entries, onChanged, readOnly=false}: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState('');

  const item = useMemo(() => entries.find(x => x.section === FREEBIES_SECTION && x.title === FREEBIE_TITLE),[entries]);
  const november = useMemo(() => entries.find(x => x.section === NOVEMBER_SECTION && x.title === NOVEMBER_TITLE),[entries]);
  const matcha = useMemo(() => entries.find(x => x.section === FREEBIES_SECTION && x.title === MATCHA_TITLE),[entries]);
  const active = item?.status === 'activo';
  const privateReady = item?.status === 'listo_privado';
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
        <p>Regla: todos funcionan como Matcha — ejemplos originales, formulario por correo, confirmación personal y biblioteca de prompts editables. Nov 19 · Dic 1 · Ene 2. El contenido se prepara en privado y solo se muestra en el landing desde su fecha.</p>
      </div>
      <span className="freebies-sparkle" aria-hidden="true"><Sparkles size={26}/></span>
    </header>
    <div className="freebies-collection" aria-label="Biblioteca de freebies y lanzamientos">
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
        <div className="freebies-actions freebies-main-actions">{openFreebie(MATCHA_LINK_ES,'Matcha · Español')}{external(MATCHA_LINK_EN,'English',ExternalLink)}</div>
        {!matcha && <p className="freebies-alert">Falta el registro de matcha en el Studio; la página original permanece intacta.</p>}
      </div>
    </div>
    <div className="freebies-card freebies-november-card">
      <div className="freebies-november-cover">
        <img src="/assets/freebies/november-website/cover.svg" alt="Portada aprobada: Tu web con un solo prompt" loading="lazy"/>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row"><span className="freebies-status"><LockKeyhole size={14}/> {november?.status === 'listo_privado' ? 'Preparado · privado' : november?.status || 'Pendiente de revisión'}</span><span className="freebies-date"><CalendarDays size={15}/> 19 noviembre 2026</span></div>
        <h3>Tu web con un solo prompt</h3>
        <p className="freebies-description">Crea tu primera web con ChatGPT y AppDeploy. Incluye 3 fotografías sin texto y el prompt copiable en ES / EN.</p>
        <div className="freebies-november-photos" aria-label="Las tres fotos del freebie de noviembre">
          {NOVEMBER_PHOTOS.map(photo=><a key={photo.src} href={NOVEMBER_FILES.photos} target="_blank" rel="noopener noreferrer" aria-label={'Ver '+photo.name+' en Drive'}><img src={photo.src} alt={photo.name} loading="lazy"/></a>)}
        </div>
        <div className="freebies-meta"><span><Languages size={15}/> ES / EN</span><span><Mail size={15}/> Confirmación de email · acceso personal</span></div>
        <div className="freebies-actions freebies-main-actions">
          {openFreebie(NOVEMBER_FILES.signup,'Tu web con un solo prompt · solicitud por correo')}
          {external(NOVEMBER_FILES.signup,'Solicitud por correo',Mail)}
        </div>
        <details className="freebies-details"><summary>Fotos y automatización</summary>
          <div className="freebies-actions">
            {external(NOVEMBER_FILES.photos,'Abrir fotos en Drive',ImageIcon)}
            {external(NOVEMBER_FILES.folder,'Carpeta completa',ExternalLink)}
            {external(NOVEMBER_FILES.automation,'Automatización Make',ExternalLink)}
          </div>
        </details>
        {!november && <p className="freebies-alert">No se encontró la ficha original de noviembre en el Studio.</p>}
      </div>
    </div>
    <div className="freebies-card">
      <div className="freebies-approved-cover">
        <a href={'https://drive.google.com/file/d/' + DECEMBER_APPROVED_COVER_ID + '/view'} target="_blank" rel="noopener noreferrer" aria-label="Abrir la portada original aprobada de diciembre">
          <iframe src={drivePreview(DECEMBER_APPROVED_COVER_ID)} title="Portada original aprobada de diciembre" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <span>Portada original · Ver en Drive <ExternalLink size={13}/></span>
        </a>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row">
          <span className="freebies-status"><LockKeyhole size={14}/>{privateReady ? 'Listo en privado · no público' : active ? 'Activo en Studio · entrega sin verificar' : 'Borrador · entrega por correo pendiente'}</span>
          <span className="freebies-date"><CalendarDays size={15}/> 1 diciembre 2026</span>
        </div>
        <h3>{FREEBIE_TITLE}</h3>
        <p className="freebies-description">5 prompts para fotografías de producto con estética soft purple, galería de ejemplos y entrega mediante confirmación personal por correo.</p>
        <div className="freebies-meta">
          <span><ImageIcon size={15}/> 5 PNG individuales</span>
          <span><Languages size={15}/> Inglés + español</span>
          <span><ClipboardCopy size={15}/> 5 prompts copiables</span>
        </div>
        <div className="freebies-inline-gallery" aria-label="Cinco fotos originales del freebie de diciembre">
          {PHOTOS.map(photo => <a key={photo.id} href={'https://drive.google.com/file/d/'+photo.id+'/view'} target="_blank" rel="noopener noreferrer" className="freebies-inline-photo" aria-label={"Abrir "+photo.name+" en Drive"}><iframe title={photo.name} src={drivePreview(photo.id)} loading="lazy" tabIndex={-1} /><span>{photo.name}</span></a>)}
        </div>
        <div className="freebies-actions freebies-main-actions">
          {openFreebie(PACK.signup,'December Creative Pack · solicitud por correo')}
          {external(PACK.signup,'Solicitud por correo',Mail)}
        </div>
        <details className="freebies-details"><summary>Gestionar freebie de diciembre</summary><div className="freebies-actions">
          {external(PACK.make,'Automatización Make · QA pendiente',ExternalLink)}
          {external(PACK.images,'Abrir carpeta de fotos en Drive',ImageIcon)}
          {external(PACK.prompts,'Prompts fuente · solo administración',ClipboardCopy)}
          {external(PACK.animation,'Ver GIF',Sparkles)}
          {external(PACK.folder,'Abrir carpeta completa en Drive',ExternalLink)}
        </div>
        </details>
        <details className="freebies-details"><summary>Estado de lanzamiento y envío</summary><div className="freebies-publishing">
          <div>
            <strong>Entrega unificada por correo · publicación programada para el 1 de diciembre</strong>
            <small>La nueva biblioteca necesita confirmación por email. Su anuncio público se mantiene oculto hasta la fecha de lanzamiento. Las imágenes y prompts originales están conservados.</small>
          </div>
          <button type="button" className={active ? 'freebies-toggle is-active' : 'freebies-toggle'} onClick={() => void onToggle()} disabled={saving || readOnly || !item || (!active && (!canLaunch || !emailDeliveryVerified))}>
            {saving ? 'Guardando…' : active ? 'Volver a borrador' : 'Activar tras verificar email'}
          </button>
        </div>
        {!item && <p role="alert" className="freebies-alert">No se encontró el registro de este freebie en el Studio. La activación está deshabilitada hasta restaurarlo.</p>}
        {message && <p role="status" className="freebies-notice">{message}</p>}
        {failed && <p role="alert" className="freebies-alert">{failed}</p>}
        <p className="freebies-disclaimer">No publicar materiales privados de Drive. El acceso público utiliza confirmación de correo y las fechas programadas, nunca los enlaces de administración.</p></details>
      </div>
    </div>
    <div className="freebies-card freebies-salt-line-card">
      <div className="freebies-approved-cover">
        <a href={'https://drive.google.com/file/d/' + SALT_LINE.hero + '/view'} target="_blank" rel="noopener noreferrer" aria-label="Abrir hero SALT LINE de enero en Drive">
          <iframe src={drivePreview(SALT_LINE.hero)} title="SALT LINE · Hero aprobado · Enero 2027" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <span>Hero aprobado · Original en Drive <ExternalLink size={13}/></span>
        </a>
      </div>
      <div className="freebies-info">
        <div className="freebies-status-row"><span className="freebies-status"><LockKeyhole size={14}/> Preparado en privado · entrega pendiente de QA</span><span className="freebies-date"><CalendarDays size={15}/> 2 enero 2027</span></div>
        <h3>SALT LINE · 8 Macro Beauty Photo Prompts</h3>
        <p className="freebies-description">Serie editorial macro con textura real, 8 prompts adaptables y 4 fotos individuales aprobadas. Usa el hero original para mostrar calidad y textura.</p>
        <div className="freebies-meta"><span><Languages size={15}/> Inglés</span><span><ImageIcon size={15}/> 4 fotos individuales</span><span><ClipboardCopy size={15}/> PDF · 13 páginas</span></div>
        <div className="freebies-inline-gallery" aria-label="Cuatro fotografías individuales de SALT LINE">
          {SALT_LINE_PHOTOS.map(photo => <a key={photo.id} href={'https://drive.google.com/file/d/'+photo.id+'/view'} target="_blank" rel="noopener noreferrer" className="freebies-inline-photo" aria-label={'Abrir '+photo.name+' en Drive'}><iframe title={photo.name} src={drivePreview(photo.id)} loading="lazy" tabIndex={-1} /><span>{photo.name}</span></a>)}
        </div>
        <div className="freebies-actions freebies-main-actions">
          {openFreebie('https://podcast.thelaunchera.com/freebies/january-salt-line/','SALT LINE · solicitud por correo')}
        </div>
        <details className="freebies-details"><summary>Archivos originales y producción</summary>
          <div className="freebies-actions">
            {external(SALT_LINE.folder,'Carpeta SALT LINE · Drive',ExternalLink)}
            {external(SALT_LINE.pdf,'PDF fuente · solo administración',ClipboardCopy)}
            {external(SALT_LINE.signup,'Formulario de enero · desactivado hasta QA',Mail)}
            {external(SALT_LINE.access,'Página de entrega web · PDF',ExternalLink)}
            {external(SALT_LINE.make,'Escenario Make · inactivo',ExternalLink)}
          </div>
        </details>
        <p className="freebies-disclaimer">Preparado para el 2 de enero de 2027. Abrir freebie muestra la página de solicitud; el correo, la confirmación y los prompts privados se habilitan solo desde la fecha de lanzamiento. La entrega real todavía requiere QA de extremo a extremo.</p>
      </div>
    </div>
    </div>

  </section>;
}
