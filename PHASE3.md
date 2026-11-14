# PAMIR SPACE LAB — Phase 3

Phase 3 extends the existing game. The Phase 2 Mars landing, Red Horizon, original menu and mission dashboard, Solar System flight, surveys, samples, cameras, audio and saved progress remain available. No dependencies were added.

## Launch and checks

```powershell
npm run dev
```

Open Vite's Local URL, normally http://127.0.0.1:5173/. Dependencies are already installed in this workspace. For a fresh copy, first run `npm install`. Node.js 22.18+ supports the source-level tests; this workspace uses Node.js 24.

```powershell
npm test
npm run build
npm run preview
```

The production build is in `dist/`. Serve it over HTTP. All runtime geometry, UI, science notes and effects are local; no paid APIs or remote asset downloads are required. Source links are optional external references.

## Recommended presentation

Select **Start Presentation** on the main menu. This is a protected sandbox:

1. Depart Earth orbit and approach PAMIR Gateway under rendezvous guidance.
2. Meet the actual docking envelope and perform a three-second capture.
3. Enter the command-center interior, then begin a tethered spacewalk.
4. Use actual suit movement to reach the relay, hold position during repair, and return to the airlock.
5. Apply clearly labelled time compression to Mars orbit, then run the existing approach and landing physics.
6. Exit ODYSSEY, walk to samples A/B/C, follow the base approach corridor, enter the laboratory through its south door, and complete powered sample analysis.
7. Review demo science, completed missions and achievements.

The shared-model integration test completes this sequence in approximately **145 simulated seconds**, below five minutes. Real duration depends on browser frame rate and pauses. No repair, sample, touchdown or analysis reward is granted by a checkpoint alone.

Presentation controls:

- **Earth / Reset Demo:** restart the sandbox from Earth orbit.
- **Time Compression → Mars:** skip the station section without fabricating its completion badge; begin the real Mars approach/landing.
- **Base Checkpoint:** available only after a successful landing and actual collection of A/B/C; moves to the laboratory entrance.
- **Restore Save / End:** restore normal progress and return to the menu.

Normal Phase 2 saving is suspended during the presentation. The Phase 3 save stores the pre-demo expedition instead of temporary demo state. Closing or reloading during the presentation restores normal saved progress. Ending or resetting the presentation restores its original points, resources, buildings, settings and mission state. The older Phase 2 Judge Demo remains a separate feature and retains its original replay semantics.

## Station docking and interior

In flight near Earth, choose **Rendezvous Assist** in the Gateway card. From farther away, use **PAMIR Gateway · Rendezvous**. Manual approach remains available.

Docking requires all three:

- Distance to collar ≤ **2.5 space units**.
- Forward-axis alignment within approximately **14°**.
- Relative speed ≤ **0.65 units/s**.

The indicator and Dock button reflect those measured conditions. Capture takes three seconds. Then select **Enter Station**, or explore the spacecraft cabin. Return to flight mode and select **Undock** before travelling to another destination.

The station is fictional, not a model of the ISS. A central corridor connects the command center, science laboratory, crew quarters, engineering room and observation deck. Walk toward labelled terminals and press **E**:

- Command center: mission briefing and acceptance.
- Science / observation: locally cached NASA science archive.
- Crew quarters: suit certification, reducing simulated EVA oxygen use by 20%.
- Engineering: restore damaged power, communications, navigation and thruster systems.
- Airlock: begin an orbital spacewalk.
- Docking hatch: return to ODYSSEY's cabin.

Interior walking uses a simplified magnetic-boot model. Room and corridor bounds prevent walking through exterior walls. Close a terminal to resume simulation time.

## Spacewalk

Accept **Orbital Rescue**, dock, and leave through the station airlock. A ship-based EVA is also available while stopped in free flight.

| Control | Orbital EVA |
| --- | --- |
| WASD | Thruster movement relative to view |
| Mouse / click-and-drag / left-right arrows | Look / turn |
| Space | Ascend |
| Ctrl | Descend |
| Shift | Thruster boost, with faster oxygen consumption |
| Hold E near relay | Repair for three seconds |
| E near airlock | Return |
| C | First / third-person camera |
| Esc | Pause and release mouse |

The tether is a visible line and a physical 12-metre movement limit. Oxygen decreases with active EVA time. Warnings appear below 25%. Emergency tether retrieval safely recovers the astronaut but fails an active rescue attempt. Oxygen exhaustion triggers that recovery automatically. Retry through Mission Briefings. Returning before repair does not falsely complete the return objective or grant the rescue reward.

## ODYSSEY interior

Brake below 0.5 units/s, land, or dock; select **Cabin**. Walk to the pilot seat and press E to activate flight controls. Navigation and mission terminals display real state. The navigation computer sets the destination and resolves course/uplink faults; engineering services damaged systems.

Use the aft airlock to enter the station when docked, exit onto a safely landed surface, or begin a ship-based orbital EVA. Pilot activation and airlock exit require proximity to the appropriate terminal. On Mars, sit in the pilot seat to launch back into space. On the Moon, approach the lander before entering its cabin.

## Mars base and construction

After landing, exit and travel east to PAMIR Base. The buildings have labelled south-facing doors; walls are solid. Main locations, in local surface coordinates:

| Building / equipment | Console (x, z) | Function |
| --- | --- | --- |
| Habitat | 38, 14 | Shelter, system inspection and load shedding |
| Laboratory | 53, 14 | Analyze A/B/C for Red Planet Research |
| Rover garage | 38, 30 | Build expansions |
| Oxygen module | 53, 30 | Powered oxygen cycle |
| Storage | 30, 23 | One-time materials cache and energy-to-material fabrication |
| Antenna | 65, 26 | Communications repair |

