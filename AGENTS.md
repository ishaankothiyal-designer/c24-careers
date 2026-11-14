# C24 Careers project instructions

- Active app and production URL: https://c24-careers-chi.vercel.app.
- Work in this repository (`Careers Page V3 `). Use the existing Vercel project serving that URL for all future deployments and production reviews.
- Follow `README.md` and `vercel.json` for deployment. Build with `npm run build`, test with `npm test`, and publish `dist/client` at the domain root.
- Check the existing project's Production Branch setting in Vercel before relying on Git-triggered deployment. Do not assume the current local branch is the production branch.
- Keep the existing Vercel project and stable production URL. Do not create a new hosting project or deploy to GitHub Pages or Sites unless the user explicitly requests it.
- The Sites worker/build wrapper and GitHub Pages asset helper are legacy compatibility code. Do not run the Pages postprocessor for Vercel.
- Keep external job application links and source/asset attribution URLs intact; they are separate from this app's hosting URL.

## UAT agent

- “UAT agent” and “UAT” invoke the reusable workflow in [`.agents/skills/uat-agent/SKILL.md`](.agents/skills/uat-agent/SKILL.md).
- Run independent visual/responsive, UX-copy and brief-compliance passes; reconcile findings, fix verified defects, and recheck before reporting readiness.
- Preserve explicit user corrections in `docs/uat/feedback.md`, with date, scope, acceptance rule and evidence. Keep the repository skill and installed `~/.codex/skills/uat-agent` copy aligned when improving the workflow.
- UAT runs during the active task. It does not configure continuous background monitoring or grant standing deployment authorization.
