import config from '../config.js';
import { Util } from './util.js';
import { world } from '@minecraft/server';
import { properties } from './constants.js';

const data = {
  config,
}

const defaultConfig = Util.cloneObject(config);

export class DataManager {
  /**
   * @arg {string} path
   * @returns {any} 
   */
  static getByPath(path) {
    const [ type, ...paths ] = path.split('.');
    return paths.reduce((k,v) => k[v], data[type]);
  }
  
  /**
   * @arg {string} path
   * @arg {any} value
   */
  static setByPath(path, value) {
    const [ type, ...paths ] = path.split('.');
    const key = paths.pop();
    const res =  paths.reduce((k,v) => {
      if (!isObject(k[v])) k[v] = {}
      return k[v]
    }, data[type]);
    res[key] = value;
  }
  
  /**
   * deep assign
   * @arg {any} target
   * @arg {any} source
   * @returns {any}
   */
  static patch(target, source) {
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        target[key] ??= {};
        DataManager.patch(target[key], source[key]);
      }
      else target[key] = source[key];
    }
    return target;
  }
  
  /**
   * @arg {string} moduleName
   * @arg {any} newData
   */
  static update(moduleName, newData) {
    const configData = DataManager.fetch();
    
    configData[moduleName] = DataManager.patch(configData[moduleName] ?? {}, newData);
    DataManager.save(configData);
  }
  
  /** @arg {string} moduleName */
  static reset(moduleName) {
    Object.assign(config[moduleName], defaultConfig[moduleName]);
    const configData = DataManager.fetch();
    delete configData[moduleName];
    DataManager.save(configData);
  }
  
  static resetAll() {
    Object.assign(config, defaultConfig);
    DataManager.save({});
  }
  
  static fetch() {
    return JSON.parse(world.getDynamicProperty(properties.configData) ?? '{}');
  }
  
  /** @arg {any} data */
  static save(data) {
    setWorldProperty(properties.configData, JSON.stringify(data));
  }
}

/**
 * @arg {object} item
 * @returns {boolean}
 */
function isObject (item) {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}

/**
 * data: 書き換え側, defaultData: 参照側
 * @arg {any} data
 * @arg {any} defaultData
 */
export function deleteDupe(data, defaultData) {
  const log = [];
  for (const key of Object.keys(data)) {
    if (isObject(data[key]) && isObject(defaultData[key])) { // 新しいobjectができてるかも確認
      log.push(...deleteDupe(data[key], defaultData[key]));
      if (Object.keys(data[key]).length === 0) {
        if (delete data[key]) log.push(key);
      }
      
    } else {
      let isChanged = (typeof data[key] === 'object')
        ? JSON.stringify(data[key]) !== JSON.stringify(defaultData[key])
        : data[key] !== defaultData[key];
        
      if (!isChanged) {
        if (delete data[key]) log.push(key);
      }
    }
  }
  return log;
}

/**
 * @arg {string} key
 * @arg {string|number|boolean} value
 */
export function setWorldProperty(key, value) {
  try {
    world.setDynamicProperty(key, value);
  } catch (e) {
    Util.notify(`§cSetError: ${e}`);
    console.error(e);
  }
}