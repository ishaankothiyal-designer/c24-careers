import { careers } from '../server/careers.js';
import { CareersError } from '../server/darwinbox.js';
import { failure, json, method, once, readBody, sameOrigin, throttle } from '../server/http.js';

export default async function handler(req, res) {
  if (!method(req, res, 'POST')) return;
  try {
    sameOrigin(req);
    throttle(req);
    const body = await readBody(req);
    if (body?.website) throw new CareersError(400, 'Unable to process this application.');
    const result = await once(body, () => careers.submit(body));
    json(res, result.outcome === 'unknown' ? 202 : result.outcome === 'rejected' ? 422 : 200, result);
  } catch (error) { failure(res, error); }
}
