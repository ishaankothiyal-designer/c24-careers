import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestRoleIndex,initializeRoleCarousel} from '../src/runtime/role-carousel.js';

test('native scroll positions choose the nearest role at the boundaries and between slides',()=>{
  assert.equal(nearestRoleIndex([],0),-1);
  const positions=[0,368,736,1104];
  for(const [left,index] of [[-30,0],[0,0],[200,1],[550,1],[740,2],[2000,3]])assert.equal(nearestRoleIndex(positions,left),index);
});

test('carousel controls clamp at edges, select only one accessible slide and preserve native touch',t=>{
  const before=Object.getOwnPropertyDescriptor(globalThis,'ResizeObserver');
  t.after(()=>before?Object.defineProperty(globalThis,'ResizeObserver',before):delete globalThis.ResizeObserver);
  Object.defineProperty(globalThis,'ResizeObserver',{configurable:true,value:class{observe(){}disconnect(){}}});
  const slides=[0,320,640].map(offsetLeft=>({offsetLeft,setAttribute(k,v){this[k]=v;}}));
  const track=Object.assign(new EventTarget(),{children:slides,scrollLeft:0,style:{},scrollTo(options){this.last=options;this.scrollLeft=options.left;},classList:{add(){},remove(){}}});
  const changes=[];
  const carousel=initializeRoleCarousel(track,{onChange:index=>changes.push(index),reduce:{matches:true},viewport:{requestAnimationFrame:fn=>{fn();return 1;},cancelAnimationFrame(){}}});
  carousel.refresh(0);carousel.go(1);assert.equal(track.last.left,320);assert.equal(track.last.behavior,'instant');
  assert.deepEqual(slides.map(slide=>slide.inert),[true,false,true]);
  carousel.go(30);assert.equal(track.last.left,640);carousel.go(-1);assert.equal(track.last.left,0);
  const touch=new Event('pointerdown',{cancelable:true});Object.defineProperty(touch,'pointerType',{value:'touch'});track.dispatchEvent(touch);assert.equal(touch.defaultPrevented,false);
  assert.deepEqual(changes,[1,2,0]);carousel.destroy();
});

function gestureFixture(t) {
  const saved=Object.getOwnPropertyDescriptor(globalThis,'ResizeObserver');
  t.after(()=>saved?Object.defineProperty(globalThis,'ResizeObserver',saved):delete globalThis.ResizeObserver);
  globalThis.ResizeObserver=class{observe(){}disconnect(){}};
  const slides=[0,340,680].map(offsetLeft=>({offsetLeft,setAttribute(k,v){this[k]=v;}}));
  let control=false,captured=false,id=0;
  const frames=new Map(),changes=[];
  const track=Object.assign(new EventTarget(),{children:slides,scrollLeft:0,style:{},closest:()=>control?{}:null,
    scrollTo(options){this.last=options;this.scrollLeft=Math.max(0,Math.min(680,options.left));},
    setPointerCapture(){captured=true;},hasPointerCapture(){return captured;},releasePointerCapture(){captured=false;},
    classList:{add(){},remove(){}}});
  const viewport={requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(key){frames.delete(key);}};
  const carousel=initializeRoleCarousel(track,{onChange:index=>changes.push(index),reduce:{matches:false},viewport});
  carousel.refresh(0);
  const fire=(type,properties={})=>{
    const event=new Event(type,{cancelable:true});
    for(const [key,value] of Object.entries(properties))Object.defineProperty(event,key,{value});
    track.dispatchEvent(event);return event;
  };
  const pointer=(type,x,y=100,pointerType='mouse')=>fire(type,{pointerType,pointerId:1,button:0,clientX:x,clientY:y});
  const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
  return {track,changes,carousel,pointer,fire,flush,control(value){control=value;}};
}

test('a light desktop drag advances one card and suppresses only its resulting click',t=>{
  const f=gestureFixture(t);
  f.pointer('pointerdown',120);f.pointer('pointermove',96);f.pointer('pointerup',96);
  assert.equal(f.track.last.left,340);assert.equal(f.track.last.behavior,'smooth');assert.deepEqual(f.changes,[1]);
  assert.equal(f.fire('click').defaultPrevented,true);
  f.control(true);f.pointer('pointerdown',120);assert.equal(f.fire('click').defaultPrevented,false);
  f.control(false);f.carousel.refresh(0);f.changes.length=0;
  f.pointer('pointerdown',120,100,'pen');f.pointer('pointermove',96,100,'pen');f.pointer('pointerup',96,100,'pen');
  assert.equal(f.track.last.left,340);assert.deepEqual(f.changes,[1]);
  f.carousel.destroy();
});

test('vertical intent, tiny movements, controls and cancelled drags do not turn pages',t=>{
  const f=gestureFixture(t);
  f.pointer('pointerdown',120);f.pointer('pointermove',116,150);f.pointer('pointerup',116,150);
  f.pointer('pointerdown',120);f.pointer('pointermove',117);f.pointer('pointerup',117);
  f.control(true);f.pointer('pointerdown',120);f.pointer('pointermove',80);f.pointer('pointerup',80);f.control(false);
  f.pointer('pointerdown',120);f.pointer('pointermove',96);f.pointer('pointercancel',96);
  assert.deepEqual(f.changes,[]);assert.equal(f.track.last.left,0);
  f.carousel.destroy();
});

test('small native touch flicks adjust the snap while vertical reading and multi-touch remain native',t=>{
  const f=gestureFixture(t),point=(x,y=100)=>({identifier:1,clientX:x,clientY:y});
  assert.equal(f.fire('touchstart',{touches:[point(120)]}).defaultPrevented,false);
  assert.equal(f.fire('touchmove',{touches:[point(96)]}).defaultPrevented,false);
  f.fire('touchend',{touches:[],changedTouches:[point(96)]});f.flush();
  assert.equal(f.track.last.left,340);assert.deepEqual(f.changes,[1]);
  f.carousel.refresh(0);f.changes.length=0;
  f.fire('touchstart',{touches:[point(120)]});f.fire('touchend',{touches:[],changedTouches:[point(115,170)]});f.flush();
  f.fire('touchstart',{touches:[point(120)]});f.fire('touchmove',{touches:[point(100),{identifier:2,clientX:160,clientY:100}]});
  f.fire('touchend',{touches:[],changedTouches:[point(70)]});f.flush();
  assert.deepEqual(f.changes,[]);assert.equal(f.track.last.left,0);
  f.carousel.destroy();
});

test('smooth snapping does not reselect the old card midway through an intentional transition',t=>{
  const f=gestureFixture(t);f.carousel.go(1);
  f.track.scrollLeft=24;f.fire('scroll');f.flush();assert.deepEqual(f.changes,[1]);
  f.track.scrollLeft=340;f.fire('scroll');f.flush();assert.deepEqual(f.changes,[1]);
  f.carousel.destroy();
});


test('an interrupted smooth snap accepts the card actually reached when scrolling settles',t=>{
  const f=gestureFixture(t);f.carousel.go(1);
  f.track.scrollLeft=680;f.fire('scrollend');f.flush();
  assert.deepEqual(f.changes,[1,2]);
  assert.deepEqual(f.track.children.map(slide=>slide.inert),[true,true,false]);
  f.carousel.destroy();
});
