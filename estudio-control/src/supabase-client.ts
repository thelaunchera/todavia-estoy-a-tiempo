import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Upload } from 'tus-js-client';
import {CREATIVE_EDITOR_RULES} from '../../creative-shared/editor-rules';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from './public-supabase-config';
import {
  auth as localAuth, api as localApi, hasLocalVault,
  downloadEncryptedBackup, importEncryptedBackup
} from './local-client';

export { hasLocalVault, downloadEncryptedBackup, importEncryptedBackup };

const url = (import.meta.env.VITE_PODCAST_SUPABASE_URL || PUBLIC_SUPABASE_URL).trim();
const key = (import.meta.env.VITE_PODCAST_SUPABASE_PUBLISHABLE_KEY || PUBLIC_SUPABASE_PUBLISHABLE_KEY).trim();
export const SUPABASE_ENABLED = /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
  && (key.startsWith('sb_publishable_') || key.startsWith('eyJ'));
const client: SupabaseClient | null = SUPABASE_ENABLED
  ? createClient(url, key, {
      auth: { persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit' }
    })
  : null;

// Five-day remembered login; password is never saved in the browser.
// Supabase securely stores and refreshes the browser session. This local marker
// enforces an absolute 120-hour maximum for access to this studio.
const SESSION_KEY = 'podcast_studio_password_login_deadline_v1';
const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
let recoveringPassword = /(?:^|[&#?])type=recovery(?:&|$)/.test(window.location.hash + '&' + window.location.search);
function rememberPasswordLogin(userId: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, expiresAt: Date.now() + FIVE_DAYS }));
  } catch {
    throw new Error('Safari no permite guardar la sesión. Abre una pestaña normal, fuera del modo privado.');
  }
}
function clearPasswordLogin() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
}
function passwordLoginActive(userId: string): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const info = JSON.parse(raw) as {userId?: string; expiresAt?: number};
    return info.userId === userId &&
      typeof info.expiresAt === 'number' &&
      Number.isFinite(info.expiresAt) &&
      info.expiresAt > Date.now() &&
      info.expiresAt <= Date.now() + FIVE_DAYS;
  } catch { return false; }
}
async function enforcePasswordSession() {
  if (!client || recoveringPassword) return;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
  if (!passwordLoginActive(user.id)) {
    // The old magic-link login is no longer sufficient to open the studio.
    // Keep it on the login screen until email/password is established.
    const raw = (() => { try { return localStorage.getItem(SESSION_KEY); } catch { return null; } })();
    if (raw) {
      clearPasswordLogin();
      await client.auth.signOut({scope:'local'});
    }
    throw Object.assign(new Error('Entra con tu correo y contraseña.'), { code:'session_expired' });
  }
}

type Kind = 'episodios' | 'tareas' | 'productos' | 'ideas';
const kinds: Kind[] = ['episodios','tareas','productos','ideas'];
type Entry = { id: string; title: string; [key: string]: unknown };
type DbEntry = { id: string; kind: Kind; title: string; payload: Record<string,unknown>; user_id: string };
function mapped(row: DbEntry): Entry { return { ...row.payload, id:row.id, title:row.title }; }
function route(path: string): { kind: Kind; id?: string } {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0]!=='api' || parts[1]!=='items' || !kinds.includes(parts[2] as Kind))
    throw new Error('Ruta desconocida.');
  return {kind:parts[2] as Kind,id:parts[3]};
}
function payload(input: unknown): {title:string;payload:Record<string,unknown>} {
  const value = input && typeof input==='object'?input as Record<string,unknown>:{};
  const title = String(value.title || '').trim().slice(0,180);
  const content:Record<string,unknown>={};
  for(const k of ['status','date','summary','subtitle','price','link','notes','section','priority','audio','art','email_art_url','popup_image_url','popup_headline','popup_headline_en','popup_message','popup_message_en','title_en','summary_en','script','announcement_state','script_reviewed','number','series','series_number','spotify_description','reel_excerpt','reel_overlay','visual_idea','performance_notes','recording_path','recording_name','recording_bytes']) {
    const v=value[k];
    if((k==='number'||k==='series_number') && typeof v==='number' && Number.isInteger(v) && v>=1 && v<=999) content[k]=v;
    if(k==='script_reviewed' && typeof v==='boolean') content[k]=v;
    if(k==='price' && typeof v==='number' && Number.isFinite(v) && v>=0) content[k]=Math.round(v*100)/100;
    else if(typeof v==='string')content[k]=v.trim().slice(0,k==='script'?20000:k==='notes'?40000:['spotify_description','reel_excerpt','reel_overlay','visual_idea','performance_notes'].includes(k)?12000:500);
  }
  return {title,payload:content};
}
async function owner():Promise<{id:string;email:string}> {
  if(!client)throw new Error('Supabase no está configurado.');
  await enforcePasswordSession();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)throw new Error('Inicia sesión para continuar.');
  const {data:admin,error:roleError}=await client.from('podcast_studio_admins')
    .select('user_id').eq('user_id',user.id).maybeSingle();
  // A network/RLS query error is not proof that an owner's access was revoked.
  if(roleError)throw new Error('No se pudo verificar el permiso del Studio. Reintenta cuando vuelva la conexión.');
  if(!admin){ throw Object.assign(new Error('La sesión existe, pero el acceso de administradora todavía no está autorizado.'),{code:'unauthorized'}); }
  return {id:user.id,email:user.email||''};
}
// Uso exclusivo de la vista previa del aula dentro del Studio autenticado.
// El token nunca se coloca en URLs, logs ni en el HTML público. La RLS del
// aula vuelve a comprobar el rol owner cuando la vista carga.
export async function getOwnerClassroomSession():Promise<{access_token:string;refresh_token:string;user_id:string}>{
  if(!client)throw new Error('Studio sin sesión de Supabase.');
  const studioOwner=await owner();
  const {data,error}=await client.auth.getSession();
  const session=data?.session;
  if(error||!session?.access_token||!session?.refresh_token||
     session.user?.id!==studioOwner.id){
    throw new Error('No se pudo verificar la sesión de administración.');
  }
  return {access_token:session.access_token,refresh_token:session.refresh_token,user_id:studioOwner.id};
}

