
import { createClient } from '@supabase/supabase-js';

const url=String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_URL||'');
const key=String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY||'');
const configured=Boolean(url&&key);
const sb=createClient(url||'https://not-configured.supabase.co',key||'missing-public-key',{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
const bucket='content-lab-private';
const requireConfig=()=>{if(!configured)throw Error('Configura VITE_CONTENT_LAB_SUPABASE_URL y VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY en tu entorno.');};
const out=(r:any)=>{if(r.error)throw Error(r.error.message||'Error de Supabase');return r.data;};
const current=async()=>{requireConfig();const {data:{user},error}=await sb.auth.getUser();if(error||!user)throw Error('Inicia sesión para continuar.');return user;};
const tab=(name:string)=>sb.from('content_lab_'+name);
const unwrap=(r:any)=>({...r.payload,id:r.id});
const list=async(name:string):Promise<any[]>=>out(await tab(name).select('id,payload').order('created_at',{ascending:true})).map(unwrap);
const read=async(name:string,id:string)=>{const x=out(await tab(name).select('id,payload').eq('id',id).maybeSingle());if(!x)throw Error('Registro no encontrado.');return unwrap(x);};
const add=async(name:string,payload:any)=>{const me=await current();return unwrap(out(await tab(name).insert({owner_id:me.id,payload}).select('id,payload').single()));};
const update=async(name:string,id:string,payload:any)=>{
  const existing=await read(name,id);
  const {id:discard,...original}=existing;
  return unwrap(out(await tab(name).update({payload:{...original,...payload},updated_at:new Date().toISOString()}).eq('id',id).select('id,payload').single()));
};
const remove=async(name:string,id:string)=>{out(await tab(name).delete().eq('id',id));return {deleted:true}};
const base64=(blob:Blob)=>new Promise<string>((resolve,reject)=>{
  const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');
  r.onerror=()=>reject(Error('No se pudo leer la foto.'));r.readAsDataURL(blob);
});
const seed=async()=>{
  const brands=await list('brands');if(brands.length)return brands;
  const me=await current();
  const profiles=[
    {name:'The Launch Era',handle:'@thelaunchera_ai',audience:'Residential cleaning business owners in the USA',voice:'Clear, modern, human and premium',rules:'Public copy US English only. Focus on bookings, clients, quotes, invoices, jobs, follow-ups and cleaning operations. Never invent functionality. Real screenshots stay unaltered.',language:'English',color:'#BED8E9',background:'#FAF8F3'},
    {name:'Todavía estoy a tiempo',handle:'',audience:'Personas que sienten que van tarde y quieren volver a empezar',voice:'Íntimo, humano, conversacional',rules:'Todo el contenido público en español latino. No inventar episodios, historias personales o detalles íntimos. Mantener las cuentas separadas.',language:'Español',color:'#CDB8A9',background:'#F8EEE8'}
  ];
  return out(await tab('brands').insert(profiles.map(payload=>({owner_id:me.id,payload}))).select('id,payload')).map(unwrap);
};
async function useEdge(action:string,body:any){
  const {data,error}=await sb.functions.invoke('content-lab-generate',{body:{action,...body}});
  if(error)throw Error(error.message||'El servicio de IA no respondió.');
  if(data?.error)throw Error(data.error);
  return data;
}
export const auth={
  getUser:async():Promise<{email?:string}|null>=>{
    if(!configured)return null;
    const {data:{user}}=await sb.auth.getUser();
    if(!user)return null;
    const {data}=await tab('admins').select('user_id').eq('user_id',user.id).maybeSingle();
    return data?{email:user.email}:null;
  },
  signInWithOtp:async(email:string)=>{
    requireConfig();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Introduce tu correo electrónico.');
    out(await sb.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:window.location.origin+window.location.pathname}}));
  },
  signOut:async()=>{out(await sb.auth.signOut())}
};
export const api={
  get:async(path:string):Promise<{data:any}>=>{
    requireConfig();
    if(path==='/api/data'){
      const brands=await seed();
      const [posts,assets]=await Promise.all([list('posts'),list('assets')]);
      return {data:{brands,posts,assets}};
    }
    if(path==='/api/grids')return {data:{grids:await list('grids')}};
    if(path.startsWith('/api/assets/')){
      const id=decodeURIComponent(path.slice('/api/assets/'.length));
      const asset=await read('assets',id);
      const file=out(await sb.storage.from(bucket).download(asset.path));
      return {data:{mime:asset.mime,content:await base64(file)}};
    }
    throw Error('Ruta no disponible: '+path);
  },
  post:async(path:string,payload:any):Promise<{data:any}>=>{
    requireConfig();
    if(path==='/api/brands')return {data:await add('brands',payload)};
    if(path==='/api/posts')return {data:await add('posts',payload)};
    if(path==='/api/assets'){
      const me=await current();
      const bytes=Uint8Array.from(atob(payload.content),c=>c.charCodeAt(0));
      if(bytes.byteLength>5_000_000)throw Error('La imagen excede el límite optimizado.');
      const mime=String(payload.mime||'image/jpeg');
      const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
      const path=me.id+'/'+crypto.randomUUID()+'.'+ext;
      out(await sb.storage.from(bucket).upload(path,bytes,{contentType:mime,upsert:false}));
      try{
        // Cloudflare FLUX.2 Klein accepts image-to-image reference photos smaller than 512x512.
        // Keep the original resolution in private Storage and a separate tiny reference in owner-only RLS.
        const original=await (await fetch('data:'+mime+';base64,'+payload.content)).blob();
        const preview=await image.resizeIfNeeded(original,{maxDimension:480,maxPixels:230400,quality:0.68,mimeType:'image/jpeg'});
        return {data:await add('assets',{brandId:payload.brandId,path,mime,name:payload.name,aiReference:preview.data})};
      }
      catch(e){await sb.storage.from(bucket).remove([path]);throw e;}
    }
    if(['/api/ideas','/api/ai-image','/api/grid-plan','/api/grid-image','/api/connection-test'].includes(path))
      return {data:await useEdge(path.slice(5),payload)};
    throw Error('Ruta no disponible: '+path);
  },
  put:async(path:string,payload:any):Promise<{data:any}>=>{
    const m=path.match(/^\/api\/(brands|posts|grids)\/([^/]+)$/);
    if(!m)throw Error('Ruta de edición inválida.');
    return {data:await update(m[1],decodeURIComponent(m[2]),payload)};
  },
  delete:async(path:string):Promise<{data:any}>=>{
    const m=path.match(/^\/api\/(posts|assets)\/([^/]+)$/);
    if(!m)throw Error('Ruta de borrado inválida.');
    const id=decodeURIComponent(m[2]);
    if(m[1]==='assets'){
      const asset=await read('assets',id);
      await remove('assets',id);
      out(await sb.storage.from(bucket).remove([asset.path]));
    }else await remove('posts',id);
    return {data:{deleted:true}};
  }
};
export const image={
  resizeIfNeeded:async(input:File|Blob,opts:{maxDimension:number;maxPixels:number;quality:number;mimeType:string})=>{
    const url=URL.createObjectURL(input);
    try{
      const img=new Image();img.src=url;await img.decode();
      const scale=Math.min(1,opts.maxDimension/Math.max(img.naturalWidth,img.naturalHeight),Math.sqrt(opts.maxPixels/(img.naturalWidth*img.naturalHeight)));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas no disponible.');
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('No se pudo comprimir la foto')),opts.mimeType,opts.quality));
      return {data:await base64(blob),mimeType:opts.mimeType};
    }finally{URL.revokeObjectURL(url)}
  }
};
