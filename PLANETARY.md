# Planetary gameplay — Phase 2 extension

The existing application and Phase 3 station/base features are preserved. No paid assets or APIs are required. Terrain, astronaut, rover, textures and sounds are generated locally.

## Launch

From the project folder run `npm install` if dependencies are missing, then `npm run dev`. Open the URL printed by Vite. Use npm scripts; running a global `vite` command is unnecessary.

## Play

Select Mars, travel there, and begin landing. The Mars demo starts near Mars and provides a roughly 3–5 minute guided route; its reset restarts that demonstration. The separate Phase 3 presentation preserves the normal campaign snapshot.

Landing uses simplified educational physics. Guidance initially controls thrust and lateral correction. Switch guidance off for manual descent: WASD correct lateral position and hold Space for thrust. A safe touchdown requires vertical speed at most 3 m/s, horizontal speed at most 1.5 m/s, pad error at most 6 m, stability at least 65%, and remaining fuel. Mars gravity is 3.71 m/s²; Moon gravity is 1.62 m/s². Failed landings can be retried.

After touchdown press E to exit. Walk with WASD, rotate the camera with mouse (arrow steering fallback), Shift to run, Space to jump, E to interact, C to change camera, Escape to pause. Follow the compass and world markers into the research zone, collect all three geological samples, scan the scientific outcrop, and return to ODYSSEY. Mission Control tracks the eight grouped objectives and inventory. Samples cannot be collected twice.

Approach the Mars rover and press E. WASD drives, Space brakes, C changes camera, E exits. Driving 35 m earns an optional exploration reward when the mission is completed.

Suit oxygen and energy are finite; sprinting costs more energy. Return aboard to recharge. If oxygen depletion reduces health to zero, emergency recovery returns you aboard, preserves collected samples, and reduces the final mission rating.

For the Moon select it in orbital flight and begin landing. The Moon has a separate physical descent, lunar gravity, grey crater terrain, Earth above the horizon, five sample sites, and a three-sample return mission. Phase 3 instrument deployment remains available through its lunar contract.

Audio starts only after the sound button is clicked. Results show landing quality, duration, science, exploration score and rating, with working replay, return to space and Mission Control actions.

## Verification

`npm test` checks eight suites covering flight, landing failures and success, collision, missions, suit recovery, rover physics, old-save migration, persistence, Moon exploration, station/base systems and protected presentation restoration. `npm run build` runs TypeScript and produces the production bundle.

The simulation is designed for a hackathon demonstration, not flight training. Geometry and navigation distances are stylized. Browser visual/performance verification must be done on the presentation laptop; automated gameplay checks do not establish visual quality or frame rate.
