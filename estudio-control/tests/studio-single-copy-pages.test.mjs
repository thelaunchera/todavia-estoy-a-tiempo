import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const studio = readFileSync(new URL('../src/SeamlessEditor.tsx', import.meta.url), 'utf8');
const verifier = readFileSync(new URL('../scripts/verify_shared_stickers.py', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../../.github/workflows/pages.yml', import.meta.url), 'utf8');

test('the Studio loads only the shared bundled PNGs, preserving old saved project URLs', () => {
  assert.match(studio, /new URL\('\/content-lab\/resources\/'.+window\.location\.origin\)/);
  assert.match(studio, /\(\?:estudio\|content-lab\)/);
  assert.match(studio, /url\.origin!==window\.location\.origin/);
  assert.match(studio, /assets-health\.json/);
});

test('verifier checks original PNG hashes and published bytes without copying them again', () => {
  assert.match(verifier, /hashlib\.sha256/);
  assert.match(verifier, /Image\.open/);
  assert.match(verifier, /PUBLISHED = Path\("_podcast_pages\/content-lab"\)/);
  assert.match(verifier, /dest\.stat\(\)\.st_size/);
  assert.doesNotMatch(verifier, /shutil\.copy2/);
  assert.match(verifier, /STUDIO \/ "assets-health\.json"/);
});

test('Pages workflow checks single-copy resources and still verifies the Studio allowlist', () => {
  assert.match(workflow, /python3 estudio-control\/scripts\/verify_shared_stickers\.py/);
  assert.match(workflow, /test -s _podcast_pages\/estudio\/assets-health\.json/);
  assert.match(workflow, /test ! -d _podcast_pages\/estudio\/resources/);
  assert.match(workflow, /test -s _podcast_pages\/content-lab\/resources\/editorial-2026-11\/manifest\.json/);
});
