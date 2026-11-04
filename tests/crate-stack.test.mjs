import assert from 'node:assert/strict';
import test from 'node:test';
import { createCrateStack } from '../src/runtime/crate-stack.js';

// A small SVG DOM exercises the uploaded figure's real geometry and scheduler.
// It avoids a browser dependency and does not replace the drawing engine.
function scene(t) {
  const keys=['document','window','performance','requestAnimationFrame','cancelAnimationFrame','IntersectionObserver','matchMedia'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  let now=0,nextFrame=0;
  const frames=new Map(),observers=[];
  const motion={matches:false,listeners:new Set(),addEventListener(type,fn){this.listeners.add(fn);},removeEventListener(type,fn){this.listeners.delete(fn);}};
  let doc;
  class Element {
    constructor(tag) { this.tagName=tag;this.nodeType=1;this.ownerDocument=doc;this.parentNode=null;this.children=[];this.attrs=new Map();this.listeners=new Map();
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
    getRootNode(){return doc;}
    getBoundingClientRect(){return {left:0,top:0,width:400,height:320};}
    addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
    removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);if(!this.listeners.get(type)?.size)this.listeners.delete(type);}
  }
  doc={nodeType:9,defaultView:{CSS:{supports:()=>false}},createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag)};
  doc.head=new Element('head');
  const globals={document:doc,window:{setTimeout},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>motion,
    IntersectionObserver:class {constructor(callback){this.callback=callback;this.targets=new Set();observers.push(this);}observe(target){this.targets.add(target);}unobserve(target){this.targets.delete(target);}disconnect(){this.targets.clear();this.disconnected=true;}}
  };
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  const host=new Element('div');
  const figure=createCrateStack(host,{play:false});
  t.after(()=>{figure.destroy();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const all=(node=host)=>[node,...node.children.flatMap(child=>all(child))];
  const drawing=()=>all().find(node=>node.hasAttribute('data-progress'));
  const progress=()=>Number(drawing().getAttribute('data-progress'));
  const step=(count=1)=>{for(let i=0;i<count;i++){now+=50;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));}};
  const visible=on=>observers[0].callback([{target:host,isIntersecting:on}]);
  return {host,figure,all,progress,step,visible,frames,motion,observers};
}

test('crate-stack renders its reference pose without eagerly creating 1,000 hidden crates',t=>{
  const {host,all,progress,step,visible}=scene(t);
  const svg=host.children[0];
  assert.equal(svg.tagName,'svg');assert.equal(svg.getAttribute('viewBox'),'0 0 400 320');
  assert.equal(progress(),22.4);
  const crates=all().filter(node=>node.hasAttribute('data-crate'));
  assert.equal(crates.length,25);
  assert.ok(all().some(node=>node.tagName==='path'&&/^M/.test(node.getAttribute('d')||'')),'the real projection must produce SVG paths');
  assert.ok(all().filter(node=>node.tagName==='path').every(node=>!/(?:NaN|Infinity)/.test(node.getAttribute('d')||'')));
  visible(true);step(40);
  assert.equal(progress(),22.4,'a resting card must not advance the conveyor');
});

test('crate-stack playback follows visibility and motion preferences and cleans up its drawing',t=>{
  const {host,figure,progress,step,visible,frames,motion,observers}=scene(t);
  visible(true);figure.update({play:true});step(60);
  assert.ok(progress()>23.4&&progress()<24.1,'the supplied conveyor moves approximately half a crate per second');
  figure.update({play:false});step(100);
  const paused=progress();step(30);assert.equal(progress(),paused);
  figure.update({play:true});step(20);
  assert.ok(progress()>paused);
  visible(false);const offscreen=progress();step(30);assert.equal(progress(),offscreen);
  assert.equal(frames.size,0,'an offscreen figure must stop requesting frames');
  visible(true);step(20);assert.ok(progress()>offscreen);
  motion.matches=true;motion.listeners.forEach(fn=>fn());step(1);
  const reduced=progress();step(30);assert.equal(progress(),reduced);
  figure.destroy();figure.destroy();figure.update({play:true});
  assert.equal(host.children.length,0);
  assert.equal(host.listeners.size,0);
  assert.equal(motion.listeners.size,0);
  assert.equal(observers[0].disconnected,true);
  assert.equal(frames.size,0);
  assert.equal(host.hasAttribute('data-hairline'),false);
});
