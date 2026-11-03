import {performanceProfile} from './performance-profile.js';

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
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const profile=performanceProfile();
    const updateArt=()=>{root.dataset.artStatic=String(motion.matches||profile.constrained);root.dataset.artPaused=String(document.hidden);};
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{entry.target.dataset.artVisible=String(entry.isIntersecting);});
    },{threshold:.15});
    cards.forEach(card=>observer.observe(card));
    motion.addEventListener('change',updateArt);
    document.addEventListener('visibilitychange',updateArt);
    updateArt();
    const staticMode=matchMedia('(prefers-reduced-motion: reduce), (max-height:650px)');
    const update=()=>cards.forEach((card,i)=>{
      if(staticMode.matches)card.style.removeProperty('transform');
      else card.style.transform=`scale(${stackScale(i,cards.length).toFixed(4)})`;
    });
    staticMode.addEventListener('change',update);
    update();
  });
}
