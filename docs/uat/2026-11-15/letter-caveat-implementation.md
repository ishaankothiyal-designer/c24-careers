# Letter handwriting trial — 15 November 2026

The user requested a different letter-body typeface with a more natural handwritten character, high legibility and maintained contrast. The local trial uses Caveat Medium (500), self-hosted from the official Google Fonts distribution with the SIL Open Font License and source attribution.

The letter paragraph override uses 1.2em type and 1.55 line height. At the existing 20px desktop sheet size this gives 24px/37.2px; the mobile fallback scales from the sheet's responsive size. The animation waits for the matching Caveat 500 font before painting the existing texture. The same computed paragraph styles feed both the readable HTML and the canvas layout. Letter wording, separate Motterdam signature, dark ink colour and paper animation are preserved.

The existing static ink #151515 on paper #f5f3ec has a nominal contrast ratio of 16.45:1; this does not measure the shaded WebGL texture. The visual review checks actual animated rendering separately. No new runtime third-party font request is added.

Validation: npm test passes all 186 tests; npm run build and git diff --check pass. Independent source/copy, brief and rendered visual reviews accompany this record. Desktop visual proof confirms font loaded, textScale 1.000, signature complete, and ink bottom 507.2px within 769.5px paper height. All ten checked widths load Caveat without paragraph or document overflow. Phone type is 20.4px/31.62px; the 390px fallback retains about 19px signature clearance. Animated tablets use the existing fit at scale .864; desktop stays at scale 1.000. Final rendered evidence is in letter-caveat-visual.md.

This is a local review version. It has not been committed or deployed; the previous production release remains d6cd622.