export const auth={
  isRecovering: () => recoveringPassword,
  onSessionEvent(callback: (event: string) => void): () => void {
    if (!client) return () => {};
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') recoveringPassword = true;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') callback(event);
    });
    return () => subscription.unsubscribe();
  },
  async getUser(){
    if(!client) return localAuth.getUser();
    if(recoveringPassword) return null;
    try { await enforcePasswordSession(); }
    catch(e) {
      if((e as {code?:string})?.code==='session_expired')return null;
      // Do not log the owner out on an offline iPhone or a failed auth request.
      throw e;
    }
    const {data:{user},error}=await client.auth.getUser();
    if(error)throw new Error('La conexión no permite verificar la sesión. Vuelve a intentarlo.');
    if(!user)return null;
    const admin=await owner();
    return {email:admin.email,name:'Administración del podcast'};
  },
  async signIn(emailValue:string, password?:string){
    if(!client)return localAuth.signIn(emailValue);
    const email=emailValue.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password)
      throw new Error('Escribe tu correo y contraseña.');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error || !data.user) {
      const code=(error?.code||'').toLowerCase();
      if(error?.status===429 || code.includes('rate_limit')) throw new Error('Demasiados intentos. Inténtalo más tarde.');
      throw new Error('El correo o la contraseña no coinciden. Puedes restablecer la contraseña.');
    }
    try {
      rememberPasswordLogin(data.user.id);
      const admin=await owner();
      recoveringPassword=false;
      return {user:{email:admin.email,name:'Administración del podcast'}};
    } catch(e) {
      clearPasswordLogin();
      await client.auth.signOut({scope:'local'});
      throw e;
    }
  },
  async requestPasswordReset(emailValue:string){
    if(!client)throw new Error('Supabase no está conectado.');
    const email=emailValue.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error('Introduce tu correo de administración.');
    const redirectTo=window.location.origin+window.location.pathname;
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
    if(error) {
      const code=(error.code||'').toLowerCase();
      if(error.status===429 || code.includes('rate_limit'))throw new Error('Espera antes de solicitar otro correo de recuperación.');
      throw new Error('No se pudo solicitar el cambio de contraseña. Inténtalo más tarde.');
    }
  },
  async setPassword(newPassword:string){
    if(!client || !recoveringPassword)throw new Error('Abre primero el enlace de recuperación enviado a tu correo.');
    if(newPassword.length<10)throw new Error('Usa al menos 10 caracteres para tu contraseña.');
    // Verify this is the existing authorized studio owner before changing credentials.
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user)throw new Error('Este enlace caducó. Solicita uno nuevo.');
    const {data:admin,error:adminError}=await client.from('podcast_studio_admins')
      .select('user_id').eq('user_id',user.id).maybeSingle();
    if(adminError || !admin)throw new Error('Esta cuenta no tiene permiso de administración del podcast.');
    const {error:updateError}=await client.auth.updateUser({password:newPassword});
    if(updateError)throw new Error('No se pudo guardar la contraseña. Revisa que cumpla los requisitos e inténtalo.');
    recoveringPassword=false;
    clearPasswordLogin();
    await client.auth.signOut({scope:'local'});
  },
  async signOut(){
    if(!client)return localAuth.signOut();
    clearPasswordLogin();
    const {error}=await client.auth.signOut({scope:'local'});
    if(error)throw error;
  }
};
export type AudioStats = {
  plays: number; sessions: number; quarter: number; half: number;
  three_quarters: number; completed: number; last_play_at: string | null;
  days: Array<{ day:string; plays:number; completed:number }>;
};
export async function getThemeSongStats():Promise<AudioStats> {
  if(!client)throw new Error('Las estadísticas requieren Supabase.');
  await owner();
  const {data,error}=await client.rpc('podcast_audio_stats');
  if(error)throw new Error('No se pudieron obtener las estadísticas de audio.');
  if(!data || typeof data !== 'object')throw new Error('No hay respuesta de las estadísticas de audio.');
  return data as AudioStats;
}
export type SupportMessage = {
  id: string; sender_name: string; sender_email: string;
  subject: string; body: string; status: string; created_at: string;
};
export async function getSupportMessages(): Promise<SupportMessage[]> {
  if (!client) throw new Error('La bandeja requiere conexión con Supabase.');
  await owner();
  const { data, error } = await client.from('podcast_support_messages')
    .select('id,sender_name,sender_email,subject,body,status,created_at')
    .order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('No se pudieron cargar los mensajes. Inténtalo de nuevo.');
  return (data || []) as SupportMessage[];
}
// All public website form submissions are stored in this private Studio project.
// No reads or writes from here are sent to the unrelated Command Center CRM.
export type WebsiteInquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed';
export type WebsiteInquiry = {
  id:string;submission_id:string;created_at:string;updated_at:string;
  kind:'inquiry'|'intake';package_slug:'website-basic'|'website-plus'|'website-ai-crm';
  name:string;email:string;phone:string|null;business_name:string;industry:string;
  existing_website:string|null;preferred_email:string;customer_action:string;
  brand_notes:string|null;goals:string;automation_goals:string|null;
  ai_brief:string|null;language:'en'|'es';source:string;
  status:WebsiteInquiryStatus;payment_status:'unverified'|'verified';
  checkout_reference:string|null;admin_notes:string|null;
};
export async function getWebsiteInquiries():Promise<WebsiteInquiry[]> {
  if(!client)throw new Error('El Studio necesita conexión a Supabase para consultar los inquiries.');
  await owner();
  const {data,error}=await client.from('tle_studio_website_inquiries')
    .select('id,submission_id,created_at,updated_at,kind,package_slug,name,email,phone,business_name,industry,existing_website,preferred_email,customer_action,brand_notes,goals,automation_goals,ai_brief,language,source,status,payment_status,checkout_reference,admin_notes')
    .order('created_at',{ascending:false}).limit(200);
  if(error)throw new Error('No pudimos cargar los intakes; comprueba la conexión y el permiso de Studio.');
  return (data||[]) as WebsiteInquiry[];
}
export async function updateWebsiteInquiry(id:string,status:WebsiteInquiryStatus,notes:string):Promise<void>{
  if(!client)throw new Error('Studio sin conexión a Supabase.');
  await owner();
  if(!/^[a-f0-9-]{36}$/i.test(id)||!['new','contacted','in_progress','closed'].includes(status))throw new Error('Estado inválido.');
  const {data,error}=await client.from('tle_studio_website_inquiries')
    .update({status,admin_notes:notes.slice(0,4000),updated_at:new Date().toISOString()})
    .eq('id',id).select('id').single();
  if(error||!data)throw new Error('No pudimos guardar el seguimiento. Inténtalo de nuevo.');
}

export const api={
  async get(path:string){
    if(!client)return localApi.get(path);
    if(path!=='/api/studio')throw new Error('Ruta desconocida.');
    await owner();
    const [entries,sales,subscribers,messages,deliveries,runs,integrations]=await Promise.all([
      client.from('podcast_studio_entries').select('id,kind,title,payload,user_id').order('created_at',{ascending:true}).limit(500),
      client.from('podcast_sales').select('id',{count:'exact',head:true}),
      client.from('podcast_subscribers').select('id',{count:'exact',head:true}).is('unsubscribed_at',null),
      client.from('podcast_support_messages').select('id',{count:'exact',head:true}),
      client.from('podcast_delivery_events').select('id',{count:'exact',head:true}),
      client.from('podcast_automation_runs').select('id',{count:'exact',head:true}),
      client.from('podcast_integrations').select('provider,status,last_sync_at').limit(20)
    ]);
    if(entries.error)throw entries.error;
    const records:Record<Kind,Entry[]>={episodios:[],tareas:[],productos:[],ideas:[]};
    for(const row of entries.data||[]){
      const r=row as DbEntry;
      if(kinds.includes(r.kind))records[r.kind].push(mapped(r));
    }
    const fmt=(value:number|null,err:unknown)=>err?'Sin sincronizar':value===null?'Pendiente':String(value);
    const active=(provider:string)=>!integrations.error && (integrations.data||[]).some(x=>x.provider===provider && x.status==='active');
    return {data:{
      records,
      sources:{
        sales:active('stripe')?'Pagos registrados en Supabase: '+fmt(sales.count,sales.error)+'. Solo eventos verificados cuentan.':'Pendiente: conectar eventos firmados de Stripe; ninguna cifra de ventas se presenta como confirmada.',
        subscribers:active('make')?'Suscripciones vigentes registradas: '+fmt(subscribers.count,subscribers.error)+'.':'Pendiente: conectar de forma segura la lista de consentimientos de Make.',
        support:messages.error?'No se pudo comprobar la bandeja de mensajes.':'Consultas recibidas desde el landing: '+fmt(messages.count,messages.error)+'. Disponibles en Mensajes.',
        seo:'Sitemap publicado. Indexación en Search Console aún pendiente de comprobar.',
        lastVerified:'Base Supabase: '+(deliveries.error||runs.error?'verificación parcial':'lectura activa')
      }
    }};
  },
  async post(path:string,input:unknown){
    if(!client)return localApi.post(path,input);
    const {kind}=route(path),who=await owner(),r=payload(input);
    if(!r.title)throw new Error('Escribe un título.');
    const {data,error}=await client.from('podcast_studio_entries')
      .insert({kind,user_id:who.id,title:r.title,payload:r.payload})
      .select('id,kind,title,payload,user_id').single();
    if(error||!data)throw error||new Error('No se pudo guardar.');
    return {data:mapped(data as DbEntry)};
  },
  async put(path:string,input:unknown){
    if(!client)return localApi.put(path,input);
    const {kind,id}=route(path),who=await owner(),r=payload(input);
    const raw=input&&typeof input==='object'?input as Record<string,unknown>:{};
    const patch:Record<string,unknown>={payload:r.payload,updated_at:new Date().toISOString()};
    if('title' in raw){if(!r.title)throw new Error('El título es obligatorio.');patch.title=r.title;}
    // merge stored JSONB on update to preserve unedited fields
    const {data:existing,error:readError}=await client.from('podcast_studio_entries')
      .select('payload').eq('id',id).eq('kind',kind).eq('user_id',who.id).single();
    if(readError||!existing)throw readError||new Error('Registro no encontrado.');
    patch.payload={...(existing.payload as Record<string,unknown>),...r.payload};
    const {data,error}=await client.from('podcast_studio_entries')
      .update(patch).eq('id',id).eq('kind',kind).eq('user_id',who.id).select('id').single();
    if(error||!data)throw error||new Error('No se pudo actualizar.');
    return {data:{ok:true}};
  },
  async delete(path:string){
    if(!client)return localApi.delete(path);
    const {kind,id}=route(path),who=await owner();
    const {data,error}=await client.from('podcast_studio_entries')
      .delete().eq('id',id).eq('kind',kind).eq('user_id',who.id).select('id').single();
    if(error||!data)throw error||new Error('No se pudo eliminar.');
    return {data:{ok:true}};
  }
};

