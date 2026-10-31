import React, { useEffect, useRef, useState } from 'react';
import type { TouchRect } from './TouchGeometry';
import { clampRect, clampPanoramaRect } from './TouchGeometry';
import { coverPlacement, normalizeCrop, photoFrameMetrics } from './PhotoCrop';
import './TouchLayerCanvas.css';

export type TouchLayer = {
  id: string; name: string; src: string; rect: TouchRect; kind: 'photo' | 'sticker';
  frameStyle?: string; paper?: string; accent?: string;
};
type Props = {
  preview: string; layers: TouchLayer[];
  onCommit: (kind: 'photo' | 'sticker', id: string, rect: TouchRect) => void;
  ratio?: number; pageCount?: number; onEmpty?: () => void;
  onRemove?: (id: string) => void;
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
  preview, layers, onCommit, ratio = 1080 / 1350, pageCount = 1, onEmpty,
  onRemove, onDropAsset, onDropFiles,
}: Props) {
  const [draft, setDraft] = useState<Record<string, TouchRect>>({});
  const [selected, setSelected] = useState('');
  const [cropping, setCropping] = useState(false);
  const [guides, setGuides] = useState(true);
  const [dragOver, setDragOver] = useState(false);
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
  useEffect(()=>()=>{window.cancelAnimationFrame(autoPanFrame.current);},[]);
  const getRect = (layer: TouchLayer) => draftRef.current[layer.id] || layer.rect;
  const update = (id: string, next: TouchRect) => {
    const rect = clamp(next);
    draftRef.current = {...draftRef.current, [id]: rect};
    setDraft(draftRef.current);
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
      } else update(g.id, {...g.start, x: g.start.x + dx, y: g.start.y + dy});
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
    window.cancelAnimationFrame(autoPanFrame.current);
    if (g?.id === layer.id && draftRef.current[layer.id]) {
      onCommit(layer.kind, layer.id, draftRef.current[layer.id]);
    }
  };
  const chosen = layers.find(layer => layer.id === selected);
  const selectedRect = chosen ? getRect(chosen) : undefined;
  const commit = (patch: Partial<TouchRect>) => {
    if (!chosen || !selectedRect) return;
    const next = clamp({...selectedRect, ...patch});
    update(chosen.id, next); onCommit(chosen.kind, chosen.id, next);
  };
  return <div className={'touch-editor' + (pageCount > 1 ? ' panorama-canvas' : '')}
    aria-label="Editor visual de fotos y stickers">
    {pageCount > 1 && <label className="panorama-guide-toggle"><input type="checkbox"
      checked={guides} onChange={e => setGuides(e.target.checked)}/><span>Mostrar líneas de corte · no se descargan</span></label>}
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
          const crop = normalizeCrop(rect.crop);
          const mode=layer.frameStyle||'panorama',fw=rect.w*1080*pageCount,fh=rect.h*1350;
          const metrics=photoFrameMetrics(fw,fh,mode);
          const radius=(r:number,w:number,h:number)=>`${100*r/w}% / ${100*r/h}%`;
          const photoWindow:React.CSSProperties=layer.kind==='photo'?{
            left:100*metrics.inset/fw+'%',right:100*metrics.inset/fw+'%',
            top:100*metrics.inset/fh+'%',bottom:100*metrics.bottom/fh+'%',
            borderRadius:radius(metrics.innerRadius,fw-2*metrics.inset,fh-metrics.inset-metrics.bottom),
          }:{};
          return <div key={layer.id} data-layer={layer.id}
            className={'touch-editor-layer ' + layer.kind + (active ? ' active' : '') + (active && cropping ? ' cropping' : '')}
            style={{left: rect.x * 100 + '%', top: rect.y * 100 + '%', width: rect.w * 100 + '%',
              height: rect.h * 100 + '%', transform: 'rotate(' + (rect.angle || 0) + 'deg)'}}
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
              style={{borderRadius:radius(metrics.radius,fw,fh),background:mode==='polaroid'?'#FFFCF7':layer.paper||'#FAF8F3',
                boxShadow:mode==='soft-shadow'||mode==='polaroid'?'0 3px 9px #15262d38':undefined}}/>}
            <div className="touch-editor-image-window" style={photoWindow}>
              <img src={layer.src} alt="" draggable={false} style={layer.kind === 'photo' ? {
                objectPosition: crop.x * 100 + '% ' + crop.y * 100 + '%',
                transform: 'scale(' + crop.zoom + ')', transformOrigin: crop.x * 100 + '% ' + crop.y * 100 + '%',
              } : undefined}/>
            </div>
            {layer.kind==='photo'&&mode==='double-border'&&<div className="touch-editor-double-border"
              style={{borderColor:layer.accent||'#BED8E9',borderRadius:radius(metrics.radius,fw,fh)}}/>}
            {active && <><span className="touch-editor-outline"/>
              {!cropping && <span className="touch-editor-resize" data-resize-handle aria-hidden="true"/>}</>}
          </div>;
        })}
        {pageCount > 1 && guides && <div className="panorama-cut-guides" aria-hidden="true">
          {Array.from({length: pageCount}, (_, n) => <div key={n} style={{left: n / pageCount * 100 + '%', width: 100 / pageCount + '%'}}>
            <span>SLIDE {n + 1}</span></div>)}
        </div>}
      </div>
    </div>
    <p className="touch-editor-help">{cropping ? 'Arrastra dentro del marco para elegir qué parte de la foto se ve. Usa Zoom para acercar.'
      : 'Arrastra para mover · usa la esquina o dos dedos para cambiar tamaño · selecciona una foto para encuadrarla.'}</p>
    {chosen && selectedRect && <div className="touch-editor-options">
      <strong>{chosen.name}</strong>
      {chosen.kind === 'photo' && <><button type="button" aria-pressed={cropping}
        onClick={() => setCropping(v => !v)}>{cropping ? '✓ Listo · mover marco' : 'Recortar / encuadrar'}</button>
        {cropping && <><label>Zoom <input aria-label="Zoom del encuadre" type="range" min="1" max="4" step=".05"
          value={normalizeCrop(selectedRect.crop).zoom}
          onChange={e => commit({crop: normalizeCrop({...selectedRect.crop, zoom: Number(e.target.value)})})}/></label>
          <button type="button" onClick={() => commit({crop: normalizeCrop()})}>Centrar foto</button></>}
      </>}
      {!cropping && <><label>Girar <input aria-label="Girar la capa" type="range" min="-180" max="180" step="1"
        value={selectedRect.angle || 0} onChange={e => commit({angle: Number(e.target.value)})}/></label>
        <button type="button" onClick={() => commit({angle: 0})}>Enderezar</button></>}
      {onRemove && <button type="button" onClick={() => {
        if (window.confirm('¿Quitar esta capa del diseño? Tu archivo original se conserva.')) {
          onRemove(chosen.id); setSelected('');
        }
      }}>Quitar del diseño</button>}
    </div>}
  </div>;
}
