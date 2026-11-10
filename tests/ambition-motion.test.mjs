import assert from 'node:assert/strict';
import test from 'node:test';
import {createAmbitionFigure} from '../src/runtime/ambition-motion.js';

function fixture(play=()=>Promise.resolve()){
  const nodes=[];
  class Element {
    constructor(tag){this.tag=tag;this.attrs=new Map();this.events=new Map();this.hidden=false;this.readyState=3;this.pauses=0;nodes.push(this);}
    set src(value){this.attrs.set('src',value);}get src(){return this.attrs.get('src')||'';}
    setAttribute(k,v){this.attrs.set(k,v);}hasAttribute(k){return this.attrs.has(k);}
    removeAttribute(k){this.attrs.delete(k);}
    append(...children){this.children=children;}
    replaceChildren(...children){this.children=children;}
    addEventListener(k,v){this.events.set(k,v);}removeEventListener(k){this.events.delete(k);}
    play(){this.plays=(this.plays||0)+1;return play();}
    pause(){this.pauses++;}load(){this.released=true;}remove(){this.removed=true;}
  }
  const styles=new Map([['--ambition-surface','#fff']]);
  const card={style:{getPropertyValue:k=>styles.get(k),setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
  const host=new Element('host');host.dataset={ambitionMotion:'leap'};
  host.ownerDocument={createElement:tag=>new Element(tag)};host.closest=()=>card;
  return {host,styles,nodes};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('card media fetches video only on playback and uses a composed still when paused',async()=>{
  const {host,nodes,styles}=fixture();
  const figure=createAmbitionFigure(host,{play:false});
  const video=nodes.find(n=>n.tag==='video'),poster=nodes.find(n=>n.tag==='img');
  assert.equal(video.hasAttribute('src'),false);
  assert.match(poster.src,/leap.png$/);
  assert.equal(video.hidden,true);
  assert.notEqual(styles.get('--ambition-surface'),'#fff');
  figure.update({play:true});await settle();
  assert.match(video.src,/leap.mp4$/);
  assert.equal(video.muted,true);assert.equal(video.loop,true);
  assert.equal(video.hidden,false);assert.equal(poster.hidden,true);
  figure.update({play:false});
  assert.equal(video.hidden,true);assert.equal(poster.hidden,false);
  figure.destroy();
  assert.equal(video.hasAttribute('src'),false);
  assert.equal(video.released,true);assert.equal(video.events.size,0);
  assert.equal(styles.get('--ambition-surface'),'#fff');
});

test('blocked playback retains the still and a disposed play promise cannot reveal media',async()=>{
  const rejected=fixture(()=>Promise.reject(new Error('autoplay blocked')));
  const figure=createAmbitionFigure(rejected.host,{play:true});await settle();
  const blockedVideo=rejected.nodes.find(n=>n.tag==='video');
  assert.equal(blockedVideo.hidden,true);
  assert.equal(rejected.nodes.find(n=>n.tag==='img').hidden,false);
  figure.destroy();
  let resolve;
  const delayed=fixture(()=>new Promise(done=>{resolve=done;}));
  const pending=createAmbitionFigure(delayed.host,{play:true});
  pending.destroy();resolve();await settle();
  const video=delayed.nodes.find(n=>n.tag==='video');
  assert.equal(video.hidden,true);assert.equal(video.hasAttribute('src'),false);
});

