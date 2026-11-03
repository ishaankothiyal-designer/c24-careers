# Role detail UI/UX audit

This records the original cleanup audit. A later location-selector follow-up changes current form availability; see [location implementation and validation](darwinbox-location-requirement.md#selectable-location-ui-and-gurgaon-default).

Scope: the shared careers role detail experience, live Darwinbox data, illustrative previews, application fields, responsive layout, and sticky-form behavior. The existing landing-page typefaces, violet, stepped buttons, labels, and divider system remain the design source.

## Findings and fixes

| Priority | Finding | Resolution |
| --- | --- | --- |
| P1 | Role metadata and explanatory copy competed with the form in the right column. | All role information now lives in the left grid. The right column contains the form, required consent, status feedback, and one application CTA. |
| P1 | Applying required an extra reveal action, and the submit label differed from the requested action. | Supported forms appear immediately; the submit action is “Apply for this role.” |
| P1 | A sticky form could hide its final controls on a short viewport. | Stickiness requires a two-column width of at least 900px and sufficient measured panel height for the entire form, toolbar clearance, and bottom space. ResizeObserver rechecks eligibility when the panel, toolbar, or form changes size. Short or narrow screens use normal document flow. |
| P2 | Country code and mobile number were separate visual fields. | A single outlined phone group has a country/dial-code selector and national-number input. Country names remain visible, keyboard-native selection is retained, and Darwinbox receives the original field names and option values. |
| P2 | Resume upload looked different from text fields. | Email, phone, text inputs, and upload share 52px height, borders, radii, type, and focus treatment. Selected filenames update visibly and truncate within the field; the native input remains labeled and keyboard operable. |
| P2 | Legacy preview details had a different structure. | Live openings and illustrative previews now use `roleDetailLayout`. Previews still cannot submit applications. |
| P2 | Animated pixels could reduce the readability of a focused application button. | Application actions keep the existing stepped shape and focus outline, but opt out of the decorative pixel animation. Other site buttons retain their existing behavior. |
| P2 | Narrow layouts needed an unambiguous reading/application order. | Below 900px, title, metadata, description, cities, and workplace details precede a distinct application section. No fixed or floating mobile application CTA covers content. An optional jump control focuses the first form input without changing the role route. |

## Verification evidence

- Production build succeeds; all 51 repository tests pass. `git diff --check` passes.
- Read-only API rendering checked for all seven current public roles: complete descriptions and city lists retained, with no role metadata or description in the right application column.
- Browser inspection of Key Accounts, Listing, Evaluation Engineer, Procurement, and an illustrative problem preview. These cover both supported inline forms, external application fallback, a single-city role, a 139-city role, semantic and Word-style description headings, and a long preview title.
- Responsive checks at 320, 375, 390, 414, 430, 768, 834, 1024, 1280, 1440, and 1728px: no horizontal overflow in the detail panel or application form.
- Measured two-column form heights of approximately 639–642px. At 1280 × 900, the scrolled sticky form starts at 112px below the panel's 89px toolbar, with the CTA bottom at approximately 751px. The full action remains reachable.
- Stickiness verified at 1440 × 1000, 1280 × 900, and 1024 × 1100. At 1024 × 600, it returns to static positioning. At 834px and below, the form follows the role content in normal document flow.
- All text/phone/upload controls measured at 52px height. Phone selection retained exact tenant option values; telephone input accepted familiar spaces. Tabbing from the number input reaches the resume control.
- A synthetic PDF fixture with a long filename was selected locally; its name updated and remained inside the upload field. No candidate data was used.
- Clicking Apply with missing required fields keeps the form enabled and focuses First name through native browser validation. No candidate was submitted.
- Accessible labels, native select behavior, required flags, telephone autocomplete, focus outline, consent labeling, and live status feedback were inspected. Existing automated tests cover validation, unsafe descriptions, unsupported schemas, duplicate requests, and uncertain submission outcomes.
- Muted role metadata and input hints have approximately 6.61:1 contrast on the white surface; consent copy approximately 16.73:1. Application actions no longer animate colored pixels under their labels.

## Phone-input references

- [GOV.UK Design System: phone numbers](https://design-system.service.gov.uk/patterns/phone-numbers/) recommends familiar input formats, telephone inputs, autofill, and clear international-number expectations. The requested selector/number combination adapts those principles to Darwinbox's two-field contract.
- [HTML Standard: form control infrastructure and autofill](https://html.spec.whatwg.org/dev/form-control-infrastructure.html) defines `tel-country-code` and `tel-national`. The control uses those purposes, `type="tel"`, and `inputmode="tel"`, without a country-specific mask or silent rewriting.

## Remaining limits

- Inline applications are available for the two roles whose required fields are mapped. Five current roles still require a confirmed submit key for Applied for Location and retain their role-specific Cars24 application URL.
- Country choices come from the existing application schema. This is not a worldwide country directory. UAE is the previously requested extra choice; tenant-side acceptance remains unverified.
- Live list/detail reads were verified. Candidate creation still needs a controlled recruitment submission; no production candidate was created during this audit.
- Browser verification used the Codex in-app browser with viewport overrides. Physical mobile devices, additional browser engines, and a full screen-reader conformance audit were not exercised.
- Work is local and has not been deployed.

## Review artifacts

- `output/review/role-cleanup-desktop.png`
- `output/review/role-cleanup-mobile-content.png`
- `output/review/role-cleanup-mobile-form.png`
- Representative role screenshots under `output/review/`.

Hallmark assessment: Philosophy 5, Hierarchy 5, Execution 4, Specificity 5, Restraint 5, Variety 4. Scoped visual and interaction findings above are resolved; integration and verification boundaries remain explicit.
