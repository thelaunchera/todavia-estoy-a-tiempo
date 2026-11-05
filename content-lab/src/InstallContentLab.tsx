import React,{useEffect,useState} from 'react';
import {CheckCircle2,Download,Share2,Smartphone,Tablet} from 'lucide-react';
import './InstallContentLab.css';

type InstallEvent=Event&{
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:'accepted'|'dismissed'}>;
};
type Props={locale:'es'|'en';compact?:boolean};
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||
 Boolean((window.navigator as Navigator&{standalone?:boolean}).standalone);

/** Does not attempt to install from an embedded browser. Browser-managed
 * prompts require a user gesture; Apple devices use Add to Home Screen. */
export default function InstallContentLab({locale,compact=false}:Props){
 const es=locale==='es';
 const [installed,setInstalled]=useState(standalone);
 const [prompt,setPrompt]=useState<InstallEvent|null>(null);
 const [expanded,setExpanded]=useState(false);
 const [feedback,setFeedback]=useState('');
 const ua=navigator.userAgent;
 const ios=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
 const android=/Android/i.test(ua);
 useEffect(()=>{
  const available=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent)};
  const complete=()=>{setInstalled(true);setPrompt(null);setFeedback('')};
  const change=()=>setInstalled(standalone());
  window.addEventListener('beforeinstallprompt',available);
  window.addEventListener('appinstalled',complete);
  window.matchMedia('(display-mode: standalone)').addEventListener('change',change);
  return()=>{
   window.removeEventListener('beforeinstallprompt',available);
   window.removeEventListener('appinstalled',complete);
   window.matchMedia('(display-mode: standalone)').removeEventListener('change',change);
  };
 },[]);
 if(installed&&compact)return null;
 const install=async()=>{
  if(!prompt){setExpanded(value=>!value);return}
  try{
   await prompt.prompt();
   const response=await prompt.userChoice;
   if(response.outcome==='accepted')setFeedback(es?'¡Content Lab está listo para instalarse!':'Content Lab is ready to install!');
   else setFeedback(es?'Puedes instalarla más tarde desde el menú del navegador.':'You can install later from the browser menu.');
   setPrompt(null);
  }catch{
   setExpanded(true);
   setFeedback(es?'Usa la opción de instalar en el navegador.':'Use your browser’s install option.');
  }
 };
 return <section className={'lab-install-app'+(compact?' compact':'')} aria-label={es?'Instalar Content Lab como app':'Install Content Lab as an app'}>
  <div className="lab-install-app-main">
   <span className="lab-install-app-icon"><Smartphone size={compact?17:22} aria-hidden="true"/></span>
   <div><strong>{es?'Content Lab en tu teléfono o tablet':'Content Lab on your phone or tablet'}</strong>
     {!compact&&<small>{es?'Un icono propio, pantalla completa y acceso con tu correo. Sin App Store ni Play Store.':'Your own icon, standalone window and sign-in by email. No app store needed.'}</small>}</div>
   {installed?<span className="lab-install-app-ready"><CheckCircle2 size={15}/>{es?'Instalada':'Installed'}</span>:
    <button type="button" onClick={()=>void install()} aria-expanded={expanded} className="lab-install-app-action">
     <Download size={16}/>{prompt?(es?'Instalar app':'Install app'):(es?'Cómo instalar':'Install guide')}
    </button>}
  </div>
  {!installed&&expanded&&<div className="lab-install-app-steps">
   {(ios||!android)&&<div>
    <span><Share2 size={16}/> iPhone / iPad</span>
    <p>{es?'Abre este enlace directamente en Safari. Toca Compartir y elige “Añadir a pantalla de inicio”; confirma Añadir.':'Open this link directly in Safari. Tap Share → Add to Home Screen → Add.'}</p>
   </div>}
   {(android||!ios)&&<div>
    <span><Tablet size={16}/> Android / tablet</span>
    <p>{es?'Abre Content Lab en Chrome. Toca ⋮ y selecciona “Instalar app” o “Añadir a pantalla principal”.':'Open Content Lab in Chrome. Tap ⋮ → Install app or Add to Home Screen.'}</p>
   </div>}
   <small>{es?'Necesitas Internet para acceder a tus fotos privadas y sincronizar proyectos. Puedes volver a entrar con el mismo correo de compra.':'You need Internet to access private photos and sync projects. Sign in again using your purchase email.'}</small>
  </div>}
  {feedback&&<small role="status" className="lab-install-app-feedback">{feedback}</small>}
 </section>;
}
