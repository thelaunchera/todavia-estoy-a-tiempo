import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Portable frontend has no AppDeploy client dependency',()=>{for(const p of ['src/App.tsx','src/BrandGrid.tsx','src/CarouselFactory.tsx'])assert.equal(source(p).includes('@appdeploy/client'),false)});
test('Strict brand language and original photo non-repetition rules exist',()=>{assert.match(source('supabase/functions/content-lab-generate/index.ts'),/LATIN AMERICAN SPANISH/);assert.match(source('supabase/functions/content-lab-generate/index.ts'),/US ENGLISH/);assert.match(source('src/BrandGrid.tsx'),/photo:\(tile.design&&grid.kind==='preserve'\)/);assert.match(source('src/GridComposer.ts'),/await drawPhoto/)});
test('Private schema includes RLS',()=>{const s=source('supabase/schema.sql');assert.match(s,/enable row level security/);assert.match(s,/content_lab_admins/);assert.match(s,/content-lab-private/)});

test('free provider is Cloudflare FLUX with image reference, not paid Gemini',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(edge.includes('@cf/black-forest-labs/flux-2-klein-4b'));
 assert.ok(edge.includes('CLOUDFLARE_ACCOUNT_ID'));
 assert.ok(edge.includes('input_image_'));
 assert.equal(edge.includes('GEMINI_API_KEY'),false);
});

test('No-cost diagnostic and one-photo test are protected and visible',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 const grid=source('src/BrandGrid.tsx'),client=source('src/platform/client.ts');
 assert.ok(edge.includes("action==='connection-test'"));
 assert.ok(edge.indexOf("action==='connection-test'")>edge.indexOf('Cuenta no autorizada'));
 assert.ok(client.includes('/api/connection-test'));
 assert.ok(grid.includes('Comprobar conexión gratuita'));
 assert.ok(grid.includes('Generar 1 foto · 1 crédito IA'));
 assert.ok(!grid.includes("await generateRemaining(g);\n      notify('Tus nueve publicaciones están listas.')"));
});

test('Cross-brand source photos are not reused and server errors are readable',()=>{
 const grid=source('src/BrandGrid.tsx');
 const client=source('src/platform/client.ts');
 const backend=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(grid.includes("const ownChoice=initialSelection?.brandId===brand.id?initialSelection:null"));
 assert.ok(grid.includes("setSourceId(ownChoice?.sourceId||'')"));
 assert.ok(grid.includes('library.some(a=>a.id===sourceId)'));
 assert.ok(grid.includes('library.some(a=>a.id===sourceId)'));
 assert.ok(grid.includes('Biblioteca privada por marca'));
 assert.ok(client.includes('context.clone().json()'));
 assert.ok(backend.includes('Esta foto está guardada en otra marca'));
});

test('Cloudflare account IDs are normalized and validated before API calls',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(edge.includes(String.raw`replace(/\s+/g,'')`));
 assert.ok(edge.includes("/^[a-f0-9]{32}$/i.test(accountId)"));
 assert.ok(edge.includes('Account ID de Cloudflare es inválido'));
 assert.ok(edge.includes('object identifier is invalid'));
});

test('Token diagnostic uses Cloudflare verification before making an AI call',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(edge.includes('async function verifyCloudflareToken()'));
 assert.ok(edge.includes('/tokens/verify'));
 assert.ok(edge.includes('await verifyCloudflareToken()'));
 assert.ok(edge.includes('Cloudflare devolvió 401'));
 assert.ok(edge.includes('Cloudflare devolvió 403'));
 assert.equal(edge.includes("throw Error('Cloudflare rechazó el API Token."),false);
});

