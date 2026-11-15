# Lunar exploration visual update

The approved image is a visual direction; the game implements it as real interactive Three.js geometry and materials, rather than displaying an AI-generated backdrop.

- A small textured Earth is placed far beyond the local highlands. Its placement and game distances are artistic, not an ephemeris calculation.
- Procedural bowl-and-rim craters, continuous distant ridges and granular regolith replace the flat plane and repeated cone mountains. The same height function drives rendering, ground detection, rocks and research-site placement. The safe landing area remains level.
- The existing reusable upper stage has a lunar-only brushed-metal treatment, articulated-looking fixed landing struts, footpads, ladder and engine effects. Feet are positioned on the local surface. The astronaut is hidden during descent.
- Low-angle directional sunlight, actual cast/received shadows and a dark-sky/gray-ground reflection environment improve contact and metal readability. There is no atmospheric fog on the Moon.
- The existing orange cosmonaut gains a darker lunar visor and rectangular life-support backpack. A bounded 96-print instanced trail follows grounded walking. No effect changes mission scoring.
- Compact survey, suit, context and descent displays replace the oversized lunar overlays. Research resources, deployment, mission briefings and graphics remain available through Field Systems, with Missions/Systems shortcuts retained on desktop. Keyboard and touch controls remain shared.

All new terrain/materials are generated locally; Earth uses the already credited bundled Solar System Scope map. Apollo heritage models and geographic compression notices are retained. The scene is an educational artistic reconstruction, not a lunar DEM, an engineering model or a claim of a real SK-1 lunar suit.

## Checks

`npm test` has 18 suites. They include the full physical Moon landing/walking/sample/return loop, persistence, duplicate rewards and the new flat-pad, crater-slope, shared-height, highland-seam and distant-Earth checks. TypeScript and production builds pass.

`node --experimental-strip-types scripts/qa-lunar.mjs` checks the actual production build under a GitHub Pages-style subpath. It uses isolated saved-game fixtures for desktop EVA/descent and phone sample collection; it does not modify normal player saves. It checks walking, manual fuel use, sample rewards and duplicate protection, compact panels, touch-control bounds, mission access and runtime exceptions. Actual renderer screenshots and a result report go to ignored `artifacts/lunar/`. Set `PAMIR_GAME_URL` to run it against the deployed site instead.

LOW uses about 29,000 main/distant ground triangles and a 1024-pixel sun shadow map; higher quality adds terrain subdivisions and a 2048-pixel map. Rocks and boot tracks are instanced. Actual physical-phone frame rates remain device-dependent and have not been benchmarked.
