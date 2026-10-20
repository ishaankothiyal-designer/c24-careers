// Preserve the source accordion: one answer open at a time, first open on load.
export function initializeFaq() {
  document.querySelectorAll('[data-faq]').forEach((list) => {
    if (list.dataset.initialized) return;
    list.dataset.initialized = 'true';
    const buttons = [...list.querySelectorAll('.faq__btn')];
    let resizeTimer;
    function setExpanded(button, expanded) {
      button.setAttribute('aria-expanded', String(expanded));
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.setAttribute('aria-hidden', String(!expanded));
      panel.inert = !expanded;
    }
    buttons.forEach((button) => {
      setExpanded(button, button.getAttribute('aria-expanded') === 'true');
      button.addEventListener('click', () => {
        const next = button.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((item) => setExpanded(item, item === button && next));
        // Notify the existing scroll/heading geometry after the source .45s transition.
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
      });
    });
  });
}
