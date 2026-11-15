import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import programmes from '../src/support-programmes.json' with {type:'json'};
import {supportProgramme,supportProgrammeHtml,initializeBuilderSelection} from '../src/runtime/support-dialog.js';

test('programme details resolve by stable ID and render source images and useful information safely',async()=>{
  assert.equal(supportProgramme('missing'),undefined);
  const seen=new Set();
  for(const programme of programmes){
    assert.ok(!seen.has(programme.id));seen.add(programme.id);
    assert.equal(supportProgramme(programme.id),programme);
    const html=supportProgrammeHtml(programme);
    assert.ok(html.includes('id="support-dialog-title"'));
    assert.ok(programme.details.length>0);
    assert.ok(programme.source);
    for(const photo of programme.photos||[]){await access(new URL(`../public${photo.src}`,import.meta.url));assert.ok(photo.alt);}
  }
  const html=supportProgrammeHtml({...programmes[0],title:'<script>bad</script>',note:'<img onerror="bad">'});
  assert.doesNotMatch(html,/<script>|<img onerror/);
  assert.match(html,/&lt;script&gt;/);
});

test('builder View more card reveals remaining stories once and continues without collapsing',t=>{
  const before=Object.getOwnPropertyDescriptor(globalThis,'document');
  t.after(()=>before?Object.defineProperty(globalThis,'document',before):delete globalThis.document);
  let focused,options;
  const extra=Array.from({length:8},()=>({hidden:true,focus(value){focused=this;options=value;}}));
  const button=Object.assign(new EventTarget(),{dataset:{},expanded:'false',hidden:false,setAttribute(k,v){this.expanded=v;}});
  const root=Object.assign(new EventTarget(),{querySelector:()=>button,querySelectorAll:()=>extra});
  Object.defineProperty(globalThis,'document',{configurable:true,value:{querySelector:()=>root}});
  let changed=0,revealed;root.addEventListener('reel-content-change',()=>changed++);
  root.addEventListener('reel-reveal-card',event=>{revealed=event.detail.card;assert.ok(extra.every(card=>!card.hidden));});
  initializeBuilderSelection();initializeBuilderSelection();
  button.dispatchEvent(new Event('click'));
  assert.ok(extra.every(card=>!card.hidden));assert.equal(button.hidden,true);assert.equal(button.expanded,'true');assert.equal(changed,1);
  assert.equal(revealed,extra[0]);assert.equal(focused,extra[0]);assert.deepEqual(options,{preventScroll:true});
  button.dispatchEvent(new Event('click'));
  assert.ok(extra.every(card=>!card.hidden));assert.equal(changed,1,'a hidden action cannot collapse or duplicate expansion');
});

test('sticker version carries live text, a static motion fallback and no unconfirmed company target',async()=>{
  const source=await readFile(new URL('../src/sections/career-02-ambition.html',import.meta.url),'utf8');
  assert.match(source,/data-sticker-cards/);
  assert.equal((source.match(/class="sticker-silhouette"/g)||[]).length,5);
  assert.doesNotMatch(source,/100bn|300bn/);
  assert.match(source,/founder identity is not a hiring requirement/);
  const css=await readFile(new URL('../src/styles/feedback-nov13.css',import.meta.url),'utf8');
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/data-art-paused="true"/);
});
