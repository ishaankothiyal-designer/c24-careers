import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { careersPage } from '../src/careers-page.js';

test('roles listing includes the shared pixel field without duplicating its heading and links to internal detail previews',async()=>{
  const source=await readFile(new URL('../src/sections/career-08-roles.html',import.meta.url),'utf8');
  const {html}=careersPage('/careers/','','',source);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/data-craft-field\b/g)||[]).length,1);
  assert.match(html,/class="hero__stage"/);
  assert.equal((html.match(/class="careers-card"/g)||[]).length,4);
  const sourceApplications=[...source.matchAll(/href="(\/careers\/roles\/[^"]+)"/g)].map(match=>match[1]);
  const applications=[...html.matchAll(/href="(\/careers\/roles\/[^"]+)"/g)].map(match=>match[1]);
  assert.equal(applications.length,4);
  assert.deepEqual(applications,sourceApplications);
});
