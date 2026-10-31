import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Shared original sticker catalog is admin-published, paid-only and isolated from buyer private assets',()=>{
 const sql=source('supabase/migrations/20261031_shared_original_sticker_catalog.sql');
 const fix=source('supabase/migrations/20261031_fix_shared_sticker_path_guard.sql');
 assert.ok(sql.includes('content_lab_sticker_catalog'));
 assert.ok(sql.includes('content_lab_memberships'));
 assert.ok(sql.includes("m.status='active'"));
 assert.ok(sql.includes('lab admin publish original sticker'));
 assert.ok(sql.includes('lab paid shared stickers storage read'));
 assert.ok(sql.includes("bucket_id='content-lab-private'"));
 assert.ok(fix.includes("shared-stickers/[0-9a-f-]{36}[.]png"));
});
test('Catalog is fetched once as authenticated shared read-only assets, never as buyer-owned uploads',()=>{
 const api=source('src/platform/client.ts');
 assert.ok(api.includes('sharedStickers()'));
 assert.ok(api.includes('assets:[...assets,...catalogue]'));
 assert.ok(api.includes("id:'shared-'+x.id"));
 assert.ok(api.includes("if(id.startsWith('shared-'))"));
 assert.ok(api.includes("if(path==='/api/sticker-catalog')"));
 assert.ok(api.includes('SHA-256'));
 assert.ok(api.includes('Solo la administradora puede publicar'));
 assert.ok(api.includes("contentType:'image/png'"));
 assert.ok(api.includes("if(existing)return {data:{...stickerRecord(existing),duplicate:true}}"));
});
test('Private brand media and shared stickers are both present in editors, with downloadable original PNGs',()=>{
 const app=source('src/App.tsx'),gallery=source('src/StickerDownloads.tsx');
 assert.ok(app.includes("a.brandId === brand?.id || a.shared === true"));
 assert.ok(app.includes('isAdmin={Boolean(aiWallet?.admin)}'));
 assert.ok(app.includes('onPublish={publishSharedSticker}'));
 assert.ok(gallery.includes("a.brandId===brandId||a.shared"));
 assert.ok(gallery.includes("isAdmin?await onPublish(item.file,item.group):await onUpload(item.file)"));
 assert.ok(gallery.includes('SHA')===false); // checksum is enforced by server, not fake UI.
 assert.ok(gallery.includes('✓ Incluido'));
 assert.ok(gallery.includes("download(asset)"));
 assert.ok(gallery.includes('onUse(asset.id,destination)'));
 assert.ok(app.includes('setStickerPref(p=>('));
 assert.ok(app.includes("writeCoverDecor(old.designData"));
});
test('ZIP import recognizes the five original sticker folders without requiring buyers to import anything',()=>{
 const gallery=source('src/StickerDownloads.tsx');
 for(const prefix of ['01_Avatars','02_Matcha','03_Pilates','04_Ejercicios'])assert.ok(gallery.includes(prefix));
 assert.ok(gallery.includes('el catálogo se distribuye automáticamente'));
 assert.ok(gallery.toLowerCase().includes('sin créditos'));
 assert.ok(gallery.includes('files.filter(a=>a.shared)'));
});
