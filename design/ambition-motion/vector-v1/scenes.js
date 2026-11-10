// Hand-authored geometry and timelines. No inferred frames or shape morphs.
// World axes are x/y on the bench, z up. All cameras remain fixed.
export const SCENES={
  leap:{duration:7.8,still:5.2},
  collaborator:{duration:9.8,still:7.9},
  'folding-track':{duration:8.8,still:6.7},
  workshops:{duration:11.6,still:9.1},
  pavilion:{duration:10.8,still:8.6},
};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,t)=>a+(b-a)*t;
export const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const phase=(t,a,b)=>ease((t-a)/(b-a));
export const add=(a,b)=>a.map((n,i)=>n+b[i]);
export const sub=(a,b)=>a.map((n,i)=>n-b[i]);
export const mul=(a,s)=>a.map(n=>n*s);
export const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
export const length=a=>Math.hypot(...a);
export const unit=a=>mul(a,1/(length(a)||1));
export const lerpPoint=(a,b,t)=>a.map((n,i)=>mix(n,b[i],t));
export const rotateY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
const tau=Math.PI*2;

// Exact two-link IK: both links retain their length and the wrist stays on
// its tool. Projecting the bend hint makes it perpendicular to the target.
export function armJoint(base,wrist,a,b,hint=[0,0,1]){
  const u=unit(sub(wrist,base)),d=clamp(length(sub(wrist,base)),.001,a+b-.001);
  const along=(a*a-b*b+d*d)/(2*d);
  const bend=unit(sub(hint,mul(u,dot(hint,u))));
  return add(add(base,mul(u,along)),mul(bend,Math.sqrt(Math.max(0,a*a-along*along))));
}

export function leapState(t){
  const flight=clamp((t-1.35)/1.9),deployment=phase(t,1.85,3.04);
  const land=clamp((t-3.25)/.8);
  const tilt=t<1.35?-.09*Math.sin(phase(t,.65,1.35)*Math.PI):t>3.25?.055*Math.sin(land*Math.PI*2)*Math.pow(1-land,2):-.12*Math.sin(flight*Math.PI);
  return {
    cube:[mix(-81,76,flight),0,4*flight*(1-flight)*67+12*Math.abs(Math.sin(tilt))],
    tilt,
    landing:mix(-81,76,deployment),deployment,
  };
}

export function collaboratorState(t){
  const rise=phase(t,2.0,3.2),dip=phase(t,6.8,7.2)-phase(t,7.2,7.6);
  const base=[64,24,.3],wrist=[25,-49,.3+39*rise-3*dip];
  const elbow=armJoint(base,wrist,50,47,[mix(1,0,rise),0,rise]);
  return {base,wrist,elbow,drawArm:phase(t,.55,1.7),rise,drawArch:phase(t,3.6,5.9)};
}

export function trackState(t){
  const travel=phase(t,1.05,6.0),fold=phase(t,1.5,5.1);
  const angle=mix(.19,.96,fold),span=250*Math.cos(angle),joints=[[-span/2,0,0]],angles=[];
  for(let i=0;i<10;i++){
    const a=(i%2?-1:1)*angle;angles.push(a);
    joints.push(add(joints[i],[25*Math.cos(a),0,25*Math.sin(a)]));
  }
  const distance=.5+9*travel,index=Math.min(9,Math.floor(distance)),fraction=distance-index;
  const onTrack=lerpPoint(joints[index],joints[index+1],fraction);
  // A small rounded transition at a hinge keeps the ball's centre continuous.
  let normal=[-Math.sin(angles[index]),0,Math.cos(angles[index])];
  if(fraction>.8&&index<9)normal=unit(lerpPoint(normal,[-Math.sin(angles[index+1]),0,Math.cos(angles[index+1])],phase(fraction,.8,1)*.5));
  if(fraction<.2&&index>0)normal=unit(lerpPoint([-Math.sin(angles[index-1]),0,Math.cos(angles[index-1])],normal,.5+phase(fraction,0,.2)*.5));
  return {joints,angles,distance,index,fraction,onTrack,ball:add(onTrack,mul(normal,5)),travel};
}

