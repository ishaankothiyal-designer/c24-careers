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
    assert.equal((card.match(/data-hairline-figure=/g)||[]).length,1);
    assert.match(card,/class="ambition-stack__visual"[^>]+role="img"[^>]+aria-label=/);
    assert.ok(card.indexOf('ambition-stack__copy')<card.indexOf('ambition-stack__visual'));
    assert.doesNotMatch(card,/ambition-stack__rail/);
  }
  assert.deepEqual([...html.matchAll(/data-hairline-figure="([^"]+)"/g)].map(match=>match[1]),['terrain','exploded','relay','hub','elevator']);
  assert.doesNotMatch(html,/<header|ambition-stack__intro/);
  assert.ok(html.includes('consumer AI company'));
  assert.ok(html.includes('From India, for the world'));
  const sequence=['Audacity is','AI-native builder','ten years','100 founders','100bn'];
  let previous=-1;
  for(const text of sequence){const position=html.indexOf(text);assert.ok(position>previous,text);previous=position;}
  for(const text of ['10×','ten years','100 founders','100bn','five years'])assert.ok(html.includes(text));
  assert.doesNotMatch(html,/by 2028|ambition__destination/);
});


function environment(t) {
  const keys=['document','navigator','matchMedia','IntersectionObserver'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const cards=Array.from({length:5},()=>({dataset:{},style:{removeProperty(){}},querySelector:()=>({})}));
  const root={dataset:{},querySelectorAll:()=>cards};
  const events=new Map(),observers=[];
  const motion={matches:false,addEventListener(type,callback){this.change=callback;},removeEventListener(){}};
  const doc={hidden:false,querySelectorAll:()=>[root],addEventListener(type,callback){events.set(type,callback);},removeEventListener(type){events.delete(type);}};
  const globals={document:doc,navigator:{hardwareConcurrency:8,deviceMemory:8},matchMedia:query=>query==='(prefers-reduced-motion: reduce)'?motion:{matches:false,addEventListener(){},removeEventListener(){}},IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}};
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  return {root,cards,events,observers,motion,doc};
}

test('Hairline loads near the section, plays only visible figures, and releases its resources',async t=>{
  const {cards,events,observers,motion,doc}=environment(t);
  const created=[];let loads=0;
  const cleanup=initializeAmbitionStack({loadFigures:async()=>{
    loads++;
    return {createAmbitionFigure(host,options){
      const figure={options,destroyed:false,update(options){this.options=options;},destroy(){this.destroyed=true;}};
      created.push(figure);return figure;
    }};
  }});
  assert.equal(loads,0,'the library must not load with the opening page');
  observers[0].callback([{target:cards[0],isIntersecting:true},{target:cards[1],isIntersecting:false}]);
  observers[1].callback([{isIntersecting:true}]);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(loads,1);assert.equal(created.length,5);
  assert.equal(created[0].options.play,true);assert.equal(created[1].options.play,false);
  doc.hidden=true;events.get('visibilitychange')();assert.equal(created[0].options.play,false);
  doc.hidden=false;events.get('visibilitychange')();assert.equal(created[0].options.play,true);
  motion.matches=true;motion.change();assert.equal(created[0].options.play,false);
  motion.matches=false;motion.change();assert.equal(created[0].options.play,true);
  observers[0].callback([{target:cards[0],isIntersecting:false}]);assert.equal(created[0].options.play,false);
  cleanup();
  assert.ok(created.every(figure=>figure.destroyed));
  assert.ok(observers.every(observer=>observer.disconnected));
  assert.equal(events.size,0);
});

test('a lazy illustration response cannot mount after the section is disposed',async t=>{
  const {observers}=environment(t);
  let resolve,created=0;
  const cleanup=initializeAmbitionStack({loadFigures:()=>new Promise(done=>{resolve=done;})});
  observers[1].callback([{isIntersecting:true}]);
  await Promise.resolve();
  cleanup();
  resolve({createAmbitionFigure(){created++;}});
  await new Promise(done=>setImmediate(done));
  assert.equal(created,0);
});

test('constrained devices retain the figures without autoplay',async t=>{
  const {cards,observers}=environment(t);
  navigator.hardwareConcurrency=2;
  const options=[];
  initializeAmbitionStack({loadFigures:async()=>({createAmbitionFigure(){return {update(value){options.push(value);},destroy(){}};}})});
  observers[0].callback([{target:cards[0],isIntersecting:true}]);
  observers[1].callback([{isIntersecting:true}]);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(options.length,5);
  assert.ok(options.every(value=>value.play===false));
});
