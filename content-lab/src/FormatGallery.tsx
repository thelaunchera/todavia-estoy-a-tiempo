import React, {useEffect, useRef, useState} from 'react';
import {Images, Check, ImagePlus, X} from 'lucide-react';
import {LAYOUTS, type Layout} from './GridComposer';
import {brandPalette} from './BrandIdentity';
import {type LibraryAsset} from './MediaAsset';
import './FormatGallery.css';

type Props = {
 brand:{name:string;color:string;background:string;secondaryColor?:string;additionalColors?:string[];language:string};
 assets:LibraryAsset[];
 images:Record<string,string>;
 onChoose:(format:string)=>void;
 onUpload:()=>void;
 locale?:'es'|'en';
};
type Filter='all'|'portrait'|'product'|'type'|'minimal'|'story';
const groupNames:Record<Filter,string>={
 all:'Todos',portrait:'Fotografía',product:'Detalles',type:'Tipografía',minimal:'Espacios',story:'Historias'
};
const groups:Record<string,Filter[]>={
 'Editorial Hero':['portrait','story'],
 'Bold Typography':['type','story'],
 'Macro Texture':['product'],
 'Lifestyle Scene':['portrait','product','story'],
 'Playful Props':['product'],
 'Hands-on Editorial':['portrait','product','story'],
 'High Contrast':['type','portrait'],
 'Minimal Premium':['minimal','product'],
 'Campaign Finale':['story','portrait'],
 'Color Block':['type'],
 'Magazine Cover':['portrait','type'],
 'Arch Frame':['portrait','minimal'],
 'Product Spotlight':['product'],
 'Floating Product':['product'],
 'Typography Poster':['type'],
 'Negative Space':['minimal'],
 'Diagonal Composition':['type','story'],
 'Soft Luxury':['minimal','portrait'],
 'Graphic Cutout':['portrait','product'],
 'Story Card':['story','minimal']
};

/*
 * Independent, real residential interior photos from the publicly readable
 * Residential Cleaning Photo Pack in Drive. These are NOT personal portraits,
 * nor do they depend on the brand's uploaded photos.
 * Keep this array in precisely the same order as LAYOUTS in GridComposer.ts.
 * Source images are served as Google Drive thumbnails (the files are shared
 * with "anyone / reader"); no original file or editor format is changed.
 */
