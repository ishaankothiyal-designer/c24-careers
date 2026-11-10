import assets from '../ambition-motion-assets.json' with {type:'json'};
import {SCENES,sceneFrame,VECTOR_STYLES,clamp} from './ambition-vector-scenes.js';

const ns='http://www.w3.org/2000/svg';
const surfaces=new Map(assets.map(asset=>[asset.id,asset.background]));

// Retain SVG nodes across frames: only changed attributes are written. The
// scene functions are also used by the slow-motion and keyframe review page.
export function createVectorSurface(host,id){
  const doc=host.ownerDocument,svg=doc.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 400 320');
  svg.setAttribute('class','ambition-vector');
  svg.setAttribute('data-scene',id);
  svg.setAttribute('aria-hidden','true');
  const style=doc.createElementNS(ns,'style');style.textContent=VECTOR_STYLES;
  const group=doc.createElementNS(ns,'g');svg.append(style,group);host.append(svg);
  const nodes=new Map();
  return {svg,draw(time,options){
    const frame=sceneFrame(id,time,options),active=new Set();
    group.setAttribute('opacity',String(frame.opacity));
    frame.shapes.forEach(({key,tag,attrs},index)=>{
      let entry=nodes.get(key);
      if(!entry){entry={node:doc.createElementNS(ns,tag),attrs:{}};nodes.set(key,entry);}
      const {node}=entry;active.add(key);
      if(node.getAttribute('display')==='none')node.removeAttribute('display');
      for(const [name,value] of Object.entries(attrs)){
        if(entry.attrs[name]!==value){node.setAttribute(name,String(value));entry.attrs[name]=value;}
      }
      const current=group.children[index];
      if(current!==node)group.insertBefore(node,current||null);
    });
    nodes.forEach(({node},key)=>{if(!active.has(key))node.setAttribute('display','none');});
    return frame;
  },destroy(){nodes.clear();svg.remove();}};
}

export function createAmbitionFigure(host,options={}){
  const id=host.dataset.ambitionMotion;if(!SCENES[id])return null;
  const doc=host.ownerDocument,wrap=doc.createElement('div');
  wrap.className='ambition-motion ambition-motion--vector';host.replaceChildren(wrap);
  const surface=createVectorSurface(wrap,id);
  const card=host.closest('.ambition-stack__card');
  const previous=card?.style.getPropertyValue('--ambition-surface');
  card?.style.setProperty('--ambition-surface',surfaces.get(id));
  const clock=options.clock||globalThis;
  const speed=clamp(Number(options.speed??new URLSearchParams(globalThis.location?.search||'').get('ambition-speed'))||1,.1,2);
  let running=false,disposed=false,frame=0,last=null,elapsed=0;
  const tick=now=>{
    frame=0;if(!running||disposed)return;
    if(last!==null)elapsed+=Math.min(.05,Math.max(0,(now-last)/1000))*speed;
    last=now;surface.draw(elapsed);
    frame=clock.requestAnimationFrame(tick);
  };
  const update=({play=false}={})=>{
    if(disposed)return;
    if(play){if(!running){running=true;last=null;frame=clock.requestAnimationFrame(tick);}}
    else{
      running=false;last=null;
      if(frame)clock.cancelAnimationFrame(frame);frame=0;
      surface.draw(0,{still:true});
    }
  };
  surface.draw(0,{still:true});update(options);
  return {update,destroy(){
    if(disposed)return;disposed=true;running=false;
    if(frame)clock.cancelAnimationFrame(frame);
    surface.destroy();wrap.remove();
    if(previous)card?.style.setProperty('--ambition-surface',previous);
    else card?.style.removeProperty('--ambition-surface');
  }};
}
