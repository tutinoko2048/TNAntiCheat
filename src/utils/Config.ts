import { general } from '@/config/general';
import { module } from '@/config/module';
import { GeneralConfig, ModuleConfig } from '@/types';
import { DynamicProperty, DynamicPropertyTypeMap } from './DynamicProperty';

const cache = {
  general,
  module
} as const;

class Config {
  public isLoaded: boolean = false;

  load() {
    loadConfig('generalConfig', cache.general);
    loadConfig('moduleConfig', cache.module);
    this.isLoaded = true;
  }

  get general(): GeneralConfig {
    if (!this.isLoaded) console.error('Config is not loaded');
    return cache.general;
  }

  get module(): ModuleConfig {
    if (!this.isLoaded) console.error('Config is not loaded');
    return cache.module;
  }
}

export const config = new Config();

function loadConfig(key: keyof DynamicPropertyTypeMap, target: typeof cache[keyof typeof cache]) {
  const rawData = DynamicProperty.get(undefined, key) ?? '{}';
  try {
    const data = JSON.parse(rawData);
    deepAssign(target, data);
  } catch {
    console.error(`Failed to load config: ${key}`);
  }
}

/** オブジェクトはassign, 別の型or配列はそのまま上書き */
function deepAssign(target: any, source: any) {
  for (const key in source) {
    if (
      source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      target[key] ??= {};
      deepAssign(target[key], source[key]);
      
    } else {
      target[key] = source[key];
    }
  }
}
