import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {stackScale} from '../src/runtime/ambition-stack.js';

test('stack keeps an approaching card full size, gently recedes covered cards, and retains the final card',()=>{
  const current={top:112,height:600};
  assert.equal(stackScale(current,{top:900}),1);
  assert.equal(stackScale(current,{top:412}),.975);
  assert.equal(stackScale(current,{top:112}),.95);
  assert.equal(stackScale(current,{top:-300}),.95);
  assert.equal(stackScale(current,undefined),1);
  assert.equal(stackScale({top:0,height:0},{top:0}),1);
});

test('ambition tells the mission followed by the five convictions without duplicate outdated targets',async()=>{
  const html=await readFile(new URL('../src/sections/career-02-ambition.html',import.meta.url),'utf8');
  assert.equal((html.match(/<li\b/g)||[]).length,5);
  const sequence=['consumer AI company','Belief','Builder','Pace','Ownership','Ambition'];
  let previous=-1;
  for(const text of sequence){const position=html.indexOf(text);assert.ok(position>previous,text);previous=position;}
  for(const text of ['10×','ten years','100 founders','100bn','five years'])assert.ok(html.includes(text));
  assert.doesNotMatch(html,/by 2028|ambition__destination/);
});
