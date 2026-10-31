
import React,{useEffect,useState} from 'react';
import {api} from './platform/client';
import {Sparkles,Upload,ImagePlus,Download,RefreshCw,Save,Check,LoaderCircle,ArrowRight,Palette,LayoutGrid,Camera} from 'lucide-react';
import './BrandGrid.css';

type Brand={id:string;name:string;handle:string;language:string;color:string;background:string;audience:string;rules:string};
type Asset={id:string;brandId:string;name:string;mime:string};
type Tile={headline:string;subtext:string;caption:string;scene:string;assetId:string;format?:string;index:number};
type Grid={id:string;brandId:string;sourceId:string;referenceId:string;kind:string;title:string;concept:string;brief:string;posts:Tile[]};
type Props={brand:Brand;assets:Asset[];images:Record<string,string>;onUploadFile:(f:File)=>Promise<Asset|null>;onNewAsset:(a:Asset,src:string)=>void;loadImage:(id:string)=>void;notify:(text:string)=>void;showError:(e:unknown)=>void};
export const CREATIVE_FORMATS=[
'Editorial Hero','Bold Typography','Macro Texture','Lifestyle Scene','Playful Props',
'Hands-on Editorial','High Contrast','Minimal Premium','Campaign Finale','Color Block',
'Magazine Cover','Arch Frame','Product Spotlight','Floating Product','Typography Poster',
'Negative Space','Diagonal Composition','Soft Luxury','Graphic Cutout','Story Card'
];
const readable=(hex:string)=>{if(!/^#[0-9a-f]{6}$/i.test(hex))return '#191919';const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return r*.299+g*.587+b*.114>155?'#191919':'#fff'};
async function poster(tile:Tile,i:number,grid:Grid,brand:Brand,images:Record<string,string>){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const c=canvas.getContext('2d');if(!c)throw Error('No se pudo exportar la imagen.');
  const paper=brand.background,accent=brand.color,ink=readable(paper),onAccent=readable(accent);
  const fill=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
  const label=(s:string,x:number,y:number,color:string,size=24)=>{c.font='700 '+size+'px Arial, sans-serif';c.fillStyle=color;c.fillText(String(s||'').slice(0,55),x,y)};
  const title=(s:string,x:number,y:number,w:number,color:string,base=85,max=5)=>{
    let size=base,lines:string[]=[];
    for(let z=0;z<13;z++){c.font='bold '+size+'px Georgia, serif';let line='';lines=[];for(const word of String(s||'').split(/\s+/)){const next=line?line+' '+word:word;if(c.measureText(next).width>w&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);if(lines.length<=max&&lines.every(v=>c.measureText(v).width<=w))break;size=Math.max(28,size-6)}
    c.font='bold '+size+'px Georgia, serif';c.fillStyle=color;
    lines.slice(0,max).forEach((v,j)=>c.fillText(v,x,y+j*size*1.14));
  };
  const photo=async(id:string,x:number,y:number,w:number,h:number,contain=false)=>{
    if(!images[id])return;
    const im=new Image();im.src=images[id];await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('No se pudo abrir la foto'))});
    const k=contain?Math.min(w/im.width,h/im.height):Math.max(w/im.width,h/im.height);
    const sw=im.width*k,sh=im.height*k;
    if(!contain){c.save();c.beginPath();c.rect(x,y,w,h);c.clip()}
    c.drawImage(im,x+(w-sw)/2,y+(h-sh)/2,sw,sh);
    if(!contain)c.restore();
  };
  const imageId=tile.assetId;
  const fmt=CREATIVE_FORMATS.indexOf(tile.format||CREATIVE_FORMATS[i]);
  fill(0,0,1080,1350,paper);
  if([0,12,18].includes(fmt)){
    fill(0,0,1080,880,accent);await photo(imageId,0,0,1080,880);
    label(brand.name.toUpperCase(),65,972,ink);title(tile.headline,65,1080,950,ink,77,2);label(tile.subtext,65,1295,ink,20);
  }else if([1,9,14].includes(fmt)){
    fill(0,0,1080,1350,accent);c.strokeStyle=onAccent;c.lineWidth=4;c.strokeRect(65,65,950,1220);
    label(brand.name.toUpperCase(),100,150,onAccent);
    title(tile.headline,100,390,840,onAccent,111,6);await photo(imageId,590,815,380,340);
    label(tile.subtext,105,1230,onAccent,22);
  }else if([2,5,6,16].includes(fmt)){
    fill(0,0,1080,1350,accent);await photo(imageId,0,0,1080,1350);
    fill(0,943,1080,407,paper);label(brand.name.toUpperCase(),65,1010,ink,22);
    title(tile.headline,65,1120,950,ink,72,2);label(tile.subtext,65,1295,ink,19);
  }else if([3,7,11,17].includes(fmt)){
    fill(75,110,930,815,accent);await photo(imageId,75,110,930,815);
    label(brand.name.toUpperCase(),70,78,ink);title(tile.headline,70,1045,930,ink,76,3);
    label(tile.subtext,70,1285,ink,20);
  }else if([4,8,13,19].includes(fmt)){
    fill(0,0,1080,1350,accent);fill(65,65,950,1220,paper);
    label(brand.name.toUpperCase(),105,135,ink);title(tile.headline,105,260,850,ink,80,2);
    await photo(imageId,170,345,740,730);label(tile.subtext,105,1200,ink,22);
  }else{
    fill(0,0,515,1350,accent);await photo(imageId,515,0,565,1350);
    label(brand.name.toUpperCase(),55,130,onAccent,22);
    title(tile.headline,55,350,400,onAccent,83,7);label(tile.subtext,55,1265,onAccent,19);
  }
  if(grid.kind==='preserve'){
    // Exact source image is placed on top, never synthesized, stretched or changed.
    fill(610,650,413,515,paper);await photo(grid.sourceId,626,665,380,485,true);
  }
  return canvas;
}
function TileThumb({tile,idx,grid,brand,images}:{tile:Tile;idx:number;grid:Grid;brand:Brand;images:Record<string,string>}){
  const [preview,setPreview]=useState('');
  useEffect(()=>{
    let on=true;
    if(!tile.assetId||!images[tile.assetId]||(grid.kind==='preserve'&&!images[grid.sourceId])){
      setPreview('');return()=>{on=false};
    }
    poster(tile,idx,grid,brand,images).then(canvas=>{if(on)setPreview(canvas.toDataURL('image/jpeg',0.7))})
      .catch(()=>{if(on)setPreview('')});
    return()=>{on=false};
  },[tile.assetId,tile.headline,tile.subtext,tile.format,idx,grid.kind,grid.sourceId,images,brand.color,brand.background]);
  if(preview)return <img src={preview} alt={'Post '+(idx+1)+' diseñado'}/>;
  return <div className={'bg-concept bg-concept-'+idx}>
    <span>{tile.format||CREATIVE_FORMATS[idx]}</span><i/>
    <strong>{tile.headline}</strong>
    <small>{tile.assetId?'Preparando vista…':'Foto pendiente'}</small>
  </div>;
}
export default function BrandGrid({brand,assets,images,onUploadFile,onNewAsset,loadImage,notify,showError}:Props){
  const [sourceId,setSourceId]=useState('');const [referenceId,setReferenceId]=useState('');
  const [kind,setKind]=useState('product');const [brief,setBrief]=useState('');
  const [grids,setGrids]=useState<Grid[]>([]);const [grid,setGrid]=useState<Grid|null>(null);
  const [selected,setSelected]=useState(0);const [busy,setBusy]=useState('');
  const [uploading,setUploading]=useState('');const [downloads,setDownloads]=useState<{name:string;url:string}[]>([]);
  const [chooseExisting,setChooseExisting]=useState(false);
  const [connection,setConnection]=useState<'unknown'|'ready'|'error'>('unknown');
  const [testPhoto,setTestPhoto]=useState('');
  const library=assets.filter(a=>a.brandId===brand.id),own=grids.filter(g=>g.brandId===brand.id);
  const outputLanguage=/todav[ií]a estoy a tiempo/i.test(brand.name)?'Español':/the launch era/i.test(brand.name)?'English':brand.language;
  useEffect(()=>{api.get('/api/grids').then(({data})=>setGrids(data.grids||[])).catch(showError)},[brand.id]);
  useEffect(()=>{for(const id of [sourceId,referenceId,grid?.sourceId||'',...(grid?.posts.map(p=>p.assetId)||[])].filter(Boolean))if(!images[id])loadImage(id)},[sourceId,referenceId,grid,images]);
  const update=(change:Partial<Tile>)=>{setGrid(g=>g?{...g,posts:g.posts.map((t,i)=>i===selected?{...t,...change}:t)}:g);setDownloads([])};
  const upload=async(f:File|undefined,target:'source'|'reference')=>{
    if(!f)return;setUploading(target);
    try{const asset=await onUploadFile(f);if(asset){if(target==='source')setSourceId(asset.id);else setReferenceId(asset.id)}}catch(e){showError(e)}finally{setUploading('')}
  };
  const plan=async()=>{
    if(!sourceId)return notify('Sube la foto principal primero.');
    setBusy('plan');
    try{const {data}=await api.post('/api/grid-plan',{brandId:brand.id,sourceId,referenceId,kind,brief});
      const g=data as Grid;setGrid(g);setGrids(prev=>[g,...prev]);setSelected(0);setDownloads([]);
      notify('Nueve ideas listas. Puedes generar una sola publicación primero y el resto cuando quieras.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const checkConnection=async()=>{
    setBusy('connection');setConnection('unknown');
    try{
      const {data}=await api.post('/api/connection-test',{});
      if(!data.ok)throw Error('La cuenta Cloudflare no respondió.');
      setConnection('ready');notify('Cloudflare conectado: cuenta, token y modelo de texto verificados.');
    }catch(e){setConnection('error');showError(e)}
    finally{setBusy('')}
  };
  const testOnePhoto=async()=>{
    if(!sourceId)return notify('Primero selecciona una foto original.');
    setBusy('test-photo');setTestPhoto('');
    try{
      const {data}=await api.post('/api/ai-image',{
        brandId:brand.id,assetId:sourceId,mode:'variation',
        prompt:'Generate one premium ORIGINAL product lifestyle advertisement photo from the supplied real product reference. Change scene, camera angle and lighting significantly. Keep recognizable product identity. No fake text, new logos, labels, or watermarks. One standalone 4:5 vertical photo.'
      });
      if(!data?.id||!data?.content)throw Error('Cloudflare no devolvió una foto válida.');
      const src='data:'+data.mime+';base64,'+data.content;
      setTestPhoto(src);onNewAsset({id:data.id,brandId:brand.id,name:data.name||'Cloudflare test',mime:data.mime},src);
      setConnection('ready');notify('¡Foto generada y guardada en tu biblioteca privada!');
    }catch(e){showError(e)}
    finally{setBusy('')}
  };
  const downloadTest=async()=>{
    if(!testPhoto)return;
    try{
      const im=new Image();im.src=testPhoto;
      await new Promise<void>((resolve,reject)=>{im.onload=()=>resolve();im.onerror=()=>reject(Error('Imagen dañada'))});
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas no disponible.');
      const scale=Math.max(1080/im.width,1350/im.height);
      ctx.drawImage(im,(1080-im.width*scale)/2,(1350-im.height*scale)/2,im.width*scale,im.height*scale);
      const a=document.createElement('a');a.download='content-lab-test-1080x1350.png';a.href=canvas.toDataURL('image/png');a.click();
    }catch(e){showError(e)}
  };
  const save=async(g:Grid)=>{
    const {data}=await api.put('/api/grids/'+g.id,{title:g.title,posts:g.posts});
    const next=data as Grid;setGrid(next);setGrids(old=>old.map(x=>x.id===next.id?next:x));return next;
  };
  const generateOne=async(g:Grid,i:number)=>{
    const {data}=await api.post('/api/grid-image',{gridId:g.id,index:i});
    const next=data.grid as Grid;const a=data.asset as Asset;
    setGrid(next);setGrids(old=>old.map(x=>x.id===next.id?next:x));
    onNewAsset(a,'data:'+a.mime+';base64,'+data.content);
    return next;
  };
  const generate=async(i:number)=>{
    if(!grid)return;setBusy('image-'+i);
    try{const saved=await save(grid);await generateOne(saved,i);notify('Post '+(i+1)+' generado. Los demás no se cambiaron.')}
    catch(e){showError(e)}finally{setBusy('')}
  };
  const generateRemaining=async(initial:Grid)=>{
    let g=initial;
    for(let i=0;i<9;i++){
      if(g.posts[i].assetId)continue;
      setBusy('image-'+i);
      g=await generateOne(g,i);
    }
    return g;
  };
  const generateAll=async()=>{
    if(!grid)return;setBusy('all');
    try{const g=await save(grid);await generateRemaining(g);notify('Nueve fotografías diferentes creadas.')}
    catch(e){showError(e);notify('Las fotos terminadas se conservan. Puedes continuar generando las pendientes.')}
    finally{setBusy('')}
  };
  const download=async(i:number)=>{
    if(!grid)return;
    if(!grid.posts[i].assetId||!images[grid.posts[i].assetId])return notify('Genera primero una foto nueva para este post.');
    try{const c=await poster(grid.posts[i],i,grid,brand,images);
      const a=document.createElement('a');a.download='brand-grid-post-'+String(i+1).padStart(2,'0')+'-1080x1350.png';a.href=c.toDataURL('image/png');a.click();notify('PNG del post '+(i+1)+' descargado.');
    }catch(e){showError(e)}
  };
  const prepare=async()=>{
    if(!grid)return;
    if(grid.posts.some(p=>!p.assetId||!images[p.assetId]))return notify('Termina de generar las nueve fotos antes de descargar.');
    setBusy('export');
    try{const files=[];for(let i=0;i<9;i++){const c=await poster(grid.posts[i],i,grid,brand,images);files.push({name:'brand-grid-post-'+String(i+1).padStart(2,'0')+'.png',url:c.toDataURL('image/png')})}
      setDownloads(files);notify('Nueve archivos PNG preparados para descarga individual.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const tile=grid?.posts[selected];
  return <div className="brand-grid-tool">
    <div className="bg-head"><div><div className="eyebrow">VISUAL CONTENT ENGINE · {brand.name.toUpperCase()}</div><h1>1 Photo. <em>9 Posts.</em></h1><p>Una referencia. Nueve fotos nuevas, escenas y composiciones distintas.</p><div className="bg-language"><Check size={15}/> Idioma del contenido: <strong>{outputLanguage}</strong> · {brand.name}</div></div><div className="bg-3x3"><LayoutGrid size={29}/><strong>3 × 3</strong><small>BRAND FEED</small></div></div>
    <div className="bg-layout"><div className="bg-column">
      <div className="bg-box"><div className="bg-title"><span>01</span><div><h3>Sube tu foto</h3><p>Directamente desde Fotos o Archivos.</p></div></div>
        <div className="bg-uploads">
          <label className="bg-drop"><div>{images[sourceId]?<img src={images[sourceId]} alt="Foto original"/>:<ImagePlus size={28}/>}</div><strong>{uploading==='source'?'Preparando…':'Foto original *'}</strong><small>Producto, foto o screenshot</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'source')}/></label>
          <label className="bg-drop"><div>{images[referenceId]?<img src={images[referenceId]} alt="Referencia"/>:<Palette size={28}/>}</div><strong>{uploading==='reference'?'Preparando…':'Referencia de estilo'}</strong><small>Opcional</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'reference')}/></label>
        </div>
        <button className="bg-link" onClick={()=>setChooseExisting(v=>!v)}>{chooseExisting?'Ocultar biblioteca':'O usar fotos ya guardadas'} <ArrowRight size={15}/></button>
        {chooseExisting&&<div className="bg-saved-select"><select value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Foto principal</option>{library.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><select value={referenceId} onChange={e=>setReferenceId(e.target.value)}><option value="">Sin referencia</option>{library.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>}
        <label>Modo de imagen</label><div className="bg-modes"><button className={kind==='product'?'selected':''} onClick={()=>setKind('product')}><strong>Producto</strong><small>Escenas nuevas</small></button><button className={kind==='preserve'?'selected':''} onClick={()=>setKind('preserve')}><strong>Foto / App intacta</strong><small>Conservar original</small></button></div>
        <label>Tu idea creativa</label><textarea rows={3} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Ej. Feed editorial premium, colores de mi marca, fotos lifestyle, tipografía grande, cada post diferente."/>
        <div className="bg-test-controls">
          <button className="btn ghost wide" disabled={!!busy||!!uploading} onClick={checkConnection}>
            {busy==='connection'?<LoaderCircle size={17} className="spin"/>:<Check size={17}/>}
            Comprobar conexión gratuita
          </button>
          {connection==='ready'&&<p className="bg-connection-ok">✓ Cuenta y token de Cloudflare conectados. Puedes probar una foto.</p>}
          {connection==='error'&&<p className="bg-connection-error">Cloudflare no respondió. Revisa los permisos del token en Supabase.</p>}
          <button className="btn dark wide" disabled={!sourceId||!!busy||!!uploading} onClick={testOnePhoto}>
            {busy==='test-photo'?<LoaderCircle size={17} className="spin"/>:<ImagePlus size={17}/>}
            {busy==='test-photo'?'Generando una foto…':'Probar 1 foto gratis'}
          </button>
          {testPhoto&&<div className="bg-test-result"><img src={testPhoto} alt="Foto real generada por Cloudflare"/><button className="btn ghost" onClick={downloadTest}><Download size={16}/> Descargar PNG</button><small>También guardada en tu biblioteca privada.</small></div>}
        </div>
        <button className="btn ghost wide" disabled={!sourceId||!!busy||!!uploading} onClick={plan}>{busy==='plan'?<LoaderCircle size={17} className="spin"/>:<Sparkles size={17}/>} Preparar 9 ideas para mi grid</button><small className="bg-note">Prueba primero la conexión y genera una sola foto. Después prepara las 9 ideas y elige cuándo generar las demás. La IA utiliza la cuota diaria de Workers Free; no usa Gemini de pago.</small>
      </div>
      {own.length>0&&<div className="bg-box"><h3>Tus proyectos</h3><div className="bg-recent">{own.slice().reverse().map(g=><button key={g.id} onClick={()=>{setGrid(g);setSourceId(g.sourceId);setReferenceId(g.referenceId);setKind(g.kind);setBrief(g.brief);setSelected(0);setDownloads([])}}><LayoutGrid size={17}/>{g.title}<ArrowRight size={16}/></button>)}</div></div>}
    </div><div className="bg-results">
      {!grid?<div className="bg-empty"><div className="bg-empty-grid">{Array.from({length:9},(_,i)=><span key={i} style={{background:i%2?brand.background:brand.color}}/>)}</div><h3>Tu próximo feed comienza aquí.</h3><p>Sube una foto para generar nueve ideas visuales originales, cada una como publicación independiente.</p></div>:<>
        <div className="bg-result-head"><div><div className="eyebrow">02 · NUEVE POSTS INDEPENDIENTES</div><h2>{grid.title}</h2><p>{grid.concept}</p></div><button className="btn ghost" onClick={()=>save(grid).then(()=>notify('Grid guardado')).catch(showError)}><Save size={16}/> Guardar</button></div>
        <div className="bg-feed">{grid.posts.map((t,i)=><button key={i} onClick={()=>setSelected(i)} className={'bg-feed-tile '+(selected===i?'active':'')} style={{background:i%3?brand.background:brand.color}}>
          <TileThumb tile={t} idx={i} grid={grid} brand={brand} images={images}/>
          <span className="bg-status">{String(i+1).padStart(2,'0')}/09 · {t.assetId?'GENERADO':'CONCEPTO'}</span>
        </button>)}</div>
        <div className="bg-grid-actions"><button className="btn dark" disabled={!!busy} onClick={generateAll}>{busy.startsWith('image-')?<LoaderCircle size={16} className="spin"/>:<Sparkles size={16}/>} Generar las 9 imágenes</button><button className="btn ghost" disabled={!!busy||!grid.posts.every(p=>Boolean(p.assetId&&images[p.assetId]))} onClick={prepare}><Download size={16}/> Preparar PNG separados</button></div>
        <div className="bg-editor"><div className="bg-title"><span>{String(selected+1).padStart(2,'0')}</span><div><h3>Editar post {selected+1}</h3><p>Esta publicación es independiente.</p></div></div>
          <label>Formato visual</label><select value={tile?.format||CREATIVE_FORMATS[selected]} onChange={e=>update({format:e.target.value})}>{CREATIVE_FORMATS.map(f=><option key={f}>{f}</option>)}</select>
          <label>Titular</label><input value={tile?.headline||''} onChange={e=>update({headline:e.target.value})}/>
          <label>Subtítulo</label><input value={tile?.subtext||''} onChange={e=>update({subtext:e.target.value})}/>
          <label>Caption</label><textarea rows={3} value={tile?.caption||''} onChange={e=>update({caption:e.target.value})}/>
          <label>Dirección de la foto</label><textarea rows={3} value={tile?.scene||''} onChange={e=>update({scene:e.target.value})}/>
          <div className="bg-post-actions"><button className="btn ghost" onClick={()=>generate(selected)} disabled={!!busy}>{busy==='image-'+selected?<LoaderCircle size={17} className="spin"/>:<RefreshCw size={17}/>} {tile?.assetId?'Regenerar este post':'Generar este post'}</button><button className="btn dark" onClick={()=>download(selected)} disabled={!!busy}><Download size={17}/> Descargar PNG</button></div>
          <p className="bg-note">Modo foto/App intacta: la imagen original se compone sin alterarla. En modo producto la IA crea fotografías nuevas; revisa el resultado antes de publicar.</p>
        </div>
        {downloads.length>0&&<div className="bg-downloads"><h3><Check size={19}/> 9 PNG individuales</h3><p>Descarga cada archivo por separado. Sin ZIP ni collages.</p><div>{downloads.map((v,i)=><a key={i} href={v.url} download={v.name}><Download size={15}/> Post {String(i+1).padStart(2,'0')}.png</a>)}</div></div>}
      </>}
    </div></div>
  </div>;
}
