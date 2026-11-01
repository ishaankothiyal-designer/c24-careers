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

Node 22 is explicit in `package.json`. The sanitizer stays on its patched 2.18.1 release, with its HTML parser pinned to the CommonJS-compatible 10.0.0 export because Vercel's function loader rejects the parser's newer ESM-only release when required by the sanitizer. A subprocess test disables `require(ESM)` to reproduce this runtime constraint. Recheck the override when upgrading either package or Vercel's loader.

## Role detail experience

Role links retain their shareable `/careers/roles/:id/` URLs and open the editorial detail panel over the careers listing, including on direct visits. The detail view reads the live API rather than preview data, retains the complete sanitized description, and displays employment, experience, department, country, job reference, all cities, and expandable workplace details. Word-style description headings are normalized for reading without rewriting the published copy.

Current live roles display the application fields and role-specific location selector directly in the right column, with “Apply for this role” as its single submit action. Role metadata and all published content sit in the left column. On mobile, the columns stack and a jump control takes visitors to the form. On two-column screens, the application sticks below the toolbar only if its measured height fits the panel; short viewports and all stacked layouts use normal flow. Country code and mobile number share one phone control while retaining their separate Darwinbox field keys and exact option values. The resume upload uses the same field dimensions, border, and focus treatment as the other inputs. Live roles and illustrative previews use the same `roleDetailLayout` shell; previews remain unable to accept applications. A location-bearing application remains visibly unavailable for submission until its location field has a verified backend mapping; no external application handoff is offered. The prior contact-only server contract is unchanged. The confirmed destination is Darwinbox only; no separate candidate base is involved.

## Application field mapping and fallback

System field names follow the supplied Submit Job API Version 3 PDF. The job-detail API returns display labels, types, required flags, and options, but does not return every submission field key. Required fields with unknown keys, unsupported types, or dependencies prevent an inline candidate write. Current role forms can display the known fields and approved location choices, with submission disabled and an availability notice until a verified mapping exists. Optional fields outside the essential contact/resume set are omitted to minimize personal data collection.

On 1 November 2026, the live feed contained seven public roles. Key Accounts and Listing had fully mapped required fields. The other five required “Applied for Location,” whose submit key was not documented. Counts and schemas are fetched dynamically, not hardcoded. A 2 November read-only recheck confirmed that these required flags come from Darwinbox itself. The requested removal of the fallback cannot be implemented by treating the field as optional while that upstream requirement remains in place and its key is unknown. See [location requirement investigation](darwinbox-location-requirement.md) for the evidence and supported resolution paths.

If a confirmed Profile View Settings export becomes available, set `DARWINBOX_FIELD_MAP_JSON` to an object mapping display labels to verified backend keys. Do not infer a key from the label. Example structure: `{"Display label":"verified_backend_key"}`. Complex dependent or array fields remain unavailable for inline submission until supported; applicants are not redirected externally.

The role-specific external URL follows the link builder observed in the official `careers.cars24.com` application on 1 November 2026. It includes the actual job ID and preserves that site's title slug route. Dropdown submissions use exact option labels, as the supplied PDF specifies. The requested UAE (+971) phone choice uses the tenant-provided +971 label when present, otherwise `+971 United Arab Emirates`. As of 1 November 2026, the tenant lists only India, Australia, and Other; acceptance of the added UAE label is unverified and must be included in the controlled recruitment submission. Local validation permits the UAE choice, but this is not evidence of tenant-side acceptance.

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

## Phone input design references

Reviewed on 1 November 2026:

- [GOV.UK phone numbers pattern](https://design-system.service.gov.uk/patterns/phone-numbers/): allow familiar spacing, brackets, and hyphens; use telephone inputs and autofill; make international entry expectations clear. We adapt this guidance to the requested combined country-selector/number control, since Darwinbox requires separate values.
- [HTML autofill standard](https://html.spec.whatwg.org/dev/form-control-infrastructure.html#autofill): use `tel-country-code` and `tel-national` for the two parts. The selector shows country names and explicit dial codes, and uses the API's exact values. The number uses `type="tel"` and `inputmode="tel"`; it is not masked or reformatted. Choices remain those available in the existing application schema, including the previously requested UAE choice whose tenant-side acceptance remains unverified.


The requested Gurgaon default is now implemented in the editable Application location selector, using only a unique valid Gurgaon/Gurugram workplace option from the selected role. Two current roles offer no Gurgaon option and start without a selection. Required-location roles remain disabled for submission until that field has a verified mapping. Key Accounts and Listing retain their enabled contact/resume-only forms; their unmapped optional location selector is omitted with an explicit notice rather than silently discarding a choice. See [the selectable location implementation and current eligibility](darwinbox-location-requirement.md#selectable-location-ui-and-gurgaon-default). No job description or workplace fact is changed by the preference.


Current architecture is entirely inline: our form posts to `/api/applications`, which calls Darwinbox Submit Job V3 server-side. Application-page handoffs have been removed from the role UI. Key Accounts and Listing retain their enabled contact/resume-only forms. Required-location forms display their valid choices but remain blocked until the API key/value mapping is verified; they do not redirect applicants. Existing hosted application URLs are preserved as source metadata only. See the [direct integration investigation](darwinbox-location-requirement.md#direct-inline-architecture-and-public-flow-investigation) for the exact evidence boundary and admin/support handoff.
