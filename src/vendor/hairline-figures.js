// Hairline 0.5.1 (MIT), tree-shaken to Vault, Slow and Elevator.
// Local adaptation: springs, tours, tween duration and delays run at 1.3x.
// Source: @lucasmarkes/hairline/dist/index.js; license: /licenses/hairline-LICENSE.txt
// node_modules/@lucasmarkes/hairline/dist/index.js
var LIGHT = { plate: "#ffffff", hi: "#232327", edge: "#a4a4ac", mid: "#c3c3c9", lo: "#e0e0e4" };
var DARK = { plate: "#08090a", hi: "#d0d6e0", edge: "#5b5d64", mid: "#3e3e44", lo: "#29292d" };
var KEYS = ["plate", "hi", "edge", "mid", "lo"];
var vars = (p) => KEYS.map((k) => `--hl-${k}:var(--hairline-${k},${p[k]});`).join("");
var EASE = "cubic-bezier(0.5,0,0.1,1)";
var SVG = ":where([data-hairline]>svg)";
function css(lightDark) {
  const both = Object.fromEntries(KEYS.map((k) => [k, `light-dark(${LIGHT[k]},${DARK[k]})`]));
  return [
    // the box, and the palette: light unless something below says otherwise
    `:where([data-hairline]){display:block;position:relative;aspect-ratio:5/4;touch-action:pan-y;user-select:none;-webkit-user-select:none;--hl-sw:var(--hairline-stroke,0.9);${vars(LIGHT)}}`,
    // the page's color-scheme
    lightDark ? `:where([data-hairline]){${vars(both)}}` : "",
    // an ancestor that says dark
    `:where(.dark,[data-theme="dark"]) :where([data-hairline]){${vars(DARK)}}`,
    // the figure's own theme option
    `:where([data-hairline][data-hairline-theme="light"]){${vars(LIGHT)}}`,
    `:where([data-hairline][data-hairline-theme="dark"]){${vars(DARK)}}`,
    `:where([data-hairline]:focus-visible){outline:1.5px solid var(--hl-hi);outline-offset:2px}`,
    `${SVG}{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    // Riffle's live region: read, not seen
    `:where([data-hairline]>[data-hairline-live]){position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
    // the drawing: plates are filled with the plate colour and painted back to front
    `${SVG} :where(path,polygon,ellipse,line){fill:var(--hl-plate);stroke:var(--hl-mid);stroke-width:var(--hl-sw);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;transition:stroke 260ms ${EASE}}`,
    `${SVG} :where(.nf){fill:none}`,
    `${SVG} :where(.fo){stroke:none}`,
    `${SVG} :where(.sil){stroke:var(--hl-edge)}`,
    `${SVG} :where(.hi){stroke:var(--hl-hi)}`,
    `${SVG} :where(.lo){stroke:var(--hl-lo)}`,
    `${SVG} :where(.dash){stroke-dasharray:1 3}`,
    `${SVG} :where(.dot){stroke:none;fill:var(--hl-hi);transition:fill 260ms ${EASE}}`,
    `${SVG} :where(.dot.m){fill:var(--hl-edge)}`,
    `${SVG} :where(.dot.off){fill:var(--hl-lo)}`,
    `${SVG} :where(.ghost path){fill:none;stroke:var(--hl-mid)}`
  ].join("");
}
var done = /* @__PURE__ */ new WeakSet();
function inject(root) {
  if (done.has(root)) return;
  done.add(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc.defaultView;
  const text = css(!!win?.CSS?.supports?.("color", "light-dark(#000,#fff)"));
  if (win && "adoptedStyleSheets" in root) {
    try {
      const sheet = new win.CSSStyleSheet();
      sheet.replaceSync(text);
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      return;
    } catch {
    }
  }
  const style = doc.createElement("style");
  style.setAttribute("data-hairline-style", "");
  style.textContent = text;
  (root.nodeType === 9 ? doc.head ?? doc.documentElement : root).appendChild(style);
}
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
var lerp = (a, b, t) => a + (b - a) * t;
var rad = (d) => d * Math.PI / 180;
var r2 = (n) => Math.round(n * 100) / 100;
var poly = (pts) => "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L") + "Z";
var seg = (a, b) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
var open = (pts) => pts.length < 2 ? "" : "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L");
var Cam = (azDeg, k, S9) => ({ az: rad(azDeg), k, S: S9, ox: 0, oy: 0 });
function proj(C) {
  const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
  return (x, y, z) => {
    const X = x * c - y * s, Y = x * s + y * c;
    return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
  };
}
function unproj(C, sx, sy, z) {
  const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
  const X = (sx - C.ox) / C.S, Y = ((sy - C.oy) / C.S + z * zf) / C.k;
  return [X * c + Y * s, -X * s + Y * c];
}
function fit(C, pts, cx, cy) {
  C.ox = 0;
  C.oy = 0;
  const P = proj(C);
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (const p of pts) {
    const q = P(p[0], p[1], p[2]);
    a = Math.min(a, q[0]);
    b = Math.max(b, q[0]);
    c = Math.min(c, q[1]);
    d = Math.max(d, q[1]);
  }
  C.ox = cx - (a + b) / 2;
  C.oy = cy - (c + d) / 2;
}
function rrect(u0, v0, u1, v1, r, n = 4) {
  r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  const out = [];
  for (const [cu, cv, a0] of [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180], [u1 - r, v0 + r, 270]])
    for (let k = 0; k <= n; k++) {
      const a = rad(a0 + 90 * k / n), ca = Math.cos(a), sa = Math.sin(a);
      out.push({ u: cu + r * ca, v: cv + r * sa, nu: ca, nv: sa });
    }
  return out;
}
function circ(R9, n = 96) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    out.push({ u: R9 * ca, v: R9 * sa, nu: ca, nv: sa });
  }
  return out;
}
function hull(input) {
  const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) {
    while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}
