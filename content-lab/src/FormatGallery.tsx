import React,{useState} from 'react';
import {Images,ArrowRight,Check,LayoutGrid,ImagePlus} from 'lucide-react';
import {LAYOUTS,type Layout} from './GridComposer';
import {brandPalette} from './BrandIdentity';
import {assetCategory,type LibraryAsset} from './MediaAsset';
import './FormatGallery.css';
type Props={brand:{name:string;color:string;background:string;secondaryColor?:string;additionalColors?:string[];language:string};
 assets:LibraryAsset[];images:Record<string,string>;onChoose:(format:string)=>void;onUpload:()=>void};
type Filter='all'|'portrait'|'product'|'type'|'minimal'|'story';
const groupNames:Record<Filter,string>={all:'Todos',portrait:'Retratos',product:'Productos',type:'Tipografía',minimal:'Minimal',story:'Storytelling'};
const groups:Record<string,Filter[]>={
 'Editorial Hero':['portrait','story'],'Bold Typography':['type','story'],'Macro Texture':['product'],'Lifestyle Scene':['portrait','product','story'],'Playful Props':['product'],'Hands-on Editorial':['portrait','product','story'],'High Contrast':['type','portrait'],'Minimal Premium':['minimal','product'],'Campaign Finale':['story','portrait'],'Color Block':['type'],'Magazine Cover':['portrait','type'],'Arch Frame':['portrait','minimal'],'Product Spotlight':['product'],'Floating Product':['product'],'Typography Poster':['type'],'Negative Space':['minimal'],'Diagonal Composition':['type','story'],'Soft Luxury':['minimal','portrait'],'Graphic Cutout':['portrait','product'],'Story Card':['story','minimal']
};
const photos=['/assets/clase-retrato-laptop-real-2026.jpg','/assets/productos/editorial/diario-carta-20261027.jpg','/assets/clase-mostrar-web-2026.webp'];
const examples=['Una idea que conecta','Menos ruido. Más intención.','La diferencia está en los detalles.','Tu marca tiene una historia','Hazlo sentir real'];
function Preview({layout,index,photo,brand,big=false}:{layout:Layout;index:number;photo:string;brand:Props['brand'];big?:boolean}){
 const colors=brandPalette(brand),accent=colors[index%Math.max(colors.length,1)]||brand.color;
 const isDark=layout.dark||layout.shape==='dark';
 const paper=isDark?'#191F25':brand.background;
 const ink=isDark?'#FFFFFF':'#1E2F33';
 const formatPos=(v:[number,number,number,number])=>({left:(v[0]*100)+'%',top:(v[1]*100)+'%',width:(v[2]*100)+'%',height:(v[3]*100)+'%'});
 const title=brand.language==='English'?['A better way forward','A little more intentional','Made for real life','Every detail matters','The story starts here'][index%5]:examples[index%5];
 return <div className={'fg-preview fg-'+layout.shape+(big?' fg-big':'')} style={{backgroundColor:paper,color:ink,'--fg-accent':accent} as React.CSSProperties} aria-label={'Vista de '+layout.name}>
   <span className="fg-outline"/>
   <div className="fg-preview-photo" style={formatPos(layout.image)}><img src={photo} alt="Fotografía real de ejemplo"/></div>
   <div className="fg-preview-copy" style={{...formatPos(layout.type),textAlign:layout.align||'left'}}>
    <span className="fg-overline">{brand.name||'MY BRAND'}</span>
    <strong>{title}</strong>
    <small>{brand.language==='English'?'Your brand, your perspective.':'Una voz propia. Una idea clara.'}</small>
   </div>
   <span className="fg-number">0{index%9+1} — 20</span>
 </div>
}
export default function FormatGallery({brand,assets,images,onChoose,onUpload}:Props){
 const [filter,setFilter]=useState<Filter>('all'),[selected,setSelected]=useState<number|null>(null);
 const ownPhotos=assets.filter(a=>['original','generated','screenshot'].includes(assetCategory(a))).map(a=>images[a.id]).filter(Boolean);
 const photoFor=(i:number)=>ownPhotos.length?ownPhotos[i%ownPhotos.length]:photos[i%photos.length];
 const filtered=LAYOUTS.map((layout,index)=>({layout,index})).filter(x=>filter==='all'||groups[x.layout.name]?.includes(filter));
 return <section className="fg-root">
  <div className="fg-head"><div><span className="eyebrow">CREATIVE LIBRARY · REAL PHOTO EXAMPLES</span><h1>20 formas de contar <em>tu historia.</em></h1><p>Previews con fotografía, texto y composición. Cada formato respeta los colores de tu Brand Kit. Elige uno y úsalo en tu grid.</p></div><button className="btn ghost" onClick={onUpload}><ImagePlus size={17}/> Subir mis fotos</button></div>
  <div className="fg-note"><Images size={20}/><span>{ownPhotos.length?'Estos ejemplos usan tus fotografías de esta marca. No se modifican los originales.':'Ejemplos visuales con fotografías de demostración. Sube tus imágenes para previsualizar diseños con tus propias fotos.'}</span></div>
  <div className="fg-filterbar" role="group" aria-label="Filtrar formatos">{(Object.keys(groupNames) as Filter[]).map(f=><button type="button" key={f} className={f===filter?'active':''} aria-pressed={f===filter} onClick={()=>{setFilter(f);setSelected(null)}}>{groupNames[f]}</button>)}</div>
  <div className="fg-layout"><div className="fg-cards">{filtered.map(({layout,index})=><article key={layout.name} className={'fg-card '+(selected===index?'selected':'')}>
    <button type="button" className="fg-imagebutton" onClick={()=>setSelected(index)} aria-label={'Ver '+layout.name}><Preview layout={layout} index={index} photo={photoFor(index)} brand={brand}/></button>
    <div className="fg-card-foot"><div><small>{String(index+1).padStart(2,'0')} / 20</small><strong>{layout.name}</strong><span>{groups[layout.name]?.slice(0,2).map(g=>groupNames[g]).join(' · ')||'Editorial'}</span></div>
      <button type="button" onClick={()=>onChoose(layout.name)} aria-label={'Usar formato '+layout.name}><ArrowRight size={19}/></button>
    </div>
  </article>)}</div>
   {selected!==null&&<aside className="fg-detail"><div><span className="eyebrow">FORMATO SELECCIONADO</span><button type="button" onClick={()=>setSelected(null)} aria-label="Cerrar vista">×</button></div><h2>{LAYOUTS[selected].name}</h2><Preview big layout={LAYOUTS[selected]} index={selected} photo={photoFor(selected)} brand={brand}/><p>La composición se aplicará a tu primera publicación del Brand Grid. Puedes cambiar títulos, fotografía y colores después.</p><button className="btn dark" onClick={()=>onChoose(LAYOUTS[selected].name)}><Check size={16}/> Usar este formato</button></aside>}
  </div>
 </section>
}
