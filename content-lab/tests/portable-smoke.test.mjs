import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Portable frontend has no AppDeploy client dependency',()=>{for(const p of ['src/App.tsx','src/BrandGrid.tsx','src/CarouselFactory.tsx'])assert.equal(source(p).includes('@appdeploy/client'),false)});
test('Strict brand language and original photo non-repetition rules exist',()=>{assert.match(source('supabase/functions/content-lab-generate/index.ts'),/LATIN AMERICAN SPANISH/);assert.match(source('supabase/functions/content-lab-generate/index.ts'),/US ENGLISH/);assert.match(source('src/BrandGrid.tsx'),/const imageId=tile.assetId;/)});
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
 assert.ok(grid.includes('Probar 1 foto gratis'));
 assert.ok(!grid.includes("await generateRemaining(g);\n      notify('Tus nueve publicaciones están listas.')"));
});

test('Cross-brand source photos are not reused and server errors are readable',()=>{
 const grid=source('src/BrandGrid.tsx');
 const client=source('src/platform/client.ts');
 const backend=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(grid.includes("setSourceId('');setReferenceId('');setGrid(null)"));
 assert.ok(grid.includes('library.some(a=>a.id===sourceId)'));
 assert.ok(grid.includes('Cada cuenta tiene su biblioteca separada'));
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
 assert.ok(edge.includes("planningSource,posts"));
 assert.ok(ui.includes("g.planningSource==='template'"));
});
