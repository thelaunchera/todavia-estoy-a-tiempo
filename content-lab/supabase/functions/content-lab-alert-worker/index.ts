import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.118.0";
import webpush from "npm:web-push@3.6.7";

const ROOT="https://podcast.thelaunchera.com/content-lab/";
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const secretKeys=(()=>{try{return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{return {}}})();
const SERVICE_KEY=secretKeys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
type Alert={id:string;owner_id:string;event_key:string;kind:"unfinished"|"scheduled";source_type:"post"|"grid";
 source_id:string;tile_index:number;brand_id:string|null;project_title:string;scheduled_at:string|null;
 created_at:string;attempt_count:number;};
type Pref={timezone:string;locale:"es"|"en";email_enabled:boolean;push_enabled:boolean;};
type Secrets={worker?:string;vapid_public?:string;vapid_private?:string;make_email_hook?:string;};
const clean=(s:unknown,n=120)=>String(s||"").replace(/[<>\\x00-\\x1f]/g,"").slice(0,n).trim();
const htmlEscape=(s:unknown)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const matchToken=(a:string,b:string)=>{if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0};
const b64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"");
const result=(status:number,payload:Record<string,unknown>)=>Response.json(payload,{status,headers:{"Cache-Control":"no-store"}});
const titleAndBody=(a:Alert,locale:"es"|"en")=>{
 const project=clean(a.project_title,85)||"tu diseño";
 if(a.kind==="unfinished")return locale==="es"
  ?{title:"¡Tu idea sigue aquí! ✨",body:"¿Seguimos con «"+project+"»? Abre tu proyecto cuando quieras."}
  :{title:"Your idea is still here! ✨",body:"Ready to pick up “"+project+"”? Your project is waiting."};
 return locale==="es"
  ?{title:"¡Tu post tiene una cita! ⏰",body:"En 2 horas toca publicar «"+project+"». Revísalo antes de compartirlo."}
  :{title:"Your post is coming up! ⏰",body:"It's almost time to publish “"+project+"” — check it before you post."};
};
async function mark(a:Alert,state:string,error="",retryMinutes=0){
 const values:Record<string,unknown>={delivery_state:state,last_error:clean(error,280)||null,
  claimed_at:null,retry_after:retryMinutes?new Date(Date.now()+retryMinutes*60000).toISOString():null};
 if(state==="email"||state==="push"||state==="in_app")values.delivered_at=new Date().toISOString();
 const {error:err}=await db.from("content_lab_alerts").update(values).eq("id",a.id).eq("delivery_state","processing");
 if(err)throw Error("Delivery state update failed");
}
async function validSource(a:Alert,pref:Pref){
 const source=a.source_type==="grid"?"content_lab_grids":"content_lab_posts";
 const {data,error}=await db.from(source).select("payload,updated_at").eq("id",a.source_id).eq("owner_id",a.owner_id).maybeSingle();
 if(error||!data)return false;
 const payload=data.payload||{};
 if(a.kind==="unfinished"){
  return a.source_type==="post"&&Date.parse(data.updated_at)<=Date.parse(a.created_at)
   &&payload.isFinished!==true&&!["Ready","Published","Completed"].includes(payload.status);
 }
 const tile=a.source_type==="grid" ? (Array.isArray(payload.posts)?payload.posts[a.tile_index]:null) : payload;
 if(!tile||tile.planningStatus==="published"||payload.status==="Published")return false;
 const d=a.source_type==="grid"?tile.scheduledDate:tile.date;
 const t=a.source_type==="grid"?tile.scheduledTime:tile.time;
 const tz=(a.source_type==="grid"?tile.scheduledTimeZone:tile.timeZone)||pref.timezone;
 const {data:when,error:issue}=await db.rpc("content_lab_alert_instant",{p_date:d||null,p_time:t||null,p_timezone:tz});
 if(issue||!when||!a.scheduled_at)return false;
 return Math.abs(Date.parse(when)-Date.parse(a.scheduled_at))<60000&&Date.parse(when)>Date.now();
}
async function ensurePushKeys(secrets:Secrets){
 if(secrets.vapid_public&&secrets.vapid_private)return secrets;
 const pair=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
 const pub=new Uint8Array(await crypto.subtle.exportKey("raw",pair.publicKey));
 const priv=await crypto.subtle.exportKey("jwk",pair.privateKey);
 if(!priv.d)throw Error("Cannot export push key");
 const {error}=await db.rpc("content_lab_store_vapid_keys",{p_public:b64url(pub),p_private:priv.d});
 if(error)throw Error("Cannot provision push signing keys");
 const {data, error:check}=await db.rpc("content_lab_worker_secrets");
 if(check||!data?.vapid_public||!data?.vapid_private)throw Error("Push keys not ready");
 return data as Secrets;
}
async function deliver(a:Alert,secrets:Secrets){
 try{
  const {data:settings,error:settingsError}=await db.from("content_lab_alert_settings")
   .select("timezone,locale,email_enabled,push_enabled").eq("owner_id",a.owner_id).maybeSingle();
  if(settingsError||!settings){await mark(a,"cancelled","Settings unavailable");return "cancelled"}
  const pref=settings as Pref;
  if(!await validSource(a,pref)){await mark(a,"cancelled","Source changed");return "cancelled"}
  const {data:admin,error:userError}=await db.auth.admin.getUserById(a.owner_id);
  const email=admin?.user?.email?.trim().toLowerCase()||"";
  if(userError||!email){await mark(a,"cancelled","Account missing");return "cancelled"}
  const [{data:member},{data:owner}]=await Promise.all([
    db.from("content_lab_memberships").select("id").eq("buyer_email",email).eq("status","active").maybeSingle(),
    db.from("content_lab_admins").select("user_id").eq("user_id",a.owner_id).maybeSingle()
  ]);
  if(!member&&!owner){await mark(a,"cancelled","No active membership");return "cancelled"}
  const locale=pref.locale==="en"?"en":"es";
  const {title,body}=titleAndBody(a,locale);
  const url=ROOT+"?notification="+encodeURIComponent(a.id);
  let pushDelivered=false;
  if(pref.push_enabled&&secrets.vapid_private&&secrets.vapid_public){
   const {data:subs,error:subError}=await db.from("content_lab_push_subscriptions")
     .select("id,endpoint,p256dh,auth").eq("owner_id",a.owner_id).limit(8);
   if(!subError&&subs?.length){
    webpush.setVapidDetails("mailto:hello@thelaunchera.com",secrets.vapid_public,secrets.vapid_private);
    for(const sub of subs){
     try{
      await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},
        JSON.stringify({title,body,url,tag:"content-lab-"+a.id}),{TTL:3600,urgency:"normal"});
      pushDelivered=true;
     }catch(e){
      const status=Number((e as {statusCode?:number})?.statusCode);
      if(status===404||status===410)await db.from("content_lab_push_subscriptions").delete().eq("id",sub.id).eq("owner_id",a.owner_id);
     }
    }
   }
  }
  if(pushDelivered){await mark(a,"push");return "push"}
  if(pref.email_enabled){
   if(!secrets.make_email_hook)throw Error("Mail delivery not configured");
   const safe=htmlEscape(a.project_title||"tu diseño");
   const subject=locale==="es"?(a.kind==="unfinished"?"¿Retomamos tu diseño? ✨":"Tu post se publica en 2 horas ⏰"):
      (a.kind==="unfinished"?"Your design is waiting ✨":"Your post is due in 2 hours ⏰");
   const intro=locale==="es"?(a.kind==="unfinished"?
     "¡Qué gusto verte de nuevo! 💛 Tu creatividad no tiene prisa. Cuando quieras, seguimos justo donde lo dejaste.":
     "¡Ya casi es hora! Tu publicación está programada para dentro de 2 horas. Dale una última mirada antes de compartirla."):
     (a.kind==="unfinished"?"Welcome back! 💛 Your creativity can pick up right where it left off.":
     "It's almost posting time! Your plan is set for two hours from now. Give your design one last look.");
   const cta=locale==="es"?"Abrir mi proyecto":"Open my project";
   const html=`<div style="font-family:Arial,sans-serif;background:#FAF8F3;padding:28px 18px;color:#191919"><div style="max-width:510px;margin:auto;background:#fff;padding:29px;border-radius:18px"><strong style="font-size:12px;letter-spacing:.08em">THE CONTENT LAB</strong><h1 style="font-size:26px;line-height:1.15">${htmlEscape(title)}</h1><p style="font-size:15px;line-height:1.6">${htmlEscape(intro)}</p><p style="font-size:13px;color:#667"> ${safe}</p><a href="${url}" style="display:inline-block;background:#191919;color:white;text-decoration:none;padding:13px 20px;border-radius:9px;font-weight:bold">${cta}</a><p style="font-size:11px;color:#657">Puedes cambiar tus avisos en la campanita de Content Lab.</p></div></div>`;
   const text=`${title}\n\n${intro}\n\n${url}\n\nContent Lab by The Launch Era`;
   const res=await fetch(secrets.make_email_hook,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({to:email,subject,html,text,alert_id:a.id}),signal:AbortSignal.timeout(12000)});
   if(!res.ok)throw Error("Mail workflow returned "+res.status);
   await mark(a,"email");return "email";
  }
  await mark(a,"in_app");return "in_app";
 }catch(e){
  const message=e instanceof Error?e.message:"Delivery failed";
  if(a.attempt_count>=5){await mark(a,"in_app",message);return "in_app"}
  await mark(a,"pending",message,Math.min(60,10*a.attempt_count));return "retry";
 }
}
Deno.serve(async(req)=>{
 if(req.method!=="POST")return result(405,{ok:false});
 if(!SUPABASE_URL||!SERVICE_KEY)return result(503,{ok:false,error:"Worker service account unavailable"});
 try{
  const {data:configured,error:lookup}=await db.rpc("content_lab_worker_secrets");
  if(lookup||!configured?.worker)return result(503,{ok:false,error:"Worker token unavailable"});
  if(!matchToken(req.headers.get("x-content-lab-worker")||"",String(configured.worker)))
    return result(401,{ok:false});
  const secrets=await ensurePushKeys(configured as Secrets);
  const {data:enqueued,error:queueError}=await db.rpc("content_lab_queue_due_alerts");
  if(queueError)throw Error("Queue query failed: "+queueError.message);
  const {data:alerts,error:claimError}=await db.rpc("content_lab_claim_alerts",{p_limit:25});
  if(claimError)throw Error("Queue claim failed: "+claimError.message);
  const counts:Record<string,number>={};
  for(const row of (alerts||[]) as Alert[]){
    const outcome=await deliver(row,secrets);
    counts[outcome]=(counts[outcome]||0)+1;
  }
  return result(200,{ok:true,queued:enqueued||0,processed:(alerts||[]).length,delivery:counts,
    push_ready:!!secrets.vapid_public,email_ready:!!secrets.make_email_hook});
 }catch(e){console.error("Content Lab alert worker failure",e instanceof Error?e.message:"Unknown");return result(500,{ok:false,error:"Alert worker unavailable"})}
});
