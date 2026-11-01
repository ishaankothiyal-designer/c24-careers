import { createHash } from 'node:crypto';
import { CareersError } from './darwinbox.js';

export function json(res, status, body, cache = 'no-store') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}
export function failure(res, error) {
  json(res, error instanceof CareersError ? error.status : 500, { error: error instanceof CareersError ? error.message : 'Careers service is temporarily unavailable.' });
}
export function method(req, res, expected) {
  if (req.method === expected) return true;
  res.setHeader('Allow', expected);
  json(res, 405, { error: 'Method not allowed.' }); return false;
}
export async function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw new CareersError(415, 'Send the application as JSON.');
  const max = 3 * 1024 * 1024;
  if (Number(req.headers['content-length']) > max) throw new CareersError(413, 'The application is too large. Use a resume of up to 2 MB.');
  if (req.body != null) {
    const serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(serialized) > max) throw new CareersError(413, 'The application is too large.');
    try { return JSON.parse(serialized); } catch { throw new CareersError(400, 'Invalid application.'); }
  }
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new CareersError(413, 'The application is too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new CareersError(400, 'Invalid application.'); }
}
export function sameOrigin(req) {
  try {
    const origin = new URL(req.headers.origin);
    if (origin.host === req.headers.host && ['http:', 'https:'].includes(origin.protocol) && req.headers['sec-fetch-site'] !== 'cross-site') return;
  } catch { /* Missing/malformed origins are rejected on write routes. */ }
  throw new CareersError(403, 'Please apply from the Cars24 careers website.');
}

// Best-effort per-instance throttling and replay protection, plus browser-side
// pending/submitted persistence. These do not promise cross-instance exactly-once delivery.
const attempts = new Map(), requests = new Map();
export function throttle(req, now = Date.now()) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const key = createHash('sha256').update(ip).digest('hex');
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  if (attempts.size > 5000) throw new CareersError(429, 'Please try again later.');
  const current = attempts.get(key) || { count: 0, expires: now + 10 * 60000 };
  if (++current.count > 5) throw new CareersError(429, 'Too many attempts. Please wait ten minutes before trying again.');
  attempts.set(key, current);
}
export async function once(body, action, now = Date.now()) {
  if (!/^[a-f0-9-]{36}$/i.test(body?.requestId || '')) throw new CareersError(400, 'Reload the application form and try again.');
  for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
  const digest = createHash('sha256').update(JSON.stringify({ job: body.jobId, fields: body.fields, resume: body.resume, consent: body.consent })).digest('hex');
  const existing = requests.get(body.requestId);
  if (existing) {
    if (existing.digest !== digest) throw new CareersError(409, 'This application attempt has already been used.');
    return existing.result;
  }
  if (requests.size > 5000) throw new CareersError(429, 'Please try again later.');
  const result = action();
  requests.set(body.requestId, { digest, result, expires: now + 30 * 60000 });
  try { return await result; } catch (error) { requests.delete(body.requestId); throw error; }
}
