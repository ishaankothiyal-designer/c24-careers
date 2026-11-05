import {performanceProfile} from './performance-profile.js';

// Native scrolling retains touch/keyboard access and never hijacks page scroll.
export function initializeTabletCardScroll(list, {tablet,motion,isVisible,isHidden,clock=globalThis}={}) {
  if(!list)return {update(){},destroy(){}};
  let timer=0,pointer=false,focus=false,manualUntil=0;
  const stop=()=>{if(timer)clock.clearInterval(timer);timer=0;};
  const advance=()=>{
    if(pointer||focus||Date.now()<manualUntil)return;
    const max=list.scrollWidth-list.clientWidth;
    if(max<=0)return;
    const step=list.children[1]?.offsetLeft-list.children[0]?.offsetLeft||list.clientWidth;
    list.scrollTo({left:list.scrollLeft>=max-2?0:Math.min(max,list.scrollLeft+step),behavior:'smooth'});
  };
  const update=()=>{
    if(tablet.matches&&!motion.matches&&isVisible()&&!isHidden()){
      if(!timer)timer=clock.setInterval(advance,2800);
    }else stop();
  };
  const enter=()=>{pointer=true;};const leave=()=>{pointer=false;};
  const focusIn=()=>{focus=true;};const focusOut=e=>{focus=list.contains(e.relatedTarget);};
  const manual=()=>{manualUntil=Date.now()+6000;};
  const events={pointerenter:enter,pointerleave:leave,focusin:focusIn,focusout:focusOut,pointerdown:manual,wheel:manual,keydown:manual};
  Object.entries(events).forEach(([type,fn])=>list.addEventListener(type,fn,{passive:true}));
  tablet.addEventListener('change',update);
  return {update,destroy(){stop();tablet.removeEventListener('change',update);Object.entries(events).forEach(([type,fn])=>list.removeEventListener(type,fn));}};
}

export function initializeAmbitionStack({loadFigures = () => import('./hairline-figures.js')} = {}) {
  const cleanups=[];
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const cards=[...root.querySelectorAll('.ambition-stack__card')];
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const profile=performanceProfile();
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
