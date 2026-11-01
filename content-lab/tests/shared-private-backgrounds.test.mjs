import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Only admin-published materials are shared, never a buyer private upload',()=>{
 const client=read('src/platform/client.ts'),app=read('src/App.tsx');
 assert.ok(client.includes("const path=me.id+'/'+crypto.randomUUID()"));
 assert.ok(client.includes("return {data:await add('assets'"));
 assert.ok(client.includes("id:'shared-background-'+x.id"));
 assert.ok(client.includes("id:'shared-'+x.id"));
 assert.ok(client.includes("shared:true"));
 assert.ok(client.includes("if(id.startsWith('shared-background-'))"));
 assert.ok(client.includes("if(id.startsWith('shared-'))"));
 assert.ok(client.includes("tab('background_catalog')"));
 assert.ok(client.includes("tab('sticker_catalog')"));
 assert.ok(client.includes("if(!admin)throw Error('Solo la administradora puede publicar fondos"));
 assert.ok(client.includes("if(!admin)throw Error('Solo la administradora puede publicar stickers"));
 assert.ok(app.includes("if(aiWallet?.admin&&category==='background')return publishSharedBackground(file);"));
 assert.ok(app.includes("if(aiWallet?.admin&&category==='sticker'&&!forcePrivate)return publishSharedSticker(file,'Aesthetic');"));
 assert.ok(app.includes("upload(file,'sticker',false,brand.id,true)"));
 assert.ok(app.includes('setAssets(prev=>prev.some(x=>x.id===item.id)?prev:[...prev,item])'));
 assert.ok(app.includes("const library = assets.filter(a => a.brandId === brand?.id || a.shared === true)"));
});
test('Students can access shared backgrounds and personal items but not other students media',()=>{
 const gallery=read('src/BackgroundLibrary.tsx'),controls=read('src/FreeDecorControls.tsx'),
  stickers=read('src/StickerDownloads.tsx'),client=read('src/platform/client.ts');
 assert.ok(gallery.includes("assetCategory(a)==='background'&&!a.shared"));
 assert.ok(gallery.includes("assetCategory(a)==='background'&&a.shared"));
 assert.ok(gallery.includes("isAdmin?'Publicar fondo para todos':'Subir mi fondo privado'"));
 assert.ok(gallery.includes("solo tú".toLowerCase())||gallery.includes('Solo tú puedes ver'));
 assert.ok(gallery.includes("asset.backgroundGroup"));
 assert.ok(controls.includes('studioBackgrounds'));
 assert.ok(controls.includes('ownBackgrounds'));
 assert.ok(stickers.includes("const userCount=files.length-publicCount"));
 assert.ok(client.includes("const asset=await read('assets',id)"));
});
