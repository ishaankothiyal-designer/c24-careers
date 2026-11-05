import {initializeDesktopCardScroll} from './desktop-card-scroll.js';
import {performanceProfile} from './performance-profile.js';

// Recycle only fully offscreen cards, preserving their live figures and visible
// positions. Original DOM order is restored when the tablet mode ends.
export function initializeTabletCardScroll(list, {tablet,motion,isVisible,isHidden,clock=globalThis}={}) {
  if(!list)return {update(){},destroy(){}};
  const originals=[...list.children];
  const now=()=>clock.performance?.now?.()??Date.now();
  let frame=0,last=null,pointer=false,focus=false,manualUntil=0,resumeTimer=0,looping=false,disposed=false;
  const stop=()=>{if(frame)clock.cancelAnimationFrame(frame);frame=0;last=null;};
  const allowed=()=>looping&&isVisible()&&!isHidden()&&!pointer&&!focus&&now()>=manualUntil;
  const recycle=()=>{
    const edge=list.getBoundingClientRect().left;
    // At most the finite original row can have moved out during a manual swipe.
    for(let i=0;i<originals.length;i++){
      const first=list.children[0],second=list.children[1];
      if(!second||first.getBoundingClientRect().right>edge)break;
      const step=second.offsetLeft-first.offsetLeft;
      if(step<=0)break;
      list.append(first);
      list.scrollLeft-=step;
    }
  };
  const tick=time=>{
    frame=0;
    if(disposed||!allowed()){last=null;return;}
    const elapsed=last===null?0:Math.min(50,Math.max(0,time-last));last=time;
    list.scrollLeft+=elapsed*.048; // 48px per second, independent of refresh rate.
    recycle();
    frame=clock.requestAnimationFrame(tick);
  };
  const update=()=>{
    if(disposed)return;
    const mode=tablet.matches&&!motion.matches;
    if(mode&&!looping){looping=true;list.dataset.tabletLoop='true';}
    else if(!mode&&looping){
      looping=false;delete list.dataset.tabletLoop;
      clock.clearTimeout(resumeTimer);resumeTimer=0;manualUntil=0;
      list.append(...originals);list.scrollLeft=0;
    }
    if(allowed()){if(!frame)frame=clock.requestAnimationFrame(tick);}
    else stop();
  };
  const enter=()=>{pointer=true;update();};const leave=()=>{pointer=false;update();};
  const focusIn=()=>{focus=true;update();};const focusOut=e=>{focus=list.contains(e.relatedTarget);update();};
  const manual=()=>{
    if(!looping)return;
    manualUntil=now()+6000;
    clock.clearTimeout(resumeTimer);
    resumeTimer=clock.setTimeout(()=>{resumeTimer=0;update();},6000);
    update();
  };
  const events={pointerenter:enter,pointerleave:leave,focusin:focusIn,focusout:focusOut,pointerdown:manual,wheel:manual,keydown:manual};
  Object.entries(events).forEach(([type,fn])=>list.addEventListener(type,fn,{passive:true}));
  tablet.addEventListener('change',update);
  return {update,destroy(){
    disposed=true;stop();clock.clearTimeout(resumeTimer);
    if(looping){list.append(...originals);list.scrollLeft=0;}
    delete list.dataset.tabletLoop;
    tablet.removeEventListener('change',update);
    Object.entries(events).forEach(([type,fn])=>list.removeEventListener(type,fn));
  }};
}

export function initializeAmbitionStack({loadFigures = () => import('./hairline-figures.js')} = {}) {
  const cleanups=[];
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const cards=[...root.querySelectorAll('.ambition-stack__card')];
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const profile=performanceProfile();
    const stopDesktopScroll=initializeDesktopCardScroll(root,{motion});
    const tabletScroll=initializeTabletCardScroll(root.querySelector?.('.ambition-stack__list'),{
      tablet:matchMedia('(min-width:768px) and (max-width:1023px)'),motion,
      isVisible:()=>cards.some(card=>card.dataset.artVisible==='true'),isHidden:()=>document.hidden,
    });
    const figures=new Map();
    let loading,disposed=false;
    const updateArt=()=>{
      const staticArt=motion.matches||profile.constrained;
      root.dataset.artStatic=String(staticArt);
      root.dataset.artPaused=String(document.hidden);
      tabletScroll.update();
      figures.forEach((figure,card)=>figure.update({play:!staticArt&&!document.hidden&&card.dataset.artVisible==='true'}));
    };
    const prepareFigures=()=>{
      if(loading)return loading;
      loading=Promise.resolve().then(loadFigures).then(({createAmbitionFigure})=>{
        if(disposed)return;
        cards.forEach(card=>{
          const host=card.querySelector('[data-hairline-figure]');
          if(!host)return;
          const figure=createAmbitionFigure(host,{play:false});
          if(figure)figures.set(card,figure);
        });
        updateArt();
      }).catch(()=>{
        // The card copy remains readable if the illustration chunk is unavailable.
        root.dataset.artUnavailable='true';
      });
      return loading;
    };
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        entry.target.dataset.artVisible=String(entry.isIntersecting);
        if(entry.isIntersecting)entry.target.dataset.revealed='true';
      });
      updateArt();
    },{threshold:.15});
    root.dataset.revealReady='true';
    cards.forEach(card=>observer.observe(card));
    const preload=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        prepareFigures();
        preload.disconnect();
      }
    },{rootMargin:'600px 0px'});
    preload.observe(root);
    motion.addEventListener('change',updateArt);
    document.addEventListener('visibilitychange',updateArt);
    updateArt();
    cleanups.push(()=>{
      disposed=true;
      tabletScroll.destroy();
      stopDesktopScroll();
      observer.disconnect();
      preload.disconnect();
      motion.removeEventListener('change',updateArt);
      document.removeEventListener('visibilitychange',updateArt);
      figures.forEach(figure=>figure.destroy());
      delete root.dataset.stackInitialized;
      delete root.dataset.revealReady;
    });
  });
  return ()=>cleanups.forEach(cleanup=>cleanup());
}
