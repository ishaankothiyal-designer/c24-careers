import { careers } from '../server/careers.js';
import { failure, json, method } from '../server/http.js';

export default async function handler(req, res) {
  if (!method(req, res, 'GET')) return;
  try { json(res, 200, { jobs: await careers.jobs() }, 'public, s-maxage=60, stale-while-revalidate=120'); }
  catch (error) { failure(res, error); }
}
