// Craft's screen-space heat stamping, without its horizontal text phase.
export function initializeClosingPixels() {
  document.querySelectorAll('[data-closing-pixels]').forEach(root => {
    if (root.dataset.pixelsInitialized) return;
    const stage = root.querySelector('[data-closing-pixel-stage]');
    const canvas = root.querySelector('[data-closing-pixel-canvas]');
    const title = root.querySelector('.closing-pixels__title');
    const ctx = canvas?.getContext('2d');
    if (!ctx || !stage || !title) return;
    root.dataset.pixelsInitialized = 'true';
    root.dataset.closingMotion = 'vertical-heat-trail';
    // Screen-fixed heat is what leaves Craft's short vertical trails as the
    // document moves underneath it. The stage only reserves the text's space.
    canvas.className = 'closing-pixel-overlay';
    document.body.appendChild(canvas);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(hover: none), (pointer: coarse)');
    const mask = document.createElement('canvas'), paint = mask.getContext('2d');
    if (!paint) return;
    const lines = [...title.childNodes].filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim()).filter(Boolean);
    let points = [], cell = 1, columns = 0, width = 0, height = 0;
    let heat = new Map(), frame = 0, last = 0, visible = false;
    function render(now) {
      frame = 0;
      if (reduce.matches || document.hidden) return;
      const scale = Math.min(3, (now - (last || now - 1000 / 60)) / (1000 / 60));
      last = now;
      const decay = Math.pow(coarse.matches ? .85 : .878, scale);
      for (const [key, value] of heat) {
        const next = value * decay;
        if (next * .9 < .3) heat.delete(key); else heat.set(key, next);
      }
      const rect = stage.getBoundingClientRect();
      const stamped = new Set();
      if (visible) for (const p of points) {
        const column = Math.round((rect.left + p.left) / cell);
        const row = Math.round((rect.top + p.top) / cell);
        if (row < 0 || row * cell >= height || column < 0 || column >= columns) continue;
        const key = row * columns + column;
        const value = .84 + (coarse.matches ? .05 : .14) * Math.sin(p.x * .6 + p.y * .6 - now * .006);
        heat.set(key, Math.max(heat.get(key) || 0, value));
        stamped.add(key);
      }
      ctx.clearRect(0, 0, width, height);
      let trails = 0;
      for (const [key, heatValue] of heat) {
        const value = heatValue * .9;
        if (value < .3) continue;
        ctx.fillStyle = value >= .86 && value < 1.02 ? '#d8ff00' : value >= .78 ? '#e0492a' : value >= .62 ? '#f5c518' : value >= .46 ? '#4736fe' : '#1c2541';
        ctx.fillRect(key % columns * cell, Math.floor(key / columns) * cell, Math.max(1, cell - 1), Math.max(1, cell - 1));
        if (!stamped.has(key)) trails++;
      }
      canvas.dataset.trailCells = String(trails);
      if (visible || heat.size) frame = requestAnimationFrame(render);
      else last = 0;
    }
    function request() { if (!frame && !reduce.matches && !document.hidden) frame = requestAnimationFrame(render); }
    function size() {
      if (reduce.matches) return;
      paint.font = `18px ${getComputedStyle(title).fontFamily}`;
      const mw = Math.ceil(Math.max(...lines.map(line => paint.measureText(line).width))) + 4;
      const lineStep = 21;
      const mh = (lines.length - 1) * lineStep + 24;
      mask.width = mw; mask.height = mh;
      paint.font = `18px ${getComputedStyle(title).fontFamily}`;
      paint.textBaseline = 'top'; paint.textAlign = 'center'; paint.fillStyle = '#000';
      lines.forEach((line, i) => paint.fillText(line, mw / 2, i * lineStep));
      cell = Math.max(1, Math.min(8, Math.floor((stage.clientWidth - 32) / mw)));
      const pixels = paint.getImageData(0, 0, mw, mh).data;
      let firstRow = mh, lastRow = 0;
      for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
        if (pixels[(y * mw + x) * 4 + 3] > 80) { firstRow = Math.min(firstRow, y); lastRow = Math.max(lastRow, y); }
      }
      root.style.setProperty('--closing-pixel-height', `${(lastRow - firstRow + 1) * cell + 32}px`);
      width = innerWidth; height = innerHeight; columns = Math.ceil(width / cell);
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const left = Math.floor((stage.clientWidth - mw * cell) / 2);
      points = [];
      for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
        if (pixels[(y * mw + x) * 4 + 3] > 80) points.push({ x, y, left: left + x * cell, top: 16 + (y - firstRow) * cell });
      }
      heat.clear(); request();
    }
    function preference() {
      root.classList.toggle('is-pixels-ready', !reduce.matches);
      canvas.hidden = reduce.matches;
      cancelAnimationFrame(frame); frame = 0; last = 0; heat.clear();
      ctx.clearRect(0, 0, width, height);
      if (!reduce.matches) size();
    }
    new ResizeObserver(size).observe(stage);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; request(); }).observe(stage);
    addEventListener('resize', size, { passive: true });
    addEventListener('scroll', request, { passive: true });
    document.addEventListener('visibilitychange', () => { last = 0; request(); });
    reduce.addEventListener('change', preference);
    document.fonts.ready.then(preference);
  });
}
