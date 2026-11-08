import {useState} from 'react';
import {ExternalLink, Headphones, Music2, Volume2} from 'lucide-react';

type AudioItem = {
  id: string;
  title: string;
  file: string;
  duration: string;
  description: string;
  driveId: string;
};
const AUDIO: AudioItem[] = [
  {
    id: 'presentation',
    title: 'Presentation Sound',
    file: 'OFFBRIEF_Presentation_Sound.wav',
    duration: '7.5 segundos',
    description: 'Sonido de apertura. En Final Cut se utiliza hasta 5 segundos con el intro oficial, después del cold open.',
    driveId: '1H-VpQZIZHVfzcj6BqfYh6gEmUBaI4plV'
  },
  {
    id: 'series',
    title: 'Series Background',
    file: 'OFFBRIEF_Series_Background.mp3',
    duration: '2:33 minutos',
    description: 'Música de fondo para los capítulos. El montaje puede repetirla suavemente y silenciarla durante el intro y los beats de comedia.',
    driveId: '1XN7ZuGi5s6LDs9toP25fLWWKCvxBDKca'
  }
];

const videoStudioUrl = 'https://off-brief-video-studio-ipad-48pcps.v2.appdeploy.ai/';
export default function YouTubeAudioLibrary(){
  const [preview, setPreview] = useState<string|null>(null);
  return <div className="yt-official-audio" role="tabpanel" aria-label="Biblioteca de sonido oficial de OFF BRIEF">
    <section className="yt-paper yt-official-audio-head">
      <div className="yt-small-title"><Music2 size={16}/> AUDIO OFICIAL · OFF BRIEF</div>
      <h3>Dos sonidos. Una identidad para toda la serie.</h3>
      <p>Estas son las grabaciones originales guardadas en Drive. Las temporadas comparten la misma biblioteca, sin crear copias ni reemplazar música aprobada.</p>
      <a className="yt-official-audio-editor" href={videoStudioUrl} target="_blank" rel="noopener noreferrer"><Headphones size={17}/> Abrir Video Studio <ExternalLink size={15}/></a>
      <p className="yt-official-audio-note">Para colocarlos en la mezcla de un capítulo, usa <strong>Video Editor → Audio</strong> cuando la actualización de ese editor esté publicada. Los controles de esta página son para escuchar los archivos originales.</p>
    </section>
    <div className="yt-official-audio-grid">
      {AUDIO.map((item,index)=>{
        const open = preview===item.id;
        const driveUrl = 'https://drive.google.com/file/d/'+item.driveId+'/view';
        const previewUrl = 'https://drive.google.com/file/d/'+item.driveId+'/preview';
        return <article key={item.id} className="yt-paper yt-official-audio-card">
          <div className="yt-official-audio-number">{String(index+1).padStart(2,'0')}</div>
          <div className="yt-small-title">{item.id==='presentation'?'OPENING CUE':'EPISODE BACKGROUND'}</div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="yt-official-audio-meta"><span><Volume2 size={15}/>{item.duration}</span><small>{item.file}</small></div>
          <div className="yt-official-audio-actions">
            <button type="button" aria-expanded={open} onClick={()=>setPreview(open?null:item.id)}>
              <Headphones size={16}/>{open?'Cerrar reproductor':'Escuchar'}
            </button>
            <a href={driveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Abrir original</a>
          </div>
          {open&&<div className="yt-official-audio-preview">
            <iframe title={'Reproductor original de '+item.title} src={previewUrl} loading="lazy" allow="autoplay" referrerPolicy="strict-origin-when-cross-origin"/>
            <p>La reproducción puede requerir iniciar sesión en la cuenta de Google que tiene acceso. Si no se escucha en iPhone, usa <a href={driveUrl} target="_blank" rel="noopener noreferrer">Abrir original</a>.</p>
          </div>}
        </article>;
      })}
    </div>
  </div>;
}