/**
 * Migración manual del archivo cifrado del navegador al proyecto Supabase privado.
 * Requiere sesión administradora y confirmación explícita desde la interfaz.
 * Es idempotente: claves (user_id,kind,external_id) no duplican registros al reintentar.
 * Solo importa contenido editorial; jamás almacena importes reales de ventas como fuente fiable.
 */
export async function importLocalRecords(passphrase: string) {
  if (!client) throw new Error('Supabase no está conectado.');
  if (!hasLocalVault()) throw new Error('No hay datos locales en este navegador.');
  const user = await owner();
  if (!passphrase || passphrase.length < 10) throw new Error('Introduce tu frase de acceso local.');
  let localData: Record<Kind, Entry[]>;
  try {
    await localAuth.signIn(passphrase);
    const response = await localApi.get('/api/studio');
    localData = response.data.records as Record<Kind, Entry[]>;
  } finally {
    await localAuth.signOut();
  }
  const rows: Array<Record<string,unknown>> = [];
  for (const kind of kinds) {
    for (const record of localData[kind]||[]) {
      const cleaned = payload(record);
      if (!cleaned.title || !record.id) continue;
      rows.push({
        user_id:user.id,
        kind,
        title:cleaned.title,
        payload:cleaned.payload,
        external_id:'local:'+String(record.id).slice(0,180)
      });
    }
  }
  let imported=0;
  for(let i=0;i<rows.length;i+=40) {
    const chunk=rows.slice(i,i+40);
    const {data,error} = await client.from('podcast_studio_entries')
      .upsert(chunk,{onConflict:'user_id,kind,external_id',ignoreDuplicates:true}).select('id');
    if(error) throw new Error('No se pudieron importar todos los registros. Puedes reintentar sin generar duplicados.');
    imported+=(data||[]).length;
    // Read back each batch before claiming that the local records were preserved in Supabase.
    const keys = chunk.map(row => String(row.external_id));
    const {data:verified,error:verificationError} = await client.from('podcast_studio_entries')
      .select('external_id,kind').eq('user_id',user.id).in('external_id',keys);
    if(verificationError || !verified || verified.length !== chunk.length) {
      throw new Error('La importación necesita verificación. Tus datos cifrados locales se conservaron; puedes volver a intentarlo.');
    }
    const expected = new Set(chunk.map(row => String(row.kind)+'|'+String(row.external_id)));
    const received = new Set(verified.map(row => String(row.kind)+'|'+String(row.external_id)));
    if(expected.size !== received.size || [...expected].some(item => !received.has(item))) {
      throw new Error('Faltan registros por verificar. La copia original del navegador está intacta.');
    }
  }
  return { total:rows.length, imported, existing:rows.length-imported, verified:rows.length };
}

/** Métricas privadas: solo contadores, nunca correos ni datos de compradores. */
export type ClassLaunchStats = { waitlist: number; buyers: number };
export async function getClassLaunchStats(): Promise<ClassLaunchStats> {
  if(!client)throw new Error('Estadísticas de clases no disponibles sin Supabase.');
  await owner();
  const [waitlist,access]=await Promise.all([
    client.from('podcast_class_waitlist').select('email',{count:'exact',head:true}).eq('course_id','primera-landing-ia-01').is('unsubscribed_at',null),
    client.from('podcast_class_access').select('id',{count:'exact',head:true}).eq('course_id','primera-landing-ia-01').eq('status','active')
  ]);
  if(waitlist.error || access.error) throw new Error('No se pudo verificar la lista de espera o las compras.');
  return {waitlist:waitlist.count||0,buyers:access.count||0};
}

/** Registro de la lista de espera de la clase, visible solo a una administradora del Studio.
 * No es la lista de suscriptores del podcast ni concede acceso al aula.
 */
