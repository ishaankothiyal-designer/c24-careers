import sanitizeHtml from 'sanitize-html';
import { zipSync } from 'fflate';
import { CareersError, darwinbox } from './darwinbox.js';

export const MAX_RESUME_BYTES = 2 * 1024 * 1024;
const knownFields = Object.freeze({
  'First Name': 'firstname', 'Middle Name': 'middlename', 'Last Name': 'lastname',
  'Personal Email ID': 'email_id', 'Country Code Personal': 'phone_country_code',
  'Personal mobile no': 'phone', Resume: 'resume', Gender: 'gender',
  'Date of Birth': 'date_of_birth', Aadhaar: 'adhar_card_number', PAN: 'bank_pan_num',
});
const essentialFields = new Set(['firstname', 'lastname', 'email_id', 'phone_country_code', 'phone', 'resume']);
const text = value => String(value ?? '').trim();
const strings = values => Array.isArray(values) ? [...new Set(values.map(text).filter(Boolean))] : [];
export const validJobId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
export const isPublic = job => Number(job.post_on_careers_page) === 1 && (!job.job_status || text(job.job_status).toUpperCase() === 'OPEN');

export function descriptionHtml(value) {
  const decoded = text(value).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');
  return sanitizeHtml(decoded, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'blockquote'],
    allowedAttributes: { a: ['href', 'title', 'rel', 'target'] }, allowedSchemes: ['https', 'http', 'mailto'], allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }) },
  });
}

export function publicJob(job) {
  return {
    id: text(job.job_id), code: text(job.job_code), title: text(job.job_title), department: text(job.department),
    cities: strings(job.location_city), locations: strings(job.location), country: text(job.location_country),
    employmentType: text(job.employee_type), remote: Number(job.is_remote) === 1,
    experienceFrom: text(job.experience_from), experienceTo: text(job.experience_to),
  };
}

// Matches the role-link builder observed on careers.cars24.com on 1 Nov 2026.
export function hostedApplicationUrl(job) {
  const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const query = new URLSearchParams({ id: job.id, title: job.title, team: job.department, location: job.cities.join(', '), type: job.employmentType });
  return `https://careers.cars24.com/${slug}/?${query}`;
}

function optionsFor(field) {
  if (Array.isArray(field.options)) return field.options.map(option => typeof option === 'object'
    ? { value: text(option.label), label: text(option.label) } : { value: text(option), label: text(option) });
  return field.options && typeof field.options === 'object'
    ? Object.values(field.options).map(label => ({ value: text(label), label: text(label) })) : [];
}

