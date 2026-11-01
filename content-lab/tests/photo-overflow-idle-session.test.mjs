import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Lab session uses 24h since last real activity, not 24h from initial OTP',()=>{
 const app=read('src/App.tsx'),client=read('src/platform/client.ts'),clock=read('src/SessionActivity.ts');
 assert.ok(clock.includes('24*60*60*1000'));
 assert.ok(clock.includes('tle-product-last-activity-v1:'));
 assert.ok(clock.includes('now-last>=IDLE_LIMIT_MS'));
 assert.ok(client.includes('persistSession:true'));
 assert.ok(client.includes('hasExpiredActivity(user.id)'));
 assert.ok(client.includes('recordActivity(activeUserId)'));
 assert.ok(client.includes('if(now-lastRecordedInteraction>=30000)'));
 assert.ok(app.includes("['pointerdown','touchstart','keydown','input','scroll']"));
 assert.ok(app.includes("document.visibilityState==='visible'"));
 assert.ok(app.includes('auth.checkIdle()'));
});
test('Product Center uses the same activity key and shares the verified Lab session',()=>{
 const center=read('../../centro/centro.js');
 assert.ok(center.includes("tle-product-last-activity-v1:"));
 assert.ok(center.includes('now-last>=DAY'));
 assert.ok(center.includes('expiresAt:now+DAY'));
 assert.ok(center.includes("db.from('content_lab_memberships').select('id')"));
 assert.ok(center.includes('storeMarker(user.id,true)'));
 assert.ok(center.includes('db.auth.signInWithOtp('));
});
test('Photo can overflow single post and is no longer clamped to canvas width',()=>{
 const geometry=read('src/TouchGeometry.ts'),touch=read('src/TouchLayerCanvas.tsx'),free=read('src/FreePostStudio.tsx');
 assert.ok(geometry.includes('export const clampFreePhotoRect'));
 assert.ok(geometry.includes("Math.min(3,safeNumber(r.w,.5))"));
 assert.ok(geometry.includes('Math.max(-w+visible'));
 assert.ok(geometry.includes('Math.min(3,safeNumber(r.w,.15))'));
 assert.ok(touch.includes("kind==='photo'?clampFreePhotoRect(rect)"));
 assert.ok(touch.includes('const resizeSelected=(factor:number)'));
 assert.ok(touch.includes('onClick={()=>resizeSelected(1.2)}'));
 assert.ok(touch.includes('onClick={()=>resizeSelected(.85)}'));
 assert.ok(touch.includes('max="300"'));
 assert.ok(free.includes('primaryPhotoRect:clampFreePhotoRect(rect)'));
 assert.ok(free.includes("kind==='photo'?clampFreePhotoRect(rect):clampRect(rect)"));
});
test('Controls stay outside the clipped artboard and are usable with iPhone-sized touch targets',()=>{
 const css=read('src/TouchLayerCanvas.css');
 assert.ok(css.includes('.touch-editor-size-toolbar'));
 assert.ok(css.includes('.touch-editor-grow'));
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('right:2px;bottom:2px'));
});
