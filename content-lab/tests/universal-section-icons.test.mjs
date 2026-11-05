import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
test('Universal section icon sheet is intact, matches the approved artwork and is application-owned',()=>{
 const source=read('UniversalLabIcon.tsx');
 const match=source.split('data:image/webp;base64,')[1]?.split("'")[0];
 assert.ok(match,'Embedded icon sprite must exist');
 const data=Buffer.from(match,'base64');
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.equal(createHash('sha256').update(data).digest('hex'),'3313f40da3fad576e10af87d1ad8f61f3f677edae764f5f13cf9920d74790073');
 for(const name of ['home','post','carousel','calendar','posts','media','stickers','prompts','brand']){
   assert.ok(source.includes(name+':'),name+' must exist in fixed icon system');
 }
 assert.ok(!source.includes('onChange('),'User branding must not modify app-owned icons');
});
test('Fixed icons are connected to five mobile tabs, sidebar and resource library cards',()=>{
 const app=read('App.tsx'),dashboard=read('CreatorDashboard.tsx'),css=read('CreatorDashboard.css');
 assert.ok(app.includes('APP_ICON_MAP[item.id]'));
 assert.ok(app.includes('APP_ICON_MAP[id]'));
 assert.ok(app.includes('lab-mobile-dock'));
 for(const name of ['media','stickers','prompts','brand']){
   assert.ok(dashboard.includes('name="'+name+'"'),name+' resource card must use universal icon');
 }
 assert.ok(css.includes('.cld-resource-feature'));
});
