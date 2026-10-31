import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Create menu separates post, carousel, reel and story workspaces',()=>{
 const app=read('src/App.tsx');
 assert.ok(app.includes("'vertical' | 'factory'"));
 assert.ok(app.includes('Reels e historias · 9:16'));
 assert.ok(app.includes('<VerticalStudio'));
 assert.ok(app.includes("startVertical('Reel')"));
 assert.ok(app.includes("startVertical('Story')"));
 assert.ok(app.includes("post.format==='Carousel'?'factory':'create'"));
 assert.ok(app.includes("format:'Single post'"));
});
test('Vertical editor uses editable editorial covers and supports video frames without pretending to save videos',()=>{
 const vertical=read('src/VerticalStudio.tsx');
 const post=read('src/FreePostStudio.tsx');
 assert.ok(vertical.includes('input hidden ref={photoRef}'));
 assert.ok(vertical.includes('input hidden ref={videoRef}'));
 assert.ok(vertical.includes('<video ref={player} controls playsInline'));
 assert.ok(vertical.includes("onChange({assetId:item.id"));
 assert.ok(vertical.includes("new File([blob],'portada-video.jpg'"));
 assert.ok(vertical.includes('video original no se guarda'));
 assert.ok(vertical.includes('<FreePostStudio'));
 assert.ok(vertical.includes("setEditorial('light')"));
 assert.ok(vertical.includes("setEditorial('full')"));
 assert.ok(vertical.includes("setEditorial('dark')"));
 assert.ok(post.includes("format==='Reel'||format==='Story'?{width:1080,height:1920}"));
});
test('Carousel provides always visible upload, error notices and starts blank rather than fake headings',()=>{
 const editor=read('src/PanoramaEditor.tsx'),factory=read('src/CarouselFactory.tsx');
 assert.ok(editor.includes('panorama-add-photo'));
 assert.ok(editor.includes('<input ref={input} hidden type="file"'));
 assert.ok(editor.indexOf('<input ref={input} hidden')<editor.indexOf('{libraryOpen&&<aside'));
 assert.ok(editor.includes('setUploadError('));
 assert.ok(editor.includes('moreTools&&<div'));
 assert.ok(factory.includes("const [studioTab,setStudioTab]=useState"));
 assert.ok(factory.includes("('canvas');"));
 assert.ok(factory.includes("if(!post.id&&!post.hook.trim()"));
 assert.ok(factory.includes("notify('No se pudo añadir '+file.name"));
 assert.ok(factory.includes('Foto añadida. Tócala para moverla'));
});
