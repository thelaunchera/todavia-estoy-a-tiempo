import {Camera, FolderOpen, Image as ImageIcon, Info, UserRound} from 'lucide-react';
import './the-little-detours-characters.css';

// Official master-character library; folder URLs are verified Drive folders.
// Do not replace these descriptions with invented appearances or expose Drive files publicly.
// Individual shots are linked only when their verified Drive IDs are available.
type MasterShot = {label: string; fileName: string; url: string};
type Character = {
  name: string;
  role: string;
  appearance: string;
  personality: string;
  continuity: string;
  folder: string;
  shots: MasterShot[];
};

const cast: Character[] = [
  {
    name:'Nora',
    role:'Protagonista · La curiosa',
    appearance:'Cabello castaño corto, ojos grandes y suéter azul claro.',
    personality:'Creativa, curiosa y un poco distraída. Se entusiasma con los descubrimientos y suele verse envuelta en situaciones inesperadas.',
    continuity:'Mantener el mismo rostro, cabello castaño corto, ojos grandes, suéter azul claro y proporciones en todas las vistas.',
    folder:'https://drive.google.com/drive/folders/1U8zuohYX47jgyrO4iHNK7-VyqanRLRL0',
    shots:[
      {label:'Master · frente',fileName:'Nora — master',url:''},
      {label:'Tres cuartos',fileName:'Nora — 3/4',url:''},
      {label:'Vista posterior',fileName:'Nora — back',url:''},
      {label:'Expresión · sorpresa',fileName:'Nora — surprise',url:''}
    ]
  },
  {
    name:'Eli',
    role:'Protagonista · El compañero tranquilo',
    appearance:'Cabello oscuro ondulado y camisa verde.',
    personality:'Tranquilo, amable, reservado y un poco torpe. Su forma de reaccionar aporta ternura y humor visual a las aventuras.',
    continuity:'Mantener la textura ondulada del cabello oscuro, la camisa verde, el rostro y las proporciones entre tomas.',
    folder:'https://drive.google.com/drive/folders/1YxOYvrVQFPP0pHQ8Y_AzX_Pr3GkhO047',
    shots:[
      {label:'Master · cuerpo completo',fileName:'Eli — master',url:''},
      {label:'Vista posterior',fileName:'Eli — back',url:''},
      {label:'Vista lateral',fileName:'Eli — side',url:''}
    ]
  },
  {
    name:'Pip',
    role:'Protagonista · El pequeño travieso',
    appearance:'Perrito pequeño de pelaje color crema, una oreja oscura y pañuelo rojo.',
    personality:'Juguetón y travieso, pero sus acciones tienen una razón. Sus movimientos y reacciones hacen avanzar los conflictos sin diálogo.',
    continuity:'Conservar tamaño pequeño, pelaje crema, exactamente una oreja oscura y el mismo pañuelo rojo en todas las escenas.',
    folder:'https://drive.google.com/drive/folders/1i7ypLO5KuDjvLyP61Zzc0XTdpj9mH0sn',
    shots:[
      {label:'Master · frente',fileName:'Pip — master',url:''},
      {label:'Tres cuartos',fileName:'Pip — 3/4',url:''},
      {label:'Vista posterior',fileName:'Pip — back',url:''}
    ]
  }
];

export default function TheLittleDetoursCharacters() {
  return <section className="tld-cast-section" aria-labelledby="tld-cast-title">
    <div className="tld-cast-heading">
      <div><span className="tle-yt-eyebrow"><UserRound size={16}/> PERSONAJES OFICIALES · BIBLIOTECA MASTER</span>
      <h3 id="tld-cast-title">Nora, Eli &amp; Pip</h3>
      <p>Una ficha por personaje con descripción oficial, continuidad visual y carpeta propia de Drive.</p></div>
      <a href="https://drive.google.com/drive/folders/1ltmct1l5vxn5aYtypelJ5RKP9ihDLax8" target="_blank" rel="noopener noreferrer" className="tld-open-master"><FolderOpen size={17}/> Abrir carpeta máster</a>
    </div>
    <div className="tld-cast-cards">
      {cast.map(character=>{
        const linked=character.shots.filter(shot=>Boolean(shot.url)).length;
        return <article className="tld-cast-card" key={character.name}>
          <div className="tld-cast-image">
            {character.shots[0]?.url
              ? <img src={character.shots[0].url} alt={'Referencia maestra aprobada de '+character.name} loading="lazy"/>
              : <div className="tld-cast-empty"><Camera size={28}/><strong>{character.name}</strong><small>Foto máster pendiente en Drive</small></div>}
          </div>
          <div className="tld-cast-info">
            <span className="tld-cast-role">{character.role}</span>
            <h4>{character.name}</h4>
            <p><strong>Apariencia:</strong> {character.appearance}</p>
            <p><strong>Personalidad:</strong> {character.personality}</p>
            <details className="tld-cast-continuity"><summary>Reglas de continuidad visual</summary><p>{character.continuity}</p></details>
            <div className="tld-cast-shots-head"><span><ImageIcon size={15}/> Fotografías individuales</span><small>{linked}/{character.shots.length} vinculadas</small></div>
            <div className="tld-cast-shots">{character.shots.map(shot=><div className="tld-cast-shot" key={shot.label}>
              <span>{shot.label}</span>
              {shot.url?<a href={shot.url} target="_blank" rel="noopener noreferrer">Ver foto</a>:<small>Pendiente</small>}
            </div>)}</div>
            <a className="tld-cast-drive" href={character.folder} target="_blank" rel="noopener noreferrer"><FolderOpen size={16}/> Abrir fotos de {character.name} en Drive</a>
          </div>
        </article>;
      })}
    </div>
    <p className="tld-cast-help"><Info size={16}/> Las fotos todavía no están vinculadas porque las carpetas están vacías. Las referencias generadas en Higgsfield no se consideran subidas a Drive hasta comprobar sus archivos. Los enlaces y las descripciones permanecen separados de OFF BRIEF.</p>
  </section>;
}
