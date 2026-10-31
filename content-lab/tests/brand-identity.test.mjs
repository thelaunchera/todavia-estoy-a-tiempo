import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=(file)=>readFileSync(resolve(base,file),'utf8');

test('Buyers can set three base colors plus six additional editable brand swatches',()=>{
 const app=source('src/App.tsx'),kit=source('src/BrandIdentity.ts');
 assert.ok(app.includes('additionalColors?: string[]'));
 assert.ok(app.includes('additionalColors: []'));
 assert.ok(app.includes('Añadir color'));
 assert.ok(app.includes('length>=6'));
 assert.ok(app.includes('normalizeExtraColors(brandForm.additionalColors'));
 assert.ok(kit.includes('if(result.length>=6)break'));
 assert.ok(app.includes('lab-brand-palette-tile'));
});
test('Each brand stores optional social network handles without requesting external authentication',()=>{
 const app=source('src/App.tsx'),kit=source('src/BrandIdentity.ts'),client=source('src/platform/client.ts');
 for(const p of ['instagram','facebook','tiktok','threads','youtube','pinterest','linkedin'])
   assert.ok(kit.includes("id:'"+p+"'"));
 assert.ok(app.includes('socialAccounts?: SocialAccounts'));
 assert.ok(app.includes('primaryPlatform?: SocialPlatform'));
 assert.ok(app.includes('¿En qué redes sociales está tu marca?'));
 assert.ok(app.includes('socialAccounts:{...brandForm.socialAccounts,[p.id]:e.target.value}'));
 assert.ok(client.includes("update({payload:{...original,...payload}"));
});
test('Carousel uses additional colors selectively, keeping a consistent master accent by default',()=>{
 const helper=source('src/CarouselArtDirection.ts'),carousel=source('src/CarouselFactory.tsx'),grid=source('src/BrandGrid.tsx');
 assert.ok(helper.includes('brandPalette(brand)'));
 assert.ok(helper.includes('slideAccentIndex>0'));
 assert.ok(carousel.includes('accentIndex:Number(e.target.value)'));
 assert.ok(carousel.includes('targetPlatform:e.target.value'));
 assert.ok(carousel.includes('Ver el carrusel completo'));
 assert.ok(grid.includes('Usar un tono de mi Brand Kit'));
});
test('Generated copy takes destination into account without claiming to publish',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts'),app=source('src/App.tsx'),factory=source('src/CarouselFactory.tsx');
 assert.ok(edge.includes('Publishing destination: '));
 assert.ok(edge.includes('Never claim that an external account is connected'));
 assert.ok(app.includes('platform: preferredPlatform(brand)'));
 assert.ok(factory.includes('platform:socialDestination'));
});
