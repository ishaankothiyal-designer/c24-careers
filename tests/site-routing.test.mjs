import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routePath, siteLinks } from '../src/site-routing.js';

test('recognizes listing and project routes beneath the GitHub Pages base', () => {
  assert.equal(routePath('/c24-careers/careers/', '/c24-careers/'), '/careers/');
  assert.equal(routePath('/c24-careers/builders/mayank/', '/c24-careers/'), '/builders/mayank/');
  assert.equal(routePath('/c24-careers', '/c24-careers/'), '/');
  assert.equal(routePath('/careers/'), '/careers/');
  assert.equal(routePath('/c24-careers-other/careers/', '/c24-careers/'), '/c24-careers-other/careers/');
});

test('keeps navigation inside its deployment and preserves external and local anchors', () => {
  const input = '<a href="/careers/">Roles</a><article data-builder-href="/builders/mayank/"></article><a href="/#builders">Back</a><a href="#roles">Jump</a><a href="https://careers.cars24.com/">Apply</a><a href="//example.com/">External</a>';
  const output = siteLinks(input, '/c24-careers/');
  assert.match(output, /href="\/c24-careers\/careers\/"/);
  assert.match(output, /data-builder-href="\/c24-careers\/builders\/mayank\/"/);
  assert.match(output, /href="\/c24-careers\/#builders"/);
  assert.match(output, /href="#roles"/);
  assert.match(output, /href="https:\/\/careers.cars24.com\/"/);
  assert.match(output, /href="\/\/example.com\/"/);
  assert.equal(siteLinks(output, '/c24-careers/'), output);
  assert.equal(siteLinks(input), input);
});

test('build emits matching app shells for the listing and every project route', async () => {
  const root = new URL('../dist/client/', import.meta.url);
  const home = await readFile(new URL('index.html', root), 'utf8');
  const stories = JSON.parse(await readFile(new URL('../src/builder-stories.json', import.meta.url), 'utf8'));
  for (const route of ['careers', ...stories.map(story => `builders/${story.slug}`)]) {
    assert.equal(await readFile(new URL(`${route}/index.html`, root), 'utf8'), home, route);
  }
});
