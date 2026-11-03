import assert from 'node:assert/strict';
import test from 'node:test';
import { darwinbox } from '../server/darwinbox.js';

const env = {
  DARWINBOX_USERNAME: 'studio-user', DARWINBOX_PASSWORD: 'studio-password',
  DARWINBOX_JOBLIST_KEY: 'list-test-key', DARWINBOX_JOBDETAIL_KEY: 'detail-test-key',
  DARWINBOX_SUBMITJOB_KEY: 'submit-test-key',
};

test('each Darwinbox operation uses its own server key and the configured tenant endpoint', async () => {
  for (const [action, endpoint, key] of [
    ['list', 'joblist', 'list-test-key'], ['detail', 'Jobdetail', 'detail-test-key'],
    ['submit', 'submitjob', 'submit-test-key'],
  ]) {
    const payload = action === 'submit' ? {
      job_id: 'test-job', source: 1, sub_source: '',
      applicant_fields: { firstname: 'Test', phone_country_code: '+91 India', resume: 'test-zip-base64' },
    } : { job_id: 'test-job' };
    let requests = 0;
    await darwinbox(action, payload, { env, fetcher: async (url, request) => {
      requests++;
      assert.equal(url, `https://cars24.darwinbox.in/JobsApiv3/${endpoint}`);
      assert.equal(request.method, 'POST');
      assert.equal(request.headers['Content-Type'], 'application/json');
      assert.equal(request.headers.Authorization, `Basic ${Buffer.from('studio-user:studio-password').toString('base64')}`);
      assert.deepEqual(JSON.parse(request.body), { ...payload, api_key: key });
      return { ok: true, json: async () => ({ success: { status: 1 }, errors: '' }) };
    } });
    assert.equal(requests, 1);
  }
});

test('endpoint API keys do not replace the Studio Basic auth credentials required by V3', async () => {
  for (const missing of ['DARWINBOX_USERNAME', 'DARWINBOX_PASSWORD', 'DARWINBOX_SUBMITJOB_KEY']) {
    let requests = 0;
    await assert.rejects(darwinbox('submit', {}, {
      env: { ...env, [missing]: '' }, fetcher: async () => { requests++; },
    }), error => error.status === 503);
    assert.equal(requests, 0);
  }
});
