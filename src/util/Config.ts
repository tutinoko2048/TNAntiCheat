import { general } from '../config/general';
import { GeneralConfig } from '../types/Config';
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

type Configs = GeneralConfig
function loadConfig(key: keyof DynamicPropertyTypeMap, target: Configs) {
  const rawData = DynamicProperty.get(undefined, key) ?? '{}';
  try {
    const data = JSON.parse(rawData);
    Object.assign(target, data);
  } catch {
    console.error(`Failed to load config: ${key}`);
  }
}

function deepAssign(target: any, source: any) {

}