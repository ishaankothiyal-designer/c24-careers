import { careers } from '../../server/careers.js';
import { failure, json, method } from '../../server/http.js';

export default async function handler(req, res) {
  if (!method(req, res, 'GET')) return;
  const id = req.query?.id || new URL(req.url, 'http://localhost').pathname.split('/').filter(Boolean).pop();
  try { json(res, 200, { job: await careers.detail(id) }); }
  catch (error) { failure(res, error); }
}
