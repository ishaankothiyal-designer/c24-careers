# Darwinbox careers integration

## Runtime and routes

The existing Vercel project serves the Vite app from `dist/client` and the Node functions in `api/`. The production domain remains `https://c24-careers-chi.vercel.app`; production tracks `main`.

| Route | Behavior |
| --- | --- |
| `GET /api/jobs` | Calls `JobsApiv3/joblist`, returns only public, open roles and an allowlist of public fields. |
| `GET /api/jobs/:id` | Confirms the ID is publicly listed, calls `JobsApiv3/Jobdetail`, sanitizes its HTML, and returns application requirements. |
| `POST /api/applications` | Rechecks publication, validates required fields and resume, zips the resume, and calls `JobsApiv3/submitjob` once. |

The homepage carousel and careers listing load the same live feed. Department, city, and text filters derive from the live records. Role dialogs use actual Darwinbox job IDs; legacy `preview-*` URLs remain explicitly illustrative and never accept applications.

## Secrets and local development

Copy `.env.example` to `.env.local` and supply the five credentials there. All `DARWINBOX_*` values are server-only. `.env.local` is ignored by Git. Never add a `VITE_` prefix to credentials.

The existing Vercel project's Preview and Production environments require:

- `DARWINBOX_USERNAME`
- `DARWINBOX_PASSWORD`
- `DARWINBOX_JOBLIST_KEY`
- `DARWINBOX_JOBDETAIL_KEY`
- `DARWINBOX_SUBMITJOB_KEY`

Use `npm ci` and `npm run dev`. Vite's development middleware serves the same API handlers locally. A static `npm run preview` server does not run the Vercel functions; use development mode or a Vercel preview for end-to-end review. If a managed local certificate authority is required, use Node's `NODE_USE_SYSTEM_CA=1`; TLS verification remains enabled.

Build with `npm run build` and test with `npm test`. Do not run the GitHub Pages postprocessor. The existing Sites worker is compatibility packaging and does not implement the Darwinbox routes.

## Application field mapping and fallback

System field names follow the supplied Submit Job API Version 3 PDF. The job-detail API returns display labels, types, required flags, and options, but does not return every submission field key. Required fields with unknown keys, unsupported types, or dependencies make the inline form unavailable for that role. The visitor continues to the corresponding existing Cars24 application page instead. Optional fields outside the essential contact/resume set are omitted to minimize personal data collection.

On 1 November 2026, the live feed contained seven public roles. Key Accounts and Listing had fully mapped required fields. The other five required “Applied for Location,” whose submit key was not documented. The user authorized the existing application page as the fallback. Counts and schemas are fetched dynamically, not hardcoded.

If a confirmed Profile View Settings export becomes available, set `DARWINBOX_FIELD_MAP_JSON` to an object mapping display labels to verified backend keys. Do not infer a key from the label. Example structure: `{"Display label":"verified_backend_key"}`. Complex dependent or array fields continue to use the external form until supported.

The role-specific external URL follows the link builder observed in the official `careers.cars24.com` application on 1 November 2026. It includes the actual job ID and preserves that site's title slug route. Dropdown submissions use exact option labels, as the supplied PDF specifies.

## Submission behavior

- Source is `1` (Careers Page), with `sub_source` sent as an empty string. The PDF marks `sub_source` mandatory while describing it as relevant to source `3`; tenant acceptance of the empty value remains unverified.
- The user-supplied lowercase `submitjob` route is used. Its acceptance and the full candidate-creation flow have not been exercised against production.
- A resume is limited to 2 MiB before encoding. Only tenant-allowed PDF, DOC, and DOCX extensions with matching file signatures are accepted. The server creates the ZIP and Base64-encodes it.
- The browser requires acknowledgement of the official Cars24 applicant privacy notice. Applicant data and resumes are never written to browser storage or application logs.
- HTTP success alone is insufficient. Candidate creation with field errors is reported as received but needing review; a timeout or unknown response is reported as unconfirmed. Neither is automatically resubmitted.
- Browser session storage retains only the per-role outcome/reference, including a pending state across reloads. A per-instance digest/replay cache and IP throttle provide additional protection, but are not durable across serverless instances and do not guarantee exactly-once delivery. No automatic retries are used for candidate writes.
- Writes require same-origin JSON requests and fresh public-job validation. Public responses omit hiring leads, screening teams, salary, and other unneeded internal fields.

## Verification boundary

Read-only list and detail calls have been checked against the real tenant. Unit tests cover authentication, privacy filtering, malicious HTML, required-field fallback, resume ZIP contents, invalid fields/files, closed roles, duplicate requests, partial creation, and uncertain write outcomes. No real candidate has been created during setup. A controlled candidate submission with the recruitment team is still needed to confirm tenant-side acceptance before claiming complete end-to-end verification.

References: the user-supplied Submit Job API Version 3 PDF, [official Darwinbox API reference](https://api-docs.darwinbox.com/), [existing Cars24 careers application](https://careers.cars24.com/), and [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).
