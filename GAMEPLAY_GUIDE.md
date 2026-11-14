# PAMIR SPACE LAB — BEYOND EARTH / PHASE 3

Earth-orbit update: moving 2026 reference spacecraft, inspection camera, and a smaller, more distant Gateway — see [EARTH_ORBITS.md](EARTH_ORBITS.md).

Latest update: all eight planets plus the Moon, locally bundled imagery and realistic orbital materials — see [PLANETS.md](PLANETS.md).

Larger orbital worlds, Earth spaceport departures, and historic landing-site expeditions: see [EXPLORATION.md](EXPLORATION.md).

Phase 3 adds Gateway docking, station and spacecraft interiors, tethered orbital EVA, Mars base construction, research missions and a protected presentation. Read [PHASE3.md](PHASE3.md) for the new gameplay, controls, save protection, tests and limitations. The latest planetary landing, lunar exploration, rover and suit controls are documented in [PLANETARY.md](PLANETARY.md). The Phase 2 guide below remains applicable.

The existing React + TypeScript + Vite game now includes Red Horizon, a playable Mars landing and EVA expedition. The Solar System, main menu, flight controls, Moon samples and original visual design remain. No new dependencies, external models, paid APIs or API keys are required.

## Run

From this project folder:

```powershell
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173/. Keep the terminal running; Ctrl+C stops it. Use a desktop browser with WebGL and hardware acceleration. Vite may select another port if 5173 is occupied.

```powershell
npm test
npm run build
npm run preview
```

Tests require Node.js 22.18+; this project was developed with Node.js 24. Production files are in `dist/`; serve them over HTTP.

## Play Red Horizon

1. Start the game, select Mars, and use Travel to Mars or fly manually.
2. Within 18 space units of the surface, select Enter Mars Orbit, then Initiate Landing.
3. Watch the approach and atmospheric transition. Descent begins at 120 metres. Altitude, vertical speed, fuel, thrust and touchdown ETA come from the simulation.
4. Automatic guidance manages thrust by default. Toggle it off to control thrust with Space or the Hold Thrust button. A safe landing requires impact speed at most 3 m/s and fuel remaining. Hard or fuel-starved landings fail and offer retry.
5. After touchdown, press E or Exit Spacecraft. Walk to sample beacons A, B and C, then the research outcrop. Approach within 3 metres and press E to interact.
6. Return to the ODYSSEY airlock beacon and press E. Returning early allows entry and later exit without losing objectives. Returning after all science objectives completes Red Horizon.
7. Results offer Return to Space, Replay Mission, and Mission Control. Replay replaces this Mars mission's rewards; it does not duplicate points. Other surveys, Moon samples and history remain.

## Judge demo

Choose Judge Demo from the menu or flight view. It resets the current Red Horizon expedition, positions the ship near Mars, enters orbit, lands, exits, walks a fixed route, collects the three samples, scans the outcrop and returns.

It uses the same physics, collision, proximity and reward actions as manual play. Movement keys do not change the scripted route. Take Control disables assistance. Pause, Mission Control and camera switching remain available. The automated route test estimates approximately 201 seconds (3 minutes 21 seconds), excluding pauses; runtime depends on frame rate. Object locations and the walkable corridor are deterministic.

## Controls

| Key | Spaceflight | Mars |
| --- | --- | --- |
| W / S | Forward / reverse | Walk forward / backward |
| A / D | Strafe | Move left / right |
| Mouse | Steer after clicking the view | Camera look |
| Click and drag | Fallback when mouse capture is denied | Fallback camera look |
| Arrow keys | Steer | Left/right rotate EVA view |
| Shift | Boost | Sprint |
| Space | Brake | Jump in EVA; thrust during manual landing |
| Q / E | Descend / ascend | E interacts, enters or exits spacecraft |
| Z / X | Roll | — |
| C | Chase / cockpit | Third / first-person EVA camera |
| F | Survey nearby planet | E scans the research outcrop |
| Esc | Release mouse and pause | Release mouse and pause |

Release the mouse with Esc, resume, then click interface buttons. Hidden tabs pause automatically. Mission Control and the help dialog pause gameplay and its timer. The audio button enables optional locally synthesized ambience and science feedback.

## Scoring and saving

Red Horizon has eight objectives: land, exit, A/B/C, research, return, complete. Rewards total 600 points: 100 + 25 + 3×75 + 100 + 50 + 100. Proximity and duplicate collection checks protect rewards. Each first planetary survey awards 100; each of five Moon samples awards 50.

Science points, objectives, samples, mission time, history, landing state and flight position persist in browser localStorage under `pamir-space-lab-v2`. Reloading returns to the menu; Resume Mission continues the saved expedition. Demo automation is disabled after reload. Saves belong to the same browser and origin (host and port); localhost and 127.0.0.1 use different saves. Mission Control indicates session-only mode if storage is unavailable. No account or cloud synchronization is used.

## Science references and limits

- [NASA Glenn: Mars](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/mars/) — approximately 3.7 m/s² gravity and the thin atmosphere.
- [NASA Mars Facts](https://science.nasa.gov/mars/facts/) — mostly carbon-dioxide atmosphere, geology and approximate surface temperature extremes of −153°C to 20°C.
- [NASA Perseverance Science](https://science.nasa.gov/mission/mars-2020-perseverance/science/) — geology, ancient habitability, and rock/regolith sampling.

Descent and jumping use 3.71 m/s² gravity. Space distances, orbit stationkeeping, atmospheric entry, drag, fuel, thrust, astronaut speed and terrain are simplified for gameplay. Terrain is procedural and not an actual NASA landing site. Descent follows a vertical corridor: no full atmospheric flight, parachutes, orbital mechanics or life-support simulation. Touchdown ETA is an estimate based on current altitude and descent speed. NASA-inspired styling does not imply sponsorship or endorsement.

## Changed files and verification

- `src/Scene.tsx`: retained planets, orbital/entry camera, saved flight position, Moon exploration.
- `src/Ship.tsx`: reused ODYSSEY geometry in both scenes.
- `src/flight.ts`, `src/input.ts`: shared flight calculations and one keyboard/mouse owner.
- `src/mars.ts`: landing, terrain, collision, walking/jumping, objectives and science references.
- `src/MarsWorld.tsx`: instanced rocks, landscape, visible astronaut and animations, landing effects, interactions and demo controller.
- `src/store.ts`: persistent state, actual mission transitions, rewards and history.
- `src/MarsHUD.tsx`: instruments, mission dashboard extension, facts and results.
- `src/App.tsx`, `src/main.tsx`, `src/phase2.css`: context-sensitive controls and responsive extensions of the existing design.
- `scripts/check-missions.mjs`, `scripts/check-phase2.mjs`, `package.json`: regression and Phase 2 tests.

Tests cover flight directions, boost, braking, steering, safe/failed/fuel-starved landing, frame-rate stability, gravity, ground and boulder collision, proximity, early return, duplicate rewards, full mission flow, pause, saving/loading, replay and demo reachability. Native browser-control tools were unavailable during development, so full visual inspection and manual mouse/game-feel testing still require a desktop-browser run. Rendering performance and mouse capture depend on browser and GPU.