// Default only an unambiguous, tenant-provided Gurgaon/Gurugram workplace.
// The option label is the Submit Job V3 value, not its workplace ID.
function preferredLocation(options) {
  const matching = options.filter(option => /^(?:gurgaon|gurugram)(?=$|[\s,(])/i.test(option.label));
  return matching.length === 1 ? matching[0].value : undefined;
}

export function applicationSchema(raw, env = process.env) {
  let configured = {};
  try {
    const parsed = JSON.parse(env.DARWINBOX_FIELD_MAP_JSON || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) configured = parsed;
  } catch { /* Unknown required fields still fail closed below. */ }
  const fields = [], unsupported = [];
  for (const [label, field] of Object.entries(raw.applicant_fields || {})) {
    const key = Object.hasOwn(configured, label) ? configured[label] : knownFields[label];
    const required = field.required === true || field.required === 1 || field.required === '1' || field.required === 'true';
    const supportedType = ['textfield', 'textarea', 'date', 'select', 'attachment'].includes(field.type);
    const supported = typeof key === 'string' && /^[a-zA-Z0-9_]+$/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key)
      && supportedType && (field.type !== 'attachment' || key === 'resume') && !field.has_dependency && !field.hasDependentDropdown && !field.is_calculation_active;
    if (!supported) { if (required) unsupported.push(label); continue; }
    const isLocation = label === 'Applied for Location' && field.type === 'select';
    if (!required && !essentialFields.has(key) && !isLocation) continue;
    const options = optionsFor(field).filter(option => !['other', 'others'].includes(option.label.toLowerCase()));
    // Requested UAE choice; preserve a tenant-provided label when available.
    // Acceptance of the fallback label must be checked in the controlled submission.
    if (key === 'phone_country_code' && !options.some(option => /^\+971(?:\s|$)/.test(option.value))) {
      options.push({ value: '+971 United Arab Emirates', label: '+971 United Arab Emirates' });
    }
    if (required && field.type === 'select' && !options.length) { unsupported.push(label); continue; }
    fields.push({ key, label, required: required || essentialFields.has(key), type: field.type, options,
      ...(isLocation ? { purpose: 'application-location', displayLabel: 'Application location', defaultValue: preferredLocation(options) } : {}),
    });
  }
  // A missing schema is not permission to submit an incomplete application.
  for (const key of ['firstname', 'email_id', 'phone_country_code', 'phone', 'resume']) {
    if (!fields.some(field => field.key === key)) unsupported.push(key);
  }
  const locationField = raw.applicant_fields?.['Applied for Location'];
  const locationOptions = locationField?.type === 'select' ? optionsFor(locationField) : [];
  const mappedLocation = fields.find(field => field.purpose === 'application-location');
  // Expose role-approved choices for the selectable UI even while its submit key
  // is unknown. A local preference is never a guessed Darwinbox field mapping.
  const locationPreference = locationOptions.length ? {
    options: locationOptions, defaultValue: preferredLocation(locationOptions),
    mappedKey: mappedLocation?.key || null,
  } : undefined;
  const extensions = raw.attachment_fields?.resume_details?.fields?.resume?.validation?.valid_extentions;
  return { fields, supported: unsupported.length === 0, unsupported, locationPreference,
    resumeExtensions: Array.isArray(extensions) ? extensions.filter(extension => ['pdf', 'doc', 'docx'].includes(extension)) : ['pdf', 'doc', 'docx'],
    maxResumeBytes: MAX_RESUME_BYTES };
}

export function createCareersService({ call = darwinbox, env = process.env, now = Date.now } = {}) {
  let listCache;
  const detailCache = new Map();
  async function jobs({ fresh = false } = {}) {
    if (!fresh && listCache?.expires > now()) return listCache.data;
    const result = await call('list');
    if (Number(result.status) !== 1 || !Array.isArray(result.data)) throw new CareersError(502, 'Open roles could not be loaded. Please try again later.');
    const data = result.data.filter(isPublic).map(publicJob).filter(job => validJobId(job.id));
    listCache = { data, expires: now() + 60000 };
    return data;
  }
  async function detail(id, { fresh = false } = {}) {
    if (!validJobId(id)) throw new CareersError(404, 'This role is no longer available.');
    const listed = (await jobs({ fresh })).find(job => job.id === id);
    if (!listed) throw new CareersError(404, 'This role is no longer available.');
    if (!fresh && detailCache.get(id)?.expires > now()) return detailCache.get(id).data;
    const result = await call('detail', { job_id: id });
    if (Number(result.status) !== 1 || !result.data || !isPublic(result.data)) throw new CareersError(404, 'This role is no longer available.');
    const raw = result.data;
    const application = applicationSchema(raw, env);
    const data = { ...listed, description: descriptionHtml(raw.job_decription || raw.job_description), experienceUnit: text(raw.unit_experience),
      application: { ...application, externalUrl: hostedApplicationUrl(listed) } };
    detailCache.set(id, { data, expires: now() + 60000 });
    if (detailCache.size > 100) detailCache.delete(detailCache.keys().next().value);
    return data;
  }
  async function submit(body) {
    const job = await detail(body?.jobId, { fresh: true });
    if (!job.application.supported) throw new CareersError(409, 'Please apply through the linked Cars24 application page for this role.');
    const fields = validateApplication(body, job.application);
    // Never retry a write: Darwinbox can create a candidate even when it reports field errors.
    let result;
    try { result = await call('submit', { job_id: job.id, source: 1, sub_source: '', applicant_fields: fields }); }
    catch { return { outcome: 'unknown', message: 'We could not confirm the result. Your application may have reached Cars24. Please check your email or contact your recruiter before applying again.' }; }
    if (Number(result.success?.status) === 1) {
      const hasErrors = result.errors && (typeof result.errors !== 'object' || Object.keys(result.errors).length > 0);
      return { outcome: hasErrors ? 'created_with_errors' : 'submitted', reference: text(result.success.candidate_id),
        message: hasErrors ? 'Your application was received, but some details need review. Please contact your recruiter before applying again.' : 'Your application has been received. Thank you for your interest in Cars24.' };
    }
    if (Number(result.status) === 0) return { outcome: 'rejected', message: 'The recruitment service could not accept this application. Please review your details or use the Cars24 application page.' };
    return { outcome: 'unknown', message: 'We could not confirm the result. Please check your email or contact your recruiter before applying again.' };
  }
  return { jobs, detail, submit };
}

