import SupportInbox from './SupportInbox';
import ClassProduction from './ClassProduction';
import FinishedDemos from './FinishedDemos';
import ReelsProduction from './ReelsProduction';
import BonusLibrary from './BonusLibrary';
import StudentManager from './StudentManager';
import WaitlistManager from './WaitlistManager';
import LinkCenter, { LINK_CENTER_SECTION } from './LinkCenter';
import { CLASS_SECTION, CLASS_TASK_SECTION } from './class-course';
import { REELS_SECTION } from './reels-plan';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { auth, api, SUPABASE_ENABLED, hasLocalVault, downloadEncryptedBackup, importEncryptedBackup, importLocalRecords, getThemeSongStats, getClassLaunchStats, getVerifiedSales, getVerifiedOwnership, type VerifiedOwnership, type VerifiedSale, type ClassLaunchStats, type AudioStats } from './supabase-client';
import {
  LayoutDashboard,
  Mic2,
  CalendarDays,
  ShoppingBag,
  Link2,
  ListChecks,
  Lightbulb,
  CreditCard,
  ReceiptText,
  AudioLines,
  Users,
  Mail,
  Workflow,
  SearchCheck,
  Settings2,
  Plus,

  Check,
  Clock3,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  RotateCcw,
  LogOut,
  ExternalLink,
  AlertCircle,
  Menu,
  Video,
  Film,
  EyeOff,
  FileAudio,
  Globe2,
  Sparkles,
  LockKeyhole,
  Heart,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import './studio.css';
import { groupEpisodes, narrationBlocks, dialogueForAudience } from './episode-library';
import { normalizeSpotifyEpisodeLink, validSpotifyEpisode, SPOTIFY_EPISODE_ERROR } from './spotify-links';
import { editorialPlan } from './editorial-plan';
type Kind = 'episodios' | 'tareas' | 'productos' | 'ideas';
type Page =
  | 'inicio'
  | 'episodios'
  | 'reels'
  | 'clases'
  | 'demos'
  | 'alumnos'
  | 'espera'
  | 'bonos'
  | 'club'
  | 'calendario'
  | 'tareas'
  | 'productos'
  | 'links'
  | 'ideas'
  | 'ventas'
  | 'audiencia'
  | 'cancion'
  | 'soporte'
  | 'flujos'
  | 'seo'
  | 'ajustes';
type Row = {
  id: string;
  title: string;
  status?: string;
  date?: string;
  summary?: string;
  subtitle?: string;
  price?: number;
  link?: string;
  notes?: string;
  section?: string;
  priority?: string;
  audio?: string;
  art?: string;
  email_art_url?: string;
  script?: string;
  announcement_state?: string;
  audio_ready?: boolean;
  number?: number;
  series?: string;
  series_number?: number;
  script_reviewed?: boolean;
  spotify_description?: string;
  reel_excerpt?: string;
  reel_overlay?: string;
  visual_idea?: string;
  performance_notes?: string;
  archived?: boolean;
  episode_format?: string;
  planning_status?: string;
  planning_month?: string;
};
type Data = {
  records: Record<Kind, Row[]>;
  sources: {
    lastVerified: string;
    sales: string;
    subscribers: string;
    support: string;
    seo: string;
  };
};
function validEmailArtUrl(value?:string){
  try {
    const url = new URL((value||'').trim());
    return url.protocol==='https:' && !url.username && !url.password &&
      /\.(?:png|jpe?g|webp)$/i.test(url.pathname);
  } catch { return false; }
}
/** Formatea solo la moneda que realmente consta en el registro, sin asumir USD. */
function formatSaleAmount(s: VerifiedSale):string{
  if(typeof s.amount_cents!=='number'||!Number.isFinite(s.amount_cents))return 'Importe por revisar';
  const currency=(s.currency||'').trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(currency))return 'Moneda sin verificar';
  try{return new Intl.NumberFormat('es-US',{style:'currency',currency}).format(s.amount_cents/100);}
  catch{return 'Moneda desconocida';}
}

const SITE = 'https://podcast.thelaunchera.com/';
const LOGO = SITE + 'assets/logo-podcast-04.svg';
const COVER = SITE + 'assets/podcast-episodio-01-azul-v3.webp';
const NAV = [
  {
    id: 'inicio',
    label: 'Mi estudio',
    icon: LayoutDashboard,
    group: 'MI ESPACIO',
  },
  {
    id: 'ventas',
    label: 'Ventas e ingresos',
    icon: CreditCard,
    group: 'VENTAS Y PRODUCTOS',
  },
  { id: 'productos', label: 'Colección digital', icon: ShoppingBag },
  { id: 'links', label: 'Centro de links', icon: Link2 },
  { id: 'episodios', label: 'Episodios', icon: Mic2, group: 'CREACIÓN Y CONTENIDO' },
  { id: 'reels', label: 'Reels · producción', icon: Film },
  { id: 'clases', label: 'Clases · grabación', icon: Video },
  { id: 'demos', label: 'Demos terminados', icon: Globe2 },
  { id: 'alumnos', label: 'Centro de alumnos', icon: BookOpen },
  { id: 'espera', label: 'Lista de espera', icon: Mail },
  { id: 'bonos', label: 'Biblioteca de bonos', icon: Sparkles },
  { id: 'club', label: 'Club de Ideas', icon: Users },
  { id: 'calendario', label: 'Calendario editorial', icon: CalendarDays },
  { id: 'tareas', label: 'Tareas', icon: ListChecks },
  { id: 'ideas', label: 'Banco de ideas', icon: Lightbulb },
  { id: 'audiencia', label: 'Audiencia', icon: Users, group: 'OPERACIONES' },
  { id: 'cancion', label: 'Escuchas de la canción', icon: AudioLines },
  { id: 'soporte', label: 'Mensajes', icon: Mail },
  { id: 'flujos', label: 'Automatizaciones', icon: Workflow },
  { id: 'seo', label: 'SEO y sitio web', icon: SearchCheck },
  { id: 'ajustes', label: 'Configuración', icon: Settings2 },
] as const;
const LABELS: Record<Page, string> = {
  inicio: 'Mi estudio',
  episodios: 'Episodios',
  reels: 'Reels · producción',
  clases: 'Clases · grabación',
  demos: 'Demos terminados',
  alumnos: 'Centro de alumnos',
  espera: 'Lista de espera',
  bonos: 'Biblioteca de bonos',
  club: 'Club de Ideas',
  calendario: 'Calendario editorial',
  tareas: 'Tareas',
  productos: 'Colección digital',
  links: 'Centro de links',
  ideas: 'Banco de ideas',
  ventas: 'Ventas e ingresos',
  audiencia: 'Nuestra audiencia',
  cancion: 'Escuchas de la canción',
  soporte: 'Mensajes y ayuda',
  flujos: 'Automatizaciones',
  seo: 'SEO y sitio web',
  ajustes: 'Configuración',
};
const STATES: Record<Kind, string[]> = {
  episodios: ['borrador privado','guion listo','en producción','hecho','publicado'],
  tareas: ['pendiente', 'en curso', 'completado'],
  productos: ['borrador', 'en preparación', 'disponible', 'publicado'],
  ideas: ['en exploración', 'seleccionada', 'en desarrollo', 'archivada'],
};
const formatDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat('es-US', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(date + 'T12:00:00'))
    : 'Sin fecha';
const currency = (value?: number) =>
  typeof value === 'number'
    ? value === 0
      ? 'Gratis'
      : '$' + value.toFixed(2)
    : '—';
