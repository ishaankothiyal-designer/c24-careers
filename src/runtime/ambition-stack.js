const clamp = value => Math.max(0, Math.min(1, value));

// Each later sheet sits in front and remains larger than earlier sheets.
export function stackScale(index, count) {
  return count < 2 ? 1 : .9 + .1 * clamp(index / (count - 1));
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
    let visible=false,frame=0,lastTime=0;
    const rolls=cards.map(()=>null);
    const update=time=>{
      frame=0;
      if(staticMode.matches){
        cards.forEach(card=>{card.style.removeProperty('transform');card.style.removeProperty('--paper-curl');card.style.removeProperty('--paper-shade');});
        rolls.fill(null);lastTime=0;
        return;
      }
      if(!visible || document.hidden){lastTime=0;return;}
      // Ease only while the sheet is moving, independent of display refresh rate.
      const dt=lastTime?Math.min(64,time-lastTime):16.67;lastTime=time;
      const ease=1-Math.exp(-dt/75);
      let moving=false;
      const geometry=items.map(item=>({top:item.getBoundingClientRect().top,settledTop:parseFloat(getComputedStyle(item).top)}));
      cards.forEach((card,i)=>{
        const target=paperRoll(geometry[i].top,geometry[i].settledTop,innerHeight);
        let roll=rolls[i]===null?target:rolls[i]+(target-rolls[i])*ease;
        if(Math.abs(target-roll)<.0005)roll=target;else moving=true;
        rolls[i]=roll;
        const bend=Math.sin(roll*Math.PI);
        // The arch travels through the sheet as it unrolls, then disappears.
        const curl=bend*110;
        card.style.transform=`translateY(${(roll*56).toFixed(2)}px) rotateX(${(-roll*18-bend*10).toFixed(2)}deg) scale(${stackScale(i,cards.length).toFixed(4)})`;
        card.style.setProperty('--paper-curl',`${curl.toFixed(2)}px`);
        card.style.setProperty('--paper-shade',`${(bend*.22).toFixed(3)}`);
      });
      if(moving)request();else lastTime=0;
    };
    const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
    new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)request();}).observe(root);
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',request,{passive:true});
    document.addEventListener('visibilitychange',request);
    staticMode.addEventListener('change',request);
  });
}
