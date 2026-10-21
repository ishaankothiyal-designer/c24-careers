import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { builderDetailPage } from '../src/builder-detail.js';

test('every builder card resolves to a real project story with unique IDs',async()=>{
  const html=await readFile(new URL('../src/sections/career-01-invitation.html',import.meta.url),'utf8');
  const stories=JSON.parse(await readFile(new URL('../src/builder-stories.json',import.meta.url),'utf8'));
  const routes=[...html.matchAll(/data-builder-href="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(routes.length,stories.length);
  assert.equal(new Set(routes).size,routes.length);
  for(const route of routes){
    const page=builderDetailPage(route,'','');
    assert.ok(page);assert.doesNotMatch(page.html,/Builder story not found/);
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
});

test('Ishaan has a linked story grounded in shared skills and the team prototype',()=>{
  const page=builderDetailPage('/builders/ishaan-kothiyal/','','');
  assert.match(page.title,/Ishaan Kothiyal/);
  assert.match(page.html,/ten design-system skill/);
  assert.match(page.html,/early prototype/);
  assert.doesNotMatch(page.html,/@cars24\.com|U08QJHNGJ4A/);
});