test('Grid planning uses schema JSON mode with nine independent concepts and safe fallback',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 const ui=source('src/BrandGrid.tsx');
 assert.ok(edge.includes("structuredTextModel='@cf/meta/llama-3.1-8b-instruct'"));
 assert.ok(edge.includes("response_format={type:'json_schema',json_schema:jsonSchema}"));
 assert.ok(edge.includes("typeof output==='object'"));
 assert.ok(edge.includes("const fallbackTexts="));
 assert.ok(edge.includes("planningSource='template'"));
 assert.ok(edge.includes("planningSource,analysisStatus,visualDescription,posts"));
 assert.ok(ui.includes("g.planningSource==='template'"));
});

test('in-app email OTP is present while access remains restricted to authorized accounts',()=>{
 const client=source('src/platform/client.ts'),app=source('src/App.tsx');
 assert.ok(client.includes("sb.auth.verifyOtp({email:email.trim(),token:code,type:'email'})"));
 assert.ok(client.includes('shouldCreateUser:true'));
 assert.ok(app.includes('autoComplete="one-time-code"'));
 assert.ok(app.includes('await auth.verifyEmailOtp(pendingEmail'));
 assert.ok(app.includes('setAccount(user)'));
 assert.ok(app.includes('if (!user) {'));
});
test('eight master prompts remain public as free launch offer, not a fake live checkout',()=>{
 const page=source('public/prompts/index.html');
 assert.ok(page.includes('id="copyAll"'));
 assert.ok(page.includes('Próximamente. Todavía no se aceptan pagos'));
 assert.ok(page.includes('$10 USD'));
 assert.ok(!page.includes('stripe.com/checkout'));
});

test('paid buyer can access only the email-verified owned account and not seeded podcast brands',()=>{
 const client=source('src/platform/client.ts');
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(client.includes("if(!owner){"));
 assert.ok(client.includes("sb.from('content_lab_memberships')"));
 assert.ok(client.includes('shouldCreateUser:true'));
 assert.ok(edge.includes("content_lab_memberships"));
 assert.ok(edge.includes("if(!admin&&!paid)"));
 assert.ok(edge.includes("if(paid&&!admin"));
 assert.ok(edge.includes("service.rpc('content_lab_reserve_ai'"));
});
test('membership and storage RLS isolate by both authenticated owner UUID and paid email',()=>{
 const sql=source('supabase/migrations/20261031_paid_membership_isolation.sql');
 assert.ok(sql.includes('owner_id=(select auth.uid())'));
 assert.ok(sql.includes("storage.foldername(name)"));
 assert.ok(sql.includes("lower((select auth.jwt()->>'email'))"));
 assert.ok(sql.includes("status='active'"));
 assert.ok(sql.includes('revoke all on public.content_lab_memberships from anon, authenticated'));
 assert.ok(sql.includes('grant select on public.content_lab_memberships to authenticated'));
});

test('AI credits are atomic and charged before all provider calls, with server-only refund',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 const sql=source('supabase/migrations/20261031_ai_credit_budget.sql');
 assert.ok(edge.includes("service.rpc('content_lab_reserve_ai'"));
 assert.ok(edge.includes("service.rpc('content_lab_refund_ai'"));
 assert.ok(edge.includes("if(planningSource==='template')await rollback()"));
 for(const s of ['pg_advisory_xact_lock','photo_remaining integer not null default 60','creative_remaining integer not null default 30','units_used+v_global<=50','auth.role()'])assert.ok(sql.includes(s),s);
 assert.ok(sql.includes("grant execute on function public.content_lab_refund_ai(uuid,uuid) to service_role"));
 assert.ok(sql.includes("grant execute on function public.content_lab_reserve_ai(text,uuid,text) to service_role"));
 assert.ok(sql.includes("if auth.role()<>'service_role' then"));
 assert.ok(sql.includes("photo_today else 0 end)+v_photo <= 10"));
});
test('new buyers get an isolated neutral brand, never admin seed brands',()=>{
 const c=source('src/platform/client.ts');
 assert.ok(c.includes("name:'My Brand'"));
 assert.ok(c.includes("if(!owner){"));
 assert.ok(c.includes("path==='/api/ai-wallet'"));
 assert.ok(c.includes("content-lab-credit-change"));
});