export type StudioWaitlistEntry = {
  email: string;
  consented_at: string;
  unsubscribed_at: string | null;
  welcome_state: 'pending' | 'sent' | 'cancelled';
  welcome_sent_at: string | null;
};
export async function getStudioWaitlist(): Promise<StudioWaitlistEntry[]> {
  if (!client) throw new Error('El Estudio no está conectado con la base de datos.');
  await owner();
  const records: StudioWaitlistEntry[] = [];
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await client.from('podcast_class_waitlist')
      .select('email,consented_at,unsubscribed_at,welcome_state,welcome_sent_at')
      .eq('course_id', 'primera-landing-ia-01')
      .order('consented_at', { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw new Error('No se pudieron consultar los inscritos. Comprueba tu sesión.');
    for (const row of data || []) {
      records.push({
        email: String(row.email),
        consented_at: String(row.consented_at),
        unsubscribed_at: row.unsubscribed_at,
        welcome_state: row.welcome_state === 'sent' ? 'sent'
          : row.welcome_state === 'cancelled' ? 'cancelled' : 'pending',
        welcome_sent_at: row.welcome_sent_at,
      });
    }
    if (!data || data.length < pageSize) break;
  }
  return records;
}

/**
 * Owner-facing workshop bonus catalog. Only draft/private items are stored here
 * until the owner deliberately publishes student materials separately.
 */
export type StudioBonusResource = {
  resource_code: string;
  title: string;
  url: string;
  status: 'draft' | 'ready';
  prompt_body?: string;
};
export async function getStudioBonusResources(): Promise<StudioBonusResource[]> {
  if (!client) throw new Error('El Estudio no está conectado.');
  await owner();
  const [{ data, error }, { data: prompts, error: promptError }] = await Promise.all([
    client.from('podcast_class_resources')
      .select('resource_code,title,url,status')
      .eq('course_id', 'primera-landing-ia-01')
      .like('resource_code', 'bonus_%')
      .order('title', { ascending: true }),
    client.from('podcast_class_prompts')
      .select('prompt_code,body').eq('course_id','primera-landing-ia-01')
      .like('prompt_code','bonus_%')
  ]);
  if (error || promptError) throw new Error('No se pudo consultar el catálogo privado de bonos.');
  const byCode = new Map((prompts || []).map(row => [String(row.prompt_code), String(row.body||'')]));
  return (data || []).map((row): StudioBonusResource => ({
    resource_code: String(row.resource_code),
    title: String(row.title),
    url: String(row.url),
    status: row.status === 'ready' ? 'ready' : 'draft',
    prompt_body: byCode.get(String(row.resource_code)) || undefined,
  }));
}

export type VerifiedSale = { id: string; product_code: string|null; amount_cents: number|null; currency: string|null; status: string|null; purchased_at: string|null };
export type VerifiedOwnership = { product_code:string; status:string };
export async function getVerifiedOwnership():Promise<VerifiedOwnership[]>{
  if(!client)throw new Error('Esta vista necesita Supabase.');
  await owner();
  // La misma tabla que alimenta los estados de "comprado" del centro.
  const all:VerifiedOwnership[]=[];
  const pageSize=400;
  for(let start=0;start<4000;start+=pageSize){
    const {data,error}=await client.from('podcast_hub_entitlements')
      .select('product_code,status,id').eq('status','active')
      .order('id',{ascending:true}).range(start,start+pageSize-1);
    if(error)throw error;
    const page=(data||[]) as VerifiedOwnership[];
    all.push(...page);
    if(page.length<pageSize)return all;
  }
  throw new Error('Demasiados registros de acceso: resumen incompleto.');
}
export async function getVerifiedSales(): Promise<VerifiedSale[]> {
  if(!client)throw new Error('Esta vista necesita Supabase.');
  await owner();
  // Leer todas las páginas; no calcular ingresos a partir de los últimos 80.
  // Cota conservadora: si se alcanza, mostrar error y no una suma engañosa.
  const all:VerifiedSale[]=[];
  const pageSize=400;
  for(let start=0;start<4000;start+=pageSize){
    const {data,error}=await client.from('podcast_sales')
      .select('id,product_code,amount_cents,currency,status,purchased_at')
      .order('purchased_at',{ascending:false}).order('id',{ascending:true})
      .range(start,start+pageSize-1);
    if(error)throw error;
    const page=(data||[]) as VerifiedSale[];
    all.push(...page);
    if(page.length<pageSize)return all;
  }
  throw new Error('Se alcanzó el límite de registros; no mostrar sumas parciales.');
}

export type StudioStudent = {
  buyer_email: string;
  status: 'pending' | 'active' | 'refunded' | 'revoked';
  paid_at: string | null;
  created_at: string;
  revoked_at: string | null;
};
export type StudioBonusGrant = {
  buyer_email: string;
  resource_code: string;
};
const WORKSHOP_COURSE_ID = 'primera-landing-ia-01';

/** Separate course buyers from podcast subscribers. Includes pending / revoked records. */
export async function getStudioStudents(): Promise<StudioStudent[]> {
  if (!client) throw new Error('El Estudio no está conectado.');
  await owner();
  const { data, error } = await client.from('podcast_class_access')
    .select('buyer_email,status,paid_at,created_at,revoked_at')
    .eq('course_id',WORKSHOP_COURSE_ID)
    .order('created_at',{ascending:false});
  if (error) throw new Error('No se pudo consultar la lista de alumnos.');
  return (data || []).map((row): StudioStudent => ({
    buyer_email: String(row.buyer_email),
    status: row.status as StudioStudent['status'],
    paid_at: row.paid_at,
    created_at: String(row.created_at),
    revoked_at: row.revoked_at,
  }));
}
export async function getStudioBonusGrants(): Promise<StudioBonusGrant[]> {
  if (!client) throw new Error('El Estudio no está conectado.');
  await owner();
  const { data, error } = await client.from('podcast_class_bonus_grants')
    .select('buyer_email,resource_code').eq('course_id',WORKSHOP_COURSE_ID);
  if (error) throw new Error('No pudimos comprobar los bonos asignados.');
  return (data || []).map((row): StudioBonusGrant => ({
    buyer_email: String(row.buyer_email),
    resource_code: String(row.resource_code),
  }));
}
/** Save one student's grant, never a bulk/global assignment. */
export async function setStudentBonusGrant(
  buyerEmail: string, resourceCode: string, grant: boolean,
): Promise<void> {
  if (!client) throw new Error('El Estudio no está conectado.');
  await owner();
  const email = buyerEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^bonus_[a-z0-9_]{2,80}$/.test(resourceCode))
    throw new Error('Correo o bono inválido.');
  const builder = client.from('podcast_class_bonus_grants');
  const {error} = grant
    ? await builder.upsert({course_id:WORKSHOP_COURSE_ID,buyer_email:email,resource_code:resourceCode},
        {onConflict:'course_id,buyer_email,resource_code',ignoreDuplicates:true})
    : await builder.delete().eq('course_id',WORKSHOP_COURSE_ID)
        .eq('buyer_email',email).eq('resource_code',resourceCode);
  if(error) throw new Error('No se pudo guardar el cambio para este alumno.');
}
export async function setStudioBonusAvailability(resourceCode: string, ready: boolean): Promise<void> {
  if (!client) throw new Error('El Estudio no está conectado.');
  await owner();
  if (!/^bonus_[a-z0-9_]{2,80}$/.test(resourceCode)) throw new Error('Bono inválido.');
  const {data,error} = await client.from('podcast_class_resources')
    .update({status:ready?'ready':'draft'})
    .eq('course_id',WORKSHOP_COURSE_ID).eq('resource_code',resourceCode)
    .select('resource_code,status');
  if(error || !data || data.length!==1) throw new Error('No se pudo actualizar la disponibilidad del bono.');
}


/** Original course footage only. Files remain private and are never classroom lessons.
 *  Supabase Free storage supports at most 50 MB per object; larger recordings should
 *  be published as unlisted YouTube videos and linked from the existing Studio field.
 */
