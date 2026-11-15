# Final mobile release UAT

**Accepted for release: no unresolved material issue in the verified mobile scope.** This pass reviews the current white, sharp-corner principle-card version and checks related mobile journeys. It supplements `final-deep-visual.md` and `compact-balance-visual.md`; previously accepted all-content route coverage was not repeated combinatorially after a card-background change.

## Current mobile checks

- Actual viewport widths verified at **320, 375, 390 and 414px**, plus **844×390 landscape**. Document width matches viewport in every case. All visible ambition, principle, builder, role and support card text fits horizontally. The five-case rendered matrix is saved locally as `output/mobile-release-final/mobile-home-matrix.json`.
- Home reading states reviewed through hero, compact ambition shield, white principle stack, expanded builder carousel, landing role cards, support programme, FAQ and true footer endpoint. The earlier full deep pass covers all twelve builders, seven roles, seven support programmes, letter content and the responsive breakpoint matrix. No related content was removed by the final white-card change.
- At 320px the shield retains its safe narrowed text measure and tapered-foot clearance. Principle cards are computed **white (`rgb(255,255,255)`) with zero corner radius**, with centered artwork, tape title and body. Actual screenshots were inspected.
- Builder **View more** exposes all twelve approved cards and transfers focus to Vishal. Actual horizontal mouse drag inside the phone-sized popup advanced Vishal to Anshul. Escape closes it. A direct Manvi link at 414px survives refresh with its selected story and URL intact; dismissal returns to `/#builders`.
- Listing search at 375px produces the truthful no-results state. **View all open roles** restores results; Closure plus Gurgaon yields one matching role, whose details open correctly. Direct Key Accounts at 390px retains its route and loaded content across refresh.
- The nested application fits at 390px without horizontal overflow. Fictional first-name text was entered; remaining required fields correctly stayed invalid. Escape returns to the role and restores focus to its Apply button. **No form was submitted.**
- Founders’ Awards at 320px has both heads fully visible and a readable highlight panel. The popup’s close control remains accessible. FAQ keyboard activation updates its expanded state.
- At the actual expanded-home endpoint on 320×844, scroll reached **8013/8013**, footer transform was **zero**, and its bottom was **843.85px**. The approved oversized C24 crop remains intentional; no empty band is present. Earlier desktop/phone/landscape endpoint checks remain recorded in the compact/deep reports.
- No warning or error entries were captured in the inspected local session.

## Current deployment configuration, verified read-only

Immediately before the release handoff, the authenticated Vercel UI at [project environments](https://vercel.com/design-ea38/c24-careers/settings/environments) showed the existing **`design-ea38/c24-careers` Production environment tracking `main`**, with primary domain **`c24-careers-chi.vercel.app`**. The Git settings page linked to this environment configuration. No settings were changed and no account/settings screenshot was saved.

This clears the visual and production-branch prerequisites for the coordinator's authorized main deployment. Production acceptance still requires smoke testing the resulting deployment and exact revision.

## Local evidence and limitations

Evidence is ignored under `output/mobile-release-final/`: `home-hero-390.jpg`, `home-shield-320.jpg`, `home-principles-320.jpg`, `builder-popup-320.jpg`, `home-roles-320.jpg`, `support-founders-320.jpg`, `home-footer-320.jpg`, `listing-empty-375.jpg` and `application-390.jpg`.

This is responsive Chrome testing rather than physical iPhone/Android testing. Horizontal drag was exercised with browser mouse input; this does not certify hardware touch arbitration. OS reduced-motion and screen-reader behavior were not newly emulated. The coordinator independently ran the required build and 180 passing tests. No application, upload, deployment or project-setting mutation was performed by this reviewer. Viewport overrides were reset, the browser completion summary recorded and browser ownership released pending production smoke.
