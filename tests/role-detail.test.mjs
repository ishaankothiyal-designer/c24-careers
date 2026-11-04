import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { roleDetailPage } from '../src/role-detail.js';
import { roleDetailLayout } from '../src/role-layout.js';

const previews = JSON.parse(await readFile(new URL('../src/role-previews.json', import.meta.url), 'utf8'));

test('legacy preview links remain distinct, explicitly illustrative and directly accessible', async () => {
  for (const role of previews) {
    const route = `/careers/roles/${role.slug}/`;
    const page = roleDetailPage(route, '', '');
    assert.match(page.html, /Role preview/);
    assert.match(page.html, /Applications aren’t open/);
    assert.doesNotMatch(page.html, /data-application-form/);
    const built = await readFile(new URL(`../dist/client${route}index.html`, import.meta.url), 'utf8');
    assert.match(built, /id="root"/);
  }
  assert.equal(new Set(previews.map(role => role.slug)).size, previews.length);
});

test('live role IDs load API details without fabricating a preview', () => {
  const page = roleDetailPage('/careers/roles/a6a425523b4d48/', '', '');
  assert.match(page.html, /data-live-role="a6a425523b4d48"/);
  assert.doesNotMatch(page.html, /illustrative|Role not found/);
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

test('the shared role layout places application controls after every content section', () => {
  const html=roleDetailLayout({header:'ROLE_HEADER',facts:'ROLE_FACTS',content:'ROLE_DESCRIPTION_AND_LOCATIONS',recovery:'ROLE_RECOVERY',application:'ROLE_FORM'});
  const parts=['ROLE_HEADER','ROLE_FACTS','ROLE_DESCRIPTION_AND_LOCATIONS','ROLE_RECOVERY','ROLE_FORM'];
  for(let index=1;index<parts.length;index++)assert.ok(html.indexOf(parts[index])>html.indexOf(parts[index-1]));
  assert.match(html,/<div class="role-detail__content">ROLE_FACTSROLE_DESCRIPTION_AND_LOCATIONSROLE_RECOVERY<\/div>\s*<section class="role-detail__application"/);
});
