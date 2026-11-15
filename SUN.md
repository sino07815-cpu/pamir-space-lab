# Visible Sun

Orbital exploration and the lunar surface now render an emissive-looking procedural solar sphere, moving granulation and a soft corona. A small radial texture is generated locally; no downloaded solar asset, API or postprocessing bloom pass is required.

The orbital directional light, planet day/night effects and visible Sun share `SPACE_SUN_DIRECTION`. The lunar disc, shadow-casting sunlight and reflection highlight share the Moon's local `LUNAR_SUN_DIRECTION`. A modest ambient/hemisphere fill keeps the astronaut readable when looking toward the Sun.

This is a distant camera-relative sky object. It stays within the camera range when travelling to outer planets. Its geometry retains depth testing, so nearer solid objects and terrain can cover it; its halo does not paint over those objects. Space and surface coordinates remain the existing compressed game frames. Apparent size is artistic, especially in orbital view; this is not a date-dependent solar ephemeris or a new navigable/landable destination.

The animation pauses with gameplay. LOW uses fewer sphere subdivisions. The implementation adds a sphere and a sprite and preserves keyboard/touch controls, mission rewards and saves.

`npm run build` checks TypeScript and production compilation. The existing 18 suites remain the gameplay regression checks. `node --experimental-strip-types scripts/qa-sun.mjs` renders private production-build fixtures for orbital cockpit, desktop Moon and phone Moon, capturing screenshots under ignored `artifacts/sun/` and checking runtime / shader errors. It can also target the public site through `PAMIR_GAME_URL`. Physical-phone performance is not benchmarked.
