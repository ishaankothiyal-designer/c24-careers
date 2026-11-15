import assert from 'node:assert/strict';
import test from 'node:test';
import {initializeRoleDialog} from '../src/runtime/role-dialog.js';

function setup(t, options={}) {
  const names=['document','window','location','history','matchMedia','ResizeObserver'];
  const saved=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
  t.after(()=>{for(const [name,value] of saved)value?Object.defineProperty(globalThis,name,value):delete globalThis[name];});
  let doc;
  class Node extends EventTarget {
    constructor(tag='div'){super();this.tag=tag;this.dataset={};this.attributes={};this.children=[];this.style={};this.innerHTML='';this.scrollLeft=0;this.isConnected=true;this.map={};this.classList={contains:name=>this.className?.split(' ').includes(name),add(){},remove(){}};}
    setAttribute(k,v){this.attributes[k]=v;}
    getAttribute(k){return this.attributes[k]??null;}
    querySelector(selector){return this.map[selector]||null;}
    querySelectorAll(){return [];}
    append(...nodes){for(const node of nodes){node.remove?.();this.children.push(node);node.parent=this;}}
    replaceChildren(...nodes){this.children.forEach(node=>{node.parent=null;});this.children=[];this.append(...nodes);}
    remove(){if(this.parent){this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}}
    showModal(){this.open=true;}
    close(){this.open=false;}
    focus(){doc.activeElement=this;}
    scrollTo({left}){this.scrollLeft=left;}
    getBoundingClientRect(){return {left:this.offsetLeft,right:this.offsetLeft+320,top:0,bottom:800};}
    get offsetLeft(){return this.parent?this.parent.children.indexOf(this)*340:0;}
  }
  const close=new Node('button'),track=new Node(),prev=new Node('button'),next=new Node('button'),position=new Node(),hint=new Node(),retry=new Node('button');
  track.className='role-carousel__track';
  const applicationClose=new Node('button'),applicationBody=new Node(),applicationTitle=new Node();
  const dialog=new Node('dialog'),application=new Node('dialog');
  dialog.map={'.role-carousel__track':track,'[data-role-previous]':prev,'[data-role-next]':next,'[data-role-position]':position,'[data-role-hint]':hint,'[data-role-list-retry]':retry,'.role-dialog__close':close};
  application.map={'.role-application-dialog__body':applicationBody,'#role-application-dialog-title':applicationTitle,'button':applicationClose};
  const trigger=new Node('a');let dialogCount=0;
  doc=Object.assign(new EventTarget(),{title:'Careers',activeElement:trigger,body:Object.assign(new Node('body'),{style:{overflow:'auto'}}),querySelector:()=>null,createElement:tag=>tag==='dialog'?(dialogCount++===0?dialog:application):new Node(tag)});
  const win=Object.assign(new EventTarget(),{requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  const location={href:'https://example.test/careers/?department=People',origin:'https://example.test',pathname:'/careers/'};
  const history={pushes:[],replacements:[],backs:0,pushState(state,_,url){this.state=state;this.pushes.push(url);},replaceState(state,_,url){this.state=state;this.replacements.push(url);},back(){this.backs++;}};
  for(const [name,value] of Object.entries({document:doc,window:win,location,history,matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}}}))Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
  initializeRoleDialog(options);
  const click=(href,extra={})=>{
    const link=Object.assign(new Node('a'),{href,hasAttribute:()=>false});
    const event=new Event('click',{cancelable:true});
    for(const [key,value] of Object.entries({button:0,target:{closest:()=>link},...extra}))Object.defineProperty(event,key,{value});
    doc.dispatchEvent(event);return {event,link};
  };
  return {doc,dialog,application,applicationBody,applicationClose,applicationTitle,close,track,prev,next,position,hint,retry,history,click,win,Node};
}

test('role carousel locks scrolling and closes through one history entry with focus restoration',t=>{
  const f=setup(t);const {event,link}=f.click('https://example.test/careers/roles/preview-role-1/');
  assert.equal(event.defaultPrevented,true);assert.equal(f.dialog.open,true);assert.equal(f.doc.body.style.overflow,'hidden');
  assert.match(f.dialog.innerHTML,/aria-roledescription="carousel"/);
  assert.equal(f.track.children.length,1);assert.match(f.track.children[0].children[0].children[0].innerHTML,/id="role-dialog-title-0"/);
  assert.deepEqual(f.history.pushes,['/careers/roles/preview-role-1/']);
  f.dialog.dispatchEvent(new Event('cancel',{cancelable:true}));
  assert.equal(f.dialog.open,false);assert.equal(f.doc.body.style.overflow,'auto');assert.equal(f.history.backs,1);assert.equal(f.doc.activeElement,link);assert.equal(f.track.children.length,0);
});

test('direct role links do not push history and close back to the listing',t=>{
  const f=setup(t,{initialPath:'/careers/roles/preview-role-1/'});
  assert.equal(f.dialog.open,true);assert.equal(f.history.pushes.length,0);
  f.close.dispatchEvent(new Event('click'));
  assert.deepEqual(f.history.replacements,['/careers/']);
});

