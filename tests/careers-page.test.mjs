import assert from 'node:assert/strict';
import test from 'node:test';
import { careersPage } from '../src/careers-page.js';

test('careers listing loads live roles with search, location and accessible loading states', () => {
  const { html } = careersPage('/careers/', '', '');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/data-craft-field\b/g) || []).length, 1);
  for (const hook of ['data-live-jobs="listing"', 'data-job-search', 'data-job-location', 'data-job-filters', 'data-job-results', 'aria-busy="true"', 'data-job-retry']) assert.ok(html.includes(hook));
  assert.doesNotMatch(html, /preview-role|illustrative|4 role previews/);
  assert.equal(careersPage('/builders/example/', '', ''), null);
});
