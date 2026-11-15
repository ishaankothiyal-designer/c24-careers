import assert from 'node:assert/strict';
import test from 'node:test';
import {roleSummary, roleProblem} from '../src/role-problems.js';

const liveRoles=[
  {id:'a6a425523b4d48',title:'Builder - Evaluation Engineer',department:'Home Inspection'},
  {id:'a6a477f915ac86',title:'Builder - Key Accounts',department:'Retail'},
  {id:'a6a47c209bbcf9',title:'Builder - Retail Associate',department:'Retail'},
  {id:'a6a4bc7c73c3f6',title:'Builder - Procurement Associate',department:'Sales'},
  {id:'a6a4cf2c585259',title:'Builder - Listing',department:'Listing'},
  {id:'a6a4d1873e3f74',title:'Builder - Closure',department:'Closure'},
  {id:'a6ad6faa9243f8',title:'Builder - Procurement',department:'Procurement'},
];

test('all seven reviewed openings have compact work summaries without card facts or invented deadlines',()=>{
  const summaries=liveRoles.map(roleSummary);
  assert.equal(new Set(summaries).size,liveRoles.length);
  for(const summary of summaries){
    assert.ok(summary.length>40&&summary.length<=200);
    assert.ok(summary.split(/\s+/).length<=28);
    assert.doesNotMatch(summary,/90 days|first month|years? of experience|Permanent|locations|₹|\$|<[^>]+>/i);
  }
});

test('dealer-auction procurement and technical procurement retain their different responsibilities',()=>{
  const associate=roleSummary(liveRoles[3]),technical=roleSummary(liveRoles[6]);
  assert.match(associate,/dealers.*auctions.*bids.*repeat transactions/i);
  assert.doesNotMatch(associate,/service records|inspection reports/i);
  assert.match(technical,/inspection reports.*service records.*risks.*procurement decisions/i);
  assert.doesNotMatch(technical,/auctions|dealer transactions/i);
  assert.equal(roleSummary({...liveRoles[3],department:'Procurement'}),associate,'a department label cannot replace the official-role scope');
});

test('roles sharing Retail remain distinct and reviewed title formatting is tolerant',()=>{
  assert.match(roleSummary(liveRoles[1]),/dealer relationships.*field.*partner leads/i);
  assert.match(roleSummary(liveRoles[2]),/prospective customers.*follow up.*sales/i);
  assert.equal(roleSummary({title:'  BUILDER  –  KEY ACCOUNTS  '}),roleSummary(liveRoles[1]));
  assert.equal(roleSummary({title:'Builder-Procurement Associate'}),roleSummary(liveRoles[3]));
});

test('unreviewed titles get a factual next step rather than invented department responsibilities',()=>{
  const fallback=roleSummary({title:'New Procurement Lead',department:'Procurement'});
  assert.match(fallback,/full role description.*responsibilities and requirements/);
  assert.equal(roleSummary({id:liveRoles[3].id,title:'New Procurement Lead'}),fallback,'an old ID alone does not establish an unreviewed title’s scope');
  assert.equal(roleSummary({title:'<script>bad</script>'}),fallback);
  assert.equal(roleSummary(null),fallback);
  assert.equal(roleSummary({}),fallback);
});

test('problem headlines retain existing intent while the auction role no longer inherits a consumer-sales fallback',()=>{
  assert.equal(roleProblem(liveRoles[0]),'Help people trust the cars they buy');
  assert.equal(roleProblem(liveRoles[1]),'Build lasting relationships with key accounts');
  assert.equal(roleProblem(liveRoles[3]),'Help dealers buy through our auctions');
  assert.equal(roleProblem(liveRoles[4]),'Make the right cars easier to discover');
  assert.equal(roleProblem(liveRoles[5]),'Turn customer decisions into completed purchases');
});
