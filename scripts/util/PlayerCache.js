import { world } from '@minecraft/server';

export class PlayerCache extends Map {
  constructor(defaultValue) {
    super();
    this.defaultValue = defaultValue;
  }

  get(key) {
    let value = super.get(key);
    if (value === undefined && this.defaultValue !== undefined) {
      value = typeof this.defaultValue === 'function' ? this.defaultValue() : this.defaultValue;
      this.set(key, value);
    }
    return value;
  }
}

const caches = new Set();

export function createPlayerCache(defaultValue) {
  const cache = new PlayerCache(defaultValue);
  caches.add(cache);
  return cache;
}

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  for (const cache of caches) {
    cache.delete(playerId);
  }
});