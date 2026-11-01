import React,{useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,ChevronDown,X} from 'lucide-react';
import './QuickStartGuide.css';

type Locale='es'|'en';
type Mode='home'|'editor';
const copy={
 es:{
  label:'Guía rápida del Content Lab',heading:'Tu primer diseño, sin complicaciones.',
  summary:'Cuatro pasos para crear tu primera publicación.',
  steps:[
   ['Elige qué crear','Post, carrusel, portada de reel o historia.'],
   ['Sube tu foto','Usa la foto original de tu producto o negocio.'],
   ['Personaliza','Elige fondo, añade texto y ajusta los elementos.'],
   ['Guarda y descarga','Revisa el diseño y descarga tu PNG.']
  ],
  editor:'En el teléfono usa «Ver diseño» para revisar la publicación sin tapar el área de edición.',
  start:'Crear mi primera publicación',done:'Entendido',hide:'Ocultar guía',closed:'Puedes abrir esta guía cuando la necesites.'
 },
 en:{
  label:'Content Lab quick guide',heading:'Your first design, made simple.',
  summary:'Four steps to create your first post.',
  steps:[
   ['Choose what to create','Post, carousel, reel cover, or story.'],
   ['Upload your photo','Use an original photo of your product or business.'],
   ['Make it yours','Choose a background, add text, and adjust the elements.'],
   ['Save and download','Review your design and download the PNG.']
  ],
  editor:'On your phone, tap “View design” to preview the post without covering your editing tools.',
  start:'Create my first post',done:'Got it',hide:'Hide guide',closed:'You can reopen this guide whenever you need it.'
 }
} as const;
export default function QuickStartGuide({scope,onCreate,locale='es',mode='editor'}:{
 scope:string;onCreate:()=>void;locale?:Locale;mode?:Mode
}){
 const words=copy[locale];
 const key='content-lab:guide-dismissed:v2:'+mode+':'+encodeURIComponent(scope);
 const isDismissed=()=>{try{return localStorage.getItem(key)==='1'}catch{return false}};
 const [open,setOpen]=useState(!isDismissed());
 const [dismissed,setDismissed]=useState(isDismissed);
 useEffect(()=>{const closed=isDismissed();setDismissed(closed);setOpen(!closed)},[scope,mode]);
 const dismiss=()=>{try{localStorage.setItem(key,'1')}catch{}setDismissed(true);setOpen(false)};
 return <section className="lab-first-guide" aria-label={words.label}>
  <button type="button" className="lab-first-guide-toggle" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
   <BookOpen size={17}/> {words.label} <ChevronDown size={16}/>
  </button>
  {open&&<div className="lab-first-guide-content">
   <div className="lab-first-guide-heading">
    <div><strong>{words.heading}</strong><p>{words.summary}</p></div>
    <button type="button" aria-label={words.hide} onClick={dismiss}><X size={16}/></button>
   </div>
   <ol>{words.steps.map((step,i)=><li key={step[0]}>
    <span>{i+1}</span><div><strong>{step[0]}</strong><small>{step[1]}</small></div>
   </li>)}</ol>
   {mode==='editor'&&<p className="lab-first-guide-editor-tip">{words.editor}</p>}
   <div className="lab-first-guide-actions">
    {mode==='home'&&<button type="button" onClick={()=>{dismiss();onCreate()}}>{words.start}</button>}
    <button type="button" onClick={dismiss}><CheckCircle2 size={16}/> {words.done}</button>
   </div>
  </div>}
  {!open&&dismissed&&<span className="lab-first-guide-collapsed">{words.closed}</span>}
 </section>;
}
