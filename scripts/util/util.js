import { world, system, Player, GameMode } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import config from '../config.js';
import { properties } from './constants';
import { Permissions } from './Permissions';

const overworld = world.getDimension('overworld');

export class Util {

  /**
   *
   * @param {Player} player
   * @param {string} type
   * @param {string} punishment
   * @param {string} message
   * @param {boolean} [notifyCreative]
   */
  static flag(player, type, punishment, message, notifyCreative) {
    if (notifyCreative && Util.isCreative(player)) punishment = 'notify';
    const reasons = [
      `§7Type: §c${type}§r`,
      `§7Punishment: §c${punishment}§r`,
      `§l§6>>§r ${message}`
    ];
    
    let showNotify = true;
    switch (punishment) {
      case 'ban':
        Util.ban(player, message, type);
        break;
      case 'kick':
        Util.kick(player, reasons.join('\n'));
        break;
      case 'tempkick':
        Util.disconnect(player);
        break;
      case 'notify':
        reasons.splice(1, 1);
        break;
      case 'none':
        showNotify = false;
        break;
      default:
        throw new Error(`Received unexpected punishment type: ${punishment}`);
    }
    if (showNotify) {
      const output = `§lFlagged §r${this.safeString(player.name, 25)}§r | ${reasons.join('\n')}`;
      Util.notify(output);
      if (config.logger.console) console.warn(`[§aTNAC§r] ${output}`);
    }
  }
  
  /**
   * @param {Player} player
   * @param {string} reason
   * @returns {boolean}
   */
  static ban(player, reason, type) {
    if (Util.isOwner(player)) {
      console.warn('ban failed: cannot ban owner');
      return false;
    }
    player.setDynamicProperty(properties.ban, true);
    type && player.setDynamicProperty(properties.banReason, type);
    return this.kick(player, `${type ? `§7Type: §c${type}§r\n` : ''}§7Reason: §r${reason}§r`, true);
  }

  /**
   * @param {Player} player
   * @param {string} reason
   * @returns {boolean}
   */
  static kick(player, reason, ban = false) {
    if (Util.isOwner(player)) {
      console.warn('kick failed: cannot kick owner');
      return false;
    }
    const res = Util.runCommandSafe(
      `kick "${player.name}" §l${ban ? '§cBanned§r' : 'Kicked'} by TN-AntiCheat§r\n${reason}`,
      overworld
    );
    if (res) {
      return true;
    } else {
      player.triggerEvent('tn:kick');
      Util.notify('Kickに失敗したため強制退出させました');
      return false;
    }
  }
  
  /** @param {Player} player */
  static disconnect(player) {
    if (Util.isOwner(player)) return console.warn('discinnect failed: cannot disconnect owner');
    player.triggerEvent('tn:kick');
  }
  
  /** @param {Player} [target] */
  static notify(message, target) {
    const name = config.others.shortName ? 'TN-AC' : 'TN-AntiCheat';
    if (target instanceof Player) {
      target.sendMessage(`[§l§a${name}§r] ${message}`);
    } else {
      config.others.sendws
        ? overworld.runCommand(`say "[§l§aTN-AntiCheat§r] ${message}"`)
        : world.sendMessage(`[§l§a${name}§r] ${message}`);
    }
  }
  
  /** @param {Player} player */
  static unban(player) {
    try {
      if (player.hasTag(config.permission.ban.tag)) player.removeTag(config.permission.ban.tag);
      player.removeDynamicProperty(properties.ban);
      player.removeDynamicProperty(properties.banReason);
    } catch {}
  }
  
  /** @param {Player} player */
  static isBanned(player) {
    return Permissions.has(player, 'ban') || player.getDynamicProperty(properties.ban);
  }
  
  /** @param {Player} player */
  static isOP(player) {
    return (
      player?.typeId === 'minecraft:player' &&
      (player.isOp() || config.others.fixBDS) &&
      Permissions.has(player, 'admin')
    );
  }
  