export function workshopState(t){
  return [[-1,0],[0,-1],[1,0],[0,1]].map(([dx,dy],i)=>{
    const extend=phase(t,.6+i*.18,2.5+i*.18),legs=phase(t,2.7+i*.14,3.8+i*.14);
    return {centre:[dx*mix(0,79,extend),dy*mix(0,79,extend),mix(52-i*11,43,extend)],extend,legAngle:(1-legs)*Math.PI/2,build:phase(t,4.2+i*.24,6.9+i*.24)};
  });
}

export function pavilionState(t){
  const a=phase(t,.65,2.05)*Math.PI/2,b=phase(t,2.3,3.75)*Math.PI/2;
  const hingeA=[-40+74*Math.cos(a),0,4+74*Math.sin(a)];
  const hingeB=[35-88*Math.cos(b),0,4+88*Math.sin(b)];
  const bridgeAngle=mix(a-Math.PI,Math.atan2(14,75),phase(t,4.05,5.35));
  const roofAngle=mix(-b,.07,phase(t,5.65,6.8));
  const lock=phase(t,7.05,8.05),braceStart=[-40,0,4];
  const end=lerpPoint([-32,0,4],[35,0,92],lock),u=unit(sub(end,braceStart));
  const cos=length(sub(end,braceStart))/120,sin=Math.sqrt(1-cos*cos),brace=[braceStart];
  for(let i=0;i<4;i++)brace.push(add(brace[i],add(mul(u,30*cos),[0,(i%2?-1:1)*30*sin,0])));
  return {a,b,hingeA,hingeB,bridgeAngle,roofAngle,brace,lock};
}

const number=n=>Number(n.toFixed(3));
const project=(s=1,cy=194)=>([x,y,z])=>[200+(x-y)*.8660254*s,cy+((x+y)*.5-z)*s];
const path=(points,closed=false)=>points.map((p,i)=>(i?'L':'M')+p.map(number).join(' ')).join('')+(closed?'Z':'');
const circlePoints=(centre,r,normal='xy',n=32)=>Array.from({length:n},(_,i)=>{
  const a=tau*i/n;
  return add(centre,normal==='xz'?[r*Math.cos(a),0,r*Math.sin(a)]:[r*Math.cos(a),r*Math.sin(a),0]);
});
function drawer(P){
  const shapes=[];
  return {
    shapes,
    line(key,points,kind='wire',opacity=1){shapes.push({key,tag:'path',attrs:{d:path(points.map(P)),class:'av-'+kind,opacity:number(opacity)}});},
    face(key,points,kind='face',opacity=1){shapes.push({key,tag:'path',attrs:{d:path(points.map(P),true),class:'av-'+kind,opacity:number(opacity)}});},
    dot(key,point,r=2,kind='joint',opacity=1){const [cx,cy]=P(point);shapes.push({key,tag:'circle',attrs:{cx:number(cx),cy:number(cy),r,class:'av-'+kind,opacity:number(opacity)}});},
    ring(key,point,r=3,kind='wire',normal='xy'){this.face(key,circlePoints(point,r,normal),kind);},
    box(key,x,y,z,w,d,h,kind='face',transform=p=>p){
      const p=(a,b,c)=>transform([x+a*w,y+b*d,z+c*h]);
      const faces=[
        ['x0',[p(0,0,0),p(0,0,1),p(0,1,1),p(0,1,0)]],
        ['x1',[p(1,0,0),p(1,1,0),p(1,1,1),p(1,0,1)]],
        ['y0',[p(0,0,0),p(1,0,0),p(1,0,1),p(0,0,1)]],
        ['y1',[p(0,1,0),p(0,1,1),p(1,1,1),p(1,1,0)]],
        ['z0',[p(0,0,0),p(0,1,0),p(1,1,0),p(1,0,0)]],
        ['z1',[p(0,0,1),p(1,0,1),p(1,1,1),p(0,1,1)]],
      ].filter(([,q])=>{
        const a=sub(q[1],q[0]),b=sub(q[2],q[0]);
        const normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
        return normal.reduce((n,v)=>n+v,0)>.00001;
      }).sort((a,b)=>a[1].flat().reduce((n,v)=>n+v,0)-b[1].flat().reduce((n,v)=>n+v,0));
      for(const [name,q] of faces)this.face(key+'-'+name,q,kind==='accent-face'?kind:name[0]==='x'?'shade':kind);
    },
  };
}

