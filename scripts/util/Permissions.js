import config from '../config.js';
import { events } from '../events.js';
import { encode } from './secret';

/** @typedef {import('@minecraft/server').Player} Player */

/**
 * Do not edit this! This is used in op tag and as key in config.
 * @enum {'admin' | 'builder' | 'ban'} 
 */
export const PermissionType = /** @type {const} */ ({
  Admin: 'admin',
  Builder: 'builder',
  Ban: 'ban'
});

export class Permissions {
  /**
   * @param {Player} player
   * @param {PermissionType} permission
   */
  static add(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.addTag(this.getTagString(player, permission));

    events.playerPermissionAdd.emit({ player, permission });
  }
  
  /**
   * @param {Player} player
   * @param {PermissionType} permission
   */
  static remove(player, permission) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    player.removeTag(this.getTagString(player, permission));

    events.playerPermissionRemove.emit({ player, permission });
  }
  
  /**
   * @param {Player} player 
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
   * @param {Player} player 
   * @param {PermissionType} permission 
   * @param {boolean} value 
   */
  static set(player, permission, value) {
    if (!this.isValid(permission)) throw new Error(`Received unknown permission: ${permission}`);
    value ? this.add(player, permission) : this.remove(player, permission);
  }
  
  /**
   * @param {Player} player 
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
  
  /**
   * @returns {PermissionType[]}
   */
  static list() {
    return Object.values(PermissionType);
  }
}