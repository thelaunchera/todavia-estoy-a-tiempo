import React,{useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Check,Sparkles,X} from 'lucide-react';
import './SaveSuccessCelebration.css';
export default function SaveSuccessCelebration({event,locale,onDone}:{
 event:{id:number;format:string;title:string}|null;locale:'es'|'en';onDone:()=>void
}){
 useEffect(()=>{if(!event)return;const t=window.setTimeout(onDone,3200);return()=>window.clearTimeout(t)},[event?.id]);
 if(!event)return null;
 const es=locale==='es';
 return createPortal(<div className="lab-save-celebration" role="status" aria-live="polite" key={event.id}>
   <div className="lab-save-stars" aria-hidden="true"><Sparkles size={15}/><Sparkles size={12}/></div>
   <div className="lab-save-mark"><Check size={26} strokeWidth={3}/></div>
   <div className="lab-save-copy"><strong>{es?'¡Lo lograste! ✨':'You did it! ✨'}</strong>
    <span>{es?'Tu proyecto está guardado. ¡Qué buena idea!':'Your project is saved. Love what you’re creating!'}</span>
   </div>
   <button type="button" onClick={onDone} aria-label={es?'Cerrar':'Close'}><X size={15}/></button>
 </div>,document.body);
}
