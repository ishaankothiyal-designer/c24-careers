// Pixel rendition of the official Cars24 mark, with eased pointer distortion.
export function initializeExchangeDither() {
  document.querySelectorAll('[data-about-dither]').forEach(host => {
    if (host.dataset.exchangeInitialized) return;
    host.dataset.exchangeInitialized = 'true';
    const canvas = host.querySelector('canvas');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(hover: none), (pointer: coarse)');
    const section = host.closest('section');
    const mask = document.createElement('canvas');
    mask.width = mask.height = 136;
    const maskCtx = mask.getContext('2d', { willReadFrequently: true });
    let pixels = [], width = 0, height = 0, frame = 0, visible = false, last = 0;
    const pointer = { x: 0, y: 0, active: false };
    const follow = { x: 0, y: 0, strength: 0 };
    let phase = 0, scrollEnergy = 0, lastScrollY = scrollY, lastScrollAt = performance.now();
    const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
    const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };

    function draw(dt = 0) {
      const animated = !reduced.matches;
      const interactive = animated && !coarse.matches;
      const ease = 1 - Math.exp(-dt * 7);
      follow.x += ((pointer.active && interactive ? pointer.x : 0) - follow.x) * ease;
      follow.y += ((pointer.active && interactive ? pointer.y : 0) - follow.y) * ease;
      follow.strength += ((pointer.active && interactive ? 1 : 0) - follow.strength) * ease;
      scrollEnergy = animated ? scrollEnergy * Math.exp(-dt * .35) : 0;
      const rect = host.getBoundingClientRect();
      const entry = clamp((innerHeight - rect.top) / (innerHeight * .85));
      const assembly = animated ? 1 - entry * entry * (3 - 2 * entry) : 0;
      const backdrop = host.dataset.aboutDither === 'background';
      const size = backdrop ? Math.min(width * (width <= 600 ? 1.5 : .68), 760) : Math.min(height, width) * 1.15;
      const centerX = width * (backdrop ? .78 : .5) + (animated ? Math.sin(phase * .38) * 12 : 0);
      const centerY = (backdrop ? Math.min(width * .24, 290) : height * .5) + (animated ? Math.sin(phase * .52) * 16 : 0);
      const tilt = follow.x * .035 + (animated ? Math.sin(phase * .28) * .018 : 0);
      const cos = Math.cos(tilt), sin = Math.sin(tilt);
      const mx = width * (.5 + pointer.x * .5), my = height * (.5 + pointer.y * .5);
      const scatter = size * (assembly * .62 + scrollEnergy * .28);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#4736fe';
      for (const pixel of pixels) {
        let x = pixel.x * size, y = pixel.y * size;
        const dx = centerX + x + pixel.ox - mx, dy = centerY + y + pixel.oy - my;
        const distance = Math.hypot(dx, dy), radius = Math.min(270, size * .42);
        const influence = Math.max(0, 1 - distance / radius) ** 2 * follow.strength;
        const tx = pixel.scatterX * scatter + dx / Math.max(1, distance) * influence * 170;
        const ty = pixel.scatterY * scatter + dy / Math.max(1, distance) * influence * 170;
        if (animated && !pixel.initialized) {
          pixel.ox = tx; pixel.oy = ty; pixel.initialized = true;
        } else if (animated && dt) {
          // Damped per-pixel motion: scrolling adds displacement; the decaying
          // scroll energy makes the return gradual rather than snapping home.
          pixel.vx += (tx - pixel.ox) * 11 * dt;
          pixel.vy += (ty - pixel.oy) * 11 * dt;
          const drag = Math.exp(-dt * 5);
          pixel.vx *= drag; pixel.vy *= drag;
          pixel.ox += pixel.vx * dt; pixel.oy += pixel.vy * dt;
        } else if (!animated) {
          pixel.ox = pixel.oy = pixel.vx = pixel.vy = 0;
        }
        x += pixel.ox; y += pixel.oy;
        const cell = size / 102 * .7;
        ctx.globalAlpha = pixel.alpha;
        ctx.fillRect(centerX + x * cos - y * sin - cell / 2,
          centerY + x * sin + y * cos - cell / 2, cell, cell);
      }
      ctx.globalAlpha = 1;
      host.dataset.ditherReady = 'true';
      host.dataset.cursorResponse = follow.strength > .01 ? 'active' : 'idle';
      host.dataset.assemblyScatter = assembly.toFixed(3);
      host.dataset.scrollScatter = scrollEnergy.toFixed(3);
    }
    function resize() {
      const rect = host.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function tick(now) {
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60;
      last = now; phase += dt;
      draw(dt);
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame); last = 0;
      const running = visible && !document.hidden && !reduced.matches;
      host.dataset.ditherState = running ? 'running' : 'paused';
      if (running) frame = requestAnimationFrame(tick);
      else { follow.x = follow.y = follow.strength = 0; draw(); }
    }
    window.addEventListener('scroll', () => {
      const now = performance.now(), distance = Math.abs(scrollY - lastScrollY);
      const rect = host.getBoundingClientRect();
      if (visible && !reduced.matches && rect.top < innerHeight * .1 && rect.bottom > 0) {
        const speed = distance / Math.max(16, now - lastScrollAt);
        scrollEnergy = Math.min(1, scrollEnergy + Math.min(.28, distance / innerHeight * (1.2 + Math.min(2, speed))));
      }
      lastScrollY = scrollY; lastScrollAt = now;
    }, { passive: true });
    section.addEventListener('pointermove', event => {
      const rect = host.getBoundingClientRect();
      const control = event.target.closest('a,button,input,select,textarea,[role="button"],[role="link"]');
      pointer.active = event.pointerType !== 'touch' && !control;
      pointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      pointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    });
    section.addEventListener('pointerleave', () => { pointer.active = false; });
    window.addEventListener('blur', () => { pointer.active = false; });
    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(host);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    // Use only the C contours extracted from the official mark, without its square.
    const logo = new Image();
    logo.onload = () => {
      maskCtx.drawImage(logo, 0, 0, 68, 68, 0, 0, 136, 136);
      const data = maskCtx.getImageData(0, 0, 136, 136).data;
      pixels = [];
      for (let row = 0; row < 102; row++) {
        for (let col = 0; col < 102; col++) {
          const x = Math.min(135, Math.floor((col + .5) / 102 * 136));
          const y = Math.min(135, Math.floor((row + .5) / 102 * 136));
          if (data[(y * 136 + x) * 4 + 3] < 128) continue;
          pixels.push({ x: (col + .5) / 102 - .5, y: (row + .5) / 102 - .5,
            alpha: .45 + .5 * ((col * 17 + row * 31) % 13) / 12,
            scatterX: (hash(col, row) - .5) * 2, scatterY: (hash(row + 23, col + 7) - .5) * 2,
            ox: 0, oy: 0, vx: 0, vy: 0 });
        }
      }
      host.dataset.pixelShape = 'cars24-symbol';
      resize();
    };
    logo.src = '/img/cars24-symbol-c.svg';
    resize();
  });
}
