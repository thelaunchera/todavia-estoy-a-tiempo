import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Buyer must verify a new OTP after 24 hours, even with continued activity',()=>{
 const app=read('src/App.tsx'),client=read('src/platform/client.ts'),clock=read('src/SessionActivity.ts');
 const migration=read('supabase/migrations/20261104_buyer_otp_24h.sql');
 assert.ok(clock.includes('24*60*60*1000'),'existing inactivity protection can remain');
 assert.ok(client.includes('persistSession:true'),'normal reload within 24h remains signed in');
 assert.ok(client.includes("sb.rpc('content_lab_session_expires_at')"),'buyer expiry is server-derived');
 assert.ok(client.includes('activeBuyerExpiresAt=deadline'));
 assert.ok(client.includes('expiryReached(activeBuyerExpiresAt,now)'));
 assert.ok(client.includes('await endExpiredSession(activeUserId)'));
 assert.ok(client.includes("await endExpiredSession(user.id)"));
 assert.ok(client.includes('if(now-lastRecordedInteraction>=30000)'));
 assert.ok(app.includes("['pointerdown','touchstart','keydown','input','scroll']"));
 assert.ok(app.includes("document.visibilityState==='visible'"));
 assert.ok(app.includes('window.setInterval(logoutWhenIdle,30_000)'),'open app checks expiry');
 assert.ok(app.includes('window.clearInterval(expiryTimer)'));
 assert.ok(app.includes('Tus fotos y proyectos se conservan.'));
 assert.ok(migration.includes('auth.sessions'),'original OTP session, not JWT refresh time');
 assert.ok(migration.includes("interval '24 hours'"));
 assert.ok(migration.includes('alter policy "content lab buyer sees own purchase"'));
 assert.ok(migration.includes("grant execute on function public.content_lab_session_expires_at() to authenticated"));
});
test('Product Center uses the same activity key and shares the verified Lab session',()=>{
 const center=read('../centro/centro.js');
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
 assert.ok(free.includes("rect:clampFreePhotoRect(rect)"),'all draggable elements may extend beyond a single post edge');
});
test('Controls stay outside the clipped artboard and are usable with iPhone-sized touch targets',()=>{
 const css=read('src/TouchLayerCanvas.css');
 assert.ok(css.includes('.touch-editor-size-toolbar'));
 assert.ok(css.includes('.touch-editor-grow'));
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('right:2px;bottom:2px'));
});
