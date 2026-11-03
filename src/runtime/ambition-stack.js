const clamp = value => Math.max(0, Math.min(1, value));

// Each later sheet sits in front and remains narrower than earlier sheets.
export function stackScale(index, count) {
  return count < 2 ? 1 : 1 - .1 * clamp(index / (count - 1));
}

export function paperRoll(top, settledTop, viewportHeight) {
  if (viewportHeight <= settledTop) return 0;
  return clamp((top - settledTop) / (viewportHeight - settledTop));
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
      if(staticMode.matches){
        cards.forEach(card=>{card.style.removeProperty('transform');card.style.removeProperty('--paper-curl');});
        return;
      }
      if(!visible || document.hidden)return;
      // Read layout before writing transforms; no continuous animation loop.
      const geometry=items.map(item=>({top:item.getBoundingClientRect().top,settledTop:parseFloat(getComputedStyle(item).top)}));
      cards.forEach((card,i)=>{
        const roll=paperRoll(geometry[i].top,geometry[i].settledTop,innerHeight);
        card.style.transform=`translateY(${(roll*56).toFixed(2)}px) rotateX(${(-roll*24).toFixed(2)}deg) scale(${stackScale(i,cards.length).toFixed(4)})`;
        card.style.setProperty('--paper-curl',`${(roll*88).toFixed(2)}px`);
      });
    };
    const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
    new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)request();}).observe(root);
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    document.addEventListener('visibilitychange',request);
    staticMode.addEventListener('change',request);
  });
}
