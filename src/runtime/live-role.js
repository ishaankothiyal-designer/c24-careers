import { apiJson, escape } from './live-jobs.js';
import { roleDetailLayout } from '../role-layout.js';
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

const fieldLabels = { firstname: 'First name', lastname: 'Last name', email_id: 'Email address', phone_country_code: 'Country code', phone: 'Mobile number', resume: 'Resume' };
const fieldOrder = ['firstname', 'lastname', 'email_id', 'phone_country_code', 'phone', 'resume'];

function formField(field, schema) {
  const displayLabel = field.displayLabel || fieldLabels[field.key] || field.label;
  const label = `<span>${escape(displayLabel)}${field.required ? ' <span aria-hidden="true">*</span>' : field.purpose === 'application-location' ? ' (optional)' : ''}</span>`;
  const attrs = `id="apply-${field.key}" name="${field.key}"${field.required ? ' required' : ''}`;
  if (field.key === 'resume') return `<div class="application-field"><label for="apply-resume">${label}</label><div class="application-upload"><input ${attrs} type="file" accept="${schema.resumeExtensions.map(value => '.' + value).join(',')}" aria-describedby="apply-resume-hint"><span data-resume-name aria-hidden="true">No file selected</span><span class="application-upload__browse" aria-hidden="true">Browse</span></div><small id="apply-resume-hint">${schema.resumeExtensions.map(value => value.toUpperCase()).join(', ')} · up to 2 MB</small></div>`;
  if (field.type === 'select') return `<label class="application-field application-field--${field.key}" for="apply-${field.key}">${label}<select ${attrs}><option value="">Choose ${escape(displayLabel.toLowerCase())}</option>${field.options.map(option => `<option value="${escape(option.value).replace(/\r/g, '&#13;').replace(/\n/g, '&#10;')}"${option.value === field.defaultValue ? ' selected' : ''}>${escape(field.key === 'phone_country_code' && /^\+971(?:\s|$)/.test(option.value) ? 'UAE (+971)' : option.label)}</option>`).join('')}</select></label>`;
  const types = { email_id: 'email', phone: 'tel' }, autocomplete = { firstname: 'given-name', lastname: 'family-name', email_id: 'email', phone: 'tel-national' };
  return `<label class="application-field application-field--${field.key}" for="apply-${field.key}">${label}<input ${attrs} type="${field.type === 'date' ? 'date' : types[field.key] || 'text'}" maxlength="${field.key === 'email_id' ? 254 : 120}"${autocomplete[field.key] ? ` autocomplete="${autocomplete[field.key]}"` : ''}></label>`;
}

function phoneField(phone, country) {
  const optionLabel = option => {
    const code = option.value.match(/^\+\d+/)?.[0];
    if (!code) return option.label;
    const name = option.label.replace(/^\+\d+\s*/, '').trim();
    return `${/^United Arab Emirates$/i.test(name) ? 'UAE' : name} (${code})`;
  };
  return `<div class="application-field application-field--phone"><label for="apply-phone">Mobile number${phone.required || country.required ? ' <span aria-hidden="true">*</span>' : ''}</label><div class="application-phone"><select id="apply-phone_country_code" name="phone_country_code" aria-label="Country and dial code" autocomplete="tel-country-code" aria-describedby="apply-phone-hint"${country.required ? ' required' : ''}><option value="">Country</option>${country.options.map(option => `<option value="${escape(option.value)}">${escape(optionLabel(option))}</option>`).join('')}</select><input id="apply-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="tel" maxlength="25" aria-describedby="apply-phone-hint"${phone.required ? ' required' : ''}></div><small id="apply-phone-hint">Select your country, then enter your number without the country code.</small></div>`;
}

