import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {letterCueVisible} from '../src/runtime/paper-letter.js';

test('tablet letter prepares the desktop scene while phones and short landscapes keep the readable fallback',async t=>{
  const source=(await readFile(new URL('../src/runtime/paper-letter.js',import.meta.url),'utf8'))
    .replace("await import('./paper-letter-scene.js')",'({createPaperLetterScene:async()=>{globalThis.__paperLoads++;return {update(){}};}})');
  const {initializePaperLetter}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  for(const [width,height,animated] of [[934,988,true],[1280,988,true],[577,988,false],[934,650,false]]) {
    await t.test(`${width} × ${height}`,async t=>{
      const keys=['document','matchMedia','ResizeObserver','IntersectionObserver','addEventListener','requestAnimationFrame','cancelAnimationFrame','innerHeight','__paperLoads'];
      const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
      t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
      const classes=new Set(),observers=[];let stageRect={top:200,bottom:800,height:600,width:680};
      const root={dataset:{},classList:{toggle(name,on){on?classes.add(name):classes.delete(name);},remove:name=>classes.delete(name)},getBoundingClientRect:()=>({top:2000,height:height*3}),querySelector:()=>({getBoundingClientRect:()=>stageRect,style:{setProperty(){}}})};
      const globals={document:{hidden:false,querySelectorAll:()=>[root],fonts:{load:async()=>[],ready:Promise.resolve()},addEventListener(){}},
        matchMedia:query=>{const maxWidth=Number(query.match(/max-width:(\d+)px/)?.[1]);return {matches:query.includes('prefers-reduced-motion')?false:(width<=maxWidth || height<=700&&width>height),addEventListener(){}};},
        ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){}},addEventListener(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},innerHeight:height,__paperLoads:0};
      for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
      initializePaperLetter();observers[0].callback([{isIntersecting:true}]);
      await new Promise(resolve=>setImmediate(resolve));
      assert.equal(globalThis.__paperLoads,animated?1:0);
      assert.equal(classes.has('is-paper-ready'),animated);
      assert.equal(classes.has('is-paper-short'),!animated);
      observers[1].callback([{isIntersecting:true}]);
      assert.equal(root.dataset.paperVisible,'true');
      stageRect={top:-550,bottom:50,height:600,width:680};
      observers[1].callback([{isIntersecting:true}]);
      assert.equal(root.dataset.paperVisible,'false','a remaining letter-section sliver must not show the cue over the next section');
      observers[1].callback([{isIntersecting:false}]);
      assert.equal(root.dataset.paperVisible,'false');
    });
  }
});

test('letter cue requires most of the scene to be visible, including before entry and after exit',()=>{
  assert.equal(letterCueVisible({top:200,bottom:800,height:600},988),true);
  assert.equal(letterCueVisible({top:950,bottom:1550,height:600},988),false);
  assert.equal(letterCueVisible({top:-550,bottom:50,height:600},988),false);
  assert.equal(letterCueVisible({top:-600,bottom:0,height:600},988),false);
});


test('letter cue starts fading when the following section enters the viewport',()=>{
  const stage={top:80,bottom:900,height:820};
  assert.equal(letterCueVisible(stage,955,955),true);
  assert.equal(letterCueVisible(stage,955,954),false);
  assert.equal(letterCueVisible(stage,955,700),false);
});
