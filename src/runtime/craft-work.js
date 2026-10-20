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
  const prev = root.querySelector('.craft-work__previous');
  const next = root.querySelector('.craft-work__next');
  let x = 0, velocity = 0, minX = 0, step = 448, target = null, frame = 0, drag = null;
  const clamp = value => Math.max(minX, Math.min(0, value));
  const snap = value => clamp(Math.round(value / step) * step);
  const apply = () => {
    track.style.transform = `translate3d(${x}px,0,0)`;
    prev.disabled = x >= -.5; next.disabled = x <= minX + .5;
  };
  const bounds = () => {
    minX = Math.min(0, viewport.clientWidth - track.scrollWidth);
    step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : viewport.clientWidth;
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
  const animate = () => {
    frame = 0;
    if (drag) { apply(); return; }
    if (target !== null) {
      x += (target - x) * .18;
      if (Math.abs(target - x) < .3) { x = target; target = null; apply(); return; }
    } else {
      x += velocity; velocity *= .94;
      if (x > 0) { x += -x * .18; velocity *= .5; }
      else if (x < minX) { x += (minX - x) * .18; velocity *= .5; }
      if (Math.abs(velocity) <= .06 && x <= .5 && x >= minX - .5) { x = clamp(gridSnap ? Math.round(x / 14) * 14 : x); velocity = 0; apply(); return; }
    }
    apply(); frame = requestAnimationFrame(animate);
  };
  const go = direction => {
    target = snap(x - direction * step); velocity = 0;
    cancelAnimationFrame(frame);
    if (reduce.matches) { x = target; target = null; apply(); }
    else frame = requestAnimationFrame(animate);
  };
  prev.addEventListener('pointerdown', event => event.stopPropagation());
  next.addEventListener('pointerdown', event => event.stopPropagation());
  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key.startsWith('Arrow')) go(event.key === 'ArrowRight' ? 1 : -1);
    else { target = event.key === 'Home' ? 0 : minX; cancelAnimationFrame(frame); if (reduce.matches) { x = target; target = null; apply(); } else frame = requestAnimationFrame(animate); }
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const control = event.target.closest('a[href], button, input, select, textarea, summary, [role="button"]');
    if (control && !control.matches('a.craft-work__card')) return;
    event.preventDefault(); cancelAnimationFrame(frame); velocity = 0; target = null;
    drag = { id: event.pointerId, start: event.clientX, last: event.clientX, time: performance.now(), moved: false, link: event.target.closest('a.craft-work__card[href]') };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const now = performance.now(), dx = event.clientX - drag.last, dt = Math.max(1, now - drag.time);
    if (Math.abs(event.clientX - drag.start) > 5) drag.moved = true;
    const desired = x + dx; x += dx * (desired > 0 || desired < minX ? .35 : 1);
    velocity = dx / dt * 16; drag.last = event.clientX; drag.time = now; apply();
  });
  const release = (event, navigate) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag; drag = null; viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (reduce.matches) { x = clamp(x); velocity = 0; apply(); }
    else { if (coarse.matches) { target = snap(x + velocity * 8); velocity = 0; } frame = requestAnimationFrame(animate); }
    if (navigate && !finished.moved && finished.link) window.open(finished.link.href, '_blank', 'noopener');
  };
  viewport.addEventListener('pointerup', event => release(event, true));
  viewport.addEventListener('pointercancel', event => release(event, false));
  cards.forEach(card => card.addEventListener('click', event => {
    const control = event.target.closest('a[href], button, input, select, textarea, summary, [role="button"]');
    if (control && control !== card) return;
    if (event.detail !== 0) event.preventDefault();
  }));
  viewport.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault(); cancelAnimationFrame(frame); target = null; velocity = 0; x = clamp(x - event.deltaX); apply();
  }, { passive: false });
  viewport.addEventListener('focusin', event => {
    const card = event.target.closest('.craft-work__card'); if (!card) return;
    const rect = card.getBoundingClientRect(), area = viewport.getBoundingClientRect();
    if (rect.left < area.left || rect.right > area.right) { x = clamp(-cards.indexOf(card) * step); target = null; cancelAnimationFrame(frame); apply(); }
  });
  new ResizeObserver(bounds).observe(viewport); bounds();

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
