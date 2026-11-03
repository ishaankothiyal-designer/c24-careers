import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { initializeProblemFilters } from '../src/runtime/problem-filters.js';
const read = name => readFile(new URL(`../src/${name}`, import.meta.url),'utf8');

test('landing story moves from ambition through builders and problems to support, without duplicate sections',async()=>{
  const sections=JSON.parse(await read('sections.json')).map(s=>s.file);
  const story=['career-02-ambition.html','career-01-invitation.html','career-02-problems.html','career-04-support.html','career-06-letter.html','career-09-hiring.html','career-07-exchange.html'];
  const positions=story.map(s=>sections.indexOf(s));
  assert.ok(positions.every((p,i)=>p>=0&&(!i||p>positions[i-1])));
  for(const removed of ['career-07-ai-progress.html','career-03-beliefs.html','career-08-roles.html'])assert.ok(!sections.includes(removed));
  const support=await read('sections/career-04-support.html');
  assert.equal((support.match(/class="policy-card craft-work__card"/g)||[]).length,7);
  for(const name of ['Autonaut Future Fund','CareHer','Health','Wellbeing','Compassionate Support','Mission Elevate','Founders’ Awards'])assert.ok(support.includes(`<h3>${name}</h3>`));
});

test('homepage role carousel loads live roles without shipping invented briefs', async () => {
  const html = await read('sections/career-02-problems.html');
  assert.match(html, /data-live-jobs="carousel"/);
  assert.match(html, /data-job-results/);
  assert.match(html, /data-job-retry/);
  assert.doesNotMatch(html, /preview-problem|illustrative|<article/);
});

test('native carousels leave vertical wheel input with the page scroll controller',async()=>{
  for (const [file,id] of [['career-02-problems.html','problem-track'],['career-04-support.html','support-track']]) {
    const html=await read(`sections/${file}`);
    const track=html.match(new RegExp(`<div\\b[^>]*id="${id}"[^>]*>`))?.[0];
    assert.ok(track, id);
    assert.match(track,/\bdata-lenis-prevent-horizontal\b/);
    assert.doesNotMatch(track,/\bdata-lenis-prevent(?:-wheel|-vertical)?(?=[\s>])/);
  }
});

test('craft selection filters visible problems, updates its announcement and resets to all',t=>{
  const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  t.after(()=>{for(const [key,previous] of [['document',previousDocument],['window',previousWindow]])previous?Object.defineProperty(globalThis,key,previous):delete globalThis[key];});
  const buttons=['All','AI','Design'].map(craft=>({dataset:{problemFilter:craft},setAttribute(key,value){this[key]=value;},addEventListener(name,handler){this[name]=handler;}}));
  const cards=['AI','Design'].map(craft=>({dataset:{problemCraft:craft},hidden:false}));
  const status={};const root={dataset:{},querySelectorAll:selector=>selector==='[data-problem-filter]'?buttons:cards,querySelector:selector=>selector==='[role="status"]'?status:null};
  globalThis.document={querySelector:()=>root};globalThis.window={dispatchEvent(){}};
  initializeProblemFilters();buttons[2].click();
  assert.deepEqual(cards.map(c=>c.hidden),[true,false]);assert.equal(status.textContent,'1 problem · Design');assert.equal(buttons[2]['aria-pressed'],'true');
  buttons[0].click();assert.ok(cards.every(c=>!c.hidden));assert.equal(status.textContent,'2 problems · All crafts');assert.equal(buttons[2]['aria-pressed'],'false');
});

test('problem carousel steps through visible cards, handles boundaries and resets after filtering',t=>{
  const globals=['document','window','matchMedia','ResizeObserver'];
  const previous=globals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>previous.forEach(([key,value])=>value?Object.defineProperty(globalThis,key,value):delete globalThis[key]));
  const control=()=>({addEventListener(name,handler){this[name]=handler;},setAttribute(name,value){this[name]=value;}});
  const back=control(),next=control();
  const buttons=['All','Design'].map(craft=>({...control(),dataset:{problemFilter:craft}}));
  const cards=['AI','Design','Product','Engineering','Data','Operations'].map((craft,i)=>({dataset:{problemCraft:craft},hidden:false,get offsetLeft(){return cards.filter(c=>!c.hidden).indexOf(this)*320;}}));
  const track={...control(),scrollLeft:0,clientWidth:760,get scrollWidth(){return Math.max(760,cards.filter(c=>!c.hidden).length*320);},scrollTo({left,behavior}){this.behavior=behavior;this.scrollLeft=Math.max(0,Math.min(left,this.scrollWidth-this.clientWidth));this.scroll?.();}};
  const status={};
  const nodes={'[role="status"]':status,'#problem-track':track,'.problem-carousel__previous':back,'.problem-carousel__next':next};
  const root={dataset:{},querySelector:selector=>nodes[selector],querySelectorAll:selector=>selector==='[data-problem-filter]'?buttons:cards};
  globalThis.document={querySelector:()=>root};globalThis.window={dispatchEvent(){}};
  globalThis.matchMedia=()=>({matches:true});globalThis.ResizeObserver=class{observe(){}};
  initializeProblemFilters();
  assert.equal(back.disabled,true);assert.equal(next.disabled,false);
  assert.equal(track['data-carousel-before'],'false');assert.equal(track['data-carousel-after'],'true');
  next.click();assert.equal(track.scrollLeft,320);assert.equal(track.behavior,'instant');
  track.keydown({key:'End',target:track,preventDefault(){}});assert.equal(next.disabled,true);assert.equal(track['data-carousel-after'],'false');
  track.keydown({key:'ArrowLeft',target:track,preventDefault(){}});assert.equal(track.scrollLeft,960);
  buttons[1].click();assert.equal(track.scrollLeft,0);assert.equal(back.disabled,true);assert.equal(next.disabled,true);
  assert.equal(track['data-carousel-before'],'false');assert.equal(track['data-carousel-after'],'false');
  buttons[0].click();assert.equal(next.disabled,false);
});


test('landing carousel controls follow their tracks in document and keyboard order',async()=>{
  for(const [file,track] of [['career-01-invitation.html','builder-viewport'],['career-02-problems.html','problem-track'],['career-04-support.html','support-track']]){
    const html=await read(`sections/${file}`);
    assert.ok(html.indexOf('landing-carousel__toolbar')>html.indexOf(`id="${track}"`),file);
    assert.match(html,new RegExp(`aria-controls="${track}"`));
  }
});
