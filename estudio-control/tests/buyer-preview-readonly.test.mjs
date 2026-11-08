import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
const buyer=readFileSync(new URL('../src/BuyerCommandPreview.tsx',import.meta.url),'utf8');
const ops=readFileSync(new URL('../src/OperationsCenter.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/buyer-command-preview.css',import.meta.url),'utf8');
test('Buyer preview has no business, device or language switching controls',()=>{
 assert.doesNotMatch(buyer,/<select\b/i);
 assert.doesNotMatch(buyer,/\b(?:switchIndustry|setIndustry|setLang|setDevice|setDataset)\b/);
 assert.doesNotMatch(buyer,/Reset samples|Restablecer ejemplos|setEditingPrice|toggleAvailability|editDiscount|savePrice|setRequestStatus|newRequest/);
 assert.match(buyer,/industry\?:BuyerPreviewIndustry/);
 assert.match(buyer,/read-only visual review|Read-only, owner-accessible visual review/i);
});
test('Owner controls are outside buyer preview and collapsed',()=>{
 const start=ops.indexOf('<details className="tle-ops-owner-preview-controls">');
 const preview=ops.indexOf('<BuyerCommandPreview');
 assert.ok(start>=0&&preview>start);
 assert.match(ops,/Herramientas de revisión · solo administración/);
 assert.doesNotMatch(ops,/<details className="tle-ops-owner-preview-controls" open/);
 assert.match(ops,/key=\{buyerReviewIndustry\+'\-'\+buyerReviewLanguage\}/);
});
test('Preview uses fixed brand and visible sample disclaimer, no production editing',()=>{
 assert.match(buyer,/demoData=useMemo\(initialData,\[\]\)/);
 assert.match(buyer,/t\.noMessages/);
 assert.match(buyer,/t\.handoff/);
 assert.match(buyer,/go\('inbox'\)/);
 assert.doesNotMatch(buyer,/https:\/\/thelaunchera\.com\/command-center\//);
 assert.match(css,/tle-buyer-readonly-note/);
});
