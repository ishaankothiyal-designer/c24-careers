import assert from 'node:assert/strict';
import test from 'node:test';
import {initializeProjectDrawer,requestProject} from '../src/runtime/project-drawer.js';

function fixture(t,base='/',pathname='/') {
  const keys=['document','location','history'];
  const original=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  t.after(()=>{for(const [key,value] of original){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  class Node extends EventTarget {
    constructor(){super();this.dataset={};this.innerHTML='';this.scrollTop=0;this.open=false;}
    setAttribute(){}
    focus(){doc.activeElement=this;}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatchEvent(new Event('close'));}
    getBoundingClientRect(){return {left:400,right:1000,top:0,bottom:800};}
  }
  const doc=new EventTarget(),button=new Node(),body=new Node(),opener=new Node();
  let dialog,appends=0;
  doc.activeElement=opener;doc.documentElement={style:{overflow:'auto'}};
  doc.querySelector=selector=>selector.startsWith('meta')?{content:base}:dialog;
  doc.body={append(node){dialog=node;appends++;}};
  doc.createElement=()=>{const node=new Node();node.querySelector=selector=>selector==='button'?button:body;return node;};
  const history={calls:[],replaceState(...args){this.calls.push(args);}};
  Object.defineProperty(globalThis,'document',{value:doc,configurable:true});
  Object.defineProperty(globalThis,'location',{value:{pathname,href:'https://example.test'+pathname},configurable:true});
  Object.defineProperty(globalThis,'history',{value:history,configurable:true});
  initializeProjectDrawer();
  return {doc,button,body,opener,history,get dialog(){return dialog;},get appends(){return appends;}};
}

test('opens a builder project without navigating, closes and restores focus and scrolling',t=>{
  const f=fixture(t);
  requestProject('/builders/manvi-mehrotra/',f.opener);
  assert.equal(f.dialog.open,true);
  assert.match(f.body.innerHTML,/A secure home for AI-built prototypes/);
  assert.equal(f.doc.documentElement.style.overflow,'hidden');
  assert.equal(f.doc.activeElement,f.button);
  assert.equal(f.history.calls.length,0);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.dialog.open,false);
  assert.equal(f.doc.documentElement.style.overflow,'auto');
  assert.equal(f.doc.activeElement,f.opener);
  assert.equal(f.body.innerHTML,'');
});

test('supports deployment subpaths and ignores missing projects',t=>{
  const f=fixture(t,'/c24-careers/','/c24-careers/');
  requestProject('/c24-careers/builders/ishaan-kothiyal/');
  assert.equal(f.dialog.open,true);
  assert.match(f.body.innerHTML,/Ishaan Kothiyal/);
  assert.match(f.body.innerHTML,/href="\/c24-careers\/builders\//);
  const previous=f.body.innerHTML;
  requestProject('/c24-careers/builders/missing/');
  assert.equal(f.body.innerHTML,previous);
});

test('shared project URLs open the sidebar on home and initialization is idempotent',t=>{
  const f=fixture(t,'/','/builders/mayank/');
  assert.equal(f.dialog.open,true);
  assert.match(f.body.innerHTML,/Mayank/);
  assert.equal(f.history.calls[0][2],'/#builders');
  initializeProjectDrawer();assert.equal(f.appends,1);
});

test('closing through the native dialog event restores the page',t=>{
  const f=fixture(t);
  requestProject('/builders/manvi-mehrotra/');
  f.dialog.close();
  assert.equal(f.doc.documentElement.style.overflow,'auto');
  assert.equal(f.doc.activeElement,f.opener);
});

test('next-project links update the open sidebar and All builders closes it',t=>{
  const f=fixture(t);
  requestProject('/builders/manvi-mehrotra/');
  const click=href=>{
    const event=new Event('click',{cancelable:true});
    const link={href};
    Object.defineProperty(event,'target',{value:{closest:()=>link}});
    f.dialog.dispatchEvent(event);
    assert.equal(event.defaultPrevented,true);
  };
  f.body.scrollTop=200;
  click('https://example.test/builders/ishaan-kothiyal/');
  assert.match(f.body.innerHTML,/Ishaan Kothiyal/);
  assert.equal(f.body.scrollTop,0);
  assert.equal(f.dialog.open,true);
  click('https://example.test/#builders');
  assert.equal(f.dialog.open,false);
  assert.equal(f.doc.activeElement,f.opener);
});
