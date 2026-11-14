# UX copy UAT review · 15 November 2026

Scope: active Careers homepage fragments, `/careers/`, role cards/details/application states, programme drawers, navigation, FAQ, empty/error states and the documented November 13 brief. This is a source review; the visual UAT reviewer owns browser verification. No product files were edited in this pass.

## Findings to resolve

### COPY-01 · P2 · The card promises an application action that some roles cannot complete

**Source:** `src/runtime/live-jobs.js`, `liveJobCard()`; `src/runtime/live-role.js`, blocked-location application state.

**Current:** `View role & apply` on every role card. Required-location roles currently have a disabled submit button and tell candidates applications are not ready on this page.

**Why it matters:** The label implies the destination supports applying. A candidate who follows it and then encounters an unavailable form experiences a broken promise. The brief asks for a clear role label and clear next action, not an unconditional application promise.

**Suggested replacement:** `View role details` on cards. Use `Apply for this role` only in a supported application action. This preserves problem-first card content and does not change API records or the existing backend restriction.

**Acceptance:** Every role card labels what it can guarantee; a blocked role makes availability clear before requesting contact details or a resume. Supported roles still expose their real application path.

### COPY-02 · P2 · The blocked-submit recovery refers to a destination that is not provided

**Source:** `src/runtime/live-role.js`, blocked form guard in `bindApplication()`.

**Current:** `This application cannot be submitted here yet. Please use the Cars24 application page.`

**Why it matters:** No application-page link is supplied, and the repository states that applicants are not redirected to an external application flow. The recovery instruction is therefore a dead end and contradicts the integration's chosen behaviour.

**Suggested replacement:** `Applications for this role are not available on this page yet. Please check back soon.`

**Acceptance:** All unavailable-application states agree. Do not add an unverified application URL, expose implementation details, or invent a timeline. Keep the existing integration restriction intact.

### COPY-03 · P2 · Programme descriptions contain internal research-note wording

**Source:** `src/support-programmes.json`, `health.body` and `wellbeing.body`.

**Current Health:** `Cars24’s Starter Kit describes health check-ups and workplace camps as part of the support around builders. Looking after health belongs alongside the day-to-day work.`

**Suggested Health:** `Health check-ups and workplace camps bring care closer to the work. Looking after your health belongs alongside the day-to-day work.`

**Current Wellbeing:** `The support described in Cars24’s Starter Kit includes an in-house Wellness team, counselling, and fitness facilities and coaching. It also makes room for open feedback and honest conversations.`

**Suggested Wellbeing:** `Support includes an in-house Wellness team, counselling, and fitness facilities and coaching. There is also room for open feedback and honest conversations.`

**Why it matters:** “The source describes” reads like an unfinished audit or editorial placeholder. The source metadata already lives separately in each record; candidates need to understand the programme directly. Keep existing location/availability notes so the copy does not overstate access.

**Acceptance:** The source field remains intact for attribution, while visible programme prose speaks to the candidate rather than narrating research.

### COPY-04 · P2 · “Open roles” changes destination meaning across routes

**Source:** `src/sections/01-navbar-v2.html` is shared across the homepage, listing and detail-shell routes.

**Current:** `Open roles ↗` links to `/#problems`.

**Why it matters:** On `/careers/`, the visitor is already browsing all roles. The persistent label sends them back to a homepage carousel instead of the complete roles destination its label suggests.

**Suggested treatment:** Link the persistent navigation entry to `/careers/`. Retain the homepage's `Find a problem to own` action to `#problems`, and the section's `View all roles` to `/careers/`; those represent distinct navigation jobs.

**Acceptance:** The persistent entry consistently means the full roles listing. Anchor links such as How we work still lead to the appropriate homepage section.

### COPY-05 · P2 · Screen-reader role-card names omit the problem

**Source:** `src/runtime/live-jobs.js`, `liveJobCard()`.

**Current accessible name:** `View role: ${title}` via `aria-label`.

**Why it matters:** The explicit accessible name replaces the linked card's visible text for screen readers. A user tabbing across cards hears only the official title, while the brief makes the problem the leading idea.

**Suggested accessible name:** `${roleProblem(job)}. Role: ${job.title}. View role details.` Escape all inserted content with the existing helper. Keep the official role visible on the card.

**Acceptance:** A focused link announces the problem and actual role once, without duplicated decorative-arrow announcements or a misleading apply promise.

### COPY-06 · P3 · Unknown-role recovery points people to previews instead of live openings

**Source:** `src/role-detail.js`, no matching role case.

