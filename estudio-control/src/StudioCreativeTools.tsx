import { useMemo, useState } from 'react';
import { ExternalLink, Copy, Search, Mail, Palette } from 'lucide-react';
import './studio-creative-tools.css';

type Kind = 'websites' | 'motion' | 'emails';
type Ref = { name: string; kind: Kind; url: string; focus: string; idea: string };
const SOURCES: Ref[] = [
  {name:'Siteinspire',kind:'websites',url:'https://www.siteinspire.com/',focus:'Editorial / premium',idea:'Big imagery, distinctive typography and whitespace'},
  {name:'Awwwards',kind:'websites',url:'https://www.awwwards.com/',focus:'Experience / interaction',idea:'Memorable hero sections and meaningful movement'},
  {name:'Land-book',kind:'websites',url:'https://land-book.com/',focus:'Services / landings',idea:'Layout clarity, offers and mobile hierarchy'},
  {name:'Lapa Ninja',kind:'websites',url:'https://www.lapa.ninja/',focus:'Products / commerce',idea:'Product storytelling and gallery rhythm'},
  {name:'Behance',kind:'websites',url:'https://www.behance.net/',focus:'Brand direction',idea:'Photography, palette and editorial composition'},
  {name:'Pinterest',kind:'websites',url:'https://www.pinterest.com/',focus:'Photography moodboards',idea:'Lighting, sets, framing and visual references'},
  {name:'Motion Examples',kind:'motion',url:'https://motion.dev/examples',focus:'Motion for UI',idea:'Scroll reveals, text and layout transitions'},
  {name:'React Bits',kind:'motion',url:'https://www.reactbits.dev/',focus:'React interactions',idea:'Animated components with clear purpose'},
  {name:'BrewedOps Motion Library',kind:'motion',url:'https://brewedops.cloud/motionlibrary/',focus:'Website effects',idea:'Inspiration for unique hero and section interactions'},
  {name:'Really Good Emails',kind:'emails',url:'https://reallygoodemails.com/',focus:'Campaign layouts',idea:'Welcome, launch, product and newsletter designs'},
  {name:'Email Love',kind:'emails',url:'https://emaillove.com/',focus:'Email journeys',idea:'Sequences, design structure and mobile layouts'},
  {name:'Milled',kind:'emails',url:'https://milled.com/',focus:'Brand campaigns',idea:'Visual promotions and campaign direction'},
  {name:'Good Email Copy',kind:'emails',url:'https://www.goodemailcopy.com/',focus:'Human writing',idea:'Concise messages with a natural tone and clear CTA'},
];
const BRANDS=['The Launch Era','SOVA','Golden Grid','La Vie in Pink','Casa Brownie','Wedding Cakes','Yumm','Cleaning Demo','Otra marca'];
const KINDS: {id: Kind; label: string}[] = [
  {id:'websites',label:'Websites'},{id:'motion',label:'Motion'},{id:'emails',label:'Emails'}
];
const esc=(s:string)=>s.replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const https=(s:string)=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return '';}};
async function copyText(value:string,onMessage:(v:string)=>void){
  try{await navigator.clipboard.writeText(value);onMessage('Copiado.');}
  catch{onMessage('No se pudo copiar automáticamente en este dispositivo.');}
}

