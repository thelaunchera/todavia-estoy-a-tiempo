
import React,{useEffect,useRef,useState} from 'react';
import {api} from './platform/client';
import {Sparkles,Upload,ImagePlus,Download,RefreshCw,Save,Check,LoaderCircle,ArrowRight,Palette,LayoutGrid,Camera,CalendarDays} from 'lucide-react';
import './BrandGrid.css';
import {composeGridPoster,LAYOUTS,EXPORT_SIZES,type ExportSize,type VisualControls} from './GridComposer';
import GridVisualEditor from './GridVisualEditor';
import type {PromptControls} from './PromptEngine';
import {EDITORIAL_PRESETS,type EditorialDesign,type EditorialPreset} from './EditorialPoster';
import {brandPalette} from './BrandIdentity';
import FreeDecorControls from './FreeDecorControls';
import type {FreeBackgroundId} from './FreeDesignAssets';
import type {StickerPositions} from './TouchGeometry';
import {assetCategory,displayAssetName,type MediaCategory} from './MediaAsset';
import {ONE_PHOTO_NINE,onePhotoNinePrompt} from './OnePhotoNinePrompts';

type Brand={id:string;name:string;handle:string;language:string;color:string;background:string;secondaryColor?:string;additionalColors?:string[];headingFont?:string;bodyFont?:string;logoAssetId?:string;referenceAssetId?:string;photoMood?:string;avoid?:string;audience:string;rules:string};
type Asset={id:string;brandId:string;name:string;mime:string;category?:MediaCategory;displayName?:string;generated?:boolean;shared?:boolean;stickerGroup?:string};
type Tile={headline:string;subtext:string;caption:string;scene:string;assetId:string;format?:string;index:number;layout?:VisualControls;design?:EditorialDesign;backgroundId?:FreeBackgroundId;backgroundImageId?:string;stickerIds?:string[];stickerPositions?:StickerPositions;scheduledDate?:string;scheduledTime?:string;planningStatus?:'planned'|'published'};
type Grid={id:string;brandId:string;sourceId:string;referenceId:string;kind:string;title:string;concept:string;brief:string;planningSource?:'ai'|'template';analysisStatus?:'vision'|'fallback';visualDescription?:string;posts:Tile[]};
type Wallet={admin?:boolean;photo_remaining?:number;photo_today?:number;creative_remaining?:number;creative_today?:number;quota_day?:string};
type Props={brand:Brand;assets:Asset[];images:Record<string,string>;isAdmin?:boolean;wallet?:Wallet|null;promptSelection?:{version:number;text:string;settings:PromptControls}|null;initialSelection?:{version:number;brandId?:string;sourceId?:string;referenceId?:string;format?:string;openGridId?:string;openTileIndex?:number;fromCalendar?:boolean};onOpenPrompts?:()=>void;onOpenCalendar?:(date?:string)=>void;onOpenStickers?:()=>void;onUploadBackground:(file:File)=>Promise<Asset|null>;onUploadFile:(f:File,category?:MediaCategory)=>Promise<Asset|null>;locale?:'es'|'en';onNewAsset:(a:Asset,src:string)=>void;loadImage:(id:string)=>void;notify:(text:string)=>void;showError:(e:unknown)=>void};
export const CREATIVE_FORMATS=LAYOUTS.map(x=>x.name);
async function poster(tile:Tile,i:number,grid:Grid,brand:Brand,images:Record<string,string>,size:ExportSize='portrait'){
  return (await composeGridPoster(tile,i,brand,{
    photo:(tile.assetId&&images[tile.assetId])||((tile.design&&grid.kind==='preserve')?images[grid.sourceId]:images[tile.assetId]),
    original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'&&!tile.design&&!tile.assetId,stickerImages:images
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
    poster(tile,idx,grid,brand,images).then(canvas=>{
      if(!on){canvas.width=1;canvas.height=1;return;}
      const thumb=document.createElement('canvas');thumb.width=540;thumb.height=Math.round(540*canvas.height/canvas.width);
      const ctx=thumb.getContext('2d');if(ctx){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(canvas,0,0,thumb.width,thumb.height);setPreview(thumb.toDataURL('image/png'));}
      canvas.width=1;canvas.height=1;thumb.width=1;thumb.height=1;
    })
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
export default function BrandGrid({brand,assets,images,isAdmin=false,wallet,promptSelection,initialSelection,onOpenPrompts,onOpenCalendar,onOpenStickers,onUploadBackground,onUploadFile,locale='es',onNewAsset,loadImage,notify,showError}:Props){
  const [sourceId,setSourceId]=useState('');const [referenceId,setReferenceId]=useState('');
  const [designMode,setDesignMode]=useState<'editorial'|'photo'>('editorial');
  const [quickProduct,setQuickProduct]=useState('');
  const [quickMessage,setQuickMessage]=useState('');
  const [quickNotes,setQuickNotes]=useState('');
  const [copiedPrompt,setCopiedPrompt]=useState(false);
  const [expandedEditor,setExpandedEditor]=useState(false);
  const [chosenFormat,setChosenFormat]=useState('');
  const [referenceFocus,setReferenceFocus]=useState<string[]>(['palette','lighting','composition']);
  useEffect(()=>{
    if(!initialSelection?.version||initialSelection.brandId!==brand.id)return;
    setSourceId(initialSelection.sourceId||'');
    setReferenceId(initialSelection.referenceId||brand.referenceAssetId||'');
    setChosenFormat(initialSelection.format||'');
    setGrid(null);setSelected(0);setDownloads([]);setExpandedEditor(false);
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
  const openedCalendarVersion=useRef<number>(-1);
  const resultsRef=useRef<HTMLDivElement>(null);
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
  const library=assets.filter(a=>a.brandId===brand.id||a.shared),own=grids.filter(g=>g.brandId===brand.id);
  const wrongOriginal=!!sourceId&&!!assets.find(a=>a.id===sourceId&&a.brandId!==brand.id);
  const wrongReference=!!referenceId&&!!assets.find(a=>a.id===referenceId&&a.brandId!==brand.id);
  // Switching Instagram accounts must never retain the old account's selected photos.
  useEffect(()=>{
    flushDraft();
    const ownChoice=initialSelection?.brandId===brand.id?initialSelection:null;
    setSourceId(ownChoice?.sourceId||'');setReferenceId(ownChoice?.referenceId||brand.referenceAssetId||'');setChosenFormat(ownChoice?.format||'');
    setGrid(null);setSelected(0);setExpandedEditor(false);setQuickProduct('');setQuickMessage('');setQuickNotes('');
    setDownloads([]);setTestPhoto('');setConnection('unknown');setChooseExisting(false);setQaNotes([]);setReviewed(false);
  },[brand.id]);
  const outputLanguage=/todav[ií]a estoy a tiempo/i.test(brand.name)?'Español':/the launch era/i.test(brand.name)?'English':brand.language;
  useEffect(()=>{api.get('/api/grids').then(({data})=>setGrids(data.grids||[])).catch(showError)},[brand.id]);
  // Open the original 1 Photo → 9 Posts campaign at the selected calendar tile.
  useEffect(()=>{
    const selection=initialSelection;
    if(!selection?.fromCalendar||!selection.openGridId||selection.brandId!==brand.id||
       openedCalendarVersion.current===selection.version)return;
    const saved=grids.find(item=>item.id===selection.openGridId&&item.brandId===brand.id);
    if(!saved)return;
    openedCalendarVersion.current=selection.version;
    const index=Math.min(Math.max(0,selection.openTileIndex??0),Math.max(0,saved.posts.length-1));
    savedSignature.current[saved.id]=signature(saved);
    setGrid(saved);setSelected(index);setSourceId(saved.sourceId);
    setReferenceId(saved.referenceId);setKind(saved.kind);
    setDesignMode(saved.kind==='preserve'?'editorial':'photo');
    setBrief(saved.brief);setExpandedEditor(false);
    setDownloads([]);setReviewed(false);setSaveState('saved');
  },[initialSelection?.version,grids,brand.id]);
  useEffect(()=>{
    if(initialSelection?.fromCalendar&&grid?.id===initialSelection.openGridId){
      resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },[grid?.id,initialSelection?.openGridId,initialSelection?.version]);
  useEffect(()=>{for(const id of [sourceId,referenceId,brand.logoAssetId||'',grid?.sourceId||'',...(grid?.posts.map(p=>p.assetId)||[]),...(grid?.posts.flatMap(p=>[...(p.stickerIds||[]),...(p.design?.stickerIds||[]),...(p.backgroundImageId?[p.backgroundImageId]:[])])||[])].filter(Boolean))if(!images[id])loadImage(id)},[sourceId,referenceId,grid,images]);
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
  /** Instant nine-post editor, without AI charge and without altering the master image. */
  const createQuickNine=async()=>{
    if(!sourceId||!library.some(a=>a.id===sourceId&&a.brandId===brand.id))
      return notify('Primero sube una foto de producto a tu marca.');
    if(wrongOriginal)return notify('La foto pertenece a otra marca. Vuelve a subirla.');
    if(!quickProduct.trim())return notify('Escribe qué producto quieres mostrar.');
    if(busy||uploading)return;
    setBusy('quick-nine');
    try{
      const presets:EditorialPreset[]=['portrait','split','typographic','portrait','split','annotated','magazine','magazine','portrait'];
      const backgrounds:EditorialDesign['background'][]=['photo','ivory','gradient','photo','ivory','photo','ivory','gradient','photo'];
      const posts:Tile[]=ONE_PHOTO_NINE.map((item,index)=>({
        index,headline:index===0?quickMessage.trim().slice(0,120):'',subtext:'',caption:'',
        scene:item.name+' — '+item.short,assetId:'',
        format:CREATIVE_FORMATS[index%CREATIVE_FORMATS.length],
        design:{preset:presets[index],background:backgrounds[index],
          font:index%3===0?'bold':index%3===1?'elegant':'modern',
          backgroundColor:brand.background,accentColor:brand.color,
          kicker:'',handwritten:'',callouts:[],overlay:index%3===0?.12:.08}
      }));
      const {data}=await api.post('/api/grids',{
        brandId:brand.id,sourceId,referenceId:'',
        kind:'preserve',title:quickProduct.trim()+' · 9 posts',
        concept:'1 Photo → 9 Posts · 8 prompts del freebie + 1 escena editorial',
        brief:quickProduct.trim(),planningSource:'template',
        analysisStatus:'fallback',posts
      });
      const draft=data as Grid;
      savedSignature.current[draft.id]=signature(draft);
      setGrid(draft);setGrids(prev=>[...prev,draft]);setSelected(0);setExpandedEditor(false);
      setKind('preserve');setDesignMode('editorial');setSaveState('saved');
      setDownloads([]);setQaNotes([]);setReviewed(false);
      notify('Nueve ideas para organizar. Las imágenes se crean por separado en ChatGPT.');
    }catch(e){showError(e)}finally{setBusy('')}
  };
  const uploadChatGptResult=async(file:File|undefined)=>{
    if(!file||!grid)return;
    const targetGridId=grid.id,targetIndex=selected;
    setUploading('result');
    try{
      const asset=await onUploadFile(file,'original');
      if(!asset)return;
      setGrid(existing=>existing?.id===targetGridId
        ?{...existing,posts:existing.posts.map((p,i)=>i===targetIndex?{...p,assetId:asset.id}:p)}
        :existing);
      setDownloads([]);setReviewed(false);setQaNotes([]);
      notify('Imagen importada en el post '+(targetIndex+1)+'. La foto original permanece intacta.');
    }catch(e){showError(e)}finally{setUploading('')}
  };
  const uploadOwnBackground=async(file:File|undefined)=>{
    if(!file||!grid)return;
    const targetGridId=grid.id,targetIndex=selected;
    setUploading('background');
    try{
      const asset=await onUploadBackground(file);
      if(!asset)return;
      setGrid(existing=>existing?.id===targetGridId?
        {...existing,posts:existing.posts.map((item,i)=>i===targetIndex?
          {...item,backgroundImageId:asset.id,backgroundId:'brand',
            ...(item.design?{design:{...item.design,background:'ivory' as const}}:{})}:item)}:existing);
      setDownloads([]);setReviewed(false);setQaNotes([]);
      notify(locale==='es'?'Fondo guardado en esta publicación.':'Background saved for this post.');
    }catch(e){showError(e)}finally{setUploading('')}
  };
  const clearOwnBackground=()=>{
    update({backgroundImageId:'',backgroundId:'brand'});
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
      const image=(p.assetId&&images[p.assetId])||(p.design&&grid.kind==='preserve'?images[grid.sourceId]:null);
      if(!image){pending++;continue;}
      // Reusing the SAME genuine original is intentional in editorial design.
      // Only duplicate generated assets are a QA problem, not the original photo.
      if(p.assetId&&used.has(p.assetId))found.push('Posts '+(used.get(p.assetId)!+1)+' y '+(i+1)+': usan el mismo archivo generado.');
      if(p.assetId)used.set(p.assetId,i);
      if(!p.headline?.trim())found.push('Post '+(i+1)+': falta el titular.');
      const result=await composeGridPoster(p,i,brand,{photo:image,original:images[grid.sourceId],logo:images[brand.logoAssetId||''],preserve:grid.kind==='preserve'&&!p.design&&!p.assetId,stickerImages:images},exportSize);
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
  const isExpress=Boolean(grid&&grid.posts.length===9);
  const currentPrompt=grid?onePhotoNinePrompt(selected,{
    product:quickProduct.trim()||grid.brief||grid.title,
    brandName:brand.name,headline:tile?.headline,support:tile?.subtext,
    palette:[brand.background,brand.color,brand.secondaryColor,...(brand.additionalColors||[])].filter(Boolean).join(', '),
    language:outputLanguage,notes:quickNotes||brand.rules
  }):'';
  /** Export the exact completed image, without stamping template text over the result. */
  const downloadCompleted=async()=>{
    if(!tile?.assetId||!images[tile.assetId])return notify('Primero importa la imagen terminada de ChatGPT.');
    try{
      const image=new Image();image.src=images[tile.assetId];
      await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('No se pudo abrir el resultado'))});
      const W=EXPORT_SIZES[exportSize].w,H=EXPORT_SIZES[exportSize].h;
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo exportar PNG.');
      ctx.fillStyle=brand.background||'#FAF8F3';ctx.fillRect(0,0,W,H);
      const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
      const scale=Math.min(W/w,H/h),dw=w*scale,dh=h*scale;
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,(W-dw)/2,(H-dh)/2,dw,dh);
      const a=document.createElement('a');a.download='content-lab-post-'+(selected+1)+'-'+W+'x'+H+'.png';
      a.href=canvas.toDataURL('image/png');a.click();canvas.width=1;canvas.height=1;
      notify('Post '+(selected+1)+' descargado sin alterar su diseño.');
    }catch(e){showError(e)}
  };
  const saveAndReturnToCalendar=async()=>{
    const latest=gridRef.current;
    if(!latest)return;
    try{
      const saved=await save(latest);
      onOpenCalendar?.(saved.posts[selected]?.scheduledDate);
    }catch(error){showError(error)}
  };
  const openCalendar=()=>{
    flushDraft();
    void saveQueue.current.then(()=>onOpenCalendar?.());
  };
  const movePost=(direction:-1|1)=>{
    if(!grid||busy)return;
    const next=selected+direction;
    if(next<0||next>=grid.posts.length)return;
    const reordered=[...grid.posts];
    [reordered[selected],reordered[next]]=[reordered[next],reordered[selected]];
    setGrid(prev=>prev?{...prev,posts:reordered.map((item,index)=>({...item,index}))}:prev);
    setSelected(next);setDownloads([]);setReviewed(false);
    notify('Orden actualizado. Las fechas siguen vinculadas a sus publicaciones.');
  };
  const copyCurrentPrompt=async()=>{
    if(!currentPrompt)return;
    try{
      await navigator.clipboard.writeText(currentPrompt);
      setCopiedPrompt(true);notify('Prompt copiado. Pégalo en ChatGPT y adjunta tu foto original.');
    }catch{
      setCopiedPrompt(false);notify('Selecciona el prompt de abajo y cópialo manualmente.');
    }
  };
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
    <div className="bg-head"><div><div className="eyebrow">VISUAL CONTENT ENGINE · {brand.name.toUpperCase()}</div><h1>Visualiza <em>tu grid.</em></h1><p>Organiza hasta nueve imágenes hechas fuera del Lab. Mira cómo quedarán juntas en Instagram.</p><div className="bg-language"><Check size={15}/> Idioma del contenido: <strong>{outputLanguage}</strong> · {brand.name}</div></div><div className="bg-3x3"><LayoutGrid size={29}/><strong>3 × 3</strong><small>BRAND FEED</small></div></div>
    {!initialSelection?.fromCalendar&&<section className="bg-express" aria-label="Preparar campañas antiguas">
      <div className="bg-express-heading"><div><span className="eyebrow">MODO FÁCIL · SIN CRÉDITOS</span>
        <h2>Tu feed antes de publicar.</h2>
        <p>Elige un producto y empieza tu cuadrícula. Crea imágenes en ChatGPT con nuestros prompts, súbelas a cada espacio y organiza su publicación.</p></div>
        <span className="bg-express-free">Gratis dentro del Lab</span>
      </div>
      <div className="bg-express-content">
        <label className="bg-express-photo">
          {images[sourceId]?<img src={images[sourceId]} alt="Foto original seleccionada"/>:<ImagePlus size={31}/>}
          <span><strong>{uploading==='source'?'Subiendo foto…':images[sourceId]?'Cambiar foto':'1 · Sube una foto del producto'}</strong>
            <small>Usaremos esta misma foto sin modificarla</small></span>
          <input type="file" accept="image/*,.heic,.heif" aria-label="Subir foto principal para nueve posts" disabled={!!uploading} onChange={e=>{void upload(e.target.files?.[0],'source');e.target.value=''}}/>
        </label>
        <div className="bg-express-fields">
          <label>2 · ¿Qué producto es?
            <input value={quickProduct} maxLength={110} placeholder="Ej. Matcha, perfume, skincare, velas…" onChange={e=>setQuickProduct(e.target.value)}/>
          </label>
          <label>Mensaje que quieres mostrar (opcional)
            <input value={quickMessage} maxLength={120} placeholder="Ej. Made for your slow mornings" onChange={e=>setQuickMessage(e.target.value)}/>
          </label>
        </div>
        <button type="button" className="btn dark bg-express-create" onClick={createQuickNine} disabled={!sourceId||!quickProduct.trim()||!!busy||!!uploading}>
          {busy==='quick-nine'?<LoaderCircle size={17} className="spin"/>:<Sparkles size={17}/>}
          Crear mi grid de 9 espacios <ArrowRight size={17}/>
        </button>
      </div>
      <details className="bg-express-extras"><summary>¿Quieres añadir más dirección creativa? (opcional)</summary>
        <label>Estilo, ambiente o detalles que quieres conservar
          <textarea rows={2} value={quickNotes} maxLength={850} onChange={e=>setQuickNotes(e.target.value)} placeholder="Ej. luz de mañana, superficies naturales, sombra suave; mantener etiquetas exactas"/>
        </label>
      </details>
      <p className="bg-express-tip"><Check size={15}/> El Lab no genera imágenes ni edita reels: aquí puedes visualizar tu cuadrícula, subir fotos terminadas y asignar día y hora.</p>
    </section>}
    <div className="bg-layout"><div className="bg-column">
      {false&&<details className="bg-box bg-advanced-config"><summary>Herramientas avanzadas de propietaria · referencias, IA y dirección artística</summary>
      <div className="bg-advanced-config-content"><div className="bg-title"><span>01</span><div><h3>Sube tu foto</h3><p>Directamente desde Fotos o Archivos.</p></div></div>
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
      </div></details>}
      {own.length>0&&<details className="bg-box bg-saved-projects"><summary>Mis proyectos guardados ({own.length})</summary><div className="bg-recent">{own.slice().reverse().map(g=><button key={g.id} onClick={()=>{flushDraft();setGrid(g);setSaveState('saved');setSourceId(g.sourceId);setReferenceId(g.referenceId);setKind(g.kind);setDesignMode(g.kind==='preserve'?'editorial':'photo');setBrief(g.brief);setQuickProduct(g.brief||'');setQuickMessage('');setQuickNotes('');setCopiedPrompt(false);setExpandedEditor(false);setSelected(0);setDownloads([])}}><LayoutGrid size={17}/>{g.title}<ArrowRight size={16}/></button>)}</div></details>}
    </div><div ref={resultsRef} className="bg-results">
    {initialSelection?.fromCalendar&&initialSelection.brandId===brand.id&&
      initialSelection.openGridId===grid?.id&&
      <div className="bg-calendar-return">
        <span>✎ Editando el post {selected+1} de tu calendario</span>
        <div className="bg-calendar-edit-date">
          <label>Día<input type="date" value={grid?.posts[selected]?.scheduledDate||''}
            onChange={e=>update({scheduledDate:e.target.value,scheduledTime:grid?.posts[selected]?.scheduledTime||'09:00'})}/></label>
          <label>Hora<input type="time" value={grid?.posts[selected]?.scheduledTime||'09:00'}
            onChange={e=>update({scheduledTime:e.target.value})}/></label>
        </div>
        <button type="button" className="btn dark" disabled={!!busy||saveState==='saving'}
          onClick={()=>void saveAndReturnToCalendar()}>
          <Save size={16}/> Guardar y volver al calendario
        </button>
      </div>}

      {!grid?<div className="bg-empty"><div className="bg-empty-grid">{Array.from({length:9},(_,i)=><span key={i} style={{background:i%2?brand.background:brand.color}}/>)}</div><h3>Así se verá tu grid de Instagram.</h3><p>Arriba crea un grid vacío. Después añade tus imágenes terminadas, cambia el orden y revisa la composición.</p></div>:isExpress&&!expandedEditor?<>
        <section className="bg-compact-campaign" aria-label="Vista previa de tu grid de Instagram">
          <div className="bg-compact-campaign-head">
            <div><span className="eyebrow">VISTA PREVIA · GRID 3 × 3</span>
              <h2>{grid.title}</h2>
              <p>Vista real de tus nueve publicaciones. Toca cualquier casilla para subir o sustituir una foto.</p>
            </div>
            <span className="bg-compact-progress">{grid.posts.filter(p=>p.assetId).length}/9 imágenes cargadas</span>
          </div>
          <div className="bg-compact-nine" role="group" aria-label="Vista del grid con nueve publicaciones">
            {grid.posts.map((p,i)=><button type="button" key={i}
              className={'bg-compact-tile '+(selected===i?'active ':'')+(p.assetId?'complete':'idea')}
              aria-pressed={selected===i} aria-label={'Post '+(i+1)+': '+ONE_PHOTO_NINE[i].name}
              onClick={()=>{setSelected(i);setCopiedPrompt(false)}}>
              {p.assetId&&images[p.assetId]?<img src={images[p.assetId]} alt={'Imagen real del post '+(i+1)}/>:
                <><span className="bg-compact-index">{i+1}</span>
                <span className="bg-compact-placeholder">＋<small>Añadir foto</small></span></>}
              <span className="bg-compact-tile-status">{p.assetId?'✓':'＋ '+(i+1)}</span>
            </button>)}
          </div>
          <p className="bg-grid-preview-note">Así se verá aproximadamente tu grid. Las imágenes originales no se recortan ni se modifican.</p>
          <div className="bg-grid-reorder"><span>Post {selected+1} de 9</span>
            <button type="button" disabled={selected===0} onClick={()=>movePost(-1)}>← Mover antes</button>
            <button type="button" disabled={selected===8} onClick={()=>movePost(1)}>Mover después →</button>
          </div>
        </section>
        <section className="bg-compact-workspace" aria-label={'Preparar post '+(selected+1)}>
          <div className="bg-compact-workspace-head">
            <div><span className="eyebrow">POST {selected+1} DE 9</span>
              <h3>{ONE_PHOTO_NINE[selected].name}</h3>
              <p>{ONE_PHOTO_NINE[selected].short}</p></div>
            <button type="button" className="bg-compact-next" onClick={()=>{setSelected(i=>(i+1)%9);setCopiedPrompt(false)}}>Siguiente <ArrowRight size={15}/></button>
          </div>
          {tile?.assetId&&images[tile.assetId]&&<div className="bg-compact-real-preview"><img src={images[tile.assetId]} alt={'Imagen final del post '+(selected+1)}/></div>}
          {!tile?.assetId&&<p className="bg-compact-awaiting"><ImagePlus size={18}/> Tu foto final aparecerá aquí después de crearla en ChatGPT.</p>}
          <label className="bg-compact-custom-copy">Texto para esta imagen (opcional)
            <input value={tile?.headline||''} maxLength={120} placeholder="Déjalo vacío si quieres solo fotografía"
              onChange={e=>update({headline:e.target.value})}/>
          </label>
          <div className="bg-compact-plan">
            <div className="bg-compact-plan-title"><CalendarDays size={17}/><strong>¿Cuándo quieres publicar este post?</strong></div>
            <div className="bg-compact-plan-fields">
              <label>Día<input type="date" value={tile?.scheduledDate||''}
                onChange={e=>update({scheduledDate:e.target.value,scheduledTime:tile?.scheduledTime||'09:00'})}/></label>
              <label>Hora<input type="time" value={tile?.scheduledTime||'09:00'}
                onChange={e=>update({scheduledTime:e.target.value})}/></label>
            </div>
            <div className="bg-compact-plan-footer">
              <span>{tile?.scheduledDate?'✓ Día y hora en tu calendario (se guardan en este proyecto).':'Elige el día y la hora para añadirlo a tu calendario privado.'}</span>
              <button type="button" onClick={openCalendar}><CalendarDays size={15}/> Ver calendario y feed <ArrowRight size={14}/></button>
            </div>
          </div>
          <div className="bg-compact-main-actions">
            <button type="button" className="btn dark" onClick={()=>{void copyCurrentPrompt()}}>
              <Sparkles size={17}/>{copiedPrompt?'✓ Copiado':'1 · Copiar prompt'}
            </button>
            <a className="btn ghost" target="_blank" rel="noopener noreferrer" href="https://chatgpt.com/">
              2 · Abrir ChatGPT <ArrowRight size={16}/>
            </a>
          </div>
          <p className="bg-compact-help">En ChatGPT pega el prompt y adjunta tu foto original. Genera una sola imagen vertical 4:5, descárgala y súbela aquí.</p>
          <label className="bg-result-upload bg-compact-import">
            <Upload size={20}/><span><strong>{uploading==='result'?'Importando…':'3 · Subir imagen creada'}</strong>
              <small>Se guarda en el post {selected+1}, sin reemplazar la foto original.</small></span>
            <input type="file" accept="image/*,.heic,.heif" disabled={!!uploading}
              aria-label={'Subir imagen final para el post '+(selected+1)}
              onChange={e=>{void uploadChatGptResult(e.target.files?.[0]);e.target.value=''}}/>
          </label>
          {tile?.assetId&&<div className="bg-compact-download">
            <button type="button" className="btn dark" onClick={()=>{void downloadCompleted()}}>
              <Download size={17}/> Descargar PNG del post {selected+1}
            </button>
          </div>}
          <details className="bg-compact-prompt-details"><summary>Ver instrucciones completas de esta composición</summary>
            <textarea value={currentPrompt} rows={7} readOnly aria-label="Prompt completo para ChatGPT" onFocus={e=>e.currentTarget.select()}/>
          </details>
          <button type="button" className="bg-compact-advanced-link" onClick={()=>onOpenPrompts?.()}>
            Abrir biblioteca de prompts <ArrowRight size={14}/>
          </button>
        </section>
        <p className="bg-compact-save-state">{saveState==='saved'?'✓ Proyecto guardado':saveState==='error'?'Error al guardar; revisa tu conexión.':'Guardando cambios…'}</p>
        </>:<>
        {isExpress&&<button type="button" className="bg-compact-return" onClick={()=>setExpandedEditor(false)}>← Volver a la vista sencilla</button>}
        <div className="bg-result-head"><div><div className="eyebrow">02 · NUEVE POSTS INDEPENDIENTES</div><h2>{grid.title}</h2><p>{grid.concept}</p><span className={'bg-save-state '+saveState} role="status">
         {saveState==='saved'?'✓ Cambios guardados':saveState==='pending'?'Guardado automático pendiente…':saveState==='saving'?'Guardando cambios…':'No se pudieron guardar los cambios.'}
        </span></div><button className="btn ghost" disabled={busy==='export'} onClick={()=>save(grid).then(()=>notify('Grid guardado')).catch(showError)}><Save size={16}/> {saveState==='error'?'Reintentar':'Guardar ahora'}</button></div>
        <div className="v2-vision-status" role="status">{grid.analysisStatus==='vision'
         ? '✓ La IA observó la foto principal y la referencia de estilo al preparar los conceptos.'
         : 'Análisis visual no confirmado. El plan usa tu descripción escrita; comprueba el producto antes de generar fotos.'}</div>
        <div className="bg-feed">{grid.posts.map((t,i)=><button key={i} onClick={()=>{setSelected(i);setCopiedPrompt(false)}} className={'bg-feed-tile '+(selected===i?'active':'')} style={{background:i%3?brand.background:brand.color}}>
          <TileThumb tile={t} idx={i} grid={grid} brand={brand} images={images}/>
          <span className="bg-status">{i+1}/9 · {t.assetId?'FOTO LISTA':t.design&&grid.kind==='preserve'?'DISEÑO EDITABLE':'CONCEPTO'}</span>
        </button>)}</div>
        {isExpress&&<section className="bg-chatgpt-workflow" aria-label="Crear fotografías con los nueve prompts de ChatGPT">
          <div className="bg-chatgpt-heading"><div><span className="eyebrow">PASO 2 · CREA TU IMAGEN REAL</span>
            <h3>9 direcciones creativas para ChatGPT</h3>
            <p>Prompts completos: una sola imagen por resultado, producto fiel a tu foto original, sin collages y con composición editorial distinta.</p></div>
            <a href="prompts/" target="_blank" rel="noopener noreferrer">Ver el freebie original</a>
          </div>
          <div className="bg-prompt-tiles">{ONE_PHOTO_NINE.map((entry,n)=><button key={entry.name} type="button"
            className={selected===n?'active':''} aria-pressed={selected===n} onClick={()=>{setSelected(n);setCopiedPrompt(false)}}>
            <strong>{n+1}. {entry.name}</strong><small>{entry.short}{n===8?' · BONUS':''}</small></button>)}</div>
          <h4>Prompt del post {selected+1} · {ONE_PHOTO_NINE[selected].name}</h4>
          <textarea className="bg-prompt-text" rows={6} value={currentPrompt} readOnly aria-label={'Prompt para ChatGPT de la publicación '+(selected+1)} onFocus={e=>e.currentTarget.select()}/>
          <div className="bg-prompt-actions">
            <button type="button" className="btn ghost" onClick={()=>{void copyCurrentPrompt()}}><Check size={15}/>{copiedPrompt?'Copiado ✓':'Copiar prompt'}</button>
            <a className="btn dark" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" onClick={()=>{void copyCurrentPrompt()}}>
              Abrir ChatGPT <ArrowRight size={16}/>
            </a>
          </div>
          <p className="bg-chatgpt-steps"><strong>En ChatGPT:</strong> pega el prompt, adjunta la foto original y pide una sola imagen 4:5. Guarda esa imagen y vuelve aquí. El Content Lab no envía fotos a ChatGPT automáticamente.</p>
          <label className="bg-result-upload"><Upload size={20}/><span><strong>{uploading==='result'?'Importando…':'Subir aquí la imagen creada en ChatGPT'}</strong><small>Se coloca en el post {selected+1}, sin sustituir la foto maestra. Puedes seguir editando el PNG.</small></span>
            <input type="file" accept="image/*,.heic,.heif" aria-label={'Añadir imagen de ChatGPT al post '+(selected+1)} disabled={!!uploading}
              onChange={e=>{void uploadChatGptResult(e.target.files?.[0]);e.target.value=''}}/>
          </label>
        </section>}
        {isAdmin&&<div className="v2-usage-note"><strong>{sessionPhotos} fotos nuevas generadas en esta sesión.</strong> La cuota de Cloudflare es compartida; este número no representa el saldo real.</div>}
        <div className="bg-export-setting"><label htmlFor="grid-export-size">Formato final</label><select id="grid-export-size" value={exportSize} onChange={e=>{setExportSize(e.target.value as ExportSize);setDownloads([]);setQaNotes([]);setReviewed(false)}}>
           {(Object.keys(EXPORT_SIZES) as ExportSize[]).map(k=><option key={k} value={k}>{EXPORT_SIZES[k].title} ({EXPORT_SIZES[k].w} × {EXPORT_SIZES[k].h})</option>)}
          </select></div>
        <div className="bg-grid-actions">{isAdmin&&!(grid.kind==='preserve'&&grid.posts.every(p=>p.design))&&
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
          <div className="bg-touch-assets" aria-label={locale==='es'?'Tus fotos y fondos':'Your photos and backgrounds'}>
             <label className="bg-touch-upload">
               <ImagePlus size={20}/>
               <span><strong>{locale==='es'?'Subir mi foto':'Upload my photo'}</strong>
                <small>{locale==='es'?'Cambia solo esta publicación':'Change this post only'}</small></span>
               <input type="file" accept="image/*,.heic,.heif" disabled={!!uploading}
                 aria-label={locale==='es'?'Subir mi foto en esta publicación':'Upload my photo to this post'}
                 onChange={e=>{const file=e.target.files?.[0];e.target.value='';void uploadChatGptResult(file)}}/>
             </label>
             <label className="bg-touch-upload">
               <Palette size={20}/>
               <span><strong>{locale==='es'?'Subir mi fondo':'Upload my background'}</strong>
                <small>{locale==='es'?'Tu imagen detrás del diseño':'Your image behind the design'}</small></span>
               <input type="file" accept="image/*,.heic,.heif" disabled={!!uploading}
                 aria-label={locale==='es'?'Subir fondo propio para esta publicación':'Upload custom background for this post'}
                 onChange={e=>{const file=e.target.files?.[0];e.target.value='';void uploadOwnBackground(file)}}/>
             </label>
           </div>
           {tile?.backgroundImageId&&<button type="button" className="bg-touch-clear" onClick={clearOwnBackground}>
             {locale==='es'?'Quitar fondo personalizado':'Remove custom background'}
           </button>}
           <label>Formato visual · 20 composiciones diferentes</label><select value={tile?.format||CREATIVE_FORMATS[selected]} onChange={e=>update({format:e.target.value})}>{CREATIVE_FORMATS.map(f=><option key={f}>{f}</option>)}</select>
          <label>Titular</label><input value={tile?.headline||''} onChange={e=>update({headline:e.target.value})}/>
          <label>Subtítulo</label><input value={tile?.subtext||''} onChange={e=>update({subtext:e.target.value})}/>
          <label>Caption</label><textarea rows={3} value={tile?.caption||''} onChange={e=>update({caption:e.target.value})}/>
          <label>Dirección de la foto</label><textarea rows={3} value={tile?.scene||''} onChange={e=>update({scene:e.target.value})}/>
          {tile&&<div className="bg-editor-preview-note">{!tile.assetId
              ? tile.design?'Vista previa editorial usando tu foto original: este diseño ya se puede exportar sin generar otra foto.':'Vista previa de diseño: todavía no se ha generado la foto final. Conservamos la original para planificar.'
              : 'Foto generada para este post. Puedes mover la imagen y el titular sin gastar créditos.'}</div>}
          {tile&&<FreeDecorControls preferenceScope={brand.id} backgroundId={tile.design?tile.design.backgroundPattern||'brand':tile.backgroundId||'brand'} backgroundImageId={tile.backgroundImageId||''} stickerIds={tile.design?tile.design.stickerIds||[]:tile.stickerIds||[]}
              title="Stickers aesthetics & backgrounds"
              assets={assets.filter(a=>a.brandId===brand.id||a.shared)} images={images} loadImage={loadImage} onOpenLibrary={onOpenStickers} onUploadBackground={onUploadBackground}
              onChange={next=>tile.design?update({backgroundImageId:next.backgroundImageId,design:{...tile.design,backgroundPattern:next.backgroundId,stickerIds:next.stickerIds,...((next.backgroundImageId||next.backgroundId&&next.backgroundId!=='brand')?{background:'ivory' as const}:{})}}):update({backgroundId:next.backgroundId,backgroundImageId:next.backgroundImageId,stickerIds:next.stickerIds})}/>}
          {tile&&<GridVisualEditor tile={tile} index={selected} brand={brand} logo={images[brand.logoAssetId||'']} photo={(tile.assetId&&images[tile.assetId])||((tile.design&&grid.kind==='preserve')?images[grid.sourceId]:images[tile.assetId])} original={images[grid.sourceId]} preserve={grid.kind==='preserve'&&!tile.assetId} stickerImages={images} locale={locale} exportSize={exportSize} onChange={layout=>update({layout})} onStickerChange={stickerPositions=>update({stickerPositions})}/>}
          <p className="bg-note">El texto, las fotos, los fondos y las anotaciones se editan y exportan como PNG, sin generar fotografías con IA dentro del Lab.</p>
          <div className="bg-post-actions">{isAdmin&&!(tile?.design&&grid.kind==='preserve')&&
            <button className="btn ghost" onClick={()=>generate(selected)} disabled={!!busy}>{busy==='image-'+selected?<LoaderCircle size={17} className="spin"/>:<RefreshCw size={17}/>} {tile?.assetId?'Regenerar esta foto (1 crédito)':'Generar foto con IA (1 crédito)'}</button>}
            <button className="btn dark" onClick={()=>download(selected)} disabled={!!busy}><Download size={17}/> Descargar PNG</button></div>
          <p className="bg-note">Modo editorial: tu imagen original se conserva. Puedes cambiar la composición y descargar tu diseño.</p>
        </div>
        {downloads.length>0&&<div className="bg-downloads"><h3><Check size={19}/> PNG individuales · {EXPORT_SIZES[exportSize].title}</h3><p>Descarga cada archivo por separado. Sin ZIP ni collages. Composiciones revisadas.</p><div>{downloads.map((v,i)=><a key={i} href={v.url} download={v.name}><Download size={15}/> Post {String(i+1).padStart(2,'0')}.png</a>)}</div></div>}
      </>}
    </div></div>
  </div>;
}
