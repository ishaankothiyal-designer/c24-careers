import assert from 'node:assert/strict';
import test from 'node:test';
import {initializeCraftWork} from '../src/runtime/craft-work.js';

test('collapsing builder stories during arrow motion stays within the smaller reel on every frame',t=>{
  const names=['requestAnimationFrame','cancelAnimationFrame','matchMedia','ResizeObserver','IntersectionObserver','document'];
  const saved=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
  t.after(()=>{for(const [name,value] of saved)value?Object.defineProperty(globalThis,name,value):delete globalThis[name];});
  let frameId=0,time=0;const frames=new Map();
  const style=()=>({setProperty(){},removeProperty(){}});
  const cards=Array.from({length:12},(_,i)=>Object.assign(new EventTarget(),{style:style(),dataset:{},hidden:false,get offsetLeft(){return this.hidden?0:20+i*328;},offsetWidth:300}));
  const track={style:style(),get scrollWidth(){return 40+cards.filter(card=>!card.hidden).length*328;},querySelectorAll:()=>cards};
  const previous=new EventTarget(),next=new EventTarget();
  const viewport=Object.assign(new EventTarget(),{clientWidth:934,style:style(),setAttribute(){},matches(){return false;},querySelector(){return null;}});
  const nodes={'[data-craft-work-viewport]':viewport,'[data-craft-work-track]':track,'.craft-work__previous':previous,'.craft-work__next':next};
  const root=Object.assign(new EventTarget(),{id:'builder',dataset:{},hasAttribute:name=>name==='data-stable-reel',querySelector:selector=>nodes[selector]||null,querySelectorAll:()=>[]});
  const values={requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>Object.assign(new EventTarget(),{matches:false}),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},document:Object.assign(new EventTarget(),{querySelectorAll:()=>[root],hidden:false})};
  for(const [name,value] of Object.entries(values))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  initializeCraftWork();
  const tick=()=>{time+=16;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));};
  const x=()=>Number(track.style.transform.match(/translate3d\(([-\d.]+)px/)[1]);
  for(let i=0;i<7;i++){next.dispatchEvent(new Event('click'));for(let j=0;j<150&&frames.size;j++)tick();}
  assert.ok(x() < -2000,'the setup reaches the expanded section');
  next.dispatchEvent(new Event('click'));tick();
  cards.forEach((card,i)=>{card.hidden=i>=4;});root.dispatchEvent(new Event('reel-content-change'));
  const minX=viewport.clientWidth-track.scrollWidth;
  for(let i=0;i<150;i++){tick();assert.ok(x()>=minX-.01&&x()<=.01,`out of range after frame ${i}: ${x()}`);}
  assert.equal(next.disabled,true);assert.equal(frames.size,0);
});
