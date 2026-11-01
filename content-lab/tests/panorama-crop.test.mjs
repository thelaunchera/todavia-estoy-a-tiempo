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
const { coverPlacement, normalizeCrop, initialPanoramaPhotoRect } = await load('PhotoCrop');
const { clampRect, clampPanoramaRect, photoDefault } = await load('TouchGeometry');
const { encodeCarouselDesign, readCarouselDesign } = await load('CarouselArtDirection');
const { normalizePanoramaLayers, reorderPanoramaLayers } = await load('PanoramaLayers');

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

test('normal mode moves photos to another slide without crossing its boundaries',()=>{
  const rect={x:.65,y:.2,w:.25,h:.5};
  const slides=[{key:'one',title:'One',assetId:'photo',layout:'cover'},
    {key:'two',title:'Two',assetId:'',layout:'statement'}];
  let saved;
  const move=editorAction('movePanoramaLayer',{
    pageLayers:[{id:'page-photo-one',kind:'photo',page:0,assetId:'photo',name:'Photo'}],
    style:{seamlessEnabled:false,panoramaLayers:[]},slides,clampPanoramaRect,photoDefault,
    notify:message=>{throw Error(message)},setAll:(pages,style)=>{saved={pages,style}},
    stripSource:editorAction('stripSource',{slides,photoDefault}),
    promoteSource:editorAction('promoteSource',{clampPanoramaRect}),
    constrainNormalLayer:editorAction('constrainNormalLayer',{clampPanoramaRect}),
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
    crypto,clampPanoramaRect,initialPanoramaPhotoRect,encodeCarouselDesign,onChange:next=>{saved=next},
    notify:message=>{throw Error(message)},clearDownloads:()=>{},setOverview:()=>{},recordHistory:()=>{},setFocusWallpaperId:()=>{},
  });
  add([{asset,point:{x:.1,y:.4}},{asset,point:{x:.8,y:.6}}]);
  const data=readCarouselDesign(saved.designData);
  assert.equal(data.style.panoramaLayers.length,2);
  assert.equal(data.slides[0].assetId,'existing');
  assert.notEqual(data.style.panoramaLayers[0].id,data.style.panoramaLayers[1].id);
});

test('portrait images enter the panorama with their full aspect ratio, leaving the head visible',()=>{
  for(const [ratio,count] of [[.56,4],[.75,4],[.8,6],[1.3,4],[1.78,4]]){
    const rect=initialPanoramaPhotoRect(ratio,count,{x:.5,y:.5});
    const screenRatio=(rect.w*count*1080)/(rect.h*1350);
    assert.ok(Math.abs(screenRatio-ratio)<1e-9,'aspect ratio '+ratio);
    assert.ok(rect.y>=0&&rect.y+rect.h<=1);
    assert.ok(rect.w<=.88/count+1e-9);
    assert.deepEqual(rect.crop,{x:.5,y:.12,zoom:1});
    const p=coverPlacement(1000*ratio,1000,rect.w*count*1080,rect.h*1350,rect.crop);
    assert.ok(Math.abs(p.y)<1e-6, 'full vertical photo never clips the head');
    assert.ok(Math.abs(p.x)<1e-6,'photo width fits exactly');
  }
});

test('forward/back layer controls persist across save and respect the text boundary',()=>{
 const base=[
   {id:'a',assetId:'a',name:'A',kind:'photo',rect:{x:0,y:0,w:.2,h:.2},placement:'behind-text'},
   {id:'b',assetId:'b',name:'B',kind:'sticker',rect:{x:.3,y:.1,w:.2,h:.2},placement:'front'},
   {id:'c',assetId:'c',name:'C',kind:'photo',rect:{x:.5,y:.2,w:.2,h:.2},placement:'front'},
 ];
 let layers=reorderPanoramaLayers(base,'b','backward');
 assert.deepEqual(layers.map(layer=>layer.id),['b','a','c']);
 assert.equal(layers[0].placement,'behind-text');
 layers=reorderPanoramaLayers(layers,'a','forward');
 assert.deepEqual(layers.map(layer=>layer.id),['b','c','a']);
 assert.equal(layers[2].placement,'front');
 layers=reorderPanoramaLayers(layers,'c','back');
 assert.equal(layers[0].id,'c');
 assert.equal(layers[0].placement,'behind-text');
 layers=reorderPanoramaLayers(layers,'c','front');
 assert.equal(layers.at(-1).id,'c');
 assert.equal(layers.at(-1).placement,'front');
 const serialized=encodeCarouselDesign([{title:'A'},{title:'B'}],{panoramaLayers:layers});
 const persisted=readCarouselDesign(serialized).style.panoramaLayers;
 assert.deepEqual(persisted.map(item=>item.id),layers.map(item=>item.id));
 assert.deepEqual(persisted.map(item=>item.placement),layers.map(item=>item.placement));
});


