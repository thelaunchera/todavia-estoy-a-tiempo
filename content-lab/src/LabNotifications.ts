import {auth} from './platform/client';
import {createClient} from '@supabase/supabase-js';

// All personal alerts are scoped by Supabase RLS to the signed-in buyer.
const sb=createClient(String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_URL||'https://not-configured.supabase.co'),
 String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY||'missing-public-key'),
 {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export type LabAlert={
 id:string;kind:'unfinished'|'scheduled';source_type:'post'|'grid';source_id:string;
 tile_index:number;brand_id:string|null;project_title:string;format:string;
 scheduled_at:string|null;created_at:string;read_at:string|null;snoozed_until:string|null;
 delivery_state:string;
};
const checked=async()=>{const u=await auth.getUser();if(!u)throw Error('Tu acceso al Content Lab no está activo.');
 const {data:{user},error}=await sb.auth.getUser();
 if(error||!user)throw Error('Inicia sesión de nuevo.');return user.id;};
export const localZone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
export const notificationsApi={
 async init(locale:'es'|'en'){
  const id=await checked();
  const {data:old,error:e}=await sb.from('content_lab_alert_settings')
   .select('owner_id,push_enabled,email_enabled').eq('owner_id',id).maybeSingle();
  if(e)throw Error(e.message);
  const {error}=await sb.from('content_lab_alert_settings').upsert({
   owner_id:id,locale,timezone:localZone(),updated_at:new Date().toISOString(),
   ...(!old?{email_enabled:true,push_enabled:false}:{})
  },{onConflict:'owner_id'});
  if(error)throw Error(error.message);
  return {push:!!old?.push_enabled,email:old?.email_enabled!==false};
 },
 async list():Promise<LabAlert[]>{
  await checked();
  const {data,error}=await sb.from('content_lab_alerts')
   .select('id,kind,source_type,source_id,tile_index,brand_id,project_title,format,scheduled_at,created_at,read_at,snoozed_until,delivery_state')
   .is('read_at',null).order('created_at',{ascending:false}).limit(40);
  if(error)throw Error(error.message);
  return (data||[]) as LabAlert[];
 },
 async get(id:string):Promise<LabAlert|null>{
  await checked();
  const {data,error}=await sb.from('content_lab_alerts')
   .select('id,kind,source_type,source_id,tile_index,brand_id,project_title,format,scheduled_at,created_at,read_at,snoozed_until,delivery_state')
   .eq('id',id).maybeSingle();
  if(error)throw Error(error.message);
  return (data||null) as LabAlert|null;
 },
 async act(id:string,action:'read'|'snooze'){
  await checked();
  const {data,error}=await sb.rpc('content_lab_act_on_alert',{p_id:id,p_action:action});
  if(error)throw Error(error.message);
  if(data!==true)throw Error('No se pudo actualizar este aviso.');
 },
 async enablePush(){
  const id=await checked();
  if(!window.isSecureContext||!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))
   throw Error('Este dispositivo no admite avisos push. Seguirás recibiendo correos.');
  // iPhone Web Push needs the Home Screen installed app and a direct user gesture.
  const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
  const standalone=window.matchMedia('(display-mode: standalone)').matches
    ||(navigator as Navigator&{standalone?:boolean}).standalone===true;
  if(ios&&!standalone)throw Error('En iPhone, añade Content Lab a la pantalla de inicio y abre la app para activar avisos.');
  if(Notification.permission==='denied')throw Error('Activa notificaciones para Content Lab desde Ajustes del teléfono.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')throw Error('No autorizaste las notificaciones. El correo sigue disponible.');
  const registration=await navigator.serviceWorker.ready;
  const {data:key,error:keyError}=await sb.rpc('content_lab_public_push_key');
  if(keyError||!key||typeof key!=='string')throw Error('Push todavía no está configurado en el servidor.');
  const keyBytes=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-key.length%4)%4)),s=>s.charCodeAt(0));
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription){
   subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes});
  }
  const json=subscription.toJSON();
  if(!json.keys?.p256dh||!json.keys?.auth)throw Error('No se pudo registrar este teléfono.');
  const {error}=await sb.from('content_lab_push_subscriptions').upsert({
   owner_id:id,endpoint:subscription.endpoint,p256dh:json.keys.p256dh,
   auth:json.keys.auth,device_name:ios?'iPhone / iPad':'Navegador',
   updated_at:new Date().toISOString()
  },{onConflict:'endpoint'});
  if(error)throw Error(error.message);
  const {error:settingsError}=await sb.from('content_lab_alert_settings')
   .update({push_enabled:true,updated_at:new Date().toISOString()}).eq('owner_id',id);
  if(settingsError)throw Error(settingsError.message);
 },
 async disablePush(){
  const id=await checked();
  const registration=await navigator.serviceWorker?.ready;
  const subscription=await registration?.pushManager.getSubscription();
  if(subscription){
   await sb.from('content_lab_push_subscriptions').delete().eq('endpoint',subscription.endpoint).eq('owner_id',id);
   await subscription.unsubscribe();
  }
  const {error}=await sb.from('content_lab_alert_settings')
   .update({push_enabled:false,updated_at:new Date().toISOString()}).eq('owner_id',id);
  if(error)throw Error(error.message);
 },
 async toggleEmail(enabled:boolean){
  const id=await checked();
  const {error}=await sb.from('content_lab_alert_settings')
   .update({email_enabled:enabled,updated_at:new Date().toISOString()}).eq('owner_id',id);
  if(error)throw Error(error.message);
 }
};
