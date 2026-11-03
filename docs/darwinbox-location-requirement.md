# Applied for Location: submission requirement investigation

Checked on 2 November 2026 using read-only requests. No candidate was created and no request was sent to Submitjob.

## Result

The five-role restriction is triggered by a requirement reported by Darwinbox, not an unconditional rule that this app adds for all location fields. All five roles return `applicant_fields["Applied for Location"].required: true`. Key Accounts and Listing return `false` for that same field and already permit inline submission without it.

| Role | Job ID | Upstream required | Field type | Location option count |
| --- | --- | --- | --- | --- |
| Evaluation Engineer | a6a425523b4d48 | true | select | 141 |
| Key Accounts | a6a477f915ac86 | false | select | 10 |
| Retail Associate | a6a47c209bbcf9 | true | select | 13 |
| Procurement Associate | a6a4bc7c73c3f6 | true | select | 13 |
| Listing | a6a4cf2c585259 | false | select | 3 |
| Closure | a6a4d1873e3f74 | true | select | 2 |
| Procurement | a6ad6faa9243f8 | true | select | 1 |

Location option counts are workplace options, not unique city counts. No option ID is evidence of the location field's submission key.

The field is `is_custom: false` in all seven responses. Its metadata exposes a label, required flag, type, option IDs/labels, and dependency/validation settings, but no field key or backend name. The local confirmed field-map configuration contains no mapping.

## Evidence reviewed

