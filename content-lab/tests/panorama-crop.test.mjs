import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

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
const { clampRect } = await load('TouchGeometry');
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
  assert.equal(layers[0].rect.x, 0);
  assert.equal(layers[0].rect.y, .5);
  assert.equal(normalizePanoramaLayers(Array.from({length: 30}, (_, n) => ({...valid, id: String(n)}))).length, 24);
});