test('free typography, collage shapes and custom white-to-gradient backgrounds survive save',()=>{
 const slides=[{title:'',eyebrow:'',description:''},{title:'',eyebrow:'',description:''}];
 const items=[
   {id:'headline',kind:'text',assetId:'',name:'My headline',text:'Creative story',
     font:'playfair',fontSize:92,lineHeight:1.22,spacing:3,color:'#243746',
     shadow:true,outline:false,rect:{x:.08,y:.14,w:.45,h:.31},placement:'front'},
   {id:'paper-1',kind:'shape',assetId:'',name:'Scrapbook paper',
     shape:'paper',color:'#F2E3CD',rect:{x:.25,y:.34,w:.29,h:.43},placement:'behind-text'},
 ];
 const data=encodeCarouselDesign(slides,{freeCanvas:true,canvasColor:'#FFFFFF',
   canvasGradient:'#F2DCE7',panoramaLayers:items});
 const style=readCarouselDesign(data).style;
 assert.equal(style.freeCanvas,true);
 assert.equal(style.canvasColor,'#FFFFFF');
 assert.equal(style.canvasGradient,'#F2DCE7');
 assert.equal(style.panoramaLayers.length,2);
 assert.equal(style.panoramaLayers[0].kind,'text');
 assert.equal(style.panoramaLayers[0].font,'playfair');
 assert.equal(style.panoramaLayers[0].fontSize,92);
 assert.equal(style.panoramaLayers[0].spacing,3);
 assert.equal(style.panoramaLayers[0].shadow,true);
 assert.equal(style.panoramaLayers[1].kind,'shape');
 assert.equal(style.panoramaLayers[1].shape,'paper');
});
test('mobile editing has collapsible libraries, draggable text, collage, snapping and undo',()=>{
 const root=new URL('../src/',import.meta.url);
 const canvas=readFileSync(new URL('TouchLayerCanvas.tsx',root),'utf8');
 const factory=readFileSync(new URL('CarouselFactory.tsx',root),'utf8');
 const palette=readFileSync(new URL('FreeDecorControls.tsx',root),'utf8');
 const editor=readFileSync(new URL('PanoramaEditor.tsx',root),'utf8');
 assert.ok(palette.includes('setExpanded'));
 assert.ok(editor.includes('setLibraryOpen'));
 assert.ok(editor.includes("onAddLayer('text')"));
 assert.ok(editor.includes("onAddLayer('shape','tape')"));
 assert.ok(canvas.includes('touch-editor-free-text'));
 assert.ok(canvas.includes('applySmartSnap'));
 assert.ok(factory.includes('restoreHistory'));
 assert.ok(factory.includes('canvasGradient'));
 assert.ok(factory.includes('backgroundColor'));
});

test('continuous wallpaper keeps cross-slide width, flat edges and role after autosave',()=>{
  const count=4;
  const wallpaper={id:'wallpaper-ribbon',assetId:'blush-lace',name:'Fondo continuo',
    kind:'photo',role:'background',placement:'behind-text',
    rect:{x:0,y:0,w:2/count,h:1,cornerRadius:0,angle:0}};
  const stored=encodeCarouselDesign(Array.from({length:count},(_,i)=>({key:'s'+i,title:''})),
    {seamlessEnabled:true,perSlideBackgrounds:true,panoramaLayers:[wallpaper]});
  const decoded=readCarouselDesign(stored);
  assert.equal(decoded.style.panoramaLayers.length,1);
  assert.equal(decoded.style.panoramaLayers[0].role,'background');
  assert.deepEqual(decoded.style.panoramaLayers[0].rect,wallpaper.rect);
  assert.equal(decoded.style.panoramaLayers[0].rect.w*count,2);
});

test('normal confines free layers to a single slide while seamless saves the full cross-slide geometry',()=>{
 const pin=editorAction('constrainNormalLayer',{clampPanoramaRect});
 const layer={id:'photo',kind:'photo',assetId:'real',rect:{x:.38,y:.1,w:.35,h:.8}};
 const normal=pin(layer,4);
 const page=Math.floor((normal.rect.x+normal.rect.w/2)*4);
 assert.ok(normal.rect.x>=page/4-.000001);
 assert.ok(normal.rect.x+normal.rect.w<=(page+1)/4+.000001);
 assert.equal(normal.rect.h,.8);
 // The original image geometry is preserved for seamless mode.
 assert.equal(layer.rect.x,.38);
 assert.equal(layer.rect.w,.35);
});
