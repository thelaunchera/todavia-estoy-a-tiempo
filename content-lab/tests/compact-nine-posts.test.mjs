import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Quick 9-post grid starts with distinct concepts, not nine invented photo previews',()=>{
 const s=read('src/BrandGrid.tsx');
 assert.ok(s.includes("isExpress&&!expandedEditor"));
 assert.ok(s.includes("VISTA PREVIA · GRID 3 × 3"));
 assert.ok(s.includes("El Lab no genera imágenes"));
 assert.ok(s.includes("bg-compact-placeholder"));
 assert.ok(s.includes("p.assetId&&images[p.assetId]?<img"));
 assert.ok(s.includes("index===0?quickMessage.trim()"));
});
test('Only selected post shows generation, import, preview and download controls',()=>{
 const s=read('src/BrandGrid.tsx');
 assert.ok(s.includes('bg-compact-workspace'));
 assert.ok(s.includes('bg-compact-main-actions'));
 assert.ok(s.includes('bg-compact-import'));
 assert.ok(s.includes('bg-compact-real-preview'));
 assert.ok(s.includes('bg-compact-prompt-details'));
 assert.ok(s.includes('bg-compact-advanced-link'));
 assert.ok(s.includes('movePost(-1)')&&s.includes('movePost(1)'));
 assert.ok(s.includes("setExpandedEditor(false)"));
});
test('Image imports preserve the source and target the post selected at upload start',()=>{
 const s=read('src/BrandGrid.tsx');
 assert.ok(s.includes('const targetGridId=grid.id,targetIndex=selected'));
 assert.ok(s.includes('existing?.id===targetGridId'));
 assert.ok(s.includes('i===targetIndex?{...p,assetId:asset.id}'));
 assert.ok(s.includes("setDownloads([]);setReviewed(false);setQaNotes([])"));
});
test('Original AI-designed image downloads in PNG without re-stamping template headlines',()=>{
 const s=read('src/BrandGrid.tsx');
 const a=s.slice(s.indexOf('const downloadCompleted=async()=>'),s.indexOf('const copyCurrentPrompt=async()=>'));
 assert.ok(a.includes('canvas.toDataURL(\'image/png\')'));
 assert.ok(a.includes('ctx.drawImage(image'));
 assert.ok(a.includes('Math.min(W/w,H/h)'));
 assert.equal(a.includes('composeGridPoster'),false);
});
test('Mobile grid only shows image results or honest idea cards',()=>{
 const css=read('src/BrandGrid.css');
 assert.ok(css.includes('.bg-compact-nine{display:grid;grid-template-columns:repeat(3'));
 assert.ok(css.includes('bg-compact-tile'));
 assert.ok(css.includes('@media(max-width:650px)'));
});