const examples=[
 {id:'1TlNJhbCds3BiwDc5MUdyPHFZAZGbBBB5',es:'Casa en calma.',en:'A quieter home.',kEs:'HOGAR / 01',kEn:'HOME / 01',subEs:'Luz natural, nuevas posibilidades',subEn:'Light, space, perspective'},
 {id:'1Z23k4pYythR48z0zXr01Kj_VOQRS2v5-',es:'MENOS RUIDO.',en:'LESS NOISE.',kEs:'UN MANIFIESTO',kEn:'A STATEMENT',subEs:'La fuerza de lo esencial',subEn:'Only what matters'},
 {id:'1RpYhHz1nXAe2Hd5H3LYPw5zBJEJsb_4c',es:'En cada detalle.',en:'All in the details.',kEs:'ESTUDIO DE TEXTURAS',kEn:'TEXTURE STUDY',subEs:'Materiales y luz real',subEn:'Tactile, true to life'},
 {id:'16AGoD-nvjYBQdO5GvkI-W5q3PjfIoTCa',es:'Aquí sucede la vida.',en:'Life happens here.',kEs:'HABITAR / 04',kEn:'LIVING / 04',subEs:'Espacios para disfrutar',subEn:'Made for everyday living'},
 {id:'17geIi7iUYfYCdQOi_cMskFhid2erYIdk',es:'Rituales de domingo.',en:'Sunday rituals.',kEs:'PEQUEÑOS RITUALES',kEn:'SMALL RITUALS',subEs:'Orden y bienestar',subEn:'Make room for joy'},
 {id:'17YR_MIQ-Qbe6wHqSbNBPadxU1CYp66Ib',es:'Otra mirada.',en:'A new perspective.',kEs:'NOTAS DE ESTILO',kEn:'STYLE NOTES',subEs:'El diseño está en lo simple',subEn:'Simple is thoughtful'},
 {id:'1o3c0IWgI1XG1TKtlK7HG0tK7cQKuY7gK',es:'LIMPIO. CLARO.',en:'CLEAN. CLEAR.',kEs:'ALTO CONTRASTE',kEn:'HIGH CONTRAST',subEs:'Cada superficie importa',subEn:'Every surface matters'},
 {id:'1z6DOLbvV6tE4ZGc67W2-rKOgiao_y5mB',es:'La belleza de parar.',en:'The quiet details.',kEs:'EDICIÓN SERENA',kEn:'THE QUIET EDIT',subEs:'Calma en cada rincón',subEn:'Comfort in every corner'},
 {id:'1h3NxqdI-jfUrNYw6lVbfmj3iy6Rf9FWh',es:'Una nueva etapa.',en:'A new chapter.',kEs:'CAPÍTULO FINAL',kEn:'THE FINAL CHAPTER',subEs:'De principio a fin',subEn:'From the beginning'},
 {id:'1cHABVpf2gfnoJBIOyz2gtr9NGesOwptx',es:'HOGAR, RENOVADO.',en:'HOME, RENEWED.',kEs:'NUEVA TEMPORADA',kEn:'NEW SEASON',subEs:'Otra forma de entrar',subEn:'A warmer welcome'},
 {id:'19y-3eNIkpqSHRyNEHUdfmTOzdbMSmc9B',es:'La edición hogar.',en:'The home edit.',kEs:'REVISTA / 01',kEn:'JOURNAL / 01',subEs:'Lugares con personalidad',subEn:'Spaces worth exploring'},
 {id:'1f5q0FsrrLIwlg27P-Rv7Co8CZ16f3XoT',es:'Líneas suaves.',en:'Soft lines.',kEs:'ARQUITECTURA INTERIOR',kEn:'INTERIOR NOTES',subEs:'Arcos, luz, silencio',subEn:'Curves and calm'},
 {id:'1nX-JAx56c3uMPdI7SKcDslPjT9ZOBwhr',es:'Deja entrar la luz.',en:'Let the light in.',kEs:'EN FOCO',kEn:'IN FOCUS',subEs:'Un rincón a la vez',subEn:'One room at a time'},
 {id:'1iBFxt-K3XdXkUD2cCChcsqmSoxXPPNxR',es:'Detalles que importan.',en:'Small things matter.',kEs:'OBJETOS Y FORMAS',kEn:'OBJECTS & FORMS',subEs:'Todo tiene su lugar',subEn:'Thoughtfully arranged'},
 {id:'1dSrlzSC0f9jf1GF4WU49E7lQxE6mUz8C',es:'HAZLO DIFERENTE.',en:'MAKE IT DIFFERENT.',kEs:'DISEÑO EN GRANDE',kEn:'BIG DESIGN',subEs:'Una idea que destaca',subEn:'Make an impression'},
 {id:'1J7Wu3XWsJ3PBO77jC2-Xw9x50av9kzGV',es:'Menos es más.',en:'Space to breathe.',kEs:'ESPACIO NEGATIVO',kEn:'NEGATIVE SPACE',subEs:'El lujo de lo simple',subEn:'A little less, beautifully'},
 {id:'16NNCKEFEzUpaKwFTcHCVProjpCu-mbfL',es:'Nueva perspectiva.',en:'A fresh angle.',kEs:'OTRO PUNTO DE VISTA',kEn:'ANOTHER VIEW',subEs:'Cambia la mirada',subEn:'Notice the difference'},
 {id:'1kpLBLpYXmZ__HBlo-Je3PgFdoiNCYRL9',es:'Calma que se nota.',en:'Quietly beautiful.',kEs:'EDICIÓN LENTA',kEn:'THE SLOW EDIT',subEs:'Sin esfuerzo, sin ruido',subEn:'Subtle by design'},
 {id:'1AwKWUrKrc_I4x8T54f62becEpu7U54cF',es:'Mira más cerca.',en:'Look closer.',kEs:'COMPOSICIÓN EDITORIAL',kEn:'EDITORIAL STUDY',subEs:'Formas que conectan',subEn:'Details with character'},
 {id:'1ZBFafrZy1icZ75ZF666ST25zd-srtpU0',es:'Así empieza todo.',en:'It starts here.',kEs:'HISTORIAS DE CASA',kEn:'HOME STORIES',subEs:'Una historia por descubrir',subEn:'The beginning of more'}
] as const;