export function liveRoleHtml(job, headingId = 'role-dialog-title') {
  const schema = job.application;
  // Optional, unmapped location must not disable an otherwise supported application.
  const canSubmit = schema.supported;
  const showForm = schema.supported || Boolean(schema.locationPreference);
  const visibleFields = [...schema.fields];
  if (!schema.supported && schema.locationPreference && !schema.locationPreference.mappedKey) visibleFields.push({
    key: 'local-location-preference', label: 'Applied for Location', displayLabel: 'Application location',
    purpose: 'application-location', type: 'select', required: true,
    options: schema.locationPreference.options, defaultValue: schema.locationPreference.defaultValue,
  });
  const orderedFields = visibleFields.sort((a, b) => {
    const rank = field => field.purpose === 'application-location' ? fieldOrder.indexOf('resume') - 0.5 : fieldOrder.includes(field.key) ? fieldOrder.indexOf(field.key) : fieldOrder.length;
    return rank(a) - rank(b);
  });
  const phone = orderedFields.find(field => field.key === 'phone');
  const country = orderedFields.find(field => field.key === 'phone_country_code');
  const fieldsHtml = orderedFields.map(field => {
    if (phone && country && field.key === 'phone_country_code') return '';
    return phone && country && field.key === 'phone' ? phoneField(phone, country) : formField(field, schema);
  }).join('');
  const optionalLocationNotice = schema.supported && schema.locationPreference && !schema.locationPreference.mappedKey
    ? '<p class="application-availability">You can apply now. Location preference is not collected by this form yet.</p>' : '';
  const apply = showForm ? `<form id="role-application-form" data-application-form aria-label="Apply for this role"${canSubmit ? '' : ' data-application-blocked="true"'}>${optionalLocationNotice}${canSubmit ? '' : `<p class="application-availability" role="status">Location selection is available, but applications for this role are not ready to submit on this page yet. Please check back soon.</p>`}<fieldset class="application-fields"><legend class="application-legend">Apply for this role</legend>${fieldsHtml}<label class="application-consent"><input type="checkbox" name="consent" required><span>I have read the <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">applicant privacy notice</a> and consent to my details being used for this application.</span></label><div class="application-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><button class="careers-action craft-button btn-bubble-arrow btn-bubble-arrow--black application-submit" data-craft-static type="submit"${canSubmit ? '' : ' disabled'}><span class="craft-button-label">Apply for this role <span aria-hidden="true">↗</span></span></button></fieldset><p data-application-status role="status" aria-live="polite" tabindex="-1"></p></form>` : '';
  const experience = experienceLabel(job);
  const cities = job.cities || [];
  const facts = [
    ['Department', job.department], ['Employment', job.employmentType],
    ['Experience', experience], ['Country', job.country],
    ...(job.remote ? [['Work arrangement', 'Remote']] : []), ['Job reference', job.code],
  ].filter(([, value]) => value);
  const unavailableCta = '<button class="craft-button btn-bubble-arrow btn-bubble-arrow--black role-detail__apply" data-craft-static type="button" disabled><span class="craft-button-label">Apply for this role ↗</span></button>';
  const workplaces = (job.locations || []).filter(location => !cities.includes(location));
  const workplaceDetails = workplaces.length ? `<details class="role-detail__workplaces"><summary>View workplace details</summary><ul>${workplaces.map(location => `<li>${escape(location)}</li>`).join('')}</ul></details>` : '';
  const locations = cities.length ? `<section class="role-detail__locations" aria-labelledby="role-locations-title"><h2 id="role-locations-title" data-no-roll>${cities.length === 1 ? 'Location' : 'Locations'}</h2>${cities.length > 6 ? `<details><summary>View all ${cities.length} cities</summary><ul>${cities.map(city => `<li>${escape(city)}</li>`).join('')}</ul></details>` : `<ul>${cities.map(city => `<li>${escape(city)}</li>`).join('')}</ul>`}${workplaceDetails}</section>` : workplaceDetails;
  return roleDetailLayout({
    header: `<header class="role-detail__hero" aria-labelledby="${headingId}">
      ${roleLabels(job)}<h1 id="${headingId}" data-no-roll>${escape(job.title)}</h1>
      <p class="role-detail__summary">${escape([cities.length > 3 ? `${cities.slice(0, 3).join(', ')} + ${cities.length - 3} more` : cities.join(', '), job.employmentType, job.remote ? 'Remote' : ''].filter(Boolean).join(' · '))}</p>
      ${showForm ? '<button class="role-detail__mobile-action role-detail__back" type="button" data-application-jump>Jump to application ↓</button>' : ''}
    </header>`,
    facts: `<dl class="role-detail__facts">${facts.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`,
    content: `<section class="job-description" aria-label="Job description">${job.description || '<p>A detailed description is not available for this role.</p>'}</section>${locations}`,

    application: showForm ? apply : unavailableCta,
  });
}

export function experienceLabel(job) {
  const from = String(job.experienceFrom ?? '').trim(), to = String(job.experienceTo ?? '').trim();
  if (!from && !to) return '';
  const unit = job.experienceUnit || 'Years';
  if (from && to) return `${from === to ? from : `${from}–${to}`} ${unit}`;
  return from ? `${from}+ ${unit}` : `Up to ${to} ${unit}`;
}

