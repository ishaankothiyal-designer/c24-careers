import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {stackScale,initializeAmbitionStack} from '../src/runtime/ambition-stack.js';

test('each card in front remains larger than the cards behind it',()=>{
  const scales=Array.from({length:5},(_,i)=>stackScale(i,5));
  assert.equal(scales[0],.9);
  assert.equal(scales[4],1);
  scales.slice(1).forEach((scale,i)=>assert.ok(scale>scales[i]));
  assert.equal(stackScale(0,1),1);
});

test('cards carry the mission and all five convictions without a separate intro',async()=>{
  const html=await readFile(new URL('../src/sections/career-02-ambition.html',import.meta.url),'utf8');
  assert.equal((html.match(/<li\b/g)||[]).length,5);
  for(const [card] of html.matchAll(/<article\b[\s\S]*?<\/article>/g)){
    assert.equal((card.match(/<svg\b/g)||[]).length,1);
    assert.match(card,/class="ambition-stack__visual[^>]+aria-hidden="true"/);
  }
  assert.doesNotMatch(html,/<header|ambition-stack__intro/);
  assert.ok(html.includes('consumer AI company'));
  assert.ok(html.includes('From India, for the world'));
  const sequence=['Belief','Builder','Pace','Ownership','Ambition'];
  let previous=-1;
  for(const text of sequence){const position=html.indexOf(text);assert.ok(position>previous,text);previous=position;}
  for(const text of ['10×','ten years','100 founders','100bn','five years'])assert.ok(html.includes(text));
  assert.doesNotMatch(html,/by 2028|ambition__destination/);
});


test('illustration motion pauses outside the viewport or hidden tab and respects reduced motion',t=>{
  const keys=['document','navigator','matchMedia','IntersectionObserver'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const cards=Array.from({length:5},()=>({dataset:{},style:{removeProperty(){}}}));
  const root={dataset:{},querySelectorAll:()=>cards};
  let visibility,intersect,motionChange;
  const motion={matches:false,addEventListener(type,callback){motionChange=callback;}};
  const doc={hidden:false,querySelectorAll:()=>[root],addEventListener(type,callback){visibility=callback;}};
  const globals={document:doc,navigator:{hardwareConcurrency:8,deviceMemory:8},matchMedia:query=>query==='(prefers-reduced-motion: reduce)'?motion:{matches:false,addEventListener(){}},IntersectionObserver:class{constructor(callback){intersect=callback;}observe(){}}};
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  initializeAmbitionStack();
  assert.equal(root.dataset.artStatic,'false');
  intersect([{target:cards[0],isIntersecting:true},{target:cards[1],isIntersecting:false}]);
  assert.equal(cards[0].dataset.artVisible,'true');assert.equal(cards[1].dataset.artVisible,'false');
  doc.hidden=true;visibility();assert.equal(root.dataset.artPaused,'true');
  doc.hidden=false;visibility();assert.equal(root.dataset.artPaused,'false');
  motion.matches=true;motionChange();assert.equal(root.dataset.artStatic,'true');
  motion.matches=false;globals.navigator.hardwareConcurrency=2;
  root.dataset.stackInitialized='';initializeAmbitionStack();assert.equal(root.dataset.artStatic,'true');
});
