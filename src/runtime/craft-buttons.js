// The inspected Craft button: stepped silhouette + random 9px hover pixels.
export function initializeCraftButtons() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#d8ff00', '#f5c518', '#e0492a', '#0a0a0a'];
  document.querySelectorAll('.craft-button').forEach(button => {
    if (button.dataset.craftWired) return;
    button.dataset.craftWired = 'true';
    const effect = document.createElement('span');
    effect.className = 'craft-button-pixels'; effect.setAttribute('aria-hidden', 'true');
    button.prepend(effect);
    let cells = [], timer = null;
    const clear = () => { clearInterval(timer); timer = null; cells.forEach(cell => { cell.style.background = 'transparent'; }); };
    const tick = () => cells.forEach(cell => { cell.style.background = Math.random() < .14 ? palette[Math.floor(Math.random() * palette.length)] : 'transparent'; });
    const start = () => { if (reduce.matches || timer) return; tick(); timer = setInterval(tick, 130); };
    const build = () => {
      effect.replaceChildren(); cells = [];
      const columns = Math.ceil(button.offsetWidth / 9), rows = Math.ceil(button.offsetHeight / 9);
      effect.style.gridTemplateColumns = `repeat(${columns}, 9px)`;
      effect.style.gridAutoRows = '9px';
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < columns * rows; i++) { const cell = document.createElement('i'); cells.push(cell); fragment.append(cell); }
      effect.append(fragment);
    };
    const observer = new ResizeObserver(build); observer.observe(button); build();
    button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') start(); });
    button.addEventListener('pointerleave', clear);
    button.addEventListener('focus', start);
    button.addEventListener('blur', clear);
    reduce.addEventListener('change', clear);
  });
}
