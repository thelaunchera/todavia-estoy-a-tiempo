import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Maximize2, Minimize2, Upload, Trash2, Undo2, Redo2, Type, Shapes, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import TouchLayerCanvas, { type TouchLayer } from './TouchLayerCanvas';
import type { TouchRect } from './TouchGeometry';
import type { PanoramaLayer } from './PanoramaLayers';
import { assetCategory, displayAssetName, type LibraryAsset } from './MediaAsset';
import './PanoramaEditor.css';

type Point = {x: number; y: number};
type Props = {
  preview: string; textOverlay?: string; count: number; seamless: boolean; layers: TouchLayer[];
  assets: LibraryAsset[]; images: Record<string, string>; loadImage: (id: string) => void;
  onCommit: (kind: 'photo' | 'sticker' | 'text' | 'shape', id: string, rect: TouchRect) => void;
  onUpdate: (id:string,patch:Partial<PanoramaLayer>)=>void;
  onAddLayer: (kind:'text'|'shape',shape?:PanoramaLayer['shape'])=>void;
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
  preview, textOverlay, count, seamless, layers, assets, images, loadImage, onCommit, onUpdate, onAddLayer, onUndo, onRedo, canUndo, canRedo, onAdd,
  onRemove, onReorder, textElements, onRemoveText, onUpload, error, onRetry,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [libraryOpen,setLibraryOpen]=useState(false);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const available = assets.filter(a => assetCategory(a) !== 'background' &&
    displayAssetName(a).toLowerCase().includes(filter.toLowerCase())).slice(0, 36);
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
  const upload = async (files: File[], point: Point) => {
    setUploading(true);
    try { await onUpload(files, point); } finally { setUploading(false); }
  };
  return <section className={'panorama-editor' + (expanded ? ' expanded' : '')}
    aria-label="Lienzo panorámico editable">
    <header className="panorama-heading"><div><span className="eyebrow">LIVE CANVAS</span>
      <h2>Diseña viendo el carrusel completo.</h2>
      <p>Mueve fotos y stickers donde quieras, incluso entre diapositivas. {seamless
        ?'El fondo continuo también cruza los cortes.'
        :'Seamless cambia el fondo; tus fotos siempre se mueven libremente.'}</p>
    </div><button type="button" className="btn ghost" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>
      {expanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>} {expanded ? 'Cerrar vista amplia' : 'Ampliar lienzo'}
    </button></header>
    <div className="panorama-quicktools" aria-label="Herramientas del lienzo">
      <button type="button" onClick={()=>onAddLayer('text')}><Type size={16}/> Añadir texto</button>
      <button type="button" onClick={()=>onAddLayer('shape','paper')}><Shapes size={16}/> Papel</button>
      <button type="button" onClick={()=>onAddLayer('shape','tape')}>Cinta washi</button>
      <button type="button" onClick={()=>onAddLayer('shape','frame')}>Marco</button>
      <button type="button" onClick={()=>onAddLayer('shape','circle')}>Círculo</button>
      <button type="button" onClick={()=>setLibraryOpen(v=>!v)}>
        {libraryOpen?<PanelLeftClose size={16}/>:<PanelLeftOpen size={16}/>}
        {libraryOpen?'Recoger fotos y stickers':'Abrir fotos y stickers'}
      </button>
      <button type="button" disabled={!canUndo} onClick={onUndo}><Undo2 size={16}/> Deshacer</button>
      <button type="button" disabled={!canRedo} onClick={onRedo}><Redo2 size={16}/> Rehacer</button>
    </div>
    <div className={'panorama-body'+(!libraryOpen?' panorama-library-collapsed':'')}>
      {libraryOpen&&<aside className="panorama-library">
      <strong><ImagePlus size={16}/> Tus fotos y stickers</strong>
      <p>Arrastra al lienzo o toca + para añadir. En el móvil, desliza el lienzo por el fondo.</p>
      <div className="panorama-library-controls"><input aria-label="Buscar fotos del lienzo" placeholder="Buscar en tu biblioteca…" value={filter}
        onChange={e => setFilter(e.target.value)}/>
      <button className="btn ghost" type="button" disabled={uploading} onClick={() => input.current?.click()}>
        <Upload size={15}/> {uploading ? 'Subiendo…' : 'Subir fotos'}
      </button></div>
      <input ref={input} hidden type="file" accept="image/*,.heic,.heif" multiple onChange={e => {
        const files = [...(e.target.files || [])]; e.target.value = '';
        if (files.length) void upload(files, {x: .5 / count, y: .5});
      }}/>
      <div className="panorama-assets">{available.map(asset => <button type="button" key={asset.id}
        draggable={!!images[asset.id]} className="panorama-asset" title={'Añadir ' + displayAssetName(asset)}
        onFocus={() => { if (!images[asset.id]) loadImage(asset.id); }}
        onPointerEnter={() => { if (!images[asset.id]) loadImage(asset.id); }}
        onDragStart={e => {
          e.dataTransfer.setData('application/x-content-lab-asset', asset.id);
          e.dataTransfer.effectAllowed = 'copy';
        }} onClick={() => onAdd(asset.id, {x: .5 / count, y: .5})}>
        {images[asset.id] ? <img src={images[asset.id]} alt="" draggable={false}/>
          : <span onClick={() => loadImage(asset.id)}>Cargar foto</span>}
        <small>{displayAssetName(asset)}</small><b aria-hidden="true">+</b>
      </button>)}</div>
      {!available.length && <p>Sube tus fotos para empezar.</p>}
    </aside>}<div className="panorama-workspace">
      {error && <div className="panorama-error" role="alert">{error} <button type="button" onClick={onRetry}>Reintentar vista previa</button></div>}
      <TouchLayerCanvas preview={preview} textOverlay={textOverlay} layers={layers} ratio={count * 1080 / 1350}
        pageCount={count} onCommit={onCommit} onUpdate={onUpdate} onRemove={onRemove} onReorder={onReorder}
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
