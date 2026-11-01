import React, {useState} from 'react';
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
 {id:'1TlNJhbCds3BiwDc5MUdyPHFZAZGbBBB5',es:'El espacio lo cambia todo.',en:'Room to feel something.',kEs:'LA NUEVA MIRADA',kEn:'A NEW PERSPECTIVE',subEs:'Luz, calma y una historia propia',subEn:'Light, calm and a point of view'},
 {id:'1Z23k4pYythR48z0zXr01Kj_VOQRS2v5-',es:'MENOS, PERO MEJOR.',en:'LESS. BUT BETTER.',kEs:'DECLARACIÓN / 02',kEn:'THE STATEMENT / 02',subEs:'La belleza de lo esencial',subEn:'The beauty of essentials'},
 {id:'1RpYhHz1nXAe2Hd5H3LYPw5zBJEJsb_4c',es:'Cada detalle cuenta.',en:'The little things matter.',kEs:'ESTUDIO DE TEXTURAS',kEn:'A TEXTURE STUDY',subEs:'Una pausa para mirar de cerca',subEn:'A closer look at the everyday'},
 {id:'16AGoD-nvjYBQdO5GvkI-W5q3PjfIoTCa',es:'Así se siente estar en casa.',en:'The feeling of home.',kEs:'VIDA COTIDIANA',kEn:'EVERYDAY LIVING',subEs:'El lugar donde pasan las cosas buenas',subEn:'Where the good things happen'},
 {id:'17geIi7iUYfYCdQOi_cMskFhid2erYIdk',es:'Orden que inspira.',en:'A little everyday magic.',kEs:'PEQUEÑOS RITUALES',kEn:'SMALL RITUALS',subEs:'Más espacio para disfrutar',subEn:'More room to enjoy'},
 {id:'17YR_MIQ-Qbe6wHqSbNBPadxU1CYp66Ib',es:'Dentro de lo extraordinario.',en:'Inside the extraordinary.',kEs:'NOTAS DE ESTILO',kEn:'NOTES ON STYLE',subEs:'Una perspectiva diferente',subEn:'An unexpected point of view'},
 {id:'1o3c0IWgI1XG1TKtlK7HG0tK7cQKuY7gK',es:'SIN EXCESOS.',en:'NO EXCESS.',kEs:'CONTRASTES',kEn:'HIGH CONTRAST',subEs:'Solo lo que importa',subEn:'Only what matters'},
 {id:'1z6DOLbvV6tE4ZGc67W2-rKOgiao_y5mB',es:'El lujo de la calma.',en:'The luxury of quiet.',kEs:'EDICIÓN SERENA',kEn:'THE QUIET EDIT',subEs:'Deja que el espacio respire',subEn:'Let the room breathe'},
 {id:'1h3NxqdI-jfUrNYw6lVbfmj3iy6Rf9FWh',es:'Un final que se recuerda.',en:'End on a beautiful note.',kEs:'EL ÚLTIMO CAPÍTULO',kEn:'THE FINAL CHAPTER',subEs:'Hay historias que se quedan',subEn:'Some moments stay with us'},
 {id:'1cHABVpf2gfnoJBIOyz2gtr9NGesOwptx',es:'EL COLOR DEL CAMBIO.',en:'A FRESH POINT OF VIEW.',kEs:'NUEVA TEMPORADA',kEn:'NEW SEASON',subEs:'Otra manera de empezar',subEn:'A different kind of beginning'},
 {id:'19y-3eNIkpqSHRyNEHUdfmTOzdbMSmc9B',es:'Casa, en primera página.',en:'Home, on the cover.',kEs:'VOLUMEN 01 / HOGAR',kEn:'VOL. 01 / HOME',subEs:'Ideas para vivir bonito',subEn:'Spaces worth slowing down for'},
 {id:'1f5q0FsrrLIwlg27P-Rv7Co8CZ16f3XoT',es:'Enmarca lo cotidiano.',en:'Frame the everyday.',kEs:'ARQUITECTURA SUAVE',kEn:'SOFT ARCHITECTURE',subEs:'Otra forma de mirar',subEn:'See familiar things differently'},
 {id:'1nX-JAx56c3uMPdI7SKcDslPjT9ZOBwhr',es:'La luz es protagonista.',en:'Let the light in.',kEs:'EN FOCO',kEn:'IN FOCUS',subEs:'El arte de hacer espacio',subEn:'The art of opening up'},
 {id:'1iBFxt-K3XdXkUD2cCChcsqmSoxXPPNxR',es:'Simplemente impecable.',en:'Beautifully considered.',kEs:'OBJETOS Y FORMAS',kEn:'OBJECTS & FORMS',subEs:'Diseñado alrededor de lo real',subEn:'Designed around real life'},
 {id:'1dSrlzSC0f9jf1GF4WU49E7lQxE6mUz8C',es:'HACERLO DIFERENTE.',en:'MAKE IT DIFFERENT.',kEs:'IDEAS EN GRANDE',kEn:'IDEAS AT SCALE',subEs:'Sin pedir permiso',subEn:'No permission needed'},
 {id:'1J7Wu3XWsJ3PBO77jC2-Xw9x50av9kzGV',es:'Hay belleza en la pausa.',en:'Beauty in the pause.',kEs:'ESPACIO NEGATIVO',kEn:'NEGATIVE SPACE',subEs:'Lo que no se ve también habla',subEn:'What you leave out matters'},
 {id:'16NNCKEFEzUpaKwFTcHCVProjpCu-mbfL',es:'Perspectivas que sorprenden.',en:'An unexpected angle.',kEs:'OTRA DIRECCIÓN',kEn:'ANOTHER DIRECTION',subEs:'Un recorrido visual',subEn:'A visual journey'},
 {id:'1kpLBLpYXmZ__HBlo-Je3PgFdoiNCYRL9',es:'Una elegancia tranquila.',en:'Quietly exceptional.',kEs:'UN MOMENTO LENTO',kEn:'A SLOWER MOMENT',subEs:'Lujo sin ruido',subEn:'Luxury without the noise'},
 {id:'1AwKWUrKrc_I4x8T54f62becEpu7U54cF',es:'Rompe con lo esperado.',en:'Break the expected.',kEs:'COLLAGE EDITORIAL',kEn:'EDITORIAL COLLAGE',subEs:'Tu creatividad, a tu manera',subEn:'Creativity on your terms'},
 {id:'1ZBFafrZy1icZ75ZF666ST25zd-srtpU0',es:'Lo mejor empieza aquí.',en:'Something good starts here.',kEs:'UNA HISTORIA ABIERTA',kEn:'AN OPEN STORY',subEs:'Lo que viene también importa',subEn:'The next chapter is yours'}
] as const;

