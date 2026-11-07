import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './class-interlude.css';

export type ClassInterludeKind = 'clase' | 'concepto' | 'demo';

type Props = {
 chapter: string;
 title: string;
 subtitle: string;
 stepNumber: number;
 totalSteps: number;
 kind: ClassInterludeKind;
 onComplete: () => void;
 onCancel: () => void;
};

/**
 * Private 16:9, animated title card displayed by the class filming desk.
 * No audio, generated imagery, external requests, or automatic publishing.
 * Can be captured using the iPad's own screen recording.
 */
export default function ClassInterlude({
 chapter,title,subtitle,stepNumber,totalSteps,kind,onComplete,onCancel
}:Props) {
 const dialog=useRef<HTMLDivElement|null>(null);
 const callbacks=useRef({onComplete,onCancel});
 callbacks.current={onComplete,onCancel};
 useEffect(()=>{
  if(typeof document==='undefined')return;
  const previousOverflow=document.documentElement.style.overflow;
  document.documentElement.style.overflow='hidden';
  dialog.current?.focus({preventScroll:true});
  const timer=window.setTimeout(()=>callbacks.current.onComplete(),4600);
  const keydown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();callbacks.current.onCancel();}
  };
  window.addEventListener('keydown',keydown);
  return()=>{
   window.clearTimeout(timer);
   window.removeEventListener('keydown',keydown);
   document.documentElement.style.overflow=previousOverflow;
  };
 },[chapter,title,subtitle,kind,stepNumber,totalSteps]);
 if(typeof document==='undefined')return null;
 const eyebrow=kind==='demo'?'DEMO':kind==='concepto'?'CONCEPTO':'CLASE';
 return createPortal(
  <div className="class-interlude-overlay" role="dialog" aria-modal="true"
       aria-label={'Transición de '+eyebrow+': a continuación, '+title}
       ref={dialog} tabIndex={-1}>
   <div className="class-interlude-canvas" data-kind={kind}>
    <div className="class-interlude-wipe" aria-hidden="true"/>
    <div className="class-interlude-decor" aria-hidden="true"><span/><span/><span/></div>
    <header className="class-interlude-header">
     <span>THE LAUNCH ERA <b> / </b> TU PRIMERA WEB CON IA</span>
     <span>CASA BROWNIE · TALLER</span>
    </header>
    <main className="class-interlude-main">
     <span className="class-interlude-tag">{eyebrow} <strong>{chapter.padStart(2,'0')}</strong></span>
     <div className="class-interlude-rule" aria-hidden="true"/>
     <p className="class-interlude-kicker">A CONTINUACIÓN</p>
     <h2>{title}</h2>
     <p className="class-interlude-subtitle">{subtitle}</p>
    </main>
    <footer className="class-interlude-footer">
     <span>APRENDER · CREAR · PUBLICAR</span>
     <span>{String(stepNumber).padStart(2,'0')} <b>/</b> {String(totalSteps).padStart(2,'0')}</span>
    </footer>
    <div className="class-interlude-progress" aria-hidden="true"><span/></div>
   </div>
   <button className="class-interlude-exit" type="button"
           onClick={()=>callbacks.current.onCancel()} aria-label="Cerrar transición sin avanzar">
    Cerrar
   </button>
   <p className="class-interlude-sr">Esta mini página se mostrará durante cuatro segundos y después abrirá la escena siguiente. Pulsa Escape para cancelar.</p>
  </div>,document.body
 );
}
