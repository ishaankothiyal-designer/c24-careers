# Subtle ambition-sticker motion · 15 November 2026

The latest user request adds restrained arrival and hover response to the five ambition stickers. This locally supersedes the earlier entirely static presentation, while retaining still illustration assets and no looping animation or pause CTA.

The existing persistent revealed flag drives a one-time card scale from0.985 to1 over420ms. On a fine hover-capable pointer, the card scales to1.008 and lifts2px; its illustration tilts by2degrees in alternating directions, scales to1.025 and lifts1px over320ms. Motion uses individual transform properties so the existing transform:none rule and legacy art renderer do not compete. Text remains visible throughout; no new focus targets, interactive semantics, observers, timers or runtime dependencies are added.

All enhancements are inside prefers-reduced-motion:no-preference. Coarse touch receives arrival only; reduced motion retains still cards and artwork. The scroller gains8px/10px of vertical paint room, with matching negative block margins retaining the existing net section footprint. Card dimensions, padding, copy hierarchy, green shield shadow and manual navigation are preserved.

Independent visual, brief and copy/accessibility reviews accompany this record. The rendered pass checks entry, hover reversal, carousel edge/shadow clearance, horizontal navigation, phone layout and reduced motion. Evidence is retained locally in output; this is browser-emulation QA, not physical-device certification.

Build passed;185 tests passed; git diff --check passed. The user subsequently authorized publishing these changes with the other pending reviewed updates; see accumulated-production-release.md and the final production evidence.
