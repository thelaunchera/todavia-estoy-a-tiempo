import React,{useEffect,useRef,useState} from 'react';
import {composeGridPoster,EXPORT_SIZES,LAYOUTS,type ExportSize,type VisualControls} from './GridComposer';
import type {EditorialDesign} from './EditorialPoster';
import TouchLayerCanvas from './TouchLayerCanvas';
import {stickerDefault,clampRect,type StickerPositions} from './TouchGeometry';

type Tile={headline:string;subtext:string;format?:string;layout?:VisualControls;design?:EditorialDesign;stickerIds?:string[];stickerPositions?:StickerPositions};
type Brand={name:string;color:string;background:string;headingFont?:string;bodyFont?:string;secondaryColor?:string};
type Props={
 tile:Tile;index:number;brand:Brand;photo?:string;original?:string;logo?:string;preserve:boolean;
 exportSize:ExportSize;onChange:(next:VisualControls)=>void;stickerImages?:Record<string,string>;onStickerChange?:(positions:StickerPositions)=>void;
 locale?:'es'|'en';
};
type Point={x:number;y:number};
type Gesture={from:VisualControls;layer:'photo'|'text';x:number;y:number;center:Point;distance:number;pinching:boolean;width:number;height:number};
const defaults={imageX:0,imageY:0,imageZoom:1,frameX:0,frameY:0,frameScale:1,textX:0,textY:0,textScale:1};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const center=(a:Point,b:Point):Point=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const label=(locale:'es'|'en',es:string,en:string)=>locale==='es'?es:en;

