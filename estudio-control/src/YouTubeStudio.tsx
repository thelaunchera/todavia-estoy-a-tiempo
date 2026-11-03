import { useMemo, useState } from 'react';
import { BookOpen, Camera, Check, Clapperboard, Copy, Download, Film, Layers3, Search, Users, Video, WandSparkles } from 'lucide-react';
import YouTubePhotoLibrary from './YouTubePhotoLibrary';
import { youtubeBrief } from './youtube/brief';
import { youtubeEpisodes } from './youtube/episodes';
import './youtube-studio.css';

type Tab = 'brief' | 'episodes' | 'photos';

function BulletPanel({ title, items }: { title: string; items: readonly string[] }) {
  return <section className="yt-paper yt-list-paper">
    <h3>{title}</h3>
    <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
  </section>;
}

function ScriptText({ content }: { content: string }) {
  return <div className="yt-screenplay" lang="en">
    {content.split(/\r?\n/).map((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) return <div className="yt-script-spacer" key={index} aria-hidden="true" />;
      if (line.startsWith('# ')) return <h2 key={index}>{line.slice(2)}</h2>;
      if (line.startsWith('### ')) return <h3 key={index}>{line.slice(4)}</h3>;
      if (line.startsWith('**')) {
        const clean = line.replace(/\*\*/g, '');
        return <p key={index} className={/^(ACTION|SHOT|SFX|CUT|MONTAGE|END)/.test(clean) ? 'yt-stage' : 'yt-meta'}>{clean}</p>;
      }
      const dialogue = /^([A-Z][A-Z\s()]+):\s*(.*)$/.exec(line);
      if (dialogue) return <p className="yt-dialogue" key={index}>
        <strong>{dialogue[1]}</strong><span>{dialogue[2]}</span>
      </p>;
      return <p className="yt-narration" key={index}>{line}</p>;
    })}
  </div>;
}