const sourcePhoto=(index:number)=>'https://drive.google.com/thumbnail?id='+examples[index].id+'&sz=w1200';
const boxPosition=(v:[number,number,number,number]):React.CSSProperties=>({
 left:(v[0]*100)+'%', top:(v[1]*100)+'%', width:(v[2]*100)+'%', height:(v[3]*100)+'%'
});

const sampleCredits=[
 'STUDIO 01','FORM / 02','TEXTURES / 03','LIVING / 04','EVERYDAY / 05',
 'DETAIL / 06','CONTRAST / 07','PAUSE / 08','CHAPTER / 09','NEW SEASON / 10',
 'JOURNAL / 11','ARCH / 12','LIGHT / 13','FORMS / 14','STATEMENT / 15',
 'SPACE / 16','ANGLE / 17','QUIET / 18','COMPOSITION / 19','STORY / 20'
] as const;

// Measurements are taken from the rendered card, not guessed from a desktop viewport.
// Fit lettering inside its own safe text area when iPhone / language / preview size changes.
function Preview({layout,index,big=false,locale='es'}:{layout:Layout;index:number;big?:boolean;locale?:'es'|'en'}){
 const example=examples[index];
 const copyRef=useRef<HTMLDivElement>(null);
 const dark=Boolean(layout.dark||layout.shape==='dark');
 useEffect(()=>{
  const wrapper=copyRef.current,headline=wrapper?.querySelector('strong');
  if(!wrapper||!headline)return;
  const fit=()=>{
   headline.style.fontSize='';
   const initial=parseFloat(getComputedStyle(headline).fontSize)||20;
   const kicker=wrapper.querySelector('.fg-overline') as HTMLElement|null;
   const subtitle=wrapper.querySelector('small');
   const available=Math.max(22,wrapper.clientHeight-(kicker?.offsetHeight||0)-(subtitle?.offsetHeight||0)-14);
   let font=initial;
   while(font>10.5&&(headline.scrollHeight>available+1||headline.scrollWidth>wrapper.clientWidth+1)){
    font-=.65;headline.style.fontSize=font+'px';
   }
  };
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;
  observer?.observe(wrapper);
  const frame=requestAnimationFrame(fit);
  if(document.fonts?.ready)void document.fonts.ready.then(fit);
  return()=>{cancelAnimationFrame(frame);observer?.disconnect()};
 },[index,big,locale]);
 const ink=dark?'#FFFFFF':'#1D292B';
 const style={'--fg-accent':'#BED8E9',color:ink} as React.CSSProperties;
 return <div className={'fg-preview fg-'+layout.shape+' fg-variant-'+index+(big?' fg-big':'')}
   style={style} aria-label={(locale==='es'?'Composición editorial ':'Editorial composition ')+layout.name}>
  <div className="fg-artwork" aria-hidden="true"><span/><span/><span/></div>
  <div className="fg-preview-photo" style={boxPosition(layout.image)}>
   <img loading={big?'eager':'lazy'} decoding="async" src={sourcePhoto(index)} alt="" onError={event=>{event.currentTarget.style.opacity='0'}}/>
  </div>
  <div ref={copyRef} className="fg-preview-copy" style={{...boxPosition(layout.type),textAlign:layout.align||'left'}}>
   <span className="fg-overline">{locale==='es'?example.kEs:example.kEn}</span>
   <strong>{locale==='es'?example.es:example.en}</strong>
   <small>{locale==='es'?example.subEs:example.subEn}</small>
  </div>
  <span className="fg-brandline">{sampleCredits[index]}</span>
  <span className="fg-number">{String(index+1).padStart(2,'0')} / 20</span>
 </div>;
}

