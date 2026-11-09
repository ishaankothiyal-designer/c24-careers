import { performanceProfile } from './performance-profile.js';

// Two centered lines keep the original shimmering cells without a moving marquee.
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
    root.dataset.closingMotion = 'two-line-pixel-shimmer';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width:767px)');
    const profile = performanceProfile();
    const isStatic = () => reduce.matches || compact.matches || profile.constrained;
    const lines = [...title.childNodes].filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim()).filter(Boolean);
    const colors = ['#1c2541', getComputedStyle(root).getPropertyValue('--blue').trim() || '#4736fe', '#f5c518', '#e0492a', '#d8ff00'];
    let cells = [], maskWidth = 1, width = 0, height = 0, cell = 9;
    let frame = 0, last = 0, visible = false;

    function buildMask() {
      const family = getComputedStyle(title).fontFamily;
      paint.font = `400 18px ${family}`;
      maskWidth = Math.max(1, Math.ceil(Math.max(...lines.map(line => paint.measureText(line).width))));
      mask.width = maskWidth; mask.height = 48;
      paint.font = `400 18px ${family}`;
      paint.textBaseline = 'middle'; paint.fillStyle = '#000';
      lines.forEach((line, index) => paint.fillText(line, (maskWidth - paint.measureText(line).width) / 2, 12 + index * 24));
      const pixels = paint.getImageData(0, 0, maskWidth, 48).data;
      cells = [];
      for (let y = 0; y < 48; y++) for (let x = 0; x < maskWidth; x++) {
        if (pixels[(y * maskWidth + x) * 4 + 3] > 80) cells.push([x, y]);
      }
    }
    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      const leftEdge = (width - maskWidth * cell) / 2;
      const top = Math.round((height - 48 * cell) / 2);
      for (const [x, y] of cells) {
        const left = leftEdge + x * cell;
        const heat = .63 + .33 * Math.sin(x * .6 + y * .6 - now * .006);
        ctx.fillStyle = colors[heat >= .86 ? 4 : heat >= .78 ? 3 : heat >= .62 ? 2 : heat >= .46 ? 1 : 0];
        ctx.fillRect(left, top + y * cell, Math.max(1, cell - 1), Math.max(1, cell - 1));
      }
    }
    function size() {
      if (isStatic()) return;
      width = stage.clientWidth;
      cell = Math.min(6, (width - 48) / maskWidth);
      height = 48 * cell + 32;
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
