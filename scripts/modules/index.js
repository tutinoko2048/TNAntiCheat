import { world, Location } from '@minecraft/server';
import { Util } from '../util/util';
import { Permissions } from '../util/Permissions';
import config from '../config.js';

export * from './item_check';
export * from './spammer';
export * from './place_check';
export * from './entity_check';
export * from './combat';
export * from './nuker';

export function flag(player) { // don't run every tick not to spam
  if (player.attackReachFlag) {
    Util.flag(player, 'AttackReach', config.reach.punishment, player.attackReachFlag);
    player.attackReachFlag = null;
  }
  if (player.blockReachFlag) {
    Util.flag(player, 'BlockReach', config.reach.punishment, player.blockReachFlag);
    player.blockReachFlag = null;
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
      .map(e => `§c${e.item ? `${e.item}§f (item)` : e.typeId}§r §7[${e.x}, ${e.y}, ${e.z}] ${e.count > 1 ? `§6x${e.count}` : ''}§r`)
      .join('\n');
    if (entityCheck.length > 3) msg += `\n§amore ${entityCheck.length - 3} entities...`;
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
  if (!Util.isCreative(player) || Util.isOP(player) || Permissions.has(player, 'builder')) return;
  await player.runCommandAsync(`gamemode ${config.creative.defaultGamemode} @s`);
  Util.flag(player, 'Creative', config.creative.punishment, 'クリエイティブは許可されていません');
}