import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {originalBlobFromSource} from './photo-background';

type Point={x:number;y:number};
type Tool='erase'|'restore'|'pan';
type Stroke={tool:Exclude<Tool,'pan'>;width:number;points:Point[]};
type Props={src:string;onCancel:()=>void;onApply:(transparentPng:string)=>Promise<void>};

const toDataUrl=(blob:Blob)=>new Promise<string>((resolve,reject)=>{
 const reader=new FileReader();
 reader.onload=()=>resolve(String(reader.result));
 reader.onerror=()=>reject(Error('No se pudo guardar el recorte.'));
 reader.readAsDataURL(blob);
});

/** A small, offline, touch-first eraser; no model or external processing. */
export default function ManualBackgroundEraser({src,onCancel,onApply}:Props){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const bitmapRef=useRef<ImageBitmap|null>(null);
 const maskRef=useRef<HTMLCanvasElement|null>(null);
 const strokesRef=useRef<Stroke[]>([]);
 const undoneRef=useRef<Stroke[]>([]);
 const pointerRef=useRef<number|null>(null);
 const paintRef=useRef<number|null>(null);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState('');
 const [version,setVersion]=useState(0);
 const [tool,setTool]=useState<Tool>('erase');
 const [brush,setBrush]=useState(45);
 const [zoom,setZoom]=useState(100);
 const [saving,setSaving]=useState(false);

 const paint=()=>{
  const canvas=canvasRef.current,bitmap=bitmapRef.current,mask=maskRef.current;
  if(!canvas||!bitmap||!mask)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  ctx.globalCompositeOperation='source-over';
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  ctx.globalCompositeOperation='destination-in';
  ctx.drawImage(mask,0,0);
  ctx.globalCompositeOperation='source-over';
 };
 const schedulePaint=()=>{
  if(paintRef.current!==null)return;
  paintRef.current=requestAnimationFrame(()=>{paintRef.current=null;paint()});
 };
 const drawStroke=(ctx:CanvasRenderingContext2D,stroke:Stroke,from:number)=>{
  const points=stroke.points;
  if(!points.length)return;
  ctx.save();
  ctx.globalCompositeOperation=stroke.tool==='erase'?'destination-out':'source-over';
  ctx.strokeStyle='#fff';ctx.fillStyle='#fff';
  ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=stroke.width;
  if(points.length===1){ctx.beginPath();ctx.arc(points[0].x,points[0].y,stroke.width/2,0,Math.PI*2);ctx.fill();}
  else {ctx.beginPath();ctx.moveTo(points[Math.max(0,from-1)].x,points[Math.max(0,from-1)].y);
   for(let i=Math.max(1,from);i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
   ctx.stroke();}
  ctx.restore();
 };
 const replay=()=>{
  const mask=maskRef.current;if(!mask)return;
  const ctx=mask.getContext('2d');if(!ctx)return;
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#fff';ctx.fillRect(0,0,mask.width,mask.height);
  strokesRef.current.forEach(stroke=>drawStroke(ctx,stroke,0));
  schedulePaint();setVersion(v=>v+1);
 };
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const blob=await originalBlobFromSource(src);
    const bitmap=await createImageBitmap(blob);
    if(!active){bitmap.close();return}
    const canvas=canvasRef.current;
    if(!canvas){bitmap.close();return}
    // Keep the editor below ~2.4MP on iPad; canvas export stays PNG.
    const ratio=Math.min(1,2048/Math.max(bitmap.width,bitmap.height),
      Math.sqrt(2_400_000/(bitmap.width*bitmap.height)));
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
    const mask=document.createElement('canvas');
    mask.width=canvas.width;mask.height=canvas.height;
    maskRef.current=mask;bitmapRef.current=bitmap;
    const ctx=mask.getContext('2d');
    if(!ctx)throw Error('No se pudo preparar el editor táctil.');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,mask.width,mask.height);
    paint();setReady(true);
   }catch(e){if(active)setError(e instanceof Error?e.message:'No se pudo abrir la imagen.');}
  })();
  return()=>{active=false;bitmapRef.current?.close();bitmapRef.current=null;
   if(paintRef.current!==null)cancelAnimationFrame(paintRef.current);
   const mask=maskRef.current;if(mask){mask.width=1;mask.height=1;}
   maskRef.current=null;};
 },[src]);
 const point=(event:React.PointerEvent<HTMLCanvasElement>):Point=>{
  const canvas=canvasRef.current!;
  const rect=canvas.getBoundingClientRect();
  return {x:Math.min(canvas.width,Math.max(0,(event.clientX-rect.left)*canvas.width/rect.width)),
    y:Math.min(canvas.height,Math.max(0,(event.clientY-rect.top)*canvas.height/rect.height))};
 };
 const down=(event:React.PointerEvent<HTMLCanvasElement>)=>{
  if(!ready||saving||tool==='pan'||pointerRef.current!==null)return;
  event.preventDefault();
  pointerRef.current=event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
  const stroke:Stroke={tool,width:brush,points:[point(event)]};
  strokesRef.current.push(stroke);undoneRef.current=[];
  const ctx=maskRef.current?.getContext('2d');if(ctx)drawStroke(ctx,stroke,0);
  schedulePaint();setVersion(v=>v+1);
 };
 const move=(event:React.PointerEvent<HTMLCanvasElement>)=>{
  if(pointerRef.current!==event.pointerId||!ready||saving)return;
  event.preventDefault();
  const stroke=strokesRef.current[strokesRef.current.length-1];
  if(!stroke)return;
  const p=point(event),previous=stroke.points[stroke.points.length-1];
  if(Math.hypot(p.x-previous.x,p.y-previous.y)<1.4)return;
  const previousCount=stroke.points.length;stroke.points.push(p);
  const ctx=maskRef.current?.getContext('2d');if(ctx)drawStroke(ctx,stroke,previousCount);
  schedulePaint();
 };
 const up=(event:React.PointerEvent<HTMLCanvasElement>)=>{
  if(pointerRef.current!==event.pointerId)return;
  pointerRef.current=null;
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  setVersion(v=>v+1);
 };
 const undo=()=>{if(!strokesRef.current.length)return;
  undoneRef.current.push(strokesRef.current.pop()!);replay();};
 const redo=()=>{if(!undoneRef.current.length)return;
  strokesRef.current.push(undoneRef.current.pop()!);replay();};
 const reset=()=>{strokesRef.current=[];undoneRef.current=[];replay();};
 const apply=async()=>{
  const canvas=canvasRef.current;if(!canvas||!strokesRef.current.length||saving)return;
  setSaving(true);setError('');
  try{
   if(paintRef.current!==null){cancelAnimationFrame(paintRef.current);paintRef.current=null}
   paint();
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
    value=>value?resolve(value):reject(Error('No se pudo exportar el recorte.')),'image/png'));
   await onApply(await toDataUrl(blob));
  }catch(e){setError(e instanceof Error?e.message:'No se pudo aplicar el recorte.');setSaving(false);}
 };
 const button:React.CSSProperties={border:'1px solid #D8D8D6',borderRadius:12,padding:'10px 12px',minHeight:43,background:'#fff',color:'#191919',fontWeight:650};
 const chosen=(name:Tool)=>({...button,background:tool===name?'#F2D85B':'#fff',borderColor:tool===name?'#191919':'#D8D8D6'});
 return createPortal(<div role="dialog" aria-modal="true" aria-label="Recorte manual de foto"
  style={{position:'fixed',inset:0,zIndex:20000,background:'rgba(12,18,23,.70)',display:'grid',placeItems:'center',padding:'max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom))'}}>
  <div style={{width:'min(820px,100%)',maxHeight:'96dvh',overflowY:'auto',background:'#FAF8F3',color:'#191919',borderRadius:22,padding:'clamp(12px,3vw,22px)',display:'grid',gap:10,boxShadow:'0 25px 60px #10182055'}}>
   <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
    <div><h2 style={{fontSize:19,margin:'0 0 4px',fontWeight:780}}>Recortar fondo a mano</h2>
     <p style={{fontSize:13,margin:0,color:'#55616A'}}>Usa el dedo o el lápiz para borrar el fondo. Sin IA y sin salir del Studio.</p></div>
    <button type="button" aria-label="Cerrar recorte" style={button} disabled={saving} onClick={onCancel}>×</button>
   </div>
   <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:7}} role="toolbar" aria-label="Herramientas de recorte">
    <button type="button" style={chosen('erase')} aria-pressed={tool==='erase'} onClick={()=>setTool('erase')}>Borrar</button>
    <button type="button" style={chosen('restore')} aria-pressed={tool==='restore'} onClick={()=>setTool('restore')}>Recuperar</button>
    <button type="button" style={chosen('pan')} aria-pressed={tool==='pan'} onClick={()=>setTool('pan')}>Mover vista</button>
    <button type="button" disabled={!strokesRef.current.length||saving} style={button} onClick={undo}>↶ Deshacer</button>
    <button type="button" disabled={!undoneRef.current.length||saving} style={button} onClick={redo}>↷ Rehacer</button>
    <button type="button" disabled={!strokesRef.current.length||saving} style={button} onClick={reset}>Reiniciar</button>
   </div>
   <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',fontSize:13}}>
    <label style={{display:'flex',alignItems:'center',gap:8}}>Pincel <input type="range" min="6" max="170" value={brush} onChange={e=>setBrush(Number(e.target.value))} aria-label="Tamaño del pincel"/><span>{brush}px</span></label>
    <label style={{display:'flex',alignItems:'center',gap:8}}>Zoom <input type="range" min="100" max="250" step="25" value={zoom} onChange={e=>setZoom(Number(e.target.value))} aria-label="Zoom de recorte"/><span>{zoom}%</span></label>
   </div>
   <div style={{maxHeight:'49dvh',overflow:'auto',borderRadius:14,border:'1px solid #C8CDCE',backgroundColor:'#f0f0f0',backgroundImage:'linear-gradient(45deg,#d3d3d3 25%,transparent 25%),linear-gradient(-45deg,#d3d3d3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d3d3d3 75%),linear-gradient(-45deg,transparent 75%,#d3d3d3 75%)',backgroundSize:'22px 22px',backgroundPosition:'0 0,0 11px,11px -11px,-11px 0px'}}>
    <canvas ref={canvasRef} aria-label="Imagen editable: desliza para borrar o recuperar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
     style={{display:'block',width:zoom+'%',minWidth:'100%',height:'auto',touchAction:tool==='pan'?'pan-x pan-y':'none',cursor:tool==='pan'?'grab':'crosshair',margin:'auto'}}/>
    {!ready&&!error&&<p style={{padding:12}}>Preparando fotografía…</p>}
   </div>
   {error&&<p role="alert" style={{color:'#9B3835',fontSize:13}}>{error}</p>}
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:9,flexWrap:'wrap'}}>
    <p style={{fontSize:12,color:'#56636B',margin:0}}>El tablero gris muestra la transparencia. La foto original se conserva.</p>
    <div style={{display:'flex',gap:8}}>
     <button type="button" disabled={saving} style={button} onClick={onCancel}>Cancelar</button>
     <button type="button" disabled={!ready||saving||version===0||!strokesRef.current.length} style={{...button,background:'#F2D85B',borderColor:'#191919'}} onClick={()=>void apply()}>{saving?'Guardando…':'Aplicar recorte'}</button>
    </div>
   </div>
  </div>
 </div>,document.body);
}
