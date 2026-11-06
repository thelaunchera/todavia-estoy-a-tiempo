import {useState} from 'react';
import {GOLDEN_GRID_CAROUSEL_ASSETS,GOLDEN_GRID_CAROUSEL_DRIVE,type GoldenGridCarouselAsset} from './golden-grid-carousel-assets';
import {SOVA_CAROUSEL_ASSETS,SOVA_CAROUSEL_DRIVE,type SovaCarouselAsset} from './sova-carousel-assets';
import {EDITORIAL_STICKER_ASSETS} from './editorial-sticker-assets';
import {STUDIO_SHAPES,studioShapeData,type StudioShape} from './studio-shapes';
import {BRANDING_ELEMENTS,brandingElementUrl,type BrandAsset} from '../../editor-core/branding-elements';
type Category='Formas'|'Asteriscos'|'Banners y cintas'|'Etiquetas'|'Papeles y washi'|'Acentos'|'Audio'|'Patrones'|'Papelería'|'Sellos'|'Ilustraciones'|'Packaging';
type Props={
  onGolden:(asset:GoldenGridCarouselAsset)=>void|Promise<void>;
  onSova:(asset:SovaCarouselAsset)=>void|Promise<void>;
  onEditorial:(asset:typeof EDITORIAL_STICKER_ASSETS[number])=>void|Promise<void>;
  onShape?:(shape:StudioShape)=>void|Promise<void>;
  onUniversal?:(asset:BrandAsset)=>void|Promise<void>;
  compact?:boolean;
  onlyEditorial?:boolean;
};
const control:React.CSSProperties={border:'1px solid #D5DCE1',borderRadius:11,padding:'9px 10px',background:'#fff',color:'#191919',fontSize:12};
const category=(name:string):Category=>{
 const n=name.toLowerCase();
 if(/aud[ií]fon|onda sonora|sonido/.test(n))return 'Audio';
 if(/asterisco|estrella|destello/.test(n))return 'Asteriscos';
 if(/cinta|banner|bander[ií]n/.test(n))return 'Banners y cintas';
 if(/etiqueta|cup[oó]n|marco|c[aá]psula/.test(n))return 'Etiquetas';
 if(/papel|washi/.test(n))return 'Papeles y washi';
 return 'Acentos';
};
const categories=['Todos','Patrones','Papelería','Sellos','Ilustraciones','Packaging','Formas','Asteriscos','Banners y cintas','Etiquetas','Papeles y washi','Acentos','Audio'] as const;
export default function BrandAssetLibrary({onGolden,onSova,onEditorial,onShape,onUniversal,compact=false,onlyEditorial=false}:Props){
 const [kind,setKind]=useState<(typeof categories)[number]>('Todos');
 const [search,setSearch]=useState('');
 const assets=[
  ...(!onlyEditorial?GOLDEN_GRID_CAROUSEL_ASSETS:[]).map(asset=>({key:'golden-'+asset.id,brand:'golden' as const,name:asset.name,category:category(asset.name),src:new URL('brand-kits/golden-grid/'+asset.file,document.baseURI).href,asset})),
  ...(!onlyEditorial?SOVA_CAROUSEL_ASSETS:[]).map(asset=>({key:'sova-'+asset.id,brand:'sova' as const,name:asset.name,category:category(asset.name),src:new URL('brand-kits/sova/'+asset.file,document.baseURI).href,asset})),
  ...EDITORIAL_STICKER_ASSETS.map(asset=>({key:'editorial-'+asset.id,brand:'editorial' as const,name:asset.name,category:asset.category as Category,src:new URL('brand-kits/editorial-stickers/'+asset.file,document.baseURI).href,asset})),
  ...(onUniversal?BRANDING_ELEMENTS:[]).map(asset=>({key:'universal-'+asset.id,brand:'universal' as const,name:asset.name,category:asset.category as Category,src:brandingElementUrl(asset),asset}))
 ];
 const filteredShapes=onShape&&(kind==='Todos'||kind==='Formas')?
   STUDIO_SHAPES.filter(a=>a.name.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))):[];
 const filtered=assets.filter(a=>(kind==='Todos'||a.category===kind)&&a.name.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
 return <div style={{display:'grid',gap:9}}>
  <input type="search" aria-label="Buscar elementos" placeholder="Buscar cintas, banners, asteriscos…" value={search} onChange={e=>setSearch(e.target.value)} style={{...control,minWidth:0,width:'100%',maxWidth:460,boxSizing:'border-box'}}/>
  {compact&&<div role="group" aria-label="Explorar categorías de elementos" style={{display:'flex',gap:6,overflowX:'auto',overscrollBehaviorX:'contain',paddingBottom:4}}>
   {([['Todos','▦'],['Patrones','▦'],['Papelería','▤'],['Sellos','◉'],['Ilustraciones','✎'],['Packaging','▱'],['Formas','◯'],['Asteriscos','✱'],['Banners y cintas','▰'],['Etiquetas','▱'],['Papeles y washi','▤'],['Acentos','✦'],['Audio','♫']] as const).map(([name,symbol])=><button key={name} type="button" aria-pressed={kind===name}
    onClick={()=>setKind(name)} style={{display:'grid',gap:5,placeItems:'center',flex:'0 0 86px',minWidth:86,minHeight:60,padding:'6px 3px',borderRadius:11,
      background:kind===name?'#F5E8A5':'#F0F2F3',border:'1px solid #d8e2e6',color:'#191919',fontFamily:'inherit'}}>
    <span aria-hidden="true" style={{fontSize:23,lineHeight:1}}>{symbol}</span><span style={{fontSize:10,fontWeight:750,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{name==='Banners y cintas'?'Banners':name==='Papeles y washi'?'Papeles':name}</span>
   </button>)}
  </div>}
  <div role="group" aria-label="Filtrar tipo de elemento" style={{display:compact?'none':'flex',gap:6,overflowX:'auto',padding:'0 0 5px'}}>
   {categories.map(c=><button key={c} type="button" aria-pressed={kind===c} onClick={()=>setKind(c)} style={{...control,flexShrink:0,whiteSpace:'nowrap',minHeight:42,fontWeight:kind===c?800:500,background:kind===c?'#F2D85B':'#fff'}}>{c}</button>)}
  </div>
  <div key={kind} className={compact?'studio-sticker-gallery studio-element-gallery':'studio-element-gallery'} aria-label="Galería de elementos individuales para colocar en el lienzo"
    style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fill,minmax(150px,1fr))',
      gridAutoRows:'max-content',alignContent:'start',gap:10,overflowY:'auto',padding:3}}>
   {filteredShapes.map(shape=><button type="button" key={'shape-'+shape.id} className="studio-element-card"
      aria-label={'Añadir forma '+shape.name} onClick={()=>void onShape?.(shape.id)}
      style={{...control,display:'grid',gridTemplateRows:'132px auto',minHeight:174,padding:8,minWidth:0,textAlign:'center'}}>
      <span className="studio-sticker-thumb" style={{display:'grid',placeItems:'center',height:132,background:'#f7f7f4',padding:10,borderRadius:10}}>
       <img src={studioShapeData(shape.id,shape.color)} alt={shape.name} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
      </span>
      <span className="studio-sticker-label" style={{fontSize:12,fontWeight:700,marginTop:7}}>{shape.name}</span>
     </button>)}
   {filtered.map(a=><button type="button" key={a.key} aria-label={'Añadir '+a.name+' al lienzo'}
     onClick={()=>{if(a.brand==='golden')void onGolden(a.asset);else if(a.brand==='sova')void onSova(a.asset);else if(a.brand==='universal')void onUniversal?.(a.asset);else void onEditorial(a.asset)}}
     className="studio-element-card"
     style={{...control,display:'grid',gridTemplateRows:'132px auto',alignContent:'start',
       padding:8,minWidth:0,minHeight:174,textAlign:'center',overflow:'hidden',
       gridColumn:compact&&(['Banners y cintas','Papeles y washi'].includes(a.category))?'span 2':undefined}}>
     <span className="studio-sticker-thumb" style={{display:'grid',placeItems:'center',width:'100%',height:132,
       borderRadius:10,background:'#F7F7F4',overflow:'hidden',padding:10,boxSizing:'border-box'}}>
       <img loading="lazy" src={a.src} alt={a.name} style={{width:'100%',height:'100%',maxHeight:'100%',maxWidth:'100%',objectFit:'contain',display:'block'}}/>
     </span>
     <span className="studio-sticker-label" style={{display:'block',fontSize:12,fontWeight:700,marginTop:7,lineHeight:1.3,overflowWrap:'anywhere'}}>{a.name}</span>
    </button>)}
   {filtered.length===0&&filteredShapes.length===0&&<p style={{fontSize:13}}>Sin resultados en esta categoría.</p>}
  </div>
  <small style={{color:'#66717A'}}>{filtered.length+filteredShapes.length} elementos disponibles · todos se pueden combinar con cualquier marca</small>
  {!compact&&<div style={{display:'flex',gap:13,flexWrap:'wrap',fontSize:12}}>
    <a href={GOLDEN_GRID_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Recursos Golden Grid en Drive</a>
    <a href={SOVA_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Recursos SOVA en Drive</a>
   </div>}
 </div>;
}
