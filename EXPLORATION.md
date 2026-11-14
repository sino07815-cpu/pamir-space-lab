# Beyond Earth — larger worlds and historic expeditions

Run `npm run dev` from this folder. Dependencies are installed locally; a global Vite installation is unnecessary.

## Journey from Earth

Choose **BEGIN ON EARTH** on the menu. A brand-new **START GAME** also starts at the Earth spaceport; existing campaigns resume normally. Walk using WASD, turn with mouse or arrow keys, run with Shift, jump with Space. Approach ODYSSEY's rear access point and press E, or click **BOARD & LAUNCH** with the pointer released. A twelve-second guided ascent takes you into Earth orbit. This is a fictional spaceport and educational ascent, not an orbital flight simulator.

In orbit select Moon or Mars and choose **TRAVEL**. Planet sizes and orbital separations render at twelve times their previous size relative to the ship. Guided transfers use a distance-dependent cruising speed, making departure and approach visible rather than an instant hop. Navigation coordinates and existing saves are preserved. Astronomical scale and travel times remain compressed for play; planetary diameter ratios now follow the listed mean diameters (see PLANETS.md). Third-person ship and interior sizes remain unchanged.

Near Mars choose **ENTER MARS ORBIT**, then **INITIATE LANDING**. Near the Moon choose **LAND**. Guidance assists descent; toggle it off for manual Space thrust and WASD lateral corrections. After a safe touchdown press E to exit. The existing samples, missions, rover, station and base systems remain available.

Earth can be revisited: select Earth, travel there, then choose **LAND** within the approach range. The guided return takes eight seconds and places you back at the spaceport. Jupiter and Saturn are gas giants with no solid walking surface, so they support orbital surveys rather than ground exploration.

## Historic equipment

Follow amber historic-site labels after landing. Approach within six metres and press **F** to document the spacecraft. Each discovery gives 60 science points once, persists locally and appears in Mission Control's **Traces of earlier explorers** archive. The equipment is preserved in the world rather than collected or driven.

| World | Reconstruction | Local sector position | Actual region |
|---|---|---|---|
| Moon | Apollo 11 Eagle descent stage (1969) | −25, −20 | Mare Tranquillitatis |
| Moon | Apollo 17 Lunar Roving Vehicle (1972) | 28, 28 | Taurus–Littrow |
| Mars | Opportunity rover (2004–2018) | −36, −24 | Perseverance Valley, Meridiani Planum |
| Mars | Ingenuity helicopter (2021–2024) | 37, −34 | Valinor Hills, Jezero crater |

These are procedural educational reconstructions. The real sites are separated by large distances; the game's local research sectors deliberately place reconstructions within walking distance. They are not claimed to be accurate maps or exact engineering models. The landing site of Apollo 11 contains the descent stage, not the upper ascent stage.

NASA sources: [Apollo 11 remains and astronaut trails](https://science.nasa.gov/resource/apollo-11-landing-site/), [Apollo 17 site imagery](https://svs.gsfc.nasa.gov/4302/), [Opportunity mission](https://science.nasa.gov/mission/mer-opportunity/), [Ingenuity's final airfield](https://science.nasa.gov/resource/perseverance-spots-ingenuity-at-its-final-airfield/).

## Checks

`npm test` includes a new Earth/heritage suite for launch gating, approach ranges, one-time rewards, site collisions, saved discoveries, presentation restoration and scaled orbital coordinates. `npm run build` checks TypeScript and produces the Vite bundle. Visual and frame-rate testing on the presentation laptop remains necessary.

Spaceport and historic spacecraft models are procedural. Planetary orbit maps now use locally bundled licensed imagery, described in PLANETS.md; the game works offline after loading. No paid assets, accounts or APIs are required.