const sourcePhoto=(index:number)=>'https://drive.google.com/thumbnail?id='+examples[index].id+'&sz=w1200';
const boxPosition=(v:[number,number,number,number]):React.CSSProperties=>({
 left:(v[0]*100)+'%', top:(v[1]*100)+'%', width:(v[2]*100)+'%', height:(v[3]*100)+'%'
});

function Preview({layout,index,brand,big=false}:{layout:Layout;index:number;brand:Props['brand'];big?:boolean}){
 const example=examples[index];
 const colors=brandPalette(brand);
 const accent=colors[index%Math.max(colors.length,1)]||brand.color||'#B7D6DF';
 const isEnglish=brand.language==='English';
 const isDark=layout.dark||layout.shape==='dark';
 const paper=isDark?'#1B2226':brand.background||'#FAF8F3';
 const ink=isDark?'#FFFFFF':'#1A2829';
 const style={'--fg-accent':accent,backgroundColor:paper,color:ink} as React.CSSProperties;
 return <div className={'fg-preview fg-'+layout.shape+' fg-variant-'+index+(big?' fg-big':'')} style={style} aria-label={'Vista previa editorial de '+layout.name}>
  <div className="fg-artwork" aria-hidden="true"><span/><span/><span/></div>
  <div className="fg-preview-photo" style={boxPosition(layout.image)}>
   <img loading={big?'eager':'lazy'} decoding="async" src={sourcePhoto(index)} alt="" onError={event=>{event.currentTarget.style.opacity='0'}}/>
  </div>
  <div className="fg-preview-copy" style={{...boxPosition(layout.type),textAlign:layout.align||'left'}}>
   <span className="fg-overline">{isEnglish?example.kEn:example.kEs}</span>
   <strong>{isEnglish?example.en:example.es}</strong>
   <small>{isEnglish?example.subEn:example.subEs}</small>
  </div>
  <span className="fg-brandline">{brand.name||'TU MARCA'}</span>
  <span className="fg-number">{String(index+1).padStart(2,'0')} / 20</span>
 </div>;
}

