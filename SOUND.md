# Expedition soundscape

Sound now unlocks on the first normal Start Game / Begin on Earth / presentation / mission-start click, unless the player explicitly muted it. **ENABLE SOUND** is also visible on the menu. The footer speaker toggles mute; the adjacent mixer icon opens **Sound Settings**. The pause/help panel has a Sound Settings button as well.

The mixer provides master, effects/interface and ambient-music sliders plus eight playable previews. Defaults are 65% master, 85% effects and 25% music. Preferences and explicit mute are saved locally; an unlocked audio context is never persisted. A reload still requires a user gesture. If the browser refuses audio, the starting state times out and offers a manual retry rather than remaining disabled forever.

## Connected sounds

| Gameplay | Sound response |
| --- | --- |
| Manual flight, boost, transfer and landing throttle | Layered engine oscillator and generated rumble, scaled by actual thrust intent / descent throttle |
| Earth launch | Ignition burst and sustained launch thrust |
| Safe touchdown / hard landing | Mechanical impact with confirmation tones / descending failure cue |
| Earth, Mars, Moon and interior walking | Surface-specific generated footfalls, only when movement is reported |
| Jump / return to ground | Suit movement and landing footfall |
| Rover and remote robot driving | Motor pitch and level follow vehicle speed; no astronaut footsteps |
| Boarding, airlocks, docking and undocking | Pressure-hiss and mechanical latch cues |
| New samples and research awards | Short scientific confirmation; duplicate actions do not replay rewards |
| Scanner, probe deployment and received measurements | Sweep, deployment transient and data acknowledgements |
| Repair and laboratory analysis | Confirmation and periodic data chatter during active analysis |
| Mission completion | Original multi-note success cue |
| Low suit oxygen/health, landing fuel, robot battery or active system faults | Alert with an eight-second repeat limit |
| Buttons and navigation | Quiet interface tick |
| Environment and soundtrack | Earth/Mars/Venus ambience, interior ventilation and a quiet original synthesized pad |

Audio uses the current active world and vehicle. A stored remote-robot session does not override a protected presentation elsewhere. Old points and completed missions are baseline state when audio starts; enabling or unmuting does not replay them as new achievements. Engine sound follows thrust rather than inertial coasting. E reserved for a research uplink does not sonify ascent.

Gameplay loops and music fade out during pause, Mission Control, terminals, the mixer and hidden tabs. Interface/test sounds remain available in the mixer. Explicit mute immediately silences the master bus and closes the engine context. No microphone is requested.

## Original generated audio

All effects and the ambient score are synthesized locally with Web Audio oscillators, deterministic filtered noise, envelopes and a compressor. No audio service, API key, downloaded music or third-party sound recording is used. No new runtime dependency is needed. Spaceflight, EVA and remote-robot audio are cockpit/suit/telemetry sonification, not a claim of pressure waves travelling through a vacuum. The soundscape is educational and cinematic, not a NASA engineering recording.

## Verification and media

Release check note: the 16 logic suites and an earlier production build passed. Automated Chrome live-audio and offline-render attempts timed out in this environment; those waveform checks have not passed. Do not treat the generated soundtrack/video as delivered until the output files are verified. Before presenting, click Enable Sound and test the mixer on the actual presentation laptop.

`npm test` includes the audio scene suite, bringing the project to 16 suites. It covers actual thrust selection, footsteps, jump impact, robot/rover distinction, stale-session isolation, event transitions, duplicate/no-replay behavior, pause, alert cooldown and safe preference restoration. The planetary suite also checks collisions against an off-center lander's actual position.

`node scripts/qa-audio.mjs` is the optional Windows/Chrome audio check. It uses trusted native browser input for unlocking, volume and mixer buttons, measures the live Web Audio waveform, verifies master-zero and mute/pause behavior, tests actual walking/flight/robot controls, and renders all 19 cue waveforms through the same synthesizer using OfflineAudioContext. Rendered cues are checked for nonzero RMS and unclipped peaks. Physical speaker volume and subjective sound quality still need checking on the presentation laptop.

Local ignored outputs are written under `artifacts/audio/`: waveform measurements, mixer frames, a 30-second sound-cue WAV and a montage soundtrack. The soundtrack matches the previously recorded cut showcase; it is rendered from the game's synthesizer and is not a claim of an uninterrupted playthrough. Submission video is a separate artifact from the playable build.

## Related fixes

The remote rover collider now follows an off-center touchdown position. The science HUD exposes actual range, velocity and link stability, and its header stays readable against bright giant-planet clouds. Footer controls distinguish Earth departure, remote descent, rover deployment, failure and interior/EVA modes.
