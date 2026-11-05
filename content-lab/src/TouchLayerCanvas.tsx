import React, { useEffect, useRef, useState } from 'react';
import {createPortal} from 'react-dom';
import type { TouchRect } from './TouchGeometry';
import { clampRect, clampFreePhotoRect, clampPanoramaRect, layerCornerPixels } from './TouchGeometry';
import { coverPlacement, normalizeCrop, photoFrameMetrics, initialPanoramaPhotoRect } from './PhotoCrop';
import { Trash2, LockKeyhole, LockKeyholeOpen, Copy, Layers3 } from 'lucide-react';
import { panoramaFont,panoramaTextWeight,type PanoramaLayer } from './PanoramaLayers';
import './TouchLayerCanvas.css';
import type {StickerCopyResult} from './CarouselStickerCopy';

export type TouchLayer = {
  id: string; name: string; src: string; rect: TouchRect; kind: 'photo' | 'sticker' | 'text' | 'shape';
  text?:string; font?:string; fontSize?:number; fontWeight?:number; color?:string; lineHeight?:number; spacing?:number;
  outline?:boolean; shadow?:boolean; shape?:PanoramaLayer['shape'];
  placement?: 'behind-text' | 'front';role?:'background';locked?:boolean;opacity?:number;
  frameStyle?: string; paper?: string; accent?: string;
};
type Props = {
  preview: string; textOverlay?: string; layers: TouchLayer[];
  onCommit: (kind: 'photo' | 'sticker' | 'text' | 'shape', id: string, rect: TouchRect) => void;
  onUpdate?: (id:string, patch:Partial<PanoramaLayer>)=>void;
  onSelectionChange?: (id:string|null)=>void;
  ratio?: number; pageCount?: number; continuous?:boolean; canvasHeight?: number; onEmpty?: () => void;
  onRemove?: (id: string) => void;
  onReorder?: (id: string, move: 'backward' | 'forward' | 'back' | 'front') => void;
  onToggleLock?: (id:string,locked:boolean)=>void;
  onDuplicateText?: (id:string)=>void;
  onDropAsset?: (id: string, point: {x: number; y: number}) => void;
  onDropFiles?: (files: File[], point: {x: number; y: number}) => void;
  onCopySticker?: (id:string,targetIndex:number)=>StickerCopyResult;
  textPalette?:string[];
  focusLayerId?:string;
  inlineTextTools?:boolean;
  fullscreen?:boolean;
};
type Gesture = {
  id: string; start: TouchRect; startX: number; startY: number;
  width: number; height: number; resize: boolean; crop: boolean;
  overflowX: number; overflowY: number;
  scrollLeft: number;
  pinchDistance?: number; pinchCenter?: [number, number];
};
export default function TouchLayerCanvas({
  preview, textOverlay, layers, onCommit, ratio = 1080 / 1350, pageCount = 1, continuous=true, canvasHeight = 1350, onEmpty,
  onRemove, onReorder, onUpdate, onSelectionChange, onDropAsset, onDropFiles, onCopySticker,onToggleLock,onDuplicateText,focusLayerId,inlineTextTools=false,fullscreen=false,
  textPalette=['#191919','#FFFFFF','#F2D85B','#BED8E9'],
}: Props) {
  const [draft, setDraft] = useState<Record<string, TouchRect>>({});
  const [selected, setSelected] = useState('');
  const [contextInspector,setContextInspector]=useState<'opacity'|'rotation'|'position'|null>(null);
  const [editingText,setEditingText]=useState('');
  const [advancedOpen,setAdvancedOpen]=useState(false);
  const [copyFeedback,setCopyFeedback]=useState('');
  // Separate browsing the panorama from handling a selected object.
  const [interactionMode,setInteractionMode]=useState<'navigate'|'edit'>(pageCount>1?'navigate':'edit');
  const [activePage,setActivePage]=useState(0);
  const [floatingModeBar,setFloatingModeBar]=useState(false);
  const canvasRoot=useRef<HTMLDivElement>(null);
  const navigationBar=useRef<HTMLDivElement>(null);
  const [cropping, setCropping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [snapEnabled,setSnapEnabled]=useState(true);
  const [snapGuides,setSnapGuides]=useState<{x?:number;y?:number}|null>(null);
  const [stageHeight,setStageHeight]=useState(540);
  const quickTextInput = useRef<HTMLTextAreaElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const autoPanFrame = useRef(0);
  const pointers = useRef(new Map<number, {x: number; y: number}>());
  const gesture = useRef<Gesture | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const clamp = (rect: TouchRect, kind:TouchLayer['kind']='sticker') =>
    pageCount>1?clampPanoramaRect(rect,.055/pageCount):kind==='photo'?clampFreePhotoRect(rect):clampFreePhotoRect(rect);
  useEffect(() => { if (!gesture.current) setDraft({}); }, [layers]);
  useEffect(() => { setCropping(false);setCopyFeedback('');setAdvancedOpen(false);setContextInspector(null); }, [selected]);
  useEffect(()=>{if(editingText)window.requestAnimationFrame(()=>quickTextInput.current?.focus());},[editingText]);
  useEffect(()=>{if(editingText && !layers.some(item=>item.id===editingText))setEditingText('');},[editingText,layers]);
  useEffect(() => { if (selected && !layers.some(layer => layer.id === selected)) setSelected(''); }, [layers, selected]);
  const focusedWallpaperReady=Boolean(focusLayerId&&layers.some(layer=>layer.id===focusLayerId));
  useEffect(()=>{
    if(focusLayerId&&focusedWallpaperReady){
      setInteractionMode('edit');setSelected(focusLayerId);
      if(onUpdate&&(inlineTextTools||pageCount>1)&&layers.some(item=>item.id===focusLayerId&&item.kind==='text')){
        setEditingText(focusLayerId);
      }
    }
  },[focusLayerId,pageCount,focusedWallpaperReady,inlineTextTools]);
  useEffect(()=>()=>{window.cancelAnimationFrame(autoPanFrame.current);},[]);
  useEffect(()=>{
    const el=stage.current;if(!el)return;
    const resize=()=>setStageHeight(el.getBoundingClientRect().height||540);
    resize();const observer=new ResizeObserver(resize);observer.observe(el);
    return()=>observer.disconnect();
  },[pageCount]);
  // The fixed switch follows scrolling even inside a fullscreen iPad canvas.
  useEffect(()=>{
    // Fullscreen always uses its own fixed toolbar, including in iPhone in-app browsers.
    if(pageCount<=1||fullscreen){setFloatingModeBar(false);return}
    let frame=0;
    const check=()=>{
      frame=0;
      const root=canvasRoot.current,nav=navigationBar.current;
      if(!root||!nav)return;
      const area=root.getBoundingClientRect(),bar=nav.getBoundingClientRect();
      const height=window.visualViewport?.height||window.innerHeight;
      const visible=bar.bottom<12&&area.bottom>100&&area.top<height-30;
      setFloatingModeBar(previous=>previous===visible?previous:visible);
    };
    const schedule=()=>{if(!frame)frame=window.requestAnimationFrame(check)};
    check();
    window.addEventListener('scroll',schedule,true);
    window.addEventListener('resize',schedule);
    window.visualViewport?.addEventListener('resize',schedule);
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(schedule);
    if(observer&&canvasRoot.current)observer.observe(canvasRoot.current);
    return()=>{
      window.removeEventListener('scroll',schedule,true);
      window.removeEventListener('resize',schedule);
      window.visualViewport?.removeEventListener('resize',schedule);
      observer?.disconnect();
      if(frame)window.cancelAnimationFrame(frame);
    };
  },[pageCount,fullscreen]);
  const switchMode=(mode:'navigate'|'edit')=>{
    setInteractionMode(mode);
    if(mode==='navigate'){
      setSelected('');setCropping(false);
      gesture.current=null;pointers.current.clear();
      window.cancelAnimationFrame(autoPanFrame.current);
    }
  };
  const goToPage=(index:number,keepSelection=false)=>{
    if(pageCount<=1)return;
    // Changing slides clears the previous selection; the next slide is editable.
    if(!keepSelection){setSelected('');setCropping(false)}
    const viewport=scrollArea.current,canvas=stage.current;
    const next=Math.max(0,Math.min(pageCount-1,index));
    setActivePage(next);
    if(!viewport||!canvas)return;
    const width=canvas.getBoundingClientRect().width/pageCount;
    viewport.scrollTo({left:Math.max(0,Math.min(viewport.scrollWidth-viewport.clientWidth,
      (next+.5)*width-viewport.clientWidth/2)),behavior:'auto'});
  };
  const syncPageFromScroll=()=>{
    if(pageCount<=1)return;
    const viewport=scrollArea.current,canvas=stage.current;
    if(!viewport||!canvas)return;
    const width=canvas.getBoundingClientRect().width/pageCount;
    if(width>0)setActivePage(Math.max(0,Math.min(pageCount-1,
      Math.floor((viewport.scrollLeft+viewport.clientWidth/2)/width))));
  };
  const getRect = (layer: TouchLayer) => draftRef.current[layer.id] || layer.rect;
  const selectFromList=(id:string)=>{
    setInteractionMode('edit');setSelected(id);setCropping(false);
    const item=layers.find(layer=>layer.id===id);
    if(item&&pageCount>1){
      const center=(getRect(item).x+getRect(item).w/2)*pageCount;
      goToPage(Math.floor(Math.min(pageCount-.01,Math.max(0,center))),true);
    }
  };
  const update = (id: string, next: TouchRect) => {
    const kind=layers.find(layer=>layer.id===id)?.kind||'sticker';
    const rect = clamp(next,kind);
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
  // Support a pinch even when the second finger lands on another layer or empty space.
  const addPinchPointer=(e:React.PointerEvent<HTMLDivElement>)=>{
    const active=gesture.current;
    if((pageCount>1&&interactionMode==='navigate')||!active||pointers.current.has(e.pointerId)||pointers.current.size!==1)return false;
    const source=layers.find(item=>item.id===active.id);if(!source)return false;
    e.preventDefault();e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const [a,b]=[...pointers.current.values()];
    gesture.current={...active,start:getRect(source),
      pinchDistance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
      pinchCenter:[(a.x+b.x)/2,(a.y+b.y)/2],resize:false,crop:false};
    return true;
  };
  const down = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    if(addPinchPointer(e))return;
    if((pageCount>1&&interactionMode==='navigate')||layer.locked)return;
    e.preventDefault();e.stopPropagation();
    // In edit mode the first touch selects AND starts moving the object.
    // Navigation mode still protects all layers during swipe gestures.
    if(selected!==layer.id)setSelected(layer.id);
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
    const metrics=photoFrameMetrics(rect.w*1080*pageCount,rect.h*canvasHeight,layer.frameStyle||'panorama');
    const pixelScale=bounds.height/canvasHeight;
    const frameW = rect.w * bounds.width-2*metrics.inset*pixelScale;
    const frameH = rect.h * bounds.height-(metrics.inset+metrics.bottom)*pixelScale;
    const placement = coverPlacement(img?.naturalWidth || 1, img?.naturalHeight || 1,
      frameW, frameH, rect.crop);
    gesture.current = {
      id: layer.id, start: rect, startX: e.clientX, startY: e.clientY,
      width: bounds.width, height: bounds.height,
      resize: !!(e.target as HTMLElement).closest('[data-resize-handle]'),
      crop: cropping && selected === layer.id && layer.kind === 'photo' && layer.role!=='background',
      overflowX: Math.max(0, placement.width - frameW),
      overflowY: Math.max(0, placement.height - frameH),
      scrollLeft: scrollArea.current?.scrollLeft||0,
    };
    startAutoPan();
  };
  const move = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    if((pageCount>1&&interactionMode==='navigate')||layer.locked)return;
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    if(g.id!==layer.id){
      if(pageCount>1&&interactionMode==='navigate')return;
      const source=layers.find(item=>item.id===g.id);if(!source)return;
      layer=source;
    }
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
        if(layer.role==='background'){
          // Horizontal resizing is independent of height and works in both directions.
          update(g.id,{...g.start,w:Math.max(1/pageCount,Math.min(1-g.start.x,g.start.w+dx)),h:1,y:0});
        }else{
          const factor = Math.max(.4, Math.min(2.8, 1 + Math.max(dx, dy / ratio) / Math.max(.008, g.start.w)));
          update(g.id, {...g.start, w: g.start.w * factor, h:g.start.h*factor});
        }
      } else update(g.id, applySmartSnap({...g.start, x: g.start.x + dx, y: g.start.y + dy},g.width,g.height));
    }
  };
  const done = (e: React.PointerEvent<HTMLDivElement>, layer: TouchLayer) => {
    if((pageCount>1&&interactionMode==='navigate')||layer.locked)return;
    if (!pointers.current.has(e.pointerId)) return;
    if(gesture.current&&gesture.current.id!==layer.id){
      const source=layers.find(item=>item.id===gesture.current?.id);if(source)layer=source;
    }
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
      const next=draftRef.current[layer.id];
      // Resizing a text box must resize the actual lettering in the exported PNG,
      // not just its invisible bounding rectangle.
      if(layer.kind==='text'&&onUpdate&&Math.abs(next.w-layer.rect.w)>.001){
        const fontSize=Math.round(Math.max(16,Math.min(420,(layer.fontSize||76)*next.w/Math.max(.001,layer.rect.w))));
        onUpdate(layer.id,{rect:next,fontSize});
      }else onCommit(layer.kind,layer.id,next);
    }
  };
  const chosen = pageCount>1&&interactionMode==='navigate'?undefined:layers.find(layer => layer.id === selected);
  const selectedRect = chosen ? getRect(chosen) : undefined;
  useEffect(()=>{onSelectionChange?.(chosen?.id??null)},[chosen?.id,onSelectionChange]);
  const selectedCornerRadius = selectedRect?.cornerRadius ?? (chosen?.kind==='photo'&&selectedRect
    ? Math.round(100*photoFrameMetrics(selectedRect.w*1080*pageCount,selectedRect.h*canvasHeight,
      chosen.frameStyle||'panorama').radius/Math.max(1,Math.min(selectedRect.w*1080*pageCount,selectedRect.h*canvasHeight)))
    : 0);
  const commit = (patch: Partial<TouchRect>) => {
    if (!chosen || !selectedRect) return;
    const next = clamp({...selectedRect, ...patch},chosen.kind);
    update(chosen.id, next); onCommit(chosen.kind, chosen.id, next);
  };
  /** Zoom the layer around its own center; position may extend beyond the artboard. */
  const resizeSelected=(factor:number)=>{
    if(!chosen||!selectedRect||cropping)return;
    const width=Math.max(.055,Math.min(3,selectedRect.w*factor));
    const height=Math.max(.055,Math.min(3,selectedRect.h*factor));
    const next=clamp({...selectedRect,
      w:width,h:height,
      x:selectedRect.x+(selectedRect.w-width)/2,
      y:selectedRect.y+(selectedRect.h-height)/2,
    },chosen.kind);
    update(chosen.id,next);
    if(chosen.kind==='text'&&onUpdate){
      // Resize the actual lettering as well as its box, including in exported PNGs.
      onUpdate(chosen.id,{rect:next,fontSize:Math.round(Math.max(20,Math.min(240,(chosen.fontSize||76)*next.w/Math.max(.001,selectedRect.w))))});
    }else onCommit(chosen.kind,chosen.id,next);
  };
  const fitSelectedText=()=>{
    if(!chosen||chosen.kind!=='text'||!selectedRect||!onUpdate)return;
    const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return;
    const maxWidth=Math.max(50,selectedRect.w*1080*pageCount-12);
    const maxHeight=selectedRect.h*canvasHeight-4;
    const leading=Math.max(.7,Math.min(2,chosen.lineHeight||1.12));
    let fitted=20;
    for(let size=Math.min(240,Math.max(20,chosen.fontSize||76));size>=20;size-=2){
      ctx.font=panoramaTextWeight(chosen.fontWeight)+' '+size+'px '+panoramaFont(chosen.font);
      let count=0;
      for(const paragraph of (chosen.text||'').split('\n')){
        const words=paragraph.split(/\s+/).filter(Boolean);
        if(!words.length){count++;continue}
        let line='';
        for(const word of words){
          const next=line?line+' '+word:word;
          if(line&&ctx.measureText(next).width>maxWidth){count++;line=word}else line=next;
        }
        count++;
      }
      if(count*size*leading<=maxHeight){fitted=size;break}
    }
    onUpdate(chosen.id,{fontSize:fitted});
  };
  const setSelectedSize=(percent:number)=>{
    if(!chosen||!selectedRect||cropping||!Number.isFinite(percent))return;
    const factor=(percent/100)/Math.max(.001,selectedRect.w);
    resizeSelected(factor);
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
      const rect = clamp({...current, ...next},chosen.kind);
      update(chosen.id, rect); onCommit(chosen.kind, chosen.id, rect);
      setCropping(false);
    } catch { /* Keep the image as-is if its original proportions are unavailable. */ }
  };
  const deleteLayer = (id: string) => {
    if (!onRemove) return;
    onRemove(id);
    if (selected === id) setSelected('');
  };
  const mobileContextControls=<>
  {typeof document!=='undefined'&&window.matchMedia('(max-width:799px)').matches
          ?createPortal(mobileContextControls,document.body):mobileContextControls}
        {pageCount > 1 && textOverlay && <img className="touch-editor-text-overlay" src={textOverlay}
          alt="" draggable={false} aria-hidden="true" style={{zIndex:10}}/>}
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
    {pageCount>1&&interactionMode==='edit'&&<details className="touch-editor-below-canvas-controls">
      <summary>Capas · elegir elemento si se superponen</summary>
      {interactionMode==='edit'&&<div className="touch-editor-quick-layers" role="group"
        aria-label="Elegir foto o sticker incluso si están superpuestos">
        <strong>Elige un elemento para moverlo:</strong>
        <div>{layers.slice().reverse().map(layer=><button type="button" key={layer.id}
          className={selected===layer.id?'selected':''} aria-pressed={selected===layer.id}
          onClick={()=>selectFromList(layer.id)}>
          {(layer.kind==='photo'||layer.kind==='sticker')&&layer.src?<img className="touch-layer-real-thumb" src={layer.src} alt="" loading="lazy"/>:<span aria-hidden="true">{layer.kind==='text'?'T':'▧'}</span>} <span className="touch-layer-real-name">{layer.name}</span>
        </button>)}</div>
      </div>}
    </details>}
    {pageCount>1&&chosen && onRemove && <div className="touch-editor-actionbar touch-editor-actionbar-compact">
      <span>{chosen.name}</span>
      <button type="button" className="touch-editor-delete-primary" onClick={()=>deleteLayer(chosen.id)}>
        <Trash2 size={15}/> Borrar
      </button>
    </div>}
    {pageCount>1&&chosen&&selectedRect&&!chosen.locked&&<div className="touch-editor-fast-actions">
      <span title={chosen.name}>{chosen.name}</span>
      <button type="button" aria-label="Reducir elemento" onClick={()=>resizeSelected(.86)}>−</button>
      <button type="button" aria-label="Agrandar elemento" onClick={()=>resizeSelected(1.16)}>＋</button>
      {chosen.kind==='text'&&onUpdate&&<button type="button" onClick={()=>setEditingText(chosen.id)}>✎ Editar texto aquí</button>}
      {chosen.kind==='photo'&&pageCount>1&&<button type="button" className="touch-editor-cross-slide" onClick={()=>{
         const nearest=Math.max(1,Math.min(pageCount-1,Math.round((selectedRect.x+selectedRect.w/2)*pageCount)));
         commit({x:nearest/pageCount-selectedRect.w/2});
       }}>Foto entre slides ↔</button>}
      {chosen.kind==='photo'&&onReorder&&<button type="button" onClick={()=>onReorder(chosen.id,'back')}>Enviar detrás</button>}
      {chosen.kind==='photo'&&onReorder&&<button type="button" onClick={()=>onReorder(chosen.id,'front')}>Traer delante</button>}
      {chosen.role==='background'&&<button type="button" onClick={()=>commit({
         w:Math.min(1-selectedRect.x,selectedRect.w+1/pageCount),h:1,y:0
       })}>Estirar fondo ↔</button>}
    </div>}
    {pageCount===1&&!inlineTextTools&&(layers.some(layer=>layer.kind==='text')||layers.some(layer=>layer.locked))&&
      <div className="touch-editor-post-text-list" aria-label="Seleccionar textos y elementos bloqueados">
        <strong>Editar textos y desbloquear capas</strong>
        <div>{layers.filter(layer=>layer.kind==='text'||layer.locked).map(layer=>
          <button type="button" key={layer.id}
            aria-pressed={selected===layer.id}
            onClick={()=>selectFromList(layer.id)}>
            <span aria-hidden="true">{layer.locked?'🔒':layer.kind==='text'?'T':'▧'}</span> {layer.name}
          </button>)}</div>
        <small>Selecciona un texto y cámbialo de sitio, color o tipografía.</small>
      </div>}
    {!inlineTextTools&&<p className="touch-editor-help">{pageCount>1
      ?interactionMode==='navigate'?'Desliza para cambiar de slide sin mover elementos.':
        'Toca y arrastra cualquier elemento. Usa ＋ o − para cambiar su tamaño.'
      :cropping ? 'Arrastra dentro del marco para elegir qué parte de la foto se ve. Usa Zoom para acercar.'
      : inlineTextTools?'Toca el texto o la foto para moverlo. Usa − / ＋ arriba o pellizca con dos dedos para cambiar su tamaño.':'Toca la foto y usa ＋ Agrandar o dos dedos; puedes ampliarla más allá del borde. Arrastra para mover.'}</p>}
    {chosen && selectedRect && (!inlineTextTools||advancedOpen) && <details className="touch-editor-options" key={chosen.id} open={inlineTextTools||undefined}>
      <summary>Más ajustes · {chosen.name}</summary>
      <strong>{chosen.name}</strong>
      {onToggleLock&&<button type="button" className="touch-editor-lock-button" aria-pressed={!!chosen.locked}
         onClick={()=>onToggleLock(chosen.id,!chosen.locked)}>{chosen.locked?<><LockKeyholeOpen size={16}/> Desbloquear elemento</>:<><LockKeyhole size={16}/> Bloquear posición</>}</button>}
      {chosen.locked?<p className="touch-editor-lock-hint">Protegido: desbloquéalo para editar, mover o borrar.</p>:<>
      {pageCount>1&&chosen.kind==='sticker'&&onCopySticker&&<div className="touch-editor-copy-sticker">
        <strong>Copiar este sticker a otro slide</strong>
        <p>Se mantiene el tamaño, la posición y el giro. El original no se mueve.</p>
        <div className="touch-editor-copy-destinations" role="group" aria-label="Elegir slide para copiar el sticker">
          {Array.from({length:pageCount},(_,n)=>n)
            .filter(n=>n!==Math.max(0,Math.min(pageCount-1,Math.floor((selectedRect.x+selectedRect.w/2)*pageCount))))
            .map(n=><button type="button" key={n}
            onClick={()=>{
              const status=onCopySticker(chosen.id,n);
              setCopyFeedback(status==='copied'?'✓ Copiado al slide '+(n+1)+'.':
                status==='exists'?'El sticker ya está en el slide '+(n+1)+'.':
                status==='full'?'El slide está lleno o alcanzaste el límite de capas. No se eliminó nada.':
                'Selecciona otro slide para copiarlo.');
            }}>Slide {n+1}</button>)}
        </div>
        {copyFeedback&&<small className="touch-editor-copy-feedback" role="status">{copyFeedback}</small>}
      </div>}
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
         <p className="touch-editor-text-guide">✍️ Toca el texto para seleccionarlo; después arrástralo donde quieras.</p>
         <div className="touch-editor-text-presets">
           <button type="button" aria-pressed={chosen.font==='poster'&&panoramaTextWeight(chosen.fontWeight)===900}
             onClick={()=>onUpdate(chosen.id,{font:'poster',fontWeight:900,fontSize:Math.max(96,chosen.fontSize||76),lineHeight:1})}>
             <strong>POSTER</strong><small>Extra Bold</small>
           </button>
           <button type="button" aria-pressed={chosen.font!=='poster'&&panoramaTextWeight(chosen.fontWeight)===700}
             onClick={()=>onUpdate(chosen.id,{font:'sans',fontWeight:700})}>
             <strong>Bold</strong><small>Clásica</small>
           </button>
         </div>
         <div className="touch-editor-text-position" role="group" aria-label="Posición del texto en el diseño">
           <strong>Posición rápida</strong>
           <button type="button" onClick={()=>commit({x:(activePage+.5)/pageCount-selectedRect!.w/2,y:.08})}>Arriba</button>
           <button type="button" onClick={()=>commit({x:(activePage+.5)/pageCount-selectedRect!.w/2,y:.5-selectedRect!.h/2})}>Centro</button>
           <button type="button" onClick={()=>commit({x:(activePage+.5)/pageCount-selectedRect!.w/2,y:.92-selectedRect!.h})}>Abajo</button>
         </div>
        <label>Texto<textarea rows={2} aria-label="Editar texto libre" value={chosen.text||''}
          onChange={e=>onUpdate(chosen.id,{text:e.target.value})}/></label>
        <label>Fuente<select aria-label="Fuente de texto libre" value={chosen.font||'serif'}
          onChange={e=>onUpdate(chosen.id,{font:e.target.value})}>
          {['serif','sans','poster','prompt','futura','dm serif display','cormorant','playfair','fraunces','bodoni','libre','outfit','manrope','syne','space','caveat']
           .map(v=><option key={v} value={v}>{v==='poster'?'Poster Extra Bold':v[0].toUpperCase()+v.slice(1)}</option>)}
        </select></label>
        <label>Grosor <select aria-label="Grosor del texto" value={panoramaTextWeight(chosen.fontWeight)}
           onChange={e=>onUpdate(chosen.id,{fontWeight:Number(e.target.value)})}>
           <option value={400}>Normal</option><option value={700}>Bold</option>
           <option value={800}>Muy bold</option><option value={900}>Extra bold</option>
         </select></label>
         <label>Tamaño <input type="range" min="20" max="240" step="2" value={chosen.fontSize||76}
          onChange={e=>onUpdate(chosen.id,{fontSize:Number(e.target.value)})}/><span>{chosen.fontSize||76}px</span></label>
        <label>Interlineado <input type="range" min=".7" max="2" step=".05" value={chosen.lineHeight||1.12}
          onChange={e=>onUpdate(chosen.id,{lineHeight:Number(e.target.value)})}/></label>
        <label>Espaciado <input type="range" min="-6" max="35" step="1" value={chosen.spacing||0}
          onChange={e=>onUpdate(chosen.id,{spacing:Number(e.target.value)})}/></label>
        <label>Color <input type="color" aria-label="Color de texto libre"
          value={chosen.color||'#191919'} onChange={e=>onUpdate(chosen.id,{color:e.target.value})}/></label>
        <div className="touch-editor-text-palette" role="group" aria-label="Colores rápidos de texto">
           {[...new Set(textPalette.filter(hex=>/^#[0-9a-f]{6}$/i.test(hex)))].map(hex=>
             <button type="button" key={hex} aria-label={'Color '+hex}
               aria-pressed={(chosen.color||'#191919').toLowerCase()===hex.toLowerCase()}
               onClick={()=>onUpdate(chosen.id,{color:hex})} style={{background:hex}}/>)}
         </div>
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
      {chosen.role==='background' && pageCount>1 && <div className="touch-editor-background-stretch-controls" role="group" aria-label="Estirar fondo a otras diapositivas">
        <strong>🎀 Fondo continuo · arrastra el tirador lateral para llegar a otra slide</strong>
        <button type="button" onClick={()=>commit({w:Math.min(1-selectedRect.x,selectedRect.w+1/pageCount),h:1,y:0})}>+ Extender 1 slide</button>
        <button type="button" onClick={()=>commit({w:Math.max(1/pageCount,selectedRect.w-1/pageCount),h:1,y:0})}>− Reducir 1 slide</button>
        <button type="button" onClick={()=>commit({x:0,y:0,w:1,h:1})}>Ocupar todo el carrusel</button>
        <small>La línea punteada marca el corte. El PNG conservará esa misma posición.</small>
      </div>}
      {chosen.kind === 'photo' && chosen.role!=='background' && <><button type="button" className="touch-editor-fit"
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
      {chosen.kind==='text'&&onDuplicateText&&<button type="button" className="touch-editor-duplicate-text" onClick={()=>onDuplicateText(chosen.id)}><Copy size={15}/> Duplicar texto</button>}
      {onReorder && <div className="touch-editor-order-controls" aria-label="Orden de capas">
        <span>Orden de capas</span>
        <button type="button" onClick={()=>onReorder(chosen.id,'backward')}>Un nivel atrás</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'forward')}>Un nivel delante</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'back')}>Enviar al fondo</button>
        <button type="button" onClick={()=>onReorder(chosen.id,'front')}>Traer al frente</button>
      </div>}
      </>}
    </details>}
    {pageCount > 1 && onRemove && <details className="touch-editor-layer-list" aria-label="Elementos del carrusel">
      <summary>Ver todos los elementos ({layers.length})</summary>
      <div className="touch-editor-layer-items">{layers.map(layer => <div className="touch-editor-layer-item" key={layer.id}>
        <button type="button" className={selected === layer.id ? 'selected' : ''}
          onClick={() => selectFromList(layer.id)} aria-pressed={selected === layer.id}
          title={'Seleccionar ' + layer.name}>{layer.kind==='text'?<span className="touch-layer-mini">T</span>:
          layer.kind==='shape'?<span className="touch-layer-mini">▧</span>:
          <img src={layer.src} alt=""/>}<span>{layer.name}</span></button>
        <button type="button" className="touch-editor-layer-trash" title={'Borrar ' + layer.name}
          aria-label={'Borrar ' + layer.name} disabled={!!layer.locked} onClick={() => deleteLayer(layer.id)}><Trash2 size={16}/></button>
      </div>)}</div>
      {!layers.length && <p>Añade fotos o stickers al lienzo para editarlos aquí.</p>}
    </details>}
  </div>;
}
