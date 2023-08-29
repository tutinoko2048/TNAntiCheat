import { Util } from '../util/util';
import config from '../config.js';

/** @param {import('@minecraft/server').Player} player */
export function nukerFlag(player) {
  if (!config.nuker.state || Util.isOP(player)) return;
  const { location, breakCount = 0 } = player;
  if (breakCount > config.nuker.limit) {
    const { x, y, z } = Util.vectorNicely(location);
    Util.flag(player, 'Nuker', config.nuker.punishment, `Nukerの使用を検知しました (§c${breakCount}blocks/tick§r) §7[${x}, ${y}, ${z}]`);
  }
}

/** @param {import('@minecraft/server').PlayerBreakBlockBeforeEvent} ev */
export function nukerBreak(ev) {
  const { player } = ev;
  if (!config.nuker.state || Util.isOP(player)) return;
  
  player.breakCount ??= 0;
  player.breakCount++
  
  if (player.breakCount > config.nuker.limit) {
    if (config.nuker.cancel) ev.cancel = true;
    return true; // illegal destruction -> return true
  }
}

/** @param {import('@minecraft/server').PlayerBreakBlockBeforeEvent} ev */
export function instaBreak(ev) {
  const { block, player } = ev;
  if (!config.instaBreak.state || Util.isCreative(player) || Util.isOP(player)) return;
  
  if (config.instaBreak.detect.includes(block.typeId)) {
    if (config.instaBreak.cancel) ev.cancel = true;
    
    Util.flag(player, 'InstaBreak', config.instaBreak.punishment, `InstaBreakの使用を検知しました (§c${block.typeId}§r) §7[${block.x}, ${block.y}, ${block.z}]`);
    return true;
  }
}