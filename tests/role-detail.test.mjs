import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { roleDetailPage } from '../src/role-detail.js';

const previews = JSON.parse(await readFile(new URL('../src/role-previews.json', import.meta.url), 'utf8'));

test('every homepage and listing role link resolves to a distinct preview and a built route', async () => {
  const routes = [];
  for (const file of ['career-02-problems.html', 'career-08-roles.html']) {
    const html = await readFile(new URL(`../src/sections/${file}`, import.meta.url), 'utf8');
    for (const [, route] of html.matchAll(/href="(\/careers\/roles\/[^"\s]+)"/g)) {
      routes.push(route);
      const page = roleDetailPage(route, '<header>Navigation</header>', '<footer>Footer</footer>');
      assert.ok(page);
      assert.doesNotMatch(page.html, /Role not found/);
      assert.match(page.html, /Role preview/);
      assert.match(page.html, /Applications aren’t open/);
      assert.doesNotMatch(page.html, /href="https:\/\/careers.cars24.com/);
      assert.equal((page.html.match(/<h1\b/g) || []).length, 1);
      const built = await readFile(new URL(`../dist/client${route}index.html`, import.meta.url), 'utf8');
      assert.match(built, /id="root"/);
    }
  }
  assert.equal(routes.length, previews.length);
  assert.equal(new Set(routes).size, previews.length);
});

test('unknown roles get a recovery page and unrelated routes are left alone', () => {
  assert.equal(roleDetailPage('/careers/', '', ''), null);
  assert.equal(roleDetailPage('/builders/example/', '', ''), null);
  const page = roleDetailPage('/careers/roles/missing/', '', '');
  assert.match(page.title, /Role not found/);
  assert.match(page.html, /href="\/careers\/"/);
  assert.doesNotMatch(page.html, /Interested in this work/);
  assert.equal(roleDetailPage(`/careers/roles/${previews[0].slug}`, '', '').title,
    roleDetailPage(`/careers/roles/${previews[0].slug}/`, '', '').title);
});
