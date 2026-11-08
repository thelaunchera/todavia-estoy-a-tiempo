import {useEffect,useState} from 'react';
import {Eye,EyeOff,RefreshCw} from 'lucide-react';
import {getWebsiteDemoVisibility,setWebsiteDemoVisibility} from './supabase-client';

/** Studio and public gallery share canonical slugs; two Brownie views are one website. */
export function websiteDemoId(id:string):string {
 return ({'casa-brownie-static':'casa-brownie','ivory-bloom':'ivory-and-bloom'} as Record<string,string>)[id]||id;
}

export function useWebsiteDemoVisibility(){
 const [visibility,setVisibility]=useState<Record<string,boolean>|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  let alive=true;
  setLoading(true);setError('');
  void getWebsiteDemoVisibility()
   .then(rows=>{if(alive)setVisibility(Object.fromEntries(rows.map(row=>[row.demo_id,row.visible])));})
   .catch(e=>{if(alive){setVisibility(null);setError(e instanceof Error?e.message:'No se pudo comprobar la selección pública.');}})
   .finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[revision]);
 async function change(id:string,visible:boolean){
  if(!visibility)return;
  const canonical=websiteDemoId(id);
  setSaving(canonical);setError('');setNotice('');
  try{
   await setWebsiteDemoVisibility(canonical,visible);
   setVisibility(current=>current?{...current,[canonical]:visible}:current);
   setNotice(visible?'Este demo ya está seleccionado para Websites.':'El demo quedó oculto del portafolio Websites. Su enlace sigue existiendo.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar la selección.');}
  finally{setSaving('');}
 }
 return {visibility,loading,saving,error,notice,change,refresh:()=>setRevision(v=>v+1)};
}

export type WebsiteDemoVisibilityControl=ReturnType<typeof useWebsiteDemoVisibility>;

export function WebsiteDemoVisibilityButton({id,title,isClient,control}:{
 id:string;title:string;isClient:boolean;control:WebsiteDemoVisibilityControl
}){
 const key=websiteDemoId(id);
 const visible=control.visibility?.[key]!==false;
 const busy=control.loading||control.visibility===null||!!control.saving;
 return <div className="finished-demo-website-control" aria-label={'Visibilidad de '+title+' en Website of Websites'}>
  <span className={'finished-demo-website-state'+(visible&&!isClient?' is-visible':'')}>
   {isClient?'Proyecto de cliente · no publicable':control.loading?'Consultando Websites…':!control.visibility?'Visibilidad no disponible':visible?'Visible en Websites':'Oculto en Websites'}
  </span>
  {!isClient&&<button type="button" disabled={busy}
    aria-pressed={visible} onClick={()=>void control.change(key,!visible)}>
    {visible?<EyeOff size={16}/>:<Eye size={16}/>}
    {control.saving===key?'Guardando…':visible?'Ocultar de Websites':'Mostrar en Websites'}
   </button>}
  {key==='casa-brownie'&&!isClient&&<small>Una sola selección para ambas versiones de Casa Brownie.</small>}
 </div>;
}

export function WebsiteDemoVisibilitySummary({control,ids}:{
 control:WebsiteDemoVisibilityControl;ids:string[]
}){
 const total=new Set(ids).size;
 const shown=control.visibility?new Set(ids).size-Array.from(new Set(ids)).filter(id=>control.visibility?.[id]===false).length:0;
 return <div className="finished-demo-website-summary">
   <div><strong>Website of Websites · Portafolio público</strong>
    <span>Elige qué demos se muestran en la biblioteca y en la página de websites. Es independiente del Aula.</span>
   </div>
   <span className="finished-demo-website-count">{control.loading?'Consultando…':control.visibility?shown+' de '+total+' visibles':'No disponible'}</span>
   <button type="button" disabled={control.loading||!!control.saving} onClick={control.refresh}><RefreshCw size={15}/> Actualizar</button>
   {control.error&&<p role="alert" className="finished-demo-publish-error">{control.error}</p>}
   {control.notice&&<p role="status" className="finished-demo-publish-notice">{control.notice}</p>}
  </div>;
}
