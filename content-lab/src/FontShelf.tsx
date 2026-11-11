import {useEffect,useRef,useState} from 'react';
import {EDITOR_FONTS,editorFontFamily,editorFontId,ensureEditorFont,type EditorFontCategory} from '../../creative-shared/editor-font-library';

/** Searchable, lazy-loaded typography shelf shared conceptually by both editors.
 * The scroll observer requests only visible sample faces on mobile Safari.
 */
type Props={value?:string;onSelect:(id:string)=>void;locale?:'es'|'en'};
const groups:('all'|EditorFontCategory)[]=['all','Sans','Display','Serif','Script'];
const labels:Record<typeof groups[number],{es:string;en:string}>={
 all:{es:'Todas',en:'All'},Sans:{es:'Modernas',en:'Sans'},
 Display:{es:'Impactantes',en:'Display'},Serif:{es:'Editoriales',en:'Serif'},
 Script:{es:'Manuscritas',en:'Script'}
};
export default function FontShelf({value,onSelect,locale='es'}:Props){
 const [category,setCategory]=useState<typeof groups[number]>('all');
 const [search,setSearch]=useState('');
 const root=useRef<HTMLDivElement>(null);
 const es=locale==='es';
 const available=EDITOR_FONTS.filter(font=>(category==='all'||font.category===category)&&
   (font.label.toLowerCase().includes(search.trim().toLowerCase())));
 useEffect(()=>{
   const area=root.current;
   if(!area)return;
   const nodes=Array.from(area.querySelectorAll<HTMLElement>('[data-font-id]'));
   if(typeof IntersectionObserver==='undefined'){
     nodes.slice(0,10).forEach(node=>{if(node.dataset.fontId)void ensureEditorFont(node.dataset.fontId)});
     return;
   }
   const observer=new IntersectionObserver(entries=>{
     for(const entry of entries){
       if(!entry.isIntersecting)continue;
       const id=(entry.target as HTMLElement).dataset.fontId;
       if(id)void ensureEditorFont(id);
       observer.unobserve(entry.target);
     }
   },{root:area,rootMargin:'80px'});
   nodes.forEach(node=>observer.observe(node));
   return()=>observer.disconnect();
 },[category,search]);
 const choose=(id:string)=>{void ensureEditorFont(id);onSelect(id)};
 return <div className="editor-font-shelf" role="group"
   aria-label={es?'Biblioteca de 50 tipografías':'50-font typography library'}>
   <div className="editor-font-shelf-header">
     <strong>{es?'50 tipografías':'50 typefaces'}</strong>
     <input type="search" aria-label={es?'Buscar tipografía':'Search fonts'}
       value={search} onChange={event=>setSearch(event.target.value)}
       placeholder={es?'Buscar fuente…':'Search fonts…'}/>
   </div>
   <div className="editor-font-shelf-categories" role="group" aria-label={es?'Categorías de tipografías':'Font categories'}>
     {groups.map(group=><button type="button" key={group}
       aria-pressed={category===group} onClick={()=>setCategory(group)}>
       {labels[group][es?'es':'en']}
     </button>)}
   </div>
   <div className="editor-font-shelf-list" ref={root} role="list" aria-label={es?'Estilos de fuente':'Font styles'}>
     {available.map(font=><button type="button" key={font.id} role="listitem"
       data-font-id={font.id} className="editor-font-shelf-choice"
       aria-label={es?'Elegir '+font.label:'Choose '+font.label}
       aria-pressed={editorFontId(value)===font.id}
       onClick={()=>choose(font.id)}>
       <span className="editor-font-shelf-sample" style={{fontFamily:editorFontFamily(font.id)}}>Ag 123</span>
       <span className="editor-font-shelf-name">{font.label}</span>
       {editorFontId(value)===font.id&&<span className="editor-font-shelf-check" aria-hidden="true">✓</span>}
     </button>)}
     {!available.length&&<p className="editor-font-shelf-empty">{es?'No hay fuentes con ese nombre.':'No matching fonts.'}</p>}
   </div>
   <small className="editor-font-shelf-note">{es
     ?'El estilo seleccionado se conserva al guardar y exportar el PNG.'
     :'The selected font is kept in saved designs and PNG exports.'}</small>
 </div>;
}
