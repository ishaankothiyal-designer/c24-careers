// Adapted from https://hairline.lucasmarkes.com/skill/hairline-cursor-tab.html
// MIT: /licenses/hairline-LICENSE.txt
import { HL, createReferenceFigure } from '../hairline-reference.js';

/**
 * Cursor, tab: a code page lies on the ground, and the mark floats over it as the caret,
 * a cube whose middle edge runs on down as the text cursor's bar. Ahead of the caret,
 * the next lines wait as a dashed suggestion. Point down the page: the cube glides in one
 * eased move to the end of the line under the pointer, each line it passes is accepted,
 * swept from dashed to solid, and the suggestion draws itself on ahead of it.
 * Going back up gives them back. At rest five lines are written and six more are suggested.
 * The slider is how long a line takes to be accepted, in ms.
 */
const {
  Cam, clamp, fit, fillet, open, poly, prism, proj, rad, rings, rrect, seg, solid, put,
  spring, stepS, disposer, mk, pointer, register, unproj, facing,
} = HL;

const PW = 84, PH = 118, D = 2.5, T0 = 21, ROW = 8, U0 = 17, IND = 6, GAP = 2.6, R = 1.3, G = 6, REST = 5;
const CS = 18, ZC = 9;
/** The code, row by row: [indent, ...token lengths]; an empty row is a blank line. */
const CODE = [[0, 10, 14, 6], [1, 8, 22], [1, 6, 10, 13], [1, 5, 16, 4], [2, 12, 18], [2, 9, 8, 7], [1, 4],
  [1, 10, 20, 5], [0, 6], [], [0, 11, 13, 6], [1, 16, 18]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pace = value;

  const C = Cam(45, 0.5, 2.35);
  /** A point on the page, from the page's own (u along a line, t down the page). */
  const at = (u, t, z = D) => [t, PW / 2 - u, z];
  /** A critically damped spring that lands in about `ms`: no overshoot, and a retarget keeps its speed. */
  const tune = (sp, ms) => { const w = 5600 / ms; sp.k = w * w; sp.c = 2 * w; return sp; };
  const rows = CODE.map(([ind = 0, ...lens], k) => {
    const t = T0 + k * ROW, toks = [];
    let u = U0 + ind * IND;
    lens.forEach((l) => { toks.push([u, u + l]); u += l + GAP; });
    const ua = U0 + ind * IND, ub = toks.length ? toks[toks.length - 1][1] : ua;
    return { t, toks, ua, ub, a: spring(k < REST ? 1 : 0, { eps: 0.002 }), g: spring(k < REST + G ? 1 : 0, { eps: 0.002 }), drawn: "" };
  });
  /** The cube's eight corners around a caret at (u, t), its foot at z. */
  const cube = (u, t, z) => {
    const [x, y] = at(u, t);
    return [[x - CS, y - CS], [x, y - CS], [x, y], [x - CS, y]].flatMap(([a, b]) => [[a, b, z], [a, b, z + CS]]);
  };
  fit(C, [[0, -PW / 2, 0], [PH, -PW / 2, 0], [PH, PW / 2, 0], [0, PW / 2, 0],
    ...rows.flatMap((r) => [...cube(r.ub, r.t, D + ZC - 2), ...cube(r.ua, r.t, D + ZC - 2)])], 200, 168);
  const P = proj(C), W = (u, t, z) => P(...at(u, t, z)), ring = (u0, t0, u1, t1, r) => rrect(u0, t0, u1, t1, r, 3).map((q) => W(q.u, q.v));

  const g = mk("g", {}, svg);
  // the page: a thin plate; a thin top strip (three dots, the open file's tab, a second one) ruled off from the code; a gutter
  put(solid(g), prism(P, facing(C), ...rings(0, -PW / 2, PH, PW / 2, 3, 1.4), 0, D));
  const dot = (u, t, r) => poly(Array.from({ length: 12 }, (_, k) => W(u + r * Math.cos(rad(k * 30)), t + r * Math.sin(rad(k * 30)))));
  const HB = 9, TA = 19, TB = 33;
  /** A tab: its top rounded, open at its foot so it stands on the strip's rule. */
  const tab = (u0, u1) => open(fillet([W(u0, HB), W(u0, 3.5), W(u1, 3.5), W(u1, HB)], [0, 2, 2, 0], 3));
  mk("path", { class: "nf lo", d: [5, 9, 13].map((u) => dot(u, 5.5, 1)).join("") + tab(TB + 1, TB + 13)
    + seg(W(1.5, HB), W(TA, HB)) + seg(W(TB, HB), W(PW - 1.5, HB)) + seg(W(U0 - 4, HB + 3), W(U0 - 4, PH - 4))
    + CODE.map((_, k) => seg(W(U0 - 9.5, T0 + k * ROW), W(U0 - 7.5, T0 + k * ROW))).join("") }, g);
  // the open file's tab is drawn in mid, and the rule breaks under it, so it runs on into the page it shows
  mk("path", { class: "nf", d: tab(TA, TB) }, g);

  // each row: what is written, solid; what is suggested, dashed behind it
  rows.forEach((r) => {
    r.ghost = mk("path", { class: "nf lo dash" }, g);
    r.ink = mk("path", { class: "nf" }, g);
  });
  /** The row's tokens between u0 and u1, each a flat pill on the page. */
  const span = (r, u0, u1) => r.toks.map(([a, b]) => {
    const s0 = Math.max(a, u0), s1 = Math.min(b, u1);
    return s1 > s0 + 0.3 ? poly(ring(s0, r.t - R, s1, r.t + R, R)) : "";
  }).join("");
  const uAt = (r, f) => r.ua + (r.ub - r.ua) * f;
  function paintRow(r) {
    const a = clamp(r.a.x, 0, 1), gv = Math.max(a, clamp(r.g.x, 0, 1)), key = `${a.toFixed(3)} ${gv.toFixed(3)}`;
    if (key === r.drawn) return;
    r.drawn = key;
    r.ink.setAttribute("d", span(r, -1, uAt(r, a)));
    r.ghost.setAttribute("d", span(r, uAt(r, a) + 1.2, uAt(r, gv)));
  }

  // the caret: the text cursor's bar, ticked at its foot, and the mark floating on it
  const bar = mk("path", { class: "sil" }, g);
  const hex = mk("path", { class: "sil hi" }, g), shade = mk("path", { class: "nf" }, g), facet = mk("path", { class: "nf sil hi" }, g);
  const cu = spring(rows[REST - 1].ub), ct = spring(rows[REST - 1].t);
  let drawnC = "";
  function paintCaret() {
    const key = `${cu.x.toFixed(2)} ${ct.x.toFixed(2)}`;
    if (key === drawnC) return;
    drawnC = key;
    const [x, y] = at(cu.x, ct.x), z0 = D + ZC, z1 = z0 + CS, p = (a, b, z) => P(x + a, y + b, z);
    // the cube stands its near corner over the caret, so the mark's middle edge runs on down as the cursor's bar
    bar.setAttribute("d", seg(p(0, 0, D), p(0, 0, z0)) + seg(p(0, 2.2, D), p(0, -2.2, D)));
    // the hexagon is the cube; the facet runs across the top's near half and down the right face, as in the mark
    const UL = p(-CS, 0, z1), UR = p(0, -CS, z1), N = p(0, 0, z1), B = p(0, 0, z0);
    hex.setAttribute("d", poly(fillet([p(-CS, -CS, z1), UR, p(0, -CS, z0), B, p(-CS, 0, z0), UL], Array(6).fill(1.6), 3)));
    facet.setAttribute("d", poly(fillet([UL, UR, B, N], [1, 1, 1, 0.5], 3)));
    // the mark's dark: the left face, the top's far half and the right face's low half are hatched, so the arrow is the light
    let h = "";
    for (let k = 1; k < 8; k++) {
      const c = (CS * k) / 8;
      h += seg(p(-c, 0, z0 + 0.8), p(-c, 0, z1 - 0.8)) + seg(p(0, -c, z0 + 0.8), p(0, -c, z0 + c - 0.8))
        + seg(p(-CS + 0.6, -c + 0.6, z1), p(-c + 0.6, -CS + 0.6, z1));
    }
    shade.setAttribute("d", h);
  }

  let n = REST, hover = false, shown = -1;
  /** Retune every spring to the pace: the lines land in about one pace, the cube crosses in about three. */
  const retune = () => {
    tune(cu, pace * 2.6); tune(ct, pace * 2.6);
    rows.forEach((r) => { tune(r.a, pace * 1.2); tune(r.g, pace * 1.8); });
  };
  retune();

  const B = register(stage, (dt) => {
    let moving = stepS(cu, dt) | stepS(ct, dt);
    // where the cube is, in rows: a line is accepted once the cube reaches it, given back once it rises off it
    const f = (ct.x - T0) / ROW;
    rows.forEach((r, i) => {
      r.a.t = i < n && i <= f + 0.35 ? 1 : 0;
      r.g.t = i < f + 0.5 + G ? 1 : 0;
      moving = stepS(r.a, dt) | stepS(r.g, dt) || moving;
      paintRow(r);
    });
    paintCaret();
    const lines = rows.slice(0, n).filter((r) => r.toks.length).length;
    if (lines !== shown) { shown = lines; read.textContent = hover ? `${lines} lines` : "rest"; }
    return moving;
  });
  bag.add(B.unregister);

  /** The pointer, put on the page's top, which never moves: the row under it is how far to accept. */
  function aim(p) {
    hover = p !== null;
    n = hover ? clamp(Math.round((unproj(C, p[0], p[1], D)[0] - T0) / ROW), 0, rows.length - 1) + 1 : REST;
    cu.t = rows[n - 1].ub; ct.t = rows[n - 1].t;
    rows.forEach((r, i) => {
      const lit = hover && i === n - 1;
      r.ink.setAttribute("class", lit ? "nf hi" : "nf");
      r.ghost.setAttribute("class", lit ? "nf hi dash" : "nf lo dash");
    });
    hex.classList.toggle("hi", !hover); facet.classList.toggle("hi", !hover);
    shown = -1;
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pace = v; retune(); },
    destroy: bag.dispose,
  };
}

export function cursorTab(host,options={}){
  return createReferenceFigure(host,{name:'cursor-tab',mount,range:[160,280,440],tour:[[130,182],[200,200],[283,225],null]},options);
}
