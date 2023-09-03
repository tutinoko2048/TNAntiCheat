import config from '../config.js';
import { encode } from './secret';

/** @enum {'Admin' | 'Builder' | 'Ban'} */
export const PermissionType = /** @type {const} */ ({
  Admin: 'Admin',
  Builder: 'Builder',
  Ban: 'Ban'
});

export class Permissions {
  /**
   * @param {import('@minecraft/server').Player} player
   * @param {PermissionType} permission
   */
  static add(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.addTag(this.getTagString(player, permission));
  }
  
  /**
   * @param {import('@minecraft/server').Player} player
   * @param {PermissionType} permission
   */
  static remove(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.removeTag(this.getTagString(player, permission));
  }
  
  /**
   * @param {import('@minecraft/server').Player} player 
   * @param {PermissionType} permission 
   * @returns {boolean}
   */
  static has(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    return player.hasTag(this.getTagString(player, permission))
      || config.permission[permission].players?.includes(player.name)
      || config.permission[permission].ids?.includes(player.id)
  }
  
  /**
   * @param {import('@minecraft/server').Player} player 
   * @param {PermissionType} permission 
   * @param {boolean} value 
   */
  static set(player, permission, value) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    value ? this.add(player, permission) : this.remove(player, permission);
  }
  
  /**
   * @param {import('@minecraft/server').Player} player 
   * @param {PermissionType} permission 
   * @returns {string}
   */
  static getTagString(player, permission) {
    return config.permission[permission].encrypt
      ? `ac:§k${encode(permission+player.id)}`
      : config.permission[permission].tag;
  }
  
  /**
   * @param {string} permission 
   * @returns {permission is PermissionType}
   */
  static isValid(permission) {
    return this.list().some(p => p === permission);
  }
  
  static list() {
    return Object.values(PermissionType);
  }
}