# Preproduction role-card copy · 15 November 2026

## Brief and editorial treatment

The archived Friday 13 November feedback asks the page to sell the problem and ownership, while plainly labelling the actual role. Vikram’s direction is recorded in `docs/feedback-2026-11-13/README.md`, item 01, and `feedback.json`, item `01`: lead with the problem, what needs to change and why it matters. Hitesh’s prototype is an information-structure reference, not a source of advertised vacancies.

The card now has three distinct jobs: **problem headline → official Builder title → a short description of the work and its immediate purpose**. Location lists, employment type, experience ranges and repeated geography/department context should remain in the full details rather than interrupting that message. The renderer integration belongs to the coordinator; this copy pass owns the summary function, its tests and this provenance record.

## Sources checked

Read the actual seven public Darwinbox job descriptions through the existing local API on 15 November 2026:

- List: `http://127.0.0.1:5173/api/jobs`
- Detail: `http://127.0.0.1:5173/api/jobs/<id>`

The current Vite router exposes those paths. `/api/careers/jobs` is not the router’s live endpoint and returned the HTML app shell during this review. Only public role content was read; no applicant data or submissions were involved.

## Role summary provenance

| Published opening and ID | Responsibility evidence in the published description | New card summary |
| --- | --- | --- |
| Builder - Evaluation Engineer · `a6a425523b4d48` | Inspections at customer sites; detailed reports and recorded inspection findings. | Inspect cars at customer sites and document their condition, giving the team accurate findings to work from. |
| Builder - Key Accounts · `a6a477f915ac86` | Dealer/source onboarding, field visits, dealer relationships, car leads for procurement and lead closures. | Build dealer relationships in the field and turn partner leads into car-sourcing opportunities, helping grow the procurement network. |
| Builder - Retail Associate · `a6a47c209bbcf9` | Calling prospective customers, lead engagement, negotiation, regular customer follow-up and conversions. | Call prospective customers, follow up on leads and use negotiation to help turn interest into sales. |
| Builder - Procurement Associate · `a6a4bc7c73c3f6` | Encourage assigned dealers to participate in auctions and bid, retain them through continued transactions, grow dealer transactions. | Engage dealers in car auctions, encourage competitive bids and build repeat transactions to grow activity on the platform. |
| Builder - Listing · `a6a4cf2c585259` | Help sellers list vehicles; customer calls and questions; coordinate buyers, negotiations and closures. | Help sellers list their cars and coordinate buyer conversations, making it easier to move from an enquiry to a completed transaction. |
| Builder - Closure · `a6a4d1873e3f74` | Guide buyers through listed vehicles, answer questions, coordinate negotiations and close purchases. | Guide buyers through listed cars, answer questions and support negotiations so they can complete their purchase. |
| Builder - Procurement · `a6ad6faa9243f8` | Review inspection reports/media and service history, identify damage/record mismatches, flag risks and support procurement decisions. | Review inspection reports, photos, videos and service records to spot risks and inconsistencies before procurement decisions are made. |

The descriptions are concise editorial paraphrases of actual responsibilities. The final clause explains the immediate purpose supported by the source, not a guaranteed commercial result. They do not invent decision authority, numerical targets, a first-90-day plan or an employment promise. The seven summaries contain **100–134 characters and 16–21 words** each.

## Matching and fallback contract

`src/role-problems.js` now exports **`roleSummary(job)`**. It matches the complete official title, with case, whitespace and dash-format normalization. It does not infer responsibilities from department or a loose title prefix. This matters because Procurement Associate is classified under Sales but works with dealer auctions, whereas Procurement is a technical inspection/service-record review role. Key Accounts and Retail Associate also share Retail but have different work.

An unreviewed title returns the neutral next step: `Read the full role description to understand the responsibilities and requirements.` An old matching ID alone does not establish the scope of a newly changed title. Summary strings are plain text; the renderer should use its existing escaping helper.

## One source-grounded headline correction

The existing Procurement Associate headline inherited the Sales department fallback, `Help more people find their next car`, which obscured the dealer-auction problem. An exact official-title override now says **`Help dealers buy through our auctions`**. The coordinator approved this change after the published JD was reviewed. Other established `roleProblem(job)` headlines remain unchanged.

## Evaluation against Vikram’s direction

Accepted at the card-copy level. The problem headline states the challenge, the official role remains unmistakable, and the summary describes concrete work plus its purpose. Exact title matching avoids advertising unrelated department work. The design should keep the complete summary visible and use shared padding and a consistent CTA baseline; do not line-clamp away the purpose clause.

Role-level ownership boundaries, named collaborators, first-90-day outcomes and quantified impact still need explicit approved content if added later. This pass does not manufacture those missing fields from Hitesh’s concept prototype or from the company-level ambition.

## Validation and scope

`tests/role-summary.test.mjs` covers all seven current titles, compact copy without card facts/deadlines, distinct procurement responsibilities, distinct Retail roles, formatting normalization, unknown-title fallback and headline preservation/correction. The focused summary/card run passed **10 tests, 0 failed** before the coordinator’s renderer integration; the summary-only suite is the direct acceptance check for this change.

No renderer, application restrictions, API data, employment metadata, other headings or product flow were changed by this reviewer. Full facts and original job descriptions remain authoritative in role details. No deployment was performed by this reviewer.

## Programme highlight panel recheck

The coordinator’s support-popup update is accepted at source/copy level. All seven programmes now render their existing detail items inside a semantic list named `Programme highlights`. The list has a deliberate padded panel, shared gaps and aligned markers, so the former loose lines read as one grouped block. Direct module checks confirmed that every original detail item remains present; no new benefit entitlement, amount or eligibility claim was added.

The popup hero rule now uses `width:100%`, `height:auto`, `max-height:none` and `object-fit:contain`, preserving the complete image rather than cropping it. Text content, source fields, image alternative text and policy-availability notes remain unchanged. Final panel spacing and photo framing still require the visual reviewer’s viewport checks.
