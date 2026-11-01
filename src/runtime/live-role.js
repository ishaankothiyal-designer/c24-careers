import { apiJson, escape, roleMetadata } from './live-jobs.js';
import { roleLabels } from '../role-labels.js';
import { initializeCraftButtons } from './craft-buttons.js';

const privacyUrl = 'https://static-cdn.cars24.com/qa/cms/2025/08/05/b4d55900-e2cb-4418-97d0-3e084aed28b6Data%20Privacy%20Notice_Job_Applicant.pdf';
const attempts = new Map();
const storageKey = id => `c24-application:${id}`;
function previousAttempt(id) {
  try { return JSON.parse(sessionStorage.getItem(storageKey(id))) || attempts.get(id); }
  catch { return attempts.get(id); }
}
function remember(id, state) {
  attempts.set(id, state);
  try { state ? sessionStorage.setItem(storageKey(id), JSON.stringify(state)) : sessionStorage.removeItem(storageKey(id)); } catch { /* In-memory protection remains. */ }
}
const button = (label, attributes = '') => `<button type="button" class="careers-action" ${attributes}>${label}</button>`;

function formField(field, schema) {
  const label = `${escape(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}`;
  const attrs = `id="apply-${field.key}" name="${field.key}"${field.required ? ' required' : ''}`;
  if (field.key === 'resume') return `<label class="application-field" for="apply-resume">${label}<input ${attrs} type="file" accept="${schema.resumeExtensions.map(value => '.' + value).join(',')}"><small>PDF, DOC or DOCX · up to 2 MB</small></label>`;
  if (field.type === 'select') return `<label class="application-field" for="apply-${field.key}">${label}<select ${attrs}><option value="">Choose ${escape(field.label.toLowerCase())}</option>${field.options.map(option => `<option value="${escape(option.value)}">${escape(option.label)}</option>`).join('')}</select></label>`;
  const types = { email_id: 'email', phone: 'tel' }, autocomplete = { firstname: 'given-name', lastname: 'family-name', email_id: 'email', phone: 'tel-national' };
  return `<label class="application-field" for="apply-${field.key}">${label}<input ${attrs} type="${field.type === 'date' ? 'date' : types[field.key] || 'text'}" maxlength="${field.key === 'email_id' ? 254 : 120}"${autocomplete[field.key] ? ` autocomplete="${autocomplete[field.key]}"` : ''}></label>`;
}

export function liveRoleHtml(job, headingId = 'role-dialog-title') {
  const schema = job.application;
  const apply = schema.supported ? `<form data-application-form><p>Fields marked * are required.</p><fieldset class="application-fields">${schema.fields.map(field => formField(field, schema)).join('')}<label class="application-consent"><input type="checkbox" name="consent" required><span>I have read the <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">applicant privacy notice</a> and consent to my details being used for this application.</span></label><div class="application-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><button class="careers-action" type="submit">Submit application</button></fieldset><p data-application-status role="status" aria-live="polite" tabindex="-1"></p></form>` : `<p>Complete your application on the Cars24 careers site. Your selected role will open there.</p>`;
  return `<section class="container role-detail__hero" aria-labelledby="${headingId}"><h1 id="${headingId}" data-no-roll>${escape(job.title)}</h1>${roleLabels(job.department)}<p class="role-detail__summary">${escape(roleMetadata(job))}</p>${job.experienceFrom || job.experienceTo ? `<p class="role-detail__preview">Experience: ${escape(job.experienceFrom || '0')}–${escape(job.experienceTo)} ${escape(job.experienceUnit || 'Years')}</p>` : ''}</section><div class="container role-detail__layout"><div class="role-detail__content"><section class="job-description" aria-label="Job description">${job.description || '<p>A detailed description is not available for this role.</p>'}</section></div><aside class="role-detail__application" aria-labelledby="role-application-title"><h2 id="role-application-title" data-no-roll>Apply for this role</h2>${apply}<a class="role-detail__back" href="${escape(schema.externalUrl)}" target="_blank" rel="noopener noreferrer">${schema.supported ? 'Prefer the Cars24 application page?' : 'Continue on Cars24 ↗'}</a></aside></div>`;
}

