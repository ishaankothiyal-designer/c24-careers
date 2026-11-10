import assert from 'node:assert/strict';
import test from 'node:test';
import { liveJobCard, apiJson } from '../src/runtime/live-jobs.js';
import { roleProblem } from '../src/role-problems.js';

const roles = [
  { id: 'a6a477f915ac86', title: 'Builder - Key Accounts', department: 'Retail', country: 'India', cities: ['Delhi'], employmentType: 'Permanent', experienceFrom: '0', experienceTo: '12' },
  { id: 'a6a4cf2c585259', title: 'Builder <Listing> & "Support"', department: 'Listing', country: 'India', cities: ['Gurgaon'], employmentType: 'Permanent', experienceFrom: '0', experienceTo: '14' },
];

test('landing and listing cards are a single native link covering the entire card with no nested interactive controls', () => {
  for (const listing of [false, true]) for (const job of roles) {
    const html = liveJobCard(job, listing);
    assert.match(html, /^<a class="(?:careers-card|problem-card) role-card"/);
    assert.match(html, new RegExp(`href="/careers/roles/${job.id}/"`));
    assert.ok(html.endsWith('</a>'));
    assert.equal((html.match(/<a\b/g) || []).length, 1);
    assert.doesNotMatch(html, /<button|tabindex=|onclick=|role="button"/);
    assert.match(html, /<span class="role-card__link" aria-hidden="true"><span class="role-card__link-label">Explore the work/);
    assert.ok(html.includes(`data-job-id="${job.id}"`));
    assert.match(html, listing ? /<h2 class="role-card__title"/ : /<h3 class="role-card__title"/);
  }
  assert.match(liveJobCard(roles[1]), /Builder &lt;Listing&gt; &amp; &quot;Support&quot;/);
});

test('landing and listing reuse identical card content and differ only in layout/filter hooks and heading level', () => {
  const normalize = html => html.replace('careers-card', 'problem-card').replace('data-department', 'data-problem-craft').replaceAll('h2', 'h3');
  for (const job of roles) assert.equal(normalize(liveJobCard(job, true)), liveJobCard(job));
});

test('role API failures produce recoverable visitor-facing messages and preserve abort behavior', async t => {
  const previous = globalThis.fetch;
  t.after(() => { globalThis.fetch = previous; });
  globalThis.fetch = async () => { throw new TypeError('Internal network detail'); };
  await assert.rejects(apiJson('/api/jobs'), /We couldn’t load the open roles/);
  globalThis.fetch = async () => ({ json: async () => { throw new SyntaxError('Internal HTML'); } });
  await assert.rejects(apiJson('/api/jobs'), /We couldn’t load the open roles/);
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'This role is no longer available.' }) });
  await assert.rejects(apiJson('/api/jobs/closed'), /This role is no longer available/);
  const aborted = Object.assign(new Error('aborted'), { name: 'AbortError' });
  globalThis.fetch = async () => { throw aborted; };
  await assert.rejects(apiJson('/api/jobs'), error => error === aborted);
});


test('problem statements use role focus and official titles remain in accessible names',()=>{
  assert.equal(roleProblem({title:'Builder - Evaluation Engineer',department:'Home Inspection'}),'Help people trust the cars they buy');
  assert.equal(roleProblem(roles[0]),'Build lasting relationships with key accounts');
  assert.equal(roleProblem({title:'New role',department:'New team'}),'Solve problems in New team');
  assert.equal(roleProblem({title:'New role'}),'Solve the next challenge at Cars24');
  const html=liveJobCard(roles[0]);
  assert.match(html,/aria-label="Explore the work: Builder - Key Accounts"/);
  assert.match(html,/data-no-roll>Build lasting relationships with key accounts</);
  assert.ok(html.indexOf('role-card__experience')<html.indexOf('role-card__context'));
  assert.match(html,/India <span aria-hidden="true">▪<\/span> Retail/);
  assert.doesNotMatch(html,/craft-experiments__tags|craft-tag--/);
  const escaped=liveJobCard({...roles[0],title:'Unknown',department:'<script>bad</script>',country:'<b>India</b>'});
  assert.doesNotMatch(escaped,/<script>|<b>/);
});
