import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { initializeProblemFilters } from '../src/runtime/problem-filters.js';
const read = name => readFile(new URL(`../src/${name}`, import.meta.url),'utf8');

test('landing story moves from ambition through builders and problems to support, without duplicate sections',async()=>{
  const sections=JSON.parse(await read('sections.json')).map(s=>s.file);
  const story=['career-02-ambition.html','career-01-invitation.html','career-02-problems.html','career-04-support.html','career-06-letter.html','career-07-exchange.html','career-09-hiring.html'];
  const positions=story.map(s=>sections.indexOf(s));
  assert.ok(positions.every((p,i)=>p>=0&&(!i||p>positions[i-1])));
  for(const removed of ['career-07-ai-progress.html','career-03-beliefs.html','career-08-roles.html'])assert.ok(!sections.includes(removed));
  const support=await read('sections/career-04-support.html');
  assert.equal((support.match(/class="policy-card"/g)||[]).length,7);
  for(const name of ['Autonaut Future Fund','CareHer','Health','Wellbeing','Compassionate Support','Mission Elevate','Founders’ Awards'])assert.ok(support.includes(`<h3>${name}</h3>`));
});

test('every problem exposes ownership, collaborators and an outcome, with external applications preserved',async()=>{
  const html=await read('sections/career-02-problems.html');
  const cards=[...html.matchAll(/<article\b[\s\S]*?<\/article>/g)];
  assert.equal(cards.length,6);
  for(const [card] of cards){
    assert.match(card,/You’d own/);assert.match(card,/first 90-day outcome/);assert.match(card,/You’d build with/);
    assert.match(card,/href="https:\/\/careers.cars24.com\/"/);
  }
});

test('craft selection filters visible problems, updates its announcement and resets to all',t=>{
  const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  t.after(()=>{for(const [key,previous] of [['document',previousDocument],['window',previousWindow]])previous?Object.defineProperty(globalThis,key,previous):delete globalThis[key];});
  const buttons=['All','AI','Design'].map(craft=>({dataset:{problemFilter:craft},setAttribute(key,value){this[key]=value;},addEventListener(name,handler){this[name]=handler;}}));
  const cards=['AI','Design'].map(craft=>({dataset:{problemCraft:craft},hidden:false}));
  const status={};const root={dataset:{},querySelectorAll:selector=>selector==='[data-problem-filter]'?buttons:cards,querySelector:()=>status};
  globalThis.document={querySelector:()=>root};globalThis.window={dispatchEvent(){}};
  initializeProblemFilters();buttons[2].click();
  assert.deepEqual(cards.map(c=>c.hidden),[true,false]);assert.equal(status.textContent,'1 problem · Design');assert.equal(buttons[2]['aria-pressed'],'true');
  buttons[0].click();assert.ok(cards.every(c=>!c.hidden));assert.equal(status.textContent,'2 problems · All crafts');assert.equal(buttons[2]['aria-pressed'],'false');
});
