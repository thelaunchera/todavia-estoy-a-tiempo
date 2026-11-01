import React,{useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,ChevronDown,X} from 'lucide-react';
import './QuickStartGuide.css';
const steps=[
 {title:'Sube una foto',detail:'Usa tu imagen original, sin reducirla antes.'},
 {title:'Elige el fondo',detail:'Puedes aplicar uno distinto a cada slide.'},
 {title:'Añade texto y stickers',detail:'Selecciona, arrastra, bloquea o duplica.'},
 {title:'Revisa el diseño',detail:'En iPhone toca «Ver diseño» para abrirlo sin tapar el editor.'},
 {title:'Guarda y descarga',detail:'El borrador se guarda y puedes descargar los PNG individuales.'}
];
export default function QuickStartGuide({scope,onCreate}:{
 scope:string;onCreate:()=>void
}){
 const key='content-lab:guide-dismissed:v1:'+encodeURIComponent(scope);
 const isDismissed=()=>{try{return localStorage.getItem(key)==='1'}catch{return false}};
 const [open,setOpen]=useState(!isDismissed());
 const [dismissed,setDismissed]=useState(isDismissed);
 useEffect(()=>{const closed=isDismissed();setDismissed(closed);setOpen(!closed)},[scope]);
 const dismiss=()=>{try{localStorage.setItem(key,'1')}catch{}setDismissed(true);setOpen(false)};
 return <section className="lab-first-guide" aria-label="Guía de primeros pasos">
  <button type="button" className="lab-first-guide-toggle" aria-expanded={open}
   onClick={()=>setOpen(value=>!value)}>
   <BookOpen size={17}/> Guía rápida del Content Lab <ChevronDown size={16}/>
  </button>
  {open&&<div className="lab-first-guide-content">
   <div className="lab-first-guide-heading">
    <div><strong>Tu primer diseño, sin complicaciones.</strong>
     <p>5 pasos sencillos para preparar una publicación.</p></div>
    <button type="button" aria-label="Ocultar guía" onClick={dismiss}><X size={16}/></button>
   </div>
   <ol>{steps.map((step,i)=><li key={step.title}>
    <span>{i+1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div>
   </li>)}</ol>
   <div className="lab-first-guide-actions">
    <button type="button" onClick={()=>{dismiss();onCreate()}}>Crear mi carrusel</button>
    <button type="button" onClick={dismiss}><CheckCircle2 size={16}/> Entendido</button>
   </div>
  </div>}
  {!open&&dismissed&&<span className="lab-first-guide-collapsed">Puedes volver a abrir la guía cuando quieras.</span>}
 </section>
}
