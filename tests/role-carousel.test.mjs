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