1. Authenticated `JobsApiv3/joblist` and `JobsApiv3/Jobdetail`, using the existing server-only credentials. Only relevant public job/field metadata is recorded here.
2. The public official Cars24 BFF detail endpoint for Closure, [read-only job detail](https://api.cars24.com/gw/plt/bffsvc/api/jobs/a6a4d1873e3f74), independently returns `required: true` for Applied for Location and no backend field name.
3. The supplied `Submit_Job_API_Version_3.pdf`, in Downloads. Its mandatory-field table makes several fields conditional on job application form settings. It directs implementers to download system/custom backend field names from Profile View Settings. It also documents that candidate creation can coexist with field errors; a candidate ID alone does not establish a complete application.
4. [Official Darwinbox API reference](https://api-docs.darwinbox.com/), local project documentation, both downloaded copies of the contract (identical extracted text), and the public official Cars24 careers application code. None yielded a verified Applied for Location submission key.
5. The official Cars24 frontend submits a simplified contact/resume payload to its own BFF and does not visibly expose this field in the inspected form. This does not prove that direct Submitjob accepts its omission: the BFF may supply or transform values. Its implementation and a production submission outcome were not available for inspection.

## Implementation outcome

No backend requirement was weakened. The subsequent selectable-location UI below replaces the external-only presentation for the current five required-location roles. The server still accepts its previously supported contact-only payload for optional-location roles, with no invented location key. Removing the backend gate for the five required roles would disregard the current upstream schema without evidence of a supported submission contract.

Added regressions verify:

- Optional unmapped location leaves the inline form available, forwards only the existing contact/resume keys, and drops an unverified extra frontend location key.
- Submission fetches fresh job details and blocks before any upstream candidate write if location became required after the page loaded.
- A supplied verified mapping enables the inline flow, validates location as required, and sends the selected allowed label under that configured key.

Duplicate, retry, resume, publication, consent, and uncertain-outcome protections remain unchanged.

## What enables the five roles

Either of these is sufficient to resolve the current gate:

- Recruitment changes Applied for Location to optional in Darwinbox for those roles. The existing code already handles that schema without a new frontend field; detail caching lasts at most 60 seconds, and submission always rechecks fresh settings.
- Supply the verified system backend field name from the tenant's Profile View Settings export (or authoritative tenant-specific integration documentation), with its expected value format. Configure the existing `DARWINBOX_FIELD_MAP_JSON` mapping. The schema-driven inline form can then render and validate the location selector.

The second route adds a required location field for the relevant roles. Identical contact/resume-only fields across all seven roles require an upstream decision that location may be omitted. A controlled recruitment submission is still needed to verify tenant acceptance end to end; this investigation did not exercise candidate creation.


## Selectable location UI and Gurgaon default

Implemented after the follow-up request on 2 November 2026:

- Every current live role form displays **Application location**, using the exact structured options from that role's Applied for Location field. Cities are not inferred from description prose, and no new workplace option is inserted.
- A sole Gurgaon/Gurugram match is the initial selection. Five current roles have one valid Gurgaon option: Evaluation Engineer, Key Accounts, Listing, Closure, and Procurement. Retail Associate and Procurement Associate do not; their selector starts empty and requires a valid choice. Multiple Gurgaon workplaces would also require a choice rather than picking one arbitrarily.
- Location selection is in the form only. Job descriptions and advertised workplace facts are unchanged.
- The applicant can change the selection. Native option values preserve the tenant labels, including embedded carriage returns; HTML numeric references prevent browser attribute parsing from changing those bytes.
- With a verified mapping, required and optional location fields render as editable inputs. The server applies the allowed default only if the mapped field is omitted. An explicit alternate selection is validated and preserved. Explicit clearing of an optional field is not overwritten; required fields still reject an empty choice.
- Without a mapping, the selector is expressly a local UI preference, never a guessed Darwinbox key. Current location-bearing forms show an unavailable notice and a disabled Apply action. They retain access to the official Cars24 application page. This also disables the new location-bearing UI for Key Accounts and Listing: their earlier contact-only backend contract still works, but the new UI cannot promise to submit a location it cannot map. No location choice is silently discarded by an enabled form.
- None of the seven current roles has a verified location submission mapping in this environment. Thus the Gurgaon default can be displayed for five roles, but cannot currently be sent as a location field for any role. Activating these forms requires the confirmed system backend name, plus confirmation of the value format expected by the tenant.

Validation: production build and 60 tests passed. Tests cover exact allowed defaults, the Gurugram alias, unsupported and ambiguous choices, explicit alternate/empty values, HTML value preservation, and mapping-gated submission readiness. Browser checks at desktop and mobile widths confirmed editable choices, no horizontal overflow, persistence of a Delhi selection after resizing, and no Gurgaon preselection on Retail Associate. No production candidate was created.


## Contact-only form regression corrected

The first selector implementation inadvertently disabled Key Accounts and Listing in the UI even though their Applied for Location field is optional and the server still accepted contact/resume-only submissions. That regression is corrected: both forms have an enabled Apply action again. Until a verified location key is available, these two working forms omit the unmapped selector and explicitly say that location preference is not collected. This avoids silently dropping an applicant selection. A confirmed mapping automatically enables the editable location field and valid default for them.

The five roles whose upstream location field is required still show their approved selectable locations with submission disabled. No required-location gate is bypassed. This correction supersedes the earlier paragraph describing all seven location-bearing forms as disabled.

### Admin handoff

Preferred fix: ask the Cars24 Darwinbox ATS/recruitment or HRIS admin, or Darwinbox support, for the exact existing Applied for Location system field's Submit Job V3 backend name and whether its accepted select values are option labels or workplace IDs. The field reports `is_custom: false`; creating a new similarly named custom field is not a verified fix.

The supplied PDF describes exporting backend field names from Profile View Settings and gives a Dashboard → Settings → Employee → Profile View Setting path. This path is verified only as wording in the PDF; the current Cars24 tenant admin interface, menus, and permissions were not inspected. Use the existing-field export/download or ask support for it; do not create a new field merely to follow the example.

After receiving the confirmed mapping/value contract, configure `DARWINBOX_FIELD_MAP_JSON` on the existing app, verify the refreshed schemas and valid Gurgaon defaults/explicit alternatives, and coordinate an authorized controlled candidate submission to verify the complete payload and outcome. If the tenant requires workplace IDs instead of the contract's documented exact labels, adjust the mapper explicitly before testing.

Alternative: if location is not a business requirement, the admin can make Applied for Location optional on the application templates used by the five roles. Ask the admin/support to identify the relevant template setting; its live menu path is not verified. This enables contact/resume-only applications after schema refresh but does not itself allow us to send a location preference without a verified key.


## Direct inline architecture and public-flow investigation

The confirmed target is our form → our `/api/applications` backend → Darwinbox Submit Job V3. Applicants do not leave our page. The latest role UI removes both the external application CTA and the “Prefer the Cars24 application page?” link. Existing external URLs remain as source metadata; they are not an applicant workflow. No browser automation, old-form embedding, proxy submission, or new applicant-data store was implemented.

Additional read-only inspection found no verified API mapping:

- The existing official Cars24 public JavaScript posts simplified form data to its BFF. The browser does not show that BFF's internal Darwinbox payload. Its frontend control names cannot establish Submit Job V3 keys.
- The public Darwinbox root is a login page; it exposed no careers field mapping. A focused public careers-page visit returned only a small branding/metadata document, with no form controls, scripts, or application schema. No authenticated admin interface was entered and no access controls were bypassed.
- Jobdetail provides workplace option IDs and labels but no corresponding field key. The supplied contract's sample contains other location-related attributes; none proves that it is the key for Applied for Location. No guessed key was tried with a write.

We own all integration code and can complete it without changing the tenant requirement once the missing contract information is supplied. An existing integration owner, an authorized person with the field-name export, or Darwinbox support can provide the existing system field's Submit Job V3 key and accepted select-value format. An admin settings change is not necessary for that preferred path. Making the field optional is a business-policy alternative, and still would not make an unknown location key sendable.

Key Accounts and Listing are restored to enabled inline contact/resume-only submission; the uncollectable optional location selector is omitted with an explanatory notice. Required-location forms keep their editable role-approved selector but cannot submit until mapped. There is no external application handoff for them. The missing API contract remains the precise blocker; successful location-bearing candidate creation has not been demonstrated.
