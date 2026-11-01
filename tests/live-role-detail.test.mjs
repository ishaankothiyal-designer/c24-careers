import assert from 'node:assert/strict';
import test from 'node:test';
import { liveRoleHtml, experienceLabel } from '../src/runtime/live-role.js';

const job = {
  id: 'a6a477f915ac86', code: 'JOB156', title: 'Builder <Key Accounts>', department: 'Retail',
  cities: Array.from({ length: 139 }, (_, i) => `City ${i + 1}`), country: 'India',
  locations: ['Delhi workplace <HQ>'], employmentType: 'Permanent', experienceFrom: '0', experienceTo: '12', experienceUnit: 'Years',
  description: '<h2>Responsibilities</h2><p>Complete published description.</p>',
  application: { supported: true, fields: [], resumeExtensions: ['pdf'], externalUrl: 'https://careers.cars24.com/role/?id=example' },
};

test('live detail retains the full description and every location beyond the compact hero summary', () => {
  const html = liveRoleHtml(job);
  assert.ok(html.includes(job.description));
  assert.match(html, /View all 139 cities/);
  for (const city of job.cities) assert.ok(html.includes(`<li>${city}</li>`));
  assert.match(html, /Builder &lt;Key Accounts&gt;/);
  assert.match(html, /0–12 Years/);
  assert.match(html, /JOB156/);
  assert.match(html, /Permanent/);
  assert.match(html, /View workplace details/);
  assert.match(html, /Delhi workplace &lt;HQ&gt;/);
});

test('application form is visible with one submit action and unavailable mappings never redirect applicants', () => {
  const html = liveRoleHtml(job);
  assert.match(html, /id="role-application-form" data-application-form aria-label="Apply for this role"/);
  assert.doesNotMatch(html, /data-application-form hidden|data-role-apply|Submit application/);
  assert.equal((html.match(/type="submit"/g) || []).length, 1);
  const right = html.split('<aside')[1];
  assert.doesNotMatch(right, /role-detail__facts|role-detail__summary|job-description|Your next chapter|role-detail__back/);
  const fallback = liveRoleHtml({ ...job, application: { ...job.application, supported: false } });
  assert.doesNotMatch(fallback, /data-application-form|type="submit"/);
  assert.doesNotMatch(fallback, /href="https:\/\/careers\.cars24\.com/);
  assert.match(fallback, /type="button" disabled/);
  assert.match(fallback, /Apply for this role/);
});

test('experience labels handle zero, equal bounds, missing bounds and tenant units', () => {
  assert.equal(experienceLabel({}), '');
  assert.equal(experienceLabel({ experienceFrom: '', experienceTo: undefined }), '');
  assert.equal(experienceLabel({ experienceFrom: '0', experienceTo: '0' }), '0 Years');
  assert.equal(experienceLabel({ experienceFrom: '3' }), '3+ Years');
  assert.equal(experienceLabel({ experienceTo: '6', experienceUnit: 'Months' }), 'Up to 6 Months');
});


test('combined phone control preserves the separate Darwinbox names and exact country option values', () => {
  const fields = [
    { key: 'phone_country_code', required: true, type: 'select', options: [{ value: '+91 India', label: '+91 India' }, { value: '+971 United Arab Emirates', label: 'UAE' }] },
    { key: 'phone', required: true, type: 'textfield' },
    { key: 'resume', required: true, type: 'attachment' },
  ];
  const html = liveRoleHtml({ ...job, application: { ...job.application, fields } });
  assert.equal((html.match(/class="application-phone"/g) || []).length, 1);
  assert.equal((html.match(/name="phone_country_code"/g) || []).length, 1);
  assert.equal((html.match(/name="phone"/g) || []).length, 1);
  assert.match(html, /value="\+91 India">India \(\+91\)<\/option>/);
  assert.match(html, /value="\+971 United Arab Emirates">UAE \(\+971\)<\/option>/);
  assert.match(html, /class="application-upload"/);
  assert.match(html, /name="resume" required/);
});

test('mapped location renders a visible editable select with the valid default and preserves option bytes', () => {
  const value = 'Gurgaon, Haryana\r, India (Office)';
  const fields = [{ key: 'confirmed_test_location_key', label: 'Applied for Location', displayLabel: 'Application location', purpose: 'application-location', type: 'select', required: true, defaultValue: value, options: [{ value, label: value }, { value: 'Delhi', label: 'Delhi' }] }];
  const html = liveRoleHtml({ ...job, application: { ...job.application, fields } });
  assert.match(html, /Application location/);
  assert.match(html, /<select id="apply-confirmed_test_location_key" name="confirmed_test_location_key" required>/);
  assert.match(html, /value="Gurgaon, Haryana&#13;, India \(Office\)" selected/);
  assert.match(html, /<option value="Delhi">Delhi<\/option>/);
  assert.doesNotMatch(html, /name="confirmed_test_location_key"[^>]*(?:disabled|hidden)/);
});
