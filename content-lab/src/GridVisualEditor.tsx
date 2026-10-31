import React,{useEffect,useRef,useState} from 'react';
import {composeGridPoster,EXPORT_SIZES,type ExportSize,type VisualControls} from './GridComposer';
import type {EditorialDesign} from './EditorialPoster';
type Tile={headline:string;subtext:string;format?:string;layout?:VisualControls;design?:EditorialDesign};
type Brand={name:string;color:string;background:string;headingFont?:string;bodyFont?:string;secondaryColor?:string};
type Props={
 tile:Tile;index:number;brand:Brand;photo?:string;original?:string;logo?:string;preserve:boolean;
 exportSize:ExportSize;onChange:(next:VisualControls)=>void;
};
const defaults={imageX:0,imageY:0,imageZoom:1,frameX:0,frameY:0,frameScale:1,textX:0,textY:0,textScale:1};
export default function GridVisualEditor({tile,index,brand,photo,original,logo,preserve,exportSize,onChange}:Props){
 const [preview,setPreview]=useState(''),[fit,setFit]=useState(true);
 const [layer,setLayer]=useState<'photo'|'text'>('photo');
 const drag=useRef<{x:number;y:number;from:VisualControls;size:{width:number;height:number}}|null>(null);
 const current={...defaults,...(tile.layout||{})};
 useEffect(()=>{
  let active=true;
  composeGridPoster(tile,index,brand,{photo,original,logo,preserve},exportSize)
   .then(({canvas,fit})=>{if(active){setPreview(canvas.toDataURL('image/jpeg',.8));setFit(fit)}})
   .catch(()=>{if(active)setPreview('')});
  return()=>{active=false};
 },[tile,index,brand.color,brand.background,brand.name,brand.headingFont,brand.bodyFont,brand.secondaryColor,photo,original,logo,preserve,exportSize]);
 const set=(key:keyof typeof defaults,value:number)=>onChange({...current,[key]:value});
 const start=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(!preview)return;
  drag.current={x:e.clientX,y:e.clientY,from:{...current},size:{width:e.currentTarget.clientWidth,height:e.currentTarget.clientHeight}};
  e.currentTarget.setPointerCapture(e.pointerId);
 };
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(!drag.current)return;
  const {x,y,from,size}=drag.current;
  const dx=(e.clientX-x)/Math.max(1,size.width);
  const dy=(e.clientY-y)/Math.max(1,size.height);
  // Dragging Photo moves its visible frame, rather than secretly cropping pixels.
  if(layer==='photo')onChange({...from,frameX:Math.max(-.75,Math.min(.75,(from.frameX||0)+dx)),frameY:Math.max(-.75,Math.min(.75,(from.frameY||0)+dy))});
  else onChange({...from,textX:Math.max(-.35,Math.min(.35,(from.textX||0)+dx)),textY:Math.max(-.35,Math.min(.35,(from.textY||0)+dy))});
 };
 const number=(id:keyof typeof defaults,label:string,min:number,max:number,step:number)=>(
  <label className="v2-slider" key={id}>{label}<span>{Math.round((current[id]||0)*100)}%</span>
   <input type="range" min={min} max={max} step={step} value={current[id]} onChange={e=>set(id,Number(e.target.value))}/>
  </label>
 );
 return <div className="v2-editor" aria-label="Editor de capas">
  <div className="v2-editor-top"><div><strong>Editor visual · vista real</strong><small>{EXPORT_SIZES[exportSize].title} · {EXPORT_SIZES[exportSize].w} × {EXPORT_SIZES[exportSize].h}</small></div><button className="btn ghost" type="button" onClick={()=>onChange({...defaults})}>Restablecer</button></div>
  {tile.design&&<p className="v2-hint">Diseño editorial completo: fotografía, ambiente, tipografía y anotaciones se combinan en el PNG. La foto original se mantiene intacta.</p>}
  <div className="v2-layer-pick" role="group" aria-label="Mover capa">
   <button className={layer==='photo'?'active':''} onClick={()=>setLayer('photo')} type="button">Mover foto</button>
   <button className={layer==='text'?'active':''} onClick={()=>setLayer('text')} type="button">Mover titular</button>
  </div>
  <div className="v2-preview-wrap" onPointerDown={start} onPointerMove={move} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} style={{aspectRatio:EXPORT_SIZES[exportSize].w+'/'+EXPORT_SIZES[exportSize].h}}>
   {preview?<img src={preview} alt="Vista previa exacta de la publicación"/>:<div className="v2-preview-placeholder">Selecciona una imagen generada para ver el diseño completo.</div>}
  </div>
  <p className="v2-hint">Arrastra la foto para mover su recuadro o toca «Mover titular» para colocarlo. Los controles permiten agrandar el recuadro y encuadrar la imagen por separado.</p>
  <div className="v2-slider-grid">
   {number('frameX','Recuadro izquierda / derecha',-.75,.75,.01)}
   {number('frameY','Recuadro arriba / abajo',-.75,.75,.01)}
   {number('frameScale','Tamaño del recuadro',.45,1.7,.05)}
   {number('imageZoom','Zoom dentro del recuadro',1,3,.05)}
   {number('imageX','Recorte horizontal',-.55,.55,.01)}
   {number('imageY','Recorte vertical',-.55,.55,.01)}
   {number('textX','Texto horizontal',-.35,.35,.01)}
   {number('textY','Texto vertical',-.35,.35,.01)}
   {number('textScale','Tamaño del titular',.55,1.7,.05)}
  </div>
  {!fit&&<p role="alert" className="bg-connection-error">Este titular es demasiado largo para la composición. Reduce el tamaño o acorta el texto antes de exportar.</p>}
 </div>;
}