export default function FormatGallery({brand,onChoose,onUpload,locale='es'}:Props){
 const en=locale==='en';
 const enGroups:Record<Filter,string>={all:'All',portrait:'Photography',product:'Details',type:'Typography',minimal:'Spaces',story:'Stories'};
 const groupLabel=(id:Filter)=>en?enGroups[id]:groupNames[id];
 const [filter,setFilter]=useState<Filter>('all');
 const [selected,setSelected]=useState<number|null>(null);
 const filtered=LAYOUTS.map((layout,index)=>({layout,index})).filter(x=>filter==='all'||groups[x.layout.name]?.includes(filter));
 const close=()=>setSelected(null);
 return <section className="fg-root">
  <div className="fg-head"><div><span className="eyebrow">{en?'CREATIVE LIBRARY · 20 EDITORIAL DIRECTIONS':'BIBLIOTECA CREATIVA · 20 DIRECCIONES EDITORIALES'}</span><h1>{en?'20 ways to tell ':'20 formas de contar '}<em>{en?'your story.':'tu historia.'}</em></h1><p>{en?'Explore distinct editorial compositions. Choose one and customize it in your editor.':'Explora composiciones editoriales diferentes. Elige una y personalízala dentro de tu editor.'}</p></div><button type="button" className="btn ghost" onClick={onUpload}><ImagePlus size={17}/> {en?'Upload photos':'Subir mis fotos'}</button></div>
  <div className="fg-note"><Images size={19}/><span>{en?'These 20 examples feature home interiors, not personal photos. Your images are only added when you choose them in the editor.':'Las 20 vistas usan fotografías de interiores, sin fotos personales. Tus imágenes solo se añaden cuando tú las eliges en el editor.'}</span></div>
  <div className="fg-filterbar" role="group" aria-label={en?'Filter formats':'Filtrar formatos'}>{(Object.keys(groupNames) as Filter[]).map(f=><button type="button" key={f} className={f===filter?'active':''} aria-pressed={f===filter} onClick={()=>{setFilter(f);close()}}>{groupLabel(f)}</button>)}</div>
  <div className="fg-layout"><div className="fg-cards">{filtered.map(({layout,index})=><article key={layout.name} className={'fg-card '+(selected===index?'selected':'')}>
   <button type="button" className="fg-imagebutton" onClick={()=>setSelected(index)} aria-label={(en?'View ':'Ver ')+layout.name}><Preview layout={layout} index={index} locale={locale}/></button>
   <div className="fg-card-foot"><div><small>{String(index+1).padStart(2,'0')} / 20</small><strong>{layout.name}</strong><span>{groups[layout.name]?.slice(0,2).map(g=>groupLabel(g)).join(' · ')||'Editorial'}</span></div>
    <button type="button" className="fg-use" onClick={()=>onChoose(layout.name)} aria-label={(en?'Use format ':'Usar formato ')+layout.name}>{en?'Use':'Usar'}</button>
   </div>
  </article>)}</div>
   {selected!==null&&<><button type="button" className="fg-sheet-backdrop" aria-label={en?'Close preview':'Cerrar vista previa'} onClick={close}/><aside className="fg-detail" aria-label={(en?'Format ':'Formato ')+LAYOUTS[selected].name}>
    <div className="fg-detail-top"><span className="eyebrow">{en?'FORMAT PREVIEW':'VISTA DEL FORMATO'}</span><button type="button" onClick={close} aria-label={en?'Close preview':'Cerrar vista'}><X size={19}/></button></div>
    <h2>{LAYOUTS[selected].name}</h2>
    <Preview big layout={LAYOUTS[selected]} index={selected} locale={locale}/>
    <p>{en?'Choose this format to edit images, text, colors and positions. This is a sample layout.':'Selecciona este formato para editar fotografías, textos, colores y posiciones. La vista es un ejemplo de composición.'}</p>
    <button type="button" className="btn dark" onClick={()=>onChoose(LAYOUTS[selected].name)}><Check size={16}/> {en?'Use this format':'Usar este formato'}</button>
   </aside></>}
  </div>
 </section>;
}