function partial(points,p){
  const lengths=points.slice(1).map((q,i)=>length(sub(q,points[i]))),total=lengths.reduce((a,b)=>a+b,0);
  let remaining=clamp(p)*total;const out=[points[0]];
  for(let i=0;i<lengths.length;i++){
    if(remaining>=lengths[i]){out.push(points[i+1]);remaining-=lengths[i];}
    else {out.push(lerpPoint(points[i],points[i+1],remaining/(lengths[i]||1)));break;}
  }
  return out;
}

function drawLeap(t){
  const state=leapState(t),d=drawer(project(1.15,159));
  for(let i=0;i<3;i++){
    const y=(i-1)*18;
    // Three nested rigid bars slide out of a housing beneath the first ledge.
    for(let j=0;j<3;j++){
      const start=mix(-92,-52+j*32,state.deployment);
      d.box('rib-'+i+'-'+j,start,y-2,-13,38,4,3,'face');
    }
    d.dot('rib-pin-'+i,[-52,y,-10],1.5,'joint');
  }
  d.box('landing',state.landing-27,-26,-12,54,52,12);
  d.box('support',-123,-26,-60,8,52,48);
  d.box('ledge',-123,-26,-12,71,52,12);
  d.line('ledge-seam',[[-113,-18,.15],[-59,-18,.15]],'guide');
  const cube=p=>add(rotateY(p,state.tilt),state.cube);
  d.box('cube',-12,-12,0,24,24,24,'accent-face',cube);
  d.line('landing-lip',[[49,26,.3],[103,26,.3]],'accent',phase(t,3.25,3.65));
  return {shapes:d.shapes,state};
}

function pencil(d,tip){
  const axis=[14,-10,59],side=[3,-3,0];
  const nose=add(tip,mul(axis,.14)),end=add(tip,axis),cap=add(tip,mul(axis,.91));
  d.face('pencil-body',[add(nose,side),add(end,side),sub(end,side),sub(nose,side)],'accent-solid');
  d.face('pencil-side',[sub(nose,side),sub(end,side),add(sub(end,side),[0,-2,1]),add(sub(nose,side),[0,-2,1])],'shade');
  d.face('pencil-point',[tip,sub(nose,side),add(nose,side)],'face');
  d.face('pencil-cap',[add(cap,side),add(end,side),sub(end,side),sub(cap,side)],'face');
  d.dot('pencil-tip',tip,.85,'ink');
}

function drawCollaborator(t){
  const s=collaboratorState(t),d=drawer(project(1.06,172));
  d.box('paper',-98,-65,-3,196,125,3);
  d.line('paper-fold',[[-89,51,.1],[87,51,.1]],'guide');
  const arc=Array.from({length:49},(_,i)=>{const a=Math.PI-Math.PI*i/48;return [40*Math.cos(a),10-35*Math.sin(a),.3];});
  const arch=[[-40,29,.3],...arc,[40,29,.3]];
  d.line('arch-guide',arch,'guide',.55);
  d.line('arch-baseline',[[-49,29,.1],[49,29,.1]],'guide',.5);
  const rulerZ=s.wrist[2];
  d.box('ruler',-73,-53,rulerZ,108,9,2);
  for(let i=0;i<18;i++)d.line('ruler-tick-'+i,[[-68+i*5.6,-44,rulerZ+2.1],[-68+i*5.6,-(i%3?48:51),rulerZ+2.1]],'fine');
  const arm=[s.base,s.elbow,s.wrist];
  const seed=collaboratorState(0),seedLine=[seed.base,seed.elbow,seed.wrist];
  d.line('arm-trace',partial(s.rise>0?arm:seedLine,s.drawArm),'wire');
  for(const [i,p] of arm.entries())d.dot('arm-joint-'+i,p,i===0?3:2.6,'joint',s.drawArm>(i/3)?1:0);
  d.line('arch-drawn',partial(arch,s.drawArch),'accent');
  // A small drawn keystone completes the arch; it remains on the paper plane.
  const key=phase(t,6.3,6.9);
  const keyPath=[[-5,-24,.3],[5,-24,.3],[3,-17,.3],[-3,-17,.3],[-5,-24,.3]];
  d.line('arch-key',partial(keyPath,key),'wire');
  let tip;
  if(t<1.7)tip=partial(seedLine,s.drawArm).at(-1);
  else if(t<3.6)tip=lerpPoint(seedLine.at(-1),arch[0],phase(t,1.7,2.2)).map((n,i)=>n+(i===2?14*Math.sin(phase(t,1.7,3.6)*Math.PI):0));
  else if(t<5.9)tip=partial(arch,s.drawArch).at(-1);
  else if(t<6.3){const p=phase(t,5.9,6.3);tip=add(lerpPoint(arch.at(-1),keyPath[0],p),[0,0,12*Math.sin(p*Math.PI)]);}
  else if(t<6.9)tip=partial(keyPath,key).at(-1);
  else{const p=phase(t,6.9,7.6);tip=add(lerpPoint(keyPath.at(-1),[52,30,12],p),[0,0,10*Math.sin(p*Math.PI)]);}
  pencil(d,tip);
  return {shapes:d.shapes,state:s};
}

