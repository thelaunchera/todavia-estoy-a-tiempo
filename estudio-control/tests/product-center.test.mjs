import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=readFileSync(new URL('../src/ProductCenter.tsx',import.meta.url),'utf8');
const links=readFileSync(new URL('../src/LinkCenter.tsx',import.meta.url),'utf8');
const studio=readFileSync(new URL('../src/Studio.tsx',import.meta.url),'utf8');
const products=[...catalog.matchAll(/\{id:'([^']+)',category:'([^']+)',title:'([^']+)',description:[^\n]*?linkKey:'([^']+)',sourceKey:'([^']+)',state:'([^']+)'/g)].map(x=>({id:x[1],category:x[2],title:x[3],link:x[4],source:x[5],state:x[6]}));
const linkKeys=[...links.matchAll(/key:(?:'([^']+)'|"([^"]+)"),title:/g)].map(m=>m[1]||m[2]);
test('product center covers 4 categories with real project links',()=>{
 assert.ok(products.length>=15,`expected at least 15 catalog entries, got ${products.length}`);
 for(const c of ['thelaunchera','podcast','escuela','lab'])assert.ok(products.some(x=>x.category===c),c);
 for(const p of products){
  assert.ok(linkKeys.includes(p.link),'Missing link '+p.link+' for '+p.id);
  assert.ok(linkKeys.includes(p.source),'Missing GitHub source '+p.source+' for '+p.id);
 }
});
test('course stays blocked while Content Lab checkout is live with QA caveat',()=>{
 for(const p of products.filter(p=>['course','aula','club'].includes(p.id))){
   assert.equal(p.state,'produccion',p.id);
 }
 assert.equal(products.find(x=>x.id==='lab')?.state,'publicado');
 assert.match(catalog,/Falta verificar una compra real completa/);
 assert.match(links,/buy\.stripe\.com\/14AdR8dHp6Dnd8B1IM93y0Z/);
 assert.equal(products.find(x=>x.id==='brand-board')?.state,'interno');
 assert.equal(products.find(x=>x.id==='pod-diary')?.state,'revision');
 assert.equal(products.find(x=>x.id==='pod-workbook')?.state,'revision');
 assert.match(catalog,/Checkout y acceso de compradores cerrados/);
 assert.match(catalog,/Falta verificar compra y entrega completas/);
});
test('approved public demo sources are current and remain demo-only',()=>{
 const approved = new Set([
  'https://la-vie-in-pink-61dbk8.v2.appdeploy.ai/'
 ]);
 const appdeployEntries = links.split('\n').filter(line=>/url:'https:\/\/[^']*appdeploy\.ai\//.test(line));
 assert.ok(appdeployEntries.length >= 1, 'The one remaining approved AppDeploy concept must be discoverable');
 assert.match(links,/key:'school-golden-grid',title:'Golden Grid · Waffle Co.',url:'https:\/\/thelaunchera\.com\/demos\/golden-grid\//,'Golden Grid must use the canonical GitHub Pages demo');
 for (const entry of appdeployEntries) {
  const url = entry.match(/url:'([^']+)'/)?.[1];
  assert.ok(approved.has(url), 'Unapproved AppDeploy destination: '+url);
  assert.match(entry,/visibility:'demo'/, 'AppDeploy concepts must not be marked as real sales');
 }
 assert.match(links,/thelaunchera\.github\.io\/demo-booking-landing-\/brand-board-studio/);
 assert.match(catalog,/resolveStudioLinks\(entries\)/);
 assert.match(catalog,/!readOnly\|\|x\.shareable/);
});
test('Studio keeps podcast editable product records and route to product center',()=>{
 assert.match(studio,/label: 'Centro de productos'/);
 assert.match(studio,/<ProductCenter entries=\{items\.ideas\}/);
 assert.match(studio,/product-admin-records/);
 assert.match(studio,/section === 'productos'/);
});

test('Studio sales and links agree with the live Content Lab checkout, with separate delivery QA',()=>{
 assert.match(studio,/VENTA ACTIVA · \$10/);
 assert.match(studio,/Checkout LIVE de \$10 abierto/);
 assert.match(studio,/El flujo de acceso y bienvenida está activo en Make/);
 assert.match(studio,/falta comprobar una compra real completa/);
 assert.doesNotMatch(studio,/PAUSADO POR QA|Las ventas siguen pausadas por QA|la automatización de acceso sigue inactiva/i);
 assert.match(links,/Editor privado: checkout \$10 activo/);
 assert.doesNotMatch(links,/venta y acceso de compradores aún no abiertos/i);
 assert.match(studio,/Cuaderno digital con checkout publicado/);
 assert.doesNotMatch(studio,/entrega verificada mediante Make/i);
});
