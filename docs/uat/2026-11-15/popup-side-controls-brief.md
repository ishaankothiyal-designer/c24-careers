# Shared popup side-controls brief review

**Verdict:** Source/brief accepted with no demonstrated functional blocker. Final visual acceptance is pending; the role-list-error retry overlap case below needs explicit rendered checking. This is a local task, not a deployment task.

## Shared behavior and content

Roles, builder projects and support programmes retain the common popup shell, carousel controller and existing lifecycles. Changes since HEAD alter the shared shell/navigation styles and displayed status labels, not job records, builder/support source content, application restrictions, URL handling, loaded-form caching or source links. Existing selection, direct refresh, neighbor navigation, keyboard/close and async cancellation logic remains intact.

The visible numeric position is removed in both content and role controllers. A label-only live status remains available to assistive technology, along with swipe/arrow instructions hidden visually through the conventional clipped one-pixel container. Previous/next buttons retain explicit accessible labels,44px targets and disabled states at the collection ends. The navigation group fills the popup viewport with pointer events disabled except on actual controls. Its absolute positioning resolves against the fullscreen dialog, so arrows are centered in the viewport rather than in the scrolled reading column.

Blur3px/opacity0.68 applies only to aria-hidden inactive slides. Active reading content is not blurred or faded. Existing inertness and real-slide hit-testing preserve neighbor selection rather than accidental backdrop dismissal.

## Images and narrow geometry

Builder/support hero media now uses a centered clamp140px/28dvh/260px frame with object-fit:contain. Full source imagery fits without crop; overflow hiding is on the frame, with the contained image respecting its dimensions. Support gallery images use the same contained height. Role content has no corresponding hero-media rewrite.

The initial viewport-minus80px phone candidate was superseded by the final viewport-minus64px rule, leaving side space for44px controls. At320px this produces a256px card with216px reading width after its20px insets. Full support highlights, long role headings/ATS content, builder figures and application availability text therefore need final rendered checks at320/390, tablet/desktop and short landscape. At320px the text begins at52px while the left arrow ends at46px, providing6px clearance in the simple geometry. Final focus outlines and actual content should still be checked.

## Error-state edge

The role-list retry control now sits centered16px above the viewport bottom, while the role action area remains at the bottom of its slide. If the list request fails but the current supported role loads, the retry control could compete spatially with Apply. This is a potential rendered overlap, not a reproduced source failure. The coordinator/visual reviewer was asked to force that precise state and confirm both controls remain separately readable and operable. Existing retry/cancellation data flow itself is unchanged.

## Independent checks

Ran content-popup, role-dialog, role-carousel and project-drawer regressions:24passed,0failed. git diff --check passed. These tests prove existing controller behavior and label expectations, not image framing or control placement. No product edits, browser actions, application submissions or deployment performed by this reviewer.

## Final additions and error-state correction

The phone media frame is now clamp100px/18dvh/160px, while desktop retains140–260px. Contain/center image behavior is unchanged. Focused side controls now draw an inset white focus ring with a blue background, keeping the indicator inside the clipped pixel-arrow shape.

The previously flagged retry/Apply competition has a source-level correction: only when the list retry button is visible, the popup reserves64px plus safe-area bottom padding. This moves the reading/action track above the retry area without consuming that space during the normal state. The retry continues to be a separately operable control. Final rendered error-state proof is still owned by the visual reviewer.

The user’s dark-shield correction is scoped only to the ambition shield: its existing silhouette drop-shadow uses a5px bright green offset, improving separation from the dark fill without changing the other cards or artwork.

View more stories now uses a decorative inline SVG of an open book/story stack with a curved green arrow and accent stars, on a fine lilac grid with a cream title label. The graphic is aria-hidden/focusable=false, introduces no nested button/link, and leaves the live View more stories label and explanatory copy unchanged. The existing reveal handler, deck contents and continuation behavior are untouched. New card sizing still needs the visual reviewer’s narrow-card and expanded-row-height checks.

Independent final regressions across content-popup, role-dialog, role-carousel, review-update, native-reel and reel-collapse:21passed,0failed. git diff --check passed. No remaining source/brief blocker identified across the shared popup, dark-shield shadow and View more graphic requests. No product edits, browser actions or deployment performed by this reviewer.


## Final phone-width adjustment

The final phone card width is viewport minus64px, superseding the initial minus80px candidate. This restores216px of reading width at320px while retaining20px content insets and44px side controls. The intended6px separation between arrow edge and text is narrow but positive; the visual reviewer is rerunning phone geometry. A local ignored error-state fixture now uses the real components with only loadJobs rejected, supporting a direct retry/Apply check. No additional source audit was required for this width-only adjustment.

## Subtle drag runtime review

The new shared controller distinguishes6px axis intent and18px deliberate horizontal completion. Mouse/pen dragging updates the live scroll position before adjacent snapping; touch listeners remain passive and preserve vertical reading, multi-touch cancellation and pinch zoom. Interactive controls are excluded and only a post-drag click is suppressed. Gesture animation frames are cancelled on a new accepted gesture and controller destruction. CSS retains both pan axes and pinch-zoom. Independently ran carousel/content-popup/role-dialog tests:16passed,0failed; diff check passed.

**P2 found independently:** A pending smooth target can become permanent if native horizontal scrolling interrupts it and settles on another card. The update function refuses to select any other card until the pending target is reached, while scrollend only reruns that same check. Real-module reproduction: request index1, simulate interrupted native settling at scrollLeft680/index2, dispatch scrollend and run RAF; index1 remains active and index2 remains inert. The coordinator was asked to clear/reconcile pending at the final scrollend and add an interrupted-target regression. This is unresolved at the time of this entry.

A smaller contract observation: the interactive selector recognizes contenteditable=true but not the valid empty/plaintext-only forms or inherited editability. No current editable popup content is known; strengthening that guard would make the stated exclusion more complete.

### Gesture recheck: P2 resolved

The coordinator changed scrollend to clear pending before reconciling the actual resting position and added an interrupted-target regression. Independently repeated the same real-module reproduction: request index1, settle at scrollLeft680/index2, dispatch scrollend and RAF; the resulting inert states are true/true/false and changes1,2. The visible index2 is now active and accessible. This resolves the P2 above.

Inherited editability is now excluded through isContentEditable, addressing the smaller observation. Lost pointer capture follows cancelled-gesture cleanup and its listener is removed on destroy. Independently reran the three focused suites:17passed,0failed; diff check passed. The coordinator relays successful gentle24px mouse drags across roles/builders/support at320/1440. Native touch dispatch was unavailable in the browser tool, so touch/multi-touch/pinch behavior has event-regression coverage rather than physical-device proof. No remaining source-level gesture blocker identified.
