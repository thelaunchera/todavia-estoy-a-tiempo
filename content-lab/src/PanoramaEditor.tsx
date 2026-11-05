import React, { useEffect, useRef, useState } from 'react';
import {createPortal} from 'react-dom';
import { ImagePlus, Maximize2, Minimize2, Upload, Trash2, Undo2, Redo2, Type, Shapes, Layers3, Pencil, Check, X, Sticker, Palette } from 'lucide-react';
import TouchLayerCanvas, { type TouchLayer } from './TouchLayerCanvas';
import type { TouchRect } from './TouchGeometry';
import type { PanoramaLayer } from './PanoramaLayers';
import { assetCategory, displayAssetName, cleanAssetName, type LibraryAsset } from './MediaAsset';
import './PanoramaEditor.css';
import type {StickerCopyResult} from './CarouselStickerCopy';

type Point = {x: number; y: number};
type Props = {
  preview: string; textOverlay?: string; count: number; seamless: boolean; layers: TouchLayer[];
  pageIndex?:number;onPageIndexChange?:(index:number)=>void;
  canExtendBackground?:boolean;onExtendBackground?:()=>void;focusLayerId?:string;
  assets: LibraryAsset[]; images: Record<string, string>; loadImage: (id: string) => void; brandId:string;
  onUploadToLibrary:(files:File[],kind:'photo'|'sticker')=>Promise<void>;
  onRenameAsset:(asset:LibraryAsset,name:string)=>Promise<void>;
  onCommit: (kind: 'photo' | 'sticker' | 'text' | 'shape', id: string, rect: TouchRect) => void;
  onUpdate: (id:string,patch:Partial<PanoramaLayer>)=>void;
  onAddLayer: (kind:'text'|'shape',shape?:PanoramaLayer['shape'])=>void;
  onCopySticker?:(id:string,targetIndex:number)=>StickerCopyResult;
  onToggleLock?:(id:string,locked:boolean)=>void;
  onDuplicateText?:(id:string)=>void;
  onDuplicateLayer?:(id:string)=>void;
  onUndo:()=>void;onRedo:()=>void;canUndo:boolean;canRedo:boolean;
  onAdd: (assetId: string, point: Point) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, move: 'backward' | 'forward' | 'back' | 'front') => void;
  textElements: {id: string; name: string; preview: string}[];
  onRemoveText: (id: string) => void;
  onUpload: (files: File[], point: Point) => Promise<void>;
  error: string; onRetry: () => void;
  backgroundColor:string;onBackgroundColor:(color:string)=>void;onClearBackground:()=>void;
};
export default function PanoramaEditor({
  preview, textOverlay, count, seamless, layers, assets, images, loadImage, brandId,onUploadToLibrary,onRenameAsset, onCommit, onUpdate, onAddLayer, onUndo, onRedo, canUndo, canRedo, onAdd,
  onRemove, onReorder, textElements, onRemoveText, onUpload, error, onRetry, onCopySticker,onToggleLock,onDuplicateText,onDuplicateLayer,
  canExtendBackground,onExtendBackground,focusLayerId,backgroundColor,onBackgroundColor,onClearBackground,pageIndex,onPageIndexChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  // On tablet and desktop, show the dedicated editing library immediately.
  // On phones, the fixed tool rail remains visible and panels open on demand.
  const [libraryOpen,setLibraryOpen]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(min-width:921px)').matches);
  const [libraryKind,setLibraryKind]=useState<'photo'|'sticker'|'all'>('sticker');
  const [librarySection,setLibrarySection]=useState<'all'|'shapes'|'photos'|'stickers'>('stickers');
  const [selectedLayerId,setSelectedLayerId]=useState<string|null>(null);
  const [layersOpen,setLayersOpen]=useState(false);
  const [focusedLayerId,setFocusedLayerId]=useState('');
  const containerRef=useRef<HTMLElement>(null);
  const draggingRef=useRef<{id:string;pointerId:number;startX:number;startY:number;handled:boolean}|null>(null);
  const ignoreClick=useRef('');
  const [ghost,setGhost]=useState<{id:string;x:number;y:number}|null>(null);
  const [pendingFiles,setPendingFiles]=useState<File[]>([]);
  const [uploadName,setUploadName]=useState('');
  const [uploadKind,setUploadKind]=useState<'photo'|'sticker'>('photo');
  const [renameId,setRenameId]=useState('');
  const [renameName,setRenameName]=useState('');
  const [renaming,setRenaming]=useState(false);
  const [libraryFeedback,setLibraryFeedback]=useState('');
  useEffect(()=>{if(!libraryFeedback)return;const timer=window.setTimeout(()=>setLibraryFeedback(''),2000);return()=>window.clearTimeout(timer)},[libraryFeedback]);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError,setUploadError]=useState('');
  useEffect(()=>{if(!uploadError)return;const timer=window.setTimeout(()=>setUploadError(''),2000);return()=>window.clearTimeout(timer)},[uploadError]);
  const [moreTools,setMoreTools]=useState(false);
  const [backgroundOpen,setBackgroundOpen]=useState(false);
  const revealCanvas=()=>requestAnimationFrame(()=>containerRef.current?.querySelector('.panorama-workspace')?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  const openTool=(tool:'photo'|'sticker'|'background'|'layers'|'elements')=>{
    const openingPhoto=tool==='photo'&&!(libraryOpen&&libraryKind==='photo');
    const openingSticker=tool==='sticker'&&!(libraryOpen&&libraryKind==='sticker');
    const openingElements=tool==='elements'&&!(libraryOpen&&librarySection==='all');
    setLibraryOpen(openingPhoto||openingSticker||openingElements);
    if(openingPhoto||openingSticker){setLibraryKind(openingPhoto?'photo':'sticker');setLibrarySection(openingPhoto?'photos':'stickers');}
    if(openingElements){setLibraryKind('all');setLibrarySection('all');setFilter('');}
    setLayersOpen(tool==='layers'&&!layersOpen);
    setBackgroundOpen(tool==='background'&&!backgroundOpen);
    setMoreTools(false);
  };
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(!(event.metaKey||event.ctrlKey)||event.key.toLowerCase()!=='z')return;
      const target=event.target as HTMLElement|null;
      if(target?.closest('input,textarea,[contenteditable="true"]'))return;
      if(event.shiftKey?canRedo:canUndo){
        event.preventDefault();if(event.shiftKey)onRedo();else onUndo();
      }
    };
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[onUndo,onRedo,canUndo,canRedo]);
  const input = useRef<HTMLInputElement>(null);
  const libraryPaneRef=useRef<HTMLDivElement>(null);
  // Keep personal uploads first; shared packs remain searchable below them.
  const available = assets.filter(a =>
    (libraryKind==='all'||(libraryKind==='sticker'?assetCategory(a)==='sticker':assetCategory(a)!=='sticker'))&&
    displayAssetName(a).toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b)=>Number(!(a.brandId===brandId&&!a.shared))-Number(!(b.brandId===brandId&&!b.shared)));
  const libraryIds=available.map(a=>a.id).join('|');
  useEffect(()=>{
    if(!libraryOpen)return;
    const pane=libraryPaneRef.current;
    if(!pane)return;
    if(typeof IntersectionObserver==='undefined'){
      available.slice(0,24).forEach(asset=>{if(!images[asset.id])loadImage(asset.id)});
      return;
    }
    const observer=new IntersectionObserver(entries=>{
      for(const item of entries){
        if(!item.isIntersecting)continue;
        const id=(item.target as HTMLElement).dataset.libraryAsset;
        if(id&&!images[id])loadImage(id);
        observer.unobserve(item.target);
      }
    },{root:pane.closest('.panorama-library-floating')||pane,rootMargin:'160px'});
    pane.querySelectorAll('[data-library-asset]').forEach(node=>observer.observe(node));
    return()=>observer.disconnect();
  },[libraryIds,libraryOpen]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
  }, [expanded]);
  const chooseLibraryFiles=(files:File[])=>{
    if(!files.length)return;
    setPendingFiles(files.slice(0,8));
    setUploadName(files[0].name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').slice(0,85));
    setLibraryOpen(true);
    setLibraryFeedback('');
  };
  const saveToLibrary=async()=>{
    if(!pendingFiles.length||uploading)return;
    const safe=cleanAssetName(uploadName);
    if(!safe){setLibraryFeedback('Pon un nombre para reconocer la imagen.');return}
    const files=pendingFiles.map((file,index)=>{
      if(index!==0)return file;
      const extension=file.name.match(/\.[^.]+$/)?.[0]||'.png';
      return new File([file],safe+extension,{type:file.type,lastModified:file.lastModified});
    });
    setUploading(true);setUploadError('');
    try{
      await onUploadToLibrary(files,uploadKind);
      setPendingFiles([]);setUploadName('');
      setLibraryFeedback('Guardado ✓ Arrastra la miniatura al lienzo.');
    }catch(e){
      setLibraryFeedback(e instanceof Error?e.message:'No se pudo guardar. Inténtalo de nuevo.');
    }finally{setUploading(false)}
  };
  const saveAssetName=async(asset:LibraryAsset)=>{
    const safe=cleanAssetName(renameName);
    if(!safe||renaming)return;
    setRenaming(true);
    try{await onRenameAsset(asset,safe);setRenameId('');setLibraryFeedback('Nombre actualizado ✓')}
    catch(e){setLibraryFeedback(e instanceof Error?e.message:'No se pudo renombrar la imagen.')}
    finally{setRenaming(false)}
  };
  const dragStart=(e:React.PointerEvent,asset:LibraryAsset)=>{
    if(e.pointerType==='mouse')return;
    draggingRef.current={id:asset.id,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,handled:false};
    e.currentTarget.setPointerCapture(e.pointerId);
    if(!images[asset.id])loadImage(asset.id);
  };
  const dragMove=(e:React.PointerEvent)=>{
    const drag=draggingRef.current;
    if(!drag||drag.pointerId!==e.pointerId)return;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>9){
      drag.handled=true;setGhost({id:drag.id,x:e.clientX,y:e.clientY});
    }
  };
  const dragEnd=(e:React.PointerEvent)=>{
    const drag=draggingRef.current;
    if(!drag||drag.pointerId!==e.pointerId)return;
    draggingRef.current=null;setGhost(null);
    if(!drag.handled)return;
    ignoreClick.current=drag.id;
    window.setTimeout(()=>{if(ignoreClick.current===drag.id)ignoreClick.current=''},350);
    const stage=containerRef.current?.querySelector('.touch-editor-stage');
    if(!stage)return;
    const rect=stage.getBoundingClientRect();
    // Stage is the WHOLE horizontally scrollable panorama, including offscreen slides.
    const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
    const viewport=containerRef.current?.querySelector('.touch-editor-scroll')?.getBoundingClientRect();
    if(viewport&&e.clientX>=viewport.left&&e.clientX<=viewport.right&&
      e.clientY>=viewport.top&&e.clientY<=viewport.bottom&&
      x>=0&&x<=1&&y>=0&&y<=1){
      onAdd(drag.id,{x,y});setLibraryOpen(false);revealCanvas();setLibraryFeedback('Elemento colocado. Arrástralo o estíralo desde el lienzo.');
    }else setLibraryFeedback('Suelta la imagen sobre el lienzo para colocarla.');
  };
  const upload = async (files: File[], point: Point) => {
    if(!files.length)return;
    setUploadError('');setUploading(true);
    try { await onUpload(files, point); }
    catch(e){setUploadError(e instanceof Error?e.message:'No se pudo subir la foto.');}
    finally { setUploading(false); }
  };
  const addFromElements=(kind:'text'|'shape',shape?:PanoramaLayer['shape'])=>{
    onAddLayer(kind,shape);setMoreTools(false);revealCanvas();
  };
  const mobileGallery=typeof window!=='undefined'&&window.matchMedia('(max-width:920px)').matches;
  const libraryPanel=<aside className={'panorama-library'+(mobileGallery?' panorama-library-floating':'')+(expanded?' panorama-library-expanded':'')} aria-label="Elementos disponibles para arrastrar">
      <div className="panorama-library-heading"><strong>Explorar elementos</strong>
        <small>Toca un elemento para agregarlo. El lienzo permanece a la vista.</small>
        <button type="button" className="panorama-library-close" onClick={()=>setLibraryOpen(false)} aria-label="Cerrar biblioteca">×</button></div>
      <div className="panorama-library-controls">
        <input aria-label="Buscar mis imágenes y stickers" placeholder="Buscar por nombre…" value={filter}
          onChange={e=>setFilter(e.target.value)}/>
        <button type="button" onClick={()=>input.current?.click()} disabled={uploading}>
          <Upload size={15}/> Subir
        </button>
      </div>
