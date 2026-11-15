# Shared popup controls and Flatland accents · 15 November 2026

This follow-up was reviewed locally after the published divider/text-wrap release. The user subsequently authorized publishing all pending reviewed updates to main and the existing Vercel project; the accumulated release record and final production evidence identify the published revision.

## Shared popup frame

Role, builder and programme popups reuse the shared shell. Previous/next buttons now inherit the landing page’s pixel-cut arrow treatment, with 44px hit areas at the left/right viewport midpoint. Numeric page counters and the visible bottom navigation row are removed. Current-item title announcements and gesture instructions remain available to screen readers. Inactive preview panels are subtly blurred and dimmed; only the selected panel remains active and accessible.

Phone cards use viewport width minus64px with their existing20px text insets. At320px this provides a216px reading width and6px clearance between text and the arrow edge. The earlier narrower candidate was rejected after it isolated “with” in the Key Accounts heading. Arrow focus uses an inset white ring and blue background so the pixel clip does not hide it.

Hero images and programme gallery photos remain complete and centered using contain. Desktop/tablet frames are bounded to140–260px by viewport height; phone frames use100–160px. This reduces the image footprint while preserving heads and focal content. Vertical reading remains native. The shared gesture adapter now recognizes horizontal intent after6px and advances after a deliberate18px horizontal drag, then smoothly snaps. Mouse/pen movement follows the pointer; touch keeps native scrolling/momentum and adjusts the final snap for short horizontal flicks. Vertical, tiny, cancelled, multi-touch and control/editable interactions do not force a card change.

A pending smooth destination avoids selecting the old panel mid-transition. When scrolling settles, the actual nearest card wins, including after interruption. Independent review caught an earlier pending-target trap, which was fixed and covered by an interruption regression. Lost pointer capture uses cancellation cleanup.

A failed role-list request exposes a retry action in a separately reserved bottom area. The current role and its supported Apply action remain usable. An ignored local fixture imports the actual index base styles and component styles, then mounts the real role component with a failed deck loader and successful current-role loader; it is not shipped.

## Flatland accents

The dark ambition shield uses the existing green as its5px offset shadow. Its silhouette, typography and dimensions are preserved.

The View more stories card retains its exact title, description and in-place continuation behavior. The graphic is a native decorative SVG story/book stack with bold offset ink, a curved green arrow and simple sparkles, paired with a subtle lilac grid and cream live-text label. The direction was checked against the local Flatland reference pages. No private reference images are added to public source. The artwork is aria-hidden, nonfocusable and contains no nested control or baked-in title.

## Validation

Independent visual, copy/accessibility and brief/source passes are recorded alongside this file. Browser screenshots and measurements remain under ignored output/popup-side-controls. Final visual scope, image checks and retry acceptance are recorded in popup-side-controls-visual.md.

The required build passed;185 tests passed with zero failures, including five added gesture regressions. Current-item announcement tests were updated from numeric counts to labels. git diff --check passed. Six real24px mouse drags cover the three popup families at320px and1440px. Native touch/multitouch has event-level regression coverage; browser touch dispatch was unavailable, and no physical-device testing is claimed.
