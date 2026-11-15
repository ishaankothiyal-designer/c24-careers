# Sticker micro-motion — visual acceptance

**Accepted locally.** The new motion reads as a subtle response rather than a separate animation sequence. No material clipping, flow shift or carousel-control interference was found. No deployment was performed.

## Rendered checks

At **1440px**, the center card, leading card and trailing shield were inspected. At **1100px**, the center and trailing shield were inspected. Settled computed values match the intended treatment:

| Element | Actual hover values |
| --- | --- |
| Sticker card | `scale:1.008`, `translate:0px -2px` |
| Illustration | `scale:1.025`, alternating `rotate:2deg` / `-2deg`, `translate:0px -1px` |
| Timing | Card scale 420ms; lift and illustration response 320ms |

Individual CSS `scale`/`rotate`/`translate` properties were measured; the separate `transform` property correctly remains unused for this effect. An intermediate hover sample showed scale 1.00187 and lift −0.61px before settling, consistent with a transition rather than a jump.

The 8px/10px scroller room contains the enlarged/lifted card. At 1440px the hovered card retains approximately **4.31px above and 10.31px below** its visual rectangle inside the list; at 1100px these are approximately **4.38px and 10.38px**. The additional 5px green shadow remains visible and inside the available lower room. Actual screenshots confirm clean edges and no cut-off sticker copy or art.

At a fixed scroll position, center-to-leading hover at 1440px leaves the following section boundary at exactly **866.375px**. Center-to-trailing hover at 1100px leaves it at exactly **751.469px**. Hover does not reflow the page. Native coordinate input on the carousel arrow preserves page Y and advances horizontally; the final end state shows the complete shield, disabled next arrow and clear shadow. Locator-driven auto-framing during review was excluded from the page-shift judgment.

## Phone entry and reduced-motion boundary

Fresh **320px and 390px** pages were checked before the first card entered the viewport and after arrival. Before reveal, the card had no `data-revealed` flag and was sampled at approximately scale **0.994** while transitioning toward the configured 0.985 starting state. After arrival, both cards had `data-revealed="true"` and settled at **scale 1 / illustration rotation 0deg** with the pointer moved away. The established one-time observer supplies the reveal state; no new looping JavaScript is involved.

The source review confirms **all new entry/hover rules are inside `prefers-reduced-motion:no-preference`**. The hover rules additionally require **`hover:hover` and `pointer:fine`**, so coarse pointers receive entry only. The reduced-motion path does not apply these new scales, rotations or transitions and retains the established reduced-motion reset. Browser viewport resizing does not emulate a coarse pointer or OS motion preference, so this is a **source-verified reduced-motion guarantee, not a runtime OS/physical-phone test**. The desktop mouse can still trigger fine-pointer hover in a phone-sized viewport; that transient state was not mistaken for physical-phone hover behavior.

## Evidence and handoff

Ignored local evidence under `output/sticker-micro-motion/`:

- `hover-center-1440.jpg` — center card response.
- `hover-shield-1440.jpg`, `hover-shield-1100.jpg` — trailing edge and intact green shadow.
- `entry-320.jpg`, `entry-390.jpg` — phone-sized arrival states.
- `computed-hover.json`, `computed-entry.json` — rendered values and geometry.

The center/edge screenshots were opened and visually inspected. No warning/error entries were captured in the inspected final browser session. The coordinator separately reports the build, 185 tests and diff checks passing. Browser completion summary is recorded, viewport overrides are reset and browser ownership is released.