function drawTrack(t){
  const s=trackState(t),camera=project(1.2,160),azimuth=-Math.PI/9;
  // Turn the mechanism on the bench, not the camera. Both sides of every
  // pleat remain readable rather than concealing alternate stations.
  const d=drawer(([u,v,z])=>camera([u*Math.cos(azimuth)-v*Math.sin(azimuth),u*Math.sin(azimuth)+v*Math.cos(azimuth),z]));
  d.line('track-reference',[[-128,0,-10],[128,0,-10]],'guide',.35);
  for(let i=0;i<10;i++){
    const a=s.joints[i],b=s.joints[i+1];
    const corners=[add(a,[0,-18,0]),add(b,[0,-18,0]),add(b,[0,18,0]),add(a,[0,18,0])];
    d.face('section-'+i,corners);
    const centre=lerpPoint(a,b,.5),angle=s.angles[i];
    const pip=Array.from({length:24},(_,j)=>{const theta=j*tau/24;return add(centre,[3.4*Math.cos(theta)*Math.cos(angle),3.4*Math.sin(theta),3.4*Math.cos(theta)*Math.sin(angle)+.12]);});
    d.face('pip-'+i,pip,s.distance>=i+.5?'accent-solid':'face');
    d.dot('hinge-'+i,add(a,[0,18,0]),1.6,'joint');
  }
  d.dot('hinge-10',add(s.joints[10],[0,18,0]),1.6,'joint');
  d.dot('bead',s.ball,5.1,'accent-solid');
  d.dot('bead-glint',add(s.ball,[-1,-1,2]),.8,'glint');
  return {shapes:d.shapes,state:s};
}

function archStones(d,origin,progress){
  const n=5;
  for(let i=0;i<n;i++){
    const a=Math.PI-i*Math.PI/n,b=Math.PI-(i+1)*Math.PI/n;
    const local=[[15*Math.cos(a),4,15*Math.sin(a)],[15*Math.cos(b),4,15*Math.sin(b)],[9*Math.cos(b),4,9*Math.sin(b)],[9*Math.cos(a),4,9*Math.sin(a)]];
    const centre=local.reduce((v,p)=>add(v,mul(p,.25)),[0,0,0]);
    const move=phase(progress,i*.12,i*.12+.38);
    const stack=[-9+i*4,7,centre[2]-Math.min(...local.map(p=>p[2]))+i*.8];
    const shift=mul(sub(stack,centre),1-move);
    shift[2]+=7*Math.sin(move*Math.PI);
    const face=local.map(p=>add(origin,add(p,shift)));
    d.face('arch-stone-top-'+i,[face[0],add(face[0],[0,-7,0]),add(face[1],[0,-7,0]),face[1]],'shade');
    d.face('arch-stone-'+i,face);
  }
}

