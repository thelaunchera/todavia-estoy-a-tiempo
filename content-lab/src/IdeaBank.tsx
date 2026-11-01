import {useEffect,useMemo,useState} from 'react';
import {BookOpen,Copy,Check,Lightbulb,Sparkles,Search,ArrowRight} from 'lucide-react';

export type Idea={title:string;hook:string;angle:string;brief:string;category:string};
const ideas:Idea[]=[
{category:'Educativo',title:'3 errores comunes',hook:'3 errores que te están complicando [resultado]',angle:'Educational',brief:'Explica tres errores reales de tu audiencia y cómo resolverlos con pasos sencillos.'},
{category:'Educativo',title:'Una mejora rápida',hook:'Haz esto antes de volver a [tarea]',angle:'Educational',brief:'Comparte un consejo accionable en menos de un minuto.'},
{category:'Educativo',title:'Mito o realidad',hook:'No necesitas [mito] para conseguir [resultado]',angle:'Educational',brief:'Desmonta una creencia habitual con un ejemplo honesto.'},
{category:'Educativo',title:'Mini tutorial',hook:'Así lo hago paso a paso, sin complicarme',angle:'Educational',brief:'Desglosa un proceso pequeño en cuatro pasos claros.'},
{category:'Problema real',title:'El detalle que frustra',hook:'¿También te pasa esto con [problema]?',angle:'Pain point',brief:'Describe una frustración reconocible y una solución práctica.'},
{category:'Problema real',title:'Antes de comprar',hook:'Si estás pensando en [producto], lee esto',angle:'Pain point',brief:'Responde la objeción principal sin presionar por la compra.'},
{category:'Problema real',title:'Tiempo perdido',hook:'Lo que más tiempo te quita no siempre es [tarea]',angle:'Pain point',brief:'Conecta el trabajo manual con una alternativa más organizada.'},
{category:'Problema real',title:'Señal de cambio',hook:'Si te pasa esto, es hora de cambiar tu sistema',angle:'Pain point',brief:'Muestra una señal concreta de desorganización y cómo resolverla.'},
{category:'Historia',title:'Lo que aprendí',hook:'Ojalá hubiera sabido esto cuando empecé',angle:'Storytelling',brief:'Cuenta una lección personal auténtica sin inventar experiencias.'},
{category:'Historia',title:'Pequeño progreso',hook:'No fue perfecto, pero fue un avance',angle:'Storytelling',brief:'Muestra una mejora real y la reflexión que deja.'},
{category:'Historia',title:'Detrás de cámaras',hook:'Esto es lo que no ves cuando preparo [producto]',angle:'Storytelling',brief:'Explica una parte del proceso con fotografías propias.'},
{category:'Historia',title:'Decisión de marca',hook:'Por qué decidí hacer las cosas de otra manera',angle:'Storytelling',brief:'Comparte un principio concreto que distingue tu trabajo.'},
{category:'Producto',title:'Antes y después',hook:'La diferencia está en estos detalles',angle:'Before / after',brief:'Presenta un cambio visual real sin exagerar resultados.'},
{category:'Producto',title:'Cómo usarlo',hook:'Una forma sencilla de aprovechar [producto]',angle:'Product spotlight',brief:'Explica un uso y beneficio específico del producto.'},
{category:'Producto',title:'Preguntas frecuentes',hook:'Me preguntan mucho esto sobre [producto]',angle:'Educational',brief:'Responde una pregunta habitual con claridad y una prueba real.'},
{category:'Producto',title:'Valor real',hook:'Esto es lo que incluye (y lo que no)',angle:'Product spotlight',brief:'Explica con transparencia las características y límites de la oferta.'},
{category:'Comunidad',title:'Pregunta abierta',hook:'Quiero saber algo: ¿qué te cuesta más de [tarea]?',angle:'POV / Relatable',brief:'Invita a responder sin prometer resultados.'},
{category:'Comunidad',title:'A o B',hook:'¿Cuál de estas dos opciones elegirías?',angle:'POV / Relatable',brief:'Haz una comparación visual relevante y pide una opinión.'},
{category:'Comunidad',title:'Algo que compartimos',hook:'Si trabajas en [sector], esto te va a sonar',angle:'POV / Relatable',brief:'Describe una situación cotidiana muy reconocible para tu audiencia.'},
{category:'Comunidad',title:'Una conversación',hook:'Hablemos de algo que casi nadie explica',angle:'POV / Relatable',brief:'Abre una conversación útil con una pregunta específica.'}
];
const englishIdeas:Pick<Idea,'title'|'hook'|'brief'>[]=[
  {
    "title": "3 common mistakes",
    "hook": "3 mistakes that make [result] harder than it needs to be",
    "brief": "Explain three real audience mistakes and simple fixes."
  },
  {
    "title": "One quick improvement",
    "hook": "Do this before your next [task]",
    "brief": "Share a useful, actionable tip in under one minute."
  },
  {
    "title": "Myth or fact",
    "hook": "You do not need [myth] to achieve [result]",
    "brief": "Challenge a common misconception with a realistic example."
  },
  {
    "title": "Mini tutorial",
    "hook": "Here's how I do it, step by step",
    "brief": "Break a small process into four clear steps."
  },
  {
    "title": "The frustrating detail",
    "hook": "Does [problem] happen to you too?",
    "brief": "Describe a familiar frustration and a practical fix."
  },
  {
    "title": "Before you buy",
    "hook": "Thinking about [product]? Read this first",
    "brief": "Answer the biggest buying concern without pressure."
  },
  {
    "title": "Time you lose",
    "hook": "The biggest time drain is not always [task]",
    "brief": "Connect repetitive work to a more organized alternative."
  },
  {
    "title": "Time for a change",
    "hook": "If this sounds familiar, your workflow needs a change",
    "brief": "Show a concrete sign of disorganization and how to solve it."
  },
  {
    "title": "What I learned",
    "hook": "I wish I'd known this when I started",
    "brief": "Share a true personal lesson without inventing an experience."
  },
  {
    "title": "Small progress",
    "hook": "It wasn't perfect, but it was progress",
    "brief": "Show a real improvement and the lesson behind it."
  },
  {
    "title": "Behind the scenes",
    "hook": "Here's what you don't see when I prepare [product]",
    "brief": "Show a real part of the process with your own photos."
  },
  {
    "title": "A brand decision",
    "hook": "Why I chose to do things differently",
    "brief": "Explain a real brand principle that shapes your work."
  },
  {
    "title": "Before and after",
    "hook": "The difference is in these details",
    "brief": "Show an authentic visual improvement without exaggeration."
  },
  {
    "title": "How to use it",
    "hook": "A simple way to get more from [product]",
    "brief": "Explain one specific use and benefit."
  },
  {
    "title": "Frequently asked",
    "hook": "I get this question about [product] a lot",
    "brief": "Answer one common question with clear, real evidence."
  },
  {
    "title": "Real value",
    "hook": "Here's what's included (and what isn't)",
    "brief": "Explain the offer and its limitations transparently."
  },
  {
    "title": "Ask the audience",
    "hook": "Quick question: what's hardest about [task]?",
    "brief": "Invite honest responses without promising a result."
  },
  {
    "title": "A or B?",
    "hook": "Which one would you choose?",
    "brief": "Compare two meaningful visual options and ask for feedback."
  },
  {
    "title": "We've all been there",
    "hook": "If you work in [industry], you'll know this feeling",
    "brief": "Describe an everyday situation that resonates with your audience."
  },
  {
    "title": "Start a conversation",
    "hook": "Let's talk about something nobody explains",
    "brief": "Ask one specific, useful question to start a discussion."
  }
];
const englishCategories:Record<string,string>={Educativo:'Educational','Problema real':'Real problems',Historia:'Stories',Producto:'Product',Comunidad:'Community'};
type Props={brandName:string;audience:string;language:string;locale?:'es'|'en';onUse:(idea:Idea)=>void};
export default function IdeaBank({brandName,audience,language,locale='es',onUse}:Props){
 const en=locale==='en';
 const [category,setCategory]=useState('Todas'),[search,setSearch]=useState(''),[offer,setOffer]=useState(''),[goal,setGoal]=useState('conectar'),[copied,setCopied]=useState('');
 const localIdeas=useMemo(()=>ideas.map((idea,i)=>language==='English'?{...idea,...englishIdeas[i],category:en?englishCategories[idea.category]||idea.category:idea.category}:{...idea,category:en?englishCategories[idea.category]||idea.category:idea.category}),[en,language]);
 const allLabel=en?'All':'Todas';
 useEffect(()=>{setCategory(en?'All':'Todas')},[en]);
 const categories=[allLabel,...Array.from(new Set(localIdeas.map(i=>i.category)))];
 const filtered=useMemo(()=>localIdeas.filter(i=>(category===allLabel||!categories.includes(category)||i.category===category)&&(i.title+' '+i.hook+' '+i.brief).toLowerCase().includes(search.toLowerCase())),[localIdeas,category,search,allLabel]);
 const goalEnglish:Record<string,string>={conectar:'build a connection',educar:'educate','mostrar mi producto':'show my product','invitar a comprar sin presión':'invite someone to buy without pressure'};
 const prompt=(idea:Idea)=>{
  const contentLanguage=language==='English'?'natural US English':'natural Latin American Spanish';
  if(en)return 'Act as a content strategist for '+brandName+'. Create ORIGINAL content for my audience: '+(audience||'my ideal customer')+'. Content language: '+contentLanguage+'. What I offer: '+(offer.trim()||'[describe your product or service]')+'. Goal: '+(goalEnglish[goal]||goal)+'. Idea: '+idea.title+'. Opening hook: "'+idea.hook+'". Direction: '+idea.brief+'. Give me three short alternative hooks, a single-post outline, a five-slide carousel structure when appropriate, a static reel-cover concept, a short caption and a clear CTA. Do not invent reviews, sales data, benefits or personal stories. Use specific, human language with no generic AI phrases. Make the idea instantly understandable. Do not generate images: I will use my own photos in Content Lab.';
  return 'Actúa como estratega de contenido para '+brandName+'. Crea una propuesta ORIGINAL para mi audiencia: '+(audience||'mi público ideal')+'. Idioma del contenido: '+contentLanguage+'. Lo que vendo u ofrezco: '+(offer.trim()||'[describe aquí tu producto o servicio]')+'. Mi objetivo: '+goal+'. Idea: '+idea.title+'. Hook inicial: "'+idea.hook+'". Dirección: '+idea.brief+'. Devuélveme tres hooks cortos, estructura de post, guion de cinco slides si aplica, portada estática de reel, caption breve y CTA claro. No inventes testimonios, ventas ni experiencias personales. Usa un tono humano y específico, sin frases genéricas. No generes imágenes; usaré mis fotos en Content Lab.';
 };
 const copy=async(idea:Idea)=>{try{await navigator.clipboard.writeText(prompt(idea));setCopied(idea.title)}catch{setCopied('')}};
 return <section className="panel" aria-label={en?'AI idea bank':'Banco de ideas con IA'} style={{maxWidth:1150,margin:'0 auto'}}>
   <div className="eyebrow">{en?'INSPIRATION FOR YOUR BRAND':'INSPIRACIÓN PARA TU MARCA'}</div>
   <h1 style={{fontSize:'clamp(27px,4vw,46px)',margin:'10px 0'}}>{en?'Idea bank':'Banco de ideas'} <em>+ {en?'AI':'IA'}.</em></h1>
   <p>{en?'Choose an idea, adapt it to your business, and design with your own photos. Copy a prompt to use in ChatGPT. No AI image generation is included.':'Elige una idea, adáptala a tu negocio y diseña con tus propias fotos. Copia un prompt para desarrollarla en ChatGPT. No incluye generación de fotografías con IA.'}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,margin:'20px 0'}}>
     <label>{en?'What do you sell or share?':'¿Qué vendes o comunicas?'}<input value={offer} onChange={e=>setOffer(e.target.value)} placeholder={en?'e.g. cleaning service, matcha, online course':'Ej. servicio de limpieza, matcha, curso'} maxLength={160}/></label>
     <label>{en?'Content goal':'Objetivo del contenido'}<select value={goal} onChange={e=>setGoal(e.target.value)}><option value="conectar">{en?'Connect':'Conectar'}</option><option value="educar">{en?'Educate':'Educar'}</option><option value="mostrar mi producto">{en?'Show my product':'Mostrar producto'}</option><option value="invitar a comprar sin presión">{en?'Sell':'Vender'}</option></select></label>
     <label>{en?'Search ideas':'Buscar ideas'}<div style={{display:'flex',alignItems:'center',gap:8}}><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={en?'Search a topic…':'Busca un tema…'}/></div></label>
   </div>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'16px 0 22px'}}>
     {categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)} aria-pressed={category===c} className={category===c?'btn dark':'btn ghost'} style={{padding:'8px 13px'}}>{c}</button>)}
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14}}>
    {filtered.map(idea=><article key={idea.title} style={{border:'1px solid #ddd8cf',borderRadius:18,padding:18,display:'flex',flexDirection:'column',gap:10,background:'#fffdf9'}}>
      <span style={{fontSize:12,opacity:.65}}><Lightbulb size={13} style={{display:'inline',verticalAlign:'middle'}}/> {idea.category}</span>
      <strong style={{fontSize:19}}>{idea.title}</strong><p style={{fontSize:15,margin:0}}>{idea.hook}</p>
      <small style={{opacity:.73,flexGrow:1}}>{idea.brief}</small>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <button type="button" className="btn ghost" onClick={()=>copy(idea)}><Copy size={15}/>{copied===idea.title?<><Check size={14}/>{en?'Copied':'Copiado'}</>:en?'Copy for AI':'Copiar para IA'}</button>
        <button type="button" className="btn dark" onClick={()=>onUse(idea)}>{en?'Use idea':'Usar idea'} <ArrowRight size={14}/></button>
      </div>
    </article>)}
   </div>
   <p style={{marginTop:20,fontSize:13}}><BookOpen size={15} style={{display:'inline'}}/> {en?'These ideas and prompts are included with your purchase. ChatGPT is a separate service with its own terms. Content Lab does not generate AI photos or publish automatically.':'Estas ideas y prompts están incluidos en tu compra. ChatGPT es un servicio externo con sus propias condiciones. El Lab no genera fotos con IA ni publica automáticamente.'}</p>
 </section>;
}
