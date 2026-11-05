import test from 'node:test';
import assert from 'node:assert/strict';
import {horizontalCardOffset,initializeDesktopCardScroll} from '../src/runtime/desktop-card-scroll.js';

test('horizontal progress clamps at both ends and retraces the same path on reverse scroll',()=>{
  assert.equal(horizontalCardOffset(200,80,1066),0);
  assert.equal(horizontalCardOffset(80,80,1066),0);
  assert.equal(horizontalCardOffset(-420,80,1066),500);
  assert.equal(horizontalCardOffset(-986,80,1066),1066);
  assert.equal(horizontalCardOffset(-1500,80,1066),1066);
  assert.equal(horizontalCardOffset(-420,80,1066),500);
  assert.equal(horizontalCardOffset(80,80,0),0);
});

test('desktop scene measures overflow, follows native scrolling, resizes, disables for reduced motion, and cleans up',()=>{
  let top=80,pinTop=80,next=0,observer;
  const events=new Map(),frames=new Map(),props=new Map();
  const media=()=>({matches:true,listeners:new Set(),addEventListener(type,fn){this.listeners.add(fn);},removeEventListener(type,fn){this.listeners.delete(fn);}});
  const desktop=media(),motion=media();motion.matches=false;
  const list={scrollWidth:2500,clientWidth:1434,scrollLeft:0,children:Array(5).fill({})};const stage={};
  const root={dataset:{},style:{setProperty:(key,value)=>props.set(key,value),removeProperty:key=>props.delete(key)},getBoundingClientRect:()=>({top}),querySelector:selector=>selector==='.container'?stage:list};
  const viewport={matchMedia:()=>desktop,getComputedStyle:()=>({top:`${pinTop}px`}),requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type),ResizeObserver:class{constructor(fn){this.callback=fn;observer=this;}observe(){}disconnect(){this.disconnected=true;}}};
  const tick=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
  const slideOffset=()=>Math.abs(parseFloat(props.get('--ambition-slide-x'))||0);
  const cleanup=initializeDesktopCardScroll(root,{motion,viewport});tick();
  assert.equal(props.get('--ambition-scroll-distance'),'1066px');assert.equal(root.dataset.horizontalPinned,'true');
  top=-420;events.get('scroll')();tick();assert.equal(slideOffset(),500);
  assert.equal(list.scrollLeft,0,'the active track translates without a clipping scroll container');
  top=-2000;events.get('scroll')();tick();assert.equal(slideOffset(),1066);
  top=-420;events.get('scroll')();tick();assert.equal(slideOffset(),500);
  top=200;events.get('scroll')();tick();assert.equal(slideOffset(),0);
  list.clientWidth=1200;pinTop=320;top=320;observer.callback();tick();assert.equal(props.get('--ambition-scroll-distance'),'1300px');
  assert.equal(slideOffset(),0,'the row begins when it reaches the new bottom-aligned pin position');
  top=-180;events.get('scroll')();tick();assert.equal(slideOffset(),500);
  top=-980;events.get('scroll')();tick();assert.equal(slideOffset(),1300);
  top=320;events.get('scroll')();tick();assert.equal(slideOffset(),0,'reverse scrolling returns to the same pin position');
  pinTop=0;top=0;observer.callback();tick();assert.equal(slideOffset(),0,'zero is a valid full-viewport pin position');
  top=-500;events.get('scroll')();tick();assert.equal(slideOffset(),500);
  top=0;events.get('scroll')();tick();assert.equal(slideOffset(),0);
  pinTop=80;top=80;observer.callback();tick();assert.equal(slideOffset(),0,'horizontal scrolling starts flush beneath the navbar');
  top=-420;events.get('scroll')();tick();assert.equal(slideOffset(),500);
  top=80;events.get('scroll')();tick();assert.equal(slideOffset(),0);
  motion.matches=true;motion.listeners.forEach(fn=>fn());assert.equal(root.dataset.horizontalPinned,undefined);assert.equal(props.size,0);
  motion.matches=false;motion.listeners.forEach(fn=>fn());tick();assert.equal(root.dataset.horizontalPinned,'true');
  desktop.matches=false;desktop.listeners.forEach(fn=>fn());assert.equal(root.dataset.horizontalPinned,undefined);
  cleanup();assert.equal(events.size,0);assert.equal(frames.size,0);assert.equal(motion.listeners.size,0);assert.equal(desktop.listeners.size,0);assert.equal(observer.disconnected,true);
});
