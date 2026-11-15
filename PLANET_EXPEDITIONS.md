# Solar System expeditions

Open **SOLAR SYSTEM MISSIONS** on the menu or in Mission Control. All eight planets and the Moon have mission cards connected to actual progress. Set a destination, close the panel, use Travel and brake on arrival.

## Existing crewed destinations

- Earth: launch-campus gameplay and the orbital Earth survey.
- Mars: the existing Red Horizon descent, astronaut, three geological samples, outcrop and return loop.
- Moon: the existing lunar descent, astronaut, low-gravity exploration, samples and return loop.

## New robotic surface missions

Mercury — **Terminator Frontier** — and Venus — **Beneath the Veil** — use fictional robotic landers and remotely driven explorers. They do not put an unprotected astronaut on either extreme surface.

1. Approach within 18 navigation units, cancel transfer and brake below 0.8 u/s.
2. Hold **F** continuously for three seconds to calibrate the survey. Releasing or moving outside the operating envelope resets this hold.
3. Select **Deploy Robotic Lander**. Guidance controls descent by default. Toggle manual control to use Space thrust and WASD lateral steering.
4. A safe touchdown requires the existing landing envelope: vertical speed ≤3 m/s, horizontal speed ≤1.5 m/s, pad error ≤6 m, stability ≥65% and fuel remaining. A hard landing fails; return to orbit and redeploy to retry.
5. Press **E** or **Deploy / Rejoin Rover** after landing. Drive with WASD, boost with Shift, brake with Space, turn the camera with mouse/arrows and switch camera with C.
6. Analyze targets A/B/C with **E** within three metres. Target labels indicate completion; duplicate analysis gives no points.
7. Return to the lander uplink, six metres behind its touchdown position, and press E with all three data sets to complete the mission.

Mercury has airless, sharply lit grey terrain, procedural impact depressions, regolith rocks and an uneven crater rim. Venus has warm atmospheric haze, volcanic rock coloration and fractured relief. Rover movement follows terrain height and resolves collisions with rocks, the lander zone and the map boundary. Energy drains during operation; Return to Orbit is available as recovery if the rover exhausts its battery.

Survey + landing + three targets + returned data award **560 research points per robotic world**, separately from the original one-time planetary survey reward. Re-visiting a completed world does not duplicate these rewards. Ending a remote session early retains collected data; a new visit begins with another descent. Active descent/driving is not persisted across reloads; mission records are retained.

## New giant-world missions

| Destination | Mission | Instrument inspiration |
| --- | --- | --- |
| Jupiter | Storm Atlas | Juno radiometry |
| Saturn | Rings of Discovery | Cassini imaging |
| Uranus | Tilted Horizons | Voyager magnetometry |
| Neptune | Deep Blue Signal | Voyager imaging |

These worlds have no solid surface for astronaut landings. The sequence is a continuous three-second stable **F** survey, **Deploy Instrument Probe**, ten simulated seconds of stable reception, then a continuous three-second **E** transmission. The probe is visible as a moving procedural instrument carrier. Losing the range/speed envelope aborts reception without awarding probe completion; redeploy to retry. E is reserved for the uplink while a research packet is ready so the same key does not ascend the spacecraft during transmission.

Each giant-world mission awards **420 research points** (80 survey + 140 measurements + 200 transmitted packet), once. The flight HUD shows progress and failed-link explanations. Probe reception and holds pause with the game, dashboards and terminals.

## References and asset provenance

The surface hardware models are original procedural interpretations with thermal cladding, camera lenses, solar panels, wheels, antenna masts, dishes and landing feet. They are not intact historical spacecraft or geographically located relics. The Venus target is explicitly labelled a pressure-instrument **replica**.

For Jupiter in MEDIUM/HIGH graphics, the game additionally loads the **official NASA VTAD Juno GLB**, bundled locally from NASA's resource page. LOW graphics and loading/failure states use procedural geometry. See [model source and usage attribution](public/models/ATTRIBUTION.md). This is a visual replica for a fictional instrument carrier, not a claim that the player launches the real Juno mission. The GLB has embedded textures and does not require a remote decoder.

- [Mercury facts](https://science.nasa.gov/mercury/facts/) and [MESSENGER](https://science.nasa.gov/mission/messenger/).
- [Venus facts](https://science.nasa.gov/venus/venus-facts/) and the [NASA/NSSDC Venus mission catalog](https://nssdc.gsfc.nasa.gov/planetary/planets/venuspage.html).
- [Juno](https://science.nasa.gov/mission/juno/), [Cassini](https://science.nasa.gov/mission/cassini/), [Uranus](https://science.nasa.gov/uranus/facts/) and [Neptune](https://science.nasa.gov/neptune/facts/).
- [NASA's Solar System overview](https://science.nasa.gov/solar-system/solar-system-facts/) distinguishes rocky planets and giant planets.

The original locally bundled planet maps retain their [CC BY 4.0 attribution](public/textures/ATTRIBUTION.md). New geometry and materials require no network service. Terrain is fictional and not a NASA elevation model. Probe data, descent aerodynamics, heat shielding, energy rates and travel distances are simplified gameplay; the missions do not reproduce real engineering procedures or live telemetry. The rendered materials are stylized procedural 3D, not photorealistic scans.

## Saving, reset and verification

New research records use `pamir-planet-research-v1`; the existing main score and history update with earned rewards. The settings **Reset Progress** action also clears this research ledger. The protected presentation cannot award or reset these new research points. Existing Mars/Moon progression and demo behavior remain unchanged.

`npm test` includes `check-planet-expeditions.mjs`: all nine mission definitions; full survey/probe/uplink loops on the four giants; full safe descent/three-target/return loops on Mercury and Venus; 2,800 unique research points across those six worlds; duplicate protection, invalid range/speed, hold interruption, lost probe link, collision, persistence and protected-demo guards. The same suite validates the official Juno GLB, its embedded resources and attribution. All 15 suites passed, and TypeScript/production bundling passed.

`node scripts/qa-planet-expeditions.mjs` passed in an isolated Chrome profile: actual F input, lander/rover buttons, real W driving on Mercury and Venus, return to orbit, Jupiter probe deployment, loaded/rendered official Juno geometry in MEDIUM graphics, E uplink without unintended spacecraft ascent and all nine mission cards. No runtime exceptions were captured. Arrival and safe-touchdown fixtures were used for these browser checks; the model tests cover the complete descent and research-return loops. This is not a claim of a complete manual playthrough, photorealism or measured laptop frame rate. Captured views and machine-readable results are in the ignored `artifacts/planet-expeditions/` folder.
