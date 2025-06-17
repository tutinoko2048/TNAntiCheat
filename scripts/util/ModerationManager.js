import { world, Player, InputPermissionCategory } from '@minecraft/server';
import { PropertyIds } from './constants'
import config from '../config';
import { PermissionType, Permissions } from './Permissions';
import unbanQueue from '../unban_queue.js';
import { events } from '../events.js';

/** @typedef {import('../types').UnbanQueueEntry} UnbanQueueEntry */

/** @type {WeakMap<Player, import('@minecraft/server').Vector3>} */
const frozenPlayerMap = new WeakMap();

export class ModerationManager {
  /**
   * @param {Player} player 
   * @param {string} [reason] 
   * @param {boolean} [isBan] 
   * @param {boolean} [force=true] 
   * @returns {boolean} kickに成功したかどうか
   */
  static kick(player, reason = '', isBan, force = true) {
    if (config.others.customKickMessage) reason += ` ${config.others.customKickMessage}`;

    const { successCount } = player.runCommand(
      `kick @s "[TN-AntiCheat] ${reason}"`
    );
    const success = successCount > 0;
    if (!success && force) player.triggerEvent('tn:kick');

    if (!isBan) events.playerKick.emit({ player, reason });
    
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

    const result = ModerationManager.kick(player, options.message || options.reason, true, options.forceKick ?? true);

    events.playerBan.emit({ player, reason: options.reason, expireAt: options.expireAt });

    return result;
  }

  /** @param {Player} player */
  static unban(player) {
    player.removeTag(config.permission.ban.tag);
    player.setDynamicProperty(PropertyIds.ban);
    player.setDynamicProperty(PropertyIds.banReason);
    player.setDynamicProperty(PropertyIds.banExpireAt);
    ModerationManager.removeUnbanQueue(player.name);

    events.playerUnbanSuccess.emit({ player });
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
    const queue = ModerationManager.getUnbanQueue();
    queue.push({ name: playerName, source: 'property' });
    const result = ModerationManager.setUnbanQueue(queue);

    events.playerUnbanAdd.emit({ playerName });

    return result;
  }

  /**
   * @param {string} playerName 
   * @returns {UnbanQueueEntry[]}
   */
  static removeUnbanQueue(playerName) {
    const queue = ModerationManager.getUnbanQueue();
    const result = ModerationManager.setUnbanQueue(queue.filter(entry => entry.name !== playerName));

    events.playerUnbanRemove.emit({ playerName });

    return result;
  }

  /**
   * @param {Player} player
   * @returns {boolean}
   */
  static isMuted(player) {
    return !!player.getDynamicProperty(PropertyIds.mute);
  }

  /** 
   * @param {Player} player
   * @param {boolean} state
   * @param {boolean} [temporary]
   * @returns {boolean}
   */
  static setMuted(player, state, temporary = false) {
    const res = player.runCommand(`ability @s mute ${state}`);
    const success = res.successCount > 0;
    if (!temporary && success) player.setDynamicProperty(PropertyIds.mute, state);

    events.playerMuteUpdate.emit({ player, currentValue: state, isTemporary: temporary });
    
    return success;
  }

  /**
   * @param {Player} player 
   * @returns {boolean}
   */
  static isFrozen(player) {
    return frozenPlayerMap.has(player);
  }

  /**
   * @param {Player} player 
   * @param {boolean} state
   */
  static setFrozen(player, state) {
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, !state); // freeze is true so inputs should be false (disabled)
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, !state);
    
    if (state) {
      frozenPlayerMap.set(player, player.location);
    } else {
      frozenPlayerMap.delete(player);
    }

    events.playerFreezeUpdate.emit({ player, currentValue: state });
  }

  /**
   * @param {Player} player
   * @return {import('@minecraft/server').Vector3 | undefined}
   */
  static getFrozenLocation(player) {
    return frozenPlayerMap.get(player);
  }
}
