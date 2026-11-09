import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {zipSync} from 'fflate';
import {ArrowLeft,ArrowRight,Check,Download,Film,Maximize2,Minimize2,X} from 'lucide-react';
import {classScreenCards,screenCardsForLesson,type ScreenCard} from './class-screen-cards';
import './class-screen-deck.css';

type Lang='es'|'en';
type Props={visible:boolean;lessonId:string;openingId?:string|null;onOpeningHandled:()=>void};
const WIDTH=1600,HEIGHT=900;
const PAPER='#FAF8F3',INK='#191919',YELLOW='#F2D85B',BLUE='#C5DDEB',MUTED='#526575';
function xml(v:string|number){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function text(x:number,y:number,value:string,size:number,color:string,weight=500,extra=''){
 return `<text x="${x}" y="${y}" fill="${color}" font-family="Prompt,Futura,Arial,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${xml(value)}</text>`;
}
function cardSvg(card:ScreenCard,lang:Lang){
 const t=card[lang],dark=card.kind==='cover'||card.kind==='outro';
 const bg=card.kind==='outro'?YELLOW:dark?INK:PAPER;
 const primary=dark&&card.kind!=='outro'?PAPER:INK;
 const secondary=dark&&card.kind!=='outro'?'#D1D4D0':MUTED;
 const number=String(classScreenCards.findIndex(c=>c.id===card.id)+1).padStart(2,'0');
 const video=String(['01','05','06','08'].indexOf(card.lessonId)+1).padStart(2,'0');
 let art=`<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${bg}"/>`;
 art+=`<rect x="0" y="0" width="1600" height="17" fill="${dark?YELLOW:BLUE}"/>`;
 if(dark){
  art+=`<path d="M1120 40V845M1220 40V845M1320 40V845M1420 40V845" stroke="${card.kind==='outro'?INK:'#FFFFFF'}" stroke-opacity=".09" stroke-width="2"/>`;
  art+=text(1190,750,video,310,card.kind==='outro'?INK:PAPER,800,'opacity=".08"');
 } else {
  art+=`<rect x="104" y="129" width="120" height="10" rx="5" fill="${YELLOW}"/>`;
  art+=`<line x1="104" y1="810" x2="1496" y2="810" stroke="#BFCBD2" stroke-width="2"/>`;
 }
 art+=text(104,91,'THE LAUNCH ERA',23,primary,800,'letter-spacing="4"');
 art+=text(1496,91,lang==='es'?'TU PRIMERA WEB CON IA':'YOUR FIRST WEBSITE WITH AI',18,primary,600,'text-anchor="end" letter-spacing="2"');
 art+=text(104,194,t.label,22,dark&&card.kind!=='outro'?YELLOW:'#375771',800,'letter-spacing="3"');
 const title=t.title;
 const first=Math.max(...title.map(x=>x.length));
 let fontSize=first>26?72:first>21?82:100;
 if(card.kind==='cover'||card.kind==='outro')fontSize=first>22?91:108;
 if(card.kind==='three'||card.kind==='checklist')fontSize=first>23?70:83;
 let lineHeight=fontSize+29;
 const y0=card.kind==='three'||card.kind==='checklist'?330:card.kind==='steps'?330:card.kind==='statement'?380:385;
 title.forEach((line,i)=>{art+=text(104,y0+i*lineHeight,line,fontSize,primary,800,'letter-spacing="-2"');});
 const lastY=y0+(title.length-1)*lineHeight;
 if(card.kind==='cover'||card.kind==='outro'||card.kind==='statement'){
   art+=`<rect x="107" y="${lastY+65}" width="106" height="9" rx="4.5" fill="${card.kind==='outro'?INK:YELLOW}"/>`;
   art+=text(104,lastY+145,t.lead,card.kind==='cover'||card.kind==='outro'?31:29,secondary,500);
 }
 if(card.kind==='steps'){
   art+=text(104,lastY+74,t.lead,28,secondary,500);
   (t.items||[]).slice(0,3).forEach((s,i)=>{
    const y=lastY+153+i*97;
    art+=`<rect x="104" y="${y-54}" width="1392" height="78" rx="14" fill="#FFFFFF" stroke="#D8E0E3" stroke-width="2"/>`;
    art+=`<rect x="104" y="${y-54}" width="82" height="78" rx="14" fill="${i===1?YELLOW:BLUE}"/>`;
    art+=text(146,y-3,String(i+1).padStart(2,'0'),25,INK,800,'text-anchor="middle"');
    art+=text(219,y-1,s,32,INK,650);
   });
 }
 if(card.kind==='three'){
   art+=text(104,lastY+73,t.lead,26,secondary,500);
   (t.items||[]).slice(0,3).forEach((str,i)=>{
    const [name,detail='']=str.split('|'),x=104+i*474;
    art+=`<rect x="${x}" y="480" width="440" height="252" rx="19" fill="${i===1?BLUE:'#FFFFFF'}" stroke="#D3E0E5" stroke-width="2"/>`;
    art+=`<rect x="${x+30}" y="513" width="68" height="8" rx="4" fill="${i===1?INK:YELLOW}"/>`;
    const size=name.length>21?30:name.length>17?34:40;
    art+=text(x+30,616,name,size,INK,800);
    art+=text(x+30,680,detail,26,'#365263',550);
   });
 }
 if(card.kind==='checklist'){
   art+=text(104,lastY+75,t.lead,28,secondary,500);
   (t.items||[]).slice(0,3).forEach((item,i)=>{
    const y=lastY+163+i*102;
    art+=`<rect x="105" y="${y-45}" width="54" height="54" rx="10" fill="#FFFFFF" stroke="#8298A5" stroke-width="3"/>`;
    art+=text(194,y,item,33,INK,650);
    art+=`<line x1="194" y1="${y+25}" x2="1496" y2="${y+25}" stroke="#D7E0E5" stroke-width="2"/>`;
   });
 }
 const footerText=lang==='es'?'APRENDER  /  CREAR  /  PUBLICAR':'LEARN  /  BUILD  /  PUBLISH';
 art+=text(104,851,footerText,17,primary,700,'letter-spacing="2.6"');
 art+=text(1496,851,`VIDEO ${video}  •  ${number} / 20`,19,primary,750,'text-anchor="end" letter-spacing="2"');
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xml(t.title.join(' '))}" viewBox="0 0 1600 900" width="1600" height="900">${art}</svg>`;
}
async function pngFor(card:ScreenCard,lang:Lang):Promise<Blob>{
 const markup=cardSvg(card,lang);
 const svgBlob=new Blob([markup],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(svgBlob);
 try{
  const img=new Image();
  img.decoding='async';
  img.src=url;
  await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('No se pudo renderizar la tarjeta PNG.'));});
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Este navegador no permite exportar PNG.');
  ctx.drawImage(img,0,0,1920,1080);
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo crear el PNG.')),'image/png'));
 }finally{URL.revokeObjectURL(url);}
}
function trigger(blob:Blob,name:string){
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function pngName(card:ScreenCard,lang:Lang){return `TLE_WEB_IA_${lang.toUpperCase()}_${card.id}.png`;}
export default function ClassScreenDeck({visible,lessonId,openingId,onOpeningHandled}:Props){
 const [lang,setLang]=useState<Lang>('es');
 const [filter,setFilter]=useState(lessonId);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [controls,setControls]=useState(true);
 const [exporting,setExporting]=useState(false);
 const [error,setError]=useState('');
 const overlay=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{if(!selectedId)setFilter(lessonId);},[lessonId,selectedId]);
 useEffect(()=>{
  if(!openingId)return;
  const target=classScreenCards.find(c=>c.id===openingId);
  if(target){setFilter(target.lessonId);setSelectedId(target.id);setControls(true);setError('');}
  onOpeningHandled();
 },[openingId,onOpeningHandled]);
 const chosen=useMemo(()=>screenCardsForLesson(filter),[filter]);
 const active=classScreenCards.find(c=>c.id===selectedId)||null;
 useEffect(()=>{
  if(!active)return;
  const old=document.documentElement.style.overflow;
  document.documentElement.style.overflow='hidden';
  overlay.current?.focus({preventScroll:true});
  const handle=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setSelectedId(null);event.preventDefault();}
   if(event.key==='ArrowRight'){setSelectedId(id=>{
    const i=chosen.findIndex(c=>c.id===id);return chosen[Math.min(chosen.length-1,i+1)]?.id||id;
   });event.preventDefault();}
   if(event.key==='ArrowLeft'){setSelectedId(id=>{
    const i=chosen.findIndex(c=>c.id===id);return chosen[Math.max(0,i-1)]?.id||id;
   });event.preventDefault();}
  };
  window.addEventListener('keydown',handle);
  return()=>{document.documentElement.style.overflow=old;window.removeEventListener('keydown',handle);};
 },[active?.id,chosen]);
 function move(delta:number){
  if(!selectedId)return;
  const i=chosen.findIndex(c=>c.id===selectedId);
  setSelectedId(chosen[Math.max(0,Math.min(chosen.length-1,i+delta))]?.id||selectedId);
 }
 async function saveOne(card:ScreenCard){
  setError('');setExporting(true);
  try{trigger(await pngFor(card,lang),pngName(card,lang));}
  catch(e){setError(e instanceof Error?e.message:'No se pudo exportar la tarjeta.');}
  finally{setExporting(false);}
 }
 async function saveAll(){
  setError('');setExporting(true);
  try{
   const files:Record<string,Uint8Array>={};
   for(const card of classScreenCards){
    const b=await pngFor(card,lang);
    files[pngName(card,lang)]=new Uint8Array(await b.arrayBuffer());
   }
   const zip=zipSync(files,{level:3});
   trigger(new Blob([new Uint8Array(zip)],{type:'application/zip'}),`TLE_Tu_Primera_Web_IA_20_Pantallas_${lang.toUpperCase()}.zip`);
  }catch(e){setError(e instanceof Error?e.message:'No se pudo preparar el paquete.');}
  finally{setExporting(false);}
 }
 const names:{[key:string]:string}={'01':'ChatGPT + conectores','05':'Crear la web','06':'Mejorar el diseño','08':'Publicar y probar'};
 return <>
  {visible&&<section className="class-screen-library" aria-label="Pantallas para los cortes de video">
   <header className="class-screen-library-head">
    <span className="class-mini-heading"><Film size={16}/> PRESENTACIONES DE TU CLASE · PRIVADAS</span>
    <h3>20 pantallas. Listas para grabar.</h3>
    <p>Títulos, explicaciones breves, pasos y checklists. Abre una pantalla en el iPad cuando quieras cortar la grabación. No muestran contraseñas ni datos de tus cuentas.</p>
    <div className="class-screen-toolbar">
     <label>Video
      <select value={filter} onChange={e=>setFilter(e.target.value)}>
       {Object.entries(names).map(([id,name],i)=><option key={id} value={id}>{String(i+1).padStart(2,'0')} · {name}</option>)}
      </select>
     </label>
     <label>Idioma
      <select value={lang} onChange={e=>setLang(e.target.value as Lang)}>
       <option value="es">Español</option><option value="en">English</option>
      </select>
     </label>
     <button className="class-screen-zip" disabled={exporting} type="button" onClick={()=>void saveAll()}><Download size={17}/>{exporting?'Preparando PNG…':'Descargar 20 PNG · ZIP'}</button>
    </div>
   </header>
   <div className="class-screen-card-grid">
    {chosen.map((card,i)=><article className="class-screen-item" key={card.id}>
     <div className="class-screen-preview" dangerouslySetInnerHTML={{__html:cardSvg(card,lang)}} role="img" aria-label={card[lang].title.join(' ')}/>
     <div className="class-screen-item-copy">
      <span>PANTALLA {String(i+1).padStart(2,'0')} / {chosen.length}</span>
      <h4>{card[lang].title.join(' ')}</h4>
      <p><b>Cuándo mostrarla:</b> {card[lang].cue}</p>
     </div>
     <div className="class-screen-item-actions">
      <button type="button" onClick={()=>{setSelectedId(card.id);setControls(true);}}><Maximize2 size={16}/> Presentar</button>
      <button type="button" disabled={exporting} onClick={()=>void saveOne(card)}><Download size={16}/> PNG</button>
     </div>
    </article>)}
   </div>
   <p className="class-screen-hint"><Check size={16}/> Todas están listas en formato 16:9. Los PNG se exportan en 1920 × 1080 para que los pongas entre tus clips sin volver a diseñarlos.</p>
   {error&&<p role="alert" className="class-screen-error">{error}</p>}
  </section>}
  {active&&typeof document!=='undefined'&&createPortal(
   <div className="class-screen-overlay" role="dialog" aria-modal="true" tabIndex={-1} ref={overlay} aria-label={'Presentación: '+active[lang].title.join(' ')}>
    <div className="class-screen-stage" onClick={()=>setControls(v=>!v)} dangerouslySetInnerHTML={{__html:cardSvg(active,lang)}} role="img" aria-label={active[lang].title.join(' ')}/>
    {controls&&<div className="class-screen-stage-controls">
     <button type="button" onClick={()=>move(-1)} disabled={chosen[0]?.id===active.id}><ArrowLeft size={17}/> Anterior</button>
     <span>{chosen.findIndex(c=>c.id===active.id)+1} / {chosen.length}</span>
     <button type="button" onClick={()=>void saveOne(active)} disabled={exporting}><Download size={17}/> PNG</button>
     <button type="button" onClick={()=>setControls(false)}><Minimize2 size={17}/> Ocultar controles</button>
     <button type="button" onClick={()=>move(1)} disabled={chosen[chosen.length-1]?.id===active.id}>Siguiente <ArrowRight size={17}/></button>
     <button type="button" className="class-screen-close" onClick={()=>setSelectedId(null)}><X size={18}/> Cerrar</button>
    </div>}
    {!controls&&<div className="class-screen-stage-hint">Toca la pantalla para mostrar controles</div>}
    {error&&<p className="class-screen-stage-error" role="alert">{error}</p>}
   </div>,document.body
  )}
 </>;
}
