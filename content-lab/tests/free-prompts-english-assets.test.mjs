import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const SITE_ORIGIN = 'https://podcast.thelaunchera.com';

test('English free prompts resolve all eight original photos under the public Matcha folder', () => {
  const html = readFileSync(new URL('../public/prompts/en/index.html', import.meta.url), 'utf8');
  const baseMatch = html.match(/<base\s+href="([^"]+)"/);
  const documentBase = new URL(baseMatch?.[1] || '/content-lab/prompts/en/', SITE_ORIGIN);
  const imageSources = [...html.matchAll(/\bsrc="([^"?]*matcha-\d+\.jpg)(?:\?[^" ]*)?"/g)].map((m) => m[1]);

  assert.ok(imageSources.length >= 12, 'Hero, thumbnail carousel and process images must all be present');
  for (const src of imageSources) {
    const resolved = new URL(src, documentBase);
    assert.match(resolved.pathname, /^\/content-lab\/prompts\/matcha-\d{2}\.jpg$/, 'Photo must resolve to the public Matcha folder: ' + src);
    const filename = resolved.pathname.split('/').pop();
    assert.ok(existsSync(new URL('../public/prompts/' + filename, import.meta.url)), 'Missing photo ' + src);
  }

  for (let i = 1; i <= 8; i++) {
    assert.ok(existsSync(new URL('../public/prompts/matcha-' + String(i).padStart(2, '0') + '.jpg', import.meta.url)));
  }
  assert.ok(html.includes("photo.src='/content-lab/prompts/matcha-'"), 'Unlocked prompt cards reuse the same original photos');
});
