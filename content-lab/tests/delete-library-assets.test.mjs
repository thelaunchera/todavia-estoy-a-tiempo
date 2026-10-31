import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Uploaded sticker cards expose Delete for owner, but only admin may delete shared stickers',()=>{
 const ui=read('src/StickerDownloads.tsx');
 const app=read('src/App.tsx');
 assert.ok(ui.includes('(!asset.shared||isAdmin)'));
 assert.ok(ui.includes('aria-label={\'Eliminar sticker \'+displayAssetName(asset)}'));
 assert.ok(ui.includes('onClick={()=>void onDelete(asset)}'));
 assert.ok(app.includes('onDelete={deleteLibraryAsset}'));
 assert.ok(app.includes('window.confirm('));
 assert.ok(app.includes('biblioteca de TODOS los alumnos'));
});
test('Shared and privately-uploaded backgrounds have delete buttons in both category and own tabs',()=>{
 const ui=read('src/BackgroundLibrary.tsx');
 assert.ok(ui.includes('onDelete:(asset:LibraryAsset)=>Promise<void>'));
 assert.ok(ui.includes('isAdmin&&<button className="background-delete-button"'));
 assert.ok(ui.includes('onClick={()=>void onDelete(asset)}'));
 assert.ok(ui.includes('onClick={()=>void onDelete(a)}'));
 assert.ok(ui.includes('filter===\'shared\''));
 assert.ok(ui.includes('ownVisible.map'));
});
test('Backend deletion validates administrator in DB and cleans actual Storage objects',()=>{
 const api=read('src/platform/client.ts');
 assert.ok(api.includes("path.match(/^\\/api\\/(sticker-catalog|background-catalog)"));
 assert.ok(api.includes("const {data:admin,error:adminError}=await tab('admins')"));
 assert.ok(api.includes("if(!admin)throw Error('Solo la administradora"));
 assert.ok(api.includes("tab(type).delete().eq('id',id).select('id')"));
 assert.ok(api.includes("sb.storage.from(bucket).remove([record.path])"));
 assert.ok(api.includes("const asset=await read('assets',id)"));
 assert.ok(api.includes("tab('assets')"));
 assert.ok(api.includes("if(admin&&asset.category==='background')"));
});

test('Admin can delete included backgrounds with server-persisted curation and editors hide choices',()=>{
 const app=read('src/App.tsx'),lib=read('src/BackgroundLibrary.tsx'),
  editor=read('src/FreeDecorControls.tsx'),factory=read('src/CarouselFactory.tsx'),
  api=read('src/platform/client.ts'),sql=read('supabase/migrations/20261031_admin_hidden_builtin_backgrounds.sql');
 assert.ok(lib.includes('onDeletePreset(entry.item.id,entry.item.name)'));
 assert.ok(lib.includes('isBackgroundVisible(item.id)'));
 assert.ok(app.includes("await api.post('/api/hidden-backgrounds',{id})"));
 assert.ok(app.includes('updateHiddenBackgrounds(data.hiddenBackgroundIds||[])'));
 assert.ok(api.includes("const {data:admin,error:authError}=await tab('admins')"));
 assert.ok(api.includes("hidden_backgrounds"));
 assert.ok(api.includes("FREE_BACKGROUNDS.some(x=>x.id===id)"));
 assert.ok(editor.includes("isBackgroundVisible(b.id)"));
 assert.ok(factory.includes("isBackgroundVisible(b.id)"));
 assert.ok(sql.includes("lab admin hide built in backgrounds"));
 assert.ok(sql.includes("content_lab_memberships"));
});
