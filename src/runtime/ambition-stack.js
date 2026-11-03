const clamp = value => Math.max(0, Math.min(1, value));

// Each later sheet sits in front and remains larger than earlier sheets.
export function stackScale(index, count) {
  return count < 2 ? 1 : .9 + .1 * clamp(index / (count - 1));
}

export function initializeAmbitionStack() {
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const cards=[...root.querySelectorAll('.ambition-stack__card')];
    const staticMode=matchMedia('(prefers-reduced-motion: reduce), (max-height:650px)');
    const update=()=>cards.forEach((card,i)=>{
      if(staticMode.matches)card.style.removeProperty('transform');
      else card.style.transform=`scale(${stackScale(i,cards.length).toFixed(4)})`;
    });
    staticMode.addEventListener('change',update);
    update();
  });
}