export function ReferenceBrowser({initialKind='websites'}:{initialKind?:Kind}){
 const [kind,setKind]=useState<Kind>(initialKind);
 const [brand,setBrand]=useState('The Launch Era');
 const [search,setSearch]=useState('');
 const [chosen,setChosen]=useState<string[]>([]);
 const [status,setStatus]=useState('');
 const visible=useMemo(()=>SOURCES.filter(x=>x.kind===kind&&
  (x.name+' '+x.focus+' '+x.idea).toLowerCase().includes(search.toLowerCase().trim())),[kind,search]);
 const brief=['DIRECCIÓN CREATIVA · '+brand,
  'Inspiración visual, no copiar páginas, fotos, identidades ni textos.',
  'Usar el Brand Kit y las fotos aprobadas de esta marca.',
  'Priorizar: imagen hero protagonista, jerarquía clara, un CTA, diseño móvil 375px y motion moderado.',
  '',...SOURCES.filter(x=>chosen.includes(x.name)).map(x=>x.name+' — '+x.url+'\nAplicar: '+x.idea),
  '','Comprobar mobile, enlaces reales, accesibilidad, fotografías individuales y efecto de hero.'].join('\n');
 return <section className="tle-tools" aria-label="Biblioteca de inspiración">
  <header className="tle-tools-head"><Palette size={20}/><div><h4>Inspiration Library</h4><p>Referencias visuales para diseñar desde una dirección de arte, sin copiar plantillas.</p></div></header>
  <div className="tle-tools-tabs">{KINDS.map(k=><button type="button" key={k.id} aria-pressed={kind===k.id} onClick={()=>setKind(k.id)}>{k.label}</button>)}</div>
  <div className="tle-tools-fields">
   <label>Marca<select value={brand} onChange={e=>setBrand(e.target.value)}>{BRANDS.map(b=><option key={b}>{b}</option>)}</select></label>
   <label>Buscar<Search size={14}/><input type="search" placeholder="Editorial, scroll, branding…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  </div>
  <div className="tle-tools-grid">{visible.map(x=><article className="tle-tools-ref" key={x.name}>
   <small>{x.focus}</small><h5>{x.name}</h5><p>{x.idea}</p>
   <div className="tle-tools-ref-actions">
    <label><input type="checkbox" checked={chosen.includes(x.name)} onChange={e=>setChosen(v=>e.target.checked?[...v,x.name]:v.filter(n=>n!==x.name))}/> Elegir</label>
    <a href={x.url} target="_blank" rel="noopener noreferrer">Explorar <ExternalLink size={14}/></a>
   </div></article>)}{!visible.length&&<p>Sin referencias con esa búsqueda.</p>}</div>
  <footer className="tle-tools-footer">
   <p>{chosen.length} referencias seleccionadas. Selección temporal; copia el brief para guardarlo con el demo.</p>
   <button type="button" disabled={!chosen.length} onClick={()=>void copyText(brief,setStatus)}><Copy size={14}/> Copiar brief creativo</button>
  </footer>{status&&<p role="status" className="tle-tools-status">{status}</p>}
 </section>;
}

