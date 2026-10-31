import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('iPad cover composer uses full width and photo/stickers side-by-side instead of a 440px left strip',()=>{
 const css=read('src/CreativeCover.css');
 assert.ok(css.includes('.app-shell .composer{grid-template-columns:minmax(0,1fr)!important'));
 assert.ok(css.includes('.app-shell .composer>.visual{order:-1;width:100%;max-width:none'));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)'));
 assert.ok(css.includes('@media(max-width:600px)'));
 assert.ok(css.includes('.app-shell .composer>.visual{width:100%;max-width:none'));
});
test('Photo upload is the primary cover action and works on tablet without choosing a saved image',()=>{
 const app=read('src/App.tsx'),cover=read('src/CreativeCover.tsx');
 assert.ok(app.includes('Empieza con tu propia foto'));
 assert.ok(app.includes("'Subir mi foto'"));
 assert.ok(app.includes("uploadRef.current?.click()"));
 assert.ok(!app.includes('Choose an original image'));
 assert.ok(app.includes("if (tab === 'create' && category === 'original') change('assetId', asset.id)"));
 assert.ok(app.includes("type=\"file\""));
 assert.ok(cover.includes("Your next big idea."));
 assert.ok(cover.includes('VISTA DE EJEMPLO'));
});
test('Included touch editor does not label basic finger movements or decorative controls as free',()=>{
 const cover=read('src/CreativeCover.tsx'),controls=read('src/FreeDecorControls.tsx'),app=read('src/App.tsx');
 assert.ok(cover.includes('Mover y ajustar stickers'));
 assert.ok(!cover.includes('dedo · gratis'));
 assert.ok(!controls.includes('<span>FREE</span>'));
 assert.ok(app.includes('title="Stickers y backgrounds"'));
 assert.ok(app.includes('cover-layout-chooser'));
});
