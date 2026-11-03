import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {stackScale} from '../src/runtime/ambition-stack.js';

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
  assert.doesNotMatch(html,/<header|ambition-stack__intro/);
  assert.ok(html.includes('consumer AI company'));
  assert.ok(html.includes('From India, for the world'));
  const sequence=['Belief','Builder','Pace','Ownership','Ambition'];
  let previous=-1;
  for(const text of sequence){const position=html.indexOf(text);assert.ok(position>previous,text);previous=position;}
  for(const text of ['10×','ten years','100 founders','100bn','five years'])assert.ok(html.includes(text));
  assert.doesNotMatch(html,/by 2028|ambition__destination/);
});
