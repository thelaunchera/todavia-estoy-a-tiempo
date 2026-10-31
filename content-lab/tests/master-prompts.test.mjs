import assert from 'node:assert/strict';import test from 'node:test';import {readFileSync} from 'node:fs';
test('8 original compositions are available as copyable single-image prompts',()=>{
 const x=readFileSync(new URL('../public/prompts/index.html',import.meta.url),'utf8');
 ['Asymmetric Editorial','Monumental Center','Type Behind Product','Side-Cropped Close-Up','Offset Negative Space','Diagonal Visual Flow','Vertical Editorial Stack','Magazine Column Split'].forEach(n=>assert.ok(x.includes(n)));
 assert.ok(x.includes('No fake UI'));
 assert.ok(x.includes('2160×2700'));
});
