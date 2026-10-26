import { useCallback, useEffect, useState } from 'react';
import { getSupportMessages, type SupportMessage } from './supabase-client';

export default function SupportInbox() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await getSupportMessages());
      setVerified(true);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los mensajes.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const refresh = () => { if (document.visibilityState === 'visible') void load(); };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [load]);
  return <section className="support-inbox">
    <div className="support-inbox-heading">
      <div><h2>Mensajes y ayuda</h2><p>Las últimas 100 consultas recibidas desde el landing. Se actualizan cada 30 segundos.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading}>{loading ? 'Cargando…' : 'Actualizar mensajes'}</button>
    </div>
    {error && <p role="alert">{error} {verified && 'Los mensajes visibles corresponden a la última lectura correcta.'}</p>}
    {!error && verified && <p role="status">{messages.length} {messages.length === 1 ? 'consulta recibida' : 'consultas recibidas'}</p>}
    {!loading && !error && !messages.length && <p>Todavía no hay consultas recibidas.</p>}
    <div className="support-message-list">{messages.map(message => <article className="support-message" key={message.id}>
      <div className="support-message-meta"><span>{message.status || 'abierto'}</span><time dateTime={message.created_at}>{new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(message.created_at))}</time></div>
      <h3>{message.subject || 'Consulta del landing'}</h3>
      <p className="support-message-sender"><strong>{message.sender_name || 'Sin nombre'}</strong><span>{message.sender_email}</span></p>
      <p className="support-message-body">{message.body}</p>
    </article>)}</div>
  </section>;
}
