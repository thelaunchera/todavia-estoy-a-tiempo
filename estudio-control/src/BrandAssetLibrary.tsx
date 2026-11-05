import {useState} from 'react';
import {GOLDEN_GRID_CAROUSEL_ASSETS,GOLDEN_GRID_CAROUSEL_DRIVE,type GoldenGridCarouselAsset} from './golden-grid-carousel-assets';
import {SOVA_CAROUSEL_ASSETS,SOVA_CAROUSEL_DRIVE,type SovaCarouselAsset} from './sova-carousel-assets';
import {EDITORIAL_STICKER_ASSETS} from './editorial-sticker-assets';
type Category='Asteriscos'|'Banners y cintas'|'Etiquetas'|'Papeles y washi'|'Acentos'|'Audio';
type Props={
  onGolden:(asset:GoldenGridCarouselAsset)=>void|Promise<void>;
  onSova:(asset:SovaCarouselAsset)=>void|Promise<void>;
  onEditorial:(asset:typeof EDITORIAL_STICKER_ASSETS[number])=>void|Promise<void>;
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
const categories=['Todos','Asteriscos','Banners y cintas','Etiquetas','Papeles y washi','Acentos','Audio'] as const;
export default function BrandAssetLibrary({onGolden,onSova,onEditorial,compact=false,onlyEditorial=false}:Props){
 const [kind,setKind]=useState<(typeof categories)[number]>('Todos');
 const [search,setSearch]=useState('');
 const assets=[
  ...(!onlyEditorial?GOLDEN_GRID_CAROUSEL_ASSETS:[]).map(asset=>({key:'golden-'+asset.id,brand:'golden' as const,name:asset.name,category:category(asset.name),src:new URL('brand-kits/golden-grid/'+asset.file,document.baseURI).href,asset})),
  ...(!onlyEditorial?SOVA_CAROUSEL_ASSETS:[]).map(asset=>({key:'sova-'+asset.id,brand:'sova' as const,name:asset.name,category:category(asset.name),src:new URL('brand-kits/sova/'+asset.file,document.baseURI).href,asset})),
  ...EDITORIAL_STICKER_ASSETS.map(asset=>({key:'editorial-'+asset.id,brand:'editorial' as const,name:asset.name,category:asset.category as Category,src:new URL('brand-kits/editorial-stickers/'+asset.file,document.baseURI).href,asset}))
 ];
 const filtered=assets.filter(a=>(kind==='Todos'||a.category===kind)&&a.name.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
 return <div style={{display:'grid',gap:9}}>
  <input type="search" aria-label="Buscar elementos" placeholder="Buscar cintas, banners, asteriscos…" value={search} onChange={e=>setSearch(e.target.value)} style={{...control,minWidth:0,width:'100%',maxWidth:460,boxSizing:'border-box'}}/>
  {compact&&<div role="group" aria-label="Explorar categorías de elementos" style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:5}}>
   {([['Todos','▦'],['Asteriscos','✱'],['Banners y cintas','▰'],['Etiquetas','▱'],['Acentos','✦']] as const).map(([name,symbol])=><button key={name} type="button" aria-pressed={kind===name}
    onClick={()=>setKind(name)} style={{display:'grid',gap:5,placeItems:'center',minWidth:0,minHeight:62,padding:'6px 2px',borderRadius:11,
      background:kind===name?'#F5E8A5':'#F0F2F3',border:'1px solid #d8e2e6',color:'#191919',fontFamily:'inherit'}}>
    <span aria-hidden="true" style={{fontSize:23,lineHeight:1}}>{symbol}</span><span style={{fontSize:10,fontWeight:750,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{name==='Banners y cintas'?'Banners':name}</span>
   </button>)}
  </div>}
  <div role="group" aria-label="Filtrar tipo de elemento" style={{display:compact?'none':'flex',gap:6,overflowX:'auto',padding:'0 0 5px'}}>
   {categories.map(c=><button key={c} type="button" aria-pressed={kind===c} onClick={()=>setKind(c)} style={{...control,flexShrink:0,whiteSpace:'nowrap',minHeight:42,fontWeight:kind===c?800:500,background:kind===c?'#F2D85B':'#fff'}}>{c}</button>)}
  </div>
  <div aria-label="Galería de stickers individuales para colocar en el lienzo" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax('+(compact?'95px':'125px')+',1fr))',gap:9,maxHeight:compact?160:300,overflowY:'auto',padding:3}}>
   {filtered.map(a=><button type="button" key={a.key} aria-label={'Añadir '+a.name+' al lienzo'} onClick={()=>{if(a.brand==='golden')void onGolden(a.asset);else if(a.brand==='sova')void onSova(a.asset);else void onEditorial(a.asset)}} style={{...control,padding:6,minWidth:0,textAlign:'center',overflow:'hidden'}}>
     <span style={{display:'grid',placeItems:'center',height:compact?88:100,borderRadius:8,backgroundColor:'#F0F1F2',backgroundImage:'linear-gradient(45deg,#e2e5e6 25%,transparent 25%),linear-gradient(-45deg,#e2e5e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e5e6 75%),linear-gradient(-45deg,transparent 75%,#e2e5e6 75%)',backgroundSize:'18px 18px',backgroundPosition:'0 0,0 9px,9px -9px,-9px 0'}}>
      <img loading="lazy" src={a.src} alt="" style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/>
     </span>
     <strong style={{display:'block',fontSize:11,marginTop:6,lineHeight:1.2}}>{a.name}</strong>
    </button>)}
   {filtered.length===0&&<p style={{fontSize:13}}>Sin resultados en esta categoría.</p>}
  </div>
  <small style={{color:'#66717A'}}>{filtered.length} elementos disponibles · todos se pueden combinar con cualquier marca</small>
  {!compact&&<div style={{display:'flex',gap:13,flexWrap:'wrap',fontSize:12}}>
    <a href={GOLDEN_GRID_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Recursos Golden Grid en Drive</a>
    <a href={SOVA_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Recursos SOVA en Drive</a>
   </div>}
 </div>;
}
