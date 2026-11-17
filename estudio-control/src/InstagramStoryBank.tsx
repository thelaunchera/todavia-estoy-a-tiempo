import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronLeft, ChevronRight, Copy, Download, FilePlus2, Plus, Search, Trash2, Upload } from 'lucide-react';
import { STORY_SEEDS, type StoryDraft, type StoryStatus } from './instagram-story-seeds';
import './instagram-story-bank.css';

const STORAGE_KEY='tle-private-studio-instagram-stories-v1';
const STATUSES:StoryStatus[]=['Idea','Borrador','Guion listo','En diseño','Publicado'];
const themes=['Second chances','Friendship','Everyday kindness','Family','Love','Self-worth','Unexpected encounters','Other'];

function loadStories():StoryDraft[]{
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    const userData=raw?JSON.parse(raw):[];
    const stored=Array.isArray(userData)?userData.filter(validStory):[];
    const ids=new Set(stored.map((story:StoryDraft)=>story.id));
    return [...stored,...STORY_SEEDS.filter(story=>!ids.has(story.id))];
  }catch{return [...STORY_SEEDS];}
}
function validStory(value:unknown):value is StoryDraft{
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<StoryDraft>;
  return typeof s.id==='string'&&typeof s.title==='string'&&Array.isArray(s.slides)&&
    s.slides.length>0&&s.slides.every(slide=>typeof slide==='string')&&
    typeof s.theme==='string'&&STATUSES.includes(s.status as StoryStatus)&&
    (s.language==='EN'||s.language==='ES');
}
function makeId(){return 'story-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
function fullScript(story:StoryDraft){
  return story.slides.map((slide,index)=>'SLIDE '+(index+1)+'/'+story.slides.length+'\n\n'+slide).join('\n\n--------------------\n\n');
}
function StoryBank({readOnly=false}:{readOnly?:boolean}){
  const [stories,setStories]=useState<StoryDraft[]>(loadStories);
  const [selectedId,setSelectedId]=useState(STORY_SEEDS[0].id);
  const [slideIndex,setSlideIndex]=useState(0);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('Todas');
  const [feedback,setFeedback]=useState('');
  const [showPreview,setShowPreview]=useState(false);
  const [storageError,setStorageError]=useState(false);
  useEffect(()=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(stories));setStorageError(false);}
    catch{setStorageError(true);}
  },[stories]);
  const selected=stories.find(story=>story.id===selectedId)||stories[0];
  const filtered=useMemo(()=>stories.filter(story=>
    (filter==='Todas'||story.status===filter)&&
    [story.title,story.theme,story.description,...story.slides].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  ),[stories,filter,query]);
  const update=(patch:Partial<StoryDraft>)=>{
    if(!selected||readOnly)return;
    setStories(current=>current.map(story=>story.id===selected.id?{...story,...patch}:story));
  };
  const editSlide=(value:string)=>{
    if(!selected||readOnly)return;
    update({slides:selected.slides.map((slide,index)=>index===slideIndex?value:slide)});
  };
  const pick=(id:string)=>{setSelectedId(id);setSlideIndex(0);setShowPreview(false);setFeedback('');};
  const create=()=>{
    if(readOnly)return;
    const story:StoryDraft={id:makeId(),title:'Nueva historia',theme:'Other',status:'Idea',language:'EN',
      description:'Nueva historia original · pendiente de desarrollar',createdAt:new Date().toISOString().slice(0,10),slides:['']};
    setStories(current=>[story,...current]);setFilter('Todas');setQuery('');pick(story.id);
  };
  const duplicate=()=>{
    if(!selected||readOnly)return;
    const story={...selected,id:makeId(),title:selected.title+' · copia',status:'Borrador' as StoryStatus,
      slides:[...selected.slides],createdAt:new Date().toISOString().slice(0,10)};
    setStories(current=>[story,...current]);setFilter('Todas');setQuery('');pick(story.id);
  };
  const remove=()=>{
    if(!selected||readOnly||!window.confirm('¿Eliminar esta historia de este navegador? Exporta una copia si quieres conservar tus cambios.'))return;
    const next=stories.filter(story=>story.id!==selected.id);
    setStories(next);setSelectedId(next[0]?.id||'');setSlideIndex(0);
  };
  const copy=async()=>{
    if(!selected)return;
    try{await navigator.clipboard.writeText(fullScript(selected));setFeedback('Guion completo copiado.');}
    catch{setFeedback('No se pudo copiar automáticamente. Selecciona y copia el texto en el editor.');}
  };
  const exportAll=()=>{
    const blob=new Blob([JSON.stringify({format:'tle-private-instagram-stories-v1',stories},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='the-launch-era-studio-historias.json';document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1200);
    setFeedback('Copia de todas las historias descargada.');
  };
  const importBackup=async(file?:File)=>{
    if(!file||readOnly)return;
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed?.format!=='tle-private-instagram-stories-v1'||!Array.isArray(parsed.stories)||
        parsed.stories.length===0||!parsed.stories.every(validStory))throw new Error('invalid');
      if(!window.confirm('¿Importar este archivo? Las historias con el mismo ID reemplazarán sus versiones guardadas en este navegador.'))return;
      setStories(current=>{
        const m=new Map(current.map(story=>[story.id,story]));
        for(const story of parsed.stories as StoryDraft[])m.set(story.id,story);
        return Array.from(m.values());
      });
      setFeedback('Historias importadas correctamente.');
    }catch{setFeedback('Archivo no válido. Importa una copia JSON exportada desde Historias.');}
  };
  const addSlide=()=>{
    if(!selected||readOnly||selected.slides.length>=20)return;
    const next=[...selected.slides];next.splice(slideIndex+1,0,'');
    update({slides:next});setSlideIndex(slideIndex+1);
  };
  const deleteSlide=()=>{
    if(!selected||readOnly||selected.slides.length<=1)return;
    update({slides:selected.slides.filter((_,index)=>index!==slideIndex)});
    setSlideIndex(Math.max(0,slideIndex-1));
  };
  return <section className="igstory" aria-label="Historias originales para Instagram">
    <div className="igstory-intro">
      <div><span className="igstory-kicker">STORYTELLING · ARCHIVO PRIVADO</span>
        <h2>Historias que merecen ser contadas.</h2>
        <p>Guiones originales en inglés, guardados por diapositiva para convertirlos después en carruseles. Nada se publica automáticamente.</p></div>
      <button className="igstory-primary" type="button" onClick={create} disabled={readOnly}><Plus size={16}/> Nueva historia</button>
    </div>
    <div className="igstory-stats" aria-label="Estado de las historias">
      <span><strong>{stories.length}</strong> historias</span>
      <span><strong>{stories.filter(s=>s.status==='Guion listo').length}</strong> guiones listos</span>
      <span><strong>{stories.filter(s=>s.status==='Borrador'||s.status==='Idea').length}</strong> pendientes de diseño</span>
    </div>
    <div className="igstory-layout">
      <aside className="igstory-library" aria-label="Lista de historias">
        <div className="igstory-library-top"><h3>Biblioteca de historias</h3><span>{filtered.length}</span></div>
        <label className="igstory-search"><Search size={16}/><input type="search" aria-label="Buscar historias" placeholder="Buscar historias…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
        <div className="igstory-filters">
          {['Todas','Idea','Borrador','Guion listo','En diseño','Publicado'].map(item=><button type="button" key={item}
            aria-pressed={filter===item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}
        </div>
        <div className="igstory-list">
          {filtered.map(story=><button type="button" key={story.id} onClick={()=>pick(story.id)}
            className={'igstory-story-card'+(selected?.id===story.id?' active':'')} aria-current={selected?.id===story.id?'true':undefined}>
            <span className="igstory-card-top"><span>{story.theme}</span><small>{story.slides.length} slides</small></span>
            <strong>{story.title}</strong><span className="igstory-card-description">{story.description}</span>
            <span className="igstory-status">{story.status}</span>
          </button>)}
          {!filtered.length&&<p className="igstory-empty">No hay historias con esos filtros.</p>}
        </div>
        <div className="igstory-backups">
          <button type="button" onClick={exportAll}><Download size={15}/> Exportar historias</button>
          <label className={readOnly?'disabled':''}><Upload size={15}/> Importar copia
            <input aria-label="Importar archivo de historias" type="file" accept="application/json,.json" disabled={readOnly}
              onChange={e=>{void importBackup(e.target.files?.[0]);e.target.value='';}}/>
          </label>
        </div>
      </aside>
      <div className="igstory-editor">
        {selected?<div className="igstory-workspace">
          <header className="igstory-editor-top">
            <div><span className="igstory-kicker">ARCHIVO / {selected.id===STORY_SEEDS[0].id?'HISTORIA 01':'HISTORIA'}</span>
              <h3>{selected.title}</h3><p>{selected.description}</p></div>
            <span className="igstory-save-indicator"><Check size={14}/> {storageError?'No se pudo guardar':'Guardado en este dispositivo'}</span>
          </header>
          <div className="igstory-meta">
            <label>Título<input value={selected.title} disabled={readOnly} onChange={e=>update({title:e.target.value})}/></label>
            <label>Tema<select value={selected.theme} disabled={readOnly} onChange={e=>update({theme:e.target.value})}>
              {(themes.includes(selected.theme)?themes:[...themes,selected.theme]).map(t=><option key={t} value={t}>{t}</option>)}</select></label>
            <label>Estado<select value={selected.status} disabled={readOnly} onChange={e=>update({status:e.target.value as StoryStatus})}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="igstory-description">Sinopsis<input value={selected.description} disabled={readOnly} onChange={e=>update({description:e.target.value})}/></label>
          <div className="igstory-slide-header"><div><span className="igstory-kicker">GUIÓN EDITABLE</span>
            <h4>Diapositiva {slideIndex+1} <span>/ {selected.slides.length}</span></h4></div>
            <button type="button" className="igstory-preview-button" aria-pressed={showPreview} onClick={()=>setShowPreview(x=>!x)}>
              <BookOpen size={15}/> {showPreview?'Editar texto':'Vista de lectura'}
            </button>
          </div>
          <div className="igstory-slide-rail" aria-label="Elegir diapositiva">
            {selected.slides.map((_,index)=><button type="button" key={index} aria-label={'Diapositiva '+(index+1)}
              aria-current={index===slideIndex?'step':undefined} className={index===slideIndex?'current':''}
              onClick={()=>setSlideIndex(index)}>{String(index+1).padStart(2,'0')}</button>)}
          </div>
          {showPreview?<article className="igstory-reading"><span>{slideIndex+1}/{selected.slides.length}</span><p>{selected.slides[slideIndex]}</p></article>:
          <label className="igstory-slide-input">Texto de la diapositiva
            <textarea value={selected.slides[slideIndex]||''} disabled={readOnly} rows={11} spellCheck={false}
              onChange={e=>editSlide(e.target.value)} placeholder="Escribe aquí el texto de esta diapositiva…" />
          </label>}
          <div className="igstory-slide-actions">
            <button type="button" disabled={slideIndex===0} onClick={()=>setSlideIndex(i=>i-1)}><ChevronLeft size={16}/> Anterior</button>
            <button type="button" disabled={readOnly||selected.slides.length>=20} onClick={addSlide}><Plus size={16}/> Añadir slide</button>
            <button type="button" disabled={readOnly||selected.slides.length<=1} onClick={deleteSlide}><Trash2 size={15}/> Quitar slide</button>
            <button type="button" disabled={slideIndex>=selected.slides.length-1} onClick={()=>setSlideIndex(i=>i+1)}>Siguiente <ChevronRight size={16}/></button>
          </div>
          <div className="igstory-bottom-actions">
            <button type="button" className="igstory-primary" onClick={()=>void copy()}><Copy size={16}/> Copiar guion completo</button>
            <button type="button" onClick={duplicate} disabled={readOnly}><FilePlus2 size={16}/> Duplicar</button>
            <button type="button" className="igstory-danger" onClick={remove} disabled={readOnly}><Trash2 size={16}/> Eliminar</button>
          </div>
          {feedback&&<p role="status" className="igstory-feedback">{feedback}</p>}
        </div>:<div className="igstory-empty">Crea tu primera historia para empezar.</div>}
      </div>
    </div>
    <p className="igstory-storage-note">🔒 Biblioteca del Studio privado, separada del Content Lab. Los guiones iniciales están incluidos en la versión del Studio; cualquier edición o historia nueva se guarda solo en este navegador. Usa <strong>Exportar historias</strong> para conservar y trasladar cambios. Ninguna historia se publica automáticamente.</p>
  </section>;
}
export default StoryBank;
