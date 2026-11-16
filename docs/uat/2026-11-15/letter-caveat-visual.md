# Caveat handwritten letter — visual acceptance

**Accepted locally.** Caveat at weight500 gives the letter a more natural handwritten appearance while keeping the full excerpt readable. The existing paper, dark ink, copy and blue signature remain intact. No source edits or deployment were performed by this reviewer.

## Rendered review

Actual screenshots were opened and inspected for **fully open animated paper at1440px**, **fully open stacked tablet paper at834px**, and the **static phone letter at390px**. The new letterforms read clearly at normal viewing size. Paragraph spacing remains comfortable; the complete signature is visible in all three views. The lighter handwritten strokes do not get lost against the grid or paper shading.

The recommendation is to **retain Caveat500 and the current scale/line spacing**. No further type, contrast or layout correction is required in the verified scope.

## Responsive and font checks

The letter-only matrix covers **320/375/390/414/768/834/1024/1280/1440/1728px**. `document.fonts.status` is loaded and `document.fonts.check('500 24px "Caveat"')` returns true. The CSS family, weight and self-hosted font declaration agree; the animated runtime explicitly loads Caveat500 before painting its texture.

| Mode | Observed body type and fit |
| --- | --- |
| Static phone320–414px | Caveat500 **20.4px /31.62px**. No paragraph or document overflow. The complete DOM signature retains approximately **19px bottom clearance**; the320px sheet grows naturally to accommodate its additional lines. |
| Animated tablet768/834/1024px | CSS body **21.6px /33.48px**; texture fit scale **0.864**. Final ink bottom **489.4px** inside **517.5px** paper, leaving28.1px. Writing/signature progress both1.000. The actual834px screenshot confirms full readable copy and signature. |
| Animated desktop1280/1440px | CSS body **24px /37.2px**; texture fit scale **1.000**. At1440px ink bottom507.2px inside769.5px paper; writing/signature progress both1.000 and open-pose crumple0.000. |
| Wide1728px | Caveat50024px; texture scale1.000. Ink bottom508.0px inside882.0px paper; no horizontal overflow. |

The tablet’s invisible DOM template has more text height than its fixed animated paper. That is handled by the established canvas-fit calculation: the fitted ink bounds and actual rendered signature are inside the sheet. It is not visible clipping. Conversely, retained canvas datasets on phone mode do not determine its layout; the visible static DOM sheet and signature bounds were checked directly.

Body ink remains **#151515** on nominal **#f5f3ec** paper, approximately **16.45:1** source contrast. Actual animated screenshots were also checked for readability under the existing lighting/shading. The signature retains Motterdam and its existing blue treatment.

## Motion limit and evidence

Runtime OS reduced-motion emulation is not exposed by the documented browser capabilities. The source selects its static DOM letter in reduced-motion mode, with the same scoped Caveat typography; this path is **source-checked, not claimed as a separate runtime OS test**. The phone static view provides direct visual evidence of the new font outside the canvas renderer.

Ignored evidence under `output/letter-caveat/`:

- `animated-1440.jpg` — settled open desktop paper.
- `animated-834.jpg` — settled open tablet paper.
- `static-390.jpg` — complete static phone letter and signature.
- `letter-matrix.json` — all ten widths, computed type, font checks, paper/ink bounds and overflow measurements.

No warning/error entries were captured in the inspected session. The coordinator separately reports build and186 tests passing and independent copy/brief acceptance. The audit stayed within the affected letter. Browser completion summary is recorded, viewport overrides reset and browser ownership released.
