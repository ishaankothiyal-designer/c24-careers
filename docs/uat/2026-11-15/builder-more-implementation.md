# Inline builder stories continuation

Replaced the separate “Show all builder stories” toggle with a native “View more stories” button card after the four selected stories. Activating it reveals the remaining eight approved stories in place, removes the action card, and aligns/focuses Vishal without vertical page scrolling. All twelve story links and existing project popups remain available; the old collapse/outside action is removed.

Both transform and native-touch reel controllers handle the reveal. Positioning uses actual card offsets rather than indices, since the hidden action card no longer takes up a slot. The builder row reserves the full roster's measured height at the active width, so longer newly revealed descriptions do not move the surrounding sections. Hidden-card styles/visibility are restored immediately after measurement.

The interaction review found native keyboard focus scrolling being added to the transform reel's own movement. Transform viewports now use overflow clipping and clear unexpected native horizontal offsets; the native-touch path retains native scrolling. Regression tests cover one-way expansion, continuation in both controllers, row-height stability and suppression of the double offset.

Build and all 174 tests pass. Copy/source and independent brief checks accepted; rendered interaction evidence is recorded by the visual reviewer under ignored `output/builder-more-uat/`. No commit, push or deployment was performed.

Final targeted browser acceptance passed at 320/390/834/1440. Enter, real pointer click and Space continuation kept vertical page position exactly unchanged in the settled 320/390/834 checks; card-row height varied by less than 0.4px from rounding. All widths reveal twelve stories, focus Vishal and retain a zero native offset in the transform path. Forward navigation becomes available after expansion; keyboard navigation reaches Suraj and the true final boundary. No blank-space regression or captured console warnings/errors remained. Appearance proof excludes transient entrance/pixel-reveal frames. See `builder-more-visual.md` for evidence and browser limitations.
