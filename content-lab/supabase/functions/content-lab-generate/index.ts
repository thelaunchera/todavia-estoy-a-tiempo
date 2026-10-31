
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

// The Cloudflare Account ID is exactly 32 hexadecimal characters. Some copy/pastes
// insert a space/newline in the middle: normalize without exposing it to logs or users.
const accountId=(Deno.env.get('CLOUDFLARE_ACCOUNT_ID')||'').replace(/\s+/g,'');
const token=(Deno.env.get('CLOUDFLARE_API_TOKEN')||'').trim();
const photoModel='@cf/black-forest-labs/flux-2-klein-4b';
const textModel='@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const visionModel='@cf/qwen/qwen3.8-27b';
async function inspectReference(images:{data:string;mime:string}[],brief:string):Promise<string>{
 ensureFreeProvider();
 if(!images.length)return '';
 // Deliberate one-shot multimodal analysis; no model-generated claims about contents
 // are published without review. First image is the product, second optional image is style.
 const content:any[]=[{type:'text',text:
  'Analyze TWO separate image roles: first is ORIGINAL subject/product/photo to preserve, second is optional CREATIVE STYLE REFERENCE. Describe visible subject truthfully, then describe reference VISUAL DESIGN: type families (serif, bold sans, handwriting), background/color/palette, poster composition, placement of subject, headline scale, magazine layout, handwritten annotations and arrows if present. Do not identify real people. Do not assume prices, credentials, ingredients, claims or unreadable labels. Visual guidance only: original text must be written later as exact separate layers. Under 190 words. Brief: '+clean(brief,360)
 }];
 for(const p of images.slice(0,2))content.push({type:'image_url',image_url:{url:'data:'+p.mime+';base64,'+p.data}});
 const response=await fetch(endpoint(visionModel),{
  method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
  body:JSON.stringify({messages:[{role:'user',content}],temperature:.2,max_tokens:260})
 });
 let result:any=null;try{result=await response.json()}catch{}
 if(!response.ok||result?.success===false)throw Error('El análisis visual de Cloudflare no está disponible.');
 const raw=result?.result?.response||result?.result?.text||'';
 if(typeof raw!=='string'||raw.trim().length<15)throw Error('La IA visual no pudo describir las fotos.');
 return clean(raw,1050);
}
const structuredTextModel='@cf/meta/llama-3.1-8b-instruct';
const gridShots=[
 '3/4 full product shot in clean seamless studio, softbox light, eye-level, spacious clean backdrop',
 'top-down editorial flat lay, layered colored paper and geometric props, object off-center, graphic daylight',
 'extreme micro texture closeup, razor-thin depth of field, natural material detail, directional sidelight',
 'wide environmental authentic lifestyle scene with contextual setting and window light',
 'playful conceptual sculptural or floating still life with clever props and diagonal visual energy',
 'candid real human hands using or holding item, tight documentary crop, lived-in realism',
 'overhead dramatic repeated pattern with multiple physical objects or ingredients, hard graphic shadows',
 'full product on minimal architectural pedestal with exceptionally broad negative space and tonal light',
 'cinematic low-angle campaign finale, spotlight, dramatic atmosphere and rich shadows'
] as const;
const gridLayouts=['Editorial Hero','Bold Typography','Macro Texture','Lifestyle Scene','Playful Props','Hands-on Editorial','High Contrast','Minimal Premium','Campaign Finale'] as const;
const fallbackTexts={
 English:{
  titles:['A fresh perspective','The statement piece','Look closer','In its element','Something unexpected','The real moment','A new pattern','Less, more intention','One last look'],
  subtexts:['A clean introduction','Details worth noticing','Texture tells the story','A place in everyday life','A different visual idea','An authentic interaction','A new visual rhythm','Space to appreciate the details','The campaign finale'],
  captions:['A different point of view can change the whole story.','A simple setting puts the subject first.','Sometimes the smallest details hold your attention.','A little context makes the moment feel real.','One idea, a completely different composition.','An honest moment, without unnecessary extras.','Repetition makes familiar details feel new.','Give the subject room to stand out.','Nine perspectives, one recognizable subject.']
 },
 'Español':{
  titles:['Desde otro ángulo','Que sea protagonista','Míralo más de cerca','En su propio ambiente','Algo inesperado','Un momento real','Otra forma de verlo','Menos, con intención','Una última mirada'],
  subtexts:['Una presentación diferente','El detalle es protagonista','Texturas que llaman la atención','Una escena cotidiana','Una idea visual distinta','Una interacción natural','Un nuevo ritmo visual','Espacio para apreciar el producto','El cierre de la campaña'],
  captions:['A veces solo hace falta cambiar el ángulo.','Una composición sencilla deja que el producto hable.','Los detalles merecen su momento.','El contexto también cuenta una historia.','La misma referencia, una idea completamente diferente.','Una escena auténtica, sin adornos innecesarios.','Repetir formas cambia lo que vemos.','Dar espacio también es una decisión creativa.','Nueve maneras de mirar un mismo producto.']
 }
} as const;
function fallbackGridPlan(lang:'English'|'Español',name:string,brief:string){
 const t=fallbackTexts[lang];
 return {
  title:lang==='English'?'Nine distinct directions':'Nueve direcciones diferentes',
  concept:lang==='English'?'A coherent nine-photo editorial series from one original reference.':'Una serie editorial de nueve fotos distintas a partir de la referencia original.',
  posts:gridShots.map((scene,i)=>({headline:t.titles[i],subtext:t.subtexts[i],caption:t.captions[i],scene:'Shot '+(i+1)+': '+scene+'. Follow the original real subject and this creative brief without inventing product attributes: '+brief.slice(0,250)}))
 };
}

