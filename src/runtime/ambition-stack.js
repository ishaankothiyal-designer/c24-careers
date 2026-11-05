import {performanceProfile} from './performance-profile.js';

export function initializeAmbitionStack({loadFigures = () => import('./hairline-figures.js')} = {}) {
  const cleanups=[];
  document.querySelectorAll('[data-ambition-stack]').forEach(root=>{
    if(root.dataset.stackInitialized)return;
    root.dataset.stackInitialized='true';
    const cards=[...root.querySelectorAll('.ambition-stack__card')];
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const profile=performanceProfile();
    const figures=new Map();
    let loading,disposed=false;
    const updateArt=()=>{
      const staticArt=motion.matches||profile.constrained;
      root.dataset.artStatic=String(staticArt);
      root.dataset.artPaused=String(document.hidden);
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
