
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
const stickerRecord=(x:any)=>({
 id:'shared-'+x.id,brandId:'shared',name:x.name,displayName:x.name,
 mime:'image/png',category:'sticker',shared:true,stickerGroup:x.category,
 sizeBytes:x.size_bytes,sha256:x.sha256
});
const sharedStickers=async()=>{
 // RLS returns the curated shared catalogue only to the admin or paid members.
 const {data,error}=await tab('sticker_catalog')
  .select('id,name,category,size_bytes,sha256').eq('published',true).order('created_at',{ascending:true});
 if(error)throw Error(error.message);
 return (data||[]).map(stickerRecord);
};

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
  const {data:owner}=await tab('admins').select('user_id').eq('user_id',me.id).maybeSingle();
  if(!owner){
    // A new buyer gets ONLY their own neutral brand (never the owner's profiles).
    const personal=await add('brands',{
      name:'My Brand',handle:'',audience:'',voice:'Friendly, clear, human',
      rules:'No fabricated business claims or personal biography.',
      language:'English',color:'#BED8E9',background:'#FAF8F3'
    });
    return [personal];
  }
  const profiles=[
    {name:'The Launch Era',handle:'@thelaunchera_ai',audience:'Residential cleaning business owners in the USA',voice:'Clear, modern, human and premium',rules:'Public copy US English only. Focus on bookings, clients, quotes, invoices, jobs, follow-ups and cleaning operations. Never invent functionality. Real screenshots stay unaltered.',language:'English',color:'#BED8E9',background:'#FAF8F3'},
    {name:'Todavía estoy a tiempo',handle:'',audience:'Personas que sienten que van tarde y quieren volver a empezar',voice:'Íntimo, humano, conversacional',rules:'Todo el contenido público en español latino. No inventar episodios, historias personales o detalles íntimos. Mantener las cuentas separadas.',language:'Español',color:'#CDB8A9',background:'#F8EEE8'}
  ];
  return out(await tab('brands').insert(profiles.map(payload=>({owner_id:me.id,payload}))).select('id,payload')).map(unwrap);
};
async function useEdge(action:string,body:any){
  const {data,error}=await sb.functions.invoke('content-lab-generate',{body:{action,...body}});
  if(error){
    // Supabase wraps non-2xx responses in a generic error. Read the JSON response
    // so the user sees the real reason (wrong brand, credentials, or free quota).
    let message='';
    const context=(error as {context?:Response}).context;
    if(context&&typeof context.json==='function'){
      try{
        const payload=await context.clone().json();
        message=typeof payload?.error==='string'?payload.error:
                typeof payload?.message==='string'?payload.message:'';
      }catch{/* Preserve the original error when response is not JSON. */}
    }
    throw Error(message||error.message||'El servicio de IA no respondió.');
  }
  if(data?.error)throw Error(data.error);
  return data;
}
export const auth={
  getUser:async():Promise<{email?:string}|null>=>{
    if(!configured)return null;
    const {data:{user}}=await sb.auth.getUser();
    if(!user)return null;
    const {data:admin}=await tab('admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(admin)return {email:user.email};
    if(!user.email)return null;
    // Server-enforced RLS returns only this verified email's active membership.
    const {data:paid}=await sb.from('content_lab_memberships')
      .select('id').eq('buyer_email',user.email.trim().toLowerCase()).eq('status','active').maybeSingle();
    return paid?{email:user.email}:null;
  },
  signInWithOtp:async(email:string,preferredLanguage:'es'|'en'='es')=>{
    requireConfig();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Introduce tu correo electrónico.');
    // New buyers can sign in after a verified checkout. Unpaid accounts have
    // no membership and cannot read or write Content Lab rows or Storage.
    out(await sb.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true,data:{content_lab_language:preferredLanguage},emailRedirectTo:window.location.origin+window.location.pathname}}));
  },
  verifyEmailOtp:async(email:string,code:string)=>{
    requireConfig();
    if(!/^[0-9]{6,8}$/.test(code))throw Error('Introduce el código numérico que recibiste por correo.');
    const result=out(await sb.auth.verifyOtp({email:email.trim(),token:code,type:'email'}));
    if(!result?.session)throw Error('No se pudo completar el acceso. Solicita un código nuevo.');
    return result;
  },
  getPreferredLanguage:async():Promise<'es'|'en'|null>=>{
    if(!configured)return null;
    const {data:{user}}=await sb.auth.getUser();
    const lang=user?.user_metadata?.content_lab_language;
    return lang==='es'||lang==='en'?lang:null;
  },
  setPreferredLanguage:async(lang:'es'|'en')=>{
    if(!configured)return;
    out(await sb.auth.updateUser({data:{content_lab_language:lang}}));
  },
  signOut:async()=>{out(await sb.auth.signOut())}
};
export const api={
  get:async(path:string):Promise<{data:any}>=>{
    requireConfig();
    if(path==='/api/sticker-catalog')return {data:await sharedStickers()};
    if(path==='/api/data'){
      const brands=await seed();
      const [posts,assets,catalogue]=await Promise.all([list('posts'),list('assets'),sharedStickers()]);
      return {data:{brands,posts,assets:[...assets,...catalogue]}};
    }
    if(path==='/api/grids')return {data:{grids:await list('grids')}};
    if(path==='/api/prompts')return {data:await list('prompts')};
    if(path==='/api/prompt-templates'){
      // Supabase RLS checks active paid membership or admin and never serves anon.
      const {data,error}=await sb.from('content_lab_prompt_catalogue').select('id,category,title,body').order('id',{ascending:true});
      if(error)throw Error(error.message);
      return {data:data||[]};
    }
    if(path==='/api/ai-wallet'){
      const me=await current();
      const {data:owner}=await tab('admins').select('user_id').eq('user_id',me.id).maybeSingle();
      if(owner)return {data:{admin:true}};
      const {data:wallet,error}=await sb.from('content_lab_ai_wallets')
       .select('photo_remaining,creative_remaining,photo_today,creative_today,quota_day')
       .eq('user_id',me.id).maybeSingle();
      if(error)throw Error(error.message);
      return {data:wallet||{photo_remaining:60,creative_remaining:30,photo_today:0,creative_today:0,quota_day:''}};
    }
    if(path.startsWith('/api/assets/')){
      const id=decodeURIComponent(path.slice('/api/assets/'.length));
      if(id.startsWith('shared-')){
        const uid=id.slice(7);
        if(!/^[a-f0-9-]{36}$/i.test(uid))throw Error('Sticker no válido.');
        const {data:entry,error}=await tab('sticker_catalog').select('path').eq('id',uid).eq('published',true).maybeSingle();
        if(error)throw Error(error.message);
        if(!entry)throw Error('Sticker no disponible para esta cuenta.');
        const file=out(await sb.storage.from(bucket).download(entry.path));
        return {data:{mime:'image/png',content:await base64(file)}};
      }
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
    if(path==='/api/prompts'){
      const text=String(payload?.text||'').slice(0,4800);
      if(!text.trim())throw Error('El prompt no puede estar vacío.');
      if((await list('prompts')).length>=100)throw Error('Ya guardaste 100 prompts. Elimina uno antes de guardar otro.');
      return {data:await add('prompts',{
        brandId:String(payload?.brandId||''),title:String(payload?.title||'Mi prompt').slice(0,100),
        text,settings:payload?.settings||null,favorite:false
      })};
    }
    if(path==='/api/sticker-catalog'){
      // The shared catalogue is a curated admin publication, NEVER a
      // user-owned upload. Verify the role again; RLS enforces it server side.
      const me=await current();
      const {data:admin,error:roleError}=await tab('admins').select('user_id').eq('user_id',me.id).maybeSingle();
      if(roleError)throw Error(roleError.message);
      if(!admin)throw Error('Solo la administradora puede publicar stickers para todos los compradores.');
      const name=String(payload.name||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,120);
      if(!name)throw Error('Sticker sin nombre.');
      const allowed=['Avatares','Matcha','Pilates','Ejercicios','Aesthetic'];
      const category=allowed.includes(payload.category)?payload.category:'Aesthetic';
      if(typeof payload.content!=='string'||payload.content.length>7000000)throw Error('El archivo no es un PNG válido.');
      const bytes=Uint8Array.from(atob(payload.content),c=>c.charCodeAt(0));
      if(bytes.length<200||bytes.length>5000000||![137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))
        throw Error('Solo se admiten PNG originales de hasta 5 MB.');
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      const sha256=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
      const {data:existing,error:lookupError}=await tab('sticker_catalog').select('id,name,category,size_bytes,sha256').eq('sha256',sha256).maybeSingle();
      if(lookupError)throw Error(lookupError.message);
      if(existing)return {data:{...stickerRecord(existing),duplicate:true}};
      const storagePath='shared-stickers/'+crypto.randomUUID()+'.png';
      out(await sb.storage.from(bucket).upload(storagePath,bytes,{contentType:'image/png',upsert:false,cacheControl:'31536000'}));
      try{
        const {data:record,error:dbError}=await tab('sticker_catalog')
         .insert({created_by:me.id,path:storagePath,name,category,sha256,size_bytes:bytes.byteLength,published:true})
         .select('id,name,category,size_bytes,sha256').single();
        if(dbError)throw Error(dbError.message);
        return {data:stickerRecord(record)};
      }catch(e){
        await sb.storage.from(bucket).remove([storagePath]);
        throw e;
      }
    }
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
        return {data:await add('assets',{brandId:payload.brandId,path,mime,name:payload.name,displayName:payload.displayName||'',category:payload.category||'original',aiReference:preview.data})};
      }
      catch(e){await sb.storage.from(bucket).remove([path]);throw e;}
    }
    if(['/api/ideas','/api/ai-image','/api/grid-plan','/api/grid-image','/api/connection-test'].includes(path)){
      const data=await useEdge(path.slice(5),payload);
      window.dispatchEvent(new Event('content-lab-credit-change'));
      return {data};
    }
    throw Error('Ruta no disponible: '+path);
  },
  put:async(path:string,payload:any):Promise<{data:any}>=>{
    const m=path.match(/^\/api\/(brands|posts|grids|prompts|assets)\/([^/]+)$/);
    if(!m)throw Error('Ruta de edición inválida.');
    if(m[1]==='assets'){
      // Never accept changes to storage paths, owner, AI source, brand ID or generated status from a rename.
      const patch:{displayName?:string;category?:string}={};
      if(typeof payload.displayName==='string')patch.displayName=payload.displayName.replace(/[<>\\x00-\\x1F]/g,'').trim().slice(0,85);
      if(['original','reference','logo','generated','screenshot','sticker'].includes(payload.category))patch.category=payload.category;
      if(!Object.keys(patch).length)throw Error('No hay cambios válidos para la imagen.');
      return {data:await update('assets',decodeURIComponent(m[2]),patch)};
    }
    return {data:await update(m[1],decodeURIComponent(m[2]),payload)};
  },
  delete:async(path:string):Promise<{data:any}>=>{
    const m=path.match(/^\/api\/(posts|assets|prompts)\/([^/]+)$/);
    if(!m)throw Error('Ruta de borrado inválida.');
    const id=decodeURIComponent(m[2]);
    if(m[1]==='assets'){
      const asset=await read('assets',id);
      await remove('assets',id);
      out(await sb.storage.from(bucket).remove([asset.path]));
    }else await remove(m[1]==='prompts'?'prompts':'posts',id);
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
