import assert from 'node:assert/strict';
import { planets, useGame } from '../src/store.ts';

const state = () => useGame.getState();
state().set({ surface: 'Moon', target: 'Earth', distance: 0 });
state().scan();
assert.equal(state().points, 0, 'Surface EVA must not award remote orbital surveys');
state().set({ surface: null });
state().set({ distance: 19 });
state().scan();
assert.equal(state().points, 0, 'Distant scans must not award science');
for (const planet of planets) {
  state().set({ target: planet.name, distance: 18 });
  state().scan();
  state().scan();
}
assert.equal(state().points, planets.length*100, 'Repeated surveys must not award duplicate points');
assert.equal(state().visited.length, planets.length);
state().set({surface:'Moon'});
for (const world of ['Moon']) {
  for (let i = 0; i < 5; i++) {
    state().collect(`${world}-${i}`);
    state().collect(`${world}-${i}`);
  }
}
assert.equal(state().points, planets.length*100+250, 'Orbital surveys and lunar samples award one reward per world plus lunar samples');
assert.equal(state().samples.length, 5, 'Repeated sample collection must be ignored');
console.log('Mission checks passed: proximity, all nine world surveys, five lunar samples, duplicate protection, 1150-point orbital/lunar expedition.');
