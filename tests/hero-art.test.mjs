import assert from 'node:assert/strict';
import test from 'node:test';
import {initializeCraftField} from '../src/runtime/craft-field.js';

test('hero artwork still paints without creating an overlay or registering pointer effects',t=>{
  const keys=['document','window','navigator','matchMedia','ResizeObserver','requestAnimationFrame','cancelAnimationFrame','innerWidth','innerHeight','devicePixelRatio'];
  const originals=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
  let nextFrame,painted=0,cleared=0;
  const listeners=[];
  const context={clearRect(){cleared++;},setTransform(){},save(){},restore(){},translate(){},fillRect(){painted++;}};
  const field={dataset:{},getContext:()=>context,getBoundingClientRect:()=>({width:180,height:100,top:0,bottom:100,left:0})};
  const media={matches:true,addEventListener:type=>listeners.push(type)};
  const win={addEventListener:type=>listeners.push(type)};
  const globals={window:win,navigator:{},document:{hidden:false,querySelector:selector=>selector==='.hero__stage'?{closest:()=>null}:field,createElement(){assert.fail('No page-wide cursor canvas should be created');}},
    matchMedia:()=>media,ResizeObserver:class {observe(){}disconnect(){}},requestAnimationFrame:callback=>{nextFrame=callback;return 1;},cancelAnimationFrame(){},innerWidth:320,innerHeight:700,devicePixelRatio:1};
  for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  t.after(()=>{win.__craftFieldCleanup?.();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  initializeCraftField();nextFrame(1000);
  assert.ok(cleared>0);assert.ok(painted>0);
  assert.equal(field.dataset.staticRendered,'true');
  assert.equal(listeners.some(type=>/pointer|dblclick/.test(type)),false);
  const firstPaint=painted;nextFrame(2000);assert.equal(painted,firstPaint);
});
