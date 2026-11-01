import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = file => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('A late Save response cannot overwrite newer edits or a newly opened draft', () => {
  const app = source('App.tsx');
  assert.ok(app.includes('editorSessionRef.current++'));
  assert.ok(app.includes('const snapshot=JSON.stringify(source)'));
  assert.ok(app.includes('editorSessionRef.current!==session'));
  assert.ok(app.includes('current.id!==source.id'));
  assert.ok(app.includes('return {...current,id:data.id,updatedAt:data.updatedAt}'));
  assert.ok(app.includes('saveInFlightRef.current=true'));
});

test('Unchanged slide previews are reused without changing the PNG export pipeline', () => {
  const factory = source('CarouselFactory.tsx');
  assert.ok(factory.includes('previewCache=useRef<Map<string,string>>(new Map())'));
  assert.ok(factory.includes('const independent=!style.seamlessEnabled'));
  assert.ok(factory.includes('previewCache.current.get(key)'));
  assert.ok(factory.includes('while(previewCache.current.size>20)'));
  assert.ok(factory.includes('const all=await renderAllSlides()'));
  assert.ok(factory.includes("thumb.toDataURL('image/png')"));
});

test('Long copy stays editable and can be divided with a warning before download', () => {
  const factory = source('CarouselFactory.tsx');
  const css = source('CarouselFactory.css');
  assert.ok(factory.includes('const splitDescription=()=>'));
  assert.ok(factory.includes('content.slice(position).trim()'));
  assert.ok(factory.includes('...slides.slice(i+1)'));
  assert.ok(factory.includes('Dividir sin perder frases'));
  assert.ok(factory.includes('const longText=slides.some('));
  assert.ok(factory.includes("Algunos textos podrían cortarse en el PNG."));
  assert.ok(factory.includes('window.confirm('));
  assert.ok(css.includes('.factory-text-overflow'));
});
