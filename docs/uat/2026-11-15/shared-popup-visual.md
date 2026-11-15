# Shared popup visual UAT — 15 November 2026

**Accepted locally within tested coverage.** Independent Chrome review of builder and support carousels using the shared popup shell. No product files were changed by this reviewer; no deployment or form submission was performed.

## Coverage

- Both popup types checked at actual viewport widths 320, 390, 834, 1100 and 1440px, plus 844×390 landscape. Panels and fixed controls fit; close controls measured 44×44px. Reading widths matched scroll widths; document width matched viewport. Representative images loaded and remained within their panels. Long content scrolls vertically.
- Builder and support use the role carousel frame consistently: dark 94% scrim, adjacent peeks, top close control, bottom position and arrows. Typography, image fit and copy wrapping were inspected at phone, tablet, desktop and landscape sizes.
- Actual mouse drag over builder text worked. Initially, the hero image intercepted dragging; coordinator set popup images draggable=false. Independent image-surface recheck moved Manvi to Nishant at 390px.
- Default builder deck now reports 12 approved stories, matching the landing gallery. The earlier 14-story deck discrepancy was corrected after the copy review.
- Support drag moved to successive programmes. Vertical reading reached scrollTop 207 while background pageY remained 4226; horizontal position stayed fixed. Tab focus stayed within the popup; Escape restored the originating support button and released the background lock.
- Neighboring card clicks selected the adjacent card and retained the modal; a real 20px dark gap dismissed it. End selected programme 7 of 7 with Next disabled. First programme Previous was disabled.
- No duplicate IDs were found in the inspected loaded states.

## Shared URL and role regression

Direct Manvi entry and refresh retained `/builders/manvi-mehrotra/` and 1 of 12. Next changed the shared path to Nishant; refresh retained Nishant and 2 of 12. Dismissal returned to `/#builders`. Opening a normal landing card retained the homepage URL.

Key Accounts direct entry loaded the correct role at 2 of 7. Apply opened the separate nested application dialog. Escape closed only that dialog, restored focus to Apply and retained the outer role popup. Closing the role returned to `/careers/`. No application was submitted. Final captured console warnings/errors were empty.

## Evidence and limitations

Ignored evidence is in `output/shared-popup-uat/`: `final-builder-mobile.jpg`, `final-builder-desktop.jpg`, builder/support viewport screenshots, and `matrix.json`. Earlier builder matrix images show the pre-fix 14-story counter; final builder screenshots show the approved 12-story deck. Layout CSS was unchanged by that deck correction.

This is Chrome viewport simulation with real mouse and keyboard input. Physical touch/soft keyboard, Safari and Firefox were not tested. Browser ownership was released and temporary viewport override reset.
