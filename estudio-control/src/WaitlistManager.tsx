import { useEffect, useMemo, useState } from 'react';
import { Check, CircleAlert, Mail, RefreshCw, Search, Users } from 'lucide-react';
import { getStudioWaitlist, type StudioWaitlistEntry } from './supabase-client';
import './studio-waitlist.css';

const dateLabel = (value: string | null) =>
  value ? new Intl.DateTimeFormat('es-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(value)) : '—';

type Filter = 'active' | 'all' | 'unsubscribed';

export default function WaitlistManager() {
  const [entries, setEntries] = useState<StudioWaitlistEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('active');
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let active = true;
    let busy = false;
    async function load() {
      if (busy) return;
      busy = true;
      if (active) { setLoading(true); setError(''); }
      try {
        const results = await getStudioWaitlist();
        if (active) { setEntries(results); setUpdatedAt(new Date()); }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'No se pudo actualizar la lista.');
      } finally {
        busy = false;
        if (active) setLoading(false);
      }
    }
    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 60000);
    return () => { active = false; window.clearInterval(interval); };
  }, [refreshKey]);

  const activeCount = entries.filter(row => !row.unsubscribed_at).length;
  const sentCount = entries.filter(row => !row.unsubscribed_at && row.welcome_state === 'sent').length;
  const visible = useMemo(() => entries.filter(row => {
    if (filter === 'active' && row.unsubscribed_at) return false;
    if (filter === 'unsubscribed' && !row.unsubscribed_at) return false;
    return row.email.toLowerCase().includes(query.trim().toLowerCase());
  }), [entries, filter, query]);

  async function copy(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
    } catch {
      setCopied('');
      setError('No se pudo copiar. Mantén pulsado el correo para seleccionarlo.');
    }
  }

  return <section className="studio-waitlist" aria-label="Suscripciones verificadas a la lista de espera de la masterclass">
    <div className="studio-waitlist-heading">
      <div>
        <span className="eyebrow">MASTERCLASS · INSCRIPCIONES</span>
        <h2>Personas en la lista de espera</h2>
        <p>Aquí aparecen las personas que verificaron su correo para recibir noticias del lanzamiento. No son alumnos ni compras, y no se mezclan con los suscriptores del podcast.</p>
      </div>
      <button type="button" onClick={() => setRefreshKey(value => value + 1)} disabled={loading}><RefreshCw size={16} /> Actualizar</button>
    </div>
    <div className="studio-waitlist-stats">
      <div><small>Inscritos activos</small><strong>{error && !updatedAt ? '—' : activeCount}</strong></div>
      <div><small>Registros totales</small><strong>{error && !updatedAt ? '—' : entries.length}</strong></div>
      <div><small>Bienvenidas marcadas como enviadas</small><strong>{error && !updatedAt ? '—' : sentCount}</strong></div>
    </div>
    <div className="studio-waitlist-toolbar">
      <label className="studio-waitlist-search"><Search size={17}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por correo" aria-label="Buscar por correo"/></label>
      <label className="studio-waitlist-filter">Mostrar <select value={filter} onChange={event => setFilter(event.target.value as Filter)}>
        <option value="active">Activos</option><option value="all">Todos</option><option value="unsubscribed">Dados de baja</option>
      </select></label>
    </div>
    {error && <p className="studio-waitlist-error" role="alert"><CircleAlert size={18}/>{error}</p>}
    {loading && <p className="studio-waitlist-note" role="status">Consultando los registros privados…</p>}
    {!loading && !error && entries.length === 0 && <div className="studio-waitlist-empty"><Users size={26}/><h3>Aún no hay inscritos verificados.</h3><p>Cuando alguien confirme su correo en la landing, aparecerá aquí.</p></div>}
    {!loading && entries.length > 0 && <>
      <div className="studio-waitlist-list" aria-live="polite">
        {visible.length === 0 && <p className="studio-waitlist-note">No hay registros con estos filtros.</p>}
        {visible.map(row => <article className="studio-waitlist-person" key={row.email}>
          <div className="studio-waitlist-avatar" aria-hidden="true"><Mail size={19}/></div>
          <div className="studio-waitlist-person-main">
            <strong>{row.email}</strong>
            <small>Inscripción: {dateLabel(row.consented_at)}</small>
            <small>{row.unsubscribed_at ? 'Baja: ' + dateLabel(row.unsubscribed_at) : 'Suscripción activa'}
              {' · '}{row.welcome_state === 'sent'
                ? 'Bienvenida: envío registrado' : row.welcome_state === 'cancelled'
                  ? 'Bienvenida cancelada' : 'Bienvenida pendiente'}
              {row.welcome_state === 'sent' && row.welcome_sent_at ? ' (' + dateLabel(row.welcome_sent_at) + ')' : ''}
            </small>
          </div>
          <button className="studio-waitlist-copy" type="button" onClick={() => void copy(row.email)} aria-label={'Copiar correo ' + row.email}>{copied === row.email ? <><Check size={15}/> Copiado</> : 'Copiar'}</button>
        </article>)}
      </div>
      <p className="studio-waitlist-footnote">{visible.length} registros visibles · {updatedAt ? 'Actualizado: ' + dateLabel(updatedAt.toISOString()) : 'Sin actualizar'}. Se consulta automáticamente cada minuto mientras esta sección está abierta. «Enviado» no garantiza entrega en la bandeja.</p>
    </>}
  </section>;
}
