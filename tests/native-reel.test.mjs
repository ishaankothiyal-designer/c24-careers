import assert from 'node:assert/strict';
import test from 'node:test';
import {initializeCraftWork} from '../src/runtime/craft-work.js';

function setup(t,{reserve=false}={}) {
  const keys=['document','matchMedia','ResizeObserver'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const card=Object.assign(new EventTarget(),{dataset:{builderHref:'/builders/example/'},style:{},offsetHeight:200,offsetLeft:20});
  const second=Object.assign(new EventTarget(),{dataset:{},style:{},hidden:reserve,offsetHeight:300,offsetLeft:340});
  const track={style:{},querySelectorAll:()=>[card,second]};
  const previous=new EventTarget(),next=new EventTarget();
  const viewport=Object.assign(new EventTarget(),{scrollLeft:0,scrollWidth:700,clientWidth:390,scrollTo(options){this.scrollLeft=options.left;this.dispatchEvent(new Event('scroll'));}});
  const root=Object.assign(new EventTarget(),{id:'builder',dataset:{},hasAttribute:()=>false,querySelector:selector=>({'[data-craft-work-viewport]':viewport,'[data-craft-work-track]':track,'.craft-work__previous':previous,'.craft-work__next':next}[selector]||null)});
  const document=Object.assign(new EventTarget(),{querySelectorAll:()=>[root]});
  for(const [key,value] of Object.entries({document,matchMedia:q=>({matches:q==='(pointer: coarse)'}),ResizeObserver:class{observe(){}}}))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  initializeCraftWork();
  return {root,document,card,second,track,viewport,previous,next};
}

test('native touch reel keeps builder tap and keyboard activation while browser owns the swipe',t=>{
  const {root,document,card,viewport}=setup(t);
  assert.equal(root.dataset.nativeReel,'true');
  const requests=[];
  document.addEventListener('open-builder-project',event=>requests.push(event.detail));
  card.dispatchEvent(new Event('click',{cancelable:true}));
  const key=new Event('keydown',{cancelable:true});Object.defineProperty(key,'key',{value:'Enter'});card.dispatchEvent(key);
  assert.equal(requests.length,2);
  assert.equal(requests[0].href,'/builders/example/');
  assert.equal(requests[0].trigger,card);
  const pointer=new Event('pointerdown',{cancelable:true});viewport.dispatchEvent(pointer);
  assert.equal(pointer.defaultPrevented,false);
});

test('native touch reel arrows move to card boundaries and update disabled states',t=>{
  const {viewport,previous,next}=setup(t);
  assert.equal(previous.disabled,true);assert.equal(next.disabled,false);
  next.dispatchEvent(new Event('click'));
  assert.equal(viewport.scrollLeft,320);
  assert.equal(previous.disabled,false);assert.equal(next.disabled,true);
  previous.dispatchEvent(new Event('click'));
  assert.equal(viewport.scrollLeft,0);assert.equal(previous.disabled,true);
});

test('native touch programme cards open their own details and leave swipe handling native',t=>{
  const {document,card}=setup(t);
  delete card.dataset.builderHref;card.dataset.supportProgram='growth';
  const requests=[];document.addEventListener('open-support-programme',event=>requests.push(event.detail));
  card.dispatchEvent(new Event('click',{cancelable:true}));
  assert.equal(requests.length,1);assert.equal(requests[0].id,'growth');assert.equal(requests[0].trigger,card);
});


test('native touch reel continues at the first revealed card after inline expansion',t=>{
  const {root,second,viewport,previous,next}=setup(t);
  second.hidden=true;
  root.dispatchEvent(new CustomEvent('reel-reveal-card',{detail:{card:second}}));
  assert.equal(viewport.scrollLeft,0,'ignore a still-hidden target');
  second.hidden=false;
  root.dispatchEvent(new Event('reel-content-change'));
  root.dispatchEvent(new CustomEvent('reel-reveal-card',{detail:{card:second}}));
  assert.equal(viewport.scrollLeft,320);assert.equal(previous.disabled,false);assert.equal(next.disabled,true);
});


test('builder reel reserves full-roster height before the additional cards become visible',t=>{
  const {root,second,track}=setup(t,{reserve:true});
  assert.equal(second.hidden,true);assert.equal(track.style.minHeight,'300px');
  assert.equal(second.style.position,'');assert.equal(second.style.visibility,'');
  second.hidden=false;root.dispatchEvent(new Event('reel-content-change'));
  assert.equal(track.style.minHeight,'300px','expansion keeps the same row height');
});
