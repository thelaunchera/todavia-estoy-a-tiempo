import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('The same live carousel preview is available from every creative step',()=>{
 const src=read('CarouselFactory.tsx');
 const panel=src.indexOf('const renderPreviewPanel=(sheet:boolean)=>');
 const portal=src.indexOf('mobileViewport&&mobilePreviewOpen&&createPortal');
 const layout=src.indexOf('className="factory-persistent-layout"');
 const content=src.indexOf('className="factory-persistent-content"');
 const firstStep=src.indexOf("studioTab==='inspiration'&&<section");
 assert.ok(panel>0&&portal>panel&&layout>portal&&content>layout&&firstStep>content);
 assert.ok(src.includes('renderPreviewPanel(true)'));
 assert.ok(src.includes('!mobileViewport&&renderPreviewPanel(false)'));
 assert.equal((src.match(/renderSwipePreview\(\)/g)||[]).length,1);
 assert.ok(src.includes('Tu carrusel en vivo'));
 assert.ok(src.includes('className="factory-mobile-preview-trigger"'));
 assert.ok(src.includes('Ver diseño'));
 assert.ok(src.includes("const all=independent?null:await renderAllSlides()"));
 assert.ok(!src.includes("if(studioTab!=='slides'&&studioTab!=='review')return;"));
});

test('On iPhone the preview does not obstruct editing until explicitly opened',()=>{
 const css=read('CarouselFactory.css');
 const ui=read('CarouselFactory.tsx');
 assert.match(css,/\.factory-persistent-preview\{display:none\}/);
 assert.match(css,/\.factory-persistent-preview\.is-open\{[\s\S]*?display:block;position:fixed/);
 assert.match(css,/\.factory-mobile-preview-trigger\{[\s\S]*?display:flex/);
 assert.match(css,/\.factory-mobile-preview-trigger\{[\s\S]*?position:sticky/);
 assert.match(css,/\.factory-mobile-preview-backdrop\{[\s\S]*?display:block/);
 assert.ok(ui.includes("const [mobilePreviewOpen,setMobilePreviewOpen]=useState(false)"));
 assert.ok(ui.includes('onClick={()=>setMobilePreviewOpen(false)}'));
 assert.ok(ui.includes("event.key==='Escape'"));
 assert.ok(ui.includes('aria-expanded={mobilePreviewOpen}'));
 assert.ok(ui.includes('aria-controls="factory-mobile-preview"'));
 assert.ok(ui.includes("import { createPortal } from 'react-dom'"));
 assert.ok(ui.includes('document.body)}'));
 assert.ok(ui.includes("document.body.style.overflow='hidden'"));
});

test('Sticker selection and removing stickers keep the previously chosen background',()=>{
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
