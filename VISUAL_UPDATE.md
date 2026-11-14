# Cosmonaut and launch complex update

The existing game now uses an original procedural cosmonaut inspired by Yuri Gagarin's orange SK-1 flight suit, a modern stainless-steel reusable launch vehicle inspired by Starship/Super Heavy, and a more detailed fictional PAMIR spaceport.

Use WASD to walk, Shift to run, mouse to look, Space to jump, V or VIEW COSMONAUT for the portrait camera, C for first person, and E near the boarding access to launch. The spawn is approximately 53 metres from the access. Ignition, service-arm release, smoke and ascent lead to the existing orbital game. Existing Mars, Moon, station and science systems remain.

The character is a stylized procedural tribute, not a photoreal scan of Gagarin. The historic SK-1 was a flight pressure suit; its use for planetary EVA here is a fictional gameplay adaptation. Vehicle proportions and flight time are simplified. Building exteriors have collision; they are scenery, not newly playable interiors.

References: Smithsonian https://airandspace.si.edu/albums/yuri-gagarin-training-spacesuit ; SpaceX https://new.spacex.com/vehicles/starship ; NASA reference imagery https://ntrs.nasa.gov/api/citations/20240011013/downloads/Artemis%20Status%202024%20240826.pdf . The SpaceX page returned error 522 during Chrome research. No reference photography is embedded in the new models; geometry and material textures are generated locally.

Verification: all 12 npm test suites and the TypeScript/Vite production build passed offline. Chrome screenshots of the campus and character are in artifacts/spaceport. The interrupted automated browser run does not establish that its entire walking/launch sequence passed. Core walking, collision, boarding guards and orbital transition passed the local simulation tests.

Launch with npm run dev using installed dependencies. New models require no paid API or internet connection.
