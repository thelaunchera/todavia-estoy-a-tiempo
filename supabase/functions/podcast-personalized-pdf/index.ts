import { personalize } from './personalize.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const key = keys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const auth = {apikey:key,Authorization:`Bearer ${key}`};
const bucket = 'podcast-personalized';
const version = 'approved-20261027-v2';
const masters: Record<string,Record<string,string>> = {
  prod_VU7tP0ceGvmmmW:{main:'1sDMFG1q9fj3xF7sR7gqadPgm5YpCERRq',bonus:'1J1mNzzqymV8b1Luzhuy89NwvDnwK7BM2'},
  prod_VU7udk2LVQczyY:{main:'1bN2wnvn-HzMBsNtKhin2vQK_tWPGsSD1',bonus:'1mrCfaxApDKGmXfYMHvNTOJ5U9aDA7fI1'}
};
const headers = {'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer',
  'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive'};
function fail(status:number) {return new Response('No se pudo abrir este archivo. Revisa el enlace de tu correo.',{status,headers});}
async function getStored(path:string) {
  const r = await fetch(`${url}/storage/v1/object/authenticated/${bucket}/${path}`,{headers:auth});
  if(r.status===404 || r.status===400) { await r.body?.cancel();return null; }
  if(!r.ok) throw new Error('Storage read failed');
  return new Uint8Array(await r.arrayBuffer());
}
async function store(path:string,bytes:Uint8Array) {
  const r = await fetch(`${url}/storage/v1/object/${bucket}/${path}`,{method:'POST',
    headers:{...auth,'Content-Type':'application/pdf','x-upsert':'false'},body:bytes});
  if(!r.ok) {
    const error=await r.json();
    if(r.status!==409 && error.error!=='Duplicate' && error.code!=='Duplicate') throw new Error('Storage write failed');
  }else await r.body?.cancel();
}
Deno.serve(async req => {
  if(req.method!=='GET' && req.method!=='HEAD')return fail(405);
  const parsed = new URL(req.url);
  const token = parsed.searchParams.get('token') || '';
  const kind = parsed.searchParams.get('file') || 'main';
  if(!/^[a-f0-9]{64}$/.test(token) || !['main','bonus'].includes(kind))return fail(404);
  try {
    const r = await fetch(`${url}/rest/v1/podcast_personalized_deliveries?download_token=eq.${token}&select=id,product_id,buyer_name&limit=1`,{headers:auth});
    if(!r.ok)throw new Error('Delivery lookup failed');
    const rows=await r.json();
    if(rows.length!==1 || !masters[rows[0].product_id])return fail(404);
    const row=rows[0];
    const path=`${version}/${row.id}/${kind}.pdf`;
    let result=await getStored(path);
    if(!result) {
      const masterPath=`masters/${version}/${row.product_id}-${kind}.pdf`;
      let original=await getStored(masterPath);
      if(!original) {
        const source=await fetch(`https://drive.google.com/uc?export=download&id=${masters[row.product_id][kind]}`,{redirect:'follow'});
        if(!source.ok)throw new Error('Master download failed');
        original=new Uint8Array(await source.arrayBuffer());
        if(new TextDecoder().decode(original.slice(0,5))!=='%PDF-')throw new Error('Invalid PDF master');
        await store(masterPath,original);
      }
      result=await personalize(original,row.buyer_name,row.product_id,kind);
      await store(path,result);
    }
    const title=row.product_id==='prod_VU7tP0ceGvmmmW'?'No_voy_tarde':'Empezar_de_nuevo';
    return new Response(req.method==='HEAD'?null:result,{headers:{...headers,'Content-Type':'application/pdf',
      'Content-Disposition':`inline; filename="${title}${kind==='bonus'?'_Bono':''}_Personalizado.pdf"`}});
  }catch {console.error('Personalized PDF delivery failed');return fail(503);}
});