  /** @param {Player} player */
  static isHost(player) {
    return player.id === '-4294967295';
  }
  
  /** @param {Player} player */
  static isOwner(player) {
    return world.getDynamicProperty(properties.ownerId) === player.id;
  }
        
  static safeString(str, length) {
    return str.length > length ? `${str.slice(0,length)}...` : str;
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
  
  static parsePlayerName(str) {
    if (!str) return;
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
   * プレイヤーのゲームモードを取得します。ゲームモードが取得できない場合はundefinedが返ります。
   * Thanks: https://discord.com/channels/950040604186931351/969011166443626506/1030299392697184346
   * @param {Player} player
   * @returns {GameMode|undefined}
   */
  static getGamemode(player) {
    for (const gamemodeName in GameMode) {
      if (world.getPlayers({ name: player.name, gameMode: GameMode[gamemodeName] }).length > 0) {
        return GameMode[gamemodeName];
      }
    }
  }
  
  /** @param {Player} player */
  static isSurvival(player) {
    return this.getGamemode(player) === GameMode.survival;
  }
  
  /** @param {Player} player */
  static isCreative(player) {
    return this.getGamemode(player) === GameMode.creative;
  }
  
  /** @param {Player} player */
  static isAdventure(player) {
    return this.getGamemode(player) === GameMode.adventure;
  }
  
  /** @param {Player} player */
  static isSpectator(player) {
    return this.getGamemode(player) === GameMode.spectator;
  }
  
  static cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  static getTime(now) {
    const d = now ? new Date(now) : new Date();
    const month = ('0' + (d.getMonth()+1)).slice(-2);
    const date = ('0' + d.getDate()).slice(-2);
    const hour = ('0' + d.getHours()).slice(-2);
    const minute = ('0' + d.getMinutes()).slice(-2);
    const second = ('0' + d.getSeconds()).slice(-2);
    return `${month}/${date} ${hour}:${minute}:${second}`;
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
    player.sendMessage(`§7[AdminPanel] チャットを閉じると表示されます`);
    return new Promise(res => {
      system.run(async function run() {
        const response = await /** @type {ReturnType<Form["show"]>} */ (form.show(player));
        const { canceled, cancelationReason: reason } = response;
        if (canceled && reason === UI.FormCancelationReason.userBusy) return system.run(run);
        res(response);
      });
    });
  }
  
  static hideString(str) {
    return str.replace(/(.)/g, '§$1');
  }
  
  /**
   * @param {string} playerName
   * @param {boolean} [expect=false]
   * @returns {Player}
   */
  static getPlayerByName(playerName, expect = false) {
    const [ player ] = world.getPlayers({ name: playerName });
    if (player || !expect) return player;
    return world.getAllPlayers().find(p => p.name.includes(playerName) || p.name.toLowerCase().includes(playerName.toLowerCase()));
  }
  
  /**
   * @param {import('@minecraft/server').Vector3} vec
   * @returns {import('@minecraft/server').Vector3}
   */
  static vectorNicely(vec) {
    return { x: Math.floor(vec.x), y: Math.floor(vec.y), z: Math.floor(vec.z) };
  }

  /**
   *
   * @param {import('@minecraft/server').Entity|string} target
   * @param {string} obj
   * @returns {number|null}
   */
  static getScore(target, obj) {
    try {
      return (typeof target === 'string')
        ? world.scoreboard.getObjective(obj).getScores().find(({ participant }) => participant.displayName === target).score
        : world.scoreboard.getObjective(obj).getScore(target.scoreboardIdentity);
    } catch {
      return null;
    }
  }
  
  /** @param {Player} player */
  static showActionBar(player, ...text) {
    const msg = text instanceof Array ? text.map(x => String(x)).join(', ') : String(text);
    player.onScreenDisplay.setActionBar(msg);
  }
  
  /**
   * @param {string} command A command to execute
   * @param {import('@minecraft/server').Entity|import('@minecraft/server').Dimension} source
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
}
