import { world } from '@minecraft/server';

interface KeyValue<T> {
  rawKey: string;
  value: T;
}

export class DynamicDatabase<T extends string | number | boolean | Record<string, any> | any[]> implements Map<string, T> {
  private cache: Map<string, KeyValue<T>> = new Map();

  public isLoaded: boolean = false;

  fetchData(keys?: string[]): void {
    const prefix = this.tableName + ':';
    this.cache.clear();
    keys ??= world.getDynamicPropertyIds();
    for (const rawKey of keys) {
      if (!rawKey.startsWith(prefix)) continue;
      const key = rawKey.slice(prefix.length);
      const value = world.getDynamicProperty(rawKey)!;
      if (typeof value === 'object') {
        console.error(`Failed to load data for key ${key} in table ${this.tableName}:`, 'value is an object');
        continue;
      }
      try {
        this.cache.set(key, { rawKey, value: this.deserializeValue(value) });
      } catch (e) {
        console.error(`Failed to load data for key ${key} in table ${this.tableName}:`, e);
      }
    }
    this.isLoaded = true;
  }

  constructor(public readonly tableName: string) {}

  set(key: string, value: T | undefined): this {
    if (!this.isLoaded) this.fetchData();
    const cacheData = this.cache.get(key);

    // skip if value is not changed
    if (typeof value !== 'object' && cacheData?.value === value) return this;

    if (value === undefined) {
      this.delete(key);
      return this;
    }

    const rawKey = this.createKey(key);
    const serialized = this.serializeValue(value);
    if (typeof serialized === 'string' && serialized.length > 32767)
      throw new RangeError('Value is too long (max 32767 characters)');
    world.setDynamicProperty(rawKey, serialized);

    if (cacheData) {
      cacheData.value = value;
    } else {
      this.cache.set(key, { rawKey, value });
    }
    return this;
  }

  get(key: string): T | undefined {
    if (!this.isLoaded) this.fetchData();
    return this.cache.get(key)?.value;
  }

  delete(key: string): boolean {
    if (!this.isLoaded) this.fetchData();
    const cacheData = this.cache.get(key);
    if (!cacheData) return false;
    world.setDynamicProperty(cacheData.rawKey);
    this.cache.delete(key);
    return true;
  }

  has(key: string): boolean {
    if (!this.isLoaded) this.fetchData();
    return this.cache.has(key);
  }

  clear(): void {
    if (!this.isLoaded) this.fetchData();
    for (const { rawKey } of this.cache.values()) {
      world.setDynamicProperty(rawKey);
    }
    this.cache.clear();
  }

  forEach(callbackfn: (value: T, key: string, db: this) => void): void {
    if (!this.isLoaded) this.fetchData();
    for (const [key, value] of this.entries()) callbackfn(value, key, this);
  }

  keys(): IterableIterator<string> {
    if (!this.isLoaded) this.fetchData();
    return this.cache.keys();
  }

  *values(): IterableIterator<T> {
    if (!this.isLoaded) this.fetchData();
    for (const { value } of this.cache.values()) yield value;
  }

  *entries(): IterableIterator<[string, T]> {
    if (!this.isLoaded) this.fetchData();
    for (const [key, { value }] of this.cache) yield [key, value];
  }

  get size(): number {
    if (!this.isLoaded) this.fetchData();
    return this.cache.size;
  }

  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.entries();
  }

  get [Symbol.toStringTag](): string {
    return this.tableName;
  }

  private createKey(key: string): string {
    return `${this.tableName}:${key}`;
  }

  private serializeValue(value: T): string | number | boolean {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;
    return JSON.stringify(value);
  }

  private deserializeValue(value: string | number | boolean): T {
    if (typeof value === 'string' && value.startsWith('{')) return JSON.parse(value);
    return value as T;
  }
}