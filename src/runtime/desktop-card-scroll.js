// The page keeps its native vertical scroll. A sticky scene maps its scroll
// runway to the row's horizontal offset, so both ends release naturally.
export const horizontalCardOffset = (sectionTop, pinTop, distance) =>
  Math.max(0, Math.min(Math.max(0,distance), pinTop-sectionTop));

export function initializeDesktopCardScroll(root,{motion,viewport=globalThis.window}={}) {
  const stage=root.querySelector?.('.container');
  const list=root.querySelector?.('.ambition-stack__list');
  if(!stage||!list)return ()=>{};
  const desktop=viewport.matchMedia('(min-width:1024px) and (min-height:680px)');
  let enabled=false,distance=0,pinTop=80,frame=0,disposed=false;
  const render=()=>{
    frame=0;
    if(enabled&&!disposed)list.scrollLeft=horizontalCardOffset(root.getBoundingClientRect().top,pinTop,distance);
  };
  const request=()=>{if(enabled&&!frame&&!disposed)frame=viewport.requestAnimationFrame(render);};
  const measure=()=>{
    const previous=enabled;
    distance=Math.max(0,list.scrollWidth-list.clientWidth);
    enabled=desktop.matches&&!motion.matches&&distance>0;
    if(enabled){
      root.style.setProperty('--ambition-scroll-distance',`${distance}px`);
      root.dataset.horizontalPinned='true';
      pinTop=parseFloat(viewport.getComputedStyle(stage).top)||80;
      request();
    }else{
      delete root.dataset.horizontalPinned;
      root.style.removeProperty('--ambition-scroll-distance');
      if(previous)list.scrollLeft=0;
    }
  };
  const resize=new viewport.ResizeObserver(measure);
  resize.observe(list);
  viewport.addEventListener('scroll',request,{passive:true});
  viewport.addEventListener('resize',measure,{passive:true});
  desktop.addEventListener('change',measure);
  motion.addEventListener('change',measure);
  measure();
  return ()=>{
    disposed=true;viewport.cancelAnimationFrame(frame);resize.disconnect();
    viewport.removeEventListener('scroll',request);viewport.removeEventListener('resize',measure);
    desktop.removeEventListener('change',measure);motion.removeEventListener('change',measure);
    delete root.dataset.horizontalPinned;root.style.removeProperty('--ambition-scroll-distance');
  };
}
