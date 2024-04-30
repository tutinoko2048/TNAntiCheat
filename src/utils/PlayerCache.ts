import { world } from '@minecraft/server';

const caches = new Set<Record<string, any>>();

export function createCache<T>(): Record<string, T> {
  const cache = {};
  caches.add(cache);
  return cache;
}

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  caches.forEach(cache => delete cache[playerId]);
});