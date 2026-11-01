import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const helper=source.slice(source.indexOf('  const uploadBrandImage ='),source.indexOf('  const copy = async'));
const executable=helper.replace("file:File|undefined, field:'logoAssetId'|'referenceAssetId'","file, field").replace('data as Brand','data')+';globalThis.runUpload=uploadBrandImage;';
for(const fresh of [false,true])test('Direct brand upload uses the edited brand, including new brands: '+fresh,async()=>{
 let draft={id:fresh?'':'edited-brand',name:'Edited brand',color:'#123456'};
 const uploads=[],created=[],brands=[];
 const ctx={brandForm:draft,busy:'',toast(){},setBusy(){},err(e){throw e},
  setBrands(fn){brands.splice(0,brands.length,...fn(brands));},
  setBrandForm(value){draft=typeof value==='function'?value(draft):value;},
  api:{async post(path,payload){created.push({path,payload});return {data:{...payload,id:'new-brand'}}}},
  async upload(file,category,autoSelect,brandId){uploads.push({category,autoSelect,brandId});return {id:'uploaded-id',brandId}}
 };
 vm.createContext(ctx);vm.runInContext(executable,ctx);
 await ctx.runUpload({name:'logo.png'},'logoAssetId');
 assert.equal(uploads[0].brandId,fresh?'new-brand':'edited-brand');
 assert.equal(uploads[0].category,'logo');assert.equal(uploads[0].autoSelect,false);
 assert.equal(draft.logoAssetId,'uploaded-id');assert.equal(created.length,fresh?1:0);
});
test('Both brand fields accept direct uploads and preserve logo transparency',()=>{
 assert.match(source,/uploadBrandImage\(e.target.files\?\.\[0\],'logoAssetId'\)/);
 assert.match(source,/uploadBrandImage\(e.target.files\?\.\[0\],'referenceAssetId'\)/);
 assert.ok(source.includes('brandId: targetBrandId'));
 assert.ok(source.includes("category==='reference'||category==='logo'"));
});
test('Lab public legal links resolve to Lab-specific pages',()=>{
 const prompts=readFileSync(new URL('../public/prompts/index.html',import.meta.url),'utf8');
 for(const file of ['terminos.html','privacidad.html','reembolsos.html']){
  assert.ok(prompts.includes('../'+file));
  const page=readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
  assert.ok(page.includes('Content Lab'));assert.ok(!page.includes('Cleaning Web App'));
 }
 assert.ok(!prompts.includes('https://thelaunchera.com/terms.html'));
});
