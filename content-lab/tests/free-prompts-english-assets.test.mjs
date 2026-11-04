import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('English free prompts load all eight original photos from their shared folder', () => {
  const html = readFileSync(new URL('../public/prompts/en/index.html', import.meta.url), 'utf8');
  for (const [, src] of html.matchAll(/\bsrc="([^"?]*matcha-\d+\.jpg)(?:\?[^" ]*)?"/g)) {
    assert.ok(existsSync(new URL(src, new URL('../public/prompts/en/index.html', import.meta.url))), 'Missing photo ' + src);
  }
  for (let i = 1; i <= 8; i++) {
    assert.ok(existsSync(new URL('../public/prompts/matcha-' + String(i).padStart(2, '0') + '.jpg', import.meta.url)));
  }
  assert.ok(html.includes("photo.src='../matcha-'"), 'Unlocked prompt cards reuse the same original photographs');
});