var ringAt = (P, ring, z) => ring.map((q) => P(q.u, q.v, z));
var facing = (C) => {
  const s = Math.sin(C.az), c = Math.cos(C.az);
  return (q) => q.nu * s + q.nv * c >= -1e-6;
};
function run(ring, keep) {
  const n = ring.length;
  let s = -1;
  for (let i = 0; i < n; i++) if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
    s = i;
    break;
  }
  if (s < 0) return keep(ring[0]) ? ring.slice() : [];
  const out = [];
  for (let k = 0; k < n && keep(ring[(s + k) % n]); k++) out.push(ring[(s + k) % n]);
  return out;
}
function prism(P, front2, ring, inner3, z0, z1) {
  return {
    sil: poly(hull(ringAt(P, ring, z1).concat(ringAt(P, ring, z0)))),
    crease: inner3 ? open(ringAt(P, run(inner3, front2), z1)) : ""
  };
}
var rings = (x0, y0, x1, y1, r, b) => [
  rrect(x0, y0, x1, y1, r),
  rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b))
];
function fillet(pts, rs, n = 4) {
  const m = pts.length, out = [];
  for (let i = 0; i < m; i++) {
    const a = pts[(i + m - 1) % m], p = pts[i], b = pts[(i + 1) % m];
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const t = Math.min(rs[i], la / 2, lb / 2);
    const p1 = [p[0] + (a[0] - p[0]) / la * t, p[1] + (a[1] - p[1]) / la * t];
    const p2 = [p[0] + (b[0] - p[0]) / lb * t, p[1] + (b[1] - p[1]) / lb * t];
    for (let k = 0; k <= n; k++) {
      const s = k / n, w = 1 - s;
      out.push([w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0], w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1]]);
    }
  }
  return out;
}
var reduced = false;
var setReducedMotion = (on) => {
  reduced = on;
};
var reducedMotion = () => reduced;
function spring(x, o = {}) {
  return { x, v: 0, t: x, k: o.k ?? 100, c: o.c ?? 18, m: o.m ?? 1, eps: o.eps ?? 0.01 };
}
function stepS(sp, dt) {
  if (reduced) {
    sp.x = sp.t;
    sp.v = 0;
    return false;
  }
  const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
  for (let i = 0; i < n; i++) {
    const a = (-sp.k * (sp.x - sp.t) - sp.c * sp.v) / sp.m;
    sp.v += a * h;
    sp.x += sp.v * h;
  }
  if (Math.abs(sp.x - sp.t) < sp.eps && Math.abs(sp.v) < sp.eps * 10) {
    sp.x = sp.t;
    sp.v = 0;
    return false;
  }
  return true;
}
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax2 = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (u) => ((ax2 * u + bx) * u + cx) * u;
  const Y = (u) => ((ay * u + by) * u + cy) * u;
  const dX = (u) => (3 * ax2 * u + 2 * bx) * u + cx;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 8; i++) {
      const e = X(u) - t;
      if (Math.abs(e) < 1e-5) break;
      const d = dX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    if (!(u >= 0 && u <= 1) || Math.abs(X(u) - t) > 1e-4) {
      let lo = 0, hi = 1;
      u = t;
      for (let i = 0; i < 24; i++) {
        if (X(u) < t) lo = u;
        else hi = u;
        u = (lo + hi) / 2;
      }
    }
    return Y(u);
  };
}
var EASE_LIFT = bezier(0.32, 0.72, 0, 1);
var tween = (v, dur = 700) => ({ from: v, to: v, t0: -1e9, dur: dur / 1.3 });
var tval = (tw, now) => {
  const p = clamp((now - tw.t0) / tw.dur, 0, 1);
  return tw.from + (tw.to - tw.from) * (reduced ? 1 : EASE_LIFT(p));
};
var tset = (tw, to, now, delay) => {
  if (tw.to === to) return;
  tw.from = tval(tw, now);
  tw.to = to;
  tw.t0 = now + delay / 1.3;
};
var tdone = (tw, now) => reduced || now >= tw.t0 + tw.dur;
var NS = "http://www.w3.org/2000/svg";
function mk(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}
function solid(parent) {
  const g = mk("g", {}, parent);
  return { g, sil: mk("path", { class: "sil" }, g), cr: mk("path", { class: "nf lo" }, g) };
}
var put = (el, s) => {
  el.sil.setAttribute("d", s.sil);
  el.cr.setAttribute("d", s.crease);
};
var flatDot = (parent, C, r, cls) => mk("ellipse", { rx: r2(r * C.S), ry: r2(r * C.S * C.k), class: cls }, parent);
var place = (el, q) => {
  el.setAttribute("cx", String(r2(q[0])));
  el.setAttribute("cy", String(r2(q[1])));
};
var boards = [];
var byStage = /* @__PURE__ */ new Map();
var raf = 0;
var last = 0;
var io = null;
var rm = null;
function frame() {
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1e3)) * 1.3;
  last = now;
  let any = false;
  for (const b of boards.slice()) if (b.vis && b.awake) {
    try {
      b.awake = !!b.tick(dt, now);
    } catch (err) {
      b.awake = false;
      setTimeout(() => {
        throw err;
      });
    }
    any = any || b.awake;
  }
  raf = any ? requestAnimationFrame(frame) : 0;
}
function wake(b) {
  b.awake = true;
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}
var onMotion = () => {
  setReducedMotion(!!rm?.matches);
  boards.forEach(wake);
};
function start() {
  if (io) return;
  io = new IntersectionObserver((es) => {
    for (const e of es) {
      const set = byStage.get(e.target);
      if (!set) continue;
      for (const b of set) {
        b.vis = e.isIntersecting;
        if (b.vis) wake(b);
      }
    }
  }, { rootMargin: "80px" });
  rm = matchMedia("(prefers-reduced-motion: reduce)");
  setReducedMotion(rm.matches);
  rm.addEventListener("change", onMotion);
}
function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  io?.disconnect();
  io = null;
  rm?.removeEventListener("change", onMotion);
  rm = null;
}
function register(stage, tick) {
  start();
  const b = { stage, tick, vis: false, awake: true };
  boards.push(b);
  const peers = byStage.get(stage);
  if (peers) {
    for (const p of peers) b.vis = p.vis;
    peers.add(b);
    if (b.vis) wake(b);
  } else {
    byStage.set(stage, /* @__PURE__ */ new Set([b]));
    io.observe(stage);
  }
  tick(0, performance.now());
  let gone = false;
  return {
    wake: () => {
      if (!gone) wake(b);
    },
    unregister: () => {
      if (gone) return;
      gone = true;
      boards = boards.filter((x) => x !== b);
      const set = byStage.get(stage);
      if (set) {
        set.delete(b);
        if (!set.size) {
          byStage.delete(stage);
          io?.unobserve(stage);
        }
      }
      if (!boards.length) stop();
    }
  };
}
var handlers = /* @__PURE__ */ new WeakMap();
var touring = /* @__PURE__ */ new WeakMap();
function pointer(stage, on) {
  handlers.set(stage, on);
  let tm = 0;
  const pt = (e) => {
    const r = stage.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 400, (e.clientY - r.top) / r.height * 320];
  };
  const move = (e) => {
    clearTimeout(tm);
    touring.get(stage)?.hold();
    on.move(pt(e), e);
  };
  const down = (e) => {
    clearTimeout(tm);
    touring.get(stage)?.hold();
    if (e.pointerType !== "mouse") stage.releasePointerCapture?.(e.pointerId);
    if (on.down) on.down(pt(e), e);
    else on.move(pt(e), e);
  };
  const leave = (e) => {
    clearTimeout(tm);
    tm = window.setTimeout(() => {
      on.leave(e);
      touring.get(stage)?.release();
    }, e.pointerType === "mouse" ? 0 : 1400);
  };
  stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerdown", down);
  stage.addEventListener("pointerleave", leave);
  return () => {
    clearTimeout(tm);
    if (handlers.get(stage) === on) handlers.delete(stage);
    stage.removeEventListener("pointermove", move);
    stage.removeEventListener("pointerdown", down);
    stage.removeEventListener("pointerleave", leave);
  };
}
var LAP = [[128, 150], [200, 118], [272, 150], [200, 206], null];
var TRAVEL = 900;
var DWELL = 1200;
var REST = 1800;
var RESUME = 1200;
var STAGGER = 450;
var GHOST = { pointerType: "ghost" };
var started = 0;
function entry([x, y]) {
  const dx = x - 200, dy = y - 160;
  if (!dx && !dy) return [200, 320];
  const k = Math.min(dx ? (dx > 0 ? 200 : -200) / dx : Infinity, dy ? (dy > 0 ? 160 : -160) / dy : Infinity);
  return [200 + dx * k, 160 + dy * k];
}
function tour(stage, stops, onStop) {
  let i = 0;
  let wait = RESUME + STAGGER * (started++ % 4);
  let t = -1;
  let at2 = null;
  let origin = [200, 320];
  let hand = false, keys2 = stage.contains(stage.ownerDocument.activeElement);
  let gone = false;
  const leave = () => {
    at2 = null;
    t = -1;
    handlers.get(stage)?.leave(GHOST);
  };
  const tick = (dt) => {
    if (hand || keys2 || !stops.length) return false;
    if (reducedMotion()) {
      if (at2) leave();
      return false;
    }
    if (wait > 0) {
      wait -= dt * 1e3;
      return true;
    }
    const stop2 = stops[i];
    if (stop2 === null) {
      if (at2) leave();
      onStop?.(i);
      i = (i + 1) % stops.length;
      wait = REST;
      return true;
    }
    const h = handlers.get(stage);
    if (!h) return true;
    if (t < 0) {
      origin = at2 ?? entry(stop2);
      t = 0;
    }
    t = Math.min(TRAVEL, t + dt * 1e3);
    const k = EASE_LIFT(t / TRAVEL);
    at2 = [origin[0] + (stop2[0] - origin[0]) * k, origin[1] + (stop2[1] - origin[1]) * k];
    h.move(at2, GHOST);
    if (t < TRAVEL) return true;
    onStop?.(i);
    i = (i + 1) % stops.length;
    t = -1;
    wait = DWELL;
    return true;
  };
  const take = () => {
    at2 = null;
    t = -1;
  };
  const give = () => {
    if (hand || keys2) return;
    i = 0;
    t = -1;
    wait = RESUME;
    board.wake();
  };
  const me = {
    hold: () => {
      hand = true;
      take();
    },
    release: () => {
      if (!hand) return;
      hand = false;
      give();
    }
  };
  const focusIn = () => {
    keys2 = true;
    take();
  };
  const focusOut = (e) => {
    if (keys2 && !stage.contains(e.relatedTarget)) {
      keys2 = false;
      give();
    }
  };
  stage.addEventListener("focusin", focusIn);
  stage.addEventListener("focusout", focusOut);
  touring.set(stage, me);
  const board = register(stage, tick);
  return {
    stop: () => {
      if (gone) return;
      gone = true;
      board.unregister();
      stage.removeEventListener("focusin", focusIn);
      stage.removeEventListener("focusout", focusOut);
      if (touring.get(stage) === me) touring.delete(stage);
      if (at2) leave();
    }
  };
}
function disposer() {
  let fns = [];
  return {
    add: (fn) => {
      fns.push(fn);
    },
    on: (target, type, fn, opts) => {
      const h = fn;
      target.addEventListener(type, h, opts);
      fns.push(() => target.removeEventListener(type, h, opts));
    },
    dispose: () => {
      const run2 = fns;
      fns = [];
      for (let i = run2.length - 1; i >= 0; i--) run2[i]();
    }
  };
}
var TABLE = {
  riffle: [0, 40, 90],
  // stagger, ms
  terrain: [1.5, 3, 5],
  // radius, cells
  exploded: [12, 28, 40],
  // gap, viewBox units
  phosphor: [150, 520, 1500],
  // afterglow, ms
  slow: [0.6, 0.2, 0.05],
  // rate, × normal speed
  turntable: [200, 650, 1500],
  // coast, ms
  keyboard: [1, 2, 3.5],
  // radius, keys
  elevator: [40, 100, 220],
  // stiffness, spring units
  phone: [16, 28, 40],
  // gap, viewBox units
  laptop: [100, 125, 150],
  // lid, degrees
  terminal: [1, 2, 3.5],
  // spread, lines
  cabinet: [1.5, 3, 5],
  // reach, blades
  branches: [1, 3, 6],
  // reach, commits
  vault: [250, 600, 1500],
  // coast, ms
  lockers: [55, 90, 120],
  // opening, degrees
  padlock: [45, 90, 100],
  // swing, degrees
  patch: [1, 2.5, 5],
  // radius, ports
  dish: [30, 50, 70],
  // reach, degrees
  router: [0.5, 1.5, 3],
  // spread, antennas
  loupe: [1.3, 1.8, 2.6],
  // magnification, ×
  sieve: [6, 14, 24],
  // gap, viewBox units
  rail: [1, 2, 3.5],
  // radius, hangers
  plug: [0.35, 0.6, 0.9],
  // pull, fraction of the way to the socket
  query: [20, 40, 55],
  // turn, degrees; past 55 the hook folds over itself and stops reading as one
  drawer: [12, 22, 34],
  // pull, viewBox units
  basket: [8, 16, 28],
  // tilt, degrees
  plot: [3, 6, 12],
  // lift, viewBox units
  hub: [10, 16, 24],
  // rise, viewBox units
  relay: [40, 120, 220],
  // delay, ms per hop
  settle: [90, 120, 150],
  // reach, viewBox units from the hub
  format: [9, 12, 14],
  // disorder, degrees of the worst skew
  rebuild: [8, 14, 20],
  // rise, viewBox units
  stack: [22, 34, 46]
  // lift, viewBox units
};
var DEFAULT = 0.5;
function intensity(value) {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return DEFAULT;
  return Math.min(1, Math.max(0, n));
}
function parameter(figure, value) {
  const [lo, mid, hi] = TABLE[figure];
  const i = intensity(value);
  const v = i <= 0.5 ? lo + i / 0.5 * (mid - lo) : mid + (i - 0.5) / 0.5 * (hi - mid);
  return Math.round(v * 1e3) / 1e3;
}
var NS2 = "http://www.w3.org/2000/svg";
var mounted = /* @__PURE__ */ new WeakMap();
var report = (err) => {
  if (typeof reportError === "function") reportError(err);
  else setTimeout(() => {
    throw err;
  });
};
function create(spec, el, options) {
  if (typeof document === "undefined") {
    throw new Error(`hairline: ${spec.id}() needs a DOM. Call it in the browser, once the element exists: in an effect, in onMount, or in a script after the element.`);
  }
  if (!el || el.nodeType !== 1) {
    throw new TypeError(`hairline: ${spec.id}() takes an element as its first argument, and got ${el === null ? "null" : typeof el}.`);
  }
  mounted.get(el)?.();
  const opts = { ...options };
  const doc = el.ownerDocument;
  const root = el.getRootNode();
  inject(root.nodeType === 9 || "host" in root ? root : doc);
  const owned = /* @__PURE__ */ new Set();
  const attr = (name, value2) => {
    if (!owned.has(name) && el.hasAttribute(name)) return;
    if (value2 === null) {
      el.removeAttribute(name);
      owned.delete(name);
    } else {
      el.setAttribute(name, value2);
      owned.add(name);
    }
  };
  const dress = () => {
    attr("data-hairline-theme", opts.theme === "light" || opts.theme === "dark" ? opts.theme : null);
    attr("aria-label", el.hasAttribute("aria-labelledby") ? null : typeof opts.label === "string" ? opts.label : spec.label);
  };
  attr("data-hairline", spec.id);
  attr("role", spec.focusable ? "group" : "img");
  if (spec.focusable) attr("tabindex", "0");
  dress();
  const svg = doc.createElementNS(NS2, "svg");
  svg.setAttribute("viewBox", "0 0 400 320");
  svg.setAttribute("aria-hidden", "true");
  el.appendChild(svg);
  let live = null;
  if (spec.focusable) {
    live = doc.createElement("span");
    live.setAttribute("data-hairline-live", "");
    live.setAttribute("aria-live", "polite");
    el.appendChild(live);
  }
  let text = null;
  let playing = null;
  const read = {
    get textContent() {
      return text;
    },
    set textContent(value2) {
      const next = value2 ?? "";
      if (next === text) return;
      text = next;
      if (live && live.textContent !== next && (!playing || next === spec.rest || el.matches(":hover, :focus-within"))) live.textContent = next;
      const fn = opts.onRead;
      if (typeof fn === "function") try {
        fn(next);
      } catch (err) {
        report(err);
      }
    }
  };
  let value = parameter(spec.id, opts.intensity);
  playing = opts.play === true ? tour(el, spec.tour ?? LAP) : null;
  let engine;
  try {
    engine = spec.engine({ stage: el, svg, read }, value);
  } catch (err) {
    playing?.stop();
    throw err;
  }
  if (text === null) read.textContent = spec.rest;
  let dead = false;
  const destroy = () => {
    if (dead) return;
    dead = true;
    if (mounted.get(el) === destroy) mounted.delete(el);
    playing?.stop();
    playing = null;
    engine.destroy();
    svg.remove();
    live?.remove();
    for (const name of owned) el.removeAttribute(name);
    owned.clear();
  };
  mounted.set(el, destroy);
  return {
    update(next) {
      if (dead || !next) return;
      const own = opts, given = next;
      for (const k in given) {
        if (given[k] === void 0) delete own[k];
        else own[k] = given[k];
      }
      const v = parameter(spec.id, opts.intensity);
      if (v !== value) {
        value = v;
        engine.set(v);
      }
      const play = opts.play === true;
      if (play !== !!playing) {
        playing?.stop();
        playing = play ? tour(el, spec.tour ?? LAP) : null;
      }
      dress();
    },
    destroy
  };
}
var HH = 30;
var GRIP = 9;
var GRIPS = [[-GRIP, HH], [GRIP, HH]];
var D = 30;
var FY = 58;
var RT2 = 2.6;
var PH = 2.4;
var CH = 6;
var BX1 = 7 * D + 15;
var BY1 = FY + 14;
var ZTOP = RT2 + PH + CH;
var N2 = 12;
var U = 10.4;
var BH = 9.6;
var W = 84;
var X1 = W + 10;
var ZB = 11;
var ZT = ZB + (N2 - 1) * U + BH;
var H2 = ZT + 6;
var R = 26;
var FOC = 17;
var DEP = R * R / (4 * FOC);
var N3 = 3;
var Z02 = 5;
var M = 3;
var PITCH = 26;
var ZB3 = Z02 + M;
var H3 = ZB3 + N3 * PITCH + M;
var SX = 32;
var SY = 34;
var FH = 36;
var CH2 = 25;
var T3 = 2.5;
var NF = 4;
var TOP = 3 * FH + CH2 + 7;
var CAR = [5, 7, 28, 27];
var RX = 16.5;
var CW = [-8, 11, -2, 23];
var CWH = 17;
var WALL = 2;
var BASE = fillet([[-16, -2], [33, -2], [33, -56], [76, -56], [76, 38], [-16, 38]], [3, 2, 4, 6, 6, 6]);
var FLOOR = fillet([[33, -56], [72, -56], [72, -6], [43, -6], [43, 34], [33, 34]], [4, 4, 4, 3, 3, 3]);
var CWX = (CW[0] + CW[2]) / 2;
var SR = (RX - CWX) / 2;
var SC = [CWX + SR, SY / 2, TOP + 3 + SR + 2];
var REST_Z = 1.5 * FH - 4;
var NAMES = ["ground", "floor 1", "floor 2", "floor 3"];
var mount6 = ({ stage, svg, read }, value) => {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.3);
  fit(C, [[-16, -56, -8], [76, 38, -8], [76, -56, -8], [-16, 38, -8], [SC[0], SC[1], SC[2] + SR]], 200, 166);
  const P = proj(C), front2 = facing(C);
  const g = mk("g", {}, svg);
  const block = (box, r, b, z0, z1) => {
    const [o, i] = rings(...box, r, b);
    put(solid(g), prism(P, front2, o, i, z0, z1));
  };
  const line = (cls) => mk("path", { class: cls }, g);
  const slab4 = (pts, z0, z1) => {
    const n = pts.length, near = pts.map((p, i) => {
      const q = pts[(i + 1) % n];
      return q[1] - p[1] - (q[0] - p[0]) > 0;
    });
    const runOf = (want) => {
      const s = near.findIndex((f, i) => f === want && near[(i + n - 1) % n] !== want), out = [];
      for (let i = s; near[i % n] === want; i++) out.push(pts[i % n]);
      return out.concat([pts[(s + out.length) % n]]);
    };
    const at2 = (r, z) => r.map((p) => P(p[0], p[1], z)), back = runOf(false), fore = runOf(true);
    const sil = mk("path", { class: "sil", d: poly(at2(back, z1).concat(at2(fore, z0))) }, g);
    mk("path", { class: "nf lo", d: open(at2(fore, z1)) }, g);
    return sil;
  };
  slab4(BASE, -8, -T3);
  block([-14 - WALL, -WALL, -14, SY], 1, 0.5, -T3, TOP);
  block([-14, -WALL, SX, 0], 1, 0.5, -T3, TOP);
  block([RX - 1.3, 3, RX + 1.3, 5.4], 0.8, 0.5, -T3, TOP);
  const [cwo, cwi] = rings(...CW, 1.6, 0.8);
  const cw = solid(g), cwBands = line("nf lo"), cwRope = line("nf");
  const [co, ci] = rings(...CAR, 2.4, 1.1);
  const car = solid(g), door = line("nf"), split = line("nf lo");
  const [ho, hi] = rings(RX - 1.7, 5.4, RX + 1.7, 28.6, 0.8, 0.5);
  const head = solid(g), rope = line("nf");
  block([RX - 1.3, 28.6, RX + 1.3, 31], 0.8, 0.5, -T3, TOP);
  block([-14 - WALL, -WALL, SX + 1, SY + 1], 4, 1.4, TOP, TOP + 3);
  block([CWX + 2, 4, RX - 2, SY / 2 - 3], 2, 1, TOP + 3, SC[2] + 4);
  mk("path", { class: "nf", d: seg(P(RX, SY / 2, TOP + 3), P(RX, SY / 2, SC[2])) + seg(P(CWX, SY / 2, TOP + 3), P(CWX, SY / 2, SC[2])) }, g);
  const disc2 = (y, r) => circ(r, 28).map((q) => P(SC[0] + q.u, y, SC[2] + q.v));
  put(solid(g), { sil: poly(hull(disc2(SY / 2 - 1.8, SR).concat(disc2(SY / 2 + 1.8, SR)))), crease: poly(disc2(SY / 2 + 1.8, SR - 1.4)) });
  const spokes = line("nf lo");
  mk("path", { class: "nf lo", d: poly(disc2(SY / 2 + 1.8, 2.6)) }, g);
  const lands = [];
  for (let f = 0; f < NF; f++) {
    const z = f * FH, sil = slab4(FLOOR, z - T3, z);
    if (f < NF - 1) for (const y of [-53, -15]) block([62, y, 68, y + 6], 1.5, 0.8, z, z + FH - T3);
    const dots = [];
    for (let k = 0; k <= f; k++) {
      const d = flatDot(g, C, 0.8, "dot off");
      place(d, P(37, CAR[1] - 3 - k * 3, z));
      dots.push(d);
    }
    lands.push({ sil, dots });
  }
  const sp = spring(REST_Z, { k: value, c: 1.8 * Math.sqrt(value) });
  let drawn = NaN, chosen = null;
  function draw(z) {
    const zc = 3 * FH - z + 6, mid = (CAR[1] + CAR[3]) / 2;
    put(cw, prism(P, front2, cwo, cwi, zc, zc + CWH));
    cwBands.setAttribute("d", [5, 9, 13].map((v) => seg(P(CW[0] + 0.6, CW[3], zc + v), P(CW[2] - 0.6, CW[3], zc + v))).join(""));
    cwRope.setAttribute("d", seg(P(CWX, SY / 2, zc + CWH), P(CWX, SY / 2, TOP)));
    put(car, prism(P, front2, co, ci, z, z + CH2));
    door.setAttribute("d", poly(rrect(CAR[1] + 3.5, z + 1.2, CAR[3] - 3.5, z + CH2 - 4, 1.2, 4).map((q) => P(CAR[2], q.u, q.v))));
    split.setAttribute("d", seg(P(CAR[2], mid, z + 1.2), P(CAR[2], mid, z + CH2 - 4)));
    put(head, prism(P, front2, ho, hi, z + CH2, z + CH2 + 2.4));
    rope.setAttribute("d", seg(P(RX, SY / 2, z + CH2 + 2.4), P(RX, SY / 2, TOP)));
    const a = z / SR, y = SY / 2 + 1.8, at2 = (t, r) => P(SC[0] + Math.cos(t) * r, y, SC[2] + Math.sin(t) * r);
    spokes.setAttribute("d", [0, 1, 2, 3, 4, 5].map((k) => seg(at2(a + k * Math.PI / 3, 2.6), at2(a + k * Math.PI / 3, SR - 1.4))).join(""));
  }
  const B6 = register(stage, (dt) => {
    const m = stepS(sp, dt);
    if (sp.x !== drawn) {
      drawn = sp.x;
      draw(sp.x);
    }
    return m;
  });
  bag.add(B6.unregister);
  const base = P(CAR[2], SY / 2, 0)[1], perZ = base - P(CAR[2], SY / 2, 1)[1];
  const pick = (p) => clamp(Math.floor(((base - p[1]) / perZ + 8) / FH), 0, NF - 1);
  function choose(f) {
    if (f === chosen) return;
    chosen = f;
    sp.t = f < 0 ? REST_Z : f * FH;
    car.sil.classList.toggle("hi", f < 0);
    lands.forEach((l, i) => {
      l.sil.classList.toggle("hi", i === f);
      l.dots.forEach((d) => d.setAttribute("class", i === f ? "dot m" : "dot off"));
    });
    read.textContent = f < 0 ? "rest" : NAMES[f];
    B6.wake();
  }
  choose(-1);
  bag.add(pointer(stage, { move: (p) => choose(pick(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());
  return {
    set: (v) => {
      sp.k = v;
      sp.c = 1.8 * Math.sqrt(v);
      B6.wake();
    },
    destroy: bag.dispose
  };
};
var G2 = 12;
var WD = 5.5;
var BY12 = 9 * G2 + WD + 8;
var LINES = [
  [0, 56, 0.3, -8, -2, 0],
  [1, 40, 0.75, 8, -1.9, 0],
  [1, 58, 0.3, -8, -0.8, 0],
  [2, 74, 1, -8, -1.9, 0],
  [2, 48, 1, 8, 1.3, 0],
  [1, 34, 0.3, 8, 2, 0],
  [1, 66, 1, -8, -2, 0],
  [2, 52, 1, -8, -0.8, 0],
  [1, 30, 0.45, 8, 2, 0],
  [0, 22, 1, -8, 1.6, 0]
];
var N4 = LINES.length;
var L = (s) => s.split(" ").map((c) => [1, "key " + c]);
var ROWS = [
  [[1, "esc"], ...L("1 2 3 4 5 6 7 8 9 0 - ="), [2, "bksp"]],
  [[1.5, "tab"], ...L("q w e r t y u i o p [ ]"), [1.5, "key \\"]],
  [[1.75, "caps"], ...L("a s d f g h j k l ; '"), [2.25, "enter"]],
  [[2.25, "shift l"], ...L("z x c v b n m , . /"), [2.75, "shift r"]],
  [[1.5, "ctrl l"], [1, "super"], [1.5, "alt l"], [7, "space"], [1.5, "alt r"], [1, "fn"], [1.5, "ctrl r"]]
];
var HB = 4;
var T6 = 2.4;
var HZ = HB + T6 / 2;
var COLS = 6;
var ROWS2 = 2;
var W6 = 24;
var HR2 = 38;
var GAP = 1.2;
var FM = 3;
var BW = COLS * W6 + 2 * FM;
var BH2 = ROWS2 * HR2 + 2 * FM;
var DW = W6 - 2 * GAP;
var DH = HR2 - 2 * GAP;
var OUTLINE = rrect(0, 0, DW, DH, 1.8, 4);
var VENTS = [0, 1, 2].map((k) => rrect(4, DH - 6.6 - k * 3.2, DW - 4, DH - 5.2 - k * 3.2, 0.7, 2));
var PLATE = rrect(DW / 2 - 4.5, DH - 19, DW / 2 + 4.5, DH - 15, 1, 3);
var CUP = rrect(DW - 5.6, DH / 2 - 7, DW - 2.8, DH / 2 + 2, 1.2, 3);
var FRAME = rrect(2.6, 2.6, DW - 2.6, DH - 2.6, 1.4, 3);
var ML = 26;
var R3 = 27;
var GLASS = R3 - 1.4;
var REST7 = [ML + 9, 46];
var D7 = 20;
var YC = D7 / 2;
var VX = Math.SQRT1_2 * Math.sqrt(3);
var NC = 12;
var PITCH2 = 15;
var GAP2 = 8;
var EAR2 = 15;
var MAR = 5;
var X03 = EAR2 + MAR;
var W8 = 2 * X03 + NC * PITCH2 + GAP2;
var W9 = 68;
var L2 = 140;
var TG = 2;
var TB = 1.6;
var TC = 1.8;
var TBAT = 7;
var TS = 6;
var TBUMP = 2.2;
var TL = 0.9;
var STACK = TG + TB + TC + TBAT + TS + TBUMP + TL;
var BOARD = [[4, L2 - 44], [W9 - 4, L2 - 44], [W9 - 4, L2 - 5], [36, L2 - 5], [36, L2 - 30], [4, L2 - 30]];
var BAT = [9, 12, W9 - 9, L2 - 48];
var CHIPS = [
  [10, L2 - 41, 26, L2 - 34, 1.4],
  [45, L2 - 40, 54, L2 - 35, 1.2],
  [57, L2 - 42, 62, L2 - 36, 1.2],
  [42, L2 - 27, 56, L2 - 13, 1.8]
];
var RECT = [[0, 0], [W9, 0], [W9, L2], [0, L2]];
var FOOT2 = [RECT, BOARD, [[BAT[0], BAT[1]], [BAT[2], BAT[1]], [BAT[2], BAT[3]], [BAT[0], BAT[3]]], RECT];
var N5 = 7;
var PITCH3 = 10;
var M2 = 8;
var EXT = M2 * 2 + PITCH3 * (N5 - 1);
var N6 = 7;
var X04 = 13;
var DX = 10;
var L3 = 2 * X04 + (N6 - 1) * DX;
var HP = 34;
var ARC = 5;
var FACE = /* @__PURE__ */ fillet([[L3 - 2, 0], [L3 - 2, HP], [2, HP], [2, 0]], [0.6, 4, 4, 0.6], ARC);
var EDGE = [ARC, 3 * (ARC + 1)];
var LIGHT2 = [-Math.SQRT1_2, -Math.SQRT1_2];
var N8 = 8;
var W10 = 84;
var G3 = 13;
var X12 = W10 + 5;
var Y1 = (N8 - 1) * G3 + 9;
var R12 = 2.1;
var STOP = R12 + 1;
var D9 = [Math.SQRT1_2, -Math.SQRT1_2];
var L6 = 210;
var BW3 = 26;
var BT2 = 5;
var CUBE = 15;
var NC2 = 6;
var SPEED = 1 / 9;
var GATE = L6 * 0.62;
var GH = 38;
var size = (u) => {
  const a = clamp(Math.min(u, 1 - u) / 0.08, 0, 1);
  return a * a * (3 - 2 * a);
};
var RISE2 = L6 / NC2 / 2;
var FALL3 = RISE2 / 2;
var glow = (x) => {
  const d = x - GATE, w = d < 0 ? RISE2 : FALL3;
  return Math.abs(d) >= w ? 0 : Math.cos(Math.PI / 2 * (Math.abs(d) / w)) ** 2;
};
var mount28 = ({ stage, svg, read }, value) => {
  const bag = disposer();
  let slow2 = value, over = null, clock = 2.4;
  const rate = spring(1, { eps: 2e-3 });
  const C = Cam(45, 0.5, 1.8);
  fit(C, [[0, 0, 0], [L6, BW3, 0], [L6, 0, 0], [0, BW3, 0], [0, 0, GH], [GATE, -8, GH]], 200, 168);
  const P = proj(C), front2 = facing(C);
  const g = mk("g", {}, svg);
  const [bR, bI] = rings(0, 0, L6, BW3, 5, 1.3);
  put(solid(g), prism(P, front2, bR, bI, 0, BT2));
  const slats = mk("path", { class: "nf lo" }, g);
  const layer = mk("g", {}, g);
  const pool = [];
  for (let j = 0; j < NC2; j++) {
    const el = { ...solid(layer), dots: [] };
    for (let k = 0; k < 9; k++) el.dots.push(flatDot(el.g, C, 1, "dot off"));
    pool.push(el);
  }
  const gate = [[-8, -3, 0, GH - 4, GATE - 5.5], [BW3 + 3, BW3 + 8, 0, GH - 4, GATE + BW3 + 5.5], [-8, BW3 + 8, GH - 4, GH, GATE + BW3 + 8.5]].map(([y0, y1, z0, z1, key]) => {
    const el = solid(layer), [rg, ig] = rings(GATE - 1.6, y0, GATE + 1.6, y1, 1.4, 0.6);
    put(el, prism(P, front2, rg, ig, z0, z1));
    el.sil.style.transition = "none";
    return { el, key };
  });
  const lifts = Array.from({ length: NC2 }, () => spring(0, { eps: 0.03 }));
  let hot = -1, order2 = "", gatePct = 0;
  const B6 = register(stage, (dt) => {
    let m = stepS(rate, dt);
    const base = reducedMotion() ? 0 : 1;
    if (!over) rate.t = base;
    clock += dt * rate.x;
    const items = [];
    for (let j = 0; j < NC2; j++) {
      const q = j / NC2 + clock * SPEED, u = q - Math.floor(q), lap = Math.floor(q);
      items.push({ j, x: u * L6, s: size(u), serial: 141 + lap * NC2 + j });
    }
    let want = -1;
    if (over) {
      let best = 34;
      for (const it of items) if (it.s > 0.6 && Math.abs(it.x - over[0]) < best) {
        best = Math.abs(it.x - over[0]);
        want = it.j;
      }
    }
    hot = want;
    lifts.forEach((sp, j) => {
      sp.t = j === hot ? 11 : 0;
      if (stepS(sp, dt)) m = true;
    });
    items.sort((a, b) => a.x - b.x);
    let gateGlow = 0, hotSerial = 0;
    const draw = gate.map((p, i) => ({ id: "g" + i, key: p.key, g: p.el.g }));
    items.forEach((it, k) => {
      const el = pool[k], sz = CUBE * it.s, x0 = it.x - sz / 2, x1 = it.x + sz / 2, y0 = BW3 / 2 - sz / 2, y1 = BW3 / 2 + sz / 2;
      const z0 = BT2 + lifts[it.j].x, z1 = z0 + sz;
      draw.push({ id: k, key: it.x + BW3 / 2, g: el.g });
      if (sz < 0.3) {
        el.g.setAttribute("visibility", "hidden");
        return;
      }
      el.g.removeAttribute("visibility");
      const [rg, ig] = rings(x0, y0, x1, y1, 2.6 * it.s, 0.9 * it.s);
      put(el, prism(P, front2, rg, ig, z0, z1));
      const isHot = it.j === hot;
      el.sil.classList.toggle("hi", isHot);
      const pitch = sz * 0.2, rr = r2(0.55 * it.s * C.S);
      el.dots.forEach((d, b) => {
        place(d, P(it.x + (b % 3 - 1) * pitch, BW3 / 2 + (Math.floor(b / 3) - 1) * pitch, z1));
        d.setAttribute("rx", String(rr));
        d.setAttribute("ry", String(r2(rr * C.k)));
        d.setAttribute("class", it.serial >> b & 1 ? isHot ? "dot" : "dot m" : "dot off");
      });
      if (isHot) hotSerial = it.serial;
      gateGlow = Math.max(gateGlow, glow(it.x) * it.s);
    });
    draw.sort((a, b) => a.key - b.key);
    const sig = draw.map((d) => d.id).join();
    if (sig !== order2) {
      order2 = sig;
      draw.forEach((d) => layer.appendChild(d.g));
    }
    const pct = Math.round(gateGlow * 100);
    if (pct !== gatePct) {
      gatePct = pct;
      const stroke = pct ? `color-mix(in srgb, var(--hl-hi) ${pct}%, var(--hl-edge))` : "";
      gate.forEach((p) => {
        p.el.sil.style.stroke = stroke;
      });
    }
    const off = (clock * SPEED * L6 % 21 + 21) % 21, sl = [];
    for (let x = off; x < L6; x += 21) if (x > 5 && x < L6 - 5) sl.push(seg(P(x, 4, BT2), P(x, BW3 - 4, BT2)));
    slats.setAttribute("d", sl.join(""));
    read.textContent = `rate ${rate.x.toFixed(2)}\xD7` + (hot >= 0 ? ` \xB7 #${String(hotSerial).padStart(4, "0")}` : "");
    if (reducedMotion() && !over && rate.x === 0) return m;
    return true;
  });
  bag.add(B6.unregister);
  bag.add(pointer(stage, {
    move: (p) => {
      over = unproj(C, p[0], p[1], BT2);
      rate.t = slow2;
      B6.wake();
    },
    leave: () => {
      over = null;
      B6.wake();
    }
  }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => {
    slow2 = v;
    if (over) rate.t = v;
    B6.wake();
  }, destroy: bag.dispose };
};
var N11 = 24;
var V = 7;
var G4 = 11;
var TB2 = 17;
var PB3 = 17;
var VA = PB3 + V * G4;
var H9 = VA + TB2;
var REST_TOP = N11 - V - 2.6;
var N12 = 9;
var CELL = 14;
var EXT2 = N12 * CELL;
var R8 = 40;
var DP = 14;
var ZC3 = 64;
var RD = 17;
var DT = 4;
var KN = 6;
var KH2 = 6;
var GAP3 = 10;
var KL = 11;
var KW = 12;
var KD = 10;
var BR4 = 3.6;
var HX = -R8 - 8;
var HR3 = 4.6;
var WX0 = -70;
var WX1 = 70;
var WZ1 = 130;
var WT2 = 14;
var COMBO = 40;
var REST16 = 30;
var STEP6 = 50;
var WMAX2 = 150;
var THETA = [72, 26, -20];
var V2 = [Math.SQRT1_2 * Math.sqrt(0.75), Math.SQRT1_2 * Math.sqrt(0.75), 0.5];
var dir = (deg) => [Math.cos(deg * Math.PI / 180), 0, Math.sin(deg * Math.PI / 180)];
var wrap = (d) => ((d + 50) % 100 + 100) % 100 - 50;
function bar(P, o, e, a, b, ring, inner3, s0, s1) {
  const at2 = (q, s) => P(
    o[0] + e[0] * s + a[0] * q.u + b[0] * q.v,
    o[1] + e[1] * s + a[1] * q.u + b[1] * q.v,
    o[2] + e[2] * s + a[2] * q.u + b[2] * q.v
  );
  const seen = (q) => [0, 1, 2].reduce((t, i) => t + (a[i] * q.nu + b[i] * q.nv) * V2[i], 0) > 0;
  return {
    sil: poly(hull(ring.map((q) => at2(q, s0)).concat(ring.map((q) => at2(q, s1))))),
    crease: open(run(inner3, seen).map((q) => at2(q, s1)))
  };
}
var mount33 = ({ stage, svg, read }, value) => {
  const bag = disposer();
  let coast = value;
  const Y = [0, 1, 0], X = [1, 0, 0], Z = [0, 0, 1], O = [0, 0, ZC3];
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[WX0, -WT2, 0], [WX1, -WT2, 0], [WX0, -WT2, WZ1], [WX1, -WT2, WZ1], [WX0, KD, 0], [WX1, 0, 0], [WX0, 0, WZ1], [WX1, 0, WZ1]], 200, 166);
  const P = proj(C);
  const g = mk("g", {}, svg);
  put(solid(g), bar(P, [0, 0, 0], Y, X, Z, rrect(WX0, 0, WX1, WZ1, 9, 6), rrect(WX0 + 2, 2, WX1 - 2, WZ1 - 2, 7, 6), -WT2, 0));
  put(solid(g), bar(P, [HX, DP * 0.55, 0], Z, X, Y, circ(HR3, 28), circ(HR3 - 1, 28), ZC3 - 26, ZC3 + 26));
  for (const dz of [-15, 15]) put(solid(g), bar(P, [0, 0, ZC3 + dz], Y, X, Z, rrect(HX, -4, -R8 + 6, 4, 3, 4), rrect(HX + 1, -3, -R8 + 5, 3, 2, 4), 1, DP * 0.8));
  put(solid(g), bar(P, O, Y, X, Z, circ(R8, 72), circ(R8 - 2.4, 72), 0, DP));
  mk("path", { class: "nf lo", d: poly(circ(R8 - 8, 64).map((q) => P(q.u, DP, ZC3 + q.v))) }, g);
  mk("path", { class: "nf", d: seg(P(0, DP, ZC3 + RD + 1.8), P(0, DP, ZC3 + RD + 6.5)) }, g);
  const dial = solid(g);
  put(dial, bar(P, O, Y, X, Z, circ(RD, 56), circ(RD - 1.4, 56), DP, DP + DT));
  const ticks = mk("path", { class: "nf lo" }, g), longs = mk("path", { class: "nf" }, g), combo = mk("path", { class: "nf" }, g);
  put(solid(g), bar(P, O, Y, X, Z, circ(KN, 32), circ(KN - 1, 32), DP + DT, DP + DT + KH2));
  const bolts = THETA.map((th) => {
    const e = dir(th), t = dir(th + 90);
    const el = solid(g), keep = solid(g);
    put(keep, bar(P, O, Y, e, t, rrect(R8 + GAP3, -KW / 2, R8 + GAP3 + KL, KW / 2, 3, 4), rrect(R8 + GAP3 + 1.4, -KW / 2 + 1.4, R8 + GAP3 + KL - 1.4, KW / 2 - 1.4, 1.8, 4), 0, KD));
    for (const s of [-3.4, 3.4]) {
      const c = R8 + GAP3 + KL / 2 + s;
      place(mk("circle", { r: 0.9, class: "dot off" }, keep.g), P(e[0] * c, KD, ZC3 + e[2] * c));
    }
    return { th, e, t, el, tw: tween(0), drawn: NaN };
  });
  const drawBolt = (b, k) => {
    const s1 = lerp(R8 + GAP3 + 4.5, R8 + 1.2, k);
    if (s1 === b.drawn) return;
    b.drawn = s1;
    put(b.el, bar(P, [0, DP / 2, ZC3], b.e, b.t, Y, circ(BR4, 24), circ(BR4 - 0.9, 24), R8 - 0.2, s1));
  };
  const spin = { a: REST16, w: 0, mode: "rest", tgt: REST16 };
  let raw = REST16, said = "", last2 = null, lastT = 0, lastMove = -1e9, over = false, opened = false, from = 1, lit2 = null, drawnA = NaN;
  function drawDial() {
    if (spin.a === drawnA) return;
    drawnA = spin.a;
    const tk = [], lg = [], z = DP + DT;
    for (let m = 0; m < 100; m += 5) {
      const th = 90 + (m - spin.a) * 3.6, e = dir(th), r0 = m % 10 ? RD - 4 : RD - 6.5, r1 = RD - 1.8;
      const d = seg(P(e[0] * r0, z, ZC3 + e[2] * r0), P(e[0] * r1, z, ZC3 + e[2] * r1));
      if (m === COMBO) combo.setAttribute("d", d);
      else (m % 10 ? tk : lg).push(d);
    }
    ticks.setAttribute("d", tk.join(""));
    longs.setAttribute("d", lg.join(""));
  }
  function light() {
    const want = opened ? "bolts" : over ? "dial" : "combo";
    if (want === lit2) return;
    lit2 = want;
    bolts.forEach((b) => b.el.sil.classList.toggle("hi", want === "bolts"));
    dial.sil.classList.toggle("hi", want === "dial");
    combo.classList.toggle("hi", want === "combo");
  }
  function setOpen(on, now) {
    opened = on;
    bolts.forEach((b, i) => tset(b.tw, on ? 1 : 0, now, Math.abs(i - from) * STEP6));
    light();
  }
  function stepSpin(dt, now) {
    if (spin.mode === "rest") return false;
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) {
      if (spin.mode === "coast") {
        spin.w = spin.w * Math.exp(-h * 1e3 / coast) - 40 * Math.sin(spin.a / 10 * 2 * Math.PI) * h;
        spin.a += spin.w * h;
        if (Math.abs(spin.w) < 12 && now - lastMove > 90) {
          spin.mode = "settle";
          spin.tgt = Math.round((spin.a + spin.w * 0.15) / 10) * 10;
        }
      } else {
        spin.w += (-90 * (spin.a - spin.tgt) - 16 * spin.w) * h;
        spin.a += spin.w * h;
      }
    }
    if (spin.mode === "settle" && Math.abs(spin.a - spin.tgt) < 0.01 && Math.abs(spin.w) < 0.2) {
      spin.a = spin.tgt = (spin.tgt % 100 + 100) % 100;
      spin.w = 0;
      spin.mode = "rest";
    }
    return spin.mode !== "rest";
  }
  const B6 = register(stage, (dt, now) => {
    let m = stepSpin(dt, now);
    const near = Math.abs(wrap(spin.a - COMBO));
    if (!opened && near < 0.8 && Math.abs(spin.w) < 6) setOpen(true, now);
    else if (opened && near > 2.5) setOpen(false, now);
    drawDial();
    bolts.forEach((b) => {
      drawBolt(b, tval(b.tw, now));
      if (!tdone(b.tw, now)) m = true;
    });
    const n = String((Math.round(spin.a) % 100 + 100) % 100).padStart(2, "0");
    const say = over || spin.mode !== "rest" ? `dial ${n}` + (opened ? " \xB7 open" : "") : "rest";
    if (say !== said) read.textContent = said = say;
    return m;
  });
  bag.add(B6.unregister);
  const p0 = P(0, DP, 0), px = P(1, DP, 0), pz = P(0, DP, 1);
  const ax2 = [px[0] - p0[0], px[1] - p0[1]], az = [pz[0] - p0[0], pz[1] - p0[1]], det = ax2[0] * az[1] - ax2[1] * az[0];
  function onFace([sx, sy]) {
    const qx = sx - p0[0], qy = sy - p0[1];
    return [(qx * az[1] - qy * az[0]) / det, (ax2[0] * qy - ax2[1] * qx) / det - ZC3];
  }
  function leave() {
    over = false;
    last2 = null;
    if (reducedMotion()) {
      raw = spin.a = (Math.round(spin.a / 10) * 10 % 100 + 100) % 100;
      spin.w = 0;
      spin.mode = "rest";
    }
    light();
    B6.wake();
  }
  bag.add(pointer(stage, {
    move: (p) => {
      const [u, v] = onFace(p), r = Math.hypot(u, v);
      if (r > R8 + GAP3 + KL + 10) return leave();
      const now = performance.now(), ang = Math.atan2(v, u) * 180 / Math.PI;
      over = true;
      from = THETA.reduce((bi, th, i) => Math.abs(wrap((ang - th) / 3.6)) < Math.abs(wrap((ang - THETA[bi]) / 3.6)) ? i : bi, 0);
      if (last2 !== null) {
        const da = -((ang - last2 + 540) % 360 - 180) / 3.6 * clamp(r / 22, 0, 1);
        if (reducedMotion()) {
          raw += da;
          spin.a = Math.round(raw / 10) * 10;
          spin.mode = "rest";
        } else {
          spin.w = clamp(lerp(spin.w, da / Math.max(8e-3, (now - lastT) / 1e3), 0.35), -WMAX2, WMAX2);
          spin.mode = "coast";
          raw = spin.a;
        }
        if (Math.abs(da) > 0.05) lastMove = now;
      }
      last2 = ang;
      lastT = now;
      light();
      B6.wake();
    },
    leave
  }));
  light();
  bag.add(() => svg.replaceChildren());
  return { set: (v) => {
    coast = v;
    B6.wake();
  }, destroy: bag.dispose };
};
function slow(el, options) {
  return create({
    id: "slow",
    label: "Crates riding a belt through a gate. Hovering slows the clock without stopping it.",
    rest: "rate 1.00\xD7",
    engine: mount28
  }, el, options);
}
function elevator(el, options) {
  return create({
    id: "elevator",
    label: "Four floors beside an open shaft. The pointer's height picks a floor, and the car travels there through the ones between.",
    rest: "rest",
    engine: mount6
  }, el, options);
}
function vault(el, options) {
  return create({
    id: "vault",
    label: "A vault door: circling the pointer turns its dial, which coasts and catches every ten; on forty its three bolts draw back.",
    rest: "rest",
    engine: mount33
  }, el, options);
}
export {
  elevator,
  slow,
  vault
};
