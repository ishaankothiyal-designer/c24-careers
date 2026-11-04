// Adapted from https://hairline.lucasmarkes.com/skill/hairline-funnel.html
// MIT: /licenses/hairline-LICENSE.txt
import { HL, createReferenceFigure } from '../hairline-reference.js';

/**
 * Funnel: four trays stepping down towards the viewer, each narrower than the
 * one behind it, holding sixteen, eight, four and one bead. The tray under the
 * pointer lifts out of the cascade and takes the bright edge with its beads;
 * its neighbours rise less, staggered outwards from it. At rest the one bead in
 * the last tray, the deal, is the bright mark. The slider is the stagger, in ms.
 *
 * The pattern: discrete items (Riffle's answer). Tweens, a stagger by
 * distance, and a hit test on static screen bands taken from the rest pose.
 */
const {
  Cam, clamp, extremes, facing, fit, prism, proj, rings, seg, unproj, tdone, tset, tval, tween, disposer, flatDot, mk, place,
  pointer, register, solid, put,
} = HL;

const STAGES = ["lead", "call", "demo", "deal"];
const WIDE = [136, 100, 64, 30], BEADS = [[8, 2], [4, 2], [2, 2], [1, 1]];
const D = 28, PITCH = 40, DROP = 14, T = 7, R = 8, B = 2.2, BR = 2.6, M = 15;
const LIFT = 14, FALL = [1, 0.36, 0.13, 0.05];
/** World point: a across the flow, b along it. The flow runs down the screen to the right (+x), the width across it (+y). */
const at = (a, b, z) => [b, a, z];

/** Tray i at rest: where it sits along the flow and how high, its two rings, and where its beads lie on its top. */
function tray(i) {
  const w = WIDE[i] / 2, b0 = i * PITCH, z0 = (STAGES.length - 1 - i) * DROP;
  const [outer, inner] = rings(b0 - D / 2, -w, b0 + D / 2, w, R, B);
  const [cols, rows] = BEADS[i], beads = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = cols === 1 ? 0 : -w + M + (c * (2 * w - 2 * M)) / (cols - 1);
      beads.push([a, b0 + (rows === 1 ? 0 : (r - 0.5) * 12)]);
    }
  }
  return { w, b0, z0, outer, inner, beads };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const N = STAGES.length, trays = [];
  for (let i = 0; i < N; i++) trays.push(tray(i));

  // Fitted with the back tray at its full lift, so no pose leaves the frame.
  const C = Cam(45, 0.5, 1.9);
  const ext = [];
  trays.forEach((t, i) => {
    for (const a of [-t.w, t.w]) for (const b of [t.b0 - D / 2, t.b0 + D / 2]) ext.push(at(a, b, t.z0), at(a, b, t.z0 + T + (i === 0 ? LIFT : 0)));
  });
  fit(C, ext, 200, 166);
  const P = proj(C), front = facing(C);

  // back to front: the widest tray, farthest and highest, first
  const g = mk("g", {}, svg);
  for (const t of trays) {
    t.drop = mk("path", { class: "dash" }, g);
    t.el = solid(g);
    t.dots = t.beads.map(() => flatDot(t.el.g, C, BR, "dot m"));
    t.lift = tween(0);
    t.last = NaN;
  }
  const deal = trays[N - 1].dots[0];
  deal.setAttribute("class", "dot");

  /** Draws tray t at lift z, and skips it when nothing changed. */
  function draw(t, z) {
    if (z === t.last) return;
    t.last = z;
    put(t.el, prism(P, front, t.outer, t.inner, t.z0 + z, t.z0 + T + z));
    // stilts: dashed drops from the tray's left and right edges to the ground, painted behind it
    t.drop.setAttribute("d", t.z0 + z < 0.5 ? "" : extremes(P, t.outer).slice(0, 2).map((q) => seg(P(q.u, q.v, t.z0 + z), P(q.u, q.v, 0))).join(""));
    t.dots.forEach((el, k) => place(el, P(...at(t.beads[k][0], t.beads[k][1], t.z0 + T + z))));
  }
  trays.forEach((t) => draw(t, 0));
  read.textContent = "rest";

  // hit bands: each tray's REST top plane. The pointer goes to the tray whose plane puts it nearest the tray's middle
  // along the flow, if it is within the tray's width. The planes never move, so a lifting tray cannot flip the choice.
  function hit([x, y]) {
    let best = -1, bd = PITCH;
    trays.forEach((t, i) => {
      const [b, a] = unproj(C, x, y, t.z0 + T), d = Math.abs(b - t.b0);
      if (d < bd && Math.abs(a) <= t.w + 6) { bd = d; best = i; }
    });
    return best;
  }

  const L = register(stage, (_dt, now) => {
    let moving = false;
    for (const t of trays) { draw(t, tval(t.lift, now)); if (!tdone(t.lift, now)) moving = true; }
    return moving;
  });
  bag.add(L.unregister);

  let act = -1;
  /** Lifts tray a out of the cascade (-1 lets them all settle). The stagger spreads out from the tray picked, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    trays.forEach((t, i) => {
      const d = Math.abs(i - from);
      tset(t.lift, a < 0 ? 0 : LIFT * FALL[clamp(Math.abs(i - a), 0, FALL.length - 1)], now, d * stag);
      t.el.sil.classList.toggle("hi", i === a);
      t.dots.forEach((el) => el.setAttribute("class", i === a ? "dot" : "dot m"));
    });
    if (a < 0) deal.setAttribute("class", "dot");
    read.textContent = a < 0 ? "rest" : STAGES[a];
    L.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

export function funnel(host,options={}){
  return createReferenceFigure(host,{name:'funnel',mount,range:[0,45,90],tour:[[100,100],[200,160],[300,230],[320,270],null]},options);
}
