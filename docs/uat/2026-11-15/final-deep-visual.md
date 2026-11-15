# Final deep visual UAT — 15 November 2026

**Verdict: accepted for local review. No unresolved material visual or interaction defect found in the verified scope.** This pass covers the final frozen neutral-principle, enlarged-sticker and footer fixes, plus related listing and popup routes. It does not constitute a production deployment or physical-device certification.

## Coverage and evidence

Chrome responsive viewport overrides were verified against the rendered `innerWidth`. Home received 20 cases: 320, 375, 390, 414, 600, 601, 767, 768, 834, 900, 901, 1023, 1024, 1100, 1199, 1200, 1280, 1440 and 1728px, plus 844×390 landscape. Heights were 844px for the three narrowest widths and 955px otherwise. The careers listing received the same 19 portrait/desktop widths and a landscape spot check. These include the actual breakpoint boundaries rather than only common device presets.

Every home case included all five ambition stickers, four principles, twelve expanded builder cards, seven role cards and seven support cards. Document width equalled viewport width; no inspected card or text node overflowed horizontally. The final matrices are local evidence under `output/final-deep-uat/release-home-matrix.json` and `release-listing-matrix.json`.

| Area | Final verification | Result |
| --- | --- | --- |
| Ambition stickers | All five actual card states captured at 320/390/834/1024/1440; all five 320px screenshots visually inspected. Equal art slots are 112px through 767px and 128px from 768px. Captions, illustrations, headings and body copy fit the silhouettes in the requested order. | Accepted. The shield's caption clears the upper curve, the enlarged house/globe reads clearly, and the complete body stays above the taper. No repeated builder label or pause CTA remains. |
| Working principles | Neutral paper backgrounds, translucent torn-tape headings, live text, no number badges. Grid verified at 600/601 and 1023/1024 boundaries and at 1199/1200 title-slot boundary. | Accepted. One column through 600px, two columns through 1023px, four from 1024px. The three-line title reserve aligns desktop paragraph starts without forcing every tape to the same visual height. |
| Builder/support/role landing cards | All card content measured, including expanded builders and every support CTA; typography, wrapping and internal insets inspected in the final matrix and earlier detailed card-family pass. | Accepted. No clipping, accidental horizontal overflow, leftover separate builder expansion link or extra CTA found. Compact support copy retains readable spacing and a consistent action anchor. |
| Careers listing | All seven cards at 19 widths; search, department and location filters, no-results state and reset recovery exercised. | Accepted. Closure narrows to one role; keyword retail returns two; unmatched query returns zero visible cards and truthful empty copy; reset restores seven. Hidden DOM cards were excluded when counting rendered results. |
| Role details | All seven roles loaded at 320/1440, not only loading headings; all retain five facts and their source job descriptions. Direct Key Accounts URL refreshed successfully. | Accepted. No horizontal overflow. Evaluation has a disabled Applications unavailable action; Key Accounts and Listing expose supported applications. |
| Application popup | Key Accounts at 390px; nested popup fits the screen, fictional first-name draft entered, Escape returns focus to Apply, reopening retains draft. Required-field validity inspected without submitting. | Accepted. Empty required surname/email/phone/resume/consent remained invalid. No application was submitted. |
| Builder details | All twelve approved stories and both legacy direct routes at 320/1440. Default deck stays twelve; a requested legacy route includes only that extra story, for thirteen. Shared Manvi refresh, Next to Nishant, refreshed neighbor URL and dismissal checked. | Accepted. Shared path retained through refresh and neighbor navigation; dismissal returns to `/#builders`. Ordinary homepage opening retains its homepage URL. No duplicate IDs found; inactive slides carry inert attributes. |
| Support details | All seven programmes at 320/1440, every photo loaded, natural image proportions, no max-height crop, two semantic highlight items per programme. Settled Founders desktop/phone appearance inspected. | Accepted. Both people’s heads remain fully visible; highlight panel has balanced padding and readable copy. Close target is 44×44px and fits the phone screen. |
| Letter, FAQ and popup regression | Active letter cue observed at opacity 1 with finite `1.6s × 3` animation; inactive cue observed hidden. FAQ keyboard toggle changes expanded state. Shared popup Escape, focus and inactive-slide behavior checked. | Accepted. Letter signature remains visible. Reduced-motion cue override is present in source; runtime OS preference emulation was unavailable. |
| Footer | Actual page end verified separately from animation progress on home at 1100×955, 1440×955, 390×844 and 844×390; careers at 1440×955, 390×844 and 844×390. Intermediate landscape reveal inspected on both routes. | Accepted. At every true endpoint the footer transform reaches zero, its bottom meets the viewport within 0.8px rounding, and C24 line boxes fit inside their cells. |

