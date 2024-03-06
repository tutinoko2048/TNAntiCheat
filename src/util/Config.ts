import { general } from '@/config/general';
import { GeneralConfig } from '@/types';
import { DynamicProperty, DynamicPropertyTypeMap } from './DynamicProperty';

const cache = {
  general
}

class Config {
  public isLoaded: boolean = false;

  load() {
    loadConfig('generalConfig', cache.general);
    this.isLoaded = true;
  }

  get general(): GeneralConfig {
    if (!this.isLoaded) throw Error('Config is not loaded');
    return cache.general;
  }
}

export const config = new Config();

type Configs = GeneralConfig;
function loadConfig(key: keyof DynamicPropertyTypeMap, target: Configs) {
  const rawData = DynamicProperty.get(undefined, key) ?? '{}';
  try {
    const data = JSON.parse(rawData);
    deepAssign(target, data);
  } catch {
    console.error(`Failed to load config: ${key}`);
  }
}

/** オブジェクトはassign, 配列はそのまま上書き */
function deepAssign(target: any, source: any) {
  for (const key in source) {
    if (
      source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      if (!(key in target)) target[key] = {};
      deepAssign(target[key], source[key]);
      
    } else {
      target[key] = source[key];
    }
  }
}
