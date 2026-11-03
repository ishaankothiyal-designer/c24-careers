export function initializeProblemFilters() {
  const root = document.querySelector('#problems');
  if (!root || root.dataset.filtersReady) return;
  root.dataset.filtersReady = 'true';
  const buttons = [...root.querySelectorAll('[data-problem-filter]')];
  const cards = [...root.querySelectorAll('[data-problem-craft]')];
  const status = root.querySelector('[role="status"]');
  const carousel = initializeProblemCarousel(root, cards);
  buttons.forEach(button => button.addEventListener('click', () => {
    const craft = button.dataset.problemFilter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = craft !== 'All' && card.dataset.problemCraft !== craft;
      if (!card.hidden) count++;
    });
    status.textContent = `${count} ${count === 1 ? 'problem' : 'problems'} · ${craft === 'All' ? 'All crafts' : craft}`;
    carousel?.reset();
    window.dispatchEvent(new Event('resize'));
  }));
}

export function initializeProblemCarousel(root, cards, prefix = 'problem') {
  const track = root.querySelector(`#${prefix}-track`);
  if (!track) return;
  const previous = root.querySelector(`.${prefix}-carousel__previous`);
  const next = root.querySelector(`.${prefix}-carousel__next`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => {
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    track.setAttribute('data-carousel-before', String(!previous.disabled));
    track.setAttribute('data-carousel-after', String(!next.disabled));
  };
  const go = direction => {
    const visible = cards.filter(card => !card.hidden);
    const start = visible[0]?.offsetLeft || 0;
    const positions = visible.map(card => card.offsetLeft - start);
    const left = direction > 0
      ? positions.find(position => position > track.scrollLeft + 1) ?? track.scrollWidth
      : positions.findLast(position => position < track.scrollLeft - 1) ?? 0;
    track.scrollTo({ left, behavior: reduce.matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key.startsWith('Arrow')) go(event.key === 'ArrowRight' ? 1 : -1);
    else track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: reduce.matches ? 'instant' : 'smooth' });
  });
  new ResizeObserver(update).observe(track);
  update();
  return { reset() { track.scrollTo({ left: 0, behavior: 'instant' }); update(); } };
}
