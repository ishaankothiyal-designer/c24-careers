import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeClosingPixels } from '../src/runtime/closing-pixels.js';

function fixture(t, { compact = false, reduced = false, constrained = false } = {}) {
  const keys = ['document','navigator','matchMedia','Node','getComputedStyle','ResizeObserver','IntersectionObserver','devicePixelRatio','requestAnimationFrame','cancelAnimationFrame','addEventListener'];
  const original = keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  t.after(() => { for (const [key,value] of original) { if (value) Object.defineProperty(globalThis,key,value); else delete globalThis[key]; } });
  const media = new Map(), events = {}, frames = new Map(), drawn = [], classes = new Set();
  let intersect, nextFrame = 0, maskCopy;
  const ctx = { clearRect() {}, setTransform() {}, fillRect(...args) { drawn.push(args); } };
  const paint = { measureText(text) { maskCopy = text; return { width: 40 }; }, fillText() {}, getImageData() {
    const data = new Uint8ClampedArray(40 * 24 * 4); data[3] = 255; data[7] = 255; return { data };
  } };
  const canvas = { getContext: () => ctx }, stage = { clientWidth: 934 };
  const title = { childNodes: [{nodeType:3,textContent:'Your next chapter.'},{nodeType:1},{nodeType:3,textContent:'Ours, too.'}] };
  const root = { dataset: {}, style: { setProperty() {} }, classList: { toggle(name,on) { on ? classes.add(name) : classes.delete(name); }, remove(name) { classes.delete(name); } },
    querySelector: query => ({ '[data-closing-pixel-stage]':stage, '[data-closing-pixel-canvas]':canvas, '.closing-pixels__title':title })[query] };
  const doc = { hidden:false, fonts:{ready:Promise.resolve()}, querySelectorAll:()=>[root], createElement:()=>({getContext:()=>paint}),
    body:{appendChild(){assert.fail('Closing animation must stay inside its section');}}, addEventListener(type,callback){events[type]=callback;} };
  const globals = { document:doc,navigator:{hardwareConcurrency:constrained?2:8,deviceMemory:8},Node:{TEXT_NODE:3},devicePixelRatio:2,
    matchMedia(query) { if (!media.has(query)) media.set(query,{matches:query.includes('prefers-reduced-motion')?reduced:query.includes('max-width:900px')?compact:false,addEventListener(type,fn){this.changed=fn;}}); return media.get(query); },
    getComputedStyle:()=>({fontFamily:'sans-serif',getPropertyValue:()=> '#4736fe'}),ResizeObserver:class{observe(){}},
    IntersectionObserver:class{constructor(callback){intersect=callback;}observe(){}},requestAnimationFrame(callback){const id=++nextFrame;frames.set(id,callback);return id;},cancelAnimationFrame(id){frames.delete(id);},addEventListener(){} };
  for (const [key,value] of Object.entries(globals)) Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  initializeClosingPixels();
  return {root,canvas,doc,frames,drawn,classes,media,events,get maskCopy(){return maskCopy;},visible(value){intersect([{isIntersecting:value}]);},tick(time){const [id,callback]=frames.entries().next().value;frames.delete(id);callback(time);} };
}

const ready = async () => { await Promise.resolve(); await Promise.resolve(); };

test('closing marquee preserves both title lines and moves stage-local pixels horizontally',async t=>{
  const f=fixture(t);await ready();
  assert.equal(f.maskCopy,'Your next chapter. Ours, too.     ');
  assert.equal(f.root.dataset.closingMotion,'horizontal-pixel-marquee');
  assert.equal(f.classes.has('is-pixels-ready'),true);
  assert.equal(f.canvas.className,undefined);
  f.visible(true);f.drawn.length=0;f.tick(1000);const first=f.drawn[0][0];
  f.drawn.length=0;f.tick(1034);assert.notEqual(f.drawn[0][0],first);
  f.visible(false);assert.equal(f.frames.size,0);
});

for (const options of [{compact:true},{reduced:true},{constrained:true}]) {
  test(`closing marquee uses readable static text for ${Object.keys(options)[0]}`,async t=>{
    const f=fixture(t,options);await ready();f.visible(true);
    assert.equal(f.classes.has('is-pixels-ready'),false);
    assert.equal(f.canvas.hidden,true);assert.equal(f.frames.size,0);
  });
}

test('marquee cancels hidden-tab work and responds to reduced-motion changes',async t=>{
  const f=fixture(t);await ready();f.visible(true);assert.equal(f.frames.size,1);
  f.doc.hidden=true;f.events.visibilitychange();assert.equal(f.frames.size,0);
  f.doc.hidden=false;f.events.visibilitychange();assert.equal(f.frames.size,1);
  const preference=f.media.get('(prefers-reduced-motion: reduce)');preference.matches=true;preference.changed();
  assert.equal(f.frames.size,0);assert.equal(f.canvas.hidden,true);assert.equal(f.classes.has('is-pixels-ready'),false);
});
