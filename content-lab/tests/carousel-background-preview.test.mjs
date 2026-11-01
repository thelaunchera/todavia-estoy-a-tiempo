import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
test('The carousel live preview is mounted outside conditional steps',()=>{
 const src=read('CarouselFactory.tsx');
 const open=src.indexOf('className="factory-persistent-layout"');
 const preview=src.indexOf('className="factory-persistent-preview factory-right"');
 const content=src.indexOf('className="factory-persistent-content"');
 const firstStep=src.indexOf("studioTab==='inspiration'&&<section");
 assert.ok(open>0&&preview>open&&content>preview&&firstStep>content);
 assert.equal((src.match(/renderSwipePreview\(\)/g)||[]).length,1);
 assert.ok(src.includes('Tu carrusel en vivo'));
 assert.ok(src.includes("const all=independent?null:await renderAllSlides()"));
 assert.ok(!src.includes("if(studioTab!=='slides'&&studioTab!=='review')return;"));
});
test('The mobile preview stays visible when browsing stickers and backgrounds',()=>{
 const css=read('CarouselFactory.css');
 assert.ok(css.includes('.factory-persistent-layout{display:block}'));
 assert.ok(css.includes('position:sticky;top:66px'));
 assert.ok(css.includes('.factory-live-preview-compact{display:flex'));
 assert.ok(css.includes('.factory-live-preview-desktop{display:none}'));
});
test('Stickers never overwrite the background settings while added or removed',()=>{
 const src=read('FreeDecorControls.tsx');
 const toggle=src.slice(src.indexOf('const toggle=(id:string)=>'),src.indexOf('return <section',src.indexOf('const toggle=(id:string)=>')));
 assert.ok(toggle.includes('onChange({stickerIds:'));
 assert.ok(!toggle.includes('onChange({backgroundId,backgroundImageId,stickerIds:'));
 assert.ok(src.includes('onClick={()=>onChange({stickerIds:[]})}'));
});
test('The bottom nav reopens an in-progress carousel instead of resetting it',()=>{
 const src=read('App.tsx');
 assert.ok(src.includes("editor.format==='Carousel'&&editor.brandId===brand?.id?navigate('factory'):startFactory()"));
});
