# Mobile-first production release · 15 November 2026

The user explicitly authorized all reviewed local updates to be merged to main and deployed to the existing Vercel project after a final mobile check.

## Included changes

- Shared swipeable role, builder and programme popup frame, including separate supported application forms and preserved shared-link/history behaviour.
- Source-grounded role summaries, inline builder continuation, uncropped programme photos and aligned highlights.
- Compact ambition cards with meaningful sticker illustrations and safe shaped interiors; centered square-corner white principle cards, tape headings and responsive 4/2/1 grid.
- Sticker-style letter cue, corrected spacing and fully completed footer reveal with the approved oversized C24 crop.

## Release checks

- Independent source/copy and brief/publication checks accepted; see mobile-release-copy.md and mobile-release-brief.md.
- Final mobile runtime evidence is recorded in mobile-release-final.md. Earlier full route/content coverage remains in final-deep-visual.md and the compact layout report.
- npm run build passed, emitting dist/client. The existing lazy Three.js chunk-size warning remains non-blocking.
- npm test passed:180 tests, zero failures or skipped tests. git diff --check passed.
- Private source archives, environment files, output packages and local screenshots are excluded from the public commit. External attribution records and vendor licenses are preserved.

## Deployment target and verification

Keep the existing design-ea38/c24-careers Vercel project and https://c24-careers-chi.vercel.app. The visual reviewer verified the current Vercel Environments settings read-only: Production Branch Tracking is main and the primary domain is c24-careers-chi.vercel.app. No settings were changed. GitHub CI and the Vercel deployment status must identify the released revision; the coordinator verifies the stable URL and representative mobile direct routes after deployment. Final production observations and revision are retained locally in output and reported in the completion reply.

Browser mobile emulation is not physical-device testing. Previously documented backend application-field limitations remain; no test application is submitted by UAT.
