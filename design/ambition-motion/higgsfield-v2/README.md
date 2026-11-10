# Higgsfield structure refinement — V2

The active app uses the approved generated references again. The vector study
is preserved at `/?ambition-art=refined#ambition`, with restoration snapshots in
`../vector-v1/`.

## What was generated
- Five four-pose design experiments using GPT Image 2.6.
- Five new native GIF studies using one approved completed frame as the master.
- A pavilion experiment using three Kling 3.0 Pro clips, each with explicit
  start and end images, assembled into a comparison movie.

All new visual animation content was generated in Higgsfield. Standard ffmpeg
encoding, backdrop preparation, holds and transitions are presentation steps;
no vector replacement or hand-drawn animation was substituted.

## Prompt strategy
Use the approved frame as a design master, enumerate the fixed objects, specify
existing pivots and attachment points, limit simultaneous actions, and separate
setup, action and final hold. Do not ask for a complicated reverse reset in the
same generation.

The key-pose experiments were inspected before use. The leap sheet changed the
starting ledge dimensions; the drawing sheet added a joint. Conflicting pose
sheets were not fed back into the motion model. Instead the approved completed
frame was used as a single consistent design reference.

## Review finding
The workshop reveal is the strongest candidate: keeping the little builds steady
while the drawers emerge removes competing transformations. The leap is also a
useful candidate. Other outputs retain observed faults; see `results.json`.

The pavilion's segmented clips reach their keyed end poses, but some intermediate
connectors detach and the canopy stretches. It is retained as a rejected
experiment in the review, not installed on the cards. End-frame conditioning
alone did not ensure rigidity in intermediate generated frames.

## Files
- `briefs.json`: source references, fixed inventories and pose-sheet prompts.
- `motion-briefs.json`: exact prompts and inputs for the new animation studies.
- `results.json`: completed jobs and explicit review findings.
- Local review: http://127.0.0.1:5173/output/higgsfield-structured/index.html

The local review preserves raw GIFs and pose sheets, and presents the GIFs as
prepared four-second video loops alongside the approved reference. The pavilion
also has a switch for the three-clip experiment. No V2 study replaces a reference
in the active cards.

