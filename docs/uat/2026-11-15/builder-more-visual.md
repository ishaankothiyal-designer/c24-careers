# Inline builder reveal UAT — 15 November 2026

**Accepted locally after fixes.** Targeted review at320,390,834 and1440px. The fifth carousel card is a native View more stories button after the four selected stories; no separate Show all builder stories control remains. Activation hides that button, reveals the remaining eight stories and continues forward to Vishal with focus. All twelve stories remain available.

## Independently verified

- Before expansion, Next is disabled at the View more card. After expansion, Next is enabled and Vishal is aligned at the leading content inset:20px on390,24.18px on834 and41.76px on1440.
- Enter at320, real coordinate mouse activation at390, Space at834 and mouse activation at1440 all reveal twelve stories and focus Vishal.
- Exact settled pageY checks:320 Enter2552.5→2552.5;390 mouse2275→2275;834 Space1888→1888. Reserved section height differs by less than0.4px after expansion, consistent with subpixel layout rounding; no visible page jump.
- From Vishal, seven successive Tab presses reach Anshul, Ayush Upadhyay, Priyanshu, Gaurav, Nikhil, Shyamal and Suraj. At the final card Next is disabled. No blank terminal region remains in this rechecked path.
- Final captured console warnings/errors were empty. Browser viewport override reset and browser ownership released. No product files or deployment changed by reviewer.

## Defect found and resolved

Keyboard focus originally caused the transform carousel viewport to acquire a native horizontal scroll offset as well as the JavaScript track transform. Previous/Next and reveal could then leave the selected card offscreen. Coordinator changed the transform path to overflow:clip and clears native horizontal offset on focus/scroll/reveal. Independent320px recheck keeps scrollLeft0, shows the View more card correctly, and places Vishal at the leading inset after Enter. Native coarse-pointer scrolling remains a separate implementation path; it was not physically tested here.

## Evidence

Ignored `output/builder-more-uat/verified-results.json` contains the measured results. Recommended settled proof: `fixed-before-320.jpg` and `settled-after-1440.jpg`. Early `fixed-before/after-390/834/1440` captures coincided with entrance animation or locator auto-scroll and are excluded as final appearance/page-jump proof. Immediate revealed-card captures can also contain portrait pixel-reveal intermediate frames. `keyboard-double-offset-320.jpg` preserves the corrected defect before its fix.

Chrome viewport simulation, mouse and keyboard only; physical touch/Safari/Firefox were not tested. No additional broad page audit was performed for this narrow change.
