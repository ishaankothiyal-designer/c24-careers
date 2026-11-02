export function stackScale(current,next) {
  if(!next || !current.height)return 1;
  const overlap=Math.max(0,Math.min(1,1-(next.top-current.top)/current.height));
  return 1-overlap*.05;
}

export function initializeAmbitionStack() {
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const items=[...root.querySelectorAll('.ambition-stack__item')];
    const cards=items.map(item=>item.querySelector('.ambition-stack__card'));
    const staticMode=matchMedia('(prefers-reduced-motion: reduce), (max-height:650px)');
    let visible=false,frame=0;
    const update=()=>{
      frame=0;
      if(staticMode.matches){cards.forEach(card=>card.style.removeProperty('transform'));return;}
      if(!visible || document.hidden)return;
      const rects=items.map(item=>item.getBoundingClientRect());
      cards.forEach((card,i)=>{const scale=stackScale(rects[i],rects[i+1]);card.style.transform=`scale(${scale.toFixed(4)})`;});
    };
    const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
    new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)request();}).observe(root);
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    document.addEventListener('visibilitychange',request);
    staticMode.addEventListener('change',request);
  });
}
