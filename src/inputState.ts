// Multiple fingers and a physical keyboard may hold the same control independently.
export const keys = new Set<string>();
const edges = new Set<string>();
const sources = new Map<string, Set<string>>();
export const steering = { x: 0, y: 0 };
export function pressInput(code: string, source: string) {
  const held = sources.get(source) ?? new Set<string>();
  if (held.has(code)) return false;
  const first = !keys.has(code);
  held.add(code); sources.set(source, held); keys.add(code);
  if (first) edges.add(code);
  return first;
}
export function releaseInput(code: string, source: string) {
  const held = sources.get(source); held?.delete(code);
  if (!held?.size) sources.delete(source);
  if (![...sources.values()].some(s => s.has(code))) keys.delete(code);
}
export function releaseInputSources(prefix: string) {
  for (const [source, held] of [...sources]) if (source.startsWith(prefix)) {
    for (const code of [...held]) releaseInput(code, source);
  }
}
export function consume(code: string) { const found = edges.has(code); edges.delete(code); return found; }
export function resetInput() { keys.clear(); edges.clear(); sources.clear(); steering.x = steering.y = 0; }
export function stickInput(dx: number, dy: number, radius = 42) {
  const length = Math.hypot(dx, dy), scale = length > radius ? radius / length : 1;
  const x = dx * scale, y = dy * scale, codes: string[] = [];
  if (x > radius * .28) codes.push('KeyD'); if (x < -radius * .28) codes.push('KeyA');
  if (y > radius * .28) codes.push('KeyS'); if (y < -radius * .28) codes.push('KeyW');
  return { x, y, codes };
}
