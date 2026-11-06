import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/PanoramaEditor.css',import.meta.url),'utf8');
test('Mobile Lab tools stay directly beneath the artboard, never fixed to the viewport',()=>{
 const start=css.lastIndexOf('Phone and tablet: editing tools belong to the artboard');
 assert.ok(start>0,'mobile toolbar anchor must be defined');
 const active=css.slice(start);
 assert.match(active,/@media \(max-width:920px\)/);
 assert.match(active,/>\.panorama-body\{[\s\S]*?grid-row:2!important;[\s\S]*?position:relative!important;/);
 assert.match(active,/>\.panorama-primary-actions\{[\s\S]*?grid-row:3!important;[\s\S]*?position:relative!important;[\s\S]*?bottom:auto!important;/);
 assert.match(active,/\.layer-selected>\.panorama-primary-actions\{\s*display:flex!important;/);
 assert.match(active,/overflow-x:auto!important;/);
 assert.doesNotMatch(active,/position:fixed!important;/);
});