export default function FormatGallery({brand,onChoose,onUpload}:Props){
 const [filter,setFilter]=useState<Filter>('all');
 const [selected,setSelected]=useState<number|null>(null);
 const filtered=LAYOUTS.map((layout,index)=>({layout,index})).filter(x=>filter==='all'||groups[x.layout.name]?.includes(filter));
 const close=()=>setSelected(null);
 return <section className="fg-root">
  <div className="fg-head"><div><span className="eyebrow">BIBLIOTECA CREATIVA · 20 DIRECCIONES EDITORIALES</span><h1>20 formas de contar <em>tu historia.</em></h1><p>Explora composiciones diferentes, inspiradas en el diseño editorial. Elige una y personalízala dentro de tu editor.</p></div><button type="button" className="btn ghost" onClick={onUpload}><ImagePlus size={17}/> Subir mis fotos</button></div>
  <div className="fg-note"><Images size={19}/><span>Las 20 vistas usan fotografías de interiores, sin fotos personales. Tus imágenes solo se añaden cuando tú las eliges en el editor.</span></div>
  <div className="fg-filterbar" role="group" aria-label="Filtrar formatos">{(Object.keys(groupNames) as Filter[]).map(f=><button type="button" key={f} className={f===filter?'active':''} aria-pressed={f===filter} onClick={()=>{setFilter(f);close()}}>{groupNames[f]}</button>)}</div>
  <div className="fg-layout"><div className="fg-cards">{filtered.map(({layout,index})=><article key={layout.name} className={'fg-card '+(selected===index?'selected':'')}>
   <button type="button" className="fg-imagebutton" onClick={()=>setSelected(index)} aria-label={'Ver '+layout.name}><Preview layout={layout} index={index} brand={brand}/></button>
   <div className="fg-card-foot"><div><small>{String(index+1).padStart(2,'0')} / 20</small><strong>{layout.name}</strong><span>{groups[layout.name]?.slice(0,2).map(g=>groupNames[g]).join(' · ')||'Editorial'}</span></div>
    <button type="button" className="fg-use" onClick={()=>onChoose(layout.name)} aria-label={'Usar formato '+layout.name}>Usar</button>
   </div>
  </article>)}</div>
   {selected!==null&&<><button type="button" className="fg-sheet-backdrop" aria-label="Cerrar vista previa" onClick={close}/><aside className="fg-detail" aria-label={'Formato '+LAYOUTS[selected].name}>
    <div className="fg-detail-top"><span className="eyebrow">VISTA DEL FORMATO</span><button type="button" onClick={close} aria-label="Cerrar vista"><X size={19}/></button></div>
    <h2>{LAYOUTS[selected].name}</h2>
    <Preview big layout={LAYOUTS[selected]} index={selected} brand={brand}/>
    <p>Selecciona este formato para editar fotografías, textos, colores y posiciones. La vista es un ejemplo de composición.</p>
    <button type="button" className="btn dark" onClick={()=>onChoose(LAYOUTS[selected].name)}><Check size={16}/> Usar este formato</button>
   </aside></>}
  </div>
 </section>;
}
