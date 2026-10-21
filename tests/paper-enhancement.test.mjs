import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { paperEnhancement, prepareLetterFonts } from '../src/runtime/paper-enhancement.js';

test('slow preparation aborts and leaves the readable sheet in place', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  let signal,resolveScene,fallback=0,ready=0,disposed=0;
  const scene={dispose(){disposed++;}};
  const enhancement=paperEnhancement({load:s=>{signal=s;return new Promise(resolve=>{resolveScene=resolve;});},ready(){ready++;},fallback(){fallback++;}});
  const pending=enhancement.start();
  t.mock.timers.tick(3500);
  assert.equal(signal.aborted,true);
  assert.equal(fallback,1);
  resolveScene(scene);await pending;
  assert.equal(ready,0);assert.equal(disposed,1);
});

test('arrival at the letter cancels preparation and prevents a late visual swap', async () => {
  let resolveScene,ready=0,disposed=0;
  const enhancement=paperEnhancement({load:()=>new Promise(resolve=>{resolveScene=resolve;}),ready(){ready++;},fallback(){}});
  const pending=enhancement.start();
  enhancement.showText();
  resolveScene({dispose(){disposed++;}});await pending;
  assert.equal(ready,0);assert.equal(disposed,1);
});

test('a prepared animation is retained when it completes before the reader arrives', async () => {
  let calls=0,ready=0,fallback=0;
  const enhancement=paperEnhancement({load:async()=>{calls++;return {};},ready(){ready++;},fallback(){fallback++;}});
  await enhancement.start();await enhancement.start();
  assert.equal(calls,1);assert.equal(ready,1);assert.equal(fallback,0);
});

test('a static device never starts the heavy animation preparation', async () => {
  let loads=0;
  const enhancement=paperEnhancement({load:async()=>{loads++;},ready(){},fallback(){}});
  enhancement.showText();await enhancement.start();assert.equal(loads,0);
});

test('failed fonts or WebGL preparation never hide the readable letter', async () => {
  let fallback=0;
  const enhancement=paperEnhancement({load:async()=>{throw new Error('WebGL unavailable');},ready(){assert.fail('Unexpected animation');},fallback(){fallback++;}});
  await enhancement.start();assert.equal(fallback,1);
  await prepareLetterFonts(undefined,new AbortController().signal);
  await prepareLetterFonts({load:async()=>{throw new Error('Font unavailable');}},new AbortController().signal);
});

test('font preparation has a deadline and does not wait for all document fonts', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const pending=prepareLetterFonts({load:()=>new Promise(()=>{}),get ready(){assert.fail('Must not wait for unrelated fonts');}},new AbortController().signal);
  t.mock.timers.tick(800);await pending;
});

test('the non-animated letter has compact, visible HTML styles before enhancement', async () => {
  const css=await readFile(new URL('../src/styles/review-letter-footer.css',import.meta.url),'utf8');
  assert.match(css,/\.paper-letter:not\(\.is-paper-ready\)\{height:auto\}/);
  assert.match(css,/\.paper-letter:not\(\.is-paper-ready\) \.paper-letter__canvas\{display:none\}/);
  assert.match(css,/\.paper-letter:not\(\.is-paper-ready\) \.paper-letter__sheet\{[^}]*opacity:1/);
});