const CLASS_RECORDING_BUCKET = 'podcast-class-recordings';
export const CLASS_RECORDING_LIMIT = 50_000_000;
const MIME_TYPES:Record<string,string> = {mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm'};
export async function uploadClassRecording(lessonCode:string,file:File,onProgress:(percent:number)=>void):Promise<string>{
 if(!client)throw new Error('La carga directa necesita el Studio conectado.');
 if(!/^(0[0-8])$/.test(lessonCode))throw new Error('Selecciona un capítulo válido de la clase.');
 const ext=(file.name.split('.').pop()||'').toLowerCase();
 const mime=MIME_TYPES[ext];
 if(!mime||!file.size)throw new Error('Elige un video MP4, MOV o WEBM que no esté vacío.');
 if(file.size>CLASS_RECORDING_LIMIT)throw new Error('Este archivo supera 50 MB. Sube el video completo a YouTube como No listado y guarda el enlace de este capítulo aquí.');
 const who=await owner();
 const {data:{session},error:sessionError}=await client.auth.getSession();
 if(sessionError||!session?.access_token||session.user.id!==who.id)throw new Error('Tu sesión de Studio caducó. Vuelve a entrar antes de subir el video.');
 // A new name every time: an interrupted upload can retry but never overwrite a previous take.
 const objectName=who.id+'/'+lessonCode+'/es-'+crypto.randomUUID()+'.'+ext;
 await new Promise<void>((resolve,reject)=>{
   const upload=new Upload(file,{
     endpoint:url.replace('.supabase.co','.storage.supabase.co')+'/storage/v1/upload/resumable',
     headers:{authorization:'Bearer '+session.access_token,'x-upsert':'false'},
     chunkSize:6*1024*1024,
     retryDelays:[0,3000,5000,10000],
     uploadDataDuringCreation:true,
     removeFingerprintOnSuccess:true,
     metadata:{bucketName:CLASS_RECORDING_BUCKET,objectName,contentType:mime,cacheControl:'3600'},
     onError:(error)=>reject(new Error('No se pudo subir el archivo: '+error.message)),
     onProgress:(uploaded,total)=>onProgress(Math.round(uploaded/Math.max(total,1)*100)),
     onSuccess:()=>resolve()
   });
   upload.start();
 });
 // Confirm the uploaded object exists and belongs to the signed-in owner.
 const parts=objectName.split('/');const basename=parts[parts.length-1];
 const {data,error}=await client.storage.from(CLASS_RECORDING_BUCKET).list(who.id+'/'+lessonCode,{limit:100,search:basename});
 if(error||!data?.some(x=>x.name===basename))throw new Error('La carga terminó, pero no se pudo verificar el archivo privado. No se ha marcado como guardado.');
 return objectName;
}
export async function getClassRecordingUrl(path:string):Promise<string>{
 if(!client)throw new Error('Tu Studio necesita estar conectado.');
 const who=await owner();
 if(!path.startsWith(who.id+'/')||!new RegExp('^[0-9a-f-]{36}/0[0-8]/es-[0-9a-f-]+\\.(mp4|mov|webm)$').test(path))throw new Error('Ruta del video no válida.');
 const {data,error}=await client.storage.from(CLASS_RECORDING_BUCKET).createSignedUrl(path,600);
 if(error||!data?.signedUrl)throw new Error('No se pudo abrir el video privado.');
 return data.signedUrl;
}
export async function removeOldClassRecording(path:string):Promise<void>{
 if(!client||!path)return;
 const who=await owner();
 if(!path.startsWith(who.id+'/'))return;
 const {error}=await client.storage.from(CLASS_RECORDING_BUCKET).remove([path]);
 if(error)throw error;
}


import {isPersonalCharacterAssetName} from './studio-asset-organization';
export type StudioLabAsset={id:string;name:string;category:'sticker'|'background';url:string};

/** Publish an owner-selected Studio library file to the shared Lab catalogue.
 * Personal uploads made inside the canvas never call this function.
 */
export async function publishStudioLabAsset(file:File,kind:'sticker'|'background',displayName?:string):Promise<{id:string;duplicate:boolean}>{
 if(!client)throw Error('Conexión no disponible.');
 if(isPersonalCharacterAssetName(displayName||file.name))throw Error('Los personajes personales solo se guardan en el Studio privado.');
 const who=await owner();
 const {data:admin,error:roleError}=await client.from('content_lab_admins').select('user_id').eq('user_id',who.id).maybeSingle();
 if(roleError||!admin)throw Error('Solo la administración del Content Lab puede publicar recursos.');
 const mime=file.type;
 if(kind==='sticker'&&mime!=='image/png')throw Error('Los stickers del catálogo deben ser PNG.');
 if(kind==='background'&&!['image/png','image/jpeg','image/webp'].includes(mime))throw Error('Formato de fondo no compatible.');
 if(file.size<=200||file.size>CREATIVE_EDITOR_RULES.maxPublishedFileBytes)throw Error('Máximo 5 MB por archivo publicado.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70&&bytes[8]===87&&bytes[9]===69&&bytes[10]===66&&bytes[11]===80;
 if(!((mime==='image/png'&&png)||(mime==='image/jpeg'&&jpg)||(mime==='image/webp'&&webp)))throw Error('El archivo de imagen no es válido.');
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const sha256=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const table=kind==='sticker'?'content_lab_sticker_catalog':'content_lab_background_catalog';
 const {data:existing,error:lookupError}=await client.from(table).select('id,published').eq('sha256',sha256).maybeSingle();
 if(lookupError)throw Error(lookupError.message);
 if(existing){
  if(!existing.published)throw Error('Existe un fondo no publicado con estos datos; mantenlo privado.');
  return {id:existing.id,duplicate:true};
 }
 const name=String(displayName||file.name).replace(/\.(png|jpe?g|webp)$/i,'').replace(/[_-]+/g,' ').trim().slice(0,120);
 if(!name)throw Error('El recurso necesita un nombre.');
 if(kind==='background'){
  // Avoid a second background card for a differently compressed copy of the same design.
  const {data:sameName,error:nameError}=await client.from('content_lab_background_catalog')
   .select('id').eq('name',name).eq('published',true).limit(1).maybeSingle();
  if(nameError)throw Error('No se pudo revisar el catálogo de fondos: '+nameError.message);
  if(sameName)return {id:sameName.id,duplicate:true};
 }

 const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
 const objectPath=(kind==='sticker'?'shared-stickers/':'shared-backgrounds/')+crypto.randomUUID()+'.'+ext;
 const {error:storageError}=await client.storage.from('content-lab-private').upload(objectPath,bytes,{contentType:mime,upsert:false});
 if(storageError)throw Error('No se pudo subir el recurso: '+storageError.message);
 try{
  const {data:record,error:saveError}=kind==='sticker'
    ?await client.from('content_lab_sticker_catalog')
      .insert({created_by:who.id,path:objectPath,name,category:'Aesthetic',sha256,size_bytes:bytes.length,published:true}).select('id').single()
    :await client.from('content_lab_background_catalog')
      .insert({created_by:who.id,path:objectPath,name,category:'Editoriales',mime,sha256,size_bytes:bytes.length,published:true}).select('id').single();
  if(saveError||!record)throw Error(saveError?.message||'No se pudo confirmar la publicación.');
  return {id:record.id,duplicate:false};
 }catch(error){
  await client.storage.from('content-lab-private').remove([objectPath]);
  throw error;
 }
}

export async function loadStudioLabAssets():Promise<StudioLabAsset[]>{
 if(!client)throw Error('Conexión de biblioteca no disponible.');
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user)throw Error('Inicia sesión en Studio para abrir la biblioteca.');
 const result:StudioLabAsset[]=[];
 for(const [table,category] of [['content_lab_sticker_catalog','sticker'],['content_lab_background_catalog','background']] as const){
  // Only the published shared catalogue belongs in the Studio's public resource picker.
  const query=client.from(table).select('id,name,path');
  const {data,error}=await query.eq('published',true)
   .order('created_at',{ascending:true});
  if(error)throw Error('No se pudo consultar '+category+': '+error.message);
  const entries=(data||[]).filter(x=>Boolean(x.path));
  for(let i=0;i<entries.length;i+=50){
   const batch=entries.slice(i,i+50);
   const {data:signed,error:signError}=await client.storage.from('content-lab-private').createSignedUrls(batch.map(x=>x.path),3600);
   if(signError)throw Error('No se pudo abrir la biblioteca privada: '+signError.message);
   (signed||[]).forEach((item,index)=>{if(item.signedUrl)result.push({id:batch[index].id,name:batch[index].name,category,url:item.signedUrl})});
  }
 }
 return result;
}
/** Owner-only signed URLs for unpublished character stickers, never buyer-facing. */
export async function loadStudioPrivateCharacterAssets():Promise<StudioLabAsset[]>{
 if(!client)throw Error('Conexión privada no disponible.');
 const who=await owner();
 const {data:admin,error:adminError}=await client.from('content_lab_admins')
  .select('user_id').eq('user_id',who.id).maybeSingle();
 if(adminError||!admin)throw Error('Solo la administración puede abrir personajes privados.');
 const {data,error}=await client.from('content_lab_sticker_catalog')
  .select('id,name,path').eq('created_by',who.id).eq('published',false).order('created_at',{ascending:false});
 if(error)throw Error('No se pudo cargar la colección privada: '+error.message);
 const entries=(data||[]).filter(item=>item.path&&isPersonalCharacterAssetName(item.name));
 const results:StudioLabAsset[]=[];
 for(let i=0;i<entries.length;i+=40){
  const batch=entries.slice(i,i+40);
  const {data:signed,error:signError}=await client.storage.from('content-lab-private')
   .createSignedUrls(batch.map(item=>item.path),3600);
  if(signError)throw Error('No se pudo abrir la colección privada: '+signError.message);
  (signed||[]).forEach((signedAsset,index)=>{
   if(signedAsset.signedUrl)results.push({id:batch[index].id,name:batch[index].name,category:'sticker',url:signedAsset.signedUrl});
  });
 }
 return results;
}

export async function keepStudioLabImage(url:string):Promise<string>{
 const response=await fetch(url);
 if(!response.ok)throw Error('No se pudo descargar el recurso. Vuelve a abrir la biblioteca.');
 const blob=await response.blob();
 return await new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('No se pudo leer la imagen.'));reader.readAsDataURL(blob);
 });
}

