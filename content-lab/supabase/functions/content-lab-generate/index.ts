
import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
const bucket='content-lab-private';
const allowed=Deno.env.get('CONTENT_LAB_ALLOWED_ORIGIN')||'*';
const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const send=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json'}});
const clean=(x:unknown,n=1000)=>String(typeof x==='string'?x:'').trim().slice(0,n);
const language=(brand:any)=>{
 const name=String(brand.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return name==='todavia estoy a tiempo'?'Español':name==='the launch era'?'English':brand.language==='English'?'English':'Español';
};
const key=Deno.env.get('GEMINI_API_KEY')||'';
async function gemini(prompt:string,imgs:{data:string;mime:string}[]=[],photo=false){
 if(!key)throw Error('Falta GEMINI_API_KEY en los secretos del servidor.');
 // Gemini 2.5 Flash Image shut down 2026-10-02. The Lite image model supports 4:5 at 1K.
 const model=photo?(Deno.env.get('GEMINI_IMAGE_MODEL')||'gemini-3.1-flash-lite-image'):(Deno.env.get('GEMINI_TEXT_MODEL')||'gemini-2.5-flash');
 const parts:any[]=[{text:prompt},...imgs.map(x=>({inline_data:{mime_type:x.mime,data:x.data}}))];
 const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
  method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
  body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:photo
   ? {responseModalities:['TEXT','IMAGE'],imageConfig:{aspectRatio:'4:5',imageSize:'1K'}}
   : {responseMimeType:'application/json'}})
 });
 const result=await response.json();
 if(!response.ok)throw Error('Error del proveedor de IA ('+response.status+'): '+clean(result.error?.message,240));
 const chunks=result.candidates?.[0]?.content?.parts||[];
 if(photo){
  const p=chunks.find((v:any)=>v.inlineData?.data||v.inline_data?.data);
  if(!p)throw Error('La IA no entregó una imagen.');
  return {data:p.inlineData?.data||p.inline_data.data,mime:p.inlineData?.mimeType||p.inline_data?.mime_type||'image/png'};
 }
 const text=chunks.map((v:any)=>v.text||'').join('').trim().replace(/^\\x60\\x60\\x60(?:json)?/i,'').replace(/\\x60\\x60\\x60$/,'').trim();
 return JSON.parse(text);
}
Deno.serve(async request=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(request.method!=='POST')return send({error:'Método no disponible'},405);
 if(allowed!=='*'&&request.headers.get('origin')!==allowed)return send({error:'Origen no autorizado'},403);
 const jwt=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 if(!jwt)return send({error:'Sesión requerida'},401);
 try{
  const supabase=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_ANON_KEY')||Deno.env.get('SUPABASE_PUBLISHABLE_KEY')||'',{global:{headers:{Authorization:'Bearer '+jwt}}});
  const {data:{user},error}=await supabase.auth.getUser(jwt);
  if(error||!user)return send({error:'Sesión inválida'},401);
  const {data:admin}=await supabase.from('content_lab_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(!admin)return send({error:'Cuenta no autorizada'},403);
  const body=await request.json();const action=clean(body.action,45);
  const find=async(name:string,id:string)=>{
   const {data,error}=await supabase.from('content_lab_'+name).select('id,payload').eq('id',id).single();
   if(error||!data)throw Error('Recurso privado no encontrado.');
   return {...data.payload,id:data.id};
  };
  const save=async(name:string,payload:any)=>{
   const {data,error}=await supabase.from('content_lab_'+name).insert({owner_id:user.id,payload}).select('id,payload').single();
   if(error||!data)throw Error(error?.message||'No se pudo guardar.');
   return {...data.payload,id:data.id};
  };
  const edit=async(name:string,id:string,payload:any)=>{
   const {data,error}=await supabase.from('content_lab_'+name).update({payload,updated_at:new Date().toISOString()}).eq('id',id).select('id,payload').single();
   if(error||!data)throw Error(error?.message||'No se pudo guardar.');
   return {...data.payload,id:data.id};
  };
  const b64=(bytes:Uint8Array)=>{
   let result='';for(let i=0;i<bytes.length;i+=16384)result+=String.fromCharCode(...bytes.subarray(i,i+16384));
   return btoa(result);
  };
  const load=async(id:string)=>{
   const record=await find('assets',id);
   const {data,error}=await supabase.storage.from(bucket).download(record.path);
   if(error||!data)throw Error('Imagen privada no encontrada.');
   return {mime:record.mime,data:b64(new Uint8Array(await data.arrayBuffer())),record};
  };
  const store=async(brandId:string,name:string,data:string,mime:string)=>{
   const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
   if(bytes.length>8000000)throw Error('La imagen generada es demasiado grande.');
   const path=user.id+'/'+crypto.randomUUID()+(mime==='image/png'?'.png':'.jpg');
   const {error}=await supabase.storage.from(bucket).upload(path,bytes,{contentType:mime,upsert:false});
   if(error)throw Error(error.message);
   return save('assets',{brandId,path,name,mime,generated:true});
  };
  if(action==='ideas'){
   const b=await find('brands',clean(body.brandId,100));
   const lang=language(b)==='English'?'US ENGLISH':'LATIN AMERICAN SPANISH';
   const obj:any=await gemini('Return JSON {title,hook,slides,caption,cta,visual,alternatives}. 3 alternative hooks, five short slide lines. Write ALL public content only in '+lang+'. Brand '+b.name+', audience '+b.audience+', rules '+b.rules+'. Topic '+clean(body.topic,900)+'. Format '+clean(body.format,70)+'. Angle '+clean(body.angle,70)+'. Never invent product details or testimonials.');
   return send({title:clean(obj.title,150),hook:clean(obj.hook,500),slides:clean(obj.slides,3500),caption:clean(obj.caption,4500),cta:clean(obj.cta,250),visual:clean(obj.visual,900),alternatives:Array.isArray(obj.alternatives)?obj.alternatives.slice(0,3):[]});
  }
  if(action==='grid-plan'){
   const brandId=clean(body.brandId,100),sourceId=clean(body.sourceId,100),referenceId=clean(body.referenceId,100);
   const b=await find('brands',brandId);
   const source=await load(sourceId);
   if(source.record.brandId!==brandId)throw Error('Foto de otra marca.');
   const images=[{data:source.data,mime:source.mime}];
   if(referenceId&&referenceId!==sourceId){
    const ref=await load(referenceId);
    if(ref.record.brandId!==brandId)throw Error('Referencia de otra marca.');
    images.push({data:ref.data,mime:ref.mime});
   }
   const lang=language(b)==='English'?'US ENGLISH':'LATIN AMERICAN SPANISH';
   const prompt='Art direct NINE DIFFERENT BRAND PHOTOGRAPHS, nine independent Instagram posts, not slides or repeat recolors/crops. Image 1 is product identity, optional image 2 is style reference only. Brand '+b.name+' voice '+b.voice+' colors '+b.color+' '+b.background+'. PUBLIC copy title, concept, all headlines, subtitles and captions ONLY IN '+lang+'. Brief '+clean(body.brief,650)+'. Nine shots in order: (1) 3/4 studio hero (2) overhead geometric flat-lay (3) extreme macro texture (4) distant lifestyle environment (5) surreal conceptual floating props (6) authentic hands holding subject (7) repeated product flat-lay pattern (8) restrained minimalist podium (9) cinematic low-angle finale. Every scene uses DIFFERENT camera, scale, angle, lighting, props and setting. Return ONLY JSON with title,concept,posts array of EXACTLY NINE objects {headline,subtext,caption,scene}. Headlines and captions must be useful, human and different. No fake facts.';
   const plan:any=await gemini(prompt,images);
   if(!Array.isArray(plan.posts)||plan.posts.length!==9)throw Error('No se crearon los nueve conceptos.');
   const formats=['Editorial Hero','Bold Typography','Macro Texture','Lifestyle Scene','Playful Props','Hands-on Editorial','High Contrast','Minimal Premium','Campaign Finale'];
   const posts=plan.posts.map((p:any,i:number)=>({index:i,headline:clean(p.headline,150),subtext:clean(p.subtext,220),caption:clean(p.caption,1300),scene:clean(p.scene,700),format:formats[i],assetId:''}));
   return send(await save('grids',{brandId,sourceId,referenceId,kind:body.kind==='preserve'?'preserve':'product',brief:clean(body.brief,650),title:clean(plan.title,120),concept:clean(plan.concept,360),posts}));
  }
  if(action==='grid-image'){
   const grid=await find('grids',clean(body.gridId,100)),i=Number(body.index);
   if(!Number.isInteger(i)||i<0||i>8)throw Error('Número de imagen inválido.');
   const b=await find('brands',grid.brandId);
   const shots=[
    'single 3/4 front item studio hero, softbox light',
    'top-down graphic paper geometric flat lay',
    'extreme close macro product texture, no full product',
    'wide environmental natural-light lifestyle photography',
    'playful surreal floating product and whimsical sculptural props',
    'intimate candid realistic hands interacting with item',
    'high-contrast overhead repeated pattern with physical products',
    'minimal product on architectural pedestal and negative space',
    'cinematic low diagonal campaign photograph with dramatic spotlights'
   ];
   const references:{data:string;mime:string}[]=[];
   if(grid.kind!=='preserve'){const p=await load(grid.sourceId);references.push({data:p.data,mime:p.mime});}
   if(grid.referenceId){const p=await load(grid.referenceId);references.push({data:p.data,mime:p.mime});}
   const prompt='Create ONE NEW PHOTOGRAPH in VERTICAL 4:5, not grid or collage. Shot '+(i+1)+' of nine, MANDATORY DIFFERENT shot: '+shots[i]+'. Scene '+grid.posts[i].scene+'. Brand '+b.name+' palette '+b.color+' '+b.background+'. Do not repeat/crop/recolor the source photo; truly new camera shot, light, props and environment. '+(grid.kind==='preserve'?'Create only aesthetic complementary background, no fake app UI, no subject, no screen; original image will be composited intact.':'First attached photo identifies real product: preserve its identity, shape, material and colors. Second photo optional style inspiration only. Do not reproduce someone else brand.')+' NO text, words, logos or watermarks.';
   const image:any=await gemini(prompt,references,true);
   const asset=await store(grid.brandId,'Post '+(i+1)+' - '+grid.title,image.data,image.mime);
   const posts=grid.posts.map((p:any,j:number)=>j===i?{...p,assetId:asset.id}:p);
   const updated=await edit('grids',grid.id,{...grid,posts});
   return send({grid:updated,asset,content:image.data});
  }
  if(action==='ai-image'){
   const b=await find('brands',clean(body.brandId,100));
   const sources:{data:string;mime:string}[]=[];
   if(body.mode==='variation'&&body.assetId){
    const p=await load(clean(body.assetId,100));
    if(p.record.brandId!==b.id)throw Error('Foto de otra marca.');
    sources.push({data:p.data,mime:p.mime});
   }
   const image:any=await gemini('Make ONE vertical 4:5 original premium photography image for '+b.name+'. '+clean(body.prompt,700)+'. No logos, words, watermarks or invented app screens. Preserve subject identity when provided.',sources,true);
   const asset=await store(b.id,'AI Photo - '+b.name,image.data,image.mime);
   return send({...asset,content:image.data});
  }
  return send({error:'Acción desconocida'},404);
 }catch(e){
  console.error('Private Content Lab AI error',e);
  return send({error:e instanceof Error?e.message:'Error en el servicio de IA'},503);
 }
});
