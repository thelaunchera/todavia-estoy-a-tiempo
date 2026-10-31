import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Account onboarding and site header both offer Spanish Latin American and English',()=>{
 const app=read('src/App.tsx'),auth=read('src/platform/client.ts'),locale=read('src/LabLocale.ts');
 assert.ok(app.includes("useState<'es'|'en'>"));
 assert.ok(app.includes("chooseLanguage('es')"));
 assert.ok(app.includes("chooseLanguage('en')"));
 assert.ok(app.includes('lab-site-locale'));
 assert.ok(app.includes("es-419"));
 assert.ok(app.includes('auth.setPreferredLanguage'));
 assert.ok(auth.includes('content_lab_language'));
 assert.ok(auth.includes('sb.auth.updateUser'));
 assert.ok(locale.includes('MutationObserver'));
 assert.ok(locale.includes('postcard h3'));
});
test('Static template gallery removed from post creation; layered full photo studio replaces it',()=>{
 const app=read('src/App.tsx'),studio=read('src/FreePostStudio.tsx'),
  decor=read('src/CoverDecor.ts'),layer=read('src/PanoramaLayers.ts');
 assert.ok(app.includes('<FreePostStudio'));
 assert.ok(!app.includes('<CreativeCover'));
 assert.ok(!app.includes('cover-layout-chooser'));
 assert.ok(!app.includes('template-grid'));
 assert.ok(studio.includes('backgroundImageId:asset.id'));
 assert.ok(studio.includes('backgroundImageId:post.assetId'));
 assert.ok(studio.includes("kind:'photo'"));
 assert.ok(studio.includes('onDropFiles='));
 assert.ok(studio.includes('onReorder={reorder}'));
 assert.ok(studio.includes('await paintPanoramaLayers(ctx,1080,1350'));
 assert.ok(decor.includes('normalizePanoramaLayers(p.layers)'));
 assert.ok(layer.includes('paintPanoramaLayers('));
});
