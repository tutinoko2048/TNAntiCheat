import { system } from '@minecraft/server';

const deltaTimes = [];
let lastTickAt;
system.runInterval(() => {
  if (!lastTickAt) {
    lastTickAt = Date.now();
	return;
  }
  const now = Date.now();
  const delta = now - lastTickAt;
  if (deltaTimes.length > 20) deltaTimes.shift();
  deltaTimes.push(delta);
  lastTickAt = now;
});

export function getTPS() {
  const ticks = deltaTimes.map(d => 1000 / d);
  const tps = (ticks.reduce((a, b) => a + b, 0) / ticks.length) || 0;
  return Math.min(tps, 20);
}