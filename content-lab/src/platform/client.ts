
import { createClient } from '@supabase/supabase-js';
import {FREE_BACKGROUNDS} from '../FreeDesignAssets';
import {clearActivity,hasExpiredActivity,lastActivity,recordActivity} from '../SessionActivity';

const url=String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_URL||'');
const key=String(import.meta.env.VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY||'');
const configured=Boolean(url&&key);
const sb=createClient(url||'https://not-configured.supabase.co',key||'missing-public-key',{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
const bucket='content-lab-private';
let activeUserId='';
let lastRecordedInteraction=0;
const requireConfig=()=>{if(!configured)throw Error('Configura VITE_CONTENT_LAB_SUPABASE_URL y VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY en tu entorno.');};
const out=(r:any)=>{if(r.error)throw Error(r.error.message||'Error de Supabase');return r.data;};
const current=async()=>{
 requireConfig();
 const {data:{user},error}=await sb.auth.getUser();
 if(error||!user)throw Error('Inicia sesión para continuar.');
 if(hasExpiredActivity(user.id)){
  clearActivity(user.id);
  await sb.auth.signOut();
  activeUserId='';
  throw Error('Pasaron 24 horas sin actividad. Solicita un código nuevo para entrar.');
 }
 return user;
};
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

const backgroundRecord=(x:any)=>({
 id:'shared-background-'+x.id,brandId:'shared',name:x.name,displayName:x.name,
 mime:x.mime,category:'background',shared:true,
 backgroundGroup:x.category,sizeBytes:x.size_bytes,sha256:x.sha256
});
const sharedBackgrounds=async()=>{
 const {data,error}=await tab('background_catalog')
  .select('id,name,category,mime,size_bytes,sha256').eq('published',true).order('created_at',{ascending:true});
 if(error)throw Error(error.message);
 return (data||[]).map(backgroundRecord);
};
const hiddenBackgrounds=async()=>{
 const {data,error}=await tab('hidden_backgrounds').select('id');
 if(error)throw Error(error.message);
 return (data||[]).map(x=>x.id as string);
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
    if(!user){activeUserId='';return null;}
    if(hasExpiredActivity(user.id)){
      clearActivity(user.id);
      await sb.auth.signOut();
      activeUserId='';
      return null;
    }
    const {data:admin}=await tab('admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(admin){activeUserId=user.id;if(lastActivity(user.id)===null)recordActivity(user.id);return {email:user.email};}
    if(!user.email)return null;
    // Server-enforced RLS returns only this verified email's active membership.
    const {data:paid}=await sb.from('content_lab_memberships')
      .select('id').eq('buyer_email',user.email.trim().toLowerCase()).eq('status','active').maybeSingle();
    if(paid){activeUserId=user.id;if(lastActivity(user.id)===null)recordActivity(user.id);}
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
    if(result.user?.id){activeUserId=result.user.id;recordActivity(activeUserId);lastRecordedInteraction=Date.now();}
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
  /** Record real user activity only, never a background timer. */
  noteActivity:():boolean=>{
    if(!activeUserId)return false;
    if(hasExpiredActivity(activeUserId))return false;
    const now=Date.now();
    if(now-lastRecordedInteraction>=30000){
      recordActivity(activeUserId,now);
      lastRecordedInteraction=now;
    }
    return true;
  },
  /** Check first, without resetting the idle clock on a resumed iPhone tab. */
  checkIdle:async():Promise<boolean>=>{
    if(!activeUserId)return false;
    if(!hasExpiredActivity(activeUserId))return true;
    clearActivity(activeUserId);
    activeUserId='';
    await sb.auth.signOut();
    return false;
  },
  signOut:async()=>{
    const id=activeUserId;
    activeUserId='';
    if(id)clearActivity(id);
    out(await sb.auth.signOut());
  }
};
export const api={
  get:async(path:string):Promise<{data:any}>=>{
    requireConfig();
    if(path==='/api/sticker-catalog')return {data:await sharedStickers()};
    if(path==='/api/background-catalog')return {data:await sharedBackgrounds()};
    if(path==='/api/hidden-backgrounds')return {data:await hiddenBackgrounds()};
    if(path==='/api/data'){
      const brands=await seed();
      const [posts,assets,stickers,backgrounds,hiddenBackgroundIds]=await Promise.all([
        list('posts'),list('assets'),sharedStickers(),sharedBackgrounds(),hiddenBackgrounds()
      ]);
      return {data:{brands,posts,assets:[...assets,...stickers,...backgrounds],hiddenBackgroundIds}};
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
      if(id.startsWith('shared-background-')){
        const uid=id.slice('shared-background-'.length);
        if(!/^[a-f0-9-]{36}$/i.test(uid))throw Error('Fondo compartido no válido.');
        const {data:entry,error}=await tab('background_catalog').select('path,mime')
          .eq('id',uid).eq('published',true).maybeSingle();
        if(error)throw Error(error.message);
        if(!entry)throw Error('Fondo no disponible para esta cuenta.');
        const file=out(await sb.storage.from(bucket).download(entry.path));
        return {data:{mime:entry.mime,content:await base64(file)}};
      }
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
    if(path==='/api/hidden-backgrounds'){
      const me=await current();
      const {data:admin,error:authError}=await tab('admins').select('user_id').eq('user_id',me.id).maybeSingle();
      if(authError)throw Error(authError.message);
      if(!admin)throw Error('Solo la administradora puede quitar fondos incluidos.');
      const id=String(payload?.id||'');
      if(!FREE_BACKGROUNDS.some(x=>x.id===id))throw Error('Fondo incluido no válido.');
      const {error}=await tab('hidden_backgrounds').insert({id,hidden_by:me.id});
      if(error&&error.code!=='23505')throw Error(error.message);
      return {data:{hidden:true,id}};
    }
    if(path==='/api/brands')return {data:await add('brands',payload)};
    if(path==='/api/posts')return {data:await add('posts',payload)};
    if(path==='/api/grids'){
      // User-owned, passwordless-authenticated drafts; database RLS enforces ownership.
      if(!payload?.brandId||!payload?.sourceId||!Array.isArray(payload.posts)||payload.posts.length!==9)
        throw Error('Se requieren una foto original y nueve publicaciones.');
      const personalBrands=await list('brands'),personalAssets=await list('assets');
      if(!personalBrands.some((b:any)=>b.id===payload.brandId)||!personalAssets.some((a:any)=>a.id===payload.sourceId&&a.brandId===payload.brandId))
        throw Error('La foto debe pertenecer a tu propia marca.');
      return {data:await add('grids',payload)};
    }
    if(path==='/api/prompts'){
      const text=String(payload?.text||'').slice(0,4800);
      if(!text.trim())throw Error('El prompt no puede estar vacío.');
      if((await list('prompts')).length>=100)throw Error('Ya guardaste 100 prompts. Elimina uno antes de guardar otro.');
      return {data:await add('prompts',{
        brandId:String(payload?.brandId||''),title:String(payload?.title||'Mi prompt').slice(0,100),
        text,settings:payload?.settings||null,favorite:false
      })};
    }
    if(path==='/api/background-catalog'){
      const me=await current();
      const {data:admin,error:roleError}=await tab('admins').select('user_id').eq('user_id',me.id).maybeSingle();
      if(roleError)throw Error(roleError.message);
      if(!admin)throw Error('Solo la administradora puede publicar fondos para todos.');
      const name=String(payload?.name||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,120);
      if(!name)throw Error('El fondo necesita un nombre.');
      const categories=['Minimalistas','Gradientes','Papel y texturas','Editoriales','Retro y otoño','Oscuros','Scrapbook'];
      const category=categories.includes(payload?.category)?payload.category:'Editoriales';
      const mime=String(payload?.mime||'');
      if(!['image/png','image/jpeg','image/webp'].includes(mime))
        throw Error('El fondo debe ser PNG, JPG o WebP.');
      if(typeof payload?.content!=='string'||payload.content.length>7000000)
        throw Error('El archivo del fondo no es válido.');
      const bytes=Uint8Array.from(atob(payload.content),c=>c.charCodeAt(0));
      if(bytes.length<200||bytes.length>5000000)throw Error('El fondo debe medir menos de 5 MB.');
      const valid=mime==='image/png'?[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n):
        mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:
        bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70&&
          bytes[8]===87&&bytes[9]===69&&bytes[10]===66&&bytes[11]===80;
      if(!valid)throw Error('El formato del archivo no coincide con la imagen.');
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      const sha256=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
      const {data:existing,error:lookupError}=await tab('background_catalog')
       .select('id,name,category,mime,size_bytes,sha256').eq('sha256',sha256).maybeSingle();
      if(lookupError)throw Error(lookupError.message);
      if(existing)return {data:{...backgroundRecord(existing),duplicate:true}};
      const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
      const storagePath='shared-backgrounds/'+crypto.randomUUID()+'.'+ext;
      out(await sb.storage.from(bucket).upload(storagePath,bytes,{contentType:mime,upsert:false,cacheControl:'31536000'}));
      try{
        const {data:record,error:dbError}=await tab('background_catalog')
          .insert({created_by:me.id,path:storagePath,name,category,mime,sha256,
             size_bytes:bytes.length,published:true})
          .select('id,name,category,mime,size_bytes,sha256').single();
        if(dbError)throw Error(dbError.message);
        return {data:backgroundRecord(record)};
      }catch(e){
        await sb.storage.from(bucket).remove([storagePath]);
        throw e;
      }
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
    requireConfig();
    // Never authorize a shared deletion using a client-provided isAdmin flag.
    // Both the authorization lookup and the DELETE are checked by database RLS.
    const shared=path.match(/^\/api\/(sticker-catalog|background-catalog)\/([a-f0-9-]{36})$/i);
    if(shared){
      const me=await current();
      const {data:admin,error:adminError}=await tab('admins').select('user_id')
        .eq('user_id',me.id).maybeSingle();
      if(adminError)throw Error(adminError.message);
      if(!admin)throw Error('Solo la administradora puede eliminar recursos del estudio.');
      const type=shared[1]==='sticker-catalog'?'sticker_catalog':'background_catalog';
      const id=shared[2];
      const {data:record,error:readError}=await tab(type)
        .select('id,path').eq('id',id).maybeSingle();
      if(readError)throw Error(readError.message);
      if(!record)throw Error('Este recurso ya no está disponible.');
      // For older admin backgrounds, the original owner-only asset is also
      // removed so it does not reappear in "Mis fondos" after deletion.
      if(type==='background_catalog'&&!record.path.startsWith('shared-backgrounds/')){
        const {data:legacy,error:legacyError}=await tab('assets')
          .select('id').eq('owner_id',me.id).filter('payload->>path','eq',record.path);
        if(legacyError)throw Error(legacyError.message);
        if((legacy||[]).length){
          const {data:removed,error:legacyDeleteError}=await tab('assets').delete()
            .eq('owner_id',me.id).in('id',(legacy||[]).map(x=>x.id)).select('id');
          if(legacyDeleteError)throw Error(legacyDeleteError.message);
          if((removed||[]).length!==(legacy||[]).length)throw Error('No se pudieron eliminar todos los registros antiguos.');
        }
      }
      const {data:deleted,error:deleteError}=await tab(type).delete().eq('id',id).select('id');
      if(deleteError)throw Error(deleteError.message);
      if(!deleted?.length)throw Error('No se eliminó el recurso. Revisa tus permisos.');
      // Storage API permanently removes the actual file, never direct SQL.
      out(await sb.storage.from(bucket).remove([record.path]));
      return {data:{deleted:true}};
    }
    const m=path.match(/^\/api\/(posts|assets|prompts)\/([^/]+)$/);
    if(!m)throw Error('Ruta de borrado inválida.');
    const id=decodeURIComponent(m[2]);
    if(m[1]==='assets'){
      const asset=await read('assets',id);
      // If an admin deletes a historical shared background from their own
      // assets page, unpublish its catalog reference as well.
      const {data:admin}=await tab('admins').select('user_id')
         .eq('user_id',(await current()).id).maybeSingle();
      if(admin&&asset.category==='background'){
        const {error:unpublishError}=await tab('background_catalog').delete()
          .eq('path',asset.path);
        if(unpublishError)throw Error(unpublishError.message);
      }
      await remove('assets',id);
      out(await sb.storage.from(bucket).remove([asset.path]));
    }else await remove(m[1]==='prompts'?'prompts':'posts',id);
    return {data:{deleted:true}};
  }
};
export const image={
  resizeIfNeeded:async(input:File|Blob,opts:{maxDimension:number;maxPixels:number;quality:number;mimeType:string;preserveIfPossible?:boolean;maxBytes?:number})=>{
    const url=URL.createObjectURL(input);
    try{
      const img=new Image();img.src=url;await img.decode();
      const originalWidth=img.naturalWidth,originalHeight=img.naturalHeight;
      const maxBytes=Math.min(opts.maxBytes??4_850_000,4_850_000);
      if(opts.preserveIfPossible && input.type===opts.mimeType && input.size<=maxBytes &&
        Math.max(originalWidth,originalHeight)<=opts.maxDimension &&
        originalWidth*originalHeight<=opts.maxPixels){
        // Preserve all original source pixels and JPEG/PNG/WebP bytes when safe.
        return {data:await base64(input),mimeType:opts.mimeType};
      }
      const scale=Math.min(1,opts.maxDimension/Math.max(originalWidth,originalHeight),
        Math.sqrt(opts.maxPixels/(originalWidth*originalHeight)));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(originalWidth*scale));
      canvas.height=Math.max(1,Math.round(originalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas no disponible.');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const compress=async(mime:string,quality:number)=>new Promise<Blob>((resolve,reject)=>
        canvas.toBlob(b=>b?resolve(b):reject(Error('No se pudo guardar la fotografía')),mime,quality));
      let mime=opts.mimeType,blob=await compress(mime,opts.quality);
      // Keep the largest useful image inside the 5MB private-storage limit.
      for(const quality of [.92,.86,.80,.75]){
        if(blob.size<=maxBytes)break;
        if(mime==='image/png')mime='image/jpeg';
        blob=await compress(mime,quality);
      }
      if(blob.size>maxBytes){
        const ratio=Math.sqrt(maxBytes/blob.size)*.91;
        const w=Math.max(1,Math.floor(canvas.width*ratio)),h=Math.max(1,Math.floor(canvas.height*ratio));
        const reduced=document.createElement('canvas');reduced.width=w;reduced.height=h;
        const c=reduced.getContext('2d');if(!c)throw Error('Canvas no disponible.');
        c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
        c.drawImage(canvas,0,0,w,h);
        blob=await new Promise<Blob>((resolve,reject)=>
          reduced.toBlob(b=>b?resolve(b):reject(Error('No se pudo guardar la fotografía')),'image/jpeg',.86));
        mime='image/jpeg';reduced.width=1;reduced.height=1;
      }
      canvas.width=1;canvas.height=1;
      if(blob.size>maxBytes)throw Error('Esta fotografía sigue siendo demasiado grande para guardarla sin perder calidad.');
      return {data:await base64(blob),mimeType:mime};
    }finally{URL.revokeObjectURL(url)}
  }
};
