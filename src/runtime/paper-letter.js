import { performanceProfile } from './performance-profile.js';
import { paperEnhancement, prepareLetterFonts } from './paper-enhancement.js';
// Scroll choreography for the source VAT paper, with readable DOM fallback.
export function initializePaperLetter() {
  document.querySelectorAll('[data-paper-letter]').forEach(root => {
    if (root.dataset.paperInitialized) return;
    root.dataset.paperInitialized = 'true';
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const crampedViewport = matchMedia('(max-width:1050px), (max-height:700px) and (orientation:landscape)');
    const profile = performanceProfile();
    const isStatic = () => motion.matches || crampedViewport.matches || profile.constrained;
    let scene, visible = false, current = 1, writing = 0, frame = 0, lastTick = 0;
    const smooth = (a, b, value) => { const x = Math.max(0, Math.min(1, (value-a)/(b-a))); return x*x*(3-2*x); };
    const getTarget = () => {
      const rect = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight-rect.top)/(rect.height+innerHeight)));
      root.dataset.paperProgress = progress.toFixed(3);
      if (rect.top > innerHeight + 80) writing = 0;
      else writing = Math.max(writing, progress < .29 ? .5*smooth(.11,.29,progress) : .5+.5*smooth(.29,.46,progress));
      root.dataset.paperWriting = writing.toFixed(3);
      return 1 - smooth(.08,.29,progress)*(1-smooth(.53,.72,progress));
    };
    const tick = now => {
      frame = 0;
      const elapsed = lastTick ? Math.min(.05,(now-lastTick)/1000) : 0; lastTick = now;
      if (!scene || isStatic() || !visible || document.hidden || root.dataset.paperState === 'fallback') return;
      const target = getTarget(); current += (target-current)*.14;
      if (Math.abs(target-current)<.001) current = target;
      // Continue handwriting while the fully opened paper is being read, even
      // when scrolling pauses. Scroll progress can catch up before refolding.
      const progress = Number(root.dataset.paperProgress);
      const writingWhileOpen = current < .012 && progress >= .29 && progress < .53 && writing < 1;
      if (writingWhileOpen) writing = Math.min(1,writing+elapsed*.5/2.6);
      root.dataset.paperWriting = writing.toFixed(3);
      scene.update(current, writing);
      root.dataset.paperCrumple = current.toFixed(3);
      root.classList.toggle('is-paper-readable', current < .012);
      if (current !== target || writingWhileOpen && writing < 1) frame = requestAnimationFrame(tick);
    };
    const request = () => { if (!frame) {lastTick=0;frame=requestAnimationFrame(tick);} };
    const enhancement = paperEnhancement({
      load: async signal => {
        const { createPaperLetterScene } = await import('./paper-letter-scene.js');
        await prepareLetterFonts(document.fonts, signal);
        if (signal.aborted || isStatic()) throw new Error('Use the readable letter.');
        return createPaperLetterScene(root, { signal });
      },
      ready: prepared => {
        scene = prepared;
        current = getTarget(); scene.update(current, writing); root.classList.toggle('is-paper-ready', !isStatic());
        root.dataset.paperState = 'ready'; request();
      },
      fallback: () => {
        root.dataset.paperState = 'fallback';
        root.classList.remove('is-paper-ready');
        cancelAnimationFrame(frame); frame = 0;
      },
    });
    const load = () => {
      if (isStatic()) { enhancement.showText(); return; }
      root.dataset.paperState ||= 'loading';
      return enhancement.start();
    };
    // Source PaperCrumble graph-paper proportions, shared with static fallback.
    const sheet = root.querySelector('[data-paper-sheet]');
    const paperSurface = new ResizeObserver(() => {
      const width = sheet.getBoundingClientRect().width;
      sheet.style.setProperty('--paper-grid', `${width/16}px`);
      sheet.style.setProperty('--paper-grid-line', `${width/512}px`);
    });
    paperSurface.observe(sheet);
    const preload = new IntersectionObserver(entries => {
      if (entries.some(e=>e.isIntersecting)) { load(); preload.disconnect(); }
    }, {rootMargin:'1600px'}); preload.observe(root);
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(e=>e.isIntersecting);
      if (visible) {
        // Never make a reader wait, or swap a readable sheet for a late animation.
        if (!scene) enhancement.showText();
        else request();
      }
      else {
        cancelAnimationFrame(frame);frame=0;
        // Retreat above the section creates a fresh entrance, not an exit erase.
        if (root.getBoundingClientRect().top >= innerHeight) {
          writing = 0;current = 1;root.dataset.paperWriting = '0.000';
          root.dataset.paperCrumple = '1.000';root.classList.remove('is-paper-readable');
        }
      }
    }); observer.observe(root);
    addEventListener('scroll', request, {passive:true});
    addEventListener('resize', request, {passive:true});
    document.addEventListener('visibilitychange', request);
    const updateMode = () => {
      root.classList.toggle('is-paper-reduced', motion.matches);
      root.classList.toggle('is-paper-short', crampedViewport.matches);
      if (isStatic()) {enhancement.showText();cancelAnimationFrame(frame);frame=0;root.classList.remove('is-paper-ready');}
      else {if(scene)root.classList.add('is-paper-ready');else load();request();}
    };
    motion.addEventListener('change', updateMode);
    crampedViewport.addEventListener('change', updateMode);
    root.classList.toggle('is-paper-reduced', motion.matches);
    root.classList.toggle('is-paper-short', crampedViewport.matches);
    if (isStatic()) enhancement.showText();
  });
}
