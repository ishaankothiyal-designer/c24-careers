import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('tablet letter prepares the desktop scene while phones and short landscapes keep the readable fallback',async t=>{
  const source=(await readFile(new URL('../src/runtime/paper-letter.js',import.meta.url),'utf8'))
    .replace("await import('./paper-letter-scene.js')",'({createPaperLetterScene:async()=>{globalThis.__paperLoads++;return {update(){}};}})');
  const {initializePaperLetter}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  for(const [width,height,animated] of [[934,988,true],[1280,988,true],[577,988,false],[934,650,false]]) {
    await t.test(`${width} × ${height}`,async t=>{
      const keys=['document','matchMedia','ResizeObserver','IntersectionObserver','addEventListener','requestAnimationFrame','cancelAnimationFrame','innerHeight','__paperLoads'];
      const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
      t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
      const classes=new Set(),observers=[];
      const root={dataset:{},classList:{toggle(name,on){on?classes.add(name):classes.delete(name);},remove:name=>classes.delete(name)},getBoundingClientRect:()=>({top:2000,height:height*3}),querySelector:()=>({getBoundingClientRect:()=>({width:680}),style:{setProperty(){}}})};
      const globals={document:{hidden:false,querySelectorAll:()=>[root],fonts:{load:async()=>[],ready:Promise.resolve()},addEventListener(){}},
        matchMedia:query=>{const maxWidth=Number(query.match(/max-width:(\d+)px/)?.[1]);return {matches:query.includes('prefers-reduced-motion')?false:(width<=maxWidth || height<=700&&width>height),addEventListener(){}};},
        ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){}},addEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},innerHeight:height,__paperLoads:0};
      for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
      initializePaperLetter();observers[0].callback([{isIntersecting:true}]);
      await new Promise(resolve=>setImmediate(resolve));
      assert.equal(globalThis.__paperLoads,animated?1:0);
      assert.equal(classes.has('is-paper-ready'),animated);
      assert.equal(classes.has('is-paper-short'),!animated);
    });
  }
});
