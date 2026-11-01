import { roleDetailPage } from '../role-detail.js';
import { routePath, siteLinks } from '../site-routing.js';
import { initializeCraftButtons } from './craft-buttons.js';
import { loadLiveRole } from './live-role.js';

export function initializeRoleDialog({ base = '/', initialPath = null } = {}) {
  if (document.querySelector('[data-role-dialog]')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'role-dialog';
  dialog.dataset.roleDialog = '';
  dialog.setAttribute('aria-labelledby', 'role-dialog-title');
  dialog.setAttribute('data-lenis-prevent', '');
  document.body.append(dialog);
  let trigger;
  let pushed = false;
  let previousOverflow;
  let previousTitle;
  let clearButtons;
  let liveRequest;

  const open = (pathname, source, updateHistory = true) => {
    const page = roleDetailPage(pathname, '', '');
    if (!page) return false;
    liveRequest?.abort();
    clearButtons?.();
    const content = page.html.replace(/^<main[^>]*>/, '<div class="role-detail">').replace(/<\/main>$/, '</div>')
      .replace('id="role-title"', 'id="role-dialog-title"')
      .replace('aria-labelledby="role-title"', 'aria-labelledby="role-dialog-title"')
      .replace('<h1>Role not found.</h1>', '<h1 id="role-dialog-title">Role not found.</h1>')
      .replace(/<a class="role-detail__back" href="\/careers\/">← All roles<\/a>/, '');
    dialog.innerHTML = `<div class="role-dialog__toolbar"><span>Cars24 Careers</span><button class="role-dialog__close craft-button btn-bubble-arrow btn-bubble-arrow--black" type="button" aria-label="Close role details" autofocus><span class="craft-button-label">Close <span aria-hidden="true">×</span></span></button></div>${siteLinks(content, base)}`;
    if (!dialog.open) {
      trigger = source || document.activeElement;
      previousOverflow = document.body.style.overflow;
      previousTitle = document.title;
      document.body.style.overflow = 'hidden';
      window.lenis?.stop?.();
      dialog.showModal();
    }
    clearButtons = initializeCraftButtons(dialog);
    document.title = page.title;
    dialog.scrollTop = 0;
    dialog.querySelector('button').focus({ preventScroll: true });
    const liveId = page.html.match(/data-live-role="([^"]+)"/)?.[1];
    if (liveId) {
      liveRequest = new AbortController();
      loadLiveRole(dialog.querySelector('.role-detail'), liveId, liveRequest.signal);
    }
    if (updateHistory) {
      history.pushState({ roleDialog: true }, '', base + pathname.slice(1));
      pushed = true;
    }
    return true;
  };
  const dismiss = (updateHistory = true) => {
    if (!dialog.open) return;
    liveRequest?.abort();
    dialog.close();
    clearButtons?.();
    document.body.style.overflow = previousOverflow;
    window.lenis?.start?.();
    document.title = previousTitle;
    if (updateHistory) {
      if (pushed) history.back();
      else history.replaceState(null, '', `${base}careers/`);
    }
    pushed = false;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  };
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (!roleDetailPage(routePath(url.pathname, base), '', '')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(routePath(url.pathname, base), link);
  }, true);
  dialog.addEventListener('click', event => {
    if (event.target.closest('.role-dialog__close')) {
      event.preventDefault();
      dismiss();
    } else if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  window.addEventListener('popstate', () => {
    const path = routePath(location.pathname, base);
    if (roleDetailPage(path, '', '')) {
      pushed = Boolean(history.state?.roleDialog);
      open(path, trigger, false);
    }
    else dismiss(false);
  });
  // Direct/shared links get the same overlay over the careers listing.
  if (initialPath) open(initialPath, null, false);
}
