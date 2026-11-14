import {useState} from 'react';
import {Camera, ExternalLink, FolderOpen, Image as ImageIcon, Info, UserRound} from 'lucide-react';
import './the-little-detours-characters.css';

// Verified 2026-11-14 via the private Google Drive master character folders.
// Keep all media in the original private Drive files; do not upload duplicates,
// publish source assets, or alter the archived OFF BRIEF series.
// Drive file-preview embeds require the owner to be signed in to Google.
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
    appearance:'Cabello castaño corto tipo bob, ojos color avellana, suéter azul claro y pantalón marfil de pierna ancha.',
    personality:'Creativa, curiosa y un poco distraída. Se entusiasma con los descubrimientos y suele verse envuelta en situaciones inesperadas.',
    continuity:'Respetar el corte bob castaño, ojos avellana, suéter azul claro, pantalón marfil, rostro y proporciones. Usar siempre las referencias oficiales.',
    folder:'https://drive.google.com/drive/folders/1U8zuohYX47jgyrO4iHNK7-VyqanRLRL0',
    shots:[
      {label:'Master · frente',fileName:'Nora_01_MASTER_Front.png',url:'https://drive.google.com/file/d/150Rcj3r5cFj9M7X32pKOjv2p8Y6wKNTo/view'},
      {label:'Tres cuartos',fileName:'Nora_02_ThreeQuarter.png',url:'https://drive.google.com/file/d/1HcgaOv02xyHwPB0uWgMWMbiDXw4TR7uU/view'},
      {label:'Vista posterior',fileName:'Nora_03_Back.png',url:'https://drive.google.com/file/d/1xQnKbovJmWXr4b9gKwAzYczU89rIPExe/view'},
      {label:'Expresión · sorpresa',fileName:'Nora_04_Surprised.png',url:'https://drive.google.com/file/d/1GI8_a6tb5Up_zVVQZ0WsXrUjlHsBoRuJ/view'},
      {label:'Más expresiones · opcional',fileName:'Pendiente de crear',url:''}
    ]
  },
  {
    name:'Eli',
    role:'Protagonista · El compañero tranquilo',
    appearance:'Cabello oscuro rizado y despeinado, sobrecamisa verde bosque, camiseta marfil lisa y pantalones oscuros.',
    personality:'Tranquilo, amable, reservado y un poco torpe. Su forma de reaccionar aporta ternura y humor visual a las aventuras.',
    continuity:'Conservar rostro y proporciones, rizos oscuros, sobrecamisa verde bosque, camiseta marfil y pantalones oscuros en todas las vistas.',
    folder:'https://drive.google.com/drive/folders/1YxOYvrVQFPP0pHQ8Y_AzX_Pr3GkhO047',
    shots:[
      {label:'Master · frente',fileName:'Eli_01_MASTER_Front.png',url:'https://drive.google.com/file/d/1DGGqcrQpb2vNZzOmY1O3jsf2gu7uiq_m/view'},
      {label:'Vista posterior',fileName:'Eli_02_Back.png',url:'https://drive.google.com/file/d/1hPH_L6KiHKINISj8kMhW8doAQfYin6oa/view'},
      {label:'Tres cuartos',fileName:'Pendiente de crear',url:''},
      {label:'Gestos y expresiones',fileName:'Pendiente de crear',url:''}
    ]
  },
  {
    name:'Pip',
    role:'Protagonista · El pequeño travieso',
    appearance:'Perrito muy pequeño de pelaje crema-dorado, exactamente una oreja marrón oscura y una dorada, con pañuelo rojo liso.',
    personality:'Juguetón y travieso, pero sus acciones tienen una razón. Sus movimientos y reacciones hacen avanzar los conflictos sin diálogo.',
    continuity:'Conservar tamaño pequeño, pelaje crema-dorado, una oreja marrón oscura y la otra dorada, el mismo pañuelo rojo y las proporciones originales.',
    folder:'https://drive.google.com/drive/folders/1i7ypLO5KuDjvLyP61Zzc0XTdpj9mH0sn',
    shots:[
      {label:'Master · frente',fileName:'Pip_01_MASTER_Front.png',url:'https://drive.google.com/file/d/1ct_QXvZIZbYsHrHoYUmeJNK2IBQ4yxF5/view'},
      {label:'Tres cuartos',fileName:'Pip_02_ThreeQuarter.png',url:'https://drive.google.com/file/d/1SM_jrfDZEnlJjiSQd0mdtsiDUBPl4eB2/view'},
      {label:'Vista posterior',fileName:'Pendiente de crear',url:''},
      {label:'Gestos y expresiones',fileName:'Pendiente de crear',url:''}
    ]
  }
];

