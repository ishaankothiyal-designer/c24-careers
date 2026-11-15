import test from 'node:test';
import assert from 'node:assert/strict';
import {createContentPopup} from '../src/runtime/content-popup.js';

function setup(t) {
  const names=['document','window','matchMedia','ResizeObserver'];
  const saved=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
  t.after(()=>{for(const [name,value] of saved)value?Object.defineProperty(globalThis,name,value):delete globalThis[name];});
  let doc;
  class Node extends EventTarget {
    constructor(){super();this.children=[];this.dataset={};this.attributes={};this.style={};this.scrollLeft=0;this.classList={add(){},remove(){}};}
    setAttribute(key,value){this.attributes[key]=value;}
    querySelector(selector){return this.map?.[selector]||null;}
    querySelectorAll(){return [];}
    get firstElementChild(){return this.children[0];}
    get offsetLeft(){return this.parent?this.parent.children.indexOf(this)*340:0;}
    append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
    replaceChildren(){this.children=[];}
    scrollTo({left}){this.scrollLeft=left;}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatchEvent(new Event('close'));}
    focus(){doc.activeElement=this;}
    getBoundingClientRect(){return {left:this.offsetLeft,right:this.offsetLeft+320,top:100,bottom:800};}
  }
  const dialog=new Node(),track=new Node(),previous=new Node(),next=new Node(),position=new Node(),close=new Node(),opener=new Node();
  dialog.map={'.role-carousel__track':track,'[data-role-previous]':previous,'[data-role-next]':next,'[data-role-position]':position,'.role-dialog__close':close};
  doc={activeElement:opener,body:new Node(),documentElement:{style:{overflow:'auto'}},createElement:tag=>tag==='dialog'?dialog:new Node()};
  const lenis={isStopped:false,stops:0,starts:0,stop(){this.stops++;},start(){this.starts++;}};
  for(const [name,value] of Object.entries({document:doc,window:{lenis,requestAnimationFrame:()=>1,cancelAnimationFrame(){}},matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}}}))Object.defineProperty(globalThis,name,{value,configurable:true});
  const loads=[],selected=[];let closed=0;
  const items=Array.from({length:5},(_,index)=>({id:'item'+index,label:'Item '+index,headingId:'item'+index+'-title',html:()=>{loads.push(index);return '<h2>Original content '+index+'</h2>';}}));
  const popup=createContentPopup({title:'Explore projects',label:'Projects',closeLabel:'Close project',previousLabel:'Previous project',nextLabel:'Next project',items,onSelect:item=>selected.push(item.id),onClose:()=>closed++});
  return {popup,doc,dialog,track,previous,next,position,close,opener,lenis,loads,selected,get closed(){return closed;}};
}

test('shared content popup opens selected panel, lazily loads neighbors and preserves the background lock',t=>{
  const f=setup(t);f.popup.open('missing');assert.equal(f.dialog.open,undefined);
  f.popup.open('item2',f.opener);
  assert.equal(f.dialog.open,true);assert.equal(f.track.children.length,5);
  assert.deepEqual(f.loads,[1,2,3]);assert.equal(f.track.children[2].inert,false);assert.equal(f.track.children[1].inert,true);
  assert.equal(f.dialog.attributes['aria-labelledby'],'item2-title');assert.match(f.position.textContent,/3 of 5 · Item 2/);
  assert.equal(f.doc.documentElement.style.overflow,'hidden');assert.equal(f.lenis.stops,1);
  f.next.dispatchEvent(new Event('click'));
  assert.equal(f.selected.at(-1),'item3');assert.deepEqual(f.loads,[1,2,3,4]);
  f.previous.dispatchEvent(new Event('click'));assert.equal(f.selected.at(-1),'item2');assert.equal(f.loads.length,4);
  f.close.dispatchEvent(new Event('click'));
  assert.equal(f.dialog.open,false);assert.equal(f.doc.activeElement,f.opener);assert.equal(f.doc.documentElement.style.overflow,'auto');assert.equal(f.lenis.starts,1);assert.equal(f.track.children.length,0);assert.equal(f.closed,1);
});

test('shared popup navigates a visible inert neighbor and closes only on a true backdrop gap',t=>{
  const f=setup(t);f.popup.open('item0',f.opener);assert.equal(f.previous.disabled,true);
  const click=(x,y)=>{const event=new Event('click');Object.defineProperties(event,{target:{value:f.track},clientX:{value:x},clientY:{value:y}});f.dialog.dispatchEvent(event);};
  click(350,200);assert.equal(f.selected.at(-1),'item1');assert.equal(f.dialog.open,true);
  f.popup.open('item4');assert.equal(f.next.disabled,true);assert.equal(f.lenis.stops,1);
  click(330,200);assert.equal(f.dialog.open,false);assert.equal(f.doc.activeElement,f.opener);
});
