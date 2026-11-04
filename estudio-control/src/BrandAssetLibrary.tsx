import {useState} from 'react';
import {GOLDEN_GRID_CAROUSEL_ASSETS,GOLDEN_GRID_CAROUSEL_DRIVE,type GoldenGridCarouselAsset} from './golden-grid-carousel-assets';
import {SOVA_CAROUSEL_ASSETS,SOVA_CAROUSEL_DRIVE,type SovaCarouselAsset} from './sova-carousel-assets';

type Props={
  onGolden:(asset:GoldenGridCarouselAsset)=>void|Promise<void>;
  onSova:(asset:SovaCarouselAsset)=>void|Promise<void>;
  compact?:boolean;
};
const control:React.CSSProperties={border:'1px solid #D5DCE1',borderRadius:11,padding:'9px 10px',background:'#fff',color:'#191919',fontSize:12};
const category=(name:string)=>/cinta/i.test(name)?'cintas':/banner|cupón|etiqueta/i.test(name)?'banners':'detalles';

export default function BrandAssetLibrary({onGolden,onSova,compact=false}:Props){
 const [brand,setBrand]=useState<'todos'|'golden'|'sova'>('todos');
 const [kind,setKind]=useState<'todos'|'cintas'|'banners'|'detalles'>('todos');
 const [search,setSearch]=useState('');
 const assets=[
  ...GOLDEN_GRID_CAROUSEL_ASSETS.map(asset=>({key:'golden-'+asset.id,brand:'golden' as const,name:asset.name,src:new URL('brand-kits/golden-grid/'+asset.file,document.baseURI).href,asset})),
  ...SOVA_CAROUSEL_ASSETS.map(asset=>({key:'sova-'+asset.id,brand:'sova' as const,name:asset.name,src:new URL('brand-kits/sova/'+asset.file,document.baseURI).href,asset})),
 ];
 const filtered=assets.filter(a=>(brand==='todos'||a.brand===brand)&&(kind==='todos'||category(a.name)===kind)&&a.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
 return <div style={{display:'grid',gap:9}}>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <input type="search" aria-label="Buscar elementos" placeholder="Buscar cintas, banners…" value={search} onChange={e=>setSearch(e.target.value)} style={{...control,minWidth:0,flex:'1 1 150px',maxWidth:340}}/>
   <select value={brand} onChange={e=>setBrand(e.target.value as typeof brand)} aria-label="Filtrar elementos por marca" style={control}>
    <option value="todos">Todas las marcas</option><option value="golden">Golden Grid</option><option value="sova">SOVA</option>
   </select>
  </div>
  <div role="group" aria-label="Filtrar tipo de elemento" style={{display:'flex',gap:6,overflowX:'auto',padding:'0 0 5px'}}>
   {([['todos','Todos'],['cintas','Cintas'],['banners','Banners y etiquetas'],['detalles','Detalles']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={kind===id} onClick={()=>setKind(id)} style={{...control,whiteSpace:'nowrap',fontWeight:kind===id?800:500,background:kind===id?'#F2D85B':'#fff'}}>{label}</button>)}
  </div>
  <div aria-label="Galería de elementos para colocar en el lienzo" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax('+ (compact?'95px':'125px') +',1fr))',gap:9,maxHeight:compact?230:300,overflowY:'auto',padding:3}}>
   {filtered.map(a=><button type="button" key={a.key} aria-label={'Añadir '+a.name+' al lienzo'} onClick={()=>{if(a.brand==='golden')void onGolden(a.asset);else void onSova(a.asset)}} style={{...control,padding:6,minWidth:0,textAlign:'center',overflow:'hidden'}}>
     <span style={{display:'grid',placeItems:'center',height:compact?60:82,borderRadius:8,backgroundColor:'#F0F1F2',backgroundImage:'linear-gradient(45deg,#e2e5e6 25%,transparent 25%),linear-gradient(-45deg,#e2e5e6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e5e6 75%),linear-gradient(-45deg,transparent 75%,#e2e5e6 75%)',backgroundSize:'18px 18px',backgroundPosition:'0 0,0 9px,9px -9px,-9px 0'}}>
      <img loading="lazy" src={a.src} alt="" style={{width:'100%',height:'95%',objectFit:'contain'}}/>
     </span>
     <strong style={{display:'block',fontSize:11,marginTop:6,lineHeight:1.2}}>{a.name}</strong>
     <span style={{fontSize:10,color:'#68747B'}}>{a.brand==='golden'?'Golden Grid':'SOVA'}</span>
    </button>)}
   {filtered.length===0&&<p style={{fontSize:13}}>Sin resultados en esta categoría.</p>}
  </div>
  {!compact&&<div style={{display:'flex',gap:13,flexWrap:'wrap',fontSize:12}}>
    <a href={GOLDEN_GRID_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Kit Golden Grid en Drive</a>
    <a href={SOVA_CAROUSEL_DRIVE} target="_blank" rel="noopener noreferrer">Kit SOVA en Drive</a>
   </div>}
 </div>;
}
