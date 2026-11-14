import React,{useEffect,useRef,useState} from 'react';
import {bound,normalizeVideoTransform,type CarouselVideoTransform} from './CarouselVideoTransform';

type VideoPage={
  page:number;name:string;src?:string;transform?:CarouselVideoTransform;
  trimStart?:number;trimEnd?:number;
};
type Props={
  video:VideoPage;pageCount:number;editable:boolean;
  onChange?:(page:number,transform:CarouselVideoTransform)=>void;
  onSelect?:(page:number)=>void;
};
/** A video is an editable layer, not an opaque fullscreen slide overlay.
 * Its geometry lives in the same normalized slide coordinates as the exporter.
 */
export default function CarouselVideoLayer({video,pageCount,editable,onChange,onSelect}:Props){
  const [draft,setDraft]=useState(()=>normalizeVideoTransform(video.transform));
  const current=useRef(draft);
  const dragging=useRef<{
    pointer:number;startX:number;startY:number;
    mode:'move'|'resize';base:CarouselVideoTransform;
    pageWidth:number;pageHeight:number;
  }|null>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<{distance:number;base:CarouselVideoTransform}|null>(null);
  const preview=useRef<HTMLVideoElement>(null);
  const commit=(value:CarouselVideoTransform)=>{
    const next=normalizeVideoTransform(value);
    current.current=next;setDraft(next);
    onChange?.(video.page,next);
  };
  useEffect(()=>{
    if(!dragging.current){
      const next=normalizeVideoTransform(video.transform);
      current.current=next;setDraft(next);
    }
  },[video.transform]);
  useEffect(()=>{
    const el=preview.current;
    if(!el||!video.src)return;
    const start=Math.max(0,video.trimStart||0);
    const adjust=()=>{
      if(el.currentTime<start-.1||(video.trimEnd&&el.currentTime>=video.trimEnd-.04)){
        el.currentTime=start;
        if(el.paused)void el.play().catch(()=>{});
      }
    };
    el.addEventListener('timeupdate',adjust);
    return()=>el.removeEventListener('timeupdate',adjust);
  },[video.src,video.trimStart,video.trimEnd]);
  const down=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!editable||!video.src)return;
    if(event.button!==0&&event.pointerType==='mouse')return;
    event.preventDefault();event.stopPropagation();
    onSelect?.(video.page);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.current.size===2){
      const [a,b]=[...pointers.current.values()];
      pinch.current={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),base:current.current};
      return;
    }
    const stage=event.currentTarget.closest('.touch-editor-stage')?.getBoundingClientRect();
    if(!stage)return;
    dragging.current={
      pointer:event.pointerId,startX:event.clientX,startY:event.clientY,
      mode:(event.target as HTMLElement).closest('[data-video-resize]')?'resize':'move',
      base:current.current,pageWidth:stage.width/pageCount,pageHeight:stage.height
    };
  };
  const move=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!pointers.current.has(event.pointerId))return;
    event.preventDefault();event.stopPropagation();
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch.current&&pointers.current.size===2){
      const [a,b]=[...pointers.current.values()];
      const scale=Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance;
      const base=pinch.current.base;
      const w=bound(base.w*scale,.12,2),h=bound(base.h*scale,.12,2);
      current.current=normalizeVideoTransform({...base,
        x:base.x+(base.w-w)/2,y:base.y+(base.h-h)/2,w,h});
      setDraft(current.current);
      return;
    }
    const gesture=dragging.current;if(!gesture)return;
    const dx=(event.clientX-gesture.startX)/Math.max(1,gesture.pageWidth);
    const dy=(event.clientY-gesture.startY)/Math.max(1,gesture.pageHeight);
    const result=gesture.mode==='resize'
      ?{...gesture.base,w:gesture.base.w+dx,h:gesture.base.h+dy}
      :{...gesture.base,x:gesture.base.x+dx,y:gesture.base.y+dy};
    current.current=normalizeVideoTransform(result);
    setDraft(current.current);
  };
  const up=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!pointers.current.has(event.pointerId))return;
    event.stopPropagation();
    try{event.currentTarget.releasePointerCapture(event.pointerId)}catch{}
    pointers.current.delete(event.pointerId);
    if(pointers.current.size===1){
      pinch.current=null;
      const remaining=[...pointers.current.values()][0];
      dragging.current=dragging.current?{...dragging.current,
        startX:remaining.x,startY:remaining.y,base:current.current}:null;
      return;
    }
    if(!pointers.current.size){
      pinch.current=null;dragging.current=null;
      commit(current.current);
    }
  };
  const d=draft,selected=editable&&!!video.src;
  return <div aria-label={'Video del slide '+(video.page+1)}
    style={{position:'absolute',left:(100*video.page/pageCount)+'%',top:0,
      width:(100/pageCount)+'%',height:'100%',overflow:'hidden',
      zIndex:16,pointerEvents:'none'}}>
    {video.src?<div
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{position:'absolute',left:(d.x*100)+'%',top:(d.y*100)+'%',
        width:(d.w*100)+'%',height:(d.h*100)+'%',
        transform:'rotate('+d.rotation+'deg)',transformOrigin:'center',
        border:selected?'2px solid #F2D85B':'1px solid transparent',
        boxSizing:'border-box',background:'#191919',overflow:'hidden',
        touchAction:selected?'none':'auto',pointerEvents:selected?'auto':'none',
        cursor:selected?'move':'default',boxShadow:selected?'0 0 0 1px #191919':'none'}}>
      <video ref={preview} src={video.src} muted loop autoPlay playsInline preload="metadata"
        aria-label={video.name} draggable={false}
        style={{width:'100%',height:'100%',objectFit:'contain',background:'#191919',
          transform:'translate('+(d.panX*100)+'%,'+(d.panY*100)+'%) scale('+d.zoom+')',
          transformOrigin:'center',pointerEvents:'none'}}/>
      {selected&&<div data-video-resize aria-label="Arrastra para cambiar el tamaño del video"
        style={{position:'absolute',right:0,bottom:0,width:27,height:27,
          border:'3px solid #191919',borderRadius:7,background:'#F2D85B',
          pointerEvents:'auto',touchAction:'none',cursor:'nwse-resize'}}/>}
      {selected&&<div style={{position:'absolute',top:5,left:5,
        padding:'3px 6px',borderRadius:5,fontSize:10,fontWeight:700,
        color:'#191919',background:'#F2D85B',pointerEvents:'none'}}>
        Arrastra · pellizca · gira abajo
      </div>}
    </div>:<div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',
      background:'#191919',color:'#fff',fontSize:12,padding:6,textAlign:'center'}}>
      ▶ {video.name} · Selecciona este slide para cargar el video
    </div>}
  </div>;
}
