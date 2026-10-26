import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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
  for(const k of ['status','date','summary','subtitle','price','link','notes','section','priority','audio','art','script','announcement_state','script_reviewed','number','series','series_number','spotify_description','reel_excerpt','reel_overlay','visual_idea','performance_notes']) {
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
  if(roleError || !admin){ throw Object.assign(new Error('La sesión existe, pero el acceso de administradora todavía no está autorizado.'),{code:'unauthorized'}); }
  return {id:user.id,email:user.email||''};
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
    catch { return null; }
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user)return null;
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
