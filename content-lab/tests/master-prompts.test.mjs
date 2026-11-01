import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
test('Eight prompt recipes stay private until the email link opens them',()=>{
 const page=readFileSync(new URL('../public/prompts/index.html',import.meta.url),'utf8');
 assert.ok(page.includes('id="crear" class="grid" hidden'),'Full editor is locked');
 assert.ok(page.includes("sendAction('library',{access_token:token})"),'Authorized private recipe loading');
 assert.ok(page.includes("sendAction('confirm',{confirm_token:magicToken})"),'Email magic link confirmation in landing');
 assert.ok(page.includes('data.layouts.length!==8'),'All eight recipes required after unlock');
 assert.ok(page.includes("sessionStorage.setItem('matcha_private_access_v1'"),'Private session saved after unlock');
 assert.doesNotMatch(page,/Treat the uploaded photo as the visual master|2160×2700 pixels|Place hero product on RIGHT/,'No private recipe text in public HTML');
});