## Verified finding and resolution

The pre-fix footer failure was real: at 1100×955 the desktop monogram line box extended about 113px below its clipping cell, while the footer’s unfinished reveal left about 118px of empty blue below the content at the actual page end. Phone glyphs already fit, but the incomplete reveal still left approximately 89px below them.

The final two-row layout and bounded monogram sizes resolve the clipping. The native-geometry reveal resolves the endpoint gap. At 1100 the 281.6px line boxes end approximately 11px above their cell bottoms; at 390 the 101.4px line boxes retain about 21px clearance. Footer transforms are exactly zero at all seven recorded endpoints. Intermediate reveal remains animated; an intermediate frame is not treated as final clipping evidence.

## Reviewable local screenshots

All paths below are under the ignored `output/final-deep-uat/` directory; they contain local product evidence, not private source conversations or account screens.

- `footer-final-home-1100.jpg` — complete C24, legal row and no empty bottom band; best desktop footer proof.
- `footer-final-home-1440.jpg`, `footer-final-home-390.jpg` — settled home endpoints.
- `footer-final-listing-1440.jpg`, `footer-final-listing-390.jpg` — settled listing endpoints.
- `footer-final-home-landscape.jpg`, `footer-final-listing-landscape.jpg` — short-height endpoints.
- `footer-final-home-landscape-mid.jpg`, `footer-final-listing-landscape-mid.jpg` — intermediate reveal.
- `release-art-320-0.jpg` through `release-art-320-4.jpg` — every narrow-screen sticker, including the final shield.
- `release-tape-320.jpg`, `release-tape-1024.jpg`, `release-tape-1440.jpg` — neutral paper/tape hierarchy and responsive grid.
- `landing-roles-desktop-final.jpg` — full landing role cards and new summaries in page context.
- `support-founders-desktop.jpg`, `support-founders-phone.jpg` — settled uncropped photo and highlights panel.
- `application-phone.jpg`, `role-desktop.jpg` — nested form and loaded role detail.
- `letter-active-final-desktop.jpg` — active letter, sticker cue and signature.

`footer-final-metrics.json`, `roles-final-matrix.json`, `builders-final-matrix.json` and `support-final-matrix.json` preserve rendered measurements. The role-matrix `inactive` field used a property unavailable in the read-only DOM wrapper; its false values are not findings. A subsequent direct attribute inspection verified inactive slides have `inert` and `aria-hidden="true"`. `footer-final-home-mid-1440.jpg` and `letter-final-desktop.jpg` caught an offscreen/intermediate position and are excluded as appearance proof.

## Limits and release boundary

This is desktop Chrome with responsive viewport overrides, not physical iOS/Android testing. Touch hardware, OS reduced-motion behavior, screen-reader announcement quality and external application delivery remain outside this browser pass. The source has the explicit reduced-motion cue override; independent automated checks cover recovery states. No error or warning entries were captured in the inspected final session, but that is not a claim about every browser or network condition. No forms were submitted, files uploaded or production settings changed.

The coordinator separately reports the final build and 180 tests passing. This reviewer did not rerun or duplicate those checks. Browser ownership was released and the viewport override reset after the visual pass.