const REEL_AUDIO_BUCKET='podcast-reel-audio';
export async function uploadPodcastReelAudio(reelId:string,file:File,onProgress:(n:number)=>void):Promise<string>{
 if(!client)throw new Error('El Studio debe estar conectado para subir audio.');
 if(!/^[0-9]{2}$/.test(reelId))throw new Error('Reel no válido.');
 const ext=(file.name.split('.').pop()||'').toLowerCase();
 const types:Record<string,string>={mp3:'audio/mpeg',m4a:'audio/mp4',wav:'audio/wav',aac:'audio/aac'};
 if(!types[ext]||!file.size)throw new Error('Selecciona un audio MP3, M4A, WAV o AAC.');
 if(file.size>50_000_000)throw new Error('El audio no puede superar 50 MB.');
 const who=await owner();
 const path=who.id+'/'+reelId+'/'+crypto.randomUUID()+'.'+ext;
 const {error}=await client.storage.from(REEL_AUDIO_BUCKET).upload(path,file,{contentType:types[ext],upsert:false});
 if(error)throw new Error('No se pudo subir el audio: '+error.message);
 onProgress(100);
 return path;
}
export async function getPodcastReelAudioUrl(path:string):Promise<string>{
 if(!client)throw new Error('El Studio no está conectado.');
 const who=await owner();
 if(!new RegExp('^'+who.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/[0-9]{2}/[a-f0-9-]+\\.(mp3|m4a|wav|aac)$').test(path))throw new Error('Archivo de audio no válido.');
 const {data,error}=await client.storage.from(REEL_AUDIO_BUCKET).createSignedUrl(path,3600);
 if(error||!data?.signedUrl)throw new Error('No se pudo reproducir el audio privado.');
 return data.signedUrl;
}

/** Galería privada de fotos de la serie Fuera de Brief (YouTube). */
const YOUTUBE_PHOTO_BUCKET='podcast-youtube-storyboard';
const YOUTUBE_PHOTO_MAX_BYTES=15_000_000;
export type YouTubeSavedPhoto={shot_id:string;episode:number;object_path:string;file_name:string;file_size:number;url:string};
const youtubeShotPattern=/^E(0[1-8])-(?:F(?:0[1-9]|10)|H0[1-4])$/;
function validatedYouTubeShot(id:string):number{
 const match=youtubeShotPattern.exec(id);
 if(!match)throw new Error('El identificador de foto no es válido.');
 return Number(match[1]);
}
export async function loadYouTubeSavedPhotos():Promise<YouTubeSavedPhoto[]>{
 if(!client)throw new Error('Para ver las fotos guardadas, conecta el Studio.');
 const who=await owner();
 const {data:rows,error}=await client.from('podcast_youtube_photo_assets')
   .select('shot_id,episode,object_path,file_name,file_size')
   .eq('user_id',who.id).order('shot_id',{ascending:true});
 if(error)throw new Error('No se pudo consultar la galería privada: '+error.message);
 if(!rows?.length)return [];
 const {data:signed,error:signError}=await client.storage.from(YOUTUBE_PHOTO_BUCKET)
   .createSignedUrls(rows.map(photo=>photo.object_path),1800);
 if(signError)throw new Error('No se pudo cargar la vista previa de las fotos: '+signError.message);
 return rows.map((photo,index)=>({
   shot_id:photo.shot_id,episode:photo.episode,object_path:photo.object_path,
   file_name:photo.file_name,file_size:photo.file_size,url:signed?.[index]?.signedUrl||''
 }));
}
export async function uploadYouTubePhoto(shotId:string,file:File):Promise<void>{
 if(!client)throw new Error('El Studio necesita una conexión válida para guardar fotos.');
 const episode=validatedYouTubeShot(shotId);
 const types:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
 const ext=types[file.type];
 if(!ext||file.size===0)throw new Error('Selecciona una imagen PNG, JPG o WEBP.');
 if(file.size>YOUTUBE_PHOTO_MAX_BYTES)throw new Error('La foto supera 15 MB. Reduce su peso sin perder resolución y vuelve a intentar.');
 const who=await owner();
 const {data:old,error:oldError}=await client.from('podcast_youtube_photo_assets')
   .select('object_path').eq('user_id',who.id).eq('shot_id',shotId).maybeSingle();
 if(oldError)throw new Error('No se pudo consultar la foto anterior.');
 const path=who.id+'/'+String(episode).padStart(2,'0')+'/'+shotId+'/'+crypto.randomUUID()+'.'+ext;
 const {error:uploadError}=await client.storage.from(YOUTUBE_PHOTO_BUCKET).upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
 if(uploadError)throw new Error('No se pudo guardar la imagen original: '+uploadError.message);
 const {error:saveError}=await client.from('podcast_youtube_photo_assets').upsert({
   user_id:who.id,shot_id:shotId,episode,object_path:path,
   file_name:(file.name||shotId+'.'+ext).slice(0,180),file_size:file.size,
   updated_at:new Date().toISOString()
 },{onConflict:'user_id,shot_id'});
 if(saveError){
   await client.storage.from(YOUTUBE_PHOTO_BUCKET).remove([path]);
   throw new Error('No se pudo asignar la foto a este plano: '+saveError.message);
 }
 if(old?.object_path&&old.object_path!==path){
   // La foto actual ya quedó guardada: la limpieza de la anterior es secundaria.
   await client.storage.from(YOUTUBE_PHOTO_BUCKET).remove([old.object_path]);
 }
}
export async function removeYouTubePhoto(shotId:string):Promise<void>{
 if(!client)throw new Error('El Studio debe estar conectado para borrar fotos.');
 validatedYouTubeShot(shotId);
 const who=await owner();
 const {data:old,error:readError}=await client.from('podcast_youtube_photo_assets')
   .select('object_path').eq('user_id',who.id).eq('shot_id',shotId).maybeSingle();
 if(readError)throw new Error('No se pudo localizar la foto.');
 if(!old?.object_path)return;
 const {error:deleteError}=await client.from('podcast_youtube_photo_assets').delete()
   .eq('user_id',who.id).eq('shot_id',shotId);
 if(deleteError)throw new Error('No se pudo quitar la foto del capítulo: '+deleteError.message);
 const {error:storageError}=await client.storage.from(YOUTUBE_PHOTO_BUCKET).remove([old.object_path]);
 if(storageError)throw new Error('Se quitó la foto del capítulo, pero no se pudo limpiar su archivo privado.');
}


/* Class inspiration gallery — edited only by a verified Studio owner.
   RLS restricts UPDATE to podcast_studio_admins.role='owner'; students have
   read-only access to ready course resources, never the publishing controls. */
const CLASSROOM_COURSE_ID='primera-landing-ia-01';
type ClassroomDemoPhoto={name:string;url:string;order:number;label_es?:string;label_en?:string;section_es?:string;section_en?:string;usage?:'hero'|'section'|'reference'|'graphic';display_order?:number};
type ClassroomDemoStep={title:string;step:string;body:string;order:number;photos:{title:string;body:string}[]};
export type ClassroomDemoEntry={
 id:string;title:string;category:string;category_es:string;category_en:string;
 url:string;image:string;description_es:string;description_en:string;
 notes_es:string;notes_en:string;published:boolean;
 photos:ClassroomDemoPhoto[];prompts:ClassroomDemoStep[];video_url?:string;
 graphics?:ClassroomDemoPhoto[];
};
type ClassroomGalleryPayload={version?:number;demos:ClassroomDemoEntry[];[key:string]:unknown};
type ClassroomExtraCase={
 replacePhotos?:boolean;photos?:ClassroomDemoPhoto[];prompts?:ClassroomDemoStep[];
 graphics?:ClassroomDemoPhoto[];[key:string]:unknown;
};
type ClassroomExtras={version:number;cases:Record<string,ClassroomExtraCase>;[key:string]:unknown};
const CLASSROOM_EXTRAS='inspiration_gallery_extras_v1';
const fileKey=(url:string)=>String(url||'').split('?')[0];
function reconcileClassroomPhotos(primary:ClassroomDemoPhoto[],additional:ClassroomDemoPhoto[]){
 const current=[...primary],existing=new Set(current.map(p=>fileKey(p.url)));
 for(const photo of additional){
  const id=fileKey(photo.url);
  if(!/^https:\/\//.test(id)||existing.has(id))continue;
  current.push(photo);existing.add(id);
 }
 return current;
}
async function readClassroomDemoPayload():Promise<ClassroomGalleryPayload>{
 if(!client)throw Error('El Studio no está conectado.');
 await owner();
 const {data,error}=await client.from('podcast_class_learning_assets')
  .select('payload').eq('course_id',CLASSROOM_COURSE_ID)
  .eq('asset_code','inspiration_gallery_v1').eq('status','ready').single();
 if(error||!data?.payload)throw Error('No se pudo consultar Inspiración del aula.');
 const payload=data.payload as ClassroomGalleryPayload;
 if(!Array.isArray(payload.demos))throw Error('La biblioteca de demos del aula no es válida.');
 return payload;
}
async function readClassroomExtras():Promise<ClassroomExtras>{
 if(!client)throw Error('El Studio no está conectado.');
 await owner();
 const {data,error}=await client.from('podcast_class_learning_assets')
  .select('payload').eq('course_id',CLASSROOM_COURSE_ID)
  .eq('asset_code',CLASSROOM_EXTRAS).eq('status','ready').maybeSingle();
 if(error)throw Error('No se pudieron consultar las fotografías complementarias.');
 const value=data?.payload as ClassroomExtras|undefined;
 return value&&value.cases?value:{version:1,cases:{}};
}
function mergeClassroomGallery(demos:ClassroomDemoEntry[],extra:ClassroomExtras):ClassroomDemoEntry[]{
 return demos.map(d=>{
  const e=extra.cases[d.id];
  if(!e)return d;
  const originals=Array.isArray(d.photos)?d.photos:[];
  const photoExtras=Array.isArray(e.photos)?e.photos:[];
  return {...d,
   photos:e.replacePhotos?photoExtras:reconcileClassroomPhotos(originals,photoExtras),
   prompts:(d.prompts?.length||0)>0?d.prompts:(e.prompts||[]),
   graphics:Array.isArray(e.graphics)?e.graphics:[]
  };
 });
}
export async function getClassroomDemoCatalog():Promise<ClassroomDemoEntry[]>{
 const [main,extra]=await Promise.all([readClassroomDemoPayload(),readClassroomExtras()]);
 return mergeClassroomGallery(main.demos,extra);
}
async function updateClassroomExtras(payload:ClassroomExtras):Promise<void>{
 if(!client)throw Error('El Studio no está conectado.');
 const {data,error}=await client.from('podcast_class_learning_assets')
  .update({payload}).eq('course_id',CLASSROOM_COURSE_ID)
  .eq('asset_code',CLASSROOM_EXTRAS).eq('status','ready')
  .select('payload').single();
 if(error||!data?.payload)throw Error('No se pudieron guardar las fotos complementarias.');
}
export async function setClassroomDemoVisibility(entry:ClassroomDemoEntry,visible:boolean):Promise<ClassroomDemoEntry[]>{
 if(!client)throw Error('No hay conexión con la biblioteca del aula.');
 if(!entry?.id||!entry?.url?.startsWith('https://'))throw Error('El demo no tiene enlace público válido.');
 const [main,extras]=await Promise.all([readClassroomDemoPayload(),readClassroomExtras()]);
 const demos=[...main.demos];
 const index=demos.findIndex(d=>d.id===entry.id);
 if(index===-1&&!visible)throw Error('Este demo todavía no está añadido al aula.');
 if(visible){
  const original=index>=0?demos[index]:null;
  const ex=extras.cases[entry.id]||{};
  const existing=Array.isArray(original?.photos)?original.photos:[];
  const saved=Array.isArray(ex.photos)?ex.photos:[];
  const extrasToAdd=(entry.photos||[]).filter(p=>!existing.some(x=>fileKey(x.url)===fileKey(p.url)));
  const photos=reconcileClassroomPhotos(saved,extrasToAdd);
  // Preserve curated labels, active-photo sets and archive exclusions; never
  // reconstruct historical imagery by synchronizing a larger Studio kit.
  const originalPrompts=original?.prompts||[];
  const prompts=originalPrompts.length?ex.prompts:(ex.prompts?.length?ex.prompts:entry.prompts);
  const revised={...extras,cases:{...extras.cases,[entry.id]:{...ex,photos,prompts}}};
  if(JSON.stringify(revised)!==JSON.stringify(extras))await updateClassroomExtras(revised);
 }
 if(index<0){
  // New demos store only compact metadata in the limited-size main gallery;
  // verified photos and prompts are stored independently, avoiding overflow.
  demos.push({...entry,published:true,photos:[],prompts:[]});
 }else{
  const old=demos[index];
  demos[index]={...old,published:visible,
   // Preserve existing source-of-truth and metadata instead of overwriting
   // site photography with stale Studio file lists.
   description_es:old.description_es||entry.description_es,
   description_en:old.description_en||entry.description_en
  };
 }
 const {data,error}=await client.from('podcast_class_learning_assets')
  .update({payload:{...main,demos}})
  .eq('course_id',CLASSROOM_COURSE_ID).eq('asset_code','inspiration_gallery_v1')
  .eq('status','ready').select('payload').single();
 if(error||!data?.payload)throw Error('No se pudo guardar la selección. No se alteraron los originales.');
 const returned=(data.payload as ClassroomGalleryPayload).demos;
 if(!Array.isArray(returned)||returned.find(d=>d.id===entry.id)?.published!==visible)
  throw Error('No se pudo comprobar la selección guardada.');
 return getClassroomDemoCatalog();
}

/* OFF BRIEF YouTube channel brand vault; admin-only private storage, no public URLs. */
const BRAND_BUCKET='podcast-youtube-brand';
const brandIds=/^(logo_primary|logo_compact|channel_banner|channel_avatar|motif_duck|motif_clapper|lower_third|transition_card|video_bumper|sfx_sting|cover_s[12]_e0[1-8])$/;
const allowedBrandTypes:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav'};
export type StudioBrandAsset={asset_id:string;object_path:string;file_name:string;mime_type:string;file_size:number;url:string;updated_at:string};
export type StudioBrandCopy={copy_key:string;content:string;updated_at:string};
function checkBrandAsset(id:string){if(!brandIds.test(id))throw new Error('Elemento de marca no reconocido.');}
export async function loadYouTubeBrandVault():Promise<{assets:StudioBrandAsset[];copies:StudioBrandCopy[]}>{
 if(!client)throw new Error('Abre el Studio con tu sesión de administración.');
 const who=await owner();
 const [assetsRes,copiesRes]=await Promise.all([
 client.from('podcast_youtube_brand_assets').select('asset_id,object_path,file_name,mime_type,file_size,updated_at').eq('user_id',who.id).order('asset_id'),
 client.from('podcast_youtube_brand_copy').select('copy_key,content,updated_at').eq('user_id',who.id).order('copy_key')
 ]);
 if(assetsRes.error)throw new Error('No se pudo leer la biblioteca de identidad: '+assetsRes.error.message);
 if(copiesRes.error)throw new Error('No se pudieron leer los slogans: '+copiesRes.error.message);
 const rows=assetsRes.data||[];
 if(!rows.length)return {assets:[],copies:copiesRes.data||[]};
 const {data:signed,error}=await client.storage.from(BRAND_BUCKET).createSignedUrls(rows.map(p=>p.object_path),3600);
 if(error)throw new Error('No se pudieron crear las vistas previas privadas: '+error.message);
 return {assets:rows.map((p,i)=>({...p,url:signed?.[i]?.signedUrl||''})),copies:copiesRes.data||[]};
}
export async function uploadYouTubeBrandAsset(id:string,file:File,maxMb:number):Promise<void>{
 if(!client)throw new Error('El Studio no está conectado.');
 checkBrandAsset(id);
 // Files selected from iOS Files / Google Drive may omit the MIME type.
 const guessedMime:Record<string,string>={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg',wav:'audio/wav'};
 const fileExtension=file.name.toLowerCase().split('.').pop()||'';
 const mime=allowedBrandTypes[file.type]?file.type:(!file.type||file.type==='application/octet-stream')?(guessedMime[fileExtension]||''):'';
 const ext=allowedBrandTypes[mime];
 if(!ext||file.size<=0)throw new Error('Archivo no válido. Usa PNG, JPG, WEBP, MP4, WEBM, MP3 o WAV.');
 if(id==='video_bumper'&&!['video/mp4','video/webm'].includes(mime))throw new Error('Para la animación del logo, selecciona un MP4 o WEBM.');
 const limit=Math.min(Math.max(1,maxMb),50)*1000000;
 if(file.size>limit)throw new Error('El archivo supera el límite de '+maxMb+' MB para este elemento.');
 const who=await owner();
 const {data:old,error:readError}=await client.from('podcast_youtube_brand_assets').select('object_path')
  .eq('user_id',who.id).eq('asset_id',id).maybeSingle();
 if(readError)throw new Error('No se pudo revisar la versión anterior.');
 const path=who.id+'/'+id+'/'+crypto.randomUUID()+'.'+ext;
 const {error:uploadError}=await client.storage.from(BRAND_BUCKET).upload(path,file,{contentType:mime,cacheControl:'3600',upsert:false});
 if(uploadError)throw new Error('No se pudo subir el archivo: '+uploadError.message);
 const {error:saveError}=await client.from('podcast_youtube_brand_assets').upsert({
   user_id:who.id,asset_id:id,object_path:path,file_name:(file.name||id+'.'+ext).slice(0,180),
   mime_type:mime,file_size:file.size,updated_at:new Date().toISOString()
 },{onConflict:'user_id,asset_id'});
 if(saveError){
  await client.storage.from(BRAND_BUCKET).remove([path]);
  throw new Error('No se pudo vincular el archivo al elemento: '+saveError.message);
 }
 if(old?.object_path&&old.object_path!==path)await client.storage.from(BRAND_BUCKET).remove([old.object_path]);
}
export async function removeYouTubeBrandAsset(id:string):Promise<void>{
 if(!client)throw new Error('El Studio no está conectado.');
 checkBrandAsset(id);
 const who=await owner();
 const {data:old,error:readError}=await client.from('podcast_youtube_brand_assets')
 .select('object_path').eq('user_id',who.id).eq('asset_id',id).maybeSingle();
 if(readError)throw new Error('No se encontró el elemento.');
 if(!old?.object_path)return;
 const {error:deleteError}=await client.from('podcast_youtube_brand_assets').delete()
   .eq('user_id',who.id).eq('asset_id',id);
 if(deleteError)throw new Error('No se pudo eliminar el elemento: '+deleteError.message);
 const {error:deleteFileError}=await client.storage.from(BRAND_BUCKET).remove([old.object_path]);
 if(deleteFileError)throw new Error('La ficha se eliminó, pero no pudo limpiarse el archivo anterior.');
}
export async function saveYouTubeBrandCopy(key:string,content:string):Promise<void>{
 if(!client)throw new Error('El Studio no está conectado.');
 if(!/^[a-z][a-z0-9_]{1,40}$/.test(key))throw new Error('Clave de texto inválida.');
 const clean=content.trim();
 if(!clean||clean.length>1500)throw new Error('Escribe entre 1 y 1500 caracteres.');
 const who=await owner();
 const {error}=await client.from('podcast_youtube_brand_copy').upsert({
  user_id:who.id,copy_key:key,content:clean,updated_at:new Date().toISOString()
 },{onConflict:'user_id,copy_key'});
 if(error)throw new Error('No se pudo guardar el slogan: '+error.message);
}


/* Public website portfolio selection. Owner-only writes; RLS also checks
   podcast_studio_admins.role='owner'. Only demo ID and visibility are public. */
export type WebsiteDemoVisibilityRow={demo_id:string;visible:boolean};
export async function getWebsiteDemoVisibility():Promise<WebsiteDemoVisibilityRow[]>{
 if(!client)throw Error('El Studio no está conectado.');
 await owner();
 const {data,error}=await client.from('tle_website_demo_visibility')
  .select('demo_id,visible').order('demo_id');
 if(error)throw Error('No se pudo consultar la visibilidad pública de los demos.');
 return (data||[]) as WebsiteDemoVisibilityRow[];
}
export async function setWebsiteDemoVisibility(demoId:string,visible:boolean):Promise<void>{
 if(!client)throw Error('El Studio no está conectado.');
 if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(demoId))throw Error('Este demo no tiene un identificador válido.');
 await owner();
 const {data,error}=await client.from('tle_website_demo_visibility')
  .upsert({demo_id:demoId,visible,updated_at:new Date().toISOString()},{onConflict:'demo_id'})
  .select('demo_id,visible').single();
 if(error||!data||data.demo_id!==demoId||data.visible!==visible)
  throw Error('No se pudo verificar el cambio de visibilidad. Reintenta sin salir del Studio.');
}

/* Private owner-only prospect pipeline. Never exposed by the public marketing CRM. */
import type {StudioProspect,StudioProspectInput,ProspectStage} from './prospects-model';

const PROSPECTS_TABLE='tle_studio_prospects';

export async function getStudioProspects():Promise<StudioProspect[]> {
  if(!client)throw new Error('El Studio necesita conexión segura para guardar prospectos.');
  const session=await owner();
  const {data,error}=await client.from(PROSPECTS_TABLE).select('*')
    .eq('owner_id',session.id).order('created_at',{ascending:false}).limit(1000);
  if(error)throw new Error('No pudimos cargar tus prospectos: '+error.message);
  return (data||[]) as StudioProspect[];
}
export async function saveStudioProspect(input:StudioProspectInput,id?:string):Promise<StudioProspect> {
  if(!client)throw new Error('El Studio necesita conexión segura para guardar prospectos.');
  const session=await owner();
  const record={...input,owner_id:session.id};
  const query=id
    ?client.from(PROSPECTS_TABLE).update(record).eq('id',id).eq('owner_id',session.id)
    :client.from(PROSPECTS_TABLE).insert(record);
  const {data,error}=await query.select('*').single();
  if(error||!data)throw new Error('No se pudo guardar el prospecto: '+(error?.message||'Sin permiso.'));
  return data as StudioProspect;
}
export async function moveStudioProspect(id:string,stage:ProspectStage):Promise<StudioProspect> {
  if(!client)throw new Error('El Studio necesita conexión segura para guardar prospectos.');
  const session=await owner();
  const {data,error}=await client.from(PROSPECTS_TABLE).update({stage,updated_at:new Date().toISOString()})
    .eq('id',id).eq('owner_id',session.id).select('*').single();
  if(error||!data)throw new Error('No se pudo mover la oportunidad: '+(error?.message||'Sin permiso.'));
  return data as StudioProspect;
}
export async function deleteStudioProspect(id:string):Promise<void> {
  if(!client)throw new Error('El Studio necesita conexión segura para guardar prospectos.');
  const session=await owner();
  const {data,error}=await client.from(PROSPECTS_TABLE).delete()
    .eq('id',id).eq('owner_id',session.id).select('id').single();
  if(error||!data)throw new Error('No se pudo borrar el prospecto: '+(error?.message||'Sin permiso.'));
}
