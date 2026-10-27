// Public/store/studio consistency gate.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const terms = read('terminos.html');
const seed = read('estudio-control/src/local-client.ts');
const config = read('site-config.js');
const login = read('estudio-control/src/Studio.tsx');
const dollar = String.fromCharCode(36);
assert.ok(config.includes('commerceEnabled: true'), 'Commerce stays active');
for (const [path, price, key] of [
  ['productos/no-voy-tarde.html', '1.99', 'noVoyTarde'],
  ['productos/empezar-de-nuevo.html', '3.99', 'empezarDeNuevo']
]) {
  const html = read(path);
  assert.ok(html.includes(dollar + price), path + ' visible price');
  assert.ok(terms.includes(dollar + price + ' USD'), path + ' terms price');
  assert.ok(seed.includes("price: " + price + ", status: 'publicado'"), path + ' studio seed price');
  assert.ok(html.includes('data-buy="' + key + '"'), path + ' checkout binding');
  assert.ok(!html.includes('../index.html#sobre-mi'), path + ' no broken link');
  assert.ok(html.includes('../index.html#escuchar'), path + ' valid navigation');
  assert.ok(html.includes('Powered by The Launch Era'), path + ' credit');
  assert.ok(!html.includes('Secure checkout'), path + ' language');
}
assert.ok(!login.includes('Un estudio que funciona desde GitHub.'), 'No technical info in login');
assert.ok(read('index.html').includes('meta property="og:image" content="https://d2ol7oe51mr4n9.cloudfront.net/'), 'Latest cover preview');
for (const path of ['baja.html', 'privacidad.html', 'cookies.html', 'terminos.html', 'reembolsos.html', 'tus-datos.html']) {
  assert.ok(read(path).includes('Powered by The Launch Era'), path + ' branding credit');
}
assert.ok(!read('cookies.html').includes('El modo de prueba conserva'), 'No internal test instructions');
assert.ok(read('sitemap.xml').includes('2026-10-27'), 'Sitemap freshness');
console.log('QA OK: prices, links, credits, privacy and social previews.');
