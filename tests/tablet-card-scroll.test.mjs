import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeTabletCardScroll} from '../src/runtime/ambition-stack.js';

function scene(){
  const events=new Map(),frames=new Map(),timers=new Map();let time=0,id=0,visible=true,hidden=false;
  const tablet={matches:true,addEventListener(type,fn){this.change=fn;},removeEventListener(){this.change=null;}};
  const motion={matches:false};
  const list={dataset:{},clientWidth:640,scrollLeft:0,children:[],contains:()=>false,
    getBoundingClientRect:()=>({left:0}),addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type),
    append(...nodes){for(const node of nodes){const at=this.children.indexOf(node);if(at>=0)this.children.splice(at,1);this.children.push(node);}}};
  const originals=Array.from({length:5},(_,i)=>({id:i,get offsetLeft(){return 20+list.children.indexOf(this)*320;},getBoundingClientRect(){return {right:this.offsetLeft+320-list.scrollLeft};}}));
  list.children=[...originals];
  const clock={performance:{now:()=>time},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:(fn,delay)=>{timers.set(++id,{fn,end:time+delay});return id;},clearTimeout:id=>timers.delete(id)};
  const handle=initializeTabletCardScroll(list,{tablet,motion,isVisible:()=>visible,isHidden:()=>hidden,clock});
  const step=(duration=50)=>{
    time+=duration;for(const [id,timer] of [...timers])if(timer.end<=time){timers.delete(id);timer.fn();}
    const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));
  };
  return {list,originals,events,frames,timers,tablet,motion,handle,step,setVisible(value){visible=value;handle.update();},setHidden(value){hidden=value;handle.update();}};
}

test('tablet row moves continuously and recycles offscreen originals without a visible jump',()=>{
  const {list,originals,handle,step}=scene();handle.update();step();
  list.scrollLeft=339;
  const secondLeft=originals[1].offsetLeft-list.scrollLeft;
  step();
  assert.equal(list.children[0],originals[1]);
  assert.ok(Math.abs(list.scrollLeft-21.4)<.001);
  assert.ok(Math.abs((originals[1].offsetLeft-list.scrollLeft)-(secondLeft-2.4))<.001,'the next visible card moves only by the current animation step');
  for(let i=0;i<2000;i++)step();
  assert.equal(list.children.length,5,'infinite playback reuses the five live cards');
  assert.equal(new Set(list.children).size,5);
  const first=originals.indexOf(list.children[0]);
  assert.deepEqual(list.children,[...originals.slice(first),...originals.slice(0,first)]);
  assert.equal(list.dataset.tabletLoop,'true');
  handle.destroy();assert.deepEqual(list.children,originals);assert.equal(list.scrollLeft,0);assert.equal(list.dataset.tabletLoop,undefined);
});

test('continuous autoplay pauses for interaction, visibility and reduced motion, restores order and releases scheduled work',()=>{
  const {list,originals,events,frames,timers,tablet,motion,handle,step,setVisible,setHidden}=scene();
  handle.update();step();step();assert.ok(list.scrollLeft>0);
  events.get('pointerenter')();assert.equal(frames.size,0);const paused=list.scrollLeft;step();assert.equal(list.scrollLeft,paused);
  events.get('pointerleave')();assert.equal(frames.size,1);
  events.get('focusin')();assert.equal(frames.size,0);
  events.get('focusout')({relatedTarget:null});assert.equal(frames.size,1);
  events.get('wheel')();assert.equal(frames.size,0);assert.equal(timers.size,1);
  step(5900);assert.equal(frames.size,0);step(100);assert.equal(frames.size,1);step();assert.ok(list.scrollLeft>paused);
  setHidden(true);assert.equal(frames.size,0);setHidden(false);assert.equal(frames.size,1);
  setVisible(false);assert.equal(frames.size,0);setVisible(true);assert.equal(frames.size,1);
  motion.matches=true;handle.update();assert.equal(frames.size,0);assert.deepEqual(list.children,originals);assert.equal(list.dataset.tabletLoop,undefined);
  motion.matches=false;handle.update();assert.equal(frames.size,1);
  tablet.matches=false;tablet.change();assert.equal(frames.size,0);assert.deepEqual(list.children,originals);
  tablet.matches=true;tablet.change();events.get('pointerdown')();assert.equal(timers.size,1);
  handle.destroy();assert.equal(frames.size,0);assert.equal(timers.size,0);assert.equal(events.size,0);assert.deepEqual(list.children,originals);
});
