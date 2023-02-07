import config from '../config.js';
import chatFilter from '../chat_filter.js';
import { Util } from './util';
import { world } from '@minecraft/server';

const data = {
  config,
  filter: chatFilter
}

export class Data {
  static patch(obj, type, ref) {
    ref ??= data[type];
    for (const [k, v] of Object.entries(obj)) {
      if (isObject(ref[k])) Data.patch(obj[k], type, ref[k]);
      else ref[k] = v;
    }
  }
  
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
}

function isObject (item) {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}