export class PlayerCache<K, V> extends Map {
  constructor(defaultValue?: V);
  get(key: K): V;
}

export function createPlayerCache<T>(defaultValue?: T): PlayerCache<string, T extends Function ? ReturnType<T> : T>;
