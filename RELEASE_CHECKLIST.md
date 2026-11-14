# Submission and release checklist

- [ ] `npm ci`, `npm test`, `npm run build` succeed on the submission commit.
- [ ] Run the production preview on the presentation laptop.
- [ ] Complete one protected presentation and restore the original save.
- [ ] Manually check mouse capture, Esc pause, M dashboard and H help.
- [ ] Check Earth campus B overview → walking, boarding proximity and ascent.
- [ ] Check a manual Mars descent, exit, sample interaction and return.
- [ ] Check a Moon surface visit and return.
- [ ] Confirm all planet maps load from the hosted repository subpath.
- [ ] Test LOW graphics and sound enabled by a user click.
- [ ] Check the public GitHub repository from a logged-out browser.
- [ ] Add the team's real names and exact official challenge URL to the hackathon submission.
- [ ] Include repository URL and a playable demo URL only after confirming it works.
- [ ] Keep the local production preview and downloaded source as the offline fallback.

Automated model tests establish state and physics behavior, not visual quality or measured learning outcomes. Unchecked items are manual release checks, not claims of completed verification.

## GitHub Pages

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. In **Actions**, run **Publish playable demo**. The workflow builds and tests before deploying. Its deployment output supplies the actual published URL. The intended URL is `https://sino07815-cpu.github.io/pamir-space-lab/`; do not treat that address as live until the workflow succeeds.

The separate **Verify game** workflow checks pushes and pull requests and uploads a production-build artifact without publishing it.
