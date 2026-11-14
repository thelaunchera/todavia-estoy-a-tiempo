import test from 'node:test';
import assert from 'node:assert/strict';
import {PROSPECT_STAGES,stageTotals,activePipelineTotal,moveProspect,parseEstimate,prospectProjectLinks} from '../src/prospects-model.ts';

test('six stages have stable distinct IDs',()=>{
 assert.equal(PROSPECT_STAGES.length,6);
 assert.equal(new Set(PROSPECT_STAGES.map(x=>x.id)).size,6);
});
test('stage counts and totals update when a card is moved, without mutating the old state',()=>{
 const a={id:'a',stage:'found',estimated_value:25};
 const b={id:'b',stage:'found',estimated_value:15};
 const original=[a,b];
 const moved=moveProspect(original,'a','proposal');
 assert.equal(original[0].stage,'found');
 assert.equal(moved[0].stage,'proposal');
 assert.deepEqual(stageTotals(moved).filter(x=>x.count).map(({id,count,total})=>({id,count,total})),
   [{id:'found',count:1,total:15},{id:'proposal',count:1,total:25}]);
 assert.equal(activePipelineTotal(moved),40);
});
test('won and lost are excluded from the active pipeline estimate',()=>{
 const cards=[{stage:'won',estimated_value:100},{stage:'lost',estimated_value:250},{stage:'contacted',estimated_value:20}];
 assert.equal(activePipelineTotal(cards),20);
});
test('money parsing rejects invalid, negative and unbounded values',()=>{
 assert.equal(parseEstimate('-20'),0);
 assert.equal(parseEstimate('invalid'),0);
 assert.equal(parseEstimate('12.345'),12.35);
 assert.equal(parseEstimate('100000001'),100000000);
});


test('four named Knockout shortcuts become real, safe clickable destinations',()=>{
 const notes=[
  'ENLACES DIRECTOS · KNOCKOUT DELI · 13-NOV-2026',
  'Website: https://thelaunchera.com/demos/knockout-deli/',
  'Menú digital: https://thelaunchera.com/demos/knockout-deli/menu.html',
  'Admin Panel: https://thelaunchera.com/demos/knockout-deli/admin-panel/',
  'Content Planner / Content Hub (publicaciones y material de contenido): https://thelaunchera.com/demos/knockout-deli/content-hub/',
  'Nota: el material organizado está en Content Hub.',
  '',
  'HISTORIAL: los enlaces en este párrafo no deben duplicarse.'
 ].join('\n');
 assert.deepEqual(prospectProjectLinks(notes),[
  {label:'Website',href:'https://thelaunchera.com/demos/knockout-deli/'},
  {label:'Menú digital',href:'https://thelaunchera.com/demos/knockout-deli/menu.html'},
  {label:'Admin Panel',href:'https://thelaunchera.com/demos/knockout-deli/admin-panel/'},
  {label:'Content Planner',href:'https://thelaunchera.com/demos/knockout-deli/content-hub/'}
 ]);
});
test('never turn arbitrary research text, unsafe or malformed URLs into shortcut buttons',()=>{
 assert.deepEqual(prospectProjectLinks('Investigación: https://other-site.example/demo'),[]);
 assert.deepEqual(prospectProjectLinks('ENLACES DIRECTOS\nWebsite: javascript:alert(1)\nMenú digital: https://u:p@example.com/menu\nAdmin Panel: wrong\n'),[]);
 assert.deepEqual(prospectProjectLinks('ENLACES DIRECTOS\nWebsite: https://example.com\nWebsite: https://malicious.example/\n'),[{label:'Website',href:'https://example.com/'}]);
});
