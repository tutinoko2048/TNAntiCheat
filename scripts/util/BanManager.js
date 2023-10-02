import { world } from '@minecraft/server';
import { PropertyIds } from './constants'
import config from '../config';
import { PermissionType, Permissions } from './Permissions';
import unbanQueue from '../unban_queue.js';

/** @typedef {import('@minecraft/server').Player} Player */
/** @typedef {import('../types').UnbanQueueEntry} UnbanQueueEntry */

const overworld = world.getDimension('overworld');

export class BanManager {
  /**
   * @param {Player} player 
   * @param {string} [reason] 
   * @param {boolean} [ban] 
   * @returns {boolean} kickに成功したかどうか
   */
  static kick(player, reason, ban) {
    const { successCount } = overworld.runCommand(`kick "${player.name}" §l${ban ? '§cBanned§r' : 'Kicked'} by TN-AntiCheat§r\n${reason ?? ''}`);
    const success = successCount > 0;
    if (!success) player.triggerEvent('tn:kick');
    return success;
  }

  /**
   * @param {Player} player 
   * @param {import('../types').BanOptions} options
   * @returns {boolean} kickに成功したかどうか
   */
  static ban(player, options) {
    player.setDynamicProperty(PropertyIds.ban, true);
    if (options.reason) {
      player.setDynamicProperty(PropertyIds.banReason, options.reason);
    }
    
    if (options.expireAt !== undefined) {
      player.setDynamicProperty(PropertyIds.banExpireAt, options.expireAt);
    }
    
    return BanManager.kick(player, options.message ?? options.reason, true);
  }

  /** @param {Player} player */
  static unban(player) {
    player.removeTag(config.permission.ban.tag);
    player.setDynamicProperty(PropertyIds.ban);
    player.setDynamicProperty(PropertyIds.banReason);
    player.setDynamicProperty(PropertyIds.banExpireAt);
    BanManager.removeUnbanQueue(player.name);
  }

  /**
   * @param {Player} player
   * @returns {boolean}
   */
  static isBanned(player) {
    return Permissions.has(player, PermissionType.Ban) || player.getDynamicProperty(PropertyIds.ban);
  }

  /** @returns {UnbanQueueEntry[]} */
  static getUnbanQueue() {
    /** @type {UnbanQueueEntry[]} */
    const queue = unbanQueue.map(name => ({ name, source: 'file' }));
    try {
      /** @type {string[]} */
      const fetched = JSON.parse(world.getDynamicProperty(PropertyIds.unbanQueue) ?? '[]');
      for (const name of fetched) {
        const isInFile = queue.some(entry => entry.name === name);
        if (!isInFile) queue.push({ name, source: 'property' });
      }
    } catch {}
    return queue;
  }

  /**
   * @param {UnbanQueueEntry[]} queue 
   * @returns {UnbanQueueEntry[]}
   */
  static setUnbanQueue(queue) {
    // 重複防止 ファイルに保存されているものは除外
    const _queue = new Set(
      queue.filter(e => e.source === 'property').map(e => e.name)
    );
    world.setDynamicProperty(PropertyIds.unbanQueue, JSON.stringify([..._queue]));
    return queue;
  }

  /**
   * @param {string} playerName 
   * @returns {UnbanQueueEntry[]}
   */
  static addUnbanQueue(playerName) {
    const queue = BanManager.getUnbanQueue();
    queue.push({ name: playerName, source: 'property' });
    return BanManager.setUnbanQueue(queue);
  }

  /**
   * @param {string} playerName 
   * @returns {UnbanQueueEntry[]}
   */
  static removeUnbanQueue(playerName) {
    const queue = BanManager.getUnbanQueue();
    return BanManager.setUnbanQueue(queue.filter(entry => entry.name !== playerName));
  }
}
