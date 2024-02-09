import { Util } from '../util/util';
import config from '../config.js';
import { Block } from '@minecraft/server';
import { getTPS } from '../util/tps';

/** @param {import('@minecraft/server').Player} player */
export function nukerFlag(player) {
  if (!config.nuker.state || Util.isOP(player)) return;
  const { location, breakCount = 0 } = player;
  if (breakCount > config.nuker.limit) {
    const { x, y, z } = Util.vectorNicely(location);
    Util.flag(player, 'Nuker', config.nuker.punishment, `Nukerの使用を検知しました (§c${breakCount}blocks/tick§r) §7[${x}, ${y}, ${z}]`);
  }
}

/** @param {Block} block */
function hasContainer(block) {
  const blockIds = [
    'minecraft:barrel',
    'minecraft:blast_furnace',
    'minecraft:chest',
    'minecraft:dispenser',
    'minecraft:dropper',
    'minecraft:furnace',
    'minecraft:hopper',
    'minecraft:smoker',
    'minecraft:trapped_chest'
  ];

  return (
    blockIds.includes(block.typeId) || 
    (block.typeId.endsWith('shulker_box') && block.typeId.startsWith('minecraft:')) || 
    block.getComponent('minecraft:inventory')?.container
  )
}

/** @param {import('@minecraft/server').PlayerBreakBlockBeforeEvent} ev */
export function nukerBreak(ev) {
  const { player, block } = ev;
  if (!config.nuker.state || Util.isOP(player)) return;

  player.breakCount ??= 0;
  player.breakCount++;

  let baseThreshold = config.nuker.limit;
  if (player.breakCount > 1) { // fix threshold based on tps
    baseThreshold = (20 / getTPS()) ** 0.85 * baseThreshold;
  }
  
  if (player.breakCount > baseThreshold) {
    if (config.nuker.cancel) ev.cancel = true;
    return true; // illegal destruction -> return true
  }

  // lower threshold if block can hold items
  if (
    player.breakCount > Math.max(1, baseThreshold ** 0.7) &&
    config.nuker.cancel && 
    hasContainer(block)
  ) {
    ev.cancel = true;
    return true;
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