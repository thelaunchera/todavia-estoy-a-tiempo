import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  auth as localAuth, api as localApi, hasLocalVault,
  downloadEncryptedBackup, importEncryptedBackup
} from './local-client';

export { hasLocalVault, downloadEncryptedBackup, importEncryptedBackup };

const url = (import.meta.env.VITE_PODCAST_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_PODCAST_SUPABASE_PUBLISHABLE_KEY || '').trim();
export const SUPABASE_ENABLED = /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)
  && (key.startsWith('sb_publishable_') || key.startsWith('eyJ'));
const client: SupabaseClient | null = SUPABASE_ENABLED
  ? createClient(url, key, {
      auth: { persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce' }
    })
  : null;

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
  for(const k of ['status','date','summary','subtitle','price','link','notes','section','priority','audio','art']) {
    const v=value[k];
    if(k==='price' && typeof v==='number' && Number.isFinite(v) && v>=0) content[k]=Math.round(v*100)/100;
    else if(typeof v==='string')content[k]=v.trim().slice(0,k==='notes'?3000:500);
  }
  return {title,payload:content};
}
async function owner():Promise<{id:string;email:string}> {
  if(!client)throw new Error('Supabase no está configurado.');
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)throw new Error('Inicia sesión para continuar.');
  const {data:admin,error:roleError}=await client.from('podcast_studio_admins')
    .select('user_id').eq('user_id',user.id).maybeSingle();
  if(roleError || !admin)throw Object.assign(new Error('Esta cuenta no tiene acceso al estudio.'),{code:'unauthorized'});
  return {id:user.id,email:user.email||''};
}
export const auth={
  async getUser(){
    if(!client) return localAuth.getUser();
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user)return null;
    const admin=await owner();
    return {email:admin.email,name:'Administración del podcast'};
  },
  async signIn(value:string){
    if(!client)return localAuth.signIn(value);
    const email=value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Introduce un correo válido.');
    const redirect=window.location.origin+window.location.pathname;
    const {error}=await client.auth.signInWithOtp({
      email, options:{emailRedirectTo:redirect,shouldCreateUser:false}
    });
    if(error)throw new Error('No pude enviar el enlace de acceso. Comprueba el correo configurado.');
    return {user:null,sent:true} as const;
  },
  async signOut(){
    if(!client)return localAuth.signOut();
    const {error}=await client.auth.signOut();
    if(error)throw error;
  }
};
export const api={
  async get(path:string){
    if(!client)return localApi.get(path);
    if(path!=='/api/studio')throw new Error('Ruta desconocida.');
    await owner();
    const [entries,sales,subscribers,messages,deliveries,runs]=await Promise.all([
      client.from('podcast_studio_entries').select('id,kind,title,payload,user_id').order('created_at',{ascending:true}).limit(500),
      client.from('podcast_sales').select('id',{count:'exact',head:true}),
      client.from('podcast_subscribers').select('id',{count:'exact',head:true}).is('unsubscribed_at',null),
      client.from('podcast_support_messages').select('id',{count:'exact',head:true}),
      client.from('podcast_delivery_events').select('id',{count:'exact',head:true}),
      client.from('podcast_automation_runs').select('id',{count:'exact',head:true})
    ]);
    if(entries.error)throw entries.error;
    const records:Record<Kind,Entry[]>={episodios:[],tareas:[],productos:[],ideas:[]};
    for(const row of entries.data||[]){
      const r=row as DbEntry;
      if(kinds.includes(r.kind))records[r.kind].push(mapped(r));
    }
    const fmt=(value:number|null,err:unknown)=>err?'Sin sincronizar':value===null?'Pendiente':String(value);
    return {data:{
      records,
      sources:{
        sales:'Pagos registrados: '+fmt(sales.count,sales.error)+'. Nuevos eventos de pago requieren un webhook verificado.',
        subscribers:'Suscripciones vigentes registradas: '+fmt(subscribers.count,subscribers.error)+'. Sincronización desde Make pendiente.',
        support:'Mensajes registrados: '+fmt(messages.count,messages.error)+'. Conexión con correo pendiente.',
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
