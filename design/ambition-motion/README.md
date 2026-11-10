# Ambition illustration versions

The default cards use the approved Higgsfield generated references.
The vector study is preserved at `/?ambition-art=refined#ambition` and as
restoration snapshots in `vector-v1/`. Higgsfield V2 refinements are reviewed
separately before replacing the approved references.
Their copy, order, card sizing, gutters, typography and manual carousel remain the
existing design.

## Preserved original
Open `/?ambition-art=original#ambition` to use the original live SVG animations:
vault, cursor-tab, funnel, conveyor and elevator. Their renderers, Hairline kernel,
example modules and MIT licence remain in their original locations, unchanged.
The query only selects the illustration renderer; it does not change the rest
of the page.

The pre-change card fragment and card styles are also preserved in `original/`.
To make the old renderer the default again, change the version selection in
`src/runtime/ambition-stack.js`; the preserved assets remain available.

## Refined SVG motion
- `src/runtime/ambition-vector-scenes.js` contains the shared projection, rigid
  parts, kinematic constraints and five deterministic timelines.
- `src/runtime/ambition-vector.js` retains SVG nodes and shares the carousel's
  visibility, connection and reduced-motion lifecycle.
- Transparent SVGs inherit each card's surface and line palette directly.
- `tests/ambition-vector.test.mjs` checks cube rigidity and contact, drafting-arm
  lengths, all ten connected track sections, independent benches, pavilion
  attachment points, frame bounds, retained nodes and animation disposal.

The refinement review lives at
`/output/ambition-refinement/index.html` in the local Vite server. It compares the
retained generated reference against normal-speed and 0.35x vector motion, with
a scrubber for inspecting keyframes. This local review artifact is not part of
the production build.

## Preserved generated assets
- Original Higgsfield GIFs are preserved in `sources/`.
- Concept briefs, reference-free generation prompts and source URLs are recorded
  in `concept-briefs.json` and `generation-results.json`.
- Prepared movies and composed stills live in `public/media/ambition/`.
- `src/ambition-motion-assets.json` records their paths and matching card colours.
- `node scripts/prepare-ambition-motion.mjs` regenerates prepared assets with
  ffmpeg. It is an optional media-preparation step, not a build dependency.

The preparation step keys each textured backdrop and composites it over a flat
surface, preserving accent colours and pale object fills. Explicit BT.709 matrix
and primaries with sRGB transfer metadata prevent a browser colour-management
seam. Card tokens match the decoded video background. Loops hold the completed
idea and fade back to the surface before restarting.

Static frames show the completed idea for reduced motion and constrained
devices. Movies load only when a card starts playing. Offscreen cards, hidden
tabs, slow/offline connections, data-saving mode and reduced-motion preferences pause playback.
The original renderer uses those same policies. Connection changes automatically resume eligible visible cards; no bandwidth-test request is made.

## Local review
- Active generated reference: http://127.0.0.1:5173/#ambition
- Preserved vector: http://127.0.0.1:5173/?ambition-art=refined#ambition
- Generated: http://127.0.0.1:5173/?ambition-art=generated#ambition
- Comparison: http://127.0.0.1:5173/output/ambition-refinement/index.html
- Original: http://127.0.0.1:5173/?ambition-art=original#ambition

Run `npm run build` and `npm test` before deployment. Use the existing Vercel
project and stable production URL, following the repository's hosting guidance.

