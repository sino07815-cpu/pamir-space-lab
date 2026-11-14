# Realistic Solar System visuals

The game now includes all eight planets — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune — plus the Moon. Every destination can be selected and surveyed, with one 100-point reward per world. Existing campaign progress and Mars/Moon surface missions are preserved.

## What changed

- Twelve locally bundled 2K maps replace the former procedural orbit textures: nine world maps, Earth clouds and night lights, and Saturn's transparent rings.
- Earth has actual continental geography, oceans, snow and ice, an independently rotating cloud layer, less-rough ocean reflections, illuminated cities on the night side and a sunlit atmospheric rim.
- Mercury and the Moon show mapped crater patterns. Mars shows geographic features and polar ice. The relief effect is subtle shading derived from the colour image; it is not an accurate elevation model.
- Jupiter and Saturn use mapped cloud belts. Saturn has textured rings with transparency and an approximate planet shadow. Uranus has a strongly tilted axis and faint rings. Neptune's map is desaturated slightly to reduce its processed-image appearance.
- Sphere radii follow the listed mean diameter ratios with Earth = 6 navigation units. Axis tilts, approximate polar flattening and relative rotation rates differ by world. Rotation is accelerated for presentation.
- Outer giants are much farther away, preventing them from dominating the sky near Earth. Transfer guidance adjusts cruise speed with distance, so outer-world trips remain playable. Stars follow the viewpoint as a distant background.
- Maps preload once and remain available while switching previews; a compact loading indicator reports pending or failed maps.
- Navigation includes all nine worlds in Solar System order. Scroll the destination strip to reach the outer planets. Mission Control now counts surveys out of nine.

## Launch

Run `npm run dev`, then open the printed local URL. Select a planet on the menu to preview it. Start on Earth, launch, select a destination and use **TRAVEL**. Press **F** within the survey range. Existing landing controls remain available for Earth, Mars and the Moon. Adding Mercury, Venus and the ice giants adds orbital exploration; it does not add new walkable surfaces there.

## Attribution and scientific limits

Maps: [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Full file attribution is in [public/textures/ATTRIBUTION.md](public/textures/ATTRIBUTION.md), and credits are available in the in-game help. All maps are bundled for offline play after loading; no paid service or live API is used.

The provider combines NASA imagery and elevation data with adjusted colours and reconstructed gaps. Clouds, city lights and gas-giant weather are illustrative composites rather than live views. This is an educational artistic rendering, not a current astronomical observation. Navigation distances are compressed, positions are fixed for gameplay, and flight/landing physics remain simplified. The model is not an ephemeris or a 1:1 Solar System.

Reference pages for the additional worlds: [NASA Mercury facts](https://science.nasa.gov/mercury/facts/), [Venus facts](https://science.nasa.gov/venus/venus-facts/), [Uranus facts](https://science.nasa.gov/uranus/facts/), [Neptune facts](https://science.nasa.gov/neptune/neptune-facts/).

## Verification

`npm test` includes all earlier gameplay tests plus a new planet suite: nine surveys, duplicate protection, image file signatures and dimensions, size ratios, separated bodies, bounded transfer arrivals and attribution. `npm run build` runs TypeScript and packages the maps.

The optional `scripts/qa-planets.mjs` drives an isolated headless Chrome through CDP, clicks each destination, checks runtime/shader and asset errors, and saves actual rendered screenshots in `artifacts/planets`. It expects Vite at 127.0.0.1:5174 and a separate test Chrome at debugging port 9333; it closes that test browser afterward. These are rendering smoke checks, not a frame-rate benchmark.
