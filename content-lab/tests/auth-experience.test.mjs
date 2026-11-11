import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Content Lab auth uses a secure editable sign-in card with no fake password accounts',()=>{
 const view=read('src/AuthExperience.tsx'),app=read('src/App.tsx'),client=read('src/platform/client.ts');
 for(const required of ['lab-auth-tabs','signin','signup','lab-auth-floating','onEmail','onRequestCode','onVerifyCode','InstallContentLab'])assert.ok(view.includes(required),required);
 assert.ok(client.includes('shouldCreateUser:true'));
 assert.ok(app.includes('await auth.verifyEmailOtp(pendingEmail'));
 assert.ok(app.includes('setAccount(user)'));
 assert.ok(!client.includes('signInWithPassword('),'no unsupported password authentication');
 assert.ok(view.includes('Sin contraseña')&&view.includes('No password needed'));
});
test('Email verification shows illustrated envelope, countdown resend and masked expired code',()=>{
 const view=read('src/AuthExperience.tsx'),app=read('src/App.tsx');
 for(const required of ['lab-auth-ring','lab-auth-envelope','secondsLeft','setInterval(tick, 1000)','onRequestCode','autoComplete="one-time-code"','inputMode="numeric"','type={expired ? \'password\' : \'text\'}'])assert.ok(view.includes(required),required);
 assert.ok(app.includes('setResendReadyAt(Date.now()+60_000)'));
 assert.ok(view.includes('disabled={busy || secondsLeft > 0}'));
});
test('Expired login overlays an inert blurred dashboard and protects membership data',()=>{
 const view=read('src/AuthExperience.tsx'),css=read('src/AuthExperience.css'),app=read('src/App.tsx'),client=read('src/platform/client.ts');
 assert.ok(view.includes('lab-auth-dashboard-ghost'));
 assert.ok(view.includes('aria-modal={expired ? true : undefined}'));
 assert.ok(view.includes('readOnly required className="lab-auth-account-input"'));
 assert.ok(css.includes('filter:blur(7px)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(app.includes('setPosts([]);setImages({});setAssets([]);setBrands([])'));
 assert.ok(client.includes("sb.from('content_lab_memberships')"));
 assert.ok(client.includes("sb.rpc('content_lab_session_expires_at')"));
});
