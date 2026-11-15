# Card layout and popup surface corrections

The user reported support-card action text against the card border, inconsistent padding/baselines, and conflicting project popup backgrounds. The earlier popup review did not cover landing-card internal anatomy deeply enough.

## Changes

- `story-flow.css`: support cards now have one padded, growing copy wrapper. Reset individual title/paragraph margins and width restrictions; retain all copy. Reserve a two-line title area that can grow for longer text. Use shared career-card heading tokens. Keep images from shrinking and anchor the action to the common lower edge.
- `feedback-nov13.css`: support actions stretch within that padded area with stable line height and a minimum content-to-action gap.
- `role-carousel.css`: lighten the shared popup backdrop to 60% with 10px blur; keep navigation hints fully opaque for readable contrast, use consistent light project sections and subtle dividers, compact outcome content, and disable inherited sticky solution headings inside the popup.
- `docs/uat/feedback.md`: retain both user corrections and the coverage gap.
- `.agents/skills/uat-agent/references/feedback.md`: require per-item title/body/action inset and bottom-alignment checks, plus inherited page-layout checks when content moves into a modal. Synced the same guidance to `/Users/a39236/.codex/skills/uat-agent/references/feedback.md` (the only modified file outside this project for this pass).

## Validation

`npm run build` passed; all 172 tests passed. Copy/source review accepted the three support-card fixes without shortening content. Independent brief and rendered responsive checks are recorded in the companion reports. Detailed screenshots and measurements remain under ignored `output/full-landing-uat/`.

Changes remain local; this pass did not commit, push or deploy.

## Additional issue found by the deep pass

The phone footer title overlapped its legal links. The mobile footer now defines two actual rows for its two children (stage and monogram), with title and legal content in separate normal-flow areas inside the stage. The animation's visible-title bounds use the inner title area, excluding the legal row. This is a verified fix within the broader user-requested visual audit, not a content change.

## Measured acceptance evidence

All-card geometry was checked at 15 widths from 320 to 1728 CSS pixels, including 767/768, 900/901 and 1023/1024 breakpoint pairs. The expanded 12-builder gallery, seven roles, seven support programmes and five stickers showed no flagged text/card overflow or broken images. Support heading/body/action insets and action-to-bottom spacing matched across all seven items: 21px including border on phones, 25px from 768px upward.

The corrected footer passed at 320/375/390/414/767 and 844×390 landscape, including an intermediate 390px scroll state. Title and legal links occupy distinct areas. Builder solution/outcome scrolling passed at 390/1024/1440; the backdrop computes to 60% dark with 10px blur and fully opaque white navigation text (4.734:1 worst-case contrast over white). Original content and source URLs were preserved.

Browser evidence is Chrome responsive simulation with mouse/keyboard, not physical devices. Reduced-motion styles were source-reviewed; browser preference emulation was unavailable through the advertised browser interface. Safari, Firefox, physical touch and soft keyboards were not tested in this pass.

Final visual acceptance: no unresolved material blocker within the measured scope. The reviewer opened/closed all twelve builder cards at 390 and 1100, verified all six FAQ expansions at 390, and found no captured console warnings/errors. The exact viewport screenshot matching the user's support-card complaint is `output/full-landing-uat/support-card-1100-compassion.jpg`; mobile and corrected footer evidence are in the same directory. Full-page captures are not used as proof of pinned animation reading states.
