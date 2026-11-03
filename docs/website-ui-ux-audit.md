# Careers website UI/UX and functional audit

Completed 2 November 2026 in `Careers Page V3 `. This audit covers the available website and applicant journey, not production candidate creation. Changes are local; the existing Vercel project and stable production domain have not been deployed or replaced.

## Outcome

Every active role card is now a native whole-card link. The homepage carousel and careers listing use the same `liveJobCard` renderer and card styles, with one focusable link per card and no nested controls. Title, metadata, blank card area, and the visible View role cue all belong to the same destination. The carousel keeps its horizontal track/next-card preview; the listing keeps responsive grid tracks. Those layout differences do not duplicate the card implementation.

All seven live cards were opened in the browser and matched their exact role title and job-ID URL. Key Accounts and Listing retain enabled inline contact/resume forms. The other five remain truthfully unavailable for submission until engineering supplies the verified Darwinbox location field contract. No application redirect, browser automation submission, guessed field mapping, or new applicant-data store was introduced.

## Findings and fixes

| Priority | Finding | Fix and evidence |
| --- | --- | --- |
| P1 | Only the small View role link was interactive; the role-card body was not. | The entire shared card is one `<a href>`. The CTA is a visual span inside it, not a second interactive element. Browser title/body/metadata/CTA activation and keyboard Enter opened matching role details. |
| P2 | Keyboard focus was limited to the small CTA rather than identifying the selected card. | A 3px inset violet outline covers the entire card without clipping at carousel boundaries. Cards have one native focus stop; they need no custom key handler or button role. |
| P2 | Filtered cards need a reliable hidden-state override alongside the shared flex card styles. | An explicit hidden-card rule keeps filtered links out of both layout and keyboard interaction. Browser Retail filtering showed only the two matching roles; a combined query showed only Key Accounts. |
| P2 | Clear filters disappeared when the result set was empty. | It remains available whenever filters are active, alongside the existing empty-state reset. Clearing an unmatched search restored all seven cards and focused search. |
| P2 | Feed failures could leave stale controls visible and expose technical network/JSON errors. | Errors hide results and filter/carousel controls, retain a retry action, and use visitor-facing messages. Retry restores filters and can produce a truthful no-openings state. Abort behavior is preserved. |
| P2 | Loading, unavailable, and missing-role content did not receive the loaded detail layout's inset. | Recovery surfaces now share the detail inset. A real unlisted job-ID read showed Role unavailable, retry, and internal all-roles recovery. The missing local role route also fits its panel. |
| P2 | Builder drawer next-story interception swallowed modified clicks. | Modified/middle/targeted links retain native browser behavior. Ordinary next-story navigation and focus restoration remain intact; regression tests cover modifiers. |
| P2 | Footer legal targets were about 15px high on a 900px tablet viewport. | Both links now have 44px minimum height at every width and a visible lime focus outline. At 900 × 400, the footer remains 500px tall, with no title/legal overlap or page overflow. URLs and copy are unchanged. |
| P2 | White small text on the orange pixel badge had about 4.07:1 contrast. | A named token slightly darkens the existing orange, preserving the shape and role of the badge. Browser-computed contrast is now about 4.88:1. This also improves the same badge elsewhere in the site. |

## Surface inventory

| Surface | Route/section | Coverage |
| --- | --- | --- |
| Homepage | `/` | Hero links, ambition, builder carousel, live role carousel, support carousel, letter, hiring, expectations, FAQ, closing CTA, footer and internal anchor targets. |
| Live role cards | Homepage `#problems` | All seven API jobs; department filtering; whole-card/CTA activation; carousel Home/End controls and boundaries. |
| Careers listing | `/careers/` | Same seven shared cards; department, text, and location filtering; URL query initialization; combined filters; clear/reset; empty/loading/error/retry states. |
| Live role detail | `/careers/roles/:id/` | All seven roles, exact title/ID mapping, form readiness, close/Escape/Back/Forward, source focus restoration, and query/filter preservation. |
| Builder stories | `/builders/:slug/` | All 14 stored stories at mobile and desktop widths; homepage keyboard activation, drawer close/focus restoration, next-story behavior and modified-click handling. |
| Illustrative role previews | `/careers/roles/preview-…/` | All 10 routes at mobile and desktop widths; explicit preview status and no application form. These are not advertised as live roles. |
| Recovery | Unknown preview slug and unlisted API-shaped role ID | Recovery heading/inset, retry, and return to listing. |
| Legacy source | `career-08-roles.html` | Inactive reference fragment; absent from both `sections.json` and active fragment imports. Its illustrative cards do not appear in the shipped app. It was not reactivated or presented as another live role surface. |