export default function YouTubeStudio() {
  const [tab, setTab] = useState<Tab>('brief');
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const episode = youtubeEpisodes.find(item => item.number === selected) ?? youtubeEpisodes[0];
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return youtubeEpisodes.filter(item => !needle || [item.title, item.logline, item.conflict, item.script].some(value => value.toLocaleLowerCase().includes(needle)));
  }, [query]);
  const openEpisode = (num: number) => {
    setSelected(num);
    setTab('episodes');
    setFeedback('');
  };
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(episode.script);
      setFeedback('Guion completo copiado.');
    } catch {
      setFeedback('No se pudo copiar. Usa Descargar TXT.');
    }
  };
  const downloadScript = () => {
    const blob = new Blob([episode.script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'off-brief-ep-' + String(episode.number).padStart(2, '0') + '.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return <div className="yt-studio">
    <section className="yt-hero">
      <div className="yt-hero-copy">
        <span className="yt-kicker"><Clapperboard size={16}/> NUEVA SERIE · YOUTUBE</span>
        <h2>{youtubeBrief.title}</h2>
        <p className="yt-hero-tagline">{youtubeBrief.tagline}</p>
        <p>{youtubeBrief.logline}</p>
        <div className="yt-chips">
          <span><Film size={15}/> 8 episodios</span>
          <span><Users size={15}/> Nia + Ruby</span>
          <span><Video size={15}/> Comedia animada</span>
        </div>
      </div>
      <div className="yt-hero-mark" aria-hidden="true">OFF<br/>BRIEF<span>01—08</span></div>
    </section>

    <div className="yt-view-switch" role="tablist" aria-label="Biblioteca de YouTube">
      <button type="button" role="tab" aria-selected={tab === 'brief'} className={tab === 'brief' ? 'active' : ''} onClick={() => setTab('brief')}><BookOpen size={17}/> Brief completo</button>
      <button type="button" role="tab" aria-selected={tab === 'episodes'} className={tab === 'episodes' ? 'active' : ''} onClick={() => setTab('episodes')}><Layers3 size={17}/> Guiones de los 8 capítulos</button>
      <button type="button" role="tab" aria-selected={tab === 'photos'} className={tab === 'photos' ? 'active' : ''} onClick={() => setTab('photos')}><Camera size={17}/> Fotos y prompts</button>
    </div>

    {tab === 'brief' ? <div className="yt-brief" role="tabpanel">
      <section className="yt-paper yt-identity">
        <div className="yt-small-title">SERIE ORIGINAL · BIBLIA CREATIVA</div>
        <h3>{youtubeBrief.workingEnglishTitle} / {youtubeBrief.title}</h3>
        <p className="yt-accent-copy">“{youtubeBrief.secondaryTagline}”</p>
        <div className="yt-facts">
          <div><span>Género</span><strong>{youtubeBrief.genre}</strong></div>
          <div><span>Audiencia</span><strong>{youtubeBrief.audience}</strong></div>
          <div><span>Idioma</span><strong>{youtubeBrief.originalLanguage}</strong></div>
          <div><span>Temporada</span><strong>{youtubeBrief.season}</strong></div>
          <div><span>Duración objetivo</span><strong>{youtubeBrief.targetDuration}</strong></div>
        </div>
        <h4>Premisa</h4><p>{youtubeBrief.premise}</p>
        <h4>Promesa de la serie</h4><p>{youtubeBrief.promise}</p>
      </section>

      <section className="yt-paper">
        <div className="yt-small-title">DOS AMIGAS · DOS ENERGÍAS</div>
        <h3>Personajes principales</h3>
        <div className="yt-cast">
          {youtubeBrief.protagonists.map(person => <article className="yt-character" key={person.name}>
            <div className="yt-character-placeholder"><img src={import.meta.env.BASE_URL + 'youtube/characters/' + person.name.toLowerCase() + '.webp'} alt={'Avatar original de ' + person.name} loading="lazy" /></div>
            <div><h4>{person.name}</h4><p className="yt-cast-role">{person.role}</p><p>{person.personality}</p>
              <p><strong>Fortaleza:</strong> {person.strength}</p>
              <p><strong>Debilidad:</strong> {person.flaw}</p>
              <p><strong>Frase:</strong> “{person.catchphrase}”</p>
              <p><strong>Arco personal:</strong> {person.growth}</p>
              <p className="yt-muted">{person.avatar}</p>
            </div>
          </article>)}
        </div>
        <h4>La relación</h4><p>{youtubeBrief.relationship}</p>
      </section>

      <div className="yt-two-col">
        <BulletPanel title="El mundo de la serie" items={youtubeBrief.world}/>
        <BulletPanel title="Tono y tipo de humor" items={youtubeBrief.tone}/>
        <BulletPanel title="Reglas de dirección creativa" items={youtubeBrief.creativeRules}/>
        <BulletPanel title="Gags recurrentes" items={youtubeBrief.recurringJokes}/>
      </div>

      <section className="yt-paper">
        <div className="yt-small-title">ARCO NARRATIVO</div>
        <h3>Temporada 1 · Ocho historias conectadas</h3>
        <div className="yt-season-steps">
          {youtubeEpisodes.map(ep => <button className="yt-season-step" type="button" key={ep.number} onClick={() => openEpisode(ep.number)}>
            <span className="yt-episode-index">{String(ep.number).padStart(2,'0')}</span>
            <span><strong>{ep.title}</strong><small>{ep.logline}</small></span>
            <span className="yt-step-verb">Leer guion</span>
          </button>)}
        </div>
        <h4>Progresión interna</h4><ul>{youtubeBrief.narrativeArc.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </section>

      <section className="yt-paper">
        <div className="yt-small-title">PRODUCCIÓN</div>
        <h3>Formato y workflow</h3>
        <div className="yt-production-grid">
          <div><strong>YouTube</strong><p>{youtubeBrief.format.youtube}</p></div>
          <div><strong>Shorts</strong><p>{youtubeBrief.format.shorts}</p></div>
          <div><strong>Estructura</strong><p>{youtubeBrief.format.structure}</p></div>
          <div><strong>Proceso</strong><p>{youtubeBrief.format.production}</p></div>
        </div>
        <h4>Plano distintivo del piloto</h4><p>{youtubeBrief.pilotSignatureShot}</p>
        <h4>Referencias visuales</h4><p>{youtubeBrief.characterReferences}</p>
        <p className="yt-muted">{youtubeBrief.format.statusLegend}</p>
      </section>
    </div> : tab === 'photos' ? <YouTubePhotoLibrary/> : <div className="yt-episodes" role="tabpanel">
      <aside className="yt-episodes-sidebar">
        <label className="yt-search"><Search size={17}/><input aria-label="Buscar dentro de los guiones" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar capítulo o diálogo..."/></label>
        <div className="yt-episode-list">
          {matches.map(ep => <button type="button" key={ep.number} className={'yt-episode-button ' + (selected === ep.number ? 'active' : '')} onClick={() => openEpisode(ep.number)}>
            <span className="yt-episode-index">{String(ep.number).padStart(2,'0')}</span>
            <span><strong>{ep.title}</strong><small>{ep.conflict}</small></span>
          </button>)}
          {matches.length === 0 && <p className="yt-no-results">No se encontraron capítulos. Prueba otra palabra.</p>}
        </div>
      </aside>
      <article className="yt-paper yt-script-card">
        <div className="yt-script-toolbar">
          <div><span className="yt-small-title">CAPÍTULO {String(episode.number).padStart(2,'0')} · GUION COMPLETO</span><h3>{episode.title}</h3><p>{episode.logline}</p></div>
          <div className="yt-script-actions">
            <button type="button" onClick={copyScript}><Copy size={16}/> Copiar guion</button>
            <button type="button" onClick={downloadScript}><Download size={16}/> Descargar TXT</button>
          </div>
        </div>
        <div className="yt-script-hint"><WandSparkles size={16}/><span>Primera versión completa de diálogo y acciones; aún sin voces ni storyboard ilustrado. El texto público está en inglés.</span></div>
        {feedback && <p className="yt-copy-feedback" role="status"><Check size={16}/>{feedback}</p>}
        <ScriptText content={episode.script}/>
      </article>
    </div>}
  </div>;
}
