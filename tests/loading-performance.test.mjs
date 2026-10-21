import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deferredImage } from '../src/runtime/deferred-image.js';
import { performanceProfile, staticPaperDevice } from '../src/runtime/performance-profile.js';
import { initializePageTransition } from '../src/runtime/page-transition.js';

function transitionFixture(t) {
  const originals = ['document','window','MutationObserver'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis,key)]);
  const overlay = { dataset: {}, style: {} };
  let changed;
  const listeners = {};
  globalThis.document = { querySelector: () => overlay };
  globalThis.window = { addEventListener: (name,callback) => { listeners[name] = callback; } };
  globalThis.MutationObserver = class { constructor(callback) { changed = callback; } observe() {} };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => originals.forEach(([key,descriptor]) => descriptor ? Object.defineProperty(globalThis,key,descriptor) : delete globalThis[key]));
  return { overlay, changed: () => changed(), listeners };
}

test('failed animation startup cannot keep the overlay visible beyond its deadline', t => {
  const f = transitionFixture(t);
  initializePageTransition();
  assert.equal(f.overlay.dataset.transitionReady,'true');
  t.mock.timers.tick(1700);
  f.changed(); // A runtime style update must not indefinitely reset the watchdog.
  t.mock.timers.tick(100);
  assert.equal(f.overlay.style.display,'none');
  assert.equal(f.overlay.dataset.transitionDisabled,'true');
});

test('successful animation can finish normally and subsequent navigation gets its own deadline', t => {
  const f = transitionFixture(t);
  initializePageTransition();
  f.overlay.style.display = 'none'; f.changed();
  t.mock.timers.tick(2000);
  assert.equal(f.overlay.dataset.transitionDisabled,undefined);
  f.overlay.style.display = 'grid'; f.changed();
  t.mock.timers.tick(1800);
  assert.equal(f.overlay.dataset.transitionDisabled,'true');
});

test('script errors and back-forward restoration dismiss the overlay immediately', t => {
  const f = transitionFixture(t);
  const dismiss = initializePageTransition();
  dismiss();
  assert.equal(f.overlay.style.display,'none');
  f.overlay.style.display = 'grid';
  f.listeners.pageshow({ persisted: true });
  assert.equal(f.overlay.style.display,'none');
});

test('the initial HTML hides an uninitialized or timed-out overlay without JavaScript', async () => {
  const html = await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/\.transition:not\(\[data-transition-ready\]\),\.transition\[data-transition-disabled\]\{display:none!important\}/);
});

test('portraits do not request or decode until needed, and repeated requests share one image', async () => {
  const images = [];
  class FakeImage { constructor() { images.push(this); } async decode() {} }
  let shown;
  const load = deferredImage('/portrait.webp',image => { shown = image; },FakeImage);
  assert.equal(images.length,0);
  const first = load();
  assert.equal(images.length,1);
  assert.equal(images[0].src,'/portrait.webp');
  assert.equal(load(),first);
  await images[0].onload();
  assert.equal(await first,true);
  assert.equal(shown,images[0]);
});

test('a broken or undecodable portrait preserves the original image', async () => {
  for (const failDecode of [false,true]) {
    let image,shown = false;
    class FakeImage { constructor() { image = this; } async decode() { throw new Error('Bad image'); } }
    const load = deferredImage('/broken.webp',() => { shown = true; },FakeImage);
    const result = load();
    if (failDecode) await image.onload(); else image.onerror();
    assert.equal(await result,false);
    assert.equal(shown,false);
  }
});

test('portrait fallback works when a browser does not expose image.decode', async () => {
  let image;
  class FakeImage { constructor() { image = this; } }
  const load = deferredImage('/portrait.webp',() => {},FakeImage);
  const result = load();
  await image.onload();
  assert.equal(await result,true);
});

test('performance limits tolerate missing Safari hints and constrain touch/low-memory/save-data devices', () => {
  const desktop = () => ({matches:false});
  const touch = () => ({matches:true});
  assert.equal(performanceProfile({},desktop).constrained,false);
  assert.equal(performanceProfile({},touch).frameInterval,1000/30);
  assert.equal(performanceProfile({},touch).pixelRatio,1.5);
  for (const nav of [{deviceMemory:4},{hardwareConcurrency:2},{connection:{saveData:true}},{connection:{effectiveType:'slow-2g'}}]) {
    assert.equal(performanceProfile(nav,desktop).constrained,true);
    assert.equal(performanceProfile(nav,desktop).pixelRatio,1);
  }
});

test('letter animation uses reduced rendering on four-thread desktops rather than disabling it', () => {
  const nav = {hardwareConcurrency:4,deviceMemory:4};
  assert.equal(performanceProfile(nav,()=>({matches:false})).constrained,true);
  assert.equal(staticPaperDevice(nav),false);
  assert.equal(staticPaperDevice({}),false);
  for(const device of [{deviceMemory:2},{connection:{saveData:true}},{connection:{effectiveType:'2g'}}]) {
    assert.equal(staticPaperDevice(device),true);
  }
});
