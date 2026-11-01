import assert from 'node:assert/strict';
import test from 'node:test';
import { unzipSync, strFromU8 } from 'fflate';
import { applicationSchema, createCareersService, descriptionHtml, validateApplication } from '../server/careers.js';
import { darwinbox } from '../server/darwinbox.js';
import { once, sameOrigin } from '../server/http.js';
import { apiJson, liveJobCard } from '../src/runtime/live-jobs.js';
import { liveRoleHtml } from '../src/runtime/live-role.js';

const id = 'a6a477f915ac86';
const job = { job_id: id, job_title: 'Builder <Retail>', department: 'Retail', post_on_careers_page: 1, job_status: 'OPEN', location_city: ['Delhi'], employee_type: 'Permanent', hiring_lead: 'PRIVATE', salary_min: 'PRIVATE' };
const field = (name, type = 'textfield', options = false) => ({ name, type, options, required: true });
const raw = { ...job, job_decription: '&lt;p&gt;Work with customers.&lt;/p&gt;', applicant_fields: {
  'First Name': field('First Name'), 'Last Name': field('Last Name'), 'Personal Email ID': field('Personal Email ID'),
  'Country Code Personal': field('Country Code Personal', 'select', [{ label: '+91 India', value: '+91 India' }]),
  'Personal mobile no': field('Personal mobile no'), Resume: field('Resume', 'attachment'),
}, attachment_fields: { resume_details: { fields: { resume: { validation: { valid_extentions: ['pdf', 'docx', 'exe'] } } } } } };
const application = () => ({ jobId: id, requestId: crypto.randomUUID(), consent: true,
  fields: { firstname: 'Example', lastname: 'Applicant', email_id: 'example@example.test', phone_country_code: '+91 India', phone: '9999999999', api_key: 'DO-NOT-FORWARD', hiring_lead: 'DO-NOT-FORWARD' },
  resume: { name: '../../resume.pdf', base64: Buffer.from('%PDF-1.7\nTest resume').toString('base64') } });
function service(response = { success: { status: 1, candidate_id: 'TEST-1' }, errors: '' }, source = raw) {
  const calls = [];
  const instance = createCareersService({ env: {}, call: async (action, payload) => {
    calls.push({ action, payload });
    if (action === 'list') return { status: 1, data: [job, { ...job, job_id: 'internal', post_on_careers_page: 0 }, { ...job, job_id: 'closed', job_status: 'CLOSED' }] };
    if (action === 'detail') return { status: 1, data: source };
    if (response instanceof Error) throw response;
    return response;
  } });
  return { instance, calls };
}

test('Darwinbox requests use Basic auth and the endpoint-specific body key; failures do not leak credentials', async () => {
  const env = { DARWINBOX_USERNAME: 'user', DARWINBOX_PASSWORD: 'pass', DARWINBOX_JOBLIST_KEY: 'list-key', DARWINBOX_JOBDETAIL_KEY: 'detail-key' };
  await darwinbox('detail', { api_key: 'attacker', job_id: id }, { env, fetcher: async (url, options) => {
    assert.equal(url, 'https://cars24.darwinbox.in/JobsApiv3/Jobdetail');
    assert.equal(options.headers.Authorization, 'Basic ' + Buffer.from('user:pass').toString('base64'));
    assert.deepEqual(JSON.parse(options.body), { api_key: 'detail-key', job_id: id });
    return { ok: true, json: async () => ({ status: 1 }) };
  } });
  await assert.rejects(darwinbox('list', {}, { env, fetcher: async () => { throw new Error('pass list-key'); } }), error => error.status === 502 && !/pass|list-key/.test(error.message));
});

test('public APIs omit internal openings and private hiring/salary data', async () => {
  const { instance, calls } = service();
  const jobs = await instance.jobs();
  assert.deepEqual(jobs.map(job => job.id), [id]);
  await assert.rejects(instance.detail('internal'), error => error.status === 404);
  assert.equal(calls.filter(call => call.action === 'detail').length, 0);
  const detail = await instance.detail(id);
  assert.doesNotMatch(JSON.stringify(detail), /PRIVATE|hiring_lead|salary_min/);
  assert.match(detail.description, /<p>Work with customers\.<\/p>/);
  assert.equal(detail.application.supported, true);
  const url = new URL(detail.application.externalUrl);
  assert.equal(url.origin, 'https://careers.cars24.com');
  assert.equal(url.searchParams.get('id'), id);
});

test('job descriptions sanitize encoded scripts, inline events, images and unsafe links', () => {
  const result = descriptionHtml('&lt;p onclick=&quot;evil()&quot;&gt;Hello&lt;/p&gt;&lt;script&gt;evil()&lt;/script&gt;<img src=x onerror=evil()><a href="javascript:evil()">bad</a><a href="https://example.test">safe</a>');
  assert.doesNotMatch(result, /script|onclick|onerror|javascript|<img/);
  assert.match(result, /<p>Hello<\/p>/);
  assert.match(result, /rel="noopener noreferrer"/);
});