test('role card modifier, middle and external-origin clicks retain normal browser behaviour',t=>{
  const f=setup(t);
  for(const extra of [{metaKey:true},{ctrlKey:true},{shiftKey:true},{altKey:true},{button:1}])assert.equal(f.click('https://example.test/careers/roles/preview-role-1/',extra).event.defaultPrevented,false);
  assert.equal(f.click('https://other.test/careers/roles/preview-role-1/').event.defaultPrevented,false);
  assert.equal(f.history.pushes.length,0);
  assert.equal(f.click('https://example.test/careers/roles/preview-role-1/').event.defaultPrevented,true);
  assert.equal(f.history.pushes.length,1);
});

test('browsing live roles replaces the current role URL instead of adding back-stack entries',async t=>{
  const jobs=[{id:'a1111111111111'},{id:'a2222222222222'},{id:'a3333333333333'}];
  const f=setup(t,{loadJobs:async()=>jobs,loadRole:async()=>undefined});
  f.click('https://example.test/careers/roles/a1111111111111/');
  await Promise.resolve();await Promise.resolve();
  assert.equal(f.track.children.length,3);assert.equal(f.prev.disabled,true);assert.equal(f.next.disabled,false);
  f.next.dispatchEvent(new Event('click'));
  assert.equal(f.history.pushes.length,1);assert.equal(f.history.replacements.at(-1),'/careers/roles/a2222222222222/');
  assert.equal(f.position.textContent,'Role details');assert.equal(f.track.children[0].inert,true);assert.equal(f.track.children[1].inert,false);
  f.next.dispatchEvent(new Event('click'));assert.equal(f.next.disabled,true);
  f.close.dispatchEvent(new Event('click'));assert.equal(f.history.backs,1);
});

test('a slow role-list response cannot reopen a dismissed carousel',async t=>{
  let resolve;const jobs=new Promise(done=>{resolve=done;});
  const f=setup(t,{loadJobs:()=>jobs,loadRole:async()=>undefined});
  f.click('https://example.test/careers/roles/a1111111111111/');f.close.dispatchEvent(new Event('click'));
  resolve([{id:'a1111111111111'},{id:'a2222222222222'}]);await Promise.resolve();await Promise.resolve();
  assert.equal(f.dialog.open,false);assert.equal(f.track.children.length,0);
});


test('reopening after a role-list failure clears the error hint once other roles load',async t=>{
  let attempt=0;
  const f=setup(t,{loadJobs:async()=>{if(++attempt===1)throw new Error('Offline');return [{id:'a1111111111111'},{id:'a2222222222222'}];},loadRole:async()=>undefined});
  f.click('https://example.test/careers/roles/a1111111111111/');
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.retry.hidden,false);assert.match(f.hint.textContent,/couldn’t load/);
  f.close.dispatchEvent(new Event('click'));f.click('https://example.test/careers/roles/a1111111111111/');
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.track.children.length,2);assert.equal(f.retry.hidden,true);
  assert.equal(f.hint.textContent,'Swipe or use the arrows to explore');
});

test('application popup retains each role’s own draft when browsing away and back',async t=>{
  const jobs=[{id:'a1111111111111',title:'First role'},{id:'a2222222222222',title:'Second role'}];
  const sections=new Map(),forms=new Map();let f;
  f=setup(t,{loadJobs:async()=>jobs,loadRole:async(body,id,signal,{onLoaded})=>{
    const section=new f.Node('section'),form=new f.Node('form');section.map['[data-application-form]']=form;body.map['.role-detail__application']=section;body.append(section);
    sections.set(id,section);forms.set(id,form);const job=jobs.find(job=>job.id===id);onLoaded(job);return job;
  }});
  f.click('https://example.test/careers/roles/a1111111111111/');for(let i=0;i<5;i++)await Promise.resolve();
  const action=()=>f.track.children[0].children[1].children.find(node=>node.tag==='button');
  action().dispatchEvent(new Event('click'));assert.equal(f.application.open,true);
  assert.equal(f.applicationBody.children[0],sections.get(jobs[0].id));forms.get(jobs[0].id).draft='Saved in this role';
  f.application.dispatchEvent(new Event('cancel',{cancelable:true}));assert.equal(f.application.open,false);assert.equal(f.dialog.open,true);assert.equal(f.doc.activeElement,action());
  f.next.dispatchEvent(new Event('click'));f.prev.dispatchEvent(new Event('click'));action().dispatchEvent(new Event('click'));
  assert.equal(f.applicationBody.children[0],sections.get(jobs[0].id));assert.equal(forms.get(jobs[0].id).draft,'Saved in this role');
  assert.equal(f.applicationTitle.textContent,'First role');assert.equal(sections.get(jobs[1].id).parent,null);
});


test('tapping an inert neighbor preview navigates instead of dismissing the carousel',async t=>{
  const f=setup(t,{loadJobs:async()=>[{id:'a1111111111111'},{id:'a2222222222222'}],loadRole:async()=>undefined});
  f.click('https://example.test/careers/roles/a1111111111111/');for(let i=0;i<5;i++)await Promise.resolve();
  const tap=(x,y)=>{const event=new Event('click',{cancelable:true});for(const [name,value] of Object.entries({target:f.track,clientX:x,clientY:y}))Object.defineProperty(event,name,{value});f.dialog.dispatchEvent(event);};
  tap(350,200);assert.equal(f.dialog.open,true);assert.equal(f.history.replacements.at(-1),'/careers/roles/a2222222222222/');
  tap(330,200);assert.equal(f.dialog.open,false);assert.equal(f.history.backs,1);
});
