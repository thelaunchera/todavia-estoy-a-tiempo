import { useState } from 'react';
import { BookOpen, Camera, Check, Clapperboard, Copy, Film, FolderOpen, Image, Music2, PlayCircle, Sparkles, Video } from 'lucide-react';
import TheLittleDetoursCharacters from './TheLittleDetoursCharacters';
import TheLittleDetoursFlow from './TheLittleDetoursFlow';
import './the-launch-era-youtube-plan.css';

// Current YouTube editorial plan, 14 November 2026.
// This is a production index, not a claim that Higgsfield has completed media.
// OFF BRIEF remains intact in the archived views of YouTubeStudio.
const episodes = [
  { number: 1, title: 'The Umbrella Thief', note: 'Pilot · a stolen umbrella, a chase in the rain, falling oranges, an unexpected meeting, and a mysterious key.', status: 'En producción creativa' },
  { number: 2, title: 'The Wrong Door', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 3, title: 'The Cake Disaster', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 4, title: 'The Elevator', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 5, title: 'The Tiny Rescue', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 6, title: 'The Almost Goodbye', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 7, title: 'The Hidden Key', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
  { number: 8, title: 'The Rooftop Surprise', note: 'Historia aprobada para la temporada; guion visual pendiente de vincular.', status: 'Planificado' },
] as const;

const description = [
  'Welcome to The Launch Era! 🎬✨',
  '',
  'A creative world where animated characters bring unforgettable stories to life — without saying a single word.',
  '',
  'Through expressive gestures, funny moments, unexpected twists, and heartwarming adventures, we create original animated stories that everyone can enjoy.',
  '',
  'Meet The Little Detours, our original animated series starring Nora, Eli, and Pip.',
  '',
  'No dialogue. No language barriers. Just stories worth watching.',
  '',
  'Subscribe for original animated shorts and new adventures.',
  '',
  'Created by The Launch Era.'
].join('\n');

const pilotBrief = [
  'THE LAUNCH ERA · THE LITTLE DETOURS',
  'Pilot: The Umbrella Thief',
  'Cast: Nora, Eli, Pip',
  'Target: approximately 42 seconds (7 connected segments of about six seconds).',
  'Format: visual storytelling, expressive gestures, no dialogue and no lip-sync.',
  'Story: stolen umbrella → rain chase → scattered oranges → unexpected encounter → tender beat → mysterious key.',
  'Production: Google Flow · Omni Flash 1.2. Animate the first clip from approved references, then Extend the same clip through all seven beats when available. No jump cuts.',
  'Continuity: one uninterrupted tracking shot, steady environment, stable face and wardrobe, exactly four oranges, yellow umbrella, red bandana, key revealed only at the end. Never reset the camera.',
  'Audio: original music and sound effects; no spoken lines.',
  'Status: all seven Google Flow prompts prepared; character reference images and actual rendered footage must be verified separately.'
].join('\n');

export default function TheLaunchEraYouTubePlan() {
  const [notice, setNotice] = useState('');
  const [openEpisode, setOpenEpisode] = useState<number>(1);
  async function copyText(value: string, success: string) {
    try { await navigator.clipboard.writeText(value); setNotice(success); }
    catch { setNotice('No se pudo copiar automáticamente. Selecciona el texto para copiarlo.'); }
  }

  return <div className="tle-yt-current">
    <section className="tle-yt-hero">
      <div className="tle-yt-hero-text">
        <span className="tle-yt-eyebrow"><Clapperboard size={17}/> CANAL ACTUAL · PLAN PRINCIPAL</span>
        <h2>The Launch Era</h2>
        <p className="tle-yt-subtitle">Original Animated Stories</p>
        <p className="tle-yt-motto">Little stories. Big feelings.</p>
        <p>Historias animadas originales para una audiencia global: gestos, expresiones, humor visual, música y aventuras. Sin diálogos ni sincronización de labios.</p>
        <div className="tle-yt-pills">
          <span><Film size={15}/> The Little Detours</span>
          <span><Video size={15}/> 8 episodios</span>
          <span><Music2 size={15}/> Sin diálogos</span>
        </div>
      </div>
      <div className="tle-yt-hero-art" aria-hidden="true"><span>THE</span><strong>LITTLE<br/>DETOURS</strong><small>01 — 08</small></div>
    </section>

    <section className="tle-yt-heading">
      <div>
        <span className="tle-yt-eyebrow">PRIMERA SERIE ORIGINAL</span>
        <h3>The Little Detours</h3>
        <p>Personajes principales: <strong>Nora · Eli · Pip</strong>. Las imágenes maestras deben mantenerse consistentes en todas las escenas.</p>
      </div>
      <span className="tle-yt-status">Google Flow · prompts preparados</span>
    </section>

    <TheLittleDetoursCharacters />
    <TheLittleDetoursFlow />

    <section className="tle-yt-grid">
      <article className="tle-yt-card tle-yt-pilot">
        <div className="tle-yt-card-head"><span><PlayCircle size={17}/> EPISODIO 01 · PILOTO</span><small>≈ 42 segundos</small></div>
        <h4>The Umbrella Thief</h4>
        <p>Un paraguas desaparece y empieza una persecución bajo la lluvia. Unas naranjas, un encuentro inesperado y una llave misteriosa conectan esta historia con la siguiente.</p>
        <div className="tle-yt-actions">
          <button type="button" onClick={() => void copyText(pilotBrief, 'Plan del piloto copiado.') }><Copy size={16}/> Copiar plan del piloto</button>
        </div>
      </article>
      <article className="tle-yt-card">
        <div className="tle-yt-card-head"><span><Camera size={17}/> REFERENCIAS DE PERSONAJES</span></div>
        <h4>Nora, Eli y Pip</h4>
        <p>Las imágenes maestras iniciadas en Higgsfield se conservan como referencias. La animación nueva se realizará en Google Flow; las fotos deben verificarse en Drive antes de enlazarlas aquí.</p>
        <p className="tle-yt-muted"><Image size={16}/> Enlazar las imágenes aprobadas cuando estén disponibles. No se duplican ni se presentan como entregadas aquí.</p>
      </article>
    </section>

    <section className="tle-yt-card">
      <div className="tle-yt-card-head"><span><BookOpen size={17}/> PLAN DE TEMPORADA</span><small>8 episodios · sin voz</small></div>
      <div className="tle-yt-episode-list">
        {episodes.map(ep => <article className={'tle-yt-episode '+(openEpisode===ep.number?'selected':'')} key={ep.number}>
          <button type="button" aria-expanded={openEpisode===ep.number} onClick={() => setOpenEpisode(openEpisode===ep.number?0:ep.number)}>
            <span className="tle-yt-num">{String(ep.number).padStart(2,'0')}</span>
            <span className="tle-yt-episode-copy"><strong>{ep.title}</strong><small>{ep.status}</small></span>
            <span className="tle-yt-chevron" aria-hidden="true">{openEpisode===ep.number?'−':'+'}</span>
          </button>
          {openEpisode===ep.number && <p>{ep.note}</p>}
        </article>)}
      </div>
    </section>

    <section className="tle-yt-card">
      <div className="tle-yt-card-head"><span><Sparkles size={17}/> CONTINUIDAD · REVISIÓN FINAL</span></div>
      <h4>Antes de aprobar cada segmento</h4>
      <ol className="tle-yt-workflow">
        <li><strong>Personajes:</strong> usar las imágenes máster aprobadas de Nora, Eli y Pip, sin alterar sus identidades.</li>
        <li><strong>Escenas:</strong> reutilizar el mismo lugar, encuadre y los fotogramas de referencia aprobados.</li>
        <li><strong>Movimiento:</strong> continuar el clip anterior con Extend; no crear un montaje de tomas sin conexión.</li>
        <li><strong>Continuidad:</strong> revisar caras, proporciones, objetos, dirección de movimiento y punto exacto de unión entre segmentos. No hacer cortes ni morph.</li>
        <li><strong>Montaje:</strong> música y efectos de sonido, revisión de la historia y exportación solo después de verificar el video.</li>
      </ol>
      <p className="tle-yt-muted">El contenido de Google Flow no se sincroniza automáticamente con el Studio. Los prompts sí están aquí; las fotos y los clips se enlazarán únicamente cuando existan archivos verificados.</p>
    </section>

    <section className="tle-yt-card tle-yt-channel-card">
      <div>
        <div className="tle-yt-card-head"><span><FolderOpen size={17}/> IDENTIDAD DEL CANAL</span></div>
        <h4>The Launch Era · YouTube</h4>
        <p><strong>Banner:</strong> THE LAUNCH ERA / Original Animated Stories / No words. Just stories.</p>
        <p><strong>Descripción en inglés:</strong></p>
        <pre>{description}</pre>
        <div className="tle-yt-actions"><button type="button" onClick={() => void copyText(description, 'Descripción de YouTube copiada.') }><Copy size={16}/> Copiar descripción</button></div>
      </div>
    </section>
    {notice && <p className="tle-yt-notice" role="status"><Check size={16}/>{notice}</p>}
  </div>;
}
