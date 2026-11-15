# Text-only job cards — visual acceptance

**Accepted locally.** This supersedes all earlier role-illustration treatments. Job cards on both landing and careers are compact and text-only, with no image node or reserved art row. No product edits or deployment were performed by this reviewer.

## Coverage and measurements

The rendered audit covered landing `#problems` and `/careers/` at **320/375/390/414/768/834/1024/1280/1440px**, plus **844×390 landscape**: twenty cases, all seven job cards per case. Actual document width matches the tested viewport width.

- Every job card contains **zero `img` or `svg` elements**. Its footer is **44px at every tested width**, with no illustration placeholder or 84px art row.
- All seven cards have equal height within each tested row/case. Listing cards are **336px** throughout. Landing cards are **336px** except the expected narrow-copy case at320px (**346.94px**) and larger-type case at1440px (**339.05px**).
- Desktop landing height returns from the rejected illustrated **396.05px to339.05px**, removing57px. The desktop listing returns from361.55px to336px.
- CTA left, right and bottom insets match: **21px on phones**, **25px from768px upward**, including the1px card border. The existing20/24px padding and readable **14.5px/21.75px body type** are preserved.
- There is no text overflow, document overflow or overlapping action. Rendered desktop and phone screenshots show aligned dividers/actions and no empty artwork space.

The other sticker families remain present: five ambition illustrations, four principle illustrations and the View more SVG. This removal is confined to job cards.

## Interaction check

Careers Closure filtering reports one role. Its text-only card opens **Help buyers complete a purchase** at `/careers/roles/a6a4d1873e3f74/`, with the loaded role facts intact. Retail filtering reports two roles at phone width. No application was submitted. No warning/error entries were captured in the inspected final session.

## Evidence and limits

Ignored local evidence under `output/role-card-removal/`:

- **`landing-1440.jpg`** — best overview of the compact aligned desktop carousel; opened and inspected.
- `listing-1440.jpg` — careers grid.
- `landing-320.jpg` — narrow landing card, opened and inspected.
- `listing-320.jpg` — phone careers card.
- `text-only-matrix.json` — all twenty cases and140 rendered card measurements.

The coordinator independently reports build,186 tests and diff checks passing; the copy review also passed. This scope did not include unrelated concurrent footer changes, source packaging or production publication. Responsive Chrome testing is not physical-device certification. Browser completion summary is recorded, viewport overrides reset and browser ownership released.
