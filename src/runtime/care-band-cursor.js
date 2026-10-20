// Adapted from the reference navigation band's cursor dither.
const BAYER = [0,48,12,60,3,51,15,63,32,16,44,28,35,19,47,31,8,56,4,52,11,59,7,55,40,24,36,20,43,27,39,23,2,50,14,62,1,49,13,61,34,18,46,30,33,17,45,29,10,58,6,54,9,57,5,53,42,26,38,22,41,25,37,21];
export function initializeCareBandCursor() {
  document.querySelectorAll('.care-summary__band').forEach(band => {
    if (band.dataset.cursorInitialized) return;
    band.dataset.cursorInitialized = 'true';
    band.setAttribute('data-cursor-exclude', '');
    const canvas = document.createElement('canvas');
    canvas.className = 'care-band-dither'; canvas.hidden = true;
    canvas.setAttribute('aria-hidden', 'true'); band.prepend(canvas);
    const fine = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
    let ctx, frame = 0, last = 0, active = false, inside = false, opacity = 1, fadeAt = 0, fadeFrom = 1;
    const current = {x:0,y:0}, target = {x:0,y:0};
    function stop() {
      active = inside = false; cancelAnimationFrame(frame); frame = 0;
      canvas.hidden = true; ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    function leave() { if (active && inside) { inside = false; fadeAt = performance.now(); fadeFrom = opacity; } }
    function draw(now) {
      if (!active || !ctx) return;
      const ease = 1 - Math.exp(-Math.min(now - last, 50) / 100); last = now;
      if (inside) opacity += (1 - opacity) * ease;
      else {
        const elapsed = Math.max(0, Math.min((now - fadeAt) / 300, 1));
        if (elapsed === 1) { stop(); return; }
        opacity = fadeFrom * (1 - elapsed * elapsed * (3 - 2 * elapsed));
      }
      current.x += (target.x - current.x) * ease; current.y += (target.y - current.y) * ease;
      const radius = 46;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity; ctx.fillStyle = '#4736fe';
      for (let y = Math.max(0, Math.floor(current.y - radius)); y < Math.min(canvas.height, Math.ceil(current.y + radius)); y++) {
        for (let x = Math.max(0, Math.floor(current.x - radius)); x < Math.min(canvas.width, Math.ceil(current.x + radius)); x++) {
          const distance = Math.hypot(x + .5 - current.x, y + .5 - current.y) / radius;
          if (distance < 1 && (1 - distance * distance) ** 2 * (.64 + .16 * Math.sin(distance * 16 - now * .0032)) > (BAYER[y % 8 * 8 + x % 8] + .5) / 64) ctx.fillRect(x, y, 1, 1);
        }
      }
      frame = requestAnimationFrame(draw);
    }
    function move(event) {
      if (event.pointerType !== 'mouse' || !fine.matches) return;
      const rect = band.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
      if (!rect.width || !rect.height) { stop(); return; }
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) { leave(); return; }
      ctx ||= canvas.getContext('2d'); if (!ctx) return;
      if (!active) { canvas.width = Math.ceil(rect.width / 4); canvas.height = Math.ceil(rect.height / 4); }
      target.x = x / rect.width * canvas.width; target.y = y / rect.height * canvas.height; inside = true;
      if (!active) { current.x = target.x; current.y = target.y; active = true; opacity = 1; canvas.hidden = false; last = performance.now(); frame = requestAnimationFrame(draw); }
    }
    band.addEventListener('pointerenter', move); band.addEventListener('pointermove', move);
    band.addEventListener('pointerleave', leave); band.addEventListener('pointercancel', stop);
    fine.addEventListener('change', stop); window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    new ResizeObserver(stop).observe(band);
  });
}