function benchBuild(d,origin,index,p){
  if(index===0){archStones(d,origin,p);return;}
  if(index===1){
    for(let j=0;j<3;j++){
      const q=phase(p,j*.18,j*.18+.5);
      const width=24-j*8;
      const start=[-width/2,3,j*5],end=[-12+j*8,-6,j*5];
      const at=add(origin,add(lerpPoint(start,end,q),[0,0,7*Math.sin(q*Math.PI)]));
      d.box('stair-'+j,...at,width,12,5);
    }
    return;
  }
  if(index===2){
    for(let j=0;j<3;j++){
      const q=phase(p,j*.2,j*.2+.5),a=q*Math.PI/2;
      const originPart=add(origin,[j===0?-11:j===1?8:-14,0,j===2?18*q+6*Math.sin(q*Math.PI):0]);
      const transform=v=>add(originPart,j===2?v:rotateY([v[0]*(j===1?-1:1),v[1],v[2]],j===1?a:-a));
      d.box('frame-part-'+j,0,-3,0,j===2?25:18,4,3,'face',transform);
    }
    return;
  }
  const q=phase(p,.15,.9),a=q*Math.PI/2;
  d.box('wheel-foot',origin[0]-10,origin[1]-5,origin[2],20,10,3);
  const centre=add(origin,[0,0,3+10*q]);
  const wheelPoint=(angle,r)=>add(centre,[r*Math.cos(angle),r*Math.sin(angle)*Math.cos(a),r*Math.sin(angle)*Math.sin(a)]);
  d.line('wheel-stand',[add(origin,[0,0,3]),centre],'wire');
  d.face('wheel-rim',Array.from({length:40},(_,j)=>wheelPoint(j*tau/40,10)),'wire');
  const rotation=Math.max(0,p-.75)*1.2;
  for(let j=0;j<5;j++)d.line('wheel-spoke-'+j,[centre,wheelPoint(j*tau/5+rotation,10)],'fine');
  d.dot('wheel-pin',centre,1.6,'accent-face');
}

function drawWorkshops(t){
  const state=workshopState(t),d=drawer(project(1.5,196));
  const drawBench=i=>{
    const s=state[i],o=s.centre;
    // A pair of equal links folds under each corner, with fixed pins and feet.
    for(let j=0;j<4;j++){
      const x=j%2?14:-14,y=j<2?-11:11,root=add(o,[x,y,-3]);
      const knee=add(root,[-Math.sign(x)*20*Math.sin(s.legAngle),0,-20*Math.cos(s.legAngle)]);
      const foot=add(knee,[Math.sign(x)*20*Math.sin(s.legAngle),0,-20*Math.cos(s.legAngle)]);
      d.line('leg-'+i+'-'+j,[root,knee,foot]);
      d.dot('knee-'+i+'-'+j,knee,1.15,'joint');
    }
    d.box('bench-'+i,o[0]-18,o[1]-15,o[2]-3,36,30,3);
    // Thin rails keep the drawer identity as it becomes a workbench.
    d.line('bench-rim-'+i,[add(o,[-18,-15,1]),add(o,[18,-15,1]),add(o,[18,15,1])],'fine');
    const before=d.shapes.length;
    benchBuild(d,o,i,s.build);
    // Give every miniature its own stable identity in the retained SVG tree.
    for(let j=before;j<d.shapes.length;j++)d.shapes[j].key='build-'+i+'-'+d.shapes[j].key;
  };
  drawBench(0);drawBench(1);
  for(const i of [2,3])if(state[i].extend<.65)drawBench(i);
  d.box('cabinet',-22,-22,0,44,44,66);
  d.face('cabinet-front',[[-19,22.1,4],[19,22.1,4],[19,22.1,62],[-19,22.1,62]],'shade');
  for(let j=0;j<4;j++){
    const z=10+j*14;
    d.line('drawer-line-'+j,[[-19,22.2,z],[19,22.2,z]],'fine');
    d.line('drawer-handle-'+j,[[-5,22.5,z+6],[5,22.5,z+6]],'wire',1-state[3-j].extend*.7);
  }
  d.line('cabinet-seam',[[-16,-16,66.1],[16,-16,66.1]],'guide');
  for(const i of [2,3])if(state[i].extend>=.65)drawBench(i);
  return {shapes:d.shapes,state};
}

