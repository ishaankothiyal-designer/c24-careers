# Landing-page browser feedback · 15 November 2026

Implemented the user's consecutive browser comments locally:

- The shield sticker reserves room above its tapered point; the caption wraps on two lines without colliding with the star. Shape-specific inner spacing keeps all content readable.
- The support introduction uses aligned heading/copy columns on larger screens and the shared stacked gap on phones, with incidental text margins reset.
- The animated letter reclaims its empty exit tail before the FAQ; static/mobile fallback layout retains its existing spacing.
- The Three.js floor shadow fades before its transparent canvas boundary, without blurring/fading the paper itself.
- Role, builder and support details share `popupShellHtml`, carousel geometry and the same swipe/drag controller. Builder/support also share the native-dialog lifecycle in `createContentPopup`, including adjacent-panel navigation, reading scroll, background lock and focus restoration. IDs and local fragment/ARIA references are isolated by item.
- The normal builder deck contains the twelve approved landing stories. Historical direct links include the requested legacy record while retaining the other omission. Source links remain intact, and native image drag no longer competes with carousel drag.

Validation: production build passed, all 172 tests passed. Independent copy/source and brief checks accepted. Visual evidence and limitations are recorded in the companion reports. Earlier role-carousel implementation and hero continuous-flow changes remain in this local working copy. No commit, push or deployment was performed for these review changes.

Final shared-popup visual acceptance passed at 320/390/834/1100/1440 widths and 844×390 landscape. Builder/support panels fit without horizontal overflow; 44px close buttons, image drag, neighbor selection, backdrop dismissal, independent vertical reading, keyboard containment, Escape/focus restoration and direct builder refresh were verified. The roles/application popup regression journey also passed. No duplicate IDs or captured browser warnings/errors were found. Evidence: ignored `output/shared-popup-uat/` and `output/shield-caption-uat/`. Coverage is Chrome responsive simulation, mouse and keyboard; physical touch, soft keyboard, Safari and Firefox were not tested.
