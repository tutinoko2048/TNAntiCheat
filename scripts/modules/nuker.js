import { Player, Location } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

export function nukerFlag(player) {
  if (!config.nuker.state || Util.isOP(player)) return;
  const { location, breakCount = 0 } = player;
  if (breakCount > config.nuker.limit) {
    const { x, y, z } = Util.vectorNicely(player.location);
    Util.flag(player, 'Nuker', config.nuker.punishment, `Nukerの使用を検知しました [${x}, ${y}, ${z}] (§c${breakCount}blocks/tick§r)`);
  }
}

/** @param {BlockBreakEvent} ev */
export function nukerBreak(ev) {
  const { brokenBlockPermutation, block, player } = ev;
  
  player.breakCount ??= 0;
  player.breakCount++
  
  if (!config.nuker.state && Util.isOP(player)) return;
  if (player.breakCount > config.nuker.limit) {
    const { x, y, z } = block;
    setTimeout(() => {
      const items = block.dimension.getEntities({
        location: new Location(x, y, z),
        maxDistance: 1.5,
        type: 'minecraft:item'
      });
      for (const i of items) i.kill();
      
      if (config.nuker.place) block.setPermutation(brokenBlockPermutation);
    }, 1); // 1tick delay
    return true; // illegal destruction -> return true
  }
}