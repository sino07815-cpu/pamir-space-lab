# Judge presentation — 3 to 5 minutes

## Before entering the room

Use the same laptop, browser and charger planned for the presentation. Enable hardware acceleration, close unrelated tabs, and test sound by clicking the audio button. Choose MEDIUM; use LOW if rendering is slow. Download the repository and dependencies before travelling. Internet is unnecessary after installation when running the game locally.

Start a reliable production preview:

```powershell
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173/. Keep that terminal running. Test **Judge Briefing → Start Protected Presentation** once before judging. Keep this preview tab open as the offline fallback. Local and hosted URLs have separate saves.

## Suggested English pitch

**0:00 — The problem (20 seconds)**

“Space science is often presented as facts to memorize. PAMIR SPACE LAB lets learners make decisions and see their consequences: how to land safely, investigate a surface and return with scientific evidence.”

**0:20 — The approach (20 seconds)**

“This browser-based 3D exploration game combines flight, landings, astronaut movement and research missions. NASA educational sources are linked in our science archive. Distances and physics are simplified and clearly identified.”

**0:40 — Show the game (2–3 minutes)**

Choose the protected presentation. Narrate the active objective rather than listing every feature:

1. Earth orbit and Gateway: show range, alignment and docking speed.
2. EVA: explain the repair task, oxygen gauge and safe return.
3. Mars: show altitude, descent speed, fuel and touchdown. A checkpoint compresses travel, not mission rewards.
4. Surface science: show sample collection, unique rewards and laboratory analysis.
5. Results: show completed objectives and explain that the normal save is preserved.

The model test takes about 146 simulated seconds; real presentation duration depends on frame rate and pauses. If time runs short, use the labelled Mars time-compression control. Be clear that this skips the station section and does not award its badge.

**3:30 — Evidence and impact (30 seconds)**

“We built actual gameplay state transitions, proximity checks, landing failure conditions and persistent missions. The repository includes automated tests and a reproducible build. Our next validation step is learner testing: can participants explain landing trade-offs and the purpose of sample analysis after playing?”

Do not claim measured learning gains, operational aerospace accuracy, NASA endorsement or live satellite telemetry. Connect the project to the exact official challenge your team selected in its submission.

## Матни кӯтоҳи тоҷикӣ

«PAMIR SPACE LAB омӯзиши кайҳонро ба таҷрибаи интерактивӣ табдил медиҳад. Бозингар киштиро идора мекунад, ба Миррих менишинад, намунаҳои геологӣ ҷамъ мекунад ва онҳоро таҳлил мекунад. Қарорҳои ӯ ба муваффақияти миссия таъсир мерасонанд. Мо манбаъҳои илмиро нишон медиҳем ва маҳдудиятҳои симулятсияро равшан мегӯем. Бозӣ дар браузер кор мекунад ва барои истифода API-и пулакӣ ё аккаунт намехоҳад.»

## Recovery during the presentation

- **Esc:** pause and release the mouse. Resume through the pause dialog.
- **M:** Mission Control. Close it to resume simulation time.
- **H:** controls. Close it before continuing.
- **Reset Demo:** restarts the protected presentation; it does not erase the normal save.
- **Restore Save / End:** returns to the normal save and menu.
- If the browser slows down, select LOW in Systems and avoid repeatedly reloading.
- If the hosted demo or internet fails, switch to the already-open local production preview.
- If WebGL is unavailable, use another hardware-accelerated browser. The app displays a graphics error rather than a working 3D scene in that case.