**Current:** `This role may no longer be available. Explore the role previews to find another problem.` The accompanying link goes to the live roles listing.

**Suggested replacement:** `This role may no longer be available. Explore current openings to find another problem to own.`

**Why it matters:** “Previews” is legacy implementation vocabulary. The preserved illustrative preview pages are appropriately labelled as illustrative; the unknown-role recovery should name the actual destination.

## Optional refinements, not release blockers

- `10yrs of work` is the only compressed time unit among otherwise fully written sticker headings. `10 years of work` is clearer if the visual reviewer confirms it fits the card at 320px. Do not change the design or make the heading wrap badly only to satisfy this preference.
- `CareHer was developed with women at Cars24. It brings support around maternity and the return to work into the conversation about a long-term career.` can be simplified to `Developed with women at Cars24, CareHer supports maternity and the return to work as part of a long-term career.` The existing meaning is understandable, so this is a polish choice.
- Empty-state copy `Your next role might be one filter away` is more promotional than the plain application messages. `Try another keyword, location or department, or clear your filters to see all openings.` is more actionable if desired. The existing state already has a reset action and is not misleading.

## CTA inventory and decision

The active homepage has four role-related entry points with different purposes:

1. Persistent navigation: get to the complete roles listing.
2. Hero: jump to the problem-led openings section.
3. Openings section: switch from carousel to the complete listing.
4. Final invitation: give someone who read the complete narrative a route to openings.

These are purposeful repetitions across a long page, not residual CTAs merely because they repeat. Keep the secondary founder-letter anchor if it remains a genuine alternate reading route. Carousel arrows move the carousel; programme actions open programme details; builder reveal expands the existing stories. No blanket CTA deletion is recommended. Coordinate any removal with the visual review and the actual section hierarchy.

The support cards' repeated `Explore the programme` labels are contextual to their titled cards. Builder reveal/collapse labels are clear and match their state. The optional source/illustrative preview pages must remain distinctly labelled and should not become advertised vacancies.

## Copy areas that satisfy the brief

- Problem headlines plus official titles clarify the opening without inventing new jobs.
- The revised hero explains the AI opportunity in two direct sentences.
- The founder tile and first FAQ explicitly avoid treating founder identity as an entry requirement.
- The practical Flatland account is understandable without reading the original manifesto.
- Role-specific scope, 90-day promises and hiring timelines are not invented when source approval is absent.
- Dollar ambition conflict is not repeated in the revised fifth tile.
- API and application error copy generally names the failed task and provides a retry or next step; the blocked-submit exception is called out above.

## Coordination

The visual reviewer was informed of COPY-01, COPY-03 and COPY-04 and the CTA inventory. This report is an independent copy pass; production acceptance still depends on fixing substantive issues and verifying the resulting route, label and application-state behaviour.

## Recheck after fixes · 15 November 2026

All six findings are **resolved in the current source**. No new product edits were made by the copy reviewer.

| Finding | Recheck result |
| --- | --- |
| COPY-01 | Resolved. Landing and listing cards now say `View role details`, so the entry action no longer promises submission for every role. Supported application forms retain their actual submit action. |
| COPY-02 | Resolved. The blocked-submit guard now says `Applications for this role are not available on this page yet. Please check back soon.` The unlinked external application-page instruction is removed. Existing blocked-role availability notice and disabled submit remain; this is not a claim that those jobs can now accept applications. |
| COPY-03 | Resolved. Health and Wellbeing bodies no longer narrate the Starter Kit as a research source. Their separate source metadata and availability notes remain. |
| COPY-04 | Resolved. The shared navigation's `Open roles` link points to `/careers/`; the homepage problem anchor remains a separate contextual action. |
| COPY-05 | Resolved. The card's accessible name now includes the problem and official job title: `View role: Turn customer decisions into completed purchases. Builder - Closure`. It makes no unconditional application promise. |
| COPY-06 | Resolved. Unknown-role recovery now says `Browse current openings to find another problem to own.` and retains its live-listing destination. |

Validation run: `node --test tests/role-cards.test.mjs tests/live-role-detail.test.mjs tests/review-update.test.mjs` — **18 tests passed, 0 failed**. Additional direct module/source assertions passed for the role CTA and accessible name, the shared roles destination, blocked-submit recovery, candidate-facing programme bodies and unknown-role recovery. These are focused copy checks; browser layout/interaction sign-off remains with the visual reviewer and full release validation remains with the coordinator.

The optional refinements in the original report are not blockers. The substantive copy pass is accepted for the reviewed source revision.
