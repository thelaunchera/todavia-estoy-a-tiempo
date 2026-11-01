import {useEffect,useMemo,useState} from 'react';
import {CalendarDays,Check,ChevronLeft,ChevronRight,Clock3,ImagePlus,LayoutGrid,Pencil,RefreshCw,BookOpen,Info} from 'lucide-react';
import {api} from './platform/client';
import {contentKind,contentKindLabel,type CalendarGrid,type CalendarPost,type PlannedItem} from './CalendarPlannerModel';
import {liveFeedState,liveFeedTiles} from './LiveFeedModel';
import './LiveFeedGrid.css';

type Props={
 brand:{id:string;name:string};
 posts:CalendarPost[];
 images:Record<string,string>;
 locale:'es'|'en';
 loadImage:(id:string)=>void;
 onPostSaved:(post:CalendarPost)=>void;
 onOpenEditor:(item:PlannedItem)=>void;
 onOpenCalendar:(date?:string)=>void;
 onOpenPrompts:()=>void;
 onCreate:()=>void;
 notify:(message:string)=>void;
 showError:(error:unknown)=>void;
};
const displayDate=(date:string,locale:'es'|'en')=>{
 const [year,month,day]=date.split('-').map(Number);
 return new Intl.DateTimeFormat(locale==='es'?'es-US':'en-US',{month:'short',day:'numeric'}).format(new Date(year,month-1,day));
};
export default function LiveFeedGrid({brand,posts,images,locale,loadImage,
 onPostSaved,onOpenEditor,onOpenCalendar,onOpenPrompts,onCreate,notify,showError}:Props){
 const es=locale==='es';
 const [grids,setGrids]=useState<CalendarGrid[]>([]);
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 const [mode,setMode]=useState<'now'|'future'>('future');
 const [advance,setAdvance]=useState(3);
 const [savingId,setSavingId]=useState('');
 const [showHistory,setShowHistory]=useState(false);
 useEffect(()=>{
   let active=true;
   setLoading(true);setLoadError('');
   void api.get('/api/grids').then(({data})=>{if(active)setGrids(data.grids||[])})
     .catch(e=>{if(active){setLoadError(es?'No se pudieron cargar los proyectos anteriores.':'Could not load earlier projects.');showError(e)}})
     .finally(()=>{if(active)setLoading(false)});
   return()=>{active=false};
 },[brand.id]);
 const timeline=useMemo(()=>liveFeedState(posts,grids,brand.id),[posts,grids,brand.id]);
 const forward=Math.min(timeline.upcoming.length,9,advance);
 const tiles=useMemo(()=>liveFeedTiles(timeline.published,timeline.upcoming,mode,forward),
   [timeline.published,timeline.upcoming,mode,forward]);
 const seen=useMemo(()=>[...new Set([...timeline.all,...tiles.filter((x):x is PlannedItem=>!!x)]
  .map(x=>x.assetId).filter(Boolean))].filter(id=>!images[id]).slice(0,30),
  [timeline.all,tiles,images]);
 useEffect(()=>{for(const id of seen)loadImage(id)},[seen.join('|')]);
 const markPublished=async(item:PlannedItem)=>{
   if(savingId)return;
   setSavingId(item.id);
   try{
     if(item.kind==='post'){
       const id=item.id.slice(5);
       const post=posts.find(p=>p.id===id&&p.brandId===brand.id);
       if(!post)throw Error('No se encontró la publicación original.');
       const {data}=await api.put('/api/posts/'+id,{...post,planningStatus:'published'});
       onPostSaved(data as CalendarPost);
     }else{
       const grid=grids.find(x=>x.id===item.gridId&&x.brandId===brand.id);
       const index=item.tileIndex;
       if(!grid||index===undefined||!grid.posts[index])throw Error('No se encontró el post de esta campaña.');
       const changed=grid.posts.map((p,i)=>i===index?{...p,planningStatus:'published'}:p);
       await api.put('/api/grids/'+grid.id,{posts:changed});
       setGrids(prev=>prev.map(g=>g.id===grid.id?{...g,posts:changed}:g));
     }
     notify(es?'Marcado como publicado. Tu feed se actualizó; el diseño sigue guardado.':'Marked published. Your feed updated and the design is saved.');
   }catch(e){showError(e)}finally{setSavingId('')}
 };
 const undoPublished=async(item:PlannedItem)=>{
   if(savingId)return;
   setSavingId(item.id);
   try{
     if(item.kind==='post'){
       const id=item.id.slice(5);
       const post=posts.find(p=>p.id===id&&p.brandId===brand.id);
       if(!post)throw Error('Publicación no encontrada.');
       const {data}=await api.put('/api/posts/'+id,{...post,planningStatus:'planned',status:post.status==='Published'?'Draft':post.status});
       onPostSaved(data as CalendarPost);
     }else{
       const grid=grids.find(g=>g.id===item.gridId&&g.brandId===brand.id),idx=item.tileIndex;
       if(!grid||idx===undefined||!grid.posts[idx])throw Error('Publicación no encontrada.');
       const changed=grid.posts.map((p,i)=>i===idx?{...p,planningStatus:'planned'}:p);
       await api.put('/api/grids/'+grid.id,{posts:changed});
       setGrids(old=>old.map(g=>g.id===grid.id?{...g,posts:changed}:g));
     }
     notify(es?'Devuelto a pendientes. El historial se ha actualizado.':'Moved back to pending. History updated.');
   }catch(e){showError(e)}finally{setSavingId('')}
 };
 const next=timeline.upcoming[0];
 return <section className="lab-live-feed">
   <header className="lab-live-feed-hero">
     <div><span className="eyebrow">CONTENT LAB · GRID</span>
       <h1>{es?'Tu feed, en movimiento.':'A feed that moves with you.'}</h1>
       <p>{es?'No borres diseños al publicar. Márcalos como publicados y el grid se actualiza con lo próximo de tu calendario.':
       'Do not delete designs after posting. Mark them published to update your calendar-connected grid.'}</p></div>
     <div className="lab-live-feed-stat"><LayoutGrid size={21}/><strong>{timeline.upcoming.length}</strong>
       <small>{es?'pendientes':'upcoming'}</small></div>
   </header>
   {loadError&&<p role="alert" className="lab-live-feed-error">{loadError}</p>}
   <div className="lab-live-feed-tools" role="group" aria-label={es?'Vista del feed':'Feed view'}>
     <div className="lab-live-feed-switch">
       <button type="button" aria-pressed={mode==='now'} className={mode==='now'?'active':''} onClick={()=>setMode('now')}>
          {es?'Publicado':'Published'} <span>{timeline.published.length}</span></button>
       <button type="button" aria-pressed={mode==='future'} className={mode==='future'?'active':''} onClick={()=>setMode('future')}>
          {es?'Vista futura':'Future preview'} <span>{timeline.upcoming.length}</span></button>
     </div>
     <button type="button" onClick={()=>onOpenCalendar()} className="lab-live-feed-calendar">
       <CalendarDays size={16}/>{es?'Abrir calendario':'Open calendar'}</button>
   </div>
   {mode==='future'&&<div className="lab-live-feed-horizon">
     <div><strong>{es?'Así quedará después de publicar':'Your feed after publishing'} {forward} {es?'más':'more'}</strong>
       <small>{es?'Prueba el siguiente paso sin cambiar ni publicar nada.':'Preview each step without posting anything.'}</small></div>
     <div className="lab-live-feed-stepper">
       <button type="button" aria-label={es?'Ver un paso menos':'One step back'} disabled={forward===0}
         onClick={()=>setAdvance(n=>Math.max(0,n-1))}><ChevronLeft size={20}/></button>
       <strong>{forward}/{Math.min(9,timeline.upcoming.length)}</strong>
       <button type="button" aria-label={es?'Ver una publicación más':'One more post'} disabled={forward>=Math.min(9,timeline.upcoming.length)}
         onClick={()=>setAdvance(n=>Math.min(9,n+1))}><ChevronRight size={20}/></button>
     </div>
   </div>}
   <div className="lab-live-feed-grid" role="group" aria-label={es?'Vista del grid 3 por 3':'3 by 3 feed preview'}>
     {tiles.map((item,index)=>{
       if(!item)return <div key={'empty-'+index} className="lab-live-feed-empty" aria-label={es?'Espacio aún vacío':'Empty space'}><span>＋</span></div>;
       const pending=item.status==='planned';
       return <button type="button" key={item.id} className={'lab-live-feed-tile'+(pending?' planned':'')}
         aria-label={(es?'Editar ':'Edit ')+item.title}
         title={item.title+' · '+contentKindLabel(item.format,locale)+' · '+item.date}
         onClick={()=>onOpenEditor(item)}>
         {item.assetId&&images[item.assetId]?<img src={images[item.assetId]} alt=""/>:
           <div className="lab-live-feed-missing"><ImagePlus size={24}/><small>{es?'Sin imagen':'No image'}</small></div>}
         <span className="lab-live-feed-type">{contentKindLabel(item.format,locale)}</span>
         {pending&&<span className="lab-live-feed-tile-date">{displayDate(item.date,locale)}</span>}
       </button>;
     })}
   </div>
   <p className="lab-live-feed-caption"><Info size={14}/>
     {es?'La cuadrícula es una vista previa. Instagram puede recortar miniaturas; aquí no modificamos tus imágenes.':
       'This is a preview. Instagram may crop thumbnails; your original images are unchanged.'}</p>
   <section className="lab-live-feed-queue">
      <div className="lab-live-feed-queue-head"><div><h2>{es?'Próximas publicaciones':'Next posts'}</h2>
         <p>{es?'Ordenadas por día y hora del calendario.':'In calendar date and time order.'}</p></div>
         <button type="button" onClick={onCreate}><ImagePlus size={16}/>{es?'Nuevo post':'New post'}</button></div>
      {timeline.upcoming.length===0?
        <div className="lab-live-feed-no-posts"><CalendarDays size={24}/>
         <span>{es?'No hay publicaciones pendientes. Añade un diseño y una fecha en el calendario.':
           'No pending posts. Add a design and a date in the calendar.'}</span></div>:
       <div className="lab-live-feed-rows">{timeline.upcoming.slice(0,12).map(item=>
         <article key={item.id} className="lab-live-feed-row">
           <div className="lab-live-feed-small-thumb">{item.assetId&&images[item.assetId]?
             <img src={images[item.assetId]} alt=""/>:<ImagePlus size={20}/>}</div>
           <div className="lab-live-feed-row-info"><strong>{item.title}</strong>
             <span>{displayDate(item.date,locale)} · {item.time} · {contentKindLabel(item.format,locale)}</span></div>
           <div className="lab-live-feed-row-actions">
             <button type="button" onClick={()=>onOpenEditor(item)}><Pencil size={15}/>{es?'Editar':'Edit'}</button>
             <button type="button" onClick={()=>onOpenCalendar(item.date)}><Clock3 size={15}/>{es?'Fecha':'Date'}</button>
             <button type="button" className="lab-live-feed-mark" disabled={!!savingId||loading}
               onClick={()=>void markPublished(item)}><Check size={15}/>{savingId===item.id?'…':es?'Publicado':'Published'}</button>
           </div>
         </article>)}</div>}
      {timeline.upcoming.length>12&&<button className="lab-live-feed-more" type="button" onClick={()=>onOpenCalendar()}>
        {es?'Ver todos en el calendario':'See all in calendar'}</button>}
   </section>
   {timeline.published.length>0&&<section className="lab-live-feed-history">
     <button type="button" aria-expanded={showHistory} onClick={()=>setShowHistory(o=>!o)}>
       <RefreshCw size={16}/>{es?'Historial de publicaciones':'Published history'} ({timeline.published.length})
       <span>{showHistory?'−':'＋'}</span></button>
     {showHistory&&<div className="lab-live-feed-rows">
       {timeline.published.slice().reverse().slice(0,25).map(item=><article key={item.id} className="lab-live-feed-row">
         <div className="lab-live-feed-small-thumb">{item.assetId&&images[item.assetId]?
           <img src={images[item.assetId]} alt=""/>:<ImagePlus size={20}/>}</div>
         <div className="lab-live-feed-row-info"><strong>{item.title}</strong>
           <span>{displayDate(item.date,locale)} · {item.time} · {contentKindLabel(item.format,locale)}</span></div>
         <div className="lab-live-feed-row-actions">
           <button type="button" onClick={()=>onOpenEditor(item)}><Pencil size={15}/>{es?'Editar':'Edit'}</button>
           <button type="button" disabled={!!savingId} onClick={()=>void undoPublished(item)}>
             <RefreshCw size={15}/>{es?'Deshacer':'Undo'}</button>
         </div>
       </article>)}
       </div>}
   </section>}
   <footer className="lab-live-feed-footer">
     <div><BookOpen size={19}/><span>{es?'¿Necesitas imágenes nuevas? Crea tus fotos fuera del Lab y súbelas a cada publicación. No hace falta una foto de referencia para organizar el grid.':
       'Need images? Create them externally and upload to each post. No reference photo needed to plan the grid.'}</span></div>
     <button type="button" onClick={onOpenPrompts}>{es?'Abrir prompts para ChatGPT':'Prompts for ChatGPT'}</button>
   </footer>
   {next&&<p className="lab-live-feed-disclaimer">{es?'El Lab no publica automáticamente; solo tú confirmas que una publicación ya se publicó.':'Content Lab never auto-posts. Only you can confirm a post is published.'}</p>}
 </section>;
}
