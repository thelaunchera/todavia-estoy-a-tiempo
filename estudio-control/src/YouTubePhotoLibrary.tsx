import { useMemo, useState } from 'react';
import { Camera, Check, ClipboardCopy, Download, Eye, FileImage, Film, ImagePlus, Layers3, UserRound, X } from 'lucide-react';
import { youtubeBrief } from './youtube/brief';
import { youtubeEpisodes } from './youtube/episodes';
import { getYouTubePhotoPrompt, youtubePhotoBoard, youtubeVisualStats, type YouTubePhoto } from './youtube/visual-plan';
import './youtube-photo-library.css';

const characterImage = (name: string) => import.meta.env.BASE_URL + 'youtube/characters/' + name.toLowerCase() + '.webp';

function saveText(filename: string, content: string) {
 const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
 const link = document.createElement('a');
 const url = URL.createObjectURL(file);
 link.href = url;
 link.download = filename;
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const photoName = (photo: YouTubePhoto) => photo.id.toLowerCase() + '.png';
export default function YouTubePhotoLibrary() {
 const [episodeNumber, setEpisodeNumber] = useState(1);
 const [openPrompts, setOpenPrompts] = useState<Record<string, boolean>>({});
 const [notice, setNotice] = useState('');
 const episode = youtubeEpisodes.find(e => e.number === episodeNumber) ?? youtubeEpisodes[0];
 const shots = useMemo(() => youtubePhotoBoard[episodeNumber] ?? [], [episodeNumber]);
 const allPrompts = useMemo(() => shots.map(shot =>
   '=== ' + shot.id + ' / ' + shot.title + ' ===\n\n' + getYouTubePhotoPrompt(shot)
 ).join('\n\n-----------------------------\n\n'), [shots]);

 const copy = async (text: string, message: string) => {
   try { await navigator.clipboard.writeText(text); setNotice(message); }
   catch { setNotice('No se pudo copiar automáticamente. Usa la opción Descargar TXT.'); }
 };
 const downloadChapter = () => saveText('off-brief-ep-' + String(episodeNumber).padStart(2,'0') + '-photo-prompts.txt', allPrompts);
 return <div className="yt-photos">
   <section className="yt-paper yt-photo-intro">
     <span className="yt-small-title"><Camera size={15}/> BIBLIA VISUAL · TEMPORADA 01</span>
     <h3>Fotos, avatares y prompts por capítulo</h3>
     <p>Los dos avatares originales están guardados como referencias visuales. Debajo tienes <strong>{youtubeVisualStats.totalFrames} fotografías planificadas</strong> con un prompt individual por plano, organizadas en los 8 capítulos. Las imágenes de las escenas están pendientes de producir.</p>
     <div className="yt-photo-counts">
       <span><UserRound size={15}/> 2 personajes</span><span><Film size={15}/> {youtubeVisualStats.episodes} capítulos</span>
       <span><Layers3 size={15}/> {youtubeVisualStats.framesPerEpisode} prompts por capítulo</span>
     </div>
   </section>
   <section className="yt-paper">
     <span className="yt-small-title">PERSONAJES · REFERENCIAS FIJAS</span>
     <h3>Las dos amigas</h3>
     <p className="yt-avatar-note">Estas son las referencias originales que debes adjuntar siempre al generar fotos con Nia o Ruby. No cambiar sus caras, peinados ni su vestuario base entre capítulos.</p>
     <div className="yt-avatar-grid">
       {youtubeBrief.protagonists.map(person => <article className="yt-avatar-card" key={person.name}>
         <div className={'yt-avatar-image yt-avatar-' + person.name.toLowerCase()}>
           <img src={characterImage(person.name)} alt={'Avatar original de ' + person.name} loading="lazy"/>
         </div>
         <div className="yt-avatar-text">
           <h4>{person.name}</h4>
           <p className="yt-avatar-role">{person.role}</p>
           <p>{person.personality}</p>
           <div className="yt-avatar-facts"><p><strong>Fortaleza:</strong> {person.strength}</p>
             <p><strong>Debilidad:</strong> {person.flaw}</p>
             <p><strong>Su frase:</strong> “{person.catchphrase}”</p>
             <p><strong>Su evolución:</strong> {person.growth}</p></div>
           <button type="button" className="yt-outline-action" onClick={() => copy(person.avatar, 'Descripción de ' + person.name + ' copiada.')}><ClipboardCopy size={16}/> Copiar descripción</button>
         </div>
       </article>)}
     </div>
     <p className="yt-photo-footnote">Fotos originales aportadas para el proyecto; las versiones web están optimizadas para mostrar aquí. Las escenas nuevas se renderizarán a 16:9, sin contorno de sticker.</p>
   </section>
   <section className="yt-paper yt-photo-chapters">
     <div className="yt-photo-chapters-head">
       <div><span className="yt-small-title">PRODUCCIÓN · EPISODIOS</span><h3>Galería y prompts de cada capítulo</h3></div>
       <button type="button" className="yt-outline-action" onClick={downloadChapter}><Download size={16}/> Descargar los {shots.length} prompts</button>
     </div>
     <div className="yt-chapter-tabs" aria-label="Seleccionar capítulo">
       {youtubeEpisodes.map(ep => <button key={ep.number} type="button"
         className={episodeNumber === ep.number ? 'active' : ''}
         aria-pressed={episodeNumber === ep.number}
         onClick={() => {setEpisodeNumber(ep.number);setNotice('');}}>
         <strong>{String(ep.number).padStart(2,'0')}</strong><span>{ep.title}</span>
       </button>)}
     </div>
     <div className="yt-photo-chapter-summary">
       <div><span className="yt-small-title">CAPÍTULO {String(episode.number).padStart(2,'0')}</span>
         <h4>{episode.title}</h4><p>{episode.logline}</p>
       </div>
       <button type="button" className="yt-solid-action" onClick={() => copy(allPrompts,'Todos los prompts del capítulo copiados.')}><ClipboardCopy size={16}/> Copiar todos</button>
     </div>
     {notice && <p role="status" className="yt-photos-feedback"><Check size={16}/>{notice}</p>}
     <div className="yt-photo-grid">
       {shots.map(photo => <article key={photo.id} className="yt-photo-card">
         <div className="yt-photo-visual">
           {photo.image ? <img src={photo.image} alt={photo.title} loading="lazy"/> :
             <div className="yt-photo-empty">
               <ImagePlus size={26} strokeWidth={1.6}/>
               <span>Foto pendiente</span>
               <small>Escena {String(photo.scene).padStart(2,'0')}</small>
             </div>}
           <span className="yt-photo-id">{photo.id}</span>
         </div>
         <div className="yt-photo-card-text">
           <h5>{photo.title}</h5>
           <p className="yt-photo-meta">ESCENA {photo.scene} · {photo.cast === 'NR' ? 'Nia + Ruby' : photo.cast === 'N' ? 'Nia' : photo.cast === 'R' ? 'Ruby' : 'Producto / ambiente'}</p>
           <p>{photo.shot}</p>
           <p className="yt-photo-description">{photo.action}</p>
           <div className="yt-photo-card-actions">
             <button type="button" onClick={() => setOpenPrompts(old=>({ ...old,[photo.id]:!old[photo.id]}))}>
               {openPrompts[photo.id] ? <X size={15}/> : <Eye size={15}/>}
               {openPrompts[photo.id] ? 'Cerrar prompt' : 'Ver prompt'}
             </button>
             <button type="button" onClick={() => copy(getYouTubePhotoPrompt(photo),'Prompt ' + photo.id + ' copiado.')}><ClipboardCopy size={15}/> Copiar</button>
           </div>
           {openPrompts[photo.id] && <div className="yt-photo-full-prompt">
             <strong>Prompt final en inglés</strong>
             <pre>{getYouTubePhotoPrompt(photo)}</pre>
             <button type="button" className="yt-outline-action" onClick={() => saveText(photoName(photo).replace('.png','-prompt.txt'),getYouTubePhotoPrompt(photo))}><FileImage size={15}/> Descargar prompt de esta foto</button>
           </div>}
         </div>
       </article>)}
     </div>
   </section>
 </div>;
}
