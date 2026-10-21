export function initializePageTransition() {
  const overlay = document.querySelector('.transition');
  if (!overlay || overlay.dataset.transitionGuard) return () => {};
  overlay.dataset.transitionGuard = 'true';
  let timer;
  let showing = true;
  const dismiss = () => {
    clearTimeout(timer);
    // Also prevents a late-loading animation from covering the page again.
    overlay.dataset.transitionDisabled = 'true';
    overlay.style.display = 'none';
  };
  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(dismiss, 1800);
  };
  arm();
  overlay.dataset.transitionReady = 'true';
  const observer = new MutationObserver(() => {
    if (overlay.style.display === 'none') { showing = false; clearTimeout(timer); }
    else if (!showing && !overlay.dataset.transitionDisabled) { showing = true; arm(); }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['style'] });
  // Restoring a page must never restore a covering transition.
  window.addEventListener('pageshow', event => { if (event.persisted) dismiss(); });
  return dismiss;
}
