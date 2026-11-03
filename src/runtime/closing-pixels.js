import { performanceProfile } from './performance-profile.js';

// Restores the archived craft.wild.as stampText/buildTxt adaptation: an 18px
// text mask, repeated horizontal phase and independently shimmering pixel cells.
export function initializeClosingPixels() {
  document.querySelectorAll('[data-closing-pixels]').forEach(root => {
    if (root.dataset.pixelsInitialized) return;
    const stage = root.querySelector('[data-closing-pixel-stage]');
    const canvas = root.querySelector('[data-closing-pixel-canvas]');
    const title = root.querySelector('.closing-pixels__title');
    const ctx = canvas?.getContext('2d');
    const mask = document.createElement('canvas'), paint = mask.getContext('2d');
    if (!ctx || !paint || !stage || !title) return;
    root.dataset.pixelsInitialized = 'true';
    root.dataset.closingMotion = 'horizontal-pixel-marquee';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width:900px)');
    const profile = performanceProfile();
    const isStatic = () => reduce.matches || compact.matches || profile.constrained;
    const text = [...title.childNodes].filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim()).filter(Boolean).join(' ') + '     ';
    const colors = ['#1c2541', getComputedStyle(root).getPropertyValue('--blue').trim() || '#4736fe', '#f5c518', '#e0492a', '#d8ff00'];
    let cells = [], maskWidth = 1, width = 0, height = 0, cell = 9;
    let phase = 0, frame = 0, last = 0, visible = false;

    function buildMask() {
      const family = getComputedStyle(title).fontFamily;
      paint.font = `400 18px ${family}`;
      maskWidth = Math.max(1, Math.ceil(paint.measureText(text).width));
      mask.width = maskWidth; mask.height = 24;
      paint.font = `400 18px ${family}`;
      paint.textBaseline = 'middle'; paint.fillStyle = '#000';
      paint.fillText(text, 0, 12);
      const pixels = paint.getImageData(0, 0, maskWidth, 24).data;
      cells = [];
      for (let y = 0; y < 24; y++) for (let x = 0; x < maskWidth; x++) {
        if (pixels[(y * maskWidth + x) * 4 + 3] > 80) cells.push([x, y]);
      }
    }
    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      const period = maskWidth * cell, offset = phase * cell;
      const top = Math.round((height - 24 * cell) / 2);
      for (const [x, y] of cells) {
        let left = ((x * cell - offset) % period + period) % period;
        const heat = .63 + .33 * Math.sin(x * .6 + y * .6 - now * .006);
        ctx.fillStyle = colors[heat >= .86 ? 4 : heat >= .78 ? 3 : heat >= .62 ? 2 : heat >= .46 ? 1 : 0];
        while (left < width) {
          ctx.fillRect(left, top + y * cell, cell - 1, cell - 1);
          left += period;
        }
      }
    }
    function size() {
      if (isStatic()) return;
      cell = 9;
      height = 24 * cell + 32;
      root.style.setProperty('--closing-pixel-height', `${height}px`);
      width = stage.clientWidth;
      const ratio = Math.min(devicePixelRatio || 1, profile.pixelRatio);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    }
    function tick(now) {
      frame = 0;
      if (!visible || isStatic() || document.hidden) { last = 0; return; }
      const delta = last ? Math.min(now - last, 64) : 0;
      if (last && delta < profile.frameInterval - 1) { frame = requestAnimationFrame(tick); return; }
      last = now;
      phase += delta * .0084;
      draw(now);
      frame = requestAnimationFrame(tick);
    }
    function request() {
      if (!frame && visible && !isStatic() && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function preference() {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      root.classList.toggle('is-pixels-ready', !isStatic());
      canvas.hidden = isStatic();
      ctx.clearRect(0, 0, width, height);
      if (!isStatic()) { buildMask(); size(); request(); }
    }
    new ResizeObserver(size).observe(stage);
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) request(); else { cancelAnimationFrame(frame); frame = 0; last = 0; }
    }).observe(stage);
    addEventListener('resize', size, { passive: true });
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(frame); frame = 0; last = 0; request();
    });
    reduce.addEventListener('change', preference);
    compact.addEventListener('change', preference);
    document.fonts.ready.then(preference).catch(() => {
      root.classList.remove('is-pixels-ready'); canvas.hidden = true;
    });
  });
}
