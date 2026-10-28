import { requestProject } from './project-drawer.js';
// Scoped adaptation of Craft's project carousel and line reveal.
export function initializeCraftWork() {
  document.querySelectorAll('[data-craft-work]').forEach(initializeReel);
}

function initializeReel(root) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const gridSnap = root.hasAttribute('data-craft-grid-snap');
  const viewport = root.querySelector('[data-craft-work-viewport]');
  const track = root.querySelector('[data-craft-work-track]');
  const cards = [...track.querySelectorAll('.craft-work__card')];
  const autoReel = root.id === 'builder';
  // Recycle the original cards around a virtual ring. A builder has one card
  // and one set of hover/focus handlers, rather than a duplicated visual set.
  const prev = root.querySelector('.craft-work__previous');
  const next = root.querySelector('.craft-work__next');
  let x = 0, velocity = 0, minX = 0, step = 448, target = null, frame = 0, drag = null, lastFrame = 0;
  let cardMetrics=[];
  let loopWidth = 0, hovered = false, autoVisible = false, autoFrame = 0, autoLast = 0, autoSpeed = 0, manualUntil = 0;
  const manual = () => { manualUntil = performance.now() + 3000; autoSpeed = 0; };
  const isLoop = () => autoReel && loopWidth > viewport.clientWidth;
  const clamp = value => isLoop() ? value : Math.max(minX, Math.min(0, value));
  const snap = value => clamp(Math.round(value / step) * step);
  const apply = () => {
    if (isLoop()) {
      const wrapped = -(((-x % loopWidth) + loopWidth) % loopWidth);
      if (target !== null) target += wrapped - x;
      x = wrapped;
      cardMetrics.forEach(({card,offset,width}) => {
        const left = x + offset;
        const ringLeft = ((left + width) % loopWidth + loopWidth) % loopWidth - width;
        const shift=Math.round((ringLeft-left)/loopWidth)*loopWidth;
        const transform=`translate3d(${shift}px,0,0)`;
        if(card.style.transform!==transform)card.style.transform=transform;
      });
    } else if (autoReel) cards.forEach(card => { card.style.transform = ''; });
    track.style.transform = `translate3d(${x}px,0,0)`;
    prev.disabled = autoReel && loopWidth > viewport.clientWidth ? false : x >= -.5;
    next.disabled = autoReel && loopWidth > viewport.clientWidth ? false : x <= minX + .5;
  };
  const bounds = () => {
    cardMetrics=cards.map(card=>({card,offset:card.offsetLeft,width:card.offsetWidth}));
    step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : viewport.clientWidth;
    loopWidth = autoReel ? cards.length * step : 0;
    minX = autoReel ? -loopWidth : Math.min(0, viewport.clientWidth - track.scrollWidth);
    x = clamp(x); apply();
    if (gridSnap) {
      viewport.style.transform = 'none';
      const media = root.querySelector('.craft-work__media');
      if (media) {
        const top = media.getBoundingClientRect().top + scrollY;
        let offset = ((top % 14) + 14) % 14;
        if (offset > 7) offset -= 14;
        viewport.style.transform = `translateY(${-offset}px)`;
      }
    }
  };
  const animate = time => {
    frame = 0;
    const scale=lastFrame?Math.min(48,time-lastFrame)/(1000/60):1;
    lastFrame=time;
    const ease=1-Math.pow(.88,scale);
    if (drag) { apply(); return; }
    if (target !== null) {
      x += (target - x) * ease;
      if (Math.abs(target - x) < .3) { x = target; target = null; apply(); return; }
    } else {
      x += velocity*scale; velocity *= Math.pow(.94,scale);
      if (!isLoop()) {
        if (x > 0) { x += -x * ease; velocity *= Math.pow(.5,scale); }
        else if (x < minX) { x += (minX - x) * ease; velocity *= Math.pow(.5,scale); }
      }
      if (Math.abs(velocity) <= .06 && (isLoop() || x <= .5 && x >= minX - .5)) { x = clamp(gridSnap ? Math.round(x / 14) * 14 : x); velocity = 0; apply(); return; }
    }
    apply(); frame = requestAnimationFrame(animate);
  };
  const startAnimation=()=>{cancelAnimationFrame(frame);lastFrame=0;frame=requestAnimationFrame(animate);};
  const go = direction => {
    manual();
    target = snap(x - direction * step); velocity = 0;
    cancelAnimationFrame(frame);frame=0;
    if (reduce.matches) { x = target; target = null; apply(); }
    else startAnimation();
  };
  prev.addEventListener('pointerdown', event => event.stopPropagation());
  next.addEventListener('pointerdown', event => event.stopPropagation());
  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    manual();
    event.preventDefault();
    if (event.key.startsWith('Arrow')) go(event.key === 'ArrowRight' ? 1 : -1);
    else { target = event.key === 'Home' ? 0 : autoReel ? clamp(viewport.clientWidth - cards.at(-1).offsetLeft - cards.at(-1).offsetWidth - parseFloat(getComputedStyle(track).paddingRight)) : minX; cancelAnimationFrame(frame); frame=0; if (reduce.matches) { x = target; target = null; apply(); } else startAnimation(); }
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const control = event.target.closest('a[href], button, input, select, textarea, summary, [role="button"]');
    if (control && !control.matches('a.craft-work__card, .craft-work__card[data-builder-href]')) return;
    manual();
    event.preventDefault(); cancelAnimationFrame(frame); frame=0; velocity = 0; target = null;
    drag = { id: event.pointerId, start: event.clientX, last: event.clientX, time: performance.now(), moved: false, link: event.target.closest('a.craft-work__card[href], .craft-work__card[data-builder-href]') };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const now = performance.now(), dx = event.clientX - drag.last, dt = Math.max(1, now - drag.time);
    if (Math.abs(event.clientX - drag.start) > 5) drag.moved = true;
    const desired = x + dx; x += dx * (!isLoop() && (desired > 0 || desired < minX) ? .35 : 1);
    velocity = dx / dt * 16; drag.last = event.clientX; drag.time = now; apply();
  });
  const release = (event, navigate) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag; drag = null; viewport.classList.remove('is-dragging');
    manual();
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (reduce.matches) { x = clamp(x); velocity = 0; apply(); }
    else { if (coarse.matches) { target = snap(x + velocity * 8); velocity = 0; } startAnimation(); }
    if (navigate && !finished.moved && finished.link) {
      const href = finished.link.dataset.builderHref || finished.link.href;
      if (finished.link.dataset.builderHref && !event.ctrlKey && !event.metaKey) requestProject(href,finished.link);
      else window.open(href, '_blank', 'noopener');
    }
  };
  viewport.addEventListener('pointerup', event => release(event, true));
  viewport.addEventListener('pointercancel', event => release(event, false));
  cards.forEach(card => card.addEventListener('click', event => {
    const control = event.target.closest('a[href], button, input, select, textarea, summary, [role="button"]');
    if (control && control !== card) return;
    if (card.dataset.builderHref && event.detail === 0) {event.preventDefault();requestProject(card.dataset.builderHref,card);}
    else if (event.detail !== 0) event.preventDefault();
  }));
  cards.filter(card => card.dataset.builderHref).forEach(card => card.addEventListener('keydown', event => {
    if (!['Enter',' '].includes(event.key) || event.target !== card) return;
    event.preventDefault(); requestProject(card.dataset.builderHref,card);
  }));
  // Keep one trackpad gesture on its starting axis, including its momentum tail.
  // Otherwise diagonal deltas alternate between the reel and Lenis page scrolling.
  let wheelAxis = null, lastWheelAt = -Infinity;
  viewport.addEventListener('wheel', event => {
    if (event.ctrlKey || (!event.deltaX && !event.deltaY)) return;
    const now = performance.now();
    if (now - lastWheelAt > 180) wheelAxis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'x' : 'y';
    lastWheelAt = now;
    if (wheelAxis !== 'x') return;
    manual();
    event.preventDefault();
    event.stopPropagation();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    velocity=0;
    target=clamp((target??x)-event.deltaX*scale);
    if(reduce.matches){cancelAnimationFrame(frame);frame=0;x=target;target=null;apply();}
    else if(!frame)startAnimation();
  }, { passive: false });
  viewport.addEventListener('focusin', event => {
    const card = event.target.closest('.craft-work__card'); if (!card) return;
    const rect = card.getBoundingClientRect(), area = viewport.getBoundingClientRect();
    if (rect.left < area.left || rect.right > area.right) { x = clamp(-cards.indexOf(card) * step); target = null; cancelAnimationFrame(frame); frame=0; apply(); }
  });
  new ResizeObserver(bounds).observe(viewport); bounds();

  if (autoReel || root.id === 'roles') {
    const edges = event => {
      const rect = viewport.getBoundingClientRect(), zone = Math.min(180, rect.width * .22), localX = event.clientX - rect.left;
      viewport.classList.toggle('is-near-left', localX <= zone);
      viewport.classList.toggle('is-near-right', localX >= rect.width - zone);
    };
    viewport.addEventListener('pointerenter', event => { hovered = true; edges(event); });
    viewport.addEventListener('pointermove', edges);
    viewport.addEventListener('pointerleave', () => { hovered = false; viewport.classList.remove('is-near-left', 'is-near-right'); });
  }

  if (autoReel) {
    const tick = time => {
      autoFrame = 0;
      const dt = autoLast ? Math.min(48, time - autoLast) / 1000 : 0;
      autoLast = time;
      const keyboardFocus = viewport.matches(':focus') || !!viewport.querySelector('.craft-work__card:focus, :focus-visible');
      const blocked = reduce.matches || coarse.matches || document.hidden || !autoVisible || keyboardFocus || drag || frame || target !== null || time < manualUntil;
      if (!blocked && loopWidth > viewport.clientWidth) {
        const speed = hovered ? 4 : 28;
        autoSpeed += (speed - autoSpeed) * (1 - Math.exp(-dt * 6));
        x -= autoSpeed * dt;
        apply();
      } else autoSpeed = 0;
      if (autoVisible && !document.hidden && !reduce.matches && !coarse.matches) autoFrame = requestAnimationFrame(tick);
    };
    const startAuto = () => {
      if (!autoFrame && autoVisible && !document.hidden && !reduce.matches && !coarse.matches) { autoLast = 0; autoFrame = requestAnimationFrame(tick); }
    };
    new IntersectionObserver(entries => {
      autoVisible = entries.some(entry => entry.isIntersecting);
      if (!autoVisible) { cancelAnimationFrame(autoFrame); autoFrame = 0; autoLast = 0; }
      else startAuto();
    }, { threshold: .05 }).observe(viewport);
    document.addEventListener('visibilitychange', startAuto);
    reduce.addEventListener('change', startAuto);
    coarse.addEventListener('change', startAuto);
  }

  const lead = root.querySelector('[data-craft-work-lead]');
  let splitLead = () => {};
  if (lead) {
  const original = lead.textContent.trim();
  const hardLines = lead.hasAttribute('data-craft-hard-breaks') ? [...lead.childNodes].map(node => node.nodeName === 'BR' ? '\n' : node.textContent).join('').trim().split('\n').map(line => line.trim()) : null;
  splitLead = () => {
    lead.textContent = original; lead.setAttribute('aria-label', original);
    if (hardLines) {
      lead.replaceChildren();
      hardLines.forEach((content, index) => { const line = document.createElement('span'), text = document.createElement('span'); line.className = 'craft-work__lead-line'; line.setAttribute('aria-hidden', 'true'); text.textContent = content; text.style.transitionDelay = `${index * .1}s`; line.append(text); lead.append(line); });
      lead.dataset.ready = 'true'; return;
    }
    if (reduce.matches) { lead.dataset.ready = 'true'; return; }
    lead.replaceChildren();
    original.split(/\s+/).forEach(word => { const span = document.createElement('span'); span.textContent = word; span.style.display = 'inline-block'; lead.append(span, ' '); });
    const lines = []; let top;
    [...lead.children].forEach(word => { if (top === undefined || Math.abs(word.offsetTop - top) > 2) { lines.push([]); top = word.offsetTop; } lines.at(-1).push(word.textContent); });
    lead.replaceChildren();
    lines.forEach((words, index) => { const line = document.createElement('span'), text = document.createElement('span'); line.className = 'craft-work__lead-line'; line.setAttribute('aria-hidden', 'true'); text.textContent = words.join(' '); text.style.transitionDelay = `${index * .1}s`; line.append(text); lead.append(line); });
    lead.dataset.ready = 'true';
  };
  document.fonts.ready.then(splitLead);
  const reveal = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { lead.classList.add('is-in-view'); reveal.disconnect(); } }, { threshold: .05 }); reveal.observe(lead);
  let resizeTimer; addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(splitLead, 180); });
  }
  const videos = [...root.querySelectorAll('video')], visibleVideos = new Set();
  const updateVideos = () => videos.forEach(video => { if (!reduce.matches && !document.hidden && visibleVideos.has(video)) video.play().catch(() => {}); else video.pause(); });
  const mediaObserver = new IntersectionObserver(entries => { entries.forEach(entry => entry.isIntersecting ? visibleVideos.add(entry.target) : visibleVideos.delete(entry.target)); updateVideos(); }, { threshold: .05 }); videos.forEach(video => mediaObserver.observe(video));
  document.addEventListener('visibilitychange', updateVideos); reduce.addEventListener('change', () => { splitLead(); updateVideos(); });
}