export default function GridVisualEditor({tile,index,brand,photo,original,logo,preserve,exportSize,onChange,stickerImages,onStickerChange,locale='es'}:Props){
 const [preview,setPreview]=useState(''),[fit,setFit]=useState(true);
 const [layer,setLayer]=useState<'photo'|'text'|'sticker'>('photo');
 const [advanced,setAdvanced]=useState(false);
 const pointers=useRef(new Map<number,Point>());
 const gesture=useRef<Gesture|null>(null);
 const latest=useRef<VisualControls>({});
 const raf=useRef(0);
 const queued=useRef<VisualControls|null>(null);
 const current={...defaults,...(tile.layout||{})};
 latest.current={...latest.current,...current};
 const clearGesture=()=>{
  pointers.current.clear();gesture.current=null;queued.current=null;
  cancelAnimationFrame(raf.current);raf.current=0;
 };
 useEffect(()=>()=>{clearGesture()},[]);
 useEffect(()=>{clearGesture()},[layer,tile.format,index,exportSize]);
 useEffect(()=>{
  let active=true;
  // Canvas exports are throttled separately from the finger gesture.
  const handle=setTimeout(()=>{
   composeGridPoster(tile,index,brand,{photo,original,logo,preserve,stickerImages,omitStickers:layer==='sticker'},exportSize)
    .then(({canvas,fit})=>{
      if(active){
        const thumbnail=document.createElement('canvas');thumbnail.width=720;
        thumbnail.height=Math.round(720*canvas.height/canvas.width);
        const ctx=thumbnail.getContext('2d');
        if(ctx){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
          ctx.drawImage(canvas,0,0,thumbnail.width,thumbnail.height);
          setPreview(thumbnail.toDataURL('image/png'));setFit(fit);}
        thumbnail.width=1;thumbnail.height=1;
      }
      canvas.width=1;canvas.height=1;
    }).catch(()=>{if(active)setPreview('')});
  },120);
  return()=>{active=false;clearTimeout(handle)};
 },[tile,index,brand.color,brand.background,brand.name,brand.headingFont,brand.bodyFont,brand.secondaryColor,photo,original,logo,preserve,exportSize,stickerImages,layer]);
 const commit=(next:VisualControls)=>{
  latest.current=next;onChange(next);
 };
 const schedule=(next:VisualControls)=>{
  latest.current=next;queued.current=next;
  if(raf.current)return;
  raf.current=requestAnimationFrame(()=>{
   raf.current=0;
   if(queued.current){const value=queued.current;queued.current=null;onChange(value);}
  });
 };
 const flush=()=>{
  if(raf.current){cancelAnimationFrame(raf.current);raf.current=0;}
  if(queued.current){const value=queued.current;queued.current=null;onChange(value);}
 };
 const pointerDown=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(!preview||layer==='sticker')return;
  e.preventDefault();
  e.currentTarget.setPointerCapture(e.pointerId);
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const bounds=e.currentTarget.getBoundingClientRect();
  const points=[...pointers.current.values()];
  if(points.length===1){
   gesture.current={from:{...latest.current},layer,x:e.clientX,y:e.clientY,center:{x:e.clientX,y:e.clientY},
      distance:0,pinching:false,width:bounds.width,height:bounds.height};
  }else if(points.length===2){
   // Start a new baseline at the exact moment the second finger lands.
   const c=center(points[0],points[1]);
   gesture.current={from:{...latest.current},layer,x:c.x,y:c.y,center:c,distance:Math.max(1,distance(points[0],points[1])),
      pinching:true,width:bounds.width,height:bounds.height};
  }
 };
 const pointerMove=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(!gesture.current||!pointers.current.has(e.pointerId))return;
  e.preventDefault();
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=gesture.current,points=[...pointers.current.values()];
  if(points.length>=2){
   if(!g.pinching)return;
   const c=center(points[0],points[1]),factor=distance(points[0],points[1])/Math.max(1,g.distance);
   const dx=(c.x-g.center.x)/Math.max(1,g.width),dy=(c.y-g.center.y)/Math.max(1,g.height);
   const next={...g.from};
   if(g.layer==='photo'){
    next.frameScale=clamp((g.from.frameScale||1)*factor,.45,1.7);
    next.frameX=clamp((g.from.frameX||0)+dx,-.75,.75);
    next.frameY=clamp((g.from.frameY||0)+dy,-.75,.75);
   }else{
    next.textScale=clamp((g.from.textScale||1)*factor,.55,1.7);
    next.textX=clamp((g.from.textX||0)+dx,-.35,.35);
    next.textY=clamp((g.from.textY||0)+dy,-.35,.35);
   }
   schedule(next);return;
  }
  if(g.pinching)return;
  const dx=(e.clientX-g.x)/Math.max(1,g.width),dy=(e.clientY-g.y)/Math.max(1,g.height);
  if(g.layer==='photo')schedule({...g.from,frameX:clamp((g.from.frameX||0)+dx,-.75,.75),
    frameY:clamp((g.from.frameY||0)+dy,-.75,.75)});
  else schedule({...g.from,textX:clamp((g.from.textX||0)+dx,-.35,.35),
    textY:clamp((g.from.textY||0)+dy,-.35,.35)});
 };
 const pointerEnd=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(!pointers.current.has(e.pointerId))return;
  if(e.type==='pointercancel')flush();
  else flush();
  pointers.current.delete(e.pointerId);
  try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}
  const remaining=[...pointers.current.values()];
  if(remaining.length===1){
   // Continue a smooth single-finger drag after a two-finger pinch ends.
   const p=remaining[0];
   gesture.current={from:{...latest.current},layer:gesture.current?.layer||'photo',
      x:p.x,y:p.y,center:p,distance:0,pinching:false,
      width:e.currentTarget.getBoundingClientRect().width,
      height:e.currentTarget.getBoundingClientRect().height};
  }else if(!remaining.length)gesture.current=null;
 };
 const set=(key:keyof typeof defaults,value:number)=>commit({...current,[key]:value});
 const increase=(value:number)=>{
  if(layer==='photo')set('frameScale',clamp(current.frameScale*value,.45,1.7));
  if(layer==='text')set('textScale',clamp(current.textScale*value,.55,1.7));
 };
 const number=(id:keyof typeof defaults,text:string,min:number,max:number,step:number)=>(
  <label className="v2-slider" key={id}>{text}<span>{Math.round((current[id]||0)*100)}%</span>
   <input type="range" min={min} max={max} step={step} value={current[id]} onChange={e=>set(id,Number(e.target.value))}/>
  </label>
 );
 const format=LAYOUTS.find(x=>x.name===tile.format)||LAYOUTS[index%LAYOUTS.length];
 const region=layer==='photo'?format.image:format.type;
 const scale=layer==='photo'?current.frameScale:current.textScale;
 const guide=layer==='photo'&&!tile.design?{
    left:clamp(region[0]+(region[2]-region[2]*scale)/2+current.frameX,0,.97)*100+'%',
    top:clamp(region[1]+(region[3]-region[3]*scale)/2+current.frameY,0,.97)*100+'%',
    width:clamp(region[2]*scale,.03,1)*100+'%',height:clamp(region[3]*scale,.03,1)*100+'%'
  }:layer==='text'&&!tile.design?{
    left:clamp(region[0]+current.textX,0,.97)*100+'%',top:clamp(region[1]+current.textY,0,.97)*100+'%',
    width:region[2]*100+'%',height:region[3]*100+'%'
  }:null;
 return <div className="v2-editor" aria-label={label(locale,'Editor táctil de fotos y textos','Photo and text touch editor')}>
  <div className="v2-editor-top">
   <div><strong>{label(locale,'Editor táctil · tu diseño','Touch editor · your design')}</strong>
    <small>{EXPORT_SIZES[exportSize].title} · {EXPORT_SIZES[exportSize].w} × {EXPORT_SIZES[exportSize].h}</small></div>
   <button className="btn ghost" type="button" onClick={()=>commit({...defaults})}>{label(locale,'Restablecer','Reset')}</button>
  </div>
  <div className="v2-layer-pick" role="group" aria-label={label(locale,'Elegir elemento para mover','Choose element to move')}>
   <button aria-pressed={layer==='photo'} className={layer==='photo'?'active':''} onClick={()=>setLayer('photo')} type="button">{label(locale,'📷 Foto','📷 Photo')}</button>
   <button aria-pressed={layer==='text'} className={layer==='text'?'active':''} onClick={()=>setLayer('text')} type="button">{label(locale,'T Texto','T Text')}</button>
   <button aria-pressed={layer==='sticker'} className={layer==='sticker'?'active':''} onClick={()=>setLayer('sticker')} type="button">{label(locale,'✦ Stickers','✦ Stickers')}</button>
  </div>
  {layer==='sticker'?<TouchLayerCanvas preview={preview}
    ratio={EXPORT_SIZES[exportSize].w/EXPORT_SIZES[exportSize].h}
    layers={(tile.design?.stickerIds||tile.stickerIds||[]).filter(id=>stickerImages?.[id]).map((id,i)=>({
      id,kind:'sticker' as const,name:'Sticker',src:stickerImages![id],
      rect:clampRect(tile.stickerPositions?.[id]||stickerDefault(i))}))}
    onCommit={(_kind,id,rect)=>onStickerChange?.({...tile.stickerPositions,[id]:clampRect(rect)})}/>:
   <>
    <p className="v2-touch-hint">{label(locale,
     '☝️ Arrastra con un dedo para mover. Pellizca con dos dedos para agrandar o reducir.',
     '☝️ Drag with one finger. Pinch with two fingers to resize.')}</p>
    <div className="v2-preview-wrap" onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
      style={{aspectRatio:EXPORT_SIZES[exportSize].w+'/'+EXPORT_SIZES[exportSize].h}}
      aria-label={label(locale,'Lienzo táctil del diseño','Touch design canvas')}>
     {preview?<img src={preview} alt={label(locale,'Vista previa del PNG','PNG preview')} draggable={false}/>:
       <div className="v2-preview-placeholder">{label(locale,'Preparando diseño…','Preparing design…')}</div>}
     {guide&&preview&&<div className="v2-touch-outline" style={guide} aria-hidden="true"/>}
    </div>
    <div className="v2-touch-actions" role="group" aria-label={label(locale,'Tamaño del elemento','Element size')}>
     <span>{layer==='photo'?label(locale,'Tamaño de foto','Photo size'):label(locale,'Tamaño del texto','Text size')}</span>
     <button type="button" onClick={()=>increase(.88)} aria-label={label(locale,'Reducir','Make smaller')}>−</button>
     <button type="button" onClick={()=>increase(1.14)} aria-label={label(locale,'Agrandar','Make bigger')}>＋</button>
    </div>
   </>}
  <div className="v2-simple-controls">
   <strong>{label(locale,'Ajustes del diseño','Design controls')}</strong>
   <button type="button" className="v2-toggle-advanced" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)}>
    {advanced?label(locale,'Ocultar ajustes','Hide controls'):label(locale,'Más ajustes','More controls')}
   </button>
  </div>
  {advanced&&<div className="v2-slider-grid">
   {number('frameScale',label(locale,'Tamaño de la foto','Photo size'),.45,1.7,.05)}
   {number('imageZoom',label(locale,'Zoom dentro de la foto','Crop zoom'),1,3,.05)}
   {number('textScale',label(locale,'Tamaño del titular','Headline size'),.55,1.7,.05)}
   {number('frameX',label(locale,'Foto horizontal','Photo horizontal'),-.75,.75,.01)}
   {number('frameY',label(locale,'Foto vertical','Photo vertical'),-.75,.75,.01)}
   {number('imageX',label(locale,'Recorte horizontal','Crop horizontal'),-.55,.55,.01)}
   {number('imageY',label(locale,'Recorte vertical','Crop vertical'),-.55,.55,.01)}
   {number('textX',label(locale,'Texto horizontal','Text horizontal'),-.35,.35,.01)}
   {number('textY',label(locale,'Texto vertical','Text vertical'),-.35,.35,.01)}
  </div>}
  {!fit&&<p role="alert" className="bg-connection-error">{label(locale,
   'El título no cabe en esta composición. Redúcelo o acorta el texto antes de descargar.',
   'The headline does not fit. Make it smaller or shorten it before downloading.')}</p>}
 </div>;
}
