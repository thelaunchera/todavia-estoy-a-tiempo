import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';

const temp = mkdtempSync(join(tmpdir(), 'content-lab-panorama-'));
const compiled = new Map();
function compile(name) {
  if (compiled.has(name)) return compiled.get(name);
  const target = join(temp, name + '.mjs');
  compiled.set(name, target);
  const source = readFileSync(new URL('../src/' + name + '.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022}}).outputText.replace(/from ['"]\.\/([^'"]+)['"]/g,
      (_, dependency) => 'from ' + JSON.stringify(pathToFileURL(compile(dependency)).href));
  writeFileSync(target, output);
  return target;
}
const load = name => import(pathToFileURL(compile(name)).href);
process.on('exit', () => rmSync(temp, {recursive: true, force: true}));
const { coverPlacement, normalizeCrop } = await load('PhotoCrop');
const { clampRect, clampPanoramaRect, photoDefault } = await load('TouchGeometry');
const { encodeCarouselDesign, readCarouselDesign } = await load('CarouselArtDirection');
const { normalizePanoramaLayers } = await load('PanoramaLayers');

test('crop zoom always fills its frame, including portrait, landscape and full-bleed photos', () => {
  for (const [iw, ih, w, h] of [[2000, 1000, 600, 800], [900, 1600, 1000, 500], [1080, 1350, 1080, 1350]]) {
    for (const x of [0, .35, 1]) for (const y of [0, .7, 1]) for (const zoom of [1, 2.4, 4]) {
      const p = coverPlacement(iw, ih, w, h, {x, y, zoom});
      assert.ok(p.x <= 0 && p.y <= 0);
      assert.ok(p.x + p.width >= w - 1e-9 && p.y + p.height >= h - 1e-9);
      assert.ok(Math.abs(p.width / p.height - iw / ih) < 1e-9);
    }
  }
  assert.equal(clampRect({x: 0, y: 0, w: 1, h: 1}).w, 1);
});

test('a photo spanning two slides retains its placement and crop after saving and reopening', () => {
  const layer = {id: 'crossing-photo', assetId: 'real-photo', kind: 'photo', name: 'My photo',
    rect: {x: .4, y: .2, w: .3, h: .5, angle: -8, crop: {x: .15, y: .8, zoom: 2.1}}};
  const stored = encodeCarouselDesign([{title: 'First'}, {title: 'Second'}],
    {seamlessEnabled: true, panoramaLayers: [layer]});
  const reopened = readCarouselDesign(stored);
  assert.deepEqual(reopened.style.panoramaLayers[0], layer);
  assert.ok(layer.rect.x < .5 && layer.rect.x + layer.rect.w > .5);
  assert.equal(readCarouselDesign('[{"title":"Legacy"}]').style.seamlessEnabled, false);
});

test('invalid saved crop values and duplicate or excessive layers cannot corrupt the canvas', () => {
  assert.deepEqual(normalizeCrop({x: NaN, y: 99, zoom: -2}), {x: .5, y: 1, zoom: 1});
  const valid = {id: 'one', assetId: 'photo', rect: {x: -.2, y: 4, w: 100, h: .5,
    crop: {x: -20, y: Infinity, zoom: 8}}};
  const layers = normalizePanoramaLayers([null, {}, valid, valid]);
  assert.equal(layers.length, 1);
  assert.deepEqual(layers[0].rect.crop, {x: 0, y: .5, zoom: 4});
  assert.equal(layers[0].rect.x, -.2);
  assert.equal(layers[0].rect.y, .975);
  assert.equal(normalizePanoramaLayers(Array.from({length: 30}, (_, n) => ({...valid, id: String(n)}))).length, 24);
});

test('photo bleed survives saving with seamless background disabled',()=>{
  const layer={id:'bleed',assetId:'photo',kind:'photo',name:'Photo',
    rect:{x:-.15,y:-.2,w:.6,h:1.4,crop:{x:.2,y:.8,zoom:1.5},angle:4}};
  const stored=encodeCarouselDesign([{title:'One'},{title:'Two'}],{seamlessEnabled:false,panoramaLayers:[layer]});
  assert.deepEqual(readCarouselDesign(stored).style.panoramaLayers[0].rect,layer.rect);
});

// Execute the real editor actions without a browser or any backend calls.
function editorAction(name,context){
  const source=readFileSync(new URL('../src/CarouselFactory.tsx',import.meta.url),'utf8');
  const tree=ts.createSourceFile('CarouselFactory.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let declaration;
  const visit=node=>{if(ts.isVariableDeclaration(node)&&node.name.getText(tree)===name)declaration=node;
    ts.forEachChild(node,visit);};
  visit(tree);assert.ok(declaration,'Editor action must exist');
  const code=ts.transpileModule('const invoke='+declaration.initializer.getText(tree)+';',
    {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  return vm.runInNewContext('(()=>{'+code+';return invoke;})()',context);
}

test('dragging a page photo onto a different slide never snaps back when seamless is off',()=>{
  const rect={x:.65,y:.2,w:.25,h:.5};
  const slides=[{key:'one',title:'One',assetId:'photo',layout:'cover'},
    {key:'two',title:'Two',assetId:'',layout:'statement'}];
  let saved;
  const move=editorAction('movePanoramaLayer',{
    pageLayers:[{id:'page-photo-one',page:0,assetId:'photo',name:'Photo'}],
    style:{seamlessEnabled:false,panoramaLayers:[]},slides,clampPanoramaRect,photoDefault,
    notify:message=>{throw Error(message)},setAll:(pages,style)=>{saved={pages,style}},
  });
  move('photo','page-photo-one',rect);
  assert.equal(saved.pages[0].assetId,'');
  assert.equal(saved.style.seamlessEnabled,false);
  assert.equal(saved.style.panoramaLayers[0].rect.x,.65);
  assert.equal(saved.style.panoramaLayers[0].assetId,'photo');
});

test('adding several photos with seamless off keeps separate free layers and existing page photos',()=>{
  const asset={id:'added',brandId:'brand',name:'Added.jpg',category:'original'};
  const slides=[{title:'One',assetId:'existing'},{title:'Two',assetId:''}];
  let saved;
  const add=editorAction('addPanoramaAssets',{
    latestDraft:{current:{post:{brandId:'brand'},slides,style:{seamlessEnabled:false},ownedAssets:[asset]}},
    brand:{id:'brand'},assetCategory:()=> 'original',displayAssetName:()=> 'Added',
    crypto,clampPanoramaRect,encodeCarouselDesign,onChange:next=>{saved=next},
    notify:message=>{throw Error(message)},setDownloads:()=>{},setOverview:()=>{},
  });
  add([{asset,point:{x:.1,y:.4}},{asset,point:{x:.8,y:.6}}]);
  const data=readCarouselDesign(saved.designData);
  assert.equal(data.style.panoramaLayers.length,2);
  assert.equal(data.slides[0].assetId,'existing');
  assert.notEqual(data.style.panoramaLayers[0].id,data.style.panoramaLayers[1].id);
});
