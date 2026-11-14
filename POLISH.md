# Expedition polish

The existing flight, surface missions, presentation mode and visual design remain in place.

- Mission Assist gives contextual instructions from Earth boarding through Mars landing, sample collection and return. Its actions use existing gameplay guards and mission methods.
- M opens/closes Mission Control. H opens/closes the flight guide. These shortcuts do not operate while paused or inside another operations panel.
- Science notifications show actual newly earned points.
- Earth walking and launch/landing now feed the existing generated audio system. Enable audio with the footer sound button; browser permission still applies.
- Adaptive rendering reduces pixel resolution after sustained low frame rate and restores it after sustained recovery. It leaves menu resolution and manual graphics presets available. This is a performance aid, not a measured FPS guarantee.

## Launch

Run `npm run dev` in this folder and open the local address printed by Vite. Use Mission Assist for the next objective, or the existing presentation mode for a guided demo.

## Verification

All 13 automated gameplay suites passed, including proximity-gated boarding, transfer guidance, Mars landing/EVA/sample/return instructions and lunar exit guidance. After resolving a Windows filename-case collision, the guidance suite passed again and `npm run build` passed TypeScript and production bundling.

The production bundle still reports Vite's large-chunk advisory. Browser visual review and a complete manual playthrough of these latest additions have not been performed; the automated tests do not establish visual quality or laptop performance.
