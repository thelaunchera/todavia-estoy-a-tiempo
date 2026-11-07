import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('Finished carousel offers a clear tablet-friendly save-and-create-again action',()=>{
  const factory=source('CarouselFactory.tsx');
  const css=source('CarouselFactory.css');
  assert.match(factory,/studioTab==='download'/);
  assert.match(factory,/Guardar y crear otro carrusel/);
  assert.match(factory,/Save and create another carousel/);
  assert.match(factory,/onClick=\{\(\)=>void createAnotherCarousel\(\)\}/);
  assert.match(factory,/disabled=\{creatingNewCarousel\|\|saving\|\|!!busy\}/);
  assert.match(css,/\.factory-new-carousel-button\{width:100%;min-height:50px\}/);
});

test('Starting another saves latest draft first and refuses to discard unsaved work',()=>{
  const app=source('App.tsx');
  const factory=source('CarouselFactory.tsx');
  const start=app.indexOf('const saveAndStartAnotherCarousel=async()');
  const end=app.indexOf('const saveAndReturnToCalendar=',start);
  assert.ok(start>=0&&end>start);
  const fn=app.slice(start,end);
  assert.match(fn,/saveInFlightRef\.current/);
  assert.match(fn,/const draft=editorLatestRef\.current/);
  assert.match(fn,/const saved=await save\(draft,false\)/);
  assert.match(fn,/if\(!saved\)/);
  assert.match(fn,/draftFingerprint\(editorLatestRef\.current\)!==fingerprint/);
  assert.ok(fn.indexOf('startFactory()')>fn.indexOf('await save(draft,false)'));
  assert.match(app,/key=\{'carousel-session-'\+editorSessionRef\.current\}/);
  assert.match(app,/onStartNewCarousel=\{saveAndStartAnotherCarousel\}/);
  assert.match(factory,/onStartNewCarousel: \(\) => Promise<boolean>/);
});

test('Export links stay available while new project is protected from old media',()=>{
  const app=source('App.tsx');
  const factory=source('CarouselFactory.tsx');
  assert.match(factory,/downloads\.map\(\(item,n\)=>\<a/);
  assert.match(factory,/download=\{item\.name\}/);
  assert.match(app,/setBackgroundPref\(\{version:0\}\)/);
  assert.match(app,/setStickerPref\(\{version:0\}\)/);
  assert.match(app,/setEditor\(inspectRecovery\(\{\.\.\.newPost\(brand\.id\),format:'Carousel'\}\)\)/);
});

test('Receiving the first saved post ID must not clear prepared downloads or previews',()=>{
  const factory=source('CarouselFactory.tsx');
  const app=source('App.tsx');
  assert.ok(app.includes("key={'carousel-session-'+editorSessionRef.current}"));
  assert.ok(app.includes("editorSessionRef.current++"));
  // A database-generated ID is metadata on the existing draft, not a new editing session.
  assert.ok(factory.includes('resetting on post.id would erase freshly prepared PNG download links'));
  assert.ok(!factory.includes('},[brand.id,post.id]);'));
  assert.ok(factory.includes('clearDownloads();setOverview([])'));
  assert.ok(factory.includes('},[brand.id]);'));
});