function drawPavilion(t){
  const s=pavilionState(t),d=drawer(project(1.38,197));
  d.box('foundation',-65,-44,-5,130,88,9);
  d.line('foundation-inset',[[-57,-36,4.1],[57,-36,4.1],[57,36,4.1]],'guide',.5);
  const portal=(key,x,h,w,a,direction)=>{
    const transform=p=>add(rotateY([p[0]*direction,p[1],p[2]],-a*direction),[x,0,4]);
    d.box(key+'-left',0,-w/2,0,h,4,3,'face',transform);
    d.box(key+'-right',0,w/2-4,0,h,4,3,'face',transform);
    d.box(key+'-lintel',h-4,-w/2,0,4,w,3,'face',transform);
    d.dot(key+'-pivot', [x,w/2-2,4],2,'joint');
  };
  portal('inner',-40,74,48,s.a,1);
  portal('outer',35,88,68,s.b,-1);
  const span=Math.hypot(75,14);
  for(let i=0;i<2;i++){
    const root=add(s.hingeA,[0,i===0?-22:22,0]);
    const transform=p=>add(rotateY(p,-s.bridgeAngle),root);
    d.box('bridge-'+i,0,-1.5,0,span,3,3,'face',transform);
    d.dot('bridge-pin-'+i,root,1.5,'joint');
  }
  const roof=p=>add(rotateY(p,-s.roofAngle),s.hingeB);
  d.box('canopy',0,-36,0,46,72,2,'face',roof);
  d.line('canopy-edge',[roof([45,-34,2.1]),roof([45,34,2.1])],'fine');
  d.line('lock-brace',s.brace,'wire');
  s.brace.forEach((p,i)=>d.dot('lock-hinge-'+i,p,1.7,i===4&&s.lock>.95?'accent-face':'joint'));
  return {shapes:d.shapes,state:s};
}

const renderers={leap:drawLeap,collaborator:drawCollaborator,'folding-track':drawTrack,workshops:drawWorkshops,pavilion:drawPavilion};
export function sceneFrame(id,time,{still=false}={}){
  const spec=SCENES[id];if(!spec)throw new Error('Unknown ambition scene: '+id);
  const t=still?spec.still:((time%spec.duration)+spec.duration)%spec.duration;
  const frame=renderers[id](t);
  frame.opacity=still?1:Math.min(phase(t,0,.38),1-phase(t,spec.duration-.65,spec.duration));
  return frame;
}

export const VECTOR_STYLES=`.ambition-vector{fill:none;stroke:var(--hairline-edge);stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.ambition-vector path,.ambition-vector circle{vector-effect:non-scaling-stroke}
.ambition-vector .av-face{fill:var(--av-object-fill,var(--ambition-surface))}
.ambition-vector .av-shade{fill:var(--av-shadow-fill,color-mix(in srgb,var(--hairline-edge) 7%,var(--ambition-surface)))}
.ambition-vector[data-scene="workshops"]{--av-object-fill:color-mix(in srgb,var(--white,#fff) 72%,var(--ambition-surface));--av-shadow-fill:color-mix(in srgb,var(--hairline-edge) 10%,var(--av-object-fill))}
.ambition-vector .av-wire{fill:none}
.ambition-vector .av-accent{fill:none;stroke:var(--hairline-hi)}
.ambition-vector .av-accent-face{fill:color-mix(in srgb,var(--hairline-hi) 9%,var(--ambition-surface));stroke:var(--hairline-hi)}
.ambition-vector .av-accent-solid{fill:var(--hairline-hi);stroke:var(--hairline-edge)}
.ambition-vector .av-guide{fill:none;stroke:var(--hairline-mid);stroke-width:.75;stroke-dasharray:2 4}
.ambition-vector .av-fine{fill:none;stroke:var(--hairline-mid);stroke-width:.8}
.ambition-vector .av-joint{fill:var(--ambition-surface);stroke-width:.95}
.ambition-vector .av-ink{fill:var(--hairline-edge);stroke:none}
.ambition-vector .av-glint{fill:var(--ambition-surface);stroke:none}`;
