import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Maximize2, Minimize2, Upload, Trash2, Undo2, Redo2, Type, Shapes, Pencil, Check, X } from 'lucide-react';
import TouchLayerCanvas, { type TouchLayer } from './TouchLayerCanvas';
import type { TouchRect } from './TouchGeometry';
import type { PanoramaLayer } from './PanoramaLayers';
import { assetCategory, displayAssetName, cleanAssetName, type LibraryAsset } from './MediaAsset';
import './PanoramaEditor.css';
import type {StickerCopyResult} from './CarouselStickerCopy';

type Point = {x: number; y: number};
type Props = {
  preview: string; textOverlay?: string; count: number; seamless: boolean; layers: TouchLayer[];
  canExtendBackground?:boolean;onExtendBackground?:()=>void;focusLayerId?:string;
  assets: LibraryAsset[]; images: Record<string, string>; loadImage: (id: string) => void; brandId:string;
  onUploadToLibrary:(files:File[])=>Promise<void>;
  onRenameAsset:(asset:LibraryAsset,name:string)=>Promise<void>;
  onCommit: (kind: 'photo' | 'sticker' | 'text' | 'shape', id: string, rect: TouchRect) => void;
  onUpdate: (id:string,patch:Partial<PanoramaLayer>)=>void;
  onAddLayer: (kind:'text'|'shape',shape?:PanoramaLayer['shape'])=>void;
  onCopySticker?:(id:string,targetIndex:number)=>StickerCopyResult;
  onToggleLock?:(id:string,locked:boolean)=>void;
  onDuplicateText?:(id:string)=>void;
  onUndo:()=>void;onRedo:()=>void;canUndo:boolean;canRedo:boolean;
  onAdd: (assetId: string, point: Point) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, move: 'backward' | 'forward' | 'back' | 'front') => void;
  textElements: {id: string; name: string; preview: string}[];
  onRemoveText: (id: string) => void;
  onUpload: (files: File[], point: Point) => Promise<void>;
  error: string; onRetry: () => void;
};
export default function PanoramaEditor({
  preview, textOverlay, count, seamless, layers, assets, images, loadImage, brandId,onUploadToLibrary,onRenameAsset, onCommit, onUpdate, onAddLayer, onUndo, onRedo, canUndo, canRedo, onAdd,
  onRemove, onReorder, textElements, onRemoveText, onUpload, error, onRetry, onCopySticker,onToggleLock,onDuplicateText,
  canExtendBackground,onExtendBackground,focusLayerId,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [libraryOpen,setLibraryOpen]=useState(true);
  const containerRef=useRef<HTMLElement>(null);
  const draggingRef=useRef<{id:string;pointerId:number;startX:number;startY:number;handled:boolean}|null>(null);
  const ignoreClick=useRef('');
  const [ghost,setGhost]=useState<{id:string;x:number;y:number}|null>(null);
  const [pendingFiles,setPendingFiles]=useState<File[]>([]);
  const [uploadName,setUploadName]=useState('');
  const [renameId,setRenameId]=useState('');
  const [renameName,setRenameName]=useState('');
  const [renaming,setRenaming]=useState(false);
  const [libraryFeedback,setLibraryFeedback]=useState('');
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError,setUploadError]=useState('');
  const [moreTools,setMoreTools]=useState(false);
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
  const available = assets.filter(a => displayAssetName(a).toLowerCase().includes(filter.toLowerCase())).slice(0, 70);
  useEffect(() => { available.slice(0, 12).forEach(a => { if (!images[a.id]) loadImage(a.id); }); },
    [available.map(a => a.id).join('|')]);
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
      await onUploadToLibrary(files);
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
    if(x>=0&&x<=1&&y>=0&&y<=1){
      onAdd(drag.id,{x,y});setLibraryFeedback('Elemento colocado. Arrástralo o estíralo desde el lienzo.');
    }else setLibraryFeedback('Suelta la imagen sobre el lienzo para colocarla.');
  };
  const upload = async (files: File[], point: Point) => {
    if(!files.length)return;
    setUploadError('');setUploading(true);
    try { await onUpload(files, point); }
    catch(e){setUploadError(e instanceof Error?e.message:'No se pudo subir la foto.');}
    finally { setUploading(false); }
  };
  return <section ref={containerRef} className={'panorama-editor' + (expanded ? ' expanded' : '')}
    aria-label="Lienzo panorámico editable">
    <header className="panorama-heading"><div><span className="eyebrow">TU CARRUSEL</span>
      <h2>Arrastra elementos a tu carrusel.</h2>
      <p>Como en el ejemplo: elige una foto o un sticker de tu biblioteca, arrástralo al lienzo y cambia su tamaño. En seamless puedes cruzar los límites de los slides.</p>
    </div><button type="button" className="btn ghost" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>
      {expanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>} {expanded ? 'Cerrar vista amplia' : 'Ampliar lienzo'}
    </button></header>
    <div className="panorama-primary-actions">
      <button type="button" className="panorama-add-photo" disabled={uploading}
        onClick={()=>{setLibraryOpen(true);input.current?.click()}}>
        <Upload size={18}/> Subir a mi biblioteca
      </button>
      <button type="button" className="panorama-toggle-library" aria-expanded={libraryOpen}
        onClick={()=>setLibraryOpen(open=>!open)}>
        <ImagePlus size={17}/> {libraryOpen?'Ocultar elementos':'Ver mis elementos'}
      </button>
      <button type="button" className="panorama-more-toggle" onClick={()=>setMoreTools(open=>!open)}
        aria-expanded={moreTools}>{moreTools?'Menos herramientas':'Más herramientas'}</button>
    </div>
    <input ref={input} hidden type="file" accept="image/*,.heic,.heif" multiple
      onChange={e=>{const files=[...(e.target.files||[])];e.target.value='';chooseLibraryFiles(files)}}/>
    {pendingFiles.length>0&&<div className="panorama-upload-pending" role="group" aria-label="Guardar imágenes con nombre">
      <label>Nombre de tu imagen
        <input aria-label="Nombre de la imagen a guardar" value={uploadName} maxLength={85}
          onChange={e=>setUploadName(e.target.value)} placeholder="Ej. Galletas de chocolate"/>
      </label>
      <small>{pendingFiles.length>1?pendingFiles.length+' archivos · el primero llevará este nombre; los demás conservarán el suyo.':'Primero se guarda. Después podrás arrastrarla al carrusel.'}</small>
      <button type="button" className="panorama-save-upload" disabled={uploading||!cleanAssetName(uploadName)}
        onClick={()=>void saveToLibrary()}><Check size={15}/>{uploading?'Guardando…':'Guardar en mi biblioteca'}</button>
      <button type="button" className="panorama-cancel-upload" onClick={()=>setPendingFiles([])}
        disabled={uploading}>Cancelar</button>
    </div>}
    {(uploadError||libraryFeedback)&&<p className="panorama-library-status" role="status">{uploadError||libraryFeedback}</p>}
    {moreTools&&<div className="panorama-quicktools" aria-label="Herramientas adicionales">
      <button type="button" onClick={()=>onAddLayer('text')}><Type size={16}/> Texto libre</button>
      <button type="button" onClick={()=>onAddLayer('shape','paper')}><Shapes size={16}/> Papel</button>
      <button type="button" onClick={()=>onAddLayer('shape','tape')}>Cinta washi</button>
      <button type="button" onClick={()=>onAddLayer('shape','frame')}>Marco</button>
      <button type="button" onClick={()=>onAddLayer('shape','circle')}>Círculo</button>
      <button type="button" disabled={!canUndo} onClick={onUndo}><Undo2 size={16}/> Deshacer</button>
      <button type="button" disabled={!canRedo} onClick={onRedo}><Redo2 size={16}/> Rehacer</button>
    </div>}
    <div className={'panorama-body'+(!libraryOpen?' panorama-library-collapsed':'')}>
      {libraryOpen&&<aside className="panorama-library" aria-label="Elementos disponibles para arrastrar">
      <div className="panorama-library-heading"><strong>Mis elementos</strong>
        <small>Arrastra una miniatura al lienzo · toca + para añadir al centro</small></div>
      <div className="panorama-library-controls">
        <input aria-label="Buscar mis imágenes y stickers" placeholder="Buscar por nombre…" value={filter}
          onChange={e=>setFilter(e.target.value)}/>
        <button type="button" onClick={()=>input.current?.click()} disabled={uploading}>
          <Upload size={15}/> Subir
        </button>
      </div>
      <div className="panorama-assets" aria-label="Biblioteca de fotos, fondos y stickers">
        {available.map(asset=><article key={asset.id} className="panorama-asset">
          <button type="button" className="panorama-asset-drag"
            title={'Arrastrar '+displayAssetName(asset)}
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
              onAdd(asset.id,{x:(Math.floor(count/2)+.5)/count,y:.5});
              setLibraryFeedback('Elemento añadido. Tócalo para moverlo y cambiar su tamaño.');
            }}>
            {images[asset.id]
              ?<img src={images[asset.id]} alt="" draggable={false}/>
              :<span className="panorama-library-loading">Cargando…</span>}
            <span className="panorama-asset-add" aria-hidden="true">＋</span>
          </button>
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
      </div>
      {!available.length&&<p className="panorama-library-empty">No hay resultados. Sube tu primera imagen para empezar.</p>}
    </aside>}<div className="panorama-workspace">
      {error && <div className="panorama-error" role="alert">{error} <button type="button" onClick={onRetry}>Reintentar vista previa</button></div>}
      <TouchLayerCanvas preview={preview} textOverlay={textOverlay} layers={layers} continuous={seamless} ratio={count * 1080 / 1350}
        focusLayerId={focusLayerId}
        pageCount={count} onCommit={onCommit} onUpdate={onUpdate} onRemove={onRemove} onReorder={onReorder}
         onCopySticker={onCopySticker} onToggleLock={onToggleLock} onDuplicateText={onDuplicateText}
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
  </section>;
}