type EmailExample={id:string;name:string;a:string;b:string;headline:string;message:string;cta:string};
const EXAMPLES:EmailExample[]=[
 {id:'news',name:'Newsletter',a:'A little inspiration for your next launch',b:'An idea worth opening today',headline:'Your next idea deserves intention.',message:'Good design is not about adding more. It is about making the right things clear, memorable and easy to use.',cta:'Explore our work'},
 {id:'demo',name:'Nuevo demo',a:'Meet our latest website',b:'Something new just landed',headline:'Designed to feel different.',message:'A distinctive brand deserves a website that feels like its own. Explore our latest concept and the details behind it.',cta:'See the project'},
 {id:'freebie',name:'Freebie',a:'A little something for your next idea',b:'Made this for you',headline:'Here is something worth keeping.',message:'We put together a useful resource to help you turn ideas into something beautifully considered.',cta:'Explore the free resource'},
];
export function EmailCampaignBoard(){
 const [type,setType]=useState(EXAMPLES[0].id);
 const [brand,setBrand]=useState('The Launch Era');
 const [a,setA]=useState(EXAMPLES[0].a);
 const [b,setB]=useState(EXAMPLES[0].b);
 const [preheader,setPreheader]=useState('Fresh ideas, meaningful design and one useful next step.');
 const [headline,setHeadline]=useState(EXAMPLES[0].headline);
 const [message,setMessage]=useState(EXAMPLES[0].message);
 const [cta,setCta]=useState(EXAMPLES[0].cta);
 const [link,setLink]=useState('https://thelaunchera.com/');
 const [hero,setHero]=useState('');
 const [status,setStatus]=useState('');
 const change=(id:string)=>{const x=EXAMPLES.find(e=>e.id===id)||EXAMPLES[0];setType(id);setA(x.a);setB(x.b);setHeadline(x.headline);setMessage(x.message);setCta(x.cta);setStatus('');};
 const validLink=https(link),validHero=https(hero);
 const html=useMemo(()=>{
   const img=https(hero)?'<tr><td><img src="'+esc(https(hero))+'" alt="" width="600" style="width:100%;height:auto;display:block"></td></tr>':'';
   const action=https(link)?'<a href="'+esc(https(link))+'" style="display:inline-block;background:#F2D85B;color:#191919;text-decoration:none;font:bold 15px Arial,sans-serif;padding:16px 24px;border-radius:8px">'+esc(cta)+'</a>':'';
   const paragraphs=message.split(/\n\s*\n/).filter(Boolean).map(p=>'<p style="font:16px/1.7 Arial,sans-serif;color:#464646;margin:0 0 20px">'+esc(p).replace(/\n/g,'<br>')+'</p>').join('');
   return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(a)+'</title></head><body style="margin:0;padding:24px 12px;background:#FAF8F3"><div style="display:none;max-height:0;overflow:hidden;opacity:0">'+esc(preheader)+'</div><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#fff"><tr><td style="padding:28px;font:bold 13px Arial,sans-serif;letter-spacing:2px;color:#191919">'+esc(brand.toUpperCase())+'</td></tr>'+img+'<tr><td style="padding:30px 28px 36px"><h1 style="font:normal 38px/1.12 Georgia,serif;color:#191919;letter-spacing:-1px;margin:0 0 22px">'+esc(headline)+'</h1>'+paragraphs+action+'</td></tr><tr><td style="padding:22px 28px;background:#FAF8F3;font:12px/1.6 Arial,sans-serif;color:#666">You received this email because you subscribed. <a style="color:#191919" href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></td></tr></table></body></html>';
 },[a,brand,cta,hero,headline,link,message,preheader]);
 return <section className="tle-tools" aria-label="Email Studio">
  <header className="tle-tools-head"><Mail size={20}/><div><h4>Email Studio · campaña visual</h4><p>Borrador para Resend. No envía mensajes ni cambia las automatizaciones activas.</p></div></header>
  <div className="tle-email-grid">
   <div className="tle-email-form">
    <div className="tle-email-pair"><label>Campaña<select value={type} onChange={e=>change(e.target.value)}>{EXAMPLES.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label>Marca<input value={brand} onChange={e=>setBrand(e.target.value)}/></label></div>
    <label>Asunto A<input value={a} onChange={e=>setA(e.target.value)}/></label>
    <label>Asunto B<input value={b} onChange={e=>setB(e.target.value)}/></label>
    <label>Preheader<input value={preheader} onChange={e=>setPreheader(e.target.value)}/></label>
    <label>Headline<input value={headline} onChange={e=>setHeadline(e.target.value)}/></label>
    <label>Mensaje<textarea rows={4} value={message} onChange={e=>setMessage(e.target.value)}/></label>
    <div className="tle-email-pair"><label>Botón<input value={cta} onChange={e=>setCta(e.target.value)}/></label><label>URL HTTPS<input value={link} onChange={e=>setLink(e.target.value)}/></label></div>
    {!validLink&&<p className="tle-email-warning">Corrige la URL HTTPS del botón antes de utilizar el email.</p>}
    <label>Foto hero · URL HTTPS (opcional)<input value={hero} onChange={e=>setHero(e.target.value)} placeholder="https://…"/></label>
    {hero&&!validHero&&<p className="tle-email-warning">La foto no se incluirá sin una URL HTTPS válida.</p>}
   </div>
   <div className="tle-email-preview-wrap"><small>VISTA PREVIA / MOBILE</small><div className="tle-email-preview">
    <strong>{brand}</strong>{validHero&&<img src={validHero} alt="Foto principal de campaña"/>}
    <h5>{headline}</h5><p>{message}</p>{validLink&&<span>{cta}</span>}
    <small>Subscription email · Unsubscribe</small>
   </div></div>
  </div>
  <footer className="tle-tools-footer">
   <p>Revisa la lista, el consentimiento y el HTML antes de aprobar. La prueba A/B y los envíos se configuran en Resend.</p>
   <div className="tle-tools-actions">
    <button type="button" onClick={()=>void copyText('A: '+a+'\nB: '+b,setStatus)}><Copy size={14}/> Asuntos A/B</button>
    <button type="button" disabled={!validLink} onClick={()=>void copyText(html,setStatus)}><Copy size={14}/> Copiar HTML</button>
    <a href="https://resend.com/broadcasts" target="_blank" rel="noopener noreferrer">Abrir Resend <ExternalLink size={14}/></a>
   </div>
  </footer>{status&&<p role="status" className="tle-tools-status">{status}</p>}
 </section>;
}