const ensureFreeProvider=()=>{
 if(!accountId||!token)throw Error('Falta conectar la cuenta gratuita de Cloudflare. Revisa CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN en los secretos de Supabase.');
 if(!/^[a-f0-9]{32}$/i.test(accountId))throw Error('El Account ID de Cloudflare es inválido: debe tener exactamente 32 caracteres hexadecimales, sin espacios. Copia el ID desde Cloudflare → Workers & Pages → Account Details y reemplaza CLOUDFLARE_ACCOUNT_ID en Supabase.');
};
const endpoint=(model:string)=>'https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(accountId)+'/ai/run/'+model;
const extractError=(body:any)=>String(body?.errors?.[0]?.message||body?.error||'Respuesta no disponible').slice(0,270);
async function verifyCloudflareToken(){
 ensureFreeProvider();
 // Cloudflare supports both account-owned and user-owned tokens; try both.
 // This check never returns the token, Account ID or token UUID to the browser.
 const auth={'Authorization':'Bearer '+token};
 const urls=[
  'https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(accountId)+'/tokens/verify',
  'https://api.cloudflare.com/client/v4/user/tokens/verify'
 ];
 for(const url of urls){
  let response:Response;
  try{response=await fetch(url,{method:'GET',headers:auth});}
  catch{throw Error('No se puede conectar con Cloudflare para verificar el token.');}
  let data:any=null;
  try{data=await response.json();}catch{/* Continue to the next verification endpoint. */}
  if(response.ok&&data?.success&&data?.result?.status==='active')return;
  if(response.ok&&data?.success&&['expired','disabled'].includes(data?.result?.status))
   throw Error('El API Token de Cloudflare está vencido o desactivado. Crea uno nuevo en Workers AI → Use REST API y guárdalo en Supabase.');
 }
 throw Error('Cloudflare no puede validar ese API Token. Comprueba que copiaste un token de Workers AI (no Global API Key), que está activo y que pertenece al Account ID seleccionado.');
}
async function cloudflareRequest(prompt:string,inputs:{data:string;mime:string}[]=[],photo=false,jsonSchema?:Record<string,unknown>){
 ensureFreeProvider();
 const headers:Record<string,string>={'Authorization':'Bearer '+token};
 let response:Response;
 if(photo){
  const form=new FormData();
  form.set('prompt',prompt.slice(0,2000));
  form.set('width','1024');
  form.set('height','1280');
  for(let i=0;i<Math.min(inputs.length,4);i++){
   const reference=inputs[i];
   const bytes=Uint8Array.from(atob(reference.data),c=>c.charCodeAt(0));
   if(bytes.length>420000)throw Error('La foto de referencia debe optimizarse antes de generar. Vuelve a subirla desde la biblioteca.');
   form.append('input_image_'+i,new Blob([bytes],{type:reference.mime}),'reference-'+i+'.jpg');
  }
  response=await fetch(endpoint(photoModel),{method:'POST',headers,body:form});
 }else{
  const requestBody:any={
   messages:[{role:'system',content:'Write ONE valid JSON object only, with no markdown or commentary. Follow the supplied JSON schema.'},{role:'user',content:prompt}],
   max_tokens:jsonSchema?2500:3300,
   temperature:jsonSchema?0.3:0.55
  };
  if(jsonSchema)requestBody.response_format={type:'json_schema',json_schema:jsonSchema};
  response=await fetch(endpoint(jsonSchema?structuredTextModel:textModel),{
   method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(requestBody)
  });
 }
 let body:any;
 try{body=await response.json()}catch{throw Error('Cloudflare no devolvió una respuesta válida.');}
 if(!response.ok||body.success===false){
  if(response.status===429||response.status===402||/quota|neurons|limit|billing/i.test(extractError(body)))
    throw Error('Se terminó la cuota gratuita de Cloudflare. No se generó ningún cargo; vuelve a intentarlo cuando se reinicie.');
  const cloudflareError=extractError(body);
  // Never return a raw request URL with an Account ID to the browser.
  if(body?.errors?.some?.((e:any)=>e.code===7003)||/could not route|object identifier is invalid/i.test(cloudflareError))
    throw Error('Cloudflare no reconoce el Account ID o el token no pertenece a esa cuenta. Copia el Account ID completo en Cloudflare → Workers & Pages → Account Details y revisa el secreto CLOUDFLARE_ACCOUNT_ID en Supabase.');
  if(response.status===401)
    throw Error('Cloudflare devolvió 401: el API Token es inválido o no está activo para esta cuenta. Crea uno en Workers AI → Use REST API y guárdalo en Supabase con el nombre CLOUDFLARE_API_TOKEN.');
  if(response.status===403)
    throw Error('Cloudflare devolvió 403: el token no puede ejecutar Workers AI para esta cuenta. Asegúrate de seleccionar Account → Workers AI → Read y Edit en el token y la misma cuenta del Account ID.');
  throw Error('Cloudflare Workers AI: '+cloudflareError.replace(/\/client\/v4\/accounts\/[^/\s]+/g,'/client/v4/accounts/[oculto]'));
 }
 if(photo){
  const base64=body?.result?.image;
  if(typeof base64!=='string'||!base64)throw Error('Cloudflare no devolvió la foto generada.');
  return {data:base64,mime:'image/jpeg'};
 }
 // In JSON Mode Cloudflare may provide the response as an object (not a string).
 const output=body?.result?.response ?? body?.result?.text ?? body?.result?.output ?? '';
 if(output&&typeof output==='object'&&!Array.isArray(output))return output;
 if(Array.isArray(output))throw Error('JSON_FORMAT: La IA entregó una lista fuera de la estructura esperada.');
 const raw=String(output).trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'').trim();
 if(!raw)throw Error('JSON_FORMAT: La IA no devolvió el plan estructurado.');
 try{return JSON.parse(raw)}catch{
  const from=raw.indexOf('{'),to=raw.lastIndexOf('}');
  if(from>=0&&to>from){try{return JSON.parse(raw.slice(from,to+1))}catch{/* incomplete response */}}
  throw Error('JSON_FORMAT: El modelo no completó un JSON válido.');
 }
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
  const aiReference=async(id:string)=>{
   const record=await find('assets',id);
   if(!record.aiReference)throw Error('Para usar la foto como referencia gratuita, vuelve a subirla. El Lab preparará automáticamente una copia pequeña para Cloudflare.');
   return {data:String(record.aiReference),mime:'image/jpeg',record};
  };
  const store=async(brandId:string,name:string,data:string,mime:string)=>{
   const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
   if(bytes.length>8000000)throw Error('La imagen generada es demasiado grande.');
   const path=user.id+'/'+crypto.randomUUID()+(mime==='image/png'?'.png':'.jpg');
   const {error}=await supabase.storage.from(bucket).upload(path,bytes,{contentType:mime,upsert:false});
   if(error)throw Error(error.message);
   return save('assets',{brandId,path,name,mime,generated:true});
  };
  if(action==='connection-test'){
   // Owner-only, minimal free-text inference confirms token and account without generating an image.
   await verifyCloudflareToken();
   const proof=await cloudflareRequest('Return ONLY JSON {"ready":true}.',[],false);
   if(!proof||proof.ready!==true)throw Error('Cloudflare respondió, pero no devolvió el diagnóstico esperado. Comprueba los permisos del token.');
   return send({ok:true,provider:'Cloudflare Workers AI',message:'Texto verificado; prueba una foto para confirmar el modelo de imágenes.'});
  }
  if(action==='ideas'){
   const b=await find('brands',clean(body.brandId,100));
   const lang=language(b)==='English'?'US ENGLISH':'LATIN AMERICAN SPANISH';
   const obj:any=await cloudflareRequest('Return JSON {title,hook,slides,caption,cta,visual,alternatives}. 3 alternative hooks, five short slide lines. Write ALL public content only in '+lang+'. Brand '+b.name+', audience '+b.audience+', rules '+b.rules+'. Topic '+clean(body.topic,900)+'. Format '+clean(body.format,70)+'. Angle '+clean(body.angle,70)+'. Never invent product details or testimonials.');
   return send({title:clean(obj.title,150),hook:clean(obj.hook,500),slides:clean(obj.slides,3500),caption:clean(obj.caption,4500),cta:clean(obj.cta,250),visual:clean(obj.visual,900),alternatives:Array.isArray(obj.alternatives)?obj.alternatives.slice(0,3):[]});
  }
  if(action==='grid-plan'){
   const brandId=clean(body.brandId,100),sourceId=clean(body.sourceId,100),referenceId=clean(body.referenceId,100);
   const b=await find('brands',brandId);
   const source=await find('assets',sourceId);
   if(source.brandId!==brandId)throw Error('Esta foto está guardada en otra marca. Selecciona esa marca o vuelve a subir la imagen en '+b.name+'.');
   if(referenceId&&referenceId!==sourceId){
    const ref=await find('assets',referenceId);
    if(ref.brandId!==brandId)throw Error('Esta referencia de estilo está guardada en otra marca. Vuelve a subirla en '+b.name+'.');
   }
   const lang=language(b);
   const photos:{data:string;mime:string}[]=[];
   let visualDescription='',analysisStatus:'vision'|'fallback'='fallback';
   if(source.aiReference)photos.push({data:String(source.aiReference),mime:'image/jpeg'});
   if(referenceId&&referenceId!==sourceId){
    const style=await find('assets',referenceId);
    if(style.aiReference)photos.push({data:String(style.aiReference),mime:'image/jpeg'});
   }
   if(photos.length){
    try{visualDescription=await inspectReference(photos,clean(body.brief,400));analysisStatus='vision';}
    catch(e){
     // The user still gets an editable plan; state plainly that visual analysis failed.
     console.warn('Image vision unavailable; grid planning falls back to text. ',e instanceof Error?e.message:'');
    }
   }
   const prompt=[
    'Create a campaign of exactly 9 independent Instagram posts from ONE product reference. Do not make a carousel or repeat the same photograph.',
    'Write ALL headline, subtext and caption fields in '+(lang==='English'?'natural US English':'natural Latin American Spanish')+'.',
    'Brand: '+clean(b.name,100)+'. Voice: '+clean(b.voice,130)+'.',
    'Audience: '+clean(b.audience,200)+'. Notes: '+clean(b.rules,290)+'.',
    'Creative brief from owner: '+clean(body.brief,400)+'.',
    'Visible product/source image analysis (if available): '+(visualDescription||'NOT VERIFIED BY VISION, rely only on owner brief and do not infer source appearance.')+'.',
    'Style kit: '+clean(b.photoMood,250)+'. Never: '+clean(b.avoid,300)+'.',
    'Source image filename: '+clean(source.name,140)+'. Do NOT invent product ingredients, prices, testimonials or unverified benefits.',
    'Create only three short strings for each of the nine posts: headline (2-6 words), subtext (4-9 words), caption (one natural sentence).',
    'In order, the nine distinct creative treatments: studio hero; graphic flat lay; macro texture; lifestyle wide; surreal still-life; hands-on; repeating pattern; minimalist podium; cinematic finale.',
    'Return JSON with one key posts containing an array of exactly nine objects, each {headline,subtext,caption}. No explanations, no scene key.'
   ].join('\n');
   const schema={
    type:'object',
    properties:{
     posts:{type:'array',items:{type:'object',
      properties:{headline:{type:'string'},subtext:{type:'string'},caption:{type:'string'}},
      required:['headline','subtext','caption']
     }}
    },
    required:['posts']
   };
   let plan:any;let planningSource:'ai'|'template'='ai';
   try{
    const draft:any=await cloudflareRequest(prompt,[],false,schema);
    if(!Array.isArray(draft.posts)||draft.posts.length!==9||
       draft.posts.some((p:any)=>!p||typeof p.headline!=='string'||!p.headline.trim()||
         typeof p.subtext!=='string'||typeof p.caption!=='string')){
      throw Error('JSON_FORMAT: Faltan conceptos en la respuesta estructurada.');
    }
    plan={
     title:lang==='English'?'Nine creative directions':'Nueve ideas para tu grid',
     concept:lang==='English'?'Nine different photographs, one coherent campaign.':'Nueve fotografías distintas, una campaña coherente.',
     posts:draft.posts
    };
   }catch(e){
    // Keep authenticated/permission/quota errors visible. Only a genuinely
    // unparseable/incomplete text response falls back to local prewritten concepts.
    if(!(e instanceof Error)||!(/JSON_FORMAT:|JSON Mode couldn't be met|JSON Mode could not be met|JSON Mode couldn.t be met|output validation/i.test(e.message)))throw e;
    planningSource='template';plan=fallbackGridPlan(lang,b.name,clean(body.brief,450));
   }
   const designMode=body.designMode==='editorial'?'editorial':'photo';
   const accepted=['portrait','annotated','magazine','split','typographic'];
   const requested=clean(body.designPreset,20);
   // Lightweight, deterministic adaptation of visual style notes; no claim of pixel-level copying.
   const referenceHints=visualDescription.toLowerCase();
   const firstStyle=accepted.includes(requested)?requested:
    /handwrit|annotation|hand.?drawn|arrow|callout|manuscri|flecha|anotaci/.test(referenceHints)?'annotated':
    /magazine|editorial column|revista|monochrom|black and white/.test(referenceHints)?'magazine':
    /split|diptych|two panels|half frame|dividid/.test(referenceHints)?'split':
    /oversized typography|gigantic text|bold type|large type/.test(referenceHints)?'typographic':'portrait';
   const sequence=[firstStyle,...accepted.filter(p=>p!==firstStyle)];
   const posts=plan.posts.map((p:any,i:number)=>({
    index:i,headline:clean(p.headline,150),subtext:clean(p.subtext,220),caption:clean(p.caption,1300),
    scene:'Shot '+(i+1)+': '+gridShots[i]+'. Visual description: '+clean(visualDescription,440)+'. Mood: '+clean(b.photoMood,160)+'. Avoid: '+clean(b.avoid,140)+'. '+clean(body.brief,200),
    format:gridLayouts[i],assetId:'',
    ...(designMode==='editorial'?{design:{
      preset:sequence[i%sequence.length],
      font:sequence[i%sequence.length]==='annotated'?'handwritten':'elegant',
      background:sequence[i%sequence.length]==='split'?'ivory':'photo',
      backgroundColor:clean(b.background,12)||'#FAF8F3',
      accentColor:clean(b.color,12)||'#BED8E9',
      kicker:clean(b.name,85),handwritten:'',callouts:[],overlay:.12
    }}:{})
   }));
   return send(await save('grids',{brandId,sourceId,referenceId,kind:designMode==='editorial'?'preserve':body.kind==='preserve'?'preserve':'product',designMode,brief:clean(body.brief,650),title:clean(plan.title,120),concept:clean(plan.concept,360),planningSource,analysisStatus,visualDescription,posts}));
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
   if(grid.kind!=='preserve'){const p=await aiReference(grid.sourceId);references.push({data:p.data,mime:p.mime});}
   if(grid.referenceId){const p=await aiReference(grid.referenceId);references.push({data:p.data,mime:p.mime});}
   const prompt='Create ONE NEW PHOTOGRAPH in VERTICAL 4:5, not grid or collage. Shot '+(i+1)+' of nine, MANDATORY DIFFERENT shot: '+shots[i]+'. Scene '+grid.posts[i].scene+'. Brand '+b.name+' palette '+b.color+' '+b.background+'. Brand photo mood: '+clean(b.photoMood,210)+'. Absolutely avoid: '+clean(b.avoid,200)+'. Do not repeat/crop/recolor the source photo; truly new camera shot, light, props and environment. '+(grid.kind==='preserve'?'Create only aesthetic complementary background, no fake app UI, no subject, no screen; original image will be composited intact.':'First attached photo identifies real product: preserve its identity, shape, material and colors. Second photo optional style inspiration only. Do not reproduce someone else brand.')+' NO text, words, logos, watermarks, lettering or fictional interface. Marketing headlines will be overlaid later in a separate accurate typography layer.';
   const image:any=await cloudflareRequest(prompt,references,true);
   const asset=await store(grid.brandId,'Post '+(i+1)+' - '+grid.title,image.data,image.mime);
   const posts=grid.posts.map((p:any,j:number)=>j===i?{...p,assetId:asset.id}:p);
   const updated=await edit('grids',grid.id,{...grid,posts});
   return send({grid:updated,asset,content:image.data});
  }
  if(action==='ai-image'){
   const b=await find('brands',clean(body.brandId,100));
   const sources:{data:string;mime:string}[]=[];
   if(body.mode==='variation'&&body.assetId){
    const p=await aiReference(clean(body.assetId,100));
    if(p.record.brandId!==b.id)throw Error('Esa foto pertenece a otra marca. Selecciona la cuenta original o vuelve a subir la foto desde '+b.name+'.');
    sources.push({data:p.data,mime:p.mime});
   }
   const image:any=await cloudflareRequest('Make ONE vertical 4:5 original premium photography image for '+b.name+'. '+clean(body.prompt,700)+'. No logos, words, watermarks or invented app screens. Preserve subject identity when provided.',sources,true);
   const asset=await store(b.id,'AI Photo - '+b.name,image.data,image.mime);
   return send({...asset,content:image.data});
  }
  return send({error:'Acción desconocida'},404);
 }catch(e){
  console.error('Private Content Lab AI error',e);
  return send({error:e instanceof Error?e.message:'Error en el servicio de IA'},503);
 }
});