export async function loadLiveRole(root, id, signal) {
  if (!root) return;
  const headingId = root.querySelector('h1')?.id || 'role-dialog-title';
  try {
    const { job } = await apiJson(`/api/jobs/${encodeURIComponent(id)}`, { signal });
    if (signal.aborted) return;
    root.innerHTML = liveRoleHtml(job, headingId);
    document.title = `${job.title} | Cars24 Careers`;
    const clearButtons = initializeCraftButtons(root);
    signal.addEventListener('abort', clearButtons, { once: true });
    const form = root.querySelector('[data-application-form]');
    if (form) initializeApplication(form, job);
  } catch (error) {
    if (signal.aborted) return;
    root.innerHTML = `<section class="container role-detail__hero"><h1 id="${headingId}" data-no-roll>Role unavailable</h1><p role="status">${escape(error.message)}</p>${button('Try again', 'data-role-retry')}<a class="role-detail__back" href="/careers/">View all roles</a></section>`;
    root.querySelector('[data-role-retry]').addEventListener('click', () => loadLiveRole(root, id, signal), { once: true });
  }
}

function initializeApplication(form, job) {
  const status = form.querySelector('[data-application-status]'), fields = form.querySelector('fieldset');
  const show = state => {
    fields.disabled = ['pending', 'unknown', 'submitted', 'created_with_errors'].includes(state?.outcome);
    status.textContent = state?.message || (state?.outcome === 'pending' ? 'An application attempt is awaiting confirmation. Please check your email or contact your recruiter before applying again.' : '');
    if (state?.reference) status.textContent += ` Reference: ${state.reference}.`;
  };
  show(previousAttempt(job.id));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (fields.disabled || !form.reportValidity()) return;
    const input = form.querySelector('input[type=file]'), file = input.files[0];
    if (!file || file.size > job.application.maxResumeBytes || !job.application.resumeExtensions.includes(file.name.split('.').pop().toLowerCase())) {
      status.textContent = 'Choose a PDF, DOC or DOCX resume of up to 2 MB.'; input.focus(); return;
    }
    fields.disabled = true; status.textContent = 'Preparing your application…';
    let sent = false;
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      let binary = ''; for (let index = 0; index < buffer.length; index += 8192) binary += String.fromCharCode(...buffer.subarray(index, index + 8192));
      const payload = { jobId: job.id, requestId: crypto.randomUUID(), fields: {}, consent: form.elements.consent.checked,
        website: form.elements.website.value, resume: { name: file.name, base64: btoa(binary) } };
      for (const field of job.application.fields) if (field.key !== 'resume') payload.fields[field.key] = form.elements[field.key].value;
      // Persist only outcome and reference; never store applicant data or the resume.
      remember(job.id, { outcome: 'pending' }); sent = true;
      status.textContent = 'Sending your application…';
      const response = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok && response.status < 500 && !result.outcome) {
        remember(job.id, null); fields.disabled = false; status.textContent = result.error || 'Please review your application.'; return;
      }
      if (response.status >= 500 || !result.outcome) throw new Error('Confirmation unavailable');
      const state = { outcome: result.outcome, message: result.message, reference: result.reference };
      remember(job.id, state); show(state);
      if (result.outcome === 'submitted' || result.outcome === 'created_with_errors') form.reset();
      status.focus();
    } catch {
      if (!sent) { fields.disabled = false; status.textContent = 'The resume could not be read. Please choose the file again.'; return; }
      const state = { outcome: 'unknown', message: 'We could not confirm the result. Your application may have reached Cars24. Please check your email or contact your recruiter before applying again.' };
      remember(job.id, state); show(state);
    }
  });
}