function Pill({
  children,
  kind = 'muted',
}: {
  children: React.ReactNode;
  kind?: string;
}) {
  return (
    <span className={'pill pill-' + kind}>
      <i />
      {children}
    </span>
  );
}
function StatePill({ status }: { status?: string }) {
  const x = (status || 'pendiente').toLowerCase();
  return (
    <Pill
      kind={
        /publicado|disponible|completado/.test(x)
          ? 'green'
          : /producción|curso|listo/.test(x)
            ? 'blue'
            : 'muted'
      }
    >
      {status || 'Pendiente'}
    </Pill>
  );
}
function CopyText({ value, label = 'Copiar' }: { value: string; label?: string }) {
  const [message, setMessage] = useState('');
  return <span className="copy-text-control"><button type="button" onClick={async () => {
    try { await navigator.clipboard.writeText(value); setMessage('Copiado'); }
    catch { setMessage('Selecciona el texto para copiarlo.'); }
  }}>{label}</button><small role="status">{message}</small></span>;
}
function NoteText({ text }: { text: string }) {
  return <div className="research-note-text">{text.split(/(https:\/\/[^\s<>\]\)]+)/g).map((part, i) =>
    part.startsWith('https://') ? <a key={i} href={part} target="_blank" rel="noreferrer">{part}</a> : part
  )}</div>;
}
function App() {
  const [passphrase, setPassphrase] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authView, setAuthView] = useState<'login'|'request'|'set'>(auth.isRecovering() ? 'set' : 'login');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetting, setResetting] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessPending, setAccessPending] = useState(false);
  const [importSecret,setImportSecret] = useState('');
  const [importing,setImporting] = useState(false);
  const [importMessage,setImportMessage] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [vaultPresent, setVaultPresent] = useState(hasLocalVault());
  const [account, setAccount] = useState<{
    email?: string;
    name?: string;
  } | null>(null);
  const [checking, setChecking] = useState(true),
    [loading, setLoading] = useState(false),
    [signing, setSigning] = useState(false);
  const [data, setData] = useState<Data | null>(null),
    [denied, setDenied] = useState(false),
    [error, setError] = useState('');
  const [page, setPage] = useState<Page>(() => new URLSearchParams(window.location.search).get('seccion')==='ventas' ? 'ventas' : 'inicio'),
    [recording, setRecording] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [search, setSearch] = useState('');

  const [seriesTab,setSeriesTab] = useState<string>('all');
  const [episodeScope,setEpisodeScope] = useState<'active'|'month'|'published'>('active');
  const [classStats,setClassStats] = useState<ClassLaunchStats|null>(null);
  const [verifiedSales,setVerifiedSales]=useState<VerifiedSale[]|null>(null);
  const [verifiedOwnership,setVerifiedOwnership]=useState<VerifiedOwnership[]|null>(null);
  const [salesError,setSalesError]=useState('');
  const [salesRefreshing,setSalesRefreshing]=useState(false);
  const [salesRefreshKey,setSalesRefreshKey]=useState(0);
  const [salesCheckedAt,setSalesCheckedAt]=useState<Date|null>(null);
  useEffect(()=>{
    if(page!=='ventas'||!account||!SUPABASE_ENABLED)return;
    let cancelled=false;
    setSalesRefreshing(true);
    setSalesError('');
    Promise.all([getVerifiedSales(),getVerifiedOwnership()]).then(([rows,owned])=>{
      if(cancelled)return;
      setVerifiedSales(rows);
      setVerifiedOwnership(owned);
      setSalesCheckedAt(new Date());
    }).catch(()=>{
      if(cancelled)return;
      setVerifiedSales(null);setVerifiedOwnership(null);
      setSalesError('No pudimos consultar las ventas verificadas. Revisa la conexión y vuelve a actualizar.');
    }).finally(()=>{if(!cancelled)setSalesRefreshing(false);});
    return()=>{cancelled=true;};
  },[page,account,salesRefreshKey]);

  useEffect(() => {
    if(page !== 'clases' || !account || !SUPABASE_ENABLED) return;
    let cancelled=false;
    getClassLaunchStats().then(result=>{if(!cancelled)setClassStats(result);})
      .catch(()=>{if(!cancelled)setClassStats(null);});
    return () => {cancelled=true;};
  },[page,account]);
  const [audioStats,setAudioStats] = useState<AudioStats|null>(null);
  const [audioStatsLoading,setAudioStatsLoading] = useState(false);
  const [audioStatsError,setAudioStatsError] = useState('');
  const refreshAudioStats = useCallback(async () => {
    if(!SUPABASE_ENABLED)return;
    setAudioStatsLoading(true);setAudioStatsError('');
    try { setAudioStats(await getThemeSongStats()); }
    catch(e) { setAudioStatsError(e instanceof Error?e.message:'No se pudieron cargar las estadísticas.'); }
    finally { setAudioStatsLoading(false); }
  },[]);
  useEffect(() => {
    if(page!=='cancion' || !account) return;
    void refreshAudioStats();
    // Mientras el estudio está abierto, refresca cada minuto sin pedirlo manualmente.
    const interval = window.setInterval(() => {
      if(document.visibilityState === 'visible') void refreshAudioStats();
    }, 60000);
    return () => window.clearInterval(interval);
  },[page,account,refreshAudioStats]);
  const [edit, setEdit] = useState<{
      kind: Kind;
      item: Partial<Row>;
      newItem: boolean;
    } | null>(null),
    [saving, setSaving] = useState(false),
    [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<{ kind: Kind; item: Row } | null>(
    null
  );
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/studio');
      const incoming = r.data as Data;
      setData({ ...incoming, records: { ...incoming.records, episodios: (incoming.records.episodios || []).map(item => ({ ...item, script: dialogueForAudience(item.script || '', item.number) })) } });
      setDenied(false);
      setError('');
    } catch {
      setDenied(true);
      setError(
        'No se pudieron cargar tus datos. Reintenta o comprueba tu cuenta.'
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await auth.getUser();
        if (alive && u) {
          setAccount(u);
          await refresh();
        }
      } catch (e) {
        if (alive) {
          const pending = (e as {code?:string})?.code === 'unauthorized';
          setAccessPending(pending);
          setError(pending
            ? 'Tu sesión está abierta, pero todavía no tiene autorización de administradora. Puedes comprobar el permiso sin solicitar otro correo.'
            : 'No pude comprobar la sesión. Si abriste el enlace desde Gmail, inténtalo en el mismo navegador donde lo solicitaste.');
        }
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);
  // Safari can resume an already-open tab after the five-day deadline.
  // Re-check local access when the tab becomes visible; do not query Supabase here.
  useEffect(() => {
    if (SUPABASE_ENABLED) return;
    let mounted = true;
    const checkLocalSession = async () => {
      if (document.visibilityState === 'hidden') return;
      const current = await auth.getUser();
      if (mounted && !current) {
        setAccount(null);
        setData(null);
        setDenied(false);
        setPage('inicio');
      }
    };
    document.addEventListener('visibilitychange', checkLocalSession);
    window.addEventListener('pageshow', checkLocalSession);
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', checkLocalSession);
      window.removeEventListener('pageshow', checkLocalSession);
    };
  }, []);
  // When an email link is opened from Safari, Supabase persists the session in this
  // browser. Re-check on return from Gmail and on token refresh without sending mail.
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    let active = true;
    let pending = false;
    const revalidate = async () => {
      if (!active || pending || auth.isRecovering() || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const user = await auth.getUser();
        if (active && user) {
          setAccount(user);
          setDenied(false);
          setAccessPending(false);
          await refresh();
        } else if (active && !user) {
          setAccount(null);
          setData(null);
        }
      } catch(e) {
        if (active && (e as {code?:string})?.code === 'unauthorized') setAccessPending(true);
      } finally {
        pending = false;
      }
    };
    const release = auth.onSessionEvent(event => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('set'); setAccount(null); setError(''); setChecking(false);
      } else if (event === 'SIGNED_OUT') {
        setAccount(null); setData(null);
      } else if (event === 'TOKEN_REFRESHED') {
        window.setTimeout(() => { void revalidate(); }, 0);
      }
    });
    const onResume = () => { void revalidate(); };
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('pageshow', onResume);
    return () => {
      active = false;
      release();
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('pageshow', onResume);
    };
  }, [refresh]);
  async function recheckAccess() {
    setCheckingAccess(true);
    setError('');
    try {
      const existing = await auth.getUser();
      if(!existing){
        setAccessPending(false);
        setError('No hay una sesión abierta en este navegador. Cuando se restablezca el límite de correos, solicita un nuevo enlace.');
        return;
      }
      setAccount(existing);
      setAccessPending(false);
      setDenied(false);
      await refresh();
    } catch(e) {
      setAccessPending((e as {code?:string})?.code === 'unauthorized');
      setError((e as {code?:string})?.code === 'unauthorized'
        ? 'La sesión sigue activa, pero aún falta autorización en Supabase. No es necesario pedir otro enlace.'
        : 'No se pudo comprobar la sesión. Revisa que estés usando el navegador correcto.');
    } finally {
      setCheckingAccess(false);
    }
  }
  async function login() {
    setSigning(true);
    setError('');
    try {
      if (!SUPABASE_ENABLED && !vaultPresent && passphrase !== confirmPhrase) {
        setError('Las frases no coinciden. Escríbelas igual para crear tu estudio.');
        return;
      }
      const r = await auth.signIn(passphrase, SUPABASE_ENABLED ? loginPassword : undefined);
      setAccount(r.user);
      setPassphrase('');
      setLoginPassword('');
      setConfirmPhrase('');
      setVaultPresent(true);
      await refresh();
    } catch (e) {
      const code = (e as {code?:string})?.code;
      setError(
        !SUPABASE_ENABLED && code==='bad_passphrase' ? 'La frase no coincide. Inténtalo de nuevo.' :
        !SUPABASE_ENABLED && code==='short_password' ? 'Usa al menos 10 caracteres para proteger el estudio.' :
        e instanceof Error ? e.message : 'No pudimos iniciar sesión.'
      );
    } finally {
      setSigning(false);
    }
  }
  async function requestPasswordReset() {
    setResetting(true); setError(''); setResetMessage('');
    try {
      await auth.requestPasswordReset(resetEmail);
      setResetMessage('Si este correo es el de tu cuenta, recibirás un enlace para crear o cambiar tu contraseña. Es el único correo que necesitas para configurarla.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos solicitar la recuperación.');
    } finally { setResetting(false); }
  }
  async function saveNewPassword() {
    setResetting(true); setError(''); setResetMessage('');
    try {
      if(newPassword !== repeatPassword)throw new Error('Las contraseñas no coinciden.');
      await auth.setPassword(newPassword);
      setNewPassword(''); setRepeatPassword('');
      setAuthView('login');
      setPassphrase('');
      setLoginPassword('');
      setResetMessage('Contraseña creada. Ya puedes entrar con tu correo y contraseña; después recordaré tu acceso cinco días.');
    } catch(e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la nueva contraseña.');
    } finally { setResetting(false); }
  }
  async function logout() {
    await auth.signOut();
    setAccount(null);
    setData(null);
    setAudioStats(null);
    setDenied(false);
    setRecording(false);
    setPage('inicio');
  }
  const items = data?.records || {
    episodios: [],
    tareas: [],
    productos: [],
    ideas: [],
  };
  const editorialIdeas = items.ideas.filter(x => x.section !== CLASS_SECTION && x.section !== REELS_SECTION && x.section !== 'clase-01-recursos-visuales' && x.section !== LINK_CENTER_SECTION);
  const episodes = useMemo(
    () =>
      [...items.episodios].sort((a,b) => {
        const numberA=Number(a.number||0),numberB=Number(b.number||0);
        if(numberA && numberB)return numberA-numberB;
        return (a.date||'9999-12-31').localeCompare(b.date||'9999-12-31');
      }),
    [items.episodios]
  );
  const tasks = items.tareas,
    products = items.productos;
  // Una sola lista de la clase en Clases · grabación; no repetir en Tareas.
  const generalTasks=tasks.filter(x=>x.section!==CLASS_TASK_SECTION);
  const paidPdfSales=verifiedSales?.filter(s=>s.status?.toLowerCase()==='paid')||[];
  const paidUsdSales=paidPdfSales.filter(s=>s.currency?.toLowerCase()==='usd' && typeof s.amount_cents==='number');
  const pdfRevenueUsdCents=paidUsdSales.reduce((sum,s)=>sum+(s.amount_cents||0),0);
  const activeProductAccess=verifiedOwnership?.filter(x=>x.status==='active')||[];
  const activeClassCount=activeProductAccess.filter(x=>x.product_code==='web-class').length;
  const activeLabCount=activeProductAccess.filter(x=>x.product_code==='content-lab').length;

  const plan = editorialPlan(episodes);
  const libraryEpisodes = episodeScope === 'month' ? plan.month : episodeScope === 'published' ? plan.published : plan.active;
  const allSeries = groupEpisodes(libraryEpisodes);
  const published = plan.published.length;
  const pending = tasks.filter(x => x.status !== 'completado').length;
  const next = plan.planned[0];
  const visible = (xs: Row[]) =>
    xs.filter(x =>
      (x.title + ' ' + (x.notes || '') + ' ' + (x.status || '') + ' ' + (x.series || '') + ' ' + (x.script || '') + ' ' + (x.spotify_description || ''))
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  const change = (p: Page) => {
    setPage(p);
    setSearch('');
    setMobileNav(false);
    // Permite abrir Ventas directamente desde un enlace sin exponer esta pantalla fuera del login.
    const nextUrl = new URL(window.location.href);
    if (p==='ventas') nextUrl.searchParams.set('seccion','ventas');
    else nextUrl.searchParams.delete('seccion');
    window.history.replaceState(window.history.state, '', nextUrl.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const newRow = (kind: Kind) => {
    if (recording) return;
    setFormError('');
    setEdit({
      kind,
      newItem: true,
      item: {
        title: '',
        status: STATES[kind][0],
        date: ['episodios', 'tareas'].includes(kind)
          ? (kind === 'episodios' ? next?.date : undefined) || new Date().toISOString().slice(0, 10)
          : undefined,
        price: kind === 'productos' ? 0 : undefined,
      },
    });
  };
  const editRow = (kind: Kind, item: Row) => {
    if (recording) return;
    setFormError('');
    setEdit({ kind, item: { ...item }, newItem: false });
  };
  async function advanceEpisode(item:Row,nextStatus:'en producción'|'hecho'|'publicado') {
    if(recording||saving||item.archived)return;
    if(item.number===19&&!item.script_reviewed){
      setEdit({kind:'episodios',item:{...item},newItem:false});
      setFormError('Este borrador personal necesita tu aprobación explícita antes de producirse o publicarse.');
      return;
    }
    if(nextStatus==='publicado') {
      if(item.status!=='hecho') {setEdit({kind:'episodios',item:{...item},newItem:false});setFormError('Primero marca el episodio como hecho.');return;}
      if(!validSpotifyEpisode(item.link)){setEdit({kind:'episodios',item:{...item},newItem:false});setFormError(SPOTIFY_EPISODE_ERROR);return;}
      if(!validEmailArtUrl(item.email_art_url)){setEdit({kind:'episodios',item:{...item},newItem:false});setFormError('Antes de avisar a los oyentes, guarda una imagen pública directa de este capítulo (.png, .jpg o .webp).');return;}
      if(!window.confirm('¿Confirmas que ya publicaste este capítulo en Spotify? Enviaremos un aviso a los oyentes suscritos.'))return;
    }
    setSaving(true);
    try {
      await api.put('/api/items/episodios/'+item.id,{title:item.title,status:nextStatus,...(nextStatus==='publicado'?{announcement_state:'pending',link:normalizeSpotifyEpisodeLink(item.link)}: {})});
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:'No se pudo cambiar el capítulo.');}finally{setSaving(false);}
  }
  async function save() {
    if (!edit) return;
    if (!String(edit.item.title || '').trim()) {
      setFormError('Escribe un título para continuar.');
      return;
    }
    const original=edit.kind==='episodios'&&!edit.newItem?episodes.find(x=>x.id===edit.item.id):null;
    if(original?.archived && edit.item.status !== original.status){
      setFormError('Este capítulo está conservado en Archivo, fuera del calendario activo.');
      return;
    }
    if(edit.kind==='episodios' && original?.number===19 && edit.item.status!=='borrador privado' && !edit.item.script_reviewed){
      setFormError('El capítulo 19 es personal. Aprueba primero el diálogo marcando la casilla al final del guion.');
      return;
    }
    if(edit.kind==='episodios'&&edit.item.status==='publicado'&&original?.status!=='publicado'){
      if(original?.status!=='hecho'){setFormError('Primero marca el episodio como hecho.');return;}
      if(!validSpotifyEpisode(edit.item.link)){setFormError(SPOTIFY_EPISODE_ERROR);return;}
      if(!validEmailArtUrl(edit.item.email_art_url)){setFormError('El capítulo necesita su imagen pública directa (.png, .jpg o .webp) antes de notificar por correo.');return;}
      if(!window.confirm('¿Este capítulo ya está publicado en Spotify? Confirmar enviará el aviso a los oyentes suscritos.'))return;
      edit.item.announcement_state='pending';
    }
    setSaving(true);
    setFormError('');
    try {
      const savedItem = edit.kind === 'episodios'
        ? { ...edit.item, link: normalizeSpotifyEpisodeLink(edit.item.link) || (edit.item.link || '').trim() }
        : edit.item;
      if (edit.newItem) await api.post('/api/items/' + edit.kind, savedItem);
      else
        await api.put(
          '/api/items/' + edit.kind + '/' + edit.item.id,
          savedItem
        );
      setEdit(null);
      await refresh();
    } catch {
      setFormError(
        'No se pudo guardar. Tu información sigue aquí para reintentarlo.'
      );
    } finally {
      setSaving(false);
    }
  }
  async function toggle(item: Row) {
    if (recording) return;
    try {
      await api.put('/api/items/tareas/' + item.id, {
        status: item.status === 'completado' ? 'pendiente' : 'completado',
      });
      await refresh();
    } catch {
      setError('No pude cambiar esa tarea.');
    }
  }
  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      await api.delete('/api/items/' + deleting.kind + '/' + deleting.item.id);
      setDeleting(null);
      await refresh();
    } catch {
      setError('No pude eliminar este elemento.');
    } finally {
      setSaving(false);
    }
  }
  const buttons = (kind: Kind, item: Row) =>
    recording ? null : (
      <div className="edit-buttons">
        <button
          aria-label={'Editar ' + item.title}
          onClick={() => editRow(kind, item)}
        >
          <Pencil size={15} />
        </button>
        <button
          aria-label={'Eliminar ' + item.title}
          onClick={() => setDeleting({ kind, item })}
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  const head = (label: string, description: string, kind?: Kind) => (
    <div className="subhead">
      <div>
        <span className="eyebrow">EL ESTUDIO · CON CALMA</span>
        <h2>{label}</h2>
        <p>{description}</p>
      </div>
      {kind && !recording && (
        <button className="primary-button" onClick={() => newRow(kind)}>
          <Plus size={17} /> Añadir{' '}
          {kind === 'episodios'
            ? 'episodio'
            : kind === 'productos'
              ? 'producto'
              : kind === 'tareas'
                ? 'tarea'
                : 'idea'}
        </button>
      )}
    </div>
  );
  const empty = (
    <div className="empty">
      <BookOpen size={24} />
      <p>No hay resultados. Puedes crear uno nuevo.</p>
    </div>
  );
  const episodeRows=(
    <div className="episode-list episode-library">
      {groupEpisodes(visible(libraryEpisodes)).filter(g=>g.rows.length && (seriesTab==='all'||seriesTab===g.id)).map(group=>(
        <section className="episode-series-group" key={group.id}>
          <header className="episode-series-heading">
            <span>SERIE {group.number}</span>
            <h3>{group.name}</h3>
            <small>{group.rows.length} {group.rows.length===1?'capítulo':'capítulos'}</small>
          </header>
          {group.rows.map((x,i)=>(
        <article className="episode episode-editorial" key={x.id}>
          <div className="epi-no">{String(x.number||i+1).padStart(2,'0')}</div>
          <div className="epi-info">
            <div className="epi-line"><b>{x.title}</b><StatePill status={x.archived?'archivado':x.status}/></div>
            {x.summary && <p>{x.summary}</p>}
            {x.episode_format && <small>{x.episode_format} · {x.planning_status}</small>}
            <p>{x.series||'Primera serie · Pensé que a esta edad…'}{x.number===19&&<strong className="draft-private-label"> · Borrador personal · Revisión pendiente</strong>}</p>
            <small><CalendarDays size={14}/>{formatDate(x.date)} <span>·</span> {x.audio_ready||x.audio?'Audio creado':'Audio pendiente'} <span>·</span> {x.script?'Guion completo':'Sin guion'}</small>
            <div className="episode-progress" aria-label="Progreso editorial">{(['en producción','hecho','publicado'] as const).map(stage=><span key={stage} className={'progress-step '+(stage===x.status?'current':'')}>{stage}</span>)}</div>
            {x.script&&<details className="episode-script">
              <summary><BookOpen size={17}/> Leer guion completo</summary>
              <div className="episode-script-body">
                <span className="eyebrow">{x.series || 'Serie del podcast'} · GUION DE NARRACIÓN</span><h3>{x.title}</h3>
                <div className="episode-script-text">{x.script}</div>
                <button onClick={()=>editRow('episodios',x)}><Pencil size={15}/> Editar diálogo</button>
              </div>
            </details>}
            {x.script && Number(x.number) >= 20 && <details className="episode-script episode-production">
              <summary><FileAudio size={17}/> Texto listo para ElevenLabs</summary>
              <div className="episode-script-body">
                <p>Solo narración. Copia los bloques en orden y conserva la misma voz y ajustes.</p>
                <CopyText value={x.script} label="Copiar guion completo"/>
                {narrationBlocks(x.script).map((block, index) => <section className="narration-block" key={index}>
                  <h4>Bloque {index + 1}</h4>
                  <textarea readOnly rows={7} value={block} aria-label={'Narración · bloque ' + (index + 1)} />
                  <CopyText value={block} label={'Copiar bloque ' + (index + 1)}/>
                </section>)}
              </div>
            </details>}
            {(x.spotify_description || x.reel_excerpt || x.visual_idea) && <details className="episode-script episode-promotion">
              <summary><Video size={17}/> Spotify, Reel y dirección visual</summary>
              <div className="episode-script-body">
                <span className="eyebrow">MATERIAL PROMOCIONAL</span>
                {([
                  ['Descripción para Spotify', x.spotify_description],
                  ['Fragmento de narración para Reel', x.reel_excerpt],
                  ['Texto sobre el Reel', x.reel_overlay],
                  ['Idea visual de portada y promoción', x.visual_idea],
                  ['Interpretación y cierre', x.performance_notes],
                ] as const).filter(([, value]) => value).map(([label, value]) => <section className="promotion-field" key={label}>
                  <h4>{label}</h4><div className="episode-script-text">{value}</div>
                  <CopyText value={value!} label={'Copiar ' + label.toLowerCase()}/>
                </section>)}
                <button onClick={()=>editRow('episodios',x)}><Pencil size={15}/> Editar material promocional</button>
              </div>
            </details>}
            <div className="episode-actions">
              {x.status==='borrador privado'&&<button disabled={saving} onClick={()=>editRow('episodios',x)}><ShieldCheck size={15}/> Revisar borrador privado</button>}
              {!x.archived&&x.status==='guion listo'&&<button disabled={saving} onClick={()=>void advanceEpisode(x,'en producción')}>Iniciar producción </button>}
              {!x.archived&&x.status==='en producción'&&<button disabled={saving} onClick={()=>void advanceEpisode(x,'hecho')}>Marcar hecho <CheckCircle2 size={15}/></button>}
              {!x.archived&&x.status==='hecho'&&<button disabled={saving} onClick={()=>void advanceEpisode(x,'publicado')}>Publicado en Spotify · Avisar </button>}
              {x.status==='publicado'&&<span className="episode-announcement">{x.announcement_state==='disabled'?'Publicado · sin aviso retroactivo':x.announcement_state==='sent'?'Aviso enviado':x.announcement_state==='pending'?'Aviso en cola':'Publicado'}</span>}
              {validSpotifyEpisode(x.link)&&<a href={x.link} target="_blank" rel="noreferrer">Escuchar en Spotify </a>}
            </div>
          </div>
          {buttons('episodios',x)}
        </article>
      ))}
        </section>
      ))}
      {!groupEpisodes(visible(libraryEpisodes)).some(group=>seriesTab==='all'||seriesTab===group.id)&&empty}
    </div>
  );
  const taskRows = (
    <div className="task-list">
      {visible(generalTasks).map(x => (
        <div
          className={'task ' + (x.status === 'completado' ? 'done' : '')}
          key={x.id}
        >
          <button
            className="task-toggle"
            aria-label={'Completar ' + x.title}
            disabled={recording}
            onClick={() => toggle(x)}
          >
            {x.status === 'completado' ? <Check size={17} /> : <span />}
          </button>
          <div>
            <b>{x.title}</b>
            <small>
              {x.section || 'Contenido'} · {formatDate(x.date)}
            </small>
          </div>
          <StatePill status={x.status} />
          {buttons('tareas', x)}
        </div>
      ))}
      {visible(generalTasks).length === 0 && empty}
    </div>
  );
  const statusPanel = (title: string, desc: string) => (
    <div className="status-panel">
      <div className="status-ring">
        <Globe2 size={29} />
      </div>
      <span>CONEXIÓN PENDIENTE</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
  if (checking)
    return (
      <div className="boot">
        <div className="spinner" />
        <p>Abriendo el estudio…</p>
      </div>
    );
  if (!account || denied || (SUPABASE_ENABLED && authView === 'set'))
    return (
      <div className="login">
        <section className="login-content">
          <img src={LOGO} alt="Todavía estoy a tiempo" />
          <span className="login-overline">
            <Sparkles size={15} /> UN ESPACIO PARA CREAR
          </span>
          <h1>
            Las ideas también <em>necesitan un lugar</em> donde quedarse.
          </h1>
          <p>
            Tu espacio de trabajo, con tus capítulos, ideas y próximos pasos. {SUPABASE_ENABLED ? 'Solo las personas autorizadas pueden entrar.' : 'Tus notas permanecen protegidas en este dispositivo.'}
          </p>
          {denied && (
            <div className="login-warning">
              <LockKeyhole size={17} /> {SUPABASE_ENABLED ? 'Tu acceso todavía no está autorizado.' : 'No pude abrir la bóveda local. Vuelve a intentarlo.'}
            </div>
          )}
          {!!error && <div className="login-warning" role="alert">{error}</div>}
          {SUPABASE_ENABLED && accessPending && (
            <button type="button" className="access-recheck" onClick={() => void recheckAccess()} disabled={checkingAccess}>
              <RotateCcw size={17} />
              {checkingAccess ? 'Comprobando permiso…' : 'Comprobar mi acceso sin otro correo'}
            </button>
          )}
          {SUPABASE_ENABLED ? (
            authView === 'set' ? (
              <form className="vault-form" onSubmit={event=>{ event.preventDefault(); void saveNewPassword(); }}>
                <h2 className="login-mode-title">Crea tu contraseña</h2>
                <p>Es la única vez que necesitas el enlace del correo. Después entrarás normalmente y tu sesión permanecerá abierta durante cinco días.</p>
                <label htmlFor="studio-new-password">Nueva contraseña</label>
                <input id="studio-new-password" type="password" autoComplete="new-password" minLength={10} required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Mínimo 10 caracteres"/>
                <label htmlFor="studio-new-repeat">Repite la contraseña</label>
                <input id="studio-new-repeat" type="password" autoComplete="new-password" minLength={10} required value={repeatPassword} onChange={e=>setRepeatPassword(e.target.value)} placeholder="Repite tu contraseña"/>
                <button type="submit" className="login-cta" disabled={resetting}>{resetting?'Guardando…':'Guardar mi contraseña'} </button>
              </form>
            ) : authView === 'request' ? (
              <form className="vault-form" onSubmit={event=>{ event.preventDefault(); void requestPasswordReset(); }}>
                <h2 className="login-mode-title">Crear o recuperar contraseña</h2>
                <p>Para configurar tu contraseña por primera vez, te enviaremos un único enlace seguro. Luego iniciarás sesión normalmente.</p>
                <label htmlFor="studio-reset-email">Correo de administración</label>
                <input id="studio-reset-email" type="email" autoComplete="email" required value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="tu@correo.com"/>
                <button type="submit" className="login-cta" disabled={resetting}>{resetting?'Solicitando…':'Enviarme enlace para crear contraseña'} </button>
                <button type="button" className="login-text-action" onClick={()=>{setAuthView('login');setError('');}}>Volver a entrar</button>
              </form>
            ) : (
              <form className="vault-form" onSubmit={event=>{ event.preventDefault(); void login(); }}>
                <label htmlFor="studio-passphrase">Tu correo</label>
                <input id="studio-passphrase" type="email" autoComplete="username" required value={passphrase} onChange={e=>setPassphrase(e.target.value)} placeholder="tu@correo.com"/>
                <label htmlFor="studio-account-password">Tu contraseña</label>
                <input id="studio-account-password" type="password" autoComplete="current-password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Tu contraseña"/>
                <button type="submit" disabled={signing} className="login-cta">{signing?'Entrando…':'Abrir mi estudio'} </button>
                <button type="button" className="login-text-action" onClick={()=>{setResetEmail(passphrase);setAuthView('request');setError('');setResetMessage('');}}>Crear contraseña por primera vez / ¿La olvidaste?</button>
              </form>
            )
          ) : (
            <form className="vault-form" onSubmit={event=>{event.preventDefault();void login();}}>
              <label htmlFor="studio-passphrase">{vaultPresent?'Tu frase de acceso':'Crea una frase de acceso (mínimo 10 caracteres)'}</label>
              <input id="studio-passphrase" type="password" required minLength={10} autoComplete={vaultPresent?'current-password':'new-password'} value={passphrase} onChange={event=>setPassphrase(event.target.value)} placeholder="Tu frase secreta"/>
              {!vaultPresent && <>
                <label htmlFor="studio-passphrase-confirm">Repite la frase</label>
                <input id="studio-passphrase-confirm" type="password" required minLength={10} autoComplete="new-password" value={confirmPhrase} onChange={event=>setConfirmPhrase(event.target.value)} placeholder="Confirma tu frase"/>
              </>}
              <button type="submit" disabled={signing} className="login-cta">{signing?'Comprobando…':vaultPresent?'Abrir mi estudio':'Crear mi estudio'} </button>
            </form>
          )}
          {resetMessage && <p className="login-success" role="status">{resetMessage}</p>}
          <p className="login-install-tip">📱 En Safari, toca Compartir y después Añadir a pantalla de inicio para abrir tu estudio como una app.</p>
          <small><ShieldCheck size={15} /> {SUPABASE_ENABLED ? 'Tu acceso se recordará cinco días en este dispositivo. Tu contraseña no se guarda en la página.' : 'Acceso recordado durante 5 días en este navegador. Tu frase no se guarda. En dispositivos compartidos, cierra sesión.'}</small>
        </section>
        <aside className="login-art">
          <div className="login-circle" />
          <div className="login-art-inner">
            <span>UN CAPÍTULO A LA VEZ / 2026</span>
            <img src={COVER} alt="Primera portada del podcast" />
            <p>Tu propio tiempo.</p>
          </div>
        </aside>
      </div>
    );
  return (
    <div className={'studio ' + (recording ? 'recording' : '')}>
      <aside className={'sidebar ' + (mobileNav ? 'open' : '')}>
        <div className="brand">
          <img src={LOGO} alt="Todavía estoy a tiempo" />
          <button className="close-nav" onClick={() => setMobileNav(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="workspace">
          <span className="pulse" /> ESTUDIO PRIVADO <b>01</b>
        </div>
        <nav aria-label="Secciones del estudio">
          {NAV.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={it.id}>
                {'group' in it && (
                  <div className={'group ' + (i === 0 ? 'first' : '')}>
                    {it.group}
                  </div>
                )}
                <button
                  className={'nav-item ' + (page === it.id ? 'active' : '')}
                  onClick={() => change(it.id)}
                >
                  <Icon size={18} />
                  {it.label}
                  {page === it.id && <span className="nav-mark" />}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <span>
            <Heart size={18} />
          </span>
          <div>
            <b>Creado con intención.</b>
            <small>Una conversación a la vez.</small>
          </div>
          <a
            href={SITE}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir el podcast"
          >
            
          </a>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="backdrop-nav"
          onClick={() => setMobileNav(false)}
          aria-label="Cerrar menú"
        />
      )}
      <div className="frame">
        <header className="topbar">
          <button className="menu" onClick={() => setMobileNav(true)}>
            <Menu size={23} />
          </button>
          <span className="top-star" aria-hidden="true"><Mic2 size={18} strokeWidth={1.6} /></span>
          <span className="top-label">
            EL ESTUDIO <i>/</i> {LABELS[page]}
          </span>
          <div className="top-actions">
            {recording && (
              <span className="on-air">
                <span /> EN GRABACIÓN
              </span>
            )}
            <span className="secure">
              <ShieldCheck size={14} /> PRIVADO
            </span>
            <button className="profile" onClick={() => change('ajustes')}>
              D
            </button>
          </div>
        </header>
        <main className="main">
          <div className="page-head">
            <div>
              <span className="eyebrow">
                {page === 'inicio'
                  ? 'BIENVENIDA A TU ESPACIO'
                  : (page === 'clases' || page === 'demos' || page === 'alumnos' || page === 'espera' || page === 'bonos' || page === 'club')
                    ? 'FORMACIÓN / PRODUCCIÓN PRIVADA'
                    : 'PODCAST / DIRECCIÓN EDITORIAL'}
              </span>
              <h1>{LABELS[page]}</h1>
            </div>
            <div className="page-tools">
              <button title="Actualizar" onClick={refresh} disabled={loading}>
                <RotateCcw className={loading ? 'spinning' : ''} size={18} />
              </button>
              <button
                className={'record-button ' + (recording ? 'on' : '')}
                onClick={() => setRecording(!recording)}
              >
                {recording ? <EyeOff size={17} /> : <Video size={17} />}{' '}
                {recording ? 'Salir de grabación' : 'Modo grabación'}
              </button>
            </div>
          </div>
          {error && !denied && (
            <div className="alert">
              <AlertCircle size={17} />
              {error}
              <button onClick={() => setError('')}>
                <X size={15} />
              </button>
            </div>
          )}
          {page === 'inicio' && (
            <>
              <section className="hero">
                <div>
                  <span className="hero-kicker">
                    <AudioLines size={16} strokeWidth={1.6} aria-hidden="true" /> UNA CONVERSACIÓN A LA VEZ
                  </span>
                  <h2>
                    Todo lo que estás creando, <em>en un mismo lugar.</em>
                  </h2>
                  <p>
                    Un estudio para ordenar las ideas, cuidar cada estreno y
                    mirar cómo crece este proyecto.
                  </p>
                  <div className="hero-actions">
                    <button onClick={() => change('episodios')}>
                      Organizar capítulos 
                    </button>
                    <a href={SITE} target="_blank" rel="noreferrer">
                      Ver el podcast 
                    </a>
                  </div>
                </div>
                <div className="hero-cover">
                  <img src={COVER} alt="Portada del primer episodio" />
                  <span>ESTUDIO · TEMPORADA 01</span>
                </div>
              </section>
              <div className="stats">
                <div className="stat">
                  <Mic2 size={20} />
                  <span>Episodios publicados</span>
                  <strong>
                    {published}
                    <small> / {plan.active.length}</small>
                  </strong>
                  <p>{plan.planned.length} capítulos en el plan activo</p>
                </div>
                <div className="stat">
                  <CalendarDays size={20} />
                  <span>Próximo capítulo</span>
                  <strong>{next ? formatDate(next.date) : '—'}</strong>
                  <p>{next?.title || 'Sin pendientes'}</p>
                </div>
                <div className="stat">
                  <ListChecks size={20} />
                  <span>Por hacer</span>
                  <strong>{pending}</strong>
                  <p>
                    {tasks.filter(x => x.status === 'completado').length}{' '}
                    completadas
                  </p>
                </div>
                <div className="stat">
                  <ShoppingBag size={20} />
                  <span>En la colección</span>
                  <strong>{products.length}</strong>
                  <p>Recursos digitales</p>
                </div>
              </div>
              <div className="dashboard-panels">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">EN EL HORIZONTE</span>
                      <h3>El próximo estreno</h3>
                    </div>
                    <button onClick={() => change('calendario')}>
                      Ver calendario 
                    </button>
                  </div>
                  <div className="next">
                    <div className="date-square">
                      <span>
                        {next ? formatDate(next.date).split(' ')[1] : '—'}
                      </span>
                      <strong>
                        {next ? formatDate(next.date).split(' ')[0] : '—'}
                      </strong>
                    </div>
                    <div>
                      <small>PRÓXIMO CAPÍTULO PLANIFICADO</small>
                      <b>{next?.title || 'Primera serie completada'}</b>
                      <StatePill status={next?.status} />
                    </div>
                  </div>
                  <div className="shortcut">
                    <button onClick={() => change('episodios')}>
                      <Mic2 size={17} /> Mis capítulos
                    </button>
                    <button onClick={() => change('tareas')}>
                      <ListChecks size={17} /> Mis tareas
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">TEMPORADA 01</span>
                      <h3>Así vamos avanzando</h3>
                    </div>
                  </div>
                  <div className="progress">
                    <div className="radial">
                      <svg viewBox="0 0 112 112">
                        <circle
                          cx="56"
                          cy="56"
                          r="46"
                          fill="none"
                          stroke="#e2e9ee"
                          strokeWidth="8"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="46"
                          fill="none"
                          stroke="#759ab2"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="289"
                          strokeDashoffset={
                            289 * (1 - published / Math.max(plan.active.length, 1))
                          }
                          transform="rotate(-90 56 56)"
                        />
                      </svg>
                      <strong>
                        {published}
                        <small> de {plan.active.length}</small>
                      </strong>
                    </div>
                    <div>
                      <b>Cada capítulo cuenta.</b>
                      <p>Una primera serie que crece a su ritmo.</p>
                      <button onClick={() => change('episodios')}>
                        Ver progreso 
                      </button>
                    </div>
                  </div>
                </section>
              </div>
              <section className="wide-panel">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">ORGANIZACIÓN DIARIA</span>
                    <h3>Lo siguiente en tu lista</h3>
                  </div>
                  <button onClick={() => change('tareas')}>
                    Abrir tareas 
                  </button>
                </div>
                {taskRows}
              </section>
            </>
          )}
          {page === 'episodios' && (
            <>
              {head(
                'Biblioteca de guiones',
                `${plan.label} · ${plan.month.length} capítulos en el plan del mes. Los episodios publicados y el trabajo anterior se conservan en sus pestañas.`,
                'episodios'
              )}
              <div className="series-tabs" aria-label="Filtrar episodios">
                {([['active', `Todos · ${plan.active.length}`], ['month', `Plan del mes · ${plan.month.length}`], ['published', `Publicados · ${plan.published.length}`]] as const).map(([scope, label]) => (
                  <button type="button" key={scope} className={episodeScope===scope?'active':''} onClick={()=>{setEpisodeScope(scope);setSeriesTab('all');setSearch('');}} aria-pressed={episodeScope===scope}>{label}</button>
                ))}
              </div>
              <div className="series-tabs" aria-label="Filtrar series">
                {[{id:'all',label:`Todas · ${libraryEpisodes.length}`},...allSeries.map(group=>({id:group.id,label:`Serie ${group.number} · ${group.rows.length}`}))].map(t=>(
                  <button type="button" key={t.id} className={seriesTab===t.id?'active':''} onClick={()=>setSeriesTab(t.id)} aria-pressed={seriesTab===t.id}>{t.label}</button>
                ))}
              </div>
              <div className="search">
                <SearchCheck size={17} />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar capítulos o diálogos…" />
              </div>
              {episodeRows}
            </>
          )}
          {page === 'reels' && (
            <ReelsProduction entries={items.ideas} onSave={async (entry,patch)=>{
              await api.put('/api/items/ideas/'+entry.id,{...entry,...patch});
              await refresh();
            }} onCreate={async (record)=>{
              await api.post('/api/items/ideas',record);
              await refresh();
            }} />
          )}
          {page === 'calendario' && (
            <>
              {head(
                `Plan de ${plan.label}`,
                'Un capítulo cada martes: dos temas por investigar, una habilidad y preguntas de la audiencia. Las fichas son planificación; todavía no hay guiones ni audios nuevos.',
                'episodios'
              )}
              <div className="calendar">
                {plan.month.map((x, i) => (
                  <button
                    disabled={recording}
                    onClick={() => editRow('episodios', x)}
                    key={x.id}
                    className={
                      'calendar-item ' +
                      (x.status === 'publicado' ? 'done' : '')
                    }
                  >
                    <span>EP {String(x.number || i + 1).padStart(2, '0')}</span>
                    <b>{formatDate(x.date)}</b>
                    <strong>{x.title}</strong>
                    {x.episode_format && <small>{x.episode_format} · {x.planning_status}</small>}
                    <StatePill status={x.status} />
                    <small>
                      Editar capítulo 
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}
          {page === 'tareas' && (
            <>
              {head(
                'Pendientes con intención',
                'Para organizar lo que importa sin dejarlo perdido en mensajes.',
                'tareas'
              )}
              <div className="search">
                <ListChecks size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar tareas…"
                />
              </div>
              {taskRows}
              <p className="hint"><BookOpen size={16}/> Las tareas semanales de la clase se gestionan en <button type="button" onClick={()=>change('clases')} className="class-plan-inline-link">Clases · grabación</button>, sin duplicarlas aquí.</p>
            </>
          )}
          {page === 'productos' && (
            <>
              {head(
                'Cuadernos y recursos',
                'Todos los productos digitales del podcast, en un mismo lugar.',
                'productos'
              )}
              <div className="products">
                {products.map((x, i) => (
                  <article className="product" key={x.id}>
                    <div className="product-art">
                      <img
                        src={
                          SITE +
                          'assets/productos/editorial/' +
                          ['guia.webp', 'diario.webp', 'workbook.webp'][i % 3]
                        }
                        alt={'Portada ' + x.title}
                      />
                    </div>
                    <div className="product-info">
                      <StatePill status={x.status} />
                      <h3>{x.title}</h3>
                      <p>{x.subtitle}</p>
                      <div>
                        <strong>{currency(x.price)}</strong>
                        {x.link && (
                          <a
                            href={x.link}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={'Abrir ' + x.title}
                          >
                            
                          </a>
                        )}
                        {buttons('productos', x)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hint">
                <AlertCircle size={17} /> Editar productos aquí organiza el
                estudio, pero no modifica las páginas de compra hasta
                conectarlas.
              </div>
            </>
          )}
          {page === 'alumnos' && (
            <section className="studio-students-workspace">
              <nav className="studio-student-tabs" aria-label="Centro de alumnos: administración y vista del aula">
                <span className="studio-student-tab-current"><Users size={17}/> Alumnos y bonos</span>
                <a className="studio-student-tab-link" href="../alumnos/?vista=admin" aria-label="Ver aula completa como administradora, sin alterar el progreso">
                  <BookOpen size={17}/> Ver aula completa <ExternalLink size={15}/>
                </a>
              </nav>
              <StudentManager />
              <p className="studio-student-qa-note">La vista del aula se abre en pantalla completa, sin barras duplicadas ni ventanas dentro de ventanas. Regresas aquí desde «Volver a Mi Estudio».</p>
            </section>
          )}
          {page === 'espera' && <WaitlistManager />}
          {page === 'club' && (
            <section className="studio-student-center">
              <div className="studio-student-center-intro">
                <div>
                  <span className="eyebrow">TU COMUNIDAD PRIVADA · ADMINISTRACIÓN</span>
                  <h2>Un lugar para compartir lo que crean.</h2>
                  <p>Publicaciones, proyectos con capturas, preguntas, comentarios y me gusta. Desde aquí puedes publicar como anfitriona, revisar reportes y ocultar contenido inapropiado, con tu sesión actual de administradora.</p>
                </div>
                <a href="../alumnos/comunidad.html" target="_blank" rel="noopener noreferrer">Abrir comunidad completa <ExternalLink size={16}/></a>
              </div>
              <iframe title="Club de Ideas · gestión privada de la comunidad" src="../alumnos/comunidad.html" loading="lazy" referrerPolicy="same-origin"/>
            </section>
          )}
          {page === 'bonos' && <BonusLibrary />}
          {page === 'links' && <LinkCenter entries={items.ideas} onChanged={refresh} readOnly={recording} />}
          {page === 'demos' && <FinishedDemos onOpenClass={()=>change('clases')} />}
          {page === 'clases' && (
            <ClassProduction entries={items.ideas} tasks={items.tareas} launchStats={classStats} onTaskToggle={async (task,next) => {
              await api.put('/api/items/tareas/'+task.id, { ...task, status:next });
              await refresh();
            }} onSave={async (entry, changes) => {
              await api.put('/api/items/ideas/' + entry.id, { ...entry, ...changes });
              await refresh();
            }} />
          )}
          {page === 'ideas' && (
            <>
              {head(
                'Ideas que merecen espacio',
                'No todas necesitan convertirse en un capítulo hoy.',
                'ideas'
              )}
              <div className="ideas">
                {editorialIdeas.map(x => (
                  <article className="idea" key={x.id}>
                    <div className="idea-top">
                      <Lightbulb size={19} />
                      {buttons('ideas', x)}
                    </div>
                    <StatePill status={x.status} />
                    <h3>{x.title}</h3>
                    {(x.notes||'').length > 600 ? <>
                      <p>{x.notes!.slice(0,220)}…</p>
                      <details className="episode-script research-dossier"><summary><BookOpen size={17}/> Leer investigación y notas</summary>
                        <div className="episode-script-body"><NoteText text={x.notes!}/><CopyText value={x.notes!} label="Copiar documento"/></div>
                      </details>
                    </> : <p>{x.notes || 'Escribe una nota para desarrollar esta idea.'}</p>}
                    <small>{x.section || 'Idea libre'}</small>
                  </article>
                ))}
                {!editorialIdeas.length && empty}
              </div>
            </>
          )}
          {page === 'ventas' && (
            <>
              {head('Centro de ventas y productos','Todos los checkouts existentes, sus entregas y sus estados. Stripe se conecta por Make; aquí no se crean cobros nuevos.')}
              <div className="commerce-hero">
                <div><span className="eyebrow">REGISTRO PRIVADO · STRIPE A TRAVÉS DE MAKE</span>
                  <h2>{verifiedSales===null?'Sin cifras verificadas':verifiedSales.length+' movimientos PDF registrados'}</h2>
                  <p>Los importes vienen de los pagos PDF que Make registró en Supabase; no son el saldo completo de Stripe. El Lab, la clase y los servicios llevan controles de acceso o cobro separados.</p>
                  <div className="commerce-quick-actions">
                    <button type="button" onClick={()=>setSalesRefreshKey(n=>n+1)} disabled={salesRefreshing||!SUPABASE_ENABLED}>
                      <RotateCcw size={16} className={salesRefreshing?'spinning':''}/> {salesRefreshing?'Comprobando…':'Actualizar ventas'}
                    </button>
                    <a href="../centro/" target="_blank" rel="noopener noreferrer"><ShoppingBag size={16}/> Ver Centro de productos ↗</a>
                  </div>
                  {salesCheckedAt&&<small className="commerce-check-time">Última consulta: {salesCheckedAt.toLocaleString('es-US',{dateStyle:'medium',timeStyle:'short'})}</small>}
                </div>
                <div className="commerce-hero-mark" aria-hidden="true"><ReceiptText size={49}/></div>
              </div>
              {salesError && <p className="commerce-error" role="status">{salesError}</p>}
              <div className="commerce-summary" aria-label="Resumen de compras registradas">
                <div><span>Pagos PDF confirmados</span><strong>{verifiedSales===null?'—':paidPdfSales.length}</strong><small>En el registro de Make/Supabase</small></div>
                <div><span>Importe PDF registrado · USD</span><strong>{verifiedSales===null||paidUsdSales.length===0?'—':formatSaleAmount({amount_cents:pdfRevenueUsdCents,currency:'usd'} as VerifiedSale)}</strong><small>No es la facturación total de Stripe</small></div>
                <div><span>Accesos de clase</span><strong>{verifiedOwnership===null?'—':activeClassCount}</strong><small>Independientes de las ventas PDF</small></div>
                <div><span>Accesos de Content Lab</span><strong>{verifiedOwnership===null?'—':activeLabCount}</strong><small>Las ventas siguen pausadas por QA</small></div>
              </div>
              <section className="commerce-catalog" aria-labelledby="commerce-catalog-title">
                <div className="commerce-section-heading"><span className="eyebrow">CATÁLOGO COMERCIAL</span><h2 id="commerce-catalog-title">Productos y checkouts</h2>
                  <p>Solo los enlaces de pago ya disponibles y comprobados aparecen como compra abierta. Los productos en preparación no cobran todavía.</p></div>
                <div className="commerce-cards">
                  <article className="commerce-product"><img src="../assets/clase-mostrar-web-2026.webp" alt="Imagen de la clase de creación web" loading="lazy"/><div className="commerce-product-copy"><span className="commerce-tag is-closed">PRELANZAMIENTO · ACCESO CERRADO</span><h3>Tu primera web con IA</h3><p>Clase práctica y centro de alumnos. Compra y automatización todavía sin activar.</p><a href="../clases/primera-landing.html" target="_blank" rel="noopener noreferrer">Ver lista de espera ↗</a></div></article>
                  <article className="commerce-product"><div className="commerce-lab-art" aria-hidden="true">content <em>lab.</em></div><div className="commerce-product-copy"><span className="commerce-tag is-closed">CHECKOUT $10 · PAUSADO POR QA</span><h3>Content Lab</h3><p>Producto y enlace de Stripe creados mediante Make; la automatización de acceso sigue inactiva.</p><a href="../content-lab/" target="_blank" rel="noopener noreferrer">Abrir mi Lab privado ↗</a></div></article>
                  <article className="commerce-product"><img src="../assets/productos/editorial/diario-carta-20261027.webp" alt="Portada del diario No voy tarde" loading="lazy"/><div className="commerce-product-copy"><span className="commerce-tag is-live">CHECKOUT VIGENTE · $1.99</span><h3>No voy tarde</h3><p>Diario digital. Compra desde su página pública y entrega automatizada desde Make, pendiente de QA integral.</p><a href="../productos/no-voy-tarde.html" target="_blank" rel="noopener noreferrer">Ver página y checkout ↗</a></div></article>
                  <article className="commerce-product"><img src="../assets/productos/editorial/workbook-puerta-20261027.webp" alt="Portada del cuaderno Empezar de nuevo" loading="lazy"/><div className="commerce-product-copy"><span className="commerce-tag is-live">CHECKOUT VIGENTE · $3.99</span><h3>Empezar de nuevo</h3><p>Cuaderno digital. Compra desde su página pública y entrega verificada mediante Make.</p><a href="../productos/empezar-de-nuevo.html" target="_blank" rel="noopener noreferrer">Ver página y checkout ↗</a></div></article>
                </div>
              </section>
              <section className="commerce-operations" aria-labelledby="commerce-oper-title">
                <h2 id="commerce-oper-title">Últimos pagos PDF registrados</h2>
                {verifiedSales===null?<p>No se muestra ningún importe porque todavía no se pudo consultar la fuente.</p>
                :verifiedSales.length===0?<p>Por ahora no hay compras registradas en Supabase. Esto no demuestra que no existan movimientos en Stripe; comprueba la sincronización en Make.</p>
                :<div className="commerce-sales-list">{verifiedSales.slice(0,60).map(s=>(
                  <div className="commerce-sale" key={s.id}>
                    <div><strong>{s.product_code||'Producto sin identificar'}</strong><small>{s.purchased_at?new Date(s.purchased_at).toLocaleDateString('es-US'): 'Fecha pendiente'}</small></div>
                    <span>{s.status||'Estado no disponible'}</span>
                    <b>{formatSaleAmount(s)}</b>
                  </div>
                ))}</div>}
                {verifiedSales && verifiedSales.length>60 && <p className="commerce-privacy-note">Se muestran los últimos 60 pagos; las cifras del resumen utilizan todos los registros consultados.</p>}
                <p className="commerce-privacy-note">No se muestran correos ni datos personales de compradores en esta vista. Para conciliar la facturación completa, usa los reportes originales de Stripe y Make.</p>
              </section>
            </>
          )}
          {page === 'audiencia' && (
            <>
              {head(
                'Personas que nos acompañan',
                'Solo las que han elegido recibir avisos del podcast.'
              )}
              {statusPanel(
                'Suscriptores pendientes de sincronización',
                data?.sources.subscribers ||
                  'La lista existe en Make; falta mostrar su conteo aquí.'
              )}
              <div className="mini-two">
                <div>
                  <Heart size={21} />
                  <h3>Sin suscripciones forzadas</h3>
                  <p>
                    La guía es gratuita y los avisos de episodios siempre se
                    aceptan por separado.
                  </p>
                </div>
                <div>
                  <Mail size={21} />
                  <h3>La baja está disponible</h3>
                  <a href={SITE + 'baja.html'} target="_blank" rel="noreferrer">
                    Abrir página de baja <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </>
          )}
          {page === 'soporte' && <SupportInbox />}
          {page === 'flujos' && (
            <>
              {head(
                'Lo que sucede detrás de escena',
                'Estado registrado en la última revisión: ' +
                  (data?.sources.lastVerified || '22 oct 2026') +
                  '. No son datos en vivo.'
              )}
              <div className="flows">
                {[
                  [
                    'Entrega de guía gratuita',
                    'El correo se envía al solicitar las cinco preguntas.',
                    true,
                  ],
                  [
                    'Confirmación de ayuda',
                    'Una respuesta cálida confirma recepción del formulario.',
                    true,
                  ],
                  [
                    'Alta y baja de episodios',
                    'Consentimiento opcional y retiro registrados por Make.',
                    true,
                  ],
                  [
                    'Ventas y entregas',
                    'Eventos de compras pendientes de sincronizar con el panel.',
                    false,
                  ],
                  [
                    'SEO y búsquedas',
                    'Falta conexión a Search Console.',
                    false,
                  ],
                  [
                    'Bandeja de mensajes',
                    'Consultas del landing disponibles en Mensajes.',
                    true,
                  ],
                ].map(([title, desc, ok], i) => {
                  const Icon = [
                    Mail,
                    Heart,
                    CheckCircle2,
                    CreditCard,
                    Globe2,
                    Mail,
                  ][i];
                  return (
                    <div className="flow" key={String(title)}>
                      <div className="flow-icon">
                        <Icon size={20} />
                      </div>
                      <div>
                        <b>{title}</b>
                        <p>{desc}</p>
                      </div>
                      <Pill kind={ok ? 'green' : 'muted'}>
                        {ok ? 'Configurada' : 'Pendiente'}
                      </Pill>
                    </div>
                  );
                })}
              </div>
              <div className="hint">
                <AlertCircle size={17} /> Los flujos funcionan en Make. Este
                estado es la última revisión, no un monitoreo en vivo.
              </div>
            </>
          )}

          {page === 'cancion' && (
            <>
              {head('La canción también tiene su historia', 'Las estadísticas corresponden exclusivamente al reproductor de la landing, no a Spotify ni a otras plataformas.')}
              <div className="audio-stats-head">
                <div><span className="eyebrow">NUESTRA CANCIÓN</span><h3>¿Cómo la están escuchando?</h3></div>
                <button type="button" onClick={() => void refreshAudioStats()} disabled={audioStatsLoading}>
                  <RotateCcw size={16} className={audioStatsLoading?'spinning':''} />
                  {audioStatsLoading?'Actualizando…':'Actualizar cifras'}
                </button>
              </div>
              {audioStatsError && <p className="audio-stats-error" role="alert">{audioStatsError}</p>}
              <div className="audio-stats-grid">
                {([
                  ['Inicios de reproducción',audioStats?.plays,'Cada vez que se presiona Play para iniciar una escucha'],
                  ['Sesiones diferentes',audioStats?.sessions,'Sesiones anónimas de navegador, no personas identificadas'],
                  ['Llegaron al 75 %',audioStats?.three_quarters,'Escucharon aproximadamente tres cuartas partes'],
                  ['Casi hasta el final',audioStats?.completed,'Alcanzaron al menos el 95 % de la duración']
                ] as const).map(([label,value,note])=>(
                  <div className="audio-stats-tile" key={label}>
                    <span>{label}</span><strong>{audioStats ? Number(value||0).toLocaleString('es-US') : '—'}</strong><small>{note}</small>
                  </div>
                ))}
              </div>
              <section className="wide-panel audio-stats-trends">
                <div className="panel-head"><div><span className="eyebrow">ÚLTIMOS 30 DÍAS</span><h3>Escuchas por día</h3></div></div>
                {audioStats?.days?.length ? (
                  <div className="audio-daily-chart" aria-label="Inicios de reproducción por fecha">
                    {audioStats.days.map(day => (
                      <div className="audio-daily-row" key={day.day}>
                        <span>{new Date(day.day+'T12:00:00').toLocaleDateString('es-US',{month:'short',day:'numeric'})}</span>
                        <div className="audio-daily-bar-track"><div style={{width:(Math.max(2,100*day.plays/Math.max(...audioStats.days.map(d=>d.plays),1)))+'%'}} /></div>
                        <strong>{day.plays}</strong>
                      </div>
                    ))}
                  </div>
                ) : <p className="audio-stats-empty">{audioStatsLoading?'Cargando escuchas…':'Todavía no hay escuchas registradas desde la landing.'}</p>}
                {audioStats?.last_play_at && <p className="audio-stats-foot">Último inicio registrado: {new Date(audioStats.last_play_at).toLocaleString('es-US',{dateStyle:'medium',timeStyle:'short'})}</p>}
              </section>
              <div className="hint"><ShieldCheck size={17}/> Las cifras se actualizan automáticamente cada minuto mientras esta página está abierta. No guardamos nombres ni correos. Son cifras aproximadas; Spotify mantiene estadísticas aparte.</div>
            </>
          )}
          {page === 'seo' && (
            <>
              {head(
                'Encontrarnos sin ruido',
                'Estructura pública del sitio, presencia orgánica y próximos pasos.'
              )}
              <div className="seo-cards">
                <div>
                  <CheckCircle2 size={22} />
                  <b>Publicado</b>
                  <span>Sitemap XML</span>
                </div>
                <div>
                  <CheckCircle2 size={22} />
                  <b>Configurado</b>
                  <span>Metadatos y URLs canónicas</span>
                </div>
                <div>
                  <Clock3 size={22} />
                  <b>Por verificar</b>
                  <span>Indexación y métricas orgánicas</span>
                </div>
              </div>
              <div className="wide-panel">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">LO QUE YA ESTÁ PÚBLICO</span>
                    <h3>Enlaces importantes</h3>
                  </div>
                </div>
                {[
                  ['Landing público', SITE, 'Portada editorial del podcast'],
                  ['Sitemap', SITE + 'sitemap.xml', 'Mapa del sitio web'],
                  [
                    'No voy tarde',
                    SITE + 'productos/no-voy-tarde.html',
                    'Página del diario digital',
                  ],
                  [
                    'Empezar de nuevo',
                    SITE + 'productos/empezar-de-nuevo.html',
                    'Página del cuaderno',
                  ],
                ].map(x => (
                  <a
                    className="seo-link"
                    key={x[0]}
                    href={x[1]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div>
                      <b>{x[0]}</b>
                      <small>{x[2]}</small>
                    </div>
                    
                  </a>
                ))}
              </div>
              <div className="hint">
                <Globe2 size={17} /> Sitemap publicado no significa indexación
                confirmada. Google Search Console aún no está conectado.
              </div>
            </>
          )}
          {page === 'ajustes' && (
            <>
              {head(
                'Un espacio solo tuyo',
                'Accesos, privacidad y modo presentación.'
              )}
              <div className="account-card">
                <div>D</div>
                <section>
                  <span>ARCHIVO DEL ESTUDIO</span>
                  <h3>Protección local</h3>
                  <p>{recording ? 'Detalles ocultos mientras grabas' : SUPABASE_ENABLED ? 'Conexión Supabase protegida' : 'Bóveda cifrada · acceso recordado durante 5 días en este navegador'}</p>
                </section>
                <ShieldCheck size={23} />
              </div>
              <div className="setting">
                <div>
                  <b>Modo grabación</b>
                  <p>
                    Oculta información privada y desactiva los controles de
                    edición al mostrar la pantalla.
                  </p>
                </div>
                <button
                  className={'toggle ' + (recording ? 'on' : '')}
                  role="switch"
                  aria-checked={recording}
                  onClick={() => setRecording(!recording)}
                >
                  <i />
                </button>
              </div>
              <div className="setting">
                <div>
                  <b>Frase de acceso</b>
                  <p>
                    {SUPABASE_ENABLED ? 'Inicias sesión desde tu correo autorizado. Tus datos viven en Supabase con reglas de seguridad privadas.' : 'Las notas y los capítulos se cifran con tu frase antes de guardarse en este dispositivo. No hay sincronización entre móviles o computadoras.'}
                  </p>
                </div>
                <StatePill status="disponible" />
              </div>
              {!SUPABASE_ENABLED && <div className="setting vault-backups">
                <div>
                  <b>Respaldo de tu estudio</b>
                  <p>Guarda una copia cifrada para recuperar tu trabajo en otro dispositivo. Necesitarás la misma frase de acceso.</p>
                </div>
                <div className="vault-backup-actions">
                  <button type="button" onClick={() => { try { downloadEncryptedBackup(); } catch { setError('No se pudo descargar el respaldo.'); } }}>Guardar copia</button>
                  <label className="vault-import">Restaurar copia
                    <input type="file" accept=".json,application/json" onChange={async event => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      try {
                        const source = await file.text();
                        if (!window.confirm('¿Reemplazar los datos de este dispositivo por los del respaldo cifrado? Esta acción no se puede deshacer.')) return;
                        await importEncryptedBackup(source);
                        await logout();
                        setVaultPresent(true);
                      } catch { setError('No se pudo restaurar ese archivo. Verifica que sea un respaldo cifrado del estudio.'); }
                      finally { event.currentTarget.value = ''; }
                    }} />
                  </label>
                </div>
              </div>}
              {SUPABASE_ENABLED && hasLocalVault() && !recording && <div className="setting vault-backups">
                <div>
                  <b>Recuperar mis capítulos y tareas anteriores</b>
                  <p>Antes de importar, guarda un respaldo cifrado en este dispositivo. Luego importa tus capítulos, tareas, productos e ideas; se verifican contra Supabase sin borrar la copia original. Necesitas la frase de acceso anterior.</p>
                  <label className="migration-label" htmlFor="import-vault-passphrase">Frase de acceso anterior</label>
                  <input id="import-vault-passphrase" className="migration-input" type="password" autoComplete="off"
                    value={importSecret} onChange={event=>setImportSecret(event.target.value)} placeholder="Tu frase de la bóveda local" />
                  {importMessage && <p role="status" className="migration-status">{importMessage}</p>}
                </div>
                <div className="vault-backup-actions">
                  <button type="button" onClick={() => {
                    try { downloadEncryptedBackup(); }
                    catch { setImportMessage('No pude guardar la copia cifrada. Revisa los permisos de descarga de tu navegador.'); }
                  }}>Guardar respaldo cifrado primero</button>
                  <button type="button" disabled={importing || importSecret.length<10} onClick={async()=>{
                    if(!window.confirm('¿Importar al estudio de Supabase los episodios, tareas, productos e ideas guardados en este dispositivo? Los archivos locales no se eliminarán.'))return;
                    setImporting(true);setImportMessage('');
                    try{
                      const result=await importLocalRecords(importSecret);
                      setImportMessage('Importación verificada: '+result.imported+' nuevos registros y '+result.existing+' que ya estaban guardados.');
                      await refresh();
                    }catch(e){
                      setImportMessage(e instanceof Error?e.message:'No pude importar tus datos. Puedes volver a intentarlo.');
                    }finally{setImportSecret('');setImporting(false);}
                  }}>{importing?'Importando…':'Importar al estudio'}</button>
                </div>
              </div>}
              <div className="app-install-settings">
                <strong>📱 Mi estudio, como app en el teléfono</strong>
                <p>En iPhone: abre /estudio/ en Safari, toca Compartir → Añadir a pantalla de inicio y marca «Abrir como app web». En Android: usa el menú del navegador y busca «Instalar app» o «Añadir a pantalla principal».</p>
              </div>
              <button className="logout" onClick={logout}>
                <LogOut size={17} /> Cerrar sesión
              </button>
            </>
          )}
          <footer className="footer">
            <span>TODAVÍA ESTOY A TIEMPO · ESTUDIO 01</span>
            <span>HECHO CON CALMA / 2026</span>
          </footer>
        </main>
      </div>
      {edit && !recording && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !saving) setEdit(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">TU ESPACIO DE TRABAJO</span>
                <h2 id="edit-title">
                  {edit.newItem ? 'Añadir' : 'Editar'} {edit.kind}
                </h2>
              </div>
              <button aria-label="Cerrar" onClick={() => setEdit(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="fields">
              <label>
                Título
                <input
                  autoFocus
                  maxLength={180}
                  value={edit.item.title || ''}
                  onChange={e =>
                    setEdit({
                      ...edit,
                      item: { ...edit.item, title: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                Estado
                <select
                  value={edit.item.status || STATES[edit.kind][0]}
                  onChange={e =>
                    setEdit({
                      ...edit,
                      item: { ...edit.item, status: e.target.value },
                    })
                  }
                >
                  {STATES[edit.kind].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              {(edit.kind === 'episodios' || edit.kind === 'tareas') && (
                <label>
                  Fecha
                  <input
                    type="date"
                    value={edit.item.date || ''}
                    onChange={e =>
                      setEdit({
                        ...edit,
                        item: { ...edit.item, date: e.target.value },
                      })
                    }
                  />
                </label>
              )}
              {edit.kind === 'productos' && (
                <>
                  <label>
                    Subtítulo
                    <input
                      value={edit.item.subtitle || ''}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, subtitle: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Precio USD
                    <input
                      type="number"
                      min="0"
                      step=".01"
                      value={edit.item.price ?? 0}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, price: Number(e.target.value) },
                        })
                      }
                    />
                  </label>
                </>
              )}
              {edit.kind === 'episodios' && (
                <>
                  <label className="full-script-label">Diálogo / guion completo
                    <textarea rows={18} maxLength={20000} value={edit.item.script||''} onChange={e=>setEdit({...edit,item:{...edit.item,script:e.target.value,script_reviewed:edit.item.number===19?false:edit.item.script_reviewed,status:edit.item.number===19?'borrador privado':edit.item.status}})} placeholder="Escribe, corrige y desarrolla aquí el diálogo del episodio…"/>
                    <small>Edítalo aquí como un documento. Guarda los cambios en Supabase. No se altera el audio publicado ni se envían correos por editar.</small>
                  </label>
                  <label>Número de episodio
                    <input type="number" min={1} max={999} value={edit.item.number ?? ''} onChange={e=>setEdit({...edit,item:{...edit.item,number:e.target.value?Number(e.target.value):undefined}})}/>
                  </label>
                  <label>Serie
                    <input value={edit.item.series||''} onChange={e=>setEdit({...edit,item:{...edit.item,series:e.target.value}})} placeholder="Nombre de la serie"/>
                  </label>
                  {([
                    ['spotify_description','Descripción para Spotify',5],
                    ['reel_excerpt','Fragmento de narración para Reel',4],
                    ['reel_overlay','Texto sobre el Reel',2],
                    ['visual_idea','Idea visual de portada y promoción',5],
                    ['performance_notes','Interpretación y cierre',3],
                  ] as const).map(([field,label,rows])=><label className="full-script-label" key={field}>{label}
                    <textarea rows={rows} maxLength={12000} value={edit.item[field]||''} onChange={e=>setEdit({...edit,item:{...edit.item,[field]:e.target.value}})}/>
                  </label>)}
                  {edit.item.number===19&&<label className="episode-draft-approval">
                    <input type="checkbox" checked={Boolean(edit.item.script_reviewed)} onChange={e=>setEdit({...edit,item:{...edit.item,script_reviewed:e.target.checked,status:e.target.checked?'guion listo':'borrador privado'}})} />
                    <span><strong>Aprobé personalmente este guion.</strong> Solo después de marcar esta casilla podrá pasar a producción. Hasta entonces seguirá privado, sin publicarse ni avisar a oyentes.</span>
                  </label>}
                  <p className="modal-helper">Después de «Hecho», marca «Publicado» solamente con el enlace directo del capítulo de Spotify. Esa acción avisará a los oyentes.</p>
                  <label>
                    Resumen
                    <input
                      value={edit.item.summary || ''}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, summary: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Enlace de audio
                    <input
                      value={edit.item.audio || ''}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, audio: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Enlace de portada
                    <input
                      value={edit.item.art || ''}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, art: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Foto pública del capítulo para el correo
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://.../portada-episodio.png"
                      value={edit.item.email_art_url || ''}
                      onChange={e =>
                        setEdit({
                          ...edit,
                          item: { ...edit.item, email_art_url: e.target.value },
                        })
                      }
                    />
                    <small>Enlace público directo a la imagen (PNG, JPG o WebP). El enlace privado de Biblioteca no se mostrará en los correos. Guárdalo antes de publicar el episodio.</small>
                  </label>
                </>
              )}
              {(edit.kind === 'productos' || edit.kind === 'episodios') && (
                <label>
                  {edit.kind === 'episodios' ? 'Enlace del episodio en Spotify' : 'Enlace principal'}
                  <input
                    aria-describedby={edit.kind === 'episodios' ? 'spotify-link-help' : undefined}
                    value={edit.item.link || ''}
                    onChange={e =>
                      setEdit({
                        ...edit,
                        item: { ...edit.item, link: e.target.value },
                      })
                    }
                  />
                  {edit.kind === 'episodios' && <small id="spotify-link-help">Acepta el enlace del capítulo de Spotify o el compartido desde Spotify for Creators. Usa un capítulo, no la página general del podcast.</small>}
                </label>
              )}
              {(edit.kind === 'tareas' || edit.kind === 'ideas') && (
                <label>
                  Área
                  <input
                    value={edit.item.section || ''}
                    onChange={e =>
                      setEdit({
                        ...edit,
                        item: { ...edit.item, section: e.target.value },
                      })
                    }
                  />
                </label>
              )}
              <label>
                Notas
                <textarea
                  rows={4}
                  value={edit.item.notes || ''}
                  onChange={e =>
                    setEdit({
                      ...edit,
                      item: { ...edit.item, notes: e.target.value },
                    })
                  }
                />
              </label>
            </div>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <div className="modal-foot">
              <button onClick={() => setEdit(null)}>Cancelar</button>
              <button disabled={saving} onClick={save}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
                
              </button>
            </div>
          </div>
        </div>
      )}
      {deleting && !recording && (
        <div className="modal-backdrop">
          <div className="delete" role="alertdialog" aria-modal="true">
            <Trash2 size={25} />
            <h3>¿Eliminar este elemento?</h3>
            <p>{deleting.item.title}</p>
            <small>Esta acción no se puede deshacer.</small>
            <div>
              <button disabled={saving} onClick={() => setDeleting(null)}>
                Cancelar
              </button>
              <button disabled={saving} onClick={remove}>
                {saving ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
