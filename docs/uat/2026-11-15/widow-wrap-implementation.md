# Section divider and text wrapping · 15 November 2026

This follow-up includes the requested 14.5px principle-card body typography from the preceding correction. The user subsequently authorized publishing these reviewed updates to main and the existing Vercel project on 15 November 2026. The release coordinator verifies the actual Production Branch before pushing and retains final production evidence locally in output/widow-release-production.md.

## Changes

Removed the stale `#ambition + section` border suppression. The working-principle section now uses the same full-width divider rule as the other sections. The ambition reel receives the shared layout-head-gap below its controls so the restored rule has breathing room.

Removed the builder heading’s narrow maximum measure so “Ideas can come from anywhere” can occupy the available desktop width. Headings balance naturally on smaller screens. Shared prose uses pretty wrapping; short card summaries and outcomes balance within their existing insets.

Applied narrowly scoped nonbreaking spaces to verified authored final phrases where wrapping alone left a one-word ending. The three sentence/phrase heading breaks remain, with short final phrases held together. Hyphen break opportunities remain available in compound terms. No global nowrap, text clipping, smaller font or reduced padding is used.

Manvi’s teaser now reads “Built HTMLHub so teammates can securely host and share AI-built HTML prototypes.” The landing teaser and matching story description agree. The Closure problem headline is “Help buyers complete a purchase”; its official role title and responsibility summary remain unchanged. Both edits were independently checked for meaning.

Short supplied job paragraphs receive a presentation class for balanced wrapping. A bounded final-phrase guard changes only an existing paragraph or leaf-bullet text-node whitespace gap to a nonbreaking space when the measured pair fits both the current paragraph and a 180px phone-safe cap; words, inline emphasis and source API data are preserved. Long supplied prose retains pretty wrapping. Application, role navigation and source URLs are unchanged.

The Future programme highlight was reordered to “A programme focused on opportunities for the next generation” after the original long final pair proved too wide at 320px. The redundant “together” was removed from Suraj’s outcome heading; its meaning remains reporting and reconciliation. No numerical claim or responsibility was added.

## Checks

Independent visual, UX-copy and brief reviews are recorded alongside this file. Actual line geometry and screenshots are retained locally in `output/widow-wrap-uat/`; widths include 320,375,390,414,834,1100 and1440. Preserve structured city names and short labels rather than changing factual data to force a particular rag.

`npm run build` passed. `npm test`:180 passed, zero failures. The Closure copy expectation was updated to the reviewed shorter headline. `git diff --check` passed. Final visual scope and any limitations are recorded in widow-wrap-visual.md.
