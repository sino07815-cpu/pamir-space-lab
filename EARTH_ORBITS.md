# Earth orbit — 2026 reference missions

This update adds moving procedural spacecraft around Earth and fixes PAMIR Gateway's oversized, apparently attached appearance.

## Explore

1. Run `npm run dev` and open the printed URL.
2. Start on Earth, approach ODYSSEY and press E to launch. Resume a saved orbital flight normally.
3. Click **EARTH ORBIT · 2026** below the flight heading.
4. Select ISS, Hubble, Landsat 9 or Sentinel-6B. The inspection camera follows the moving craft while your ship remains in place. Drag/capture the mouse or use left/right arrows to rotate the view; use the distance slider to zoom.
5. **SHOW ORBIT PATHS** toggles orbital guides. **RETURN TO SHIP** restores normal flight controls. Escape pauses and exits inspection.

Inspection is a virtual educational camera, not spacecraft travel or docking with these real missions. It awards no points or objectives and does not move your ship. Mission clocks and resource systems continue unless the game is paused. A soft inspection light helps reveal model structure.

## Objects

| Model | Reference orbit altitude | Purpose/source |
|---|---|---|
| International Space Station | approximately 400 km | [NASA: inhabited research laboratory](https://www.nasa.gov/international-space-station/) |
| Hubble Space Telescope | approximately 500 km, changing over time | [NASA: Hubble observatory](https://science.nasa.gov/mission/hubble/observatory/) |
| Landsat 9 | nominal 705 km | [NASA/USGS Earth observation](https://science.nasa.gov/mission/landsat-9/) |
| Copernicus Sentinel-6B | nominal 1,336 km | [NASA/ESA-partner ocean-altimetry mission](https://science.nasa.gov/mission/sentinel-6b/), [ESA: launched November 2025](https://www.esa.int/media/sentinel-6b-is-launched) |

There are also sixteen instanced miniature craft: six representative navigation satellites and ten representative communications satellites. These are examples of orbital populations, not named individual satellites or a claim about actual constellation counts.

The reference missions were checked against official sources for the 2026 setting. This is not a complete catalog of everything orbiting Earth. Positions are simulated circular orbits with illustrative phases and nodes; there are no live TLEs, current satellite coordinates, telemetry APIs or real-time mission-status feeds. Orbit periods use nominal altitudes and a simple two-body formula, accelerated sixty times per simulation second. Rendering clearances and model sizes are enlarged for visibility. Models are recognizable procedural approximations rather than exact engineering replicas.

## Gateway fix and saves

PAMIR Gateway remains a fictional playable docking outpost, separate from the ISS. Its orbital-view model now uses 0.09 of its previous linear scale, compensating for the planetary rendering enlargement. Its docking collar moved from navigation position `(14, 3, 10)` to `(22, 5, 16)`, creating a much clearer gap above Earth. The rendezvous guide, undocking point, repair target and labels use the updated shared coordinates.

Close EVA retains the original inspection scale so the repair mission stays playable. Version-1 expedition saves migrate to version 2: station-origin EVA anchors and suit positions move together, preserving their relative separation; ship-origin EVA anchors remain unchanged. Resources, completed objectives and points are retained. Protected Phase 3 presentation saves remain separate.

## Checks

`npm test` includes the existing ten suites and a new Earth-orbit suite: closed moving trajectories, radius bounds and Earth clearance, station size/separation, reachable docking and repair, and one-time save migration. The complete presentation route remains playable with the updated rendezvous coordinates.

`scripts/qa-earth-orbits.mjs` is an optional Chrome/CDP check against an isolated test server at port 5174 and browser at 9333. It opens the real catalog, toggles guides, inspects all four spacecraft, checks that movement input cannot move the ship during inspection, returns to flight and captures the separated Gateway. Screenshots go to `artifacts/earth-orbits`. It closes its test browser afterward.

All new spacecraft geometry and panel textures are generated locally. No paid assets or APIs are required.
