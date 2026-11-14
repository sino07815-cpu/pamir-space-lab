# Release validation — 14 November 2026

Validated in the local Windows workspace:

- `npm test`: all 14 suites passed, including the complete protected expedition model route and restoration of normal saved progress.
- `npm run build`: TypeScript and Vite production bundling passed. Vite reports a large JavaScript chunk advisory; loading and rendering performance still depend on the device.
- `git diff --cached --check`: passed before the release commit.
- `node scripts/qa-release.mjs`: passed against the production build served under `/pamir-space-lab/`. All bundled texture files were available over HTTP. The isolated Chrome test opened the real menu and Judge Briefing, started the protected presentation, ended it and confirmed return to the menu. No runtime errors were captured.

Screenshot capture timed out on the software-rendered test browser. Screenshots are therefore optional in the smoke script (`CAPTURE_RELEASE=1`); no new screenshot or photorealism claim is used as release evidence. The smoke test validates controls and transitions, not a complete visually reviewed expedition.

The full manual playthrough, mouse/game feel, visual quality and frame rate on the presentation laptop remain manual checks in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). A passed model test does not establish measured learning outcomes or aerospace fidelity.

GitHub-hosted CI and Pages deployment are separate checks. Their status must be read from the actual repository after publishing; local validation is not evidence that a public deployment is live.
