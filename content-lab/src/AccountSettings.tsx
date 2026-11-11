import React,{useEffect,useRef,useState} from 'react';
import {Camera,UserRound,Settings2} from 'lucide-react';
import InstallContentLab from './InstallContentLab';
import './AccountSettings.css';
type Props={email:string;avatarSrc?:string;locale:'es'|'en';
 onUpload:(file:File)=>Promise<boolean>;onClear:()=>Promise<void>;onBrands:()=>void;
 onLanguage:(lang:'es'|'en')=>void};
function savedPreference(key:string,fallback:boolean){
 try{const stored=localStorage.getItem(key);return stored===null?fallback:stored==='on';}catch{return fallback}
}
function IOSPreference({label,description,enabled,onChange}:{label:string;description:string;enabled:boolean;onChange:(value:boolean)=>void}){
 return <div className="lab-ios-settings-row">
  <span className="lab-ios-settings-label"><strong>{label}</strong><small>{description}</small></span>
  <button type="button" className="lab-ios-settings-switch" role="switch"
   aria-label={label} aria-checked={enabled} data-on={enabled?'true':'false'}
   onClick={()=>onChange(!enabled)}><span aria-hidden="true" className="lab-ios-settings-knob"/></button>
 </div>;
}
export default function AccountSettings({email,avatarSrc,locale,onUpload,onClear,onBrands,onLanguage}:Props){
 const file=useRef<HTMLInputElement>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const es=locale==='es';
 const [motion,setMotion]=useState(()=>savedPreference('content-lab:settings-motion',true));
 const [compact,setCompact]=useState(()=>savedPreference('content-lab:settings-compact',false));
 useEffect(()=>{
  document.documentElement.dataset.labMotion=motion?'on':'off';
  try{localStorage.setItem('content-lab:settings-motion',motion?'on':'off')}catch{}
 },[motion]);
 useEffect(()=>{
  document.documentElement.dataset.labDensity=compact?'compact':'comfortable';
  try{localStorage.setItem('content-lab:settings-compact',compact?'on':'off')}catch{}
 },[compact]);
 const upload=async(picture?:File)=>{
   if(!picture)return;
   setBusy(true);setError('');
   try{if(!await onUpload(picture))setError(es?'No se pudo guardar la foto.':'Unable to save photo.')}
   catch(e){setError(e instanceof Error?e.message:'Upload failed')}
   finally{setBusy(false)}
 };
 return <section className="lab-account-settings">
   <header><span>{es?'TU CUENTA':'YOUR ACCOUNT'}</span><h1>{es?'Ajustes':'Settings'}</h1>
    <p>{es?'Lo esencial para personalizar tu espacio y usar el Lab en tus dispositivos.':'Personalize your space and use the Lab across devices.'}</p></header>
   <section className="lab-settings-profile">
     <div className="lab-settings-avatar">{avatarSrc?<img src={avatarSrc} alt={es?'Tu foto de perfil':'Profile picture'}/>:<UserRound size={34}/>}</div>
     <div><strong>{es?'Mi foto de perfil':'Profile picture'}</strong><small>{email}</small>
       <div className="lab-settings-profile-actions">
         <button type="button" disabled={busy} onClick={()=>file.current?.click()}><Camera size={16}/>{busy?'…':es?'Cambiar foto':'Change photo'}</button>
         {avatarSrc&&<button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{await onClear()}catch(e){setError(e instanceof Error?e.message:'Error')}finally{setBusy(false)}}}>{es?'Quitar':'Remove'}</button>}
       </div>
       <input ref={file} hidden type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
         onChange={e=>{const f=e.target.files?.[0];e.target.value='';void upload(f)}}/>
       {error&&<p role="alert">{error}</p>}
     </div>
   </section>
   <section className="lab-ios-settings-list" aria-label={es?'Preferencias':'Preferences'}>
    <h2>{es?'Preferencias':'Preferences'}</h2>
    <IOSPreference label={es?'Interfaz en inglés':'English interface'}
      description={es?'Cambia el idioma del Content Lab.':'Switch the Content Lab display language.'}
      enabled={locale==='en'} onChange={on=>onLanguage(on?'en':'es')}/>
    <IOSPreference label={es?'Animaciones suaves':'Smooth animations'}
      description={es?'Reduce el movimiento de la interfaz si lo prefieres.':'Reduce interface motion when you prefer.'}
      enabled={motion} onChange={setMotion}/>
    <IOSPreference label={es?'Vista compacta':'Compact layout'}
      description={es?'Muestra tarjetas con menos espacio entre ellas.':'Use less space between your cards.'}
      enabled={compact} onChange={setCompact}/>
   </section>
   <section className="lab-settings-brand-link">
      <Settings2 size={20}/><div><strong>{es?'Marcas y estilo':'Brands and style'}</strong>
      <small>{es?'Colores, logos, idioma de tus publicaciones y reglas para la IA.':'Colors, logos, content language and AI rules.'}</small></div>
      <button type="button" onClick={onBrands}>{es?'Abrir marcas':'Open brands'}</button>
   </section>
   <InstallContentLab locale={locale}/>
 </section>;
}
