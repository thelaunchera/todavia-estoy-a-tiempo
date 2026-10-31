import React, { useEffect, useRef, useState } from 'react';
import type { TouchRect } from './TouchGeometry';
import { clampRect, clampPanoramaRect, layerCornerPixels } from './TouchGeometry';
import { coverPlacement, normalizeCrop, photoFrameMetrics, initialPanoramaPhotoRect } from './PhotoCrop';
import { Trash2 } from 'lucide-react';
import { panoramaFont,type PanoramaLayer } from './PanoramaLayers';
import './TouchLayerCanvas.css';

export type TouchLayer = {
  id: string; name: string; src: string; rect: TouchRect; kind: 'photo' | 'sticker' | 'text' | 'shape';
  text?:string; font?:string; fontSize?:number; color?:string; lineHeight?:number; spacing?:number;
  outline?:boolean; shadow?:boolean; shape?:PanoramaLayer['shape'];
  placement?: 'behind-text' | 'front';
  frameStyle?: string; paper?: string; accent?: string;
};
type Props = {
  preview: string; textOverlay?: string; layers: TouchLayer[];
  onCommit: (kind: 'photo' | 'sticker' | 'text' | 'shape', id: string, rect: TouchRect) => void;
  onUpdate?: (id:string, patch:Partial<PanoramaLayer>)=>void;
  ratio?: number; pageCount?: number; onEmpty?: () => void;
  onRemove?: (id: string) => void;
  onReorder?: (id: string, move: 'backward' | 'forward' | 'back' | 'front') => void;
  onDropAsset?: (id: string, point: {x: number; y: number}) => void;
  onDropFiles?: (files: File[], point: {x: number; y: number}) => void;
};
type Gesture = {
  id: string; start: TouchRect; startX: number; startY: number;
  width: number; height: number; resize: boolean; crop: boolean;
  overflowX: number; overflowY: number;
  scrollLeft: number;
  pinchDistance?: number; pinchCenter?: [number, number];
};
export default function TouchLayerCanvas({
  preview, textOverlay, layers, onCommit, ratio = 1080 / 1350, pageCount = 1, onEmpty,
  onRemove, onReorder, onUpdate, onDropAsset, onDropFiles,
}: Props) {
  const [draft, setDraft] = useState<Record<string, TouchRect>>({});
  const [selected, setSelected] = useState('');
  const [cropping, setCropping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [snapEnabled,setSnapEnabled]=useState(true);
  const [snapGuides,setSnapGuides]=useState<{x?:number;y?:number}|null>(null);
  const [stageHeight,setStageHeight]=useState(540);
  const stage = useRef<HTMLDivElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const autoPanFrame = useRef(0);
  const pointers = useRef(new Map<number, {x: number; y: number}>());
  const gesture = useRef<Gesture | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const clamp = (rect: TouchRect) => pageCount>1?clampPanoramaRect(rect,.055/pageCount):clampRect(rect);
  useEffect(() => { if (!gesture.current) setDraft({}); }, [layers]);
  useEffect(() => { setCropping(false); }, [selected]);
  useEffect(() => { if (selected && !layers.some(layer => layer.id === selected)) setSelected(''); }, [layers, selected]);
  useEffect(()=>()=>{window.cancelAnimationFrame(autoPanFrame.current);},[]);
  useEffect(()=>{
    const el=stage.current;if(!el)return;
    const resize=()=>setStageHeight(el.getBoundingClientRect().height||540);
    resize();const observer=new ResizeObserver(resize);observer.observe(el);
    return()=>observer.disconnect();
  },[pageCount]);
  const getRect = (layer: TouchLayer) => draftRef.current[layer.id] || layer.rect;
  const update = (id: string, next: TouchRect) => {
    const rect = clamp(next);
    draftRef.current = {...draftRef.current, [id]: rect};
    setDraft(draftRef.current);
  };
  const applySmartSnap=(r:TouchRect,width:number,height:number):TouchRect=>{
    if(!snapEnabled||pageCount<=1){setSnapGuides(null);return r;}
    const cx=r.x+r.w/2,cy=r.y+r.h/2;
    const candidates=Array.from({length:pageCount},(_,i)=>(i+.5)/pageCount);
    const x=candidates.find(value=>Math.abs(value-cx)*width<9);
    const y=[.25,.5,.75].find(value=>Math.abs(value-cy)*height<9);
    setSnapGuides(x===undefined&&y===undefined?null:{x,y});
    return {...r,x:x===undefined?r.x:x-r.w/2,y:y===undefined?r.y:y-r.h/2};
  };
  const startAutoPan=()=>{
    window.cancelAnimationFrame(autoPanFrame.current);
    const tick=()=>{
      const g=gesture.current,viewport=scrollArea.current;
      if(!g||!viewport)return;
      const point=[...pointers.current.values()][0];
      if(pageCount>1&&point&&pointers.current.size===1&&!g.crop&&!g.resize&&Math.hypot(point.x-g.startX,point.y-g.startY)>4){
        const bounds=viewport.getBoundingClientRect();
        if(point.y>=bounds.top&&point.y<=bounds.bottom){
          const direction=point.x<bounds.left+36?-1:point.x>bounds.right-36?1:0;
          const before=viewport.scrollLeft;
          viewport.scrollLeft=Math.max(0,Math.min(viewport.scrollWidth-viewport.clientWidth,before+direction*9));
          if(viewport.scrollLeft!==before)update(g.id,{...g.start,
            x:g.start.x+(point.x-g.startX+viewport.scrollLeft-g.scrollLeft)/g.width,
            y:g.start.y+(point.y-g.startY)/g.height});
        }
      }
      autoPanFrame.current=window.requestAnimationFrame(tick);
    };
    autoPanFrame.current=window.requestAnimationFrame(tick);
  };
  const down = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    e.preventDefault(); e.stopPropagation();
    setSelected(layer.id);
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const existing = gesture.current;
    if (existing && existing.id === layer.id && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {...existing, start: getRect(layer),
        pinchDistance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
        pinchCenter: [(a.x + b.x) / 2, (a.y + b.y) / 2], resize: false};
      return;
    }
    const rect = getRect(layer);
    const img = e.currentTarget.querySelector('img');
    const metrics=photoFrameMetrics(rect.w*1080*pageCount,rect.h*1350,layer.frameStyle||'panorama');
    const pixelScale=bounds.height/1350;
    const frameW = rect.w * bounds.width-2*metrics.inset*pixelScale;
    const frameH = rect.h * bounds.height-(metrics.inset+metrics.bottom)*pixelScale;
    const placement = coverPlacement(img?.naturalWidth || 1, img?.naturalHeight || 1,
      frameW, frameH, rect.crop);
    gesture.current = {
      id: layer.id, start: rect, startX: e.clientX, startY: e.clientY,
      width: bounds.width, height: bounds.height,
      resize: !!(e.target as HTMLElement).closest('[data-resize-handle]'),
      crop: cropping && selected === layer.id && layer.kind === 'photo',
      overflowX: Math.max(0, placement.width - frameW),
      overflowY: Math.max(0, placement.height - frameH),
      scrollLeft: scrollArea.current?.scrollLeft||0,
    };
    startAutoPan();
  };
  const move = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    const g = gesture.current;
    if (!g || g.id !== layer.id || !pointers.current.has(e.pointerId)) return;
    e.preventDefault();
    pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pointers.current.size >= 2 && g.pinchDistance && g.pinchCenter) {
      const [a, b] = [...pointers.current.values()];
      const scale = Math.max(.35, Math.min(3, Math.hypot(a.x - b.x, a.y - b.y) / g.pinchDistance));
      if (g.crop) {
        update(g.id, {...g.start, crop: normalizeCrop({...g.start.crop,
          zoom: normalizeCrop(g.start.crop).zoom * scale})});
      } else {
        const w = g.start.w * scale, h = g.start.h * scale;
        update(g.id, {...g.start, w, h,
          x: g.start.x - (w - g.start.w) / 2 + ((a.x + b.x) / 2 - g.pinchCenter[0]) / g.width,
          y: g.start.y - (h - g.start.h) / 2 + ((a.y + b.y) / 2 - g.pinchCenter[1]) / g.height});
      }
    } else if (g.crop) {
      const angle = (g.start.angle || 0) * Math.PI / 180;
      const dx = e.clientX - g.startX, dy = e.clientY - g.startY;
      const crop = normalizeCrop(g.start.crop);
      update(g.id, {...g.start, crop: normalizeCrop({...crop,
        x: crop.x - (g.overflowX > .5 ? (dx * Math.cos(angle) + dy * Math.sin(angle)) / g.overflowX : 0),
        y: crop.y - (g.overflowY > .5 ? (dy * Math.cos(angle) - dx * Math.sin(angle)) / g.overflowY : 0)})});
    } else {
      const dx = (e.clientX - g.startX+(scrollArea.current?.scrollLeft||0)-g.scrollLeft) / g.width, dy = (e.clientY - g.startY) / g.height;
      if (g.resize) {
        const factor = Math.max(.4, Math.min(2.8, 1 + Math.max(dx, dy / ratio) / Math.max(.008, g.start.w)));
        update(g.id, {...g.start, w: g.start.w * factor, h: g.start.h * factor});
      } else update(g.id, applySmartSnap({...g.start, x: g.start.x + dx, y: g.start.y + dy},g.width,g.height));
    }
  };
  const done = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    if (!pointers.current.has(e.pointerId)) return;
    e.preventDefault(); e.stopPropagation();
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* Already released. */ }
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0 && g) {
      const remaining = [...pointers.current.values()][0];
      gesture.current = {...g, start: getRect(layer), startX: remaining.x, startY: remaining.y,
        scrollLeft:scrollArea.current?.scrollLeft||0,pinchDistance: undefined, pinchCenter: undefined, resize: false};
      return;
    }
    gesture.current = null;
    setSnapGuides(null);
    window.cancelAnimationFrame(autoPanFrame.current);
    if (g?.id === layer.id && draftRef.current[layer.id]) {
      onCommit(layer.kind, layer.id, draftRef.current[layer.id]);
    }
  };
  const chosen = layers.find(layer => layer.id === selected);
  const selectedRect = chosen ? getRect(chosen) : undefined;
  const selectedCornerRadius = selectedRect?.cornerRadius ?? (chosen?.kind==='photo'&&selectedRect
    ? Math.round(100*photoFrameMetrics(selectedRect.w*1080*pageCount,selectedRect.h*1350,
      chosen.frameStyle||'panorama').radius/Math.max(1,Math.min(selectedRect.w*1080*pageCount,selectedRect.h*1350)))
    : 0);
  const commit = (patch: Partial<TouchRect>) => {
    if (!chosen || !selectedRect) return;
    const next = clamp({...selectedRect, ...patch});
    update(chosen.id, next); onCommit(chosen.kind, chosen.id, next);
  };
  const fitWholePhoto = async () => {
    if (!chosen || chosen.kind !== 'photo') return;
    const img = new Image(); img.src = chosen.src;
    try {
      await img.decode();
      if (!img.naturalWidth || !img.naturalHeight) throw Error('missing dimensions');
      const current = getRect(chosen);
      const point = {x: current.x + current.w / 2, y: current.y + current.h / 2};
      const next = initialPanoramaPhotoRect(img.naturalWidth / img.naturalHeight, pageCount, point);
      const rect = clamp({...current, ...next});
      update(chosen.id, rect); onCommit(chosen.kind, chosen.id, rect);
      setCropping(false);
    } catch { /* Keep the image as-is if its original proportions are unavailable. */ }
  };
  const deleteLayer = (id: string) => {
    if (!onRemove || !window.confirm('¿Borrar este elemento del carrusel? El archivo original seguirá en tu biblioteca.')) return;
    onRemove(id);
    if (selected === id) setSelected('');
  };
  return <div className={'touch-editor' + (pageCount > 1 ? ' panorama-canvas' : '')}
    aria-label="Editor visual de fotos y stickers">
    {pageCount > 1 && <div className="panorama-guide-legend"><span className="panorama-guide-swatch" aria-hidden="true"/>
      Grid de {pageCount} slides siempre visible · la división ocurre al descargar
      <label className="touch-snap-toggle"><input type="checkbox" checked={snapEnabled}
        onChange={e=>setSnapEnabled(e.target.checked)}/>Alinear automáticamente</label></div>}
    {onRemove && <div className="touch-editor-actionbar"><span>{chosen ? 'Seleccionado: ' + chosen.name : 'Toca una foto o sticker para seleccionarlo'}</span>
      <button type="button" className="touch-editor-delete-primary" disabled={!chosen}
        onClick={() => { if (chosen) deleteLayer(chosen.id); }}><Trash2 size={16}/> Borrar elemento</button></div>}
    <div ref={scrollArea} className="touch-editor-scroll" style={{'--panorama-pages':pageCount} as React.CSSProperties}>
      <div ref={stage} className={'touch-editor-stage' + (dragOver ? ' drag-over' : '')}
        style={{aspectRatio: String(ratio), ...(pageCount > 1 ? {minWidth: pageCount * 230} : {})}}
        onClick={e => { if (e.target === e.currentTarget) { setSelected(''); onEmpty?.(); } }}
        onDragOver={e => { if (onDropAsset || onDropFiles) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false);
          const bounds = e.currentTarget.getBoundingClientRect();
          const point = {x: Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width)),
            y: Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height))};
          const id = e.dataTransfer.getData('application/x-content-lab-asset');
          if (id) onDropAsset?.(id, point);
          else if (e.dataTransfer.files.length) onDropFiles?.([...e.dataTransfer.files], point);
        }}>
        {preview ? <img className="touch-editor-base" src={preview} alt="Fondo y textos del diseño" draggable={false}/>
          : <div className="touch-editor-loading">Preparando lienzo…</div>}
        {layers.map(layer => {
          const rect = getRect(layer), active = selected === layer.id;
          const z = pageCount > 1 ? (layer.placement === 'behind-text' ? 2 : 5) : 5;
          const crop = normalizeCrop(rect.crop);
          const mode=layer.frameStyle||'panorama',fw=rect.w*1080*pageCount,fh=rect.h*1350;
          const metrics=photoFrameMetrics(fw,fh,mode);
          const radius=(r:number,w:number,h:number)=>`${100*r/Math.max(1,w)}% / ${100*r/Math.max(1,h)}%`;
          const outerRadius=layerCornerPixels(rect,fw,fh,100*metrics.radius/Math.max(1,Math.min(fw,fh)));
          const innerRadius=rect.cornerRadius===undefined?metrics.innerRadius:Math.max(0,outerRadius-metrics.inset*.38);
          const photoWindow:React.CSSProperties=layer.kind==='photo'?{
            left:100*metrics.inset/fw+'%',right:100*metrics.inset/fw+'%',
            top:100*metrics.inset/fh+'%',bottom:100*metrics.bottom/fh+'%',
            borderRadius:radius(innerRadius,fw-2*metrics.inset,fh-metrics.inset-metrics.bottom),
          }:{
            borderRadius:radius(layerCornerPixels(rect,fw,fh),fw,fh),
          };
          return <div key={layer.id} data-layer={layer.id}
            className={'touch-editor-layer ' + layer.kind + (active ? ' active' : '') + (active && cropping ? ' cropping' : '')}
            style={{left: rect.x * 100 + '%', top: rect.y * 100 + '%', width: rect.w * 100 + '%',
              height: rect.h * 100 + '%', transform: 'rotate(' + (rect.angle || 0) + 'deg)', zIndex:z}}
            tabIndex={0} role="button" aria-label={'Mover ' + layer.name} aria-pressed={active}
            onPointerDown={e => down(e, layer)} onPointerMove={e => move(e, layer)}
            onPointerUp={e => done(e, layer)} onPointerCancel={e => done(e, layer)}
            onDoubleClick={() => { if (layer.kind === 'photo') { setSelected(layer.id); setCropping(true); } }}
            onKeyDown={e => {
              if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
              e.preventDefault(); setSelected(layer.id);
              const r = getRect(layer), step = e.shiftKey ? .03 : .01;
              const rect = clamp({...r, x: r.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0) / pageCount,
                y: r.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0)});
              update(layer.id, rect); onCommit(layer.kind, layer.id, rect);
            }}>
            {layer.kind==='photo'&&mode!=='none'&&mode!=='panorama'&&<div className="touch-editor-photo-frame"
              style={{borderRadius:radius(outerRadius,fw,fh),background:mode==='polaroid'?'#FFFCF7':layer.paper||'#FAF8F3',
                boxShadow:mode==='soft-shadow'||mode==='polaroid'?'0 3px 9px #15262d38':undefined}}/>}
            {(layer.kind==='photo'||layer.kind==='sticker')&&<div className="touch-editor-image-window" style={photoWindow}>
              <img src={layer.src} alt="" draggable={false} style={layer.kind === 'photo' ? {
                objectPosition: crop.x * 100 + '% ' + crop.y * 100 + '%',
                transform: 'scale(' + crop.zoom + ')', transformOrigin: crop.x * 100 + '% ' + crop.y * 100 + '%',
              } : undefined}/>
            </div>}
            {layer.kind==='text'&&<div className="touch-editor-free-text" style={{
              fontFamily:panoramaFont(layer.font),
              fontSize:(layer.fontSize||76)*stageHeight/1350+'px',
              lineHeight:layer.lineHeight||1.12,
              letterSpacing:(layer.spacing||0)*stageHeight/1350+'px',
              color:layer.color||'#191919',
              textShadow:layer.shadow?'0 2px 7px #19191966':undefined,
              WebkitTextStroke:layer.outline?'1px #FFFFFF':undefined,
            }}>{layer.text||''}</div>}
            {layer.kind==='shape'&&<div className={'touch-editor-collage-shape shape-'+(layer.shape||'paper')}
              style={{background:layer.shape==='frame'?'transparent':layer.color||'#F1E5D2',
                borderColor:layer.color||'#F1E5D2',
                borderRadius:layer.shape==='circle'?'50%':radius(layerCornerPixels(rect,fw,fh),fw,fh)}}/>}
            {layer.kind==='photo'&&mode==='double-border'&&<div className="touch-editor-double-border"
              style={{borderColor:layer.accent||'#BED8E9',borderRadius:radius(outerRadius,fw,fh)}}/>}
            {active && <><span className="touch-editor-outline"/>
              {!cropping && <span className="touch-editor-resize" data-resize-handle aria-hidden="true"/>}</>}
          </div>;
        })}
        {pageCount > 1 && textOverlay && <img className="touch-editor-text-overlay" src={textOverlay}
          alt="" draggable={false} aria-hidden="true"/>}
        {snapGuides&&<div className="touch-editor-smart-guides" aria-hidden="true">
          {snapGuides.x!==undefined&&<span className="vertical" style={{left:snapGuides.x*100+'%'}}/>}
          {snapGuides.y!==undefined&&<span className="horizontal" style={{top:snapGuides.y*100+'%'}}/>}
        </div>}
        {pageCount > 1 && <div className="panorama-cut-guides" aria-hidden="true">
          {Array.from({length: pageCount}, (_, n) => <div key={n} style={{left: n / pageCount * 100 + '%', width: 100 / pageCount + '%'}}>
            <span>SLIDE {n + 1}</span></div>)}
        </div>}
      </div>
    </div>
    <p className="touch-editor-help">{cropping ? 'Arrastra dentro del marco para elegir qué parte de la foto se ve. Usa Zoom para acercar.'
      : 'Arrastra para mover · usa la esquina o dos dedos para cambiar tamaño · selecciona una foto para encuadrarla.'}</p>
    {chosen && selectedRect && <div className="touch-editor-options">
      <strong>{chosen.name}</strong>
      {(chosen.kind==='photo'||chosen.kind==='sticker'||(chosen.kind==='shape'&&chosen.shape!=='circle'))&&
        <div className="touch-editor-corner-controls">
          <label htmlFor="corner-radius-control">Redondear esquinas <output>{selectedCornerRadius}%</output></label>
          <input id="corner-radius-control" type="range" min="0" max="50" step="1"
            aria-label="Redondear esquinas del elemento" value={selectedCornerRadius}
            onChange={e=>commit({cornerRadius:Number(e.target.value)})}/>
          <div className="touch-editor-corner-presets">
            <button type="button" onClick={()=>commit({cornerRadius:0})}>Rectas</button>
            <button type="button" onClick={()=>commit({cornerRadius:12})}>Suaves</button>
            <button type="button" onClick={()=>commit({cornerRadius:28})}>Redondas</button>
            <button type="button" onClick={()=>commit({cornerRadius:50})}>Máximo</button>
          </div>
        </div>}
      {chosen.kind==='text'&&onUpdate&&<div className="touch-editor-type-settings">
        <label>Texto<textarea rows={2} aria-label="Editar texto libre" value={chosen.text||''}
          onChange={e=>onUpdate(chosen.id,{text:e.target.value})}/></label>
        <label>Fuente<select aria-label="Fuente de texto libre" value={chosen.font||'serif'}
          onChange={e=>onUpdate(chosen.id,{font:e.target.value})}>
          {['serif','sans','prompt','futura','dm serif display','cormorant','playfair','fraunces','bodoni','libre','outfit','manrope','syne','space','caveat']
           .map(v=><option key={v} value={v}>{v[0].toUpperCase()+v.slice(1)}</option>)}
        </select></label>
        <label>Tamaño <input type="range" min="20" max="240" step="2" value={chosen.fontSize||76}
          onChange={e=>onUpdate(chosen.id,{fontSize:Number(e.target.value)})}/><span>{chosen.fontSize||76}px</span></label>
        <label>Interlineado <input type="range" min=".7" max="2" step=".05" value={chosen.lineHeight||1.12}
          onChange={e=>onUpdate(chosen.id,{lineHeight:Number(e.target.value)})}/></label>
        <label>Espaciado <input type="range" min="-6" max="35" step="1" value={chosen.spacing||0}
          onChange={e=>onUpdate(chosen.id,{spacing:Number(e.target.value)})}/></label>
        <label>Color <input type="color" aria-label="Color de texto libre"
          value={chosen.color||'#191919'} onChange={e=>onUpdate(chosen.id,{color:e.target.value})}/></label>
        <label><input type="checkbox" checked={!!chosen.shadow} onChange={e=>onUpdate(chosen.id,{shadow:e.target.checked})}/> Sombra</label>
        <label><input type="checkbox" checked={!!chosen.outline} onChange={e=>onUpdate(chosen.id,{outline:e.target.checked})}/> Contorno</label>
      </div>}
      {chosen.kind==='shape'&&onUpdate&&<div className="touch-editor-type-settings">
        <label>Forma<select value={chosen.shape||'paper'}
          onChange={e=>onUpdate(chosen.id,{shape:e.target.value as PanoramaLayer['shape']})}>
          <option value="paper">Papel</option><option value="tape">Cinta washi</option>
          <option value="frame">Marco</option><option value="circle">Círculo</option></select></label>
        <label>Color <input type="color" value={chosen.color||'#F1E5D2'}
          onChange={e=>onUpdate(chosen.id,{color:e.target.value})}/></label>
      </div>}
      {chosen.kind === 'photo' && <><button type="button" className="touch-editor-fit"
        onClick={() => { void fitWholePhoto(); }}>Mostrar foto completa</button>
        <button type="button" aria-pressed={cropping}
        onClick={() => setCropping(v => !v)}>{cropping ? '✓ Listo · mover marco' : 'Recortar / encuadrar'}</button>
        {cropping && <><label>Zoom <input aria-label="Zoom del encuadre" type="range" min="1" max="4" step=".05"
          value={normalizeCrop(selectedRect.crop).zoom}
          onChange={e => commit({crop: normalizeCrop({...selectedRect.crop, zoom: Number(e.target.value)})})}/></label>
          <button type="button" onClick={() => commit({crop: normalizeCrop()})}>Centrar foto</button></>}
      </>}
      {!cropping && <><label>Girar <input aria-label="Girar la capa" type="range" min="-180" max="180" step="1"
        value={selectedRect.angle || 0} onChange={e => commit({angle: Number(e.target.value)})}/></label>
        <button type="button" onClick={() => commit({angle: 0})}>Enderezar</button></>}
      {onReorder && <div className="touch-editor-order-controls" aria-label="Orden de capas">
        <span>Orden de capas</span>
        <button type="button" onClick={()=>onReorder(chosen.id,'backward')}>Un nivel atrás</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'forward')}>Un nivel delante</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'back')}>Enviar al fondo</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'front')}>Traer al frente</button>
      </div>}
    </div>}
    {pageCount > 1 && onRemove && <div className="touch-editor-layer-list" aria-label="Elementos del carrusel">
      <strong>Fotos y stickers ({layers.length})</strong>
      <div className="touch-editor-layer-items">{layers.map(layer => <div className="touch-editor-layer-item" key={layer.id}>
        <button type="button" className={selected === layer.id ? 'selected' : ''}
          onClick={() => setSelected(layer.id)} aria-pressed={selected === layer.id}
          title={'Seleccionar ' + layer.name}>{layer.kind==='text'?<span className="touch-layer-mini">T</span>:
          layer.kind==='shape'?<span className="touch-layer-mini">▧</span>:
          <img src={layer.src} alt=""/>}<span>{layer.name}</span></button>
        <button type="button" className="touch-editor-layer-trash" title={'Borrar ' + layer.name}
          aria-label={'Borrar ' + layer.name} onClick={() => deleteLayer(layer.id)}><Trash2 size={16}/></button>
      </div>)}</div>
      {!layers.length && <p>Añade fotos o stickers al lienzo para editarlos aquí.</p>}
    </div>}
  </div>;
}
