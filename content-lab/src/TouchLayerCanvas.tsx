import React,{useEffect,useRef,useState} from 'react';
import type {TouchRect} from './TouchGeometry';
import {clampRect} from './TouchGeometry';
import './TouchLayerCanvas.css';
type Layer={id:string;name:string;src:string;rect:TouchRect;kind:'photo'|'sticker'};
type Props={preview:string;layers:Layer[];onCommit:(kind:'photo'|'sticker',id:string,rect:TouchRect)=>void;ratio?:number;onEmpty?:()=>void};
type Gesture={kind:'photo'|'sticker';id:string;start:TouchRect;startX:number;startY:number;width:number;height:number;resize:boolean;pinchDistance?:number;pinchCenter?:[number,number]};
export default function TouchLayerCanvas({preview,layers,onCommit,ratio=1080/1350,onEmpty}:Props){
 const [draft,setDraft]=useState<Record<string,TouchRect>>({});
 const [selected,setSelected]=useState('');
 const stage=useRef<HTMLDivElement>(null);
 const pointers=useRef(new Map<number,{x:number;y:number}>());
 const gesture=useRef<Gesture|null>(null);
 const draftRef=useRef(draft);draftRef.current=draft;
 const layersRef=useRef(layers);layersRef.current=layers;
 useEffect(()=>{if(!gesture.current)setDraft({})},[layers]);
 const getRect=(layer:Layer)=>draftRef.current[layer.id]||layer.rect;
 const update=(id:string,next:TouchRect)=>{
  const rect=clampRect(next);draftRef.current={...draftRef.current,[id]:rect};setDraft(draftRef.current);
 };
 const down=(e:React.PointerEvent<HTMLDivElement>,layer:Layer)=>{
  e.preventDefault();e.stopPropagation();
  setSelected(layer.id);
  const stageRect=stage.current?.getBoundingClientRect();if(!stageRect)return;
  e.currentTarget.setPointerCapture(e.pointerId);
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const existing=gesture.current;
  if(existing&&existing.id===layer.id&&pointers.current.size>=2){
   const [a,b]=[...pointers.current.values()];
   const distance=Math.hypot(a.x-b.x,a.y-b.y);
   gesture.current={...existing,start:getRect(layer),pinchDistance:Math.max(distance,1),pinchCenter:[(a.x+b.x)/2,(a.y+b.y)/2],resize:false};
   return;
  }
  gesture.current={kind:layer.kind,id:layer.id,start:getRect(layer),startX:e.clientX,startY:e.clientY,width:stageRect.width,height:stageRect.height,resize:!!(e.target as HTMLElement).closest('[data-resize-handle]')};
 };
 const move=(e:React.PointerEvent<HTMLDivElement>,layer:Layer)=>{
  if(!gesture.current||gesture.current.id!==layer.id||!pointers.current.has(e.pointerId))return;
  e.preventDefault();
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=gesture.current;
  if(pointers.current.size>=2&&g.pinchDistance&&g.pinchCenter){
   const [a,b]=[...pointers.current.values()];
   const distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
   const scale=Math.max(.35,Math.min(3,distance/g.pinchDistance));
   const w=g.start.w*scale,h=g.start.h*scale;
   const centerX=(a.x+b.x)/2,centerY=(a.y+b.y)/2;
   update(g.id,{...g.start,w,h,x:g.start.x-(w-g.start.w)/2+(centerX-g.pinchCenter[0])/g.width,y:g.start.y-(h-g.start.h)/2+(centerY-g.pinchCenter[1])/g.height});
  }else{
   const dx=(e.clientX-g.startX)/g.width,dy=(e.clientY-g.startY)/g.height;
   if(g.resize){
    const amount=Math.max(dx,dy*ratio);const factor=Math.max(.4,Math.min(2.8,1+amount/Math.max(.08,g.start.w)));
    update(g.id,{...g.start,w:g.start.w*factor,h:g.start.h*factor});
   }else update(g.id,{...g.start,x:g.start.x+dx,y:g.start.y+dy});
  }
 };
 const done=(e:React.PointerEvent<HTMLDivElement>,layer:Layer)=>{
  if(!pointers.current.has(e.pointerId))return;
  e.preventDefault();e.stopPropagation();
  try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}
  pointers.current.delete(e.pointerId);
  if(pointers.current.size>0){
   // When one finger remains, anchor subsequent dragging to the current position.
   const remaining=[...pointers.current.values()][0],g=gesture.current;
   if(g){gesture.current={...g,start:getRect(layer),startX:remaining.x,startY:remaining.y,pinchDistance:undefined,pinchCenter:undefined,resize:false}}
   return;
  }
  const g=gesture.current;gesture.current=null;
  if(g&&g.id===layer.id){
   const rect=draftRef.current[layer.id];if(rect)onCommit(layer.kind,layer.id,rect);
  }
 };
 const chosen=layers.find(layer=>layer.id===selected);
 const selectedRect=chosen?getRect(chosen):undefined;
 return <div className="touch-editor" aria-label="Editor táctil de capas. Arrastra fotos y stickers con el dedo. Junta dos dedos para cambiar tamaño.">
   <div ref={stage} className="touch-editor-stage" style={{aspectRatio:String(ratio)}} onClick={e=>{if(e.target===e.currentTarget){setSelected('');onEmpty?.()}}}>
    {preview?<img className="touch-editor-base" src={preview} alt="Diseño con texto y fondo" draggable={false}/>:<div className="touch-editor-loading">Preparando editor…</div>}
    {layers.map(layer=>{
      const rect=getRect(layer),active=selected===layer.id;
      return <div key={layer.id} data-layer={layer.id} className={'touch-editor-layer '+layer.kind+(active?' active':'')} style={{left:(rect.x*100)+'%',top:(rect.y*100)+'%',width:(rect.w*100)+'%',height:(rect.h*100)+'%',transform:'rotate('+(rect.angle||0)+'deg)'}}
       tabIndex={0} role="button" aria-label={'Mover '+layer.name} aria-pressed={active}
       onPointerDown={e=>down(e,layer)} onPointerMove={e=>move(e,layer)} onPointerUp={e=>done(e,layer)} onPointerCancel={e=>done(e,layer)}
       onKeyDown={e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const r=getRect(layer),step=e.shiftKey?.03:.01;const rect=clampRect({...r,x:r.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),y:r.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)});update(layer.id,rect);onCommit(layer.kind,layer.id,rect)}}>
       <img src={layer.src} alt="" draggable={false}/>
       {active&&<><span className="touch-editor-outline"/><span className="touch-editor-resize" data-resize-handle aria-hidden="true"/></>}
      </div>
    })}
   </div>
   <p className="touch-editor-help">👆 Arrastra para mover · pellizca con dos dedos o usa la esquina para cambiar tamaño · toca una capa para seleccionarla.</p>
   {chosen&&selectedRect&&<div className="touch-editor-options">
     <strong>{chosen.kind==='photo'?'📷 Foto':'🎀 Sticker'} seleccionado</strong>
     <label>Girar <input aria-label="Girar la capa" type="range" min="-180" max="180" step="5" value={selectedRect.angle||0} onChange={e=>{const rect={...selectedRect,angle:Number(e.target.value)};update(chosen.id,rect);onCommit(chosen.kind,chosen.id,rect)}}/></label>
     <button type="button" onClick={()=>{const next={...selectedRect,angle:0};update(chosen.id,next);onCommit(chosen.kind,chosen.id,next)}}>Enderezar</button>
   </div>}
  </div>;
}
