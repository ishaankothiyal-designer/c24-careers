import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

// Exercise the retained initializer itself, rather than a copy of its settings.
const runtime=await readFile(new URL('../public/_astro/Base.astro_astro_type_script_index_0_lang.BUtqXeGZ.js',import.meta.url),'utf8');
const initializer=runtime.slice(runtime.indexOf('function te()'),runtime.indexOf('function ne()'));
const node=()=>({style:{},attributes:{},setAttribute(key,value){this.attributes[key]=value;},appendChild(){},cloneNode(){return node();},parentNode:{insertBefore(){}}});
function heading({hero=false,excluded=false}={}) {
  return {...node(),textContent:'Explore roles across Cars24.',closest:()=>null,querySelector:()=>null,hasAttribute:()=>excluded,matches:()=>hero};
}
async function run(width,targets,{reduced=false}={}) {
  const calls=[],split=[];
  const context={
    document:{querySelectorAll:()=>targets,fonts:{ready:Promise.resolve()},createElement:node},
    matchMedia:query=>({matches:query.includes('prefers-reduced-motion')?reduced:width<=900}),$: '1.8',
    e:{to(chars,options){calls.push({chars,options});},matchMedia(){assert.fail('Heading animation must not split desktop/mobile behavior');}},
    D:{create(target){split.push(target);return {lines:[node()],chars:[node(),node()]};}},
  };
  vm.runInNewContext(`${initializer};te();`,context);
  await Promise.resolve();await Promise.resolve();
  return {calls,split};
}

for(const width of [390,934,1440]) {
  test(`role heading has the same scroll-driven roll at ${width}px`,async()=>{
    const target=heading();const {calls}=await run(width,[target]);
    assert.equal(calls.length,1);
    const {options}=calls[0];
    assert.equal(options.scrollTrigger.trigger,target);
    assert.equal(options.scrollTrigger.start,'top 85%');
    assert.equal(options.scrollTrigger.end,'top 45%');
    assert.equal(options.scrollTrigger.scrub,1);
    assert.equal(options.scrollTrigger.once,undefined);
    assert.equal(target.attributes['aria-label'],target.textContent);
    assert.equal(calls[0].chars.length,2);
  });
}

for (const width of [390,934,1440]) {
  test(`hero and opted-out headings use the mobile static treatment at ${width}px`,async()=>{
    const {calls,split}=await run(width,[heading({hero:true}),heading({excluded:true})]);
    assert.equal(calls.length,0);assert.equal(split.length,0);
  });
}

test('reduced motion leaves section headings unsplit and readable at every width',async()=>{
  for (const width of [390,934,1440]) {
    const {calls,split}=await run(width,[heading()],{reduced:true});
    assert.equal(calls.length,0);assert.equal(split.length,0);
  }
});
