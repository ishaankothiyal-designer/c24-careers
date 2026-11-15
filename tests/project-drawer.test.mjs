import assert from 'node:assert/strict';
import test from 'node:test';
import stories from '../src/builder-stories.json' with {type:'json'};
import {initializeProjectDrawer,requestProject} from '../src/runtime/project-drawer.js';

// The adapter owns story data, link routing and shared-URL semantics. Native
// dialog focus/scroll/motion and carousel mechanics belong to content-popup.
function fixture(t,base='/',pathname='/') {
  const names=['document','location','history'];
  const saved=names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]);
  t.after(()=>{for(const [name,value] of saved)value?Object.defineProperty(globalThis,name,value):delete globalThis[name];});
  let current=new URL(pathname,'https://example.test'),options,popup,factories=0;
  const classes=new Set();
  const dialog=Object.assign(new EventTarget(),{dataset:{},classList:{add:name=>classes.add(name),contains:name=>classes.has(name)}});
  const doc=Object.assign(new EventTarget(),{querySelector:selector=>selector.startsWith('meta')?{content:base}:Object.hasOwn(dialog.dataset,'projectDrawer')?dialog:null});
  const location={get pathname(){return current.pathname;},get href(){return current.href;}};
  const history={state:{keep:'existing-state'},calls:[],replaceState(state,title,url){this.state=state;this.calls.push([state,title,url]);current=new URL(url,current);}};
  const opens=[];let closes=0,selected;
  const createPopup=config=>{
    factories++;options=config;
    popup={dialog,open(id,trigger){
      const item=config.items.find(entry=>entry.id===id);if(!item)return;
      selected=item;dialog.open=true;opens.push({id,trigger});config.onSelect?.(item);
    },close(){if(!dialog.open)return;dialog.open=false;closes++;config.onClose?.();}};
    return popup;
  };
  for(const [name,value] of Object.entries({document:doc,location,history}))Object.defineProperty(globalThis,name,{configurable:true,value});
  initializeProjectDrawer({createPopup});
  const click=(href,extra={})=>{
    const link={href,hasAttribute:name=>name==='download'&&!!extra.download,target:extra.target||''};
    const event=new Event('click',{cancelable:true});
    for(const [name,value] of Object.entries({button:0,target:{closest:()=>link},...Object.fromEntries(Object.entries(extra).filter(([name])=>!['download','target','prevented'].includes(name)))}))Object.defineProperty(event,name,{value});
    if(extra.prevented)event.preventDefault();
    dialog.dispatchEvent(event);return event;
  };
  return {doc,dialog,history,location,opens,click,createPopup,get popup(){return popup;},get options(){return options;},get factories(){return factories;},get closes(){return closes;},get selected(){return selected;}};
}

test('builder adapter supplies the complete landing-page collection to the shared popup',t=>{
  const f=fixture(t);
  assert.equal(f.factories,1);assert.equal(f.dialog.dataset.projectDrawer,'');assert.equal(f.dialog.classList.contains('builder-popup'),true);
  for(const key of ['label','title','closeLabel','previousLabel','nextLabel'])assert.ok(f.options[key]);
  assert.equal(f.options.closeLabel,'Close project');assert.equal(f.options.previousLabel,'Previous project');assert.equal(f.options.nextLabel,'Next project');
  const landingStories=stories.filter(story=>!['mayank','ishaan-kothiyal'].includes(story.slug));
  assert.deepEqual(f.options.items.map(item=>[item.id,item.label]),landingStories.map(story=>[story.slug,story.name]));
  assert.equal(f.options.items.length,12);
  assert.equal(new Set(f.options.items.map(item=>item.id)).size,landingStories.length);
  const manvi=f.options.items.find(item=>item.id==='manvi-mehrotra');
  assert.equal(typeof manvi.html,'function','full project markup is rendered lazily');
  assert.equal(manvi.headingId,'manvi-mehrotra-story-title');
  const html=manvi.html();
  assert.match(html,/A secure home for AI-built prototypes/);assert.match(html,/What Manvi built/);assert.match(html,/id="story-title"/);
  assert.doesNotMatch(html,/<main\b/);assert.match(html,/data-no-roll/);
});

test('opening a valid project delegates its trigger without navigating and ignores missing or external projects',t=>{
  const f=fixture(t),trigger={id:'originating-card'};
  requestProject('/builders/manvi-mehrotra/',trigger);
  assert.equal(f.selected.id,'manvi-mehrotra');assert.equal(f.dialog.open,true);assert.equal(f.opens[0].trigger,trigger);
  assert.equal(f.history.calls.length,0);
  const count=f.opens.length;
  for(const path of ['/builders/missing/','/careers/','https://other.test/builders/manvi-mehrotra/'])requestProject(path,trigger);
  assert.equal(f.opens.length,count);assert.equal(f.selected.id,'manvi-mehrotra');
});

test('adapter initialization is idempotent with a shared popup marker',t=>{
  const f=fixture(t);
  initializeProjectDrawer({createPopup:f.createPopup});
  assert.equal(f.factories,1);
  requestProject('/builders/manvi-mehrotra/');assert.equal(f.opens.length,1);
});

