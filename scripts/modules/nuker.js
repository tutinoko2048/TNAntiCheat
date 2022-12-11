import { system, Player, Location } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

export function nukerFlag(player) {
  if (!config.nuker.state || Util.isOP(player)) return;
  const { location, breakCount = 0 } = player;
  if (breakCount > config.nuker.limit) {
    const { x, y, z } = Util.vectorNicely(player.location);
    Util.flag(player, 'Nuker', config.nuker.punishment, `Nukerの使用を検知しました (§c${breakCount}blocks/tick§r) §7[${x}, ${y}, ${z}]`);
  }
}

/** @param {BlockBreakEvent} ev */
export function nukerBreak(ev) {
  const { brokenBlockPermutation, block, player } = ev;
  if (!config.nuker.state || Util.isOP(player)) return;
  
  player.breakCount ??= 0;
  player.breakCount++
  
  if (player.breakCount > config.nuker.limit) {
    system.run(() => {
      killDroppedItem(block.location, block.dimension);
      if (config.nuker.place) block.setPermutation(brokenBlockPermutation);
    }); // 1tick delay
    return true; // illegal destruction -> return true
  }
}

/** @param {BlockBreakEvent} ev */
export function instaBreak(ev) {
  const { block, player, brokenBlockPermutation } = ev;
  if (!config.instaBreak.state || Util.isCreative(player) || Util.isOP(player)) return;
  
  if (config.instaBreak.detect.includes(block.typeId)) {
    system.run(() => {
      killDroppedItem(block.location, block.dimension);
      if (config.instaBreak.place) block.setPermutation(brokenBlockPermutation);
    }); // 1tick delay
    Util.flag(player, 'InstaBreak', config.instaBreak.punishment, `InstaBreakの使用を検知しました (§c${block.typeId}§r) §7[${block.x}, ${block.y}, ${block.z}]`);
    return true;
  }
}

function killDroppedItem(loc, dimension) {
  const items = dimension.getEntities({
    location: new Location(loc.x, loc.y, loc.z),
    maxDistance: 1.5,
    type: 'minecraft:item'
  });
  for (const i of items) i.kill();
}