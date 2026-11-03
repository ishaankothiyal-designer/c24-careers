import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeRoleDialog } from '../src/runtime/role-dialog.js';

function setup(t) {
  const saved = new Map(['document', 'window', 'location', 'history', 'matchMedia'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => saved.forEach((value, key) => value ? Object.defineProperty(globalThis, key, value) : delete globalThis[key]));
  const handlers = {}, dialogEvents = {}, windowEvents = {};
  const trigger = { isConnected: true, focus() { this.focused = true; } };
  const close = { focus() { this.focused = true; } };
  const dialog = { dataset: {}, setAttribute() {}, addEventListener(name, fn) { dialogEvents[name] = fn; },
    showModal() { this.open = true; }, close() { this.open = false; }, querySelector() { return close; }, querySelectorAll() { return []; } };
  globalThis.matchMedia = () => ({ matches: true });
  globalThis.document = { title: 'Careers', activeElement: trigger, body: { style: { overflow: 'auto' }, append() {} },
    querySelector() { return null; }, createElement() { return dialog; }, addEventListener(name, fn) { handlers[name] = fn; } };
  globalThis.window = { addEventListener(name, fn) { windowEvents[name] = fn; } };
  globalThis.location = { href: 'https://example.test/careers/?department=People', origin: 'https://example.test', pathname: '/careers/' };
  globalThis.history = { pushes: [], backs: 0, replacements: [], pushState(state, _, url) { this.state = state; this.pushes.push(url); },
    replaceState(_, __, url) { this.replacements.push(url); }, back() { this.backs++; } };
  const click = (href, extra = {}) => {
    const link = { ...trigger, href, hasAttribute() { return false; } };
    const event = { button: 0, target: { closest() { return link; } }, preventDefault() { this.prevented = true; }, stopImmediatePropagation() {}, ...extra };
    handlers.click(event);
    return { event, link };
  };
  return { dialog, dialogEvents, windowEvents, click };
}

test('role overlay locks scrolling, restores focus and returns through history on Escape', t => {
  const { dialog, dialogEvents, click } = setup(t);
  initializeRoleDialog();
  const { event, link } = click('https://example.test/careers/roles/preview-role-1/');
  assert.equal(event.prevented, true);
  assert.equal(dialog.open, true);
  assert.equal(document.body.style.overflow, 'hidden');
  assert.match(dialog.innerHTML, /id="role-dialog-title"/);
  assert.match(dialog.innerHTML, /aria-label="Close role details"/);
  assert.match(dialog.innerHTML, /<button class="role-dialog__close"[^>]*><svg aria-hidden="true"/);
  assert.doesNotMatch(dialog.innerHTML, /role-dialog__toolbar|>Cars24 Careers<|>Close /);
  assert.deepEqual(history.pushes, ['/careers/roles/preview-role-1/']);
  dialogEvents.cancel({ preventDefault() {} });
  assert.equal(dialog.open, false);
  assert.equal(document.body.style.overflow, 'auto');
  assert.equal(document.title, 'Careers');
  assert.equal(history.backs, 1);
  assert.equal(link.focused, true);
});

test('direct links open without adding history, while modified clicks retain browser behavior', t => {
  const { dialog, dialogEvents, click } = setup(t);
  initializeRoleDialog({ initialPath: '/careers/roles/preview-role-1/' });
  assert.equal(dialog.open, true);
  assert.equal(history.pushes.length, 0);
  dialogEvents.cancel({ preventDefault() {} });
  assert.deepEqual(history.replacements, ['/careers/']);
  assert.equal(click('https://example.test/careers/roles/preview-role-2/', { metaKey: true }).event.prevented, undefined);
  assert.equal(click('https://other.test/careers/roles/preview-role-2/').event.prevented, undefined);
});

test('whole-card links keep modifier and middle-click browser behavior and activate once with an ordinary click', t => {
  const { click } = setup(t);
  initializeRoleDialog();
  for (const event of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    assert.equal(click('https://example.test/careers/roles/preview-role-1/', event).event.prevented, undefined);
  }
  assert.equal(history.pushes.length, 0);
  assert.equal(click('https://example.test/careers/roles/preview-role-1/').event.prevented, true);
  assert.equal(history.pushes.length, 1);
});