export function validateApplication(body, schema) {
  if (body?.consent !== true) throw new CareersError(400, 'Please acknowledge the applicant privacy notice.');
  if (!body.fields || typeof body.fields !== 'object' || Array.isArray(body.fields)) throw new CareersError(400, 'Please complete the application form.');
  const fields = {};
  for (const field of schema.fields) {
    if (field.key === 'resume') continue;
    // Apply defaults only for an omitted mapped field. An explicit choice or
    // explicit clearing remains the applicant's choice and is validated below.
    const value = Object.hasOwn(body.fields, field.key) ? body.fields[field.key] : field.defaultValue;
    if (value != null && typeof value !== 'string') throw new CareersError(400, `Please check ${field.label}.`);
    let cleaned = text(value);
    if (!cleaned) { if (field.required) throw new CareersError(400, `${field.label} is required.`); continue; }
    if (cleaned.length > 2000 || /[\u0000-\u0008]/.test(cleaned)) throw new CareersError(400, `Please check ${field.label}.`);
    if (field.type === 'select' && !field.options.some(option => option.value === cleaned)) throw new CareersError(400, `Choose a valid ${field.label}.`);
    if (field.key === 'email_id' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) throw new CareersError(400, 'Enter a valid email address.');
    if (field.key === 'phone' && !/^[0-9 ()+\-]{6,25}$/.test(cleaned)) throw new CareersError(400, 'Enter a valid phone number.');
    if (field.type === 'date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned) || Number.isNaN(Date.parse(cleaned)) || new Date(cleaned).toISOString().slice(0,10) !== cleaned) throw new CareersError(400, `Please check ${field.label}.`);
      cleaned = cleaned.split('-').reverse().join('-');
    }
    fields[field.key] = cleaned;
  }
  const resume = body.resume;
  if (!resume || typeof resume.name !== 'string' || typeof resume.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(resume.base64) || resume.base64.length > Math.ceil(MAX_RESUME_BYTES / 3) * 4) throw new CareersError(400, 'Attach a resume of up to 2 MB.');
  const filename = resume.name.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9_. -]/g, '_').slice(-120);
  const extension = filename.split('.').pop().toLowerCase();
  const bytes = Buffer.from(resume.base64, 'base64');
  const magic = extension === 'pdf' ? bytes.subarray(0,5).toString() === '%PDF-' : extension === 'docx' ? bytes.subarray(0,4).equals(Buffer.from([0x50,0x4b,3,4])) : extension === 'doc' && bytes.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]));
  if (!schema.resumeExtensions.includes(extension) || !magic || !bytes.length || bytes.length > MAX_RESUME_BYTES || bytes.toString('base64') !== resume.base64) throw new CareersError(400, 'Attach a valid PDF, DOC or DOCX resume of up to 2 MB.');
  fields.resume = Buffer.from(zipSync({ [filename]: new Uint8Array(bytes) })).toString('base64');
  return fields;
}

export const careers = createCareersService();
