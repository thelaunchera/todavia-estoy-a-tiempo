import React,{useRef,useState} from 'react';
import {Camera,UserRound,Settings2} from 'lucide-react';
import InstallContentLab from './InstallContentLab';
import './AccountSettings.css';
type Props={email:string;avatarSrc?:string;locale:'es'|'en';
 onUpload:(file:File)=>Promise<boolean>;onClear:()=>Promise<void>;onBrands:()=>void};
export default function AccountSettings({email,avatarSrc,locale,onUpload,onClear,onBrands}:Props){
 const file=useRef<HTMLInputElement>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const es=locale==='es';
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
   <section className="lab-settings-brand-link">
      <Settings2 size={20}/><div><strong>{es?'Marcas y estilo':'Brands and style'}</strong>
      <small>{es?'Colores, logos, idioma de tus publicaciones y reglas para la IA.':'Colors, logos, content language and AI rules.'}</small></div>
      <button type="button" onClick={onBrands}>{es?'Abrir marcas':'Open brands'}</button>
   </section>
   <InstallContentLab locale={locale}/>
 </section>;
}
