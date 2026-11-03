# Darwin problem carousel

The homepage “What would you build?” carousel will be populated from Darwin role data. This is the intended production behavior, recorded on 30 October 2026.

- Each card represents a Darwin job role and retains its stable role ID.
- Form a concise problem highlight from the role data read from Darwin. The highlight is the card headline, rather than the job title alone.
- Use Darwin itself as the source for the problem statement and supporting role data. Do not invent responsibilities, outcomes, requirements, locations or team details to fill missing fields.
- Clicking a card opens the corresponding job role detail. Use the actual Darwin role destination or the application's agreed detail route, keyed by the role ID. The final card interaction is navigation rather than an inline disclosure.
- Preserve the frozen card design, horizontal scrolling, chevrons, responsive layout and keyboard access. Filters must use the agreed Darwin field mapping and reset the carousel to its beginning.
- Keep external application links and attribution URLs intact.

The homepage carousel now loads public, open Darwinbox roles through `/api/jobs` and links to `/careers/roles/:job_id/`. Department filters derive from the live data and reset the carousel. The API does not provide a distinct problem-statement field, so cards use the actual job title and public metadata rather than inventing a problem highlight.

The six old briefs and four old role previews remain available at their legacy `preview-*` links for shared-link compatibility. They stay explicitly illustrative and cannot accept applications; they are not listed as live openings.

See [Darwinbox integration](darwinbox-integration.md) for field mapping, application fallback, source references, privacy filtering, local setup, and verification boundaries. The implementation includes loading, empty, no-match, error, and retry states.
