import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');

test('High quality uploads are preserved instead of flattened to 1.8MP at 76% JPEG',()=>{
 const app=read('../src/App.tsx'),client=read('../src/platform/client.ts');
 assert.ok(app.includes('maxDimension:preserveOriginal?3000:2160'));
 assert.ok(app.includes('maxPixels:preserveOriginal?7_000_000:4_600_000'));
 assert.ok(app.includes('quality:preserveOriginal ? 0.94 : 0.88'));
 assert.ok(app.includes('preserveIfPossible:preserveOriginal'));
 assert.ok(client.includes('input.type===opts.mimeType'));
 assert.ok(client.includes('return {data:await base64(input),mimeType:opts.mimeType}'));
 assert.ok(client.includes('ctx.imageSmoothingQuality=\'high\''));
 assert.ok(client.includes('4_850_000'));
 assert.ok(!app.includes('maxDimension: 1500, maxPixels: 1800000, quality: 0.76'));
});
test('Grid editor preview is sharp and PNG-based, while export stays genuine resolution',()=>{
 const editor=read('../src/GridVisualEditor.tsx'),grid=read('../src/BrandGrid.tsx');
 assert.ok(editor.includes('previewCanvas.width=720'));
 assert.ok(editor.includes("previewCanvas.toDataURL('image/png')"));
 assert.ok(!editor.includes("canvas.toDataURL('image/jpeg',.72)"));
 assert.ok(grid.includes("a.href=canvas.toDataURL('image/png')"));
});
test('Buyer login offers OTP at Product Center but existing classroom password login remains',()=>{
 const html=read('../../centro/index.html'),js=read('../../centro/centro.js');
 assert.ok(html.includes('id="form-otp"'));
 assert.ok(html.includes('id="form-otp-verify"'));
 assert.ok(html.includes('data-mode="login"'));
 assert.ok(js.includes('db.auth.signInWithOtp('));
 assert.ok(js.includes('db.auth.verifyOtp({email:pendingOtpEmail,token:code,type:\'email\'})'));
 assert.ok(js.includes('db.auth.signInWithPassword('));
 assert.ok(js.includes("if(labMembership.data)purchased.add('content-lab')"));
 assert.ok(js.includes("const has=purchased.has(code),open=code==='content-lab'&&has?true"));
 assert.ok(js.includes("if(isLab)chip.href='../content-lab/'"));
});
test('Access to Lab is scoped to verified membership and Product Center, not an unearned course unlock',()=>{
 const app=read('../src/App.tsx'),js=read('../../centro/centro.js');
 assert.ok(app.includes('href="../centro/"'));
 assert.ok(js.includes("db.from('content_lab_memberships').select('id')"));
 assert.ok(js.includes(".eq('status','active').maybeSingle()"));
 assert.ok(js.includes('Para comenzar')||js.includes('Centro de Productos'));
 assert.ok(!js.includes("purchased.add('web-class')"));
});
