import React, { useEffect, useRef, useState } from 'react';
import {createPortal} from 'react-dom';
import type { TouchRect } from './TouchGeometry';
import { clampRect, clampFreePhotoRect, clampPanoramaRect, layerCornerPixels } from './TouchGeometry';
import { coverPlacement, normalizeCrop, photoFrameMetrics, initialPanoramaPhotoRect } from './PhotoCrop';
import { Trash2, LockKeyhole, LockKeyholeOpen, Copy, Layers3 } from 'lucide-react';
import { panoramaFont,panoramaTextWeight,type PanoramaLayer } from './PanoramaLayers';
import CurvedTextPreview from './CurvedTextPreview';
import './TouchLayerCanvas.css';
import type {StickerCopyResult} from './CarouselStickerCopy';

export type TouchLayer = {
  id: string; name: string; src: string; rect: TouchRect; kind: 'photo' | 'sticker' | 'text' | 'shape';
  text?:string; font?:string; fontSize?:number; fontWeight?:number; color?:string; lineHeight?:number; spacing?:number; curve?:number;
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
  pageIndex?:number;onPageIndexChange?:(index:number)=>void;
  onRemove?: (id: string) => void;
  onReorder?: (id: string, move: 'backward' | 'forward' | 'back' | 'front') => void;
  onToggleLock?: (id:string,locked:boolean)=>void;
  onDuplicateText?: (id:string)=>void;
  onDuplicateLayer?: (id:string)=>void;
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
  onRemove, onReorder, onUpdate, onSelectionChange, onDropAsset, onDropFiles, onCopySticker,onToggleLock,onDuplicateText,onDuplicateLayer,focusLayerId,inlineTextTools=false,fullscreen=false,pageIndex,onPageIndexChange,
  textPalette=['#191919','#FFFFFF','#F2D85B','#BED8E9'],
}: Props) {
  const [draft, setDraft] = useState<Record<string, TouchRect>>({});
  const [selected, setSelected] = useState('');
  const [contextInspector,setContextInspector]=useState<'opacity'|'rotation'|'position'|'curve'|null>(null);
  // Preview opacity locally while dragging, avoiding full-canvas render and
  // autosave on every input event (especially costly in iPad/iPhone Safari).
  const [opacityPreview,setOpacityPreview]=useState<{id:string;value:number}|null>(null);
  const pendingOpacity=useRef<{id:string;value:number}|null>(null);
  const [editingText,setEditingText]=useState('');
  const [advancedOpen,setAdvancedOpen]=useState(false);
  const [copyFeedback,setCopyFeedback]=useState('');
  // Separate browsing the panorama from handling a selected object.
  const [interactionMode,setInteractionMode]=useState<'navigate'|'edit'>(pageCount>1?'navigate':'edit');
  const [activePage,setActivePage]=useState(pageIndex??0);
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
  // In Normal, each 4:5 page fills the editor viewport instead of sharing a panorama-sized viewport.
  const [normalPageWidth,setNormalPageWidth]=useState(320);
  const autoPanFrame = useRef(0);
  const pointers = useRef(new Map<number, {x: number; y: number}>());
  const gesture = useRef<Gesture | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const clamp = (rect: TouchRect, kind:TouchLayer['kind']='sticker') =>
    pageCount>1?clampPanoramaRect(rect,.055/pageCount):kind==='photo'?clampFreePhotoRect(rect):clampFreePhotoRect(rect);
  useEffect(() => { if (!gesture.current) setDraft({}); }, [layers]);
  useEffect(() => {
    setCropping(false);setCopyFeedback('');setAdvancedOpen(false);setContextInspector(null);
    setOpacityPreview(null);pendingOpacity.current=null;
  }, [selected]);
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
  useEffect(()=>{
    if(pageCount<=1||continuous)return;
    const viewport=scrollArea.current;
    if(!viewport)return;
    const measure=()=>{
      const width=viewport.clientWidth;
      if(width>0)setNormalPageWidth(previous=>Math.abs(previous-width)<1?previous:width);
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(viewport);
    return()=>observer.disconnect();
  },[pageCount,continuous,fullscreen]);
  useEffect(()=>{
    if(pageCount<=1||continuous)return;
    const viewport=scrollArea.current;
    if(viewport)viewport.scrollLeft=Math.max(0,Math.min(pageCount-1,activePage))*normalPageWidth;
    // Do not depend on activePage: swiping must not be pulled back during scroll.
  },[normalPageWidth,pageCount,continuous]);
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
    onPageIndexChange?.(next);
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
    if(width>0){
      const next=Math.max(0,Math.min(pageCount-1,
        Math.floor((viewport.scrollLeft+viewport.clientWidth/2)/width)));
      if(next!==activePage){setActivePage(next);onPageIndexChange?.(next)}
    }
  };
  useEffect(()=>{
    if(pageIndex===undefined||pageCount<=1)return;
    const next=Math.max(0,Math.min(pageCount-1,pageIndex));
    if(next!==activePage)goToPage(next);
  },[pageIndex,pageCount]);
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
  const visibleOpacity=(layer:TouchLayer)=>Math.max(0,Math.min(1,
    opacityPreview?.id===layer.id?opacityPreview.value:(layer.opacity??1)));
  const opacityPercent=chosen?Math.round(visibleOpacity(chosen)*100):100;
  const changeOpacity=(id:string,percent:number)=>{
    const value=Math.max(0,Math.min(1,percent/100));
    const draft={id,value};
    pendingOpacity.current=draft;
    setOpacityPreview(draft);
  };
  const finishOpacity=()=>{
    const draft=pendingOpacity.current;
    if(!draft)return;
    pendingOpacity.current=null;
    // One update per gesture preserves the existing undo/autosave behavior.
    onUpdate?.(draft.id,{opacity:draft.value});
    setOpacityPreview(null);
  };
  const opacitySliderEvents={
    onPointerUp:finishOpacity,onPointerCancel:finishOpacity,
    onTouchEnd:finishOpacity,onMouseUp:finishOpacity,
    onKeyUp:finishOpacity,onBlur:finishOpacity,
  };
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
    {chosen&&onUpdate&&<div className={'touch-editor-context-dock'+(fullscreen?' is-fullscreen':'')} role="toolbar" aria-label="Editar elemento seleccionado">
          <button type="button" aria-pressed={contextInspector==='opacity'} onClick={()=>setContextInspector(v=>v==='opacity'?null:'opacity')}><span aria-hidden="true">◐</span><small>Transparencia</small></button>
          <button type="button" aria-pressed={contextInspector==='position'} onClick={()=>setContextInspector(v=>v==='position'?null:'position')}><Layers3 size={18}/><small>Capas</small></button>
          {chosen.kind==='text'&&<button type="button" aria-pressed={contextInspector==='curve'} onClick={()=>setContextInspector(v=>v==='curve'?null:'curve')}><span aria-hidden="true">∩</span><small>Curvar</small></button>}
          <button type="button" aria-pressed={contextInspector==='rotation'} onClick={()=>setContextInspector(v=>v==='rotation'?null:'rotation')}><span aria-hidden="true">↻</span><small>Girar</small></button>
          <button type="button" onClick={()=>resizeSelected(.85)}><span aria-hidden="true">−</span><small>Reducir</small></button>
          <button type="button" onClick={()=>resizeSelected(1.15)}><span aria-hidden="true">＋</span><small>Agrandar</small></button>
          {onDuplicateLayer&&<button type="button" onClick={()=>onDuplicateLayer(chosen.id)}><span aria-hidden="true">⧉</span><small>Duplicar</small></button>}
          {!onDuplicateLayer&&chosen.kind==='text'&&onDuplicateText&&<button type="button" onClick={()=>onDuplicateText(chosen.id)}><span aria-hidden="true">⧉</span><small>Duplicar</small></button>}
          {onRemove&&<button type="button" onClick={()=>deleteLayer(chosen.id)}><Trash2 size={19}/><small>Borrar</small></button>}
          <button type="button" className="touch-editor-context-done" onClick={()=>{setSelected('');setContextInspector(null)}} aria-label="Terminar edición del elemento"><span aria-hidden="true">✓</span><small>Listo</small></button>
        </div>}
        {chosen&&selectedRect&&onUpdate&&contextInspector&&<div className={'touch-editor-context-inspector'+(fullscreen?' is-fullscreen':'')} role="group" aria-label="Ajustes del elemento">
          <div className="touch-editor-context-inspector-head"><strong>{contextInspector==='opacity'?'Transparencia':contextInspector==='rotation'?'Girar':contextInspector==='curve'?'Curvar texto':'Posición'}</strong>
            <button type="button" aria-label="Cerrar ajustes" onClick={()=>setContextInspector(null)}>×</button></div>
          {contextInspector==='opacity'&&<label className="touch-editor-context-range">
            Opacidad <input type="range" min="0" max="100" step="1" aria-label="Opacidad: 100 es completamente visible"
            value={opacityPercent} onChange={e=>changeOpacity(chosen.id,Number(e.currentTarget.value))} {...opacitySliderEvents}/>
            <output>{opacityPercent}%</output>
          </label>}
          {contextInspector==='curve'&&chosen.kind==='text'&&<div className="touch-editor-curve-inspector" role="group" aria-label="Curvatura del texto">
            <label className="touch-editor-context-range">Curvatura
              <input type="range" min="-100" max="100" step="1" aria-label="Curvar texto"
                value={chosen.curve||0} onChange={e=>onUpdate(chosen.id,{curve:Number(e.target.value)})}/>
              <output>{chosen.curve||0}%</output>
            </label>
            <div className="touch-editor-curve-presets">
              {([['Recto',0],['Arco',45],['Círculo',90],['Hacia abajo',-55]] as const).map(([name,value])=>
                <button type="button" key={name} aria-pressed={(chosen.curve||0)===value}
                  onClick={()=>onUpdate(chosen.id,{curve:value})}>{name}</button>)}
            </div>
            <label className="touch-editor-context-range">Espaciado
              <input type="range" min="-6" max="30" step="1" aria-label="Separación entre letras"
                value={chosen.spacing||0} onChange={e=>onUpdate(chosen.id,{spacing:Number(e.target.value)})}/>
              <output>{chosen.spacing||0}</output>
            </label>
          </div>}
          {contextInspector==='rotation'&&<label className="touch-editor-context-range">
            Rotación <input type="range" min="-180" max="180" step="1" aria-label="Girar elemento"
            value={selectedRect.angle||0} onChange={e=>onCommit(chosen.kind,chosen.id,{...selectedRect,angle:Number(e.target.value)})}/>
            <output>{selectedRect.angle||0}°</output>
          </label>}
          {contextInspector==='position'&&<div className="touch-editor-context-position">
            {onReorder&&<button type="button" onClick={()=>onReorder(chosen.id,'front')}>Traer delante</button>}
            {onReorder&&<button type="button" onClick={()=>onReorder(chosen.id,'back')}>Enviar detrás</button>}
            {onToggleLock&&<button type="button" onClick={()=>onToggleLock(chosen.id,!chosen.locked)}>{chosen.locked?'Desbloquear':'Bloquear'}</button>}
          </div>}
        </div>}
  </>;
  return <div ref={canvasRoot} className={'touch-editor' + (pageCount > 1 ? ' panorama-canvas' : '')+
    (pageCount>1&&interactionMode==='navigate'?' touch-editor-navigation-mode':' touch-editor-edit-mode')+
    (pageCount>1&&!continuous?' touch-editor-normal-pages':' touch-editor-seamless-pages')+
    (inlineTextTools?' touch-editor-inline-mode':'')+
    (fullscreen?' touch-editor-fullscreen-mode':'')}
    aria-label="Editor visual de fotos y stickers">
    {pageCount > 1 && <div className="panorama-guide-legend"><span className="panorama-guide-swatch" aria-hidden="true"/>
      {continuous?`${pageCount} slides · líneas azules = cortes al descargar`:`Carrusel normal · ${pageCount} slides independientes`}
      <label className="touch-snap-toggle"><input type="checkbox" checked={snapEnabled}
        onChange={e=>setSnapEnabled(e.target.checked)}/>Alinear automáticamente</label></div>}
    {pageCount>1&&!fullscreen&&<div ref={navigationBar} className="touch-editor-navigation" aria-label="Navegación y edición de carrusel">
      <div className="touch-editor-mode-switch" role="group" aria-label="Modo de interacción">
        <button type="button" className={interactionMode==='navigate'?'active':''}
          aria-pressed={interactionMode==='navigate'}
          onClick={()=>switchMode('navigate')}>
          <span aria-hidden="true">↔</span> Deslizar
        </button>
        <button type="button" className={interactionMode==='edit'?'active':''}
          aria-pressed={interactionMode==='edit'} onClick={()=>switchMode('edit')}>
          <span aria-hidden="true">✋</span> Editar
        </button>
      </div>
      <div className="touch-editor-page-navigation">
        <button type="button" aria-label="Slide anterior" disabled={activePage===0}
          onClick={()=>goToPage(activePage-1)}>‹</button>
        <span>Slide {activePage+1} de {pageCount}</span>
        <button type="button" aria-label="Slide siguiente" disabled={activePage===pageCount-1}
          onClick={()=>goToPage(activePage+1)}>›</button>
      </div>
      <div className="touch-editor-page-tabs" aria-label="Elegir slide directamente">
        {Array.from({length:pageCount},(_,index)=><button type="button" key={index}
          aria-current={index===activePage?'step':undefined}
          className={index===activePage?'active':''}
          onClick={()=>goToPage(index)}>{index+1}</button>)}
      </div>
      <p className="touch-editor-navigation-tip">{interactionMode==='navigate'
        ?'Desliza para cambiar de slide. Nada se moverá.'
        :'Toca y arrastra cualquier elemento. Usa el tirador para cambiar su tamaño.'}</p>
    </div>}
    {pageCount>1&&!chosen&&(fullscreen||floatingModeBar)&&typeof document!=='undefined'&&createPortal(
      <div className={'touch-editor-floating-mode'+(fullscreen?' fullscreen':'')} role="toolbar" aria-label="Modo de carrusel siempre visible">
        <div className="touch-editor-floating-mode-switch" role="group" aria-label="Deslizar o editar">
          <button type="button" className={interactionMode==='navigate'?'active':''}
            aria-pressed={interactionMode==='navigate'} onClick={()=>switchMode('navigate')}>↔ Deslizar</button>
          <button type="button" className={interactionMode==='edit'?'active':''}
            aria-pressed={interactionMode==='edit'} onClick={()=>switchMode('edit')}>✋ Editar</button>
        </div>
        <span className="touch-editor-floating-slide">{activePage+1} / {pageCount}</span>
      </div>,document.body)}
    {pageCount===1&&chosen && onRemove && !inlineTextTools && <div className="touch-editor-actionbar touch-editor-actionbar-compact">
      <span>{chosen.name}</span>
      <button type="button" className="touch-editor-delete-primary" onClick={()=>deleteLayer(chosen.id)}>
        <Trash2 size={15}/> Borrar
      </button>
    </div>}
    {chosen && onUpdate && <div className="touch-editor-opacity-control" role="group" aria-label="Transparencia del elemento seleccionado">
      <label htmlFor="touch-layer-opacity">Transparencia</label>
      <input id="touch-layer-opacity" type="range" min="0" max="100" step="1" aria-label="Opacidad de foto, sticker o elemento: 100 por ciento es visible" value={opacityPercent} onChange={e=>changeOpacity(chosen.id,Number(e.currentTarget.value))} {...opacitySliderEvents} style={{flex:1,minWidth:60,accentColor:'#191919'}}/>
      <output>{opacityPercent}%</output>
    </div>}
    {chosen?.kind==='photo' && selectedRect && !cropping && pageCount===1 && !inlineTextTools &&
      <div className="touch-editor-size-toolbar" role="group" aria-label="Tamaño de la fotografía seleccionada">
        <span className="touch-editor-size-label">Tamaño de foto</span>
        <button type="button" onClick={()=>resizeSelected(.85)} aria-label="Reducir foto 15 por ciento">− Reducir</button>
        <button type="button" className="touch-editor-grow" onClick={()=>resizeSelected(1.2)}
          aria-label="Agrandar foto 20 por ciento">＋ Agrandar</button>
        <label className="touch-editor-size-range" htmlFor="touch-photo-size">
          <input id="touch-photo-size" aria-label="Tamaño de la foto" type="range"
            min="10" max="300" step="5" value={Math.max(10,Math.min(300,Math.round(selectedRect.w*100/5)*5))}
            onChange={e=>setSelectedSize(Number(e.target.value))}/>
          <output>{Math.round(selectedRect.w*100)}%</output>
        </label>
      </div>}
    <div ref={scrollArea} className="touch-editor-scroll" onScroll={syncPageFromScroll}
      style={{'--panorama-pages':pageCount} as React.CSSProperties}>
      <div ref={stage} className={'touch-editor-stage' + (dragOver ? ' drag-over' : '')}
        style={{aspectRatio: String(ratio), ...(pageCount > 1 ? continuous
          ? {minWidth: pageCount * 230}
          : {width: pageCount * normalPageWidth, minWidth: pageCount * normalPageWidth} : {})}}
        onClick={e => { if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('touch-editor-base')) {
          setSelected('');setEditingText('');setAdvancedOpen(false);onEmpty?.();
        } }}
        onPointerDown={e=>{if(gesture.current)addPinchPointer(e)}}
        onPointerMove={e=>{
          if(gesture.current&&pointers.current.has(e.pointerId)){
            const source=layers.find(item=>item.id===gesture.current?.id);if(source)move(e,source);
          }
        }}
        onPointerUp={e=>{
          if(gesture.current&&pointers.current.has(e.pointerId)){
            const source=layers.find(item=>item.id===gesture.current?.id);if(source)done(e,source);
          }
        }}
        onPointerCancel={e=>{
          if(gesture.current&&pointers.current.has(e.pointerId)){
            const source=layers.find(item=>item.id===gesture.current?.id);if(source)done(e,source);
          }
        }}
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
        {layers.map((layer, layerIndex) => {
          const rect = getRect(layer), active = selected === layer.id;
          // Every new element stays above earlier ones. Selection must NEVER
          // change stacking order: tapping a photo should not bury its siblings.
          // Background is always the bottom-most layer, independent of locking.
          // The single-post editor supplies one complete ordered stack, including
          // the original photo/title and legacy stickers. Honor its exact order.
          // Panoramas still reserve the below-page-content band for behind-text.
          const z = layer.role==='background'?1:pageCount===1?20+layerIndex:
            layer.placement==='behind-text'?2+(layerIndex/Math.max(1,layers.length)):20+layerIndex;
          const crop = normalizeCrop(rect.crop);
          const mode=layer.frameStyle||'panorama',fw=rect.w*1080*pageCount,fh=rect.h*canvasHeight;
          const metrics=photoFrameMetrics(fw,fh,mode);
          const radius=(r:number,w:number,h:number)=>`${100*r/Math.max(1,w)}% / ${100*r/Math.max(1,h)}%`;
          const outerRadius=layerCornerPixels(rect,fw,fh,100*metrics.radius/Math.max(1,Math.min(fw,fh)));
          const innerRadius=rect.cornerRadius===undefined?metrics.innerRadius:Math.max(0,outerRadius-metrics.inset*.38);
          const photoWindow:React.CSSProperties=layer.role==='background'?{left:0,right:0,top:0,bottom:0,borderRadius:'0'}:layer.kind==='photo'?{
            left:100*metrics.inset/fw+'%',right:100*metrics.inset/fw+'%',
            top:100*metrics.inset/fh+'%',bottom:100*metrics.bottom/fh+'%',
            borderRadius:radius(innerRadius,fw-2*metrics.inset,fh-metrics.inset-metrics.bottom),
          }:{
            borderRadius:radius(layerCornerPixels(rect,fw,fh),fw,fh),
          };
          return <div key={layer.id} data-layer={layer.id}
            className={'touch-editor-layer ' + layer.kind + (layer.role==='background'?' is-background':'') + (active ? ' active' : '') + (layer.locked?' is-locked':'') + (active && cropping ? ' cropping' : '')}
            style={{left: rect.x * 100 + '%', top: rect.y * 100 + '%', width: rect.w * 100 + '%',
              height: rect.h * 100 + '%', transform: 'rotate(' + (rect.angle || 0) + 'deg)',
               zIndex:z,
               pointerEvents:layer.locked||layer.role==='background'||pageCount>1&&interactionMode==='navigate'?'none':'auto'}}
            tabIndex={0} role="button" aria-label={(layer.locked?'Bloqueado: ':'Mover ')+layer.name} aria-pressed={active}
            onPointerDown={e => down(e, layer)} onPointerMove={e => move(e, layer)}
            onPointerUp={e => done(e, layer)} onPointerCancel={e => done(e, layer)}
            onDoubleClick={() => {
              if(layer.kind==='photo'){setSelected(layer.id);setCropping(true);}
              if(layer.kind==='text'&&onUpdate&&(inlineTextTools||pageCount>1)){setSelected(layer.id);setEditingText(layer.id);}
            }}
            onKeyDown={e => {
              if(layer.locked||!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
              e.preventDefault(); setSelected(layer.id);
              const r = getRect(layer), step = e.shiftKey ? .03 : .01;
              const rect = clamp({...r, x: r.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0) / pageCount,
                y: r.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0)},layer.kind);
              update(layer.id, rect); onCommit(layer.kind, layer.id, rect);
            }}>
            {layer.kind==='photo'&&layer.role!=='background'&&mode!=='none'&&mode!=='panorama'&&<div className="touch-editor-photo-frame"
              style={{borderRadius:radius(outerRadius,fw,fh),background:mode==='polaroid'?'#FFFCF7':layer.paper||'#FAF8F3',
                boxShadow:mode==='soft-shadow'||mode==='polaroid'?'0 3px 9px #15262d38':undefined}}/>}
            {(layer.kind==='photo'||layer.kind==='sticker')&&<div className="touch-editor-image-window" style={{...photoWindow,opacity:visibleOpacity(layer)}}>
              <img src={layer.src} alt="" draggable={false} style={layer.role==='background'?{objectFit:'fill',objectPosition:'center',transform:'none'}:layer.kind === 'photo' ? {
                objectPosition: crop.x * 100 + '% ' + crop.y * 100 + '%',
                transform: 'scale(' + crop.zoom + ')', transformOrigin: crop.x * 100 + '% ' + crop.y * 100 + '%',
              } : undefined}/>
            </div>}
            {layer.kind==='text'&&editingText===layer.id&&onUpdate&&(inlineTextTools||pageCount>1)&&active?
              <textarea ref={quickTextInput} className="touch-editor-oncanvas-text"
                aria-label="Editar texto directamente sobre el diseño"
                value={layer.text||''} spellCheck={true}
                onChange={e=>onUpdate?.(layer.id,{text:e.target.value})}
                onBlur={()=>setEditingText('')}
                onPointerDown={e=>e.stopPropagation()}
                onPointerMove={e=>e.stopPropagation()}
                onPointerUp={e=>e.stopPropagation()}
                onKeyDown={e=>e.stopPropagation()}
                style={{
                  fontFamily:panoramaFont(layer.font),fontWeight:panoramaTextWeight(layer.fontWeight),
                  opacity:visibleOpacity(layer),
                  fontSize:(layer.fontSize||76)*stageHeight/canvasHeight+'px',
                  letterSpacing:(layer.spacing||0)*stageHeight/canvasHeight+'px',
                  lineHeight:layer.lineHeight||1.12,color:layer.color||'#191919'
                }}/>
              :layer.kind==='text'&&(layer.curve||0)!==0?<CurvedTextPreview layer={{...layer,assetId:'',opacity:visibleOpacity(layer)}} width={fw} height={fh}/>
              :layer.kind==='text'&&<div className="touch-editor-free-text" style={{
              fontFamily:panoramaFont(layer.font),
              opacity:visibleOpacity(layer),
              fontWeight:panoramaTextWeight(layer.fontWeight),
              fontSize:(layer.fontSize||76)*(gesture.current?.id===layer.id
                ?rect.w/Math.max(.001,layer.rect.w):1)*stageHeight/canvasHeight+'px',
              lineHeight:layer.lineHeight||1.12,
              letterSpacing:(layer.spacing||0)*stageHeight/canvasHeight+'px',
              color:layer.color||'#191919',
              textShadow:layer.shadow?'0 2px 7px #19191966':undefined,
              WebkitTextStroke:layer.outline?'1px #FFFFFF':undefined,
            }}>{layer.text||''}</div>}
            {layer.kind==='shape'&&<div className={'touch-editor-collage-shape shape-'+(layer.shape||'paper')}
              style={{opacity:visibleOpacity(layer),background:layer.shape==='frame'?'transparent':layer.color||'#F1E5D2',
                borderColor:layer.color||'#F1E5D2',
                borderRadius:layer.shape==='circle'?'50%':radius(layerCornerPixels(rect,fw,fh),fw,fh)}}/>}
            {layer.kind==='photo'&&mode==='double-border'&&<div className="touch-editor-double-border"
              style={{borderColor:layer.accent||'#BED8E9',borderRadius:radius(outerRadius,fw,fh)}}/>}
            {active && !cropping && onRemove && !layer.locked && <button type="button"
              className="touch-editor-corner-delete" aria-label={'Borrar '+layer.name}
              title={'Borrar '+layer.name} onPointerDown={e=>e.stopPropagation()}
              onPointerUp={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();deleteLayer(layer.id)}}>×</button>}
            {active && !cropping && !layer.locked && <div className="touch-editor-mini-actions" role="toolbar" aria-label="Acciones rápidas de la capa"
               onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}>
               {layer.kind==='text'&&onDuplicateText&&<button type="button" aria-label="Duplicar texto" onClick={e=>{e.stopPropagation();onDuplicateText(layer.id)}}>⧉</button>}
               <button type="button" aria-label="Girar quince grados" onClick={e=>{e.stopPropagation();onCommit(layer.kind,layer.id,{...getRect(layer),angle:((getRect(layer).angle||0)+15)%360})}}>↻</button>

               <button type="button" aria-label="Terminar selección" onClick={e=>{e.stopPropagation();setSelected('');setContextInspector(null)}}>✓</button>
            </div>}
            {active && <><span className="touch-editor-outline"/>
              {!cropping&&!layer.locked && !inlineTextTools && <span className="touch-editor-resize" data-resize-handle aria-hidden="true"/>}
              {layer.role==='background'&&!layer.locked&&<span className="touch-editor-resize-wide" data-resize-handle aria-hidden="true" title="Estira el fondo hacia el siguiente slide"/>}</>}
          </div>;
        })}
        {inlineTextTools&&pageCount===1&&chosen&&!chosen.locked&&<div className="touch-canvas-actionbar" role="toolbar"
          aria-label="Opciones del elemento seleccionado"
          onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}>
          {chosen.kind==='text'&&<button type="button" onClick={()=>setEditingText(chosen.id)}>✎ Texto</button>}
          <button type="button" aria-label="Reducir elemento" onClick={()=>resizeSelected(.88)}>−</button>
          <button type="button" aria-label="Agrandar elemento" onClick={()=>resizeSelected(1.12)}>＋</button>
          {chosen.kind==='text'&&<button type="button" onClick={fitSelectedText}>Ajustar</button>}
          <button type="button" aria-label="Más opciones del elemento" aria-pressed={advancedOpen}
            onClick={()=>setAdvancedOpen(v=>!v)}>···</button>
          {onRemove&&<button type="button" aria-label="Borrar elemento" onClick={()=>deleteLayer(chosen.id)}><Trash2 size={16}/></button>}
        </div>}
    
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
        <label>Curvatura <input type="range" min="-100" max="100" step="1"
           aria-label="Curvar texto en arco circular" value={chosen.curve||0}
           onChange={e=>onUpdate(chosen.id,{curve:Number(e.target.value)})}/>
           <output>{chosen.curve||0}%</output></label>
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
