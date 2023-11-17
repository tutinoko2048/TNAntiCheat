import { world, system, Player, GameMode } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import config from '../config.js';
import { PermissionType, Permissions } from './Permissions';
import { BanManager } from './BanManager.js';
import { Duration } from '../lib/duration/main.js';

const overworld = world.getDimension('overworld');

/** @enum {'ban'|'kick'|'tempkick'|'notify'|'none'} */
export const PunishmentType = /** @type {const} */ ({
  ban: 'ban',
  kick: 'kick',
  tempkick: 'tempkick',
  notify: 'notify',
  none: 'none'
});

/** @typedef {import('@minecraft/server').Entity} Entity */
/** @typedef {import('@minecraft/server').Vector3} Vector3 */

export class Util {
  /**
   *
   * @param {Player} player
   * @param {string} type
   * @param {PunishmentType} punishment
   * @param {string} message
   * @param {boolean} [notifyCreative]
   */
  static flag(player, type, punishment, message, notifyCreative) {
    if (notifyCreative && Util.isCreative(player)) punishment = PunishmentType.notify;
    const reasons = [
      `§7Type: §c${type}§r`,
      `§7Punishment: §c${punishment}§r`,
      `§l§6>>§r ${message}`
    ];
    
    let shouldNotify = true;
    switch (punishment) {
      case PunishmentType.ban:
        Util.ban(player, message, type);
        break;
      case PunishmentType.kick:
        Util.kick(player, reasons.join('\n'));
        break;
      case PunishmentType.tempkick:
        Util.disconnect(player);
        break;
      case PunishmentType.notify:
        reasons.splice(1, 1); // punishmentの行削除(見やすくするため)
        break;
      case PunishmentType.none:
        shouldNotify = false;
        break;
      default:
        throw new Error(`Received unexpected punishment type: ${punishment}`);
    }
    if (shouldNotify) {
      const output = `§lFlagged §r${this.safeString(player.name, 25)}§r | ${reasons.join('\n')}`;
      Util.notify(output);
      if (config.logger.console) console.warn(`[§aTNAC§r] ${output}`);
      
      Util.writeLog({ playerName: player.name, playerId: player.id, type, punishment, message });
    }
  }
  
  /**
   * @param {Player} player
   * @param {string} reason
   * @param {string} [type]
   * @returns {boolean}
   */
  static ban(player, reason, type) {
    if (Util.isHost(player)) {
      console.error('ban failed: cannot ban owner');
      resetCount(player);
      return false;
    }
    return BanManager.ban(player, {
      reason: type,
      message: `${type ? `§7Type: §c${type}§r\n` : ''}§7Reason: §r${reason}§r`
    });
  }

  /**
   * @param {Player} player
   * @param {string} reason
   * @returns {boolean}
   */
  static kick(player, reason, ban = false) {
    if (Util.isHost(player)) {
      console.error('kick failed: cannot kick owner');
      resetCount(player);
      return false;
    }
    
    const success = BanManager.kick(player, reason, ban);
    if (!success) Util.notify('Kickに失敗したため強制退出させました');
    return success;
  }
  
  /** @param {Player} player */
  static disconnect(player) {
    if (Util.isHost(player)) {
      console.error('disconnect failed: cannot disconnect owner');
      resetCount(player);
      return;
    }
    player.triggerEvent('tn:kick');
  }
  
  /**
   * @arg {string} message
   * @arg {Player} [target]
   */
  static notify(message, target) {
    const result = Util.decorate(message);
    if (target instanceof Player) {
      target.sendMessage(result);
    } else {
      config.logger.sendws
        ? overworld.runCommandAsync(`say "${result}"`)
        : world.sendMessage(result);
      
      if (config.logger.emitScriptEvent !== '') {
        overworld.runCommandAsync(`scriptevent ${config.logger.emitScriptEvent} ${JSON.stringify(result)}`);
      }
    }
  }
  
  /**
   * @arg {string} message
   * @returns {string}
   */
  static decorate(message) {
    const name = config.logger.shortName ? 'TN-AC' : 'TN-AntiCheat';
    return `[§l§a${name}§r] ${message}`;
  }
  
  /** @param {Player} player */
  static isOP(player) {
    return (
      player?.typeId === 'minecraft:player' &&
      (player.isOp() || config.others.fixBDS) &&
      Permissions.has(player, PermissionType.Admin)
    );
  }
  
  /** @param {Player} player */
  static isHost(player) {
    return player.id === '-206158430207';
  }
    
  /**
   * @arg {import('../types').ActionLog} content
   * @arg {Player} [player]
   */
  static writeLog(content, player) {
    world.logs ??= [];
    if (world.logs.length >= config.logger.maxLogs) world.logs.shift();
    
    content.createdAt ??= Date.now();
    if (player) { // Playerが投げられたら補完する
      content.playerName ??= player.name;
      content.playerId ??= player.id;
    }
    world.logs.push(content);
  }
  
  static safeString(str, length) {
    return str.length > length ? `${str.slice(0, length)}...` : str;
  }
  
