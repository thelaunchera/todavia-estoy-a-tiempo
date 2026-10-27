/* QA guard for the public podcast landing. Run in Pages build.
 * Covers the episode-2 pink-layer regression and consent-banner sizing.
 * No network or personal data is read.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
const html = read('index.html');
const banner = read('privacy-controls.js');
const css = read('episodios-destacados.css');
const episodes = read('episodios-destacados.js');

assert.equal((html.match(/<img class="episode-curated-poster"/g) || []).length, 1, 'Solo una foto principal');
assert.ok(html.includes('loading="eager" decoding="async" fetchpriority="high"'), 'Portada prioritaria');
assert.ok(html.includes('<link rel="preload" as="image"'), 'Preload portada');
assert.ok(!html.includes('episode-curated-cover-logo'), 'Sin segunda portada de fondo');
assert.ok(!html.includes('episode-curated-cover-number'), 'Sin ilustración rosada antigua');
assert.ok(html.includes('background:#192e47!important'), 'Fondo azul estable desde primer paint');
assert.ok(css.includes('content:none!important') && css.includes('background:#192e47'), 'Capas rosadas eliminadas en CSS');
assert.ok(episodes.includes("art.getAttribute('src') !== latest.art"), 'Evitar volver a cargar la misma foto');
assert.ok(episodes.includes("art.addEventListener('error', showFallback"), 'Fallback si la foto falla');
assert.ok(banner.includes('Privacidad y cookies'), 'Texto profesional del banner');
assert.ok(banner.includes('Solo necesarias') && banner.includes('Aceptar estadísticas'), 'Consentimiento explícito');
assert.ok(banner.includes('width:min(390px'), 'Tarjeta compacta');
assert.ok(banner.includes('localStorage.setItem(key'), 'Recordar elección anterior');
assert.ok(banner.includes('Boolean(analytics) && !signal()'), 'Respetar preferencias del navegador');

for (const page of [
  'index.html', 'baja.html', 'cookies.html', 'privacidad.html',
  'productos/empezar-de-nuevo.html', 'productos/no-voy-tarde.html',
  'reembolsos.html', 'terminos.html', 'tus-datos.html'
]) {
  assert.ok(read(page).includes('privacy-controls.js?v=20261027-compact-v2'), page + ' debe cargar la plantilla de cookies actualizada');
}

console.log('QA OK: cookies compactas, consentimiento intacto y portada sin capa rosada en el landing.');
