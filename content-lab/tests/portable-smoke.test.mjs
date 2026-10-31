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
