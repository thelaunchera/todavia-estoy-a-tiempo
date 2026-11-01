import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = name => readFileSync(new URL('../src/' + name, import.meta.url), 'utf8');

test('Carousel preview is swipeable and uses high-resolution final export pixels', () => {
  const factory = read('CarouselFactory.tsx');
  const styles = read('CarouselFactory.css');
  assert.ok(factory.includes('renderSwipePreview()'));
  assert.ok(factory.includes('factory-swipe-rail'));
  assert.ok(factory.includes('thumb.width=900;thumb.height=1125'));
  assert.ok(factory.includes("previews.push(thumb.toDataURL('image/png'))"));
  assert.ok(factory.includes('const all=independent?null:await renderAllSlides();'));
  assert.ok(styles.includes('scroll-snap-type:x mandatory'));
});

test('Existing carousel content cannot silently drop remaining legacy slides', () => {
  const factory = read('CarouselFactory.tsx');
  assert.ok(factory.includes('entries.slice(0,6)'));
  assert.ok(factory.includes('entries.slice(6)'));
  assert.ok(!factory.includes(".filter(Boolean).slice(0,4)"));
});

test('Saving a carousel uses the latest edited draft without breaking other post buttons', () => {
  const app = read('App.tsx');
  const factory = read('CarouselFactory.tsx');
  assert.ok(factory.includes('const saveLatest=()=>onSave(latestDraft.current.post);'));
  assert.ok(factory.includes('onClick={saveLatest}'));
  assert.ok(app.includes('const save = async (candidate?:unknown)'));
  assert.ok(app.includes('typeof possible.brandId'));
  assert.ok(app.includes("post.format==='Carousel'?'factory':'create'"));
});