test('unknown required fields and dependent fields use the existing application page instead of guessing keys', () => {
  const source = structuredClone(raw);
  source.applicant_fields['Applied for Location'] = field('Applied for Location', 'select', { location1: 'Delhi' });
  assert.equal(applicationSchema(source, {}).supported, false);
  assert.deepEqual(applicationSchema(source, {}).unsupported, ['Applied for Location']);
  const configured = applicationSchema(source, { DARWINBOX_FIELD_MAP_JSON: JSON.stringify({ 'Applied for Location': 'confirmed_test_key' }) });
  assert.equal(configured.supported, true);
  source.applicant_fields['Applied for Location'].has_dependency = true;
  assert.equal(applicationSchema(source, { DARWINBOX_FIELD_MAP_JSON: '{"Applied for Location":"confirmed_test_key"}' }).supported, false);
});

test('application validation allows only schema fields and packages the original resume in a ZIP', () => {
  const schema = applicationSchema(raw, {});
  const fields = validateApplication(application(), schema);
  assert.equal(fields.firstname, 'Example');
  assert.equal(fields.api_key, undefined);
  assert.equal(fields.hiring_lead, undefined);
  const zip = unzipSync(Buffer.from(fields.resume, 'base64'));
  assert.deepEqual(Object.keys(zip), ['resume.pdf']);
  assert.equal(strFromU8(zip['resume.pdf']), '%PDF-1.7\nTest resume');
  assert.deepEqual(schema.resumeExtensions, ['pdf', 'docx']);
});

test('missing consent, mandatory fields, invalid dropdowns and disguised files fail before writing', () => {
  const schema = applicationSchema(raw, {});
  const mutations = [body => body.consent = false, body => delete body.fields.firstname,
    body => body.fields.phone_country_code = 'invalid', body => body.fields.email_id = 'invalid',
    body => body.resume.base64 = Buffer.from('<script>bad</script>').toString('base64'), body => body.resume.name = 'resume.exe',
    body => body.resume.base64 = 'A'.repeat(3 * 1024 * 1024)];
  for (const mutate of mutations) { const body = application(); mutate(body); assert.throws(() => validateApplication(body, schema), error => error.status === 400); }
});

test('submission refreshes publication status and handles clean, partial and uncertain outcomes without retries', async () => {
  for (const [upstream, outcome] of [[{ success: { status: 1, candidate_id: 'TEST-1' }, errors: '' }, 'submitted'],
    [{ success: { status: 1, candidate_id: 'TEST-1' }, errors: { firstname: 'error' } }, 'created_with_errors'],
    [new Error('timeout after candidate creation'), 'unknown'], [{ status: 0, message: 'invalid' }, 'rejected']]) {
    const { instance, calls } = service(upstream);
    const result = await instance.submit(application());
    assert.equal(result.outcome, outcome);
    assert.deepEqual(calls.map(call => call.action), ['list', 'detail', 'submit']);
    assert.equal(calls[2].payload.source, 1);
    assert.equal(calls[2].payload.sub_source, '');
  }
  const { instance, calls } = service(undefined, { ...raw, post_on_careers_page: 0 });
  await assert.rejects(instance.submit(application()), error => error.status === 404);
  assert.equal(calls.some(call => call.action === 'submit'), false);
});

test('same-origin enforcement and concurrent replay protection prevent duplicate local writes', async () => {
  assert.throws(() => sameOrigin({ headers: { origin: 'https://attacker.test', host: 'careers.test' } }), error => error.status === 403);
  sameOrigin({ headers: { origin: 'https://careers.test', host: 'careers.test' } });
  const body = application(); let count = 0;
  const action = async () => { count++; await Promise.resolve(); return { outcome: 'submitted' }; };
  await Promise.all([once(body, action), once(body, action)]);
  assert.equal(count, 1);
  await assert.rejects(once({ ...body, fields: { firstname: 'Changed' } }, action), error => error.status === 409);
});

test('rendered role cards escape upstream text and unsupported forms have no submit control', async () => {
  const { instance } = service();
  const detail = await instance.detail(id);
  assert.match(liveJobCard(detail), /Builder &lt;Retail&gt;/);
  const html = liveRoleHtml({ ...detail, application: { ...detail.application, supported: false } });
  assert.match(html, /Continue on Cars24/);
  assert.doesNotMatch(html, /data-application-form|type="submit"/);
  const inline = liveRoleHtml(detail);
  assert.match(inline, /data-application-form/);
  assert.match(inline, /applicant privacy notice/);
  assert.doesNotMatch(inline, /Aadhaar|bank_pan_num/);
});

test('unexpected hosting error pages produce a recoverable public message', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => ({ ok: false, json: async () => { throw new SyntaxError('Internal platform details'); } });
  await assert.rejects(apiJson('/api/jobs'), /temporarily unavailable/);
});
