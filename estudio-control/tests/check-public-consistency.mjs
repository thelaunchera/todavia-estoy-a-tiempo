// Keep marketing, checkout labels, terms and Studio seed consistent.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const terms=read('terminos.html'),seed=read('estudio-control/src/local-client.ts');
const config=read('site-config.js'),login=read('estudio-control/src/Studio.tsx');
assert.ok(config.includes('commerceEnabled: true'));
for (const [path,price,id] of [
  ['productos/no-voy-tarde.html','1.99','noVoyTarde'],
  ['productos/empezar-de-nuevo.html','3.99','empezarDeNuevo']
]) {
  const html=read(path);
  assert.ok(html.includes('$'+price+' USD'),path+' price');
  assert.ok(terms.includes('$'+price+' USD'),path+' terms');
  assert.ok(seed.includes("price: "+price+", status: 'publicado'"),path+' studio seed');
  assert.ok(html.includes('data-buy="'+id+'"'),path+' checkout');
  assert.ok(!html.includes('#sobre-mi'),path+' broken link');
  assert.ok(html.includes('#escuchar'),path+' navigation');
  assert.ok(html.includes('Powered by The Launch Era'),path+' credit');
  assert.ok(!html.includes('Secure checkout'),path+' language');
}
assert.ok(!login.includes('Un estudio que funciona desde GitHub.'),'Login leaks internal details');
const landing=read('index.html');
assert.ok(landing.includes('meta property="og:image" content="https://d2ol7oe51mr4n9.cloudfront.net/'),'Current social cover');
for(const p of ['baja.html','privacidad.html','cookies.html','terminos.html','reembolsos.html','tus-datos.html'])
  assert.ok(read(p).includes('Powered by The Launch Era'),p+' credit');
assert.ok(!read('cookies.html').includes('El modo de prueba conserva'),'Test-mode details');
assert.ok(read('sitemap.xml').includes('2026-10-27'),'Sitemap date');
console.log('QA OK: prices, links, branding, internal text and social previews.');
