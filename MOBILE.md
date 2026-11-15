# Phone and desktop controls

The same game runs at the same GitHub Pages URL on both device types. It requires WebGL and a browser with Pointer Events. A recent Android Chrome or iPhone Safari is recommended; actual frame rate depends on the device. Landscape provides a wider view, and portrait remains supported. No native app or installation is required.

## Play on a phone

- Drag the left joystick to walk, fly, align a landing or drive a rover. Moving the stick leaves the initial Earth campus overview automatically.
- Swipe an unobstructed part of the 3D world, or the marked LOOK area, to turn the camera / spacecraft.
- Hold THRUST during descent; on foot the same position becomes JUMP. In flight it becomes BRAKE.
- INTERACT boards/exits vehicles, collects nearby samples and opens nearby terminals. Keep REPAIR / USE held for orbital repair, or UP / USE for an orbital research uplink. These actions still require the original proximity and mission checks.
- Hold BOOST / RUN, HOLD SCAN, UP or DOWN as needed. CAMERA switches view. Flight roll and Earth campus/portrait views have touch buttons too.
- Open Mission Control from the header. Pause, sound and help remain in the footer. Menus, catalogs and long panels scroll without steering the game.

Touch controls appear on touch-capable devices. Help includes a manual toggle for hybrid computers and external keyboards. On first touch-mode use, graphics defaults to LOW; you can choose another quality in Graphics & Save Controls. This reduces render cost without changing mission logic. No fixed mobile frame rate is promised.

## Input behavior

Keyboard, joystick and each held button own separate input sources. Releasing one finger does not cancel another finger or a physical key. Buttons use pointer capture, cancellation and unmount cleanup. Pause, menus, hidden tabs and input reset clear gameplay input. The desktop pointer-lock request is restricted to mouse input; touch camera control never requires pointer lock.

Touch uses the existing flight, landing, walking, sample, repair and rover simulation, rather than a second mobile gameplay implementation. Short interior interaction taps are consumed once instead of requiring the finger to remain down until the next telemetry update.

## Verification

`npm test` includes 17 suites. The touch suite checks joystick deadzone/clamping, independent fingers, keyboard coexistence, real flight acceleration/braking/steering, single interaction edges and cancellation/reset.

`node scripts/qa-touch.mjs` is an optional Windows Chrome check using an isolated profile and trusted CDP touch events. It checks 390×844 and 844×390 layouts, actual Earth walking, multi-touch, cancellation, pause, spacecraft acceleration/rotation, camera switching, landing thrust and dashboard access. Its mission state fixtures start scenes directly; it is not a claim of a complete manual mission playthrough. Screenshots and the result report are written to ignored `artifacts/mobile/` only after the relevant steps run. Browser emulation does not certify every physical Android/iOS device.
