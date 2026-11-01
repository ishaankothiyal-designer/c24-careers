# C24 Careers project instructions

- Active app and production URL: https://c24-careers-chi.vercel.app.
- Work in this repository (`Careers Page V3 `). Use the existing Vercel project serving that URL for all future deployments and production reviews.
- Follow `README.md` and `vercel.json` for deployment. Build with `npm run build`, test with `npm test`, and publish `dist/client` at the domain root.
- Check the existing project's Production Branch setting in Vercel before relying on Git-triggered deployment. Do not assume the current local branch is the production branch.
- Keep the existing Vercel project and stable production URL. Do not create a new hosting project or deploy to GitHub Pages or Sites unless the user explicitly requests it.
- The Sites worker/build wrapper and GitHub Pages asset helper are legacy compatibility code. Do not run the Pages postprocessor for Vercel.
- Keep external job application links and source/asset attribution URLs intact; they are separate from this app's hosting URL.
