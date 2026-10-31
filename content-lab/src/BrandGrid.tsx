
import React,{useEffect,useRef,useState} from 'react';
import {api} from './platform/client';
import {Sparkles,Upload,ImagePlus,Download,RefreshCw,Save,Check,LoaderCircle,ArrowRight,Palette,LayoutGrid,Camera} from 'lucide-react';
import './BrandGrid.css';
import {composeGridPoster,LAYOUTS,EXPORT_SIZES,type ExportSize,type VisualControls} from './GridComposer';
import GridVisualEditor from './GridVisualEditor';
import type {PromptControls} from './PromptEngine';
import {EDITORIAL_PRESETS,type EditorialDesign,type EditorialPreset} from './EditorialPoster';
import {brandPalette} from './BrandIdentity';
import FreeDecorControls from './FreeDecorControls';
import type {FreeBackgroundId} from './FreeDesignAssets';
import {assetCategory,displayAssetName,type MediaCategory} from './MediaAsset';

type Brand={id:string;name:string;handle:string;language:string;color:string;background:string;secondaryColor?:string;additionalColors?:string[];headingFont?:string;bodyFont?:string;logoAssetId?:string;referenceAssetId?:string;photoMood?:string;avoid?:string;audience:string;rules:string};
type Asset={id:string;brandId:string;name:string;mime:string;category?:MediaCategory;displayName?:string;generated?:boolean};
type Tile={headline:string;subtext:string;caption:string;scene:string;assetId:string;format?:string;index:number;layout?:VisualControls;design?:EditorialDesign;backgroundId?:FreeBackgroundId;stickerIds?:string[]};
type Grid={id:string;brandId:string;sourceId:string;referenceId:string;kind:string;title:string;concept:string;brief:string;planningSource?:'ai'|'template';analysisStatus?:'vision'|'fallback';visualDescription?:string;posts:Tile[]};
type Wallet={admin?:boolean;photo_remaining?:number;photo_today?:number;creative_remaining?:number;creative_today?:number;quota_day?:string};
type Props={brand:Brand;assets:Asset[];images:Record<string,string>;isAdmin?:boolean;wallet?:Wallet|null;promptSelection?:{version:number;text:string;settings:PromptControls}|null;initialSelection?:{version:number;brandId?:string;sourceId?:string;referenceId?:string;format?:string};onOpenPrompts?:()=>void;onUploadFile:(f:File,category?:MediaCategory)=>Promise<Asset|null>;onNewAsset:(a:Asset,src:string)=>void;loadImage:(id:string)=>void;notify:(text:string)=>void;showError:(e:unknown)=>void};
export const CREATIVE_FORMATS=LAYOUTS.map(x=>x.name);
async function poster(tile:Tile,i:number,grid:Grid,brand:Brand,images:Record<string,string>,size:ExportSize='portrait'){
  return (await composeGridPoster(tile,i,brand,{
    photo:(tile.design&&grid.kind==='preserve')?images[grid.sourceId]:images[tile.assetId],
    original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'&&!tile.design
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
    if((!tile.assetId||!images[tile.assetId])&&(!tile.design||!images[grid.sourceId])||(grid.kind==='preserve'&&!images[grid.sourceId])){
      setPreview('');return()=>{on=false};
    }
    poster(tile,idx,grid,brand,images).then(canvas=>{if(on)setPreview(canvas.toDataURL('image/jpeg',0.7))})
      .catch(()=>{if(on)setPreview('')});
    return()=>{on=false};
  },[tile.assetId,tile.headline,tile.subtext,tile.format,tile.design,tile.layout,tile.backgroundId,tile.stickerIds,tile.design?.backgroundPattern,tile.design?.stickerIds,idx,grid.kind,grid.sourceId,images,brand.color,brand.background]);
  if(preview)return <img src={preview} alt={'Post '+(idx+1)+' diseñado'}/>;
  return <div className={'bg-concept bg-concept-'+idx}>
    <span>{tile.format||CREATIVE_FORMATS[idx]}</span><i/>
    <strong>{tile.headline}</strong>
    <small>{tile.assetId?'Preparando vista…':'Foto pendiente'}</small>
  </div>;
}
export default function BrandGrid({brand,assets,images,isAdmin=false,wallet,promptSelection,initialSelection,onOpenPrompts,onUploadFile,onNewAsset,loadImage,notify,showError}:Props){
  const [sourceId,setSourceId]=useState('');const [referenceId,setReferenceId]=useState('');
  const [designMode,setDesignMode]=useState<'editorial'|'photo'>('editorial');
  const [chosenFormat,setChosenFormat]=useState('');
  const [referenceFocus,setReferenceFocus]=useState<string[]>(['palette','lighting','composition']);
  useEffect(()=>{
    if(!initialSelection?.version||initialSelection.brandId!==brand.id)return;
    setSourceId(initialSelection.sourceId||'');
    setReferenceId(initialSelection.referenceId||brand.referenceAssetId||'');
    setChosenFormat(initialSelection.format||'');
    setGrid(null);setSelected(0);setDownloads([]);
  },[initialSelection?.version]);
  const [designPreset,setDesignPreset]=useState<'reference'|EditorialPreset>('reference');
  const [kind,setKind]=useState('portrait');const [brief,setBrief]=useState('');
  const [creativeSettings,setCreativeSettings]=useState<PromptControls|null>(null);
  useEffect(()=>{
    if(!promptSelection)return;
    setBrief(promptSelection.text);
    setCreativeSettings(promptSelection.settings);
  },[promptSelection?.version]);
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
  const [saveState,setSaveState]=useState<'saved'|'pending'|'saving'|'error'>('saved');
  const savedSignature=useRef<Record<string,string>>({});
  const gridRef=useRef<Grid|null>(null);
  const saveQueue=useRef<Promise<void>>(Promise.resolve());
  const autoTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [creditPrompt,setCreditPrompt]=useState<{kind:'photo'|'creative';units:number;title:string}|null>(null);
  const creditDecision=useRef<((approved:boolean)=>void)|null>(null);
  gridRef.current=grid;
  const signature=(g:Grid)=>JSON.stringify({title:g.title,posts:g.posts});
  const todayUTC=new Date().toISOString().slice(0,10);
  const usedToday=(kind:'photo'|'creative')=>wallet?.quota_day===todayUTC?Number(kind==='photo'?wallet.photo_today:wallet.creative_today)||0:0;
  const available=(kind:'photo'|'creative')=>!wallet||wallet.admin?Infinity:Math.max(0,Math.min(
    Number(kind==='photo'?wallet.photo_remaining:wallet.creative_remaining)||0,
    10-usedToday(kind)
  ));
  const askCredits=(kind:'photo'|'creative',units:number,title:string):Promise<boolean>=>{
    if(units<1)return Promise.resolve(true);
    if(units>available(kind)){
      notify('No tienes suficientes créditos o alcanzaste el límite diario. Puedes seguir editando sin consumir IA.');
      return Promise.resolve(false);
    }
    return new Promise(resolve=>{creditDecision.current=resolve;setCreditPrompt({kind,units,title});});
  };
  const respondCredits=(answer:boolean)=>{creditDecision.current?.(answer);creditDecision.current=null;setCreditPrompt(null)};
  // Flush a still-pending draft on iPhone app backgrounding, brand switches or
  // editor exit. Requests stay ordered so an older save cannot overwrite a newer one.
  const flushDraft=()=>{
    if(autoTimer.current)clearTimeout(autoTimer.current);
    const current=gridRef.current;if(!current?.id)return;
    const key=current.id,snap=signature(current);
    if(savedSignature.current[key]===snap)return;
    const copy={title:current.title,posts:current.posts};
    saveQueue.current=saveQueue.current.catch(()=>{}).then(async()=>{
      await api.put('/api/grids/'+key,copy);
      savedSignature.current[key]=snap;
      setGrids(prev=>prev.map(g=>g.id===key?{...g,...copy}:g));
    }).catch(e=>console.warn('Content Lab pending draft could not be saved:',e));
  };
  useEffect(()=>{
    const onVisibility=()=>{if(document.visibilityState==='hidden')flushDraft()};
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{
      creditDecision.current?.(false);
      if(autoTimer.current)clearTimeout(autoTimer.current);
      if(gridRef.current)flushDraft();
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[]);
  // Background writes are serialized per browser, never stored in shared/localStorage.
  // A new grid's baseline is its server-loaded snapshot; editing it creates a draft.
  useEffect(()=>{
    if(!grid?.id)return;
    const key=grid.id,snapshot=signature(grid);
    if(!(key in savedSignature.current)){savedSignature.current[key]=snapshot;setSaveState('saved');return;}
    if(savedSignature.current[key]===snapshot)return;
    setSaveState('pending');
    if(autoTimer.current)clearTimeout(autoTimer.current);
    autoTimer.current=setTimeout(()=>{
      const current=gridRef.current;if(!current||current.id!==key)return;
      const currentSnapshot=signature(current);
      if(savedSignature.current[key]===currentSnapshot)return;
      setSaveState('saving');
      const copy={title:current.title,posts:current.posts};
      saveQueue.current=saveQueue.current.catch(()=>{}).then(async()=>{
        await api.put('/api/grids/'+key,copy);
        savedSignature.current[key]=currentSnapshot;
        setGrids(prev=>prev.map(g=>g.id===key?{...g,...copy}:g));
        if(gridRef.current?.id===key){
          setSaveState(signature(gridRef.current)===currentSnapshot?'saved':'pending');
        }
      }).catch(error=>{setSaveState('error');showError(error)});
    },1400);
    return()=>{if(autoTimer.current)clearTimeout(autoTimer.current)};
  },[grid?.id,grid?.title,grid?.posts]);
  const library=assets.filter(a=>a.brandId===brand.id),own=grids.filter(g=>g.brandId===brand.id);
  const wrongOriginal=!!sourceId&&!!assets.find(a=>a.id===sourceId&&a.brandId!==brand.id);
  const wrongReference=!!referenceId&&!!assets.find(a=>a.id===referenceId&&a.brandId!==brand.id);
  // Switching Instagram accounts must never retain the old account's selected photos.
  useEffect(()=>{
    flushDraft();
    const ownChoice=initialSelection?.brandId===brand.id?initialSelection:null;
    setSourceId(ownChoice?.sourceId||'');setReferenceId(ownChoice?.referenceId||brand.referenceAssetId||'');setChosenFormat(ownChoice?.format||'');
    setGrid(null);setSelected(0);
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
    try{const asset=await onUploadFile(f,target==='source'?'original':'reference');if(asset){if(target==='source')setSourceId(asset.id);else setReferenceId(asset.id)}}catch(e){showError(e)}finally{setUploading('')}
  };
  const plan=async()=>{
    if(!sourceId)return notify('Sube una foto principal de la marca que tienes seleccionada.');
    if(wrongOriginal||wrongReference)return notify('La foto pertenece a otra marca. Cambia a su marca o vuelve a subirla en '+brand.name+'.');
    if(!library.some(a=>a.id===sourceId))return notify('Selecciona una foto guardada en '+brand.name+'.');
    if(referenceId&&!library.some(a=>a.id===referenceId))return notify('La referencia es de otra marca. Súbela en '+brand.name+'.');
    if(!await askCredits('creative',3,'Preparar 9 ideas con IA'))return;
    setBusy('plan');
    try{const {data}=await api.post('/api/grid-plan',{brandId:brand.id,sourceId,referenceId,referenceFocus,kind,brief,designMode,designPreset,creativeSettings});
      let g=data as Grid;
      if(chosenFormat&&g.posts.length){
        const posts=g.posts.map((tile,i)=>i===0?{...tile,format:chosenFormat,design:undefined}:tile);
        const response=await api.put('/api/grids/'+g.id,{posts});g=response.data as Grid;
      }
      savedSignature.current[g.id]=signature(g);
      setGrid(g);setSaveState('saved');setGrids(prev=>[g,...prev]);setSelected(0);setDownloads([]);
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
  const testOnePhoto=async(variation='')=>{
    if(!sourceId)return notify('Primero selecciona una foto original.');
   if(kind==='preserve')return notify('Para mantener exactamente tu foto original, utiliza Diseño editorial. La IA crea una imagen nueva y puede alterar el rostro.');
    if(!library.some(a=>a.id===sourceId))return notify('Esta foto está guardada en otra marca. Vuelve a subirla desde '+brand.name+'.');
    if(!await askCredits('photo',1,'Generar una foto de prueba'))return;
    setBusy('test-photo');setTestPhoto('');
    try{
      const {data}=await api.post('/api/ai-image',{
        brandId:brand.id,assetId:sourceId,referenceId,mode:'variation',subjectType:kind,creativeSettings,
        prompt:(brief.trim()||'Photograph one authentic premium lifestyle image of the supplied real subject, with believable light, materials and meaningful context. No text or fabricated logos.')+(referenceId?' Style reference may influence ONLY: '+referenceFocus.join(', ')+'. Never replace the subject.':'')+(variation?' ADDITIONAL CHANGE FOR THIS NEW GENERATION: '+variation:'')
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
    if(autoTimer.current)clearTimeout(autoTimer.current);
    await saveQueue.current.catch(()=>{});
    setSaveState('saving');
    try{
      const {data}=await api.put('/api/grids/'+g.id,{title:g.title,posts:g.posts});
      const next=data as Grid;
      savedSignature.current[g.id]=signature(next);
      setGrids(old=>old.map(x=>x.id===next.id?next:x));
      if(gridRef.current?.id===g.id&&signature(gridRef.current)===signature(g))setSaveState('saved');
      return next;
    }catch(e){setSaveState('error');throw e}
  };
  const generateOne=async(g:Grid,i:number)=>{
    const {data}=await api.post('/api/grid-image',{gridId:g.id,index:i});
    const next=data.grid as Grid;const a=data.asset as Asset;
    savedSignature.current[next.id]=signature(next);
    setGrid(next);setSaveState('saved');setGrids(old=>old.map(x=>x.id===next.id?next:x));
    onNewAsset(a,'data:'+a.mime+';base64,'+data.content);
    setSessionPhotos(n=>n+1);
    return next;
  };
  const generate=async(i:number)=>{
    if(!grid)return;
    if(grid.posts[i].design&&grid.kind==='preserve')return notify('Este diseño editorial usa la foto original y no necesita generar otra con IA. Edita el fondo o descarga el PNG.');
    if(!await askCredits('photo',1,'Generar post '+(i+1)))return;
    setBusy('image-'+i);
    try{const saved=await save(grid);await generateOne(saved,i);notify('Post '+(i+1)+' generado. Los demás no se cambiaron.')}
    catch(e){showError(e)}finally{setBusy('')}
  };
  const generateRemaining=async(initial:Grid)=>{
    let g=initial;
    for(let i=0;i<9;i++){
      if(g.posts[i].assetId||g.posts[i].design&&g.kind==='preserve')continue;
      setBusy('image-'+i);
      g=await generateOne(g,i);
    }
    return g;
  };
  const generateAll=async()=>{
    if(!grid)return;
    if(grid.posts.every(p=>!!p.design)&&grid.kind==='preserve')return notify('Estos nueve diseños editoriales utilizan tu fotografía original; puedes editarlos y descargarlos sin gastar cuota de IA.');
    const remaining=grid.posts.filter(p=>!p.assetId&&!(p.design&&grid.kind==='preserve')).length;
    if(!remaining)return notify('Ya tienes todas las fotos que necesitas.');
    if(!await askCredits('photo',remaining,'Generar '+remaining+' fotos pendientes'))return;
    try{const g=await save(grid);await generateRemaining(g);notify('Fotos pendientes generadas. Revísalas antes de publicar.')}
    catch(e){showError(e);notify('Las fotos terminadas se conservan. Puedes continuar generando las pendientes.')}
    finally{setBusy('')}
  };
  const download=async(i:number)=>{
    if(!grid)return;
    if(!images[grid.sourceId]&&(!grid.posts[i].assetId||!images[grid.posts[i].assetId]))return notify('Carga primero tu foto principal.');
    if(!grid.posts[i].design&&(!grid.posts[i].assetId||!images[grid.posts[i].assetId]))return notify('Genera primero una foto nueva para este post.');
    try{const c=await poster(grid.posts[i],i,grid,brand,images,exportSize);
      const a=document.createElement('a');a.download='brand-grid-post-'+String(i+1).padStart(2,'0')+'-'+EXPORT_SIZES[exportSize].w+'x'+EXPORT_SIZES[exportSize].h+'.png';a.href=c.toDataURL('image/png');a.click();notify('PNG del post '+(i+1)+' descargado.');
    }catch(e){showError(e)}
  };
  const prepare=async()=>{
    if(!grid)return;
    if(grid.posts.some(p=>!(p.design&&images[grid.sourceId])&&(!p.assetId||!images[p.assetId])))return notify('Faltan algunas fotos o diseños finales por preparar.');
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
      const p=grid.posts[i];
      const image=p.design&&grid.kind==='preserve'?images[grid.sourceId]:p.assetId?images[p.assetId]:null;
      if(!image){pending++;continue;}
      // Reusing the SAME genuine original is intentional in editorial design.
      // Only duplicate generated assets are a QA problem, not the original photo.
      if(p.assetId&&used.has(p.assetId))found.push('Posts '+(used.get(p.assetId)!+1)+' y '+(i+1)+': usan el mismo archivo generado.');
      if(p.assetId)used.set(p.assetId,i);
      if(!p.headline?.trim())found.push('Post '+(i+1)+': falta el titular.');
      const result=await composeGridPoster(p,i,brand,{photo:image,original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'&&!p.design},exportSize);
      if(!result.fit)found.push('Post '+(i+1)+': el titular no cabe. Reduce tamaño o palabras.');
      if(result.contrast<3)found.push('Post '+(i+1)+': contrasta poco con el fondo; revisa legibilidad.');
      if(!(p.design&&grid.kind==='preserve')){
        const hash=await imageFingerprint(image);
        for(const prev of hashes)if(hamming(hash,prev.value)<=5){found.push('Posts '+(prev.n+1)+' y '+(i+1)+': fotos generadas muy similares; revísalas.');break;}
        hashes.push({n:i,value:hash});
      }
     }
     if(pending>0)found.unshift(pending+' de 9 publicaciones sin diseño exportable. Si quieres conservar tu retrato, usa un diseño editorial con la foto original. Si quieres escenas nuevas, genera cada foto con IA.');
     else found.unshift('Las 9 publicaciones tienen una imagen final. Revisa las indicaciones antes de exportar.');
     found.push('Inspección visual pendiente: revisa etiquetas, manos, logos y que el producto sea fiel al original.');
     setQaNotes(found);setReviewed(false);
     notify(pending>0?'Hay '+pending+' fotos finales pendientes. Conservé todas tus ideas y fotografías originales.':'Revisión terminada. Comprueba los avisos antes de exportar.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const gridPending=grid?.posts.filter(p=>!(p.design&&images[grid.sourceId])&&(!p.assetId||!images[p.assetId])).length||0;
  const tile=grid?.posts[selected];
  return <div className="brand-grid-tool">
    {creditPrompt&&<div className="bg-credit-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)respondCredits(false)}}>
      <div className="bg-credit-dialog" role="dialog" aria-modal="true" aria-labelledby="bg-credit-title">
        <div className="bg-credit-symbol"><Sparkles size={23}/></div>
        <h2 id="bg-credit-title">{creditPrompt.title}</h2>
        <p>Esta acción usará <strong>{creditPrompt.units} {creditPrompt.kind==='photo'?'crédito'+(creditPrompt.units===1?' de foto':'s de fotos'):'créditos creativos'}</strong> de tu Content Lab.</p>
        <p className="bg-credit-info">{wallet?.admin?'Cuenta de propietaria: sujeto al límite global de Cloudflare.':
          wallet?'Disponibles hoy: '+available(creditPrompt.kind)+' · Límite diario 10.': 'Supabase comprobará el saldo y el límite diario antes de comenzar.'}</p>
        <p className="bg-credit-hint">Los fondos, las letras y los PNG editados sin IA no gastan créditos.</p>
        <div className="bg-credit-buttons"><button type="button" className="btn ghost" onClick={()=>respondCredits(false)}>Cancelar</button>
          <button type="button" className="btn dark" onClick={()=>respondCredits(true)}>Confirmar y generar <ArrowRight size={16}/></button>
        </div>
      </div>
    </div>}
    <div className="bg-head"><div><div className="eyebrow">VISUAL CONTENT ENGINE · {brand.name.toUpperCase()}</div><h1>1 Photo. <em>9 Posts.</em></h1><p>Una foto. Hasta nueve diseños diferentes, con IA opcional y texto editable.</p><div className="bg-language"><Check size={15}/> Idioma del contenido: <strong>{outputLanguage}</strong> · {brand.name}</div></div><div className="bg-3x3"><LayoutGrid size={29}/><strong>3 × 3</strong><small>BRAND FEED</small></div></div>
    <div className="bg-layout"><div className="bg-column">
      <div className="bg-box"><div className="bg-title"><span>01</span><div><h3>Sube tu foto</h3><p>Directamente desde Fotos o Archivos.</p></div></div>
        <div className="bg-uploads">
          <label className="bg-drop"><div>{images[sourceId]?<img src={images[sourceId]} alt="Foto original"/>:<ImagePlus size={28}/>}</div><strong>{uploading==='source'?'Preparando…':'01 · Foto original *'}</strong><small>Persona o producto que debemos conservar</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'source')}/></label>
          <label className="bg-drop"><div>{images[referenceId]?<img src={images[referenceId]} alt="Referencia"/>:<Palette size={28}/>}</div><strong>{uploading==='reference'?'Preparando…':'02 · Referencia de estilo'}</strong><small>Solo inspira el estilo, no sustituye al sujeto</small><input type="file" accept="image/*,.heic,.heif" onChange={e=>upload(e.target.files?.[0],'reference')}/></label>
        </div>
        <div className="bg-account-note">Fotos para <strong>{brand.name}</strong>. Biblioteca privada por marca.</div>
         {referenceId&&<div className="bg-reference-focus"><strong>¿Qué quieres tomar de esta referencia?</strong><div>{[{id:'palette',label:'Colores'},{id:'composition',label:'Composición'},{id:'lighting',label:'Iluminación'},{id:'outfit',label:'Outfit'},{id:'pose',label:'Pose'}].map(item=><label key={item.id}><input type="checkbox" checked={referenceFocus.includes(item.id)} onChange={e=>setReferenceFocus(a=>e.target.checked?[...a,item.id]:a.filter(x=>x!==item.id))}/>{item.label}</label>)}</div><small>La IA recibe únicamente las instrucciones marcadas; no debe copiar rostros ni logos ajenos.</small></div>}
         {chosenFormat&&<div className="bg-account-note">✓ Formato elegido: <strong>{chosenFormat}</strong>. Se aplicará al primer post.</div>}
        {(wrongOriginal||wrongReference)&&<p role="alert" className="bg-connection-error">Una foto pertenece a otra marca. Cambia de cuenta o vuelve a subir la foto desde {brand.name}.</p>}
        <button className="bg-link" onClick={()=>setChooseExisting(v=>!v)}>{chooseExisting?'Ocultar biblioteca':'O usar fotos ya guardadas'} <ArrowRight size={15}/></button>
        {chooseExisting&&<div className="bg-saved-select"><select value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Foto principal</option>{library.map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select><select value={referenceId} onChange={e=>setReferenceId(e.target.value)}><option value="">Sin referencia</option>{library.filter(a=>assetCategory(a)==='reference'||a.id===brand.referenceAssetId).map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select></div>}
        <div className="editorial-mode">
          <strong>¿Qué quieres crear?</strong>
          <div className="bg-modes">
            <button type="button" className={designMode==='editorial'?'selected':''} onClick={()=>setDesignMode('editorial')}><strong>Diseño editorial completo</strong><small>Fondo + foto + tipografía + anotaciones</small></button>
            <button type="button" className={designMode==='photo'?'selected':''} onClick={()=>setDesignMode('photo')}><strong>Campaña fotográfica</strong><small>Fotos nuevas con IA</small></button>
          </div>
          {designMode==='editorial'&&<><label htmlFor="style-reference">Dirección de arte</label>
            <select id="style-reference" value={designPreset} onChange={e=>setDesignPreset(e.target.value as 'reference'|EditorialPreset)}>
              <option value="reference">Adaptar la referencia que subí</option>
              {EDITORIAL_PRESETS.map(p=><option key={p.id} value={p.id}>{p.name} — {p.description}</option>)}
            </select>
            <p className="bg-note">Con una foto original puedes crear publicaciones completas sin gastar cuota en fotos nuevas. La referencia inspira el estilo; puedes ajustar fuentes, textos y colores.</p>
          </>}
        </div>
        <label>Tipo de sujeto para generar con IA</label><div className="bg-modes">
          <button type="button" className={kind==='portrait'?'selected':''} onClick={()=>setKind('portrait')}><strong>Persona / retrato</strong><small>Misma cara · anatomía natural</small></button>
          <button type="button" className={kind==='product'?'selected':''} onClick={()=>setKind('product')}><strong>Producto</strong><small>Escenas de producto</small></button>
          <button type="button" className={kind==='preserve'?'selected':''} onClick={()=>setKind('preserve')}><strong>Foto / App intacta</strong><small>Solo diseño editorial, sin IA</small></button>
         </div>
        <div className="bg-prompt-hub"><div><strong>Prompt Helper · 30 recetas</strong>
         <small>{creativeSettings?'✓ Prompt y ajustes importados de tu biblioteca privada':'Escribe tu prompt libre o abre la biblioteca para recibir ayuda.'}</small></div>
         <button type="button" className="btn ghost" onClick={()=>onOpenPrompts?.()}>Abrir Prompt Studio <ArrowRight size={15}/></button>
        </div>
        <label>Tu idea creativa / Your prompt</label><textarea rows={5} maxLength={1900} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Escribe exactamente lo que quieres crear. La IA lo combinará con el Brand Kit y reglas de fotografía realista."/>
        <small className="bg-note">{kind==='portrait'?'Retrato: se prioriza conservar tu cara y generar escenarios reales sin tarimas. Revisa siempre las manos, dedos y pies; la IA puede equivocarse.':kind==='preserve'?'Conservar intacta: elige Diseño editorial y descarga tu foto original con texto y diseño; no necesitas generar otra imagen.':'Producto: el generador crea escenas de objetos, no retratos humanos.'} La IA no garantiza fidelidad exacta. No se hacen reintentos automáticos que gasten créditos.</small>
        <div className="bg-test-controls">
          {isAdmin&&<><button className="btn ghost wide" disabled={!!busy||!!uploading} onClick={checkConnection}>
            {busy==='connection'?<LoaderCircle size={17} className="spin"/>:<Check size={17}/>}
            Comprobar conexión gratuita
          </button>
          {connection==='ready'&&<p className="bg-connection-ok">✓ Cuenta y token de Cloudflare conectados. Puedes probar una foto.</p>}
          {connection==='error'&&<p className="bg-connection-error">Cloudflare no respondió. Revisa los permisos del token en Supabase.</p>}</>}
          <button className="btn dark wide" disabled={!sourceId||!!busy||!!uploading||kind==='preserve'} onClick={()=>testOnePhoto()}>
            {busy==='test-photo'?<LoaderCircle size={17} className="spin"/>:<ImagePlus size={17}/>}
            {busy==='test-photo'?'Generando una foto…':'Generar 1 foto · 1 crédito IA'}
          </button>
          {testPhoto&&<div className="bg-test-result">
           <img src={testPhoto} alt="Foto generada con Cloudflare"/>
           <div className="bg-photo-variations"><strong>Otra versión desde la foto original · 1 crédito por resultado</strong>
             <div>
               <button disabled={!!busy} type="button" onClick={()=>testOnePhoto('More candid natural light, less staged, authentic textures and subtle imperfections.')}>Más natural</button>
               <button disabled={!!busy} type="button" onClick={()=>testOnePhoto('Premium editorial art direction, refined lighting and tactile materials without plastic shine.')}>Más editorial</button>
               <button disabled={!!busy} type="button" onClick={()=>testOnePhoto('Different camera viewpoint, credible wide composition, no duplicate objects.')}>Otro ángulo</button>
               <button disabled={!!busy} type="button" onClick={()=>testOnePhoto('Change ONLY the environmental setting and lighting, preserve the same real person facial identity if the source is a portrait.')}>Otro fondo</button>
                {kind==='portrait'&&<button disabled={!!busy} type="button" onClick={()=>testOnePhoto('Keep hands relaxed and natural, without extra, merged or missing fingers, correct limb joints, feet on normal real ground, no platforms or stages.')}>Manos naturales</button>}
             </div><small>Estas acciones crean otra imagen usando tu fotografía de referencia; no retocan píxeles de la foto generada.</small>
           </div>
           <button className="btn ghost" onClick={downloadTest}><Download size={16}/> Descargar PNG</button>
           <small>También guardada en tu biblioteca privada.</small>
          </div>}
        </div>
        <button className="btn ghost wide" disabled={!sourceId||!!busy||!!uploading} onClick={plan}>{busy==='plan'?<LoaderCircle size={17} className="spin"/>:<Sparkles size={17}/>} Preparar 9 ideas para mi grid</button><small className="bg-note">Preparar un grid con IA consume 3 créditos creativos. Cada foto generada consume 1 crédito de foto. Las ediciones editoriales y exportaciones sin IA no gastan créditos. Cloudflare también tiene una cuota compartida diaria.</small>
      </div>
      {own.length>0&&<div className="bg-box"><h3>Tus proyectos</h3><div className="bg-recent">{own.slice().reverse().map(g=><button key={g.id} onClick={()=>{flushDraft();setGrid(g);setSaveState('saved');setSourceId(g.sourceId);setReferenceId(g.referenceId);setKind(g.kind);setDesignMode(g.kind==='preserve'?'editorial':'photo');setBrief(g.brief);setSelected(0);setDownloads([])}}><LayoutGrid size={17}/>{g.title}<ArrowRight size={16}/></button>)}</div></div>}
    </div><div className="bg-results">
      {!grid?<div className="bg-empty"><div className="bg-empty-grid">{Array.from({length:9},(_,i)=><span key={i} style={{background:i%2?brand.background:brand.color}}/>)}</div><h3>Tu próximo feed comienza aquí.</h3><p>Sube una foto para generar nueve ideas visuales originales, cada una como publicación independiente.</p></div>:<>
        <div className="bg-result-head"><div><div className="eyebrow">02 · NUEVE POSTS INDEPENDIENTES</div><h2>{grid.title}</h2><p>{grid.concept}</p><span className={'bg-save-state '+saveState} role="status">
         {saveState==='saved'?'✓ Cambios guardados':saveState==='pending'?'Guardado automático pendiente…':saveState==='saving'?'Guardando cambios…':'No se pudieron guardar los cambios.'}
        </span></div><button className="btn ghost" disabled={busy==='export'} onClick={()=>save(grid).then(()=>notify('Grid guardado')).catch(showError)}><Save size={16}/> {saveState==='error'?'Reintentar':'Guardar ahora'}</button></div>
        <div className="v2-vision-status" role="status">{grid.analysisStatus==='vision'
         ? '✓ La IA observó la foto principal y la referencia de estilo al preparar los conceptos.'
         : 'Análisis visual no confirmado. El plan usa tu descripción escrita; comprueba el producto antes de generar fotos.'}</div>
        <div className="bg-feed">{grid.posts.map((t,i)=><button key={i} onClick={()=>setSelected(i)} className={'bg-feed-tile '+(selected===i?'active':'')} style={{background:i%3?brand.background:brand.color}}>
          <TileThumb tile={t} idx={i} grid={grid} brand={brand} images={images}/>
          <span className="bg-status">{String(i+1).padStart(2,'0')}/09 · {t.design&&grid.kind==='preserve'?'DISEÑO LISTO':t.assetId?'FOTO GENERADA':'CONCEPTO'}</span>
        </button>)}</div>
        <div className="v2-usage-note"><strong>{sessionPhotos} fotos nuevas generadas en esta sesión.</strong> La cuota Free de Cloudflare es compartida; este número no representa el saldo real. Preparar ideas y analizar referencias también puede usar cuota. La generación múltiple requiere tu confirmación.</div>
        <div className="bg-export-setting"><label htmlFor="grid-export-size">Formato final</label><select id="grid-export-size" value={exportSize} onChange={e=>{setExportSize(e.target.value as ExportSize);setDownloads([]);setQaNotes([]);setReviewed(false)}}>
           {(Object.keys(EXPORT_SIZES) as ExportSize[]).map(k=><option key={k} value={k}>{EXPORT_SIZES[k].title} ({EXPORT_SIZES[k].w} × {EXPORT_SIZES[k].h})</option>)}
          </select></div>
        <div className="bg-grid-actions">{!(grid.kind==='preserve'&&grid.posts.every(p=>p.design))&&
          <button className="btn dark" disabled={!!busy} onClick={generateAll}>{busy.startsWith('image-')?<LoaderCircle size={16} className="spin"/>:<Sparkles size={16}/>} Generar fotos pendientes</button>}
          {grid.kind==='preserve'&&grid.posts.every(p=>p.design)&&<p className="bg-free-design"><Check size={17}/> Tus nueve diseños usan la foto original. No necesitas generar imágenes con IA.</p>}
          <button className="btn ghost" disabled={!!busy||!reviewed||gridPending>0} onClick={prepare}><Download size={16}/> Preparar PNG separados</button></div>
        <div className="bg-qa-panel"><div><strong>Control de calidad</strong><p>Detecta fotos repetidas, titulares que no caben y publicaciones pendientes. No detecta automáticamente dedos, manos ni identidad facial: revísalos antes de aprobar. No genera más imágenes.</p></div>
          <button className="btn ghost" disabled={!!busy} onClick={checkQuality}>Revisar grid</button>
          {qaNotes.length>0&&<><div className="bg-qa-list" role="status">{qaNotes.map((note,i)=><p key={i}>{i===0?'':'• '}{note}</p>)}</div>
           {gridPending===0?<label className="bg-qa-confirm">
             <input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} aria-label="Confirmar revisión de todas las imágenes"/>
             <span>He revisado las nueve imágenes y apruebo el contenido para descargar.</span>
            </label>:<p className="bg-qa-pending">Primero genera las fotos finales. No necesitas marcar ninguna casilla para continuar editando tus conceptos.</p>}
          </>}
         </div>
        <div className="bg-editor"><div className="bg-title"><span>{String(selected+1).padStart(2,'0')}</span><div><h3>Editar post {selected+1}</h3><p>Esta publicación es independiente.</p></div></div>
          {tile&&<div className="editorial-settings">
            <div className="bg-title"><span><Palette size={17}/></span><div><h3>Diseño de arte</h3><p>Controles reales de fondo, letra y anotaciones. Se guardan con este post.</p></div></div>
            <label>Estilo del post</label>
            <select value={tile.design?.preset||'classic'} onChange={e=>update({design:e.target.value==='classic'?undefined:{...(tile.design||{preset:'portrait'}),preset:e.target.value as EditorialPreset}})}>
              <option value="classic">Composición clásica</option>
              {EDITORIAL_PRESETS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {tile.design&&<>
              <div className="editorial-fields">
                <label>Tipografía del título<select value={tile.design.font||'elegant'} onChange={e=>update({design:{...tile.design!,font:e.target.value as EditorialDesign['font']}})}>
                  <option value="elegant">Cormorant · Editorial serif</option><option value="modern">DM Sans · Moderna</option>
                  <option value="handwritten">Caveat · Manuscrita</option><option value="bold">Space Grotesk · Impactante</option>
                </select></label>
                <label>Fondo<select value={tile.design.background||'photo'} onChange={e=>update({design:{...tile.design!,background:e.target.value as EditorialDesign['background']}})}>
                  <option value="photo">Foto original a pantalla completa</option><option value="ivory">Papel cálido</option><option value="color">Color sólido</option><option value="gradient">Gradiente de marca</option>
                </select></label>
                <label>Color del fondo<input type="color" value={tile.design.backgroundColor||brand.background} onChange={e=>update({design:{...tile.design!,backgroundColor:e.target.value}})}/></label>
                <label>Color del texto<input type="color" value={tile.design.textColor||'#24231f'} onChange={e=>update({design:{...tile.design!,textColor:e.target.value}})}/></label>
                <label>Color de acento<input type="color" value={tile.design.accentColor||brand.color} onChange={e=>update({design:{...tile.design!,accentColor:e.target.value}})}/></label>
                 <label>Usar un tono de mi Brand Kit<select value={brandPalette(brand).includes((tile.design.accentColor||brand.color).toUpperCase())?(tile.design.accentColor||brand.color).toUpperCase():'custom'} onChange={e=>{if(e.target.value!=='custom')update({design:{...tile.design!,accentColor:e.target.value}})}}>
                   {brandPalette(brand).map((c,n)=><option key={c} value={c}>{n===0?'Principal':n===1?'Secundario':'Extra '+(n-1)} · {c}</option>)}
                   <option value="custom" disabled>Color personalizado</option>
                 </select></label>
                <label>Texto de revista / manuscrito<input value={tile.design.handwritten||''} placeholder="Ej. hi, I'm Dailin" onChange={e=>update({design:{...tile.design!,handwritten:e.target.value}})}/></label>
                <label>Etiqueta editorial<input value={tile.design.kicker||''} placeholder="Ej. ABOUT ME" onChange={e=>update({design:{...tile.design!,kicker:e.target.value}})}/></label>
                {(tile.design.preset==='annotated'||tile.design.preset==='magazine')&&[0,1,2,3].map(i=><label key={i}>Anotación {i+1}
                  <textarea rows={2} maxLength={140} placeholder="Escribe solo información real sobre tu marca" value={tile.design?.callouts?.[i]||''}
                    onChange={e=>{const items=[...(tile.design?.callouts||[])];items[i]=e.target.value;update({design:{...tile.design!,callouts:items}})}}/>
                </label>)}
                <label>Intensidad del contraste de la foto
                  <input type="range" min={0} max={0.65} step={0.05} value={tile.design.overlay??.13} onChange={e=>update({design:{...tile.design!,overlay:Number(e.target.value)}})}/>
                </label>
              </div>
            </>}
          </div>}
          <label>Formato visual · 20 composiciones diferentes</label><select value={tile?.format||CREATIVE_FORMATS[selected]} onChange={e=>update({format:e.target.value})}>{CREATIVE_FORMATS.map(f=><option key={f}>{f}</option>)}</select>
          <label>Titular</label><input value={tile?.headline||''} onChange={e=>update({headline:e.target.value})}/>
          <label>Subtítulo</label><input value={tile?.subtext||''} onChange={e=>update({subtext:e.target.value})}/>
          <label>Caption</label><textarea rows={3} value={tile?.caption||''} onChange={e=>update({caption:e.target.value})}/>
          <label>Dirección de la foto</label><textarea rows={3} value={tile?.scene||''} onChange={e=>update({scene:e.target.value})}/>
          {tile&&<div className="bg-editor-preview-note">{!tile.assetId
              ? tile.design?'Vista previa editorial usando tu foto original: este diseño ya se puede exportar sin generar otra foto.':'Vista previa de diseño: todavía no se ha generado la foto final. Conservamos la original para planificar.'
              : 'Foto generada para este post. Puedes mover la imagen y el titular sin gastar créditos.'}</div>}
          {tile&&<FreeDecorControls backgroundId={tile.design?tile.design.backgroundPattern||'brand':tile.backgroundId||'brand'} stickerIds={tile.design?tile.design.stickerIds||[]:tile.stickerIds||[]}
              title="Stickers aesthetics & backgrounds · GRATIS"
              onChange={next=>tile.design?update({design:{...tile.design,backgroundPattern:next.backgroundId,stickerIds:next.stickerIds,...(next.backgroundId&&next.backgroundId!=='brand'?{background:'ivory' as const}:{})}}):update({backgroundId:next.backgroundId,stickerIds:next.stickerIds})}/>}
          {tile&&<GridVisualEditor tile={tile} index={selected} brand={brand} logo={images[brand.logoAssetId||'']} photo={tile.design&&grid.kind==='preserve'?images[grid.sourceId]:images[tile.assetId]} original={images[grid.sourceId]} preserve={grid.kind==='preserve'} exportSize={exportSize} onChange={layout=>update({layout})}/>}
          <p className="bg-note">El texto, la tipografía, los fondos y las anotaciones se componen como capas editables del PNG. La IA solo crea fotografías si pulsas «Generar este post».</p>
          <div className="bg-post-actions">{!(tile?.design&&grid.kind==='preserve')&&
            <button className="btn ghost" onClick={()=>generate(selected)} disabled={!!busy}>{busy==='image-'+selected?<LoaderCircle size={17} className="spin"/>:<RefreshCw size={17}/>} {tile?.assetId?'Regenerar esta foto (1 crédito)':'Generar foto con IA (1 crédito)'}</button>}
            <button className="btn dark" onClick={()=>download(selected)} disabled={!!busy}><Download size={17}/> Descargar PNG</button></div>
          <p className="bg-note">Modo editorial: la imagen original no se altera. Modo retrato: la IA crea otra foto, y puede cambiar detalles; comprueba rostro, manos, dedos, pies y fondo antes de publicar.</p>
        </div>
        {downloads.length>0&&<div className="bg-downloads"><h3><Check size={19}/> PNG individuales · {EXPORT_SIZES[exportSize].title}</h3><p>Descarga cada archivo por separado. Sin ZIP ni collages. Composiciones revisadas.</p><div>{downloads.map((v,i)=><a key={i} href={v.url} download={v.name}><Download size={15}/> Post {String(i+1).padStart(2,'0')}.png</a>)}</div></div>}
      </>}
    </div></div>
  </div>;
}
