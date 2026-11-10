import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './CarouselReader.css';

export type ReaderMode='pages'|'polaroids';
export type ReaderProps={
  pages:string[];
  title?:string;
  onClose:()=>void;
  initialIndex?:number;
  locale?:'es'|'en';
};
/** An opt-in, read-only preview of the very same slides exported as PNG.
 * Does not change editing state, add third-party dependencies or perform exports. */
export default function CarouselReader({pages,title='Mi carrusel',onClose,initialIndex=0,locale='es'}:ReaderProps){
  const [index,setIndex]=useState(()=>Math.max(0,Math.min(pages.length-1,initialIndex)));
  const [mode,setMode]=useState<ReaderMode>('pages');
  const [direction,setDirection]=useState<'next'|'previous'>('next');
  const dialog=useRef<HTMLDivElement>(null);
  const pointer=useRef<{x:number;y:number;id:number}|null>(null);
  const total=pages.length;
  const es=locale==='es';
  const go=(offset:number)=>{
    setIndex(current=>{
      const next=Math.max(0,Math.min(total-1,current+offset));
      if(next!==current)setDirection(offset>0?'next':'previous');
      return next;
    });
  };
  useEffect(()=>{
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.current?.focus();
    return()=>{document.body.style.overflow=previous;};
  },[]);
  useEffect(()=>{
    const handle=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onClose();}
      if(event.key==='ArrowRight'){event.preventDefault();go(1);}
      if(event.key==='ArrowLeft'){event.preventDefault();go(-1);}
    };
    document.addEventListener('keydown',handle);
    return()=>document.removeEventListener('keydown',handle);
  },[onClose,total]);
  const image=(at:number)=>pages[at]
    ?<img draggable={false} src={pages[at]} alt={(es?'Slide ':'Page ')+(at+1)}/>
    :<div className="tle-reader-missing" role="status">{es?'Vista aún no disponible':'Preview not available'}</div>;
  return createPortal(
    <div className="tle-reader-backdrop" onPointerDown={event=>{if(event.target===event.currentTarget)onClose();}}>
      <div className="tle-reader" role="dialog" aria-modal="true" aria-label={es?'Vista de revista del carrusel':'Carousel magazine preview'} ref={dialog} tabIndex={-1}>
        <header className="tle-reader-header">
          <div className="tle-reader-heading"><small>{es?'VISTA PREVIA · SIN MODIFICAR EL DISEÑO':'PREVIEW · DESIGN UNCHANGED'}</small><strong>{title}</strong></div>
          <button type="button" className="tle-reader-close" onClick={onClose} aria-label={es?'Cerrar vista previa':'Close preview'}>×</button>
        </header>
        <div className="tle-reader-switch" role="group" aria-label={es?'Estilo de presentación':'Presentation style'}>
          <button type="button" aria-pressed={mode==='pages'} className={mode==='pages'?'active':''} onClick={()=>setMode('pages')}>{es?'Pasar páginas':'Page curl'}</button>
          <button type="button" aria-pressed={mode==='polaroids'} className={mode==='polaroids'?'active':''} onClick={()=>setMode('polaroids')}>{es?'Fotos Polaroid':'Polaroid stack'}</button>
        </div>
        <div className={'tle-reader-stage mode-'+mode}
          onPointerDown={event=>{if(event.pointerType!=='mouse')pointer.current={x:event.clientX,y:event.clientY,id:event.pointerId};}}
          onPointerUp={event=>{
            const start=pointer.current;pointer.current=null;
            if(!start||start.id!==event.pointerId)return;
            const dx=event.clientX-start.x,dy=event.clientY-start.y;
            if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)go(dx<0?1:-1);
          }}
          onPointerCancel={()=>{pointer.current=null;}}
          aria-live="polite"
        >
          {mode==='pages'
            ?<div key={'page-'+index} className={'tle-reader-sheet turn-'+direction}>{image(index)}</div>
            :<div key={'stack-'+index} className="tle-reader-stack">
              {index+1<total&&<div className="tle-reader-polaroid behind-two" aria-hidden="true">{pages[index+1]&&<img src={pages[index+1]} alt="" draggable={false}/>}</div>}
              {index>0&&<div className="tle-reader-polaroid behind-one" aria-hidden="true">{pages[index-1]&&<img src={pages[index-1]} alt="" draggable={false}/>}</div>}
              <div className="tle-reader-polaroid front">{image(index)}<span>{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span></div>
            </div>}
        </div>
        <footer className="tle-reader-footer">
          <button type="button" onClick={()=>go(-1)} disabled={index===0} aria-label={es?'Slide anterior':'Previous slide'}>‹ <span>{es?'Anterior':'Previous'}</span></button>
          <span aria-live="off">{index+1} / {total}</span>
          <button type="button" onClick={()=>go(1)} disabled={index===total-1} aria-label={es?'Slide siguiente':'Next slide'}><span>{es?'Siguiente':'Next'}</span> ›</button>
        </footer>
        <p className="tle-reader-tip">{es?'Desliza lateralmente o usa las flechas. Para publicar, descarga tus PNG desde el editor.':'Swipe sideways or use arrows. Export PNGs from the editor to publish.'}</p>
      </div>
    </div>,document.body);
}
