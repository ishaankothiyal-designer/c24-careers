export function initializeProblemFilters() {
  const root = document.querySelector('#problems');
  if (!root || root.dataset.filtersReady) return;
  root.dataset.filtersReady = 'true';
  const buttons = [...root.querySelectorAll('[data-problem-filter]')];
  const cards = [...root.querySelectorAll('[data-problem-craft]')];
  const status = root.querySelector('[role="status"]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const craft = button.dataset.problemFilter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = craft !== 'All' && card.dataset.problemCraft !== craft;
      if (!card.hidden) count++;
    });
    status.textContent = `${count} ${count === 1 ? 'problem' : 'problems'} · ${craft === 'All' ? 'All crafts' : craft}`;
    window.dispatchEvent(new Event('resize'));
  }));
}
