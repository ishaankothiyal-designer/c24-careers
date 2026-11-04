import assert from 'node:assert/strict';
import test from 'node:test';
import { funnel } from '../src/runtime/hairline-examples/funnel.js';
import { cursorTab } from '../src/runtime/hairline-examples/cursor-tab.js';

// Run the reference figures' real geometry and clock against a small SVG DOM.
// The renderer is not mocked; only browser APIs and elapsed time are controlled.
function scene(t, create) {
  const keys=['document','window','performance','requestAnimationFrame','cancelAnimationFrame','IntersectionObserver','matchMedia'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  let now=0,nextFrame=0,doc,figure;
  const frames=new Map(),observers=[];
  const motion={matches:false,listeners:new Set(),addEventListener(type,fn){this.listeners.add(fn);},removeEventListener(type,fn){this.listeners.delete(fn);}};
  class Element {
    constructor(tag){
      this.tagName=tag;this.nodeType=1;this.ownerDocument=doc;this.parentNode=null;this.children=[];this.attrs=new Map();this.listeners=new Map();
      this.classList={toggle:(name,on)=>{const values=new Set((this.getAttribute('class')||'').split(/\s+/).filter(Boolean));on?values.add(name):values.delete(name);this.setAttribute('class',[...values].join(' '));}};
    }
    setAttribute(name,value){this.attrs.set(name,String(value));}
    getAttribute(name){return this.attrs.get(name)??null;}
    hasAttribute(name){return this.attrs.has(name);}
    removeAttribute(name){this.attrs.delete(name);}
    appendChild(child){child.remove();this.children.push(child);child.parentNode=this;return child;}
    append(...children){children.forEach(child=>this.appendChild(child));}
    replaceChildren(...children){[...this.children].forEach(child=>child.remove());this.append(...children);}
    remove(){if(this.parentNode){const siblings=this.parentNode.children;siblings.splice(siblings.indexOf(this),1);this.parentNode=null;}}
    contains(node){return node===this||this.children.some(child=>child.contains(node));}
    matches(){return false;}
    getRootNode(){return doc;}
    getBoundingClientRect(){return {left:0,top:0,width:400,height:320};}
    addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
    removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);if(!this.listeners.get(type)?.size)this.listeners.delete(type);}
  }
  doc={nodeType:9,activeElement:null,defaultView:{CSS:{supports:()=>false}},createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag)};
  doc.head=new Element('head');
  const globals={document:doc,window:{setTimeout},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>motion,
    IntersectionObserver:class{constructor(callback){this.callback=callback;this.targets=new Set();observers.push(this);}observe(target){this.targets.add(target);}unobserve(target){this.targets.delete(target);}disconnect(){this.targets.clear();this.disconnected=true;}}
  };
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  t.after(()=>{figure?.destroy();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const host=new Element('div');
  host.setAttribute('role','img');host.setAttribute('aria-label','Card illustration');
  figure=create(host,{play:false,label:'Card illustration'});
  const all=(node=host)=>[node,...node.children.flatMap(child=>all(child))];
  const snapshot=()=>all().map(node=>[...node.attrs].filter(([key])=>['d','class','cx','cy'].includes(key))).map(attrs=>JSON.stringify(attrs)).join('|');
  const step=(count=1)=>{for(let i=0;i<count;i++){now+=50;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));}};
  const visible=on=>observers.forEach(observer=>observer.callback([{target:host,isIntersecting:on}]));
  const point=(x,y)=>host.listeners.get('pointermove')?.forEach(fn=>fn({clientX:x,clientY:y,pointerType:'mouse',pointerId:1}));
  return {host,figure,all,snapshot,step,visible,point,frames,motion,observers};
}

for(const [name,create,points] of [
  ['Funnel',funnel,[[100,100],[200,160],[300,230],[320,270]]],
  ['Cursor Tab',cursorTab,[[130,182],[200,200],[283,225]]],
]){
  test(`${name} renders finite reference geometry and responds to the pointer`,t=>{
    const {host,all,snapshot,step,visible,point}=scene(t,create);
    assert.equal(host.children[0].tagName,'svg');
    assert.equal(host.children[0].getAttribute('viewBox'),'0 0 400 320');
    assert.equal(host.getAttribute('aria-label'),'Card illustration');
    const paths=all().filter(node=>node.tagName==='path');
    assert.ok(paths.some(node=>/^M/.test(node.getAttribute('d')||'')));
    assert.ok(paths.every(node=>!/(?:NaN|Infinity)/.test(node.getAttribute('d')||'')));
    assert.ok(!all().some(node=>['input','button'].includes(node.tagName)),'the demo controls must not enter the card');
    visible(true);step(40);
    const rest=snapshot();step(30);assert.equal(snapshot(),rest,'play:false must leave the rest drawing steady');
    let changed=false;
    for(const [x,y] of points){point(x,y);step(40);changed ||= snapshot()!==rest;}
    assert.ok(changed,'pointer input must animate the actual figure');
  });

  test(`${name} autoplay respects pause, visibility, reduced motion, and disposal`,t=>{
    const {host,figure,snapshot,step,visible,frames,motion,observers}=scene(t,create);
    visible(true);const rest=snapshot();
    figure.update({play:true});
    let changed=false;
    for(let i=0;i<260;i++){step();changed ||= snapshot()!==rest;}
    assert.ok(changed,'the automatic tour must move the actual figure');
    figure.update({play:false});step(100);const paused=snapshot();step(30);assert.equal(snapshot(),paused);
    figure.update({play:true});step(40);
    visible(false);const offscreen=snapshot();step(100);
    assert.equal(snapshot(),offscreen);assert.equal(frames.size,0);
    visible(true);step(160);
    motion.matches=true;motion.listeners.forEach(fn=>fn());step(5);
    const reduced=snapshot();step(100);assert.equal(snapshot(),reduced);
    figure.destroy();figure.destroy();figure.update({play:true});
    assert.equal(host.children.length,0);assert.equal(host.listeners.size,0);
    assert.equal(frames.size,0);assert.equal(motion.listeners.size,0);
    assert.ok(observers.every(observer=>observer.disconnected));
    assert.equal(host.hasAttribute('data-hairline'),false);
  });
}
