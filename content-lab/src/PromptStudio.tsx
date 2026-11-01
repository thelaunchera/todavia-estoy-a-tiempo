import {useEffect,useMemo,useRef,useState} from 'react';
import {BookOpen,Bookmark,Check,Copy,Search,SlidersHorizontal,ArrowRight,Trash2,Sparkles,FolderHeart} from 'lucide-react';
import {PROMPT_CATEGORIES,PROMPT_SHELVES,isPhotoTemplate,fillTemplate,promptLang,type PromptTemplate} from './PromptLibrary';
import {DEFAULT_CONTROLS,composeCreativePrompt,type PromptControls} from './PromptEngine';
import {api} from './platform/client';
type Brand={id:string;name:string;language:string;background:string;rules:string};
type Saved={id:string;brandId:string;title:string;text:string;rawInstruction?:string;settings?:PromptControls;favorite?:boolean;updatedAt?:string};
type Props={brand:Brand;locale:'es'|'en';onUse:(draft:string,settings:PromptControls)=>void;notify:(s:string)=>void;showError:(e:unknown)=>void};
const getError=(e:unknown)=>e instanceof Error?e.message:'No se pudo completar la acción.';
export default function PromptStudio({brand,locale,onUse,notify,showError}:Props){
 const language=locale,contentLanguage=promptLang(brand.language),en=language==='en';
 const editorRef=useRef<HTMLElement|null>(null),manualRef=useRef<HTMLTextAreaElement|null>(null);
 const moveToEditor=()=>{requestAnimationFrame(()=>{editorRef.current?.scrollIntoView({behavior:'smooth',block:'start'});manualRef.current?.focus({preventScroll:true})})};
 const [query,setQuery]=useState(''),[category,setCategory]=useState('');
 const [limit,setLimit]=useState(6),[selectedKind,setSelectedKind]=useState<'photo'|'text'>('photo');
 const [mode,setMode]=useState<'library'|'saved'>('library'),[expanded,setExpanded]=useState(false);
 const [settings,setSettings]=useState<PromptControls>(DEFAULT_CONTROLS);
 const [manual,setManual]=useState('');
 const [customTitle,setCustomTitle]=useState('');
 const [saved,setSaved]=useState<Saved[]>([]);
 const [templates,setTemplates]=useState<PromptTemplate[]>([]);
 const [busy,setBusy]=useState(false),[loadError,setLoadError]=useState('');
 const [copied,setCopied]=useState(false);
 const update=<K extends keyof PromptControls,>(key:K,v:PromptControls[K])=>setSettings(s=>({...s,[key]:v}));
 useEffect(()=>{setSettings({...DEFAULT_CONTROLS,environment:brand.background||''});setManual('');setCategory('');setMode('library');setLimit(6);setSelectedKind('photo')},[brand.id]);
 const load=async()=>{
  try{
   setLoadError('');
   const [savedResult,templateResult]=await Promise.all([api.get('/api/prompts'),api.get('/api/prompt-templates')]);
   setSaved((savedResult.data||[]).filter((item:Saved)=>item.brandId===brand.id));
   setTemplates(templateResult.data||[]);
  }catch(e){setLoadError(getError(e))}
 };
 useEffect(()=>{void load()},[brand.id]);
 const select=(p:PromptTemplate)=>{
  setManual(fillTemplate(p.body[contentLanguage],{subject:settings.subject,background:settings.environment}));
  setCustomTitle(p.title[language]);setSelectedKind(isPhotoTemplate(p.category)?'photo':'text');setMode('library');moveToEditor();
 };
 const compiled=useMemo(()=>selectedKind==='text'?manual:composeCreativePrompt({...settings,instruction:manual||settings.instruction},contentLanguage),[settings,manual,contentLanguage,selectedKind]);
 const shown=templates.filter(p=>(!category||(category==='photos'?isPhotoTemplate(p.category):p.category===category)) &&
  (p.title[language]+' '+p.body[language]+' '+p.category).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const filteredSaved=saved.filter(p=>(p.title+' '+p.text).toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite));
 const copy=async(t:string)=>{
  try{await navigator.clipboard.writeText(t);setCopied(true);setTimeout(()=>setCopied(false),1300);notify(en?'Prompt copied.':'Prompt copiado.');}
  catch{notify(en?'Copy is unavailable; select the text below.':'No se pudo copiar; selecciona el texto de abajo.');}
 };
 const save=async()=>{
  if(!compiled.trim())return;
  setBusy(true);
  try{
   if(saved.length>=100)throw Error('Límite de 100 prompts guardados por marca. Elimina uno antes de continuar.');
   const {data}=await api.post('/api/prompts',{brandId:brand.id,title:(customTitle.trim()||(en?'My photography prompt':'Mi prompt fotográfico')).slice(0,100),text:compiled,rawInstruction:manual,settings});
   setSaved(s=>[data,...s]);notify(en?'Saved privately to this brand.':'Guardado de forma privada en esta marca.');
  }catch(e){showError(e)}finally{setBusy(false)}
 };
 const remove=async(id:string)=>{
  if(!confirm(en?'Delete this saved prompt?':'¿Eliminar este prompt guardado?'))return;
  try{await api.delete('/api/prompts/'+id);setSaved(s=>s.filter(p=>p.id!==id))}catch(e){showError(e)}
 };
 const favorite=async(item:Saved)=>{
  try{const {data}=await api.put('/api/prompts/'+item.id,{favorite:!item.favorite});setSaved(s=>s.map(p=>p.id===item.id?data:p));}
  catch(e){showError(e)}
 };
 const useSaved=(item:Saved)=>{
  if(item.settings)setSettings(item.settings);
  setManual(item.rawInstruction??item.text);setCustomTitle(item.title);setSelectedKind(item.rawInstruction?.includes('ENCARGO PARA ADAPTAR')?'text':'photo');setMode('library');moveToEditor();
 };
 return <section className="ps-wrap" aria-label="Prompt Studio">
  <header className="ps-hero">
   <div><span className="eyebrow">{en?'PROMPT STUDIO':'ESTUDIO DE PROMPTS'}</span>
    <h1>{en?'The creative prompt library':'Biblioteca de prompts'}</h1>
    <p>{en?'Pick a category. Edit, copy and use without long lists.':'Elige una categoría, edita y copia. Todo organizado, sin listas largas.'}</p>
   </div><div className="ps-count"><strong>{templates.length}</strong><span>{en?'ideas':'ideas'}</span></div>
  </header>
  <div className="ps-tabs" role="group" aria-label="Prompt tabs">
   <button className={mode==='library'?'active':''} onClick={()=>setMode('library')}><BookOpen size={17}/>{en?'Prompt library':'Biblioteca de prompts'}</button>
   <button className={mode==='saved'?'active':''} onClick={()=>setMode('saved')}><FolderHeart size={17}/>{en?'My saved prompts':'Mis prompts guardados'} ({saved.length})</button>
  </div>
  <div className="ps-layout">
   <div className="ps-main">
    <div className="ps-search"><Search size={17}/><input aria-label={en?'Search prompts':'Buscar prompts'} placeholder={en?'Find a scene, style or industry…':'Busca una escena, estilo o industria…'} value={query} onChange={e=>setQuery(e.target.value)}/></div>
    {mode==='library'?<>
      {!category&&!query.trim()?<div className="ps-shelves">{PROMPT_SHELVES.map(shelf=>{
       const count=templates.filter(p=>shelf.id==='photos'?isPhotoTemplate(p.category):p.category===shelf.id).length;
       return count?<button type="button" key={shelf.id} className="ps-shelf" onClick={()=>{setCategory(shelf.id);setLimit(6)}}>
        <span className="ps-shelf-symbol">{shelf.icon}</span>
        <strong>{shelf.id==='photos'?(en?'Photography':'Fotografía'):PROMPT_CATEGORIES[shelf.id]?.[en?1:0]}</strong>
        <small>{shelf.subtitle[en?1:0]}</small>
        <span className="ps-shelf-count">{count} prompts · {en?'Open':'Abrir'}</span>
       </button>:null;
      })}</div>:<>
      <div className="ps-category-back"><button type="button" onClick={()=>{setCategory('');setQuery('');setLimit(6)}}>← {en?'Categories':'Categorías'}</button>
       <strong>{category?(category==='photos'?(en?'Photography':'Fotografía'):PROMPT_CATEGORIES[category]?.[en?1:0]):(en?'Search results':'Resultados')}</strong>
       <small>{shown.length} prompts</small></div>
      <div className="ps-recipe-list ps-recipe-cards">{shown.length?shown.slice(0,limit).map(p=><article className="ps-recipe" key={p.id}>
       <span className="ps-recipe-index">{p.id.startsWith('drive-')?p.id.split('-').at(-1):p.id}</span>
       <div><strong>{p.title[language]}</strong><small>{PROMPT_CATEGORIES[p.category]?.[en?1:0]||p.category}</small>
        <details className="ps-recipe-example"><summary>{en?'Read prompt':'Ver prompt'}</summary><p>{p.body[language]}</p></details></div>
       <button className="ps-recipe-use" type="button" onClick={()=>select(p)}>{en?'Use':'Usar'}</button>
      </article>):<p>{en?'No results':'No hay resultados'}</p>}</div>
      {shown.length>limit&&<button type="button" className="ps-load-more" onClick={()=>setLimit(n=>n+6)}>{en?'Show 6 more':'Ver 6 más'} ({shown.length-limit})</button>}
      </>}
      </>:<div className="ps-recipe-list">
     {loadError&&<p role="alert">{loadError}<button onClick={load}>↻</button></p>}
     {filteredSaved.length?filteredSaved.map(p=><article className="ps-recipe" key={p.id}>
       <button type="button" className={'ps-fave '+(p.favorite?'active':'')} aria-label={en?'Favorite':'Favorito'} onClick={()=>favorite(p)}><Bookmark size={17}/></button>
       <div><strong>{p.title}</strong><small>{brand.name}</small><p>{p.text.slice(0,240)}{p.text.length>240?'…':''}</p></div>
       <div className="ps-saved-actions"><button onClick={()=>useSaved(p)}>{en?'Edit / use':'Editar / usar'}</button><button aria-label={en?'Delete saved prompt':'Eliminar prompt'} onClick={()=>remove(p.id)}><Trash2 size={15}/></button></div>
     </article>):<p>{en?'No saved prompts for this brand yet. Create and save your first recipe.':'Todavía no hay prompts guardados para esta marca. Crea y guarda tu primera receta.'}</p>}
    </div>}
   </div>
   <aside className="ps-builder" ref={editorRef} id="prompt-editor" aria-label={en?'Edit prompt':'Editar prompt'}>
    <div className="ps-builder-header"><Sparkles size={19}/><div><strong>{selectedKind==='text'?(en?'Personalize your prompt':'Personaliza tu prompt'):(en?'Edit your idea':'Edita tu idea')}</strong><small>{en?'Choose a recipe below or write your own':'Elige una receta abajo o escribe la tuya'}</small></div></div>
    {selectedKind==='photo'&&<><label>{en?'What are we photographing?':'¿Qué vamos a fotografiar?'}<input value={settings.subject} onChange={e=>update('subject',e.target.value)} placeholder={en?'Your real product, portrait or service':'Tu producto, retrato o servicio real'}/></label>
    <label>{en?'Where should it be?':'¿Dónde quieres la escena?'}<input value={settings.environment} onChange={e=>update('environment',e.target.value)} placeholder={en?'Warm ivory studio, daylight cafe…':'Estudio ivory, cafetería con luz natural…'}/></label>
    </>}
    <label>{en?'Describe what you want (your own prompt)':'Escribe lo que tú quieras (prompt libre)'}
     <textarea ref={manualRef} rows={4} value={manual} onChange={e=>setManual(e.target.value)} placeholder={selectedKind==='text'?'Adapta las instrucciones a tu negocio y al público.':en?'Describe the photo in your own words. Your instructions always go first.':'Describe la foto con tus palabras. Tus instrucciones siempre van primero.'}/></label>
    {selectedKind==='photo'&&<><details className="ps-optional-controls"><summary>{en?'More creative settings':'Ajustes de estilo'}</summary><div className="ps-control-grid">
      <label>{en?'Visual mood':'Estilo visual'}<select value={settings.style} onChange={e=>update('style',e.target.value as PromptControls['style'])}>
       {Object.entries({'real-life':en?'Natural':'Natural realista',studio:en?'Studio':'Estudio',editorial:'Editorial',luxury:en?'Luxury':'Lujo',bold:'Bold',minimal:'Minimal'}).map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select></label>
      <label>{en?'Camera shot':'Tipo de toma'}<select value={settings.shot} onChange={e=>update('shot',e.target.value as PromptControls['shot'])}>
       {Object.entries({auto:en?'Automatic':'Automática',portrait:en?'Portrait':'Retrato',closeup:'Close-up',flatlay:'Flat lay',hands:en?'Hands':'Manos',wide:en?'Wide':'Amplia'}).map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select></label>
      <label>{en?'Lighting':'Iluminación'}<select value={settings.lighting} onChange={e=>update('lighting',e.target.value as PromptControls['lighting'])}>
       {Object.entries({daylight:en?'Natural light':'Luz natural',softbox:'Softbox','golden-hour':'Golden hour',moody:en?'Moody':'Dramática'}).map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select></label>
      <label>{en?'Reference consistency':'Fidelidad a referencia'}<select value={settings.fidelity} onChange={e=>update('fidelity',e.target.value as PromptControls['fidelity'])}>
       <option value="strict">{en?'Prioritize fidelity':'Priorizar fidelidad'}</option><option value="balanced">{en?'Creative balance':'Balance creativo'}</option>
      </select></label>
    </div></details>
    <button className="ps-advanced-toggle" type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}><SlidersHorizontal size={16}/> {expanded?(en?'Hide advanced':'Ocultar avanzado'):(en?'Advanced / avoid':'Avanzado / evitar')}</button>
    {expanded&&<label>{en?'Avoid (negative instructions)':'Evitar (instrucciones negativas)'}
     <textarea rows={3} value={settings.avoid} onChange={e=>update('avoid',e.target.value)} placeholder={en?'No fake labels, no waxy skin, no distorted hands…':'Sin etiquetas falsas, piel plástica ni manos deformadas…'}/></label>}
    </>}
    <details className="ps-output"><summary>{en?'Preview full prompt':'Ver prompt completo'} · {compiled.length} {en?'characters':'caracteres'}</summary><div><strong>{en?'Full prompt':'Prompt completo'}</strong></div>
     <textarea aria-label="Prompt final" rows={7} value={compiled} readOnly onFocus={e=>e.currentTarget.select()}/>
     <small>{en?'We preserve your instructions first. Realism is guidance, not a guarantee; exact logos and faces are best kept as original image layers.':'Tus instrucciones van primero. El realismo es una guía, no una garantía; logos y rostros exactos se conservan mejor como capas originales.'}</small>
    </details>
    <label>{en?'Save as':'Nombre para guardar'}<input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder={en?'My favorite prompt':'Mi prompt favorito'} maxLength={100}/></label>
    <div className="ps-actions">
     <button type="button" className="btn ghost" onClick={()=>copy(compiled)}><Copy size={16}/>{copied?'✓':en?'Copy':'Copiar'}</button>
     <button type="button" className="btn ghost" disabled={busy} onClick={save}><Bookmark size={16}/>{en?'Save':'Guardar'}</button>
     {selectedKind==='photo'?<button type="button" className="btn dark" onClick={()=>onUse(compiled,{...settings,instruction:manual})}>{en?'Continue to create':'Continuar a crear'}</button>
        :<a className="btn dark" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">{en?'Open ChatGPT':'Abrir ChatGPT'} ↗</a>}
    </div>
   </aside>
  </div>
 </section>
}
