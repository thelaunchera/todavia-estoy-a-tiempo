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


// El Centro tiene sus propias reglas para software, clases, servicios y suscripciones.
const center=read('centro/index.html');
const centerScript=read('centro/centro.js');
const centerPages=['terminos.html','privacidad.html','reembolsos.html','cancelaciones.html','cookies.html','contacto.html'];
for(const p of centerPages){
 const doc=read('centro/'+p);
 assert.ok(center.includes('href="./'+p+'"'),'El Centro enlaza la política comercial '+p);
 assert.ok(doc.includes('mailto:hello@thelaunchera.com'),'El documento tiene contacto verificado '+p);
 assert.ok(doc.includes('Última actualización: 31 de octubre de 2026'),'Fecha real de la versión '+p);
 assert.ok(doc.includes('href="./contacto.html"'),'Navegación a soporte del negocio '+p);
 assert.ok(!doc.includes('sin reembolsos bajo ninguna circunstancia'),'No renunciar a derechos '+p);
}
assert.ok(center.includes('class="product-legal-disclosure"'),'La ficha presenta condiciones antes de salir al checkout');
assert.ok(center.includes('href="./cancelaciones.html"'),'Cancelar suscripciones es fácil de encontrar');
assert.ok(center.includes('href="./privacidad.html"'),'Privacidad comercial visible');
assert.ok(center.includes('hello@thelaunchera.com'),'Contacto comercial real');
assert.ok(center.includes('data-privacy-settings'),'Controles de privacidad accesibles');
assert.ok(centerScript.includes('service-checkout/?offer='),'Los checkouts existentes conservan sus rutas');
assert.ok(centerScript.includes("releases={'web-class':false,'content-lab':false}"),'Clase y Lab siguen cerrados por defecto');
assert.ok(read('terminos.html').includes('/centro/terminos.html'),'Términos del podcast enlazan a contrato comercial');
assert.ok(read('privacidad.html').includes('/centro/privacidad.html'),'El podcast enlaza a la privacidad de productos');
assert.ok(read('reembolsos.html').includes('/centro/reembolsos.html'),'Reembolsos generales remiten al Centro');
assert.ok(read('tus-datos.html').includes('/centro/privacidad.html'),'Derechos de datos consistentes');
assert.ok(read('centro/legales.css').includes('prefers-reduced-motion'),'Políticas accesibles en móvil');
console.log('QA OK: legales y contacto comercial del Centro presentes; compras intactas.');


// La documentación visible al público explica los derechos sin exponer la
// infraestructura privada, herramientas internas, tablas ni procesos operativos.
const publicLegalDocuments=[
 'centro/terminos.html',
 'centro/privacidad.html',
 'centro/reembolsos.html',
 'centro/cancelaciones.html',
 'centro/cookies.html',
 'centro/contacto.html',
 'privacidad.html',
 'cookies.html'
];
const internalDetailPattern=/\b(?:supabase|github\s+pages|make|resend|google\s+drive|service[_-]role|podcast_hub_|studio[_-]key|webhook|cloudflare)\b/i;
for(const page of publicLegalDocuments){
 const document=read(page);
 assert.ok(!internalDetailPattern.test(document),'No mostrar proveedores o detalles internos en '+page);
 assert.ok(!document.includes('Como actividad gestionada desde Florida'),'No publicar ubicaciones de operación sin autorización');
}
const businessPrivacy=read('centro/privacidad.html');
for(const customerRight of ['procesamiento de pagos','alojamiento','entrega de archivos','rectificación','eliminación']){
 assert.ok(businessPrivacy.includes(customerRight),'Transparencia de privacidad para '+customerRight);
}
assert.ok(read('centro/terminos.html').includes('derechos irrenunciables'),'Respetar derechos aplicables del cliente');
assert.ok(read('centro/contacto.html').includes('mailto:hello@thelaunchera.com'),'Conservar contacto comercial oficial');
console.log('QA OK: política pública de mínimos datos sin detalles internos.');
