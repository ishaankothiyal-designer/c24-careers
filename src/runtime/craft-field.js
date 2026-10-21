import { performanceProfile } from './performance-profile.js';
// Canvas 2D interactions adapted from the inspected Craft pixel system.
// One animation loop owns the hero field and transparent page-wide companion.
export function initializeCraftField() {
  const hero = document.querySelector('.hero__stage');
  const field = document.querySelector('[data-craft-field]');
  if (!hero || !field) return;
  if (window.__craftFieldCanvas === field && window.__craftFieldCleanup) return;
  window.__craftFieldCleanup?.();
  window.__craftFieldCanvas = field;
  const background = field.getContext('2d');
  const overlay = document.createElement('canvas');
  overlay.className = 'craft-cursor-canvas';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  const context = overlay.getContext('2d');
  if (!background || !context) { overlay.remove(); return; }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(hover: none), (pointer: coarse)');
  const profile = performanceProfile();
  const CELL = profile.constrained ? 12 : 9;
  const letterRegions = document.querySelectorAll('#letter');
  const COLORS = ['#1c2541', '#4736fe', '#f5c518', '#e0492a'];
  const seed = Math.random() * 1000;
  const events = new AbortController();
  const listen = (node, type, callback, options = {}) => node.addEventListener(type, callback, { ...options, signal: events.signal });
  let width, height, columns, rows, heat, dissolve, fieldWidth, fieldHeight, density;
  let pointer = null, previous = null, lastMove = 0, charge = null, shake = 0;
  let pacman = null, animation = 0, lastFrame = 0, firstFrame = performance.now(), visible = true;
  let heartSparks = [], wasHeart = false;
  let waves = [], targets = [], needsLayout = true, overControl = false, lastLayout = 0;

  let activeHeadline = null, arrowAngle = null, lastArrowFrame = 0;

  const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
  const hash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * .13) * 43758.5453;
    return n - Math.floor(n);
  };
  function resize() {
    width = innerWidth; height = innerHeight; density = Math.min(devicePixelRatio || 1, profile.pixelRatio);
    overlay.width = Math.round(width * density); overlay.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    const rect = field.getBoundingClientRect();
    fieldWidth = Math.max(1, rect.width); fieldHeight = Math.max(1, rect.height);
    field.width = Math.round(fieldWidth * density); field.height = Math.round(fieldHeight * density);
    background.setTransform(density, 0, 0, density, 0, 0);
    delete field.dataset.staticRendered;
    columns = Math.ceil(width / CELL); rows = Math.ceil(height / CELL);
    heat = new Float32Array(columns * rows);
    dissolve = new Float32Array(columns * rows);
    needsLayout = true;
  }
  function layout() {
    targets = [...document.querySelectorAll('main h2, .closer h2')].flatMap(element => {
      const box = element.getBoundingClientRect();
      if (!box.width || box.bottom <= 0 || box.top >= height || element.querySelector('button')) return [];
      const lines = [], walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        const clip = node.parentElement.closest('.roll-line, .craft-work__lead-line')?.getBoundingClientRect();
        for (const raw of range.getClientRects()) {
          const rect = { left: raw.left, right: raw.right, top: raw.top, bottom: raw.bottom };
          if (clip) {
            rect.left = Math.max(rect.left, clip.left); rect.right = Math.min(rect.right, clip.right);
            rect.top = Math.max(rect.top, clip.top); rect.bottom = Math.min(rect.bottom, clip.bottom);
          }
          if (rect.right <= rect.left || rect.bottom - rect.top < 2 || rect.bottom <= 0 || rect.top >= height) continue;
          const line = lines.find(line => Math.min(line.bottom, rect.bottom) - Math.max(line.top, rect.top) > Math.min(line.bottom - line.top, rect.bottom - rect.top) * .5);
          if (line) { line.left = Math.min(line.left, rect.left); line.right = Math.max(line.right, rect.right); line.top = Math.min(line.top, rect.top); line.bottom = Math.max(line.bottom, rect.bottom); }
          else lines.push(rect);
        }
      }
      if (!lines.length) return [];
      const rect = { left: Math.min(...lines.map(line => line.left)), right: Math.max(...lines.map(line => line.right)), top: Math.min(...lines.map(line => line.top)), bottom: Math.max(...lines.map(line => line.bottom)) };
      return [{ ...rect, element, width: rect.right - rect.left, height: rect.bottom - rect.top }];
    });
    needsLayout = false;
  }
  function deposit(x, y, amount, radius) {
    const cx = x / CELL, cy = y / CELL, spread = radius / CELL;
    const reach = Math.ceil(spread * 1.7);
    for (let r = Math.max(0, Math.floor(cy - reach)); r < Math.min(rows, cy + reach); r++) {
      for (let c = Math.max(0, Math.floor(cx - reach)); c < Math.min(columns, cx + reach); c++) {
        const d = ((c + .5 - cx) ** 2 + (r + .5 - cy) ** 2) / (spread * spread * .36);
        const index = r * columns + c;
        heat[index] = Math.min(1, heat[index] + amount * Math.exp(-d));
      }
    }
  }
  function trail(point, dt) {
    const from = previous || point, distance = Math.hypot(point.x - from.x, point.y - from.y);
    const count = Math.max(1, Math.min(48, Math.round(distance / (CELL * .8))));
    for (let i = 1; i <= count; i++) {
      const p = i / count;
      deposit(from.x + (point.x - from.x) * p, from.y + (point.y - from.y) * p, .16 * dt / (1000 / 60), coarse.matches || hero.getBoundingClientRect().bottom < point.y ? 45 : 90);
    }
    previous = { ...point };
  }
  function arrow(point, target, time) {
    overlay.dataset.arrowTargetX = String(Math.round(target.x));
    overlay.dataset.arrowTargetY = String(Math.round(target.y));
    const desiredAngle = Math.atan2(target.y - point.y, target.x - point.x);
    const elapsed = time - lastArrowFrame;
    if (arrowAngle === null || elapsed > 300) arrowAngle = desiredAngle;
    else {
      const difference = Math.atan2(Math.sin(desiredAngle - arrowAngle), Math.cos(desiredAngle - arrowAngle));
      arrowAngle += difference * (1 - Math.exp(-elapsed / 140));
    }
    lastArrowFrame = time;
    const angle = arrowAngle;
    overlay.dataset.arrowAngle = String(angle);
    const cosine = Math.cos(angle), sine = Math.sin(angle), length = 85;
    const pulse = (time * .0009) % 1, steps = Math.max(16, Math.round(length / (CELL * .5)));
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps, highlight = Math.exp(-(((progress - pulse) * 3) ** 2));
      deposit(point.x + cosine * length * progress, point.y + sine * length * progress, .5 + .46 * highlight, CELL * .95);
    }
    const tip = { x: point.x + cosine * length, y: point.y + sine * length };
    for (const side of [-1, 1]) {
      const angleBack = angle + Math.PI + side * .62, steps = Math.max(8, Math.round(34 / (CELL * .5)));
      for (let i = 0; i <= steps; i++) {
        deposit(tip.x + Math.cos(angleBack) * 34 * i / steps, tip.y + Math.sin(angleBack) * 34 * i / steps, .72, CELL * .95);
      }
    }
  }

  function drawPacman(point, dt, time) {
    if (!pacman) {
      pacman = { x: point.x, y: point.y, direction: point.x < width / 2 ? 1 : -1, start: point.x };
    }
    pacman.x += pacman.direction * dt * .156;
    const radius = 34;
    if (pacman.x > width + 50 || pacman.x < -50) {
      pacman.direction *= -1; pacman.x = pacman.direction > 0 ? -40 : width + 40;
      pacman.y = 100 + Math.random() * Math.max(1, height - 200); pacman.start = pacman.x;
    }
    const row = Math.round(pacman.y / CELL);
    for (let i = 1; i <= 80; i++) {
      const x = pacman.start + pacman.direction * 36 * i, col = Math.round(x / CELL);
      if (col >= 0 && col < columns && row >= 0 && row < rows && pacman.direction * (x - pacman.x) > radius) heat[row * columns + col] = .72;
    }
    const facing = pacman.direction > 0 ? 0 : Math.PI, mouth = .08 + .6 * Math.abs(Math.sin(time * .009));
    for (let r = Math.floor((pacman.y - radius) / CELL); r <= Math.ceil((pacman.y + radius) / CELL); r++) {
      for (let c = Math.floor((pacman.x - radius) / CELL); c <= Math.ceil((pacman.x + radius) / CELL); c++) {
        const dx = (c + .5) * CELL - pacman.x, dy = (r + .5) * CELL - pacman.y;
        const angle = Math.abs(((Math.atan2(dy, dx) - facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (c >= 0 && r >= 0 && c < columns && r < rows && dx * dx + dy * dy < radius * radius && angle > mouth) heat[r * columns + c] = .72;
      }
    }
  }
  const HEART = [[2,1],[3,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[2,4],[3,4],[4,4],[5,4],[6,4],[3,5],[4,5],[5,5],[4,6]];
  function overLetter(point) {
    if (!point) return false;
    return [...letterRegions].some(region => {
      const rect = region.getBoundingClientRect();
      return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
    });
  }
  function heartBoom(point) {
    // Craft's 16 radial sparks: 7–14px/frame, .88 drag, .06 life/frame.
    for (let i = 0; i < 16; i++) {
      const angle = i / 16 * Math.PI * 2, speed = 10 * (.7 + hash(i, point.x) * .7);
      heartSparks.push({ x: point.x, y: point.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
    }
  }
  function drawSprite(point, time, pattern = HEART) {
    if (!wasHeart) heartBoom(point);
    wasHeart = true;
    const column = Math.round(point.x / CELL), row = Math.round(point.y / CELL);
    for (const [x, y] of pattern) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const c = column + x * 2 + dx - 8, r = row + y * 2 + dy - 8;
      if (c < 0 || r < 0 || c >= columns || r >= rows) continue;
      const value = .86 + .12 * Math.sin((c * .6 + r * .6) - time * .006);
      heat[r * columns + c] = Math.max(heat[r * columns + c], value);
    }
    previous = { ...point }; pacman = null;
  }
  function nearestHeadline(point) {
    const inRange = (rect, margin) => point.x >= rect.left - margin && point.x <= rect.right + margin && point.y >= rect.top - margin && point.y <= rect.bottom + margin;
    const anchor = rect => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    const retained = targets.find(rect => rect.element === activeHeadline && inRange(rect, 190));
    if (retained) return anchor(retained);
    let nearest = null, best = Infinity;
    for (const rect of targets) {
      if (!inRange(rect, 150)) continue;
      const target = anchor(rect), distance = Math.hypot(point.x - target.x, point.y - target.y);
      if (distance < best) { best = distance; nearest = rect; }
    }
    activeHeadline = nearest?.element || null;
    return nearest ? anchor(nearest) : null;
  }

  function ambientField(x, y, time) {
    const seconds = motion.matches ? 2 : time * .001;
    let nx = x / width, ny = y / height;
      nx += Math.sin(ny * 5 + seconds * .5 + seed) * .05;
      ny += Math.cos(nx * 5 - seconds * .4) * .05;
      const wave = Math.sin(nx * 5.6 + seed * 1.3 + seconds * .3) * Math.cos(ny * 4.7 - seed * .7 + seconds * .22)
        + Math.sin((nx * 1.4 + ny * 1.7) * 4.1 - seed + seconds * .16)
        + Math.sin(ny * 9 + seed * 2.1 + nx * 3) * .5 + Math.sin(nx * 13 - seed * 1.7) * .28;
    const column = x / CELL, row = y / CELL;
    const ragged = Math.max(0, (Math.sin(column * .5 + seed) + Math.sin(column * .21 - seed * 1.3)) * .16 + hash(Math.floor(column / 2) + 3.3, Math.floor(row / 4)) * .6 + .15) * fieldHeight * .14;
    const threshold = clamp((y + ragged - fieldHeight * .48) / (fieldHeight * .42));
    const region = .5 + .5 * Math.sin(x / width * 2.1 + seconds * .12 + seed * .7) * Math.cos(y / height * 1.8 - seconds * .09 + seed * .3);
    if (region <= threshold) return 0;
    return .5 + .5 * (wave / 2.55) + (hash(x / CELL, y / CELL) - .5) * .12
      + Math.sin((x / CELL * .6 + y / CELL * .8) + seconds * 1.7) * .045;
  }
  function drawField(time, jitterX = 0, jitterY = 0) {
    const rect = field.getBoundingClientRect();
    background.clearRect(0, 0, fieldWidth, fieldHeight);
    background.save(); background.translate(jitterX, jitterY);
    const entrance = motion.matches ? 1 : clamp((time - firstFrame) / 1600);
    for (let y = 0; y < fieldHeight; y += CELL) for (let x = 0; x < fieldWidth; x += CELL) {
      const column = Math.floor((rect.left + x + CELL * .5) / CELL);
      const row = Math.floor((rect.top + y + CELL * .5) / CELL);
      const interaction = !motion.matches && column >= 0 && column < columns && row >= 0 && row < rows ? heat[row * columns + column] * .9 : 0;
      const value = ambientField(x, y, time) + interaction;
      if (value < .3 || hash(x / CELL + 11, y / CELL) > entrance) continue;
      background.fillStyle = value > .86 && value < 1.02 ? '#d8ff00' : COLORS[value >= .78 ? 3 : value >= .62 ? 2 : value >= .46 ? 1 : 0];
      background.fillRect(x, y, CELL - 1, CELL - 1);
    }
    background.restore();
  }
  function frame(now) {
    animation = requestAnimationFrame(frame);
    if (!visible || (lastFrame && now - lastFrame < profile.frameInterval - 1)) return;
    if (motion.matches && field.dataset.staticRendered) return;
    const dt = Math.min(50, now - (lastFrame || now)); lastFrame = now;
    if (needsLayout || now - lastLayout > 100) { layout(); lastLayout = now; }
    const heroRect = hero.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    if (motion.matches) {
      if (!field.dataset.staticRendered) { drawField(now); field.dataset.staticRendered = 'true'; }
      return;
    }
    const hit = !coarse.matches && pointer ? document.elementFromPoint(pointer.x, pointer.y) : null;
    const intro = document.querySelector('.hero__inner')?.getBoundingClientRect();
    const inHeroCopy = pointer && intro && pointer.x >= intro.left && pointer.x <= intro.right && pointer.y >= intro.top && pointer.y <= intro.bottom;
    const controlTarget = hit?.closest('a, button, [role="button"], [role="link"], .craft-button, input, select, textarea, summary, [data-nav-toggle], [data-cursor-exclude]');
    const control = controlTarget && !controlTarget.matches('#builder .craft-work__card[data-builder-href]');
    if (control || inHeroCopy) {
      if (!overControl) { heat.fill(0); dissolve.fill(0); waves = []; heartSparks = []; wasHeart = false; charge = null; shake = 0; pacman = null; previous = null; }
      overControl = true; overlay.dataset.cursorMode = 'disabled';
      if (heroRect.bottom > 0 && heroRect.top < height) drawField(now);
      return;
    }
    if (overControl) { previous = null; lastMove = now; overControl = false; }
    const frameScale = dt / (1000 / 60);
    for (let i = 0; i < heat.length; i++) {
      if (dissolve[i] > 0 && Math.floor(i / columns) * CELL > heroRect.bottom) {
        dissolve[i] -= .007 * frameScale;
        if (dissolve[i] <= 0) { dissolve[i] = 0; heat[i] = 0; }
        else if (dissolve[i] < .3) heat[i] *= Math.pow(.88, frameScale);
        else heat[i] = Math.max(heat[i] * Math.pow(.95, frameScale), .9);
      } else {
        dissolve[i] = 0; heat[i] *= Math.pow(coarse.matches ? .85 : .878, frameScale);
      }
    }
    if (coarse.matches) {
      const target = targets.find(rect => rect.top > height * .2 && rect.top < height * .65);
      const desired = target ? { x: Math.max(55, target.left + target.width * .5), y: target.top - 65 } :
        { x: width * (.5 + .3 * Math.sin(scrollY * .0026)), y: height * (.5 + .15 * Math.sin(scrollY * .0052)) };
      pointer ||= desired;
      pointer.x += (desired.x - pointer.x) * .1; pointer.y += (desired.y - pointer.y) * .1;
      if (overLetter(pointer)) drawSprite(pointer, now);
      else if (target) arrow(pointer, { x: target.left + target.width / 2, y: target.top + target.height / 2 }, now);
      else trail(pointer, dt);
    } else if (pointer) {
      const headline = nearestHeadline(pointer), idle = now - lastMove;
      if (overLetter(pointer)) drawSprite(pointer, now);
      else if (idle > (headline ? 2400 : 1500) && !charge) drawPacman(pointer, dt, now);
      else if (headline) { arrow(pointer, headline, now); previous = { ...pointer }; }
      else trail(pointer, dt);
    }
    const heartActive = overLetter(pointer);
    if (!heartActive) wasHeart = false;
    overlay.dataset.cursorMode = heartActive ? 'heart' : 'default';
    // Deposit narrow moving sparks into the existing heat field so their
    // trails use the same color bands and fade as the reference.
    const drag = Math.pow(.88, frameScale);
    const travel = (1 - drag) / (1 - .88);
    for (let i = heartSparks.length - 1; i >= 0; i--) {
      const spark = heartSparks[i];
      spark.x += spark.vx * travel; spark.y += spark.vy * travel;
      spark.vx *= drag; spark.vy *= drag; spark.life -= .06 * frameScale;
      if (spark.life <= 0) { heartSparks.splice(i, 1); continue; }
      deposit(spark.x, spark.y, .45 + .45 * spark.life, CELL * 1.6);
    }
    if (charge) {
      const amount = clamp((now - charge.started) / 2200);
      deposit(charge.x, charge.y, (.45 + amount * .5) * frameScale, 90 * (2 + amount * 8));
      shake = Math.max(shake, .12 + amount * .35);
    }
    waves = waves.filter(wave => now - wave.started < 1500);
    for (const wave of waves) {
      const age = (now - wave.started) / 1500, radius = age * Math.hypot(width, height) * 2.55;
      const spread = CELL * 5.5 * wave.power;
      for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
        const distance = Math.hypot((c + .5) * CELL - wave.x, (r + .5) * CELL - wave.y);
        const value = Math.exp(-((distance - radius) ** 2) / (2 * spread * spread)) * (1 - age) * 1.2 * wave.power;
        const index = r * columns + c;
        if (value > .02 && value > heat[index]) heat[index] = value;
        if ((r + .5) * CELL > heroRect.bottom && value > .25 && dissolve[index] === 0) dissolve[index] = .45 + hash(c, r) * .7;
      }
    }
    if (shake > .01) shake *= Math.pow(.9, frameScale); else shake = 0;
    const jitterX = (Math.random() - .5) * shake * 20, jitterY = (Math.random() - .5) * shake * 20;
    if (heroRect.bottom > 0 && heroRect.top < height) drawField(now, jitterX, jitterY);
    context.save(); context.translate(jitterX, jitterY);
    const fieldRect = field.getBoundingClientRect();
    for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
      let value = heat[r * columns + c] * .9;
      const x = c * CELL - fieldRect.left, y = r * CELL - fieldRect.top;
      const inField = x >= 0 && x < fieldWidth && y >= 0 && y < fieldHeight;
      if (inField) continue;
      if (value < .3) continue;
      context.fillStyle = value >= .86 && value < 1.02 ? '#d8ff00' : COLORS[value >= .78 ? 3 : value >= .62 ? 2 : value >= .46 ? 1 : 0];
      context.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
    }
    // Composite hero interactions on the artwork's document-aligned cell grid.
    // Sampling the same local coordinates keeps noise/shapes stable during scroll.
    if (fieldRect.bottom > 0 && fieldRect.top < height) {
      const firstRow = Math.max(0, Math.floor(-fieldRect.top / CELL) * CELL);
      const lastRow = Math.min(fieldHeight, height - fieldRect.top);
      for (let y = firstRow; y < lastRow; y += CELL) for (let x = 0; x < fieldWidth; x += CELL) {
        const column = Math.floor((fieldRect.left + x + CELL * .5) / CELL);
        const row = Math.floor((fieldRect.top + y + CELL * .5) / CELL);
        if (column < 0 || column >= columns || row < 0 || row >= rows) continue;
        const interaction = heat[row * columns + column] * .9;
        if (interaction < .02) continue;
        const value = ambientField(x, y, now) + interaction;
        if (value < .3) continue;
        context.fillStyle = value >= .86 && value < 1.02 ? '#d8ff00' : COLORS[value >= .78 ? 3 : value >= .62 ? 2 : value >= .46 ? 1 : 0];
        context.fillRect(fieldRect.left + x, fieldRect.top + y, CELL - 1, CELL - 1);
      }
    }
    context.restore(); context.globalAlpha = 1;
    if (intro && intro.bottom > 0 && intro.top < height) context.clearRect(intro.left, intro.top, intro.width, intro.height);
    // The transient cursor paints above content; no rectangular text masks.
  }
  listen(window, 'pointermove', event => {
    if (coarse.matches || motion.matches) return;
    pointer = { x: event.clientX, y: event.clientY }; lastMove = performance.now(); pacman = null;
  }, { passive: true });
  listen(window, 'pointerdown', event => {
    if (motion.matches || coarse.matches || event.button !== 0 || event.target.closest('.hero__inner, [data-craft-work-viewport]') || event.target.closest('a, button, [role=button], input, textarea, select, [data-cursor-exclude], .tsnav, .consent')) return;
    charge = { x: event.clientX, y: event.clientY, started: performance.now() };
  }, { passive: true });
  listen(window, 'pointerup', event => {
    if (event.target.closest('.hero__inner, [data-craft-work-viewport], a, button, [role=button], input, textarea, select, [data-cursor-exclude], .tsnav, .consent')) { charge = null; return; }
    if (!charge) return;
    const amount = clamp((performance.now() - charge.started) / 2200);
    const power = .35 + amount * 2.1;
    waves.push({ ...charge, started: performance.now(), power });
    deposit(charge.x, charge.y, 1, 90 * (2.5 + amount * 18));
    shake = .45 + amount * 1.9; charge = null;
  }, { passive: true });
  listen(window, 'pointercancel', () => { charge = null; });
  listen(window, 'blur', () => { charge = null; });
  listen(window, 'dblclick', event => {
    if (motion.matches || event.target.closest('.hero__inner, [data-craft-work-viewport], a, button, [role=button], input, [data-cursor-exclude], .tsnav, .consent')) return;
    waves.push({ x: event.clientX, y: event.clientY, started: performance.now(), power: 2.8 }); shake = 1.4;
  });
  listen(window, 'scroll', () => { needsLayout = true; if (!coarse.matches) { lastMove = performance.now(); pacman = null; } }, { passive: true });
  listen(window, 'resize', resize, { passive: true });
  listen(document, 'visibilitychange', () => { visible = !document.hidden; });
  listen(motion, 'change', () => { heat.fill(0); dissolve.fill(0); waves = []; heartSparks = []; wasHeart = false; charge = null; delete field.dataset.staticRendered; });
  const observer = new ResizeObserver(resize); observer.observe(field);
  const uiObserver = new MutationObserver(() => { needsLayout = true; });
  uiObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-nav-status', 'hidden', 'open'] });
  resize(); animation = requestAnimationFrame(frame);
  window.__craftFieldCleanup = () => { cancelAnimationFrame(animation); events.abort(); observer.disconnect(); uiObserver.disconnect(); overlay.remove(); delete window.__craftFieldCleanup; delete window.__craftFieldCanvas; };
}

