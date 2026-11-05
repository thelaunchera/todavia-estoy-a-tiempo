import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Post uses default creation order until explicit saved layer reorder overrides it',()=>{
 const free=read('src/FreePostStudio.tsx');
 assert.ok(free.includes("const back=decor.layers.filter(l=>l.role==='background'||l.placement==='behind-text')"));
 assert.ok(free.includes('const defaultOrder=[...back,...layers,...legacyStickers(decor),...front]'));
 assert.ok(free.includes('if(!decor.layerOrder?.length)return defaultOrder'));
 assert.ok(free.includes('const rank=new Map(decor.layerOrder.map'));
 assert.ok(free.includes('return [...known,...fresh]'));
 assert.ok(free.includes('update({...decor,layerOrder:ordered})'));
 assert.ok(free.includes('renderFreePost(post,brand,images'));
 assert.ok(free.includes('onCommit={commit}'));
});

test('Carousel Factory reuses starter text, selects new elements and respects manual rear layer',()=>{
 const factory=read('src/CarouselFactory.tsx');
 const paint=read('src/PanoramaLayers.ts');
 assert.ok(factory.includes("setFocusWallpaperId(currentId)"));
 assert.ok(factory.includes('if(starter){setFocusWallpaperId(starter.id)'));
 assert.ok(factory.includes("layer.placement==='behind-text'"));
 assert.ok(paint.includes("if(current.role==='background')return sorted"));
});

test('Both touch editors keep text selectable and do not reset layers on blur',()=>{
 const touch=read('src/TouchLayerCanvas.tsx');
 const studio=read('../estudio-control/src/SeamlessEditor.tsx');
 assert.ok(touch.includes("onClick={()=>setEditingText(chosen.id)}"));
 assert.ok(touch.includes("layer.placement==='behind-text'?2+(layerIndex/Math.max(1,layers.length)):20+layerIndex"));
 assert.ok(touch.includes('onBlur={()=>setEditingText(\'\')}'));
 assert.ok(studio.includes('const {w,h}=itemBounds(it)'));
 // Pinch targets the layer touched by the first finger, not a stale selection.
 assert.ok(studio.includes('const firstTouchId=drag.current?.id??pointerStart.current?.id'));
 assert.ok(studio.includes('item.id===firstTouchId'));
 assert.ok(studio.includes('queueTransform(it.id'));;
 assert.ok(studio.includes('if(starter){setSelected(starter.id);setEditingText(starter.id)'));
 assert.ok(studio.includes('goSlide(Math.max(0,Math.min(doc.count-1,Math.floor(it.x/W))),true)'));
 assert.ok(studio.includes('const interacted=layerGesture.current'));
 assert.ok(studio.includes("if(!active)return;"));
});
