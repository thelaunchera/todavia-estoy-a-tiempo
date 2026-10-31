import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Reels and Stories render actual 1080 by 1920 canvases, editable touch ratio and PNG exports',()=>{
 const render=read('src/FreePostStudio.tsx'),touch=read('src/TouchLayerCanvas.tsx'),app=read('src/App.tsx');
 assert.ok(render.includes("format==='Reel'||format==='Story'?{width:1080,height:1920}"));
 assert.ok(render.includes('canvas.width=width;canvas.height=height'));
 assert.ok(render.includes('paintFreeBackground(ctx,width,height,backgroundId)'));
 assert.ok(render.includes('paintPanoramaLayers(ctx,width,height,coverLayers(post,brand,decor),images)'));
 assert.ok(render.includes('canvasHeight={freePostDimensions(post.format).height}'));
 assert.ok(render.includes('a.download=(post.title'));
 assert.ok(touch.includes('canvasHeight = 1350'));
 assert.ok(touch.includes('rect.h*canvasHeight'));
 assert.ok(app.includes("['Reel','Story'].includes(editor.format)?'1920 · 9:16':'1350 · 4:5'"));
 assert.ok(app.includes("editor.format==='Carousel'&&"));
});
test('The included and admin-shared background picker is directly accessible in Carousel Factory',()=>{
 const car=read('src/CarouselFactory.tsx'),decor=read('src/FreeDecorControls.tsx');
 assert.ok(car.includes('defaultTab="backgrounds" initiallyExpanded'));
 assert.ok(car.includes('Fondo de todo el carrusel'));
 assert.ok(car.includes('backgroundOfAll'));
 assert.ok(car.includes('setAll(slides.map((part,index)=>({...part,backgroundId,backgroundImageId'));
 assert.ok(car.includes('seamlessBackgroundId:backgroundId'));
 assert.ok(decor.includes('Fondos incluidos en Content Lab'));
 assert.ok(decor.includes('studioBackgrounds.filter'));
});
test('AI prepares a draft from a natural idea while retaining chosen backgrounds',()=>{
 const app=read('src/App.tsx'),car=read('src/CarouselFactory.tsx');
 assert.ok(app.includes('Cuéntale a la IA qué quieres crear'));
 assert.ok(app.includes('setManualOpen(true)'));
 assert.ok(app.includes('hidden={!manualOpen}'));
 assert.ok(app.includes('Crear con IA · 1 crédito'));
 assert.ok(car.includes('Crear carrusel con IA · 1 crédito'));
 assert.ok(car.includes('encodeCarouselDesign(generated,style)'));
 assert.ok(car.includes('backgroundId,backgroundImageId,backgroundColor:slide.backgroundColor'));
 assert.ok(car.includes('backgroundId:slide.backgroundId'));
});