<div className="panorama-discovery-categories" role="group" aria-label="Explorar categorías de la biblioteca">
        <button type="button" aria-pressed={librarySection==='all'} onClick={()=>{setLibrarySection('all');setLibraryKind('all');setFilter('')}}><Shapes size={21}/><span>Todos</span></button>
        <button type="button" aria-pressed={librarySection==='shapes'} onClick={()=>setLibrarySection('shapes')}><Shapes size={21}/><span>Formas</span></button>
        <button type="button" aria-pressed={librarySection==='stickers'} onClick={()=>{setLibrarySection('stickers');setLibraryKind('sticker');setFilter('')}}><Sticker size={21}/><span>Stickers</span></button>
        <button type="button" aria-pressed={librarySection==='photos'} onClick={()=>{setLibrarySection('photos');setLibraryKind('photo');setFilter('')}}><ImagePlus size={21}/><span>Fotos</span></button>
      </div>
      {librarySection!=='shapes'&&<p className="panorama-library-count" role="status">{available.length} elementos disponibles · {assets.filter(a=>a.shared&&assetCategory(a)==='sticker').length} stickers compartidos</p>}
      {librarySection==='shapes'&&<div className="panorama-shape-gallery" aria-label="Formas editables">
        {([['Papel','paper'],['Cinta','tape'],['Marco','frame'],['Círculo','circle']] as const).map(([name,shape])=><button type="button" key={shape} onClick={()=>{addFromElements('shape',shape);setLibraryOpen(false)}}>
          <span className={'panorama-shape-preview shape-'+shape} aria-hidden="true"/><small>{name}</small>
        </button>)}
      </div>}
      {librarySection!=='shapes'&&<div className="panorama-assets" ref={libraryPaneRef} aria-label="Biblioteca de fotos, fondos y stickers">
        {available.map(asset=><article key={asset.id} className="panorama-asset">
          <button type="button" className="panorama-asset-drag"
            title={'Arrastrar '+displayAssetName(asset)}
            data-library-asset={asset.id}
            draggable={!!images[asset.id]}
            onFocus={()=>{if(!images[asset.id])loadImage(asset.id)}}
            onPointerEnter={()=>{if(!images[asset.id])loadImage(asset.id)}}
            onDragStart={e=>{
              e.dataTransfer.setData('application/x-content-lab-asset',asset.id);
              e.dataTransfer.effectAllowed='copy';
            }}
            onPointerDown={e=>dragStart(e,asset)}
            onPointerMove={dragMove}
            onPointerUp={dragEnd}
            onPointerCancel={()=>{draggingRef.current=null;setGhost(null)}}
            onClick={()=>{
              if(ignoreClick.current===asset.id){ignoreClick.current='';return}
              const stage=containerRef.current?.querySelector('.touch-editor-stage');
              const view=containerRef.current?.querySelector('.touch-editor-scroll');
              const center=stage&&view?(view.scrollLeft+view.clientWidth/2)/stage.getBoundingClientRect().width:(.5/count);
              onAdd(asset.id,{x:Math.min(.99,Math.max(.01,center)),y:.5});
              setLibraryOpen(false);revealCanvas();
              setLibraryFeedback('Elemento añadido. Tócalo para moverlo y cambiar su tamaño.');
            }}>
            {images[asset.id]
              ?<img src={images[asset.id]} alt="" draggable={false}/>
              :<span className="panorama-library-loading">Cargando…</span>}
            <span className="panorama-asset-add" aria-hidden="true">＋</span>
          </button>
          <span className={'panorama-asset-visibility'+(asset.shared?' is-shared':'')}>{asset.shared?'Compartido':assetCategory(asset)==='sticker'?'Mi sticker':'Mi imagen'}</span>
          {renameId===asset.id
            ?<div className="panorama-asset-rename">
              <input aria-label={'Nuevo nombre para '+displayAssetName(asset)} value={renameName}
                maxLength={85} onChange={e=>setRenameName(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void saveAssetName(asset)}}}/>
              <button type="button" aria-label="Guardar nombre" disabled={renaming||!cleanAssetName(renameName)}
                onClick={()=>void saveAssetName(asset)}><Check size={13}/></button>
              <button type="button" aria-label="Cancelar nombre" onClick={()=>setRenameId('')}><X size={13}/></button>
            </div>
            :<div className="panorama-asset-meta">
              <small title={displayAssetName(asset)}>{displayAssetName(asset)}</small>
              {asset.brandId===brandId&&!asset.shared&&
                <button type="button" aria-label={'Cambiar nombre de '+displayAssetName(asset)}
                  onClick={()=>{setRenameId(asset.id);setRenameName(displayAssetName(asset))}}>
                  <Pencil size={13}/>
                </button>}
            </div>}
        </article>)}
      </div>}
      {librarySection!=='shapes'&&!available.length&&<p className="panorama-library-empty">No hay resultados. Sube tu primera imagen para empezar.</p>}
    </aside>;
  const editor=<section ref={containerRef} className={'panorama-editor' + (expanded ? ' expanded' : '')+(selectedLayerId?' layer-selected':'')}
    aria-label="Lienzo panorámico editable">
    <header className="panorama-heading"><div><span className="eyebrow">TU CARRUSEL</span>
      <h2>Arrastra elementos a tu carrusel.</h2>
      <p>Como en el ejemplo: elige una foto o un sticker de tu biblioteca, arrástralo al lienzo y cambia su tamaño. En seamless puedes cruzar los límites de los slides.</p>
    </div>{!expanded&&<button type="button" className="btn ghost" onClick={()=>setExpanded(true)}>
      <Maximize2 size={16}/> Ampliar lienzo
    </button>}</header>
    {expanded&&<button type="button" className="panorama-exit-fixed" onClick={()=>setExpanded(false)}>
      <Minimize2 size={17}/> Cerrar vista amplia
    </button>}
    <div className="panorama-primary-actions" role="toolbar" aria-label="Herramientas táctiles del carrusel">
      <button type="button" aria-pressed={libraryOpen&&libraryKind==='photo'} onClick={()=>openTool('photo')}>
        <ImagePlus size={19}/><span>Fotos</span></button>
      <button type="button" onClick={()=>{openTool('elements');setMoreTools(false);onAddLayer('text');revealCanvas()}}>
        <Type size={19}/><span>Texto</span></button>
      <button type="button" aria-pressed={libraryOpen&&libraryKind==='sticker'} onClick={()=>openTool('sticker')}>
        <Sticker size={19}/><span>Stickers</span></button>
      <button type="button" aria-pressed={moreTools} onClick={()=>openTool('elements')}>
        <Shapes size={19}/><span>Elementos</span></button>
      <button type="button" aria-pressed={backgroundOpen} onClick={()=>openTool('background')}>
        <Palette size={19}/><span>Fondo</span></button>
      <button type="button" aria-pressed={layersOpen} onClick={()=>openTool('layers')}>
        <Layers3 size={19}/><span>Capas</span></button>
    </div>
    {backgroundOpen&&<div className="panorama-background-sheet" role="region" aria-label="Elegir fondo del carrusel">
      <div className="panorama-sheet-heading"><strong>Color del lienzo</strong><button type="button" onClick={()=>setBackgroundOpen(false)} aria-label="Cerrar colores">×</button></div>
      <div className="panorama-background-colors">
        {(['#FAF8F3','#FFFFFF','#F2D85B','#DCECF4','#EADDE5','#F6E7CE','#E4EDE1','#191919'] as const).map(color=><button key={color}
          type="button" aria-label={'Fondo '+color} aria-pressed={backgroundColor.toLowerCase()===color.toLowerCase()}
          onClick={()=>{onBackgroundColor(color);setBackgroundOpen(false);revealCanvas()}}
          style={{background:color}}/>)}
        <label>Personalizado <input type="color" value={backgroundColor} onChange={e=>onBackgroundColor(e.target.value)} aria-label="Color personalizado del fondo"/></label>
      </div>
      <button type="button" className="panorama-clear-background" onClick={()=>{onClearBackground();setBackgroundOpen(false);revealCanvas()}}><Trash2 size={17}/> Quitar fondo del {seamless?'carrusel continuo':'slide actual'}</button>
      <small>Quitar el fondo no borra las fotos, textos ni stickers. Los cambios de color no modifican tu biblioteca.</small>
    </div>}
    <div className="panorama-editor-utilities">
      <button type="button" disabled={!canUndo} onClick={onUndo} aria-label="Deshacer"><Undo2 size={17}/></button>
      <button type="button" disabled={!canRedo} onClick={onRedo} aria-label="Rehacer"><Redo2 size={17}/></button>
      <button type="button" className="panorama-add-photo" disabled={uploading}
        onClick={()=>{openTool('photo');input.current?.click()}}>
        <Upload size={16}/> Subir imagen
      </button>
    </div>
    {layersOpen&&<div className="panorama-mobile-layer-panel" aria-label="Capas del carrusel">
      <strong>Selecciona una capa</strong>
      <button type="button" onClick={()=>setLayersOpen(false)} aria-label="Cerrar capas">×</button>
      <div className="panorama-mobile-layer-items">
        {[...layers].reverse().map(layer=><button type="button" key={layer.id}
          onClick={()=>{setFocusedLayerId(layer.id);setLayersOpen(false)}} aria-label={'Seleccionar '+layer.name}>
          {(layer.kind==='photo'||layer.kind==='sticker')&&layer.src?
            <img src={layer.src} loading="lazy" alt=""/>:<span>{layer.kind==='text'?'T':'▧'}</span>}
          <small>{layer.name}</small>
        </button>)}
      </div>
    </div>}
    <input ref={input} hidden type="file" accept="image/*,.heic,.heif" multiple
      onChange={e=>{const files=[...(e.target.files||[])];e.target.value='';chooseLibraryFiles(files)}}/>
    {pendingFiles.length>0&&<div className="panorama-upload-pending" role="group" aria-label="Guardar imágenes con nombre">
      <label>Nombre de tu imagen
        <input aria-label="Nombre de la imagen a guardar" value={uploadName} maxLength={85}
          onChange={e=>setUploadName(e.target.value)} placeholder="Ej. Galletas de chocolate"/>
      </label>
      <label className="panorama-kind-label">Tipo de elemento
        <select aria-label="Guardar imagen como foto o sticker" value={uploadKind}
          onChange={e=>setUploadKind(e.target.value as 'photo'|'sticker')}>
          <option value="photo">Foto / imagen</option>
          <option value="sticker">Sticker PNG</option>
        </select>
      </label>
      <small>{pendingFiles.length>1?pendingFiles.length+' archivos · el primero llevará este nombre; los demás conservarán el suyo.':'Primero se guarda. Después podrás arrastrarla al carrusel.'}</small>
      <button type="button" className="panorama-save-upload" disabled={uploading||!cleanAssetName(uploadName)}
        onClick={()=>void saveToLibrary()}><Check size={15}/>{uploading?'Guardando…':'Guardar en mi biblioteca'}</button>
      <button type="button" className="panorama-cancel-upload" onClick={()=>setPendingFiles([])}
        disabled={uploading}>Cancelar</button>
    </div>}
    {(uploadError||libraryFeedback)&&<p className="panorama-library-status" role="status">{uploadError||libraryFeedback}</p>}
    {moreTools&&<div className="panorama-quicktools" aria-label="Herramientas adicionales">
      <button type="button" onClick={()=>addFromElements('text')}><Type size={16}/> Texto libre</button>
      <button type="button" onClick={()=>addFromElements('shape','paper')}><Shapes size={16}/> Papel</button>
      <button type="button" onClick={()=>addFromElements('shape','tape')}>Cinta washi</button>
      <button type="button" onClick={()=>addFromElements('shape','frame')}>Marco</button>
      <button type="button" onClick={()=>addFromElements('shape','circle')}>Círculo</button>
      <button type="button" disabled={!canUndo} onClick={onUndo}><Undo2 size={16}/> Deshacer</button>
      <button type="button" disabled={!canRedo} onClick={onRedo}><Redo2 size={16}/> Rehacer</button>
    </div>}
    <div className={'panorama-body'+(!libraryOpen?' panorama-library-collapsed':'')}>
      {libraryOpen&&(mobileGallery&&typeof document!=='undefined'?createPortal(libraryPanel,document.body):libraryPanel)}<div className="panorama-workspace">
      {error && <div className="panorama-error" role="alert">{error} <button type="button" onClick={onRetry}>Reintentar vista previa</button></div>}
      <TouchLayerCanvas preview={preview} textOverlay={textOverlay} layers={layers} continuous={seamless} ratio={count * 1080 / 1350}
        pageIndex={pageIndex} onPageIndexChange={onPageIndexChange}
        fullscreen={expanded}
        onSelectionChange={setSelectedLayerId}
        focusLayerId={focusedLayerId||focusLayerId}
        pageCount={count} onCommit={onCommit} onUpdate={onUpdate} onRemove={onRemove} onReorder={onReorder}
         onCopySticker={onCopySticker} onToggleLock={onToggleLock} onDuplicateText={onDuplicateText} onDuplicateLayer={onDuplicateLayer}
        onDropAsset={onAdd} onDropFiles={(files, point) => { void upload(files, point); }}/>
      <details className="panorama-text-manager"><summary>Textos del carrusel ({textElements.length}) · borrar</summary>
        <p>Los textos se eliminan aquí; las fotos y stickers se borran desde el lienzo o su lista.</p>
        <div className="panorama-text-items">{textElements.map(item => <div className="panorama-text-item" key={item.id}>
          <div><strong>{item.name}</strong><span>{item.preview}</span></div>
          <button type="button" title={'Borrar ' + item.name} aria-label={'Borrar ' + item.name}
            onClick={() => { if (window.confirm('¿Borrar este texto del carrusel?')) onRemoveText(item.id); }}>
            <Trash2 size={16}/><span>Borrar</span></button>
        </div>)}</div>
        {!textElements.length && <p>No hay textos añadidos en el carrusel.</p>}
      </details>
      <small className="panorama-export-note">{count} PNG individuales · 1080 × 1350 cada uno · las líneas de corte y los controles no aparecen en la descarga.</small>
    </div></div>
    {ghost&&<div className="panorama-drag-ghost" aria-hidden="true"
      style={{left:ghost.x,top:ghost.y}}>
      {images[ghost.id]?<img src={images[ghost.id]} alt=""/>:<ImagePlus size={20}/>}
      <span>Suelta en el lienzo</span>
    </div>}
  </section>;
  return expanded?createPortal(editor,document.body):editor;
}