test('deployment subpaths are retained in lazy project links and project opening',t=>{
  const f=fixture(t,'/c24-careers/','/c24-careers/');
  requestProject('/c24-careers/builders/nishant-arora/');
  assert.equal(f.selected.id,'nishant-arora');
  const html=f.selected.html();
  assert.match(html,/Nishant Arora/);assert.match(html,/href="\/c24-careers\/builders\//);
  assert.equal(f.history.calls.length,0);
});

test('incoming shared project route survives opening and resets only when the popup closes',t=>{
  const f=fixture(t,'/','/builders/manvi-mehrotra/');
  assert.equal(f.dialog.open,true);assert.equal(f.selected.id,'manvi-mehrotra');
  assert.equal(f.location.pathname,'/builders/manvi-mehrotra/');assert.equal(f.history.calls.length,0,'refresh must retain the initial project route');
  f.popup.close();
  assert.equal(f.closes,1);assert.equal(f.history.calls.at(-1)[2],'/#builders');assert.deepEqual(f.history.calls.at(-1)[0],{keep:'existing-state'});
  requestProject('/builders/nishant-arora/');
  assert.equal(f.selected.id,'nishant-arora');assert.equal(f.history.calls.length,1,'ordinary homepage opening does not re-enable shared-route navigation');
});

test('selecting a neighboring shared project updates its refreshable URL, including subpaths',t=>{
  const f=fixture(t,'/c24-careers/','/c24-careers/builders/manvi-mehrotra/');
  const neighbor=f.options.items.find(item=>item.id==='nishant-arora');
  f.options.onSelect(neighbor);
  assert.equal(f.history.calls.at(-1)[2],'/c24-careers/builders/nishant-arora/');
  assert.equal(f.location.pathname,'/c24-careers/builders/nishant-arora/');
  const count=f.history.calls.length;f.options.onSelect(neighbor);assert.equal(f.history.calls.length,count,'selecting the same project does not rewrite history again');
  f.popup.close();assert.equal(f.history.calls.at(-1)[2],'/c24-careers/#builders');
});

test('ordinary project neighbor links stay in the popup and All builders closes it',t=>{
  const f=fixture(t);requestProject('/builders/manvi-mehrotra/');
  const neighbor=f.click('https://example.test/builders/nishant-arora/');
  assert.equal(neighbor.defaultPrevented,true);assert.equal(f.selected.id,'nishant-arora');assert.equal(f.dialog.open,true);
  assert.equal(f.history.calls.length,0);
  const close=f.click('https://example.test/#builders');
  assert.equal(close.defaultPrevented,true);assert.equal(f.dialog.open,false);assert.equal(f.closes,1);
});

test('modified, download, new-window and external links preserve browser navigation',t=>{
  const f=fixture(t);requestProject('/builders/manvi-mehrotra/');const count=f.opens.length;
  for(const extra of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{download:true},{target:'_blank'}]){
    assert.equal(f.click('https://example.test/builders/nishant-arora/',extra).defaultPrevented,false);
  }
  for(const href of ['https://other.test/builders/nishant-arora/','https://other.test/#builders','https://example.test/#manvi-mehrotra-story-title'])assert.equal(f.click(href).defaultPrevented,false);
  assert.equal(f.opens.length,count);assert.equal(f.closes,0);assert.equal(f.selected.id,'manvi-mehrotra');
});

test('links already handled by another control are not opened again',t=>{
  const f=fixture(t);requestProject('/builders/manvi-mehrotra/');const count=f.opens.length;
  const event=f.click('https://example.test/builders/nishant-arora/',{prevented:true});
  assert.equal(event.defaultPrevented,true);assert.equal(f.opens.length,count);assert.equal(f.selected.id,'manvi-mehrotra');
});


for(const slug of ['mayank','ishaan-kothiyal']){
  test(`legacy shared ${slug} URL remains valid without inserting other legacy stories`,t=>{
    const f=fixture(t,'/c24-careers/',`/c24-careers/builders/${slug}/`);
    assert.equal(f.dialog.open,true);assert.equal(f.selected.id,slug);
    assert.equal(f.options.items.length,13);assert.ok(f.options.items.some(item=>item.id===slug));
    assert.equal(f.options.items.some(item=>item.id===(['mayank','ishaan-kothiyal'].find(id=>id!==slug))),false);
    assert.equal(f.history.calls.length,0);
    f.popup.close();assert.equal(f.history.calls.at(-1)[2],'/c24-careers/#builders');
  });
}

test('valid legacy links outside the default deck are not swallowed',t=>{
  const f=fixture(t);requestProject('/builders/gaurav-saxena/');const count=f.opens.length;
  for(const slug of ['mayank','ishaan-kothiyal']){
    const event=f.click(`https://example.test/builders/${slug}/`);
    assert.equal(event.defaultPrevented,false,'the browser must be allowed to open the retained shared route');
  }
  assert.equal(f.opens.length,count);assert.equal(f.dialog.open,true);
});
