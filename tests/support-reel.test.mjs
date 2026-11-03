import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {initializeCraftWork} from '../src/runtime/craft-work.js';

test('support reuses the builder reel and cycles through its original cards without a hard end',t=>{
  const keys=['document','matchMedia','ResizeObserver','IntersectionObserver','cancelAnimationFrame'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const cards=Array.from({length:7},(_,i)=>Object.assign(new EventTarget(),{style:{},dataset:{},offsetLeft:56+i*328,offsetWidth:300}));
  const track={style:{},scrollWidth:2408,querySelectorAll:()=>cards};
  const previous=new EventTarget(),next=new EventTarget();
  const viewport=Object.assign(new EventTarget(),{clientWidth:934,style:{},setAttribute(){}});
  const root={id:'support',dataset:{},hasAttribute:name=>name==='data-auto-reel',querySelector:selector=>({'[data-craft-work-viewport]':viewport,'[data-craft-work-track]':track,'.craft-work__previous':previous,'.craft-work__next':next}[selector]||null),querySelectorAll:()=>[]};
  const doc=Object.assign(new EventTarget(),{querySelectorAll:()=>[root],hidden:false});
  const globals={document:doc,matchMedia:()=>({matches:true,addEventListener(){}}),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},cancelAnimationFrame(){}};
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  initializeCraftWork();
  const initial=track.style.transform;
  assert.equal(previous.disabled,false);assert.equal(next.disabled,false);
  for(let i=0;i<7;i++)next.dispatchEvent(new Event('click'));
  assert.equal(track.style.transform,initial);
  assert.equal(next.disabled,false);
  previous.dispatchEvent(new Event('click'));
  assert.notEqual(track.style.transform,initial);
  assert.equal(previous.disabled,false);
});

test('support places its viewport outside the constrained heading container',async()=>{
  const html=await readFile(new URL('../src/sections/career-04-support.html',import.meta.url),'utf8');
  assert.match(html,/data-craft-work data-auto-reel/);
  assert.match(html,/<\/div><\/div><\/div><div class="craft-work__carousel"><div class="craft-work__viewport"/);
  assert.match(html,/data-craft-work-track/);
  assert.equal((html.match(/class="policy-card craft-work__card"/g)||[]).length,7);
  assert.doesNotMatch(html,/class="policy-grid"/);
});
