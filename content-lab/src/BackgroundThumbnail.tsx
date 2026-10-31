import React,{useEffect,useRef} from 'react';
import {paintFreeBackground,type FreeBackgroundId} from './FreeDesignAssets';

/** Gallery thumbnails are the exact background painter, without fake headings or watermarks. */
export default function BackgroundThumbnail({id,alt='',className=''}:{id:FreeBackgroundId;alt?:string;className?:string}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  let disposed=false;
  const paint=()=>{
   if(disposed)return;
   const ctx=canvas.getContext('2d');if(!ctx)return;
   canvas.width=240;canvas.height=300;
   ctx.clearRect(0,0,240,300);
   paintFreeBackground(ctx,240,300,id);
  };
  if(typeof IntersectionObserver==='undefined'){paint();return}
  const io=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){paint();io.disconnect()}
  },{rootMargin:'280px'});
  io.observe(canvas);
  return()=>{disposed=true;io.disconnect()};
 },[id]);
 return <canvas ref={canvasRef} className={'background-rendered-thumbnail '+className}
   role="img" aria-label={alt||'Vista previa del fondo'} width={240} height={300}/>;
}