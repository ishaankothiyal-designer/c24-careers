const BASE = 'https://cars24.darwinbox.in/JobsApiv3/';
const endpoints = { list: ['joblist', 'DARWINBOX_JOBLIST_KEY'], detail: ['Jobdetail', 'DARWINBOX_JOBDETAIL_KEY'], submit: ['submitjob', 'DARWINBOX_SUBMITJOB_KEY'] };

export class CareersError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function darwinbox(action, payload = {}, { env = process.env, fetcher = fetch } = {}) {
  const [endpoint, key] = endpoints[action];
  if (![env.DARWINBOX_USERNAME, env.DARWINBOX_PASSWORD, env[key]].every(Boolean)) {
    throw new CareersError(503, 'Careers service is being configured. Please try again later.');
  }
  let response;
  try {
    response = await fetcher(BASE + endpoint, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${env.DARWINBOX_USERNAME}:${env.DARWINBOX_PASSWORD}`).toString('base64')}` },
      body: JSON.stringify({ ...payload, api_key: env[key] }),
    });
    if (!response.ok) throw new Error('Upstream failure');
    return await response.json();
  } catch {
    // Never log upstream bodies, credentials, resumes, or applicant data.
    throw new CareersError(502, 'The recruitment service is temporarily unavailable. Please try again later.');
  }
}
