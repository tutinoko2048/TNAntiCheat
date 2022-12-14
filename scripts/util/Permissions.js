import config from '../config.js';
import { Util } from './util';
import { encode } from './secret';

const PERMISSIONS = [
  'admin',
  'builder',
  'ban'
]

export class Permissions {
  
  static add(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.addTag(this.getTagString(player, permission));
  }
  
  static remove(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.removeTag(this.getTagString(player, permission));
  }
  
  static has(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    return player.hasTag(this.getTagString(player, permission))
      || config.permission[permission].players?.includes(player.name)
      || config.permission[permission].ids?.includes(player.id)
  }
  
  static set(player, permission, value) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    value ? this.add(player, permission) : this.remove(player, permission);
  }
  
  static getTagString(player, permission) {
    return config.permission[permission].encrypt
      ? `ac:§k${encode(permission+player.id)}`
      : config.permission[permission].tag;
  }
  
  static isValid(permission) {
    return PERMISSIONS.includes(permission);
  }
  
  static list() {
    return PERMISSIONS;
  }
}