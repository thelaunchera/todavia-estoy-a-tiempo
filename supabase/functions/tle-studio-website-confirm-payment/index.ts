import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const MAKE_HOOK="https://hook.us2.make.com/vmku733oldcldive8qixgqn59yuzvpmx";
const URL=Deno.env.get("SUPABASE_URL")||"";
const KEY=(()=>{let v={};try{v=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (v as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const PROJECT="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-website-order-confirm";
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);
const AMOUNTS:Record<string,number>={"website-basic":1500,"website-ai-crm":2500};
function headers(origin:string){return {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"}}
function send(origin:string,status:number,data:any){return new Response(JSON.stringify(data),{status,headers:headers(origin)})}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return send(origin,405,{ok:false});
 if(origin&&!ORIGINS.has(origin))return send(origin,403,{ok:false});
 if(!KEY||!URL)return send(origin,503,{ok:false,error:"Service unavailable"});
 try{
  const input=await req.json().catch(()=>({}));
  const session_id=String(input.session_id||"");
  const offer=String(input.offer||"");
  const lang=input.lang==="es"?"es":"en";
  if(!/^cs_live_[A-Za-z0-9]+$/.test(session_id)||!(offer in AMOUNTS))return send(origin,400,{ok:false,error:"Invalid checkout reference"});
  const verify=await fetch(MAKE_HOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offer:"website-order-verify",session_id})});
  if(!verify.ok)return send(origin,503,{ok:false,error:"Stripe verification unavailable"});
  const proof=await verify.json().catch(()=>null);
  const legacyAdvanced=offer==="website-ai-crm"&&String(proof.mode)==="subscription"&&/^sub_[A-Za-z0-9]+$/.test(String(proof.subscription||""));
  const deferredAdvanced=offer==="website-ai-crm"&&String(proof.mode)==="payment"&&String(proof.payment_model)==="setup_now_bill_after_delivery_month"&&String(proof.recurring_billing_starts)==="one_month_after_confirmed_delivery"&&/^cus_[A-Za-z0-9]+$/.test(String(proof.customer||""))&&/^pi_[A-Za-z0-9]+$/.test(String(proof.payment_intent||""));
  if(!proof||proof.session_id!==session_id||proof.offer!==offer||proof.tle_flow!=="website_packages_20261105"||
     String(proof.payment_status)!=="paid"||String(proof.status)!=="complete"||
     (offer==="website-basic"?String(proof.mode)!=="payment":!(legacyAdvanced||deferredAdvanced))||
     String(proof.livemode)!=="true"||String(proof.currency).toLowerCase()!=="usd"||
     !(Number(proof.amount_total)===AMOUNTS[offer]||(legacyAdvanced&&Number(proof.amount_total)===3300&&Number(proof.created)>0&&Number(proof.created)<1793929781)))return send(origin,403,{ok:false,error:"Payment not confirmed"});
  const project=await fetch(PROJECT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id,offer,lang,defer_email:true})});
  const result=await project.json().catch(()=>({}));
  if(!project.ok||result.ok!==true)return send(origin,503,{ok:false,error:"Project connection unavailable"});
  const row={stripe_session_id:session_id,package_slug:offer,amount_cents:Number(proof.amount_total),
    customer_email:String(proof.email||"").trim().toLowerCase().slice(0,254)||null,
    customer_name:String(proof.name||"").trim().slice(0,150)||null,monthly_subscription_cents:offer==="website-ai-crm"?800:0,stripe_subscription_id:legacyAdvanced?String(proof.subscription):null};
  const write=await fetch(URL+"/rest/v1/tle_studio_website_payments?on_conflict=stripe_session_id",{method:"POST",
    headers:{apikey:KEY,Authorization:"Bearer "+KEY,"Content-Type":"application/json","Prefer":"resolution=ignore-duplicates,return=minimal"},
    body:JSON.stringify(row)});
  if(!write.ok){console.error("Studio paid alert write failed",write.status);return send(origin,503,{ok:false,error:"Studio alert unavailable"})}
  // Only send the buyer's intake email after both company and Studio payment records exist.
  // A temporary email failure never blocks a verified buyer from reaching their intake.
  try{
   const mail=await fetch(PROJECT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id,offer,lang}),signal:AbortSignal.timeout(12000)});
   if(!mail.ok)console.error("Post-registration buyer email retry needed",mail.status);
  }catch(e){console.error("Buyer email deferred",String(e).slice(0,90))}
  return send(origin,200,{ok:true,paid:true,offer,amount_cents:Number(proof.amount_total)});
 }catch(e){console.error("Website payment confirm failed",String(e).slice(0,75));return send(origin,503,{ok:false,error:"Payment confirmation unavailable"})}
});
