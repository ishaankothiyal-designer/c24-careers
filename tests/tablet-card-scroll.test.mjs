import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeTabletCardScroll} from '../src/runtime/ambition-stack.js';

test('tablet row advances, wraps, pauses for interaction and respects visibility and reduced motion',()=>{
  const events=new Map(),timers=new Map(),moves=[];let visible=true,hidden=false,id=0;
  const tablet={matches:true,addEventListener(type,fn){this.change=fn;},removeEventListener(){}};
  const motion={matches:false};
  const list={scrollWidth:1500,clientWidth:600,scrollLeft:0,children:[{offsetLeft:0},{offsetLeft:320}],contains:()=>false,
    addEventListener(type,fn){events.set(type,fn);},removeEventListener(type){events.delete(type);},scrollTo(value){moves.push(value);this.scrollLeft=value.left;}};
  const clock={setInterval(fn,ms){assert.equal(ms,2800);timers.set(++id,fn);return id;},clearInterval(id){timers.delete(id);}};
  const handle=initializeTabletCardScroll(list,{tablet,motion,isVisible:()=>visible,isHidden:()=>hidden,clock});
  const tick=()=>[...timers.values()].forEach(fn=>fn());
  handle.update();tick();assert.equal(list.scrollLeft,320);assert.equal(moves[0].behavior,'smooth');
  events.get('pointerenter')();tick();assert.equal(list.scrollLeft,320);
  events.get('pointerleave')();tick();assert.equal(list.scrollLeft,640);
  events.get('focusin')();tick();assert.equal(list.scrollLeft,640);
  events.get('focusout')({relatedTarget:null});tick();assert.equal(list.scrollLeft,900);
  tick();assert.equal(list.scrollLeft,0,'the final card wraps back to the beginning');
  hidden=true;handle.update();assert.equal(timers.size,0);
  hidden=false;visible=false;handle.update();assert.equal(timers.size,0);
  visible=true;motion.matches=true;handle.update();assert.equal(timers.size,0);
  motion.matches=false;tablet.matches=false;tablet.change();assert.equal(timers.size,0);
  tablet.matches=true;tablet.change();assert.equal(timers.size,1);
  events.get('wheel')();tick();assert.equal(list.scrollLeft,0,'manual scrolling gets a grace period');
  handle.destroy();assert.equal(timers.size,0);assert.equal(events.size,0);
});
