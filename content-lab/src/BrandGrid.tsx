
import React,{useEffect,useState} from 'react';
import {api} from './platform/client';
import {Sparkles,Upload,ImagePlus,Download,RefreshCw,Save,Check,LoaderCircle,ArrowRight,Palette,LayoutGrid,Camera} from 'lucide-react';
import './BrandGrid.css';
import {composeGridPoster,LAYOUTS,EXPORT_SIZES,type ExportSize,type VisualControls} from './GridComposer';
import GridVisualEditor from './GridVisualEditor';

type Brand={id:string;name:string;handle:string;language:string;color:string;background:string;secondaryColor?:string;headingFont?:string;bodyFont?:string;logoAssetId?:string;referenceAssetId?:string;photoMood?:string;avoid?:string;audience:string;rules:string};
type Asset={id:string;brandId:string;name:string;mime:string};
type Tile={headline:string;subtext:string;caption:string;scene:string;assetId:string;format?:string;index:number;layout?:VisualControls};
type Grid={id:string;brandId:string;sourceId:string;referenceId:string;kind:string;title:string;concept:string;brief:string;planningSource?:'ai'|'template';analysisStatus?:'vision'|'fallback';visualDescription?:string;posts:Tile[]};
type Props={brand:Brand;assets:Asset[];images:Record<string,string>;onUploadFile:(f:File)=>Promise<Asset|null>;onNewAsset:(a:Asset,src:string)=>void;loadImage:(id:string)=>void;notify:(text:string)=>void;showError:(e:unknown)=>void};
export const CREATIVE_FORMATS=LAYOUTS.map(x=>x.name);
async function poster(tile:Tile,i:number,grid:Grid,brand:Brand,images:Record<string,string>,size:ExportSize='portrait'){
  return (await composeGridPoster(tile,i,brand,{
    photo:images[tile.assetId],original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'
  },size)).canvas;
}
async function imageFingerprint(src:string):Promise<string>{
 const im=new Image();im.src=src;await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('No se puede analizar imagen'))});
 const c=document.createElement('canvas');c.width=9;c.height=8;const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas no disponible');
 ctx.drawImage(im,0,0,9,8);const pixels=ctx.getImageData(0,0,9,8).data;let bits='';
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  const a=(y*9+x)*4,b=(y*9+x+1)*4;
  bits+=(pixels[a]*.3+pixels[a+1]*.59+pixels[a+2]*.11)>=(pixels[b]*.3+pixels[b+1]*.59+pixels[b+2]*.11)?'1':'0';
 }return bits;
}
const hamming=(a:string,b:string)=>[...a].reduce((n,c,i)=>n+Number(c!==b[i]),0);
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
  const [exportSize,setExportSize]=useState<ExportSize>('portrait');
  const [qaNotes,setQaNotes]=useState<string[]>([]);
  const [sessionPhotos,setSessionPhotos]=useState(0);
  const [reviewed,setReviewed]=useState(false);
  const [connection,setConnection]=useState<'unknown'|'ready'|'error'>('unknown');
  const [testPhoto,setTestPhoto]=useState('');
  const library=assets.filter(a=>a.brandId===brand.id),own=grids.filter(g=>g.brandId===brand.id);
  const wrongOriginal=!!sourceId&&!!assets.find(a=>a.id===sourceId&&a.brandId!==brand.id);
  const wrongReference=!!referenceId&&!!assets.find(a=>a.id===referenceId&&a.brandId!==brand.id);
  // Switching Instagram accounts must never retain the old account's selected photos.
  useEffect(()=>{
    setSourceId('');setReferenceId(brand.referenceAssetId||'');setGrid(null);setSelected(0);
    setDownloads([]);setTestPhoto('');setConnection('unknown');setChooseExisting(false);setQaNotes([]);setReviewed(false);
  },[brand.id]);
  const outputLanguage=/todav[ií]a estoy a tiempo/i.test(brand.name)?'Español':/the launch era/i.test(brand.name)?'English':brand.language;
  useEffect(()=>{api.get('/api/grids').then(({data})=>setGrids(data.grids||[])).catch(showError)},[brand.id]);
  useEffect(()=>{for(const id of [sourceId,referenceId,brand.logoAssetId||'',grid?.sourceId||'',...(grid?.posts.map(p=>p.assetId)||[])].filter(Boolean))if(!images[id])loadImage(id)},[sourceId,referenceId,grid,images]);
  const update=(change:Partial<Tile>)=>{
    setGrid(g=>g?{...g,posts:g.posts.map((t,i)=>i===selected?{...t,...change}:t)}:g);
    setDownloads([]);setReviewed(false);setQaNotes([]);
  };
  const upload=async(f:File|undefined,target:'source'|'reference')=>{
    if(!f)return;setUploading(target);
    try{const asset=await onUploadFile(f);if(asset){if(target==='source')setSourceId(asset.id);else setReferenceId(asset.id)}}catch(e){showError(e)}finally{setUploading('')}
  };
  const plan=async()=>{
    if(!sourceId)return notify('Sube una foto principal de la marca que tienes seleccionada.');
    if(wrongOriginal||wrongReference)return notify('La foto pertenece a otra marca. Cambia a su marca o vuelve a subirla en '+brand.name+'.');
    if(!library.some(a=>a.id===sourceId))return notify('Selecciona una foto guardada en '+brand.name+'.');
    if(referenceId&&!library.some(a=>a.id===referenceId))return notify('La referencia es de otra marca. Súbela en '+brand.name+'.');
    setBusy('plan');
    try{const {data}=await api.post('/api/grid-plan',{brandId:brand.id,sourceId,referenceId,kind,brief});
      const g=data as Grid;setGrid(g);setGrids(prev=>[g,...prev]);setSelected(0);setDownloads([]);
      notify(g.planningSource==='template'
       ? 'Preparé 9 conceptos editables con plantilla de respaldo. No se generaron fotos.'
       : g.analysisStatus==='vision'
        ? 'La IA analizó tu foto y preparó 9 conceptos diferentes. Puedes revisarlos antes de generar fotos.'
        : 'Nueve conceptos listos. El análisis de foto no estuvo disponible; revisa los detalles manualmente.');
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
    if(!library.some(a=>a.id===sourceId))return notify('Esta foto está guardada en otra marca. Vuelve a subirla desde '+brand.name+'.');
    setBusy('test-photo');setTestPhoto('');
    try{
      const {data}=await api.post('/api/ai-image',{
        brandId:brand.id,assetId:sourceId,mode:'variation',
        prompt:'Generate one premium ORIGINAL product lifestyle advertisement photo from the supplied real product reference. Change scene, camera angle and lighting significantly. Keep recognizable product identity. No fake text, new logos, labels, or watermarks. One standalone 4:5 vertical photo.'
      });
      if(!data?.id||!data?.content)throw Error('Cloudflare no devolvió una foto válida.');
      const src='data:'+data.mime+';base64,'+data.content;
      setTestPhoto(src);setSessionPhotos(n=>n+1);onNewAsset({id:data.id,brandId:brand.id,name:data.name||'Cloudflare test',mime:data.mime},src);
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
    setSessionPhotos(n=>n+1);
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
    if(!window.confirm('La IA generará todas las fotos pendientes con tu cuota gratuita de Cloudflare. ¿Continuar?'))return;
    try{const g=await save(grid);await generateRemaining(g);notify('Fotos pendientes generadas. Revísalas antes de publicar.')}
    catch(e){showError(e);notify('Las fotos terminadas se conservan. Puedes continuar generando las pendientes.')}
    finally{setBusy('')}
  };
  const download=async(i:number)=>{
    if(!grid)return;
    if(!grid.posts[i].assetId||!images[grid.posts[i].assetId])return notify('Genera primero una foto nueva para este post.');
    try{const c=await poster(grid.posts[i],i,grid,brand,images,exportSize);
      const a=document.createElement('a');a.download='brand-grid-post-'+String(i+1).padStart(2,'0')+'-'+EXPORT_SIZES[exportSize].w+'x'+EXPORT_SIZES[exportSize].h+'.png';a.href=c.toDataURL('image/png');a.click();notify('PNG del post '+(i+1)+' descargado.');
    }catch(e){showError(e)}
  };
  const prepare=async()=>{
    if(!grid)return;
    if(grid.posts.some(p=>!p.assetId||!images[p.assetId]))return notify('Termina de generar las nueve fotos antes de descargar.');
    setBusy('export');
    try{const files=[];for(let i=0;i<9;i++){const c=await poster(grid.posts[i],i,grid,brand,images,exportSize);files.push({name:'brand-grid-post-'+String(i+1).padStart(2,'0')+'-'+exportSize+'.png',url:c.toDataURL('image/png')})}
      setDownloads(files);notify('Nueve archivos PNG preparados para descarga individual.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const checkQuality=async()=>{
    if(!grid)return;
    setBusy('quality');
    try{
     const found:string[]=[];
     let pending=0;
     const used=new Map<string,number>();
     const hashes:{n:number;value:string}[]=[];
     for(let i=0;i<grid.posts.length;i++){
      const p=grid.posts[i];const image=p.assetId?images[p.assetId]:null;
      if(!p.assetId||!image){pending++;continue;}
      if(used.has(p.assetId))found.push('Posts '+(used.get(p.assetId)!+1)+' y '+(i+1)+': usan el mismo archivo.');
      used.set(p.assetId,i);
      if(!p.headline?.trim())found.push('Post '+(i+1)+': falta el titular.');
      const result=await composeGridPoster(p,i,brand,{photo:image,original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'},exportSize);
      if(!result.fit)found.push('Post '+(i+1)+': el titular no cabe. Reduce tamaño o palabras.');
      if(result.contrast<3)found.push('Post '+(i+1)+': contrasta poco con el fondo; revisa legibilidad.');
      const hash=await imageFingerprint(image);
      for(const prev of hashes)if(hamming(hash,prev.value)<=5){found.push('Posts '+(prev.n+1)+' y '+(i+1)+': fotos visualmente muy similares; revísalas.');break;}
      hashes.push({n:i,value:hash});
     }
     if(pending>0)found.unshift(pending+' de 9 publicaciones sin imagen final. La vista previa puede mostrar tu foto original, pero eso no significa que ya se hayan generado fotos nuevas. Genera cada post cuando lo necesites.');
     else found.unshift('Las 9 publicaciones tienen una imagen final. Revisa las indicaciones antes de exportar.');
     found.push('Inspección visual pendiente: revisa etiquetas, manos, logos y que el producto sea fiel al original.');
     setQaNotes(found);setReviewed(false);
     notify(pending>0?'Hay '+pending+' fotos finales pendientes. Conservé todas tus ideas y fotografías originales.':'Revisión terminada. Comprueba los avisos antes de exportar.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const gridPending=grid?.posts.filter(p=>!p.assetId||!images[p.assetId]).length||0;
  const tile=grid?.posts[selected];
  return <div className="brand-grid-tool">
    <div className="bg-head"><div><div className="eyebrow">VISUAL CONTENT ENGINE · {brand.name.toUpperCase()}</div><h1>1 Photo. <em>9 Posts.</em></h1><p>Una referencia. Nueve fotos nuevas, escenas y composiciones distintas.</p><div className="bg-language"><Check size={15}/> Idioma del contenido: <strong>{outputLanguage}</strong> · {brand.name}</div></div><div className="bg-3x3"><LayoutGrid size={29}/><strong>3 × 3</strong><small>BRAND FEED</small></div></div>
    <div className="bg-layout"><div className="bg-column">
      <div className="bg-box"><div className="bg-title"><span>01</span><div><h3>Sube tu foto</h3><p>Directamente desde Fotos o Archivos.</p></div></div>
        <div className="bg-uploads">
          <label className="bg-drop"><div>{images[sourceId]?<img src={images[sourceId]} alt="Foto original"/>:<ImagePlus size={28}/>}</div><strong>{uploading==='source'?'Preparando…':'Foto original *'}</strong><small>Producto, foto o screenshot</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'source')}/></label>
          <label className="bg-drop"><div>{images[referenceId]?<img src={images[referenceId]} alt="Referencia"/>:<Palette size={28}/>}</div><strong>{uploading==='reference'?'Preparando…':'Referencia de estilo'}</strong><small>Opcional</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'reference')}/></label>
        </div>
        <div className="bg-account-note">Fotos para <strong>{brand.name}</strong>. Cada cuenta tiene su biblioteca separada.</div>
        {(wrongOriginal||wrongReference)&&<p role="alert" className="bg-connection-error">Una foto pertenece a otra marca. Cambia de cuenta o vuelve a subir la foto desde {brand.name}.</p>}
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
        <div className="v2-vision-status" role="status">{grid.analysisStatus==='vision'
         ? '✓ La IA observó la foto principal y la referencia de estilo al preparar los conceptos.'
         : 'Análisis visual no confirmado. El plan usa tu descripción escrita; comprueba el producto antes de generar fotos.'}</div>
        <div className="bg-feed">{grid.posts.map((t,i)=><button key={i} onClick={()=>setSelected(i)} className={'bg-feed-tile '+(selected===i?'active':'')} style={{background:i%3?brand.background:brand.color}}>
          <TileThumb tile={t} idx={i} grid={grid} brand={brand} images={images}/>
          <span className="bg-status">{String(i+1).padStart(2,'0')}/09 · {t.assetId?'GENERADO':'CONCEPTO'}</span>
        </button>)}</div>
        <div className="v2-usage-note"><strong>{sessionPhotos} fotos nuevas generadas en esta sesión.</strong> La cuota Free de Cloudflare es compartida; este número no representa el saldo real. Preparar ideas y analizar referencias también puede usar cuota. La generación múltiple requiere tu confirmación.</div>
        <div className="bg-export-setting"><label htmlFor="grid-export-size">Formato final</label><select id="grid-export-size" value={exportSize} onChange={e=>{setExportSize(e.target.value as ExportSize);setDownloads([]);setQaNotes([]);setReviewed(false)}}>
           {(Object.keys(EXPORT_SIZES) as ExportSize[]).map(k=><option key={k} value={k}>{EXPORT_SIZES[k].title} ({EXPORT_SIZES[k].w} × {EXPORT_SIZES[k].h})</option>)}
          </select></div>
        <div className="bg-grid-actions"><button className="btn dark" disabled={!!busy} onClick={generateAll}>{busy.startsWith('image-')?<LoaderCircle size={16} className="spin"/>:<Sparkles size={16}/>} Generar las 9 imágenes</button><button className="btn ghost" disabled={!!busy||!reviewed||!grid.posts.every(p=>Boolean(p.assetId&&images[p.assetId]))} onClick={prepare}><Download size={16}/> Preparar PNG separados</button></div>
        <div className="bg-qa-panel"><div><strong>Control de calidad</strong><p>Detecta fotos repetidas, titulares que no caben y publicaciones pendientes. No genera más imágenes.</p></div>
          <button className="btn ghost" disabled={!!busy} onClick={checkQuality}>Revisar grid</button>
          {qaNotes.length>0&&<><div className="bg-qa-list" role="status">{qaNotes.map((note,i)=><p key={i}>{i===0?'':'• '}{note}</p>)}</div>
           {gridPending===0?<label className="bg-qa-confirm">
             <input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} aria-label="Confirmar revisión de todas las imágenes"/>
             <span>He revisado las nueve imágenes y apruebo el contenido para descargar.</span>
            </label>:<p className="bg-qa-pending">Primero genera las fotos finales. No necesitas marcar ninguna casilla para continuar editando tus conceptos.</p>}
          </>}
         </div>
        <div className="bg-editor"><div className="bg-title"><span>{String(selected+1).padStart(2,'0')}</span><div><h3>Editar post {selected+1}</h3><p>Esta publicación es independiente.</p></div></div>
          <label>Formato visual · 20 composiciones diferentes</label><select value={tile?.format||CREATIVE_FORMATS[selected]} onChange={e=>update({format:e.target.value})}>{CREATIVE_FORMATS.map(f=><option key={f}>{f}</option>)}</select>
          <label>Titular</label><input value={tile?.headline||''} onChange={e=>update({headline:e.target.value})}/>
          <label>Subtítulo</label><input value={tile?.subtext||''} onChange={e=>update({subtext:e.target.value})}/>
          <label>Caption</label><textarea rows={3} value={tile?.caption||''} onChange={e=>update({caption:e.target.value})}/>
          <label>Dirección de la foto</label><textarea rows={3} value={tile?.scene||''} onChange={e=>update({scene:e.target.value})}/>
          {tile&&<div className="bg-editor-preview-note">{!tile.assetId
              ? 'Vista previa de diseño: todavía no se ha generado la foto final de este post. Conservamos la imagen original para ayudarte a organizar la composición.'
              : 'Foto generada para este post. Puedes mover la imagen y el titular sin gastar créditos.'}</div>}
          {tile&&<GridVisualEditor tile={tile} index={selected} brand={brand} logo={images[brand.logoAssetId||'']} photo={images[tile.assetId]} original={images[grid.sourceId]} preserve={grid.kind==='preserve'} exportSize={exportSize} onChange={layout=>update({layout})}/>}
          <p className="bg-note">El texto se coloca como capa editable después de crear la foto. Nunca pidas a la IA que escriba títulos en el producto.</p>
          <div className="bg-post-actions"><button className="btn ghost" onClick={()=>generate(selected)} disabled={!!busy}>{busy==='image-'+selected?<LoaderCircle size={17} className="spin"/>:<RefreshCw size={17}/>} {tile?.assetId?'Regenerar este post':'Generar este post'}</button><button className="btn dark" onClick={()=>download(selected)} disabled={!!busy}><Download size={17}/> Descargar PNG</button></div>
          <p className="bg-note">Modo foto/App intacta: la imagen original se compone sin alterarla. En modo producto la IA crea fotografías nuevas; revisa el resultado antes de publicar.</p>
        </div>
        {downloads.length>0&&<div className="bg-downloads"><h3><Check size={19}/> PNG individuales · {EXPORT_SIZES[exportSize].title}</h3><p>Descarga cada archivo por separado. Sin ZIP ni collages. Composiciones revisadas.</p><div>{downloads.map((v,i)=><a key={i} href={v.url} download={v.name}><Download size={15}/> Post {String(i+1).padStart(2,'0')}.png</a>)}</div></div>}
      </>}
    </div></div>
  </div>;
}
