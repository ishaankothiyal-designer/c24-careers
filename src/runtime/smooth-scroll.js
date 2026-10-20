// Tune the existing page controller after its source module loads. Do not
// create a second controller or override native touch/reduced-motion behavior.
export function configureSmoothScrolling() {
  const lenis=window.lenis;
  if(!lenis?.options||typeof lenis.raf!=='function')return;
  lenis.options.lerp=.08;
  lenis.options.smoothWheel=true;
}
