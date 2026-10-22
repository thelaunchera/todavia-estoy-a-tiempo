import { useState, useEffect, useMemo, useCallback } from 'react';
import { auth, api, SUPABASE_ENABLED, hasLocalVault, downloadEncryptedBackup, importEncryptedBackup } from './supabase-client';
import {
  LayoutDashboard,
  Mic2,
  CalendarDays,
  ShoppingBag,
  ListChecks,
  Lightbulb,
  CreditCard,
  Users,
  Mail,
  Workflow,
  SearchCheck,
  Settings2,
  Plus,
  ArrowUpRight,
  ArrowRight,
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
type Kind = 'episodios' | 'tareas' | 'productos' | 'ideas';
type Page =
  | 'inicio'
  | 'episodios'
  | 'calendario'
  | 'tareas'
  | 'productos'
  | 'ideas'
  | 'ventas'
  | 'audiencia'
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
const SITE = 'https://podcast.thelaunchera.com/';
const LOGO = SITE + 'assets/logo-podcast-04.svg';
const COVER = SITE + 'assets/podcast-episodio-01-azul-v3.webp';
const NAV = [
  {
    id: 'inicio',
    label: 'Mi estudio',
    icon: LayoutDashboard,
    group: 'ESPACIO DE CREACIÓN',
  },
  { id: 'episodios', label: 'Episodios', icon: Mic2 },
  { id: 'calendario', label: 'Calendario editorial', icon: CalendarDays },
  { id: 'tareas', label: 'Tareas', icon: ListChecks },
  { id: 'productos', label: 'Colección digital', icon: ShoppingBag },
  { id: 'ideas', label: 'Banco de ideas', icon: Lightbulb },
  {
    id: 'ventas',
    label: 'Ventas e ingresos',
    icon: CreditCard,
    group: 'OPERACIONES',
  },
  { id: 'audiencia', label: 'Audiencia', icon: Users },
  { id: 'soporte', label: 'Mensajes', icon: Mail },
  { id: 'flujos', label: 'Automatizaciones', icon: Workflow },
  { id: 'seo', label: 'SEO y sitio web', icon: SearchCheck },
  { id: 'ajustes', label: 'Configuración', icon: Settings2 },
] as const;
const LABELS: Record<Page, string> = {
  inicio: 'Mi estudio',
  episodios: 'Episodios',
  calendario: 'Calendario editorial',
  tareas: 'Tareas',
  productos: 'Colección digital',
  ideas: 'Banco de ideas',
  ventas: 'Ventas e ingresos',
  audiencia: 'Nuestra audiencia',
  soporte: 'Mensajes y ayuda',
  flujos: 'Automatizaciones',
  seo: 'SEO y sitio web',
  ajustes: 'Configuración',
};
const STATES: Record<Kind, string[]> = {
  episodios: [
    'idea',
    'planificado',
    'guion listo',
    'audio listo',
    'en producción',
    'programado',
    'publicado',
  ],
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
function App() {
  const [passphrase, setPassphrase] = useState('');
  const [mailSent, setMailSent] = useState(false);
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
  const [page, setPage] = useState<Page>('inicio'),
    [recording, setRecording] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [search, setSearch] = useState('');
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
      setData(r.data as Data);
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
        if (alive) setError((e as {code?:string})?.code === 'unauthorized' ? 'Esta cuenta no tiene permiso para entrar al estudio.' : 'No pude comprobar tu acceso. Inténtalo nuevamente.');
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);
  async function login() {
    setSigning(true);
    setError('');
    try {
      if (!SUPABASE_ENABLED && !vaultPresent && passphrase !== confirmPhrase) {
        setError('Las frases no coinciden. Escríbelas igual para crear tu estudio.');
        return;
      }
      const r = await auth.signIn(passphrase);
      if ('sent' in r && r.sent) { setMailSent(true); setPassphrase(''); return; }
      setAccount(r.user);
      setPassphrase('');
      setConfirmPhrase('');
      setVaultPresent(true);
      await refresh();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === 'bad_passphrase' ? 'La frase no coincide. Inténtalo de nuevo.' :
        code === 'short_password' ? 'Usa al menos 10 caracteres para proteger tu estudio.' :
        SUPABASE_ENABLED ? 'No se pudo enviar el enlace. Comprueba tu correo e inténtalo nuevamente.' :
        'No se pudo abrir la bóveda. Comprueba el almacenamiento de tu navegador.'
      );
    } finally {
      setSigning(false);
    }
  }
  async function logout() {
    await auth.signOut();
    setAccount(null);
    setData(null);
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
  const episodes = useMemo(
    () =>
      [...items.episodios].sort((a, b) =>
        (a.date || '').localeCompare(b.date || '')
      ),
    [items.episodios]
  );
  const tasks = items.tareas,
    products = items.productos;
  const published = episodes.filter(x => x.status === 'publicado').length;
  const pending = tasks.filter(x => x.status !== 'completado').length;
  const next = episodes.find(x => x.status !== 'publicado');
  const visible = (xs: Row[]) =>
    xs.filter(x =>
      (x.title + ' ' + (x.notes || '') + ' ' + (x.status || ''))
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  const change = (p: Page) => {
    setPage(p);
    setSearch('');
    setMobileNav(false);
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
          ? new Date().toISOString().slice(0, 10)
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
  async function save() {
    if (!edit) return;
    if (!String(edit.item.title || '').trim()) {
      setFormError('Escribe un título para continuar.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (edit.newItem) await api.post('/api/items/' + edit.kind, edit.item);
      else
        await api.put(
          '/api/items/' + edit.kind + '/' + edit.item.id,
          edit.item
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
  const episodeRows = (
    <div className="episode-list">
      {visible(episodes).map((x, i) => (
        <div className="episode" key={x.id}>
          <div className="epi-no">{String(i + 1).padStart(2, '0')}</div>
          <div className="epi-info">
            <div className="epi-line">
              <b>{x.title}</b>
              <StatePill status={x.status} />
            </div>
            <p>{x.summary || 'Parte de la primera serie del podcast.'}</p>
            <small>
              <CalendarDays size={14} />
              {formatDate(x.date)} <span>·</span>
              {x.audio ? 'Audio enlazado' : 'Audio pendiente'} <span>·</span>
              {x.art ? 'Portada enlazada' : 'Portada pendiente'}
            </small>
          </div>
          {buttons('episodios', x)}
        </div>
      ))}
      {visible(episodes).length === 0 && empty}
    </div>
  );
  const taskRows = (
    <div className="task-list">
      {visible(tasks).map(x => (
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
      {visible(tasks).length === 0 && empty}
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
  if (!account || denied)
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
            Un estudio que funciona desde GitHub. {SUPABASE_ENABLED ? 'Tus registros se sincronizan con la base de datos privada del podcast.' : 'Tus notas se guardan cifradas en este dispositivo.'}
          </p>
          {denied && (
            <div className="login-warning">
              <LockKeyhole size={17} /> No pude abrir la bóveda local. Vuelve a intentarlo.
            </div>
          )}
          {!!error && <div className="login-warning" role="alert">{error}</div>}
          <form className="vault-form" onSubmit={event => { event.preventDefault(); void login(); }}>
            <label htmlFor="studio-passphrase">{SUPABASE_ENABLED ? 'Tu correo de administración' : vaultPresent ? 'Tu frase de acceso' : 'Crea una frase de acceso (mínimo 10 caracteres)'}</label>
            <input id="studio-passphrase" type={SUPABASE_ENABLED ? 'email' : 'password'} required minLength={SUPABASE_ENABLED ? undefined : 10} autoComplete={SUPABASE_ENABLED ? 'email' : vaultPresent ? 'current-password' : 'new-password'} value={passphrase} onChange={event => setPassphrase(event.target.value)} placeholder={SUPABASE_ENABLED ? 'tu@correo.com' : 'Tu frase secreta'} />
            {!SUPABASE_ENABLED && !vaultPresent && <>
              <label htmlFor="studio-passphrase-confirm">Repite la frase</label>
              <input id="studio-passphrase-confirm" type="password" required minLength={10} autoComplete="new-password" value={confirmPhrase} onChange={event => setConfirmPhrase(event.target.value)} placeholder="Confirma tu frase" />
            </>}
            <button type="submit" disabled={signing} className="login-cta">
              {signing ? 'Comprobando…' : SUPABASE_ENABLED ? 'Enviarme enlace de acceso' : vaultPresent ? 'Abrir mi estudio' : 'Crear mi estudio'}
              <ArrowUpRight size={19} />
            </button>
          </form>
          {mailSent && <div className="login-warning" role="status">Revisa tu correo. Te envié un enlace para entrar al Estudio.</div>}
          <small><ShieldCheck size={15} /> {SUPABASE_ENABLED ? 'Acceso por correo y datos protegidos en Supabase.' : 'Cifrado en este dispositivo. Conserva tu frase y exporta un respaldo.'}</small>
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
            <ArrowUpRight size={16} />
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
          <span className="top-star">✳</span>
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
                    ✳ UNA CONVERSACIÓN A LA VEZ
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
                      Organizar capítulos <ArrowRight size={16} />
                    </button>
                    <a href={SITE} target="_blank" rel="noreferrer">
                      Ver el podcast <ArrowUpRight size={16} />
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
                    <small> / {episodes.length}</small>
                  </strong>
                  <p>Primera serie</p>
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
                      Ver calendario <ArrowRight size={15} />
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
                            289 * (1 - published / Math.max(episodes.length, 1))
                          }
                          transform="rotate(-90 56 56)"
                        />
                      </svg>
                      <strong>
                        {published}
                        <small> de {episodes.length}</small>
                      </strong>
                    </div>
                    <div>
                      <b>Cada capítulo cuenta.</b>
                      <p>Una primera serie que crece a su ritmo.</p>
                      <button onClick={() => change('episodios')}>
                        Ver progreso <ArrowUpRight size={16} />
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
                    Abrir tareas <ArrowRight size={15} />
                  </button>
                </div>
                {taskRows}
              </section>
            </>
          )}
          {page === 'episodios' && (
            <>
              {head(
                'Primera serie',
                'De la primera idea a la publicación. Cada paso tiene su espacio.',
                'episodios'
              )}
              <div className="search">
                <SearchCheck size={17} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar capítulos…"
                />
              </div>
              {episodeRows}
            </>
          )}
          {page === 'calendario' && (
            <>
              {head(
                'Un capítulo cada martes',
                'Fechas editoriales. Cambiar el estado aquí no publica en plataformas.',
                'episodios'
              )}
              <div className="calendar">
                {episodes.map((x, i) => (
                  <button
                    disabled={recording}
                    onClick={() => editRow('episodios', x)}
                    key={x.id}
                    className={
                      'calendar-item ' +
                      (x.status === 'publicado' ? 'done' : '')
                    }
                  >
                    <span>{String(i + 1).padStart(2, '0')} / 08</span>
                    <b>{formatDate(x.date)}</b>
                    <strong>{x.title}</strong>
                    <StatePill status={x.status} />
                    <small>
                      Editar capítulo <ArrowUpRight size={15} />
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
                            <ArrowUpRight size={19} />
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
          {page === 'ideas' && (
            <>
              {head(
                'Ideas que merecen espacio',
                'No todas necesitan convertirse en un capítulo hoy.',
                'ideas'
              )}
              <div className="ideas">
                {items.ideas.map(x => (
                  <article className="idea" key={x.id}>
                    <div className="idea-top">
                      <Lightbulb size={19} />
                      {buttons('ideas', x)}
                    </div>
                    <StatePill status={x.status} />
                    <h3>{x.title}</h3>
                    <p>
                      {x.notes ||
                        'Escribe una nota para desarrollar esta idea.'}
                    </p>
                    <small>{x.section || 'Idea libre'}</small>
                  </article>
                ))}
                {!items.ideas.length && empty}
              </div>
            </>
          )}
          {page === 'ventas' && (
            <>
              {head(
                'Ingresos, sin números inventados',
                'Un espacio para confirmar compras, entregas y reembolsos cuando se sincronice Stripe con Make.'
              )}
              <div className="finance">
                <span>INGRESOS VERIFICADOS</span>
                <h3>Sin sincronizar</h3>
                <p>
                  Aún no hay datos de ventas conectados a este estudio. No
                  mostramos $0 porque no significa que no hayas vendido.
                </p>
                <div>✳</div>
              </div>
              {statusPanel(
                'Conectar compras verificadas',
                data?.sources.sales ||
                  'Se requiere una conexión segura con los eventos de pago y entrega.'
              )}
              <div className="mini-two">
                <div>
                  <CreditCard size={22} />
                  <h3>Qué quedará registrado</h3>
                  <p>
                    Producto, importe confirmado, fecha, estado de envío y
                    reembolsos sin duplicados.
                  </p>
                </div>
                <div>
                  <ShieldCheck size={22} />
                  <h3>Privado por diseño</h3>
                  <p>
                    Cuando grabes la pantalla, los datos de las personas estarán
                    ocultos.
                  </p>
                </div>
              </div>
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
          {page === 'soporte' && (
            <>
              {head(
                'Responder con calma',
                'Las consultas existen fuera del estudio mientras conectamos el buzón privado.'
              )}
              {statusPanel(
                'Bandeja privada pendiente',
                data?.sources.support ||
                  'Los correos de confirmación funcionan, pero sus mensajes todavía no están en este panel.'
              )}
              <a
                className="plain-link"
                href={SITE + '#ayuda'}
                target="_blank"
                rel="noreferrer"
              >
                Abrir formulario público <ArrowUpRight size={16} />
              </a>
            </>
          )}
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
                    'Sincronización de solicitudes pendientes.',
                    false,
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
                    <ArrowUpRight size={18} />
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
                  <p>{recording ? 'Detalles ocultos mientras grabas' : SUPABASE_ENABLED ? 'Conexión Supabase protegida' : 'Bóveda cifrada en este navegador'}</p>
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
                </>
              )}
              {(edit.kind === 'productos' || edit.kind === 'episodios') && (
                <label>
                  Enlace principal
                  <input
                    value={edit.item.link || ''}
                    onChange={e =>
                      setEdit({
                        ...edit,
                        item: { ...edit.item, link: e.target.value },
                      })
                    }
                  />
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
                <ArrowRight size={16} />
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
