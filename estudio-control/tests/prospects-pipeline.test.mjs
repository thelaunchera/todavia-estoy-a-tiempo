import test from 'node:test';
import assert from 'node:assert/strict';
import {PROSPECT_STAGES,stageTotals,activePipelineTotal,moveProspect,parseEstimate} from '../src/prospects-model.ts';

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
