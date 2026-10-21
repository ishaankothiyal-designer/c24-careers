// Safari does not expose memory/connection hints; use conservative touch limits
// when those optional hints are absent, without guessing from the user agent.
export function performanceProfile(nav = navigator, media = matchMedia) {
  const connection = nav.connection;
  const constrained = !!connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType || '') ||
    (nav.deviceMemory > 0 && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4);
  const touch = media('(pointer: coarse)').matches;
  return {
    constrained,
    frameInterval: constrained || touch ? 1000 / 30 : 1000 / 60,
    pixelRatio: constrained ? 1 : touch ? 1.5 : 2,
  };
}
