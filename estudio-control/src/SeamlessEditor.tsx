import {useEffect,useRef,useState} from 'react';
type Item={id:number;kind:'text'|'image';text?:string;src?:string;x:number;y:number;width:number;fontSize:number;color:string};
const W=1080,H=1350,KEY='studio-seamless-v1';
const defaults={count:5,background:'#FAF8F3',items:[] as Item[]};
export default function SeamlessEditor(){
 const [doc,setDoc]=useState<typeof defaults>(()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaults}});
 const [selected,setSelected]=useState<number|null>(null);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const canvas=useRef<HTMLCanvasElement>(null);
 const drag=useRef<{id:number;x:number;y:number;ox:number;oy:number}|null>(null);
 const images=useRef(new Map<string,HTMLImageElement>());
 const width=doc.count*W;
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(doc))}catch{setMessage('El navegador no tiene espacio para guardar. Exporta tus imágenes.')}},[doc]);
 const loadImage=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const existing=images.current.get(src);if(existing?.complete){resolve(existing);return}const im=new Image();im.onload=()=>{images.current.set(src,im);resolve(im)};im.onerror=reject;im.src=src});
 const paint=async(ctx:CanvasRenderingContext2D,scale=1,clipStart=0,clipWidth=width)=>{
  ctx.save();ctx.scale(scale,scale);ctx.fillStyle=doc.background;ctx.fillRect(0,0,clipWidth,H);
  for(const it of doc.items){const x=it.x-clipStart;if(it.kind==='text'){ctx.fillStyle=it.color;ctx.font='bold '+it.fontSize+'px Arial, sans-serif';ctx.textBaseline='top';ctx.fillText(it.text||'',x,it.y)}else if(it.src){try{const im=await loadImage(it.src);ctx.drawImage(im,x,it.y,it.width,it.width*im.height/im.width)}catch{}}}
  ctx.restore();
 };
 useEffect(()=>{let active=true;const render=async()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;c.width=width;c.height=H;await paint(ctx);if(!active)return;ctx.strokeStyle='rgba(25,25,25,.25)';ctx.setLineDash([12,12]);for(let i=1;i<doc.count;i++){ctx.beginPath();ctx.moveTo(i*W,0);ctx.lineTo(i*W,H);ctx.stroke()}ctx.setLineDash([])};void render();return()=>{active=false}},[doc]);
 const update=(id:number,patch:Partial<Item>)=>setDoc(d=>({...d,items:d.items.map(it=>it.id===id?{...it,...patch}:it)}));
 const addText=()=>{const id=Date.now();setDoc(d=>({...d,items:[...d.items,{id,kind:'text',text:'Tu mensaje aquí',x:100,y:350,width:600,fontSize:90,color:'#191919'}]}));setSelected(id)};
 const onFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8_000_000){setMessage('Usa una foto de menos de 8 MB.');return}const reader=new FileReader();reader.onload=()=>{const id=Date.now();setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src:String(reader.result),x:100,y:160,width:650,fontSize:80,color:'#191919'}]}));setSelected(id)};reader.readAsDataURL(file);e.target.value=''};
 const locate=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*H/r.height}};
 const hit=(x:number,y:number)=>[...doc.items].reverse().find(it=>{const h=it.kind==='text'?it.fontSize*1.4:it.width;const w=it.kind==='text'?(it.text?.length||5)*it.fontSize*.65:it.width;return x>=it.x&&x<=it.x+w&&y>=it.y&&y<=it.y+h});
 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{const p=locate(e),it=hit(p.x,p.y);setSelected(it?.id||null);if(it){drag.current={id:it.id,x:p.x,y:p.y,ox:it.x,oy:it.y};e.currentTarget.setPointerCapture(e.pointerId)}};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drag.current)return;const p=locate(e),d=drag.current;update(d.id,{x:Math.round(d.ox+p.x-d.x),y:Math.round(d.oy+p.y-d.y)})};
 const exportSlides=async()=>{setBusy(true);setMessage('Preparando PNG…');try{for(let i=0;i<doc.count;i++){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas');await paint(ctx,1,i*W,W);const a=document.createElement('a');a.download='seamless-slide-'+String(i+1).padStart(2,'0')+'.png';a.href=c.toDataURL('image/png');a.click();await new Promise(r=>setTimeout(r,280))}setMessage('Se generaron '+doc.count+' imágenes PNG. Revisa las descargas del navegador.')}catch{setMessage('No se pudo exportar. Inténtalo de nuevo.')}finally{setBusy(false)}};
 const current=doc.items.find(it=>it.id===selected);
 const control:React.CSSProperties={padding:'11px 12px',border:'1px solid #ddd',borderRadius:12,background:'white',color:'#191919',fontSize:15};
 return <section style={{maxWidth:1100,margin:'auto',color:'#191919'}}>
  <h2>Carrusel seamless</h2><p>Diseña sobre un lienzo continuo. Las líneas marcan el corte exacto de Instagram. Tus cambios se guardan en este dispositivo.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16,alignItems:'center'}}>
   <label>Slides <select aria-label="Cantidad de slides" style={control} value={doc.count} onChange={e=>setDoc(d=>({...d,count:Number(e.target.value)}))}>{[2,3,4,5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}</select></label>
   <label>Fondo <input aria-label="Color de fondo" type="color" value={doc.background} onChange={e=>setDoc(d=>({...d,background:e.target.value}))}/></label>
   <button style={control} onClick={addText}>+ Texto</button>
   <label style={{...control,cursor:'pointer'}}>+ Foto<input aria-label="Subir foto" type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/></label>
   <button style={{...control,background:'#F2D85B',fontWeight:700}} disabled={busy} onClick={()=>void exportSlides()}>Exportar PNG individuales</button>
  </div>
  {current&&<div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:10,marginBottom:16}}>
    {current.kind==='text'&&<><input aria-label="Editar texto" style={{...control,minWidth:180}} value={current.text||''} onChange={e=>update(current.id,{text:e.target.value})}/><label>Tamaño <input aria-label="Tamaño de letra" type="range" min="28" max="220" value={current.fontSize} onChange={e=>update(current.id,{fontSize:Number(e.target.value)})}/></label><input aria-label="Color del texto" type="color" value={current.color} onChange={e=>update(current.id,{color:e.target.value})}/></>}
    {current.kind==='image'&&<label>Ancho <input aria-label="Ancho de foto" type="range" min="100" max="1800" value={current.width} onChange={e=>update(current.id,{width:Number(e.target.value)})}/></label>}
    <button style={control} onClick={()=>{setDoc(d=>({...d,items:d.items.filter(it=>it.id!==current.id)}));setSelected(null)}}>Eliminar elemento</button>
   </div>}
  <div style={{overflowX:'auto',borderRadius:16,border:'1px solid #ddd',background:'#eaeaea',padding:8}}>
   <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null} style={{display:'block',width:'max(100%, 900px)',height:'auto',touchAction:'pan-x',cursor:'grab'}} aria-label="Lienzo continuo del carrusel; toca un elemento para moverlo"/>
  </div>
  <p role="status" aria-live="polite">{message}</p><p style={{fontSize:13,opacity:.7}}>Cada slide se exporta a 1080 × 1350 PNG. El proyecto se guarda localmente en este navegador; no se sincroniza aún con otros dispositivos.</p>
 </section>;
}
