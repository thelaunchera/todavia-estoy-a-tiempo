import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
test('Eight prompt recipes are private until verified email unlocks them',()=>{
 const page=readFileSync(new URL('../public/prompts/index.html',import.meta.url),'utf8');
 assert.match(page,/id="crear" class="grid" hidden/,'Full editor must be gated');
 assert.match(page,/tle-matcha-freebie\?action=library/,'Recipes are fetched from authenticated Edge API');
 assert.match(page,/access_token:token/,'Server receives per-recipient access credential');
 assert.match(page,/result\.layouts\.length!==8/,'Eight original recipes required after unlock');
 assert.match(page,/sessionStorage\.setItem\('matcha_private_access_v1'/);
 assert.doesNotMatch(page,/Treat the uploaded photo as the visual master|2160×2700 pixels|Place hero product on RIGHT/,'No full private prompt text in public HTML');
});
