# Interface languages

On first launch, the game presents **Тоҷикӣ**, **Русский** and **English**. Choose one to enter the game. The language icon in the top header opens the same selector later, including on a phone. The original English interface is retained.

The selector remembers the choice in `pamir-language-v1` in the current browser. It does not modify mission saves, sample identifiers, points, achievements, audio settings or graphics settings. A different browser/device has its own preference. Clearing browser storage removes the preference. If browser storage is blocked, switching still works for the current session.

While the selector is open, player input and mission time stop. Keyboard bindings remain **WASD**, **E**, **C**, **Space**, etc., as labelled in the help panel. Use the physical keys indicated, regardless of the selected interface language.

## Translation scope

The menus, mission dashboard, nine planetary mission briefings/objectives, landing telemetry, astronaut/rover prompts, results, controls, settings, sound mixer, scientific archive and notices use Tajik/Russian presentation catalogs. Brand names, mission hardware names, reference URLs, sample letters and physical keyboard keycaps retain their original spelling. Scientific data and the educational-simulation limitations are translated; optional external reference pages remain in their source language.

`src/locales/` holds English-source/Tajik/Russian phrase tuples. `src/translations.ts` handles whitespace, uppercase labels and dynamic placeholders. `LText` translates React text leaves without changing the DOM structure or game identifiers. `tr` handles accessible names and composed display labels. Unknown text falls back to English. Add translations whenever adding a new UI phrase.

## Verification

`npm test` includes catalog-shape/placeholder validation, translation of every planetary mission definition and science record, dynamic counts/units, English preservation, corrupt/blocked preference storage and unchanged mission-save checks.

After `npm run build`, run `node --experimental-strip-types scripts/qa-locales.mjs` on Windows with Chrome installed. It serves the production bundle at a GitHub Pages-style subpath in an isolated profile, exercises actual mouse/keyboard/touch interactions, and saves screenshots/check results to ignored `artifacts/locales/`. It tests first-run choice, switching, persistence, dashboard text, input/time blocking, desktop walking, phone portrait/landscape and a real lunar sample collection from a saved-game fixture. This is browser emulation, not a physical-device performance test.
