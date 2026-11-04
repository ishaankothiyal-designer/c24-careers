import HL from '../vendor/hairline-kernel.js';

// Drawing and motion adapted from the user's hairline-crate-stack.html.
/** A slow automatic conveyor builds ten layers of a ten-by-ten crate stack. */
const { Cam, fit, proj, facing, rings, prism, solid, put, mk, seg,
  clamp, lerp, spring, stepS, reducedMotion, register, pointer, disposer } = HL;
const LIMIT=1000, SIDE=10, LAYER=SIDE*SIDE, HEIGHT=7;
function mount({ stage, svg, read }, playback) {
  const bag=disposer(), C=Cam(45,0.5,1.4);
  fit(C,[[-100,-3,0],[-100,23,12],[22,-3,0],[22,23,12],...[0,95].flatMap(z=>[[24,-46,z],[138,-46,z],[24,68,z],[138,68,z]])],200,166);
  const P=proj(C), front=facing(C), root=mk('g',{},svg);
  let requested=22.4, direction=1, dwell=0, hot=-1, last='', orderKey='';
  const progress=spring(requested), crates=[];
  const base=mk('g',{},root), belt=solid(base);
  const [beltRing,beltInner]=rings(-100,-3,22,23,5,0.6);
  put(belt,prism(P,front,beltRing,beltInner,0,5));
  const slats=mk('path',{class:'nf lo'},base);
  function destination(i) {
    const cell=i%LAYER;
    return [29+(cell%SIDE)*10.6,-41+Math.floor(cell/SIDE)*10.6,Math.floor(i/LAYER)*HEIGHT];
  }
  const smooth=u=>u*u*(3-2*u);
  function location(i,p) {
    const q=p-i-1, [x,y,z]=destination(i);
    if(q>=0) return [x,y,z,true,1];
    if(q<-3) return null;
    if(q<-1) {
      const u=(q+3)/2;
      // As in Slow: ease in over the first15%, out over the last15%.
      const scale=smooth(clamp(Math.min(u,1-u)/0.15,0,1));
      return scale<0.001?null:[lerp(-92,17,u),10,5,false,scale];
    }
    // Restore the curved travel-and-land motion after the belt exit.
    const u=q+1, e=smooth(u), scale=smooth(clamp(u/0.2,0,1));
    return scale<0.001?null:[lerp(17,x,e),lerp(10,y,e),lerp(5,z,e)+Math.sin(Math.PI*u)*25,false,scale];
  }
  function draw(p) {
    const dirty=p.toFixed(6)+':'+hot;
    if(dirty===last) return;
    last=dirty;
    // Allocate only crates which can appear. The supplied reference creates
    // all 1,000 up front; this preserves its drawing without hidden SVG nodes.
    for(let i=crates.length;i<Math.min(LIMIT,Math.ceil(p)+2);i++) {
      const body=solid(root), band=mk('path',{class:'nf lo'},body.g);
      body.g.setAttribute('data-crate',String(i+1));
      crates.push({body,band,i,last:'',visible:null,lit:null});
    }
    root.setAttribute('data-progress',p.toFixed(3));
    root.setAttribute('data-mode','auto');
    const offset=((p*12)%9+9)%9, lines=[];
    for(let x=-94+offset;x<18;x+=9) lines.push(seg(P(x,0,5.05),P(x,20,5.05)));
    slats.setAttribute('d',lines.join(''));
    const order=[], moving=clamp(Math.ceil(p),1,LIMIT)-1;
    for(const cd of crates) {
      const pose=location(cd.i,p), visible=!!pose;
      if(cd.visible!==visible){cd.body.g.setAttribute('display',visible?'inline':'none');cd.visible=visible;}
      if(!pose) continue;
      const [x,y,z,landed,scale]=pose, key=[x,y,z,scale].map(v=>v.toFixed(3)).join(',');
      if(key!==cd.last) {
        const [ring,inner]=rings(x-4.3*scale,y-4.3*scale,x+4.3*scale,y+4.3*scale,scale,0.55*scale);
        put(cd.body,prism(P,front,ring,inner,z,z+HEIGHT*scale));
        const top=z+(HEIGHT+.05)*scale;
        cd.band.setAttribute('d',seg(P(x-2*scale,y-3*scale,top),P(x-2*scale,y+3*scale,top))+seg(P(x+2*scale,y-3*scale,top),P(x+2*scale,y+3*scale,top)));
        cd.last=key;
      }
      const lit=cd.i===(hot>=0?hot:moving);
      if(cd.lit!==lit){cd.body.sil.classList.toggle('hi',lit);cd.lit=lit;}
      // Complete lower layers first; within each layer paint far to near.
      order.push({g:cd.body.g,id:cd.i,depth:landed?Math.floor(cd.i/LAYER)*1000+x+y:20000+x+y});
    }
    order.sort((a,b)=>a.depth-b.depth);
    const signature=order.map(item=>item.id).join(',');
    if(signature!==orderKey){order.forEach(item=>root.append(item.g));orderKey=signature;}
    read.textContent=`${Math.floor(p)} / ${LIMIT}`;
  }
  const B=register(stage,dt=>{
    const playing=playback.play&&!reducedMotion();
    if(playing) {
      // Half a crate per second; the standard spring eases the two reversals.
      if(dwell>0) dwell=Math.max(0,dwell-dt);
      else {
        requested=clamp(requested+direction*0.5*dt,0,LIMIT);
        if(requested===LIMIT||requested===0){direction*=-1;dwell=1.8;}
      }
    }
    progress.t=requested;
    const moving=stepS(progress,dt);
    progress.x=clamp(progress.x,0,LIMIT);
    draw(progress.x);
    return playing||moving;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage,{
    move:([sx,sy])=>{
      let best=14, chosen=-1;
      // Pick resting top centres, never a moving crate's current position.
      for(let i=0;i<Math.floor(requested);i++) {
        if(i+LAYER<Math.floor(requested)) continue;
        const [x,y,z]=destination(i), [px,py]=P(x,y,z+HEIGHT);
        const d=Math.hypot(sx-px,sy-py);
        if(d<best){best=d;chosen=i;}
      }
      if(chosen!==hot){hot=chosen;B.wake();}
    },
    leave:()=>{hot=-1;B.wake();},
  }));
  draw(progress.x);
  bag.add(()=>svg.replaceChildren());
  return {
    setPlaying(play) {
      if(playback.play===play)return;
      playback.play=play;
      B.wake();
    },
    destroy:bag.dispose,
  };
}

// Adapt the supplied standalone figure to the cards' common lifecycle. Demo
// controls and page styling stay out of the product UI.
export function createCrateStack(host, options = {}) {
  const doc=host.ownerDocument;
  const root=host.getRootNode();
  HL.inject(root.nodeType===9||'host' in root?root:doc);
  host.setAttribute('data-hairline','crate-stack');
  host.setAttribute('data-hairline-theme','light');
  const svg=mk('svg',{viewBox:'0 0 400 320','aria-hidden':'true'},host);
  const playback={play:options.play===true};
  const handle=mount({stage:host,svg,read:{textContent:''}},playback);
  let destroyed=false;
  return {
    update(next={}) {
      if(destroyed)return;
      if(typeof next.play==='boolean')handle.setPlaying(next.play);
    },
    destroy() {
      if(destroyed)return;
      destroyed=true;
      handle.destroy();
      svg.remove();
      host.removeAttribute('data-hairline');
      host.removeAttribute('data-hairline-theme');
    },
  };
}