// Darwinbox descriptions mix semantic headings with Word-style bold paragraphs.
// Normalize their structure without changing or summarizing the published copy.
export function formatDescription(root) {
  const description = root.querySelector('.job-description');
  if (!description) return;
  description.querySelectorAll('p, b, strong, h2, h3, h4').forEach(node => {
    if (!node.isConnected) return;
    const copy = node.textContent.trim();
    if (!copy && !node.querySelector('a, li')) { node.remove(); return; }
    const isParagraphHeading = node.tagName === 'P' && copy.length < 100 &&
      (/^(What drives us|What will you drive|Who are we looking for)\?$/i.test(copy) ||
        (node.children.length === 1 && ['B', 'STRONG'].includes(node.firstElementChild.tagName)));
    const isBareHeading = ['B', 'STRONG'].includes(node.tagName) && node.parentElement === description && copy.length < 100;
    if (!isParagraphHeading && !isBareHeading) return;
    const heading = document.createElement('h2');
    heading.textContent = copy;
    node.replaceWith(heading);
  });
}

function initializeStickyApplication(root, signal) {
  const panel = root.closest('.role-dialog');
  const aside = root.querySelector('.role-detail__application');
  const toolbar = panel?.querySelector('.role-dialog__toolbar');
  if (!panel || !aside || !toolbar) return;
  const update = () => {
    aside.style.setProperty('--role-toolbar-height', `${toolbar.getBoundingClientRect().height}px`);
    const top = parseFloat(getComputedStyle(aside).top) || 0;
    // A tall form must scroll with the document so its final controls stay reachable.
    aside.dataset.sticky = String(matchMedia('(min-width: 900px)').matches && aside.offsetHeight + top + Math.max(0, top - toolbar.getBoundingClientRect().height) <= panel.clientHeight);
  };
  const observer = new ResizeObserver(update);
  [panel, aside, toolbar].forEach(element => observer.observe(element));
  window.addEventListener('resize', update, { signal, passive: true });
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  update();
}

export async function loadLiveRole(root, id, signal) {
  if (!root) return;
  const headingId = root.querySelector('h1')?.id || 'role-dialog-title';
  try {
    const response = await apiJson(`/api/jobs/${encodeURIComponent(id)}`, { signal });
    const job = response?.job;
    if (!job?.application || !Array.isArray(job.application.fields)) throw new Error('We couldn’t load this role. Please try again.');
    if (signal.aborted) return;
    root.innerHTML = liveRoleHtml(job, headingId);
    document.title = `${job.title} | Cars24 Careers`;
    formatDescription(root);
    initializeStickyApplication(root, signal);
    const clearButtons = initializeCraftButtons(root);
    signal.addEventListener('abort', clearButtons, { once: true });
    const form = root.querySelector('[data-application-form]');
    if (form) {
      initializeApplication(form, job);
      root.querySelector('[data-application-jump]')?.addEventListener('click', () => {
        const target = form.querySelector('fieldset').disabled ? form.querySelector('[data-application-status]') : form.querySelector('input');
        target?.focus({ preventScroll: true });
        form.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    }
  } catch (error) {
    if (signal.aborted) return;
    root.innerHTML = `<section class="container role-detail__hero"><h1 id="${headingId}" data-no-roll>Role unavailable</h1><p role="status">${escape(error.message)}</p>${button('Try again', 'data-role-retry')}<a class="role-detail__back" href="/careers/">View all roles</a></section>`;
    root.querySelector('[data-role-retry]').addEventListener('click', () => loadLiveRole(root, id, signal), { once: true });
  }
}

function initializeApplication(form, job) {
  const status = form.querySelector('[data-application-status]'), fields = form.querySelector('fieldset');
  const resumeInput = form.querySelector('input[type=file]');
  const resumeName = form.querySelector('[data-resume-name]');
  const updateResumeName = () => { resumeName.textContent = resumeInput.files[0]?.name || 'No file selected'; };
  resumeInput.addEventListener('change', updateResumeName);
  form.addEventListener('reset', () => { resumeName.textContent = 'No file selected'; });
  const show = state => {
    fields.disabled = ['pending', 'unknown', 'submitted', 'created_with_errors'].includes(state?.outcome);
    status.textContent = state?.message || (state?.outcome === 'pending' ? 'An application attempt is awaiting confirmation. Please check your email or contact your recruiter before applying again.' : '');
    if (state?.reference) status.textContent += ` Reference: ${state.reference}.`;
  };
  show(previousAttempt(job.id));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.dataset.applicationBlocked === 'true') { status.textContent = 'This application cannot be submitted here yet. Please use the Cars24 application page.'; return; }
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
