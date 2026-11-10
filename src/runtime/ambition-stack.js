import {performanceProfile} from './performance-profile.js';

// Optional browser hints, not a bandwidth probe. Unknown connections may play;
// the poster remains available if a movie cannot load or playback is blocked.
export function shouldPauseAmbitionForNetwork(nav = navigator) {
  const connection=nav.connection;
  return nav.onLine===false || !!connection?.saveData ||
    /^(slow-2g|2g|3g)$/.test(connection?.effectiveType||'') ||
    (Number.isFinite(connection?.downlink)&&connection.downlink<1.5);
}

// Recycle only fully offscreen cards, preserving their live figures and visible
// positions. Original DOM order is restored when the tablet mode ends.
export function initializeTabletCardScroll(list, {tablet,motion,isVisible,isHidden,clock=globalThis}={}) {
  if(!list)return {update(){},destroy(){}};
  const originals=[...list.children];
  const now=()=>clock.performance?.now?.()??Date.now();
  let frame=0,last=null,pointer=false,focus=false,manualUntil=0,resumeTimer=0,looping=false,disposed=false;
  const stop=()=>{if(frame)clock.cancelAnimationFrame(frame);frame=0;last=null;};
  const allowed=()=>looping&&isVisible()&&!isHidden()&&!focus&&now()>=manualUntil;
  const recycle=()=>{
    const edge=list.getBoundingClientRect().left;
    // At most the finite original row can have moved out during a manual swipe.
    for(let i=0;i<originals.length;i++){
      const first=list.children[0],second=list.children[1];
      if(!second)break;
      const firstRect=first.getBoundingClientRect();
      if(firstRect.right>edge)break;
      const step=second.getBoundingClientRect().left-firstRect.left;
      if(!Number.isFinite(step)||step<=0)break;
      list.append(first);
      list.scrollLeft-=step;
    }
  };
  const tick=time=>{
    frame=0;
    if(disposed||!allowed()){last=null;return;}
    const elapsed=last===null?0:Math.min(50,Math.max(0,time-last));last=time;
    list.scrollLeft+=elapsed*(pointer ? 0.018 : 0.048); // Hover slows to 18px/s; normal playback is 48px/s.
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

// Manual navigation never consumes vertical scrolling or advances on its own.
export function initializeAmbitionCarousel(root,{motion}={}) {
  const list=root.querySelector?.('.ambition-stack__list');
  const previous=root.querySelector?.('[data-ambition-previous]');
  const next=root.querySelector?.('[data-ambition-next]');
  if(!list||!previous||!next)return ()=>{};
  const update=()=>{
    previous.disabled=list.scrollLeft<=1;
    next.disabled=list.scrollLeft>=list.scrollWidth-list.clientWidth-1;
  };
  const move=direction=>{
    const items=[...list.children];
    const start=items[0].offsetLeft;
    const positions=items.map(item=>item.offsetLeft-start);
    const target=direction>0
      ? positions.find(position=>position>list.scrollLeft+2)??list.scrollWidth
      : positions.filter(position=>position<list.scrollLeft-2).at(-1)??0;
    list.scrollTo({left:target,behavior:motion.matches?'instant':'smooth'});
  };
  const back=()=>move(-1),forward=()=>move(1);
  const keyboard=event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();move(event.key==='ArrowLeft'?-1:1);
    }
  };
  previous.addEventListener('click',back);next.addEventListener('click',forward);
  list.addEventListener('scroll',update,{passive:true});list.addEventListener('keydown',keyboard);
  const resize=new ResizeObserver(update);resize.observe(list);
  update();
  return ()=>{
    resize.disconnect();previous.removeEventListener('click',back);next.removeEventListener('click',forward);
    list.removeEventListener('scroll',update);list.removeEventListener('keydown',keyboard);
  };
}

export function initializeAmbitionStack({loadFigures = version => version==='original'
  ? import('./hairline-figures.js') : version==='generated'
    ? import('./ambition-motion.js') : import('./ambition-vector.js')} = {}) {
  const cleanups=[];
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const cards=[...root.querySelectorAll('.ambition-stack__card')];
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    const requested=new URLSearchParams(globalThis.location?.search||'').get('ambition-art');
    const version=requested==='original'?'original':requested==='refined'?'refined':'generated';
    root.dataset.illustrationVersion=version;
    if(version==='original')cards.forEach(card=>{
      const host=card.querySelector('[data-hairline-figure]');
      if(host?.dataset.originalLabel)host.setAttribute('aria-label',host.dataset.originalLabel);
    });
    const stopCarousel=initializeAmbitionCarousel(root,{motion});
    const figures=new Map();
    let loading,disposed=false;
    const updateArt=()=>{
      const staticArt=motion.matches||performanceProfile().constrained||shouldPauseAmbitionForNetwork();
      root.dataset.artStatic=String(staticArt);
      root.dataset.artPaused=String(document.hidden);
      figures.forEach((figure,card)=>figure.update({play:!staticArt&&!document.hidden&&card.dataset.artVisible==='true'}));
    };
    const prepareFigures=()=>{
      if(loading)return loading;
      loading=Promise.resolve().then(()=>loadFigures(version)).then(({createAmbitionFigure})=>{
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
    connection?.addEventListener?.('change',updateArt);
    globalThis.addEventListener?.('online',updateArt);
    globalThis.addEventListener?.('offline',updateArt);
    updateArt();
    cleanups.push(()=>{
      disposed=true;
      stopCarousel();
      observer.disconnect();
      preload.disconnect();
      motion.removeEventListener('change',updateArt);
      document.removeEventListener('visibilitychange',updateArt);
      connection?.removeEventListener?.('change',updateArt);
      globalThis.removeEventListener?.('online',updateArt);
      globalThis.removeEventListener?.('offline',updateArt);
      figures.forEach(figure=>figure.destroy());
      delete root.dataset.stackInitialized;
      delete root.dataset.revealReady;
    });
  });
  return ()=>cleanups.forEach(cleanup=>cleanup());
}
