import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeContextMenuBlock } from '../src/runtime/context-menu.js';

test('the site suppresses context menus while keeping ordinary clicks available', () => {
  const root = new EventTarget();
  const cleanup = initializeContextMenuBlock(root);
  const menu = new Event('contextmenu', { cancelable: true });
  assert.equal(root.dispatchEvent(menu), false);
  assert.equal(menu.defaultPrevented, true);
  const click = new Event('click', { cancelable: true });
  assert.equal(root.dispatchEvent(click), true);
  assert.equal(click.defaultPrevented, false);
  cleanup();
  const restored = new Event('contextmenu', { cancelable: true });
  assert.equal(root.dispatchEvent(restored), true);
});
