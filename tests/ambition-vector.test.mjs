import assert from 'node:assert/strict';
import test from 'node:test';
import {SCENES,sceneFrame,leapState,collaboratorState,trackState,workshopState,pavilionState,length,sub,add,mul,rotateY} from '../src/runtime/ambition-vector-scenes.js';
import {createVectorSurface,createAmbitionFigure} from '../src/runtime/ambition-vector.js';
const close=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-8,message||a+' != '+b);

test('the cube remains rigid and its landing arrives before contact',()=>{
  for(let t=0;t<7.8;t+=.03){
    const s=leapState(t);
    assert.ok(s.cube[2]>=0);
    const a=add(rotateY([-12,-12,0],s.tilt),s.cube);
    const b=add(rotateY([12,-12,0],s.tilt),s.cube);
    const c=add(rotateY([-12,12,0],s.tilt),s.cube);
    const d=add(rotateY([-12,-12,24],s.tilt),s.cube);
    for(const p of [b,c,d])close(length(sub(p,a)),24);
    const feet=[-12,12].map(x=>add(rotateY([x,0,0],s.tilt),s.cube)[2]);
    assert.ok(Math.min(...feet)>-1e-8,'the cube must never sink through its supporting plane');
  }
  close(leapState(3.1).landing,76);
  assert.ok(leapState(3.1).cube[2]>0,'the landing must precede touchdown');
  close(leapState(4.5).cube[2],0);
});

test('the drafting arm keeps exact link lengths while its wrist follows the ruler',()=>{
  for(let t=0;t<9.8;t+=.03){
    const s=collaboratorState(t);
    close(length(sub(s.elbow,s.base)),50);
    close(length(sub(s.wrist,s.elbow)),47);
    assert.equal(s.wrist[0],25);assert.equal(s.wrist[1],-49);
  }
});

test('ten track panels stay connected and the bead remains attached to the track',()=>{
  for(let t=0;t<8.8;t+=.03){
    const s=trackState(t);
    assert.equal(s.joints.length,11);
    for(let i=0;i<10;i++)close(length(sub(s.joints[i+1],s.joints[i])),25);
    close(length(sub(s.ball,s.onTrack)),5);
    const f=sceneFrame('folding-track',t);
    assert.equal(f.shapes.filter(x=>/^section-\d+$/.test(x.key)).length,10);
  }
});

test('four independent benches finish at a common height with feet on the floor',()=>{
  const benches=workshopState(9.1);assert.equal(benches.length,4);
  const centres=new Set();
  for(const s of benches){
    centres.add(s.centre.join(','));
    close(Math.hypot(s.centre[0],s.centre[1]),79);
    close(s.centre[2],43);close(s.legAngle,0);
    close(s.centre[2]-3-40*Math.cos(s.legAngle),0);
  }
  assert.equal(centres.size,4);
});

test('pavilion hinges retain rigid spans and the closing brace reaches its attachment',()=>{
  for(let t=0;t<10.8;t+=.03){
    const s=pavilionState(t);
    close(length(sub(s.hingeA,[-40,0,4])),74);
    close(length(sub(s.hingeB,[35,0,4])),88);
    for(let i=0;i<4;i++)close(length(sub(s.brace[i+1],s.brace[i])),30);
  }
  const s=pavilionState(8.6);
  close(length(sub(s.brace[4],s.hingeB)),0);
  const rib=add(s.hingeA,mul([Math.cos(s.bridgeAngle),0,Math.sin(s.bridgeAngle)],Math.hypot(75,14)));
  close(length(sub(rib,s.hingeB)),0);
});

test('all scenes stay inside their viewBox with unique retained nodes and a quiet loop seam',()=>{
  for(const [id,spec] of Object.entries(SCENES)){
    close(sceneFrame(id,0).opacity,0);
    close(sceneFrame(id,spec.duration).opacity,0);
    close(sceneFrame(id,0,{still:true}).opacity,1);
    for(let t=0;t<spec.duration;t+=.08){
      const f=sceneFrame(id,t),keys=f.shapes.map(s=>s.key);
      assert.equal(new Set(keys).size,keys.length,id+' duplicate shape keys');
      assert.doesNotMatch(JSON.stringify(f),/NaN|Infinity/);
      for(const s of f.shapes){
        const points=s.tag==='path'?(s.attrs.d.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number):[s.attrs.cx,s.attrs.cy];
        for(let i=0;i<points.length;i+=2){
          assert.ok(points[i]>=12&&points[i]<=388,id+' horizontal clipping at '+t);
          assert.ok(points[i+1]>=12&&points[i+1]<=308,id+' vertical clipping at '+t);
        }
      }
    }
  }
});

function dom(){
  let allocations=0;
  class Node {
    constructor(tag){this.tag=tag;this.attrs=new Map();this.children=[];this.ownerDocument=doc;allocations++;}
    append(...nodes){for(const n of nodes)this.insertBefore(n,null);}
    replaceChildren(...nodes){for(const n of this.children)n.parent=null;this.children=[];this.append(...nodes);}
    insertBefore(n,before){if(n.parent){const old=n.parent.children;old.splice(old.indexOf(n),1);}const index=before?this.children.indexOf(before):this.children.length;this.children.splice(index,0,n);n.parent=this;}
    setAttribute(k,v){this.attrs.set(k,v);}getAttribute(k){return this.attrs.get(k);}
    removeAttribute(k){this.attrs.delete(k);}
    remove(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null;}}
  }
  const doc={createElement:tag=>new Node(tag),createElementNS:(_,tag)=>new Node(tag)};
  const host=new Node('host');host.dataset={ambitionMotion:'leap'};
  const styles=new Map([['--ambition-surface','#fff']]);
  host.closest=()=>({style:{getPropertyValue:k=>styles.get(k),setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}});
  return {host,styles,count:()=>allocations};
}

test('vector frames reuse DOM nodes and release them when destroyed',()=>{
  const {host,count}=dom(),surface=createVectorSurface(host,'leap');
  surface.draw(4.6);const before=count();
  surface.draw(5.0);assert.equal(count(),before);
  surface.destroy();assert.equal(host.children.length,0);
});

test('vector playback releases its frame callback on pause and disposal',()=>{
  const {host,styles}=dom(),callbacks=new Map();let next=0;
  const clock={requestAnimationFrame(fn){callbacks.set(++next,fn);return next;},cancelAnimationFrame(id){callbacks.delete(id);}};
  const figure=createAmbitionFigure(host,{clock,play:false});
  assert.equal(callbacks.size,0);
  figure.update({play:true});assert.equal(callbacks.size,1);
  let [id,fn]=[...callbacks][0];callbacks.delete(id);fn(100);
  [id,fn]=[...callbacks][0];callbacks.delete(id);fn(116);
  assert.equal(callbacks.size,1);
  figure.update({play:false});assert.equal(callbacks.size,0);
  figure.update({play:true});assert.equal(callbacks.size,1);
  figure.destroy();assert.equal(callbacks.size,0);
  assert.equal(styles.get('--ambition-surface'),'#fff');
  figure.update({play:true});assert.equal(callbacks.size,0);
});

