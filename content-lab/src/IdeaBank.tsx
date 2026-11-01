import {useMemo,useState} from 'react';
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
type Props={brandName:string;audience:string;language:string;onUse:(idea:Idea)=>void};
export default function IdeaBank({brandName,audience,language,onUse}:Props){
 const [category,setCategory]=useState('Todas'),[search,setSearch]=useState(''),[offer,setOffer]=useState(''),[goal,setGoal]=useState('conectar'),[copied,setCopied]=useState('');
 const categories=['Todas',...Array.from(new Set(ideas.map(i=>i.category)))];
 const filtered=useMemo(()=>ideas.filter(i=>(category==='Todas'||i.category===category)&&(i.title+' '+i.hook+' '+i.brief).toLowerCase().includes(search.toLowerCase())),[category,search]);
 const prompt=(idea:Idea)=>`Actúa como estratega de contenido para ${brandName}. Crea una propuesta ORIGINAL para mi audiencia: ${audience||'mi público ideal'}. Idioma del contenido: ${language==='English'?'inglés natural para EE. UU.':'español latino natural'}. Lo que vendo u ofrezco: ${offer.trim()||'[describe aquí tu producto o servicio]'}. Mi objetivo: ${goal}. Idea: ${idea.title}. Hook inicial: "${idea.hook}". Dirección: ${idea.brief}. Devuélveme: 3 hooks alternativos cortos, estructura para 1 post, guion de 5 slides si funciona como carrusel, una idea de portada de reel de imagen estática, caption breve y CTA claro. No inventes testimonios, datos de ventas, beneficios ni experiencias personales. Tono humano, específico, sin frases genéricas. Debe entenderse en tres segundos. No crees imágenes: usaré mis propias fotos en Content Lab.`;
 const copy=async(idea:Idea)=>{try{await navigator.clipboard.writeText(prompt(idea));setCopied(idea.title)}catch{setCopied('')}};
 return <section className="panel" aria-label="Banco de ideas con IA" style={{maxWidth:1150,margin:'0 auto'}}>
   <div className="eyebrow">INSPIRACIÓN PARA TU MARCA</div>
   <h1 style={{fontSize:'clamp(27px,4vw,46px)',margin:'10px 0'}}>Banco de ideas <em>+ IA.</em></h1>
   <p>Elige una idea, adáptala a tu negocio y crea tu diseño con tus propias fotos. Copia un prompt para desarrollarla en ChatGPT sin consumir créditos de generación de imágenes.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,margin:'20px 0'}}>
     <label>¿Qué vendes o comunicas?<input value={offer} onChange={e=>setOffer(e.target.value)} placeholder="Ej. servicio de limpieza, matcha, curso..." maxLength={160}/></label>
     <label>Objetivo del contenido<select value={goal} onChange={e=>setGoal(e.target.value)}><option value="conectar">Conectar</option><option value="educar">Educar</option><option value="mostrar mi producto">Mostrar producto</option><option value="invitar a comprar sin presión">Vender</option></select></label>
     <label>Buscar ideas<div style={{display:'flex',alignItems:'center',gap:8}}><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Busca un tema..." /></div></label>
   </div>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'16px 0 22px'}}>
      {categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)} aria-pressed={category===c} className={category===c?'btn dark':'btn ghost'} style={{padding:'8px 13px'}}>{c}</button>)}
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14}}>
    {filtered.map(idea=><article key={idea.title} style={{border:'1px solid #ddd8cf',borderRadius:18,padding:18,display:'flex',flexDirection:'column',gap:10,background:'#fffdf9'}}>
      <span style={{fontSize:12,opacity:.65}}><Lightbulb size={13} style={{display:'inline',verticalAlign:'middle'}}/> {idea.category}</span>
      <strong style={{fontSize:19}}>{idea.title}</strong>
      <p style={{fontSize:15,margin:0}}>{idea.hook}</p>
      <small style={{opacity:.73,flexGrow:1}}>{idea.brief}</small>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <button type="button" className="btn ghost" onClick={()=>copy(idea)}><Copy size={15}/>{copied===idea.title?<><Check size={14}/> Copiado</>:'Copiar para IA'}</button>
        <button type="button" className="btn dark" onClick={()=>onUse(idea)}>Usar idea <ArrowRight size={14}/></button>
      </div>
    </article>)}
   </div>
   <p style={{marginTop:20,fontSize:13}}><BookOpen size={15} style={{display:'inline'}}/> Estas ideas y prompts están incluidos en tu compra. ChatGPT es un servicio externo con sus propias condiciones. El Lab no genera fotos con IA ni publica contenido automáticamente.</p>
 </section>;
}
