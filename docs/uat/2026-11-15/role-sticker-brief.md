# Role-context sticker brief review

**Verdict:** Source/brief accepted, pending the visual reviewer's final small-card clearance and height checks. No product edits or deployment performed.

## Scope and mapping

The shared liveJobCard renderer adds one56px decorative sticker to every role card in both landing and careers-listing contexts. Existing headline, official title, summary, CTA wording, link path, accessible card name and job/application data are unchanged.

Exact normalized official-title mapping follows the reviewed work: Evaluation Engineer→inspection; Key Accounts→dealer network; Retail Associate→customer calls; Procurement Associate→dealer auctions; Listing→car listing; Closure→purchase completion; Procurement→inspection-record review. The two Procurement roles remain distinct. Unknown or missing titles use the neutral work-folder fallback, with a constant asset path rather than interpolated user text. The key/completion metaphor does not add a promise of physical key delivery.

## Asset and accessibility review

All eight SVGs parse successfully. Inspected element/attribute inventories contain local vector shapes and local decorative filters, with the established palette. No script, event handler, remote href, embedded raster image, foreignObject or text element was found. The README accurately identifies these as original native SVG work rather than reusing the earlier generated-art attribution.

Each image has empty alt text, aria-hidden, fixed dimensions and draggable=false inside the existing decorative CTA span. It creates no new tab target, control or nested link; the entire role card remains the one interactive anchor.

## Geometry to verify visually

The existing flex footer now separates the live CTA and image with12px gap. A negative block-start image margin intends to preserve the existing44px footer footprint despite56px artwork. No card padding or text-size reduction is introduced. The negative margin means actual summary-to-art clearance must be checked rather than inferred from the footer box. The pre-existing nowrap CTA plus56px art and12px gap is close to the available phone-card interior;320px landing cards are the most important constraint. Verify visible painted rotation/filter bounds, CTA readability, consistent bottom/right inset and row-height stability in both render contexts.

## Independent checks

Ran role-cards and role-summary suites:10passed,0failed. Additional direct assertions checked all seven exact mappings, seven case/spacing/dash-normalized mappings, all fourteen landing/listing card renderings and unknown/missing-title fallbacks. All passed. git diff --check passed. These source checks do not establish final illustration legibility at56px or rendered footer clearance; visual evidence remains with the designated reviewer.
