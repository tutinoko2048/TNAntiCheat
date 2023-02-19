import { world } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';
import { isIllegalItem, isSpawnEgg, queueNotify } from './util';

const despawnable = ['minecraft:npc', 'minecraft:command_block_minecart'];
const hasInventory = ['minecraft:hopper_minecart', 'minecraft:chest_minecart'];

export function entityCheck(entity) {
  const { typeId, location } = entity;

  if (config.entityCheckC.state) {
  
    if (typeId == 'minecraft:arrow') {
      world.arrowSpawnCount++
      if (world.arrowSpawnCount > config.entityCheckC.maxArrowSpawns) return entity.kill();
      
    } else if (typeId == 'minecraft:item') {
      world.itemSpawnCount++
      if (world.itemSpawnCount > config.entityCheckC.maxItemSpawns) return entity.kill();
      
    } else if (typeId == 'minecraft:command_block_minecart') {
      world.cmdSpawnCount++
      if (world.cmdSpawnCount > config.entityCheckC.maxCmdMinecartSpawns) return entity.kill();
    }
  }
  
  if (config.entityCheckA.state && config.entityCheckA.detect.includes(typeId)) {
    const loc = Util.vectorNicely(location);
    entity.kill();
    if (config.entityCheckA.punishment != 'none') queueNotify('entityCheck', { typeId, ...loc });
    if (despawnable.includes(typeId)) try { entity.triggerEvent('tn:despawn') } catch {}
    
  } else if (config.entityCheckB.state && typeId === 'minecraft:item') {
    const item = entity.getComponent('minecraft:item')?.itemStack;
    if (isIllegalItem(item?.typeId) || (config.entityCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      const loc = Util.vectorNicely(location);
      entity.kill();
      if (config.entityCheckB.punishment != 'none') queueNotify('entityCheck', { typeId, item: item.typeId, ...loc });
    }
    
  } else if (config.entityCheckD.state && config.entityCheckD.detect.includes(typeId)) {
    const container = entity.getComponent('minecraft:inventory')?.container;
    entityCheckD(container);
  }
}

function entityCheckD(container) {
  if (!container) return;

  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (
      isIllegalItem(item?.typeId) ||
      (config.entityCheckD.spawnEgg && isSpawnEgg(item?.typeId))
    ) {
      container.clearItem(i);
      if (config.others.debug) console.warn(`EntityCheck/D cleared: ${item.typeId}`);
    }
  }
}