  /**
   * @param {string} str 
   * @param {boolean} [noquote] 
   * @returns {string[]}
   */
  static splitNicely(str, noquote = true) {
    const split = str.split(/(?<!['"]\w+) +(?!\w+['"])/);
    return noquote ? split.map(x => x.replace(/^"(.*)"$/g, '$1')) : split;
  }
  
  /**
   * @param {string} str
   * @param {Player} [source]
   */
  static parsePlayerName(str, source) {
    if (!str) return;
    if (str === '@s' && source instanceof Player) return source.name;
    if (str.startsWith('@')) str = str.slice(1);
    return str.replace(/"(.*)"/, '$1');
  }
    
  /** @param {number[]} numbers */
  static median(numbers) {
    const half = (numbers.length / 2) | 0;
    const arr = numbers.slice().sort((a,b) =>  a - b);
    return (arr.length % 2 ? arr[half] : (arr[half-1] + arr[half]) / 2) || 0;
  }
  
  /** @param {number[]} numbers */
  static average(numbers) {
    return (numbers.reduce((a,b) => a + b, 0) / numbers.length) || 0;
  }
    
  /**
   * @param {Player} player
   * @returns {GameMode|undefined}
   */
  static getGameMode(player) {
    for (const key in GameMode) {
      if (player.matches({ gameMode: GameMode[key] })) return GameMode[key];
    }
  }
  
  /** @param {Player} player */
  static isSurvival(player) {
    return player.matches({ gameMode: GameMode.survival });
  }
  
  /** @param {Player} player */
  static isCreative(player) {
    return player.matches({ gameMode: GameMode.creative });
  }
  
  /** @param {Player} player */
  static isAdventure(player) {
    return player.matches({ gameMode: GameMode.adventure });
  }
  
  /** @param {Player} player */
  static isSpectator(player) {
    return player.matches({ gameMode: GameMode.spectator });
  }
  
  static cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * 
   * @param {number} timestamp 
   * @param {boolean} [long] include years
   * @returns {string}
   */
  static getTime(timestamp = Date.now(), long = false) {
    const offset = config.others.timezoneOffset;
    const d = new Date(timestamp + ((new Date().getTimezoneOffset() + (offset * 60)) * 60 * 1000));
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth()+1)).slice(-2);
    const date = ('0' + d.getDate()).slice(-2);
    const hour = ('0' + d.getHours()).slice(-2);
    const minute = ('0' + d.getMinutes()).slice(-2);
    const second = ('0' + d.getSeconds()).slice(-2);
    return `${long ? `${year}/` : ''}${month}/${date} ${hour}:${minute}:${second}`;
  }
  
  static parseMS(ms) {
    const time = ms / 1000;
    const sec = time % 60;
    const min = Math.floor(time / 60) % 60;
    const hour = Math.floor(time / 3600);

    return `${hour}時間 ${min}分 ${Math.floor(sec)}秒`
  }
  
  /** @typedef {import('../lib/form/ActionForm').ActionForm} CustomActionForm */
  /**
   * Thanks: https://discord.com/channels/950040604186931351/954636266614439986/1035305927655559300
   * @author aikayu1op.js
   * @template {UI.ActionFormData | UI.MessageFormData | UI.ModalFormData | CustomActionForm} Form
   * @param {Player} player
   * @param {Form} form
   * @returns {Promise<Awaited<ReturnType<Form["show"]>>>}
   */
  static showFormToBusy(player, form) {
    player.sendMessage(`§7[Form] チャットを閉じると表示されます`);
    return new Promise(res => {
      system.run(async function run() {
        const response = await /** @type {ReturnType<Form['show']>} */ (form.show(player));
        const { canceled, cancelationReason: reason } = response;
        if (canceled && reason === UI.FormCancelationReason.UserBusy) return system.run(run);
        res(response);
      });
    });
  }
  
  static hideString(str) {
    return str.replace(/(.)/g, '§$1');
  }
  
  /**
   * @param {string} playerName
   * @returns {Player|undefined}
   */
  static getPlayerByName(playerName) {
    const [ player ] = world.getPlayers({ name: playerName });
    return player ?? world.getPlayers().find(p => p.name.toLowerCase() === playerName.toLowerCase());
  }
  
  /**
   * @param {Vector3} vec
   * @returns {Vector3}
   */
  static vectorNicely(vec) {
    return { x: Math.floor(vec.x), y: Math.floor(vec.y), z: Math.floor(vec.z) };
  }

  /**
   * @param {Entity|string} target
   * @param {string} objective
   * @param {boolean} [useZero]
   * @returns {number|null}
   */
  static getScore(target, objective, useZero) {
    try {
      return world.scoreboard.getObjective(objective).getScore(target) ?? (useZero ? 0 : null);
    } catch {
      return useZero ? 0 : null;
    }
  }
  
  /** @param {Player} player */
  static showActionBar(player, ...text) {
    const msg = text instanceof Array ? text.map(x => String(x)).join(', ') : String(text);
    player.onScreenDisplay.setActionBar(msg);
  }
  
  /**
   * @param {string} command A command to execute
   * @param {Entity|import('@minecraft/server').Dimension} source
   * @returns {boolean} Whether command has successfully executed, false is error
   */
  static runCommandSafe(command, source) {
    try {
      const { successCount } = source.runCommand(command);
      const success = successCount > 0;
      if (!success && config.others.debug) console.error('[CommandResult] successCount:', successCount);
      return success;
    } catch (e) {
      if (config.others.debug) console.error(`[CommandError] ${e}\n${e.stack}`);
      return false;
    }
  }
  
  /**
   * @param {number} ticks
   * @returns {Promise<void>}
   */
  static sleep(ticks = 0) {
    return new Promise(res => system.runTimeout(res, ticks));
  }
  
  /**
   * イベントをキャンセルしつつ遅延をかける用
   * @arg {{ cancel?: boolean }} eventData
   */
  static async cancel(eventData) {
    eventData.cancel = true;
  }

  /** @param {number} duration */
  static formatDuration(duration) {
    return Duration.format(duration, false);
  }
}
/** @arg {Player} player */
function resetCount(player) {
  player.speedACount = 0;
  player.flyACount = 0;
  player.placeBCount = 0;
  player.autoClickerCount = 0;
}