Footer aliases such as `#builders` and `#how-we-work` still resolve to existing homepage elements. They were checked rather than replaced. Hidden/inert source footer panels remain outside keyboard interaction. External legal/privacy URLs and source metadata are preserved.

## Functional and responsive evidence

- Homepage and listing checked at **320, 375, 390, 414, 430, 768, 834, 1024, 1280, 1440, and 1728px**. No page-level horizontal overflow; listing cards had no internal horizontal overflow. Listing tracks reflow from one to four columns across that range.
- The narrowest homepage role cards were also checked for vertical and horizontal content overflow: neither occurred. Whole-card targets remain substantially larger than 44px; listing cards have a 336px minimum height.
- All **14 builder stories** checked at **320 and 1440px**: 28 drawer checks, no horizontal overflow.
- All **10 illustrative role previews** checked at **320 and 1440px**: 20 panel checks, no overflow and no applicant form.
- All **7 live details** opened from their listing cards and matched the expected title and URL. Each was also checked at **320 × 812** and **1024 × 600**, with no panel overflow. All seven forms use normal flow on the short viewport; tall forms are not trapped in sticky positioning or a nested scroll region.
- A filtered Key Accounts card opened with Enter. An empty application attempt focused First name. A deliberately malformed email focused Email address; missing resume/other required fields ensured no candidate write could occur. No application entered a pending/submitted state.
- Escape restored the originating role-card focus and the listing's query/department state. A location-filtered result retained its location query after Back. Browser Forward reopened the same role. Homepage department selection also remained associated with its underlying carousel while the role was open.
- Search with zero matches hid every card, showed the empty illustration and both reset paths, then restored seven results. Department and location result sets retained their proper job IDs.
- Homepage hero navigation resolved to `#problems`. Role/support carousel Home/End behavior and disabled boundary controls were exercised. A builder opened from its homepage control with Enter and returned focus on close.
- FAQ interaction kept one answer open and hid/inerted the previous answer. All inspected internal homepage hash targets existed.
- HEAD checks returned HTTP 200 for Terms and Conditions, Privacy Policy, and the applicant privacy PDF.
- No runtime errors/warnings were observed at the inspected browser log check. The known lazy Three.js build chunk-size warning remains.

## Automated validation

`npm run build`: passed. `npm test`: **67 tests passed**. `git diff --check`: passed.

Added coverage checks the single native role-card link, absence of nested interactions, escaped upstream text, identical card content across both active surfaces, native modifier/middle-click behavior, friendly fetch/JSON failures, abort preservation, loading/error/retry/empty transitions, and no-match filter recovery. Existing tests continue to cover route generation, live-data privacy, description sanitization, resume validation, duplicate/uncertain submission outcomes, application readiness, builder stories, loading/performance safeguards, and compatibility packaging.

No package or UI library was added. No file outside this project was modified for implementation.

## Remaining boundaries

1. Engineering still needs to supply the verified **Applied for Location** Submit Job V3 backend field name and accepted option-value format. Five live roles declare it required upstream. Their unavailable state remains; a Gurgaon default does not resolve an unknown field key. See [location contract investigation](darwinbox-location-requirement.md#direct-inline-architecture-and-public-flow-investigation).
2. Key Accounts and Listing are enabled for contact/resume-only submission because their upstream location field is optional. Their unmapped optional location preference is omitted with an explicit notice. No selection is silently discarded.
3. No production candidate was submitted. Successful tenant-side candidate creation, including previously documented country/source acceptance concerns, still needs an authorized controlled integration test.
4. Browser validation used the Codex in-app browser with viewport overrides. Physical touch hardware, Safari/Firefox, and a full screen-reader/WCAG conformance audit were not exercised. Error/loading/no-openings feed faults were tested with the real initialization module and controlled test doubles, rather than interrupting the live tenant.
5. The live API returned seven public openings during this audit; availability and required schemas can change. Listings derive from the API, and submission rechecks fresh role requirements.

## Review artifacts and local commands

Screenshots and measured JSON evidence are under `output/review/site-audit/`:

- `whole-card-focus-desktop.png`, `roles-mobile.png`
- `home-role-cards.png`, `home-role-cards-mobile.png`
- `empty-results.png`, `role-unavailable.png`, `footer-short-viewport.png`
- `listing-viewports.json`, `home-viewports.json`, `builder-viewports.json`, `preview-viewports.json`, `role-viewports.json`, `live-role-journeys.json`

Use the existing checkout. Install with `npm ci` if needed; run `npm run dev` and review `http://localhost:5173/` or `/careers/`. Production build is `npm run build`; Vercel output remains `dist/client`. Nothing was published during this audit.

Hallmark assessment: Philosophy 5, Hierarchy 5, Execution 4, Specificity 5, Restraint 5, Variety 4. The existing design language is retained, with scoped navigation, recovery, focus, target-size, and contrast fixes.
