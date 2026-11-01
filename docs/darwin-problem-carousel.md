# Darwin problem carousel

The homepage “What would you build?” carousel will be populated from Darwin role data. This is the intended production behavior, recorded on 30 October 2026.

- Each card represents a Darwin job role and retains its stable role ID.
- Form a concise problem highlight from the role data read from Darwin. The highlight is the card headline, rather than the job title alone.
- Use Darwin itself as the source for the problem statement and supporting role data. Do not invent responsibilities, outcomes, requirements, locations or team details to fill missing fields.
- Clicking a card opens the corresponding job role detail. Use the actual Darwin role destination or the application's agreed detail route, keyed by the role ID. The final card interaction is navigation rather than an inline disclosure.
- Preserve the frozen card design, horizontal scrolling, chevrons, responsive layout and keyboard access. Filters must use the agreed Darwin field mapping and reset the carousel to its beginning.
- Keep external application links and attribution URLs intact.

The current six briefs are explicitly illustrative. They now link to internal `/careers/roles/preview-problem-*/` detail overlays (desktop side panel; tablet/mobile popover). Ownership, example outcomes and collaborators appear on those detail pages. The `/careers/` listing also links to internal preview shells. Applications remain unavailable for previews. They must not be presented as live Darwin records or assigned fabricated role URLs.

Before implementing the connection, obtain the endpoint/access method, a representative response, the field mapping for the problem statement and supporting data, and the canonical job detail URL or route. No Darwin endpoint, credentials or field names have been supplied in this repository. The local preview route pattern is `/careers/roles/:slug/`; preview slugs are design references, never Darwin role IDs. Confirm the live ID mapping before API integration. Plan loading, empty and error states when the data connection is introduced.
