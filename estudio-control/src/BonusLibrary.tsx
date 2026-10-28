import { useEffect, useState } from 'react';
import { BookOpen, Check, Copy, ExternalLink, Gift, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { getStudioBonusResources, type StudioBonusResource } from './supabase-client';
import './bonus-library.css';

export default function BonusLibrary() {
  const [resources, setResources] = useState<StudioBonusResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getStudioBonusResources()
      .then((result) => { if (!cancelled) setResources(result); })
      .catch(() => { if (!cancelled) setError('No se pudo cargar la biblioteca. Comprueba tu sesión de administradora y vuelve a intentarlo.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);

  async function copyLink(url: string, code: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
    } catch {
      setCopied('');
      setError('Si Safari no permite copiar, mantén pulsado el enlace visible y selecciona Copiar.');
    }
  }

  return (
    <section className="studio-bonus-library" aria-label="Biblioteca privada de bonos">
      <header className="bonus-library-header">
        <div>
          <span className="eyebrow"><ShieldCheck size={15} /> ESPACIO INTERNO · NO PUBLICADO EN EL AULA</span>
          <h2>El lugar donde nacen nuestros bonos.</h2>
          <p>Reúne aquí las herramientas y bibliotecas que prepararemos para las clases. Puedes abrir cada recurso, probarlo y guardar su enlace. Los recursos en borrador no se muestran a los estudiantes.</p>
        </div>
        <span className="bonus-library-symbol" aria-hidden="true"><Gift size={28} /></span>
      </header>

      <div className="bonus-library-toolbar">
        <div className="bonus-library-status"><Sparkles size={17} /> {resources.length} {resources.length === 1 ? 'recurso guardado' : 'recursos guardados'}</div>
        <button type="button" onClick={() => setRevision((n) => n + 1)} disabled={loading}><RotateCcw size={16} /> Actualizar</button>
      </div>

      {loading && <p className="bonus-library-feedback" role="status">Cargando los recursos guardados…</p>}
      {error && <p className="bonus-library-feedback bonus-library-error" role="alert">{error}</p>}
      {!loading && !error && resources.length === 0 && (
        <div className="bonus-library-empty"><BookOpen size={25} /><h3>Tu biblioteca está lista para crecer.</h3><p>Aquí aparecerán los bonos que guardemos para la clase.</p></div>
      )}

      <div className="bonus-library-grid">
        {resources.map((item) => (
          <article className="bonus-library-card" key={item.resource_code}>
            <div className="bonus-library-card-top">
              <span className="bonus-library-icon"><Sparkles size={20} /></span>
              <span className="bonus-library-draft">{item.status === 'ready' ? 'Listo para revisión' : 'Borrador privado'}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.resource_code === 'bonus_motion_studio' ? '130 demostraciones de efectos para páginas web. Previsualiza las animaciones y copia los prompts o el código de cada ejemplo.' : 'Recurso guardado para preparar los próximos materiales de la clase.'}</p>
            <div className="bonus-library-url" title={item.url}>{item.url}</div>
            <div className="bonus-library-actions">
              <a href={item.url} target="_blank" rel="noopener noreferrer">Abrir biblioteca <ExternalLink size={16} /></a>
              <button type="button" onClick={() => void copyLink(item.url, item.resource_code)}>
                {copied === item.resource_code ? <Check size={16} /> : <Copy size={16} />}
                {copied === item.resource_code ? 'Copiado' : 'Copiar enlace'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="bonus-library-bottom"><ShieldCheck size={17} /><span>Esta sección está dentro de Mi Estudio. Los estudiantes solo verán los bonos que decidamos publicar más adelante.</span></div>
    </section>
  );
}