Approach within three metres and press E or Open Nearby Console. A garage rover, solar arrays, storage containers and oxygen/communications equipment are modeled locally. Camera distance shortens inside buildings. Old saves that coincide with newly added walls are moved to a nearby entrance.

Resources are gameplay units, not physical engineering predictions:

- Solar arrays generate energy. Solar faults stop production; dust storms reduce it.
- Oxygen modules generate oxygen while consuming power.
- Laboratory expansions increase research yielded by a successful analysis.
- Communications expansions increase research awarded on mission completion and consume additional power.
- Construction deducts actual energy, materials and research and is refused when any cost is unaffordable. Each type has three fixed expansion pads.
- Storage provides one 40-material cache, then fabricates 10 materials for 20 energy. Oxygen cycles cost 10 energy for 20 oxygen. Passive production advances only during active play; menus and paused sessions do not accrue offline resources.

Research analysis takes five seconds and uses power. Starting it closes the terminal so time can advance. If power is lost, the mission fails, but samples remain. Repair the power system, retry the mission and repeat analysis. Engineering repairs can restore a minimum reserve to avoid an unrecoverable energy deadlock.

## Mission progression

| Mission | Unlock | Success | Reward | Failure / recovery |
| --- | --- | --- | --- | --- |
| Orbital Rescue | Initially available | Dock, EVA, relay repair, airlock return | 250 science + research/materials + badge | Oxygen exhaustion or emergency abort; retry at a terminal |
| Red Planet Research | Complete Orbital Rescue **or** achieve a saved Mars landing | Land, collect A/B/C, analyze in powered lab | 300 science + research/materials + badge | Analysis power loss; samples retained, repair and retry |
| Lunar Discovery | Complete Red Planet Research | Land, collect regolith, deploy seismometer, return to lander | 250 science + research/materials + badge | Ten-minute active transmission window expires; resupply and retry |

The new missions supplement Red Horizon; their rewards and objectives are distinct. Duplicate completion, repair, collection and deployment rewards are prevented. Mission Control displays actual resources, docking, location, mission states, achievements and history.

For Lunar Discovery, land normally, collect any Moon sample, then reach the research beacon at **(16, −12)**. Deployment costs 10 materials and 10 energy. Return to the lander at **(0, 18)** and interact nearby. The deployed instrument remains visible. Returning early retains the mission but does not fabricate a completed return objective.

## Optional events and graphics

**Systems** offers Low / Medium / High graphics and six explicitly triggered challenges. No random failure is injected into the presentation.

- Low oxygen: return/refill or perform emergency retrieval.
- Solar power fault: production stops; repair through engineering and optionally shed loads.
- Communications interruption: remote uplink/transfer is interrupted; restore it at cabin navigation, engineering or the base antenna.
- Damaged thruster: spacecraft thrust falls to 45%; engineering repair restores it.
- Dust storm: reduced Mars visibility and solar generation for 60 active seconds; seek habitat shelter.
- Navigation error: guidance is suspended; recalibrate at the cabin navigation terminal.

Medium is the default. Low reduces pixel density, stars, planet geometry and terrain resolution. High increases them. Terrain rocks use instancing. There are no new paid or heavy postprocessing dependencies.

**Reset Progress** requires a second confirmation click and intentionally resets both normal save systems. **Reset Demo** restarts only the protected presentation. Use a consistent browser and origin to access the same localStorage saves: `pamir-space-lab-v2` and `pamir-expedition-v3`. Browser storage restrictions or clearing site data can prevent/erase local saves; there is no cloud synchronization.

## Science provenance

`src/science-data.json` is a locally bundled, curated educational snapshot checked on 2026-11-13, with a source URL for each record. It is not a live NASA telemetry feed. It covers Mars/Moon gravity and environment, sampling science, MOXIE and orbital maintenance. Sources are NASA Science, NASA Glenn and NASA's mission/ISS educational pages. Existing planetary facts and Mars education remain.

The game explicitly simplifies distances, orbital stationkeeping, docking, magnetic-boot walking, thrusters, oxygen, tether recovery, base production and atmospheric flight. It does not model full orbital mechanics, real life-support procedures or engineering-grade habitat systems. NASA endorsement is not implied.

## Changed files and verification

New: `expedition.ts`, `expeditionStore.ts`, `ExpeditionWorld.tsx`, `ExpeditionHUD.tsx`, `Base.tsx`, `science-data.json`, `phase3.css`, four Phase 3 test scripts and this guide. Updated: `App.tsx`, `Scene.tsx`, `MarsWorld.tsx`, `MarsHUD.tsx`, `mars.ts`, `flight.ts`, `input.ts`, `store.ts`, `main.tsx`, `package.json`, and README.

Checks cover Phase 2 regression, docking envelope and rendezvous trajectory, room bounds, tether/oxygen, repair and recovery, resource costs/production, lab proximity, mission progression, lunar deployment/return, duplicate protection, failures, protected saves and the complete presentation corridor through a real base doorway. Build/type checks verify the application modules.

The geometry is procedural and interiors are compact modular levels. There is no rover-driving system, multiplayer, cloud save or engineering simulator. Full visual, mouse/game-feel and GPU performance verification still requires a real desktop-browser run when browser-control tools are unavailable; automated physics/state checks do not substitute for that visual review.
