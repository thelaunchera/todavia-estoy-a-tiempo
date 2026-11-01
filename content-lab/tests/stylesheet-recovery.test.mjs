import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),'utf8');

test('All Content Lab JS and CSS asset URLs are rooted at the public app path',()=>{
 const vite=read('vite.config.ts');
 assert.ok(vite.includes("base:'/content-lab/'"));
 assert.ok(!vite.includes("base:'./'"));
});
test('Even if the main stylesheet fails, the iPhone sidebar stays collapsed and mobile navigation remains usable',()=>{
 const html=read('index.html');
 assert.match(html,/<html lang="es" class="lab-style-fallback">/);
 assert.match(html,/html\.lab-style-fallback \.sidebar\{transform:translateX\(-105%\)/);
 assert.match(html,/html\.lab-style-fallback \.sidebar\.open\{transform:translateX\(0\)/);
 assert.match(html,/html\.lab-style-fallback \.app-shell>\.lab-mobile-dock/);
});
test('Missing stylesheet automatically recovers a stable build-matched copy without clearing saved work',()=>{
 const html=read('index.html');
 const css=read('src/index.css');
 const workflow=read('../.github/workflows/pages.yml');
 assert.ok(css.includes('--content-lab-css-ready: 1'));
 assert.ok(html.includes("getPropertyValue('--content-lab-css-ready')"));
 assert.ok(html.includes("link.href=prefix+'lab-recovery.css"));
 assert.ok(html.includes("link.addEventListener('error',fallback"));
 assert.ok(html.includes("addEventListener('pageshow'"));
 assert.ok(html.includes("addEventListener('visibilitychange'"));
 assert.ok(workflow.includes('cp "$css_asset" dist/lab-recovery.css'));
 assert.ok(workflow.includes('test -s _podcast_pages/content-lab/lab-recovery.css'));
 assert.ok(workflow.includes("grep -q '/content-lab/assets/' dist/index.html"));
 assert.doesNotMatch(html,/localStorage\.clear\(|sessionStorage\.clear\(|location\.reload\(/);
});
