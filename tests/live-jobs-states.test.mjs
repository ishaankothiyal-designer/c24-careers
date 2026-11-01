import assert from 'node:assert/strict';
import test from 'node:test';

const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const node = () => ({ hidden: false, dataset: {}, handlers: {}, attrs: {}, textContent: '', value: '',
  addEventListener(name, handler) { this.handlers[name] = handler; },
  setAttribute(name, value) { this.attrs[name] = value; }, focus() { this.focused = true; },
  querySelectorAll() { return []; },
});
function setup(t) {
  const previous = new Map(['document', 'window', 'fetch', 'matchMedia', 'history'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => previous.forEach((value, key) => value ? Object.defineProperty(globalThis, key, value) : delete globalThis[key]));
  const results = node(), status = node(), filters = node(), search = node(), location = node(), retry = node(), clear = node();
  const empty = node(), emptyTitle = node(), emptyCopy = node(), reset = node();
  empty.querySelector = selector => ({ '[data-job-empty-title]': emptyTitle, '[data-job-empty-copy]': emptyCopy, '[data-job-reset]': reset })[selector];
  results.insertAdjacentHTML = () => {};
  Object.defineProperty(results, 'innerHTML', { set(html) { this.children = [...html.matchAll(/data-job-id="([^"]+)"/g)].map(match => ({ dataset: { jobId: match[1] }, hidden: false })); } });
  results.children = [];
  filters.querySelectorAll = () => [];
  const selectors = { '[data-job-results]': results, '[data-job-status]': status, '[data-job-filters]': filters,
    '[data-job-search]': search, '[data-job-location]': location, '[data-job-retry]': retry, '[data-job-clear]': clear, '[data-job-empty]': empty };
  const root = { dataset: { liveJobs: 'listing' }, querySelector: selector => selectors[selector] || null };
  globalThis.document = { querySelectorAll: () => [root] };
  globalThis.matchMedia = () => ({ matches: true });
  globalThis.window = { location: { href: 'https://example.test/careers/', search: '' }, dispatchEvent() {} };
  globalThis.history = { replaceState(_, __, url) { this.lastUrl = String(url); } };
  return { results, status, filters, search, retry, clear, empty, emptyTitle, reset };
}

test('role feed announces loading, hides stale controls on error, and retries into a truthful empty state', async t => {
  const ui = setup(t);
  let rejectFetch;
  globalThis.fetch = () => new Promise((_, reject) => { rejectFetch = reject; });
  const { initializeLiveJobs } = await import(`../src/runtime/live-jobs.js?loading=${Date.now()}`);
  initializeLiveJobs();
  assert.equal(ui.status.textContent, 'Loading open roles…');
  assert.equal(ui.results.attrs['aria-busy'], 'true');
  assert.equal(ui.retry.hidden, true);
  rejectFetch(new Error('network'));
  await flush();
  assert.equal(ui.results.hidden, true);
  assert.equal(ui.filters.hidden, true);
  assert.equal(ui.retry.hidden, false);
  assert.equal(ui.results.attrs['aria-busy'], 'false');
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ jobs: [] }) });
  await ui.retry.handlers.click();
  await flush();
  assert.equal(ui.retry.hidden, true);
  assert.equal(ui.filters.hidden, false);
  assert.equal(ui.empty.hidden, false);
  assert.equal(ui.emptyTitle.textContent, 'More opportunities ahead.');
  assert.equal(ui.reset.hidden, true);
});

test('search with no matches retains clear/reset recovery and resetting restores all role targets', async t => {
  const ui = setup(t);
  const jobs = [{ id: 'first', title: 'Engineer', department: 'Retail', cities: ['Delhi'] }, { id: 'second', title: 'Analyst', department: 'Finance', cities: ['Gurgaon'] }];
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ jobs }) });
  const { initializeLiveJobs } = await import(`../src/runtime/live-jobs.js?search=${Date.now()}`);
  initializeLiveJobs();
  await flush();
  assert.equal(ui.results.children.length, 2);
  ui.search.value = 'No such role';
  ui.search.handlers.input();
  assert.equal(ui.results.hidden, true);
  assert.equal(ui.empty.hidden, false);
  assert.equal(ui.clear.hidden, false);
  assert.ok(ui.results.children.every(card => card.hidden));
  assert.match(globalThis.history.lastUrl, /q=No\+such\+role/);
  ui.reset.handlers.click();
  assert.equal(ui.search.value, '');
  assert.equal(ui.results.hidden, false);
  assert.equal(ui.empty.hidden, true);
  assert.ok(ui.results.children.every(card => !card.hidden));
  assert.equal(ui.search.focused, true);
});