function CharacterCard({character}: {character:Character}) {
  const shots=character.shots.filter(s=>Boolean(s.url));
  const [activeUrl,setActiveUrl]=useState(shots[0]?.url ?? '');
  const active=shots.find(s=>s.url===activeUrl) ?? shots[0];
  // Google Drive /view URLs are NOT image sources. Embed a signed-in Drive
  // preview instead, with the original file link as an explicit fallback.
  const previewSrc=active?.url.replace(/\/view(?:\?.*)?$/, '/preview') ?? '';

  return <article className="tld-cast-card">
    <div className="tld-cast-image">
      {previewSrc
        ? <iframe key={previewSrc} src={previewSrc} title={'Vista previa privada de '+character.name+' — '+active.label}
            loading="lazy" allow="fullscreen" referrerPolicy="no-referrer"/>
        : <div className="tld-cast-empty"><Camera size={28}/><strong>{character.name}</strong><small>Foto máster pendiente</small></div>}
    </div>
    <div className="tld-cast-info">
      <span className="tld-cast-role">{character.role}</span>
      <h4>{character.name}</h4>
      <p><strong>Apariencia:</strong> {character.appearance}</p>
      <p><strong>Personalidad:</strong> {character.personality}</p>
      <details className="tld-cast-continuity"><summary>Reglas de continuidad visual</summary><p>{character.continuity}</p></details>
      <div className="tld-cast-shots-head">
        <span><ImageIcon size={15}/> Fotografías individuales</span>
        <small>{shots.length} verificadas · {character.shots.length-shots.length} pendientes</small>
      </div>
      <div className="tld-cast-shots">{character.shots.map(shot=><div className="tld-cast-shot" key={shot.label}>
        <span><strong>{shot.label}</strong><small>{shot.url?shot.fileName:'Para crear después'}</small></span>
        {shot.url
          ? <button type="button" className={active?.url===shot.url?'selected':''}
              onClick={()=>setActiveUrl(shot.url)} aria-pressed={active?.url===shot.url}>
              Ver aquí
            </button>
          : <small>Pendiente</small>}
      </div>)}</div>
      {active?.url&&<a className="tld-active-original" href={active.url} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={15}/> Abrir fotografía original en Drive
      </a>}
      <a className="tld-cast-drive" href={character.folder} target="_blank" rel="noopener noreferrer">
        <FolderOpen size={16}/> Abrir carpeta de {character.name}
      </a>
    </div>
  </article>;
}

export default function TheLittleDetoursCharacters() {
  const linked=cast.reduce((n,character)=>n+character.shots.filter(s=>Boolean(s.url)).length,0);
  const pending=cast.reduce((n,character)=>n+character.shots.filter(s=>!s.url).length,0);
  return <section className="tld-cast-section" aria-labelledby="tld-cast-title">
    <div className="tld-cast-heading">
      <div>
        <span className="tle-yt-eyebrow"><UserRound size={16}/> PERSONAJES OFICIALES · BIBLIOTECA MÁSTER</span>
        <h3 id="tld-cast-title">Nora, Eli &amp; Pip</h3>
        <p>{linked} fotografías originales vinculadas desde Drive · {pending} vistas y expresiones para completar después.</p>
      </div>
      <a href="https://drive.google.com/drive/folders/1ltmct1l5vxn5aYtypelJ5RKP9ihDLax8" target="_blank" rel="noopener noreferrer" className="tld-open-master">
        <FolderOpen size={17}/> Abrir carpeta máster
      </a>
    </div>
    <div className="tld-cast-cards">{cast.map(character=><CharacterCard key={character.name} character={character}/>)}</div>
    <p className="tld-cast-help"><Info size={16}/>
      Las ocho fotografías son archivos individuales originales de Drive; no se copiaron ni se hicieron públicas.
      La vista previa usa Google Drive y puede pedir iniciar sesión; el enlace «Abrir fotografía original» siempre apunta al archivo correspondiente.
      Las vistas y expresiones faltantes quedan pendientes sin bloquear la producción en Google Flow.
    </p>
  </section>;
}
