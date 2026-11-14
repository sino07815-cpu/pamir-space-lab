# Alpine launch complex

The Earth campus now follows the supplied mountain-spaceport reference with original procedural 3D scenery: snow-capped ridges, a pine forest, a winding river, translucent cloud sprites, warm directional lighting, facade seams, roof ventilation equipment, road markings and foreground planting. This is a fictional landscape inspired by Pamir, not a geographic reconstruction or a photorealistic match to the reference.

Choose **BEGIN ON EARTH** to enter the wide campus view. Click **EXPLORE CAMPUS** to resume walking. **B** toggles the overview; **V** selects the cosmonaut portrait. Existing WASD, mouse, jump and proximity-gated boarding remain available in walking mode. The overview is a live 3D camera, not a background image, and hides nonessential flight overlays.

The production build and TypeScript checks passed. Spaceport physics tests passed for walking, collisions, boarding proximity, pad height, ignition, ascent and orbital return. Headless Chrome visual testing was attempted but did not finish reliably on this machine; the test browser was closed. Visual matching, B/camera transitions and frame rate still need an interactive browser check. The optional local script is `scripts/qa-pamir-scenery.mjs` (Vite 5175, isolated Chrome CDP 9335).

No new packages, paid assets, or network services are required. The original Solar System, mission logic and saved progress are retained.
