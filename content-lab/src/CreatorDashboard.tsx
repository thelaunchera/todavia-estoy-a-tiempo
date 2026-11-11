import {useMemo} from 'react';
import {ArrowRight, BookOpen, ChevronRight, FolderOpen, Layers3, Lightbulb, Plus, Sparkles} from 'lucide-react';
import {readCarouselDesign} from './CarouselArtDirection';
import ProjectCover,{type CoverPost} from './ProjectCover';
import type {Brand as CarouselBrand} from './CarouselFactory';
import type {LibraryAsset} from './MediaAsset';
import {DashboardIllustration} from './DashboardIllustration';
import './CreatorDashboard.css';

export type CreatorDashboardPost = CoverPost & {angle:string;status:string};
type DashboardBrand=CarouselBrand;
type Props = {
  locale:'es'|'en';
  brand:DashboardBrand;
  posts:CreatorDashboardPost[];
  library:LibraryAsset[];
  images:Record<string,string>;
  loadImage:(assetId:string)=>void|Promise<unknown>;
  onNewNormal:()=>void;
  onNewSeamless:()=>void;
  onNewPost:(angle?:string)=>void;
  onNewStory:()=>void;
  onEditPost:(post:CreatorDashboardPost)=>void;
  onNavigate:(tab:'posts'|'media'|'stickers'|'backgrounds'|'prompts'|'idea-bank'|'calendar'|'brands')=>void;
  onEditBrand:()=>void;
};
const safeDate=(date?:string)=>{
 const n=Date.parse(date||'');
 return Number.isFinite(n)?n:0;
};
function postKind(post:CreatorDashboardPost):'normal'|'seamless'|'post'|'story'{
 if(post.format==='Story'||post.format==='Reel')return 'story';
 if(post.format==='Carousel'){
  return readCarouselDesign(post.designData||'').style.seamlessEnabled?'seamless':'normal';
 }
 return 'post';
}
export default function CreatorDashboard({
 locale,brand,posts,library,images,loadImage,onNewNormal,onNewSeamless,onNewPost,
 onNewStory,onEditPost,onNavigate,onEditBrand
}:Props){
 const es=locale==='es';
 const recent=useMemo(()=>posts.map((post,index)=>({post,index}))
  .sort((a,b)=>safeDate(b.post.updatedAt)-safeDate(a.post.updatedAt)||b.index-a.index)
  .slice(0,4),[posts]);
 const formats=[
  {key:'normal',title:es?'Normal':'Normal',detail:es?'Slides independientes':'Separate slides',eyebrow:'CAROUSEL · 4:5',go:onNewNormal},
  {key:'seamless',title:'Seamless',detail:es?'Diseño continuo':'Continuous canvas',eyebrow:'CAROUSEL · 4:5',go:onNewSeamless},
  {key:'post',title:es?'Post individual':'Single post',detail:es?'Una idea, una imagen':'One idea, one image',eyebrow:'POST · 4:5',go:()=>onNewPost()},
  {key:'story',title:es?'Historia':'Story',detail:es?'Formato vertical':'Vertical format',eyebrow:'STORY · 9:16',go:onNewStory}
 ] as const;
 // Shared artwork, never photos from a customer's library.
 const formatArtwork={normal:'carousel',seamless:'seamless',post:'post',story:'story'} as const;
 const formatLabel=(post:CreatorDashboardPost)=>{
  const kind=postKind(post);
  return kind==='seamless'?'Seamless':kind==='normal'?(es?'Carrusel normal':'Carousel'):
   kind==='story'?(es?'Historia / Reel':'Story / Reel'):'Post';
 };
 const ideaActions=[
  {label:es?'Enseñar algo':'Teach something',angle:'Educational',icon:BookOpen},
  {label:es?'Resolver un problema':'Solve a problem',angle:'Pain point',icon:Lightbulb},
  {label:es?'Antes y después':'Before and after',angle:'Before / after',icon:Layers3},
  {label:es?'Algo cercano':'Something relatable',angle:'POV / Relatable',icon:Sparkles}
 ];
 return <div className={"cld"+(recent.length?" cld-has-recents":"")} id="lab-dashboard" aria-label={es?'Tu espacio creativo':'Your creative workspace'}>
  <section className="cld-intro">
   <div className="cld-intro-copy">
    <span className="cld-eyebrow"><span className="cld-eyebrow-dot"/> THE CONTENT LAB · WORKSPACE</span>
    <h1>{es?'¿Qué vamos a':'What shall we'} <em>{es?'crear?':'create?'}</em></h1>
    <p>{es?'Elige un formato, dale vida a tu idea y continúa donde lo dejaste.':'Choose a format, bring your idea to life, and pick up where you left off.'}</p>
    {recent.length===0&&<button type="button" className="cld-hero-action" onClick={onNewNormal}>
      <span>{es?'Crear mi primer diseño':'Create my first design'}</span><ArrowRight size={17}/>
    </button>}
   </div>
   <button type="button" className="cld-brand-pill" onClick={onEditBrand} aria-label={es?'Editar mi marca':'Edit my brand'}>
    <span className="cld-brand-avatar" style={{backgroundColor:brand.color||'#F2D85B'}}>{brand.name?.slice(0,1).toUpperCase()}</span>
    <span><small>{es?'MI MARCA':'MY BRAND'}</small><strong>{brand.name}</strong></span><ChevronRight size={16}/>
   </button>
  </section>
  <section className="cld-create-section" id="lab-create-start">
   <div className="cld-section-heading">
    <div><span className="cld-section-kicker">{es?'EMPEZAR':'START HERE'}</span><h2>{es?'Crea algo nuevo':'Create something new'}</h2></div>
    <span className="cld-section-aside">{es?'Tu idea empieza aquí':'Your next idea starts here'}</span>
   </div>
   <div className="cld-format-grid">
    {formats.map((item,index)=><button type="button" key={item.key} className={'cld-format-card cld-format-'+item.key} onClick={item.go} aria-label={(es?'Crear ':'Create ')+item.title}>
     <span className={'cld-format-art cld-art-'+item.key} aria-hidden="true">
      <DashboardIllustration className="cld-format-illustration" name={formatArtwork[item.key]} size={134}/>
     </span>
     <span className="cld-format-meta">{item.eyebrow}</span>
     <span className="cld-format-name">{item.title}<span className="cld-format-plus"><Plus size={16}/></span></span>
     <span className="cld-format-desc">{item.detail}</span>
    </button>)}
   </div>
  </section>
  <section className="cld-recents-section" aria-label={es?'Creaciones recientes':'Recent designs'}>
   <div className="cld-section-heading">
    <div><span className="cld-section-kicker">{es?'TUS PROYECTOS':'YOUR PROJECTS'}</span><h2>{es?'Tus diseños recientes':'Your recent designs'}</h2></div>
    <button type="button" className="cld-textlink" onClick={()=>onNavigate('posts')}>{es?'Ver proyectos':'View projects'}<ArrowRight size={16}/></button>
   </div>
   {recent.length>0?<div className="cld-project-grid">
    {recent.map(({post},index)=>{
     const kind=postKind(post);
     return <button type="button" key={post.id||'recent-'+index} className="cld-project-card" onClick={()=>onEditPost(post)} aria-label={(es?'Continuar ':'Continue ')+(post.title||formatLabel(post))}>
      <span className={'cld-project-cover cld-project-'+kind}>
       <ProjectCover post={post} brand={brand} images={images} loadImage={loadImage} locale={locale}/>
       <span className="cld-cover-action"><ArrowRight size={17}/></span>
      </span>
      <span className="cld-project-copy"><strong>{post.title||(es?'Sin título':'Untitled')}</strong><small>{formatLabel(post)} · {es?(post.status==='Ready'?'Listo':'En progreso'):(post.status==='Ready'?'Ready':'In progress')}</small></span>
     </button>
    })}
   </div>:<div className="cld-empty-project">
     <span className="cld-empty-icon"><FolderOpen size={23}/></span>
     <div><strong>{es?'Tu próximo diseño empieza aquí.':'Your next design starts here.'}</strong><p>{es?'Crea algo nuevo y aparecerá en este espacio para continuar después.':'Create a design and it will show up here for you to continue later.'}</p></div>
     <button type="button" className="cld-dark-cta" onClick={onNewNormal}><Plus size={16}/>{es?'Crear mi primero':'Create my first'}</button>
    </div>}
  </section>
  <section className="cld-resources-section">
   <div className="cld-section-heading">
    <div><span className="cld-section-kicker">{es?'TU ESPACIO CREATIVO':'YOUR WORKSPACE'}</span><h2>{es?'Todo en un solo lugar':'Everything in one place'}</h2></div>
    <button type="button" className="cld-textlink" onClick={()=>onNavigate('media')}>{es?'Abrir biblioteca':'Open library'}<ArrowRight size={16}/></button>
   </div>
   <div className="cld-resource-grid">
    <button type="button" className="cld-resource-card cld-resource-media" onClick={()=>onNavigate('media')}>
     <span className="cld-resource-icon"><DashboardIllustration name="media" size={39}/></span><strong>{es?'Mis fotografías':'My photos'}</strong><small>{es?'Tus imágenes y archivos':'Your images and files'}</small>
     <span className="cld-resource-feature" aria-hidden="true">
      <DashboardIllustration name="media" size={92}/>
     </span>
    </button>
    <button type="button" className="cld-resource-card cld-resource-elements" onClick={()=>onNavigate('stickers')}>
     <span className="cld-resource-icon"><DashboardIllustration name="stickers" size={39}/></span><strong>{es?'Stickers y elementos':'Stickers & elements'}</strong><small>{es?'Detalles para diseñar':'Details for your designs'}</small>
     <span className="cld-resource-feature" aria-hidden="true"><DashboardIllustration name="stickers" size={92}/></span>
    </button>
    <button type="button" className="cld-resource-card cld-resource-prompts" onClick={()=>onNavigate('prompts')}>
     <span className="cld-resource-icon"><DashboardIllustration name="prompts" size={39}/></span><strong>{es?'Biblioteca de prompts':'Prompt library'}</strong><small>{es?'Ideas para crear mejor':'Ideas to create better'}</small>
     <span className="cld-resource-feature" aria-hidden="true"><DashboardIllustration name="prompts" size={92}/></span>
    </button>
    <button type="button" className="cld-resource-card cld-resource-brand" onClick={onEditBrand}>
     <span className="cld-resource-icon"><DashboardIllustration name="brand" size={39}/></span><strong>{es?'Mi Brand Kit':'My Brand Kit'}</strong><small>{es?'Colores y estilo de marca':'Brand colors and style'}</small>
     <span className="cld-resource-feature" aria-hidden="true"><DashboardIllustration name="brand" size={92}/></span>
    </button>
   </div>
  </section>
  <section className="cld-bottom-panel" aria-label={es?'Ideas y organización':'Ideas and planning'}>
   <div className="cld-inspiration"><span className="cld-inspiration-icon"><DashboardIllustration name="stickers" size={31}/></span><span className="cld-section-kicker">{es?'¿NECESITAS UNA IDEA?':'NEED AN IDEA?'}</span><h3>{es?'La inspiración también se diseña.':'Inspiration is part of the process.'}</h3><div className="cld-inspiration-actions">
    {ideaActions.map(a=><button type="button" key={a.angle} onClick={()=>onNewPost(a.angle)}><a.icon size={15}/>{a.label}</button>)}
   </div><button type="button" className="cld-textlink" onClick={()=>onNavigate('idea-bank')}>{es?'Explorar banco de ideas':'Browse idea bank'}<ArrowRight size={15}/></button></div>
   <div className="cld-planning"><DashboardIllustration name="calendar" size={46}/><h3>{es?'Tu contenido, organizado.':'Your content, organized.'}</h3><p>{es?'Planifica lo que vas a publicar sin salir de tu espacio creativo.':'Plan what you will publish without leaving your creative space.'}</p><button type="button" onClick={()=>onNavigate('calendar')}>{es?'Abrir calendario':'Open calendar'}<ArrowRight size={16}/></button></div>
  </section>
  <details className="cld-activity"><summary>{es?'Ver actividad de esta marca':'View brand activity'}<ChevronRight size={15}/></summary>
   <div className="cld-activity-stats">
    <span><strong>{posts.length}</strong><small>{es?'Diseños':'Designs'}</small></span>
    <span><strong>{posts.filter(p=>p.status==='Draft'||p.status==='Idea').length}</strong><small>{es?'En progreso':'In progress'}</small></span>
    <span><strong>{posts.filter(p=>p.status==='Ready').length}</strong><small>{es?'Listos':'Ready'}</small></span>
    <span><strong>{library.length}</strong><small>{es?'Recursos':'Assets'}</small></span>
   </div>
  </details>
 </div>;
}