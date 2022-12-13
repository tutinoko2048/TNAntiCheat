import { world, Location } from '@minecraft/server';
import { Util } from '../util/util';
import { Permissions } from '../util/Permissions';
import config from '../config.js';
import unbanQueue from '../unban_queue.js';

export * from './item_check';
export * from './spammer';
export * from './place_check';
export * from './entity_check';
export * from './combat';
export * from './nuker';

export function ban(player) {
  if (unbanQueue.includes(player.name) && Util.isBanned(player)) {
    Util.unban(player);
    Util.notify(`§aUnbanned: ${player.name}`);
    return;
  }
  
  if (Util.isBanned(player)) { // ban by DP, tag, name, id
    Util.notify(`Kicked §l§c${player.name}§r\n§7Reason:§r ban`);
    return Util.ban(player);
  }
  
  for (const xuid of config.permission.ban.xuids) { // ban by xuid
    player.runCommandAsync(`kick "${xuid}" §lKicked by TN-AntiCheat§r\nReason: §aBanned by XUID`).then(() => {
      Util.notify(`BANリストに含まれるXUID: §c${xuid} のプレイヤーをキックしました`);
    });
  }
}

export function flag(player) { // don't run every tick not to spam
  if (player.reachAFlag) {
    Util.flag(player, 'Reach/A', config.reachA.punishment, player.reachAFlag);
    player.reachAFlag = null;
  }
  if (player.reachBFlag) {
    Util.flag(player, 'Reach/B', config.reachB.punishment, player.reachBFlag);
    player.reachBFlag = null;
  }
  if (player.reachCFlag) {
    Util.flag(player, 'Reach/C', config.reachC.punishment, player.reachCFlag);
    player.reachCFlag = null;
  }
  if (player.autoClickerFlag) {
    Util.flag(player, 'AutoClicker', config.autoClicker.punishment, player.autoClickerFlag);
    player.autoClickerFlag = null;
  }
}

export function notify() {
  if (Object.keys(world.entityCheck).length > 0) {
    const entityCheck = Object.values(world.entityCheck);
    let msg = entityCheck
      .slice(0, 3)
      .map(e => `- §c${e.item ? `${e.item}§f (item)` : e.typeId}§r §7[${e.x}, ${e.y}, ${e.z}] ${e.count > 1 ? `§6x${e.count}` : ''}§r`)
      .join('\n');
    if (entityCheck.length > 3) msg += `\n§7more ${entityCheck.length - 3} entities...`;
    Util.notify(`禁止エンティティをkillしました\n${msg}`);
    world.entityCheck = {};
  }
}


export function crasher(player) {
  if (!config.crasher.state) return;
  const { x, y, z } = player.location;
  if (Math.abs(x) > 30000000 || Math.abs(y) > 30000000 || Math.abs(z) > 30000000) {
    player.teleport(new Location(0, 255, 0), player.dimension, 0, 0);
    if (Util.isOP(player)) return; // prevent crasher by all players but don't punish OP
    Util.flag(player, 'Crasher', config.crasher.punishment, 'Crasherの使用を検知しました');
  }
}

export function namespoof(player) {
  if (!config.namespoof.state) return;
  if (player.name.length > config.namespoof.maxLength) // 長い名前対策
    Util.flag(player, 'Namespoof', config.namespoof.punishment, `長すぎる名前を検知しました`);
}

export async function creative(player) {
  if (!config.creative.state || Util.isOP(player) || Permissions.has(player, 'builder')) return;
  if (Util.isCreative(player)) {
    await player.runCommandAsync(`gamemode ${config.creative.defaultGamemode} @s`);
    Util.flag(player, 'Creative', config.creative.punishment, 'クリエイティブは許可されていません');
  }
}