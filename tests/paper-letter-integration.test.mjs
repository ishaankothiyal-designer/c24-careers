import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('idle preparation enables animation and measures the expanded layout before its first pose', async t => {
  const keys=['document','window','navigator','matchMedia','ResizeObserver','IntersectionObserver','addEventListener','requestAnimationFrame','cancelAnimationFrame','requestIdleCallback','innerHeight','__paperScene'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const classes=new Set(),calls=[],observers=[];
  let top=2400,nextFrame;
  const root={dataset:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c);}},
    getBoundingClientRect(){return {top,height:classes.has('is-paper-ready')?2400:600};},
    querySelector(){return {getBoundingClientRect:()=>({width:680}),style:{setProperty(){}}};}};
  let idle;
  const globals={
    document:{querySelectorAll:()=>[root],addEventListener(){},hidden:false},window:{requestIdleCallback:true},
    navigator:{hardwareConcurrency:4,deviceMemory:4},innerHeight:800,
    matchMedia:()=>({matches:false,addEventListener(){}}),
    ResizeObserver:class {observe(){}},
    IntersectionObserver:class {constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){}},
    addEventListener(){},requestAnimationFrame:callback=>{nextFrame=callback;return 1;},cancelAnimationFrame(){},requestIdleCallback:callback=>{idle=callback;},
    __paperScene:{resize(){assert.equal(classes.has('is-paper-ready'),true);calls.push('resize');},
      update(amount){if(calls.length===1)assert.equal(amount,1);calls.push('update');},dispose(){assert.fail('Ready scene should be retained');}},
  };
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  let source=await readFile(new URL('../src/runtime/paper-letter.js',import.meta.url),'utf8');
  source=source.replaceAll("'./performance-profile.js'",JSON.stringify(new URL('../src/runtime/performance-profile.js',import.meta.url).href))
    .replaceAll("'./paper-enhancement.js'",JSON.stringify(new URL('../src/runtime/paper-enhancement.js',import.meta.url).href))
    .replace("await import('./paper-letter-scene.js')","({createPaperLetterScene:async()=>globalThis.__paperScene})");
  const {initializePaperLetter}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  initializePaperLetter();
  assert.equal(root.dataset.paperState,undefined);
  await idle();
  assert.equal(root.dataset.paperState,'ready');
  assert.deepEqual(calls,['resize','update']);
  observers[1].callback([{isIntersecting:true}]);
  assert.equal(root.dataset.paperState,'ready');
  top=-400;
  for(let i=1;i<=80;i++)nextFrame(i*40);
  assert.equal(classes.has('is-paper-readable'),true);
  const css=await readFile(new URL('../src/styles/review-letter-footer.css',import.meta.url),'utf8');
  assert.match(css,/\.is-paper-readable \.paper-letter__sheet\{opacity:1;pointer-events:auto/);
  assert.match(css,/\.is-paper-readable \.paper-letter__canvas\{visibility:hidden\}/);
  const letter=await readFile(new URL('../src/sections/career-06-letter.html',import.meta.url),'utf8');
  assert.match(letter,/I am the first person accountable for it/);
  assert.match(letter,/I will be standing there/);
});
