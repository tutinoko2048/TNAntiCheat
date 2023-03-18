import config from '../config.js';
import { Util } from './util';
import { world } from '@minecraft/server';
import { properties } from './constants';

const data = {
  config,
}

const defaultConfig = Util.cloneObject(config);

export class Data {
  static getByPath(path) {
    const [ type, ...paths ] = path.split('.');
    return paths.reduce((k,v) => k[v], data[type]);
  }
  
  static setByPath(path, value) {
    const [ type, ...paths ] = path.split('.');
    const key = paths.pop();
    const res =  paths.reduce((k,v) => {
      if (!isObject(k[v])) k[v] = {}
      return k[v]
    }, data[type]);
    res[key] = value;
  }
  
  // deep assign
  static patch(target, source) {
    for (const key of Object.keys(source)) {
      if (isObject(source[key])) {
        target[key] ??= {};
        Data.patch(target[key], source[key]);
      }
      else target[key] = source[key];
    }
    return target;
  }
  
  static update(moduleName, newData) {
    const configData = Data.fetch();
    
    configData[moduleName] = Data.patch(configData[moduleName] ?? {}, newData);
    Data.save(configData);
  }
  
  static reset(moduleName) {
    Object.assign(config[moduleName], defaultConfig[moduleName]);
    const configData = Data.fetch();
    delete configData[moduleName];
    Data.save(configData);
  }
  
  static resetAll() {
    Object.assign(config, defaultConfig);
    Data.save({});
  }
  
  static fetch() {
    // @ts-ignore
    return JSON.parse(world.getDynamicProperty(properties.configData) ?? '{}');
  }
  
  static save(data) {
    setWorldProperty(properties.configData, JSON.stringify(data));
  }
}

function isObject (item) {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}

// data: 書き換え側, defaultData: 参照側
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

export function setWorldProperty(key, value) {
  try {
    world.setDynamicProperty(key, value);
  } catch (e) {
    Util.notify(`§cSetError: ${e}`);
  }
}