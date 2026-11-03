import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { builderDetailPage } from '../src/builder-detail.js';

test('every builder card resolves to a real project story with unique IDs',async()=>{
  const html=await readFile(new URL('../src/sections/career-01-invitation.html',import.meta.url),'utf8');
  const stories=JSON.parse(await readFile(new URL('../src/builder-stories.json',import.meta.url),'utf8'));
  const routes=[...html.matchAll(/data-builder-href="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(routes.length,stories.filter(story=>story.slug!=='ishaan-kothiyal').length);
  assert.doesNotMatch(html,/Ishaan Kothiyal|ishaan-kothiyal/);
  assert.equal(new Set(routes).size,routes.length);
  for(const route of routes){
    const page=builderDetailPage(route,'','');
    assert.ok(page);assert.doesNotMatch(page.html,/Builder story not found/);
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
});

test('builder cards show pixel portraits first and retain matching real-photo reveals',async()=>{
  const html=await readFile(new URL('../src/sections/career-01-invitation.html',import.meta.url),'utf8');
  for(const [article] of html.matchAll(/<article\b[\s\S]*?<\/article>/g)){
    const pixel=article.match(/data-builder-pixel-src="([^"]+)"/)?.[1];
    const photo=article.match(/data-builder-real-src="([^"]+)"/)?.[1];
    const image=article.match(/<img\b[^>]+>/)?.[0];
    assert.ok(pixel && photo && pixel!==photo);
    assert.ok(image.includes(`src="${pixel}"`));
    assert.ok(image.includes(`data-fallback-src="${photo}"`));
    await readFile(new URL(`../public${pixel}`,import.meta.url));
    await readFile(new URL(`../public${photo}`,import.meta.url));
    assert.ok(article.indexOf('craft-experiments__tags')>article.indexOf('</h3>'));
    assert.ok(article.indexOf('craft-experiments__tags')<article.indexOf('craft-work__description'));
  }
});

test('Ishaan has a linked story grounded in shared skills and the team prototype',()=>{
  const page=builderDetailPage('/builders/ishaan-kothiyal/','','');
  assert.match(page.title,/Ishaan Kothiyal/);
  assert.match(page.html,/ten design-system skill/);
  assert.match(page.html,/early prototype/);
  assert.doesNotMatch(page.html,/@cars24\.com|U08QJHNGJ4A/);
});

test('project navigation has previous and next neighbors without wrapping at either end',async()=>{
  const stories=JSON.parse(await readFile(new URL('../src/builder-stories.json',import.meta.url),'utf8'));
  for(let i=0;i<stories.length;i++){
    const page=builderDetailPage(`/builders/${stories[i].slug}/`,'','');
    const nav=page.html.match(/<nav class="builder-story-next"[\s\S]*?<\/nav>/)[0];
    assert.equal((nav.match(/<a\b/g)||[]).length,(i>0?1:0)+(i<stories.length-1?1:0));
    if(i>0)assert.ok(nav.includes(`href="/builders/${stories[i-1].slug}/" rel="prev"`));
    if(i<stories.length-1)assert.ok(nav.includes(`href="/builders/${stories[i+1].slug}/" rel="next"`));
    assert.doesNotMatch(nav,/All builders/);
    assert.doesNotMatch(page.html,/<span class="label[^\"]*">The (?:challenge|work|outcome)<\/span>/);
  }
});
