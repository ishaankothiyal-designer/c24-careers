# Compact card balance and sharp corners · 15 November 2026

This local pass supersedes earlier fixed 520px ambition-card measurements and reserved principle title rows. It also supersedes the earlier fully-contained C24 glyph recommendation: oversized decorative clipping is explicitly approved by the user.

## Implementation

- Consolidated component spacing in `src/styles/preproduction-polish.css`. Ambition cards use intrinsic content height and vertically centered groups rather than fixed height and spacer rows. Shared art slots and equal regular-card outer insets preserve the caption → illustration → headline → body hierarchy. The shield reserves space for its pointed decorative foot and uses a narrower phone text measure.
- Principle cards use sharp corners, centered illustration/tape title/body, consistent 20px insets and 12px content gaps. Retained neutral surfaces, unchanged illustrations/copy, and the desktop/tablet/phone 4/2/1 grid.
- Normalized the four principle SVG root viewBoxes so painted artwork occupies the shared illustration slot consistently. Illustration paths and groups are unchanged.
- Restored intentionally oversized, slightly cropped C24 footer glyphs inside their own cells. Retained the geometry-driven endpoint correction, which prevents unfinished footer translation from leaving a blank band at the document end.

## Verification

Independent visual, UX-copy and brief-compliance reviewers checked this pass. The visual evidence includes a 20-case viewport matrix from 320px to 1728px, breakpoint neighbors, and 844×390 landscape. No document-width overflow was observed. Phone shield copy was checked against the actual silhouette, not only its rectangular DOM box. The final 320px shield reserves 80px below its text group, keeping the last line visibly clear of the taper.

Local screenshots and metrics are in `output/compact-balance-uat/`; the visual reviewer report records final measurements. The earlier full route/dialog acceptance scope is recorded in `final-deep-visual.md`; this pass is a targeted layout recheck. Browser emulation does not establish physical-device performance.

`npm run build`: passed. The existing lazy Three.js chunk warning remains.

`npm test`: 180 passed, zero failed or skipped. `git diff --check`: passed.

These changes remain local; this pass does not publish a production release.
